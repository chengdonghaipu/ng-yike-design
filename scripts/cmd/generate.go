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
}

func (receiver *CompileDocTask) CompileTask() {
  flows.ParallelTask([]*flows.Task{
    receiver.ClearDesignDocTask,
    receiver.CopyDesignDocTask,
    receiver.CollectComponentDocsTask,
    receiver.CollectGlobalDocsTask,
    receiver.GenerateGlobalDocsTask,
  })
}

func (receiver *CompileDocTask) GenerateTask() {

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
    watchDoc(cmd)
  }
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
