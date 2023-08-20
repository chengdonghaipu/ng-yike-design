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
	Name         string
	OutputDir    string
	DocDir       string
	ComponentDir string
	TemplatePath string
}

func NewComponent(name, docDir, componentDir string) *Component {
	outputDir := path.Join(docDir, "src", "app", "demo-module")

	// 创建目录，如果不存在的话
	err := os.MkdirAll(outputDir, os.ModePerm)
	if err != nil {
		log.Fatal(err)
	}

	return &Component{
		Name:         name,
		DocDir:       docDir,
		OutputDir:    outputDir,
		ComponentDir: componentDir,
		TemplatePath: path.Join("template", "demo-component"),
	}
}

type DemoMeta struct {
	Name     string
	Filename string
	FilePath string
}

func (receiver *Component) OutputComponents() error {
	componentDir := receiver.ComponentDir
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

			err := NewComponent(componentName, docDir, demoDir).OutputComponents()
			if err != nil {
				fmt.Println("err: ", err)
				return
			}
		}(demoDir, file.Name())
	}

	wg.Wait()

	return nil
}
