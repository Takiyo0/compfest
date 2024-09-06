package model

type AssistantChat struct {
	Id        int64  `db:"id"`
	UserId    int64  `db:"userId"`
	Title     string `db:"title"`
	Content   string `db:"content"`
	CreatedAt int64  `db:"createdAt"`
}

const (
	AssistantChatRoleUser      = "USER"
	AssistantChatRoleAssistant = "ASSISTANT"
)

type AssistantChatMessage struct {
	Id              int64  `db:"id"`
	AssistantChatId int64  `db:"assistantChatId"`
	Role            string `db:"role"`
	UserId          int64  `db:"userId"`
	Content         string `db:"content"`
	CreatedAt       int64  `db:"createdAt"`
}
