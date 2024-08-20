package service

import (
	"database/sql"
	"fmt"
	"github.com/google/go-github/v50/github"
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/model"
	"github.com/takiyo0/compfest/backend/module/random"
	"github.com/takiyo0/compfest/backend/repository"
	"strconv"
	"strings"
	"time"
)

type UserService struct {
	userRepository    *repository.UserRepository
	sessionRepository *repository.SessionRepository
}

func NewUserService(userRepository *repository.UserRepository, sessionRepository *repository.SessionRepository) *UserService {
	return &UserService{
		userRepository:    userRepository,
		sessionRepository: sessionRepository,
	}
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
