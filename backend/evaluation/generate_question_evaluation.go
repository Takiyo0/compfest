package evaluation

import (
	"context"
	"errors"
	"fmt"
	"github.com/takiyo0/compfest/backend/prompts"
	"regexp"
	"strconv"
	"strings"
)

type GenerateQuestionEvaluation struct {
	e Evaluator
}

func NewGenerateQuestionEvaluation(e Evaluator) *GenerateQuestionEvaluation {
	return &GenerateQuestionEvaluation{e}
}

func (e *GenerateQuestionEvaluation) CreateChoiceQuestion(ctx context.Context, topic string) (*Question, error) {
	result, err := e.e.Prompt(ctx, prompts.Format(prompts.GenerateChoiceQuestionPrompt, map[string]string{"topic": topic}))
	if err != nil {
		return nil, err
	}

	fmt.Println(result)

	reContent := regexp.MustCompile(`\[SOAL\](.*?)\[(?:/SOAL|J1)\]`)
	reJ1 := regexp.MustCompile(`\[J1\](.*?)\[(?:/J1|J2)\]`)
	reJ2 := regexp.MustCompile(`\[J2\](.*?)\[(?:/J2|J3)\]`)
	reJ3 := regexp.MustCompile(`\[J3\](.*?)\[(?:/J3|J4)\]`)
	reJ4 := regexp.MustCompile(`\[J4\](.*?)\[(?:/J4|JAWABAN)\]`)
	reAnswer := regexp.MustCompile(`\[JAWABAN\](.*?)\[(?:/JAWABAN|PENJELASAN)\]`)
	reExplanation := regexp.MustCompile(`\[PENJELASAN\](.*?)\[(?:/PENJELASAN)\]`)

	content := reContent.FindStringSubmatch(result)
	if content == nil {
		return nil, errors.New("content is nil")
	}
	j1 := reJ1.FindStringSubmatch(result)
	if j1 == nil {
		return nil, errors.New("j1 is nil")
	}
	j2 := reJ2.FindStringSubmatch(result)
	if j2 == nil {
		return nil, errors.New("j2 is nil")
	}
	j3 := reJ3.FindStringSubmatch(result)
	if j3 == nil {
		return nil, errors.New("j3 is nil")
	}
	j4 := reJ4.FindStringSubmatch(result)
	if j4 == nil {
		return nil, errors.New("j4 is nil")
	}
	answer := reAnswer.FindStringSubmatch(result)
	if answer == nil {
		return nil, errors.New("answer is nil")
	}
	explanation := reExplanation.FindStringSubmatch(result)
	if explanation == nil {
		return nil, errors.New("explanation is nil")
	}

	choices := []string{trimWhitespace(j1[1]), trimWhitespace(j2[1]), trimWhitespace(j3[1]), trimWhitespace(j4[1])}
	parsedAnswer, err := strconv.Atoi(strings.Trim(answer[1], " "))
	if err != nil {
		return nil, errors.New("")
	}

	return &Question{
		Content:           trimWhitespace(content[1]),
		Category:          ChoiceQuestion,
		Choices:           choices,
		CorrectChoice:     parsedAnswer - 1,
		AnswerExplanation: trimWhitespace(explanation[1]),
	}, nil
}

func trimWhitespace(str string) string {
	return strings.Trim(str, " ")
}
