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
		llm.Indoprog: s.cfg.IndoprogUrl,
	})

	s.e = echo.New()
	s.e.Validator = controller.NewCustomValidator()
	s.e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     strings.Split(s.cfg.CorsOrigin, ","),
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowCredentials: true,
		AllowHeaders:     []string{echo.HeaderContentType, echo.HeaderAuthorization, echo.HeaderAccept},
	}))
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
	interviewQuestionRepository := repository.NewInterviewQuestionRepository(db)
	assistantRepository := repository.NewAssistantRepository(db)
	skillTreeRepository := repository.NewSkillTreeRepository(db)

	llmService := service.NewLLMService(s.log, s.ai)

	userService := service.NewUserService(s.log, userRepository, sessionRepository, interviewQuestionRepository)
	userService.SetLLMService(llmService)

	assistantService := service.NewAssistantService(s.log, assistantRepository)
	assistantService.SetLLMService(llmService)

	skillTreeService := service.NewSkillTreeService(s.log, skillTreeRepository)
	skillTreeService.SetLLMService(llmService)
	skillTreeService.SetUserService(userService)

	s.addController(controller.NewUserController(userService, s.cfg.Oauth2.Parse()))
	s.addController(controller.NewAssistantController(assistantService, userService))
	s.addController(controller.NewSkillTreeController(userService, skillTreeService))

	return s.e.Start(":8085")
}

func (s *Server) addController(c controller.Controller) {
	c.SetUp(s.e)
}
