package evaluation

import (
	"encoding/json"
	"fmt"
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

const jsonGrammar = "char ::= [^\"\\\\\\x7F\\x00-\\x1F] | [\\\\] ([\"\\\\bfnrt] | \"u\" [0-9a-fA-F]{4})\nitem ::= \"{\" space item-title-kv \",\" space item-description-kv \"}\" space\nitem-description-kv ::= \"\\\"description\\\"\" space \":\" space string\nitem-title-kv ::= \"\\\"title\\\"\" space \":\" space string\nroot ::= \"[\" space (item (\",\" space item)*)? \"]\" space\nspace ::= | \" \" | \"\\n\" [ \\t]{0,20}\nstring ::= \"\\\"\" char* \"\\\"\" space\n"

func (e *SkillTreeEvaluation) CreateSkillTree(topic string) (*SkillTree, error) {
	result, err := e.e.Completion(llm.Indoprog, llm.CompletionOptions{
		Prompt:  prompts.Format(prompts.GenerateSkillTreePrompt, map[string]string{"topic": topic}),
		Grammar: jsonGrammar,
	})

	if err != nil {
		return nil, err
	}

	result = strings.Trim(result, "\n")
	result = strings.Trim(result, " ")
	result = strings.Trim(result, "\r")

	fmt.Println(result)

	var entries []SkillTreeEntry
	if err := json.Unmarshal([]byte(result), &entries); err != nil {
		fmt.Println(result)
		return nil, err
	}

	return &SkillTree{
		Category: topic,
		Entries:  entries,
	}, nil
}

func (e *SkillTreeEvaluation) CreateSkillTreeEntryContent(category string, title string, description string) (string, error) {
	result, err := e.e.Completion(llm.Indoprog, llm.CompletionOptions{
		Prompt: prompts.Format(prompts.GenerateSkillTreeEntryContent, map[string]string{"category": category, "title": title, "description": description}),
	})

	if err != nil {
		return "", err
	}

	result = "# " + result

	return result, nil
}
