package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type TierList struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name         string         `gorm:"not null" json:"name"`
	Description  string         `json:"description"`
	CoverImage   string         `gorm:"column:cover_image" json:"coverImage"`
	TiersConfig  datatypes.JSON `gorm:"column:tiers_config;type:jsonb" json:"tiersConfig"`
	IsLocked     bool           `gorm:"column:is_locked;default:false" json:"isLocked"`
	IsVisible    bool           `gorm:"column:is_visible;default:true" json:"isVisible"`
	StartTime    *time.Time     `json:"startTime,omitempty"`
	EndTime      *time.Time     `json:"endTime,omitempty"`
	CreatedBy    *uuid.UUID     `gorm:"type:uuid;column:created_by" json:"createdBy,omitempty"`
	ArchivedAt   *time.Time     `gorm:"column:archived_at" json:"archivedAt,omitempty"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
}

func (t *TierList) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}
