package util

import (
	"bytes"
	"github.com/alecthomas/chroma/quick"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/renderer"
	"github.com/yuin/goldmark/renderer/html"
	"github.com/yuin/goldmark/util"
	"regexp"
)

type CustomHTMLRenderer struct {
	html.Renderer
}

func HtmlRenderer() renderer.Renderer {
	return renderer.NewRenderer(renderer.WithNodeRenderers(util.Prioritized(NewRenderer(), 1000)))
}

func NewRenderer(opts ...html.Option) renderer.NodeRenderer {
	r := &CustomHTMLRenderer{
		Renderer: html.Renderer{
			Config: html.NewConfig(),
		},
	}

	for _, opt := range opts {
		opt.SetHTMLOption(&r.Config)
	}

	return r
}

func (r *CustomHTMLRenderer) renderHeading(
	w util.BufWriter, source []byte, node ast.Node, entering bool) (ast.WalkStatus, error) {
	n := node.(*ast.Heading)
	if entering {
		lines := n.BaseBlock.Lines()
		if lines.Len() > 0 {
			at := n.BaseBlock.Lines().At(0)
			buf := at.Value(source)
			n.SetAttribute([]byte("id"), buf)
		}

		_, _ = w.WriteString("<h")
		_ = w.WriteByte("0123456"[n.Level])
		if n.Attributes() != nil {
			html.RenderAttributes(w, node, html.HeadingAttributeFilter)
		}
		_ = w.WriteByte('>')
	} else {
		_, _ = w.WriteString("</h")
		_ = w.WriteByte("0123456"[n.Level])
		_, _ = w.WriteString(">\n")
	}
	return ast.WalkContinue, nil
}

func (r *CustomHTMLRenderer) writeLines(w util.BufWriter, source []byte, n ast.Node) {
	l := n.Lines().Len()
	for i := 0; i < l; i++ {
		line := n.Lines().At(i)
		r.Writer.RawWrite(w, line.Value(source))
	}
}

func highlightCode(code, language string) (string, error) {
	var output bytes.Buffer
	err := quick.Highlight(&output, code, language, "html", "monokai")
	if err != nil {
		return "", err
	}
	return output.String(), nil
}

func ExtractCodeFromHTML(htmlString string) ([]string, error) {
	re := regexp.MustCompile(`(?s)<code>(.*?)<\/code>`)
	matches := re.FindAllStringSubmatch(htmlString, -1)

	var codeContents []string
	for _, match := range matches {
		if len(match) >= 2 {
			codeContents = append(codeContents, match[1])
		}
	}

	return codeContents, nil
}

func (r *CustomHTMLRenderer) kindFencedCodeBlock(w util.BufWriter, source []byte, node ast.Node, entering bool) (ast.WalkStatus, error) {
	n := node.(*ast.FencedCodeBlock)
	if entering {
		_, _ = w.WriteString("<pre><code")
		language := n.Language(source)
		if language != nil {
			_, _ = w.WriteString(" class=\"language-")
			r.Writer.Write(w, language)
			_, _ = w.WriteString("\"")
		}
		_ = w.WriteByte('>')

		code := ""
		l := n.Lines().Len()
		for i := 0; i < l; i++ {
			line := n.Lines().At(i)
			code += string(line.Value(source))
			//r.Writer.RawWrite(w, line.Value(source))
		}
		highlightedCode, _ := highlightCode(code, string(language))
		codeContents, _ := ExtractCodeFromHTML(highlightedCode)
		//fmt.Println(codeContents)
		_, _ = w.WriteString(codeContents[0])
	} else {
		_, _ = w.WriteString("</code></pre>\n")
	}
	return ast.WalkContinue, nil
}

func (r *CustomHTMLRenderer) RegisterFuncs(reg renderer.NodeRendererFuncRegisterer) {
	r.Renderer.RegisterFuncs(reg)
	reg.Register(ast.KindHeading, r.renderHeading)
	reg.Register(ast.KindFencedCodeBlock, r.kindFencedCodeBlock)
}
