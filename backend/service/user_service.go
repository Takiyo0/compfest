package service

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/go-github/v50/github"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
	"github.com/takiyo0/compfest/backend/model"
	"github.com/takiyo0/compfest/backend/module/random"
	"github.com/takiyo0/compfest/backend/repository"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type UserService struct {
	log logrus.FieldLogger

	userRepository              *repository.UserRepository
	sessionRepository           *repository.SessionRepository
	interviewQuestionRepository *repository.InterviewQuestionRepository

	llmService *LLMService
}

var (
	ErrCreatingInterviewQuestions = errors.New("creating questions")
)

func NewUserService(log logrus.FieldLogger, userRepository *repository.UserRepository, sessionRepository *repository.SessionRepository, interviewQuestionRepository *repository.InterviewQuestionRepository) *UserService {
	return &UserService{
		log:                         log,
		userRepository:              userRepository,
		sessionRepository:           sessionRepository,
		interviewQuestionRepository: interviewQuestionRepository,
	}
}

func (s *UserService) SetLLMService(llmService *LLMService) {
	s.llmService = llmService
}

func (s *UserService) CreateToken(githubUser *github.User) (string, error) {
	user, err := s.userRepository.FindById(githubUser.GetID())
	if err != nil {
		if err != sql.ErrNoRows {
			return "", err
		}
		if _, err := s.userRepository.Register(githubUser); err != nil {
			return "", fmt.Errorf("failed to register user: %w", err)
		}
		user, err = s.userRepository.FindById(githubUser.GetID())
		if err != nil {
			return "", fmt.Errorf("failed to find user after registration: %w", err)
		}
	}

	tok := random.String(64)
	sessionId, err := s.sessionRepository.Create(user.ID, tok, time.Hour*24*30)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%d:%s", sessionId, tok), nil
}

func (s *UserService) GetSessionByToken(token string) (*model.Session, error) {
	unparsedTokenId, tok, found := strings.Cut(token, ":")
	if !found {
		return nil, &echo.HTTPError{Code: 400, Message: "Invalid token format"}
	}

	tokenId, _ := strconv.Atoi(unparsedTokenId)
	if tokenId == 0 {
		return nil, &echo.HTTPError{Code: 400, Message: "Invalid token id"}
	}

	session, err := s.sessionRepository.FindById(int64(tokenId))
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, &echo.HTTPError{Code: 401, Message: "Invalid token"}
		}
		return nil, err
	}

	if session.Token != tok {
		return nil, &echo.HTTPError{Code: 401, Message: "Invalid token"}
	}

	if time.Now().Unix() > session.ExpiresAt {
		_ = s.sessionRepository.Delete(session.Id)
		return nil, &echo.HTTPError{Code: 401, Message: "Token expired"}
	}

	return session, nil
}

func (s *UserService) FindUserById(userId int64) (*model.User, error) {
	return s.userRepository.FindById(userId)
}

func (s *UserService) DeleteSession(sessionId int64) error {
	return s.sessionRepository.Delete(sessionId)
}

func (s *UserService) GetInterviewQuestions(userId int64) ([]model.InterviewQuestion, error) {
	user, err := s.FindUserById(userId)
	if err != nil {
		return nil, err
	}
	switch user.InterviewQuestionStatus {
	case model.InterviewQuestionStatusNotStarted:
		_ = s.userRepository.SetInterviewQuestionStatus(userId, model.InterviewQuestionStatusQuestionsNotReady)
		go func() {
			if err := s.generateInterviewQuestions(*user); err != nil {
				_ = s.userRepository.SetInterviewQuestionStatus(userId, model.InterviewQuestionStatusNotStarted)
				s.log.WithError(err).Error("failed to generate interview questions")
			}
		}()
		return nil, ErrCreatingInterviewQuestions
	case model.InterviewQuestionStatusQuestionsNotReady:
		return nil, ErrCreatingInterviewQuestions
	case model.InterviewQuestionStatusInProgress, model.InterviewQuestionStatusQuestionsFinished:
		questions, err := s.interviewQuestionRepository.FindAllByUserId(userId)
		if err != nil {
			return nil, err
		}
		return questions, nil
	}
	return nil, errors.New("invalid interview question status")
}

func (s *UserService) generateInterviewQuestions(user model.User) error {
	topics, err := s.GetInterviewQuestionTopics(user)
	if err != nil {
		return fmt.Errorf("failed to get interview question topics: %w", err)
	}
	mappedQuestions := make([]model.InterviewQuestion, 0)
	for _, topic := range topics {
		questions, err := s.llmService.CreateQuestions(topic, 1) // TODO: increase this when LLM is faster
		if err != nil {
			return fmt.Errorf("failed to create questions for topic %s: %w", topic, err)
		}
		for _, question := range questions {
			serializedChoices, err := json.Marshal(question.Choices)
			if err != nil {
				return fmt.Errorf("failed to serialize choices for question: %w", err)
			}
			mappedQuestions = append(mappedQuestions, model.InterviewQuestion{
				UserId:        user.ID,
				Topic:         topic,
				Content:       question.Content,
				Choices_:      string(serializedChoices),
				CorrectChoice: question.CorrectChoice,
				CreatedAt:     time.Now().Unix(),
				Explanation:   question.AnswerExplanation,
			})
		}
	}
	if err := s.interviewQuestionRepository.InsertQuestions(mappedQuestions, user.ID); err != nil {
		return fmt.Errorf("failed to insert questions: %w", err)
	}
	if err := s.userRepository.SetInterviewQuestionStatus(user.ID, model.InterviewQuestionStatusInProgress); err != nil {
		return fmt.Errorf("failed to set interview question status: %w", err)
	}
	return nil
}

func (s *UserService) AnswerInterviewQuestion(userId int64, questionId int64, answer int) error {
	user, err := s.FindUserById(userId)
	if err != nil {
		return err
	}
	switch user.InterviewQuestionStatus {
	case model.InterviewQuestionStatusNotStarted, model.InterviewQuestionStatusQuestionsNotReady:
		return &echo.HTTPError{Code: http.StatusBadRequest, Message: "Interview questions not ready"}
	case model.InterviewQuestionStatusQuestionsFinished:
		return &echo.HTTPError{Code: http.StatusBadRequest, Message: "Interview questions finished"}
	}

	question, err := s.interviewQuestionRepository.FindById(questionId)
	if err != nil {
		return err
	}
	if question.UserId != userId {
		return &echo.HTTPError{Code: http.StatusForbidden, Message: "You don't have permission to answer this question"}
	}
	if question.UserAnswer != nil {
		return &echo.HTTPError{Code: http.StatusBadRequest, Message: "Question already answered"}
	}
	choices, err := question.Choices()
	if err != nil {
		return fmt.Errorf("failed to parse choices for question %d: %w", questionId, err)
	}
	if answer < 0 || answer >= len(choices) {
		return &echo.HTTPError{Code: http.StatusBadRequest, Message: "Invalid answer"}
	}
	if err := s.interviewQuestionRepository.AnswerQuestion(questionId, answer); err != nil {
		return fmt.Errorf("failed to answer question %d: %w", questionId, err)
	}
	return nil
}

func (s *UserService) UpdateSkillDescription(userId int64, desc string) error {
	return s.userRepository.SetSkillDescription(userId, desc)
}

func (s *UserService) UpdateSkillInfo(userId int64, skillInfo model.SkillInfo, setFilled bool) error {
	return s.userRepository.SetSkillInfo(userId, skillInfo, setFilled)
}

func (s *UserService) GetInterviewQuestionTopics(user model.User) ([]string, error) {
	skillInfo, err := user.SkillInfo()
	if err != nil {
		return nil, err
	}

	topics := make([]string, 0)

	scaleFiveLevels := map[int]string{
		1: "Newbie",
		2: "Beginner",
		3: "Intermediate",
		4: "Advanced",
		5: "Expert",
	}
	scaleThreeLevels := map[int]string{
		1: "Beginner",
		2: "Intermediate",
		3: "Advanced",
	}

	if skillInfo.KnownLanguages != nil {
		for _, skill := range skillInfo.KnownLanguages {
			topics = append(topics, fmt.Sprintf("Bahasa Pemrograman: %s (%s)", skill.Name, scaleThreeLevels[skill.Level]))
		}
	}

	if skillInfo.AlgoDSComfort != nil && *skillInfo.AlgoDSComfort > 0 {
		topics = append(topics, fmt.Sprintf("Algoritma & Struktur Data (%s)", scaleFiveLevels[*skillInfo.AlgoDSComfort]))
	}

	if skillInfo.AlgoExp != nil && *skillInfo.AlgoExp {
		topics = append(topics, "Algoritma")
	}

	if skillInfo.UseGit != nil && *skillInfo.UseGit {
		topics = append(topics, "Version Control System: Git")
	}

	if skillInfo.DoCodingChalls != nil && *skillInfo.DoCodingChalls {
		topics = append(topics, "Coding Challenges / Competitive Programming")
	}

	if skillInfo.KnownDB != nil {
		for _, skill := range skillInfo.KnownDB {
			topics = append(topics, fmt.Sprintf("Database: %s (%s)", skill.Name, scaleThreeLevels[skill.Level]))
		}
	}

	return topics, nil
}

func (s *UserService) SubmitInterview(userId int64) error {
	return s.userRepository.SubmitInterview(userId)
}
