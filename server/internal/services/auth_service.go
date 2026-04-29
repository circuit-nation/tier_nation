package services

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/circuit-nation/tier_nation/server/internal/config"
	"github.com/circuit-nation/tier_nation/server/internal/models"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

type AuthService struct {
	oauthConfig *oauth2.Config
	db          *gorm.DB
	jwtService  *JWTService
}

type GoogleUser struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"picture"`
}

func NewAuthService(cfg *config.Config, db *gorm.DB, jwtService *JWTService) *AuthService {
	oauthConfig := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		RedirectURL:  cfg.GoogleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &AuthService{
		oauthConfig: oauthConfig,
		db:          db,
		jwtService:  jwtService,
	}
}

func (s *AuthService) GetGoogleAuthURL(state string) string {
	return s.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

func (s *AuthService) ExchangeCode(ctx context.Context, code string) (*oauth2.Token, error) {
	return s.oauthConfig.Exchange(ctx, code)
}

func (s *AuthService) GetGoogleUser(token *oauth2.Token) (*GoogleUser, error) {
	client := s.oauthConfig.Client(context.Background(), token)
	res, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	var googleUser GoogleUser
	if err := json.NewDecoder(res.Body).Decode(&googleUser); err != nil {
		return nil, err
	}

	return &googleUser, nil
}

func (s *AuthService) UpsertUser(googleUser *GoogleUser) (*models.User, error) {
	var user models.User

	result := s.db.Where("google_id = ?", googleUser.ID).First(&user)

	if result.Error == gorm.ErrRecordNotFound {
		user = models.User{
			GoogleID:  googleUser.ID,
			Email:     googleUser.Email,
			Name:      googleUser.Name,
			AvatarURL: googleUser.AvatarURL,
		}

		if err := s.db.Create(&user).Error; err != nil {
			return nil, err
		}
	} else if result.Error != nil {
		return nil, result.Error
	}

	return &user, nil
}

func (s *AuthService) GetUser(userID uuid.UUID) (*models.User, error) {
	var user models.User

	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) CreateSession(userID uuid.UUID, refreshToken string) error {
	session := models.Session{
		UserID:       userID,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(7 * 24 * time.Hour),
	}

	return s.db.Create(&session).Error
}

func (s *AuthService) RefreshToken(refreshToken string) (string, error) {
	// validate the refresh token
	claims, err := s.jwtService.ValidateToken(refreshToken)
	if err != nil {
		return "", errors.New("invalid refresh token")
	}

	// check if session exists in DB
	var session models.Session
	if err := s.db.Where("refresh_token = ?", refreshToken).First(&session).Error; err != nil {
		return "", errors.New("session not found")
	}

	// check if session is expired
	if session.ExpiresAt.Before(time.Now()) {
		return "", errors.New("session expired")
	}

	// generate new access token
	accessToken, err := s.jwtService.GenerateToken(claims.UserID, claims.Email)
	if err != nil {
		return "", errors.New("failed to generate token")
	}

	return accessToken, nil
}

func (s *AuthService) DeleteSession(refreshToken string) error {
	return s.db.Where("refresh_token = ?", refreshToken).Delete(&models.Session{}).Error
}
