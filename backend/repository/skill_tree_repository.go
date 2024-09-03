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
		values = append(values, []any{id, skillTree.UserId, skillTree.ChildSkillTreeIds_, skillTree.CreatedAt})
	}
	return database.BulkInsert(r.db, "skillTrees", []string{"id", "userId", "childSkillTreeIds", "createdAt"}, values)
}
