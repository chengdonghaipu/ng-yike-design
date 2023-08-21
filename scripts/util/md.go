package util

import (
	"fmt"
	"github.com/go-yaml/yaml"
	"github.com/russross/blackfriday/v2"
	"io/ioutil"
	"regexp"
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
