package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ListHandler struct {
	lists *services.ListService
	agg   *services.AggregationService
}

func NewListHandler(lists *services.ListService, agg *services.AggregationService) *ListHandler {
	return &ListHandler{lists: lists, agg: agg}
}

func (h *ListHandler) GetLists(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	lists, _, err := h.lists.ListPublic(page, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	out := make([]gin.H, 0, len(lists))
	for i := range lists {
		out = append(out, tierListJSON(&lists[i]))
	}

	ctx.JSON(http.StatusOK, gin.H{"lists": out})
}

func (h *ListHandler) GetList(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	list, err := h.lists.GetByIDPublic(id)
	if errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	}
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	entities, err := h.lists.EntitiesForList(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	payload := tierListJSON(list)
	payload["entities"] = entitySummariesJSON(entities)
	ctx.JSON(http.StatusOK, payload)
}

func (h *ListHandler) GetAverageScore(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	if _, err := h.lists.GetByID(id); errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	avg, err := h.agg.ListAverageScore(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"listId":         id.String(),
		"averageScore":   avg,
	})
}

func (h *ListHandler) GetEntityAverages(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	if _, err := h.lists.GetByID(id); errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rows, err := h.agg.EntityAverages(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"entityAverages": rows})
}

func tierListJSON(t *models.TierList) gin.H {
	var tiersCfg any
	if len(t.TiersConfig) > 0 {
		_ = json.Unmarshal(t.TiersConfig, &tiersCfg)
	}
	var createdBy any
	if t.CreatedBy != nil {
		createdBy = t.CreatedBy.String()
	}
	h := gin.H{
		"id":           t.ID.String(),
		"name":         t.Name,
		"description":  t.Description,
		"coverImage":   t.CoverImage,
		"tiersConfig":  tiersCfg,
		"isLocked":     t.IsLocked,
		"isVisible":    t.IsVisible,
		"startTime":    t.StartTime,
		"endTime":      t.EndTime,
		"createdBy":    createdBy,
		"createdAt":    t.CreatedAt,
		"updatedAt":    t.UpdatedAt,
	}
	return h
}

func entitySummariesJSON(entities []models.Entity) []gin.H {
	out := make([]gin.H, 0, len(entities))
	for _, e := range entities {
		item := gin.H{
			"id":       e.ID.String(),
			"name":     e.Name,
			"team":     e.Team,
			"tags":     []string(e.Tags),
			"imageUrl": e.ImageURL,
		}
		out = append(out, item)
	}
	return out
}
