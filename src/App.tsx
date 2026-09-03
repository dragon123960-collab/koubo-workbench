import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, DragEvent, PointerEvent } from 'react';
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileJson,
  FileText,
  Layers,
  Maximize2,
  MousePointer2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  WandSparkles,
} from 'lucide-react';
import './App.css';
import { getComponentGuidance } from './data/aiGuidance';
import { commonLayerTemplates, createLayerFromTemplate, type CommonLayerTemplate } from './data/commonLayers';
import { componentDefinitions, sfxAssets } from './data/generated';
import { shotcraftDefinitions } from './data/shotcraft';
import { buildMotionLibraryItems } from './data/motionLibrary';
import { SfxEngine } from './lib/audio';
import {
  STORAGE_KEY,
  EDITABLE_COMPONENT_BACKGROUND,
  buildSentenceChars,
  createDefaultProject,
  createInstance,
  createMediaTrack,
  downloadText,
  exportRemotionProps,
  exportShotbook,
  getTotalDuration,
  normalizeProject,
  sentenceDuration,
  splitScriptIntoProject,
} from './lib/project';
import { CanonicalLayer } from './renderer/CanonicalStage';
import { exportHyperframesHtml } from './renderer/htmlComposition';
import type { ComponentDefinition, ComponentInstance, ComponentThemeSettings, CornerBugSettings, GlobalStyleSettings, Layer, MediaLayout, MediaSource, MediaTrack, MotionCategory, RichTextLine, ScriptSentence, SfxCue, ShotBackgroundStyle, SubtitleSettings, WorkbenchProject } from './types';

const STAGE_W = 1920;
const STAGE_H = 1080;
const MIN_COMPONENT_SIZE = 120;
const MIN_MEDIA_SIZE = 80;
const DEFAULT_COMPONENT_FONT_SIZE = 40;

type DragState =
  | { mode: 'move'; kind: 'component' | 'media' | 'layer'; id: string; dx: number; dy: number }
  | { mode: 'resize'; kind: 'component' | 'media' | 'layer'; id: string; startX: number; startY: number; startW: number; startH: number };

type SelectedTarget = { kind: 'component' | 'media' | 'layer'; id: string } | null;
type PreviewRange = { kind: 'component' | 'media' | 'layer' | 'shot'; id: string; endSec: number } | null;

type LeftTab = 'common' | 'media' | 'sfx' | 'script' | 'library' | 'voice' | 'subtitles';
type TimelineScope = 'full' | 'shot';
type MotionLibraryMode = 'favorites' | 'talkcraft' | 'shotcraft' | 'all';

const categories: MotionCategory[] = ['字幕花字', '强调标注', '数据信息图', '素材呈现', '转场结构', '人物互动', '运镜', '产品镜头'];
const allComponentDefinitions = [...componentDefinitions, ...shotcraftDefinitions];


function loadProject(): WorkbenchProject {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return createDefaultProject();
  try {
    const parsed = JSON.parse(stored) as WorkbenchProject;
    if (!parsed.components || !parsed.shots || !parsed.script) throw new Error('bad project');
    return normalizeProject(parsed);
  } catch {
    return createDefaultProject();
  }
}

function App() {
  const [project, setProject] = useState<WorkbenchProject>(() => loadProject());
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget>(project.layers[0] ? { kind: 'layer', id: project.layers[0].id } : project.components[0] ? { kind: 'component', id: project.components[0].id } : null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MotionCategory | '全部'>('全部');
  const [motionLibraryMode, setMotionLibraryMode] = useState<MotionLibraryMode>('favorites');
  const [sfxQuery, setSfxQuery] = useState('');
  const [leftTab, setLeftTab] = useState<LeftTab>('common');
  const [charJsonDraft, setCharJsonDraft] = useState('');
  const [showGuides, setShowGuides] = useState(true);
  const [timelineHeight, setTimelineHeight] = useState(220);
  const [timelineScope, setTimelineScope] = useState<TimelineScope>('full');
  const [showStagePreview, setShowStagePreview] = useState(false);
  const [previewDefinition, setPreviewDefinition] = useState<ComponentDefinition | null>(null);
  const [previewDemoTime, setPreviewDemoTime] = useState(0);
  const [previewRange, setPreviewRange] = useState<PreviewRange>(null);
  const [playingCueId, setPlayingCueId] = useState('');
  const [pendingDefinition, setPendingDefinition] = useState<ComponentDefinition | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<CommonLayerTemplate | null>(null);
  const [mediaDraft, setMediaDraft] = useState({ name: '', src: '', type: 'hostVideo' as MediaSource['type'] });
  const [scriptDraft, setScriptDraft] = useState(project.script.map((line) => line.text).join('\n'));
  const [drag, setDrag] = useState<DragState | null>(null);
  const [timelineDrag, setTimelineDrag] = useState<{ type: 'playhead' | 'clip'; kind?: 'component' | 'media' | 'layer'; id?: string; offset?: number } | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [previewScale, setPreviewScale] = useState(0.65);
  const stageWrapRef = useRef<HTMLDivElement | null>(null);
  const previewShellRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const draggedDefinitionRef = useRef<ComponentDefinition | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const engineRef = useRef<SfxEngine | null>(null);
  const cueStopRef = useRef<(() => void) | null>(null);

  const totalDuration = useMemo(() => getTotalDuration(project), [project]);
  const selectedComponent = selectedTarget?.kind === 'component' ? project.components.find((component) => component.id === selectedTarget.id) ?? null : null;
  const selectedMediaTrack = selectedTarget?.kind === 'media' ? project.media.tracks.find((track) => track.id === selectedTarget.id) ?? null : null;
  const selectedLayer = selectedTarget?.kind === 'layer' ? project.layers.find((layer) => layer.id === selectedTarget.id) ?? null : null;
  const selectedMediaSource = selectedMediaTrack ? project.media.sources.find((source) => source.id === selectedMediaTrack.sourceId) : undefined;
  const selectedDefinition = selectedComponent ? allComponentDefinitions.find((def) => def.slug === selectedComponent.slug) : undefined;
  const activeShot = project.shots.find((shot) => currentTime >= shot.startSec && currentTime < shot.startSec + shot.durationSec) ?? project.shots[0];
  const activeSentence = project.script.find((sentence) => currentTime >= (sentence.startSec ?? 0) && currentTime < (sentence.endSec ?? (sentence.startSec ?? 0) + sentenceDuration))
    ?? project.script.find((sentence) => activeShot?.sentenceIds.includes(sentence.id))
    ?? project.script[0];
  const activeBackground = project.design.useGlobalBackground ? project.design.backgroundStyle : activeShot?.backgroundStyle;
  const activeComponents = project.components
    .filter((component) => currentTime >= component.startSec && currentTime <= component.startSec + component.durationSec)
    .sort((a, b) => a.z - b.z);
  const activeLayers = project.layers
    .filter((layer) => currentTime >= layer.startSec && currentTime <= layer.startSec + layer.durationSec)
    .sort((a, b) => a.z - b.z);
  const activeMediaTracks = project.media.tracks
    .filter((track) => currentTime >= track.startSec && currentTime <= track.startSec + track.durationSec)
    .sort((a, b) => a.z - b.z);
  const timelineStart = timelineScope === 'shot' && activeShot ? activeShot.startSec : 0;
  const timelineDuration = Math.max(0.1, timelineScope === 'shot' && activeShot ? activeShot.durationSec : totalDuration);
  const timelineEnd = timelineStart + timelineDuration;
  const timelineShots = project.shots.filter((shot) => overlaps(shot.startSec, shot.durationSec, timelineStart, timelineEnd));
  const timelineMediaTracks = project.media.tracks.filter((track) => overlaps(track.startSec, track.durationSec, timelineStart, timelineEnd));
  const timelineComponents = project.components.filter((component) => overlaps(component.startSec, component.durationSec, timelineStart, timelineEnd));
  const timelineLayers = project.layers.filter((layer) => overlaps(layer.startSec, layer.durationSec, timelineStart, timelineEnd));
  const previewInstance = useMemo(() => previewDefinition ? createPreviewInstance(previewDefinition, project.design.componentTheme) : null, [previewDefinition, project.design.componentTheme]);
  const filteredLibraryItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (project.motionLibrary?.length ? project.motionLibrary : buildMotionLibraryItems()).filter((item) => {
      const inMode = motionLibraryMode === 'favorites'
        ? item.favorite || item.status === 'native'
        : motionLibraryMode === 'talkcraft'
          ? item.source === 'talkcraft'
          : motionLibraryMode === 'shotcraft'
            ? item.source === 'shotcraft'
            : true;
      const inCategory = category === '全部' || item.category === category;
      const inSearch = !needle || `${item.slug} ${item.title} ${item.summary} ${item.suitableFor.join(' ')}`.toLowerCase().includes(needle);
      return inMode && inCategory && inSearch;
    }).sort((a, b) => {
      if (a.status !== b.status) return a.status === 'native' ? -1 : b.status === 'native' ? 1 : 0;
      return a.title.localeCompare(b.title, 'zh-Hans-CN');
    });
  }, [category, motionLibraryMode, project.motionLibrary, query]);

  const filteredSfx = useMemo(() => {
    const needle = sfxQuery.trim().toLowerCase();
    return sfxAssets.filter((asset) => !needle || `${asset.category} ${asset.name} ${asset.recommendedUse}`.toLowerCase().includes(needle));
  }, [sfxQuery]);
  const timelineTrackHeight = Math.max(128, timelineLayers.length * 42 + timelineComponents.length * 42 + timelineMediaTracks.length * 28 + 40);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...project, meta: { ...project.meta, updatedAt: new Date().toISOString() } }));
  }, [project]);

  useEffect(() => {
    engineRef.current = new SfxEngine(sfxAssets);
  }, []);

  useEffect(() => {
    const node = stageWrapRef.current;
    if (!node) return undefined;
    return observeStageScale(node, setStageScale);
  }, []);

  useEffect(() => {
    if (!showStagePreview) return undefined;
    const node = previewShellRef.current;
    if (!node) return undefined;
    return observeStageScale(node, setPreviewScale);
  }, [showStagePreview]);

  useEffect(() => {
    if (!previewDefinition) return undefined;
    const duration = previewDuration(previewDefinition);
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      setPreviewDemoTime(((now - startedAt) / 1000) % duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [previewDefinition]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select')) return;
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedTarget) {
        event.preventDefault();
        if (selectedTarget.kind === 'component') {
          setProject((current) => ({ ...current, components: current.components.filter((component) => component.id !== selectedTarget.id) }));
        } else if (selectedTarget.kind === 'layer') {
          setProject((current) => ({ ...current, layers: current.layers.filter((layer) => layer.id !== selectedTarget.id) }));
        } else {
          setProject((current) => ({ ...current, media: { ...current.media, tracks: current.media.tracks.filter((track) => track.id !== selectedTarget.id) } }));
        }
        if (previewRange?.id === selectedTarget.id && previewRange.kind === selectedTarget.kind) {
          setIsPlaying(false);
          setPreviewRange(null);
        }
        setSelectedTarget(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewRange, selectedTarget]);

  const triggerSfxBetween = useCallback((from: number, to: number) => {
    if (!project.sfx.enabled || !engineRef.current || to < from) return;
    for (const layer of project.layers) {
      if (!layer.sfxEnabled) continue;
      for (const cue of layer.sfxCues ?? []) {
        const absolute = layer.startSec + cue.t;
        if (absolute > from && absolute <= to) {
          void engineRef.current.play(cue, project.sfx.masterVolume);
        }
      }
    }
    for (const component of project.components) {
      if (!component.sfxEnabled) continue;
      for (const cue of component.sfxCues) {
        const absolute = component.startSec + cue.t;
        if (absolute > from && absolute <= to) {
          void engineRef.current.play(cue, project.sfx.masterVolume);
        }
      }
    }
  }, [project.components, project.layers, project.sfx.enabled, project.sfx.masterVolume]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastTickRef.current = null;
      voiceAudioRef.current?.pause();
      return;
    }

    const tick = (now: number) => {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      setCurrentTime((time) => {
        const limit = previewRange?.endSec ?? totalDuration;
        const next = Math.min(limit, time + delta);
        if (next >= limit) {
          setIsPlaying(false);
          setPreviewRange(null);
          voiceAudioRef.current?.pause();
        }
        triggerSfxBetween(time, next);
        return next;
      });
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, previewRange, totalDuration, triggerSfxBetween]);

  function updateProject(updater: (draft: WorkbenchProject) => WorkbenchProject) {
    setProject((current) => updater(current));
  }

  function setTime(time: number) {
    const next = Math.max(0, Math.min(totalDuration, time));
    setCurrentTime(next);
    if (isPlaying) syncVoice(next, true);
  }

  function shotAtTime(time: number) {
    return project.shots.find((shot) => time >= shot.startSec && time < shot.startSec + shot.durationSec) ?? activeShot ?? project.shots[0];
  }

  function createComponentAt(def: ComponentDefinition, centerX: number, centerY: number, startSec = currentTime) {
    const shot = shotAtTime(startSec);
    const maxZ = Math.max(0, ...project.components.map((component) => component.z));
    const x = clamp(centerX - def.defaultSize.w / 2, 0, STAGE_W - def.defaultSize.w);
    const y = clamp(centerY - def.defaultSize.h / 2, 0, STAGE_H - def.defaultSize.h);
    const instance = createInstance(def, shot.id, Math.max(shot.startSec, startSec), x, y, maxZ + 1);
    updateProject((draft) => ({ ...draft, components: [...draft.components, instance] }));
    setSelectedTarget({ kind: 'component', id: instance.id });
    setCurrentTime(clamp(instance.startSec + instance.durationSec / 2, 0, Math.max(totalDuration, instance.startSec + instance.durationSec)));
  }

  function addComponent(def: ComponentDefinition) {
    createComponentAt(def, STAGE_W / 2, STAGE_H / 2);
    setPendingDefinition(null);
  }

  function createLayerAt(template: CommonLayerTemplate, centerX: number, centerY: number, startSec = currentTime) {
    const shot = shotAtTime(startSec);
    const maxZ = Math.max(0, ...project.layers.map((layer) => layer.z), ...project.components.map((component) => component.z), ...project.media.tracks.map((track) => track.z));
    const x = clamp(centerX - template.defaultSize.w / 2, 0, STAGE_W - template.defaultSize.w);
    const y = clamp(centerY - template.defaultSize.h / 2, 0, STAGE_H - template.defaultSize.h);
    const layer = createLayerFromTemplate(template, {
      shotId: shot.id,
      startSec: Math.max(shot.startSec, startSec),
      durationSec: Math.min(template.defaultSize.w > 1000 ? 5 : 4.2, shot.durationSec),
      x,
      y,
      z: maxZ + 1,
      theme: project.design.theme,
    });
    updateProject((draft) => ({ ...draft, layers: [...draft.layers, layer] }));
    setSelectedTarget({ kind: 'layer', id: layer.id });
    setCurrentTime(clamp(layer.startSec + layer.durationSec / 2, 0, Math.max(totalDuration, layer.startSec + layer.durationSec)));
  }

  function addLayerTemplate(template: CommonLayerTemplate) {
    createLayerAt(template, STAGE_W / 2, STAGE_H / 2);
    setPendingTemplate(null);
  }

  function closeComponentPreview() {
    cueStopRef.current?.();
    cueStopRef.current = null;
    setPreviewDefinition(null);
  }

  function playDefinitionSfx(def: ComponentDefinition) {
    if (!engineRef.current) return;
    cueStopRef.current?.();
    const cues = def.defaultSfxCues.length ? def.defaultSfxCues : [{ assetId: 'ui-pop', volume: 0.42, t: 0, id: 'preview-fallback', componentId: '' }];
    const timers = cues.map((cue) => window.setTimeout(() => {
      void engineRef.current?.play({ assetId: cue.assetId, volume: cue.volume, rate: cue.rate, clip: cue.clip }, project.sfx.masterVolume);
    }, Math.max(0, cue.t) * 1000));
    cueStopRef.current = () => timers.forEach((timer) => window.clearTimeout(timer));
  }

  function addMediaSource() {
    const src = mediaDraft.src.trim();
    if (!src) {
      window.alert('请先填写素材路径，例如 /media/host.mp4。');
      return;
    }
    const source: MediaSource = {
      id: `source-${Date.now().toString(36)}`,
      name: mediaDraft.name.trim() || mediaDraft.src.split(/[\\/]/).pop() || '未命名素材',
      type: mediaDraft.type,
      src,
    };
    updateProject((draft) => ({ ...draft, media: { ...draft.media, sources: [...draft.media.sources, source] } }));
    setMediaDraft({ name: '', src: '', type: mediaDraft.type });
  }

  function addMediaTrack(source: MediaSource, layout: MediaLayout) {
    const shot = shotAtTime(currentTime);
    const track = createMediaTrack(source, layout, shot.startSec, shot.durationSec);
    updateProject((draft) => ({ ...draft, media: { ...draft.media, tracks: [...draft.media.tracks, track] } }));
    setSelectedTarget({ kind: 'media', id: track.id });
    setCurrentTime(clamp(track.startSec + track.durationSec / 2, 0, Math.max(totalDuration, track.startSec + track.durationSec)));
  }

  function addFullLengthMediaTrack(source: MediaSource, layout: MediaLayout) {
    const duration = Math.max(totalDuration, project.voice.durationSec ?? 0, 1);
    const track = createMediaTrack(source, layout, 0, duration);
    updateProject((draft) => ({ ...draft, media: { ...draft.media, tracks: [...draft.media.tracks, track] } }));
    setSelectedTarget({ kind: 'media', id: track.id });
    setCurrentTime(clamp(track.startSec + Math.min(2, track.durationSec / 2), 0, duration));
  }

  function updateMediaTrack(id: string, patch: Partial<MediaTrack>) {
    updateProject((draft) => ({
      ...draft,
      media: {
        ...draft.media,
        tracks: draft.media.tracks.map((track) => (track.id === id ? { ...track, ...patch } : track)),
      },
    }));
  }

  function removeMediaTrack(id: string) {
    updateProject((draft) => ({ ...draft, media: { ...draft.media, tracks: draft.media.tracks.filter((track) => track.id !== id) } }));
    setSelectedTarget((current) => (current?.kind === 'media' && current.id === id ? null : current));
    if (previewRange?.kind === 'media' && previewRange.id === id) {
      setIsPlaying(false);
      setPreviewRange(null);
    }
  }

  function splitMediaTrackAtPlayhead(track: MediaTrack, nextLayout: MediaLayout) {
    const splitSec = clamp(currentTime, track.startSec + 0.1, track.startSec + track.durationSec - 0.1);
    if (splitSec <= track.startSec || splitSec >= track.startSec + track.durationSec) {
      window.alert('请把播放头放在素材片段中间，再切换显示形态。');
      return;
    }
    const fromFrame = mediaFrameAt(track, splitSec);
    const beforeDuration = Number((splitSec - track.startSec).toFixed(2));
    const afterDuration = Number((track.startSec + track.durationSec - splitSec).toFixed(2));
    const nextTrack: MediaTrack = {
      ...track,
      id: `media-${track.sourceId}-${Date.now().toString(36)}`,
      startSec: Number(splitSec.toFixed(2)),
      durationSec: afterDuration,
      layout: nextLayout,
      ...layoutPatch(nextLayout),
      transitionSec: Math.min(0.55, Math.max(0.2, afterDuration * 0.4)),
      transitionFrom: fromFrame,
    };
    updateProject((draft) => ({
      ...draft,
      media: {
        ...draft.media,
        tracks: draft.media.tracks.flatMap((item) => (item.id === track.id ? [{ ...item, durationSec: beforeDuration }, nextTrack] : [item])),
      },
    }));
    setSelectedTarget({ kind: 'media', id: nextTrack.id });
  }

  function updateComponent(id: string, patch: Partial<ComponentInstance>) {
    updateProject((draft) => ({
      ...draft,
      components: draft.components.map((component) => (component.id === id ? { ...component, ...patch } : component)),
    }));
  }

  function updateLayer(id: string, patch: Partial<Layer>) {
    updateProject((draft) => ({
      ...draft,
      layers: draft.layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)),
    }));
  }

  function updateLayerStyle(id: string, patch: Layer['style']) {
    const layer = project.layers.find((item) => item.id === id);
    if (!layer) return;
    updateLayer(id, { style: { ...layer.style, ...patch } });
  }

  function updateChildLayer(groupId: string, childId: string, patch: Partial<Layer>) {
    updateProject((draft) => ({
      ...draft,
      layers: draft.layers.map((layer) => (
        layer.id === groupId
          ? { ...layer, children: layer.children?.map((child) => (child.id === childId ? { ...child, ...patch } : child)) }
          : layer
      )),
    }));
  }

  function updateChildLayerStyle(groupId: string, childId: string, patch: Layer['style']) {
    const group = project.layers.find((item) => item.id === groupId);
    const child = group?.children?.find((item) => item.id === childId);
    if (!child) return;
    updateChildLayer(groupId, childId, { style: { ...child.style, ...patch } });
  }

  function resetSelectedLayerToDefault() {
    if (!selectedLayer?.templateSlug) return;
    const template = commonLayerTemplates.find((item) => item.slug === selectedLayer.templateSlug);
    if (!template) return;
    const reset = template.create({
      id: selectedLayer.id,
      shotId: selectedLayer.shotId,
      startSec: selectedLayer.startSec,
      durationSec: selectedLayer.durationSec,
      x: selectedLayer.x,
      y: selectedLayer.y,
      z: selectedLayer.z,
      theme: project.design.theme,
    });
    updateLayer(selectedLayer.id, reset);
  }

  function updateSelectedProps(key: string, value: string | number | boolean) {
    if (!selectedComponent) return;
    updateComponent(selectedComponent.id, { props: { ...selectedComponent.props, [key]: value } });
  }

  function resetSelectedComponentToDefault() {
    if (!selectedComponent || !selectedDefinition) return;
    const durationSec = Number((selectedDefinition.defaultTiming.enter + selectedDefinition.defaultTiming.hold + selectedDefinition.defaultTiming.exit).toFixed(2));
    updateComponent(selectedComponent.id, {
      props: {
        ...selectedDefinition.defaultProps,
        background: String(selectedDefinition.defaultProps.background ?? '').trim() === 'transparent' ? EDITABLE_COMPONENT_BACKGROUND : selectedDefinition.defaultProps.background,
      },
      enter: selectedDefinition.defaultTiming.enter,
      hold: selectedDefinition.defaultTiming.hold,
      exit: selectedDefinition.defaultTiming.exit,
      durationSec,
      w: selectedDefinition.defaultSize.w,
      h: selectedDefinition.defaultSize.h,
      sfxEnabled: selectedDefinition.defaultSfxCues.length > 0,
      sfxCues: selectedDefinition.defaultSfxCues.map((cue, index) => ({
        ...cue,
        id: `${selectedComponent.id}-cue-${index + 1}`,
        componentId: selectedComponent.id,
      })),
    });
  }

  function renderDynamicProps() {
    if (!selectedComponent) return null;
    const builtInKeys = new Set(['title', 'text', 'accent', 'background', 'keyword', 'keywordColor', 'assetUrl']);
    const dynamicEntries = Object.entries(selectedComponent.props).filter(([key]) => !builtInKeys.has(key));
    const def = selectedDefinition;
    const guidance = def ? getComponentGuidance(def) : null;
    const missingEditable = (guidance?.editProps ?? []).filter((key) => !builtInKeys.has(key) && !(key in selectedComponent.props));
    const entries = [
      ...dynamicEntries,
      ...missingEditable.map((key) => [key, defaultPropValue(key)] as [string, string | number | boolean]),
    ];
    if (!entries.length) return null;
    return (
      <div className="dynamic-props">
        <div className="mini-title">组件参数</div>
        {entries.map(([key, value]) => {
          if (typeof value === 'boolean') {
            return (
              <label key={key} className="toggle-row">
                <input type="checkbox" checked={value} onChange={(event) => updateSelectedProps(key, event.target.checked)} />
                <span>{propLabel(key)}</span>
              </label>
            );
          }
          if (typeof value === 'number') {
            return <Field key={key} label={propLabel(key)} value={value} type="number" step={key.toLowerCase().includes('size') ? '1' : '0.1'} onChange={(next) => updateSelectedProps(key, Number(next))} />;
          }
          if (key.toLowerCase().includes('fontfamily')) {
            return (
              <label key={key} className="field">
                <span>{propLabel(key)}</span>
                <select value={String(value)} onChange={(event) => updateSelectedProps(key, event.target.value)}>
                  {fontFamilyOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            );
          }
          if (isBackgroundKey(key)) {
            return <BackgroundField key={key} label={propLabel(key)} value={String(value)} onChange={(next) => updateSelectedProps(key, next)} />;
          }
          if (key.toLowerCase().includes('color') && /^#[0-9a-f]{6}$/i.test(String(value))) {
            return (
              <label key={key} className="field">
                <span>{propLabel(key)}</span>
                <input type="color" value={String(value)} onChange={(event) => updateSelectedProps(key, event.target.value)} />
              </label>
            );
          }
          const isLong = key === 'items' || String(value).length > 44;
          return (
            <label key={key} className="field">
              <span>{propLabel(key)}</span>
              {isLong ? (
                <textarea value={String(value)} onChange={(event) => updateSelectedProps(key, event.target.value)} placeholder={key === 'items' ? '每行一个条目，或用 / 分隔' : undefined} />
              ) : (
                <input value={String(value)} onChange={(event) => updateSelectedProps(key, event.target.value)} />
              )}
            </label>
          );
        })}
      </div>
    );
  }

  function updateSubtitles(patch: Partial<SubtitleSettings>) {
    updateProject((draft) => ({ ...draft, subtitles: { ...draft.subtitles, ...patch } }));
  }

  function updateDesign(patch: Partial<GlobalStyleSettings>) {
    updateProject((draft) => ({ ...draft, design: { ...draft.design, ...patch } }));
  }

  function updateGlobalBackground(patch: Partial<ShotBackgroundStyle>) {
    updateProject((draft) => ({ ...draft, design: { ...draft.design, backgroundStyle: { ...draft.design.backgroundStyle, ...patch } } }));
  }

  function updateCornerBug(patch: Partial<CornerBugSettings>) {
    updateProject((draft) => ({ ...draft, design: { ...draft.design, cornerBug: { ...draft.design.cornerBug, ...patch } } }));
  }

  function updateComponentTheme(patch: Partial<ComponentThemeSettings>) {
    updateProject((draft) => ({ ...draft, design: { ...draft.design, componentTheme: { ...draft.design.componentTheme, ...patch } } }));
  }

  function updateDesignTheme(patch: Partial<GlobalStyleSettings['theme']>) {
    updateProject((draft) => ({ ...draft, design: { ...draft.design, theme: { ...draft.design.theme, ...patch } } }));
  }

  function applyComponentThemeToAll() {
    const theme = project.design.componentTheme;
    updateProject((draft) => ({
      ...draft,
      components: draft.components.map((component) => ({
        ...component,
        props: themedComponentProps(component, theme),
      })),
      layers: draft.layers.map((layer) => themedLayer(layer, theme, draft.design.theme)),
    }));
  }

  function applyComponentThemeToSelected() {
    if (!selectedComponent) return;
    updateComponent(selectedComponent.id, { props: themedComponentProps(selectedComponent, project.design.componentTheme) });
  }

  function setGlobalBackgroundFromActiveShot() {
    if (!activeShot) return;
    updateDesign({ useGlobalBackground: true, backgroundStyle: { ...activeShot.backgroundStyle } });
  }

  function updateActiveShotBackground(patch: Partial<ShotBackgroundStyle>) {
    if (!activeShot) return;
    updateProject((draft) => ({
      ...draft,
      shots: draft.shots.map((shot) => (shot.id === activeShot.id ? { ...shot, backgroundStyle: { ...shot.backgroundStyle, ...patch } } : shot)),
    }));
  }

  function applyActiveShotBackgroundToAll() {
    if (!activeShot) return;
    const backgroundStyle = { ...activeShot.backgroundStyle };
    updateProject((draft) => ({
      ...draft,
      shots: draft.shots.map((shot) => ({ ...shot, backgroundStyle: { ...backgroundStyle } })),
    }));
  }

  function deleteComponent(id: string) {
    updateProject((draft) => ({ ...draft, components: draft.components.filter((component) => component.id !== id) }));
    setSelectedTarget((current) => (current?.kind === 'component' && current.id === id ? null : current));
    if (previewRange?.kind === 'component' && previewRange.id === id) {
      setIsPlaying(false);
      setPreviewRange(null);
    }
  }

  function deleteLayer(id: string) {
    updateProject((draft) => ({ ...draft, layers: draft.layers.filter((layer) => layer.id !== id) }));
    setSelectedTarget((current) => (current?.kind === 'layer' && current.id === id ? null : current));
    if (previewRange?.kind === 'layer' && previewRange.id === id) {
      setIsPlaying(false);
      setPreviewRange(null);
    }
  }

  function previewSelected() {
    const target = selectedComponent
      ? { kind: 'component' as const, id: selectedComponent.id, startSec: selectedComponent.startSec, durationSec: selectedComponent.durationSec }
      : selectedLayer
        ? { kind: 'layer' as const, id: selectedLayer.id, startSec: selectedLayer.startSec, durationSec: selectedLayer.durationSec }
        : selectedMediaTrack
        ? { kind: 'media' as const, id: selectedMediaTrack.id, startSec: selectedMediaTrack.startSec, durationSec: selectedMediaTrack.durationSec }
        : null;
    if (!target) return;
    const isPreviewing = isPlaying && previewRange?.kind === target.kind && previewRange.id === target.id;
    if (isPreviewing) {
      stopPlayback();
      return;
    }
    startPlaybackAt(target.startSec, { kind: target.kind, id: target.id, endSec: target.startSec + target.durationSec });
  }

  function previewCurrentShot() {
    if (!activeShot) return;
    const isPreviewing = isPlaying && previewRange?.kind === 'shot' && previewRange.id === activeShot.id;
    if (isPreviewing) {
      stopPlayback();
      return;
    }
    startPlaybackAt(activeShot.startSec, { kind: 'shot', id: activeShot.id, endSec: activeShot.startSec + activeShot.durationSec });
  }

  function previewCue(cue: SfxCue) {
    if (playingCueId === cue.id) {
      cueStopRef.current?.();
      cueStopRef.current = null;
      setPlayingCueId('');
      return;
    }
    cueStopRef.current?.();
    setPlayingCueId(cue.id);
    void engineRef.current?.play(cue, project.sfx.masterVolume).then((stop) => {
      cueStopRef.current = stop;
      window.setTimeout(() => {
        setPlayingCueId((current) => (current === cue.id ? '' : current));
        if (cueStopRef.current === stop) cueStopRef.current = null;
      }, Math.max(450, Number(cue.clip ?? 0.6) * 1000));
    }).catch(() => {
      setPlayingCueId('');
      cueStopRef.current = null;
    });
  }

  function estimateCharTiming() {
    updateProject((draft) => ({
      ...draft,
      voice: { ...draft.voice, timestampMode: 'estimated' },
      script: draft.script.map((sentence) => {
        const start = sentence.startSec ?? 0;
        const end = sentence.endSec ?? start + sentenceDuration;
        return { ...sentence, chars: buildSentenceChars(sentence.text, start, end) };
      }),
    }));
  }

  function importCharTimingText(text: string) {
    try {
      const parsed = JSON.parse(text) as unknown;
      const incoming = Array.isArray(parsed) ? parsed : isRecord(parsed) && Array.isArray(parsed.script) ? parsed.script : null;
      if (!incoming) throw new Error('bad timestamp json');
      updateProject((draft) => ({
        ...draft,
        voice: { ...draft.voice, timestampMode: 'imported' },
        script: draft.script.map((sentence, index) => {
          const item = incoming[index];
          if (!isRecord(item) || !Array.isArray(item.chars)) return sentence;
          return {
            ...sentence,
            startSec: typeof item.startSec === 'number' ? item.startSec : sentence.startSec,
            endSec: typeof item.endSec === 'number' ? item.endSec : sentence.endSec,
            chars: item.chars.filter(isCharTiming),
          };
        }),
      }));
      return true;
    } catch {
      window.alert('逐字时间戳 JSON 无法读取，请使用数组或 { script: [...] } 格式。');
      return false;
    }
  }

  function importCharTiming() {
    importCharTimingText(charJsonDraft);
  }

  function importCharTimingFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      if (importCharTimingText(text)) setCharJsonDraft(text);
    };
    reader.readAsText(file);
  }

  function updateCue(cueId: string, patch: Partial<SfxCue>) {
    if (!selectedComponent) return;
    updateComponent(selectedComponent.id, {
      sfxCues: selectedComponent.sfxCues.map((cue) => (cue.id === cueId ? { ...cue, ...patch } : cue)),
    });
  }

  function updateLayerCue(cueId: string, patch: Partial<SfxCue>) {
    if (!selectedLayer) return;
    updateLayer(selectedLayer.id, {
      sfxCues: (selectedLayer.sfxCues ?? []).map((cue) => (cue.id === cueId ? { ...cue, ...patch } : cue)),
    });
  }

  function stagePoint(event: PointerEvent) {
    return pointFromStage(event.clientX, event.clientY);
  }

  function pointFromStage(clientX: number, clientY: number) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scaleX = STAGE_W / rect.width;
    const scaleY = STAGE_H / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function onStagePointerMove(event: PointerEvent) {
    if (!drag) return;
    const point = stagePoint(event);
    const item = drag.kind === 'component'
      ? project.components.find((component) => component.id === drag.id)
      : drag.kind === 'layer'
        ? project.layers.find((layer) => layer.id === drag.id)
        : project.media.tracks.find((track) => track.id === drag.id);
    if (!item) return;
    if (drag.mode === 'move') {
      const patch = {
        x: clamp(point.x - drag.dx, 0, STAGE_W - item.w),
        y: clamp(point.y - drag.dy, 0, STAGE_H - item.h),
      };
      if (drag.kind === 'component') updateComponent(drag.id, patch);
      else if (drag.kind === 'layer') updateLayer(drag.id, patch);
      else updateMediaTrack(drag.id, patch);
    } else {
      const minSize = drag.kind === 'component' ? MIN_COMPONENT_SIZE : MIN_MEDIA_SIZE;
      const patch = {
        w: clamp(drag.startW + point.x - drag.startX, minSize, STAGE_W - item.x),
        h: clamp(drag.startH + point.y - drag.startY, minSize, STAGE_H - item.y),
      };
      if (drag.kind === 'component') updateComponent(drag.id, patch);
      else if (drag.kind === 'layer') updateLayer(drag.id, patch);
      else updateMediaTrack(drag.id, patch);
    }
  }

  function onTimelinePointer(event: PointerEvent) {
    event.preventDefault();
    const time = timelineTimeFromPointer(event);
    if (time === null) return;
    if (!timelineDrag || timelineDrag.type === 'playhead') {
      setTime(time);
      return;
    }
    const item = timelineDrag.kind === 'media'
      ? project.media.tracks.find((track) => track.id === timelineDrag.id)
      : timelineDrag.kind === 'layer'
        ? project.layers.find((layer) => layer.id === timelineDrag.id)
      : project.components.find((component) => component.id === timelineDrag.id);
    if (!item || !timelineDrag.id) return;
    const minStart = timelineScope === 'shot' ? timelineStart : 0;
    const maxEnd = timelineScope === 'shot' ? timelineEnd : totalDuration;
    const nextStart = clamp(time - (timelineDrag.offset ?? 0), minStart, Math.max(minStart, maxEnd - item.durationSec));
    if (timelineDrag.kind === 'media') updateMediaTrack(timelineDrag.id, { startSec: Number(nextStart.toFixed(2)) });
    else if (timelineDrag.kind === 'layer') updateLayer(timelineDrag.id, { startSec: Number(nextStart.toFixed(2)) });
    else updateComponent(timelineDrag.id, { startSec: Number(nextStart.toFixed(2)) });
    setTime(nextStart);
  }

  function timelineTimeFromPointer(event: PointerEvent) {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    return timelineStart + (x / rect.width) * timelineDuration;
  }

  function timelineItemStyle(startSec: number, durationSec: number): CSSProperties {
    const left = clamp(((startSec - timelineStart) / timelineDuration) * 100, 0, 100);
    const right = clamp(((startSec + durationSec - timelineStart) / timelineDuration) * 100, 0, 100);
    return { left: `${left}%`, width: `${Math.max(0.4, right - left)}%` };
  }

  function bringLayer(direction: 'front' | 'back') {
    if (!selectedTarget) return;
    const zValues = [...project.layers.map((layer) => layer.z), ...project.components.map((component) => component.z), ...project.media.tracks.map((track) => track.z), 0];
    const z = direction === 'front' ? Math.max(...zValues) + 1 : Math.min(...zValues) - 1;
    if (selectedTarget.kind === 'component') updateComponent(selectedTarget.id, { z });
    else if (selectedTarget.kind === 'layer') updateLayer(selectedTarget.id, { z });
    else updateMediaTrack(selectedTarget.id, { z });
  }

  function applyScript() {
    const next = splitScriptIntoProject(project, scriptDraft);
    setProject(next);
    setCurrentTime(0);
    setSelectedTarget(next.layers[0] ? { kind: 'layer', id: next.layers[0].id } : next.components[0] ? { kind: 'component', id: next.components[0].id } : null);
  }

  function togglePlayback() {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    startPlaybackAt(currentTime >= totalDuration ? 0 : currentTime, null);
  }

  function startPlaybackAt(startSec: number, range: PreviewRange) {
    const start = Math.max(0, Math.min(totalDuration, startSec));
    lastTickRef.current = null;
    setCurrentTime(start);
    setPreviewRange(range);
    syncVoice(start, true);
    setIsPlaying(true);
  }

  function stopPlayback() {
    setIsPlaying(false);
    setPreviewRange(null);
    lastTickRef.current = null;
    pauseVoice();
  }

  function syncVoice(time: number, shouldPlay: boolean) {
    const audio = voiceAudioRef.current;
    if (!audio || !project.voice.src) return;
    if (Math.abs(audio.currentTime - time) > 0.08) audio.currentTime = Math.max(0, time);
    if (shouldPlay) {
      void audio.play().catch(() => {
        // Browsers may block playback until the next direct user gesture.
      });
    }
  }

  function pauseVoice() {
    voiceAudioRef.current?.pause();
  }

  function dropComponent(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const templateSlug = event.dataTransfer.getData('application/x-koubo-layer-template');
    if (templateSlug) {
      const template = commonLayerTemplates.find((item) => item.slug === templateSlug);
      if (!template) return;
      const { x, y } = pointFromStage(event.clientX, event.clientY);
      createLayerAt(template, x, y);
      return;
    }
    const slug = event.dataTransfer.getData('application/x-koubo-component') || draggedDefinitionRef.current?.slug;
    const def = allComponentDefinitions.find((item) => item.slug === slug);
    if (!def) return;
    const { x, y } = pointFromStage(event.clientX, event.clientY);
    createComponentAt(def, x, y);
    draggedDefinitionRef.current = null;
  }

  function importProject(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = normalizeProject(JSON.parse(String(reader.result)) as WorkbenchProject);
        setProject(parsed);
        setScriptDraft(parsed.script.map((line) => line.text).join('\n'));
        setSelectedTarget(parsed.layers[0] ? { kind: 'layer', id: parsed.layers[0].id } : parsed.components[0] ? { kind: 'component', id: parsed.components[0].id } : parsed.media.tracks[0] ? { kind: 'media', id: parsed.media.tracks[0].id } : null);
        setTime(0);
      } catch {
        window.alert('JSON 无法读取，请确认是工作台项目文件。');
      }
    };
    reader.readAsText(file);
  }

  function exportJson() {
    downloadText('remotion-props.json', JSON.stringify(exportRemotionProps(project), null, 2));
  }

  function exportWorkbenchJson() {
    downloadText('koubo-workbench-project.json', JSON.stringify(project, null, 2));
  }

  function exportHyperframesComposition() {
    downloadText('index.html', exportHyperframesHtml(project), 'text/html');
  }

  function exportBook() {
    downloadText('shotbook.md', exportShotbook(project), 'text/markdown');
  }

  function renderStageContent(readOnly = false) {
    return (
      <>
        <div className="stage-bg" style={stageBackgroundStyle(activeBackground)} />
        <CornerBugOverlay settings={project.design.cornerBug} />
        {activeMediaTracks.map((track) => (
          <MediaLayer
            key={track.id}
            track={track}
            source={project.media.sources.find((item) => item.id === track.sourceId)}
            currentTime={currentTime}
            selected={!readOnly && selectedTarget?.kind === 'media' && selectedTarget.id === track.id}
            readOnly={readOnly}
            onSelect={() => setSelectedTarget({ kind: 'media', id: track.id })}
            onDelete={() => removeMediaTrack(track.id)}
            onMoveStart={(event) => {
              const point = stagePoint(event);
              setSelectedTarget({ kind: 'media', id: track.id });
              setDrag({ mode: 'move', kind: 'media', id: track.id, dx: point.x - track.x, dy: point.y - track.y });
            }}
            onResizeStart={(event) => {
              event.stopPropagation();
              const point = stagePoint(event);
              setSelectedTarget({ kind: 'media', id: track.id });
              setDrag({ mode: 'resize', kind: 'media', id: track.id, startX: point.x, startY: point.y, startW: track.w, startH: track.h });
            }}
          />
        ))}
        {showGuides ? <div className="safe-frame" title="安全区参考线：最终视频仍是完整 16:9 画面，虚线内适合放重要字幕和主体。" /> : null}
        <SubtitleOverlay sentence={activeSentence} currentTime={currentTime} settings={project.subtitles} />
        {activeLayers.map((layer) => (
          <CanonicalLayer
            key={layer.id}
            layer={layer}
            currentTime={currentTime}
            selected={!readOnly && selectedTarget?.kind === 'layer' && selectedTarget.id === layer.id}
            readOnly={readOnly}
            onSelect={() => setSelectedTarget({ kind: 'layer', id: layer.id })}
            onDelete={() => deleteLayer(layer.id)}
            onMoveStart={(event) => {
              const point = stagePoint(event);
              setSelectedTarget({ kind: 'layer', id: layer.id });
              setDrag({ mode: 'move', kind: 'layer', id: layer.id, dx: point.x - layer.x, dy: point.y - layer.y });
            }}
            onResizeStart={(event) => {
              event.stopPropagation();
              const point = stagePoint(event);
              setSelectedTarget({ kind: 'layer', id: layer.id });
              setDrag({ mode: 'resize', kind: 'layer', id: layer.id, startX: point.x, startY: point.y, startW: layer.w, startH: layer.h });
            }}
          />
        ))}
        {activeComponents.map((component) => (
          <StageComponent
            key={component.id}
            component={component}
            currentTime={currentTime}
            selected={!readOnly && selectedTarget?.kind === 'component' && selectedTarget.id === component.id}
            readOnly={readOnly}
            definition={allComponentDefinitions.find((def) => def.slug === component.slug)}
            onSelect={() => setSelectedTarget({ kind: 'component', id: component.id })}
            onDelete={() => deleteComponent(component.id)}
            onMoveStart={(event) => {
              const point = stagePoint(event);
              setSelectedTarget({ kind: 'component', id: component.id });
              setDrag({ mode: 'move', kind: 'component', id: component.id, dx: point.x - component.x, dy: point.y - component.y });
            }}
            onResizeStart={(event) => {
              event.stopPropagation();
              const point = stagePoint(event);
              setSelectedTarget({ kind: 'component', id: component.id });
              setDrag({ mode: 'resize', kind: 'component', id: component.id, startX: point.x, startY: point.y, startW: component.w, startH: component.h });
            }}
          />
        ))}
      </>
    );
  }

  return (
    <div
      className="app-shell"
      style={{
        gridTemplateRows: `72px minmax(0, 1fr) ${timelineHeight}px`,
        '--timeline-height': `${timelineHeight}px`,
      } as CSSProperties}
    >
      {project.voice.src ? <audio ref={voiceAudioRef} src={project.voice.src} preload="auto" /> : null}
      <header className="topbar">
        <div>
          <p className="eyebrow">Koubo Motion Workbench</p>
          <h1>口播动效工作台</h1>
        </div>
        <div className="topbar-actions">
          <button type="button" className="icon-button" title="保存到本机缓存" onClick={() => localStorage.setItem(STORAGE_KEY, JSON.stringify(project))}>
            <Save size={18} />
          </button>
          <label className="icon-button" title="导入项目 JSON">
            <Upload size={18} />
            <input type="file" accept="application/json" hidden onChange={(event) => importProject(event.target.files?.[0] ?? null)} />
          </label>
          <button type="button" className="icon-button" title="导出工作台 JSON" onClick={exportWorkbenchJson}>
            <FileJson size={18} />
          </button>
          <button type="button" className="icon-button" title="导出 HyperFrames HTML" onClick={exportHyperframesComposition}>
            <FileText size={18} />
          </button>
          <button type="button" className="icon-button" title="导出 Remotion 兼容 JSON" onClick={exportJson}>
            <Boxes size={18} />
          </button>
          <button type="button" className="icon-button" title="导出 SHOTBOOK" onClick={exportBook}>
            <FileText size={18} />
          </button>
        </div>
      </header>

      <main className="workbench">
        <aside className="left-panel panel">
          <section className="panel-section left-workspace">
            <div className="left-tabs" role="tablist" aria-label="工作台左侧资源">
              {[
                { id: 'common', label: '常用', icon: <Plus size={15} />, count: commonLayerTemplates.length },
                { id: 'media', label: '素材', icon: <Layers size={15} />, count: project.media.sources.length },
                { id: 'sfx', label: 'SFX', icon: <Volume2 size={15} />, count: sfxAssets.length },
                { id: 'script', label: '脚本逐字', icon: <FileText size={15} /> },
                { id: 'library', label: '动效库', icon: <Boxes size={15} />, count: project.motionLibrary.length },
              ].map((tab) => (
                <button key={tab.id} type="button" role="tab" aria-selected={leftTab === tab.id} className={leftTab === tab.id ? 'left-tab active' : 'left-tab'} onClick={() => setLeftTab(tab.id as LeftTab)}>
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count ? <small>{tab.count}</small> : null}
                </button>
              ))}
            </div>

            {leftTab === 'common' ? (
              <div className="left-tab-panel" role="tabpanel">
                <p className="library-copy">这里只放会反复用、能稳定出片的原生图层组。添加后会自动停到片段中间，直接在画布或右侧细调。</p>
                <div className="component-list">
                  {pendingTemplate ? (
                    <div className="pending-card">
                      <strong>{pendingTemplate.title}</strong>
                      <code>{pendingTemplate.slug}</code>
                      <small>{pendingTemplate.summary}</small>
                      <div className="button-row">
                        <button type="button" className="wide-button" onClick={() => addLayerTemplate(pendingTemplate)}>确认添加</button>
                        <button type="button" className="wide-button" onClick={() => setPendingTemplate(null)}>取消</button>
                      </div>
                    </div>
                  ) : null}
                  {commonLayerTemplates.map((template) => (
                    <div
                      key={template.slug}
                      role="button"
                      tabIndex={0}
                      className="component-card native-card"
                      draggable
                      onClick={() => setPendingTemplate(template)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setPendingTemplate(template);
                        }
                      }}
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/x-koubo-layer-template', template.slug);
                        event.dataTransfer.effectAllowed = 'copy';
                      }}
                    >
                      <span className="component-priority">原</span>
                      <strong>{template.title}</strong>
                      <code>{template.category} · {template.slug}</code>
                      <small>{template.summary}</small>
                      <em>适合：{template.suitableFor.join(' / ')}</em>
                      <div className="component-card-actions">
                        <button
                          type="button"
                          className="mini-button primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            addLayerTemplate(template);
                          }}
                        >
                          <Plus size={13} />
                          添加
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {leftTab === 'script' ? (
              <div className="left-tab-panel script-panel" role="tabpanel">
                <textarea value={scriptDraft} onChange={(event) => setScriptDraft(event.target.value)} />
                <button type="button" className="wide-button" onClick={applyScript}>
                  <WandSparkles size={16} />
                  重分句并生成镜头
                </button>
                <div className="voice-status">
                  <span>{project.voice.timestampMode === 'imported' ? '已导入 Whisper 逐字 JSON' : '当前使用镜头时长估算逐字'}</span>
                  <strong>{project.script.reduce((sum, sentence) => sum + (sentence.chars?.length ?? 0), 0)} chars</strong>
                </div>
                <label className="file-button">
                  <Upload size={16} />
                  导入 Whisper 逐字 JSON
                  <input type="file" accept="application/json,.json" hidden onChange={(event) => importCharTimingFile(event.target.files?.[0] ?? null)} />
                </label>
                <div className="sentence-list">
                  {project.script.map((sentence, index) => (
                    <button key={sentence.id} type="button" className={activeShot?.sentenceIds.includes(sentence.id) ? 'sentence active' : 'sentence'} onClick={() => setTime(sentence.startSec ?? index * 5.5)}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {sentence.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {leftTab === 'library' ? (
              <div className="left-tab-panel" role="tabpanel">
                <label className="search-box">
                  <Search size={15} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 slug / 中文名" />
                </label>
                <div className="library-mode-tabs" aria-label="动效库范围">
                  <button type="button" className={motionLibraryMode === 'favorites' ? 'active' : ''} onClick={() => setMotionLibraryMode('favorites')}>收藏/原生</button>
                  <button type="button" className={motionLibraryMode === 'talkcraft' ? 'active' : ''} onClick={() => setMotionLibraryMode('talkcraft')}>Talkcraft</button>
                  <button type="button" className={motionLibraryMode === 'shotcraft' ? 'active' : ''} onClick={() => setMotionLibraryMode('shotcraft')}>Shotcraft</button>
                  <button type="button" className={motionLibraryMode === 'all' ? 'active' : ''} onClick={() => setMotionLibraryMode('all')}>全部</button>
                </div>
                <p className="library-copy">
                  {motionLibraryMode === 'favorites'
                    ? '这里是已原生化或收藏的动效。原生项可直接加入剪辑台，旧项建议先预览。'
                    : motionLibraryMode === 'shotcraft'
                        ? '从 video-shotcraft 导入的产品镜头语法，建议先看样片，再决定是否用于本页。'
                        : '这里保留旧组件资产和说明，后续可以按使用频率逐个原生化。'}
                </p>
                <div className="chips">
                  <button className={category === '全部' ? 'chip active' : 'chip'} type="button" onClick={() => setCategory('全部')}>全部</button>
                  {categories.map((item) => (
                    <button key={item} className={category === item ? 'chip active' : 'chip'} type="button" onClick={() => setCategory(item)}>{item}</button>
                  ))}
                </div>
                <div className="component-list">
                  {pendingDefinition ? (
                    <div className="pending-card">
                      <strong>{pendingDefinition.title}</strong>
                      <code>{pendingDefinition.slug}</code>
                      <small>将添加到当前播放头 {formatTime(currentTime)}，确认后自动跳到片段中间，方便直接调整。</small>
                      <div className="button-row">
                        <button type="button" className="wide-button" onClick={() => addComponent(pendingDefinition)}>确认添加</button>
                        <button type="button" className="wide-button" onClick={() => setPendingDefinition(null)}>取消</button>
                      </div>
                    </div>
                  ) : null}
                  {filteredLibraryItems.map((item) => {
                    const def = allComponentDefinitions.find((candidate) => candidate.slug === item.slug);
                    const nativeTemplate = commonLayerTemplates.find((template) => template.slug === item.slug);
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        className="component-card"
                        onClick={() => nativeTemplate ? setPendingTemplate(nativeTemplate) : def ? setPendingDefinition(def) : undefined}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            if (nativeTemplate) setPendingTemplate(nativeTemplate);
                            else if (def) setPendingDefinition(def);
                          }
                        }}
                      >
                        <span className={`component-priority status-${item.status}`}>{statusLabel(item.status)}</span>
                        <strong>{item.title}</strong>
                        <code>{item.source} · {item.slug}</code>
                        <small>{item.summary}</small>
                        <em>适合：{item.suitableFor.join(' / ')}</em>
                        <div className="component-card-actions">
                          <button
                            type="button"
                            className="mini-button"
                            disabled={!def && !nativeTemplate}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (def) {
                                setPreviewDemoTime(0);
                                setPreviewDefinition(def);
                              }
                            }}
                          >
                            <Eye size={13} />
                            预览
                          </button>
                          <button
                            type="button"
                            className="mini-button primary"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (nativeTemplate) addLayerTemplate(nativeTemplate);
                              else if (def) addComponent(def);
                            }}
                          >
                            <Plus size={13} />
                            {item.status === 'native' ? '添加' : '兼容添加'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {leftTab === 'sfx' ? (
              <div className="left-tab-panel" role="tabpanel">
                <label className="search-box">
                  <Search size={15} />
                  <input value={sfxQuery} onChange={(event) => setSfxQuery(event.target.value)} placeholder="搜索音效" />
                </label>
                <div className="sfx-list">
                  {filteredSfx.slice(0, 80).map((asset) => (
                    <button key={asset.id} type="button" className="sfx-row" onClick={() => void engineRef.current?.play({ assetId: asset.id, volume: 0.45 }, project.sfx.masterVolume)}>
                      <span>{asset.category}</span>
                      <strong>{asset.name}</strong>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {leftTab === 'media' ? (
              <div className="left-tab-panel media-panel scroll-panel" role="tabpanel">
                <label className="field">
                  <span>素材名称</span>
                  <input value={mediaDraft.name} onChange={(event) => setMediaDraft({ ...mediaDraft, name: event.target.value })} placeholder="主播口播 / 产品演示 / 录屏" />
                </label>
                <label className="field">
                  <span>类型</span>
                  <select value={mediaDraft.type} onChange={(event) => setMediaDraft({ ...mediaDraft, type: event.target.value as MediaSource['type'] })}>
                    <option value="hostVideo">主播口播视频</option>
                    <option value="demoVideo">演示视频</option>
                    <option value="screenRecording">录屏视频</option>
                    <option value="image">图片 / 截图</option>
                  </select>
                </label>
                <label className="field">
                  <span>素材路径 / URL</span>
                  <input value={mediaDraft.src} onChange={(event) => setMediaDraft({ ...mediaDraft, src: event.target.value })} placeholder="/media/host.mp4 或 https://..." />
                </label>
                <p className="hint-line">本地视频放到 public/media 后填写 /media/xxx.mp4。镜头按钮只加当前页；全片按钮适合主播视频贯穿始终。</p>
                <button type="button" className="wide-button" onClick={addMediaSource}>添加素材源</button>

                <div className="media-source-list">
                  {project.media.sources.map((source) => (
                    <div key={source.id} className="media-source-card">
                      <strong>{source.name}</strong>
                      <span>{mediaSourceLabel(source.type)}</span>
                      <code>{source.src}</code>
                      <div className="media-layout-actions">
                        <button type="button" onClick={() => addMediaTrack(source, 'full')}>全屏</button>
                        <button type="button" onClick={() => addMediaTrack(source, 'circlePip')}>圆窗</button>
                        <button type="button" onClick={() => addMediaTrack(source, 'splitLeft')}>左屏</button>
                        <button type="button" onClick={() => addMediaTrack(source, 'splitRight')}>右屏</button>
                        <button type="button" onClick={() => addFullLengthMediaTrack(source, 'full')}>全片全屏</button>
                        <button type="button" onClick={() => addFullLengthMediaTrack(source, 'circlePip')}>全片圆窗</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="media-track-list">
                  {project.media.tracks.map((track) => {
                    const source = project.media.sources.find((item) => item.id === track.sourceId);
                    return (
                      <div key={track.id} className="media-track-card">
                        <strong>{source?.name ?? track.sourceId}</strong>
                        <select value={track.layout} onChange={(event) => updateMediaTrack(track.id, { layout: event.target.value as MediaLayout, ...layoutPatch(event.target.value as MediaLayout) })}>
                          <option value="full">全屏</option>
                          <option value="circlePip">圆形小窗</option>
                          <option value="splitLeft">左分屏</option>
                          <option value="splitRight">右分屏</option>
                        </select>
                        <div className="field-grid">
                          <Field label="入点" value={track.startSec} type="number" step="0.1" onChange={(value) => updateMediaTrack(track.id, { startSec: Number(value) })} />
                          <Field label="时长" value={track.durationSec} type="number" step="0.1" onChange={(value) => updateMediaTrack(track.id, { durationSec: Number(value) })} />
                        </div>
                        <div className="media-layout-actions">
                          <button type="button" onClick={() => splitMediaTrackAtPlayhead(track, 'circlePip')}>从此切圆窗</button>
                          <button type="button" onClick={() => splitMediaTrackAtPlayhead(track, 'full')}>从此切全屏</button>
                        </div>
                        <button type="button" onClick={() => removeMediaTrack(track.id)}>删除片段</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {leftTab === 'voice' ? (
              <div className="left-tab-panel voice-panel scroll-panel" role="tabpanel">
                <label className="file-button">
                  <Upload size={16} />
                  导入 Whisper 逐字 JSON
                  <input type="file" accept="application/json,.json" hidden onChange={(event) => importCharTimingFile(event.target.files?.[0] ?? null)} />
                </label>
                <label className="field">
                  <span>或粘贴 JSON</span>
                  <textarea value={charJsonDraft} onChange={(event) => setCharJsonDraft(event.target.value)} placeholder='[{ "text": "今天...", "startSec": 0, "endSec": 2.6, "chars": [{ "ch": "今", "t": 0, "e": 0.18 }] }]' />
                </label>
                <div className="button-row">
                  <button type="button" className="wide-button" onClick={importCharTiming}>导入逐字</button>
                  <button type="button" className="wide-button" onClick={estimateCharTiming}>无 JSON 时估算</button>
                </div>
                <div className="voice-status">
                  <span>{project.voice.timestampMode === 'imported' ? '已导入 Whisper 逐字 JSON' : '当前使用镜头时长估算逐字'}</span>
                  <strong>{project.script.reduce((sum, sentence) => sum + (sentence.chars?.length ?? 0), 0)} chars</strong>
                </div>
                <div className="char-transcript-list">
                  {project.script.map((sentence, index) => (
                    <button key={sentence.id} type="button" className={activeSentence?.id === sentence.id ? 'char-sentence active' : 'char-sentence'} onClick={() => setTime(sentence.startSec ?? index * sentenceDuration)}>
                      <span>{formatTime(sentence.startSec ?? 0)} - {formatTime(sentence.endSec ?? (sentence.startSec ?? 0) + sentenceDuration)}</span>
                      <strong>{sentence.text}</strong>
                      <em>{(sentence.chars ?? []).slice(0, 18).map((char) => `${char.ch}${char.ch.trim() ? `:${char.t.toFixed(2)}` : ''}`).join(' ')}</em>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {leftTab === 'subtitles' ? (
              <div className="left-tab-panel scroll-panel" role="tabpanel">
                <label className="toggle-row">
                  <input type="checkbox" checked={project.subtitles.enabled} onChange={(event) => updateSubtitles({ enabled: event.target.checked })} />
                  <span>显示舞台字幕</span>
                </label>
                <label className="field">
                  <span>位置</span>
                  <select value={project.subtitles.position} onChange={(event) => updateSubtitles({ position: event.target.value as SubtitleSettings['position'] })}>
                    <option value="bottom">底部</option>
                    <option value="middle">中部</option>
                    <option value="top">顶部</option>
                  </select>
                </label>
                <label className="field">
                  <span>背景形状</span>
                  <select value={project.subtitles.shape} onChange={(event) => updateSubtitles({ shape: event.target.value as SubtitleSettings['shape'] })}>
                    <option value="edgeFade">两侧渐隐</option>
                    <option value="solid">整体半透明</option>
                  </select>
                </label>
                <Field label="字号" value={project.subtitles.fontSize} type="number" onChange={(value) => updateSubtitles({ fontSize: Number(value) })} />
                <label className="field">
                  <span>普通字色</span>
                  <input type="color" value={project.subtitles.textColor} onChange={(event) => updateSubtitles({ textColor: event.target.value })} />
                </label>
                <label className="field">
                  <span>关键词色</span>
                  <input type="color" value={project.subtitles.keywordColor} onChange={(event) => updateSubtitles({ keywordColor: event.target.value })} />
                </label>
                <label className="field">
                  <span>字幕背景</span>
                  <input value={project.subtitles.background} onChange={(event) => updateSubtitles({ background: event.target.value })} />
                </label>
                <label className="field">
                  <span>关键词</span>
                  <textarea value={project.subtitles.keywords} onChange={(event) => updateSubtitles({ keywords: event.target.value })} />
                </label>
                <label className="toggle-row">
                  <input type="checkbox" checked={showGuides} onChange={(event) => setShowGuides(event.target.checked)} />
                  <span>显示安全区参考线</span>
                </label>
              </div>
            ) : null}
          </section>
        </aside>

        <section className="stage-column">
          <div className="stage-toolbar panel">
            <div className="transport">
              <button type="button" className="icon-button primary" title={isPlaying ? '暂停' : '播放'} onClick={togglePlayback}>
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button type="button" className={previewRange?.kind === 'shot' && isPlaying ? 'wide-button active' : 'wide-button'} title="播放当前镜头的全部动效、SFX 和配音" onClick={previewCurrentShot}>
                {previewRange?.kind === 'shot' && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                当前镜头
              </button>
              <button type="button" className="icon-button" title="上一镜" onClick={() => setTime(Math.max(0, (activeShot?.startSec ?? 0) - 0.1))}>
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="icon-button" title="下一镜" onClick={() => {
                const next = project.shots.find((shot) => shot.startSec > currentTime + 0.05);
                setTime(next?.startSec ?? totalDuration);
              }}>
                <ChevronRight size={18} />
              </button>
              <button type="button" className="icon-button" title={project.sfx.enabled ? '关闭 SFX' : '打开 SFX'} onClick={() => updateProject((draft) => ({ ...draft, sfx: { ...draft.sfx, enabled: !draft.sfx.enabled } }))}>
                {project.sfx.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <span className="timecode">{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
              <span className="stage-size-pill">1920x1080 · {Math.round(stageScale * 100)}%</span>
              <button type="button" className="wide-button" onClick={() => setShowStagePreview(true)}>
                <Maximize2 size={14} />
                出片检查
              </button>
            </div>
            <div className="shot-readout">
              <span>{activeShot?.id}</span>
              <strong>{activeShot?.title}</strong>
            </div>
          </div>

          <div ref={stageWrapRef} className="stage-wrap panel">
            <div
              className="stage-viewport"
              style={{
                '--stage-scale': stageScale,
                width: `${STAGE_W * stageScale}px`,
                height: `${STAGE_H * stageScale}px`,
              } as CSSProperties}
            >
              <div
                ref={stageRef}
                className="stage"
                onPointerMove={onStagePointerMove}
                onPointerUp={() => setDrag(null)}
                onPointerLeave={() => setDrag(null)}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={dropComponent}
              >
                {renderStageContent()}
              </div>
            </div>
          </div>
        </section>

        <aside className="right-panel panel">
          <section className="panel-section">
            <div className="section-title">
              <MousePointer2 size={16} />
              <span>属性</span>
            </div>
            <div className="inspector">
              <div className="selected-title">
                <strong>全片视觉</strong>
                <code>global</code>
              </div>
              <label className="toggle-row">
                <input type="checkbox" checked={project.design.useGlobalBackground} onChange={(event) => updateDesign({ useGlobalBackground: event.target.checked })} />
                <span>所有镜头使用统一背景</span>
              </label>
              <label className="field">
                <span>统一背景类型</span>
                <select value={project.design.backgroundStyle.type} onChange={(event) => updateGlobalBackground({ type: event.target.value as ShotBackgroundStyle['type'] })}>
                  <option value="lightGrid">浅色网格</option>
                  <option value="darkGrid">深色网格</option>
                  <option value="solid">纯色</option>
                  <option value="image">图片</option>
                </select>
              </label>
              <label className="field">
                <span>统一背景色</span>
                <input type="color" value={project.design.backgroundStyle.color} onChange={(event) => updateGlobalBackground({ color: event.target.value })} />
              </label>
              <label className="field">
                <span>统一背景图 URL</span>
                <input value={project.design.backgroundStyle.imageUrl} onChange={(event) => updateGlobalBackground({ imageUrl: event.target.value })} placeholder="/media/bg.png 或 https://..." />
              </label>
              <div className="mini-title">全片组件主题</div>
              <label className="field">
                <span>默认字体</span>
                <select value={project.design.theme.fontFamily} onChange={(event) => updateDesignTheme({ fontFamily: event.target.value })}>
                  {fontFamilyOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <div className="field-grid">
                <label className="field">
                  <span>主强调色</span>
                  <input type="color" value={project.design.theme.accent} onChange={(event) => {
                    updateDesignTheme({ accent: event.target.value });
                    updateComponentTheme({ accent: event.target.value });
                  }} />
                </label>
                <label className="field">
                  <span>正文色</span>
                  <input type="color" value={project.design.theme.textColor} onChange={(event) => updateDesignTheme({ textColor: event.target.value })} />
                </label>
                <label className="field">
                  <span>线条色</span>
                  <input type="color" value={project.design.theme.lineColor} onChange={(event) => {
                    updateDesignTheme({ lineColor: event.target.value });
                    updateComponentTheme({ lineColor: event.target.value });
                  }} />
                </label>
                <label className="field">
                  <span>关键词色</span>
                  <input type="color" value={project.design.componentTheme.keywordColor} onChange={(event) => updateComponentTheme({ keywordColor: event.target.value })} />
                </label>
                <label className="field">
                  <span>横线颜色</span>
                  <input type="color" value={project.design.componentTheme.lineColor} onChange={(event) => updateComponentTheme({ lineColor: event.target.value })} />
                </label>
                <label className="field">
                  <span>上行文字色</span>
                  <input type="color" value={project.design.componentTheme.titleColor} onChange={(event) => updateComponentTheme({ titleColor: event.target.value })} />
                </label>
                <label className="field">
                  <span>下行文字色</span>
                  <input type="color" value={project.design.componentTheme.bodyColor} onChange={(event) => updateComponentTheme({ bodyColor: event.target.value, textColor: event.target.value })} />
                </label>
                <label className="field">
                  <span>列表文字色</span>
                  <input type="color" value={project.design.componentTheme.itemTextColor} onChange={(event) => updateComponentTheme({ itemTextColor: event.target.value })} />
                </label>
              </div>
              <BackgroundField label="原生图层默认背景" value={project.design.theme.surfaceColor} onChange={(value) => updateDesignTheme({ surfaceColor: value })} />
              <label className="toggle-row">
                <input type="checkbox" checked={project.design.theme.transparentSurface} onChange={(event) => updateDesignTheme({ transparentSurface: event.target.checked })} />
                <span>新加常用组件默认透明背景</span>
              </label>
              <BackgroundField label="组件背景" value={project.design.componentTheme.componentBackground} onChange={(value) => updateComponentTheme({ componentBackground: value })} />
              <BackgroundField label="列表条目背景" value={project.design.componentTheme.itemBackground} onChange={(value) => updateComponentTheme({ itemBackground: value })} />
              <button type="button" className="wide-button" onClick={applyComponentThemeToAll}>应用主题到全部组件</button>
              <div className="mini-title">全片角标</div>
              <label className="toggle-row">
                <input type="checkbox" checked={project.design.cornerBug.enabled} onChange={(event) => updateCornerBug({ enabled: event.target.checked })} />
                <span>显示统一角标</span>
              </label>
              <div className="field-grid">
                <label className="field">
                  <span>位置</span>
                  <select value={project.design.cornerBug.position} onChange={(event) => updateCornerBug({ position: event.target.value as CornerBugSettings['position'] })}>
                    <option value="topLeft">左上</option>
                    <option value="topRight">右上</option>
                  </select>
                </label>
                <Field label="字号" value={project.design.cornerBug.fontSize} type="number" onChange={(value) => updateCornerBug({ fontSize: Number(value) })} />
                <Field label="X 边距" value={project.design.cornerBug.x} type="number" onChange={(value) => updateCornerBug({ x: Number(value) })} />
                <Field label="Y 边距" value={project.design.cornerBug.y} type="number" onChange={(value) => updateCornerBug({ y: Number(value) })} />
              </div>
              <label className="field">
                <span>角标主标题</span>
                <input value={project.design.cornerBug.title} onChange={(event) => updateCornerBug({ title: event.target.value })} />
              </label>
              <label className="field">
                <span>角标副标题</span>
                <input value={project.design.cornerBug.subtitle} onChange={(event) => updateCornerBug({ subtitle: event.target.value })} />
              </label>
              <div className="field-grid">
                <label className="field">
                  <span>文字色</span>
                  <input type="color" value={project.design.cornerBug.textColor} onChange={(event) => updateCornerBug({ textColor: event.target.value })} />
                </label>
                <label className="field">
                  <span>强调色</span>
                  <input type="color" value={project.design.cornerBug.accent} onChange={(event) => updateCornerBug({ accent: event.target.value })} />
                </label>
              </div>
              <label className="field">
                <span>角标背景</span>
                <input value={project.design.cornerBug.background} onChange={(event) => updateCornerBug({ background: event.target.value })} placeholder="transparent 或 rgba(...)" />
              </label>
              <label className="field">
                <span>角标透明度</span>
                <input type="range" min="0" max="1" step="0.01" value={project.design.cornerBug.opacity} onChange={(event) => updateCornerBug({ opacity: Number(event.target.value) })} />
              </label>
            </div>
            <div className="inspector">
              <div className="selected-title">
                <strong>{project.design.useGlobalBackground ? '当前镜头背景覆盖' : '当前镜头背景'}</strong>
                <code>{activeShot?.id ?? 'shot'}</code>
              </div>
              <label className="field">
                <span>背景类型</span>
                <select value={activeShot?.backgroundStyle.type ?? 'lightGrid'} onChange={(event) => updateActiveShotBackground({ type: event.target.value as ShotBackgroundStyle['type'] })}>
                  <option value="lightGrid">浅色网格</option>
                  <option value="darkGrid">深色网格</option>
                  <option value="solid">纯色</option>
                  <option value="image">图片</option>
                </select>
              </label>
              <label className="field">
                <span>背景色</span>
                <input type="color" value={activeShot?.backgroundStyle.color ?? '#f7f9fb'} onChange={(event) => updateActiveShotBackground({ color: event.target.value })} />
              </label>
              <label className="field">
                <span>背景图 URL</span>
                <input value={activeShot?.backgroundStyle.imageUrl ?? ''} onChange={(event) => updateActiveShotBackground({ imageUrl: event.target.value })} placeholder="/media/bg.png 或 https://..." />
              </label>
              <div className="button-row">
                <button type="button" className="wide-button" onClick={setGlobalBackgroundFromActiveShot}>设为全片背景</button>
                <button type="button" className="wide-button" onClick={applyActiveShotBackgroundToAll}>复制到全部镜头</button>
              </div>
            </div>
            {selectedLayer ? (
              <div className="inspector">
                <div className="selected-title">
                  <strong>{selectedLayer.name}</strong>
                  <code>原生图层组 · {selectedLayer.motion}</code>
                </div>
                <div className="field-grid">
                  <Field label="入点 s" value={selectedLayer.startSec} type="number" step="0.1" onChange={(value) => updateLayer(selectedLayer.id, { startSec: Number(value) })} />
                  <Field label="时长 s" value={selectedLayer.durationSec} type="number" step="0.1" onChange={(value) => updateLayer(selectedLayer.id, { durationSec: Number(value) })} />
                  <Field label="X" value={Math.round(selectedLayer.x)} type="number" onChange={(value) => updateLayer(selectedLayer.id, { x: Number(value) })} />
                  <Field label="Y" value={Math.round(selectedLayer.y)} type="number" onChange={(value) => updateLayer(selectedLayer.id, { y: Number(value) })} />
                  <Field label="W" value={Math.round(selectedLayer.w)} type="number" onChange={(value) => updateLayer(selectedLayer.id, { w: Number(value) })} />
                  <Field label="H" value={Math.round(selectedLayer.h)} type="number" onChange={(value) => updateLayer(selectedLayer.id, { h: Number(value) })} />
                  <Field label="层级" value={selectedLayer.z} type="number" onChange={(value) => updateLayer(selectedLayer.id, { z: Number(value) })} />
                </div>
                <label className="field">
                  <span>动效</span>
                  <select value={selectedLayer.motion} onChange={(event) => updateLayer(selectedLayer.id, { motion: event.target.value as Layer['motion'] })}>
                    <option value="none">无</option>
                    <option value="fade-up">淡入上移</option>
                    <option value="pop">弹出</option>
                    <option value="line-reveal">横线揭示</option>
                    <option value="list-stagger">列表逐项</option>
                    <option value="roadmap-travel">线路推进</option>
                    <option value="media-zoom">素材推近</option>
                    <option value="strike">划掉</option>
                  </select>
                </label>
                <BackgroundField label="组背景" value={selectedLayer.style.background ?? 'transparent'} onChange={(value) => updateLayerStyle(selectedLayer.id, { background: value })} />
                <div className="field-grid">
                  <label className="field">
                    <span>文字色</span>
                    <input type="color" value={selectedLayer.style.color ?? '#111827'} onChange={(event) => updateLayerStyle(selectedLayer.id, { color: event.target.value })} />
                  </label>
                  <label className="field">
                    <span>线条色</span>
                    <input type="color" value={selectedLayer.style.lineColor ?? project.design.theme.lineColor} onChange={(event) => updateLayerStyle(selectedLayer.id, { lineColor: event.target.value })} />
                  </label>
                  <Field label="圆角" value={selectedLayer.style.radius ?? 8} type="number" onChange={(value) => updateLayerStyle(selectedLayer.id, { radius: Number(value) })} />
                  <Field label="内边距" value={selectedLayer.style.padding ?? 0} type="number" onChange={(value) => updateLayerStyle(selectedLayer.id, { padding: Number(value) })} />
                </div>
                <div className="mini-title">子图层</div>
                <div className="layer-child-list">
                  {(selectedLayer.children ?? []).map((child) => (
                    <div key={child.id} className="layer-child-card">
                      <strong>{child.name}</strong>
                      <code>{child.kind}</code>
                      {child.kind === 'text' ? (
                        child.richText?.length ? (
                          <label className="field">
                            <span>富文本 JSON</span>
                            <textarea
                              value={formatRichText(child.richText)}
                              onChange={(event) => {
                                const next = parseRichText(event.target.value);
                                if (next) updateChildLayer(selectedLayer.id, child.id, { richText: next });
                              }}
                            />
                          </label>
                        ) : (
                          <label className="field">
                            <span>文字</span>
                            <textarea value={child.text ?? ''} onChange={(event) => updateChildLayer(selectedLayer.id, child.id, { text: event.target.value })} />
                          </label>
                        )
                      ) : null}
                      {child.kind === 'image' || child.kind === 'video' ? (
                        <label className="field">
                          <span>素材 URL</span>
                          <input value={child.src ?? ''} onChange={(event) => updateChildLayer(selectedLayer.id, child.id, { src: event.target.value, kind: inferLayerMediaKind(event.target.value, child.kind) })} />
                        </label>
                      ) : null}
                      <div className="field-grid">
                        <Field label="X" value={Math.round(child.x)} type="number" onChange={(value) => updateChildLayer(selectedLayer.id, child.id, { x: Number(value) })} />
                        <Field label="Y" value={Math.round(child.y)} type="number" onChange={(value) => updateChildLayer(selectedLayer.id, child.id, { y: Number(value) })} />
                        <Field label="W" value={Math.round(child.w)} type="number" onChange={(value) => updateChildLayer(selectedLayer.id, child.id, { w: Number(value) })} />
                        <Field label="H" value={Math.round(child.h)} type="number" onChange={(value) => updateChildLayer(selectedLayer.id, child.id, { h: Number(value) })} />
                        <Field label="字号" value={child.style.fontSize ?? 40} type="number" onChange={(value) => updateChildLayerStyle(selectedLayer.id, child.id, { fontSize: Number(value) })} />
                        <Field label="字重" value={child.style.fontWeight ?? 800} type="number" onChange={(value) => updateChildLayerStyle(selectedLayer.id, child.id, { fontWeight: Number(value) })} />
                      </div>
                      <label className="field">
                        <span>颜色</span>
                        <input type="color" value={child.style.color ?? '#111827'} onChange={(event) => updateChildLayerStyle(selectedLayer.id, child.id, { color: event.target.value })} />
                      </label>
                      <BackgroundField label="背景" value={child.style.background ?? 'transparent'} onChange={(value) => updateChildLayerStyle(selectedLayer.id, child.id, { background: value })} />
                    </div>
                  ))}
                </div>
                <div className="button-row">
                  <button type="button" className={isPlaying && previewRange?.kind === 'layer' && previewRange.id === selectedLayer.id ? 'wide-button active' : 'wide-button'} onClick={previewSelected}>
                    {isPlaying && previewRange?.kind === 'layer' && previewRange.id === selectedLayer.id ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying && previewRange?.kind === 'layer' && previewRange.id === selectedLayer.id ? '暂停' : '预览'}
                  </button>
                  <button type="button" className="wide-button" onClick={() => bringLayer('front')}>
                    <Layers size={16} />
                    置顶
                  </button>
                  <button type="button" className="wide-button" onClick={() => bringLayer('back')}>
                    <Layers size={16} />
                    置底
                  </button>
                  <button type="button" className="wide-button" disabled={!selectedLayer.templateSlug} onClick={resetSelectedLayerToDefault}>
                    <RotateCcw size={16} />
                    默认
                  </button>
                  <button type="button" className="wide-button danger" onClick={() => deleteLayer(selectedLayer.id)}>
                    <Trash2 size={16} />
                    删除
                  </button>
                </div>
                <label className="toggle-row">
                  <input type="checkbox" checked={selectedLayer.sfxEnabled ?? false} onChange={(event) => updateLayer(selectedLayer.id, { sfxEnabled: event.target.checked })} />
                  <span>启用图层组 SFX cues</span>
                </label>
                <div className="cue-list">
                  {(selectedLayer.sfxCues ?? []).map((cue, index) => (
                    <div key={cue.id} className="cue-row">
                      <span className="cue-index">cue {index + 1}</span>
                      <Field label="秒" value={cue.t} type="number" step="0.01" onChange={(value) => updateLayerCue(cue.id, { t: Number(value) })} />
                      <Field label="音量" value={cue.volume} type="number" step="0.01" onChange={(value) => updateLayerCue(cue.id, { volume: Number(value) })} />
                      <select value={cue.assetId} onChange={(event) => updateLayerCue(cue.id, { assetId: event.target.value })}>
                        {sfxAssets.map((asset) => (
                          <option key={asset.id} value={asset.id}>{asset.id}</option>
                        ))}
                      </select>
                      <button type="button" className={playingCueId === cue.id ? 'icon-button active' : 'icon-button'} title="试听 cue" onClick={() => previewCue(cue)}>
                        {playingCueId === cue.id ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedMediaTrack ? (
              <div className="inspector">
                <div className="selected-title">
                  <strong>{selectedMediaSource?.name ?? selectedMediaTrack.sourceId}</strong>
                  <code>素材轨道 · {mediaLayoutLabel(selectedMediaTrack.layout)}</code>
                </div>
                <label className="field">
                  <span>素材源</span>
                  <select value={selectedMediaTrack.sourceId} onChange={(event) => updateMediaTrack(selectedMediaTrack.id, { sourceId: event.target.value })}>
                    {project.media.sources.map((source) => (
                      <option key={source.id} value={source.id}>{source.name}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>显示方式</span>
                  <select value={selectedMediaTrack.layout} onChange={(event) => updateMediaTrack(selectedMediaTrack.id, { layout: event.target.value as MediaLayout, ...layoutPatch(event.target.value as MediaLayout) })}>
                    <option value="full">全屏</option>
                    <option value="circlePip">圆形小窗</option>
                    <option value="splitLeft">左分屏</option>
                    <option value="splitRight">右分屏</option>
                  </select>
                </label>
                <label className="field">
                  <span>形状</span>
                  <select value={mediaShapeValue(selectedMediaTrack)} onChange={(event) => updateMediaTrack(selectedMediaTrack.id, mediaShapePatch(event.target.value, selectedMediaTrack))}>
                    <option value="square">直角矩形</option>
                    <option value="rounded">圆角矩形</option>
                    <option value="circle">圆形</option>
                    <option value="pill">胶囊圆角</option>
                  </select>
                </label>
                <div className="field-grid">
                  <Field label="入点 s" value={selectedMediaTrack.startSec} type="number" step="0.1" onChange={(value) => updateMediaTrack(selectedMediaTrack.id, { startSec: Number(value) })} />
                  <Field label="时长 s" value={selectedMediaTrack.durationSec} type="number" step="0.1" onChange={(value) => updateMediaTrack(selectedMediaTrack.id, { durationSec: Number(value) })} />
                  <Field label="X" value={Math.round(selectedMediaTrack.x)} type="number" onChange={(value) => updateMediaTrack(selectedMediaTrack.id, { x: Number(value) })} />
                  <Field label="Y" value={Math.round(selectedMediaTrack.y)} type="number" onChange={(value) => updateMediaTrack(selectedMediaTrack.id, { y: Number(value) })} />
                  <Field label="W" value={Math.round(selectedMediaTrack.w)} type="number" onChange={(value) => updateMediaTrack(selectedMediaTrack.id, { w: Number(value) })} />
                  <Field label="H" value={Math.round(selectedMediaTrack.h)} type="number" onChange={(value) => updateMediaTrack(selectedMediaTrack.id, { h: Number(value) })} />
                  <Field label="圆角" value={Math.round(selectedMediaTrack.radius)} type="number" onChange={(value) => updateMediaTrack(selectedMediaTrack.id, { radius: Number(value) })} />
                  <Field label="层级" value={selectedMediaTrack.z} type="number" onChange={(value) => updateMediaTrack(selectedMediaTrack.id, { z: Number(value) })} />
                  <Field label="过渡 s" value={selectedMediaTrack.transitionSec ?? 0} type="number" step="0.05" onChange={(value) => updateMediaTrack(selectedMediaTrack.id, { transitionSec: Number(value) })} />
                </div>
                <label className="field">
                  <span>透明度</span>
                  <input type="range" min="0" max="1" step="0.01" value={selectedMediaTrack.opacity} onChange={(event) => updateMediaTrack(selectedMediaTrack.id, { opacity: Number(event.target.value) })} />
                </label>
                <div className="button-row">
                  <button type="button" className={isPlaying && previewRange?.kind === 'media' && previewRange.id === selectedMediaTrack.id ? 'wide-button active' : 'wide-button'} onClick={previewSelected}>
                    {isPlaying && previewRange?.kind === 'media' && previewRange.id === selectedMediaTrack.id ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying && previewRange?.kind === 'media' && previewRange.id === selectedMediaTrack.id ? '暂停' : '预览片段'}
                  </button>
                  <button type="button" className="wide-button" onClick={() => splitMediaTrackAtPlayhead(selectedMediaTrack, 'circlePip')}>从此切圆窗</button>
                  <button type="button" className="wide-button" onClick={() => splitMediaTrackAtPlayhead(selectedMediaTrack, 'full')}>从此切全屏</button>
                  <button type="button" className="wide-button" onClick={() => bringLayer('front')}>
                    <Layers size={16} />
                    置顶
                  </button>
                  <button type="button" className="wide-button" onClick={() => bringLayer('back')}>
                    <Layers size={16} />
                    置底
                  </button>
                  <button type="button" className="wide-button danger" onClick={() => removeMediaTrack(selectedMediaTrack.id)}>
                    <Trash2 size={16} />
                    删除
                  </button>
                </div>
              </div>
            ) : selectedComponent ? (
              <div className="inspector">
                <div className="selected-title">
                  <strong>{selectedDefinition?.title ?? selectedComponent.slug}</strong>
                  <code>{selectedComponent.slug}</code>
                </div>
                {selectedDefinition ? (
                  <div className="ai-guidance-box">
                    <strong>AI 编排说明</strong>
                    <span>{getComponentGuidance(selectedDefinition).aiUse}</span>
                    <small>适合句式：{getComponentGuidance(selectedDefinition).sentenceSignals.join(' / ')}</small>
                  </div>
                ) : null}
                <div className="field-grid">
                  <Field label="入点 s" value={selectedComponent.startSec} type="number" step="0.1" onChange={(value) => updateComponent(selectedComponent.id, { startSec: Number(value) })} />
                  <Field label="时长 s" value={selectedComponent.durationSec} type="number" step="0.1" onChange={(value) => updateComponent(selectedComponent.id, { durationSec: Number(value) })} />
                  <Field label="X" value={Math.round(selectedComponent.x)} type="number" onChange={(value) => updateComponent(selectedComponent.id, { x: Number(value) })} />
                  <Field label="Y" value={Math.round(selectedComponent.y)} type="number" onChange={(value) => updateComponent(selectedComponent.id, { y: Number(value) })} />
                  <Field label="W" value={Math.round(selectedComponent.w)} type="number" onChange={(value) => updateComponent(selectedComponent.id, { w: Number(value) })} />
                  <Field label="H" value={Math.round(selectedComponent.h)} type="number" onChange={(value) => updateComponent(selectedComponent.id, { h: Number(value) })} />
                </div>
                <label className="field">
                  <span>标题</span>
                  <input value={String(selectedComponent.props.title ?? '')} onChange={(event) => updateSelectedProps('title', event.target.value)} />
                </label>
                <label className="field">
                  <span>内容</span>
                  <textarea value={String(selectedComponent.props.text ?? '')} onChange={(event) => updateSelectedProps('text', event.target.value)} />
                </label>
                <label className="field">
                  <span>强调色</span>
                  <input type="color" value={String(selectedComponent.props.accent ?? '#2364aa')} onChange={(event) => updateSelectedProps('accent', event.target.value)} />
                </label>
                <BackgroundField label="背景色 / CSS 背景" value={String(selectedComponent.props.background ?? '')} onChange={(next) => updateSelectedProps('background', next)} />
                <label className="field">
                  <span>关键词</span>
                  <input value={String(selectedComponent.props.keyword ?? '')} onChange={(event) => updateSelectedProps('keyword', event.target.value)} />
                </label>
                <label className="field">
                  <span>关键词色</span>
                  <input type="color" value={String(selectedComponent.props.keywordColor ?? selectedComponent.props.accent ?? '#d9480f')} onChange={(event) => updateSelectedProps('keywordColor', event.target.value)} />
                </label>
                <label className="field">
                  <span>截图 / 素材 URL</span>
                  <input value={String(selectedComponent.props.assetUrl ?? '')} onChange={(event) => updateSelectedProps('assetUrl', event.target.value)} placeholder="/assets/screen.png 或 https://..." />
                </label>
                {renderDynamicProps()}
                <div className="button-row">
                  <button type="button" className={isPlaying && previewRange?.kind === 'component' && previewRange.id === selectedComponent.id ? 'wide-button active' : 'wide-button'} onClick={previewSelected}>
                    {isPlaying && previewRange?.kind === 'component' && previewRange.id === selectedComponent.id ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying && previewRange?.kind === 'component' && previewRange.id === selectedComponent.id ? '暂停' : '预览'}
                  </button>
                  <button type="button" className="wide-button" onClick={resetSelectedComponentToDefault} disabled={!selectedDefinition}>
                    <RotateCcw size={16} />
                    恢复默认
                  </button>
                  <button type="button" className="wide-button" onClick={applyComponentThemeToSelected}>
                    套用主题
                  </button>
                  <button type="button" className="wide-button" onClick={() => bringLayer('front')}>
                    <Layers size={16} />
                    置顶
                  </button>
                  <button type="button" className="wide-button" onClick={() => bringLayer('back')}>
                    <Layers size={16} />
                    置底
                  </button>
                  <button type="button" className="wide-button danger" onClick={() => deleteComponent(selectedComponent.id)}>
                    <Trash2 size={16} />
                    删除
                  </button>
                </div>
                <label className="toggle-row">
                  <input type="checkbox" checked={selectedComponent.sfxEnabled} onChange={(event) => updateComponent(selectedComponent.id, { sfxEnabled: event.target.checked })} />
                  <span>启用组件 SFX cues</span>
                </label>
                <label className="field">
                  <span>全局 SFX 音量</span>
                  <input type="range" min="0" max="1" step="0.01" value={project.sfx.masterVolume} onChange={(event) => updateProject((draft) => ({ ...draft, sfx: { ...draft.sfx, masterVolume: Number(event.target.value) } }))} />
                </label>
                <div className="cue-list">
                  {selectedComponent.sfxCues.map((cue, index) => (
                    <div key={cue.id} className="cue-row">
                      <span className="cue-index">cue {index + 1}</span>
                      <Field label="秒" value={cue.t} type="number" step="0.01" onChange={(value) => updateCue(cue.id, { t: Number(value) })} />
                      <Field label="音量" value={cue.volume} type="number" step="0.01" onChange={(value) => updateCue(cue.id, { volume: Number(value) })} />
                      <select value={cue.assetId} onChange={(event) => updateCue(cue.id, { assetId: event.target.value })}>
                        {sfxAssets.map((asset) => (
                          <option key={asset.id} value={asset.id}>{asset.id}</option>
                        ))}
                      </select>
                      <button type="button" className={playingCueId === cue.id ? 'icon-button active' : 'icon-button'} title="试听 cue" onClick={() => previewCue(cue)}>
                        {playingCueId === cue.id ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="empty-note">在舞台或时间轴上选择一个动效或素材片段。</p>
            )}
          </section>
        </aside>
      </main>

      <footer className="timeline-panel panel">
        <div
          className="timeline-resizer"
          role="separator"
          aria-orientation="horizontal"
          title="拖动调整时间轴高度"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setTimelineHeight(clamp(window.innerHeight - event.clientY, 160, 430));
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return;
            setTimelineHeight(clamp(window.innerHeight - event.clientY, 160, 430));
          }}
        />
        <div className="timeline-head">
          <div className="section-title">
            <Maximize2 size={16} />
            <span>脚本时间轴</span>
          </div>
          <div className="timeline-controls">
            <button type="button" className={timelineScope === 'full' ? 'wide-button active' : 'wide-button'} onClick={() => setTimelineScope('full')}>全片</button>
            <button type="button" className={timelineScope === 'shot' ? 'wide-button active' : 'wide-button'} onClick={() => setTimelineScope('shot')}>当前镜头</button>
            <span>{timelineScope === 'shot' && activeShot ? `${activeShot.id} · ${formatTime(timelineStart)}-${formatTime(timelineEnd)}` : '拖动播放头查看不同镜头'}</span>
          </div>
        </div>
        <div
          ref={timelineRef}
          className="timeline"
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            setTimelineDrag({ type: 'playhead' });
            onTimelinePointer(event);
          }}
          onPointerMove={(event) => {
            if (timelineDrag && event.buttons === 1) onTimelinePointer(event);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            setTimelineDrag(null);
          }}
          onPointerCancel={() => setTimelineDrag(null)}
        >
          <div className="timeline-ruler">
            {timelineShots.map((shot) => (
              <button
                key={shot.id}
                type="button"
                className="shot-block"
                style={timelineItemStyle(shot.startSec, shot.durationSec)}
                onClick={(event) => {
                  event.stopPropagation();
                  setTime(shot.startSec);
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <span>{shot.id}</span>
                <strong>{shot.title}</strong>
              </button>
            ))}
          </div>
          <div className="component-track" style={{ height: `${timelineTrackHeight}px` }}>
            {timelineMediaTracks.map((track, index) => {
              const source = project.media.sources.find((item) => item.id === track.sourceId);
              return (
                <button
                  key={track.id}
                  type="button"
                  className={selectedTarget?.kind === 'media' && selectedTarget.id === track.id ? 'media-clip active' : 'media-clip'}
                  style={{ ...timelineItemStyle(track.startSec, track.durationSec), top: `${8 + index * 28}px` }}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const time = timelineTimeFromPointer(event);
                    if (time === null) return;
                    setSelectedTarget({ kind: 'media', id: track.id });
                    setTime(track.startSec);
                    setTimelineDrag({ type: 'clip', kind: 'media', id: track.id, offset: time - track.startSec });
                  }}
                >
                  {source?.name ?? track.sourceId} · {mediaLayoutLabel(track.layout)}
                </button>
              );
            })}
            {timelineLayers.map((layer, index) => (
              <button
                key={layer.id}
                type="button"
                className={selectedTarget?.kind === 'layer' && selectedTarget.id === layer.id ? 'clip native-clip active' : 'clip native-clip'}
                style={{ ...timelineItemStyle(layer.startSec, layer.durationSec), top: `${14 + timelineMediaTracks.length * 28 + index * 42}px` }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  const time = timelineTimeFromPointer(event);
                  if (time === null) return;
                  setSelectedTarget({ kind: 'layer', id: layer.id });
                  setTimelineDrag({ type: 'clip', kind: 'layer', id: layer.id, offset: time - layer.startSec });
                }}
              >
                <span className="clip-label">图层组 · {layer.name}</span>
                {layer.sfxEnabled
                  ? (layer.sfxCues ?? []).map((cue, cueIndex) => (
                      <span
                        key={cue.id}
                        className="clip-cue-dot"
                        title={`cue ${cueIndex + 1}: ${cue.t.toFixed(2)}s · ${cue.note ?? cue.assetId}`}
                        style={{ left: `${clamp((cue.t / Math.max(0.01, layer.durationSec)) * 100, 0, 100)}%` }}
                      />
                    ))
                  : null}
              </button>
            ))}
            {timelineComponents.map((component, index) => (
              <button
                key={component.id}
                type="button"
                className={selectedTarget?.kind === 'component' && selectedTarget.id === component.id ? 'clip active' : 'clip'}
                style={{ ...timelineItemStyle(component.startSec, component.durationSec), top: `${14 + timelineMediaTracks.length * 28 + timelineLayers.length * 42 + index * 42}px` }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  const time = timelineTimeFromPointer(event);
                  if (time === null) return;
                  setSelectedTarget({ kind: 'component', id: component.id });
                  setTimelineDrag({ type: 'clip', kind: 'component', id: component.id, offset: time - component.startSec });
                }}
              >
                <span className="clip-label">{component.slug}</span>
                {component.sfxEnabled
                  ? component.sfxCues.map((cue, cueIndex) => (
                      <span
                        key={cue.id}
                        className="clip-cue-dot"
                        title={`cue ${cueIndex + 1}: ${cue.t.toFixed(2)}s · ${cue.note ?? cue.assetId}`}
                        style={{ left: `${clamp((cue.t / Math.max(0.01, component.durationSec)) * 100, 0, 100)}%` }}
                      />
                    ))
                  : null}
              </button>
            ))}
          </div>
          <div className="playhead" style={{ left: `${clamp(((currentTime - timelineStart) / timelineDuration) * 100, 0, 100)}%`, height: `${timelineTrackHeight + 48}px` }} />
        </div>
      </footer>
      {showStagePreview ? (
        <div className="preview-modal" role="dialog" aria-modal="true" aria-label="出片检查">
          <button type="button" className="preview-backdrop" aria-label="关闭出片检查" onClick={() => setShowStagePreview(false)} />
          <div className="preview-dialog">
            <div className="preview-head">
              <div>
                <strong>出片检查</strong>
                <span>按 1920x1080 坐标预览当前时间点，底部时间轴高度不会影响导出尺寸。</span>
              </div>
              <button type="button" className="wide-button" onClick={() => setShowStagePreview(false)}>关闭</button>
            </div>
            <div ref={previewShellRef} className="preview-stage-shell">
              <div
                className="stage-viewport stage-preview-viewport"
                style={{
                  '--stage-scale': previewScale,
                  width: `${STAGE_W * previewScale}px`,
                  height: `${STAGE_H * previewScale}px`,
                } as CSSProperties}
              >
                <div className="stage stage-preview">
                  {renderStageContent(true)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {previewDefinition && previewInstance ? (
        <div className="preview-modal" role="dialog" aria-modal="true" aria-label="组件预览">
          <button type="button" className="preview-backdrop" aria-label="关闭组件预览" onClick={closeComponentPreview} />
          <div className="preview-dialog component-preview-dialog">
            <div className="preview-head">
              <div>
                <strong>{previewDefinition.title}</strong>
                <span>{getComponentGuidance(previewDefinition).aiUse}</span>
              </div>
              <div className="button-row">
                <button type="button" className="wide-button" onClick={() => playDefinitionSfx(previewDefinition)}>
                  <Volume2 size={14} />
                  试听 SFX
                </button>
                <button
                  type="button"
                  className="wide-button"
                  onClick={() => {
                    addComponent(previewDefinition);
                    closeComponentPreview();
                  }}
                >
                  <Plus size={14} />
                  添加到当前时间
                </button>
                <button type="button" className="wide-button" onClick={closeComponentPreview}>关闭</button>
              </div>
            </div>
            <div className="component-preview-body">
              <div className="component-preview-stage">
                <div className="component-preview-canvas">
                  <StageComponent
                    component={previewInstance}
                    definition={previewDefinition}
                    currentTime={previewDemoTime}
                    selected={false}
                    readOnly
                    onSelect={() => undefined}
                    onDelete={() => undefined}
                    onMoveStart={() => undefined}
                    onResizeStart={() => undefined}
                  />
                </div>
              </div>
              <aside className="component-preview-notes">
                <strong>怎么用</strong>
                <p>{previewDefinition.summary}</p>
                <strong>AI 选它的信号</strong>
                <p>{getComponentGuidance(previewDefinition).sentenceSignals.join(' / ')}</p>
                <strong>常改字段</strong>
                <p>{getComponentGuidance(previewDefinition).editProps.join('、')}</p>
                <strong>素材需求</strong>
                <p>{materialNeedForDefinition(previewDefinition)}</p>
                {shotcraftPreviewUrl(previewDefinition) ? (
                  <>
                    <strong>Shotcraft 原样片</strong>
                    <video className="shotcraft-reference-video" src={shotcraftPreviewUrl(previewDefinition)} muted autoPlay loop playsInline />
                  </>
                ) : null}
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StageComponent({
  component,
  definition,
  currentTime,
  selected,
  readOnly = false,
  onSelect,
  onDelete,
  onMoveStart,
  onResizeStart,
}: {
  component: ComponentInstance;
  definition?: ComponentDefinition;
  currentTime: number;
  selected: boolean;
  readOnly?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveStart: (event: PointerEvent) => void;
  onResizeStart: (event: PointerEvent) => void;
}) {
  const local = clamp(currentTime - component.startSec, 0, component.durationSec);
  const progress = component.durationSec <= 0 ? 1 : local / component.durationSec;
  const enter = easeOut(clamp(local / Math.max(0.01, component.enter), 0, 1));
  const exitStart = Math.max(component.enter, component.durationSec - component.exit);
  const exit = local > exitStart ? easeIn(clamp((local - exitStart) / Math.max(0.01, component.exit), 0, 1)) : 0;
  const visible = Math.max(0, enter * (1 - exit));
  const accent = String(component.props.accent ?? '#2364aa');
  const background = String(component.props.background ?? '');
  const textColor = String(component.props.textColor ?? '#111827');
  const style = {
    left: `${(component.x / STAGE_W) * 100}%`,
    top: `${(component.y / STAGE_H) * 100}%`,
    width: `${(component.w / STAGE_W) * 100}%`,
    height: `${(component.h / STAGE_H) * 100}%`,
    zIndex: component.z,
    opacity: visible,
    '--accent': accent,
    '--component-text': textColor,
    ...(background ? { '--component-bg': background } : {}),
  } as CSSProperties;

  return (
    <div
      className={selected ? 'stage-component selected' : 'stage-component'}
      style={style}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (readOnly) return;
        onSelect();
        onMoveStart(event);
      }}
    >
      <MotionPreview component={component} definition={definition} progress={progress} enter={enter} local={local} visualScale={componentVisualScale(component, definition)} />
      {selected && !readOnly ? (
        <button
          type="button"
          className="delete-handle"
          title="删除组件"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 size={14} />
        </button>
      ) : null}
      {!readOnly ? (
        <button type="button" className="resize-handle" title="缩放" onPointerDown={onResizeStart}>
          <Maximize2 size={14} />
        </button>
      ) : null}
    </div>
  );
}

function MediaLayer({
  track,
  source,
  currentTime,
  selected,
  readOnly = false,
  onSelect,
  onDelete,
  onMoveStart,
  onResizeStart,
}: {
  track: MediaTrack;
  source?: MediaSource;
  currentTime: number;
  selected: boolean;
  readOnly?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveStart: (event: PointerEvent) => void;
  onResizeStart: (event: PointerEvent) => void;
}) {
  if (!source) return null;
  const isImage = source.type === 'image' || /\.(png|jpe?g|webp|gif|avif)$/i.test(source.src);
  const frame = mediaFrameAt(track, currentTime);
  const style = {
    left: `${(frame.x / STAGE_W) * 100}%`,
    top: `${(frame.y / STAGE_H) * 100}%`,
    width: `${(frame.w / STAGE_W) * 100}%`,
    height: `${(frame.h / STAGE_H) * 100}%`,
    zIndex: track.z,
    borderRadius: frame.radius ? `${(frame.radius / Math.max(frame.w, frame.h)) * 100}%` : 0,
    opacity: frame.opacity,
  } as CSSProperties;

  return (
    <div
      className={`media-layer ${track.layout}${selected ? ' selected' : ''}`}
      style={style}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (readOnly) return;
        onSelect();
        onMoveStart(event);
      }}
    >
      {isImage ? <img src={source.src} alt="" /> : <video key={`${source.id}-${Math.floor(currentTime)}`} src={source.src} muted autoPlay loop playsInline />}
      {selected && !readOnly ? (
        <button
          type="button"
          className="delete-handle"
          title="删除素材片段"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 size={14} />
        </button>
      ) : null}
      {!readOnly ? (
        <button type="button" className="resize-handle" title="缩放素材" onPointerDown={onResizeStart}>
          <Maximize2 size={14} />
        </button>
      ) : null}
    </div>
  );
}

function mediaFrameAt(track: MediaTrack, currentTime: number) {
  const to = {
    x: track.x,
    y: track.y,
    w: track.w,
    h: track.h,
    radius: track.radius,
    opacity: track.opacity,
  };
  if (!track.transitionFrom || !track.transitionSec || track.transitionSec <= 0) return to;
  const local = currentTime - track.startSec;
  const progress = easeInOut(clamp(local / track.transitionSec, 0, 1));
  return {
    x: lerp(track.transitionFrom.x, to.x, progress),
    y: lerp(track.transitionFrom.y, to.y, progress),
    w: lerp(track.transitionFrom.w, to.w, progress),
    h: lerp(track.transitionFrom.h, to.h, progress),
    radius: lerp(track.transitionFrom.radius, to.radius, progress),
    opacity: lerp(track.transitionFrom.opacity, to.opacity, progress),
  };
}

function MotionPreview({ component, definition, progress, enter, local, visualScale }: { component: ComponentInstance; definition?: ComponentDefinition; progress: number; enter: number; local: number; visualScale: number }) {
  const category = definition?.category ?? '字幕花字';
  const title = String(component.props.title ?? definition?.title ?? component.slug);
  const text = String(component.props.text ?? '');
  const value = String(component.props.value ?? '67%');
  const keyword = String(component.props.keyword ?? '');
  const keywordColor = String(component.props.keywordColor ?? component.props.accent ?? '#d9480f');
  const assetUrl = String(component.props.assetUrl ?? '');
  const fontSize = scaleFont(Number(component.props.fontSize ?? DEFAULT_COMPONENT_FONT_SIZE), visualScale);

  if (component.slug.startsWith('shotcraft-')) return <ShotcraftPreview component={component} progress={progress} local={local} fontSize={fontSize} visualScale={visualScale} />;
  if (component.slug === 'impact-open-title') return <ImpactOpenPreview component={component} title={title} text={text} progress={progress} enter={enter} keyword={keyword} keywordColor={keywordColor} fontSize={fontSize} visualScale={visualScale} />;
  if (component.slug === 'static-text-block') return <StaticTextPreview component={component} fontSize={fontSize} visualScale={visualScale} />;
  if (component.slug === 'strike-and-replace') return <StrikeReplacePreview component={component} title={title} text={text} progress={progress} fontSize={fontSize} visualScale={visualScale} />;
  if (component.slug === 'typewriter-reveal') return <TypewriterPreview component={component} title={title} text={text} progress={progress} fontSize={fontSize} visualScale={visualScale} assetUrl={assetUrl} />;
  if (component.slug === 'highlighter-sweep') return <HighlighterPreview component={component} title={title} text={text} progress={progress} fontSize={fontSize} visualScale={visualScale} width={Number(component.props.highlightWidth ?? 70)} />;
  if (component.slug === 'hand-drawn-ellipse') return <EllipsePreview component={component} title={title} text={text} progress={progress} fontSize={fontSize} visualScale={visualScale} ellipseWidth={Number(component.props.ellipseWidth ?? 76)} ellipseHeight={Number(component.props.ellipseHeight ?? 42)} />;
  if (component.slug === 'ink-underline') return <InkUnderlinePreview component={component} title={title} text={text} progress={progress} fontSize={fontSize} visualScale={visualScale} width={Number(component.props.underlineWidth ?? 68)} />;
  if (component.slug === 'callout-line-label') return <CalloutPreview component={component} title={title} text={text} progress={progress} fontSize={fontSize} visualScale={visualScale} showLeader={component.props.showLeader === true} />;
  if (component.slug === 'ui-flow-theater') return <UiFlowPreview component={component} title={title} text={text} items={itemsFromProps(component.props, text)} progress={progress} fontSize={fontSize} visualScale={visualScale} />;
  if (component.slug === 'timeline-travel') return <TimelineTravelPreview progress={progress} title={title} assetUrl={assetUrl} />;
  if (component.slug === 'canvas-materialize-moves') return <CanvasMaterializePreview progress={progress} title={title} />;
  if (isListComponent(component)) {
    return (
      <ListPreview
        variant={listVariant(component.slug)}
        title={title}
        items={itemsFromProps(component.props, text)}
        local={local}
        progress={progress}
        itemCueTimes={listItemCueTimes(component)}
        titleFontSize={scaleFont(Number(component.props.titleFontSize ?? component.props.fontSize ?? DEFAULT_COMPONENT_FONT_SIZE), visualScale)}
        itemFontSize={scaleFont(Number(component.props.itemFontSize ?? component.props.fontSize ?? DEFAULT_COMPONENT_FONT_SIZE), visualScale)}
        itemBackground={String(component.props.itemBackground ?? 'transparent')}
        itemTextColor={String(component.props.itemTextColor ?? component.props.textColor ?? '#111827')}
        titleColor={String(component.props.titleColor ?? component.props.accent ?? '#2364aa')}
        titleOffsetX={Number(component.props.titleOffsetX ?? 0)}
        titleOffsetY={Number(component.props.titleOffsetY ?? 0)}
        itemsOffsetX={Number(component.props.itemsOffsetX ?? 0)}
        itemsOffsetY={Number(component.props.itemsOffsetY ?? 0)}
      />
    );
  }
  if (category === '数据信息图') return <DataPreview component={component} title={title} text={text} value={value} progress={progress} fontSize={fontSize} visualScale={visualScale} />;
  if (category === '强调标注') return <AnnotationPreview component={component} title={title} text={text} progress={progress} fontSize={fontSize} visualScale={visualScale} />;
  if (component.slug === 'spotlight-hero-card') return <HeroCardPreview component={component} title={title} text={text} progress={progress} assetUrl={assetUrl} fontSize={fontSize} visualScale={visualScale} />;
  if (category === '素材呈现' || category === '产品镜头') return <MediaPreview component={component} title={title} text={text} progress={progress} assetUrl={assetUrl} fontSize={fontSize} visualScale={visualScale} />;
  if (category === '转场结构') return <TransitionPreview title={title} progress={progress} />;
  if (category === '人物互动') return <HostPreview title={title} text={text} progress={progress} />;
  if (category === '运镜') return <CameraPreview title={title} text={text} local={local} assetUrl={assetUrl} />;
  return <TextPreview component={component} title={title} text={text} enter={enter} progress={progress} keyword={keyword} keywordColor={keywordColor} fontSize={fontSize} visualScale={visualScale} />;
}

function ImpactOpenPreview({ component, title, text, enter, progress, keyword, keywordColor, fontSize, visualScale }: { component: ComponentInstance; title: string; text: string; enter: number; progress: number; keyword: string; keywordColor: string; fontSize: number; visualScale: number }) {
  return (
    <div className="motion-impact-open" style={{ ...textLayerVars(component.props, fontSize, visualScale), transform: `scale(${0.9 + enter * 0.1})` } as CSSProperties}>
      <div className="impact-slab" style={{ transform: `translateX(${(1 - enter) * -18}%) skewX(-7deg)` }} />
      <strong>{highlightText(title, keyword, keywordColor)}</strong>
      <span>{highlightText(text, keyword, keywordColor)}</span>
      <i style={{ transform: `scaleX(${clamp((progress - 0.08) * 1.8, 0, 1)})` }} />
    </div>
  );
}

function TextPreview({ component, title, text, enter, progress, keyword, keywordColor, fontSize, visualScale }: { component: ComponentInstance; title: string; text: string; enter: number; progress: number; keyword: string; keywordColor: string; fontSize: number; visualScale: number }) {
  return (
    <div className="motion-text" style={{ ...textLayerVars(component.props, fontSize, visualScale), transform: `translateY(${(1 - enter) * 28}px) scale(${0.96 + enter * 0.04})` } as CSSProperties}>
      <strong>{highlightText(title, keyword, keywordColor)}</strong>
      <span>{highlightText(text, keyword, keywordColor)}</span>
      <i style={{ transform: `scaleX(${clamp(progress * 1.4, 0, 1)})` }} />
    </div>
  );
}

function StaticTextPreview({ component, fontSize, visualScale }: { component: ComponentInstance; fontSize: number; visualScale: number }) {
  const title = String(component.props.title ?? '');
  const text = String(component.props.text ?? '');
  const align = String(component.props.align ?? 'left');
  return (
    <div className={`motion-static-text align-${align}`} style={textLayerVars(component.props, fontSize, visualScale)}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function StrikeReplacePreview({ component, title, text, progress, fontSize, visualScale }: { component: ComponentInstance; title: string; text: string; progress: number; fontSize: number; visualScale: number }) {
  const draw = easeOut(clamp(progress * 2.1, 0, 1));
  return (
    <div className="motion-strike" style={textLayerVars(component.props, fontSize, visualScale)}>
      <div className="strike-target">
        <strong>{title}</strong>
        <i style={{ transform: `scaleX(${draw})` }} />
      </div>
      <span>{text}</span>
    </div>
  );
}

function TypewriterPreview({ component, title, text, progress, fontSize, visualScale, assetUrl }: { component: ComponentInstance; title: string; text: string; progress: number; fontSize: number; visualScale: number; assetUrl: string }) {
  const shown = text.slice(0, Math.max(1, Math.round(text.length * clamp(progress * 1.8, 0, 1))));
  return (
    <div className={assetUrl ? 'motion-typewriter with-asset' : 'motion-typewriter'} style={textLayerVars(component.props, fontSize, visualScale)}>
      <div className="type-panel">
        <strong>{title}</strong>
        <pre>{shown}</pre>
      </div>
      {assetUrl ? <img src={assetUrl} alt="" /> : null}
    </div>
  );
}

function HighlighterPreview({ component, title, text, progress, fontSize, visualScale, width }: { component: ComponentInstance; title: string; text: string; progress: number; fontSize: number; visualScale: number; width: number }) {
  const sweep = clamp(progress * 1.6, 0, 1);
  return (
    <div className="motion-mark-preview" style={{ ...textLayerVars(component.props, fontSize, visualScale), '--mark-width': `${clamp(width, 18, 100)}%` } as CSSProperties}>
      <strong>{title}</strong>
      <span>{text}</span>
      <i className="highlighter-line" style={{ transform: `scaleX(${sweep})` }} />
    </div>
  );
}

function EllipsePreview({ component, title, text, progress, fontSize, visualScale, ellipseWidth, ellipseHeight }: { component: ComponentInstance; title: string; text: string; progress: number; fontSize: number; visualScale: number; ellipseWidth: number; ellipseHeight: number }) {
  const draw = clamp(progress * 1.55, 0, 1);
  return (
    <div className="motion-mark-preview" style={{ ...textLayerVars(component.props, fontSize, visualScale), '--ellipse-width': `${clamp(ellipseWidth, 30, 100)}%`, '--ellipse-height': `${clamp(ellipseHeight, 20, 80)}%` } as CSSProperties}>
      <div className="ellipse-target">
        <strong>{title}</strong>
        <svg viewBox="0 0 400 150" aria-hidden="true">
          <path d="M28 78 C72 8, 315 10, 373 68 C333 142, 82 145, 28 78" style={{ strokeDashoffset: 940 - draw * 940 }} />
        </svg>
      </div>
      <span>{text}</span>
    </div>
  );
}

function InkUnderlinePreview({ component, title, text, progress, fontSize, visualScale, width }: { component: ComponentInstance; title: string; text: string; progress: number; fontSize: number; visualScale: number; width: number }) {
  const draw = clamp(progress * 1.7, 0, 1);
  return (
    <div className="motion-mark-preview" style={{ ...textLayerVars(component.props, fontSize, visualScale), '--mark-width': `${clamp(width, 18, 100)}%` } as CSSProperties}>
      <strong>{title}</strong>
      <span>{text}</span>
      <svg className="ink-underline-svg" viewBox="0 0 600 64" aria-hidden="true">
        <path d="M18 36 C110 18, 176 56, 260 34 S452 18, 582 38" style={{ strokeDashoffset: 720 - draw * 720 }} />
      </svg>
    </div>
  );
}

function AnnotationPreview({ component, title, text, progress, fontSize, visualScale }: { component: ComponentInstance; title: string; text: string; progress: number; fontSize: number; visualScale: number }) {
  return (
    <div className="motion-annotation" style={textLayerVars(component.props, fontSize, visualScale)}>
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="annotation-rule" style={{ transform: `scaleX(${clamp((progress - 0.16) * 2.2, 0, 1)})` }} />
    </div>
  );
}

function CalloutPreview({ component, title, text, progress, fontSize, visualScale, showLeader }: { component: ComponentInstance; title: string; text: string; progress: number; fontSize: number; visualScale: number; showLeader: boolean }) {
  const reveal = easeOut(clamp(progress * 1.8, 0, 1));
  const line = clamp((progress - 0.16) * 2.4, 0, 1);
  return (
    <div className="motion-callout" style={textLayerVars(component.props, fontSize, visualScale)}>
      <div className="callout-copy" style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 18}px)` }}>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      {showLeader ? (
        <>
          <svg viewBox="0 0 420 180" preserveAspectRatio="none" aria-hidden="true">
            <path d="M34 54 C148 58, 226 108, 386 128" style={{ strokeDashoffset: 460 - line * 460 }} />
          </svg>
          <i style={{ transform: `scale(${clamp((progress - 0.55) * 3, 0, 1)})` }} />
        </>
      ) : null}
    </div>
  );
}

function UiFlowPreview({ component, title, text, items, progress, fontSize, visualScale }: { component: ComponentInstance; title: string; text: string; items: string[]; progress: number; fontSize: number; visualScale: number }) {
  const reveal = easeOut(clamp(progress * 1.8, 0, 1));
  const lines = items.length ? items.slice(0, 3) : ['第一次靠记忆', '第二次靠补充', '第三次又忘了'];
  const sourceLabel = String(component.props.sourceLabel ?? '同一个需求');
  const resultTitle = String(component.props.resultTitle ?? '前后不一致');
  const sourceFontSize = scaleFont(Number(component.props.sourceFontSize ?? component.props.fontSize ?? DEFAULT_COMPONENT_FONT_SIZE), visualScale);
  const branchFontSize = scaleFont(Number(component.props.branchFontSize ?? component.props.fontSize ?? DEFAULT_COMPONENT_FONT_SIZE), visualScale);
  const resultFontSize = scaleFont(Number(component.props.resultFontSize ?? component.props.fontSize ?? DEFAULT_COMPONENT_FONT_SIZE), visualScale);
  const style = {
    '--motion-font': `${fontSize}px`,
    '--flow-source-font': `${sourceFontSize}px`,
    '--flow-branch-font': `${branchFontSize}px`,
    '--flow-result-font': `${resultFontSize}px`,
    '--flow-source-bg': String(component.props.sourceBackground ?? 'rgba(255,255,255,0.78)'),
    '--flow-source-color': String(component.props.sourceTextColor ?? component.props.textColor ?? '#111827'),
    '--flow-branch-bg': String(component.props.branchBackground ?? 'rgba(255,255,255,0.74)'),
    '--flow-branch-color': String(component.props.branchTextColor ?? component.props.textColor ?? '#111827'),
    '--flow-result-bg': String(component.props.resultBackground ?? component.props.accent ?? '#2364aa'),
    '--flow-result-color': String(component.props.resultTextColor ?? '#ffffff'),
  } as CSSProperties;
  return (
    <div className="motion-ui-flow" style={style}>
      <div className="flow-source" style={{ opacity: reveal, transform: `translateX(${(1 - reveal) * -26}px)` }}>
        <strong>{title}</strong>
        <span>{sourceLabel}</span>
      </div>
      <div className="flow-branches">
        {lines.map((item, index) => {
          const itemReveal = easeOut(clamp((progress - 0.18 - index * 0.12) * 2.8, 0, 1));
          return (
            <span key={`${item}-${index}`} style={{ opacity: itemReveal, transform: `translateX(${(1 - itemReveal) * 36}px)` }}>
              {item}
            </span>
          );
        })}
      </div>
      <div className="flow-result" style={{ opacity: clamp((progress - 0.56) * 2.2, 0, 1) }}>
        <strong>{resultTitle}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

function DataPreview({ component, title, text, value, progress, fontSize, visualScale }: { component: ComponentInstance; title: string; text: string; value: string; progress: number; fontSize: number; visualScale: number }) {
  const bars = [0.42, 0.68, 0.52, 0.86, 1];
  return (
    <div className="motion-data" style={textLayerVars(component.props, fontSize, visualScale)}>
      <div>
        <small>{title}</small>
        <strong>{value}</strong>
        <span>{text}</span>
      </div>
      <div className="bars">
        {bars.map((bar, index) => (
          <i key={bar} style={{ height: `${bar * 78}%`, transform: `scaleY(${clamp((progress - index * 0.09) * 2.5, 0, 1)})` }} />
        ))}
      </div>
    </div>
  );
}

function ListPreview({
  variant,
  title,
  items,
  local,
  progress,
  itemCueTimes,
  titleFontSize,
  itemFontSize,
  itemBackground,
  itemTextColor,
  titleColor,
  titleOffsetX,
  titleOffsetY,
  itemsOffsetX,
  itemsOffsetY,
}: {
  variant: 'split' | 'plain' | 'horizontal' | 'roadmap' | 'vertical' | 'cube';
  title: string;
  items: string[];
  local: number;
  progress: number;
  itemCueTimes: number[];
  titleFontSize: number;
  itemFontSize: number;
  itemBackground: string;
  itemTextColor: string;
  titleColor: string;
  titleOffsetX: number;
  titleOffsetY: number;
  itemsOffsetX: number;
  itemsOffsetY: number;
}) {
  const visibleItems = items.length ? items : ['项目目标', '开发规则', '验收标准'];
  const hasTitle = title.trim().length > 0;
  return (
    <div
      className={`${hasTitle ? 'motion-list' : 'motion-list no-title'} ${variant}`}
      style={{
        '--motion-title-font': `${titleFontSize}px`,
        '--motion-item-font': `${itemFontSize}px`,
        '--motion-item-bg': itemBackground,
        '--motion-item-color': itemTextColor,
        '--motion-title-color': titleColor,
        '--list-title-x': `${titleOffsetX}px`,
        '--list-title-y': `${titleOffsetY}px`,
        '--list-items-x': `${itemsOffsetX}px`,
        '--list-items-y': `${itemsOffsetY}px`,
        '--list-count': Math.min(visibleItems.length, 5),
      } as CSSProperties}
    >
      {hasTitle ? <strong>{title}</strong> : null}
      <div>
        {visibleItems.slice(0, 5).map((item, index) => {
          const cueTime = itemCueTimes[index];
          const reveal = typeof cueTime === 'number'
            ? easeOut(clamp((local - cueTime) / 0.28, 0, 1))
            : easeOut(clamp((progress - index * 0.14) * 3, 0, 1));
          const transform = variant === 'cube'
            ? `translateY(${(1 - reveal) * 22}px) rotateX(${(1 - reveal) * -52}deg) scale(${0.9 + reveal * 0.1})`
            : variant === 'horizontal' || variant === 'roadmap'
              ? `translateX(${(1 - reveal) * 34}px)`
              : `translateY(${(1 - reveal) * 26}px)`;
          return (
            <span key={`${item}-${index}`} style={{ opacity: reveal, transform }}>
              <i>{index + 1}</i>
              <b>{item}</b>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function HeroCardPreview({ component, title, text, progress, assetUrl, fontSize, visualScale }: { component: ComponentInstance; title: string; text: string; progress: number; assetUrl: string; fontSize: number; visualScale: number }) {
  const reveal = easeOut(clamp(progress * 1.8, 0, 1));
  return (
    <div className="motion-hero-card" style={textLayerVars(component.props, fontSize, visualScale)}>
      <div className="hero-card" style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 32}px) scale(${0.96 + reveal * 0.04})` }}>
        {assetUrl ? <img src={assetUrl} alt="" /> : <div className="asset-missing">待绑定截图 / 视频素材</div>}
        <div className="hero-card-copy">
          <strong>{title}</strong>
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
}

function MediaPreview({ component, title, text, progress, assetUrl, fontSize, visualScale }: { component: ComponentInstance; title: string; text: string; progress: number; assetUrl: string; fontSize: number; visualScale: number }) {
  const reveal = easeOut(clamp(progress * 1.7, 0, 1));
  const scan = clamp((progress - 0.26) * 1.8, 0, 1);
  const showCopyPanel = component.props.showCopyPanel !== false;
  return (
    <div className="motion-media" style={textLayerVars(component.props, fontSize, visualScale)}>
      <div className={showCopyPanel ? 'media-evidence-card' : 'media-evidence-card image-only'} style={{ '--motion-font': `${fontSize}px`, opacity: reveal, transform: `translateX(${(1 - reveal) * 46}px) scale(${0.95 + reveal * 0.05})` } as CSSProperties}>
        <div className="media-evidence-frame">
          {assetUrl ? <img src={assetUrl} alt="" /> : <div className="asset-missing">待绑定截图 / 视频素材</div>}
          <i style={{ transform: `translateY(${(1 - scan) * -115}%)` }} />
        </div>
        {showCopyPanel ? (
          <div className="media-evidence-copy">
            <b>{title}</b>
            <span>{text || (assetUrl ? '已绑定真实素材' : '请在右侧素材地址中绑定截图、录屏或视频')}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TransitionPreview({ title, progress }: { title: string; progress: number }) {
  return (
    <div className="motion-transition">
      <span>{title}</span>
      {[0, 1, 2].map((item) => (
        <i key={item} style={{ transform: `translateX(${(-120 + clamp((progress - item * 0.08) * 2, 0, 1) * 260).toFixed(1)}%) skewX(-12deg)` }} />
      ))}
    </div>
  );
}

function HostPreview({ title, text, progress }: { title: string; text: string; progress: number }) {
  return (
    <div className="motion-host">
      <div className="host-chip" style={{ transform: `scale(${0.82 + clamp(progress * 2, 0, 1) * 0.18})` }}>
        <span />
      </div>
      <div className="lower-third" style={{ transform: `scaleX(${clamp((progress - 0.12) * 3, 0, 1)})` }}>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}

function CameraPreview({ title, text, local, assetUrl }: { title: string; text: string; local: number; assetUrl: string }) {
  const drift = Math.sin(local * 0.85);
  return (
    <div className="motion-camera">
      <div className="camera-page" style={{ transform: `perspective(900px) rotateY(${drift * 5}deg) rotateX(${Math.cos(local * 0.7) * 2}deg) scale(${1.02 + local * 0.004})` }}>
        {assetUrl ? <img src={assetUrl} alt="" /> : (
          <>
            <strong>{title}</strong>
            <p>{text}</p>
            <div><span /><span /><span /></div>
          </>
        )}
      </div>
    </div>
  );
}

function TimelineTravelPreview({ progress, title, assetUrl }: { progress: number; title: string; assetUrl: string }) {
  const travel = clamp(progress * 1.2, 0, 1);
  return (
    <div className="motion-timeline-travel">
      <strong>{title}</strong>
      <div className="axis" style={{ transform: `translateX(${-travel * 46}%)` }}>
        {['v1.0', 'v2.0', 'v3.0', 'Today'].map((label, index) => (
          <div key={label} className="tick">
            <span>{label}</span>
            <i style={{ transform: `scaleY(${clamp((progress - index * 0.18) * 4, 0, 1)})`, backgroundImage: assetUrl ? `url("${assetUrl}")` : undefined }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CanvasMaterializePreview({ progress, title }: { progress: number; title: string }) {
  return (
    <div className="motion-canvas">
      <div className="source-panel">
        <strong>{title}</strong>
        {[0, 1, 2].map((i) => <span key={i} style={{ opacity: progress > i * 0.12 ? 1 : 0.35 }} />)}
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="floating-note" style={{ transform: `translate(${clamp((progress - 0.28 - i * 0.08) * 2, 0, 1) * (250 + i * 32)}px, ${-70 + i * 86}px) rotate(${[-2, 1, 2][i]}deg)`, opacity: clamp((progress - 0.25 - i * 0.08) * 3, 0, 1) }} />
      ))}
    </div>
  );
}

function ShotcraftPreview({ component, progress, local, fontSize, visualScale }: { component: ComponentInstance; progress: number; local: number; fontSize: number; visualScale: number }) {
  const shotName = String(component.props.shotcraftName ?? component.slug.replace(/^shotcraft-/, ''));
  const category = String(component.props.shotcraftCategory ?? 'shotcraft');
  const energy = String(component.props.shotcraftEnergy ?? '');
  const title = String(component.props.title ?? shotName);
  const text = String(component.props.text ?? '').split(/[。；;]/)[0];
  const reveal = easeOut(clamp(progress * 1.7, 0, 1));
  const style = {
    ...textLayerVars(component.props, fontSize, visualScale),
    '--shotcraft-drift': `${Math.sin(local * 1.1) * 8}px`,
  } as CSSProperties;
  const lowerName = shotName.toLowerCase();
  const mode =
    lowerName.includes('list') || lowerName.includes('stack') || lowerName.includes('card') || lowerName.includes('carousel') ? 'cards'
      : lowerName.includes('flow') || lowerName.includes('route') || lowerName.includes('timeline') || lowerName.includes('converge') ? 'flow'
        : category === 'data' || lowerName.includes('chart') || lowerName.includes('gauge') || lowerName.includes('counter') ? 'data'
          : category === 'transition' || category === 'rhythm' || lowerName.includes('wipe') || lowerName.includes('cut') ? 'transition'
            : category === 'interaction' || lowerName.includes('command') || lowerName.includes('input') || lowerName.includes('stream') ? 'interaction'
              : category === 'typography' || category === 'opening' ? 'type'
                : 'showcase';

  return (
    <div className={`motion-shotcraft native ${mode}`} style={style}>
      <div className="shotcraft-native-stage" style={{ opacity: reveal }}>
        {mode === 'cards' ? <ShotcraftCards progress={progress} title={title} /> : null}
        {mode === 'flow' ? <ShotcraftFlow progress={progress} title={title} /> : null}
        {mode === 'data' ? <ShotcraftData progress={progress} title={title} /> : null}
        {mode === 'transition' ? <ShotcraftTransition progress={progress} title={title} /> : null}
        {mode === 'interaction' ? <ShotcraftInteraction progress={progress} title={title} /> : null}
        {mode === 'type' ? <ShotcraftType progress={progress} title={title} /> : null}
        {mode === 'showcase' ? <ShotcraftShowcase progress={progress} title={title} /> : null}
      </div>
      <div className="shotcraft-copy">
        <small>{category}{energy ? ` · ${energy}` : ''}</small>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

function ShotcraftCards({ progress, title }: { progress: number; title: string }) {
  return (
    <div className="shotcraft-cards">
      {[0, 1, 2, 3, 4, 5].map((item) => {
        const reveal = easeOut(clamp((progress - item * 0.08) * 2.4, 0, 1));
        return (
          <span key={item} style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 34}px) rotate(${(-6 + item * 2.4) * (1 - reveal)}deg)` }}>
            <b>{item === 0 ? title : `Shot ${item + 1}`}</b>
            <i />
            <i />
            <i />
          </span>
        );
      })}
    </div>
  );
}

function ShotcraftFlow({ progress, title }: { progress: number; title: string }) {
  return (
    <div className="shotcraft-flow">
      <strong>{title}</strong>
      <svg viewBox="0 0 640 220" aria-hidden="true">
        <path d="M58 132 C168 42, 248 210, 356 110 S508 56, 588 138" style={{ strokeDashoffset: 760 - clamp(progress * 1.25, 0, 1) * 760 }} />
      </svg>
      {['输入', '处理', '输出', '完成'].map((item, index) => {
        const reveal = easeOut(clamp((progress - index * 0.14) * 3, 0, 1));
        return <span key={item} style={{ opacity: reveal, transform: `scale(${0.82 + reveal * 0.18})` }}>{item}</span>;
      })}
    </div>
  );
}

function ShotcraftData({ progress, title }: { progress: number; title: string }) {
  return (
    <div className="shotcraft-data">
      <strong>{title}</strong>
      {[0.42, 0.68, 0.54, 0.86, 1].map((bar, index) => (
        <i key={bar} style={{ height: `${bar * 64}%`, transform: `scaleY(${clamp((progress - index * 0.08) * 2.6, 0, 1)})` }} />
      ))}
      <b>{Math.round(clamp(progress * 1.2, 0, 1) * 100)}%</b>
    </div>
  );
}

function ShotcraftTransition({ progress, title }: { progress: number; title: string }) {
  return (
    <div className="shotcraft-transition">
      <strong>{title}</strong>
      {[0, 1, 2].map((item) => (
        <i key={item} style={{ transform: `translateX(${(-115 + clamp((progress - item * 0.12) * 2, 0, 1) * 260).toFixed(1)}%) skewX(-10deg)` }} />
      ))}
    </div>
  );
}

function ShotcraftInteraction({ progress, title }: { progress: number; title: string }) {
  return (
    <div className="shotcraft-interaction">
      <strong>{title}</strong>
      <div className="command-box">
        <span style={{ width: `${24 + clamp(progress * 2, 0, 1) * 58}%` }} />
        <span style={{ width: `${40 + clamp((progress - 0.2) * 2, 0, 1) * 42}%` }} />
        <span style={{ width: `${28 + clamp((progress - 0.38) * 2, 0, 1) * 50}%` }} />
      </div>
      <b style={{ transform: `translate(${clamp((progress - 0.16) * 1.5, 0, 1) * 350}px, ${clamp((progress - 0.16) * 1.5, 0, 1) * 150}px)` }} />
    </div>
  );
}

function ShotcraftType({ progress, title }: { progress: number; title: string }) {
  const chars = Array.from(title).slice(0, 18);
  return (
    <div className="shotcraft-type">
      {chars.map((char, index) => {
        const reveal = easeOut(clamp((progress - index * 0.025) * 4, 0, 1));
        return <span key={`${char}-${index}`} style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 54}px)` }}>{char}</span>;
      })}
    </div>
  );
}

function ShotcraftShowcase({ progress, title }: { progress: number; title: string }) {
  const reveal = easeOut(clamp(progress * 1.8, 0, 1));
  return (
    <div className="shotcraft-showcase">
      <div style={{ transform: `perspective(900px) rotateY(${(1 - reveal) * -18}deg) translateY(${(1 - reveal) * 28}px)` }}>
        <strong>{title}</strong>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function CornerBugOverlay({ settings }: { settings: CornerBugSettings }) {
  if (!settings.enabled) return null;
  const style: CSSProperties & Record<'--corner-accent' | '--corner-font', string> = {
    top: `${settings.y}px`,
    opacity: settings.opacity,
    color: settings.textColor,
    background: settings.background,
    '--corner-accent': settings.accent,
    '--corner-font': `${settings.fontSize}px`,
  };
  if (settings.position === 'topRight') style.right = `${settings.x}px`;
  else style.left = `${settings.x}px`;

  return (
    <div className={`corner-bug ${settings.position}`} style={style}>
      <strong>{settings.title}</strong>
      {settings.subtitle ? <span>{settings.subtitle}</span> : null}
    </div>
  );
}

function SubtitleOverlay({ sentence, currentTime, settings }: { sentence?: ScriptSentence; currentTime: number; settings: SubtitleSettings }) {
  if (!sentence || !settings.enabled) return null;
  const chars = sentence.chars?.length
    ? sentence.chars
    : buildSentenceChars(sentence.text, sentence.startSec ?? 0, sentence.endSec ?? (sentence.startSec ?? 0) + sentenceDuration);
  const keywordMask = buildKeywordMask(sentence.text, settings.keywords);
  const style = {
    '--subtitle-bg': settings.background,
    '--subtitle-color': settings.textColor,
    '--subtitle-keyword': settings.keywordColor,
    '--subtitle-size': `${settings.fontSize}px`,
  } as CSSProperties;

  return (
    <div className={`subtitle-overlay ${settings.position} ${settings.shape}`} style={style}>
      {chars.map((char, index) => (
        <span key={`${char.ch}-${index}`} className={currentTime >= char.e ? 'spoken' : currentTime >= char.t ? 'active' : ''} data-keyword={keywordMask[index] ? 'true' : undefined}>
          {char.ch}
        </span>
      ))}
    </div>
  );
}

function highlightText(text: string, keyword: string, color: string) {
  const trimmed = keyword.trim();
  if (!trimmed || !text.includes(trimmed)) return text;
  return text.split(trimmed).flatMap((part, index, list) => (
    index === list.length - 1
      ? [part]
      : [part, <mark key={`${trimmed}-${index}`} style={{ color }}>{trimmed}</mark>]
  ));
}

function BackgroundField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="field background-field">
      <span>{label}</span>
      <div className="background-control">
        <input className="background-color" type="color" value={pickerColorValue(value)} onChange={(event) => onChange(event.target.value)} title="取色" />
        <input className="background-text" value={value} onChange={(event) => onChange(event.target.value)} placeholder="#ffffff / rgba(...) / linear-gradient(...)" />
        <button type="button" onClick={() => onChange('transparent')}>透明</button>
        <button type="button" onClick={() => onChange(EDITABLE_COMPONENT_BACKGROUND)}>底色</button>
      </div>
    </div>
  );
}

function formatRichText(lines: RichTextLine[]) {
  return JSON.stringify(lines, null, 2);
}

function parseRichText(text: string): RichTextLine[] | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return null;
    const lines: RichTextLine[] = [];
    parsed.forEach((line, index) => {
      if (!isRecord(line) || !Array.isArray(line.spans)) return;
      const spans: RichTextLine['spans'] = [];
      line.spans.forEach((span) => {
        if (!isRecord(span)) return;
        spans.push({
          text: String(span.text ?? ''),
          color: typeof span.color === 'string' ? span.color : undefined,
          background: typeof span.background === 'string' ? span.background : undefined,
          fontSize: typeof span.fontSize === 'number' ? span.fontSize : undefined,
          fontWeight: typeof span.fontWeight === 'number' ? span.fontWeight : undefined,
        });
      });
      lines.push({
          id: typeof line.id === 'string' ? line.id : `line-${index + 1}`,
          align: line.align === 'center' || line.align === 'right' ? line.align : 'left',
          spans,
      });
    });
    return lines;
  } catch {
    return null;
  }
}

function Field({ label, value, type = 'text', step, onChange }: { label: string; value: string | number; type?: string; step?: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} step={step} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isBackgroundKey(key: string) {
  return key.toLowerCase().includes('background');
}

function pickerColorValue(value: string) {
  const trimmed = value.trim();
  const hex = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const raw = hex[1];
    return raw.length === 3 ? `#${raw.split('').map((ch) => `${ch}${ch}`).join('')}` : `#${raw}`;
  }
  const rgb = trimmed.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgb) {
    return `#${[rgb[1], rgb[2], rgb[3]].map((part) => clamp(Number(part), 0, 255).toString(16).padStart(2, '0')).join('')}`;
  }
  return '#ffffff';
}

function overlaps(startSec: number, durationSec: number, rangeStart: number, rangeEnd: number) {
  const endSec = startSec + durationSec;
  return startSec < rangeEnd && endSec > rangeStart;
}

function easeOut(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeIn(value: number) {
  return value * value * value;
}

function easeInOut(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function formatTime(value: number) {
  const min = Math.floor(value / 60);
  const sec = Math.floor(value % 60).toString().padStart(2, '0');
  const tenth = Math.floor((value % 1) * 10);
  return `${min}:${sec}.${tenth}`;
}

function buildKeywordMask(text: string, keywords: string) {
  const mask = Array.from({ length: Array.from(text).length }, () => false);
  const chars = Array.from(text);
  const normalized = chars.join('');
  for (const raw of keywords.split(/[,，、\n]/)) {
    const keyword = raw.trim();
    if (!keyword) continue;
    let start = normalized.indexOf(keyword);
    while (start >= 0) {
      for (let index = start; index < start + Array.from(keyword).length; index += 1) {
        mask[index] = true;
      }
      start = normalized.indexOf(keyword, start + keyword.length);
    }
  }
  return mask;
}

function mediaSourceLabel(type: MediaSource['type']) {
  if (type === 'hostVideo') return '主播口播视频';
  if (type === 'demoVideo') return '演示视频';
  if (type === 'screenRecording') return '录屏视频';
  return '图片 / 截图';
}

function statusLabel(status: 'native' | 'previewOnly' | 'needsPort') {
  if (status === 'native') return '原';
  if (status === 'needsPort') return '待';
  return '样';
}

function inferLayerMediaKind(src: string, fallback: Layer['kind']): Layer['kind'] {
  if (/\.(mp4|mov|webm|m4v)$/i.test(src)) return 'video';
  if (/\.(png|jpe?g|webp|gif|avif|svg)$/i.test(src)) return 'image';
  return fallback === 'video' ? 'video' : 'image';
}

function mediaLayoutLabel(layout: MediaLayout) {
  if (layout === 'circlePip') return '圆窗';
  if (layout === 'splitLeft') return '左屏';
  if (layout === 'splitRight') return '右屏';
  return '全屏';
}

function layoutPatch(layout: MediaLayout): Partial<MediaTrack> {
  if (layout === 'circlePip') return { x: 1510, y: 72, w: 300, h: 300, z: 4, radius: 150 };
  if (layout === 'splitLeft') return { x: 0, y: 0, w: 960, h: 1080, z: 0, radius: 0 };
  if (layout === 'splitRight') return { x: 960, y: 0, w: 960, h: 1080, z: 0, radius: 0 };
  return { x: 0, y: 0, w: 1920, h: 1080, z: 0, radius: 0 };
}

function mediaShapeValue(track: MediaTrack) {
  const maxRadius = Math.min(track.w, track.h) / 2;
  if (Math.abs(track.radius - maxRadius) < 2 && Math.abs(track.w - track.h) < 2) return 'circle';
  if (Math.abs(track.radius - maxRadius) < 2) return 'pill';
  if (track.radius >= 20) return 'rounded';
  return 'square';
}

function mediaShapePatch(shape: string, track: MediaTrack): Partial<MediaTrack> {
  if (shape === 'circle') {
    const size = Math.min(track.w, track.h);
    return { w: size, h: size, radius: size / 2 };
  }
  if (shape === 'pill') return { radius: Math.min(track.w, track.h) / 2 };
  if (shape === 'rounded') return { radius: 28 };
  return { radius: 0 };
}

function previewDuration(def: ComponentDefinition) {
  return Math.max(1.2, def.defaultTiming.enter + def.defaultTiming.hold + def.defaultTiming.exit);
}

function createPreviewInstance(def: ComponentDefinition, theme: ComponentThemeSettings): ComponentInstance {
  const durationSec = Number(previewDuration(def).toFixed(2));
  const base: ComponentInstance = {
    id: `preview-${def.slug}`,
    slug: def.slug,
    shotId: 'preview-shot',
    startSec: 0,
    durationSec,
    x: 0,
    y: 0,
    w: def.defaultSize.w,
    h: def.defaultSize.h,
    z: 1,
    props: {
      ...def.defaultProps,
      ...samplePropsForDefinition(def),
      background: String(def.defaultProps.background ?? '').trim() === 'transparent' ? EDITABLE_COMPONENT_BACKGROUND : def.defaultProps.background,
    },
    enter: def.defaultTiming.enter,
    hold: def.defaultTiming.hold,
    exit: def.defaultTiming.exit,
    sfxEnabled: def.defaultSfxCues.length > 0,
    sfxCues: def.defaultSfxCues.map((cue, index) => ({ ...cue, id: `preview-${def.slug}-cue-${index + 1}`, componentId: `preview-${def.slug}` })),
  };
  const themedProps = themedComponentProps(base, theme);
  if (String(themedProps.background ?? '').trim() === 'transparent') {
    themedProps.background = EDITABLE_COMPONENT_BACKGROUND;
  }
  return {
    ...base,
    props: themedProps,
  };
}

function samplePropsForDefinition(def: ComponentDefinition): Record<string, string | number | boolean> {
  if (def.slug === 'horizontal-flow-list') {
    return {
      title: '从想法到成片',
      items: '文字稿\n配音\n逐字稿\n工作台 JSON',
      itemCueTimes: '0, 0.55, 1.1, 1.65',
      itemBackground: 'rgba(255,255,255,0.68)',
    };
  }
  if (def.slug === 'roadmap-line-path') {
    return {
      title: '这期视频的路线图',
      items: '先定主题\n写说明书\n让 AI 开工\n出片检查',
      itemCueTimes: '0, 0.7, 1.4, 2.1',
      itemBackground: 'rgba(255,255,255,0.72)',
    };
  }
  if (def.slug === 'cube-step-list') {
    return {
      title: '三个规则盒子',
      items: '目标\n边界\n验收',
      itemCueTimes: '0, 0.7, 1.4',
      itemBackground: 'rgba(255,255,255,0.76)',
    };
  }
  if (isListSlug(def.slug)) {
    return {
      title: '三个判断信号',
      items: '目标是否清楚\n边界是否清楚\n验收是否清楚',
      itemCueTimes: '0, 0.75, 1.5',
      itemBackground: 'rgba(255,255,255,0.62)',
    };
  }
  if (def.slug === 'ui-flow-theater') {
    return {
      title: '同一句需求',
      sourceLabel: '帮我做个 App',
      items: '靠记忆补规则\n临时改目录\n测试标准不一致',
      resultTitle: '统一说明书',
      text: '目标、边界、验收先写清楚',
    };
  }
  if (def.slug === 'strike-and-replace') {
    return {
      title: '帮我做个 App',
      text: '改成：目标、边界、验收和目录规则都写清楚',
      lineColor: '#ef4444',
    };
  }
  if (def.slug === 'evidence-scroll-tour') {
    return {
      title: '真实证据页',
      text: '绑定截图后做慢滚和局部聚焦',
      assetUrl: '/media/evidence/openai-codex-agents-md.png',
      showCopyPanel: true,
    };
  }
  if (def.slug === 'spotlight-hero-card') {
    return {
      title: 'AGENTS.md',
      text: '给编程代理看的项目说明书',
      assetUrl: '/media/evidence/openai-codex-agents-md.png',
    };
  }
  if (def.category === '素材呈现' || def.category === '产品镜头' || def.category === '运镜') {
    return {
      title: def.title,
      text: '预览里使用示例截图；正式项目里替换为真实素材',
      assetUrl: '/media/evidence/github-spec-kit-repo.png',
    };
  }
  return {};
}

function materialNeedForDefinition(def: ComponentDefinition) {
  if (def.slug.startsWith('shotcraft-')) return '原生导出会绑定 video-shotcraft 配方卡和 demo TSX；素材类镜头仍需要在 assetUrl 或后续 Remotion 工程里替换真实截图/录屏。';
  if (def.slug === 'evidence-scroll-tour') return '需要真实网页、仓库、文档或长截图；没有素材时会保留明确占位。';
  if (def.slug === 'spotlight-hero-card') return '可选。绑定截图/封面/文件卡会更像一个主角镜头。';
  if (def.category === '素材呈现' || def.category === '产品镜头' || def.category === '运镜') return '通常需要截图、录屏或产品界面素材。';
  return '不需要素材，主要改文字、颜色、位置和时间。';
}

function shotcraftPreviewUrl(def: ComponentDefinition) {
  return def.slug.startsWith('shotcraft-') ? String(def.defaultProps.previewUrl ?? '') : '';
}

function itemsFromProps(props: Record<string, string | number | boolean>, fallback = '') {
  const fromItems = String(props.items ?? '').trim();
  const numbered = ['item1', 'item2', 'item3', 'item4', 'item5']
    .map((key) => String(props[key] ?? '').trim())
    .filter(Boolean);
  const source = fromItems || fallback;
  const separator = source.includes('\n') ? /\n/ : /\/|、|，|,|\|/;
  const split = source
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
  return numbered.length ? numbered : split;
}

function listItemCueTimes(component: ComponentInstance) {
  const explicit = String(component.props.itemCueTimes ?? component.props.revealTimes ?? '')
    .split(/\n|,|，|\/|\|/)
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item >= 0);
  if (explicit.length) return explicit;
  return component.sfxCues
    .map((cue) => cue.t)
    .filter((item) => Number.isFinite(item) && item >= 0)
    .sort((a, b) => a - b);
}

function themedComponentProps(component: ComponentInstance, theme: ComponentThemeSettings) {
  const props: Record<string, string | number | boolean> = {
    ...component.props,
    accent: theme.accent,
    titleColor: theme.titleColor,
    bodyColor: theme.bodyColor,
    textColor: theme.textColor,
    keywordColor: theme.keywordColor,
    lineColor: theme.lineColor,
    background: theme.componentBackground,
  };
  if (isListComponent(component) || 'items' in props) {
    props.itemBackground = theme.itemBackground;
    props.itemTextColor = theme.itemTextColor;
  }
  if (component.slug === 'ui-flow-theater') {
    props.sourceBackground = theme.itemBackground;
    props.sourceTextColor = theme.textColor;
    props.branchBackground = theme.itemBackground;
    props.branchTextColor = theme.itemTextColor;
    props.resultBackground = theme.accent;
    props.resultTextColor = idealTextColor(theme.accent);
  }
  return props;
}

function themedLayer(layer: Layer, theme: ComponentThemeSettings, designTheme: WorkbenchProject['design']['theme']): Layer {
  const isGroup = layer.kind === 'group';
  const nextStyle = {
    ...layer.style,
    color: layer.kind === 'text' ? themedTextColor(layer, theme) : layer.style.color,
    lineColor: layer.kind === 'shape' && layer.shape === 'line' ? theme.lineColor : layer.style.lineColor,
    background: themedLayerBackground(layer, theme, designTheme),
  };
  const themedRichText = layer.richText?.map((line) => ({
    ...line,
    spans: line.spans.map((span, index) => ({
      ...span,
      color: index === 0 ? themedTextColor(layer, theme) : span.color ?? theme.keywordColor,
    })),
  }));
  return {
    ...layer,
    style: isGroup
      ? {
          ...nextStyle,
          background: layer.style.variant === 'glow-panel' ? layer.style.background : theme.componentBackground || designTheme.surfaceColor,
          borderColor: layer.style.borderColor ?? 'rgba(15,23,42,0.12)',
        }
      : nextStyle,
    richText: themedRichText,
    children: layer.children?.map((child) => themedLayer(child, theme, designTheme)),
  };
}

function themedTextColor(layer: Layer, theme: ComponentThemeSettings) {
  const name = layer.name.toLowerCase();
  if (name.includes('数字') || name.includes('步骤号') || name.includes('标签') || name.includes('警示')) return idealTextColor(theme.accent);
  if (name.includes('标题') || name.includes('关键词')) return theme.titleColor;
  if (name.includes('正文') || name.includes('旁注') || name.includes('副标题')) return theme.bodyColor;
  if (name.includes('文字') || name.includes('条目') || name.includes('卡片')) return theme.itemTextColor;
  return theme.textColor;
}

function themedLayerBackground(layer: Layer, theme: ComponentThemeSettings, designTheme: WorkbenchProject['design']['theme']) {
  if (layer.kind === 'group') return theme.componentBackground || designTheme.surfaceColor;
  if (layer.kind === 'shape' && layer.shape === 'line') return layer.style.background;
  const name = layer.name.toLowerCase();
  if (name.includes('数字') || name.includes('步骤号') || name.includes('标签') || name.includes('警示')) return theme.accent;
  if (!layer.style.background || layer.style.background === 'transparent') return layer.style.background;
  return theme.itemBackground;
}

function isListComponent(component: ComponentInstance) {
  return isListSlug(component.slug);
}

function isListSlug(slug: string) {
  return ['line-by-line-slide', 'step-timeline-vertical', 'numbered-step-stack', 'focus-dim-spotlight', 'list-transparent-stack', 'horizontal-flow-list', 'roadmap-line-path', 'cube-step-list'].includes(slug);
}

function listVariant(slug: string): 'split' | 'plain' | 'horizontal' | 'roadmap' | 'vertical' | 'cube' {
  if (slug === 'list-transparent-stack') return 'plain';
  if (slug === 'horizontal-flow-list') return 'horizontal';
  if (slug === 'roadmap-line-path') return 'roadmap';
  if (slug === 'step-timeline-vertical') return 'vertical';
  if (slug === 'cube-step-list' || slug === 'numbered-step-stack') return 'cube';
  return 'split';
}

function idealTextColor(background: string) {
  const hex = pickerColorValue(background);
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111827' : '#ffffff';
}

function propLabel(key: string) {
  const labels: Record<string, string> = {
    items: '列表条目',
    item1: '条目 1',
    item2: '条目 2',
    item3: '条目 3',
    item4: '条目 4',
    item5: '条目 5',
    fontSize: '字体大小',
    titleFontSize: '标题字体大小',
    textFontSize: '下行文字大小',
    itemFontSize: '条目字体大小',
    titleFontFamily: '标题字体',
    textFontFamily: '下行字体',
    titleOffsetX: '标题横向偏移',
    titleOffsetY: '标题纵向偏移',
    itemsOffsetX: '条目横向偏移',
    itemsOffsetY: '条目纵向偏移',
    titleFontWeight: '标题字重',
    textFontWeight: '下行字重',
    titleColor: '标题颜色',
    bodyColor: '下行颜色',
    lineColor: '横线颜色',
    itemBackground: '条目背景',
    itemTextColor: '条目文字色',
    itemCueTimes: '条目入场秒',
    sourceLabel: '来源副标题',
    sourceFontSize: '来源字号',
    sourceBackground: '来源背景',
    sourceTextColor: '来源文字色',
    branchFontSize: '分支字号',
    branchBackground: '分支背景',
    branchTextColor: '分支文字色',
    resultTitle: '结果标题',
    resultFontSize: '结果字号',
    resultBackground: '结果背景',
    resultTextColor: '结果文字色',
    value: '数字/指标',
    label: '标签',
    assetUrl: '截图/素材 URL',
    previewUrl: '样片预览 URL',
    renderMode: '渲染模式',
    nativeStatus: '原生状态',
    shotcraftRoot: 'Shotcraft 根目录',
    shotcraftName: 'Shotcraft 卡名',
    shotcraftCategory: 'Shotcraft 类别',
    shotcraftUse: 'Shotcraft 用途',
    shotcraftEnergy: 'Shotcraft 能量',
    shotcraftDuration: 'Shotcraft 时长',
    shotcraftSource: 'Shotcraft 来源',
    shotcraftStyleKey: 'Shotcraft 样式',
    shotcraftDemoFiles: 'Demo 源码路径',
    shotcraftStylesJson: '样式清单 JSON',
  };
  return labels[key] ?? key;
}

function defaultPropValue(key: string): string | number | boolean {
  if (key.toLowerCase().includes('fontfamily')) return fontFamilyOptions[0].value;
  if (key === 'itemCueTimes') return '0, 0.8, 1.6';
  if (key.toLowerCase().includes('offset')) return 0;
  if (key.toLowerCase().includes('size')) return DEFAULT_COMPONENT_FONT_SIZE;
  if (key.toLowerCase().includes('width')) return 70;
  if (key.toLowerCase().includes('height')) return 42;
  if (key.toLowerCase().includes('fontweight')) return key === 'textFontWeight' ? 500 : 800;
  if (key === 'lineColor') return '#c96752';
  if (key === 'titleColor' || key === 'bodyColor') return '#111827';
  if (key.toLowerCase().includes('background')) return EDITABLE_COMPONENT_BACKGROUND;
  if (key.toLowerCase().includes('textcolor') || key.toLowerCase().includes('color')) return '#111827';
  if (key === 'align') return 'left';
  return '';
}

const fontFamilyOptions = [
  { label: '雅黑 / 黑体', value: 'Microsoft YaHei, Noto Sans CJK SC, sans-serif' },
  { label: '粗黑标题', value: 'SimHei, Microsoft YaHei, sans-serif' },
  { label: '宋体衬线', value: 'SimSun, Noto Serif CJK SC, serif' },
  { label: '楷体手写', value: 'KaiTi, STKaiti, serif' },
  { label: '代码等宽', value: 'JetBrains Mono, Consolas, monospace' },
];

function textLayerVars(props: Record<string, string | number | boolean>, baseFontSize: number, visualScale: number): CSSProperties {
  const titleSize = scaleFont(Number(props.titleFontSize ?? props.fontSize ?? DEFAULT_COMPONENT_FONT_SIZE), visualScale);
  const bodySize = scaleFont(Number(props.textFontSize ?? props.fontSize ?? DEFAULT_COMPONENT_FONT_SIZE), visualScale);
  const titleFont = String(props.titleFontFamily ?? fontFamilyOptions[0].value);
  const bodyFont = String(props.textFontFamily ?? fontFamilyOptions[0].value);
  return {
    '--motion-font': `${baseFontSize}px`,
    '--motion-title-font': `${titleSize}px`,
    '--motion-body-font': `${bodySize}px`,
    '--motion-title-weight': Number(props.titleFontWeight ?? props.fontWeight ?? 900),
    '--motion-body-weight': Number(props.textFontWeight ?? 500),
    '--motion-title-family': titleFont,
    '--motion-body-family': bodyFont,
    '--motion-title-color': String(props.titleColor ?? props.textColor ?? '#111827'),
    '--motion-body-color': String(props.bodyColor ?? props.textColor ?? '#111827'),
    '--motion-line-color': String(props.lineColor ?? props.accent ?? '#ffffff'),
  } as CSSProperties;
}

function componentVisualScale(component: ComponentInstance, definition?: ComponentDefinition) {
  if (!definition) return 1;
  const scaleX = component.w / Math.max(1, definition.defaultSize.w);
  const scaleY = component.h / Math.max(1, definition.defaultSize.h);
  return clamp(Math.min(scaleX, scaleY), 0.25, 3);
}

function scaleFont(value: number, visualScale: number) {
  return Number((value * visualScale).toFixed(2));
}

function observeStageScale(node: HTMLElement, onScale: (scale: number) => void) {
  const measure = () => {
    const style = window.getComputedStyle(node);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const availableW = Math.max(1, node.clientWidth - paddingX);
    const availableH = Math.max(1, node.clientHeight - paddingY);
    const next = clamp(Math.min(availableW / STAGE_W, availableH / STAGE_H), 0.05, 1);
    onScale(Number(next.toFixed(4)));
  };
  const observer = new ResizeObserver(measure);
  observer.observe(node);
  window.addEventListener('resize', measure);
  measure();
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', measure);
  };
}

function stageBackgroundStyle(background?: ShotBackgroundStyle): CSSProperties {
  const bg = background ?? { type: 'lightGrid', color: '#f7f9fb', imageUrl: '' };
  if (bg.type === 'image' && bg.imageUrl) {
    return {
      backgroundImage: `url("${bg.imageUrl}")`,
      backgroundColor: bg.color,
      backgroundSize: 'cover',
    };
  }
  if (bg.type === 'solid') {
    return { background: bg.color };
  }
  if (bg.type === 'darkGrid') {
    return {
      background: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px), radial-gradient(circle at 70% 18%, rgba(31, 138, 112, 0.2), transparent 30%), ${bg.color}`,
      backgroundSize: '48px 48px, 48px 48px, auto, auto',
    };
  }
  return {
    background: `linear-gradient(rgba(35, 100, 170, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(35, 100, 170, 0.08) 1px, transparent 1px), radial-gradient(circle at 70% 18%, rgba(31, 138, 112, 0.15), transparent 30%), ${bg.color}`,
    backgroundSize: '48px 48px, 48px 48px, auto, auto',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCharTiming(value: unknown): value is { ch: string; t: number; e: number } {
  return isRecord(value) && typeof value.ch === 'string' && typeof value.t === 'number' && typeof value.e === 'number';
}

export default App;
