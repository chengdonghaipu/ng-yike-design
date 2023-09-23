package util

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"path"
)

type NodeServeClient struct {
	Port int    `json:"port"`
	Host string `json:"host"`
}

func (receiver *NodeServeClient) httpRootUrl() string {
	return fmt.Sprintf("http://%s:%d", receiver.Host, receiver.Port)
}

func withQueryParamsToUrl(reqUrl string, value map[string]string) string {
	// 创建URL并添加查询参数
	u, err := url.Parse(reqUrl)
	if err != nil {
		fmt.Println("URL解析错误:", err)
		return reqUrl
	}

	// 添加查询参数
	q := u.Query()

	for key, val := range value {
		q.Add(key, val)
	}

	// 更新URL的查询参数部分
	u.RawQuery = q.Encode()

	return u.String()
}

func (receiver *NodeServeClient) Highlight(code, lang string) {
	reqUrl := fmt.Sprintf("%s/highlight", receiver.httpRootUrl())

	body := map[string]interface{}{
		"code": code,
		"lang": lang,
	}

	jsonData, err := json.Marshal(body)
	if err != nil {
		fmt.Println("转换为JSON出错:", err)
		return
	}

	resp, err := http.Post(reqUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("HTTP请求错误:", err)
		return
	}
	defer resp.Body.Close()

	// 读取响应的内容
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("读取响应内容错误:", err)
		return
	}

	// 打印响应内容
	fmt.Printf("响应内容: %s\n", string(respBody))
}

func GetNodeServeClient() *NodeServeClient {
	file, err := ReadFile(path.Join("node-shell", ".node-shell"))
	if err != nil {
		return nil
	}

	var config *NodeServeClient
	err = json.Unmarshal([]byte(file), &config)
	if err != nil {
		fmt.Println("解析JSON出错:", err)
		return nil
	}

	return config
}
