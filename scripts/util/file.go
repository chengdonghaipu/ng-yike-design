package util

import (
	"io"
	"io/ioutil"
	"os"
)

func CopyFile(sourcePath, destinationPath string) error {
	sourceFile, err := os.Open(sourcePath)
	if err != nil {
		return err
	}
	defer func(sourceFile *os.File) {
		err := sourceFile.Close()
		if err != nil {

		}
	}(sourceFile)

	destinationFile, err := os.Create(destinationPath)
	if err != nil {
		return err
	}
	defer func(destinationFile *os.File) {
		err := destinationFile.Close()
		if err != nil {

		}
	}(destinationFile)

	_, err = io.Copy(destinationFile, sourceFile)
	if err != nil {
		return err
	}

	return nil
}

func ReadFile(filePath string) (string, error) {
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

func DirectoryExists(path string) bool {
	// 使用 os.Stat 函数获取文件或目录的信息
	_, err := os.Stat(path)
	if err == nil {
		// 文件或目录存在
		return true
	}
	if os.IsNotExist(err) {
		// 文件或目录不存在
		return false
	}
	// 其他错误情况
	return false
}

func WriteFile(filePath, content string) error {
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.WriteString(content)
	if err != nil {
		return err
	}

	return nil
}
