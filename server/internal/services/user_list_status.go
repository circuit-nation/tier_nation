package services

import (
	"time"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserListStatus struct {
	HasSubmitted            bool
	SubmissionID            *uuid.UUID
	SubmittedAt             *time.Time
	IsAnonymous             bool
	VoteCount               int64
	UserAverageScore        *float64
	CanViewCommunityResults bool
}

type UserListStatusService struct {
	db *gorm.DB
}

func NewUserListStatusService(db *gorm.DB) *UserListStatusService {
	return &UserListStatusService{db: db}
}

func (s *UserListStatusService) GetStatus(userID, listID uuid.UUID, authenticated bool) (UserListStatus, error) {
	status := UserListStatus{}
	if !authenticated {
		return status, nil
	}

	var voteCount int64
	if err := s.db.Model(&models.Vote{}).
		Where("user_id = ? AND list_id = ?", userID, listID).
		Count(&voteCount).Error; err != nil {
		return status, err
	}

	status.VoteCount = voteCount
	status.HasSubmitted = voteCount > 0
	status.CanViewCommunityResults = status.HasSubmitted

	if !status.HasSubmitted {
		return status, nil
	}

	var sub models.Submission
	err := s.db.Where("user_id = ? AND list_id = ?", userID, listID).First(&sub).Error
	if err == nil {
		status.SubmissionID = &sub.ID
		status.SubmittedAt = &sub.UpdatedAt
		status.IsAnonymous = sub.IsAnonymous
	} else if err != gorm.ErrRecordNotFound {
		return status, err
	}

	var avg float64
	if err := s.db.Model(&models.Vote{}).
		Where("user_id = ? AND list_id = ?", userID, listID).
		Select("COALESCE(AVG(tier_value), 0)").
		Scan(&avg).Error; err != nil {
		return status, err
	}
	status.UserAverageScore = &avg

	return status, nil
}

func (s *UserListStatusService) SubmissionsCount(userID uuid.UUID) (int64, error) {
	var count int64
	err := s.db.Raw(
		"SELECT COUNT(DISTINCT list_id) FROM votes WHERE user_id = ?",
		userID,
	).Scan(&count).Error
	return count, err
}
