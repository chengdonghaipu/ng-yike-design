package main

import (
	"fmt"
	"ng-yike-design/script/cmd"
	"os"
	osExec "os/exec"
	"path"
	"strings"
)

func startNodeServe(ready chan<- struct{}) {
	cmdNode := osExec.Command("node", "start.js")
	cmdNode.Dir = path.Join("node-shell")
	// 设置标准输出管道
	stdout, err := cmdNode.StdoutPipe()
	if err != nil {
		fmt.Printf("无法获取标准输出管道: %v\n", err)
		return
	}

	err = cmdNode.Start()
	if err != nil {
		fmt.Printf("命令执行失败: %v\n", err)
		return
	}

	// 启动goroutine来监控Node.js的输出
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := stdout.Read(buf)
			if err != nil {
				fmt.Printf("无法读取标准输出: %v\n", err)
				break
			}

			output := string(buf[:n])
			fmt.Print(output)

			if strings.Contains(output, "Server is running") {
				ready <- struct{}{} // 发送通知，Node.js服务器已成功启动
				break
			}
		}
	}()

	err = cmdNode.Wait()
	if err != nil {
		fmt.Printf("Node.js服务器执行失败: %v\n", err)
		close(ready) // 在发生错误时关闭通知通道
	}
}

func main() {
	ready := make(chan struct{})
	go startNodeServe(ready)
	<-ready
	// 我想确保startNodeServe已经启动成功了才往下执行
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
