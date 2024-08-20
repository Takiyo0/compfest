package main

import (
	"github.com/sirupsen/logrus"
	"github.com/takiyo0/compfest/backend/config"
	"github.com/takiyo0/compfest/backend/server"
)

func main() {
	log := logrus.New()

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	srv := server.New(cfg)
	if err := srv.Start(); err != nil {
		panic(err)
	}
}
