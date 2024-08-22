package server

import (
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/sirupsen/logrus"
	"github.com/takiyo0/compfest/backend/config"
	"github.com/takiyo0/compfest/backend/controller"
	"github.com/takiyo0/compfest/backend/llm"
	"github.com/takiyo0/compfest/backend/repository"
	"github.com/takiyo0/compfest/backend/service"
	"net/http"
	"strings"
)

type Server struct {
	cfg config.Config
	ai  *llm.LLM
	e   *echo.Echo
	log logrus.FieldLogger
}

func New(log logrus.FieldLogger, cfg config.Config) *Server {
	srv := &Server{
		cfg: cfg,
		log: log,
	}
	return srv
}

func (s *Server) Start() error {
	s.ai = llm.New(map[string]string{
		llm.IndoprogQ: s.cfg.IndoprogqUrl,
		llm.IndoprogC: s.cfg.IndoprogcUrl,
	})

	s.e = echo.New()
	s.e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     strings.Split(s.cfg.CorsOrigin, ","),
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowCredentials: true,
		AllowHeaders:     []string{echo.HeaderContentType, echo.HeaderAuthorization, echo.HeaderAccept},
	}))
	s.e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogURI:    true,
		LogStatus: true,
		LogValuesFunc: func(c echo.Context, values middleware.RequestLoggerValues) error {
			s.log.WithFields(logrus.Fields{
				"URI":    values.URI,
				"status": values.Status,
			}).Info("request")
			return nil
		},
	}))
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
	interviewQuestionRepository := repository.NewInterviewQuestionRepository(db)

	llmService := service.NewLLMService(s.ai)

	userService := service.NewUserService(s.log, userRepository, sessionRepository, interviewQuestionRepository)
	userService.SetLLMService(llmService)

	s.addController(controller.NewUserController(userService, s.cfg.Oauth2.Parse()))

	return s.e.Start(":8085")
}

func (s *Server) addController(c controller.Controller) {
	c.SetUp(s.e)
}
