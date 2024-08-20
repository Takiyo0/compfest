package repository

import (
	"github.com/jmoiron/sqlx"
	"github.com/takiyo0/compfest/backend/model"
	"time"
)

type SessionRepository struct {
	db *sqlx.DB
}

func NewSessionRepository(db *sqlx.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

func (r *SessionRepository) Create(userId int64, token string, duration time.Duration) (int64, error) {
	insert, err := r.db.Exec("INSERT INTO sessions (userId, token, expiresAt, createdAt) VALUES (?, ?, ?, ?)", userId, token, time.Now().Add(duration).Unix(), time.Now().Unix())
	if err != nil {
		return 0, err
	}
	return insert.LastInsertId()
}

func (r *SessionRepository) FindById(id int64) (*model.Session, error) {
	var session model.Session
	if err := r.db.Get(&session, "SELECT * FROM sessions WHERE id = ?", id); err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *SessionRepository) Delete(id int64) error {
	_, err := r.db.Exec("DELETE FROM sessions WHERE id = ?", id)
	return err
}
