package services

import (
	"errors"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var ErrSubmissionRequired = errors.New("create a submission before submitting votes")

type VoteLineInput struct {
	EntityID       uuid.UUID
	TierValue      int
	PlacementOrder *int
}

type VoteService struct {
	db    *gorm.DB
	lists *ListService
}

func NewVoteService(db *gorm.DB, lists *ListService) *VoteService {
	return &VoteService{db: db, lists: lists}
}

func (s *VoteService) SubmitVotes(userID, listID uuid.UUID, isAnonymous bool, lines []VoteLineInput) error {
	list, err := s.lists.GetByID(listID)
	if err != nil {
		return err
	}

	if err := s.lists.ValidateListOpenForVoting(list); err != nil {
		return err
	}

	cfg, err := ParseTiersConfigJSON(list.TiersConfig)
	if err != nil {
		return err
	}

	var sub models.Submission
	if err := s.db.Where("user_id = ? AND list_id = ?", userID, listID).First(&sub).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrSubmissionRequired
		}
		return err
	}

	for _, line := range lines {
		if !TierValueAllowed(cfg, line.TierValue) {
			return errors.New("invalid tier value for this list")
		}
		ok, err := s.lists.EntityOnList(listID, line.EntityID)
		if err != nil {
			return err
		}
		if !ok {
			return errors.New("entity is not part of this list")
		}
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
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
		return nil
	})
}
