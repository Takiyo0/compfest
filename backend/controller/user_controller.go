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
	"strconv"
)

type UserController struct {
	userService *service.UserService
	oauthCfg    *oauth2.Config
}

func NewUserController(userService *service.UserService, oauthCfg *oauth2.Config) *UserController {
	return &UserController{userService: userService, oauthCfg: oauthCfg}
}

func (c *UserController) SetUp(e *echo.Echo) {
	authGate := gate.Auth(c.userService)

	g := e.Group("/user")
	g.GET("/auth-code", c.handleAuth)
	g.GET("/auth-callback", c.handleAuthCallback)
	g.POST("/logout", c.handleLogout, authGate)
	g.GET("/info", c.handleInfo, authGate)

	qg := g.Group("/questions", authGate)
	qg.GET("/", c.handleGetQuestions)
	qg.POST("/:id/answer", c.handleAnswerQuestion)

	e.POST("/skill-description", c.handleUpdateSkillDescription, authGate)
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
		State string `query:"state" validate:"required"`
		Code  string `query:"code" validate:"required"`
	}
	var req authCallbackRequest
	if err := BindAndValidate(ctx, &req); err != nil {
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
	sess := Sess(ctx)
	if err := c.userService.DeleteSession(sess.Id); err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, M("Logged out"))
}

func (c *UserController) handleInfo(ctx echo.Context) error {
	sess := Sess(ctx)
	user, err := c.userService.FindUserById(sess.UserId)
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, map[string]any{
		"userId":                  sess.UserId,
		"username":                user.Name,
		"createdAt":               user.CreatedAt,
		"skillDescription":        user.SkillDescription,
		"doneInterview":           user.InterviewQuestionStatus == model.InterviewQuestionStatusQuestionsFinished,
		"interviewQuestionStatus": user.InterviewQuestionStatus,
	})
}

func (c *UserController) handleGetQuestions(ctx echo.Context) error {
	type questionType struct {
		Id         int64    `json:"id"`
		Content    string   `json:"content"`
		Choices    []string `json:"choices"`
		UserAnswer *int     `json:"userAnswer"`
	}
	type respType struct {
		Ready     bool           `json:"ready"`
		Questions []questionType `json:"questions,omitempty"`
	}
	questions, err := c.userService.GetInterviewQuestions(Sess(ctx).UserId)
	if err != nil {
		if err == service.ErrCreatingInterviewQuestions {
			return ctx.JSON(http.StatusOK, &respType{Ready: false})
		}
		return err
	}
	questionList := make([]questionType, 0)
	for _, q := range questions {
		choices, err := q.Choices()
		if err != nil {
			return err
		}
		questionList = append(questionList, questionType{
			Id:         q.Id,
			Content:    q.Content,
			Choices:    choices,
			UserAnswer: q.UserAnswer,
		})
	}
	return ctx.JSON(http.StatusOK, questions)
}

func (c *UserController) handleAnswerQuestion(ctx echo.Context) error {
	type answerRequest struct {
		Answer *int `json:"answer" validate:"required"`
	}
	var req answerRequest
	if err := BindAndValidate(ctx, &req); err != nil {
		return err
	}

	questionId, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		return err
	}

	if err := c.userService.AnswerInterviewQuestion(ctx.Get("session").(*model.Session).UserId, int64(questionId), *req.Answer); err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, M("Answered"))
}

func (c *UserController) handleUpdateSkillDescription(ctx echo.Context) error {
	type updateSkillDescriptionRequest struct {
		Description string `json:"description" validate:"max=5000"`
	}
	var req updateSkillDescriptionRequest
	if err := BindAndValidate(ctx, &req); err != nil {
		return err
	}
	if err := c.userService.UpdateSkillDescription(Sess(ctx).UserId, req.Description); err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, M("Updated"))
}
