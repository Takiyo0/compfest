package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/controller/gate"
	"github.com/takiyo0/compfest/backend/service"
)

type SkillTreeController struct {
	userService      *service.UserService
	skillTreeService *service.SkillTreeService
}

func NewSkillTreeController(userService *service.UserService) *SkillTreeController {
	return &SkillTreeController{userService: userService}
}

func (c *SkillTreeController) SetUp(e *echo.Echo) {
	authGate := gate.Auth(c.userService)

	g := e.Group("/tree/:id", authGate)
	g.GET("/questions", c.handleGetQuestions)
	g.POST("/questions", c.handleSubmitAnswer)
}

func (c *SkillTreeController) handleGetQuestions(ctx echo.Context) error {
	return nil
}

func (c *SkillTreeController) handleSubmitAnswer(ctx echo.Context) error {
	return nil
}
