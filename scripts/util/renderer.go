package util

import (
  "github.com/yuin/goldmark/ast"
  "github.com/yuin/goldmark/renderer"
  "github.com/yuin/goldmark/renderer/html"
  "github.com/yuin/goldmark/util"
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

func (r *CustomHTMLRenderer) RegisterFuncs(reg renderer.NodeRendererFuncRegisterer) {
  r.Renderer.RegisterFuncs(reg)
  reg.Register(ast.KindHeading, r.renderHeading)
}
