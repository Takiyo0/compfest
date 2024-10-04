package model

type LeveledSkillInfo struct {
	Name  string `json:"name" validate:"required"`
	Level int    `json:"level" validate:"min=1,max=3"`
}

type SkillInfo struct {
	Role             string   `json:"role" validate:"required,oneof=FRONTEND BACKEND"`
	RoleLanguages    []string `json:"roleLanguages" validate:"required"`
	LanguagesToLearn []string `json:"languagesToLearn" validate:"required"`
	ToolsToLearn     []string `json:"toolsToLearn" validate:"required,oneof=GIT DOCKER PROMETHEUS"`
}
