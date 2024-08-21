package service

import (
	"github.com/takiyo0/compfest/backend/evaluation"
	"github.com/takiyo0/compfest/backend/llm"
)

type LLMService struct {
	llm *llm.LLM
}

func NewLLMService(llm *llm.LLM) *LLMService {
	return &LLMService{llm: llm}
}

func (s *LLMService) CreateQuestions(topic string, len int) ([]evaluation.Question, error) {
	evaluator := evaluation.NewGenerateQuestionEvaluation(s.llm)
	var questions []evaluation.Question
	for i := 0; i < len; i++ {
		question, err := evaluator.CreateChoiceQuestion(topic)
		if err != nil {
			return nil, err
		}
		questions = append(questions, *question)
	}
	return questions, nil
}
