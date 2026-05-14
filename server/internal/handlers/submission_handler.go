package handlers

import (
	"errors"
	"net/http"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SubmissionHandler struct {
	submissions *services.SubmissionService
	lists       *services.ListService
}

func NewSubmissionHandler(submissions *services.SubmissionService, lists *services.ListService) *SubmissionHandler {
	return &SubmissionHandler{submissions: submissions, lists: lists}
}

func (h *SubmissionHandler) CreateSubmission(ctx *gin.Context) {
	userID := ctx.MustGet("user_id").(uuid.UUID)

	var body struct {
		ListID      string `json:"listId" binding:"required"`
		IsAnonymous bool   `json:"isAnonymous"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	listID, err := uuid.Parse(body.ListID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid list id"})
		return
	}

	if _, err := h.lists.GetByIDPublic(listID); errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	sub, existed, err := h.submissions.CreateSubmission(userID, listID, body.IsAnonymous)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	status := http.StatusCreated
	if existed {
		status = http.StatusOK
	}

	ctx.JSON(status, submissionJSON(sub))
}

func submissionJSON(s *models.Submission) gin.H {
	return gin.H{
		"id":          s.ID.String(),
		"listId":      s.ListID.String(),
		"userId":      s.UserID.String(),
		"isAnonymous": s.IsAnonymous,
		"createdAt":   s.CreatedAt,
		"updatedAt":   s.UpdatedAt,
	}
}
