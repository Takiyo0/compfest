package config

import "golang.org/x/oauth2"

type Oauth2Config struct {
	ClientID     string `env:"OAUTH2_CLIENT_ID"`
	ClientSecret string `env:"OAUTH2_CLIENT_SECRET"`
	RedirectURL  string `env:"OAUTH2_REDIRECT_URL"`
}

func (c *Oauth2Config) Parse() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     c.ClientID,
		ClientSecret: c.ClientSecret,
		RedirectURL:  c.RedirectURL,
		Scopes:       []string{"user"},
		Endpoint: oauth2.Endpoint{
			AuthURL:       "https://github.com/login/oauth/authorize",
			TokenURL:      "https://github.com/login/oauth/access_token",
			DeviceAuthURL: "https://github.com/login/device/code",
		},
	}
}
