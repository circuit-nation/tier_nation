package services

import (
	"context"
	"log"
	"net/url"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/circuit-nation/tier_nation/server/internal/config"
)

// ImageURLService converts stored s3:// URIs into time-limited HTTPS pre-signed URLs for API responses.
type ImageURLService struct {
	presigner *s3.PresignClient
	bucket    string
	expiry    time.Duration
	enabled   bool
}

func NewImageURLService(cfg *config.Config) *ImageURLService {
	s := &ImageURLService{
		bucket: cfg.AWSS3Bucket,
		expiry: time.Duration(cfg.AWSS3PresignExpirySec) * time.Second,
	}

	if cfg.AWSS3Bucket == "" {
		log.Println("image urls: AWS_S3_BUCKET not set; s3:// URIs will be returned unchanged")
		return s
	}

	loadOpts := []func(*awsconfig.LoadOptions) error{
		awsconfig.WithRegion(cfg.AWSRegion),
	}
	if cfg.AWSAccessKeyID != "" && cfg.AWSSecretAccessKey != "" {
		loadOpts = append(loadOpts, awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(cfg.AWSAccessKeyID, cfg.AWSSecretAccessKey, ""),
		))
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(), loadOpts...)
	if err != nil {
		log.Printf("image urls: failed to load AWS config: %v", err)
		return s
	}

	var s3Opts []func(*s3.Options)

	client := s3.NewFromConfig(awsCfg, s3Opts...)
	s.presigner = s3.NewPresignClient(client)
	s.enabled = true
	return s
}

// Resolve returns a client-usable URL. s3:// URIs are pre-signed when S3 is configured;
// http(s) and other values are returned unchanged.
func (s *ImageURLService) Resolve(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	if strings.HasPrefix(raw, "http://") || strings.HasPrefix(raw, "https://") {
		return raw
	}

	bucket, key, ok := parseS3URI(raw)
	if !ok {
		return raw
	}
	if bucket == "" {
		bucket = s.bucket
	}
	if !s.enabled || s.presigner == nil {
		return raw
	}

	out, err := s.presigner.PresignGetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(s.expiry))
	if err != nil {
		log.Printf("image urls: presign %q: %v", raw, err)
		return raw
	}

	log.Printf("image urls: resolved %q to %q", raw, out.URL)
	return out.URL
}

func parseS3URI(uri string) (bucket, key string, ok bool) {
	u, err := url.Parse(uri)
	if err != nil || u.Scheme != "s3" || u.Host == "" {
		return "", "", false
	}
	key = strings.TrimPrefix(u.Path, "/")
	if key == "" {
		return "", "", false
	}
	return u.Host, key, true
}
