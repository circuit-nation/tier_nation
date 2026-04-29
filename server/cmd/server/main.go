package main

import (
	"log"

	"github.com/circuit-nation/tier_nation/server/internal/config"
	"github.com/circuit-nation/tier_nation/server/internal/database"
	"github.com/circuit-nation/tier_nation/server/internal/server"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	s := server.NewServer(cfg, db)

	log.Printf("server running on port: %s", cfg.Port)

	if err := s.Run(); err != nil {
		log.Fatalf("failed to start server %v", err)
	}
}
