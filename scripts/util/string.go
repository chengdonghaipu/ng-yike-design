package util

import (
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
