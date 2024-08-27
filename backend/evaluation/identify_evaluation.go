package evaluation

import (
	"github.com/takiyo0/compfest/backend/llm"
	"github.com/takiyo0/compfest/backend/prompts"
	"strings"
)

type IdentifyEvaluation struct {
	e Evaluator
}

func NewIdentifyEvaluation(e Evaluator) *IdentifyEvaluation {
	return &IdentifyEvaluation{e}
}

func (e *IdentifyEvaluation) IdentifyQuestionTopic(question string) ([]string, error) {
	result, err := e.e.Completion("indoprog-q", llm.CompletionOptions{
		Prompt: prompts.Format(prompts.IdentifyQuestionTopicPrompt, map[string]string{"question": question}),
	})
	if err != nil {
		return nil, err
	}

	ret := strings.Split(strings.TrimSpace(result), "||")
	for i := range ret {
		ret[i] = strings.TrimSpace(ret[i])
	}
	return ret, nil
}
