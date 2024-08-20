package repository

import (
	"github.com/jmoiron/sqlx"
	"github.com/takiyo0/compfest/backend/model"
)

type InterviewQuestionsRepository struct {
	db *sqlx.DB
}

func NewInterviewQuestionsRepository(db *sqlx.DB) *InterviewQuestionsRepository {
	return &InterviewQuestionsRepository{db: db}
}

func (r *InterviewQuestionsRepository) FindAllByUserId(userId int64) ([]model.InterviewQuestion, error) {
	var questions []model.InterviewQuestion
	if err := r.db.Select(&questions, "SELECT * FROM interviewQuestions WHERE userId = ?", userId); err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *InterviewQuestionsRepository) AnswerQuestion(id int64, answerChoice int) error {
	_, err := r.db.Exec("UPDATE interviewQuestions SET userAnswer = ? WHERE id = ?", answerChoice, id)
	return err
}
