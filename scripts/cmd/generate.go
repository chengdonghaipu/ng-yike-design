package cmd

import (
	"fmt"
	"github.com/fsnotify/fsnotify"
	"github.com/spf13/cobra"
	"io/ioutil"
	"log"
	"ng-yike-design/script/flows"
	"ng-yike-design/script/generate"
	"ng-yike-design/script/util"
	"os"
	"path"
	"path/filepath"
	"strings"
	"sync"
)

var generateCommand = &cobra.Command{
	Use:     "generate",
	Aliases: []string{"g"},
	Short:   "Short",
	Long:    "Long",
}

var docCommand = &cobra.Command{
	Use:   "doc",
	Short: "generate doc project",
	Long:  "generate doc project",
	Run:   runDocCommand,
}

var serviceCommand = &cobra.Command{
	Use:   "service",
	Short: "generate doc project",
	Long:  "generate doc project",
	Run: func(cmd *cobra.Command, args []string) {

	},
}

func clearDoc(destinationDir string) {
	util.RemoveFilesInDirParallel(destinationDir)
}

func copyDoc(sourceDir, destinationDir string) {
	var wg sync.WaitGroup
	wg.Add(1)
	go util.CopyDirectory(sourceDir, destinationDir, &wg)
	wg.Wait()
}

func runDocCommand(cmd *cobra.Command, _ []string) {
	componentsDir, _ := cmd.Flags().GetString("components-dir")
	docDir, _ := cmd.Flags().GetString("doc-dir")
	docsDir, _ := cmd.Flags().GetString("docs-dir")
	watch, _ := cmd.Flags().GetBool("watch")
	sourceDir := path.Join("design-doc") // 源目录
	destinationDir := path.Join(docDir)  // 目标目录

	clearDesignDocTask := flows.NewTask("清除 design-doc", func() error {
		clearDoc(destinationDir)
		return nil
	})

	copyDesignDocTask := flows.NewTask("复制 design-doc", func() error {
		copyDoc(sourceDir, destinationDir)
		return nil
	})

	collectGlobalDocsTask := flows.NewTask("收集全局文档信息", func() error {
		return generate.NewGlobalDocs(docsDir).Collect()
	})

	generateComponentDocsTask := flows.NewTask("生成组件文档", func() error {
		return generate.CompileComponentDoc(docDir, componentsDir)
	})

	flows.SerialTask([]*flows.Task{
		clearDesignDocTask,
		copyDesignDocTask,
	})

	flows.ParallelTask([]*flows.Task{
		collectGlobalDocsTask,
		generateComponentDocsTask,
	})

	if watch {
		watchDoc(cmd)
	}

	fmt.Println(componentsDir)
	fmt.Println(docDir)
	fmt.Println(watch)
}

func watchDirectory(watcher *fsnotify.Watcher, dirPath string) error {
	return filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Println("Error:", err)
			return nil
		}

		// 匹配 demo 目录下的所有 .md 和 .ts 文件，以及 doc 目录下的所有 .md 文件
		if (strings.Contains(path, "demo") || strings.Contains(path, "doc")) && info.IsDir() {
			err = watcher.Add(path)
			if err != nil {
				log.Println("Error:", err)
			}
			fmt.Println("Watching directory:", path)
		}

		return nil
	})
}

func hasContentChanged(filePath string, prevContent string) (bool, error) {
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		return false, err
	}
	return string(content) != prevContent, nil
}

func watchDoc(cmd *cobra.Command) {
	componentsDir, _ := cmd.Flags().GetString("components-dir")
	//docDir, _ := cmd.Flags().GetString("doc-dir")
	fmt.Println(componentsDir)
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer func(watcher *fsnotify.Watcher) {
		err := watcher.Close()
		if err != nil {

		}
	}(watcher)

	err = watchDirectory(watcher, componentsDir)
	if err != nil {
		log.Fatal(err)
	}
	fileContents := make(map[string]string)
	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if event.Op&fsnotify.Write == fsnotify.Write && !strings.HasSuffix(event.Name, "~") {
				changed, err := hasContentChanged(event.Name, fileContents[event.Name])
				if err != nil {
					log.Println("Error:", err)
					continue
				}
				if changed {
					fmt.Println("File modified:", event.Name)
					content, err := ioutil.ReadFile(event.Name)
					if err != nil {
						log.Println("Error:", err)
						continue
					}
					fileContents[event.Name] = string(content)
				}
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("Error:", err)
		}
	}
}

func initDocCommand() {
	wd, err := os.Getwd()
	if err != nil {
		return
	}

	docCommand.Flags().String("components-dir", path.Join(wd, "projects", "components"), "components 绝对路径")
	docCommand.Flags().String("doc-dir", path.Join(wd, "projects", "design-doc"), "design-doc 绝对路径")
	docCommand.Flags().String("docs-dir", path.Join(wd, "docs"), "docs 绝对路径")
	docCommand.Flags().Bool("watch", true, "监听文件变化")
}

func init() {
	initDocCommand()
	generateCommand.AddCommand(docCommand)
	generateCommand.AddCommand(serviceCommand)
	rootCommand.AddCommand(generateCommand)
}
