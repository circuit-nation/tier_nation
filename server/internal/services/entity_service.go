package services

import (
	"errors"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

var ErrEntityNotFound = errors.New("entity not found")

type EntityService struct {
	db *gorm.DB
}

func NewEntityService(db *gorm.DB) *EntityService {
	return &EntityService{db: db}
}

type EntityInput struct {
	Name        string
	Description string
	Team        string
	Tags        []string
	ImageURL    string
}

func (s *EntityService) CreateEntities(inputs []EntityInput) ([]models.Entity, error) {
	out := make([]models.Entity, 0, len(inputs))
	for _, in := range inputs {
		tags := in.Tags
		if tags == nil {
			tags = []string{}
		}
		e := models.Entity{
			Name:        in.Name,
			Description: in.Description,
			Team:        in.Team,
			Tags:        pq.StringArray(tags),
			ImageURL:    in.ImageURL,
		}
		if err := s.db.Create(&e).Error; err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, nil
}

// CreateAndAttachToList creates entities and associates them with the tier list in order.
func (s *EntityService) CreateAndAttachToList(listID uuid.UUID, inputs []EntityInput) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		order, err := nextListEntitySortOrder(tx, listID)
		if err != nil {
			return err
		}
		for _, in := range inputs {
			tags := in.Tags
			if tags == nil {
				tags = []string{}
			}
			e := models.Entity{
				Name:        in.Name,
				Description: in.Description,
				Team:        in.Team,
				Tags:        pq.StringArray(tags),
				ImageURL:    in.ImageURL,
			}
			if err := tx.Create(&e).Error; err != nil {
				return err
			}
			le := models.ListEntity{
				ListID:    listID,
				EntityID:  e.ID,
				SortOrder: order,
			}
			order++
			if err := tx.Create(&le).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// AttachExistingToList links existing entities to a tier list. Already-linked IDs are skipped.
func (s *EntityService) AttachExistingToList(listID uuid.UUID, entityIDs []uuid.UUID) (skipped []uuid.UUID, err error) {
	if len(entityIDs) == 0 {
		return nil, errors.New("entityIds must not be empty")
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		order, err := nextListEntitySortOrder(tx, listID)
		if err != nil {
			return err
		}
		for _, eid := range entityIDs {
			var e models.Entity
			if err := tx.First(&e, "id = ?", eid).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return ErrEntityNotFound
				}
				return err
			}

			var existing int64
			if err := tx.Model(&models.ListEntity{}).
				Where("list_id = ? AND entity_id = ?", listID, eid).
				Count(&existing).Error; err != nil {
				return err
			}
			if existing > 0 {
				skipped = append(skipped, eid)
				continue
			}

			le := models.ListEntity{
				ListID:    listID,
				EntityID:  eid,
				SortOrder: order,
			}
			order++
			if err := tx.Create(&le).Error; err != nil {
				return err
			}
		}
		return nil
	})
	return skipped, err
}

type EntityListResult struct {
	Entities []models.Entity
	Total    int64
}

// ListEntities returns entities for the admin catalog with optional name/team search.
func (s *EntityService) ListEntities(offset, limit int, search string) (EntityListResult, error) {
	q := s.db.Model(&models.Entity{})
	if search != "" {
		pattern := "%" + search + "%"
		q = q.Where("name ILIKE ? OR team ILIKE ?", pattern, pattern)
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return EntityListResult{}, err
	}

	var entities []models.Entity
	if err := q.Order("updated_at DESC").Offset(offset).Limit(limit).Find(&entities).Error; err != nil {
		return EntityListResult{}, err
	}

	return EntityListResult{Entities: entities, Total: total}, nil
}

func nextListEntitySortOrder(tx *gorm.DB, listID uuid.UUID) (int, error) {
	var le models.ListEntity
	err := tx.Where("list_id = ?", listID).Order("sort_order DESC").First(&le).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	return le.SortOrder + 1, nil
}

// UpdateEntityInput holds optional fields for PATCH /admin/entities/:id.
type UpdateEntityInput struct {
	Name        *string
	Description *string
	Team        *string
	Tags        *[]string
	ImageURL    *string
}

func (s *EntityService) GetByID(id uuid.UUID) (*models.Entity, error) {
	var e models.Entity
	if err := s.db.First(&e, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEntityNotFound
		}
		return nil, err
	}
	return &e, nil
}

func (s *EntityService) UpdateEntity(id uuid.UUID, in UpdateEntityInput) (*models.Entity, error) {
	if _, err := s.GetByID(id); err != nil {
		return nil, err
	}

	updates := map[string]interface{}{}
	if in.Name != nil {
		updates["name"] = *in.Name
	}
	if in.Description != nil {
		updates["description"] = *in.Description
	}
	if in.Team != nil {
		updates["team"] = *in.Team
	}
	if in.Tags != nil {
		tags := *in.Tags
		if tags == nil {
			tags = []string{}
		}
		updates["tags"] = pq.StringArray(tags)
	}
	if in.ImageURL != nil {
		updates["image_url"] = *in.ImageURL
	}

	if len(updates) == 0 {
		return s.GetByID(id)
	}

	res := s.db.Model(&models.Entity{}).Where("id = ?", id).Updates(updates)
	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, ErrEntityNotFound
	}
	return s.GetByID(id)
}

// DeleteEntity removes votes and list links for this entity, then the entity row.
func (s *EntityService) DeleteEntity(id uuid.UUID) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var e models.Entity
		if err := tx.First(&e, "id = ?", id).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrEntityNotFound
			}
			return err
		}
		if err := tx.Where("entity_id = ?", id).Delete(&models.Vote{}).Error; err != nil {
			return err
		}
		if err := tx.Where("entity_id = ?", id).Delete(&models.ListEntity{}).Error; err != nil {
			return err
		}
		return tx.Delete(&models.Entity{}, "id = ?", id).Error
	})
}
