package handlers

import (
	"encoding/json"

	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
)

func tierListJSON(t *models.TierList, images *services.ImageURLService, meta services.ListMeta, entityCount int64) gin.H {
	var tiersCfg any
	if len(t.TiersConfig) > 0 {
		_ = json.Unmarshal(t.TiersConfig, &tiersCfg)
	}
	var createdBy any
	if t.CreatedBy != nil {
		createdBy = t.CreatedBy.String()
	}
	h := gin.H{
		"id":                 t.ID.String(),
		"name":               t.Name,
		"description":        t.Description,
		"coverImage":         images.Resolve(t.CoverImage),
		"tiersConfig":        tiersCfg,
		"isLocked":           t.IsLocked,
		"isVisible":          t.IsVisible,
		"startTime":          t.StartTime,
		"endTime":            t.EndTime,
		"createdBy":          createdBy,
		"createdAt":          t.CreatedAt,
		"updatedAt":          t.UpdatedAt,
		"entityCount":        entityCount,
		"status":             meta.Status,
		"isLive":             meta.IsLive,
		"votingOpen":         meta.VotingOpen,
		"votingClosedReason": meta.VotingClosedReason,
	}
	if t.ArchivedAt != nil {
		h["archivedAt"] = t.ArchivedAt
	}
	return h
}

func userStatusJSON(status services.UserListStatus, compact bool) gin.H {
	if compact {
		return gin.H{
			"hasSubmitted":            status.HasSubmitted,
			"canViewCommunityResults": status.CanViewCommunityResults,
		}
	}
	out := gin.H{
		"hasSubmitted":            status.HasSubmitted,
		"isAnonymous":             status.IsAnonymous,
		"voteCount":               status.VoteCount,
		"canViewCommunityResults": status.CanViewCommunityResults,
	}
	if status.SubmissionID != nil {
		out["submissionId"] = status.SubmissionID.String()
	} else {
		out["submissionId"] = nil
	}
	if status.SubmittedAt != nil {
		out["submittedAt"] = status.SubmittedAt
	} else {
		out["submittedAt"] = nil
	}
	if status.UserAverageScore != nil {
		out["userAverageScore"] = *status.UserAverageScore
	} else {
		out["userAverageScore"] = nil
	}
	return out
}

func entitySummariesJSON(rows []services.ListEntityRow, images *services.ImageURLService) []gin.H {
	out := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		e := row.Entity
		item := gin.H{
			"id":          e.ID.String(),
			"name":        e.Name,
			"description": e.Description,
			"team":        e.Team,
			"tags":        []string(e.Tags),
			"imageUrl":    images.Resolve(e.ImageURL),
			"sortOrder":   row.SortOrder,
		}
		out = append(out, item)
	}
	return out
}

func entityAverageRowsJSON(rows []services.EntityAverageRow) []gin.H {
	out := make([]gin.H, 0, len(rows))
	for _, r := range rows {
		out = append(out, gin.H{
			"entityId":         r.EntityID.String(),
			"averageTierValue": r.AverageTierValue,
			"voteCount":        r.VoteCount,
			"entityName":       r.EntityName,
			"team":             r.Team,
			"imageUrl":         r.ImageURL,
			"averageTierLabel": r.AverageTierLabel,
			"rank":             r.Rank,
		})
	}
	return out
}
