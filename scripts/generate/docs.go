package generate

import (
	"fmt"
	"io/ioutil"
	"log"
	"ng-yike-design/script/util"
	"path"
	"reflect"
	"regexp"
	"sort"
	"strings"
	"sync"
)

type GlobalDocs struct {
	RootDir     string
	Documents   []*util.GlobalDocument
	DocDir      string
	routeConfig *RouteConfig
}

func NewGlobalDocs(rootDir string, docDir string) *GlobalDocs {
	return &GlobalDocs{RootDir: rootDir, DocDir: docDir}
}

type RouteConfig struct {
	RouteList []string
	Imports   []string
}

func wrapperDocs(title, content string) string {
	return fmt.Sprintf(
		"<article class=\"markdown\">%s\n  <section class=\"markdown\" ngNonBindable>%s</section>\n  </article>",
		title,
		content,
	)
}

func generateTitle(meta util.GlobalDocMetadata) string {
	docTitleTemplatePath := path.Join("template", "doc-title")
	docTitleTemplate, err := util.ReadFile(docTitleTemplatePath)

	if err != nil {
		return ""
	}

	docTitleTemplate = strings.Replace(docTitleTemplate, "{{title}}", meta.Title, 1)
	docTitleTemplate = strings.Replace(docTitleTemplate, "{{subtitle}}", meta.Subtitle, 1)
	docTitleTemplate = strings.Replace(docTitleTemplate, "{{widget}}", meta.Widget, 1)

	return docTitleTemplate
}

func angularNonBindAble(content string) string {
	reOpenBrace := regexp.MustCompile(`{`)
	reCloseBrace := regexp.MustCompile(`}`)
	reAcute := regexp.MustCompile("`")

	content = reOpenBrace.ReplaceAllString(content, "&#123;")
	content = reCloseBrace.ReplaceAllString(content, "&#125;")
	content = reAcute.ReplaceAllString(content, "&acute;")

	return content
}

func (receiver *GlobalDocs) generateComponent(document *util.GlobalDocument, out interface{}) error {
	introducesDir := path.Join(receiver.DocDir, "src", "app", "introduces")
	componentTemplatePath := path.Join("template", "introduce-component")
	componentTemplate, err := util.ReadFile(componentTemplatePath)
	docComponentPath := path.Join(introducesDir, fmt.Sprintf("%s-%s.ts", document.FileName, document.LangSimple))

	if err != nil {
		return err
	}

	var importDepComponentList []string

	componentName := fmt.Sprintf(
		"NxDoc%s%sComponent",
		util.CapitalizeFirstLetter(strings.ReplaceAll(document.FileName, "-", "")),
		util.CapitalizeFirstLetter(strings.Split(document.Language, "-")[0]),
	)

	componentTemplate = strings.Replace(componentTemplate, "{{imports}}", strings.Join(importDepComponentList, "\n"), 1)
	componentTemplate = strings.Replace(componentTemplate, "{{docName}}", document.FileName, 1)
	componentTemplate = strings.Replace(componentTemplate, "{{lang}}", document.LangSimple, 1)
	componentTemplate = strings.Replace(
		componentTemplate,
		"{{template}}",
		wrapperDocs(generateTitle(document.Metadata), angularNonBindAble(document.Content)),
		1,
	)
	componentTemplate = strings.Replace(componentTemplate, "{{importComponentList}}", strings.Join(make([]string, 0), ",\n   "), 1)
	componentTemplate = strings.Replace(componentTemplate, "{{componentName}}", componentName, 1)

	err = util.WriteFile(docComponentPath, componentTemplate)
	if err != nil {
		return err
	}

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

	originalVal.RouteList = append(
		originalVal.RouteList,
		fmt.Sprintf("{ path: '%s', component: %s }", document.RoutePath, componentName),
	)

	originalVal.Imports = append(
		originalVal.Imports,
		fmt.Sprintf("import { %s } from './%s-%s';", componentName, document.FileName, document.LangSimple),
	)

	val.Set(reflect.ValueOf(originalVal))

	return nil
}

func (receiver *GlobalDocs) UpdateByPath(mdPath string) {
	if !strings.HasSuffix(mdPath, ".md") {
		return
	}
	// 收集 doc info
	document, addFlag := receiver.resolveMdByPath(mdPath)

	if document == nil {
		return
	}
	// 生成 doc component
	err := receiver.generateComponent(document, &receiver.routeConfig)
	if err != nil {
		return
	}

	if addFlag {
		// 更新布局
		receiver.generateDocsLayout()
	}
}

func (receiver *GlobalDocs) Generate() error {
	introducesDir := path.Join(receiver.DocDir, "src", "app", "introduces")
	routerPath := path.Join(introducesDir, "introduce.routes.ts")
	routeTemplatePath := path.Join("template", "introduces-route")
	routeTemplate, err := util.ReadFile(routeTemplatePath)

	var routeConfig *RouteConfig

	if err != nil {
		return err
	}

	if receiver.routeConfig != nil {
		receiver.routeConfig.RouteList = []string{}
		receiver.routeConfig.Imports = []string{}
	}

	for _, document := range receiver.Documents {
		err := receiver.generateComponent(document, &receiver.routeConfig)

		if err != nil {
			return err
		}
	}

	routeConfig = receiver.routeConfig

	routeTemplate = strings.Replace(routeTemplate, "{{imports}}", strings.Join(routeConfig.Imports, "\n"), 1)
	routeTemplate = strings.Replace(routeTemplate, "{{routes}}", strings.Join(routeConfig.RouteList, ",\n      "), 1)
	// introduce.routes.ts

	err = util.WriteFile(routerPath, routeTemplate)
	if err != nil {
		return err
	}

	return receiver.generateDocsLayout()
}

func (receiver *GlobalDocs) generateDocsLayout() error {
	layoutTemplatePath := path.Join("template", "introduces-layout")
	layoutTemplate, err := util.ReadFile(layoutTemplatePath)
	var navList []string

	if err != nil {
		return err
	}

	for _, document := range receiver.Documents {
		if document.LangSimple != "zh" {
			// TODO 暂时只生成中文链接
			continue
		}

		navList = append(
			navList,
			fmt.Sprintf(
				"        <li routerLink=\"%s\" routerLinkActive=\"router-active\"><a >%s</a></li>",
				fmt.Sprintf("/docs/%s", document.RoutePath),
				document.Metadata.Title,
			),
		)
	}

	layoutTemplate = strings.Replace(layoutTemplate, "{{navList}}", strings.Join(navList, "\n"), 1)

	introducesDir := path.Join(receiver.DocDir, "src", "app", "introduces")
	layoutPath := path.Join(introducesDir, "introduces.component.ts")

	err = util.WriteFile(layoutPath, layoutTemplate)
	if err != nil {
		return err
	}

	return nil
}

func (receiver *GlobalDocs) Collect() error {
	var wg sync.WaitGroup
	dirs, err := ioutil.ReadDir(receiver.RootDir)

	if err != nil {
		log.Println("Error:", err)
		return err
	}

	for _, dir := range dirs {
		if !dir.IsDir() {
			continue
		}
		dirName := dir.Name()
		langDir := path.Join(receiver.RootDir, dirName)

		wg.Add(1)
		go func(langDir string) {
			receiver.resolveMd(langDir, &wg)
		}(langDir)
	}

	wg.Wait()
	sort.Slice(receiver.Documents, func(i, j int) bool {
		return receiver.Documents[i].Metadata.Order < receiver.Documents[j].Metadata.Order
	})
	return nil
}

func (receiver *GlobalDocs) resolveMdByPath(mdPath string) (*util.GlobalDocument, bool) {
	document, err := util.ParseGlobalDocument(mdPath)

	if err != nil {
		log.Println("Error:", err)
		return nil, false
	}

	findIndex := -1

	for i, globalDocument := range receiver.Documents {
		if globalDocument.RoutePath != document.RoutePath {
			continue
		}

		findIndex = i
	}

	if findIndex > -1 {
		receiver.Documents[findIndex] = document
		return document, false
	}

	receiver.Documents = append(receiver.Documents, document)

	return document, true
}

func (receiver *GlobalDocs) resolveMd(langDir string, wg *sync.WaitGroup) {
	defer wg.Done()

	files, err := ioutil.ReadDir(langDir)

	if err != nil {
		log.Println("Error:", err)
		return
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filename := file.Name()

		if !strings.HasSuffix(filename, ".md") {
			continue
		}

		mdPath := path.Join(langDir, filename)

		receiver.resolveMdByPath(mdPath)
	}
}
