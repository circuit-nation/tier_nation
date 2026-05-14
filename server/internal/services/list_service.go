package services

import (
	"errors"
	"time"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

var (
	ErrListNotFound = errors.New("list not found")
	ErrListArchived = errors.New("list is archived")
	ErrListLocked   = errors.New("list is locked")
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
