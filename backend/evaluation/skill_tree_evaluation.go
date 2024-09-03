package evaluation

import (
	"encoding/json"
	"github.com/sirupsen/logrus"
	"github.com/takiyo0/compfest/backend/llm"
	"github.com/takiyo0/compfest/backend/prompts"
	"strings"
)

type SkillTreeEvaluation struct {
	log logrus.FieldLogger
	e   Evaluator
}

func NewSkillTreeEvaluation(log logrus.FieldLogger, e Evaluator) *SkillTreeEvaluation {
	return &SkillTreeEvaluation{log, e}
}

func (e *SkillTreeEvaluation) CreateSkillTree(topic string) (*SkillTree, error) {
	result, err := e.e.Completion(llm.Indoprog, llm.CompletionOptions{
		Prompt: prompts.Format(prompts.GenerateSkillTreePrompt, map[string]string{"topic": topic}),
	})

	if err != nil {
		return nil, err
	}

	result = "[{\"title" + result
	result = strings.Trim(result, "\n")
	result = strings.Trim(result, " ")

	var entries []SkillTreeEntry
	if err := json.Unmarshal([]byte(result), &entries); err != nil {
		return nil, err
	}

	return &SkillTree{
		Category: topic,
		Entries:  entries,
	}, nil
}
