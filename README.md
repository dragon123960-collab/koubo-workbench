# Koubo Motion Workbench

Koubo Motion Workbench 是一个本地 React/Vite/TypeScript 工作台，用来把中文口播视频的文字稿、配音逐字时间戳、镜头、动效组件、素材轨和 SFX cue 编排成可继续进入 Remotion 的 JSON。

它不是完整渲染器。更推荐的使用方式是：先把口播内容和配音确定下来，再把音频解析成逐字时间 JSON，然后生成一个接近成片结构的工作台项目 JSON，最后导入工作台做人工微调。

## 推荐流程

1. 写文字稿

   先确定这一期讲什么、每句话说什么、哪些地方需要强调、哪些地方需要截图或录屏。工作台更适合做画面编排，不适合在界面里反复改大段文案。

2. 生成配音

   用你自己的 TTS、克隆音色或真人录音生成口播音频。工作台只引用音频路径，不保存任何平台 API key 或私有音色配置。

3. 解析逐字时间 JSON

   用 Whisper 或 faster-whisper 把配音解析成句子级和字级时间戳。工作台左侧的“逐字”卡可以导入这个 JSON，用来驱动字幕、关键词高亮和逐字对齐动效。

4. 生成工作台项目 JSON

   根据文字稿、配音时长、逐字时间戳和素材清单，先由脚本或 AI 生成一个 `WorkbenchProject`。这个 JSON 应该已经包含镜头、组件、素材轨、字幕设置和 SFX cue。人类用户进入工作台后只做位置、大小、字号、颜色、时间点等微调。

5. 导入工作台微调

   在工作台中导入项目 JSON。可以拖动 1920x1080 舞台上的组件和素材，修改属性，切换“全片 / 当前镜头”时间轴，使用“出片检查”查看最终 16:9 布局。

6. 导出给 Remotion

   导出 `remotion-props.json` 和 `shotbook.md`。后续 Remotion 工程可以消费这些 props，再接入真正的视频渲染、字幕渲染、SFX 混音和片头片尾包装。

## 本地运行

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

打开：

```text
http://127.0.0.1:5173/
```

常用检查：

```bash
npm run build
npm run lint
```

可以用 `examples/minimal-workbench-project.json` 测试导入流程。

## 逐字时间 JSON

项目自带一个简单的 faster-whisper 转换脚本：

```bash
pip install -r requirements.txt
```

```bash
python scripts/voice-to-workbench-json.py D:\path\voice.mp3 -o D:\path\workbench-char-timing.json --model base
```

如果你已经下载了本地模型，也可以直接指定模型目录：

```bash
python scripts/voice-to-workbench-json.py D:\path\voice.mp3 -o D:\path\workbench-char-timing.json --model C:\path\to\faster-whisper-model
```

导入结构示例：

```json
{
  "meta": {
    "tool": "faster-whisper",
    "model": "base",
    "language": "zh",
    "durationSec": 62.8
  },
  "script": [
    {
      "id": "sent-1",
      "text": "别急着让 AI 开始写代码，先给它一张项目说明书。",
      "startSec": 0,
      "endSec": 3.78,
      "chars": [
        { "ch": "别", "t": 0, "e": 0.22 },
        { "ch": "急", "t": 0.22, "e": 0.44 }
      ]
    }
  ]
}
```

## 工作台项目 JSON

工作台导入和保存的核心数据结构是 `WorkbenchProject`：

```ts
type WorkbenchProject = {
  meta: { name: string; createdAt: string; updatedAt: string; fps: number };
  format: { width: 1920; height: 1080; aspect: '16:9' };
  script: ScriptSentence[];
  shots: Shot[];
  components: ComponentInstance[];
  voice: VoiceTrack;
  media: { sources: MediaSource[]; tracks: MediaTrack[] };
  subtitles: SubtitleSettings;
  assets: { sfxRoot: string };
  sfx: { enabled: boolean; masterVolume: number };
};
```

建议生成项目 JSON 时就提前做好这些事：

- 每句话分配到对应镜头。
- 根据句意选择动效组件，例如步骤列表、关键词弹出、证据截图、素材巡游。
- 给需要截图的组件提前绑定 `assetUrl`。
- 给主播视频、演示视频、录屏视频或截图登记 `media.sources`。
- 给素材轨安排全屏、分屏或圆形小窗的时间段。
- 给组件保留默认 SFX cue，后续再人工微调音量和时间。

## 素材轨

左侧“素材”卡用于登记主播口播视频、演示视频、录屏视频或截图。建议把本地素材放到 `public/media/`，在界面中填写类似路径：

```text
/media/demo.mp4
/media/screenshot.png
```

素材源可以加入当前镜头：

- 全屏：适合录屏、产品演示、关键证据画面。
- 圆窗：适合主播缩到角落做 picture-in-picture。
- 左屏 / 右屏：适合主播和演示并排讲解。

素材片段进入导出的 `remotion-props.json` 的 `media.sources` 和 `media.tracks`。

## 动效组件

工作台内置口播常用组件和 SFX cue。组件默认尽量透明，方便统一放在每个镜头背景上。1920x1080 画布上的组件默认字号为 40px，20px 更适合小注释和角标。拖动组件右下角缩放时，支持的组件会同步缩放内部文字和视觉元素，避免每次都手动改字号。列表类组件支持单独调整标题字号、条目字号、条目背景、条目文字色和局部偏移；文字类组件支持标题行与下行文字分别设置字号、字重、字体和颜色。组件会逐步向“预设组件组 + 可编辑子层”的方向演进，避免死模板带来的微调不灵活。

当前 MVP 的预览是 HTML/CSS 级别的交互预览，目标是让用户能快速判断布局、时间和 SFX cue。最终精细动效仍建议在 Remotion 工程中消费导出的 JSON。

## SFX

`public/sfx` 中的音效会被 `scripts/generate-assets.mjs` 扫描，并生成 `src/data/generated.ts` 中的 SFX 素材表。替换或新增音效后运行：

```bash
node scripts/generate-assets.mjs
```

注意：MIT License 只覆盖源码。仓库里的示例截图、音频和其他媒体素材需要按各自来源确认授权。公开发布或商业使用时，建议替换为你自己有权使用的素材。

## 导出

工作台支持导出：

- `remotion-props.json`：脚本、逐字时间戳、镜头、动效组件、媒体轨、字幕设置和 SFX cue。
- `shotbook.md`：给后续制作使用的分镜草稿。

## 开发说明

主要目录：

```text
src/App.tsx                 工作台主界面
src/App.css                 工作台样式
src/types.ts                项目数据类型
src/lib/project.ts          项目生成、导入、导出
src/lib/audio.ts            Web Audio SFX 播放
src/data/aiGuidance.ts      AI 选择组件时可读的语义说明
scripts/generate-assets.mjs 生成组件和 SFX 素材表
scripts/voice-to-workbench-json.py 配音转逐字 JSON
```

浏览器会用 `localStorage` 保存当前项目。如果你导入了新的项目 JSON，但页面仍显示旧内容，可以刷新后重新导入，或清理站点本地数据。
