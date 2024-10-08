package repository

import (
	"database/sql"
	"encoding/json"
	"github.com/google/go-github/v50/github"
	"github.com/jmoiron/sqlx"
	"github.com/takiyo0/compfest/backend/model"
	"strings"
	"time"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Register(ghUser *github.User) (int64, error) {
	insert, err := r.db.Exec("INSERT INTO users (id, name, skillDescription, interviewQuestionStatusLastUpdatedAt, createdAt, topics) VALUES (?, ?, ?, ?, ?, ?)", ghUser.GetID(), ghUser.GetLogin(), "", time.Now().Unix(), time.Now().Unix(), "")
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

func (r *UserRepository) SetTopics(id int64, topics []string) error {
	_, err := r.db.Exec("UPDATE users SET topics = ? WHERE id = ?", strings.Join(topics, "||"), id)
	return err
}

func (r *UserRepository) SetSkillInfo(id int64, skillInfo model.SkillInfo, setFilled bool) error {
	skillInfoStr, err := json.Marshal(skillInfo)
	if err != nil {
		return err
	}
	_, err = r.db.Exec("UPDATE users SET skillInfo = ?, filledSkillInfo = ?  WHERE id = ?", string(skillInfoStr), setFilled, id)
	return err
}

func (r *UserRepository) SubmitInterview(userId int64) error {
	update, err := r.db.Exec("UPDATE users SET interviewQuestionStatus = ? WHERE id = ? AND interviewQuestionStatus = ?", model.InterviewQuestionStatusQuestionsFinished, userId, model.InterviewQuestionStatusInProgress)
	rowsAffected, _ := update.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return err
}

func (r *UserRepository) SetSkillTreeStatus(userId int64, status string) error {
	_, err := r.db.Exec("UPDATE users SET skillTreeStatus = ? WHERE id = ?", status, userId)
	return err
}
