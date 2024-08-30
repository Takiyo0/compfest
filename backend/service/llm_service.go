package service

import (
	"github.com/sirupsen/logrus"
	"github.com/takiyo0/compfest/backend/evaluation"
	"github.com/takiyo0/compfest/backend/llm"
	"strings"
)

type LLMService struct {
	log logrus.FieldLogger
	llm *llm.LLM
}

func NewLLMService(log logrus.FieldLogger, llm *llm.LLM) *LLMService {
	return &LLMService{log: log, llm: llm}
}

func (s *LLMService) CreateQuestions(topic string, len int) ([]evaluation.Question, error) {
	evaluator := evaluation.NewGenerateQuestionEvaluation(s.log, s.llm)
	var questions []evaluation.Question
	failAttempt := 0
	for i := 0; i < len; i++ {
		question, err := evaluator.CreateChoiceQuestion(topic)
		if err != nil {
			if strings.HasPrefix(err.Error(), "parse error:") && failAttempt < 3 {
				failAttempt++
				i--
				continue
			}
			return nil, err
		}
		failAttempt = 0
		questions = append(questions, *question)
	}
	return questions, nil
}

type LLMChat struct {
	IsAssistant bool
	Content     string
}

func (s *LLMService) Chat(chats []LLMChat, onGenerate func(string) error) (string, error) {
	prompt := "Anda adalah asisten berguna yang membantu user dalam menyelesaikan tugas. Mohon lanjutkan percakapan anda berikut:\n\n"
	for _, chat := range chats {
		prompt += "<<<"
		if chat.IsAssistant {
			prompt += "Asisten"
		} else {
			prompt += "User"
		}
		prompt += ">>> " + chat.Content + "\n\n"
	}
	prompt += "<<<Asisten>>>"
	return s.llm.CompletionStream(llm.IndoprogC, llm.CompletionOptions{
		Prompt: prompt,
		Stop:   []string{"<<<User>>>", "<<<Asisten>>>"},
	}, onGenerate)
}

func (s *LLMService) GetChatTitle(chats []LLMChat) (string, error) {
	prompt := "Mohon berikan judul dari percakapan dibawah ini maksimal 15 kata:\n\n"
	for _, chat := range chats {
		prompt += "<<<"
		if chat.IsAssistant {
			prompt += "Asisten"
		} else {
			prompt += "User"
		}
		prompt += ">>> " + chat.Content + "\n\n"
	}
	prompt += "<<<Ringkasan>>> Dari percakapan diatas, kami menyimpulkan judul dari percakapan dengan maksimal 15 kata yaitu: "
	return s.llm.Completion(llm.IndoprogC, llm.CompletionOptions{
		Prompt:   prompt,
		NPredict: 64,
		Stop:     []string{"<<<Ringkasan>>>", "<<<Asisten>>>", "<<<User>>>"},
	})
}
