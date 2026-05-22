package config

import (
	"encoding/json"
	"log"
	"os"
	"strconv"
	"strings"

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
	ClientURL              string // comma-separated list of allowed origins
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
		ClientURL:              getEnv("CLIENT_URL", "http://localhost:5173"),
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

// ClientOrigins returns the allowed client origins parsed from CLIENT_URL.
func (c *Config) ClientOrigins() []string {
	return parseOriginList(c.ClientURL)
}

// PrimaryClientURL returns the first parsed client URL for redirect use.
func (c *Config) PrimaryClientURL() string {
	origins := parseOriginList(c.ClientURL)
	if len(origins) > 0 {
		return origins[0]
	}
	return strings.TrimSpace(c.ClientURL)
}

// CorsAllowedOrigins returns origins allowed by CORS (main app + optional admin dashboard).
func (c *Config) CorsAllowedOrigins() []string {
	origins := parseOriginList(c.ClientURL)
	if c.AdminClientURL == "" {
		return origins
	}
	return appendUnique(origins, parseOriginList(c.AdminClientURL)...)
}

func parseOriginList(value string) []string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}

	if strings.HasPrefix(trimmed, "[") {
		var origins []string
		if err := json.Unmarshal([]byte(trimmed), &origins); err == nil {
			return normalizeOrigins(origins)
		}
		trimmed = strings.Trim(trimmed, "[]")
	}

	return normalizeOrigins(strings.Split(trimmed, ","))
}

func normalizeOrigins(parts []string) []string {
	origins := make([]string, 0, len(parts))
	seen := make(map[string]struct{}, len(parts))

	for _, part := range parts {
		origin := strings.TrimSpace(part)
		origin = strings.Trim(origin, `"'`)
		if origin == "" {
			continue
		}
		if _, ok := seen[origin]; ok {
			continue
		}
		origins = append(origins, origin)
		seen[origin] = struct{}{}
	}

	return origins
}

func appendUnique(origins []string, additional ...string) []string {
	if len(additional) == 0 {
		return origins
	}

	seen := make(map[string]struct{}, len(origins))
	for _, origin := range origins {
		seen[origin] = struct{}{}
	}

	for _, origin := range additional {
		if origin == "" {
			continue
		}
		if _, ok := seen[origin]; ok {
			continue
		}
		origins = append(origins, origin)
		seen[origin] = struct{}{}
	}

	return origins
}
