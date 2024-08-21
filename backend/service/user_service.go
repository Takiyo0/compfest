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
		go func() {
			// TODO: sql transaction to keep data consistent
			if err := s.userRepository.SetInterviewQuestionStatus(userId, model.InterviewQuestionStatusQuestionsNotReady); err != nil {
				s.log.Errorf("failed to set interview question status: %v", err)
				return
			}
			questions, err := s.llmService.CreateQuestions("Interview Programmer senior C++", 5)
			if err != nil {
				_ = s.userRepository.SetInterviewQuestionStatus(userId, model.InterviewQuestionStatusNotStarted)
				s.log.Errorf("failed to create questions: %v", err)
				return
			}
			mappedQuestions := make([]model.InterviewQuestion, 0)
			for _, question := range questions {
				serializedChoices, err := json.Marshal(question.Choices)
				if err != nil {
					_ = s.userRepository.SetInterviewQuestionStatus(userId, model.InterviewQuestionStatusNotStarted)
					s.log.Errorf("failed to serialize choices: %v", err)
					return
				}
				mappedQuestions = append(mappedQuestions, model.InterviewQuestion{
					UserId:        userId,
					Content:       question.Content,
					Choices_:      string(serializedChoices),
					CorrectChoice: question.CorrectChoice,
					CreatedAt:     time.Now().Unix(),
				})
			}
			if err := s.interviewQuestionRepository.InsertQuestions(mappedQuestions, userId); err != nil {
				_ = s.userRepository.SetInterviewQuestionStatus(userId, model.InterviewQuestionStatusNotStarted)
				s.log.Errorf("failed to insert questions: %v", err)
				return
			}
			_ = s.userRepository.SetInterviewQuestionStatus(userId, model.InterviewQuestionStatusQuestionsFinished)
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
