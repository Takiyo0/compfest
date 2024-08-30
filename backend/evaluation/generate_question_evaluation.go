package evaluation

import (
	"errors"
	"github.com/sirupsen/logrus"
	"github.com/takiyo0/compfest/backend/llm"
	"github.com/takiyo0/compfest/backend/prompts"
	"regexp"
	"strconv"
	"strings"
)

type GenerateQuestionEvaluation struct {
	log logrus.FieldLogger
	e   Evaluator
}

func NewGenerateQuestionEvaluation(log logrus.FieldLogger, e Evaluator) *GenerateQuestionEvaluation {
	return &GenerateQuestionEvaluation{log, e}
}

func (e *GenerateQuestionEvaluation) CreateChoiceQuestion(topic string) (*Question, error) {
	result, err := e.e.Completion("indoprog-q", llm.CompletionOptions{
		Prompt: prompts.Format(prompts.GenerateChoiceQuestionPrompt, map[string]string{"topic": topic}),
	})
	if err != nil {
		return nil, err
	}

	// TODO: do not hardcode this
	result = "[SOAL]" + result

	reContent := regexp.MustCompile(`\[SOAL\](.*?)\[(?:/SOAL|J1)\]`)
	reJ1 := regexp.MustCompile(`\[J1\](.*?)\[(?:/J1|J2)\]`)
	reJ2 := regexp.MustCompile(`\[J2\](.*?)\[(?:/J2|J3)\]`)
	reJ3 := regexp.MustCompile(`\[J3\](.*?)\[(?:/J3|J4)\]`)
	reJ4 := regexp.MustCompile(`\[J4\](.*?)\[(?:/J4|JAWABAN)\]`)
	reAnswer := regexp.MustCompile(`\[JAWABAN\](.*?)\[(?:/JAWABAN|PENJELASAN)\]`)
	reExplanation := regexp.MustCompile(`\[PENJELASAN\](.*?)\[(?:/PENJELASAN)\]`)

	content := reContent.FindStringSubmatch(result)
	if content == nil {
		e.log.Debugf("content is nil: %s", result)
		return nil, errors.New("parse error: content is nil")
	}
	j1 := reJ1.FindStringSubmatch(result)
	if j1 == nil {
		e.log.Debugf("j1 is nil: %s", result)
		return nil, errors.New("parse error: j1 is nil")
	}
	j2 := reJ2.FindStringSubmatch(result)
	if j2 == nil {
		e.log.Debugf("j2 is nil: %s", result)
		return nil, errors.New("parse error: j2 is nil")
	}
	j3 := reJ3.FindStringSubmatch(result)
	if j3 == nil {
		e.log.Debugf("j3 is nil: %s", result)
		return nil, errors.New("parse error: j3 is nil")
	}
	j4 := reJ4.FindStringSubmatch(result)
	if j4 == nil {
		e.log.Debugf("j4 is nil: %s", result)
		return nil, errors.New("parse error: j4 is nil")
	}
	answer := reAnswer.FindStringSubmatch(result)
	if answer == nil {
		e.log.Debugf("answer is nil: %s", result)
		return nil, errors.New("parse error: answer is nil")
	}
	explanation := reExplanation.FindStringSubmatch(result)
	if explanation == nil {
		e.log.Debugf("explanation is nil: %s", result)
		return nil, errors.New("parse error: explanation is nil")
	}

	choices := []string{trimWhitespace(j1[1]), trimWhitespace(j2[1]), trimWhitespace(j3[1]), trimWhitespace(j4[1])}
	parsedAnswer, err := strconv.Atoi(strings.Trim(answer[1], " "))
	if err != nil {
		return nil, errors.New("error parsing answer")
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
