package controller

import (
	"encoding/json"
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/controller/gate"
	"github.com/takiyo0/compfest/backend/service"
	"net/http"
	"sync"
	"time"
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
	cg.GET("/:id/prompt", c.handlePrompt)
	cg.GET("/:id/messages", c.handleChatMessages)
}

func (c *AssistantController) handleChatHistory(ctx echo.Context) error {
	type chatHistoryResponse struct {
		Id    int64  `json:"id"`
		Title string `json:"title"`
	}
	assistantChats, err := c.assistantService.GetChats(Sess(ctx).UserId)
	if err != nil {
		return err
	}
	resp := make([]chatHistoryResponse, 0)
	for _, chat := range assistantChats {
		resp = append(resp, chatHistoryResponse{
			Id:    chat.Id,
			Title: chat.Title,
		})
	}
	return ctx.JSON(200, resp)
}

func (c *AssistantController) handlePrompt(ctx echo.Context) error {
	type chatRequest struct {
		Prompt string `query:"prompt" validate:"required"`
		ChatId int64  `param:"id" validate:"required"`
	}
	var req chatRequest
	if err := BindAndValidate(ctx, &req); err != nil {
		return err
	}

	ctx.Response().Status = http.StatusOK
	ctx.Response().Header().Set("Content-Type", "text/event-stream")
	ctx.Response().Header().Set("X-Accel-Buffering", "no")

	var mu sync.Mutex
	ticker := time.NewTicker(300 * time.Millisecond)
	defer ticker.Stop()
	go func() {
		for {
			select {
			case <-ctx.Request().Context().Done():
				return
			case <-ticker.C:
				mu.Lock()
				_, _ = ctx.Response().Write([]byte("data: {\"content\": \"\", \"stop\": false}\n\n"))
				ctx.Response().Flush()
				mu.Unlock()
			}
		}
	}()

	if _, err := c.assistantService.Chat(Sess(ctx).UserId, req.ChatId, req.Prompt, func(content string) error {
		fmt.Print(content)
		if content == "" {
			return nil
		}
		contentEncoded, err := json.Marshal(map[string]string{"content": content})
		if err != nil {
			return err
		}
		mu.Lock()
		defer mu.Unlock()
		if _, err := ctx.Response().Write([]byte("data: " + string(contentEncoded) + "\n\n")); err != nil {
			return err
		}
		ctx.Response().Flush()
		return err
	}); err != nil {
		return err
	}

	if _, err := ctx.Response().Write([]byte("data: {\"content\": \"\", \"stop\": true}\n\n")); err != nil {
		return err
	}
	ctx.Response().Flush()

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

func (c *AssistantController) handleChatMessages(ctx echo.Context) error {
	type chatMessagesRequest struct {
		ChatId int64 `param:"id" validate:"required"`
	}
	var req chatMessagesRequest
	if err := BindAndValidate(ctx, &req); err != nil {
		return err
	}
	messages, err := c.assistantService.GetChatMessages(Sess(ctx).UserId, req.ChatId)
	if err != nil {
		return err
	}
	type chatMessageResponse struct {
		Id        int64  `json:"id"`
		Role      string `json:"role"`
		Content   string `json:"content"`
		CreatedAt int64  `json:"created_at"`
	}

	resp := make([]chatMessageResponse, 0)
	for _, message := range messages {
		resp = append(resp, chatMessageResponse{
			Id:        message.Id,
			Role:      message.Role,
			Content:   message.Content,
			CreatedAt: message.CreatedAt,
		})
	}

	return ctx.JSON(200, resp)
}
