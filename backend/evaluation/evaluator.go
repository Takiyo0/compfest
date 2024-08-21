package evaluation

import "github.com/takiyo0/compfest/backend/llm"

type Evaluator interface {
	Completion(model string, options llm.CompletionOptions) (string, error)
}
