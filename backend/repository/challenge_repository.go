package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/takiyo0/compfest/backend/model"
	"time"
)

type ChallengeRepository struct {
	db *sqlx.DB
}

func NewChallengeRepository(db *sqlx.DB) *ChallengeRepository {
	return &ChallengeRepository{db: db}
}

func (c *ChallengeRepository) GetAllWeeklyChallenges() ([]model.WeeklyChallenge, error) {
	var challenges []model.WeeklyChallenge
	err := c.db.Select(&challenges, "SELECT * FROM weeklyChallenges")
	if len(challenges) == 0 {
		return []model.WeeklyChallenge{}, nil
	}
	return challenges, err
}

func (c *ChallengeRepository) GetWeeklyChallenge(year int, week int) (*model.WeeklyChallenge, error) {
	var challenge model.WeeklyChallenge
	err := c.db.Get(&challenge, "SELECT * FROM weeklyChallenges WHERE yearTime = ? AND weekTime = ?", year, week)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &challenge, err
}

func (c *ChallengeRepository) GetWeeklyChallengeByChallengeId(challengeId int64) (*model.WeeklyChallenge, error) {
	var challenge model.WeeklyChallenge
	err := c.db.Get(&challenge, "SELECT * FROM weeklyChallenges WHERE id = ?", challengeId)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &challenge, err
}

func (c *ChallengeRepository) GetWeeklyChallengeTopicsByChallengeId(challengeId int64) ([]model.WeeklyQuestionsTopics, error) {
	var topics []model.WeeklyQuestionsTopics
	err := c.db.Select(&topics, "SELECT * FROM weeklyQuestionsTopics WHERE weeklyChallengeId = ?", challengeId)
	if err != nil {
		return nil, err
	}
	fmt.Printf("Count: %d\n")
	if len(topics) == 0 {
		return []model.WeeklyQuestionsTopics{}, nil
	}
	return topics, err
}

func (c *ChallengeRepository) GetWeeklyChallengeLeaderboardFinishedSessionsByChallengeId(challengeId int64) ([]model.WeeklyQuestionsSessions, error) {
	var sessions []model.WeeklyQuestionsSessions
	err := c.db.Select(&sessions, "SELECT * FROM weeklyQuestionsSessions WHERE challengeId = ? AND state = 'FINISHED' AND attempt = 1", challengeId)
	if len(sessions) == 0 {
		return []model.WeeklyQuestionsSessions{}, nil
	}
	return sessions, err
}

func (c *ChallengeRepository) GetUserWeeklyChallengeLeaderboardFinishedSessionsByChallengeIdAndUserId(challengeId int64, userId int64) ([]model.WeeklyQuestionsSessions, error) {
	var sessions []model.WeeklyQuestionsSessions
	err := c.db.Select(&sessions, "SELECT * FROM weeklyQuestionsSessions WHERE challengeId = ? AND userId = ? AND state = 'SUCCESS' AND attempt = 1", challengeId, userId)
	if len(sessions) == 0 {
		return []model.WeeklyQuestionsSessions{}, nil
	}
	return sessions, err
}

func (c *ChallengeRepository) GetUserGroupsByUserId(userId int64) ([]model.ChallengeGroup, error) {
	var groups []model.ChallengeGroup
	var groupMembers []model.ChallengeGroupMembers
	err := c.db.Select(&groupMembers, "SELECT * FROM challengeGroupMembers WHERE userId = ?", userId)

	if err != nil {
		return nil, err
	}

	for _, groupMember := range groupMembers {
		var temp model.ChallengeGroups
		err = c.db.Get(&temp, "SELECT * FROM challengeGroups WHERE id = ?", groupMember.GroupId)
		if err != nil {
			return nil, err
		}
		members, err := c.GetGroupMembersByGroupId(temp.Id)
		if err != nil {
			return nil, err
		}
		finalGroup := model.ChallengeGroup{
			Id:          temp.Id,
			Name:        temp.Name,
			Description: temp.Description,
			CreatedAt:   temp.CreatedAt,
			Members:     members,
		}
		groups = append(groups, finalGroup)
	}
	if len(groups) == 0 {
		return []model.ChallengeGroup{}, nil
	}
	return groups, err
}

func (c *ChallengeRepository) GetGroupMembersByGroupId(groupId int64) ([]model.ChallengeGroupMembers, error) {
	var members []model.ChallengeGroupMembers
	err := c.db.Select(&members, "SELECT * FROM challengeGroupMembers WHERE groupId = ?", groupId)
	if len(members) == 0 {
		return []model.ChallengeGroupMembers{}, nil
	}
	return members, err
}

func (c *ChallengeRepository) GetGroupById(groupId int64) (*model.ChallengeGroup, error) {
	var group model.ChallengeGroups
	var members []model.ChallengeGroupMembers
	err := c.db.Get(&group, "SELECT * FROM challengeGroups WHERE id = ?", groupId)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	err = c.db.Select(&members, "SELECT * FROM challengeGroupMembers WHERE groupId = ?", groupId)
	if err != nil {
		return nil, err
	}
	finalGroup := model.ChallengeGroup{
		Id:          group.Id,
		Name:        group.Name,
		Description: group.Description,
		CreatedAt:   group.CreatedAt,
		Members:     members,
	}

	return &finalGroup, err
}

func (c *ChallengeRepository) ChangeGroupName(groupId int64, name string) error {
	_, err := c.db.Exec("UPDATE challengeGroups SET name = ? WHERE id = ?", name, groupId)
	return err
}

func (c *ChallengeRepository) ChangeGroupDescription(groupId int64, description string) error {
	_, err := c.db.Exec("UPDATE challengeGroups SET description = ? WHERE id = ?", description, groupId)
	return err
}

func (c *ChallengeRepository) CreateNewGroupWithFriend(name string, ownerId int64, friendId int64) (int64, error) {
	res, err := c.db.Exec("INSERT INTO challengeGroups (name, description, createdAt) VALUES (?, ?, ?)", name, "", time.Now().Unix())
	if err != nil {
		return 0, err
	}
	insertId, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}
	_, err = c.db.Exec("INSERT INTO challengeGroupMembers (userid, groupid, isleader) VALUES (?, ?, ?)", ownerId, insertId, true)
	if err != nil {
		return 0, err
	}
	_, err = c.db.Exec("INSERT INTO challengeGroupMembers (userid, groupid, isleader) VALUES (?, ?, ?)", friendId, insertId, false)
	if err != nil {
		return 0, err
	}

	return insertId, nil
}

func (c *ChallengeRepository) DeleteGroup(groupId int64) error {
	_, err := c.db.Exec("DELETE FROM challengeGroupMembers WHERE groupid = ?", groupId)
	if err != nil {
		return err
	}

	_, err = c.db.Exec("DELETE FROM challengeGroups WHERE id = ?", groupId)
	return err
}

func (c *ChallengeRepository) GetUserFromGroupByGroupIdAndUserId(groupId int64, userId int64) (*model.ChallengeGroupMembers, error) {
	var member model.ChallengeGroupMembers
	err := c.db.Get(&member, "SELECT * FROM challengeGroupMembers WHERE groupid = ? AND userid = ?", groupId, userId)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
	}
	return &member, err
}

func (c *ChallengeRepository) AddUserToGroup(groupId int64, userId int64) error {
	existingUser, err := c.GetUserFromGroupByGroupIdAndUserId(groupId, userId)
	if err != nil {
		return err
	}
	if existingUser != nil {
		return nil
	}
	_, err = c.db.Exec("INSERT INTO challengeGroupMembers (groupid, userid, isleader) VALUES (?, ?, ?)", groupId, userId, false)
	return err
}

func (c *ChallengeRepository) RemoveUserFromGroup(groupId int64, userId int64) error {
	_, err := c.db.Exec("DELETE FROM challengeGroupMembers WHERE groupid = ? AND userid = ?", groupId, userId)
	return err
}

func (c *ChallengeRepository) BulkGetUserWeeklyQuestionsSessionsByUserIdsAndGroupId(userIds []int64, groupId int64) ([]model.WeeklyQuestionsSessions, error) {
	var sessions []model.WeeklyQuestionsSessions
	err := c.db.Select(&sessions, "SELECT * FROM weeklyQuestionsSessions WHERE userId IN (?) AND groupId = ?", userIds, groupId)

	if len(sessions) == 0 {
		return []model.WeeklyQuestionsSessions{}, nil
	}
	return sessions, err
}

// not yet used
//func (c *ChallengeRepository) GetTopicsByLanguage(language string) ([]model.WeeklyQuestionsTopics, error) {
//	var topics []model.WeeklyQuestionsTopics
//	err := c.db.Select(&topics, "SELECT * FROM weeklyQuestionsTopics WHERE language = ?", language)
//	if err != nil {
//		return []model.WeeklyQuestionsTopics{}, err
//	}
//
//	if len(topics) == 0 {
//		return []model.WeeklyQuestionsTopics{}, nil
//	}
//	return topics, err
//}

func (c *ChallengeRepository) GetTopicByTopicId(topicId int64) (*model.WeeklyQuestionsTopics, error) {
	var topic model.WeeklyQuestionsTopics
	err := c.db.Get(&topic, "SELECT * FROM weeklyQuestionsTopics WHERE id = ?", topicId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &topic, err
}

func (c *ChallengeRepository) GetWeeklyQuestionIdsByTopicId(topicId int64) ([]int64, error) {
	ids := make([]int64, 0)
	err := c.db.Select(&ids, "SELECT id FROM weeklyQuestions WHERE topicId = ?", topicId)
	return ids, err
}

func (c *ChallengeRepository) GetUserAnsweredQuestionBySessionIdAndQuestionId(sessionId int64, questionId int64) (*model.WeeklyQuestionsAnswers, error) {
	var answer model.WeeklyQuestionsAnswers
	err := c.db.Get(&answer, "SELECT answer FROM weeklyQuestionsAnswers WHERE questionId = ? AND sessionId = ?", questionId, sessionId)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &answer, nil
}

func (c *ChallengeRepository) GetTopicQuestionsByTopicId(topicId int64) ([]model.WeeklyQuestions, error) {
	var questions []model.WeeklyQuestions
	err := c.db.Select(&questions, "SELECT * FROM weeklyQuestions WHERE topicId = ?", topicId)
	if err != nil {
		return nil, err
	}

	if len(questions) == 0 {
		return []model.WeeklyQuestions{}, nil
	}

	return questions, nil
}

func (c *ChallengeRepository) BulkGetUserAnswersByQuestionIds(questionsIds []int64) ([]model.WeeklyQuestionsAnswers, error) {
	if len(questionsIds) == 0 {
		return []model.WeeklyQuestionsAnswers{}, nil
	}
	var answers []model.WeeklyQuestionsAnswers

	for _, questionId := range questionsIds {
		var answer model.WeeklyQuestionsAnswers
		if err := c.db.Get(&answer, "SELECT * FROM weeklyQuestionsAnswers WHERE questionId = ?", questionId); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}
			return nil, fmt.Errorf("something went wrong while gathering question %w", err)
		}
		answers = append(answers, answer)
	}
	return answers, nil
}

func (c *ChallengeRepository) GetSessionsByUserIdAndTopicId(userId int64, topicId int64) ([]model.WeeklyQuestionsSessions, error) {
	var sessions []model.WeeklyQuestionsSessions
	err := c.db.Select(&sessions, "SELECT * FROM weeklyQuestionsSessions WHERE userId = ? AND questionId = ?", userId, topicId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return []model.WeeklyQuestionsSessions{}, nil
		}
		return nil, err
	}
	if len(sessions) == 0 {
		return []model.WeeklyQuestionsSessions{}, nil
	}
	return sessions, nil
}

func (c *ChallengeRepository) GetQuestionSessionByUserId(userId int64, topicId int64, getLatest int) (*model.WeeklyQuestionsSessions, error) {
	var session model.WeeklyQuestionsSessions
	err := c.db.Get(&session, "SELECT * FROM weeklyQuestionsSessions WHERE userId = ? AND questionId = ? AND isLatest = ?", userId, topicId, 1)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &session, err
}

func (c *ChallengeRepository) StartNewQuestionSession(userId int64, topicId int64, attempt int, groupId *int64) (*model.WeeklyQuestionsSessions, error) {
	var session model.WeeklyQuestionsSessions
	println("Making attempt on db ", attempt)
	topic, err := c.GetTopicByTopicId(topicId)
	if err != nil || topic == nil {
		return nil, errors.New("parent topic is not found. unknown question")
	}

	query := "INSERT INTO weeklyQuestionsSessions (userId, questionId, challengeId, attempt, state, isLatest, score, startedAt, finishedAt"
	args := []interface{}{userId, topicId, topic.ChallengeId, attempt, "IN_PROGRESS", true, 0, time.Now().Unix(), 0}

	if groupId != nil {
		query += ", groupId"
		args = append(args, *groupId)
	}

	query += ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?"
	if groupId != nil {
		query += ", ?"
	}
	query += ")"

	res, err := c.db.Exec(query, args...)
	if err != nil {
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	err = c.db.Get(&session, "SELECT * FROM weeklyQuestionsSessions WHERE id = ?", id)
	return &session, err
}

func (c *ChallengeRepository) BulkSetQuestionSessionNotLatestExceptAttemptByUserIdAndTopicId(userId int64, topicId int64, exceptId int64) error {
	println("trying to delete user id ", userId)
	println("trying to delete topic ", topicId)
	println("trying to delete except ", exceptId)
	_, err := c.db.Exec("UPDATE weeklyQuestionsSessions SET isLatest = 0 WHERE userId = ? AND questionId = ? AND id != ?", userId, topicId, exceptId)
	return err
}

func (c *ChallengeRepository) GetQuestionSessionById(id int64) (*model.WeeklyQuestionsSessions, error) {
	var session model.WeeklyQuestionsSessions
	err := c.db.Get(&session, "SELECT * FROM weeklyQuestionsSessions WHERE id = ?", id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &session, err
}

func (c *ChallengeRepository) GetUserAnswerBySessionIdAndQuestionIdAndUserId(sessionId int64, questionId int64, userId int64) (*model.WeeklyQuestionsAnswers, error) {
	var answer model.WeeklyQuestionsAnswers
	if err := c.db.Get(&answer, "SELECT * FROM weeklyQuestionsAnswers WHERE sessionId = ? AND questionId = ? AND userId = ?", sessionId, questionId, userId); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &answer, nil
}

func (c *ChallengeRepository) UpdateUserAnswerBySessionIdAndQuestionIdAndUserId(sessionId int64, questionId int64, userId int64, answer int) error {
	println("session id ", sessionId)
	println("question id ", questionId)
	println("user id ", userId)
	awa, err := c.GetUserAnswerBySessionIdAndQuestionIdAndUserId(sessionId, questionId, userId)
	if err != nil {
		return err
	}
	if awa != nil {
		var err error
		if awa.TimeDone == nil || *awa.TimeDone == 0 {
			timeDone := time.Now().Unix() - awa.FirstAccessTime
			println("updating answer to ", answer)
			_, err = c.db.Exec("UPDATE weeklyQuestionsAnswers SET answer = ?, timeDone = ? WHERE id = ?", answer, timeDone, awa.Id)
		}
		if err != nil {
			return err
		}
		return nil
	} else {
		return errors.New("you cannot answer this question yet")
	}
}

func (c *ChallengeRepository) SetFirstAccessOnQuestionAnswerBySessionIdAndQuestionIdAndUserId(sessionId int64, questionId int64, userId int64) error {
	awa, err := c.GetUserAnswerBySessionIdAndQuestionIdAndUserId(sessionId, questionId, userId)
	if err != nil {
		return err
	}
	if awa == nil {
		_, err := c.db.Exec("INSERT INTO weeklyQuestionsAnswers (userId, questionId, sessionId, answer, timeDone, createdAt, firstAccessTime) VALUES (?, ?, ?, ?, ?, ?, ?)", userId, questionId, sessionId, -1, 0, 0, time.Now().Unix())
		if err != nil {
			return err
		}
		return nil
	}
	return nil
}

func (c *ChallengeRepository) GetWeeklyQuestionByTopicIdAndId(topicId int64, id int64) (*model.WeeklyQuestions, error) {
	var question model.WeeklyQuestions
	if err := c.db.Get(&question, "SELECT * FROM weeklyQuestions WHERE topicId = ? AND id = ?", topicId, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &question, nil
}

func (c *ChallengeRepository) FinishQuestionSession(sessionId int64, userId int64) error {
	score, err := c.CountScoring(sessionId)
	if err != nil {
		return err
	}
	_, err = c.db.Exec("UPDATE weeklyQuestionsSessions SET state = 'FINISHED', finishedAt = ?, score = ? WHERE id = ? AND userId = ?", time.Now().Unix(), score, sessionId, userId)
	return err
}

func (c *ChallengeRepository) GetAnswersBySessionId(sessionId int64) ([]model.WeeklyQuestionsAnswers, error) {
	answers := make([]model.WeeklyQuestionsAnswers, 0)
	err := c.db.Select(&answers, "SELECT * FROM weeklyQuestionsAnswers WHERE sessionId = ?", sessionId)
	return answers, err
}

func (c *ChallengeRepository) BulkGetQuestionsByQuestionIds(questionsIds []int64) ([]model.WeeklyQuestions, error) {
	questions := make([]model.WeeklyQuestions, 0)

	for _, question := range questionsIds {
		var temp model.WeeklyQuestions
		err := c.db.Get(&temp, "SELECT * FROM weeklyQuestions WHERE id = ?", question)
		if err != nil {
			return questions, err
		}

		questions = append(questions, temp)
	}

	return questions, nil
}

func (c *ChallengeRepository) CountScoring(sessionId int64) (int, error) {
	answers, err := c.GetAnswersBySessionId(sessionId)
	if err != nil {
		return 0, err
	}

	questionIds := make([]int64, 0)
	for _, answer := range answers {
		questionIds = append(questionIds, answer.QuestionId)
	}

	questions, err := c.BulkGetQuestionsByQuestionIds(questionIds)
	if err != nil {
		return 0, err
	}

	score := 0
	for i, answer := range answers {
		if answer.TimeDone == nil || answer.Answer == nil {
			continue
		}
		score += calculateScore(int64(questions[i].Point), 360, *answer.TimeDone, *answer.Answer == questions[i].CorrectChoice)
	}

	return score, nil
}

func calculateScore(basePoints, maxTime, timeTaken int64, answerCorrect bool) int {
	if !answerCorrect {
		return 0
	}
	if timeTaken > maxTime {
		return int(basePoints)
	}
	score := float64(basePoints) * (1 + float64(maxTime-timeTaken)/float64(maxTime))
	return int(score)
}
