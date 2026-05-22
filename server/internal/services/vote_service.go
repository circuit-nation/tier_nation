package services

import (
	"errors"
	"math"
	"time"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const MinSubmitVoteRatio = 0.6

var (
	ErrSubmissionRequired = errors.New("create a submission before submitting votes")
	ErrInsufficientVotes  = errors.New("not enough votes to submit")
	ErrNoVotesFound       = errors.New("no votes found for this list")
)

type VoteLineInput struct {
	EntityID       uuid.UUID
	TierValue      int
	PlacementOrder *int
}

type SubmitVotesResult struct {
	SubmissionID     uuid.UUID
	VoteCount        int
	UpdatedAt        time.Time
	UserAverageScore float64
}

type UserVotesResult struct {
	ListID           uuid.UUID
	SubmissionID     uuid.UUID
	IsAnonymous      bool
	SubmittedAt      time.Time
	VoteCount        int
	Votes            []VoteLineInput
	UserAverageScore float64
}

type VoteService struct {
	db    *gorm.DB
	lists *ListService
}

func NewVoteService(db *gorm.DB, lists *ListService) *VoteService {
	return &VoteService{db: db, lists: lists}
}

func (s *VoteService) SubmitVotes(userID, listID uuid.UUID, isAnonymous bool, lines []VoteLineInput) (*SubmitVotesResult, error) {
	list, err := s.lists.GetByID(listID)
	if err != nil {
		return nil, err
	}

	if err := s.lists.ValidateListOpenForVoting(list); err != nil {
		return nil, err
	}

	entityCount, err := s.lists.EntityCountForList(listID)
	if err != nil {
		return nil, err
	}
	if entityCount == 0 {
		return nil, errors.New("list has no entities")
	}

	minVotes := int(math.Ceil(float64(entityCount) * MinSubmitVoteRatio))
	if len(lines) < minVotes {
		return nil, ErrInsufficientVotes
	}

	cfg, err := ParseTiersConfigJSON(list.TiersConfig)
	if err != nil {
		return nil, err
	}

	for _, line := range lines {
		if !TierValueAllowed(cfg, line.TierValue) {
			return nil, errors.New("invalid tier value for this list")
		}
		ok, err := s.lists.EntityOnList(listID, line.EntityID)
		if err != nil {
			return nil, err
		}
		if !ok {
			return nil, errors.New("entity is not part of this list")
		}
	}

	var result SubmitVotesResult

	err = s.db.Transaction(func(tx *gorm.DB) error {
		var sub models.Submission
		err := tx.Where("user_id = ? AND list_id = ?", userID, listID).First(&sub).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			sub = models.Submission{
				ListID:      listID,
				UserID:      userID,
				IsAnonymous: isAnonymous,
			}
			if err := tx.Create(&sub).Error; err != nil {
				return err
			}
		} else if err != nil {
			return err
		} else {
			sub.IsAnonymous = isAnonymous
			if err := tx.Save(&sub).Error; err != nil {
				return err
			}
		}

		if err := tx.Where("user_id = ? AND list_id = ?", userID, listID).Delete(&models.Vote{}).Error; err != nil {
			return err
		}

		for _, line := range lines {
			v := models.Vote{
				ListID:         listID,
				UserID:         userID,
				EntityID:       line.EntityID,
				SubmissionID:   &sub.ID,
				IsAnonymous:    isAnonymous,
				TierValue:      line.TierValue,
				PlacementOrder: line.PlacementOrder,
			}
			if err := tx.Create(&v).Error; err != nil {
				return err
			}
		}

		var avg float64
		if err := tx.Model(&models.Vote{}).
			Where("user_id = ? AND list_id = ?", userID, listID).
			Select("COALESCE(AVG(tier_value), 0)").
			Scan(&avg).Error; err != nil {
			return err
		}

		result = SubmitVotesResult{
			SubmissionID:     sub.ID,
			VoteCount:        len(lines),
			UpdatedAt:        sub.UpdatedAt,
			UserAverageScore: avg,
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *VoteService) GetUserVotes(userID, listID uuid.UUID) (*UserVotesResult, error) {
	var voteCount int64
	if err := s.db.Model(&models.Vote{}).
		Where("user_id = ? AND list_id = ?", userID, listID).
		Count(&voteCount).Error; err != nil {
		return nil, err
	}
	if voteCount == 0 {
		return nil, ErrNoVotesFound
	}

	var sub models.Submission
	if err := s.db.Where("user_id = ? AND list_id = ?", userID, listID).First(&sub).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNoVotesFound
		}
		return nil, err
	}

	var votes []models.Vote
	if err := s.db.Where("user_id = ? AND list_id = ?", userID, listID).
		Order("tier_value ASC, placement_order ASC").
		Find(&votes).Error; err != nil {
		return nil, err
	}

	lines := make([]VoteLineInput, 0, len(votes))
	for _, v := range votes {
		lines = append(lines, VoteLineInput{
			EntityID:       v.EntityID,
			TierValue:      v.TierValue,
			PlacementOrder: v.PlacementOrder,
		})
	}

	agg := NewAggregationService(s.db)
	avg, err := agg.UserAverageScore(userID, listID)
	if err != nil {
		return nil, err
	}

	return &UserVotesResult{
		ListID:           listID,
		SubmissionID:     sub.ID,
		IsAnonymous:      sub.IsAnonymous,
		SubmittedAt:      sub.UpdatedAt,
		VoteCount:        len(lines),
		Votes:            lines,
		UserAverageScore: avg,
	}, nil
}
