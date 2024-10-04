package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/controller/gate"
	"github.com/takiyo0/compfest/backend/model"
	"github.com/takiyo0/compfest/backend/repository"
	"github.com/takiyo0/compfest/backend/service"
	"net/http"
	"strconv"
)

type ChallengeController struct {
	userService         *service.UserService
	challengeService    *service.ChallengeService
	challengeRepository *repository.ChallengeRepository
}

func NewChallengeController(userService *service.UserService, challengeService *service.ChallengeService, challengeRepository *repository.ChallengeRepository) *ChallengeController {
	return &ChallengeController{userService: userService, challengeService: challengeService, challengeRepository: challengeRepository}
}

func (c *ChallengeController) SetUp(e *echo.Echo) {
	authGate := gate.Auth(c.userService)
	g := e.Group("/challenge", authGate)

	cur := g.Group("/current")            // /challenge/current
	cur.GET("/info", c.handleCurrentInfo) // get current event info. Done

	pre := g.Group("/previous/:year/:week") // /challenge/previous
	pre.GET("/info", c.handlePreviousInfo)  // get previous event info. Done
	//
	gr := g.Group("/group")                         // /challenge/group
	gr.GET("/", c.handleGetUserJoinedGroups)        // get joined groups without leaderboard
	gr.POST("/", c.handleCreateGroupChallenge)      // create new group with friendId
	gr.GET("/:id", c.handleGetGroupChallenge)       // get group with the leaderboard
	gr.PUT("/:id", c.handleUpdateGroupChallenge)    // update group's name or description
	gr.DELETE("/:id", c.handleDeleteGroupChallenge) // delete a group. must be a leader to use this endpoint
	//
	ug := gr.Group("/user")                                 // /challenge/group/user
	ug.PUT("/:id", c.handleAddUserToGroupChallenge)         // add user to group. anyone can invite
	ug.DELETE("/:id", c.handleDeleteUserFromGroupChallenge) // remove user from group. must be a leader

	mat := g.Group("/topic")                                        // /challenge/topic
	mat.POST("/:topicId/question/:questionId", c.handleGetQuestion) // /challenge/topic/1/question/1
	mat.GET("/:id/info", c.handleGetTopicChallenge)                 // /challenge/topic/1/info
	mat.POST("/:id/start-session", c.handleStartNewSession)         // /challenge/topic/1/start-session
	mat.POST("/:id/answer-question", c.handleAnswerQuestion)
	mat.POST("/:id/finish", c.handleFinish)
}

func (c *ChallengeController) handleCurrentInfo(ctx echo.Context) error {
	sess := Sess(ctx)
	info, err := c.challengeService.GetCurrentEventInfo(sess.UserId)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"serverTime":          info.ServerTime,
		"isReady":             info.IsReady,
		"week":                info.Week,
		"topics":              info.Topics,
		"leaderboard":         info.Leaderboard,
		"userPoints":          info.UserPoints,
		"userDone":            info.UserQuestionsDone,
		"currentUserPosition": info.CurrentUserPosition,
	})
}

func (c *ChallengeController) handlePreviousInfo(ctx echo.Context) error {
	sess := Sess(ctx)
	year, err := strconv.Atoi(ctx.Param("year"))
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}
	week, err := strconv.Atoi(ctx.Param("week"))
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	info, err := c.challengeService.GetPreviousEventInfo(year, week, sess.UserId)
	if err != nil {
		return err
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"serverTime":          info.ServerTime,
		"isAvailable":         info.IsReady,
		"week":                info.Week,
		"topics":              info.Topics,
		"leaderboard":         info.Leaderboard,
		"userPoints":          info.UserPoints,
		"userDone":            info.UserQuestionsDone,
		"currentUserPosition": info.CurrentUserPosition,
	})
}

func (c *ChallengeController) handleGetUserJoinedGroups(ctx echo.Context) error {
	sess := Sess(ctx)
	groups, err := c.challengeRepository.GetUserGroupsByUserId(sess.UserId)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, groups)
}

func (c *ChallengeController) handleGetGroupChallenge(ctx echo.Context) error {
	sess := Sess(ctx)
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	group, err := c.challengeRepository.GetGroupById(id)
	if err != nil || group == nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": "The group does not exist",
		})
	}

	isMember := false
	for _, member := range group.Members {
		if member.UserId == sess.UserId {
			isMember = true
			break
		}
	}

	if !isMember {
		return ctx.JSON(http.StatusForbidden, map[string]any{
			"message": "You are not a member of this group",
		})
	}

	var userPosition int
	var leaderboard []service.LeaderboardUser
	leaderboard, userPosition, err = c.challengeService.GetGroupLeaderboard(id, sess.UserId)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": "Failed to get group leaderboard. Please try again later",
		})
	}

	var detailedMembers []model.DetailedGroupMembers
	for _, member := range group.Members {
		user, err := c.userService.FindUserById(member.UserId)
		if err != nil {
			return err
		}
		points := 0
		var questionsDone []int64
		for _, session := range leaderboard {
			if session.UserId == member.UserId {
				points = session.Score
				questionsDone = session.QuestionIds
			}
		}

		detailedMembers = append(detailedMembers, model.DetailedGroupMembers{
			Id:             member.Id,
			GroupId:        member.GroupId,
			UserId:         member.UserId,
			IsLeader:       member.IsLeader,
			Username:       user.Name,
			PointsThisWeek: points,
			QuestionsDone:  questionsDone,
		})
	}

	if len(leaderboard) > 10 {
		leaderboard = leaderboard[:10]
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"id":                  group.Id,
		"name":                group.Name,
		"description":         group.Description,
		"members":             detailedMembers,
		"createdAt":           group.CreatedAt,
		"currentUserPosition": userPosition,
		"leaderboard":         leaderboard,
	})
}

func (c *ChallengeController) handleUpdateGroupChallenge(ctx echo.Context) error {
	sess := Sess(ctx)
	var reqType struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	if err := ctx.Bind(&reqType); err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	if reqType.Name == "" && reqType.Description == "" {
		return ctx.JSON(http.StatusBadRequest, map[string]any{
			"message": "Name or description cannot be empty",
		})
	}

	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	group, err := c.challengeRepository.GetGroupById(id)
	if err != nil || group == nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": "The group does not exist",
		})
	}

	isMember := false
	isLeader := false
	for _, member := range group.Members {
		if member.UserId == sess.UserId {
			isMember = true
			isLeader = member.IsLeader
			break
		}
	}

	if !isMember {
		return ctx.JSON(http.StatusForbidden, map[string]any{
			"message": "You are not a member of this group",
		})
	}

	if !isLeader {
		return ctx.JSON(http.StatusForbidden, map[string]any{
			"message": "You are not the leader of this group",
		})
	}

	if reqType.Name != "" {
		if err := c.challengeRepository.ChangeGroupName(id, reqType.Name); err != nil {
			return ctx.JSON(http.StatusInternalServerError, map[string]any{
				"message": err.Error(),
			})
		}
	}
	if reqType.Description != "" {
		if err := c.challengeRepository.ChangeGroupDescription(id, reqType.Description); err != nil {
			return ctx.JSON(http.StatusInternalServerError, map[string]any{
				"message": err.Error(),
			})
		}
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"id": id,
	})
}

func (c *ChallengeController) handleCreateGroupChallenge(ctx echo.Context) error {
	sess := Sess(ctx)
	var reqType struct {
		FriendId int64  `json:"friendId"`
		Name     string `json:"name"`
	}

	if err := ctx.Bind(&reqType); err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": "Invalid request body",
		})
	}

	if reqType.FriendId == 0 || reqType.Name == "" {
		return ctx.JSON(http.StatusBadRequest, map[string]any{
			"message": "Friend id and name cannot be empty",
		})
	}

	targetUser, err := c.userService.FindUserById(reqType.FriendId)
	if targetUser == nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": "Your friend does not exist",
		})
	}

	id, err := c.challengeService.CreateNewGroup(reqType.Name, sess.UserId, reqType.FriendId)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"groupId": id,
	})
}

func (c *ChallengeController) handleDeleteGroupChallenge(ctx echo.Context) error {
	sess := Sess(ctx)
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusForbidden, map[string]any{
			"message": "Invalid group id",
		})
	}

	group, err := c.challengeRepository.GetGroupById(id)
	if err != nil || group == nil {
		return ctx.JSON(http.StatusForbidden, map[string]any{
			"message": "The group does not exist",
		})
	}

	isMember := false
	isLeader := false
	for _, member := range group.Members {
		if member.UserId == sess.UserId {
			isMember = true
			isLeader = member.IsLeader
			break
		}
	}

	if !isMember {
		return ctx.JSON(http.StatusForbidden, map[string]any{
			"message": "You are not a member of this group",
		})
	}

	if !isLeader {
		return ctx.JSON(http.StatusForbidden, map[string]any{
			"message": "You are not the leader of this group",
		})
	}

	if err := c.challengeRepository.DeleteGroup(id); err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"groupId": id,
	})
}

func (c *ChallengeController) handleAddUserToGroupChallenge(ctx echo.Context) error {
	sess := Sess(ctx)
	var reqType struct {
		UserId int64 `json:"userId"`
	}

	if err := ctx.Bind(&reqType); err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	targetUser, err := c.userService.FindUserById(reqType.UserId)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}
	if targetUser == nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": "The user does not exist",
		})
	}

	groupId, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	group, err := c.challengeRepository.GetGroupById(groupId)
	if err != nil || group == nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": "The group does not exist",
		})
	}

	isMember := false
	for _, member := range group.Members {
		if member.UserId == sess.UserId {
			isMember = true
			break
		}
	}

	if !isMember {
		return ctx.JSON(http.StatusForbidden, map[string]any{
			"message": "You are not a member of this group",
		})
	}

	if err := c.challengeRepository.AddUserToGroup(groupId, reqType.UserId); err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": "The user is already in the group",
		})
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"groupId": groupId,
		"userId":  reqType.UserId,
	})
}

func (c *ChallengeController) handleDeleteUserFromGroupChallenge(ctx echo.Context) error {
	sess := Sess(ctx)
	var reqType struct {
		UserId int64 `json:"userId"`
	}

	if err := ctx.Bind(&reqType); err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	groupId, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": err.Error(),
		})
	}

	group, err := c.challengeRepository.GetGroupById(groupId)
	if err != nil || group == nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": "The group does not exist",
		})
	}

	isMember := false
	isLeader := false
	for _, member := range group.Members {
		if member.UserId == sess.UserId {
			isMember = true
			isLeader = member.IsLeader
			break
		}
	}

	if !isMember {
		return ctx.JSON(http.StatusForbidden, map[string]any{
			"message": "You are not a member of this group",
		})
	}

	if !isLeader {
		return ctx.JSON(http.StatusForbidden, map[string]any{
			"message": "You are not the leader of this group",
		})
	}

	if err := c.challengeRepository.RemoveUserFromGroup(groupId, reqType.UserId); err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]any{
			"message": "The user is not in the group",
		})
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"groupId": groupId,
		"userId":  reqType.UserId,
	})
}

func (c *ChallengeController) handleGetTopicChallenge(ctx echo.Context) error {
	sess := Sess(ctx)

	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		return err
	}

	topicResult, err := c.challengeService.GetTopicInfo(id, sess.UserId)
	if err != nil {
		return err
	}

	//     "Id": 1,
	//    "Name": "React",
	//    "Language": "JavaScript",
	//    "Difficulty": "EASY",
	//    "ChallengeId": 1,
	//    "Description": "React adalah pustaka JavaScript untuk membangun antarmuka pengguna yang fleksibel dan mudah dipelajari.",
	return ctx.JSON(http.StatusOK, map[string]any{
		"id":          topicResult.Id,
		"name":        topicResult.Name,
		"language":    topicResult.Language,
		"difficulty":  topicResult.Difficulty,
		"challengeId": topicResult.ChallengeId,
		"description": topicResult.Description,
		"sessions":    topicResult.Sessions,
		"questions":   topicResult.Questions,
	})
}

func (c *ChallengeController) handleStartNewSession(ctx echo.Context) error {
	sess := Sess(ctx)

	var reqType struct {
		GroupId *int64 `json:"groupId"`
	}

	if err := ctx.Bind(&reqType); err != nil {
		return err
	}

	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		return err
	}

	topicData, err := c.challengeRepository.GetTopicByTopicId(id)
	if err != nil {
		return err
	}
	if topicData == nil {
		return echo.NewHTTPError(http.StatusNotFound, "topic not found")
	}

	session, err := c.challengeRepository.GetQuestionSessionByUserId(sess.UserId, true)
	if err != nil {
		return err
	}
	sessionExists := session != nil

	if session == nil || session.State == model.QuestionSessionFinished {
		groupId := reqType.GroupId
		session, err = c.challengeRepository.StartNewQuestionSession(sess.UserId, id, 1, groupId)
		if err != nil {
			return err
		}
		err = c.challengeRepository.BulkSetQuestionSessionNotLatestExceptAttemptByUserIdAndTopicId(sess.UserId, id, 1)
		if err != nil {
			return err
		}
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"hasStarted": sessionExists,
		"session":    session,
	})

}

func (c *ChallengeController) handleGetQuestion(ctx echo.Context) error {
	var sess = Sess(ctx)
	var reqType struct {
		SessionId  int64 `json:"sessionId" validate:"required"`
		TopicId    int64 `param:"topicId" validate:"required"`
		QuestionId int64 `param:"questionId" validate:"required"`
	}

	if err := BindAndValidate(ctx, &reqType); err != nil {
		return err
	}

	session, err := c.challengeRepository.GetQuestionSessionById(reqType.SessionId)
	if err != nil {
		return err
	}
	if session == nil {
		return echo.NewHTTPError(http.StatusNotFound, "session not found")
	}

	if session.QuestionId != reqType.QuestionId {
		return echo.NewHTTPError(http.StatusForbidden, "This session is not for this question")
	}

	if session.UserId != sess.UserId {
		return echo.NewHTTPError(http.StatusForbidden, "you are trying to modify another user's session")
	}

	if session.State != model.QuestionSessionInProgress {
		return echo.NewHTTPError(http.StatusForbidden, "You can no longer submit answer on this session")
	}

	question, err := c.challengeRepository.GetWeeklyQuestionByTopicIdAndId(reqType.TopicId, reqType.QuestionId)
	if err != nil {
		return err
	}
	if question == nil {
		return echo.NewHTTPError(http.StatusNotFound, "question not found")
	}

	var userAnswer *int = nil
	ua, err := c.challengeRepository.GetUserAnswerBySessionIdAndQuestionIdAndUserId(reqType.SessionId, reqType.QuestionId, sess.UserId)
	if ua != nil {
		if ua.Answer != nil && *ua.Answer > 0 {
			userAnswer = ua.Answer
		}
	}
	err = c.challengeRepository.SetFirstAccessOnQuestionAnswerBySessionIdAndQuestionIdAndUserId(reqType.SessionId, reqType.QuestionId, sess.UserId)
	if err != nil {
		return err
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"content":    question.Content,
		"choices":    question.Choices_,
		"point":      question.Point,
		"userAnswer": userAnswer,
	})

}

func (c *ChallengeController) handleAnswerQuestion(ctx echo.Context) error {
	sess := Sess(ctx)

	var reqType struct {
		Answer    int   `json:"answer"`
		SessionId int64 `json:"sessionId"`
	}

	if err := ctx.Bind(&reqType); err != nil {
		return err
	}

	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		return err
	}

	session, err := c.challengeRepository.GetQuestionSessionById(reqType.SessionId)
	if err != nil {
		return err
	}
	if session == nil {
		return echo.NewHTTPError(http.StatusNotFound, "session not found")
	}

	if session.QuestionId != id {
		return echo.NewHTTPError(http.StatusForbidden, "This session is not for this question")
	}

	if session.UserId != sess.UserId {
		return echo.NewHTTPError(http.StatusForbidden, "you are trying to modify another user's session")
	}

	if session.State != model.QuestionSessionInProgress {
		return echo.NewHTTPError(http.StatusForbidden, "You can no longer submit answer on this session")
	}

	err = c.challengeRepository.UpdateUserAnswerBySessionIdAndQuestionIdAndUserId(reqType.SessionId, id, sess.UserId, reqType.Answer)
	if err != nil {
		return echo.NewHTTPError(http.StatusForbidden, "You cannot answer this question yet")
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"message": "success",
	})
}

func (c *ChallengeController) handleFinish(ctx echo.Context) error {
	sess := Sess(ctx)
	var reqType struct {
		SessionId int64 `json:"sessionId" validate:"required"`
		Id        int64 `param:"id" validate:"required"`
	}

	if err := ctx.Bind(&reqType); err != nil {
		return err
	}

	session, err := c.challengeRepository.GetQuestionSessionById(reqType.SessionId)
	if err != nil {
		return err
	}
	if session == nil {
		return echo.NewHTTPError(http.StatusNotFound, "session not found")
	}

	if session.UserId != sess.UserId {
		return echo.NewHTTPError(http.StatusForbidden, "you are trying to modify another user's session")
	}

	if session.State != model.QuestionSessionInProgress {
		return echo.NewHTTPError(http.StatusForbidden, "You can no longer submit answer on this session")
	}

	questions, err := c.challengeRepository.GetTopicQuestionsByTopicId(session.QuestionId)
	if err != nil {
		return err
	}

	if len(questions) == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "question not found")
	}

	questionIds := make([]int64, 0)
	for _, question := range questions {
		questionIds = append(questionIds, question.Id)
	}
	answers, err := c.challengeRepository.BulkGetUserAnswersByQuestionIds(questionIds)
	if err != nil {
		return err
	}

	if len(answers) == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "answers not found")
	}

	if len(answers) != len(questions) {
		return echo.NewHTTPError(http.StatusForbidden, "You have not answered all questions")
	}

	err = c.challengeRepository.FinishQuestionSession(reqType.SessionId, sess.UserId)
	if err != nil {
		return err
	}

	return ctx.JSON(http.StatusOK, map[string]any{
		"message": "success",
	})
}
