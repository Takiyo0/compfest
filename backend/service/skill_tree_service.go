package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
	"github.com/takiyo0/compfest/backend/model"
	"github.com/takiyo0/compfest/backend/module/random"
	"github.com/takiyo0/compfest/backend/repository"
	"sort"
	"strconv"
	"sync"
	"time"
)

type SkillTreeService struct {
	log logrus.FieldLogger

	llmService  *LLMService
	userService *UserService

	skillTreeRepository *repository.SkillTreeRepository

	skillTreeGenMu sync.Mutex
}

func NewSkillTreeService(log logrus.FieldLogger, skillTreeRepository *repository.SkillTreeRepository) *SkillTreeService {
	return &SkillTreeService{log: log, skillTreeRepository: skillTreeRepository}
}

func (s *SkillTreeService) SetLLMService(llm *LLMService) {
	s.llmService = llm
}

func (s *SkillTreeService) SetUserService(userService *UserService) {
	s.userService = userService
}

func (s *SkillTreeService) calculateTopics(user model.User) ([]string, error) {
	interviewQuestions, err := s.userService.GetInterviewQuestions(user.ID)
	if err != nil {
		return nil, err
	}

	type topicScore struct {
		Topic string
		Score int
	}

	topicScores := make(map[string]int)
	for _, question := range interviewQuestions {
		if _, ok := topicScores[question.Topic]; !ok {
			topicScores[question.Topic] = 0
		}
		topicScores[question.Topic] += 1
	}

	topicScoresSlice := make([]topicScore, 0, len(topicScores))
	for topic, score := range topicScores {
		topicScoresSlice = append(topicScoresSlice, topicScore{Topic: topic, Score: score})
	}

	sort.Slice(topicScoresSlice, func(i, j int) bool {
		return topicScoresSlice[i].Score < topicScoresSlice[j].Score
	})

	topics := make([]string, 0, len(topicScoresSlice))
	for _, ts := range topicScoresSlice {
		topics = append(topics, ts.Topic)
	}

	return topics, nil
}

func (s *SkillTreeService) GetSkillTreeByUser(user model.User) ([]model.SkillTree, error) {
	s.skillTreeGenMu.Lock()
	defer s.skillTreeGenMu.Unlock()

	if user.InterviewQuestionStatus != model.InterviewQuestionStatusQuestionsFinished {
		return nil, &echo.HTTPError{Code: 400, Message: "interview questions not finished"}
	}

	if user.SkillTreeStatus == model.SkillTreeContentStatusGenerating {
		return nil, errors.New("generating")
	}

	if user.SkillTreeStatus == model.SkillTreeStatusInProgress || user.SkillTreeStatus == model.SkillTreeStatusFinished {
		skillTrees, err := s.skillTreeRepository.FindByUserId(user.ID)
		if err != nil {
			return nil, err
		}
		return skillTrees, nil
	}

	if err := s.userService.SetSkillTreeStatus(user.ID, model.SkillTreeStatusNotReady); err != nil {
		return nil, err
	}

	go func() {
		topics, err := s.calculateTopics(user)
		if err != nil {
			s.log.WithError(err).Error("failed to calculate topics")
			_ = s.userService.SetSkillTreeStatus(user.ID, model.SkillTreeStatusNotStarted)
			return
		}

		skillTrees, err := s.llmService.GenerateSkillTree(topics)
		if err != nil {
			s.log.WithError(err).Error("failed to generate skill tree")
			_ = s.userService.SetSkillTreeStatus(user.ID, model.SkillTreeStatusNotStarted)
			return
		}

		mappedSkillTree := make([]model.SkillTree, 0, len(skillTrees))
		mappedEntries := make([]model.SkillTreeEntry, 0, len(skillTrees))
		for _, skillTree := range skillTrees {
			randomId := random.Int(100000000, 999999999)
			mappedSkillTree = append(mappedSkillTree, model.SkillTree{
				Id:        int64(randomId),
				Title:     skillTree.Category,
				UserId:    user.ID,
				CreatedAt: time.Now().Unix(),
			})
			for _, entry := range skillTree.Entries {
				mappedEntries = append(mappedEntries, model.SkillTreeEntry{
					Title:       entry.Title,
					Description: entry.Description,
					SkillTreeId: int64(randomId),
					CreatedAt:   time.Now().Unix(),
				})
			}
		}

		// TODO: order correctly!
		mappedSkillTree[0].IsRoot = true
		for i := 1; i < len(mappedSkillTree); i++ {
			mappedSkillTree[i-1].ChildSkillTreeIds_ = strconv.Itoa(int(mappedSkillTree[i].Id))
		}

		if err := s.skillTreeRepository.BulkCreate(mappedSkillTree); err != nil {
			s.log.WithError(err).Error("failed to insert skill trees")
			_ = s.userService.SetSkillTreeStatus(user.ID, model.SkillTreeStatusNotStarted)
			return
		}

		if err := s.skillTreeRepository.BulkCreateEntries(mappedEntries); err != nil {
			s.log.WithError(err).Error("failed to insert skill tree entries")
			_ = s.userService.SetSkillTreeStatus(user.ID, model.SkillTreeStatusNotStarted)
			return
		}

		_ = s.userService.SetSkillTreeStatus(user.ID, model.SkillTreeStatusInProgress)
	}()

	return nil, errors.New("generating")
}

func (s *SkillTreeService) GetSkillTreeById(skillTreeId int64) (*model.SkillTree, error) {
	skillTree, err := s.skillTreeRepository.FindById(skillTreeId)
	if err != nil {
		return nil, err
	}
	return skillTree, nil
}

func (s *SkillTreeService) GetFinishedSkillTrees(userId int64) ([]model.SkillTree, error) {
	skillTrees, err := s.skillTreeRepository.FindByUserId(userId)
	if err != nil {
		return nil, err
	}

	finishedSkillTrees := make([]model.SkillTree, 0, len(skillTrees))
	for _, skillTree := range skillTrees {
		if skillTree.Finished {
			finishedSkillTrees = append(finishedSkillTrees, skillTree)
		}
	}

	return finishedSkillTrees, nil
}

func (s *SkillTreeService) GetSkillTreeEntries(skillTreeId int64) ([]model.SkillTreeEntry, error) {
	entries, err := s.skillTreeRepository.FindEntriesBySkillTreeId(skillTreeId)
	if err != nil {
		return nil, err
	}

	return entries, nil
}

func (s *SkillTreeService) GetSkillTreeQuestions(skillTreeId int64) ([]model.SkillTreeQuestion, error) {
	s.skillTreeGenMu.Lock()
	defer s.skillTreeGenMu.Unlock()

	skillTree, err := s.skillTreeRepository.FindById(skillTreeId)
	if err != nil {
		return nil, err
	}

	if skillTree.QuestionStatus == model.SkillTreeQuestionStatusGenerating {
		return nil, errors.New("generating")
	}

	if skillTree.QuestionStatus == model.SkillTreeQuestionStatusInProgress || skillTree.QuestionStatus == model.SkillTreeQuestionStatusSuccess {
		questions, err := s.skillTreeRepository.GetSkillTreeQuestions(skillTreeId)
		if err != nil {
			return nil, err
		}

		return questions, nil
	}

	if err := s.skillTreeRepository.SetSkillTreeQuestionStatus(skillTreeId, model.SkillTreeQuestionStatusGenerating); err != nil {
		return nil, err
	}

	go func() {
		skillTreeEntries, err := s.GetSkillTreeEntries(skillTreeId)
		if err != nil {
			_ = s.skillTreeRepository.SetSkillTreeQuestionStatus(skillTreeId, model.SkillTreeQuestionStatusNotStarted)
			s.log.WithError(err).Error("failed to get skill tree entries")
			return
		}

		mappedQuestions := make([]model.SkillTreeQuestion, 0, len(skillTreeEntries))

		for _, entry := range skillTreeEntries {
			topic := fmt.Sprintf("%s: %s", skillTree.Title, entry.Title)
			questions, err := s.llmService.CreateQuestions(topic, 1)
			if err != nil {
				_ = s.skillTreeRepository.SetSkillTreeQuestionStatus(skillTreeId, model.SkillTreeQuestionStatusNotStarted)
				s.log.WithError(err).Error("failed to create questions")
				return
			}

			firstQ := questions[0]

			encodedChoices, err := json.Marshal(firstQ.Choices)
			if err != nil {
				_ = s.skillTreeRepository.SetSkillTreeQuestionStatus(skillTreeId, model.SkillTreeQuestionStatusNotStarted)
				s.log.WithError(err).Error("failed to encode choices")
				return
			}

			mappedQuestions = append(mappedQuestions, model.SkillTreeQuestion{
				SkillTreeId:   skillTreeId,
				Content:       firstQ.Content,
				Choices_:      string(encodedChoices),
				CorrectChoice: firstQ.CorrectChoice,
				Explanation:   firstQ.AnswerExplanation,
				CreatedAt:     time.Now().Unix(),
			})
		}

		if err := s.skillTreeRepository.BulkCreateQuestions(mappedQuestions); err != nil {
			_ = s.skillTreeRepository.SetSkillTreeQuestionStatus(skillTreeId, model.SkillTreeQuestionStatusNotStarted)
			s.log.WithError(err).Error("failed to insert questions")
			return
		}

		_ = s.skillTreeRepository.SetSkillTreeQuestionStatus(skillTreeId, model.SkillTreeQuestionStatusInProgress)
	}()

	return nil, errors.New("generating")
}

func (s *SkillTreeService) AnswerQuestion(userId, questionId int64, choice int) error {
	question, err := s.skillTreeRepository.FindQuestionById(questionId)
	if err != nil {
		return err
	}

	skillTree, err := s.skillTreeRepository.FindById(question.SkillTreeId)
	if err != nil {
		return err
	}

	if skillTree.UserId != userId {
		return errors.New("invalid user")
	}

	user, err := s.userService.FindUserById(userId)
	if err != nil {
		return err
	}

	if user.SkillTreeStatus != model.SkillTreeStatusInProgress {
		return errors.New("invalid skill tree status")
	}

	choices, err := question.Choices()
	if err != nil {
		return err
	}

	if choice < 0 || choice >= len(choices) {
		return errors.New("invalid choice")
	}

	return s.skillTreeRepository.SetSkillTreeQuestionUserAnswer(questionId, choice)
}

func (s *SkillTreeService) GetAllFinishedQuestions(userId int64) ([]model.SkillTreeQuestion, error) {
	questions, err := s.skillTreeRepository.GetAllFinishedSkillTreeQuestions(userId)
	if err != nil {
		return nil, err
	}
	return questions, nil
}

func (s *SkillTreeService) GetSkillTreeEntryContent(skillTreeEntryId int64) (*string, error) {
	s.skillTreeGenMu.Lock()
	defer s.skillTreeGenMu.Unlock()

	skillTreeEntry, err := s.skillTreeRepository.FindSkillTreeEntryById(skillTreeEntryId)
	if err != nil {
		return nil, err
	}

	switch skillTreeEntry.ContentStatus {
	case model.SkillTreeContentStatusNone:
		if err := s.skillTreeRepository.SetSkillTreeEntryContentStatus(skillTreeEntryId, model.SkillTreeContentStatusGenerating); err != nil {
			return nil, err
		}
		go func() {
			skillTree, err := s.skillTreeRepository.FindById(skillTreeEntry.SkillTreeId)
			if err != nil {
				s.log.WithError(err).Error("failed to find skill tree")
				_ = s.skillTreeRepository.SetSkillTreeEntryContentStatus(skillTreeEntryId, model.SkillTreeContentStatusNone)
				return
			}

			content, err := s.llmService.GenerateSkillTreeEntryContent(*skillTree, *skillTreeEntry)
			if err != nil {
				s.log.WithError(err).Error("failed to generate skill tree entry content")
				_ = s.skillTreeRepository.SetSkillTreeEntryContentStatus(skillTreeEntryId, model.SkillTreeContentStatusNone)
				return
			}
			_ = s.skillTreeRepository.SetSkillTreeEntryContentStatusAndContent(skillTreeEntryId, model.SkillTreeContentStatusGenerated, &content)
		}()
		return nil, errors.New("generating")
	case model.SkillTreeContentStatusGenerating:
		return nil, errors.New("generating")
	case model.SkillTreeContentStatusGenerated:
		return skillTreeEntry.Content, nil
	}

	return nil, errors.New("invalid skill tree entry content status")
}

func (s *SkillTreeService) SetFinished(userId int64, skillTreeId int64) error {
	skillTree, err := s.skillTreeRepository.FindById(skillTreeId)
	if err != nil {
		return err
	}

	if skillTree.UserId != userId {
		return errors.New("invalid user")
	}

	if err := s.skillTreeRepository.SetFinished(skillTreeId); err != nil {
		return err
	}

	return s.skillTreeRepository.SetSkillTreeQuestionStatus(skillTreeId, model.SkillTreeQuestionStatusSuccess)
}
