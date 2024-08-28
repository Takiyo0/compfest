package repository

import (
	"github.com/jmoiron/sqlx"
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

func (r *SkillTreeRepository) Create(skillTree *model.SkillTree) (int64, error) {
	insert, err := r.db.Exec("INSERT INTO skillTrees (userId, content, childSkillTreeIds, createdAt) VALUES (?, ?, ?, ?)", skillTree.UserId, skillTree.Content, skillTree.CreatedAt)
	if err != nil {
		return 0, err
	}
	return insert.LastInsertId()
}
