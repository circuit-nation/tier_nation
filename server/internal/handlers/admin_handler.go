package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type AdminHandler struct {
	lists    *services.ListService
	entities *services.EntityService
}

func NewAdminHandler(lists *services.ListService, entities *services.EntityService) *AdminHandler {
	return &AdminHandler{lists: lists, entities: entities}
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

	ctx.JSON(http.StatusCreated, tierListJSON(list))
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
	listID, err := uuid.Parse(ctx.Param("id"))
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
	id, err := uuid.Parse(ctx.Param("id"))
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
