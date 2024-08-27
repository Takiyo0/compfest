package repository

import (
	"github.com/jmoiron/sqlx"
	"github.com/takiyo0/compfest/backend/database"
	"github.com/takiyo0/compfest/backend/model"
	"time"
)

type InterviewQuestionRepository struct {
	db *sqlx.DB
}

func NewInterviewQuestionRepository(db *sqlx.DB) *InterviewQuestionRepository {
	return &InterviewQuestionRepository{db: db}
}

func (r *InterviewQuestionRepository) FindById(id int64) (*model.InterviewQuestion, error) {
	var question model.InterviewQuestion
	if err := r.db.Get(&question, "SELECT * FROM interviewQuestions WHERE id = ?", id); err != nil {
		return nil, err
	}
	return &question, nil
}

func (r *InterviewQuestionRepository) FindAllByUserId(userId int64) ([]model.InterviewQuestion, error) {
	var questions []model.InterviewQuestion
	if err := r.db.Select(&questions, "SELECT * FROM interviewQuestions WHERE userId = ?", userId); err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *InterviewQuestionRepository) AnswerQuestion(id int64, answerChoice int) error {
	_, err := r.db.Exec("UPDATE interviewQuestions SET userAnswer = ? WHERE id = ?", answerChoice, id)
	return err
}

func (r *InterviewQuestionRepository) InsertQuestions(questions []model.InterviewQuestion, userId int64) error {
	values := make([][]interface{}, 0)
	for _, question := range questions {
		values = append(values, []interface{}{userId, question.Topic, question.Content, question.Choices_, question.CorrectChoice, time.Now().Unix()})
	}
	return database.BulkInsert(r.db, "interviewQuestions", []string{"userId", "topic", "content", "choices", "correctChoice", "createdAt"}, values)
}
