package services

import (
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

type EntityAverageRow struct {
	EntityID          uuid.UUID `json:"entityId"`
	AverageTierValue  float64   `json:"averageTierValue"`
	VoteCount         int64     `json:"voteCount"`
}

// EntityAverages returns per-entity mean tier values for the list.
func (s *AggregationService) EntityAverages(listID uuid.UUID) ([]EntityAverageRow, error) {
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

	out := make([]EntityAverageRow, 0, len(rows))
	for _, r := range rows {
		out = append(out, EntityAverageRow{
			EntityID:         r.EntityID,
			AverageTierValue: r.Avg,
			VoteCount:        r.Cnt,
		})
	}
	return out, nil
}
