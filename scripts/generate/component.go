package generate

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"ng-yike-design/script/flows"
	"ng-yike-design/script/util"
	"os"
	"path"
	"path/filepath"
	"reflect"
	"regexp"
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
	MdDemoMetas        []*util.DemoMeta
}

func NewComponent(name, docDir, componentDir string) *Component {
	outputDir := path.Join(docDir, "src", "app", "demo-module")

	// 创建目录，如果不存在的话
	err := os.MkdirAll(outputDir, os.ModePerm)
	if err != nil {
		log.Fatal(err)
	}
	demoDir := path.Join(componentDir, "demo")
	files, err := ioutil.ReadDir(demoDir)
	var demoMetas []*DemoMeta
	var mdDemoMeta []*util.DemoMeta
	if err != nil {
		log.Println("Error:", err)
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filename := file.Name()
		if !strings.HasSuffix(filename, ".ts") {
			continue
		}

		demoMeta := &DemoMeta{
			Name:     strings.Replace(filename, ".ts", "", 1),
			Filename: filename,
			FilePath: filepath.Join(demoDir, filename),
		}

		mdDemoMeta = append(mdDemoMeta, &util.DemoMeta{
			ComponentName: name,
			Filename:      demoMeta.Name,
			FilePath:      demoMeta.FilePath,
		})

		demoMetas = append(demoMetas, demoMeta)
	}

	return &Component{
		Name:            name,
		DocDir:          docDir,
		OutputDir:       outputDir,
		ComponentDir:    componentDir,
		DemoDir:         demoDir,
		DemoMetas:       demoMetas,
		MdDemoMetas:     mdDemoMeta,
		ComponentDocDir: path.Join(componentDir, "doc"),
		TemplatePath:    path.Join("template", "demo-component"),
	}
}

type DemoMeta struct {
	Name     string
	Filename string
	FilePath string
}

func (receiver *Component) UpdateCodeByPath(codePath string) {
	var wg sync.WaitGroup
	wg.Add(1)
	go receiver.CopyComponent(filepath.Base(codePath), &wg)
	wg.Wait()
}

func (receiver *Component) UpdateApiDocByPath(mdPath string) {
	receiver.resolveApiMdByPath(mdPath)

	filename := filepath.Base(mdPath)

	if !strings.Contains(filename, "-") {
		log.Fatal("Error:", errors.New(fmt.Sprintf("The filename %s hould be connected with - eg zh-CH.md ", filename)))
	}

	lang := strings.Split(filename, "-")[0]

	_ = receiver.OutputTemplate(lang)
}

func (receiver *Component) UpdateDocByPath(mdPath string) {
	demoMeta := util.NewSliceHelper(receiver.DemoMetas).Find(func(meta *DemoMeta) bool {
		return strings.Contains(filepath.Base(mdPath), meta.Filename)
	})

	if demoMeta == nil {
		return
	}

	receiver.resolveMd(receiver.DemoDir, demoMeta.Filename)

	//receiver.resolveMd(demoDir, filename)
	_ = receiver.OutputTemplate("en")
	_ = receiver.OutputTemplate("zh")
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
	_ = receiver.OutputTemplate("en")

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

func clearDemoCode(docDir string) error {
	assetsDir := path.Join(docDir, "src", "assets", "demo-codes")
	return util.RemoveFilesInDirParallel(assetsDir)
}

func compileDemoCode(components []*Component) error {
	if len(components) == 0 {
		return nil
	}

	docDir := components[0].DocDir

	assetsDir := path.Join(docDir, "src", "assets", "demo-codes")

	err := os.MkdirAll(assetsDir, os.ModePerm)
	if err != nil {
		fmt.Println("err", err)
		return err
	}

	for _, component := range components {
		for _, document := range component.ComponentDocuments {
			for name, code := range document.HighlightCode {
				outputPath := path.Join(fmt.Sprintf("%s.json", path.Join(assetsDir, name)))
				codeStr, err := json.Marshal(code)

				if err != nil {
					continue
				}
				_ = util.WriteFile(outputPath, string(codeStr))
			}
		}
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
		loadChildren := fmt.Sprintf(
			"() => import('./%s/%s.component').then(mod => mod.%s)",
			component.Name,
			lang,
			component.GenerateComponentName(lang),
		)
		originalVal.RouteList = append(
			originalVal.RouteList,
			fmt.Sprintf("{ path: '%s', loadComponent: %s }", component.GenerateRoutePath(lang), loadChildren),
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

	firstRoute := routeConfig.RouteList[0]

	pattern := `'([^']+)'\s*,\s*(component|loadComponent)`

	re := regexp.MustCompile(pattern)
	match := re.FindStringSubmatch(firstRoute)

	if len(match) > 1 {
		routeConfig.RouteList = append([]string{
			fmt.Sprintf("{ path: '', redirectTo: '%s', pathMatch: 'full' }", match[1]),
		}, routeConfig.RouteList...)
	}

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

	// 清除高亮代码缓存
	clearDemoCodeTask := flows.NewTask("清除DEMO缓存", func() error {
		return clearDemoCode(docDir)
	})

	// 生成高亮代码 没有执行顺序要求
	compileDemoCodeTask := flows.NewAutoNameTask(func() error {
		return compileDemoCode(components)
	})

	compileDemoCodeTask.SetDependency(clearDemoCodeTask)

	flows.ParallelTask([]*flows.Task{
		clearDemoCodeTask,
		compileDemoRouteTask,
		compileDemoDocLayoutTask,
		compileDemoCodeTask,
	})

	return nil
}

func (receiver *Component) CollectComponents() error {
	componentDir := receiver.DemoDir

	var wg sync.WaitGroup

	for _, meta := range receiver.DemoMetas {
		wg.Add(1)

		go func(meta *DemoMeta) {
			defer wg.Done()
			receiver.CollectComponent(componentDir, meta.Filename)
		}(meta)
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

func (receiver *Component) resolveApiMdByPath(mdFilePath string) (addFlag bool) {
	document, err := util.ParseApiDocument(mdFilePath, receiver.MdDemoMetas)
	addFlag = false

	if err != nil {
		log.Fatal("Error parsing markdown:", err)
		return
	}

	index := util.NewSliceHelper(receiver.ComponentDocuments).FindIndex(func(document *util.ApiDocument) bool {
		return strings.Replace(document.FilePath, "\\", "/", -1) == strings.Replace(mdFilePath, "\\", "/", -1)
	})

	if index < 0 {
		addFlag = true
		receiver.ComponentDocuments = append(receiver.ComponentDocuments, document)
		return
	}

	receiver.ComponentDocuments[index] = document

	return
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
		document, err := util.ParseApiDocument(mdFilePath, receiver.MdDemoMetas)

		if err != nil {
			log.Fatal("Error parsing markdown:", err)
		}

		receiver.ComponentDocuments = append(receiver.ComponentDocuments, document)
	}
}

func (receiver *Component) resolveMd(demoDir, filename string) (needUpdate bool) {
	mdFilePath := path.Join(demoDir, strings.Replace(filename, ".ts", ".md", 1))
	needUpdate = false

	if !util.DirectoryExists(mdFilePath) {
		return
	}

	document, err := util.ParseMarkdown(mdFilePath)
	if err != nil {
		log.Fatal("Error parsing markdown:", err)
	}

	index := util.NewSliceHelper(receiver.DemoDocuments).FindIndex(func(document *util.Document) bool {
		return document.FileKey == strings.TrimSuffix(filename, filepath.Ext(filename))
	})

	if index < 0 {
		needUpdate = true
		receiver.DemoDocuments = append(receiver.DemoDocuments, document)
		return
	}

	receiver.DemoDocuments[index] = document

	return
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

func generateDemoDocTitle(meta util.ApiDocMetadata) string {
	docTitleTemplatePath := path.Join("template", "demo-title")
	docTitleTemplate, err := util.ReadFile(docTitleTemplatePath)

	if err != nil {
		return ""
	}

	docTitleTemplate = strings.Replace(docTitleTemplate, "{{title}}", meta.Title, 1)
	docTitleTemplate = strings.Replace(docTitleTemplate, "{{subtitle}}", meta.Subtitle, 1)
	docTitleTemplate = strings.Replace(docTitleTemplate, "{{widget}}", "", 1)

	return docTitleTemplate
}

func wrapperAPI(content string) string {
	return fmt.Sprintf("<section class=\"markdown api-container\">%s</section>", content)
}
func wrapperUse(content string) string {
	return fmt.Sprintf("<section class=\"markdown\">%s</section>", content)
}

func wrapperUnionDemo(content []string) string {
	return fmt.Sprintf(
		"<div>\n\t<div>\n\t\t%s\n\t</div>\n</div>", strings.Join(content, "\n"))
}

func wrapperAnchor(content string, anchor string) string {
	return fmt.Sprintf(
		"<div class=\"doc-content\">\n\t\t%s\n</div><nx-anchor container=\"#component-demo\">%s</nx-anchor>", content, anchor)
}

func wrapperSplitDemo(first, second []string) string {
	return fmt.Sprintf(
		"<div>\n\t<div>\n\t\t%s\n\t</div>\n\t<div>\n\t\t%s\n\t</div>\n</div>",
		strings.Join(first, "\n"),
		strings.Join(second, "\n"),
	)
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

	codeBoxTemplatePath := path.Join("template", "code-box")
	codeBoxTemplate, err := util.ReadFile(codeBoxTemplatePath)

	if err != nil {
		return nil
	}

	firstApiDoc := receiver.ComponentDocuments[0]
	var first []string
	var second []string
	var anchorLink []string

	demoString := ""

	for i, document := range receiver.DemoDocuments {
		tempCodeBoxTemplate := codeBoxTemplate
		title := ""
		if lang == "zh" {
			title = document.Metadata.Title.ZhCN
			tempCodeBoxTemplate = strings.ReplaceAll(tempCodeBoxTemplate, "{{doc}}", document.ZhCN)
			tempCodeBoxTemplate = strings.ReplaceAll(tempCodeBoxTemplate, "{{title}}", title)
		} else {
			title = document.Metadata.Title.EnUS
			tempCodeBoxTemplate = strings.ReplaceAll(tempCodeBoxTemplate, "{{doc}}", document.EnUS)
			tempCodeBoxTemplate = strings.ReplaceAll(tempCodeBoxTemplate, "{{title}}", title)
		}

		tempCodeBoxTemplate = strings.ReplaceAll(tempCodeBoxTemplate, "{{key}}", document.FileKey)
		tempCodeBoxTemplate = strings.ReplaceAll(tempCodeBoxTemplate, "{{component}}", receiver.Name)
		id := fmt.Sprintf("component-%s-demo-%s", receiver.Name, document.FileKey)
		anchorLink = append(anchorLink, fmt.Sprintf("<nx-anchor-link href=\"#%s\" title=\"%s\"></nx-anchor-link>", id, title))
		//document.Metadata.Title
		if firstApiDoc.Metadata.Cols != 0 {
			if (i+1)%2 == 0 {
				second = append(second, tempCodeBoxTemplate)
			} else {
				first = append(first, tempCodeBoxTemplate)
			}
		} else {
			first = append(first, tempCodeBoxTemplate)
		}
	}
	anchorLink = append(anchorLink, fmt.Sprintf("<nx-anchor-link href=\"#%s\" title=\"%s\"></nx-anchor-link>", "API", "API"))
	if len(second) != 0 {
		demoString = wrapperSplitDemo(first, second)
	} else {
		demoString = wrapperUnionDemo(first)
	}

	templateString := ""

	for _, document := range receiver.ComponentDocuments {
		if document.Language != lang && !strings.Contains(document.Language, lang) {
			continue
		}

		examplesTitleTemplatePath := path.Join("template", "code-examples")
		examplesTitleTemplate, err := util.ReadFile(examplesTitleTemplatePath)

		if err != nil {
			return nil
		}

		var examplesTitle string

		if lang == "zh" {
			examplesTitle = "代码演示"
		} else {
			examplesTitle = "Examples"
		}

		examplesTitleTemplate = strings.Replace(examplesTitleTemplate, "{{title}}", examplesTitle, 1)

		templateContent := wrapperUse(generateDemoDocTitle(document.Metadata) + document.Description + document.Use + examplesTitleTemplate)
		templateContent += demoString
		templateContent += wrapperAPI(document.Api)

		templateString += wrapperAnchor(angularNonBindAble(templateContent), strings.Join(anchorLink, "\n"))
	}

	template = strings.Replace(template, "{{imports}}", strings.Join(importDepComponentList, "\n"), 1)
	template = strings.Replace(template, "{{demoName}}", demoName, 1)
	template = strings.Replace(template, "{{lang}}", lang, 1)
	template = strings.Replace(template, "{{template}}", templateString, 1)
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
