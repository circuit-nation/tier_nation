package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/circuit-nation/tier_nation/server/internal/middleware"
	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ListHandler struct {
	lists      *services.ListService
	agg        *services.AggregationService
	images     *services.ImageURLService
	userStatus *services.UserListStatusService
}

func NewListHandler(
	lists *services.ListService,
	agg *services.AggregationService,
	images *services.ImageURLService,
	userStatus *services.UserListStatusService,
) *ListHandler {
	return &ListHandler{lists: lists, agg: agg, images: images, userStatus: userStatus}
}

func (h *ListHandler) GetLists(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	lists, total, err := h.lists.ListPublic(page, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	userID, authenticated := middleware.OptionalUserID(ctx)

	out := make([]gin.H, 0, len(lists))
	for i := range lists {
		entityCount, _ := h.lists.EntityCountForList(lists[i].ID)
		meta := services.DeriveListMeta(&lists[i])
		item := tierListJSON(&lists[i], h.images, meta, entityCount)
		if authenticated {
			status, err := h.userStatus.GetStatus(userID, lists[i].ID, true)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			item["userStatus"] = userStatusJSON(status, true)
		}
		out = append(out, item)
	}

	hasMore := int64(page*limit) < total
	ctx.JSON(http.StatusOK, gin.H{
		"lists":   out,
		"page":    page,
		"limit":   limit,
		"total":   total,
		"hasMore": hasMore,
	})
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

	entityRows, err := h.lists.ListEntitiesDetailed(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	entityCount := int64(len(entityRows))
	meta := services.DeriveListMeta(list)
	payload := tierListJSON(list, h.images, meta, entityCount)
	payload["entities"] = entitySummariesJSON(entityRows, h.images)

	if userID, authenticated := middleware.OptionalUserID(ctx); authenticated {
		status, err := h.userStatus.GetStatus(userID, id, true)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		payload["userStatus"] = userStatusJSON(status, false)
	}

	ctx.JSON(http.StatusOK, payload)
}

func (h *ListHandler) GetListStats(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	if _, err := h.lists.GetByIDPublic(id); errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	entityCount, err := h.lists.EntityCountForList(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.agg.ListStats(id, entityCount)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"listId":           stats.ListID.String(),
		"entityCount":      stats.EntityCount,
		"uniqueVoters":     stats.UniqueVoters,
		"totalSubmissions": stats.TotalSubmissions,
		"totalVoteLines":   stats.TotalVoteLines,
	})
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

	participantCount, err := h.agg.UniqueVoters(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	resp := gin.H{
		"listId":           id.String(),
		"averageScore":     avg,
		"participantCount": participantCount,
	}

	userID := ctx.MustGet("user_id").(uuid.UUID)
	status, err := h.userStatus.GetStatus(userID, id, true)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if status.HasSubmitted && status.UserAverageScore != nil {
		resp["userAverageScore"] = *status.UserAverageScore
	} else {
		resp["userAverageScore"] = nil
	}

	ctx.JSON(http.StatusOK, resp)
}

func (h *ListHandler) GetEntityAverages(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	list, err := h.lists.GetByID(id)
	if errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	userID := ctx.MustGet("user_id").(uuid.UUID)
	status, err := h.userStatus.GetStatus(userID, id, true)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !status.HasSubmitted {
		ctx.JSON(http.StatusForbidden, gin.H{
			"error": "submit your votes first",
			"code":  "SUBMISSION_REQUIRED",
		})
		return
	}

	cfg, err := services.ParseTiersConfigJSON(list.TiersConfig)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rows, err := h.agg.EntityAverages(id, cfg, h.images.Resolve)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	uniqueVoters, err := h.agg.UniqueVoters(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"entityAverages": entityAverageRowsJSON(rows),
		"uniqueVoters":   uniqueVoters,
	})
}
