package util

type Predicate[T any] func(T) bool

type SliceHelper[T any] struct {
	slice []T
}

func NewSliceHelper[T any](slice []T) *SliceHelper[T] {
	return &SliceHelper[T]{
		slice: slice,
	}
}

func (sh *SliceHelper[T]) Find(predicate Predicate[T]) T {
	for _, item := range sh.slice {
		if predicate(item) {
			return item
		}
	}

	var zeroValue T

	return zeroValue
}

func (sh *SliceHelper[T]) FindIndex(predicate Predicate[T]) int {
	for i, item := range sh.slice {
		if predicate(item) {
			return i
		}
	}

	return -1
}
