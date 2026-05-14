package services

import (
	"errors"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

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
