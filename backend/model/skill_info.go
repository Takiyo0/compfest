package model

type SkillInfo struct {
	KnownLanguages   []string `json:"knownLanguages"`
	AlgoDSComfort    *int     `json:"algoDSComfort" validate:"required,min=0,max=5"`
	AlgoExp          *bool    `json:"algoExp" validate:"required"`
	UseGit           *bool    `json:"useGit" validate:"required"`
	DoCodingChalls   *bool    `json:"doCodingChalls" validate:"required"`
	KnownFw          []string `json:"knownFw" validate:"required"`
	FeExp            *bool    `json:"feExp" validate:"required"`
	BeExp            *bool    `json:"beExp" validate:"required"`
	FsProficiency    *int     `json:"fsProficiency,min=0,max=5"`
	KnownDB          []string `json:"knownDB"`
	TestingExp       *bool    `json:"testingExp" validate:"required"`
	DebugFamiliarity *int     `json:"debugFamiliarity,min=0,max=5"`
	TeamWorkExp      *bool    `json:"teamWorkExp" validate:"required"`
	CloudFamiliarity *int     `json:"cloudFamiliarity,min=0,max=5"`
	TechUpdates      *bool    `json:"techUpdates" validate:"required"`
}
