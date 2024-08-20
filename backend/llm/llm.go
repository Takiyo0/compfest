package llm

import (
	"encoding/json"
	"fmt"
	"github.com/go-resty/resty/v2"
	"time"
)

type LLM struct {
	endpoints map[string]*resty.Client
}

func New(endpoints map[string]string) *LLM {
	llm := &LLM{
		endpoints: make(map[string]*resty.Client),
	}

	for model, endpoint := range endpoints {
		llm.endpoints[model] = resty.New().SetBaseURL(endpoint).SetTimeout(15 * time.Minute)
	}

	return llm
}

func (llm *LLM) Completion(model string, opt CompletionOptions) (string, error) {
	c, ok := llm.endpoints[model]
	if !ok {
		return "", fmt.Errorf("model %s not found", model)
	}

	resp, err := c.R().SetBody(opt).Post(model)
	if err != nil {
		return "", err
	}

	type result struct {
		Content string `json:"content"`
	}

	var res result
	if err := json.Unmarshal(resp.Body(), &res); err != nil {
		return "", err
	}

	return res.Content, nil
}
