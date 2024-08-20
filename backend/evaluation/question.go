package evaluation

const (
	ChoiceQuestion = iota
	TextQuestion
)

type QuestionCategory int

type Question struct {
	Content  string
	Category QuestionCategory

	Choices       []string
	CorrectChoice int

	AnswerExplanation string
}
