package llm

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/go-resty/resty/v2"
	"net/http"
	"strings"
	"time"
)

type LLM struct {
	endpoints map[string]*resty.Client
}

func New(endpoints map[string]string) *LLM {
	llm := &LLM{
		endpoints: make(map[string]*resty.Client),
	}

	// validate if endpoints is not empty
	if len(endpoints) == 0 {
		panic("endpoints is empty")
	}

	for model, endpoint := range endpoints {
		if endpoint == "" {
			panic(fmt.Sprintf("endpoint for model %s is empty", model))
		}
		llm.endpoints[model] = resty.New().SetBaseURL(endpoint).SetTimeout(90 * time.Minute)
	}

	return llm
}

func (llm *LLM) Completion(model string, opt CompletionOptions) (string, error) {
	opt.Stream = false

	c, ok := llm.endpoints[model]
	if !ok {
		return "", fmt.Errorf("model %s not found", model)
	}

	resp, err := c.R().SetBody(opt).Post("/completion")
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

func (llm *LLM) CompletionStream(model string, opt CompletionOptions, onReceive func(content string) error) (string, error) {
	opt.Stream = true

	c, ok := llm.endpoints[model]
	if !ok {
		return "", fmt.Errorf("model %s not found", model)
	}

	body, err := json.Marshal(opt)
	if err != nil {
		return "", err
	}
	resp, err := http.Post(c.BaseURL+"/completion", "text/event-stream", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("status code %d", resp.StatusCode)
	}

	fullContent := ""
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			data := strings.Trim(strings.TrimPrefix(line, "data: "), " ")
			type result struct {
				Content string `json:"content"`
			}
			var res result
			if err := json.Unmarshal([]byte(data), &res); err != nil {
				return fullContent, err
			}
			fullContent += res.Content
			if err := onReceive(res.Content); err != nil {
				return fullContent, err
			}
		}
	}
	if err := scanner.Err(); err != nil {
		return fullContent, err
	}
	return fullContent, nil
}
