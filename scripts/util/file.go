package util

import (
	"io"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"sync"
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

func copyFile(sourcePath, destinationPath string, wg *sync.WaitGroup) {
	defer wg.Done()

	sourceFile, err := os.Open(sourcePath)
	if err != nil {
		log.Println("Error opening source file:", err)
		return
	}
	defer sourceFile.Close()

	destinationFile, err := os.Create(destinationPath)
	if err != nil {
		log.Println("Error creating destination file:", err)
		return
	}
	defer destinationFile.Close()

	_, err = io.Copy(destinationFile, sourceFile)
	if err != nil {
		log.Println("Error copying file:", err)
		return
	}
}

func CopyDirectory(sourceDir, destinationDir string, wg *sync.WaitGroup) {
	defer wg.Done()

	files, err := ioutil.ReadDir(sourceDir)
	if err != nil {
		log.Println("Error reading source directory:", err)
		return
	}

	for _, file := range files {
		sourcePath := filepath.Join(sourceDir, file.Name())
		destinationPath := filepath.Join(destinationDir, file.Name())

		if file.IsDir() {
			err := os.MkdirAll(destinationPath, os.ModePerm)
			if err != nil {
				log.Println("Error creating destination directory:", err)
				return
			}
			wg.Add(1)
			go CopyDirectory(sourcePath, destinationPath, wg)
		} else {
			wg.Add(1)
			go copyFile(sourcePath, destinationPath, wg)
		}
	}
}
