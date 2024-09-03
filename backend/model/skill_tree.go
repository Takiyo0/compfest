package model

const (
	SkillTreeContentStatusNone       = "NONE"
	SkillTreeContentStatusGenerating = "GENERATING"
	SkillTreeContentStatusGenerated  = "GENERATED"
)

type SkillTree struct {
	Id                 int64  `db:"id"`
	Title              string `db:"title"`
	UserId             int64  `db:"userId"`
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

type SkillTreeEntry struct {
	Id            int64   `db:"id"`
	SkillTreeId   int64   `db:"skillTreeId"`
	Title         string  `db:"title"`
	Description   string  `db:"description"`
	Content       *string `db:"content"`
	ContentStatus string  `db:"contentStatus"`
	CreatedAt     int64   `db:"createdAt"`
}
