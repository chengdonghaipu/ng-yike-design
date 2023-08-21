package generate

import (
  "io/ioutil"
  "log"
  "ng-yike-design/script/util"
  "path"
  "strings"
  "sync"
)

type GlobalDocs struct {
  RootDir   string
  Documents []*util.GlobalDocument
}

func NewGlobalDocs(rootDir string) *GlobalDocs {
  return &GlobalDocs{RootDir: rootDir}
}

func (receiver *GlobalDocs) Generate() error {
  var wg sync.WaitGroup
  dirs, err := ioutil.ReadDir(receiver.RootDir)

  if err != nil {
    log.Println("Error:", err)
    return err
  }

  for _, dir := range dirs {
    if !dir.IsDir() {
      continue
    }
    dirName := dir.Name()
    langDir := path.Join(receiver.RootDir, dirName)

    wg.Add(1)
    go func(langDir string) {
      receiver.resolveMd(langDir, &wg)
    }(langDir)
  }

  wg.Wait()

  return nil
}

func (receiver *GlobalDocs) resolveMd(langDir string, wg *sync.WaitGroup) {
  defer wg.Done()

  files, err := ioutil.ReadDir(langDir)

  if err != nil {
    log.Println("Error:", err)
    return
  }

  for _, file := range files {
    if file.IsDir() {
      continue
    }

    filename := file.Name()

    if !strings.HasSuffix(filename, ".md") {
      continue
    }

    mdPath := path.Join(langDir, filename)

    document, err := util.ParseGlobalDocument(mdPath)

    if err != nil {
      log.Println("Error:", err)
      return
    }

    receiver.Documents = append(receiver.Documents, document)
  }
}