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

func NewSkillTreeController(userService *service.UserService, skillTreeService *service.SkillTreeService) *SkillTreeController {
	return &SkillTreeController{userService: userService, skillTreeService: skillTreeService}
}

func (c *SkillTreeController) SetUp(e *echo.Echo) {
	authGate := gate.Auth(c.userService)

	g := e.Group("/tree")
	g.GET("/", c.handleGetSkillTree)

	gt := g.Group("/:id", authGate)
	gt.GET("/questions", c.handleGetQuestions)
	gt.POST("/questions", c.handleSubmitAnswer)
}

func (c *SkillTreeController) handleGetSkillTree(ctx echo.Context) error {
	return nil
}

func (c *SkillTreeController) handleGetQuestions(ctx echo.Context) error {
	return nil
}

func (c *SkillTreeController) handleSubmitAnswer(ctx echo.Context) error {
	return nil
}
