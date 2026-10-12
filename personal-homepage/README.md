# 个人学术主页

这个模板按照常见的学术个人主页样式组织：白色背景、顶部导航、左侧个人照片、研究概览、项目配图、论文卡片、荣誉列表和联系方式。

所有内容都在 `site.config.js` 中修改，不需要安装构建工具。

完整教程见 [`使用教程.md`](./使用教程.md)。

## 本地查看

直接双击打开 `index.html`。

也可以在项目目录运行：

```bash
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`。

## 主要修改位置

- `site.config.js`：姓名、简介、项目、论文、荣誉、技能和社交链接。
- `assets/avatar-placeholder.png`：个人照片。
- `assets/project-grid.png`：研究或论文配图一。
- `assets/project-robot.png`：研究或论文配图二。
- `assets/project-signal.png`：研究或论文配图三。
- `styles.css`：字体、颜色和间距。

## 发布

把整个文件夹上传到名为 `你的用户名.github.io` 的 GitHub 仓库，然后到 `Settings -> Pages` 选择 `main` 分支即可。
