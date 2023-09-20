package cmd

import (
	"fmt"
	"github.com/fsnotify/fsnotify"
	"github.com/gookit/color"
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

func compileIcon(assetsDir, outputDir string) {
	templatePath := path.Join("template", "static-icons")
	template, err := util.ReadFile(templatePath)

	if err != nil {
		return
	}
	//var wg sync.WaitGroup
	maxDepth := 2 // 设置最大遍历深度为2
	var allIcons []string
	_ = filepath.Walk(assetsDir, func(filePath string, info os.FileInfo, err error) error {
		if err != nil {
			return fmt.Errorf("failure accessing a filePath %q: %v", filePath, err)
		}

		// 计算当前文件或目录的深度
		depth := strings.Count(filePath[len(assetsDir):], string(os.PathSeparator))

		// 如果深度超过最大深度，返回nil以停止遍历更深层次的目录
		if depth > maxDepth {
			return filepath.SkipDir
		}

		if info.IsDir() || depth != 2 {
			return nil
		}

		ext := strings.ToLower(filepath.Ext(info.Name()))
		if ext != ".svg" {
			return nil
		}

		svg, err := util.ReadFile(filePath)

		if err != nil {
			return err
		}

		iconType := filepath.Base(filepath.Dir(filePath))
		// 获取文件的名称（不包括后缀名）
		fileName := strings.TrimSuffix(filepath.Base(filePath), filepath.Ext(filePath))
		exportName := util.ToCamelCase(fmt.Sprintf("%s-%s", fileName, iconType))

		templateNew := strings.Replace(template, "{{export}}", exportName, 1)
		templateNew = strings.Replace(templateNew, "{{name}}", fileName, 1)
		templateNew = strings.Replace(templateNew, "{{icon}}", svg, 1)
		templateNew = strings.Replace(templateNew, "{{type}}", iconType, 1)

		allIcons = append(allIcons, templateNew)

		outputPath := path.Join(outputDir, "static-icons.ts")
		//fmt.Println(filePath)
		if len(allIcons) > 0 {
			_ = util.WriteFile(outputPath, strings.Join(allIcons, "\n"))
		}
		return nil
	})
}

var staticIconsCommand = &cobra.Command{
	Use:     "static-icons",
	Aliases: []string{"si"},
	Short:   "generate doc static-icons",
	Long:    "generate doc static-icons",
	Run: func(cmd *cobra.Command, args []string) {
		componentsDir, _ := cmd.Flags().GetString("components-dir")
		outputDir := path.Join(componentsDir, "icon")
		assetsDir := path.Join(componentsDir, "icon", "assets")

		if !util.DirectoryExists(assetsDir) {
			color.Yellow.Println(fmt.Sprintf("%s dir not found", assetsDir))
			return
		}

		if !util.DirectoryExists(outputDir) {
			err := os.MkdirAll(outputDir, os.ModePerm)
			if err != nil {
				log.Fatal(err)
			}
		}
		compileIcon(assetsDir, outputDir)
		//docsDir, _ := cmd.Flags().GetString("docs-dir")
		//watch, _ := cmd.Flags().GetBool("watch")
		//sourceDir := path.Join("design-doc") // 源目录
	},
}

var serviceCommand = &cobra.Command{
	Use:   "service",
	Short: "generate doc project",
	Long:  "generate doc project",
	Run: func(cmd *cobra.Command, args []string) {

	},
}

type CompileDocTask struct {
	ComponentsDir            string
	DocDir                   string
	DocsDir                  string
	SourceDocDir             string
	ClearDesignDocTask       *flows.Task
	CopyDesignDocTask        *flows.Task
	CollectGlobalDocsTask    *flows.Task
	CollectComponentDocsTask *flows.Task
	GenerateGlobalDocsTask   *flows.Task
	GenerateDemoDocsTask     *flows.Task
	GlobalDocs               *generate.GlobalDocs
	Components               []*generate.Component
}

func NewCompileDocTask(componentsDir string, docDir string, docsDir string, sourceDocDir string) *CompileDocTask {
	task := &CompileDocTask{
		ComponentsDir: componentsDir,
		DocDir:        docDir,
		DocsDir:       docsDir,
		SourceDocDir:  sourceDocDir,
	}

	task.registrationTask()

	return task
}

func (receiver *CompileDocTask) clearTaskHandler() error {
	return util.RemoveFilesInDirParallel(receiver.DocDir)
}

func (receiver *CompileDocTask) UpdateByPath(mdPath string) {
	isDocsChange := strings.Contains(mdPath, receiver.DocsDir)

	if isDocsChange {
		util.MeasureTime(fmt.Sprintf("[WATCHING][DOCS UPDATE] %s", mdPath), func() {
			receiver.GlobalDocs.UpdateByPath(mdPath)
		})
		return
	}

	isDemoChange := strings.Contains(mdPath, receiver.ComponentsDir) &&
		strings.Contains(strings.Replace(mdPath, receiver.ComponentsDir, "", 1), "demo")

	isDemoCodeChange := isDemoChange && filepath.Ext(mdPath) == ".ts"
	isDemoDocChange := isDemoChange && filepath.Ext(mdPath) == ".md"

	component := util.NewSliceHelper(receiver.Components).Find(func(component *generate.Component) bool {
		return strings.Contains(util.ReplacePathSeparator(mdPath), util.ReplacePathSeparator(component.ComponentDir))
	})

	if isDemoChange {
		if component == nil {
			return
		}

		if isDemoCodeChange {
			util.MeasureTime(fmt.Sprintf("[WATCHING][DEMO CODE UPDATE] %s", mdPath), func() {
				component.UpdateCodeByPath(mdPath)
			})
		} else if isDemoDocChange {
			util.MeasureTime(fmt.Sprintf("[WATCHING][DEMO DOC UPDATE] %s", mdPath), func() {
				component.UpdateDocByPath(mdPath)
			})
		}

		return
	}

	isDemoApiDocChange := strings.Contains(mdPath, receiver.ComponentsDir) &&
		strings.Contains(strings.Replace(mdPath, receiver.ComponentsDir, "", 1), "doc")

	if isDemoApiDocChange {
		if component == nil {
			return
		}

		util.MeasureTime(fmt.Sprintf("[WATCHING][DEMO API DOC UPDATE] %s", mdPath), func() {
			component.UpdateApiDocByPath(mdPath)
		})
	}
}

func (receiver *CompileDocTask) collectGlobalDocsTaskHandler() error {
	receiver.GlobalDocs = generate.NewGlobalDocs(receiver.DocsDir, receiver.DocDir)
	return receiver.GlobalDocs.Collect()
}

func (receiver *CompileDocTask) collectComponentDocsTaskHandler() error {
	err := generate.CollectComponentDoc(receiver.DocDir, receiver.ComponentsDir, &receiver.Components)
	if err != nil {
		return err
	}
	return nil
}

func (receiver *CompileDocTask) generateGlobalDocsTaskHandler() error {
	return receiver.GlobalDocs.Generate()
}

func (receiver *CompileDocTask) generateDemoDocsTaskHandler() error {
	if receiver.Components == nil {
		return nil
	}

	flows.ParallelTask([]*flows.Task{
		flows.NewAutoNameTask(func() error {
			for _, component := range receiver.Components {
				err := component.GenerateComponents()

				if err != nil {
					return err
				}
			}
			return nil
		}),
		flows.NewAutoNameTask(func() error {
			return generate.CompileDemoDocs(receiver.DocDir, receiver.Components)
		}),
	})

	return nil
}

func (receiver *CompileDocTask) copyDocProjectTaskHandler() error {
	var wg sync.WaitGroup
	wg.Add(1)
	go util.CopyDirectory(receiver.SourceDocDir, receiver.DocDir, &wg)
	wg.Wait()

	return nil
}

func (receiver *CompileDocTask) registrationTask() {
	receiver.ClearDesignDocTask = flows.NewTask("清除 design-doc", receiver.clearTaskHandler)
	receiver.CopyDesignDocTask = flows.NewTask("复制 design-doc", receiver.copyDocProjectTaskHandler)
	receiver.CopyDesignDocTask.SetDependency(receiver.ClearDesignDocTask)
	receiver.CollectGlobalDocsTask = flows.NewTask("收集全局文档信息", receiver.collectGlobalDocsTaskHandler)
	receiver.CollectComponentDocsTask = flows.NewTask("收集组件文档信息", receiver.collectComponentDocsTaskHandler)
	receiver.GenerateGlobalDocsTask = flows.NewTask("生成全局文档", receiver.generateGlobalDocsTaskHandler)

	receiver.GenerateGlobalDocsTask.SetDependency(
		receiver.CopyDesignDocTask,
		receiver.CollectGlobalDocsTask,
	)

	receiver.GenerateDemoDocsTask = flows.NewTask("生成demo文档", receiver.generateDemoDocsTaskHandler)

	receiver.GenerateDemoDocsTask.SetDependency(receiver.CollectComponentDocsTask)
}

func (receiver *CompileDocTask) CompileTask() {
	flows.ParallelTask([]*flows.Task{
		receiver.ClearDesignDocTask,
		receiver.CopyDesignDocTask,
		receiver.CollectComponentDocsTask,
		receiver.CollectGlobalDocsTask,
	})
}

func (receiver *CompileDocTask) GenerateTask() {
	flows.ParallelTask([]*flows.Task{
		receiver.GenerateGlobalDocsTask,
		receiver.GenerateDemoDocsTask,
	})
}

func runDocCommand(cmd *cobra.Command, _ []string) {
	componentsDir, _ := cmd.Flags().GetString("components-dir")
	docDir, _ := cmd.Flags().GetString("doc-dir")
	docsDir, _ := cmd.Flags().GetString("docs-dir")
	watch, _ := cmd.Flags().GetBool("watch")
	sourceDir := path.Join("design-doc") // 源目录

	compileDocTask := NewCompileDocTask(componentsDir, docDir, docsDir, sourceDir)

	compileDocTask.CompileTask()

	compileDocTask.GenerateTask()

	if watch {
		watchDoc(cmd, compileDocTask)
	}
}

func watchDirectory(watcher *fsnotify.Watcher, dirPath string) {
	filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Println("Error:", err)
			return nil
		}

		// 匹配 demo 目录下的所有 .md 和 .ts 文件，以及 doc 目录下的所有 .md 文件
		if info.IsDir() && path != dirPath {
			err = watcher.Add(path)
			if err != nil {
				log.Println("Error:", err)
			}
			fmt.Println("Watching directory:", path)
		}

		return nil
	})
}

func watchDemoDirectory(watcher *fsnotify.Watcher, dirPath string) error {
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

func watchDoc(cmd *cobra.Command, compileDocTask *CompileDocTask) {
	componentsDir, _ := cmd.Flags().GetString("components-dir")
	docsDir, _ := cmd.Flags().GetString("docs-dir")
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer func(watcher *fsnotify.Watcher) {
		err := watcher.Close()
		if err != nil {

		}
	}(watcher)

	watchDirectory(watcher, docsDir)
	err = watchDemoDirectory(watcher, componentsDir)
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
					//fmt.Println("File modified:", event.Name, event.Op.String())
					go compileDocTask.UpdateByPath(event.Name)
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

	staticIconsCommand.Flags().String("components-dir", path.Join(wd, "projects", "components"), "components 绝对路径")
}

func init() {
	initDocCommand()
	generateCommand.AddCommand(docCommand)
	generateCommand.AddCommand(serviceCommand)
	generateCommand.AddCommand(staticIconsCommand)
	rootCommand.AddCommand(generateCommand)
}
