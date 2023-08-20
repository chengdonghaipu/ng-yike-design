package main

import (
	"fmt"
	"ng-yike-design/script/cmd"
	"os"
)

func main() {
	err := cmd.Execute()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
