---
category: Components
type: 通用
title: typography
subtitle: 排版
---

## 组件描述

用户展示段落、标题、文本内容

## 何时使用

- 不渲染自定义标签

```html
<span nx-icon icon="question"></span> 
```

- 渲染自定义标签

```html
<nx-icon icon="question" type="outline"></nx-icon>
```

## API

### [nx-icon], nx-icon

> 既支持标签写法也支持属性写法


| 属性           | 说明                                                | 类型                                    | 默认值 | 必传 |
|--------------|---------------------------------------------------|---------------------------------------|-----|----|
| `[type]`     | icon类型,可选值`fill`, `outline`或者不设                   | `'fill'\|'outline'`                   | -   | 否  |
| `[icon]`     | icon名称                                            | `string`                              | -   | 是  |
| `[size]`     | 图标大小                                              | `string`                              | -   | 否  |
