package evaluation

type SkillTreeEntry struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type SkillTree struct {
	Category string
	Entries  []SkillTreeEntry
}
