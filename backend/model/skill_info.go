package model

type LeveledSkillInfo struct {
	Name  string `json:"language" validate:"required"`
	Level int    `json:"level" validate:"min=1,max=3"`
}

type SkillInfo struct {
	KnownLanguages []LeveledSkillInfo `json:"knownLanguages"`
	AlgoDSComfort  *int               `json:"algoDSComfort" validate:"required,min=0,max=5"`
	AlgoExp        *bool              `json:"algoExp" validate:"required"`
	UseGit         *bool              `json:"useGit" validate:"required"`
	DoCodingChalls *bool              `json:"doCodingChalls" validate:"required"`
	KnownDB        []LeveledSkillInfo `json:"knownDB"`
}
