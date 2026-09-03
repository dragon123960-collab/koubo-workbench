# Koubo Workbench open-source introduction production manifest

- Topic / audience / practical outcome: 介绍口播动效工作台，给做 AI 科普、工具解说、课程短视频的人一个可开源复用的前期编排工具。
- Verification date / current figures / source URL: 2026-09-03；本地工程 `D:\project\agent\koubo-workbench`；公开仓库待 push 后再截图验证。
- Format: horizontal 1920x1080 first; vertical cover and optional vertical cut later.
- Style: warm-courseware; light cream base, muted coral emphasis, cocoa subtitle band; real UI evidence over abstract decoration.
- Chosen combinations: C01 + C03 + C04 + C05

| Segment | Purpose | Motion | Asset type | Asset path / slot data | Narration | Caption keywords |
|---|---|---|---|---|---|---|
| 0-5s | hook | C01 | recording | `recordings/R01-workbench-overview.mp4` | 做口播视频，最累的不是写文案。 | 工作台 |
| 5-13s | pain | C04 | generated_support + UI snippets | workbench screenshot crops | 是每句话要配什么画面、什么动效、什么音效。 | 每句话 |
| 13-22s | promise | C03 | recording | `recordings/R02-import-json-preview.mp4` | 所以我们做了一个口播动效工作台。 | 动效工作台 |
| 22-34s | workflow | C03 | recording | `recordings/R03-component-layer-edit.mp4` | 它不是从空白画布开始搭。 | 文字稿 |
| 34-45s | renderer truth | C04 | recording | `recordings/R04-preview-vs-export.mp4` | 现在我们正在把预览和最终渲染统一到同一套 HTML 画面。 | 同一套画面 |
| 45-56s | library | C03 | recording | `recordings/R05-motion-library.mp4` | 常用组件留在剪辑台，不常用的沉到动效库。 | 常用组件 |
| 56-66s | open-source CTA | C05 | evidence | public repo screenshot after push | 做完这版，我们会开源出来。 | 开源 |

## Recording Plan

| ID | What to record | Duration | Notes |
|---|---|---:|---|
| R01 | 打开工作台，展示满屏布局：左侧常用组件、中央舞台、右侧属性、底部时间轴。 | 5-7s | 鼠标从时间轴拖到一个镜头中间，画面跟随变化。 |
| R02 | 导入一个已有工作台 JSON，然后点击“播放当前镜头”，能听到配音并看到组件按节奏出现。 | 6-8s | 如果这时还没有配音，可先用无声录屏，后续替换。 |
| R03 | 添加“多样式逐行文字”或“侧边卡片列表”，在右侧修改某一行的字号、颜色、背景。 | 8-10s | 重点证明图层组能整体拖动，子图层能单独改。 |
| R04 | 导出 HyperFrames HTML，打开同一秒画面截图，与工作台预览做 before/after 对照。 | 6-8s | 用来解释“预览就是渲染真相”的目标。 |
| R05 | 打开动效库，搜索 Shotcraft 或列表类动效，预览一个不常用动效，再回到常用区。 | 6-8s | 表达“少量常用 + 大库沉淀”。 |
| R06 | 点击导出工作台 JSON、Remotion props、SHOTBOOK。 | 4-5s | 可作为结尾流程确认。 |

## Screenshot / Asset Needs

- `evidence/S01-public-repo.png`: push 后的公开仓库首页截图，需看到项目名、README 标题和开源信息。
- `evidence/S02-readme-workflow.png`: README 中“先文字稿、配音、逐字 JSON、再生成工作台 JSON”的流程段落截图。
- `evidence/S03-layer-inspector.png`: 右侧属性面板里子图层字号、颜色、背景可编辑的截图。
- `evidence/S04-motion-library.png`: 动效库页面截图，最好能看到 talkcraft / shotcraft / native 状态。
- `generated_support/G01-workflow-paper-bg.png`: 可选的暖色纸张流程背景，不做真实 UI 证据。

## Production Notes

- 这一期最好以录屏为主，不需要真人出镜。
- 如果以后加真人，真人视频作为底层 media track 贯穿，全屏与右下圆形小窗用同一素材轨道的布局关键帧过渡。
- 不引用未 push 的仓库公开数据；仓库截图必须在 push 后重新截。
- 口播不固定账号片头，最后只做一句开源承诺和关注提示。
