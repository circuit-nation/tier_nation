package middleware

import (
	"net/http"
	"strings"

	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AuthMiddleware(jwtService *services.JWTService) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userID, ok := userIDFromBearer(ctx, jwtService)
		if !ok {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"error": "authorization header required",
				"code":  "AUTH_REQUIRED",
			})
			ctx.Abort()
			return
		}

		ctx.Set("user_id", userID)
		ctx.Set("authenticated", true)
		ctx.Next()
	}
}

// OptionalAuth parses Bearer JWT when present; does not abort when missing or invalid.
func OptionalAuth(jwtService *services.JWTService) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if userID, ok := userIDFromBearer(ctx, jwtService); ok {
			ctx.Set("user_id", userID)
			ctx.Set("authenticated", true)
		} else {
			ctx.Set("authenticated", false)
		}
		ctx.Next()
	}
}

func userIDFromBearer(ctx *gin.Context, jwtService *services.JWTService) (uuid.UUID, bool) {
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		return uuid.Nil, false
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return uuid.Nil, false
	}

	claims, err := jwtService.ValidateToken(parts[1])
	if err != nil {
		return uuid.Nil, false
	}

	return claims.UserID, true
}

// OptionalUserID returns user id when OptionalAuth set authenticated.
func OptionalUserID(ctx *gin.Context) (uuid.UUID, bool) {
	if auth, ok := ctx.Get("authenticated"); !ok || auth != true {
		return uuid.Nil, false
	}
	uid, ok := ctx.Get("user_id")
	if !ok {
		return uuid.Nil, false
	}
	return uid.(uuid.UUID), true
}
