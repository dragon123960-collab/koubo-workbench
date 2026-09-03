import type { ComponentDefinition, ComponentInstance, DesignThemeSettings, GlobalStyleSettings, Layer, MediaLayout, MediaSource, MediaTrack, MotionLibraryItem, Shot, ShotBackgroundStyle, SubtitleSettings, VoiceTrack, WorkbenchProject } from '../types';
import { componentDefinitions } from '../data/generated';
import { commonLayerTemplates, createLayerFromTemplate } from '../data/commonLayers';
import { buildMotionLibraryItems } from '../data/motionLibrary';

const nowIso = () => new Date().toISOString();

export const STORAGE_KEY = 'koubo-workbench-project-v1';

const sampleScript = [
  '今天我们先把口播视频的画面节奏搭起来',
  '每句话都能对应一个镜头和一个视觉重音',
  '常用动效组件可以直接点进画布再拖到合适位置',
  '音效 cue 会跟着动效一起预览避免后期盲配',
  '最后导出 Remotion JSON 和 SHOTBOOK 草稿继续制作',
];

export const sentenceDuration = 5.5;

export const defaultVoiceTrack: VoiceTrack = {
  src: '',
  durationSec: undefined,
  timestampMode: 'estimated',
  notes: '',
};

export const EDITABLE_COMPONENT_BACKGROUND = 'rgba(255,255,255,0.72)';
export const defaultComponentTheme = {
  accent: '#c96752',
  titleColor: '#111827',
  bodyColor: '#334155',
  textColor: '#111827',
  keywordColor: '#d9480f',
  lineColor: '#c96752',
  componentBackground: 'transparent',
  itemBackground: 'rgba(255,255,255,0.58)',
  itemTextColor: '#111827',
};

export const defaultDesignTheme: DesignThemeSettings = {
  name: 'warm-editorial',
  fontFamily: 'Inter, "Microsoft YaHei", "PingFang SC", system-ui, sans-serif',
  accent: '#c96752',
  secondaryAccent: '#2364aa',
  textColor: '#111827',
  mutedTextColor: '#475569',
  surfaceColor: 'rgba(255,255,255,0.72)',
  transparentSurface: false,
  lineColor: '#c96752',
};

export const defaultSubtitleSettings: SubtitleSettings = {
  enabled: true,
  position: 'bottom',
  shape: 'edgeFade',
  textColor: '#ffffff',
  keywordColor: '#ffd43b',
  background: '#111827',
  keywords: '视觉重音,动效,音效,Remotion',
  fontSize: 44,
};

export function defaultGlobalStyleSettings(useGlobalBackground = true): GlobalStyleSettings {
  return {
    useGlobalBackground,
    backgroundStyle: { type: 'lightGrid', color: '#f7f1e8', imageUrl: '' },
    componentTheme: { ...defaultComponentTheme },
    theme: { ...defaultDesignTheme },
    cornerBug: {
      enabled: true,
      position: 'topLeft',
      title: 'AI说事 · 大树Tree',
      subtitle: 'Vibe Coding 科普',
      textColor: '#2d2521',
      background: 'rgba(255,255,255,0.66)',
      accent: '#c96752',
      opacity: 0.92,
      fontSize: 28,
      x: 72,
      y: 54,
    },
  };
}

function defaultShotBackground(index: number): ShotBackgroundStyle {
  return index % 2 === 0
    ? { type: 'lightGrid', color: '#f7f9fb', imageUrl: '' }
    : { type: 'darkGrid', color: '#111827', imageUrl: '' };
}

export function createMediaTrack(source: MediaSource, layout: MediaLayout, startSec: number, durationSec: number): MediaTrack {
  const base = {
    id: `media-${source.id}-${Math.random().toString(36).slice(2, 8)}`,
    sourceId: source.id,
    startSec: Number(startSec.toFixed(2)),
    durationSec: Number(durationSec.toFixed(2)),
    layout,
    opacity: 1,
  };

  if (layout === 'circlePip') {
    return { ...base, x: 1510, y: 72, w: 300, h: 300, z: 4, radius: 150 };
  }
  if (layout === 'splitLeft') {
    return { ...base, x: 0, y: 0, w: 960, h: 1080, z: 0, radius: 0 };
  }
  if (layout === 'splitRight') {
    return { ...base, x: 960, y: 0, w: 960, h: 1080, z: 0, radius: 0 };
  }
  return { ...base, x: 0, y: 0, w: 1920, h: 1080, z: 0, radius: 0 };
}

export function buildSentenceChars(text: string, startSec = 0, endSec = startSec + sentenceDuration) {
  const chars = Array.from(text);
  const duration = Math.max(0.1, endSec - startSec);
  const step = duration / Math.max(1, chars.length);
  return chars.map((ch, index) => ({
    ch,
    t: Number((startSec + index * step).toFixed(3)),
    e: Number((startSec + (index + 1) * step).toFixed(3)),
  }));
}

export function buildShotsFromScript(lines: string[]): Shot[] {
  return lines.map((line, index) => ({
    id: `shot-${index + 1}`,
    title: line.slice(0, 16) || `镜头 ${index + 1}`,
    sentenceIds: [`sent-${index + 1}`],
    startSec: Number((index * sentenceDuration).toFixed(2)),
    durationSec: sentenceDuration,
    lead: index === 0 ? 0 : 12,
    tail: index === lines.length - 1 ? 10 : 12,
    background: index % 2 === 0 ? '浅色幕底 + 视差网格' : '深色幕底 + 环境呼吸',
    backgroundStyle: defaultShotBackground(index),
    cameraPath: [
      { t: 0, scale: 1 },
      { t: sentenceDuration, scale: 1.05, x: index % 2 === 0 ? -18 : 18 },
    ],
  }));
}

export function createDefaultProject(): WorkbenchProject {
  const shots = buildShotsFromScript(sampleScript);
  const script = sampleScript.map((text, index) => ({
    id: `sent-${index + 1}`,
    text,
    startSec: shots[index].startSec,
    endSec: shots[index].startSec + shots[index].durationSec,
    chars: buildSentenceChars(text, shots[index].startSec, shots[index].startSec + shots[index].durationSec),
  }));

  const starters = ['impact-open-title', 'number-counter', 'timeline-travel'].map((slug, index) => {
    const def = componentDefinitions.find((item) => item.slug === slug)!;
    return createInstance(def, shots[index].id, shots[index].startSec + 0.4, 220 + index * 80, 170 + index * 70, index + 1);
  });
  const design = defaultGlobalStyleSettings(true);
  const layerStarters = commonLayerTemplates.slice(0, 2).map((template, index) =>
    createLayerFromTemplate(template, {
      shotId: shots[index].id,
      startSec: shots[index].startSec + 0.45,
      durationSec: Math.min(4.4, shots[index].durationSec - 0.8),
      x: 220 + index * 160,
      y: 210 + index * 90,
      z: 10 + index,
      theme: design.theme,
    }),
  );

  return {
    meta: {
      name: '口播动效工作台 Demo',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      fps: 30,
    },
    format: { width: 1920, height: 1080, aspect: '16:9' },
    script,
    shots,
    components: starters,
    layers: layerStarters,
    motionLibrary: buildMotionLibraryItems(),
    design,
    voice: { ...defaultVoiceTrack, durationSec: getTotalDuration({ shots, components: starters, layers: layerStarters, media: { sources: [], tracks: [] } } as unknown as WorkbenchProject) },
    media: { sources: [], tracks: [] },
    subtitles: { ...defaultSubtitleSettings },
    assets: { sfxRoot: '/sfx' },
    sfx: { enabled: true, masterVolume: 0.72 },
  };
}

export function normalizeProject(project: WorkbenchProject): WorkbenchProject {
  const rawShape = project.subtitles?.shape;
  const fallbackDesign = defaultGlobalStyleSettings(false);
  const design = {
    ...fallbackDesign,
    ...(project.design ?? {}),
    backgroundStyle: {
      ...fallbackDesign.backgroundStyle,
      ...(project.design?.backgroundStyle ?? {}),
    },
    cornerBug: {
      ...fallbackDesign.cornerBug,
      ...(project.design?.cornerBug ?? {}),
    },
    componentTheme: {
      ...fallbackDesign.componentTheme,
      ...(project.design?.componentTheme ?? {}),
    },
    theme: {
      ...fallbackDesign.theme,
      ...(project.design?.theme ?? {}),
    },
  };
  const components = (project.components ?? []).map((component) => normalizeComponentProps(component, design));
  const layers = project.layers?.length
    ? project.layers.map((layer) => normalizeLayer(layer, design.theme))
    : components.map((component) => componentToLayer(component, design.theme));
  return {
    ...project,
    shots: project.shots.map((shot, index) => ({
      ...shot,
      backgroundStyle: shot.backgroundStyle ?? defaultShotBackground(index),
    })),
    script: project.script.map((sentence) => {
      const start = sentence.startSec ?? 0;
      const end = sentence.endSec ?? start + sentenceDuration;
      return {
        ...sentence,
        startSec: start,
        endSec: end,
        chars: sentence.chars?.length ? sentence.chars : buildSentenceChars(sentence.text, start, end),
      };
    }),
    components,
    layers,
    motionLibrary: mergeMotionLibrary(project.motionLibrary, buildMotionLibraryItems()),
    design,
    voice: { ...defaultVoiceTrack, ...(project.voice ?? {}) },
    media: {
      sources: project.media?.sources ?? [],
      tracks: project.media?.tracks ?? [],
    },
    subtitles: {
      ...defaultSubtitleSettings,
      ...(project.subtitles ?? {}),
      shape: rawShape === 'solid' || rawShape === 'edgeFade' ? rawShape : defaultSubtitleSettings.shape,
    },
    assets: { ...(project.assets ?? {}), sfxRoot: project.assets?.sfxRoot ?? '/sfx' },
    sfx: {
      ...(project.sfx ?? {}),
      enabled: project.sfx?.enabled ?? true,
      masterVolume: project.sfx?.masterVolume ?? 0.72,
    },
  };
}

function normalizeComponentProps(component: ComponentInstance, design: GlobalStyleSettings): ComponentInstance {
  const def = componentDefinitions.find((item) => item.slug === component.slug);
  if (!def) return component;
  return {
    ...component,
    props: {
      ...component.props,
      accent: component.props.accent ?? design.theme.accent,
      lineColor: component.props.lineColor ?? design.theme.lineColor,
      background: String(component.props.background ?? '').trim() === 'transparent' ? EDITABLE_COMPONENT_BACKGROUND : component.props.background,
      fontSize: Number(component.props.fontSize ?? 40),
    },
  };
}

function normalizeLayer(layer: Layer, theme: DesignThemeSettings): Layer {
  return {
    ...layer,
    opacity: layer.opacity ?? 1,
    motion: layer.motion ?? 'fade-up',
    style: {
      color: theme.textColor,
      background: layer.kind === 'group' ? (theme.transparentSurface ? 'transparent' : theme.surfaceColor) : undefined,
      ...layer.style,
    },
    children: layer.children?.map((child) => normalizeLayer(child, theme)),
    sfxEnabled: layer.sfxEnabled ?? Boolean(layer.sfxCues?.length),
    sfxCues: layer.sfxCues ?? [],
  };
}

function componentToLayer(component: ComponentInstance, theme: DesignThemeSettings): Layer {
  const title = String(component.props.title ?? component.slug);
  const text = String(component.props.text ?? '');
  return {
    id: `layer-from-${component.id}`,
    kind: 'group',
    name: title,
    shotId: component.shotId,
    startSec: component.startSec,
    durationSec: component.durationSec,
    x: component.x,
    y: component.y,
    w: component.w,
    h: component.h,
    z: component.z,
    opacity: 1,
    motion: component.slug.includes('list') || component.slug.includes('step') ? 'list-stagger' : 'fade-up',
    style: {
      background: String(component.props.background ?? theme.surfaceColor),
      borderColor: 'rgba(15,23,42,0.12)',
      radius: 8,
      padding: 24,
      color: String(component.props.textColor ?? theme.textColor),
    },
    children: [
      {
        id: `layer-from-${component.id}-title`,
        kind: 'text',
        name: '标题',
        shotId: component.shotId,
        startSec: component.startSec,
        durationSec: component.durationSec,
        x: 32,
        y: 28,
        w: Math.max(120, component.w - 64),
        h: Math.min(90, Math.max(54, component.h * 0.34)),
        z: 1,
        opacity: 1,
        motion: 'none',
        style: {
          fontSize: Number(component.props.titleFontSize ?? component.props.fontSize ?? 40),
          fontWeight: 900,
          color: String(component.props.titleColor ?? component.props.accent ?? theme.textColor),
          align: 'left',
        },
        text: title,
      },
      {
        id: `layer-from-${component.id}-text`,
        kind: 'text',
        name: '内容',
        shotId: component.shotId,
        startSec: component.startSec,
        durationSec: component.durationSec,
        x: 32,
        y: Math.min(128, Math.max(92, component.h * 0.42)),
        w: Math.max(120, component.w - 64),
        h: Math.max(70, component.h - 150),
        z: 2,
        opacity: 1,
        motion: 'none',
        style: {
          fontSize: Number(component.props.itemFontSize ?? component.props.bodyFontSize ?? 36),
          fontWeight: 700,
          color: String(component.props.bodyColor ?? component.props.textColor ?? theme.textColor),
          align: 'left',
        },
        text,
      },
    ],
    sfxEnabled: component.sfxEnabled,
    sfxCues: component.sfxCues,
  };
}

function mergeMotionLibrary(existing: MotionLibraryItem[] | undefined, generated: MotionLibraryItem[]) {
  const byId = new Map<string, MotionLibraryItem>();
  for (const item of generated) byId.set(item.id, item);
  for (const item of existing ?? []) byId.set(item.id, { ...byId.get(item.id), ...item });
  return [...byId.values()];
}

export function createInstance(
  def: ComponentDefinition,
  shotId: string,
  startSec: number,
  x = 560,
  y = 300,
  z = 1,
): ComponentInstance {
  const id = `${def.slug}-${Math.random().toString(36).slice(2, 9)}`;
  const durationSec = Number((def.defaultTiming.enter + def.defaultTiming.hold + def.defaultTiming.exit).toFixed(2));
  const props = {
    ...def.defaultProps,
    background: String(def.defaultProps.background ?? '').trim() === 'transparent' ? EDITABLE_COMPONENT_BACKGROUND : def.defaultProps.background,
  };
  return {
    id,
    slug: def.slug,
    shotId,
    startSec: Number(startSec.toFixed(2)),
    durationSec,
    x,
    y,
    w: def.defaultSize.w,
    h: def.defaultSize.h,
    z,
    props,
    enter: def.defaultTiming.enter,
    hold: def.defaultTiming.hold,
    exit: def.defaultTiming.exit,
    sfxEnabled: def.defaultSfxCues.length > 0,
    sfxCues: def.defaultSfxCues.map((cue, index) => ({
      ...cue,
      id: `${id}-cue-${index + 1}`,
      componentId: id,
    })),
  };
}

export function splitScriptIntoProject(project: WorkbenchProject, text: string): WorkbenchProject {
  const lines = text
    .split(/\n|。|！|!|？|\?/)
    .map((line) => line.trim())
    .filter(Boolean);
  const nextLines = lines.length ? lines : sampleScript;
  const shots = buildShotsFromScript(nextLines);
  return {
    ...project,
    meta: { ...project.meta, updatedAt: nowIso() },
    script: nextLines.map((line, index) => ({
      id: `sent-${index + 1}`,
      text: line,
      startSec: shots[index].startSec,
      endSec: shots[index].startSec + shots[index].durationSec,
      chars: buildSentenceChars(line, shots[index].startSec, shots[index].startSec + shots[index].durationSec),
    })),
    shots,
    components: project.components.filter((component) => shots.some((shot) => shot.id === component.shotId)),
    layers: (project.layers ?? []).filter((layer) => shots.some((shot) => shot.id === layer.shotId)),
    voice: { ...(project.voice ?? defaultVoiceTrack), timestampMode: 'estimated' },
  };
}

export function getTotalDuration(project: WorkbenchProject): number {
  return Math.max(
    1,
    ...project.shots.map((shot) => shot.startSec + shot.durationSec),
    ...(project.components ?? []).map((component) => component.startSec + component.durationSec),
    ...(project.layers ?? []).map((layer) => layer.startSec + layer.durationSec),
    ...(project.media?.tracks ?? []).map((track) => track.startSec + track.durationSec),
  );
}

export function exportRemotionProps(project: WorkbenchProject) {
  const sfxCues = project.components.flatMap((component) =>
    component.sfxEnabled
      ? component.sfxCues.map((cue) => ({
          ...cue,
          componentId: component.id,
          absoluteSec: Number((component.startSec + cue.t).toFixed(3)),
        }))
      : [],
  );
  const layerSfxCues = (project.layers ?? []).flatMap((layer) =>
    layer.sfxEnabled
      ? (layer.sfxCues ?? []).map((cue) => ({
          ...cue,
          componentId: layer.id,
          absoluteSec: Number((layer.startSec + cue.t).toFixed(3)),
        }))
      : [],
  );
  const components = project.components.map((component) => ({
    ...component,
    ...(shotcraftRendererForComponent(component) ? { renderer: shotcraftRendererForComponent(component) } : {}),
  }));
  const shotcraftCards = components
    .map((component) => component.renderer)
    .filter((renderer): renderer is NonNullable<ReturnType<typeof shotcraftRendererForComponent>> => Boolean(renderer));

  return {
    meta: project.meta,
    format: project.format,
    script: project.script,
    shots: project.shots,
    components,
    layers: project.layers ?? [],
    motionLibrary: project.motionLibrary ?? [],
    design: project.design,
    voice: project.voice,
    media: project.media,
    subtitles: project.subtitles,
    sfx: {
      ...project.sfx,
      cues: [...sfxCues, ...layerSfxCues],
    },
    shotcraft: {
      enabled: shotcraftCards.length > 0,
      root: 'D:/project/video-shotcraft',
      cards: shotcraftCards,
    },
  };
}

function shotcraftRendererForComponent(component: ComponentInstance) {
  if (!component.slug.startsWith('shotcraft-')) return null;
  const styles = parseShotcraftStyles(component.props.shotcraftStylesJson);
  const styleKey = String(component.props.shotcraftStyleKey ?? styles[0]?.key ?? component.slug.replace(/^shotcraft-/, ''));
  const selectedStyle = styles.find((style) => style.key === styleKey) ?? styles[0];
  const demoFiles = String(component.props.shotcraftDemoFiles ?? '')
    .split(/\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    kind: 'video-shotcraft-native' as const,
    componentId: component.id,
    slug: component.slug,
    cardName: String(component.props.shotcraftName ?? component.slug.replace(/^shotcraft-/, '')),
    styleKey,
    styleLabel: selectedStyle?.label ?? String(component.props.title ?? ''),
    category: String(component.props.shotcraftCategory ?? ''),
    recipePath: String(component.props.shotcraftSource ?? ''),
    demoFiles,
    selectedDemoFile: selectShotcraftDemoFile(demoFiles, styleKey),
    nativeDurationFrames: Number(component.props.nativeDurationFrames ?? 0),
    previewUrl: selectedStyle?.previewUrl ?? String(component.props.previewUrl ?? ''),
    renderMode: String(component.props.renderMode ?? 'video-shotcraft-native'),
    nativeStatus: String(component.props.nativeStatus ?? (demoFiles.length ? 'demo-source-ready' : 'recipe-only')),
    editableBounds: {
      x: component.x,
      y: component.y,
      w: component.w,
      h: component.h,
      z: component.z,
      startSec: component.startSec,
      durationSec: component.durationSec,
    },
  };
}

function parseShotcraftStyles(raw: unknown): { key: string; label: string; previewUrl: string }[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as { key?: string; label?: string; previewUrl?: string }[];
    return Array.isArray(parsed)
      ? parsed
          .map((item) => ({
            key: String(item.key ?? ''),
            label: String(item.label ?? item.key ?? ''),
            previewUrl: String(item.previewUrl ?? ''),
          }))
          .filter((item) => item.key)
      : [];
  } catch {
    return [];
  }
}

function selectShotcraftDemoFile(files: string[], styleKey: string) {
  const normalized = styleKey.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return files.find((file) => file.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(normalized)) ?? files[0] ?? '';
}

export function exportShotbook(project: WorkbenchProject): string {
  const lines = [
    `# ${project.meta.name} SHOTBOOK`,
    '',
    `- 画幅: ${project.format.width}x${project.format.height}`,
    `- FPS: ${project.meta.fps}`,
    `- 总时长: ${getTotalDuration(project).toFixed(1)}s`,
    '',
  ];

  for (const shot of project.shots) {
    const sentenceText = shot.sentenceIds
      .map((id) => project.script.find((item) => item.id === id)?.text)
      .filter(Boolean)
      .join(' / ');
    const comps = project.components.filter((component) => component.shotId === shot.id);
    lines.push(`## ${shot.id} · ${shot.title}`);
    lines.push(`- 时间: ${shot.startSec.toFixed(2)}s - ${(shot.startSec + shot.durationSec).toFixed(2)}s`);
    lines.push(`- 口播: ${sentenceText || '待补'}`);
    lines.push(`- 背景面: ${shot.background}; cameraPath=${JSON.stringify(shot.cameraPath)}`);
    lines.push(`- 主体面: ${comps.map((c) => c.slug).join(', ') || '继承全局系统'}`);
    lines.push(`- 文字面: 底部字幕素排; 独立文字/标注来自组件实例`);
    lines.push('');
    lines.push('| 组件 | 入点 | 时长 | 位置 | SFX |');
    lines.push('|---|---:|---:|---|---|');
    for (const comp of comps) {
      const cueText = comp.sfxEnabled
        ? comp.sfxCues.map((cue) => `${cue.t.toFixed(2)}s ${cue.assetId}${cue.note ? ` (${cue.note})` : ''}`).join('<br>')
        : '关闭';
      lines.push(`| ${comp.slug} | ${comp.startSec.toFixed(2)}s | ${comp.durationSec.toFixed(2)}s | x:${Math.round(comp.x)} y:${Math.round(comp.y)} w:${Math.round(comp.w)} h:${Math.round(comp.h)} | ${cueText || '无'} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function downloadText(filename: string, text: string, mime = 'application/json') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
