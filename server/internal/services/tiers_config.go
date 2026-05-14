package services

import (
	"encoding/json"
	"errors"

	"gorm.io/datatypes"
)

type TierConfigEntry struct {
	Value int    `json:"value"`
	Label string `json:"label"`
}

type TiersConfigPayload struct {
	Tiers []TierConfigEntry `json:"tiers"`
}

func ParseTiersConfigJSON(data datatypes.JSON) (*TiersConfigPayload, error) {
	if len(data) == 0 {
		return nil, errors.New("tiers config is empty")
	}
	var cfg TiersConfigPayload
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}

func TierValueAllowed(cfg *TiersConfigPayload, value int) bool {
	for _, t := range cfg.Tiers {
		if t.Value == value {
			return true
		}
	}
	return false
}
