package ptr

func Make[T any](v T) *T {
	return &v
}

func Get[T any](p *T) T {
	return *p
}
