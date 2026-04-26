package server

import (
	"net/http"

	"github.com/circuit-nation/tier_nation/server/internal/config"
	"github.com/circuit-nation/tier_nation/server/internal/handlers"
	"github.com/circuit-nation/tier_nation/server/internal/middleware"
	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Server struct {
	router      *gin.Engine
	config      *config.Config
	authHandler *handlers.AuthHandler
	db          *gorm.DB
	jwtService  *services.JWTService
}

func NewServer(cfg *config.Config, db *gorm.DB) *Server {
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	jwtService := services.NewJWTService(cfg)
	authService := services.NewAuthService(cfg, db, jwtService)
	authHandler := handlers.NewAuthHandler(authService, jwtService, cfg)

	s := &Server{
		router:      gin.Default(),
		config:      cfg,
		authHandler: authHandler,
		db:          db,
		jwtService:  jwtService,
	}

	s.router.SetTrustedProxies(nil)
	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	s.router.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// v1 routes
	v1 := s.router.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.GET("/google/login", s.authHandler.GoogleLogin)
			auth.GET("/google/callback", s.authHandler.GoogleCallback)
			auth.POST("/refresh", s.authHandler.Refresh)
			auth.POST("/logout", s.authHandler.Logout)
		}
	}

	protected := v1.Group("/")
	protected.Use(middleware.AuthMiddleware(s.jwtService))
	{
		protected.GET("/me", s.authHandler.GetUserInfo)
	}
}

func (s *Server) Run() error {
	return s.router.Run(":" + s.config.Port)
}
