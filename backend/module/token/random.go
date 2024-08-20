package token

import "github.com/takiyo0/compfest/backend/module/random"

func New() string {
	return random.String(64)
}
