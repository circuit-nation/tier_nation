package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type AdminHandler struct {
	lists    *services.ListService
	entities *services.EntityService
	images   *services.ImageURLService
}

func NewAdminHandler(lists *services.ListService, entities *services.EntityService, images *services.ImageURLService) *AdminHandler {
	return &AdminHandler{lists: lists, entities: entities, images: images}
}

func (h *AdminHandler) CreateTierList(ctx *gin.Context) {
	var body struct {
		Name        string          `json:"name" binding:"required"`
		Description string          `json:"description"`
		CoverImage  string          `json:"coverImage"`
		TiersConfig json.RawMessage `json:"tiersConfig" binding:"required"`
		IsLocked    bool            `json:"isLocked"`
		IsVisible   bool            `json:"isVisible"`
		StartTime   *time.Time      `json:"startTime"`
		EndTime     *time.Time      `json:"endTime"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	list, err := h.lists.CreateTierList(services.CreateTierListInput{
		Name:        body.Name,
		Description: body.Description,
		CoverImage:  body.CoverImage,
		TiersConfig: datatypes.JSON(body.TiersConfig),
		IsLocked:    body.IsLocked,
		IsVisible:   body.IsVisible,
		StartTime:   body.StartTime,
		EndTime:     body.EndTime,
	})
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, tierListJSON(list, h.images))
}

func (h *AdminHandler) CreateEntities(ctx *gin.Context) {
	var body struct {
		Entities []struct {
			Name        string   `json:"name" binding:"required"`
			Team        string   `json:"team"`
			Tags        []string `json:"tags"`
			ImageURL    string   `json:"imageUrl"`
			Description string   `json:"description"`
		} `json:"entities" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	inputs := make([]services.EntityInput, 0, len(body.Entities))
	for _, e := range body.Entities {
		inputs = append(inputs, services.EntityInput{
			Name:        e.Name,
			Description: e.Description,
			Team:        e.Team,
			Tags:        e.Tags,
			ImageURL:    e.ImageURL,
		})
	}

	if _, err := h.entities.CreateEntities(inputs); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "entities created"})
}

func (h *AdminHandler) AddEntitiesToList(ctx *gin.Context) {
	listID, err := uuid.Parse(ctx.Param("listId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	if _, err := h.lists.GetByID(listID); errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var body struct {
		Entities []struct {
			Name        string   `json:"name" binding:"required"`
			Team        string   `json:"team"`
			Tags        []string `json:"tags"`
			ImageURL    string   `json:"imageUrl"`
			Description string   `json:"description"`
		} `json:"entities" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	inputs := make([]services.EntityInput, 0, len(body.Entities))
	for _, e := range body.Entities {
		inputs = append(inputs, services.EntityInput{
			Name:        e.Name,
			Description: e.Description,
			Team:        e.Team,
			Tags:        e.Tags,
			ImageURL:    e.ImageURL,
		})
	}

	if err := h.entities.CreateAndAttachToList(listID, inputs); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "entities added to list"})
}

func (h *AdminHandler) ArchiveList(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("listId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	if err := h.lists.ArchiveList(id); errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "list archived"})
}

func (h *AdminHandler) UpdateTierList(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("listId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	var body struct {
		Name        *string          `json:"name"`
		Description *string          `json:"description"`
		CoverImage  *string          `json:"coverImage"`
		TiersConfig *json.RawMessage `json:"tiersConfig"`
		IsLocked    *bool            `json:"isLocked"`
		IsVisible   *bool            `json:"isVisible"`
		StartTime   *time.Time       `json:"startTime"`
		EndTime     *time.Time       `json:"endTime"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	in := services.UpdateTierListInput{
		Name:        body.Name,
		Description: body.Description,
		CoverImage:  body.CoverImage,
		IsLocked:    body.IsLocked,
		IsVisible:   body.IsVisible,
		StartTime:   body.StartTime,
		EndTime:     body.EndTime,
	}
	if body.TiersConfig != nil {
		tc := datatypes.JSON(*body.TiersConfig)
		in.TiersConfig = &tc
	}

	list, err := h.lists.UpdateTierList(id, in)
	if errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	}
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, tierListJSON(list, h.images))
}

func (h *AdminHandler) DeleteTierList(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("listId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	if err := h.lists.DeleteTierList(id); errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Status(http.StatusNoContent)
}

func (h *AdminHandler) UpdateEntity(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid entity id"})
		return
	}

	var body struct {
		Name        *string   `json:"name"`
		Description *string   `json:"description"`
		Team        *string   `json:"team"`
		Tags        *[]string `json:"tags"`
		ImageURL    *string   `json:"imageUrl"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ent, err := h.entities.UpdateEntity(id, services.UpdateEntityInput{
		Name:        body.Name,
		Description: body.Description,
		Team:        body.Team,
		Tags:        body.Tags,
		ImageURL:    body.ImageURL,
	})
	if errors.Is(err, services.ErrEntityNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "entity not found"})
		return
	}
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, entityAdminJSON(ent, h.images))
}

func (h *AdminHandler) DeleteEntity(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid entity id"})
		return
	}

	if err := h.entities.DeleteEntity(id); errors.Is(err, services.ErrEntityNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "entity not found"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Status(http.StatusNoContent)
}

func (h *AdminHandler) RemoveEntityFromList(ctx *gin.Context) {
	listID, err := uuid.Parse(ctx.Param("listId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}
	entityID, err := uuid.Parse(ctx.Param("entityId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid entity id"})
		return
	}

	if err := h.lists.RemoveEntityFromList(listID, entityID); errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	} else if errors.Is(err, services.ErrListEntityNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "entity not on this list"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Status(http.StatusNoContent)
}

func (h *AdminHandler) ReorderListEntities(ctx *gin.Context) {
	listID, err := uuid.Parse(ctx.Param("listId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	var body struct {
		Order []struct {
			EntityID  string `json:"entityId" binding:"required"`
			SortOrder int    `json:"sortOrder"`
		} `json:"order" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order := make([]services.ListEntityOrderItem, 0, len(body.Order))
	for _, row := range body.Order {
		eid, err := uuid.Parse(row.EntityID)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid entity id in order"})
			return
		}
		order = append(order, services.ListEntityOrderItem{EntityID: eid, SortOrder: row.SortOrder})
	}

	if err := h.lists.ReorderListEntities(listID, order); errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "entity order updated"})
}

func entityAdminJSON(e *models.Entity, images *services.ImageURLService) gin.H {
	return gin.H{
		"id":          e.ID.String(),
		"name":        e.Name,
		"description": e.Description,
		"team":        e.Team,
		"tags":        []string(e.Tags),
		"imageUrl":    images.Resolve(e.ImageURL),
		"createdAt":   e.CreatedAt,
		"updatedAt":   e.UpdatedAt,
	}
}
