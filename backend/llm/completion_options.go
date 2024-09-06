package llm

type CompletionOptions struct {
	Prompt      string   `json:"prompt"`
	Temperature float64  `json:"temperature,omitempty"`
	TopK        int      `json:"top_k,omitempty"`
	TopP        float64  `json:"top_p,omitempty"`
	MinP        float64  `json:"min_p,omitempty"`
	NPredict    int      `json:"n_predict,omitempty"`
	NKeep       int      `json:"n_keep,omitempty"`
	Stop        []string `json:"stop,omitempty"`
	TfsZ        float64  `json:"tfs_z,omitempty"`
	Seed        int      `json:"seed,omitempty"`
	Stream      bool     `json:"stream,omitempty"`
	Grammar     string   `json:"grammar,omitempty"`
	JSONSchema  any      `json:"json_schema,omitempty"`
}
