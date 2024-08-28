package controller

import (
	"encoding/json"
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/controller/gate"
	"github.com/takiyo0/compfest/backend/service"
	"net/http"
)

type AssistantController struct {
	assistantService *service.AssistantService
	userService      *service.UserService
}

func NewAssistantController(assistantService *service.AssistantService, userService *service.UserService) *AssistantController {
	return &AssistantController{assistantService: assistantService, userService: userService}
}

func (c *AssistantController) SetUp(e *echo.Echo) {
	authGate := gate.Auth(c.userService)
	g := e.Group("/assistant", authGate)

	cg := g.Group("/chat")
	cg.GET("/", c.handleChatHistory)
	cg.POST("/", c.handleCreateChat)
	cg.POST("/:id/", c.handleChat)
}

func (c *AssistantController) handleChatHistory(ctx echo.Context) error {
	return nil
}

func (c *AssistantController) handleChat(ctx echo.Context) error {
	type chatRequest struct {
		Prompt string `json:"prompt" validate:"required"`
		ChatId int64  `param:"id" validate:"required"`
	}
	var req chatRequest
	if err := BindAndValidate(ctx, &req); err != nil {
		return err
	}

	ctx.Response().Status = http.StatusOK
	ctx.Response().Header().Set("Content-Type", "text/event-stream")

	if _, err := c.assistantService.Chat(Sess(ctx).UserId, req.ChatId, req.Prompt, func(content string) error {
		fmt.Print(content)
		if content == "" {
			return nil
		}
		contentEncoded, err := json.Marshal(map[string]string{"content": content})
		if err != nil {
			return err
		}
		if _, err := ctx.Response().Write([]byte("data: " + string(contentEncoded) + "\n\n")); err != nil {
			return err
		}
		ctx.Response().Flush()
		return err
	}); err != nil {
		return err
	}

	return nil
}

func (c *AssistantController) handleCreateChat(ctx echo.Context) error {
	sess := Sess(ctx)
	chatId, err := c.assistantService.CreateChat(sess.UserId)
	if err != nil {
		return err
	}
	return ctx.JSON(200, map[string]interface{}{
		"chatId": chatId,
	})
}
