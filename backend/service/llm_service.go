package service

import (
	"github.com/sirupsen/logrus"
	"github.com/takiyo0/compfest/backend/evaluation"
	"github.com/takiyo0/compfest/backend/llm"
	"github.com/takiyo0/compfest/backend/model"
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
	// TODO: do not hardcode prompt!
	prompt := "Anda adalah asisten berguna yang membantu user dalam menyelesaikan tugas. Mohon lanjutkan percakapan anda berikut:\n\n<<<User>>> Halo!\n\n<<<Asisten>>> Halo!\n\nSaya adalah seorang asisten virtual anda yang bisa menjawab pertanyaan, membantu menyelesaikan masalah anda.\n\nApakah ada yang bisa saya bantu?\n\n"
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
	return s.llm.CompletionStream(llm.Indoprog, llm.CompletionOptions{
		Prompt: prompt,
		Stop:   []string{"<<<User>>>", "<<<Asisten>>>"},
	}, onGenerate)
}

func (s *LLMService) GetChatTitle(chats []LLMChat) (string, error) {
	// TODO: do not hardcode prompt!
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

	prompt += "<<<Ringkasan>>> Dari percakapan diatas, kami menyimpulkan judul dari percakapan dengan maksimal 15 kata yaitu: `"

	result, err := s.llm.Completion(llm.Indoprog, llm.CompletionOptions{
		Prompt:   prompt,
		NPredict: 48,
		Stop:     []string{"<<<Ringkasan>>>", "<<<Asisten>>>", "<<<User>>>"},
	})
	if err != nil {
		return "", err
	}

	if strings.HasSuffix(result, "`") {
		result = result[:len(result)-1]
	}

	return result, nil
}

func (s *LLMService) GenerateSkillTree(topics []string) ([]evaluation.SkillTree, error) {
	evaluator := evaluation.NewSkillTreeEvaluation(s.log, s.llm)
	var skillTrees []evaluation.SkillTree
	failAttempt := 0
	for _, t := range topics {
		success := false
		for !success {
			skillTree, err := evaluator.CreateSkillTree(t)
			if err != nil {
				if strings.HasPrefix(err.Error(), "parse error:") && failAttempt < 3 {
					failAttempt++
					continue
				}
				return nil, err
			}
			skillTrees = append(skillTrees, *skillTree)
			success = true
			failAttempt = 0
		}
	}
	return skillTrees, nil
}

func (s *LLMService) GenerateSkillTreeEntryContent(skillTree model.SkillTree, skillTreeEntry model.SkillTreeEntry) (string, error) {
	evaluator := evaluation.NewSkillTreeEvaluation(s.log, s.llm)
	return evaluator.CreateSkillTreeEntryContent(skillTree.Title, skillTreeEntry.Title, skillTreeEntry.Description)
}
