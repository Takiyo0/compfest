package evaluation

import "context"

type Evaluator interface {
	Prompt(ctx context.Context, prompt string) (string, error)
}
