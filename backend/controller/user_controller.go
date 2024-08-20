package controller

import (
	"context"
	"github.com/google/go-github/v50/github"
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/controller/gate"
	"github.com/takiyo0/compfest/backend/model"
	"github.com/takiyo0/compfest/backend/module/random"
	"github.com/takiyo0/compfest/backend/service"
	"golang.org/x/oauth2"
	"net/http"
)

type UserController struct {
	userService *service.UserService
	oauthCfg    *oauth2.Config
}

func NewUserController(userService *service.UserService, oauthCfg *oauth2.Config) *UserController {
	return &UserController{userService: userService, oauthCfg: oauthCfg}
}

func (c *UserController) SetUp(e *echo.Echo) {
	g := e.Group("/user")
	g.GET("/auth-code", c.handleAuth)
	g.POST("/auth-callback", c.handleAuthCallback)
	g.POST("/logout", c.handleLogout, gate.Auth(c.userService))
	g.GET("/info", c.handleInfo, gate.Auth(c.userService))
}

func (c *UserController) handleAuth(ctx echo.Context) error {
	state := random.String(40)
	return ctx.JSON(http.StatusOK, map[string]string{
		"loginUrl": c.oauthCfg.AuthCodeURL(state, oauth2.AccessTypeOffline),
		"state":    state,
	})
}

func (c *UserController) handleAuthCallback(ctx echo.Context) error {
	type authCallbackRequest struct {
		State string `json:"state" validate:"required"`
		Code  string `json:"code" validate:"required"`
	}
	var req authCallbackRequest
	if err := ctx.Bind(&req); err != nil {
		return err
	}
	token, err := c.oauthCfg.Exchange(context.Background(), req.Code)
	if err != nil {
		return err
	}

	client := github.NewClient(c.oauthCfg.Client(context.Background(), token))
	githubUser, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return err
	}

	authToken, err := c.userService.CreateToken(githubUser)
	if err != nil {
		return err
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"token":    authToken,
		"username": githubUser.GetName(),
		"userId":   githubUser.GetID(),
	})
}

func (c *UserController) handleLogout(ctx echo.Context) error {
	sess := ctx.Get("session").(*model.Session)
	if err := c.userService.DeleteSession(sess.Id); err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, M("Logged out"))
}

func (c *UserController) handleInfo(ctx echo.Context) error {
	sess := ctx.Get("session").(*model.Session)
	user, err := c.userService.FindUserById(sess.UserId)
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, map[string]any{
		"userId":    sess.UserId,
		"username":  user.Name,
		"createdAt": user.CreatedAt,
	})
}
