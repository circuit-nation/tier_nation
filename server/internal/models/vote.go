package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Vote struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	ListID         uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex:uniq_vote_user_list_entity" json:"listId"`
	UserID         uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex:uniq_vote_user_list_entity" json:"userId"`
	EntityID       uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex:uniq_vote_user_list_entity" json:"entityId"`
	SubmissionID   *uuid.UUID `gorm:"type:uuid;column:submission_id" json:"submissionId,omitempty"`
	IsAnonymous    bool       `gorm:"column:is_anonymous;default:false" json:"isAnonymous"`
	TierValue      int        `gorm:"column:tier_value;not null" json:"tierValue"`
	PlacementOrder *int       `gorm:"column:placement_order" json:"placementOrder,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

func (v *Vote) BeforeCreate(tx *gorm.DB) error {
	if v.ID == uuid.Nil {
		v.ID = uuid.New()
	}
	return nil
}
