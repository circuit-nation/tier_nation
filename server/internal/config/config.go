package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                   string
	Env                    string
	DatabaseURL            string
	GoogleClientID         string
	GoogleClientSecret     string
	GoogleRedirectURL      string
	JWTSecret              string
	ClientURL              string
	AdminClientURL         string
	AdminBasicAuthUsername string
	AdminBasicAuthPassword string
	AWSAccessKeyID         string
	AWSSecretAccessKey     string
	AWSRegion              string
	AWSS3Bucket            string
	AWSS3PresignExpirySec  int
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("no env file found")
	}

	return &Config{
		Port:                   getEnv("PORT", "8080"),
		Env:                    getEnv("ENV", "development"),
		DatabaseURL:            getEnv("DATABASE_URL", ""),
		GoogleClientID:         getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret:     getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:      getEnv("GOOGLE_REDIRECT_URL", ""),
		JWTSecret:              getEnv("JWT_SECRET", ""),
		ClientURL:              getEnv("CLIENT_URL", "http://localhost:3000"),
		AdminClientURL:         getEnv("ADMIN_CLIENT_URL", ""),
		AdminBasicAuthUsername: getEnv("ADMIN_BASIC_AUTH_USERNAME", ""),
		AdminBasicAuthPassword: getEnv("ADMIN_BASIC_AUTH_PASSWORD", ""),
		AWSAccessKeyID:         getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretAccessKey:     getEnv("AWS_SECRET_ACCESS_KEY", ""),
		AWSRegion:              getEnv("AWS_REGION", "us-east-1"),
		AWSS3Bucket:            getEnv("AWS_S3_BUCKET", ""),
		AWSS3PresignExpirySec:  getEnvInt("AWS_S3_PRESIGN_EXPIRY_SEC", 3600),
	}
}

func getEnv(key string, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}

	return fallback
}

func getEnvInt(key string, fallback int) int {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	n, err := strconv.Atoi(val)
	if err != nil {
		log.Printf("invalid %s=%q, using default %d", key, val, fallback)
		return fallback
	}
	return n
}

// CorsAllowedOrigins returns origins allowed by CORS (main app + optional admin dashboard).
func (c *Config) CorsAllowedOrigins() []string {
	origins := []string{c.ClientURL}
	if c.AdminClientURL != "" {
		origins = append(origins, c.AdminClientURL)
	}
	return origins
}
