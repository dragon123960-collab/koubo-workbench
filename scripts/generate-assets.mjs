import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const talkcraftRoot = 'C:/Users/dp177/.codex/skills/video-talkcraft';
const sfxMapPath = path.join(talkcraftRoot, 'demos/_lib/sfx-map.js');
const sfxRoot = path.join(root, 'public/sfx');
const outPath = path.join(root, 'src/data/generated.ts');

const categoryMap = {
  '字幕花字': [
    'keyword-pop-highlight', 'typewriter-reveal', 'quote-card', 'type-contrast-emphasis',
    'soft-blur-in', 'per-character-rise', 'line-by-line-slide', 'tracking-in',
    'slab-punch-title', 'speed-slab-title', 'impact-open-title', 'alt-block-lines',
    'outline-box-title', 'count-badge-title', 'quote-bracket-pull', 'static-text-block',
  ],
  '强调标注': [
    'highlighter-sweep', 'scribble-annotation', 'magnifier-detail', 'callout-line-label',
    'focus-dim-spotlight', 'strike-and-replace', 'ink-underline', 'hand-drawn-ellipse',
    'converging-arrows', 'corner-bracket-frame', 'quote-hold-arrow',
  ],
  '数据信息图': [
    'number-counter', 'chart-grow', 'info-term-card', 'map-route-pin',
    'line-chart-story-draw', 'ui-prop-theater', 'step-timeline-vertical',
    'numbered-step-stack', 'metric-with-sparkline', 'bar-chart-growth', 'number-slab-pop',
  ],
  '素材呈现': [
    'ui-flow-theater', 'media-pop-in', 'news-card-desk', 'pencil-sketch-draw',
    'cursor-actor-demo', 'evidence-scroll-tour', 'motion-blur-slam-in',
    'terminal-typing-log', 'chat-message-flow', 'logo-enter', 'chat-gpt',
    'claude-code', 'glass-code-walk', 'gooey-morph',
  ],
  '转场结构': [
    'chapter-title-card', 'shape-wipe-transition', 'push-through-transition',
    'overexpose-flip-transition', 'whip-pan-transition', 'black-slam-transition',
    'pullback-cool-transition', 'particle-weld-transition', 'long-take-world',
    'color-slam-beat-card', 'caret-wipe-transition', 'chapter-progress-list',
  ],
  '人物互动': [
    'lower-third-nameplate', 'behind-text-title', 'subscribe-cta', 'host-shrink-to-chip',
    'x-follow-card', 'chevron-lower-third', 'danmu-bubble-praise',
  ],
  '运镜': [
    'slow-push-in', 'slow-pull-reveal', 'tilt-3d-page', 'sway-parallax',
    'orbit-drift', 'stage-keyframe-tour', 'cursor-locked-zoom', 'pip-zoom-box',
  ],
  '产品镜头': [
    'timeline-travel', 'canvas-materialize-moves', 'page-waterfall-wall',
    'deck-deal-flyin', 'row-embed', 'spotlight-hero-card',
  ],
};

const titles = {
  'keyword-pop-highlight': '关键词弹出强调',
  'typewriter-reveal': '打字机档案戳',
  'quote-card': '金句大字卡',
  'type-contrast-emphasis': '字体对比重音',
  'soft-blur-in': '柔焦淡入',
  'per-character-rise': '逐字升起',
  'line-by-line-slide': '逐行滑入',
  'tracking-in': '字距收拢',
  'slab-punch-title': '重点放大',
  'speed-slab-title': '速度块标题',
  'impact-open-title': '冲击开场',
  'alt-block-lines': '双色块对句',
  'outline-box-title': '描边框标题',
  'count-badge-title': '数字重音标题',
  'quote-bracket-pull': '引号夹句',
  'static-text-block': '静态文字块',
  'highlighter-sweep': '荧光笔高亮扫过',
  'scribble-annotation': '手绘圈注箭头',
  'magnifier-detail': '局部放大镜',
  'callout-line-label': '引线标签',
  'focus-dim-spotlight': '聚焦压暗切换',
  'strike-and-replace': '划掉替换',
  'ink-underline': '墨迹下划线',
  'hand-drawn-ellipse': '手绘椭圆圈',
  'converging-arrows': '汇聚箭头',
  'corner-bracket-frame': '对角角框',
  'quote-hold-arrow': '金句停留',
  'number-counter': '数字滚动计数',
  'chart-grow': '图表生长',
  'info-term-card': '名词解释悬浮卡',
  'map-route-pin': '地图路线图钉',
  'line-chart-story-draw': '折线分段推演',
  'ui-prop-theater': '界面道具剧场',
  'step-timeline-vertical': '竖向步骤线',
  'numbered-step-stack': '编号步骤堆入',
  'metric-with-sparkline': '数字带趋势',
  'bar-chart-growth': '柱状增长',
  'number-slab-pop': '数字弹出',
  'ui-flow-theater': '界面流程剧场',
  'media-pop-in': '素材弹入堆叠',
  'news-card-desk': '新闻卡片划重点',
  'pencil-sketch-draw': '铅笔手绘揭示',
  'cursor-actor-demo': '光标演员演示',
  'evidence-scroll-tour': '证据长页慢滚',
  'motion-blur-slam-in': '模糊甩入急停',
  'terminal-typing-log': '终端逐行推进',
  'chat-message-flow': '聊天记录自演',
  'logo-enter': 'Logo 登场',
  'chat-gpt': 'ChatGPT 对话框',
  'claude-code': '编码智能体终端',
  'glass-code-walk': '玻璃代码走读',
  'gooey-morph': '图块拼入',
  'chapter-title-card': '章节标题卡',
  'shape-wipe-transition': '色块扫屏转场',
  'push-through-transition': '推穿转场',
  'overexpose-flip-transition': '过曝翻页转场',
  'whip-pan-transition': '横甩转场',
  'black-slam-transition': '黑震切转场',
  'pullback-cool-transition': '后拉冷却转场',
  'particle-weld-transition': '粒子溶接转场',
  'long-take-world': '长镜头世界画布',
  'color-slam-beat-card': '纯色硬切节拍卡',
  'caret-wipe-transition': '光标擦除转场',
  'chapter-progress-list': '章节进度',
  'lower-third-nameplate': '人名条展示牌',
  'behind-text-title': '人后大字视差',
  'subscribe-cta': '多平台关注 CTA',
  'host-shrink-to-chip': '人物缩位让台',
  'x-follow-card': '关注卡弹出',
  'chevron-lower-third': '动态人名条',
  'danmu-bubble-praise': '弹幕气泡',
  'slow-push-in': '缓推特写',
  'slow-pull-reveal': '缓拉全貌',
  'tilt-3d-page': '3D 立面展示',
  'sway-parallax': '左右摇移',
  'orbit-drift': '环绕微漂',
  'stage-keyframe-tour': '长页兴趣点巡游',
  'cursor-locked-zoom': '光标锁定跟拍',
  'pip-zoom-box': '画中画放大',
  'timeline-travel': '时间轴横移',
  'canvas-materialize-moves': '内容物化上画布',
  'page-waterfall-wall': '页面瀑布墙',
  'deck-deal-flyin': '卡组发牌飞入',
  'row-embed': '行嵌入展开',
  'spotlight-hero-card': '聚光主角卡',
};

const summaries = {
  'static-text-block': '没有入场戏的常驻文字层，适合每页标题、说明、标签和类 PPT 的固定信息。',
  'timeline-travel': '沿横向刻度轴加速旅行，卡片随里程碑弹立，急停推近今天。',
  'canvas-materialize-moves': '面板行飞出变成画布卡，或 prompt 级联长出结构图。',
  'page-waterfall-wall': '多张真实页面形成瀑布墙，适合展示产品规模和页面族群。',
  'deck-deal-flyin': '一组卡片像发牌一样飞入叠放，适合批量证据和功能点。',
  'row-embed': '列表行被点亮并展开成嵌入详情，适合产品流程解释。',
  'spotlight-hero-card': '单个主角卡被聚光推近，适合片头或关键功能强调。',
};

function readSfxMap() {
  const source = fs.readFileSync(sfxMapPath, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: sfxMapPath });
  return sandbox.window.SFX_MAP ?? {};
}

function walkSfx(dir, rel = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const nextRel = path.join(rel, entry.name).replaceAll('\\', '/');
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkSfx(full, nextRel);
    if (!entry.isFile() || !entry.name.endsWith('.mp3')) return [];
    const category = rel.split(/[\\/]/)[0];
    const base = entry.name.replace(/\.mp3$/, '');
    return [{
      id: `${category}-${base}`,
      category,
      name: base,
      path: `/sfx/${nextRel}`,
      recommendedUse: inferUse(category, base),
    }];
  });
}

function inferUse(category, base) {
  if (category === 'transition') return '运镜、扫屏、元素飞入飞出';
  if (category === 'impact') return '落地钉点、slam、重拍';
  if (category === 'text') return '打字、书写、下划线和标注';
  if (category === 'camera') return '镜头推进、快门、对焦';
  if (category === 'light') return '扫光、点亮、余韵';
  if (category === 'ui') return base.includes('tone') || base.includes('bleep') ? '合成反馈音，先试听再用' : '点击、开关、pop';
  if (category === 'data') return '数据加载、扫描、流式输出';
  if (category === 'paper') return '纸张、卡片、翻页';
  return `${category} 材质拟音`;
}

const alias = {
  click: 'camera-click-camera',
  ping: 'light-sparkle-touch',
  riser: 'riser-riser-cine',
  paper: 'paper-paper-slide',
  pop: 'ui-pop',
  whoosh: 'transition-whoosh-fast',
  swipe: 'transition-sweep-fast',
  tick: 'counter-clock-tick-single',
  slam: 'impact-hit-fast-exciting',
  ding: 'ui-chime-crystal',
  scratch: 'film-vinyl-scratch-small',
  typekey: 'text-typewriter-hit-single',
  lowpad: 'scifi-tech-hum-futuristic',
};

const DEFAULT_FONT_SIZE = 40;

const textLayerDefaults = {
  titleFontSize: DEFAULT_FONT_SIZE,
  textFontSize: DEFAULT_FONT_SIZE,
  titleFontWeight: 900,
  textFontWeight: 500,
  titleFontFamily: 'Microsoft YaHei, Noto Sans CJK SC, sans-serif',
  textFontFamily: 'Microsoft YaHei, Noto Sans CJK SC, sans-serif',
  titleColor: '#111827',
  bodyColor: '#111827',
};

function cueToAssetId(name) {
  if (!name) return 'transition-transition-soft';
  if (name.startsWith('pk:')) return name.slice(3).replaceAll(':', '-');
  return alias[name] ?? 'transition-transition-soft';
}

function defaultProps(slug, title, category) {
  if (['line-by-line-slide', 'step-timeline-vertical', 'numbered-step-stack', 'focus-dim-spotlight'].includes(slug)) {
    return {
      title,
      items: '项目目标\n开发规则\n验收标准',
      accent: '#2364aa',
      background: 'transparent',
      textColor: '#111827',
      titleFontSize: DEFAULT_FONT_SIZE,
      itemFontSize: DEFAULT_FONT_SIZE,
      titleOffsetX: 0,
      titleOffsetY: 0,
      itemsOffsetX: 0,
      itemsOffsetY: 0,
      itemBackground: 'transparent',
      itemTextColor: '#111827',
    };
  }
  if (slug === 'static-text-block') {
    return {
      title: '页面标题',
      text: '这是一段常驻说明文字',
      accent: '#2364aa',
      textColor: '#111827',
      background: 'transparent',
      fontSize: DEFAULT_FONT_SIZE,
      fontWeight: 800,
      ...textLayerDefaults,
      titleFontWeight: 800,
      align: 'left',
    };
  }
  if (category === '数据信息图') {
    return { title, text: '关键数据正在增长', value: '67%', accent: '#1f8a70', background: 'transparent', textColor: '#111827', fontSize: DEFAULT_FONT_SIZE };
  }
  if (category === '强调标注') {
    return { title, text: '把注意力压到这一句', accent: '#e24b3b', background: 'transparent', textColor: '#111827', fontSize: DEFAULT_FONT_SIZE };
  }
  if (category === '素材呈现' || category === '产品镜头') {
    return { title, text: '真实素材 / 页面截图', accent: '#2364aa', background: 'transparent', textColor: '#111827', fontSize: DEFAULT_FONT_SIZE };
  }
  if (category === '人物互动') {
    return { title, text: '讲者让位，信息上台', accent: '#8f5bff', background: 'transparent', textColor: '#111827', fontSize: DEFAULT_FONT_SIZE };
  }
  if (category === '转场结构') {
    return { title, text: '章节切换', accent: '#111827', background: 'transparent', textColor: '#111827', fontSize: DEFAULT_FONT_SIZE };
  }
  if (category === '运镜') {
    return { title, text: '静态素材也要有镜头呼吸', accent: '#0f766e', background: 'transparent', textColor: '#111827', fontSize: DEFAULT_FONT_SIZE };
  }
  return { title, text: '一句话，一个视觉重音', accent: '#d9480f', background: 'transparent', textColor: '#111827', fontSize: DEFAULT_FONT_SIZE, ...textLayerDefaults };
}

function sizeFor(category) {
  if (category === '转场结构') return { w: 1920, h: 1080 };
  if (category === '运镜') return { w: 1120, h: 640 };
  if (category === '素材呈现' || category === '产品镜头') return { w: 820, h: 520 };
  if (category === '数据信息图') return { w: 760, h: 470 };
  if (category === '人物互动') return { w: 680, h: 260 };
  if (category === '强调标注') return { w: 680, h: 300 };
  return { w: 820, h: 300 };
}

const sfxMap = readSfxMap();
const sfxAssets = walkSfx(sfxRoot).sort((a, b) => a.id.localeCompare(b.id));
const assetIds = new Set(sfxAssets.map((a) => a.id));

const componentDefinitions = Object.entries(categoryMap).flatMap(([category, slugs]) =>
  slugs.map((slug) => {
    const title = titles[slug] ?? slug;
    const cues = (sfxMap[slug] ?? []).map((cue, index) => {
      const assetId = cueToAssetId(cue.name);
      return {
        id: `${slug}-cue-${index + 1}`,
        componentId: '',
        t: Number(cue.t ?? 0),
        assetId: assetIds.has(assetId) ? assetId : 'transition-transition-soft',
        volume: Number(cue.vol ?? cue.volume ?? 0.35),
        rate: cue.rate,
        clip: cue.clip ?? cue.dur,
        note: cue.note ?? cue.name ?? 'cue',
      };
    });
    return {
      slug,
      title,
      category,
      priority: /P0|title|counter|chart|flow|transition|timeline|hero|cursor|evidence/.test(slug) ? 'P0' : 'P1',
      summary: summaries[slug] ?? `${title}，来自 ${category} 常用动效卡。`,
      defaultProps: defaultProps(slug, title, category),
      defaultTiming: { enter: 0.45, hold: 2.7, exit: 0.32 },
      defaultSize: sizeFor(category),
      defaultSfxCues: cues,
    };
  }),
);

const content = `import type { ComponentDefinition, SfxAsset } from '../types';\n\nexport const componentDefinitions = ${JSON.stringify(componentDefinitions, null, 2)} as ComponentDefinition[];\n\nexport const sfxAssets = ${JSON.stringify(sfxAssets, null, 2)} as SfxAsset[];\n`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content);
console.log(`Generated ${componentDefinitions.length} components and ${sfxAssets.length} sfx assets.`);
