package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

var (
	ErrListNotFound       = errors.New("list not found")
	ErrListArchived       = errors.New("list is archived")
	ErrListLocked         = errors.New("list is locked")
	ErrListEntityNotFound = errors.New("entity is not linked to this list")
)

type ListService struct {
	db *gorm.DB
}

func NewListService(db *gorm.DB) *ListService {
	return &ListService{db: db}
}

type CreateTierListInput struct {
	Name        string
	Description string
	CoverImage  string
	TiersConfig datatypes.JSON
	IsLocked    bool
	IsVisible   bool
	StartTime   *time.Time
	EndTime     *time.Time
}

func (s *ListService) CreateTierList(input CreateTierListInput) (*models.TierList, error) {
	if _, err := ParseTiersConfigJSON(input.TiersConfig); err != nil {
		return nil, err
	}

	list := &models.TierList{
		Name:        input.Name,
		Description: input.Description,
		CoverImage:  input.CoverImage,
		TiersConfig: input.TiersConfig,
		IsLocked:    input.IsLocked,
		IsVisible:   input.IsVisible,
		StartTime:   input.StartTime,
		EndTime:     input.EndTime,
		CreatedBy:   nil,
	}

	if err := s.db.Create(list).Error; err != nil {
		return nil, err
	}

	return list, nil
}

// ListPublic returns visible, non-archived tier lists with pagination.
func (s *ListService) ListPublic(page, limit int) ([]models.TierList, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit

	q := s.db.Model(&models.TierList{}).
		Where("archived_at IS NULL").
		Where("is_visible = ?", true)

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var lists []models.TierList
	if err := q.Order("created_at DESC").Offset(offset).Limit(limit).Find(&lists).Error; err != nil {
		return nil, 0, err
	}

	return lists, total, nil
}

func (s *ListService) GetByID(id uuid.UUID) (*models.TierList, error) {
	var list models.TierList
	if err := s.db.First(&list, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrListNotFound
		}
		return nil, err
	}
	return &list, nil
}

// GetByIDPublic returns a list only if it is visible and not archived (for anonymous browsing).
func (s *ListService) GetByIDPublic(id uuid.UUID) (*models.TierList, error) {
	list, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}
	if list.ArchivedAt != nil {
		return nil, ErrListNotFound
	}
	if !list.IsVisible {
		return nil, ErrListNotFound
	}
	return list, nil
}

func (s *ListService) EntitiesForList(listID uuid.UUID) ([]models.Entity, error) {
	var links []models.ListEntity
	if err := s.db.Where("list_id = ?", listID).Order("sort_order ASC").Find(&links).Error; err != nil {
		return nil, err
	}
	if len(links) == 0 {
		return []models.Entity{}, nil
	}

	ids := make([]uuid.UUID, len(links))
	for i, le := range links {
		ids[i] = le.EntityID
	}

	var entities []models.Entity
	if err := s.db.Where("id IN ?", ids).Find(&entities).Error; err != nil {
		return nil, err
	}

	byID := make(map[uuid.UUID]models.Entity)
	for _, e := range entities {
		byID[e.ID] = e
	}

	out := make([]models.Entity, 0, len(links))
	for _, le := range links {
		if e, ok := byID[le.EntityID]; ok {
			out = append(out, e)
		}
	}
	return out, nil
}

func (s *ListService) ArchiveList(id uuid.UUID) error {
	now := time.Now()
	res := s.db.Model(&models.TierList{}).Where("id = ?", id).Update("archived_at", now)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrListNotFound
	}
	return nil
}

// UpdateTierListInput holds optional fields for PATCH /admin/lists/:listId.
type UpdateTierListInput struct {
	Name        *string
	Description *string
	CoverImage  *string
	TiersConfig *datatypes.JSON
	IsLocked    *bool
	IsVisible   *bool
	StartTime   *time.Time
	EndTime     *time.Time
}

func (s *ListService) UpdateTierList(id uuid.UUID, patch UpdateTierListInput) (*models.TierList, error) {
	if _, err := s.GetByID(id); err != nil {
		return nil, err
	}

	updates := map[string]interface{}{}
	if patch.Name != nil {
		updates["name"] = *patch.Name
	}
	if patch.Description != nil {
		updates["description"] = *patch.Description
	}
	if patch.CoverImage != nil {
		updates["cover_image"] = *patch.CoverImage
	}
	if patch.TiersConfig != nil {
		if _, err := ParseTiersConfigJSON(*patch.TiersConfig); err != nil {
			return nil, err
		}
		updates["tiers_config"] = *patch.TiersConfig
	}
	if patch.IsLocked != nil {
		updates["is_locked"] = *patch.IsLocked
	}
	if patch.IsVisible != nil {
		updates["is_visible"] = *patch.IsVisible
	}
	if patch.StartTime != nil {
		updates["start_time"] = *patch.StartTime
	}
	if patch.EndTime != nil {
		updates["end_time"] = *patch.EndTime
	}

	if len(updates) == 0 {
		return s.GetByID(id)
	}

	res := s.db.Model(&models.TierList{}).Where("id = ?", id).Updates(updates)
	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, ErrListNotFound
	}
	return s.GetByID(id)
}

// DeleteTierList permanently removes a list, its list–entity links, votes, and submissions.
// Entities that are no longer referenced by any list are deleted.
func (s *ListService) DeleteTierList(id uuid.UUID) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var list models.TierList
		if err := tx.First(&list, "id = ?", id).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrListNotFound
			}
			return err
		}

		var entityIDs []uuid.UUID
		if err := tx.Model(&models.ListEntity{}).Where("list_id = ?", id).Pluck("entity_id", &entityIDs).Error; err != nil {
			return err
		}

		if err := tx.Where("list_id = ?", id).Delete(&models.Vote{}).Error; err != nil {
			return err
		}
		if err := tx.Where("list_id = ?", id).Delete(&models.Submission{}).Error; err != nil {
			return err
		}
		if err := tx.Where("list_id = ?", id).Delete(&models.ListEntity{}).Error; err != nil {
			return err
		}

		for _, eid := range entityIDs {
			var n int64
			if err := tx.Model(&models.ListEntity{}).Where("entity_id = ?", eid).Count(&n).Error; err != nil {
				return err
			}
			if n == 0 {
				if err := tx.Delete(&models.Entity{}, "id = ?", eid).Error; err != nil {
					return err
				}
			}
		}

		if err := tx.Delete(&models.TierList{}, "id = ?", id).Error; err != nil {
			return err
		}
		return nil
	})
}

// RemoveEntityFromList deletes list–entity association and votes for that pair on the list.
func (s *ListService) RemoveEntityFromList(listID, entityID uuid.UUID) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&models.TierList{}, "id = ?", listID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrListNotFound
			}
			return err
		}

		res := tx.Where("list_id = ? AND entity_id = ?", listID, entityID).Delete(&models.ListEntity{})
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return ErrListEntityNotFound
		}

		if err := tx.Where("list_id = ? AND entity_id = ?", listID, entityID).Delete(&models.Vote{}).Error; err != nil {
			return err
		}
		return nil
	})
}

// ListEntityOrderItem is one row in a reorder request.
type ListEntityOrderItem struct {
	EntityID  uuid.UUID
	SortOrder int
}

// ReorderListEntities replaces sort_order for every entity on the list.
func (s *ListService) ReorderListEntities(listID uuid.UUID, order []ListEntityOrderItem) error {
	if len(order) == 0 {
		return errors.New("order must not be empty")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&models.TierList{}, "id = ?", listID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrListNotFound
			}
			return err
		}

		var links []models.ListEntity
		if err := tx.Where("list_id = ?", listID).Find(&links).Error; err != nil {
			return err
		}
		if len(links) == 0 {
			return errors.New("list has no entities")
		}

		expected := make(map[uuid.UUID]struct{}, len(links))
		for _, le := range links {
			expected[le.EntityID] = struct{}{}
		}

		if len(order) != len(expected) {
			return fmt.Errorf("order must include exactly %d entities", len(expected))
		}

		seenOrders := make(map[int]struct{}, len(order))
		seenEntities := make(map[uuid.UUID]struct{}, len(order))
		for _, item := range order {
			if item.SortOrder < 0 {
				return errors.New("sortOrder must be non-negative")
			}
			if _, ok := expected[item.EntityID]; !ok {
				return fmt.Errorf("entity %s is not on this list", item.EntityID)
			}
			if _, dup := seenEntities[item.EntityID]; dup {
				return errors.New("duplicate entityId in order")
			}
			seenEntities[item.EntityID] = struct{}{}
			if _, dup := seenOrders[item.SortOrder]; dup {
				return errors.New("duplicate sortOrder")
			}
			seenOrders[item.SortOrder] = struct{}{}
		}

		for _, item := range order {
			res := tx.Model(&models.ListEntity{}).
				Where("list_id = ? AND entity_id = ?", listID, item.EntityID).
				Update("sort_order", item.SortOrder)
			if res.Error != nil {
				return res.Error
			}
		}
		return nil
	})
}

func (s *ListService) ValidateListOpenForVoting(list *models.TierList) error {
	if list.ArchivedAt != nil {
		return ErrListArchived
	}
	if list.IsLocked {
		return ErrListLocked
	}
	now := time.Now()
	if list.StartTime != nil && now.Before(*list.StartTime) {
		return errors.New("voting has not started")
	}
	if list.EndTime != nil && now.After(*list.EndTime) {
		return errors.New("voting has ended")
	}
	return nil
}

func (s *ListService) EntityOnList(listID, entityID uuid.UUID) (bool, error) {
	var n int64
	err := s.db.Model(&models.ListEntity{}).
		Where("list_id = ? AND entity_id = ?", listID, entityID).
		Count(&n).Error
	return n > 0, err
}
