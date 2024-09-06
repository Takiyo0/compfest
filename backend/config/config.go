package config

import (
	"fmt"
	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
	"os"
)

type Config struct {
	IsProduction bool `env:"IS_PRODUCTION"`

	AppPort int `env:"APP_PORT" envDefault:"8085"`

	Database DatabaseConfig
	Oauth2   Oauth2Config

	IndoprogUrl  string `env:"INDOPROG_URL"`
	IndoprogCUrl string `env:"INDOPROGC_URL"`

	CorsOrigin string `env:"CORS_ORIGIN"`
}

var Global Config

func Load() (Config, error) {
	if _, err := os.Stat(".env"); os.IsNotExist(err) {
		_ = os.WriteFile(".env", []byte("IS_PRODUCTION=false\n"), 0644)
	}

	if err := godotenv.Load(); err != nil {
		return Config{}, fmt.Errorf("failed to load .env file: %w", err)
	}
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return Config{}, fmt.Errorf("failed to load env: %w", err)
	}
	return cfg, nil
}
