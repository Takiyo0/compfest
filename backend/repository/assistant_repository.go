package repository

import (
	"github.com/jmoiron/sqlx"
	"github.com/takiyo0/compfest/backend/model"
)

type AssistantRepository struct {
	db *sqlx.DB
}

func NewAssistantRepository(db *sqlx.DB) *AssistantRepository {
	return &AssistantRepository{db: db}
}

func (r *AssistantRepository) FindById(id int64) (*model.AssistantChat, error) {
	var assistant model.AssistantChat
	if err := r.db.Get(&assistant, "SELECT * FROM assistantChats WHERE id = ?", id); err != nil {
		return nil, err
	}
	return &assistant, nil
}

func (r *AssistantRepository) FindByUserId(userId int64) ([]model.AssistantChat, error) {
	var assistants []model.AssistantChat
	if err := r.db.Select(&assistants, "SELECT * FROM assistantChats WHERE userId = ? ORDER BY id DESC", userId); err != nil {
		return nil, err
	}
	return assistants, nil
}

func (r *AssistantRepository) FindMessages(assistantChatId int64) ([]model.AssistantChatMessage, error) {
	var messages []model.AssistantChatMessage
	if err := r.db.Select(&messages, "SELECT * FROM assistantChatMessages WHERE assistantChatId = ? ORDER BY id DESC", assistantChatId); err != nil {
		return nil, err
	}
	return messages, nil
}

func (r *AssistantRepository) Create(assistantChat *model.AssistantChat) (int64, error) {
	insert, err := r.db.NamedExec("INSERT INTO assistantChats (userId, title, createdAt) VALUES (:userId, :title, :createdAt)", assistantChat)
	if err != nil {
		return 0, err
	}
	return insert.LastInsertId()
}

func (r *AssistantRepository) CreateMessage(message *model.AssistantChatMessage) (int64, error) {
	insert, err := r.db.NamedExec("INSERT INTO assistantChatMessages (assistantChatId, role, userId, content, createdAt) VALUES (:assistantChatId, :role, :userId, :content, :createdAt)", message)
	if err != nil {
		return 0, err
	}
	return insert.LastInsertId()
}

func (r *AssistantRepository) SetMessageContent(messageId int64, content string) error {
	_, err := r.db.Exec("UPDATE assistantChatMessages SET content = ? WHERE id = ?", content, messageId)
	return err
}
