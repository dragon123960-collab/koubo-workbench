import type { ComponentDefinition } from '../types';

type Guidance = {
  aiUse: string;
  sentenceSignals: string[];
  editProps: string[];
};

const guidanceBySlug: Record<string, Guidance> = {
  'static-text-block': {
    aiUse: '每个镜头里常驻不动的标题、注释、角标或说明文字，像 PPT 里的固定文字层。',
    sentenceSignals: ['标题', '说明', '常驻', '页面标签', '不需要动'],
    editProps: ['title', 'text', 'titleFontSize', 'textFontSize', 'titleFontWeight', 'textFontWeight', 'titleFontFamily', 'textFontFamily', 'titleColor', 'bodyColor', 'background', 'align'],
  },
  'keyword-pop-highlight': {
    aiUse: '一句话里只有一个核心词、结论词或反差词时使用，让观众先抓住重点。',
    sentenceSignals: ['记住一句话', '不是 A 而是 B', '先', '关键', '核心'],
    editProps: ['title', 'text', 'keyword', 'keywordColor', 'lineColor', 'titleFontSize', 'textFontSize', 'titleFontWeight', 'textFontWeight', 'titleFontFamily', 'textFontFamily', 'titleColor', 'bodyColor', 'accent'],
  },
  'impact-open-title': {
    aiUse: '开头三秒钩子，用大标题建立本期主题，不适合长段解释。',
    sentenceSignals: ['开场', '别急着', '今天讲', '为什么'],
    editProps: ['title', 'text', 'keyword', 'lineColor', 'titleFontSize', 'textFontSize', 'titleFontWeight', 'textFontWeight', 'titleFontFamily', 'textFontFamily', 'titleColor', 'bodyColor', 'accent'],
  },
  'typewriter-reveal': {
    aiUse: '展示规则、命令、文件名、提示词片段或短代码，适合“写下来/输入/检查”。',
    sentenceSignals: ['命令', '文件', '规则', '提示词', '写清楚', '检查'],
    editProps: ['title', 'text', 'titleFontSize', 'textFontSize', 'titleFontFamily', 'textFontFamily', 'titleColor', 'bodyColor', 'accent', 'background'],
  },
  'line-by-line-slide': {
    aiUse: '多条并列信息按行出现，适合列举几个例子、问题或判断。',
    sentenceSignals: ['比如', '包括', '哪些', '几个', '一是', '二是'],
    editProps: ['title', 'items', 'itemCueTimes', 'titleFontSize', 'itemFontSize', 'titleOffsetX', 'titleOffsetY', 'itemsOffsetX', 'itemsOffsetY', 'itemBackground', 'itemTextColor', 'accent', 'background'],
  },
  'list-transparent-stack': {
    aiUse: '最常用的口播条目组合：左侧短标题，右侧 2-5 条文字逐条滑入，适合绝大多数原因、例子和规则。',
    sentenceSignals: ['比如', '包括', '几个', '原因', '要点', '规则'],
    editProps: ['title', 'items', 'itemCueTimes', 'titleFontSize', 'itemFontSize', 'titleOffsetX', 'titleOffsetY', 'itemsOffsetX', 'itemsOffsetY', 'itemBackground', 'itemTextColor', 'accent', 'background'],
  },
  'horizontal-flow-list': {
    aiUse: '横向流程条，从左到右把几个阶段串起来，适合“先 A，再 B，最后 C”的口播。',
    sentenceSignals: ['先', '然后', '再', '最后', '从', '到', '流程'],
    editProps: ['title', 'items', 'itemCueTimes', 'titleFontSize', 'itemFontSize', 'titleOffsetX', 'titleOffsetY', 'itemsOffsetX', 'itemsOffsetY', 'itemBackground', 'itemTextColor', 'accent', 'background'],
  },
  'roadmap-line-path': {
    aiUse: '线路图/路线图动效，一条线逐步点亮节点，适合计划、演化、路线和阶段推进。',
    sentenceSignals: ['路线', '线路图', '阶段', '计划', '演化', '一步步'],
    editProps: ['title', 'items', 'itemCueTimes', 'titleFontSize', 'itemFontSize', 'titleOffsetX', 'titleOffsetY', 'itemsOffsetX', 'itemsOffsetY', 'itemBackground', 'itemTextColor', 'accent', 'background'],
  },
  'cube-step-list': {
    aiUse: '立体方块式列表，条目像模块翻入，适合把三个抽象概念做得更有视觉重量。',
    sentenceSignals: ['三类', '三个', '模块', '核心', '重点', '盒子'],
    editProps: ['title', 'items', 'itemCueTimes', 'titleFontSize', 'itemFontSize', 'titleOffsetX', 'titleOffsetY', 'itemsOffsetX', 'itemsOffsetY', 'itemBackground', 'itemTextColor', 'accent', 'background'],
  },
  'step-timeline-vertical': {
    aiUse: '竖向步骤 1、2、3 依次出现，适合流程、三类内容、检查清单。',
    sentenceSignals: ['第一', '第二', '第三', '三类', '步骤', '流程'],
    editProps: ['title', 'items', 'itemCueTimes', 'titleFontSize', 'itemFontSize', 'titleOffsetX', 'titleOffsetY', 'itemsOffsetX', 'itemsOffsetY', 'itemBackground', 'itemTextColor', 'accent', 'background'],
  },
  'numbered-step-stack': {
    aiUse: '编号卡片堆叠入场，适合把多个规则压成一组可记忆条目。',
    sentenceSignals: ['第一', '第二', '第三', '清单', '条目'],
    editProps: ['title', 'items', 'itemCueTimes', 'titleFontSize', 'itemFontSize', 'titleOffsetX', 'titleOffsetY', 'itemsOffsetX', 'itemsOffsetY', 'itemBackground', 'itemTextColor', 'accent', 'background'],
  },
  'ui-flow-theater': {
    aiUse: '表现从普通输入到结构化输出的变化，适合提示词升级、流程转化。',
    sentenceSignals: ['更稳的说法', '变成', '升级', '流程', '一步步'],
    editProps: ['title', 'text', 'items', 'fontSize', 'sourceLabel', 'sourceFontSize', 'sourceBackground', 'sourceTextColor', 'branchFontSize', 'branchBackground', 'branchTextColor', 'resultTitle', 'resultFontSize', 'resultBackground', 'resultTextColor', 'accent', 'background'],
  },
  'evidence-scroll-tour': {
    aiUse: '展示真实网页截图、长截图或文档截图，并进行慢滚/聚焦。',
    sentenceSignals: ['官网', '文档', '页面', '截图', '证据', '来源'],
    editProps: ['title', 'text', 'assetUrl', 'showCopyPanel', 'fontSize', 'accent'],
  },
  'spotlight-hero-card': {
    aiUse: '定义一个核心概念或主角，适合“X 就是 Y”。',
    sentenceSignals: ['就像', '是什么', '定义', '主角', '说明'],
    editProps: ['title', 'text', 'assetUrl', 'fontSize', 'accent'],
  },
  'cursor-actor-demo': {
    aiUse: '用光标动作模拟操作，不需要真实录屏但要表达点击、选择、确认。',
    sentenceSignals: ['点击', '选择', '确认', '按这些规则', '操作'],
    editProps: ['title', 'text', 'items', 'fontSize', 'accent'],
  },
  'callout-line-label': {
    aiUse: '给画面里的某个点加引线说明，适合边界、风险、注意事项。',
    sentenceSignals: ['不能碰', '注意', '边界', '不要', '重点看'],
    editProps: ['title', 'text', 'fontSize', 'accent'],
  },
  'highlighter-sweep': {
    aiUse: '用黄色荧光条扫过一行文字，强调的是文字本身，不应该额外出现圈。',
    sentenceSignals: ['重点', '这一句', '关键词', '划重点'],
    editProps: ['title', 'text', 'fontSize', 'highlightWidth', 'accent'],
  },
  'hand-drawn-ellipse': {
    aiUse: '手绘椭圆圈住标题或关键词，强调对象必须是文字区域。',
    sentenceSignals: ['圈出', '看这里', '这个词', '重点词'],
    editProps: ['title', 'text', 'fontSize', 'ellipseWidth', 'ellipseHeight', 'accent'],
  },
  'ink-underline': {
    aiUse: '在标题或关键词下方画一条跟随文字宽度的下划线。',
    sentenceSignals: ['下划线', '强调', '划一下', '关键词'],
    editProps: ['title', 'text', 'fontSize', 'underlineWidth', 'accent'],
  },
  'strike-and-replace': {
    aiUse: '把弱提示词用删除线划掉，正文解释为什么不稳，后续可再接一个更具体说法。',
    sentenceSignals: ['不是这样说', '而是这样说', '改成', '替换', '太泛', '缺席'],
    editProps: ['title', 'text', 'lineColor', 'titleFontSize', 'textFontSize', 'titleFontWeight', 'textFontWeight', 'titleFontFamily', 'textFontFamily', 'titleColor', 'bodyColor', 'accent', 'background'],
  },
  'focus-dim-spotlight': {
    aiUse: '同一画面中逐个切换焦点，适合三四个选项逐一被点亮。',
    sentenceSignals: ['第一', '第二', '第三', '依次', '逐个'],
    editProps: ['title', 'items', 'itemCueTimes', 'titleFontSize', 'itemFontSize', 'titleOffsetX', 'titleOffsetY', 'itemsOffsetX', 'itemsOffsetY', 'itemBackground', 'itemTextColor', 'accent', 'background'],
  },
};

const categoryFallback: Record<ComponentDefinition['category'], Guidance> = {
  字幕花字: {
    aiUse: '强调短词、金句、反差句或开场标题。',
    sentenceSignals: ['关键词', '结论', '反差', '标题'],
    editProps: ['title', 'text', 'keyword', 'lineColor', 'titleFontSize', 'textFontSize', 'titleFontWeight', 'textFontWeight', 'titleFontFamily', 'textFontFamily', 'titleColor', 'bodyColor', 'accent'],
  },
  强调标注: {
    aiUse: '给已有内容做圈注、划线、箭头、局部放大。',
    sentenceSignals: ['注意', '这里', '这个', '不能', '重点'],
    editProps: ['title', 'text', 'fontSize', 'accent'],
  },
  数据信息图: {
    aiUse: '展示数字、步骤、列表、指标和结构化信息。',
    sentenceSignals: ['第一', '第二', '第三', '三类', '数字', '比例'],
    editProps: ['title', 'text', 'items', 'value', 'fontSize', 'accent'],
  },
  素材呈现: {
    aiUse: '呈现截图、录屏、聊天、终端或素材卡片。',
    sentenceSignals: ['截图', '素材', '演示', '页面', '终端'],
    editProps: ['title', 'text', 'assetUrl', 'fontSize', 'accent'],
  },
  转场结构: {
    aiUse: '用于镜头换幕、章节切换和段落推进。',
    sentenceSignals: ['接下来', '更进一步', '所以', '最后'],
    editProps: ['title', 'text', 'fontSize', 'accent'],
  },
  人物互动: {
    aiUse: '主播小窗、人名条、关注卡或互动气泡。',
    sentenceSignals: ['主播', '口播', '关注', '评论'],
    editProps: ['title', 'text', 'assetUrl', 'fontSize', 'accent'],
  },
  运镜: {
    aiUse: '对长图、网页或素材做推拉、跟拍、巡游。',
    sentenceSignals: ['看这个', '长页', '放大', '巡游'],
    editProps: ['title', 'text', 'assetUrl', 'fontSize', 'accent'],
  },
  产品镜头: {
    aiUse: '做产品感主视觉、页面瀑布、卡片发牌、时间轴和英雄卡。',
    sentenceSignals: ['产品', '页面', '时间线', '主角', '展示'],
    editProps: ['title', 'text', 'items', 'assetUrl', 'fontSize', 'accent'],
  },
};

export function getComponentGuidance(def: ComponentDefinition): Guidance {
  if (def.slug.startsWith('shotcraft-')) {
    return {
      aiUse: String(def.defaultProps.shotcraftUse || def.summary || 'video-shotcraft 导入的产品镜头动效，建议先看样片再使用。'),
      sentenceSignals: shotcraftSignals(String(def.defaultProps.shotcraftCategory || '')),
      editProps: ['title', 'text', 'previewUrl', 'assetUrl', 'fontSize', 'accent', 'background'],
    };
  }
  return guidanceBySlug[def.slug] ?? categoryFallback[def.category];
}

function shotcraftSignals(category: string) {
  const signals: Record<string, string[]> = {
    opening: ['开场', '品牌', '标题', '亮相'],
    typography: ['标题', '关键词', '逐字', '字卡'],
    'ui-entrance': ['界面', '页面', '卡片', '功能墙'],
    camera: ['推近', '空间', '镜头', '录屏'],
    data: ['数据', '对比', '指标', '路线'],
    interaction: ['点击', '输入', '选择', 'AI 响应'],
    transition: ['转场', '换页', '章节', '切换'],
    rhythm: ['节奏', '连打', '高能', '蒙太奇'],
    effects: ['强调', '聚光', '描边', '高亮'],
    outro: ['收尾', '发布', '完成', '品牌定版'],
  };
  return signals[category] ?? ['产品镜头', '样片', '动效'];
}
