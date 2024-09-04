package repository

import (
	"github.com/jmoiron/sqlx"
	"github.com/takiyo0/compfest/backend/database"
	"github.com/takiyo0/compfest/backend/model"
)

type SkillTreeRepository struct {
	db *sqlx.DB
}

func NewSkillTreeRepository(db *sqlx.DB) *SkillTreeRepository {
	return &SkillTreeRepository{db: db}
}

func (r *SkillTreeRepository) FindByUserId(userId int64) ([]model.SkillTree, error) {
	var skillTrees []model.SkillTree
	if err := r.db.Select(&skillTrees, "SELECT * FROM skillTrees WHERE userId = ?", userId); err != nil {
		return nil, err
	}
	return skillTrees, nil
}

func (r *SkillTreeRepository) FindById(id int64) (*model.SkillTree, error) {
	var skillTree model.SkillTree
	if err := r.db.Get(&skillTree, "SELECT * FROM skillTrees WHERE id = ?", id); err != nil {
		return nil, err
	}
	return &skillTree, nil
}

func (r *SkillTreeRepository) FindEntriesBySkillTreeId(skillTreeId int64) ([]model.SkillTreeEntry, error) {
	var entries []model.SkillTreeEntry
	if err := r.db.Select(&entries, "SELECT * FROM skillTreeEntries WHERE skillTreeId = ?", skillTreeId); err != nil {
		return nil, err
	}
	return entries, nil
}

func (r *SkillTreeRepository) BulkCreate(skillTrees []model.SkillTree) error {
	values := make([][]any, 0)
	for _, skillTree := range skillTrees {
		var id *int64
		if skillTree.Id != 0 {
			id = &skillTree.Id
		}
		values = append(values, []any{id, skillTree.UserId, skillTree.IsRoot, skillTree.ChildSkillTreeIds_, skillTree.CreatedAt})
	}
	return database.BulkInsert(r.db, "skillTrees", []string{"id", "userId", "isRoot", "childSkillTreeIds", "createdAt"}, values)
}

func (r *SkillTreeRepository) GetSkillTreeQuestions(skillTreeId int64) ([]model.SkillTreeQuestion, error) {
	var questions []model.SkillTreeQuestion
	if err := r.db.Select(&questions, "SELECT * FROM skillTreeQuestions WHERE skillTreeId = ?", skillTreeId); err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *SkillTreeRepository) BulkCreateQuestions(questions []model.SkillTreeQuestion) error {
	values := make([][]any, 0)
	for _, question := range questions {
		var id *int64
		if question.Id != 0 {
			id = &question.Id
		}
		values = append(values, []any{id, question.SkillTreeId, question.Content, question.Choices_, question.CorrectChoice, question.Explanation, question.CreatedAt})
	}
	return database.BulkInsert(r.db, "skillTreeQuestions", []string{"id", "skillTreeId", "content", "choices", "correctChoice", "explanation", "createdAt"}, values)
}

func (r *SkillTreeRepository) SetSkillTreeQuestionStatus(id int64, status string) error {
	_, err := r.db.Exec("UPDATE skillTrees SET questionStatus = ? WHERE id = ?", status, id)
	return err
}

func (r *SkillTreeRepository) SetSkillTreeQuestionUserAnswer(questionId int64, answer int) error {
	_, err := r.db.Exec("UPDATE skillTreeQuestions SET userAnswer = ? WHERE id = ?", answer, questionId)
	return err
}

func (r *SkillTreeRepository) FindQuestionById(id int64) (*model.SkillTreeQuestion, error) {
	var question model.SkillTreeQuestion
	if err := r.db.Get(&question, "SELECT * FROM skillTreeQuestions WHERE id = ?", id); err != nil {
		return nil, err
	}
	return &question, nil
}

func (r *SkillTreeRepository) GetAllFinishedSkillTreeQuestions(userId int64) ([]model.SkillTreeQuestion, error) {
	var questions []model.SkillTreeQuestion
	if err := r.db.Select(&questions, "SELECT * FROM skillTreeQuestions WHERE skillTreeId IN (SELECT * FROM skillTrees WHERE userId = ? AND finished = 1)", userId); err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *SkillTreeRepository) FindSkillTreeEntryById(skillTreeEntryId int64) (*model.SkillTreeEntry, error) {
	var ret model.SkillTreeEntry
	if err := r.db.Get(&ret, "SELECT * FROM skillTreeEntries WHERE id = ?", skillTreeEntryId); err != nil {
		return nil, err
	}
	return &ret, nil
}

func (r *SkillTreeRepository) SetSkillTreeEntryContentStatus(skillTreeEntryId int64, status string) error {
	_, err := r.db.Exec("UPDATE skillTreeEntries SET contentStatus = ? WHERE id = ?", status, skillTreeEntryId)
	return err
}

func (r *SkillTreeRepository) SetSkillTreeEntryContentStatusAndContent(skillTreeEntryId int64, status string, content *string) error {
	_, err := r.db.Exec("UPDATE skillTreeEntries SET contentStatus = ?, content = ? WHERE id = ?", status, content, skillTreeEntryId)
	return err
}

func (r *SkillTreeRepository) SetFinished(skillTreeId int64) error {
	_, err := r.db.Exec("UPDATE skillTrees SET finished = 1 WHERE id = ?", skillTreeId)
	return err
}
