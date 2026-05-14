package services

import (
	"errors"

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
