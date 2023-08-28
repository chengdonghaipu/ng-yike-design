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
	RootDir   string
	Documents []*util.GlobalDocument
	DocDir    string
}

func NewGlobalDocs(rootDir string, docDir string) *GlobalDocs {
	return &GlobalDocs{RootDir: rootDir, DocDir: docDir}
}

type RouteConfig struct {
	RouteList []string
	Imports   []string
}

func angularNonBindAble(content string) string {
	reOpenBrace := regexp.MustCompile(`{`)
	reCloseBrace := regexp.MustCompile(`}`)

	content = reOpenBrace.ReplaceAllString(content, "&#123;")
	content = reCloseBrace.ReplaceAllString(content, "&#125;")

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
		util.CapitalizeFirstLetter(document.FileName),
		util.CapitalizeFirstLetter(strings.Split(document.Language, "-")[0]),
	)

	componentTemplate = strings.Replace(componentTemplate, "{{imports}}", strings.Join(importDepComponentList, "\n"), 1)
	componentTemplate = strings.Replace(componentTemplate, "{{docName}}", document.FileName, 1)
	componentTemplate = strings.Replace(componentTemplate, "{{lang}}", document.LangSimple, 1)
	componentTemplate = strings.Replace(componentTemplate, "{{template}}", angularNonBindAble(document.Content), 1)
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

func (receiver *GlobalDocs) Generate() error {
	introducesDir := path.Join(receiver.DocDir, "src", "app", "introduces")
	routerPath := path.Join(introducesDir, "introduce.routes.ts")
	routeTemplatePath := path.Join("template", "introduces-route")
	routeTemplate, err := util.ReadFile(routeTemplatePath)

	var routeConfig *RouteConfig

	if err != nil {
		return err
	}

	for _, document := range receiver.Documents {
		err := receiver.generateComponent(document, &routeConfig)

		if err != nil {
			return err
		}
	}

	routeTemplate = strings.Replace(routeTemplate, "{{imports}}", strings.Join(routeConfig.Imports, "\n"), 1)
	routeTemplate = strings.Replace(routeTemplate, "{{routes}}", strings.Join(routeConfig.RouteList, ",\n  "), 1)
	// introduce.routes.ts

	err = util.WriteFile(routerPath, routeTemplate)
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

		document, err := util.ParseGlobalDocument(mdPath)

		if err != nil {
			log.Println("Error:", err)
			return
		}

		receiver.Documents = append(receiver.Documents, document)
	}
}
