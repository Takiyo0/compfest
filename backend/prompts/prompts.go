package prompts

import (
	_ "embed"
	"strings"
)

//go:embed generate_choice_question_prompt.txt
var GenerateChoiceQuestionPrompt string

//go:embed generate_skill_tree_prompt.txt
var GenerateSkillTreePrompt string

func Format(prompt string, format map[string]string) string {
	for k, v := range format {
		prompt = strings.ReplaceAll(prompt, "{"+k+"}", v)
	}
	return prompt
}
