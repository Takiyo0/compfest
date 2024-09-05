package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/controller/gate"
	"github.com/takiyo0/compfest/backend/service"
	"net/http"
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

	g := e.Group("/tree", authGate)
	g.GET("/archive", c.handleGetArchive)
	g.GET("/", c.handleGetSkillTree)

	gt := g.Group("/:id")
	gt.GET("/questions", c.handleGetQuestions)
	gt.GET("/content", c.handleGetSkillTreeEntryContent)
	gt.POST("/answer-question", c.handleAnswerQuestion)
	gt.POST("/finish", c.handleFinish)
}

func (c *SkillTreeController) handleGetSkillTree(ctx echo.Context) error {
	user, err := c.userService.FindUserById(Sess(ctx).UserId)
	if err != nil {
		return err
	}

	type skillTreeEntryRespType struct {
		Id          int64  `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
	}

	type skillTreeRespType struct {
		Id       int64                    `json:"id"`
		IsRoot   bool                     `json:"isRoot"`
		Name     string                   `json:"name"`
		Entries  []skillTreeEntryRespType `json:"entries"`
		Finished bool                     `json:"finished"`
		Child    []int64                  `json:"child"`
	}

	type respType struct {
		Ready     bool                `json:"ready"`
		SkillTree []skillTreeRespType `json:"skillTree"`
	}

	skillTree, err := c.skillTreeService.GetSkillTree(*user)
	if err != nil {
		if err.Error() == "generating" {
			return ctx.JSON(http.StatusOK, respType{Ready: false, SkillTree: nil})
		}
		return err
	}

	skillTreeResp := make([]skillTreeRespType, 0, len(skillTree))
	for _, st := range skillTree {
		toAppend := skillTreeRespType{
			Id:       st.Id,
			IsRoot:   st.IsRoot,
			Name:     st.Title,
			Finished: st.Finished,
			Child:    st.ChildSkillTreeIds(),
		}

		entries, err := c.skillTreeService.GetSkillTreeEntries(st.Id)
		if err != nil {
			return err
		}

		for _, entry := range entries {
			toAppend.Entries = append(toAppend.Entries, skillTreeEntryRespType{
				Id:          entry.Id,
				Title:       entry.Title,
				Description: entry.Description,
			})
		}

		skillTreeResp = append(skillTreeResp, toAppend)
	}

	return ctx.JSON(http.StatusOK, respType{Ready: true, SkillTree: skillTreeResp})
}

func (c *SkillTreeController) handleGetQuestions(ctx echo.Context) error {
	type reqType struct {
		SkillTreeId int64 `param:"id" validate:"required"`
	}

	type skillTreeQuestionResType struct {
		Id         int64    `json:"id"`
		Content    string   `json:"content"`
		Choices    []string `json:"choices"`
		UserAnswer *int     `json:"userAnswer"`
	}

	type resType struct {
		Ready     bool                       `json:"ready"`
		Questions []skillTreeQuestionResType `json:"questions"`
	}

	var req reqType
	if err := BindAndValidate(ctx, &req); err != nil {
		return err
	}

	questions, err := c.skillTreeService.GetSkillTreeQuestions(req.SkillTreeId)
	if err != nil {
		if err.Error() == "generating" {
			return ctx.JSON(http.StatusOK, &resType{Ready: false})
		}
		return err
	}

	questionsResp := make([]skillTreeQuestionResType, 0, len(questions))
	for _, q := range questions {
		choices, err := q.Choices()
		if err != nil {
			return err
		}

		questionsResp = append(questionsResp, skillTreeQuestionResType{
			Id:         q.Id,
			Content:    q.Content,
			Choices:    choices,
			UserAnswer: q.UserAnswer,
		})
	}

	return ctx.JSON(http.StatusOK, &resType{Ready: true, Questions: questionsResp})
}

func (c *SkillTreeController) handleAnswerQuestion(ctx echo.Context) error {
	type reqType struct {
		QuestionID int64 `json:"questionId" validate:"required"`
		Answer     int   `json:"answer" validate:"required"`
	}

	var req reqType
	if err := BindAndValidate(ctx, &req); err != nil {
		return err
	}

	if err := c.skillTreeService.AnswerQuestion(Sess(ctx).UserId, req.QuestionID, req.Answer); err != nil {
		return err
	}

	return ctx.JSON(http.StatusOK, M("Answered"))
}

func (c *SkillTreeController) handleGetSkillTreeEntryContent(ctx echo.Context) error {
	type reqType struct {
		EntryID int64 `query:"entryId" validate:"required"`
	}

	var req reqType
	if err := BindAndValidate(ctx, &req); err != nil {
		return err
	}

	type respType struct {
		Ready   bool   `json:"ready"`
		Content string `json:"content,omitempty"`
	}

	content, err := c.skillTreeService.GetSkillTreeEntryContent(req.EntryID)
	if err != nil {
		if err.Error() == "generating" {
			return ctx.JSON(http.StatusOK, &respType{Ready: false, Content: ""})
		}
	}

	return ctx.JSON(http.StatusOK, &respType{Ready: true, Content: *content})
}

func (c *SkillTreeController) handleGetArchive(ctx echo.Context) error {
	ret, err := c.skillTreeService.GetAllFinishedQuestions(Sess(ctx).UserId)
	if err != nil {
		return err
	}

	type questionRespType struct {
		Id                int64    `json:"id"`
		Content           string   `json:"content"`
		Choices           []string `json:"choices"`
		UserAnswer        *int     `json:"userAnswer"`
		CorrectAnswer     int      `json:"correctAnswer"`
		AnswerExplanation string   `json:"answerExplanation"`
	}

	mappedQuestions := make([]questionRespType, 0, len(ret))
	for _, q := range ret {
		choices, err := q.Choices()
		if err != nil {
			return err
		}

		mappedQuestions = append(mappedQuestions, questionRespType{
			Id:                q.Id,
			Content:           q.Content,
			Choices:           choices,
			UserAnswer:        q.UserAnswer,
			CorrectAnswer:     q.CorrectChoice,
			AnswerExplanation: q.Explanation,
		})
	}

	return ctx.JSON(http.StatusOK, map[string]any{"questions": mappedQuestions})
}

func (c *SkillTreeController) handleFinish(ctx echo.Context) error {
	type reqType struct {
		SkillTreeId int64 `param:"id" validate:"required"`
	}

	var req reqType
	if err := BindAndValidate(ctx, &req); err != nil {
		return err
	}

	if err := c.skillTreeService.SetFinished(Sess(ctx).UserId, req.SkillTreeId); err != nil {
		return err
	}

	return ctx.JSON(http.StatusOK, M("Finished"))
}