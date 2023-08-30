package util

import (
	"fmt"
	"github.com/gookit/color"
	"time"
)

func MeasureTime(functionName string, fn func()) {
	startTime := time.Now()
	fn()
	elapsedTime := time.Since(startTime)
	color.Green.Println(fmt.Sprintf("%s time %s", functionName, elapsedTime))
}
