package services

import (
	"time"

	"github.com/circuit-nation/tier_nation/server/internal/models"
)

const (
	ListStatusUpcoming = "upcoming"
	ListStatusLive     = "live"
	ListStatusEnded    = "ended"
	ListStatusLocked   = "locked"
	ListStatusArchived = "archived"
)

type ListMeta struct {
	Status             string
	IsLive             bool
	VotingOpen         bool
	VotingClosedReason *string
}

func DeriveListMeta(list *models.TierList) ListMeta {
	now := time.Now()
	meta := ListMeta{
		Status:     ListStatusLive,
		IsLive:     true,
		VotingOpen: true,
	}

	if list.ArchivedAt != nil {
		meta.Status = ListStatusArchived
		meta.IsLive = false
		meta.VotingOpen = false
		reason := "archived"
		meta.VotingClosedReason = &reason
		return meta
	}

	if list.IsLocked {
		meta.Status = ListStatusLocked
		meta.IsLive = false
		meta.VotingOpen = false
		reason := "locked"
		meta.VotingClosedReason = &reason
		return meta
	}

	if list.StartTime != nil && now.Before(*list.StartTime) {
		meta.Status = ListStatusUpcoming
		meta.IsLive = false
		meta.VotingOpen = false
		reason := "not_started"
		meta.VotingClosedReason = &reason
		return meta
	}

	if list.EndTime != nil && now.After(*list.EndTime) {
		meta.Status = ListStatusEnded
		meta.IsLive = false
		meta.VotingOpen = false
		reason := "ended"
		meta.VotingClosedReason = &reason
		return meta
	}

	if list.StartTime != nil && list.EndTime != nil {
		meta.IsLive = now.After(*list.StartTime) && now.Before(*list.EndTime)
		if meta.IsLive {
			meta.Status = ListStatusLive
		}
	}

	return meta
}
