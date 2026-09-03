---
workflow: general-video
flow: automation
storyboard: no
message: "Koubo Motion Workbench helps talking-head creators turn script, voice timing, motion components, media and SFX into an editable pre-production project."
destination: xiaohongshu-and-douyin
aspect: 1920x1080
language: zh-CN
audience: "AI 科普、工具解说和课程短视频创作者"
length: 107.715s
angle: "开源工具介绍"
---

## Intent

这条视频介绍 Koubo Motion Workbench 的用途：它不是传统剪辑软件，而是口播视频的前期编排台。核心价值是先把文字稿、配音、逐字时间戳、分镜、组件、素材和 SFX 关系整理清楚，再导入工作台由人做少量微调，最后进入 HyperFrames/Remotion 等渲染工程。

## Assets

- `assets/recordings/workbench-demo.mp4` - 本地工作台录屏，无音频，用作真实界面演示。
- `assets/evidence/repo-home.png` - 公开仓库首页截图，用于开源收束；注意当前本地新版仍未完全 push。
- `assets/evidence/readme-workflow.png` - README 推荐流程截图，用于讲清“文字稿 -> 配音 -> 逐字 JSON -> 工作台 JSON”。
- `assets/evidence/inspector-controls.png` - 图层属性面板截图，用于说明可精调字段。
- `assets/evidence/stage-preview.png` - 舞台预览截图，用于说明固定 1920x1080 真实画布。
- `assets/evidence/motion-library.png` - 动效库截图，用于说明常用组件和大库分离。

## Customizations

- 使用暖色课程风格：浅米背景、深可可文字、珊瑚红强调、底部字幕条。
- 已生成 MiniMax 克隆音色配音，底部字幕承载压缩口播文本；后续精修时再用 Whisper/faster-whisper 对齐逐字时间。
- 本期不加入真人出镜；如果以后加入，真人视频作为底层 media track，并用布局关键帧在全屏和右下圆形小窗之间过渡。

## Notes

- 不伪造仓库数据；如果公开仓库截图里显示的提交不是最新版本，口播只说“会开源出来”或“准备开源”，不说“最新版已经发布”。
- 这版生成横屏 MP4 供审片；本地新版工作台代码仍需单独提交和 push。
