package models

import (
	"github.com/google/uuid"
)

// ListEntity links a tier list to entities shown on that list (many-to-many).
type ListEntity struct {
	ListID    uuid.UUID `gorm:"type:uuid;primaryKey;column:list_id" json:"listId"`
	EntityID  uuid.UUID `gorm:"type:uuid;primaryKey;column:entity_id" json:"entityId"`
	SortOrder int       `gorm:"column:sort_order;default:0" json:"sortOrder"`
}
