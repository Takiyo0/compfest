package server

import (
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/takiyo0/compfest/backend/config"
	"github.com/takiyo0/compfest/backend/controller"
	"github.com/takiyo0/compfest/backend/llm"
	"github.com/takiyo0/compfest/backend/repository"
	"github.com/takiyo0/compfest/backend/service"
)

type Server struct {
	cfg config.Config
	ai  *llm.LLM
	e   *echo.Echo
}

func New(cfg config.Config) *Server {
	srv := &Server{}
	srv.cfg = cfg
	return srv
}

func (s *Server) Start() error {
	s.ai = llm.New(map[string]string{
		"indoprog-q": s.cfg.IndoprogqUrl,
		"indoprog-c": s.cfg.IndoprogcUrl,
	})

	s.e = echo.New()

	s.e.Use(middleware.Logger())
	s.e.Use(middleware.Recover())

	db, err := sqlx.Open("mysql", s.cfg.Database.DSN())
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	if err := db.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	userRepository := repository.NewUserRepository(db)
	sessionRepository := repository.NewSessionRepository(db)

	userService := service.NewUserService(userRepository, sessionRepository)

	s.addController(controller.NewUserController(userService, s.cfg.Oauth2.Parse()))

	return s.e.Start(":8085")
}

func (s *Server) addController(c controller.Controller) {
	c.SetUp(s.e)
}
