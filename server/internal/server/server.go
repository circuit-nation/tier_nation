package server

import (
	"net/http"

	"github.com/circuit-nation/tier_nation/server/internal/config"
	"github.com/circuit-nation/tier_nation/server/internal/handlers"
	"github.com/circuit-nation/tier_nation/server/internal/middleware"
	"github.com/circuit-nation/tier_nation/server/internal/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Server struct {
	router              *gin.Engine
	config              *config.Config
	authHandler         *handlers.AuthHandler
	listHandler         *handlers.ListHandler
	submissionHandler   *handlers.SubmissionHandler
	voteHandler         *handlers.VoteHandler
	adminHandler        *handlers.AdminHandler
	adminAuthService    *services.AdminAuthService
	db                  *gorm.DB
	jwtService          *services.JWTService
}

func NewServer(cfg *config.Config, db *gorm.DB) *Server {
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	jwtService := services.NewJWTService(cfg)
	authService := services.NewAuthService(cfg, db, jwtService)
	authHandler := handlers.NewAuthHandler(authService, jwtService, cfg)

	listService := services.NewListService(db)
	entityService := services.NewEntityService(db)
	submissionService := services.NewSubmissionService(db)
	voteService := services.NewVoteService(db, listService)
	aggregationService := services.NewAggregationService(db)
	adminAuthService := services.NewAdminAuthService(cfg)

	listHandler := handlers.NewListHandler(listService, aggregationService)
	submissionHandler := handlers.NewSubmissionHandler(submissionService, listService)
	voteHandler := handlers.NewVoteHandler(voteService)
	adminHandler := handlers.NewAdminHandler(listService, entityService)

	s := &Server{
		router:            gin.New(),
		config:            cfg,
		authHandler:       authHandler,
		listHandler:       listHandler,
		submissionHandler: submissionHandler,
		voteHandler:       voteHandler,
		adminHandler:      adminHandler,
		adminAuthService:  adminAuthService,
		db:                db,
		jwtService:        jwtService,
	}

	s.router.Use(gin.Logger())
	s.router.Use(gin.Recovery())

	s.router.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CorsAllowedOrigins(),
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	s.setupRoutes()
	s.router.SetTrustedProxies(nil)

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

		v1.GET("/lists", s.listHandler.GetLists)
		v1.GET("/lists/:id", s.listHandler.GetList)

		protected := v1.Group("/")
		protected.Use(middleware.AuthMiddleware(s.jwtService))
		{
			protected.GET("/me", s.authHandler.GetUserInfo)
			protected.POST("/submissions", s.submissionHandler.CreateSubmission)
			protected.POST("/votes", s.voteHandler.PostVotes)
			protected.GET("/lists/:id/average-score", s.listHandler.GetAverageScore)
			protected.GET("/lists/:id/entity-averages", s.listHandler.GetEntityAverages)
		}

		admin := v1.Group("/admin")
		admin.Use(middleware.AdminBasicAuth(s.adminAuthService))
		{
			admin.POST("/lists", s.adminHandler.CreateTierList)
			admin.POST("/entities", s.adminHandler.CreateEntities)
			admin.POST("/lists/:id/entities", s.adminHandler.AddEntitiesToList)
			admin.PATCH("/lists/:id/archive", s.adminHandler.ArchiveList)
		}
	}
}

func (s *Server) Run() error {
	return s.router.Run(":" + s.config.Port)
}
