import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const shotcraftRoot = process.env.SHOTCRAFT_ROOT || 'D:/project/video-shotcraft';
const libPath = path.join(shotcraftRoot, 'gallery/api/library.json');
const outPath = path.join(root, 'src/data/shotcraft.ts');

const categoryMap = {
  opening: '字幕花字',
  typography: '字幕花字',
  'ui-entrance': '产品镜头',
  camera: '运镜',
  data: '数据信息图',
  interaction: '产品镜头',
  transition: '转场结构',
  rhythm: '转场结构',
  effects: '强调标注',
  outro: '转场结构',
};

const p0 = new Set([
  'ai-stream-response',
  'command-palette-summon',
  'type-and-filter',
  'wall-reveal-moves',
  'list-reveal',
  'list-stack-press',
  'card-stack',
  'carousel-3d',
  'card-flip-reveal',
  'before-after-slider-scrub',
  'brand-frame-snap',
  'wipe-transitions',
  'type-assembly-moves',
  'type-entrance-moves',
  'type-rhythm-sync',
  'typing-code-block',
  'word-relay-filmstrip',
  'bezier-source-converge-merge',
  'product-card-progressive-assemble',
  'research-card-stack-scroll',
]);

const sfxByCategory = {
  opening: 'transition-wind-swoosh-short',
  typography: 'text-keyboard',
  'ui-entrance': 'ui-pop',
  camera: 'camera-ui-zoom-in',
  data: 'data-data-scan',
  interaction: 'ui-ui-select-modern',
  transition: 'transition-sweep-fast',
  rhythm: 'impact-hit-fast-exciting',
  effects: 'light-sparkle',
  outro: 'transition-transition-soft',
};

const lib = JSON.parse(fs.readFileSync(libPath, 'utf8'));
const definitions = lib.cards.map((card) => {
  const styles = (card.styles || []).map((item) => ({
    key: item.key,
    label: clean(item.label || item.key),
    description: clean(item.description),
    use: clean(item.use),
    previewUrl: item.media?.url ? `https://vincentwei1021.github.io/video-shotcraft/${item.media.url.replace(/^\.\//, '')}` : '',
  }));
  const style = card.styles?.[0];
  const demos = demoFiles(card);
  const selectedDemo = selectDemoByStyle(demos, style?.key || card.name);

  return {
    slug: `shotcraft-${card.name}`,
    title: clean(style?.label || card.name),
    category: categoryMap[card.category] || '产品镜头',
    priority: p0.has(card.name) ? 'P0' : 'P1',
    summary: clean(card.summary),
    defaultProps: {
      title: clean(style?.label || card.name),
      text: clean(card.use || card.summary),
      accent: '#c96752',
      background: 'transparent',
      textColor: '#111827',
      fontSize: 40,
      renderMode: 'video-shotcraft-native',
      nativeStatus: demos.length ? 'demo-source-ready' : 'recipe-only',
      nativeDurationFrames: nativeDurationFrames(selectedDemo),
      shotcraftRoot,
      shotcraftName: card.name,
      shotcraftCategory: card.category,
      shotcraftUse: clean(card.use),
      shotcraftEnergy: clean(card.energy),
      shotcraftDuration: clean(card.duration),
      shotcraftSource: posix(path.join(shotcraftRoot, card.source || `references/shots/${card.category}/${card.name}.md`)),
      shotcraftStyleKey: style?.key || card.name,
      shotcraftDemoFiles: demos.join('\n'),
      shotcraftStylesJson: JSON.stringify(styles),
      previewUrl: previewUrl(card),
      assetUrl: '',
    },
    defaultTiming: { enter: 0.45, hold: 3.6, exit: 0.35 },
    defaultSize: {
      w: ['transition', 'rhythm', 'opening', 'outro'].includes(card.category) ? 1180 : 980,
      h: ['camera', 'ui-entrance', 'interaction'].includes(card.category) ? 620 : 520,
    },
    defaultSfxCues: [{
      id: `shotcraft-${card.name}-cue-1`,
      componentId: '',
      t: 0.42,
      assetId: sfxByCategory[card.category] || 'ui-pop',
      volume: 0.24,
      clip: 0.75,
      note: 'video-shotcraft 原生镜头入场',
    }],
  };
});

const content = `import type { ComponentDefinition } from '../types';\n\n// Generated from ${posix(libPath)}.\n// Imported cards are prefixed with shotcraft- and carry native Remotion demo references for export.\nexport const shotcraftDefinitions = ${JSON.stringify(definitions, null, 2)} as ComponentDefinition[];\n`;
fs.writeFileSync(outPath, content, 'utf8');
console.log(`Generated ${definitions.length} shotcraft definitions from ${posix(libPath)}.`);

function demoFiles(card) {
  const dir = path.join(shotcraftRoot, 'demos', card.category, card.name);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.tsx') || name.endsWith('.ts'))
    .map((name) => posix(path.join(dir, name)));
}

function selectDemoByStyle(files, styleKey) {
  const normalized = String(styleKey).replace(/[^a-z0-9]/gi, '').toLowerCase();
  return files.find((file) => file.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(normalized)) ?? files[0] ?? '';
}

function nativeDurationFrames(file) {
  if (!file || !fs.existsSync(file)) return 0;
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/export\s+const\s+[A-Z0-9_]*DURATION\s*=\s*(\d+)/);
  return match ? Number(match[1]) : 0;
}

function clean(value, fallback = '') {
  return String(value || fallback).replace(/\s+/g, ' ').trim();
}

function previewUrl(card) {
  const url = card.styles?.[0]?.media?.url || '';
  return url ? `https://vincentwei1021.github.io/video-shotcraft/${url.replace(/^\.\//, '')}` : '';
}

function posix(value) {
  return value.replace(/\\/g, '/');
}
