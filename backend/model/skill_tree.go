package model

import (
	"encoding/json"
	"strconv"
	"strings"
)

const (
	SkillTreeContentStatusNone       = "NONE"
	SkillTreeContentStatusGenerating = "GENERATING"
	SkillTreeContentStatusGenerated  = "GENERATED"
)

const (
	SkillTreeQuestionStatusNotStarted = "NOT_STARTED"
	SkillTreeQuestionStatusGenerating = "GENERATING"
	SkillTreeQuestionStatusInProgress = "IN_PROGRESS"
	SkillTreeQuestionStatusFinished   = "FINISHED"
)

type SkillTree struct {
	Id                 int64  `db:"id"`
	Title              string `db:"title"`
	UserId             int64  `db:"userId"`
	IsRoot             bool   `db:"isRoot"`
	Finished           bool   `db:"finished"`
	ChildSkillTreeIds_ string `db:"childSkillTreeIds"`
	QuestionStatus     string `db:"questionStatus"`
	CreatedAt          int64  `db:"createdAt"`
}

func (m SkillTree) ChildSkillTreeIds() []int64 {
	ids := make([]int64, 0)
	splits := strings.Split(m.ChildSkillTreeIds_, ",")
	for _, id := range splits {
		parsedId, _ := strconv.Atoi(id)
		if parsedId == 0 {
			continue
		}
		ids = append(ids, int64(parsedId))
	}
	return ids
}

type SkillTreeQuestion struct {
	Id            int64  `db:"id"`
	SkillTreeId   int64  `db:"skillTreeId"`
	Content       string `db:"content"`
	Choices_      string `db:"choices"`
	CorrectChoice int    `db:"correctChoice"`
	UserAnswer    *int   `db:"userAnswer"`
	Explanation   string `db:"explanation"`
	CreatedAt     int64  `db:"createdAt"`
}

func (s *SkillTreeQuestion) Choices() ([]string, error) {
	var ret []string
	if err := json.Unmarshal([]byte(s.Choices_), &ret); err != nil {
		return nil, err
	}
	return ret, nil
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
