package util

import (
	"bytes"
	"fmt"
	"github.com/go-yaml/yaml"
	"github.com/russross/blackfriday/v2"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/renderer/html"
	"io/ioutil"
	"path"
	"path/filepath"
	"regexp"
	"strings"
)

type Metadata struct {
	Order int `yaml:"order"`
	Title struct {
		ZhCN string `yaml:"zh-CN"`
		EnUS string `yaml:"en-US"`
	} `yaml:"title"`
}

type Document struct {
	Metadata Metadata
	ZhCN     string
	EnUS     string
}

type ApiDocMetadata struct {
	Category string `yaml:"category"`
	Type     string `yaml:"type"`
	Title    string `yaml:"title"`
	Subtitle string `yaml:"subtitle"`
}

type ApiDocument struct {
	Metadata    ApiDocMetadata
	Use         string // 何时使用章节的所有内容 并转换成HTML
	Api         string // Api章节的所有内容 并转换为HTML
	Language    string // 默认 zhCN 根据文件名称来定的
	Description string // 组件描述 也就是这部分“按钮用于开始一个即时操作。” 并转换为HTML
}

type MyHTMLRenderer struct {
	blackfriday.HTMLRenderer
}

func ParseApiDocument(filePath string) (*ApiDocument, error) {
	mdContent, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	re := regexp.MustCompile(`---\n([\s\S]*?)\n---`)
	match := re.FindStringSubmatch(string(mdContent))
	if len(match) < 2 {
		return nil, fmt.Errorf("YAML section not found")
	}

	yamlContent := match[1]
	markdownContent := string(mdContent)[len(yamlContent)+8:]

	var metadata ApiDocMetadata
	if err := yaml.Unmarshal([]byte(yamlContent), &metadata); err != nil {
		return nil, fmt.Errorf("error parsing YAML: %w", err)
	}

	htmlOutput := blackfriday.Run([]byte(markdownContent))
	htmlString := string(htmlOutput)

	var apiDoc ApiDocument

	apiDoc.Metadata = metadata
	// Detecting language
	if strings.Contains(filePath, "zh-CN") {
		apiDoc.Language = "zh-CN"
	} else if strings.Contains(filePath, "en-US") {
		apiDoc.Language = "en-US"
	} else {
		apiDoc.Language = "zh-CN"
	}

	languageToTitle := map[string]map[string]string{
		"zh-CN": {
			"何时使用": "何时使用",
			"API":  "API",
			"组件描述": "组件描述",
		},
		"en-US": {
			"何时使用": "When To Use",
			"API":  "API",
			"组件描述": "Description",
		},
	}

	if titleMap, ok := languageToTitle[apiDoc.Language]; ok {
		// Extracting section content
		apiDoc.Use = getApiSectionContentIncludeTitle(htmlString, titleMap["何时使用"])
		apiDoc.Api = getApiSectionContentIncludeTitle(htmlString, titleMap["API"])
		apiDoc.Description = getApiSectionContent(htmlString, titleMap["组件描述"])
	}

	return &apiDoc, nil
}

func getApiSectionContent(htmlString, sectionTitle string) string {
	re := regexp.MustCompile(fmt.Sprintf(`<h2>%s<\/h2>([\s\S]*?)(<\/h2>|<h2>|\z)`, sectionTitle))
	match := re.FindStringSubmatch(htmlString)
	if len(match) > 1 {
		return match[1]
	}
	return ""
}

func getApiSectionContentIncludeTitle(htmlString, sectionTitle string) string {
	re := regexp.MustCompile(fmt.Sprintf(`(<h2>%s<\/h2>[\s\S]*?)(<\/h2>|<h2>|\z)`, sectionTitle))
	match := re.FindStringSubmatch(htmlString)
	if len(match) > 1 {
		return match[1]
	}
	return ""
}

func getDescription(htmlString string) string {
	re := regexp.MustCompile(`## [^\n]+\n\n([\s\S]+?)(?:\n\n## |\z)`)
	match := re.FindStringSubmatch(htmlString)
	if len(match) > 1 {
		return match[1]
	}
	return ""
}

func ParseMarkdown(filePath string) (*Document, error) {
	mdContent, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	re := regexp.MustCompile(`---\n([\s\S]*?)\n---`)
	match := re.FindStringSubmatch(string(mdContent))
	if len(match) < 2 {
		return nil, fmt.Errorf("YAML section not found")
	}

	yamlContent := match[1]
	markdownContent := string(mdContent)[len(yamlContent)+8:]

	var metadata Metadata
	if err := yaml.Unmarshal([]byte(yamlContent), &metadata); err != nil {
		return nil, fmt.Errorf("error parsing YAML: %w", err)
	}

	document := Document{
		Metadata: metadata,
		ZhCN:     convertToHTML(getSectionContent(markdownContent, "zh-CN")),
		EnUS:     convertToHTML(getSectionContent(markdownContent, "en-US")),
	}

	return &document, nil
}

func getSectionContent(content, section string) string {
	re := regexp.MustCompile(fmt.Sprintf(`(?m)^## %s\n\n(.*?)\n\n`, section))
	match := re.FindStringSubmatch(content)
	if len(match) > 1 {
		return match[1]
	}
	return ""
}

func convertToHTML(markdown string) string {
	htmlOutput := blackfriday.Run([]byte(markdown))
	return string(htmlOutput)
}

type GlobalDocMetadata struct {
	Order int    `yaml:"order"`
	Title string `yaml:"title"`
}

type GlobalDocument struct {
	Metadata   GlobalDocMetadata
	Language   string
	Content    string
	FileName   string
	LangSimple string
	RoutePath  string
}

type customRenderer struct {
	blackfriday.Renderer
}

func customHeadingRenderer() blackfriday.Renderer {
	return &customRenderer{}
}

func (c *customRenderer) Header(out *strings.Builder, text func() bool, level int, id string) {
	tag := fmt.Sprintf("h%d", level)
	fmt.Fprintf(out, "<%s id=\"%s\">", tag, id)
	if text != nil {
		text()
	}
	fmt.Fprintf(out, "</%s>\n", tag)
}

func ParseGlobalDocument(filePath string) (*GlobalDocument, error) {
	mdContent, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	dirPath := path.Dir(filePath)

	_, parentDirName := path.Split(dirPath)

	re := regexp.MustCompile(`---\n([\s\S]*?)\n---`)
	match := re.FindStringSubmatch(string(mdContent))
	if len(match) < 2 {
		return nil, fmt.Errorf("YAML section not found")
	}

	yamlContent := match[1]
	markdownContent := string(mdContent)[len(yamlContent)+8:]

	// 获取文件名（包括扩展名）
	fileNameWithExtension := filepath.Base(filePath)

	// 去除扩展名
	fileName := strings.TrimSuffix(fileNameWithExtension, filepath.Ext(fileNameWithExtension))

	var metadata GlobalDocMetadata
	if err := yaml.Unmarshal([]byte(yamlContent), &metadata); err != nil {
		return nil, fmt.Errorf("error parsing YAML: %w", err)
	}
	var htmlString bytes.Buffer
	md := goldmark.New(
		goldmark.WithExtensions(extension.GFM),
		goldmark.WithRenderer(HtmlRenderer()),
		goldmark.WithRendererOptions(html.WithUnsafe()),
	)

	if err := md.Convert([]byte(markdownContent), &htmlString); err != nil {
		panic(err)
	}
	//renderer := &CustomHTMLRenderer{}
	//htmlOutput := blackfriday.Run(
	//	[]byte(markdownContent),
	//	blackfriday.WithRenderer(renderer),
	//	blackfriday.WithExtensions(blackfriday.CommonExtensions),
	//)

	var globalDoc GlobalDocument

	globalDoc.Metadata = metadata
	// Detecting language
	globalDoc.Language = parentDirName

	globalDoc.Content = htmlString.String()
	globalDoc.FileName = fileName
	globalDoc.LangSimple = strings.Split(parentDirName, "-")[0]
	globalDoc.RoutePath = fmt.Sprintf("%s/%s", fileName, globalDoc.LangSimple)

	return &globalDoc, nil
}
