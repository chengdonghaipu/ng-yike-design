package flows

import (
	"fmt"
	"github.com/gookit/color"
	"sync"
	"time"
)

type Task struct {
	Name         string
	Work         func() error
	Dependencies []*Task
	mu           sync.Mutex
	cond         *sync.Cond
	done         bool
	StartTime    time.Time
	EndTime      time.Time
}

func printExecutionTime(task *Task) {
	executionTime := task.EndTime.Sub(task.StartTime).Milliseconds()
	color.Green.Println(fmt.Sprintf("[%s] completed Execution time: %d ms", task.Name, executionTime))
}

func NewTask(name string, work func() error) *Task {
	task := &Task{
		Name: name,
		Work: work,
		done: false,
	}
	task.cond = sync.NewCond(&task.mu)
	return task
}

func (t *Task) SetDependency(dependencies ...*Task) {
	t.Dependencies = append(t.Dependencies, dependencies...)
}

func (t *Task) WaitForDependencies() {
	for _, dep := range t.Dependencies {
		dep.WaitForCompletion()
	}
}

func (t *Task) Run() error {
	t.WaitForDependencies()

	t.mu.Lock()
	defer t.mu.Unlock()

	t.StartTime = time.Now()
	color.Green.Println(fmt.Sprintf("[%s] Task started", t.Name))
	err := t.Work()
	if err != nil {
		return err
	}
	t.EndTime = time.Now()

	t.done = true
	printExecutionTime(t)
	t.cond.Broadcast()

	return nil
}

func (t *Task) WaitForCompletion() {
	t.mu.Lock()
	defer t.mu.Unlock()

	for !t.done {
		t.cond.Wait()
	}
}

func SerialTask(tasks []*Task) {
	for _, task := range tasks {
		task.Run()
	}
}

func ParallelTask(tasks []*Task) {
	var wg sync.WaitGroup

	for _, task := range tasks {
		wg.Add(1)
		go func(t *Task) {
			defer wg.Done()
			t.Run()
		}(task)
	}

	wg.Wait()
}
