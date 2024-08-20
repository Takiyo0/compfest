package model

type Session struct {
	Id        int64  `db:"id"`
	UserId    int64  `db:"userId"`
	Token     string `db:"token"`
	ExpiresAt int64  `db:"expiresAt"`
	CreatedAt int64  `db:"createdAt"`
}
