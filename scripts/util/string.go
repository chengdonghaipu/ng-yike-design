package util

import (
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"os"
	"strings"
	"unicode"
)

func CapitalizeFirstLetter(input string) string {
	// 获取第一个字符的 Unicode 编码点
	firstChar := rune(input[0])
	// 将首字母变为大写
	upperFirstChar := unicode.ToUpper(firstChar)

	// 使用 strings.Builder 来构建新字符串
	var builder strings.Builder
	builder.WriteRune(upperFirstChar)
	builder.WriteString(input[1:])

	return builder.String()
}

func ReplacePathSeparator(inputPath string) string {
	old := "\\"

	if string(os.PathSeparator) == "\\" {
		old = "/"
	}
	return strings.ReplaceAll(inputPath, old, string(os.PathSeparator))
}

func ToCamelCase(input string) string {
	// 将字符串按照下划线或其他分隔符分割成单词
	words := strings.FieldsFunc(input, func(r rune) bool {
		return r == '_' || r == '-' // 可以添加其他分隔符
	})

	// 将每个单词的首字母大写
	for i := range words {
		words[i] = cases.Title(language.English).String(words[i])
	}

	// 将单词重新连接起来
	camelCase := strings.Join(words, "")

	return camelCase
}
