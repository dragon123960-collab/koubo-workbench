import type { Layer, RichTextLine, SfxCue, WorkbenchProject } from '../types';

export type CommonLayerTemplate = {
  slug: string;
  title: string;
  category: '文字类' | '组合类' | '素材类';
  summary: string;
  suitableFor: string[];
  defaultSize: { w: number; h: number };
  create: (context: TemplateContext) => Layer;
};

type TemplateContext = {
  id: string;
  shotId: string;
  startSec: number;
  durationSec: number;
  x: number;
  y: number;
  z: number;
  theme: WorkbenchProject['design']['theme'];
};

const cue = (componentId: string, index: number, t: number, assetId = 'ui-pop', note = '图层入场'): SfxCue => ({
  id: `${componentId}-cue-${index}`,
  componentId,
  t,
  assetId,
  volume: 0.42,
  note,
});

const layerBase = (context: TemplateContext, slug: string, title: string, motion: Layer['motion'], size?: { w: number; h: number }): Layer => ({
  id: context.id,
  kind: 'group',
  name: title,
  templateSlug: slug,
  shotId: context.shotId,
  startSec: context.startSec,
  durationSec: context.durationSec,
  x: context.x,
  y: context.y,
  w: size?.w ?? 720,
  h: size?.h ?? 260,
  z: context.z,
  opacity: 1,
  motion,
  style: {
    background: context.theme.transparentSurface ? 'transparent' : context.theme.surfaceColor,
    borderColor: 'rgba(15,23,42,0.12)',
    color: context.theme.textColor,
    radius: 10,
    padding: 28,
  },
  children: [],
  sfxEnabled: true,
  sfxCues: [cue(context.id, 1, 0, 'ui-pop', `${slug} 入场`)],
});

const child = (parent: TemplateContext, patch: Partial<Layer> & Pick<Layer, 'id' | 'kind' | 'name' | 'x' | 'y' | 'w' | 'h'>): Layer => ({
  templateSlug: patch.templateSlug,
  shotId: parent.shotId,
  startSec: parent.startSec,
  durationSec: parent.durationSec,
  z: 1,
  opacity: 1,
  motion: 'none',
  style: {},
  ...patch,
});

const richLine = (id: string, spans: RichTextLine['spans'], align: RichTextLine['align'] = 'left'): RichTextLine => ({
  id,
  spans,
  align,
});

export const commonLayerTemplates: CommonLayerTemplate[] = [
  {
    slug: 'plain-text-layer',
    title: '普通文字',
    category: '文字类',
    summary: '单独一层文字，适合像 PPT 一样长期停留的说明、角落补充、短结论。',
    suitableFor: ['静态说明', '长期停留文字', '单句强调'],
    defaultSize: { w: 780, h: 190 },
    create: (context) => ({
      ...layerBase(context, 'plain-text-layer', '普通文字', 'fade-up', { w: 780, h: 190 }),
      children: [
        child(context, {
          id: `${context.id}-text`,
          kind: 'text',
          name: '文字',
          text: '双击右侧修改这段文字',
          x: 0,
          y: 0,
          w: 780,
          h: 190,
          style: {
            fontSize: 48,
            fontWeight: 800,
            color: context.theme.textColor,
            align: 'left',
            background: context.theme.transparentSurface ? 'transparent' : context.theme.surfaceColor,
            radius: 10,
            padding: 28,
          },
        }),
      ],
    }),
  },
  {
    slug: 'title-keyword-group',
    title: '标题 + 关键词',
    category: '组合类',
    summary: '大标题快速出现，关键词用主题色突出，适合开场、转折和结论页。',
    suitableFor: ['开场', '结论', '关键词强调'],
    defaultSize: { w: 920, h: 300 },
    create: (context) => ({
      ...layerBase(context, 'title-keyword-group', '标题 + 关键词', 'pop', { w: 920, h: 300 }),
      children: [
        child(context, {
          id: `${context.id}-title`,
          kind: 'text',
          name: '上行标题',
          text: '先写说明书',
          x: 42,
          y: 42,
          w: 820,
          h: 96,
          style: { fontSize: 72, fontWeight: 900, color: context.theme.textColor, align: 'left' },
        }),
        child(context, {
          id: `${context.id}-keyword`,
          kind: 'text',
          name: '关键词',
          text: '再让 AI 开工',
          x: 42,
          y: 150,
          w: 730,
          h: 76,
          style: { fontSize: 50, fontWeight: 900, color: context.theme.accent, align: 'left' },
        }),
        child(context, {
          id: `${context.id}-line`,
          kind: 'shape',
          name: '强调线',
          shape: 'line',
          x: 42,
          y: 244,
          w: 420,
          h: 8,
          style: { lineColor: context.theme.lineColor, radius: 999 },
        }),
      ],
    }),
  },
  {
    slug: 'editable-list-group',
    title: '分层列表',
    category: '组合类',
    summary: '数字和文字是独立子层，可以分别改大小、颜色、背景，适合原因、例子、规则清单。',
    suitableFor: ['三条原因', '多个例子', '规则清单'],
    defaultSize: { w: 900, h: 430 },
    create: (context) => ({
      ...layerBase(context, 'editable-list-group', '分层列表', 'list-stagger', { w: 900, h: 430 }),
      sfxCues: [cue(context.id, 1, 0, 'ui-pop', '列表 1'), cue(context.id, 2, 0.35, 'ui-pop', '列表 2'), cue(context.id, 3, 0.7, 'ui-pop', '列表 3')],
      children: [0, 1, 2].flatMap((index) => {
        const y = 36 + index * 118;
        return [
          child(context, {
            id: `${context.id}-num-${index + 1}`,
            kind: 'text',
            name: `数字 ${index + 1}`,
            text: String(index + 1),
            x: 34,
            y,
            w: 74,
            h: 74,
            style: { fontSize: 44, fontWeight: 900, color: '#ffffff', align: 'center', background: context.theme.accent, radius: 14, padding: 8 },
          }),
          child(context, {
            id: `${context.id}-item-${index + 1}`,
            kind: 'text',
            name: `文字 ${index + 1}`,
            text: ['目标是什么', '边界在哪里', '怎么验收'][index],
            x: 132,
            y,
            w: 700,
            h: 74,
            style: { fontSize: 42, fontWeight: 800, color: context.theme.textColor, align: 'left', background: 'rgba(255,255,255,0.68)', radius: 12, padding: 14 },
          }),
        ];
      }),
    }),
  },
  {
    slug: 'vertical-step-group',
    title: '竖向步骤线',
    category: '组合类',
    summary: '1/2/3 步骤沿竖线点亮，适合流程、方法论、前后顺序。',
    suitableFor: ['流程', '方法论', '步骤'],
    defaultSize: { w: 780, h: 560 },
    create: (context) => ({
      ...layerBase(context, 'vertical-step-group', '竖向步骤线', 'list-stagger', { w: 780, h: 560 }),
      children: [
        child(context, { id: `${context.id}-line`, kind: 'shape', name: '竖线', shape: 'line', x: 70, y: 62, w: 8, h: 390, style: { lineColor: context.theme.lineColor, radius: 999 } }),
        ...[0, 1, 2].flatMap((index) => {
          const y = 28 + index * 152;
          return [
            child(context, { id: `${context.id}-dot-${index + 1}`, kind: 'text', name: `步骤号 ${index + 1}`, text: String(index + 1), x: 34, y, w: 80, h: 80, style: { fontSize: 42, fontWeight: 900, color: '#fff', align: 'center', background: context.theme.accent, radius: 999, padding: 10 } }),
            child(context, { id: `${context.id}-text-${index + 1}`, kind: 'text', name: `步骤文字 ${index + 1}`, text: ['先定义目标', '再写规则', '最后验收'][index], x: 145, y: y + 4, w: 560, h: 72, style: { fontSize: 42, fontWeight: 800, color: context.theme.textColor, align: 'left', background: 'rgba(255,255,255,0.66)', radius: 12, padding: 12 } }),
          ];
        }),
      ],
    }),
  },
  {
    slug: 'roadmap-flow-group',
    title: '横向线路图',
    category: '组合类',
    summary: '多个节点从左到右连接，适合路线、阶段、从输入到输出的变化。',
    suitableFor: ['线路图', '横向流转', '输入到输出'],
    defaultSize: { w: 1100, h: 310 },
    create: (context) => ({
      ...layerBase(context, 'roadmap-flow-group', '横向线路图', 'roadmap-travel', { w: 1100, h: 310 }),
      children: [
        child(context, { id: `${context.id}-line`, kind: 'shape', name: '连接线', shape: 'line', x: 130, y: 142, w: 820, h: 8, style: { lineColor: context.theme.lineColor, radius: 999 } }),
        ...[0, 1, 2].flatMap((index) => {
          const x = 70 + index * 370;
          return [
            child(context, { id: `${context.id}-node-${index + 1}`, kind: 'text', name: `节点 ${index + 1}`, text: ['文字稿', '配音 JSON', '工作台微调'][index], x, y: 80, w: 230, h: 120, style: { fontSize: 34, fontWeight: 900, color: context.theme.textColor, align: 'center', background: 'rgba(255,255,255,0.78)', radius: 18, padding: 16 } }),
          ];
        }),
      ],
    }),
  },
  {
    slug: 'evidence-media-group',
    title: '截图证据',
    category: '素材类',
    summary: '左侧真实截图，右侧一条短注释；右侧文字可删除或移开。',
    suitableFor: ['真实截图', '网页证据', '产品页面'],
    defaultSize: { w: 1120, h: 600 },
    create: (context) => ({
      ...layerBase(context, 'evidence-media-group', '截图证据', 'media-zoom', { w: 1120, h: 600 }),
      children: [
        child(context, { id: `${context.id}-image`, kind: 'image', name: '截图', src: '/media/replace-with-screenshot.png', x: 28, y: 28, w: 720, h: 544, style: { background: 'rgba(15,23,42,0.08)', radius: 14 } }),
        child(context, { id: `${context.id}-note`, kind: 'text', name: '旁注', text: '这里换成真实截图说明', x: 790, y: 170, w: 280, h: 180, style: { fontSize: 38, fontWeight: 900, color: context.theme.textColor, align: 'left', background: 'transparent' } }),
      ],
    }),
  },
  {
    slug: 'media-layer-group',
    title: '图片/视频素材',
    category: '素材类',
    summary: '用于放录屏、演示视频、图片或主播画面，可设置圆角、圆形小窗和透明度。',
    suitableFor: ['录屏', '演示视频', '主播画面'],
    defaultSize: { w: 760, h: 430 },
    create: (context) => ({
      ...layerBase(context, 'media-layer-group', '图片/视频素材', 'media-zoom', { w: 760, h: 430 }),
      children: [
        child(context, { id: `${context.id}-media`, kind: 'image', name: '素材', src: '/media/replace-me.png', x: 0, y: 0, w: 760, h: 430, style: { background: 'rgba(15,23,42,0.1)', radius: 18 } }),
      ],
    }),
  },
  {
    slug: 'strike-replace-group',
    title: '划掉改写',
    category: '文字类',
    summary: '上方划掉一句错误提示词，下方出现更明确的写法。',
    suitableFor: ['纠错', '改写', '前后对比'],
    defaultSize: { w: 980, h: 330 },
    create: (context) => ({
      ...layerBase(context, 'strike-replace-group', '划掉改写', 'strike', { w: 980, h: 330 }),
      children: [
        child(context, { id: `${context.id}-bad`, kind: 'text', name: '被划掉文字', text: '帮我做个 App', x: 44, y: 54, w: 760, h: 76, style: { fontSize: 56, fontWeight: 900, color: context.theme.mutedTextColor, align: 'left' } }),
        child(context, { id: `${context.id}-line`, kind: 'shape', name: '划线', shape: 'line', x: 38, y: 94, w: 510, h: 9, style: { lineColor: context.theme.lineColor, radius: 999 } }),
        child(context, { id: `${context.id}-good`, kind: 'text', name: '替换文字', text: '目标 / 边界 / 验收', x: 44, y: 176, w: 840, h: 82, style: { fontSize: 50, fontWeight: 900, color: context.theme.textColor, align: 'left', background: 'rgba(255,255,255,0.68)', radius: 12, padding: 12 } }),
      ],
    }),
  },
  {
    slug: 'impact-glow-title',
    title: '发光冲击标题',
    category: '文字类',
    summary: '深色科技背景上的大字冲击标题，关键词带橙色发光，适合开场、章节转场和结论重锤。',
    suitableFor: ['开场大标题', '章节切换', '结论重锤'],
    defaultSize: { w: 1180, h: 360 },
    create: (context) => ({
      ...layerBase(context, 'impact-glow-title', '发光冲击标题', 'pop', { w: 1180, h: 360 }),
      style: {
        background: 'rgba(10,15,28,0.72)',
        borderColor: 'rgba(255,138,76,0.36)',
        borderWidth: 1,
        color: '#fff7ed',
        radius: 18,
        padding: 34,
        boxShadow: '0 28px 80px rgba(10,15,28,0.36), inset 0 0 0 1px rgba(255,255,255,0.08)',
        variant: 'glow-panel',
      },
      children: [
        child(context, {
          id: `${context.id}-headline`,
          kind: 'text',
          name: '发光标题',
          x: 52,
          y: 48,
          w: 970,
          h: 154,
          style: { fontSize: 76, fontWeight: 950, color: '#fff7ed', align: 'left', textShadow: '0 0 28px rgba(255,138,76,0.42)' },
          richText: [
            richLine(`${context.id}-line-1`, [
              { text: '先给 AI 一张', color: '#fff7ed', fontSize: 76, fontWeight: 950 },
              { text: '说明书', color: context.theme.accent, fontSize: 86, fontWeight: 950 },
            ]),
          ],
        }),
        child(context, {
          id: `${context.id}-sub`,
          kind: 'text',
          name: '副标题',
          text: '规则先落地，画面才不散',
          x: 56,
          y: 214,
          w: 740,
          h: 66,
          style: { fontSize: 38, fontWeight: 800, color: '#fed7aa', align: 'left' },
        }),
        child(context, {
          id: `${context.id}-beam`,
          kind: 'shape',
          name: '发光横线',
          shape: 'line',
          x: 56,
          y: 306,
          w: 540,
          h: 9,
          style: { lineColor: context.theme.accent, radius: 999, boxShadow: '0 0 24px rgba(255,138,76,0.72)' },
        }),
      ],
    }),
  },
  {
    slug: 'rich-line-reveal',
    title: '多样式逐行文字',
    category: '文字类',
    summary: '一行一行弹出文字，每行可以有不同字号、颜色和粗细，适合解释一串判断或连续金句。',
    suitableFor: ['逐行解释', '连续金句', '不同样式文字'],
    defaultSize: { w: 1120, h: 520 },
    create: (context) => ({
      ...layerBase(context, 'rich-line-reveal', '多样式逐行文字', 'list-stagger', { w: 1120, h: 520 }),
      sfxCues: [cue(context.id, 1, 0, 'text-typewriter-hit-soft', '第 1 行'), cue(context.id, 2, 0.42, 'text-typewriter-hit-soft', '第 2 行'), cue(context.id, 3, 0.84, 'text-typewriter-hit-soft', '第 3 行')],
      style: { background: 'transparent', color: context.theme.textColor, radius: 0, padding: 0 },
      children: [0, 1, 2].map((index) => child(context, {
        id: `${context.id}-line-${index + 1}`,
        kind: 'text',
        name: `富文本行 ${index + 1}`,
        x: 38,
        y: 42 + index * 138,
        w: 1000,
        h: 104,
        style: { fontSize: 52, fontWeight: 900, color: context.theme.textColor, align: 'left', background: index === 1 ? 'rgba(255,255,255,0.62)' : 'transparent', radius: 12, padding: 14 },
        richText: [
          richLine(`${context.id}-rich-${index + 1}`, [
            { text: ['不是模型不会写', '是它不知道', '项目里的规矩'][index], color: index === 1 ? context.theme.accent : context.theme.textColor, fontSize: index === 1 ? 62 : 52, fontWeight: 950 },
          ]),
        ],
      })),
    }),
  },
  {
    slug: 'glass-info-card',
    title: '玻璃信息卡',
    category: '组合类',
    summary: '半透明玻璃卡，标题、正文、标签分层可改，适合定义概念、解释名词、列出一句证据。',
    suitableFor: ['概念定义', '名词解释', '证据说明'],
    defaultSize: { w: 760, h: 420 },
    create: (context) => ({
      ...layerBase(context, 'glass-info-card', '玻璃信息卡', 'fade-up', { w: 760, h: 420 }),
      style: {
        background: 'rgba(255,255,255,0.62)',
        borderColor: 'rgba(255,255,255,0.78)',
        borderWidth: 1,
        color: context.theme.textColor,
        radius: 20,
        padding: 24,
        boxShadow: '0 26px 70px rgba(15,23,42,0.16)',
        backdropFilter: 'blur(14px)',
        variant: 'glass-card',
      },
      children: [
        child(context, { id: `${context.id}-tag`, kind: 'text', name: '小标签', text: 'AGENTS.md', x: 42, y: 36, w: 210, h: 48, style: { fontSize: 28, fontWeight: 900, color: '#fff', align: 'center', background: context.theme.accent, radius: 999, padding: 8 } }),
        child(context, { id: `${context.id}-title`, kind: 'text', name: '标题', text: '给代理看的工作台说明', x: 44, y: 112, w: 610, h: 98, style: { fontSize: 50, fontWeight: 950, color: context.theme.textColor, align: 'left' } }),
        child(context, { id: `${context.id}-body`, kind: 'text', name: '正文', text: '目标、规则、验收都写清楚，后续生成就更稳定。', x: 48, y: 228, w: 600, h: 118, style: { fontSize: 34, fontWeight: 750, color: context.theme.mutedTextColor, align: 'left' } }),
        child(context, { id: `${context.id}-line`, kind: 'shape', name: '强调边线', shape: 'line', x: 44, y: 368, w: 420, h: 7, style: { lineColor: context.theme.accent, radius: 999 } }),
      ],
    }),
  },
  {
    slug: 'warning-pill-row',
    title: '警示胶囊行',
    category: '组合类',
    summary: '一排红/橙色警示胶囊依次出现，适合列出错误做法、限制条件、翻车原因。',
    suitableFor: ['错误做法', '限制条件', '翻车原因'],
    defaultSize: { w: 1120, h: 260 },
    create: (context) => ({
      ...layerBase(context, 'warning-pill-row', '警示胶囊行', 'list-stagger', { w: 1120, h: 260 }),
      sfxCues: [cue(context.id, 1, 0, 'impact-hit-weak', '警示 1'), cue(context.id, 2, 0.32, 'impact-hit-weak', '警示 2'), cue(context.id, 3, 0.64, 'impact-hit-weak', '警示 3')],
      style: { background: 'transparent', color: context.theme.textColor, radius: 0, padding: 0 },
      children: ['临时补规则', '前后不一致', '验收说不清'].map((text, index) => child(context, {
        id: `${context.id}-pill-${index + 1}`,
        kind: 'text',
        name: `警示 ${index + 1}`,
        text,
        x: 38 + index * 350,
        y: 76,
        w: 300,
        h: 92,
        style: { fontSize: 38, fontWeight: 950, color: '#fff7ed', align: 'center', background: index === 1 ? '#b42318' : context.theme.accent, radius: 999, padding: 18, boxShadow: '0 18px 40px rgba(180,35,24,0.2)' },
      })),
    }),
  },
  {
    slug: 'device-compare-board',
    title: '设备/方案对比板',
    category: '组合类',
    summary: '左右两个设备或方案卡片对比，中间有箭头/叉号提示，适合展示旧方案、新方案和差异。',
    suitableFor: ['方案对比', '设备对比', '新旧差异'],
    defaultSize: { w: 1240, h: 580 },
    create: (context) => ({
      ...layerBase(context, 'device-compare-board', '设备/方案对比板', 'fade-up', { w: 1240, h: 580 }),
      style: { background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(15,23,42,0.12)', borderWidth: 1, color: context.theme.textColor, radius: 18, padding: 24 },
      children: [
        child(context, { id: `${context.id}-left-card`, kind: 'shape', name: '左卡背景', shape: 'rect', x: 52, y: 80, w: 470, h: 360, style: { background: 'rgba(255,255,255,0.78)', borderColor: 'rgba(15,23,42,0.14)', borderWidth: 1, radius: 18 } }),
        child(context, { id: `${context.id}-right-card`, kind: 'shape', name: '右卡背景', shape: 'rect', x: 718, y: 80, w: 470, h: 360, style: { background: 'rgba(255,255,255,0.78)', borderColor: 'rgba(15,23,42,0.14)', borderWidth: 1, radius: 18 } }),
        child(context, { id: `${context.id}-left`, kind: 'text', name: '左侧方案', text: '只给一句需求', x: 92, y: 160, w: 390, h: 130, style: { fontSize: 46, fontWeight: 950, color: context.theme.mutedTextColor, align: 'center' } }),
        child(context, { id: `${context.id}-right`, kind: 'text', name: '右侧方案', text: '先写说明书', x: 758, y: 160, w: 390, h: 130, style: { fontSize: 48, fontWeight: 950, color: context.theme.textColor, align: 'center' } }),
        child(context, { id: `${context.id}-x`, kind: 'text', name: '叉号/箭头', text: '→', x: 566, y: 190, w: 110, h: 90, style: { fontSize: 78, fontWeight: 950, color: context.theme.accent, align: 'center' } }),
        child(context, { id: `${context.id}-caption`, kind: 'text', name: '对比说明', text: '从模糊提示词，变成可验收的项目规则。', x: 180, y: 476, w: 880, h: 58, style: { fontSize: 34, fontWeight: 850, color: context.theme.textColor, align: 'center', background: 'rgba(255,255,255,0.68)', radius: 999, padding: 10 } }),
      ],
    }),
  },
  {
    slug: 'version-upgrade-card',
    title: '版本升级卡',
    category: '组合类',
    summary: '旧提示词被划掉，新提示词带功能标签进入，适合表达从 V1 到 V2 的改造。',
    suitableFor: ['版本升级', '提示词改造', '前后进化'],
    defaultSize: { w: 980, h: 460 },
    create: (context) => ({
      ...layerBase(context, 'version-upgrade-card', '版本升级卡', 'strike', { w: 980, h: 460 }),
      style: { background: 'rgba(255,255,255,0.68)', borderColor: 'rgba(15,23,42,0.12)', borderWidth: 1, color: context.theme.textColor, radius: 18, padding: 24 },
      children: [
        child(context, { id: `${context.id}-v1`, kind: 'text', name: '旧版本', text: '帮我做个 App', x: 48, y: 58, w: 620, h: 76, style: { fontSize: 48, fontWeight: 900, color: context.theme.mutedTextColor, align: 'left' } }),
        child(context, { id: `${context.id}-strike`, kind: 'shape', name: '划掉线', shape: 'line', x: 42, y: 96, w: 410, h: 8, style: { lineColor: '#b42318', radius: 999 } }),
        child(context, { id: `${context.id}-v2`, kind: 'text', name: '新版本', text: '目标 / 边界 / 验收 / 规则', x: 48, y: 168, w: 780, h: 78, style: { fontSize: 44, fontWeight: 950, color: context.theme.textColor, align: 'left' } }),
        ...['目标明确', '边界清楚', '验收可测'].map((text, index) => child(context, { id: `${context.id}-tag-${index + 1}`, kind: 'text', name: `标签 ${index + 1}`, text, x: 52 + index * 286, y: 304, w: 236, h: 68, style: { fontSize: 30, fontWeight: 900, color: '#fff', align: 'center', background: index === 1 ? context.theme.secondaryAccent : context.theme.accent, radius: 999, padding: 12 } })),
      ],
    }),
  },
  {
    slug: 'card-burst-cluster',
    title: '卡片爆发组',
    category: '组合类',
    summary: '多张小卡从中心扩散，适合展示一堆输出、多个规则、多个页面同时出现的感觉。',
    suitableFor: ['多个输出', '规则集合', '卡片爆发'],
    defaultSize: { w: 1120, h: 620 },
    create: (context) => ({
      ...layerBase(context, 'card-burst-cluster', '卡片爆发组', 'pop', { w: 1120, h: 620 }),
      style: { background: 'transparent', color: context.theme.textColor, radius: 0, padding: 0 },
      children: [
        child(context, { id: `${context.id}-title`, kind: 'text', name: '中心标题', text: '一份说明书', x: 362, y: 236, w: 390, h: 98, style: { fontSize: 54, fontWeight: 950, color: '#fff', align: 'center', background: context.theme.accent, radius: 18, padding: 14, boxShadow: '0 24px 60px rgba(201,103,82,0.28)' } }),
        ...['新建文件', '测试命令', '目录规则', '代码风格', '验收清单'].map((text, index) => {
          const positions = [[86, 72], [696, 58], [118, 416], [720, 414], [430, 48]][index];
          return child(context, { id: `${context.id}-card-${index + 1}`, kind: 'text', name: `扩散卡 ${index + 1}`, text, x: positions[0], y: positions[1], w: 300, h: 116, style: { fontSize: 34, fontWeight: 900, color: context.theme.textColor, align: 'center', background: 'rgba(255,255,255,0.78)', radius: 16, padding: 16, boxShadow: '0 18px 42px rgba(15,23,42,0.12)' } });
        }),
      ],
    }),
  },
  {
    slug: 'bottom-keyword-caption',
    title: '底部关键词字幕',
    category: '文字类',
    summary: '视频下方的大号关键词字幕条，支持关键词单独换色，适合真人出镜时压在底部。',
    suitableFor: ['真人口播字幕', '关键词字幕', '底部强调'],
    defaultSize: { w: 1320, h: 148 },
    create: (context) => ({
      ...layerBase(context, 'bottom-keyword-caption', '底部关键词字幕', 'line-reveal', { w: 1320, h: 148 }),
      style: { background: 'linear-gradient(90deg, transparent 0%, rgba(10,15,28,0.72) 14%, rgba(10,15,28,0.72) 86%, transparent 100%)', color: '#fff', radius: 0, padding: 0 },
      children: [
        child(context, {
          id: `${context.id}-caption`,
          kind: 'text',
          name: '关键词字幕',
          x: 120,
          y: 20,
          w: 1080,
          h: 106,
          style: { fontSize: 54, fontWeight: 950, color: '#fff', align: 'center', textShadow: '0 3px 9px rgba(0,0,0,0.7)' },
          richText: [
            richLine(`${context.id}-caption-line`, [
              { text: '先写', color: '#fff', fontSize: 54, fontWeight: 950 },
              { text: '说明书', color: '#ffd43b', fontSize: 62, fontWeight: 950 },
              { text: '，再开工', color: '#fff', fontSize: 54, fontWeight: 950 },
            ], 'center'),
          ],
        }),
      ],
    }),
  },
  {
    slug: 'host-pip-ring',
    title: '主播圆形小窗',
    category: '素材类',
    summary: '真人出镜小圆窗，带发光描边；可以放在任意角落，也可以和媒体轨道的全屏转小窗配合。',
    suitableFor: ['真人出镜', '圆形 PIP', '全屏转小窗'],
    defaultSize: { w: 330, h: 330 },
    create: (context) => ({
      ...layerBase(context, 'host-pip-ring', '主播圆形小窗', 'media-zoom', { w: 330, h: 330 }),
      style: { background: 'transparent', borderColor: context.theme.accent, borderWidth: 7, color: '#fff', radius: 999, padding: 0, boxShadow: '0 0 0 8px rgba(255,255,255,0.72), 0 0 44px rgba(201,103,82,0.42)', variant: 'host-ring' },
      children: [
        child(context, { id: `${context.id}-video`, kind: 'video', name: '主播视频', src: '/media/host.mp4', x: 0, y: 0, w: 330, h: 330, style: { background: 'rgba(15,23,42,0.18)', radius: 999, objectFit: 'cover' } }),
      ],
    }),
  },
  {
    slug: 'host-full-with-side-cards',
    title: '真人全屏 + 侧卡',
    category: '素材类',
    summary: '主播画面铺底，右侧叠加几张说明卡；适合真人出镜贯穿时讲关键点。',
    suitableFor: ['真人全屏', '侧边卡片', '主持人讲解'],
    defaultSize: { w: 1920, h: 1080 },
    create: (context) => ({
      ...layerBase(context, 'host-full-with-side-cards', '真人全屏 + 侧卡', 'fade-up', { w: 1920, h: 1080 }),
      style: { background: 'transparent', color: context.theme.textColor, radius: 0, padding: 0 },
      children: [
        child(context, { id: `${context.id}-host`, kind: 'video', name: '主播全屏视频', src: '/media/host.mp4', x: 0, y: 0, w: 1920, h: 1080, style: { background: '#111827', radius: 0, objectFit: 'cover' } }),
        ...['文字稿', '配音时间戳', '工作台 JSON'].map((text, index) => child(context, { id: `${context.id}-card-${index + 1}`, kind: 'text', name: `右侧卡 ${index + 1}`, text, x: 1240, y: 250 + index * 150, w: 500, h: 112, style: { fontSize: 38, fontWeight: 950, color: context.theme.textColor, align: 'left', background: 'rgba(255,255,255,0.78)', radius: 16, padding: 20, boxShadow: '0 18px 44px rgba(15,23,42,0.18)' } })),
      ],
    }),
  },
  {
    slug: 'side-card-stack',
    title: '侧边卡片列表',
    category: '组合类',
    summary: '右侧或左侧一列信息卡依次出现，卡片内部标题和正文分层可调，适合真人旁边的解释卡。',
    suitableFor: ['真人旁边解释', '卡片列表', '多条补充'],
    defaultSize: { w: 620, h: 560 },
    create: (context) => ({
      ...layerBase(context, 'side-card-stack', '侧边卡片列表', 'list-stagger', { w: 620, h: 560 }),
      style: { background: 'transparent', color: context.theme.textColor, radius: 0, padding: 0 },
      children: [0, 1, 2].flatMap((index) => {
        const y = 28 + index * 168;
        return [
          child(context, { id: `${context.id}-card-bg-${index + 1}`, kind: 'shape', name: `卡片背景 ${index + 1}`, shape: 'rect', x: 28, y, w: 560, h: 130, style: { background: 'rgba(255,255,255,0.76)', borderColor: 'rgba(15,23,42,0.1)', borderWidth: 1, radius: 16, boxShadow: '0 14px 36px rgba(15,23,42,0.12)' } }),
          child(context, { id: `${context.id}-card-title-${index + 1}`, kind: 'text', name: `卡片标题 ${index + 1}`, text: ['先有文字稿', '再有配音时间', '最后导入微调'][index], x: 58, y: y + 18, w: 500, h: 48, style: { fontSize: 34, fontWeight: 950, color: context.theme.textColor, align: 'left' } }),
          child(context, { id: `${context.id}-card-body-${index + 1}`, kind: 'text', name: `卡片正文 ${index + 1}`, text: ['不要空画布硬搭', '逐字对应视觉节奏', '人只负责审美判断'][index], x: 58, y: y + 72, w: 500, h: 40, style: { fontSize: 24, fontWeight: 750, color: context.theme.mutedTextColor, align: 'left' } }),
        ];
      }),
    }),
  },
];

export function createLayerFromTemplate(template: CommonLayerTemplate, context: Omit<TemplateContext, 'id'>): Layer {
  const id = `layer-${template.slug}-${Math.random().toString(36).slice(2, 9)}`;
  return template.create({ ...context, id });
}
