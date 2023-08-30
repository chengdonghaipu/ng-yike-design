package util

import (
	"bytes"
	"fmt"
	"github.com/go-yaml/yaml"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/renderer/html"
	"io/ioutil"
	"ng-yike-design/script/flows"
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

	var apiDoc ApiDocument

	fileNameWithExt := filepath.Base(filePath)
	apiDoc.Language = strings.TrimSuffix(fileNameWithExt, filepath.Ext(fileNameWithExt))
	apiDoc.Metadata = metadata

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
		flows.ParallelTask([]*flows.Task{
			flows.NewAutoNameTask(func() error {
				apiDoc.Use = convertToHTML(getSectionContentIncludeTitle(markdownContent, titleMap["何时使用"]))
				return nil
			}),
			flows.NewAutoNameTask(func() error {
				apiDoc.Api = convertToHTML(getSectionContentIncludeTitle(markdownContent, titleMap["API"]))
				return nil
			}),
			flows.NewAutoNameTask(func() error {
				apiDoc.Description = convertToHTML(getSectionContent(markdownContent, titleMap["组件描述"]))
				return nil
			}),
		})
	}

	return &apiDoc, nil
}

//func getApiSectionContent(htmlString, sectionTitle string) string {
//	re := regexp.MustCompile(fmt.Sprintf(`<h2>%s<\/h2>([\s\S]*?)(<\/h2>|<h2>|\z)`, sectionTitle))
//	match := re.FindStringSubmatch(htmlString)
//	if len(match) > 1 {
//		return match[1]
//	}
//	return ""
//}
//
//func getApiSectionContentIncludeTitle(htmlString, sectionTitle string) string {
//	re := regexp.MustCompile(fmt.Sprintf(`(<h2>%s<\/h2>[\s\S]*?)(<\/h2>|<h2>|\z)`, sectionTitle))
//	match := re.FindStringSubmatch(htmlString)
//	if len(match) > 1 {
//		return match[1]
//	}
//	return ""
//}
//
//func getDescription(htmlString string) string {
//	re := regexp.MustCompile(`## [^\n]+\n\n([\s\S]+?)(?:\n\n## |\z)`)
//	match := re.FindStringSubmatch(htmlString)
//	if len(match) > 1 {
//		return match[1]
//	}
//	return ""
//}

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

func getSectionContentIncludeTitle(content, section string) string {
	parts := strings.Split(content, "\n## ")
	parts = parts[1:] // Remove the initial empty part

	for i, part := range parts {
		lines := strings.SplitN(part, "\n", 2)
		if len(lines) >= 2 {
			title := strings.TrimSpace(lines[0])
			content_ := strings.TrimSpace(lines[1])

			if title == section {
				if i > 0 {
					return "## " + title + "\n" + content_
				} else {
					return title + "\n" + content_
				}
			}
		}
	}

	return ""
}

func getSectionContent(content, section string) string {
	parts := strings.Split(content, "\n## ")
	parts = parts[1:] // Remove the initial empty part

	for _, part := range parts {
		lines := strings.SplitN(part, "\n", 2)
		if len(lines) >= 2 {
			title := strings.TrimSpace(lines[0])
			content_ := strings.TrimSpace(lines[1])

			if title == section {
				return content_
			}
		}
	}

	return ""
}

func convertToHTML(markdownContent string) string {
	var htmlOutput bytes.Buffer

	md := goldmark.New(
		goldmark.WithExtensions(extension.GFM),
		goldmark.WithRenderer(HtmlRenderer()),
		goldmark.WithRendererOptions(html.WithUnsafe()),
	)

	if err := md.Convert([]byte(markdownContent), &htmlOutput); err != nil {
		panic(err)
	}
	return htmlOutput.String()
}

type GlobalDocMetadata struct {
	Order    int    `yaml:"order"`
	Title    string `yaml:"title"`
	Subtitle string `yaml:"subtitle"`
	Widget   string `yaml:"widget"`
}

type GlobalDocument struct {
	Metadata   GlobalDocMetadata
	Language   string
	Content    string
	FileName   string
	LangSimple string
	RoutePath  string
}

func ParseGlobalDocument(filePath string) (*GlobalDocument, error) {
	mdContent, err := ioutil.ReadFile(filePath)

	if err != nil {
		return nil, err
	}

	filePath = strings.Replace(filePath, "\\", "/", -1)
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

	lang := strings.Split(parentDirName, "-")[0]

	globalDoc := GlobalDocument{
		Metadata:   metadata,
		Language:   parentDirName,
		Content:    htmlString.String(),
		FileName:   fileName,
		LangSimple: lang,
		RoutePath:  fmt.Sprintf("%s/%s", fileName, lang),
	}

	return &globalDoc, nil
}
