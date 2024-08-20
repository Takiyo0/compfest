package config

import (
	"fmt"
	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	IsProduction bool `env:"IS_PRODUCTION"`

	Database DatabaseConfig
	Oauth2   Oauth2Config

	IndoprogqUrl string `env:"INDOPROGQ_URL"`
	IndoprogcUrl string `env:"INDOPROGC_URL"`
}

var Global Config

func Load() (Config, error) {
	if err := godotenv.Load(); err != nil {
		return Config{}, fmt.Errorf("failed to load .env file: %w", err)
	}
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return Config{}, fmt.Errorf("failed to load env: %w", err)
	}
	return cfg, nil
}
