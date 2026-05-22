package services

import (
	"errors"
	"time"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SubmissionService struct {
	db *gorm.DB
}

func NewSubmissionService(db *gorm.DB) *SubmissionService {
	return &SubmissionService{db: db}
}

// CreateSubmission inserts a submission if none exists for this user and list; otherwise returns the existing row.
func (s *SubmissionService) CreateSubmission(userID, listID uuid.UUID, isAnonymous bool) (*models.Submission, bool, error) {
	var existing models.Submission
	err := s.db.Where("user_id = ? AND list_id = ?", userID, listID).First(&existing).Error
	if err == nil {
		return &existing, true, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, false, err
	}

	sub := &models.Submission{
		ListID:      listID,
		UserID:      userID,
		IsAnonymous: isAnonymous,
	}
	if err := s.db.Create(sub).Error; err != nil {
		return nil, false, err
	}
	return sub, false, nil
}

func (s *SubmissionService) VoteCountForUserList(userID, listID uuid.UUID) (int64, error) {
	var n int64
	err := s.db.Model(&models.Vote{}).
		Where("user_id = ? AND list_id = ?", userID, listID).
		Count(&n).Error
	return n, err
}

type MySubmissionItem struct {
	ListID           uuid.UUID
	ListName         string
	CoverImage       string
	SubmissionID     uuid.UUID
	SubmittedAt      time.Time
	IsAnonymous      bool
	VoteCount        int64
	UserAverageScore float64
}

func (s *SubmissionService) ListMySubmissions(userID uuid.UUID, images *ImageURLService) ([]MySubmissionItem, error) {
	type listVote struct {
		ListID uuid.UUID
		Cnt    int64
	}
	var rows []listVote
	if err := s.db.Model(&models.Vote{}).
		Select("list_id, COUNT(*) as cnt").
		Where("user_id = ?", userID).
		Group("list_id").
		Scan(&rows).Error; err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return []MySubmissionItem{}, nil
	}

	agg := NewAggregationService(s.db)
	out := make([]MySubmissionItem, 0, len(rows))

	for _, row := range rows {
		var list models.TierList
		if err := s.db.First(&list, "id = ?", row.ListID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				continue
			}
			return nil, err
		}

		var sub models.Submission
		if err := s.db.Where("user_id = ? AND list_id = ?", userID, row.ListID).First(&sub).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				continue
			}
			return nil, err
		}

		avg, err := agg.UserAverageScore(userID, row.ListID)
		if err != nil {
			return nil, err
		}

		cover := list.CoverImage
		if images != nil {
			cover = images.Resolve(cover)
		}

		out = append(out, MySubmissionItem{
			ListID:           row.ListID,
			ListName:         list.Name,
			CoverImage:       cover,
			SubmissionID:     sub.ID,
			SubmittedAt:      sub.UpdatedAt,
			IsAnonymous:      sub.IsAnonymous,
			VoteCount:        row.Cnt,
			UserAverageScore: avg,
		})
	}

	return out, nil
}
