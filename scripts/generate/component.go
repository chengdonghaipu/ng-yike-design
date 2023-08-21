package generate

import (
  "fmt"
  "io/ioutil"
  "log"
  "ng-yike-design/script/util"
  "os"
  "path"
  "path/filepath"
  "strings"
  "sync"
)

type Component struct {
  // 组件名称 比如: button
  Name      string
  OutputDir string
  DocDir    string
  // button
  ComponentDir string
  // button/demo
  DemoDir string
  // 组件文档目录 button/doc
  ComponentDocDir   string
  TemplatePath      string
  DemoDocument      []*util.Document
  ComponentDocument []*util.ApiDocument
}

func NewComponent(name, docDir, componentDir string) *Component {
  outputDir := path.Join(docDir, "src", "app", "demo-module")

  // 创建目录，如果不存在的话
  err := os.MkdirAll(outputDir, os.ModePerm)
  if err != nil {
    log.Fatal(err)
  }

  return &Component{
    Name:            name,
    DocDir:          docDir,
    OutputDir:       outputDir,
    ComponentDir:    componentDir,
    DemoDir:         path.Join(componentDir, "demo"),
    ComponentDocDir: path.Join(componentDir, "doc"),
    TemplatePath:    path.Join("template", "demo-component"),
  }
}

type DemoMeta struct {
  Name     string
  Filename string
  FilePath string
}

func (receiver *Component) OutputComponents() error {
  componentDir := receiver.DemoDir
  var demoMetas []*DemoMeta
  files, err := ioutil.ReadDir(componentDir)

  if err != nil {
    log.Println("Error:", err)
    return err
  }
  var wg sync.WaitGroup

  for _, file := range files {
    if file.IsDir() {
      continue
    }

    filename := file.Name()
    // && !strings.HasSuffix(filename, ".md")
    if !strings.HasSuffix(filename, ".ts") {
      continue
    }

    demoMeta := &DemoMeta{
      Name:     strings.Replace(filename, ".ts", "", 1),
      Filename: filename,
      FilePath: filepath.Join(componentDir, filename),
    }

    demoMetas = append(demoMetas, demoMeta)

    wg.Add(1)

    go func(filePath string) {
      defer wg.Done()
      receiver.OutputComponent(componentDir, filename)
    }(demoMeta.FilePath)
  }

  wg.Add(1)

  go receiver.resolveApiMd(&wg)

  wg.Add(1)
  go func() {
    defer wg.Done()
    err := receiver.OutputTemplate(demoMetas)
    if err != nil {
      return
    }
  }()

  wg.Wait()

  return nil
}

func (receiver *Component) OutputComponent(demoDir, filename string) {
  err := receiver.CopyComponent(demoDir, filename)
  if err != nil {
    fmt.Println("err: ", err)
    return
  }

  receiver.resolveMd(demoDir, filename)
}

func (receiver *Component) resolveApiMd(wg *sync.WaitGroup) {
  defer wg.Done()
  componentDocDir := receiver.ComponentDocDir

  dirs, err := ioutil.ReadDir(componentDocDir)

  if err != nil {
    log.Println("Error:", err)
    return
  }

  for _, file := range dirs {
    if file.IsDir() {
      continue
    }

    filename := file.Name()

    if !strings.HasSuffix(filename, ".md") {
      continue
    }

    mdFilePath := path.Join(componentDocDir, filename)
    document, err := util.ParseApiDocument(mdFilePath)

    if err != nil {
      log.Fatal("Error parsing markdown:", err)
    }

    receiver.ComponentDocument = append(receiver.ComponentDocument, document)
  }
}

func (receiver *Component) resolveMd(demoDir, filename string) {
  mdFilePath := path.Join(demoDir, strings.Replace(filename, ".ts", ".md", 1))

  if !util.DirectoryExists(mdFilePath) {
    return
  }

  document, err := util.ParseMarkdown(mdFilePath)
  if err != nil {
    log.Fatal("Error parsing markdown:", err)
  }

  receiver.DemoDocument = append(receiver.DemoDocument, document)

  fmt.Printf("Order: %d\n", document.Metadata.Order)
  fmt.Printf("Title (zh-CN): %s\n", document.Metadata.Title.ZhCN)
  fmt.Printf("Title (en-US): %s\n", document.Metadata.Title.EnUS)
  fmt.Printf("zh-CN HTML:\n%s\n", document.ZhCN)
  fmt.Printf("en-US HTML:\n%s\n", document.EnUS)

}

func (receiver *Component) CopyComponent(demoDir, filename string) error {
  componentPath := path.Join(demoDir, filename)
  targetDir := path.Join(receiver.OutputDir, receiver.Name)

  // 创建目录，如果不存在的话
  err := os.MkdirAll(targetDir, os.ModePerm)
  if err != nil {
    return err
  }

  err = util.CopyFile(componentPath, path.Join(targetDir, filename))
  if err != nil {
    return err
  }

  return nil
}

func (receiver *Component) OutputTemplate(demoMetas []*DemoMeta) error {
  demoName := receiver.Name
  var importDepComponentList []string
  var importComponentList []string
  componentName := fmt.Sprintf("NxDemo%s%sComponent", util.CapitalizeFirstLetter(demoName), util.CapitalizeFirstLetter("zh"))

  for _, meta := range demoMetas {
    demoComponentName := fmt.Sprintf("%sComponent", util.CapitalizeFirstLetter(meta.Name))
    importComponentList = append(importComponentList, demoComponentName)
    dep := fmt.Sprintf("import { %sComponent } from './%s';", util.CapitalizeFirstLetter(meta.Name), meta.Name)
    importDepComponentList = append(importDepComponentList, dep)
  }

  template, err := util.ReadFile(receiver.TemplatePath)

  if err != nil {
    return err
  }

  template = strings.Replace(template, "{{imports}}", strings.Join(importDepComponentList, "\n"), 1)
  template = strings.Replace(template, "{{demoName}}", demoName, 1)
  template = strings.Replace(template, "{{importComponentList}}", strings.Join(importComponentList, ",\n   "), 1)
  template = strings.Replace(template, "{{componentName}}", componentName, 1)

  targetDir := path.Join(
    receiver.OutputDir,
    receiver.Name,
    "zh.component.ts",
  )

  err = util.WriteFile(targetDir, template)
  if err != nil {
    return err
  }
  return nil
}

func OutputComponent(docDir, componentDir string) error {
  dirs, err := ioutil.ReadDir(componentDir)

  if err != nil {
    log.Println("Error:", err)
    return err
  }

  var wg sync.WaitGroup
  for _, file := range dirs {
    if !file.IsDir() {
      continue
    }

    demoDir := path.Join(componentDir, file.Name(), "demo")

    if !util.DirectoryExists(demoDir) {
      continue
    }

    wg.Add(1)
    go func(demoDir, componentName string) {
      go wg.Done()

      err := NewComponent(componentName, docDir, path.Join(componentDir, componentName)).OutputComponents()
      if err != nil {
        fmt.Println("err: ", err)
        return
      }
    }(demoDir, file.Name())
  }

  wg.Wait()

  return nil
}
