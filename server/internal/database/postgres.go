package database

import (
	"log"

	"github.com/circuit-nation/tier_nation/server/internal/config"
	"github.com/circuit-nation/tier_nation/server/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(cfg *config.Config) (*gorm.DB, error) {
	if cfg.DatabaseURL == "" {
		log.Fatal("database url is not set")
	}

	gormConfg := &gorm.Config{}

	if cfg.Env == "development" {
		gormConfg.Logger = logger.Default.LogMode(logger.Info)
	}

	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), gormConfg)
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(
		&models.User{},
		&models.Session{},
	); err != nil {
		return nil, err
	}

	log.Println("database connected successfully")
	DB = db
	return db, nil
}
