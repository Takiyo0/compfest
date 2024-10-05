package service

import (
	"errors"
	"fmt"
	"github.com/sirupsen/logrus"
	"github.com/takiyo0/compfest/backend/model"
	"github.com/takiyo0/compfest/backend/repository"
	"math"
	"sort"
	"time"
)

type ChallengeService struct {
	log                 logrus.FieldLogger
	userService         *UserService
	challengeRepository *repository.ChallengeRepository
}

func NewChallengeService(log logrus.FieldLogger, userService *UserService, challengeRepository *repository.ChallengeRepository) *ChallengeService {
	return &ChallengeService{log: log, userService: userService, challengeRepository: challengeRepository}
}

func (c *ChallengeService) SetUserService(userService *UserService) {
	c.userService = userService
}

func (c *ChallengeService) SetChallengeRepository(challengeRepository *repository.ChallengeRepository) {
	c.challengeRepository = challengeRepository
}

type ChallengeInfo struct {
	ServerTime          time.Time
	IsReady             bool
	Week                int
	Topics              []model.WeeklyQuestionsTopics
	Leaderboard         []LeaderboardUser
	UserPoints          int
	UserQuestionsDone   int
	CurrentUserPosition int
}

type LeaderboardUser struct {
	Id          int64
	UserId      int64
	Name        string
	ChallengeId int64
	QuestionIds []int64
	Score       int
	Languages   map[string]int
}

type DetailedTopic struct {
	Id          int64
	Name        string
	Language    string
	Difficulty  string
	ChallengeId int64
	Description string
	Sessions    []model.WeeklyQuestionsSessions
	Questions   []DetailedWeeklyQuestions
}

type DetailedWeeklyQuestions struct {
	Id            int64
	TopicId       int64
	Content       string
	Choices_      string
	Point         int
	UserAnswer    *int
	CorrectChoice *int
	Explanation   *string
}

func (c *ChallengeService) GetCurrentEventInfo(userId int64) (*ChallengeInfo, error) {
	currentYear := time.Now().Year()
	currentWeek := getCurrentWeek()

	weeklyChallenge, err := c.challengeRepository.GetWeeklyChallenge(currentYear, currentWeek)
	if err != nil {
		return nil, err
	}

	topics := make([]model.WeeklyQuestionsTopics, 0)
	leaderboards := make([]LeaderboardUser, 0)
	userPoints := 0
	userQuestionsDone := 0
	userPosition := 0

	if weeklyChallenge != nil {
		topics, err = c.challengeRepository.GetWeeklyChallengeTopicsByChallengeId(weeklyChallenge.Id)
		if err != nil {
			return nil, err
		}

		leaderboards, userPosition, err = c.GetLeaderboard(weeklyChallenge.Id, userId)
		if err != nil {
			return nil, err
		}

		userPoints, userQuestionsDone, err = c.GetUserStatistics(weeklyChallenge.Id, userId)
		if err != nil {
			return nil, err
		}
	}

	return &ChallengeInfo{
		ServerTime:          time.Now(),
		IsReady:             weeklyChallenge != nil,
		Week:                currentWeek,
		Topics:              topics,
		Leaderboard:         leaderboards,
		UserPoints:          userPoints,
		UserQuestionsDone:   userQuestionsDone,
		CurrentUserPosition: userPosition,
	}, nil
}

func (c *ChallengeService) GetPreviousEventInfo(year int, week int, userId int64) (*ChallengeInfo, error) {
	challenge, err := c.challengeRepository.GetWeeklyChallenge(year, week)
	if err != nil {
		return nil, err
	}

	topics := make([]model.WeeklyQuestionsTopics, 0)
	leaderboards := make([]LeaderboardUser, 0)
	userPoints := 0
	userQuestionsDone := 0
	userPosition := 0
	if challenge != nil {
		topics, err = c.challengeRepository.GetWeeklyChallengeTopicsByChallengeId(challenge.Id)
		if err != nil {
			return nil, err
		}

		leaderboards, userPosition, err = c.GetLeaderboard(challenge.Id, userId)
		if err != nil {
			return nil, err
		}

		userPoints, userQuestionsDone, err = c.GetUserStatistics(challenge.Id, userId)
	}

	return &ChallengeInfo{
		ServerTime:          time.Now(),
		IsReady:             challenge != nil,
		Week:                week,
		Topics:              topics,
		Leaderboard:         leaderboards,
		UserPoints:          userPoints,
		UserQuestionsDone:   userQuestionsDone,
		CurrentUserPosition: userPosition,
	}, nil
}

func (c *ChallengeService) GetUserJoinedGroups(userId int64) ([]model.ChallengeGroup, error) {
	return c.challengeRepository.GetUserGroupsByUserId(userId)
}

func (c *ChallengeService) CreateNewGroup(name string, userId int64, friendId int64) (int64, error) {
	return c.challengeRepository.CreateNewGroupWithFriend(name, userId, friendId)
}

func (c *ChallengeService) GetTopicInfo(topicId int64, userId int64) (*DetailedTopic, error) {
	topicData, err := c.challengeRepository.GetTopicByTopicId(topicId)
	if err != nil || topicData == nil {
		return nil, errors.New("topic not found")
	}

	eventData, err := c.challengeRepository.GetWeeklyChallengeByChallengeId(topicData.ChallengeId)
	if err != nil || eventData == nil {
		return nil, errors.New("event is not available. possible that this topic is left behind")
	}

	questions, err := c.challengeRepository.GetTopicQuestionsByTopicId(topicId)
	if err != nil || len(questions) == 0 {
		return nil, errors.New("questions are not available. either the topic is currently generating or the questions are not available")
	}

	questionIds := make([]int64, 0)
	for _, question := range questions {
		questionIds = append(questionIds, question.Id)
	}

	userAnswers, err := c.challengeRepository.BulkGetUserAnswersByQuestionIds(questionIds)
	if err != nil {
		return nil, err
	}

	sessions, err := c.challengeRepository.GetSessionsByUserIdAndTopicId(userId, topicData.Id)
	// print userid, questionids, and sessions len
	println(userId, questionIds, len(sessions))
	if err != nil {
		return nil, err
	}

	fmt.Print("questions count: ", len(questions))

	var customizedQuestions []DetailedWeeklyQuestions
	for _, question := range questions {
		var correctChoice *int = nil
		var explanation *string = nil
		var userAnswer *int = nil
		for _, userAnswer := range userAnswers {
			if userAnswer.UserId == userId && userAnswer.QuestionId == question.Id {
				//userAnswer = userAnswer.Answer
				break
			}
		}
		for _, session := range sessions {
			if session.UserId == userId && session.QuestionId == question.Id && session.IsLatest {
				correctChoice = &question.CorrectChoice
				explanation = &question.Explanation
			}
		}

		customizedQuestions = append(customizedQuestions, DetailedWeeklyQuestions{
			Id:            question.Id,
			TopicId:       question.TopicId,
			Content:       question.Content,
			Choices_:      question.Choices_,
			UserAnswer:    userAnswer,
			CorrectChoice: correctChoice,
			Explanation:   explanation,
			Point:         question.Point,
		})
	}

	return &DetailedTopic{
		Id:          topicData.Id,
		Name:        topicData.Name,
		Language:    topicData.Language,
		Difficulty:  topicData.Difficulty,
		ChallengeId: topicData.ChallengeId,
		Description: topicData.Description,
		Questions:   customizedQuestions,
		Sessions:    sessions,
	}, nil
}

func (c *ChallengeService) GetLeaderboard(challengeId int64, userId int64) ([]LeaderboardUser, int, error) {
	sessions, err := c.challengeRepository.GetWeeklyChallengeLeaderboardFinishedSessionsByChallengeId(challengeId)
	if err != nil {
		return nil, 0, err
	}

	leaderboard := make([]LeaderboardUser, 0)

	for _, session := range sessions {
		user, err := c.userService.FindUserById(session.UserId)
		username := "Unknown Error"
		if err == nil && user != nil {
			username = user.Name
		}

		topic, err := c.challengeRepository.GetTopicByTopicId(session.QuestionId)
		if err != nil {
			return nil, 0, err
		}

		userFound := false
		for i, lbUser := range leaderboard {
			if lbUser.Id == session.UserId {
				leaderboard[i].QuestionIds = append(leaderboard[i].QuestionIds, session.QuestionId)

				leaderboard[i].Languages[topic.Language]++
				leaderboard[i].Score += session.Score
				userFound = true
				break
			}
		}

		if !userFound {
			leaderboard = append(leaderboard, LeaderboardUser{
				Id:          session.UserId,
				Name:        username,
				UserId:      session.UserId,
				ChallengeId: challengeId,
				QuestionIds: []int64{session.QuestionId},
				Score:       session.Score,
				Languages:   map[string]int{topic.Language: 1},
			})
		}
	}

	userPosition := 0

	sort.Slice(leaderboard, func(i, j int) bool {
		return leaderboard[i].Score > leaderboard[j].Score
	})
	if len(leaderboard) > 10 {
		leaderboard = leaderboard[:10]
	}

	for i, libUser := range leaderboard {
		if libUser.UserId == userId {
			userPosition = i
			break
		}
	}
	return leaderboard, userPosition, nil
}

func (c *ChallengeService) GetGroupLeaderboard(groupId int64, userId int64) ([]LeaderboardUser, int, error) {
	members, err := c.challengeRepository.GetGroupMembersByGroupId(groupId)
	if err != nil || len(members) == 0 {
		return nil, 0, err
	}

	sessions, err := c.challengeRepository.BulkGetUserWeeklyQuestionsSessionsByUserIdsAndGroupId([]int64{members[0].UserId}, groupId)
	if err != nil {
		return nil, 0, err
	}

	leaderboard := make([]LeaderboardUser, 0)

	for _, session := range sessions {
		user, err := c.userService.FindUserById(session.UserId)
		if err != nil {
			return nil, 0, err
		}

		for j, lbUser := range leaderboard {
			if lbUser.Id == session.UserId {
				leaderboard[j].Score += session.Score
				leaderboard[j].QuestionIds = append(leaderboard[j].QuestionIds, session.QuestionId)
				break
			}
		}

		leaderboard = append(leaderboard, LeaderboardUser{
			Id:          session.Id,
			UserId:      user.ID,
			Name:        user.Name,
			ChallengeId: groupId,
			QuestionIds: []int64{session.QuestionId},
			Score:       session.Score,
		})
	}

	userPosition := 0

	sort.Slice(leaderboard, func(i, j int) bool {
		return leaderboard[i].Score > leaderboard[j].Score
	})

	for i, libUser := range leaderboard {
		if libUser.UserId == userId {
			userPosition = i
		}
	}

	return leaderboard, userPosition, nil
}

func (c *ChallengeService) GetUserStatistics(challengeId int64, userId int64) (int, int, error) {
	sessions, err := c.challengeRepository.GetUserWeeklyChallengeLeaderboardFinishedSessionsByChallengeIdAndUserId(challengeId, userId)
	if err != nil {
		return 0, 0, err
	}
	points := 0
	for _, session := range sessions {
		points += session.Score
	}
	return len(sessions), points, nil
}

func getCurrentWeek() int {
	now := time.Now()
	startOfYear := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
	daysSinceStart := now.Sub(startOfYear).Hours() / 24

	week := int(math.Ceil((daysSinceStart + float64(startOfYear.Weekday())) / 7))

	if week < 2 {
		week = 1
	}

	return week
}
