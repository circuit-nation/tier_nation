package handlers

import (
	"errors"
	"net/http"

	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type VoteHandler struct {
	votes *services.VoteService
}

func NewVoteHandler(votes *services.VoteService) *VoteHandler {
	return &VoteHandler{votes: votes}
}

func (h *VoteHandler) PostVotes(ctx *gin.Context) {
	userID := ctx.MustGet("user_id").(uuid.UUID)

	var body struct {
		ListID      string `json:"listId" binding:"required"`
		IsAnonymous bool   `json:"isAnonymous"`
		Votes       []struct {
			EntityID       string `json:"entityId" binding:"required"`
			TierValue      int    `json:"tierValue" binding:"required"`
			PlacementOrder *int   `json:"placementOrder"`
		} `json:"votes" binding:"required"`
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

	lines := make([]services.VoteLineInput, 0, len(body.Votes))
	for _, v := range body.Votes {
		eid, err := uuid.Parse(v.EntityID)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid entity id"})
			return
		}
		lines = append(lines, services.VoteLineInput{
			EntityID:       eid,
			TierValue:      v.TierValue,
			PlacementOrder: v.PlacementOrder,
		})
	}

	err = h.votes.SubmitVotes(userID, listID, body.IsAnonymous, lines)
	if errors.Is(err, services.ErrSubmissionRequired) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if errors.Is(err, services.ErrListNotFound) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "list not found"})
		return
	}
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "votes submitted"})
}
