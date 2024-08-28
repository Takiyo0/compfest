package model

type SkillTree struct {
	Id                 int64  `db:"id"`
	UserId             int64  `db:"userId"`
	Content            string `db:"content"`
	ChildSkillTreeIds_ string `db:"childSkillTreeIds"`
	IsQuestionsReady   bool   `db:"isQuestionsReady"`
	CreatedAt          int64  `db:"createdAt"`
}

func (m SkillTree) ChildSkillTreeIds() []int64 {
	ids := make([]int64, 0)
	for _, id := range m.ChildSkillTreeIds_ {
		ids = append(ids, int64(id))
	}
	return ids
}

type SkillTreeQuestion struct {
	Id            int64  `db:"id"`
	SkillTreeId   int64  `db:"skillTreeId"`
	Content       string `db:"content"`
	Choices_      string `db:"choices"`
	CorrectChoice int    `db:"correctChoice"`
	CreatedAt     int64  `db:"createdAt"`
}
