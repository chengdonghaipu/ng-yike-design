package flows

import (
	"fmt"
	"sync"
	"time"
)

type Task struct {
	Name       string
	Work       func() error
	Dependency *Task
	mu         sync.Mutex
	cond       *sync.Cond
	done       bool
	StartTime  time.Time
	EndTime    time.Time
}

func printExecutionTime(task *Task) {
	executionTime := task.EndTime.Sub(task.StartTime).Milliseconds()
	fmt.Printf("[%s] completed Execution time: %d ms\n", task.Name, executionTime)
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

func (t *Task) SetDependency(dependency *Task) {
	t.Dependency = dependency
}

func (t *Task) Run() error {
	if t.Dependency != nil {
		t.Dependency.WaitForCompletion()
	}

	t.mu.Lock()
	defer t.mu.Unlock()

	t.StartTime = time.Now()
	fmt.Printf("[%s] Task started\n", t.Name)
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
