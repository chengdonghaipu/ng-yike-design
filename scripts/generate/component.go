package generate

import (
	"fmt"
	"io/ioutil"
	"log"
	"ng-yike-design/script/util"
	"os"
	"path"
	"path/filepath"
	"reflect"
	"sort"
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
	ComponentDocDir    string
	TemplatePath       string
	DemoDocuments      []*util.Document
	ComponentDocuments []*util.ApiDocument
	DemoMetas          []*DemoMeta
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

func (receiver *Component) GenerateComponents() error {
	return nil
}

func (receiver *Component) CollectComponents() error {
	componentDir := receiver.DemoDir
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

		receiver.DemoMetas = append(receiver.DemoMetas, demoMeta)

		wg.Add(1)

		go func(filePath string) {
			defer wg.Done()
			receiver.CollectComponent(componentDir, filename)
		}(demoMeta.FilePath)
	}

	wg.Add(1)

	go receiver.resolveApiMd(&wg)

	wg.Wait()

	return nil
}

func (receiver *Component) OutputComponent(demoDir, filename string) {

}
func (receiver *Component) CollectComponent(demoDir, filename string) {
	//err := receiver.CopyComponent(demoDir, filename)
	//if err != nil {
	//  fmt.Println("err: ", err)
	//  return
	//}

	receiver.resolveMd(demoDir, filename)

	sort.Slice(receiver.DemoDocuments, func(i, j int) bool {
		return receiver.DemoDocuments[i].Metadata.Order < receiver.DemoDocuments[j].Metadata.Order
	})
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

		receiver.ComponentDocuments = append(receiver.ComponentDocuments, document)
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

	receiver.DemoDocuments = append(receiver.DemoDocuments, document)
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

func CollectComponentDoc(docDir, componentDir string, out interface{}) error {
	// 使用反射设置字段的值
	val := reflect.ValueOf(out)

	if val.Kind() == reflect.Ptr && val.Elem().Kind() == reflect.Slice {
		dirs, err := ioutil.ReadDir(componentDir)

		if err != nil {
			log.Println("Error:", err)
			return err
		}

		var components []*Component

		var wg sync.WaitGroup
		var mu sync.Mutex

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
				defer wg.Done()
				component := NewComponent(componentName, docDir, path.Join(componentDir, componentName))
				mu.Lock()
				components = append(components, component)
				mu.Unlock()
				err := component.CollectComponents()
				if err != nil {
					fmt.Println("err: ", err)
					return
				}
			}(demoDir, file.Name())
		}

		wg.Wait()
		val.Elem().Set(reflect.ValueOf(components))
		return nil
	}

	return nil
}

func CompileComponentDoc(docDir, componentDir string) error {
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

			err := NewComponent(componentName, docDir, path.Join(componentDir, componentName)).GenerateComponents()
			if err != nil {
				fmt.Println("err: ", err)
				return
			}
		}(demoDir, file.Name())
	}

	wg.Wait()

	return nil
}
