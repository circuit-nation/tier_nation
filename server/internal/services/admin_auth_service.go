package services

import (
	"crypto/subtle"

	"github.com/circuit-nation/tier_nation/server/internal/config"
)

type AdminAuthService struct {
	username []byte
	password []byte
}

func NewAdminAuthService(cfg *config.Config) *AdminAuthService {
	return &AdminAuthService{
		username: []byte(cfg.AdminBasicAuthUsername),
		password: []byte(cfg.AdminBasicAuthPassword),
	}
}

// ValidateCredentials compares username and password to configured admin credentials using constant-time equality.
func (s *AdminAuthService) ValidateCredentials(username, password string) bool {
	if len(s.username) == 0 || len(s.password) == 0 {
		return false
	}
	u := []byte(username)
	p := []byte(password)
	uOk := len(u) == len(s.username) && subtle.ConstantTimeCompare(u, s.username) == 1
	pOk := len(p) == len(s.password) && subtle.ConstantTimeCompare(p, s.password) == 1
	return uOk && pOk
}
