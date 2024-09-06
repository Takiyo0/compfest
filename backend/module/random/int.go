package random

import "math/rand"

func Int(min, max int) int {
	return min + rand.Intn(max-min)
}
