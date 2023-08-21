package main

import (
	"fmt"
	"ng-yike-design/script/cmd"
	"os"
)

func main() {
	err := cmd.Execute()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

/*package main

import (
	"ng-yike-design/script/flows"
	"time"
)

func main() {
	// 创建任务
	task1 := flows.NewTask("Task 1", func() error {
		time.Sleep(2 * time.Second)
		return nil
	})

	task2 := flows.NewTask("Task 2", func() error {
		time.Sleep(1 * time.Second)
		return nil
	})

	task3 := flows.NewTask("Task 3", func() error {
		time.Sleep(3 * time.Second)
		return nil
	})

	// 定义任务依赖关系
	task2.SetDependency(task1)
	task3.SetDependency(task1)

	// 内部是串行的任务
	flows.SerialTask([]*flows.Task{
		task1,
		task2,
		task3,
	})

	// 创建并行任务
	flows.ParallelTask([]*flows.Task{
		flows.NewTask("Parallel Task 1", func() error {
			time.Sleep(2 * time.Second)
			return nil
		}),
		flows.NewTask("Parallel Task 2", func() error {
			time.Sleep(1 * time.Second)
			return nil
		}),
		flows.NewTask("Parallel Task 3", func() error {
			time.Sleep(3 * time.Second)
			return nil
		}),
	})
}*/
