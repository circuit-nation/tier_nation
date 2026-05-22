package handlers

import (
	"net/http"

	"github.com/circuit-nation/tier_nation/server/internal/config"
	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService *services.AuthService
	jwtService  *services.JWTService
	userStatus  *services.UserListStatusService
	config      *config.Config
}

func NewAuthHandler(
	authService *services.AuthService,
	jwtService *services.JWTService,
	userStatus *services.UserListStatusService,
	cfg *config.Config,
) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		jwtService:  jwtService,
		userStatus:  userStatus,
		config:      cfg,
	}
}

func (h *AuthHandler) GoogleLogin(ctx *gin.Context) {
	state := "random-state-string"
	url := h.authService.GetGoogleAuthURL(state)
	ctx.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *AuthHandler) GoogleCallback(ctx *gin.Context) {
	code := ctx.Query("code")
	if code == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "code not found"})
		return
	}

	token, err := h.authService.ExchangeCode(ctx, code)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to exchange code"})
		return
	}

	googleUser, err := h.authService.GetGoogleUser(token)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user info"})
		return
	}

	user, err := h.authService.UpsertUser(googleUser)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upsert user"})
		return
	}

	accessToken, err := h.jwtService.GenerateToken(user.ID, user.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	refreshToken, err := h.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate refresh token"})
		return
	}

	if err := h.authService.CreateSession(user.ID, refreshToken); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create session"})
		return
	}

	ctx.SetCookie("refresh_token", refreshToken, 7*24*3600, "/", "", false, true)
	ctx.Redirect(http.StatusTemporaryRedirect, h.config.ClientURL+"/auth/callback?access_token="+accessToken)
}

func (h *AuthHandler) GetUserInfo(ctx *gin.Context) {
	userID := ctx.MustGet("user_id").(uuid.UUID)

	user, err := h.authService.GetUser(userID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	submissionsCount, err := h.userStatus.SubmissionsCount(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"user":             user,
		"submissionsCount": submissionsCount,
	})
}

func refreshTokenFromRequest(ctx *gin.Context) string {
	if token, err := ctx.Cookie("refresh_token"); err == nil && token != "" {
		return token
	}
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	_ = ctx.ShouldBindJSON(&body)
	return body.RefreshToken
}

func (h *AuthHandler) Refresh(ctx *gin.Context) {
	refreshToken := refreshTokenFromRequest(ctx)
	if refreshToken == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "refresh token is required"})
		return
	}

	accessToken, err := h.authService.RefreshToken(refreshToken)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"access_token": accessToken})
}

func (h *AuthHandler) Logout(ctx *gin.Context) {
	refreshToken := refreshTokenFromRequest(ctx)
	if refreshToken == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "refresh token is required"})
		return
	}

	if err := h.authService.DeleteSession(refreshToken); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to logout"})
		return
	}

	ctx.SetCookie("refresh_token", "", -1, "/", "", false, true)
	ctx.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
}
