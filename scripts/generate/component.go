package generate

import (
	"fmt"
	"io/ioutil"
	"log"
	"ng-yike-design/script/flows"
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

func (receiver *Component) copyDemoComponents() {
	var wg sync.WaitGroup

	for _, meta := range receiver.DemoMetas {
		wg.Add(1)
		go receiver.CopyComponent(meta.Filename, &wg)
	}

	wg.Wait()
}

func (receiver *Component) GenerateComponents() error {
	if receiver.DemoMetas == nil {
		return nil
	}

	receiver.copyDemoComponents()
	receiver.OutputTemplate("en")

	return receiver.OutputTemplate("zh")
}

func (receiver *Component) getApiComponentByLang(lang string) *util.ApiDocument {
	for _, componentDocument := range receiver.ComponentDocuments {
		if componentDocument.Language != lang && !strings.Contains(componentDocument.Language, lang) {
			continue
		}

		return componentDocument
	}

	return nil
}

func compileDemoDocLayout(docDir string, components []*Component, lang string) error {
	layoutTemplatePath := path.Join("template", "demo-container")
	layoutTemplate, err := util.ReadFile(layoutTemplatePath)

	var navList []string

	if err != nil {
		return err
	}

	groupedItems := make(map[string][]*Component)

	for _, item := range components {
		zhDoc := item.getApiComponentByLang(lang)

		if zhDoc == nil {
			continue
		}

		groupedItems[zhDoc.Metadata.Type] = append(groupedItems[zhDoc.Metadata.Type], item)
	}

	for typeValue, typeItems := range groupedItems {
		navList = append(
			navList,
			fmt.Sprintf(
				"        <li class=\"menu-item-group\"><div class=\"item-group-title\">%s</div></li>",
				typeValue,
			),
		)

		for _, document := range typeItems {
			zhDoc := document.getApiComponentByLang(lang)

			navList = append(
				navList,
				fmt.Sprintf(
					"        <li routerLink=\"%s\" routerLinkActive=\"router-active\"><a >%s<span class=\"subtitle\">%s</span></a></li>",
					fmt.Sprintf("/components/%s/%s", document.Name, lang),
					zhDoc.Metadata.Title,
					zhDoc.Metadata.Subtitle,
				),
			)
		}
	}

	layoutTemplate = strings.Replace(layoutTemplate, "{{navList}}", strings.Join(navList, "\n"), 1)

	demoDir := path.Join(docDir, "src", "app", "demo-module")
	layoutPath := path.Join(demoDir, "demo.component.ts")

	err = util.WriteFile(layoutPath, layoutTemplate)
	if err != nil {
		return err
	}

	return nil
}

func withRouteConfig(components []*Component, lang string, out interface{}) error {
	val := reflect.ValueOf(out)

	if val.Kind() != reflect.Ptr {
		return fmt.Errorf("out must be a pointer")
	}

	// 获取指针指向的值的类型
	val = val.Elem()

	if val.Kind() != reflect.Pointer {
		return fmt.Errorf("out must be a pointer")
	}

	originalVal, ok := val.Interface().(*RouteConfig)

	if !ok {
		return fmt.Errorf("out must be a pointer to a *RouteConfig")
	}

	if originalVal == nil {
		originalVal = &RouteConfig{
			RouteList: []string{},
			Imports:   []string{},
		}
	}

	for _, component := range components {
		originalVal.RouteList = append(
			originalVal.RouteList,
			fmt.Sprintf("{ path: '%s', component: %s }", component.GenerateRoutePath(lang), component.GenerateComponentName(lang)),
		)

		originalVal.Imports = append(
			originalVal.Imports,
			fmt.Sprintf(
				"import { %s } from './%s/%s';",
				component.GenerateComponentName(lang),
				component.Name,
				fmt.Sprintf(
					"%s.component",
					lang,
				),
			),
		)
	}

	val.Set(reflect.ValueOf(originalVal))

	return nil
}

func compileDemoRoute(docDir string, components []*Component) error {
	demoModulesDir := path.Join(docDir, "src", "app", "demo-module")
	routerPath := path.Join(demoModulesDir, "demo.routes.ts")
	routeTemplatePath := path.Join("template", "demo-route")
	routeTemplate, err := util.ReadFile(routeTemplatePath)

	if err != nil {
		return err
	}

	routeConfig := &RouteConfig{
		RouteList: []string{},
		Imports:   []string{},
	}

	_ = withRouteConfig(components, "zh", &routeConfig)
	_ = withRouteConfig(components, "en", &routeConfig)

	routeTemplate = strings.Replace(routeTemplate, "{{imports}}", strings.Join(routeConfig.Imports, "\n"), 1)
	routeTemplate = strings.Replace(routeTemplate, "{{routes}}", strings.Join(routeConfig.RouteList, ",\n      "), 1)
	// introduce.routes.ts

	err = util.WriteFile(routerPath, routeTemplate)
	if err != nil {
		return err
	}

	return nil
}

func CompileDemoDocs(docDir string, components []*Component) error {
	// 生成路由 没有执行顺序要求
	compileDemoRouteTask := flows.NewAutoNameTask(func() error {
		return compileDemoRoute(docDir, components)
	})

	// 生成布局 没有执行顺序要求
	compileDemoDocLayoutTask := flows.NewAutoNameTask(func() error {
		return compileDemoDocLayout(docDir, components, "zh")
	})

	flows.ParallelTask([]*flows.Task{
		compileDemoRouteTask,
		compileDemoDocLayoutTask,
	})

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

func (receiver *Component) GenerateRoutePath(lang string) string {
	lang = strings.Split(lang, "-")[0]

	routePath := fmt.Sprintf(
		"%s/%s",
		receiver.Name,
		lang,
	)

	return routePath
}

func (receiver *Component) GenerateComponentName(lang string) string {
	lang = strings.Split(lang, "-")[0]

	componentName := fmt.Sprintf(
		"NxDemo%s%sComponent",
		util.CapitalizeFirstLetter(strings.ReplaceAll(receiver.Name, "-", "")),
		util.CapitalizeFirstLetter(lang),
	)

	return componentName
}

func (receiver *Component) OutputComponent(demoDir, filename string) {

}
func (receiver *Component) CollectComponent(demoDir, filename string) {
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

func (receiver *Component) CopyComponent(filename string, wg *sync.WaitGroup) {
	defer wg.Done()
	componentPath := path.Join(receiver.DemoDir, filename)
	targetDir := path.Join(receiver.OutputDir, receiver.Name)

	// 创建目录，如果不存在的话
	err := os.MkdirAll(targetDir, os.ModePerm)
	if err != nil {
		fmt.Println("err", err)
		return
	}

	err = util.CopyFile(componentPath, path.Join(targetDir, filename))
	if err != nil {
		fmt.Println("err", err)
		return
	}
}

func (receiver *Component) OutputTemplate(lang string) error {
	demoName := receiver.Name
	demoMetas := receiver.DemoMetas

	var importDepComponentList []string
	var importComponentList []string

	componentName := fmt.Sprintf("NxDemo%s%sComponent", util.CapitalizeFirstLetter(demoName), util.CapitalizeFirstLetter(lang))

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
		fmt.Sprintf("%s.component.ts", lang),
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
