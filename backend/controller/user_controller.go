package controller

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/go-github/v50/github"
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/config"
	"github.com/takiyo0/compfest/backend/controller/gate"
	"github.com/takiyo0/compfest/backend/model"
	"github.com/takiyo0/compfest/backend/module/random"
	"github.com/takiyo0/compfest/backend/service"
	"golang.org/x/oauth2"
	"io"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type UserController struct {
	userService *service.UserService
	oauthCfg    *oauth2.Config
}

type UserRepoCacheEntry struct {
	Data      []Repository
	Timestamp time.Time
}

type Repository struct {
	LanguagesUrl string `json:"languages_url"`
}

var userRepoCache = make(map[string]UserRepoCacheEntry)
var repoLanguagesCache = make(map[string][]string)
var cacheLock sync.RWMutex

const cacheExpiration = time.Hour

func isCacheExpired(entry UserRepoCacheEntry) bool {
	return time.Since(entry.Timestamp) > cacheExpiration
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
	g.GET("/languages", c.handleLanguages, authGate)

	qg := g.Group("/questions", authGate)
	qg.GET("/", c.handleGetQuestions)
	qg.POST("/:id/answer", c.handleAnswerQuestion)

	g.POST("/submit-interview", c.handleSubmitInterview, authGate)
	g.POST("/skill-description", c.handleUpdateSkillDescription, authGate)
	g.POST("/skill-info", c.handleUpdateSkillInfo, authGate)
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
		"token":    base64.StdEncoding.EncodeToString([]byte(authToken)),
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
	skillInfo, err := user.SkillInfo()
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
		"skillInfo":               skillInfo,
		"filledSkillInfo":         user.FilledSkillInfo,
	})
}

func (c *UserController) handleLanguages(ctx echo.Context) error {
	sess := Sess(ctx)
	user, err := c.userService.FindUserById(sess.UserId)
	if err != nil {
		return err
	}

	token := config.Global.GithubToken
	if token == "" {
		return ctx.JSON(http.StatusOK, []string{})
	}

	cacheLock.RLock()
	cachedEntry, found := userRepoCache[user.Name]
	cacheLock.RUnlock()

	var repos []Repository

	if found && !isCacheExpired(cachedEntry) {
		fmt.Printf("cache hit for user repos: %s\n", user.Name)
		repos = cachedEntry.Data
	} else {
		url := fmt.Sprintf("https://api.github.com/users/%s/repos", user.Name)
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return err
		}
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return err
		}
		defer func(Body io.ReadCloser) {
			closeErr := Body.Close()
			if closeErr != nil {
				log.Println(closeErr)
			}
		}(resp.Body)

		log.Println("Repo response status:", resp.StatusCode)

		if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("failed to fetch repos: %s", resp.Status)
		}

		err = json.NewDecoder(resp.Body).Decode(&repos)
		if err != nil {
			return err
		}

		cacheLock.Lock()
		userRepoCache[user.Name] = UserRepoCacheEntry{
			Data:      repos,
			Timestamp: time.Now(),
		}
		cacheLock.Unlock()
	}

	var allLanguages []string
	for _, repo := range repos {
		cacheLock.RLock()
		cachedLanguages, found := repoLanguagesCache[repo.LanguagesUrl]
		cacheLock.RUnlock()

		if found {
			fmt.Printf("Found cached languages for repo: %s\n", repo.LanguagesUrl)
			allLanguages = append(allLanguages, cachedLanguages...)
			continue
		}

		langReq, err := http.NewRequest("GET", repo.LanguagesUrl, nil)
		if err != nil {
			return err
		}
		langReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

		langResp, err := http.DefaultClient.Do(langReq)
		if err != nil {
			return err
		}
		defer func(Body io.ReadCloser) {
			err := Body.Close()
			if err != nil {
				log.Println(err)
			}
		}(langResp.Body)

		if langResp.StatusCode != http.StatusOK {
			log.Printf("Failed to fetch languages for repo: %s, status: %d\n", repo.LanguagesUrl, langResp.StatusCode)
			continue
		}

		var languages map[string]interface{}
		err = json.NewDecoder(langResp.Body).Decode(&languages)
		if err != nil {
			return err
		}

		var langList []string
		for lang := range languages {
			allLanguages = append(allLanguages, lang)
			langList = append(langList, lang)
		}

		cacheLock.Lock()
		repoLanguagesCache[repo.LanguagesUrl] = langList
		cacheLock.Unlock()
	}

	return ctx.JSON(http.StatusOK, allLanguages)
}

func (c *UserController) handleGetQuestions(ctx echo.Context) error {
	user, err := c.userService.FindUserById(Sess(ctx).UserId)
	if err != nil {
		return err
	}
	type questionType struct {
		Id                int64    `json:"id"`
		Content           string   `json:"content"`
		Choices           []string `json:"choices"`
		UserAnswer        *int     `json:"userAnswer"`
		CorrectAnswer     *int     `json:"correctAnswer,omitempty"`
		AnswerExplanation *string  `json:"answerExplanation,omitempty"`
	}
	type respType struct {
		Ready     bool           `json:"ready"`
		Questions []questionType `json:"questions,omitempty"`
	}
	questions, err := c.userService.GetInterviewQuestions(Sess(ctx).UserId)
	if err != nil {
		if errors.Is(err, service.ErrCreatingInterviewQuestions) {
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
		qAppend := questionType{
			Id:         q.Id,
			Content:    q.Content,
			Choices:    choices,
			UserAnswer: q.UserAnswer,
		}
		if user.InterviewQuestionStatus == model.InterviewQuestionStatusQuestionsFinished {
			qAppend.CorrectAnswer = &q.CorrectChoice
			qAppend.AnswerExplanation = &q.Explanation
		}
		questionList = append(questionList, qAppend)
	}
	return ctx.JSON(http.StatusOK, &respType{Ready: true, Questions: questionList})
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

func (c *UserController) handleSubmitInterview(ctx echo.Context) error {
	if err := c.userService.SubmitInterview(Sess(ctx).UserId); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return echo.NewHTTPError(http.StatusBadRequest, "An error occurred. The interview might not be ready yet or has been submitted.")
		}
		return err
	}
	return ctx.JSON(http.StatusOK, M("Submitted"))
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

func (c *UserController) handleUpdateSkillInfo(ctx echo.Context) error {
	var req model.SkillInfo
	if err := BindAndValidate(ctx, &req); err != nil {
		return err
	}

	if err := c.userService.UpdateSkillInfo(Sess(ctx).UserId, req, true); err != nil {
		return err
	}

	return ctx.JSON(http.StatusOK, M("Updated"))
}
