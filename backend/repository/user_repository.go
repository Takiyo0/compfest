package repository

import (
	"github.com/google/go-github/v50/github"
	"github.com/jmoiron/sqlx"
	"github.com/takiyo0/compfest/backend/model"
	"time"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Register(ghUser *github.User) (int64, error) {
	insert, err := r.db.Exec("INSERT INTO users (id, name, skillDescription, interviewQuestionStatusLastUpdatedAt, createdAt) VALUES (?, ?, ?, ?, ?)", ghUser.GetID(), ghUser.GetName(), "", time.Now().Unix(), time.Now().Unix())
	if err != nil {
		return 0, err
	}
	return insert.LastInsertId()
}

func (r *UserRepository) FindById(id int64) (*model.User, error) {
	var user model.User
	if err := r.db.Get(&user, "SELECT * FROM users WHERE id = ?", id); err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) SetInterviewQuestionStatus(id int64, status string) error {
	_, err := r.db.Exec("UPDATE users SET interviewQuestionStatus = ?, interviewQuestionStatusLastUpdatedAt = ? WHERE id = ?", status, time.Now().Unix(), id)
	return err
}

func (r *UserRepository) SetSkillDescription(id int64, desc string) error {
	_, err := r.db.Exec("UPDATE users SET skillDescription = ? WHERE id = ?", desc, id)
	return err
}
