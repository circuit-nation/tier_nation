package services

import (
	"math"
	"sort"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AggregationService struct {
	db *gorm.DB
}

func NewAggregationService(db *gorm.DB) *AggregationService {
	return &AggregationService{db: db}
}

type ListStats struct {
	ListID            uuid.UUID `json:"listId"`
	EntityCount       int64     `json:"entityCount"`
	UniqueVoters      int64     `json:"uniqueVoters"`
	TotalSubmissions  int64     `json:"totalSubmissions"`
	TotalVoteLines    int64     `json:"totalVoteLines"`
}

func (s *AggregationService) ListStats(listID uuid.UUID, entityCount int64) (ListStats, error) {
	stats := ListStats{ListID: listID, EntityCount: entityCount}

	if err := s.db.Model(&models.Vote{}).Where("list_id = ?", listID).
		Distinct("user_id").Count(&stats.UniqueVoters).Error; err != nil {
		return stats, err
	}
	if err := s.db.Model(&models.Submission{}).Where("list_id = ?", listID).
		Count(&stats.TotalSubmissions).Error; err != nil {
		return stats, err
	}
	if err := s.db.Model(&models.Vote{}).Where("list_id = ?", listID).
		Count(&stats.TotalVoteLines).Error; err != nil {
		return stats, err
	}

	return stats, nil
}

// ListAverageScore returns the mean of tier_value for all votes on the list (0 if none).
func (s *AggregationService) ListAverageScore(listID uuid.UUID) (float64, error) {
	var row struct {
		Avg float64 `gorm:"column:avg"`
	}
	err := s.db.Model(&models.Vote{}).
		Where("list_id = ?", listID).
		Select("COALESCE(AVG(tier_value), 0) AS avg").
		Scan(&row).Error
	if err != nil {
		return 0, err
	}
	return row.Avg, nil
}

func (s *AggregationService) UserAverageScore(userID, listID uuid.UUID) (float64, error) {
	var row struct {
		Avg float64 `gorm:"column:avg"`
	}
	err := s.db.Model(&models.Vote{}).
		Where("user_id = ? AND list_id = ?", userID, listID).
		Select("COALESCE(AVG(tier_value), 0) AS avg").
		Scan(&row).Error
	if err != nil {
		return 0, err
	}
	return row.Avg, nil
}

func (s *AggregationService) UniqueVoters(listID uuid.UUID) (int64, error) {
	var n int64
	err := s.db.Model(&models.Vote{}).Where("list_id = ?", listID).
		Distinct("user_id").Count(&n).Error
	return n, err
}

type EntityAverageRow struct {
	EntityID         uuid.UUID `json:"entityId"`
	AverageTierValue float64   `json:"averageTierValue"`
	VoteCount        int64     `json:"voteCount"`
	EntityName       string    `json:"entityName"`
	Team             string    `json:"team"`
	ImageURL         string    `json:"imageUrl"`
	AverageTierLabel string    `json:"averageTierLabel"`
	Rank             int       `json:"rank"`
}

// EntityAverages returns per-entity mean tier values for the list with display metadata.
func (s *AggregationService) EntityAverages(listID uuid.UUID, tiersCfg *TiersConfigPayload, resolveImage func(string) string) ([]EntityAverageRow, error) {
	type row struct {
		EntityID uuid.UUID `gorm:"column:entity_id"`
		Avg      float64   `gorm:"column:avg"`
		Cnt      int64     `gorm:"column:cnt"`
	}
	var rows []row
	err := s.db.Model(&models.Vote{}).
		Select("entity_id, AVG(tier_value) AS avg, COUNT(*) AS cnt").
		Where("list_id = ?", listID).
		Group("entity_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	entityIDs := make([]uuid.UUID, len(rows))
	for i, r := range rows {
		entityIDs[i] = r.EntityID
	}

	entityByID := map[uuid.UUID]models.Entity{}
	if len(entityIDs) > 0 {
		var entities []models.Entity
		if err := s.db.Where("id IN ?", entityIDs).Find(&entities).Error; err != nil {
			return nil, err
		}
		for _, e := range entities {
			entityByID[e.ID] = e
		}
	}

	out := make([]EntityAverageRow, 0, len(rows))
	for _, r := range rows {
		e := entityByID[r.EntityID]
		img := e.ImageURL
		if resolveImage != nil {
			img = resolveImage(img)
		}
		out = append(out, EntityAverageRow{
			EntityID:         r.EntityID,
			AverageTierValue: r.Avg,
			VoteCount:        r.Cnt,
			EntityName:       e.Name,
			Team:             e.Team,
			ImageURL:         img,
			AverageTierLabel: tierLabelForAverage(r.Avg, tiersCfg),
		})
	}

	sort.Slice(out, func(i, j int) bool {
		if out[i].AverageTierValue != out[j].AverageTierValue {
			return out[i].AverageTierValue < out[j].AverageTierValue
		}
		return out[i].VoteCount > out[j].VoteCount
	})
	for i := range out {
		out[i].Rank = i + 1
	}

	return out, nil
}

func tierLabelForAverage(avg float64, cfg *TiersConfigPayload) string {
	if cfg == nil || len(cfg.Tiers) == 0 {
		return ""
	}
	best := cfg.Tiers[0]
	bestDist := math.Abs(avg - float64(best.Value))
	for _, t := range cfg.Tiers[1:] {
		d := math.Abs(avg - float64(t.Value))
		if d < bestDist {
			best = t
			bestDist = d
		}
	}
	return best.Label
}
