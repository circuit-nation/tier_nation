package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Submission struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	ListID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:uniq_submission_user_list" json:"listId"`
	UserID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:uniq_submission_user_list" json:"userId"`
	IsAnonymous bool      `gorm:"column:is_anonymous;default:false" json:"isAnonymous"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (s *Submission) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
