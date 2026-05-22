package services

import (
	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
)

type ListEntityRow struct {
	Entity    models.Entity
	SortOrder int
}

func (s *ListService) ListEntitiesDetailed(listID uuid.UUID) ([]ListEntityRow, error) {
	var links []models.ListEntity
	if err := s.db.Where("list_id = ?", listID).Order("sort_order ASC").Find(&links).Error; err != nil {
		return nil, err
	}
	if len(links) == 0 {
		return []ListEntityRow{}, nil
	}

	ids := make([]uuid.UUID, len(links))
	for i, le := range links {
		ids[i] = le.EntityID
	}

	var entities []models.Entity
	if err := s.db.Where("id IN ?", ids).Find(&entities).Error; err != nil {
		return nil, err
	}

	byID := make(map[uuid.UUID]models.Entity, len(entities))
	for _, e := range entities {
		byID[e.ID] = e
	}

	out := make([]ListEntityRow, 0, len(links))
	for _, le := range links {
		if e, ok := byID[le.EntityID]; ok {
			out = append(out, ListEntityRow{Entity: e, SortOrder: le.SortOrder})
		}
	}
	return out, nil
}

func (s *ListService) EntityCountForList(listID uuid.UUID) (int64, error) {
	var n int64
	err := s.db.Model(&models.ListEntity{}).Where("list_id = ?", listID).Count(&n).Error
	return n, err
}
