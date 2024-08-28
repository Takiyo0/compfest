package service

import (
	"github.com/labstack/echo/v4"
	"github.com/takiyo0/compfest/backend/model"
	"github.com/takiyo0/compfest/backend/repository"
	"time"
)

type AssistantService struct {
	llm                 *LLMService
	assistantRepository *repository.AssistantRepository
}

func NewAssistantService(assistantRepository *repository.AssistantRepository) *AssistantService {
	return &AssistantService{assistantRepository: assistantRepository}
}

func (s *AssistantService) SetLLMService(llm *LLMService) {
	s.llm = llm
}

func (s *AssistantService) CreateChat(userId int64) (int64, error) {
	return s.assistantRepository.Create(&model.AssistantChat{
		UserId:    userId,
		Title:     "New Chat",
		CreatedAt: time.Now().Unix(),
	})
}

func (s *AssistantService) Chat(userId int64, assistantChatId int64, prompt string, onGenerate func(content string) error) (string, error) {
	chat, err := s.assistantRepository.FindById(assistantChatId)
	if err != nil {
		return "", err
	}

	if chat.UserId != userId {
		return "", &echo.HTTPError{Code: 403, Message: "You are not allowed to chat this assistant"}
	}

	messages, err := s.assistantRepository.FindMessages(assistantChatId)
	if err != nil {
		return "", err
	}

	llmChats := make([]LLMChat, 0)
	for _, message := range messages {
		llmChats = append(llmChats, LLMChat{
			IsAssistant: message.Role == model.AssistantChatRoleAssistant,
			Content:     message.Content,
		})
	}

	if _, err := s.assistantRepository.CreateMessage(&model.AssistantChatMessage{
		AssistantChatId: assistantChatId,
		Role:            model.AssistantChatRoleUser,
		UserId:          userId,
		Content:         prompt,
		CreatedAt:       time.Now().Unix(),
	}); err != nil {
		return "", err
	}

	llmChats = append(llmChats, LLMChat{
		IsAssistant: false,
		Content:     prompt,
	})

	assistantMessageId, err := s.assistantRepository.CreateMessage(&model.AssistantChatMessage{
		AssistantChatId: assistantChatId,
		Role:            model.AssistantChatRoleAssistant,
		UserId:          userId,
		Content:         "",
		CreatedAt:       time.Now().Unix(),
	})
	if err != nil {
		return "", err
	}

	fullMessage := ""
	onGenerateHandler := func(content string) error {
		fullMessage += content
		if err := s.assistantRepository.SetMessageContent(assistantMessageId, fullMessage); err != nil {
			return err
		}
		return onGenerate(content)
	}

	content, err := s.llm.Chat(llmChats, onGenerateHandler)
	if err != nil {
		return "", err
	}

	return content, nil
}
