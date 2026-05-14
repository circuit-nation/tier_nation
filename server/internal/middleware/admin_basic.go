package middleware

import (
	"encoding/base64"
	"net/http"
	"strings"

	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
)

func AdminBasicAuth(adminAuth *services.AdminAuthService) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		auth := ctx.GetHeader("Authorization")
		const prefix = "Basic "
		if !strings.HasPrefix(auth, prefix) {
			ctx.Header("WWW-Authenticate", `Basic realm="admin"`)
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "authorization required"})
			ctx.Abort()
			return
		}

		raw, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(auth, prefix))
		if err != nil {
			ctx.Header("WWW-Authenticate", `Basic realm="admin"`)
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization encoding"})
			ctx.Abort()
			return
		}

		pair := string(raw)
		username, password, ok := strings.Cut(pair, ":")
		if !ok {
			ctx.Header("WWW-Authenticate", `Basic realm="admin"`)
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid basic auth payload"})
			ctx.Abort()
			return
		}

		if !adminAuth.ValidateCredentials(username, password) {
			ctx.Header("WWW-Authenticate", `Basic realm="admin"`)
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}
