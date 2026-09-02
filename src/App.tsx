import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, DragEvent, PointerEvent } from 'react';
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  FileJson,
  FileText,
  Layers,
  Maximize2,
  MousePointer2,
  Pause,
  Play,
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
import { componentDefinitions, sfxAssets } from './data/generated';
import { SfxEngine } from './lib/audio';
import {
  STORAGE_KEY,
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
import type { ComponentDefinition, ComponentInstance, MediaLayout, MediaSource, MediaTrack, MotionCategory, ScriptSentence, SfxCue, ShotBackgroundStyle, SubtitleSettings, WorkbenchProject } from './types';

const STAGE_W = 1920;
const STAGE_H = 1080;
const MIN_COMPONENT_SIZE = 120;
const MIN_MEDIA_SIZE = 80;

type DragState =
  | { mode: 'move'; kind: 'component' | 'media'; id: string; dx: number; dy: number }
  | { mode: 'resize'; kind: 'component' | 'media'; id: string; startX: number; startY: number; startW: number; startH: number };

type SelectedTarget = { kind: 'component' | 'media'; id: string } | null;

type LeftTab = 'script' | 'motion' | 'sfx' | 'media' | 'voice' | 'subtitles';
type TimelineScope = 'full' | 'shot';

const categories: MotionCategory[] = ['字幕花字', '强调标注', '数据信息图', '素材呈现', '转场结构', '人物互动', '运镜', '产品镜头'];

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
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget>(project.components[0] ? { kind: 'component', id: project.components[0].id } : null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MotionCategory | '全部'>('全部');
  const [sfxQuery, setSfxQuery] = useState('');
  const [leftTab, setLeftTab] = useState<LeftTab>('motion');
  const [charJsonDraft, setCharJsonDraft] = useState('');
  const [showGuides, setShowGuides] = useState(true);
  const [timelineHeight, setTimelineHeight] = useState(220);
  const [timelineScope, setTimelineScope] = useState<TimelineScope>('full');
  const [showStagePreview, setShowStagePreview] = useState(false);
  const [previewRange, setPreviewRange] = useState<{ kind: 'component' | 'media'; id: string; endSec: number } | null>(null);
  const [playingCueId, setPlayingCueId] = useState('');
  const [pendingDefinition, setPendingDefinition] = useState<ComponentDefinition | null>(null);
  const [mediaDraft, setMediaDraft] = useState({ name: '', src: '', type: 'hostVideo' as MediaSource['type'] });
  const [scriptDraft, setScriptDraft] = useState(project.script.map((line) => line.text).join('\n'));
  const [drag, setDrag] = useState<DragState | null>(null);
  const [timelineDrag, setTimelineDrag] = useState<{ type: 'playhead' | 'clip'; kind?: 'component' | 'media'; id?: string; offset?: number } | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [previewScale, setPreviewScale] = useState(0.65);
  const stageWrapRef = useRef<HTMLDivElement | null>(null);
  const previewShellRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const draggedDefinitionRef = useRef<ComponentDefinition | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const engineRef = useRef<SfxEngine | null>(null);
  const cueStopRef = useRef<(() => void) | null>(null);

  const totalDuration = useMemo(() => getTotalDuration(project), [project]);
  const selectedComponent = selectedTarget?.kind === 'component' ? project.components.find((component) => component.id === selectedTarget.id) ?? null : null;
  const selectedMediaTrack = selectedTarget?.kind === 'media' ? project.media.tracks.find((track) => track.id === selectedTarget.id) ?? null : null;
  const selectedMediaSource = selectedMediaTrack ? project.media.sources.find((source) => source.id === selectedMediaTrack.sourceId) : undefined;
  const selectedDefinition = selectedComponent ? componentDefinitions.find((def) => def.slug === selectedComponent.slug) : undefined;
  const activeShot = project.shots.find((shot) => currentTime >= shot.startSec && currentTime < shot.startSec + shot.durationSec) ?? project.shots[0];
  const activeSentence = project.script.find((sentence) => activeShot?.sentenceIds.includes(sentence.id)) ?? project.script[0];
  const activeComponents = project.components
    .filter((component) => currentTime >= component.startSec && currentTime <= component.startSec + component.durationSec)
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
  const filteredDefinitions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return componentDefinitions.filter((def) => {
      const guidance = getComponentGuidance(def);
      const inCategory = category === '全部' || def.category === category;
      const inSearch = !needle || `${def.slug} ${def.title} ${def.summary} ${guidance.aiUse} ${guidance.sentenceSignals.join(' ')}`.toLowerCase().includes(needle);
      return inCategory && inSearch;
    });
  }, [category, query]);

  const filteredSfx = useMemo(() => {
    const needle = sfxQuery.trim().toLowerCase();
    return sfxAssets.filter((asset) => !needle || `${asset.category} ${asset.name} ${asset.recommendedUse}`.toLowerCase().includes(needle));
  }, [sfxQuery]);
  const timelineTrackHeight = Math.max(128, timelineComponents.length * 42 + timelineMediaTracks.length * 28 + 40);

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
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select')) return;
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedTarget) {
        event.preventDefault();
        if (selectedTarget.kind === 'component') {
          setProject((current) => ({ ...current, components: current.components.filter((component) => component.id !== selectedTarget.id) }));
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
    for (const component of project.components) {
      if (!component.sfxEnabled) continue;
      for (const cue of component.sfxCues) {
        const absolute = component.startSec + cue.t;
        if (absolute > from && absolute <= to) {
          void engineRef.current.play(cue, project.sfx.masterVolume);
        }
      }
    }
  }, [project.components, project.sfx.enabled, project.sfx.masterVolume]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastTickRef.current = null;
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
    setCurrentTime(Math.max(0, Math.min(totalDuration, time)));
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

  function updateComponent(id: string, patch: Partial<ComponentInstance>) {
    updateProject((draft) => ({
      ...draft,
      components: draft.components.map((component) => (component.id === id ? { ...component, ...patch } : component)),
    }));
  }

  function updateSelectedProps(key: string, value: string | number | boolean) {
    if (!selectedComponent) return;
    updateComponent(selectedComponent.id, { props: { ...selectedComponent.props, [key]: value } });
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

  function previewSelected() {
    const target = selectedComponent
      ? { kind: 'component' as const, id: selectedComponent.id, startSec: selectedComponent.startSec, durationSec: selectedComponent.durationSec }
      : selectedMediaTrack
        ? { kind: 'media' as const, id: selectedMediaTrack.id, startSec: selectedMediaTrack.startSec, durationSec: selectedMediaTrack.durationSec }
        : null;
    if (!target) return;
    const isPreviewing = isPlaying && previewRange?.kind === target.kind && previewRange.id === target.id;
    if (isPreviewing) {
      setIsPlaying(false);
      setPreviewRange(null);
      return;
    }
    setTime(target.startSec);
    setPreviewRange({ kind: target.kind, id: target.id, endSec: target.startSec + target.durationSec });
    setIsPlaying(true);
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
      : project.media.tracks.find((track) => track.id === drag.id);
    if (!item) return;
    if (drag.mode === 'move') {
      const patch = {
        x: clamp(point.x - drag.dx, 0, STAGE_W - item.w),
        y: clamp(point.y - drag.dy, 0, STAGE_H - item.h),
      };
      if (drag.kind === 'component') updateComponent(drag.id, patch);
      else updateMediaTrack(drag.id, patch);
    } else {
      const minSize = drag.kind === 'component' ? MIN_COMPONENT_SIZE : MIN_MEDIA_SIZE;
      const patch = {
        w: clamp(drag.startW + point.x - drag.startX, minSize, STAGE_W - item.x),
        h: clamp(drag.startH + point.y - drag.startY, minSize, STAGE_H - item.y),
      };
      if (drag.kind === 'component') updateComponent(drag.id, patch);
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
      : project.components.find((component) => component.id === timelineDrag.id);
    if (!item || !timelineDrag.id) return;
    const minStart = timelineScope === 'shot' ? timelineStart : 0;
    const maxEnd = timelineScope === 'shot' ? timelineEnd : totalDuration;
    const nextStart = clamp(time - (timelineDrag.offset ?? 0), minStart, Math.max(minStart, maxEnd - item.durationSec));
    if (timelineDrag.kind === 'media') updateMediaTrack(timelineDrag.id, { startSec: Number(nextStart.toFixed(2)) });
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
    const zValues = [...project.components.map((component) => component.z), ...project.media.tracks.map((track) => track.z), 0];
    const z = direction === 'front' ? Math.max(...zValues) + 1 : Math.min(...zValues) - 1;
    if (selectedTarget.kind === 'component') updateComponent(selectedTarget.id, { z });
    else updateMediaTrack(selectedTarget.id, { z });
  }

  function applyScript() {
    const next = splitScriptIntoProject(project, scriptDraft);
    setProject(next);
    setCurrentTime(0);
    setSelectedTarget(next.components[0] ? { kind: 'component', id: next.components[0].id } : null);
  }

  function togglePlayback() {
    if (isPlaying) {
      setIsPlaying(false);
      setPreviewRange(null);
      return;
    }
    setPreviewRange(null);
    if (currentTime >= totalDuration) {
      setTime(0);
    }
    setIsPlaying(true);
  }

  function dropComponent(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const slug = event.dataTransfer.getData('application/x-koubo-component') || draggedDefinitionRef.current?.slug;
    const def = componentDefinitions.find((item) => item.slug === slug);
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
        setSelectedTarget(parsed.components[0] ? { kind: 'component', id: parsed.components[0].id } : parsed.media.tracks[0] ? { kind: 'media', id: parsed.media.tracks[0].id } : null);
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

  function exportBook() {
    downloadText('shotbook.md', exportShotbook(project), 'text/markdown');
  }

  function renderStageContent(readOnly = false) {
    return (
      <>
        <div className="stage-bg" style={stageBackgroundStyle(activeShot?.backgroundStyle)} />
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
        {activeComponents.map((component) => (
          <StageComponent
            key={component.id}
            component={component}
            currentTime={currentTime}
            selected={!readOnly && selectedTarget?.kind === 'component' && selectedTarget.id === component.id}
            readOnly={readOnly}
            definition={componentDefinitions.find((def) => def.slug === component.slug)}
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
          <button type="button" className="icon-button" title="导出 Remotion JSON" onClick={exportJson}>
            <FileJson size={18} />
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
                { id: 'script', label: '文稿', icon: <FileText size={15} /> },
                { id: 'motion', label: '动效', icon: <Boxes size={15} />, count: componentDefinitions.length },
                { id: 'sfx', label: 'SFX', icon: <Volume2 size={15} />, count: sfxAssets.length },
                { id: 'media', label: '素材', icon: <Layers size={15} />, count: project.media.sources.length },
                { id: 'voice', label: '逐字', icon: <Volume2 size={15} /> },
                { id: 'subtitles', label: '字幕', icon: <FileText size={15} /> },
              ].map((tab) => (
                <button key={tab.id} type="button" role="tab" aria-selected={leftTab === tab.id} className={leftTab === tab.id ? 'left-tab active' : 'left-tab'} onClick={() => setLeftTab(tab.id as LeftTab)}>
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count ? <small>{tab.count}</small> : null}
                </button>
              ))}
            </div>

            {leftTab === 'script' ? (
              <div className="left-tab-panel script-panel" role="tabpanel">
                <textarea value={scriptDraft} onChange={(event) => setScriptDraft(event.target.value)} />
                <button type="button" className="wide-button" onClick={applyScript}>
                  <WandSparkles size={16} />
                  重分句并生成镜头
                </button>
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

            {leftTab === 'motion' ? (
              <div className="left-tab-panel" role="tabpanel">
                <label className="search-box">
                  <Search size={15} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 slug / 中文名" />
                </label>
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
                  {filteredDefinitions.map((def) => {
                    const guidance = getComponentGuidance(def);
                    return (
                      <button
                        key={def.slug}
                        type="button"
                        className="component-card"
                        draggable
                        onClick={() => setPendingDefinition(def)}
                        onDragStart={(event) => {
                          draggedDefinitionRef.current = def;
                          event.dataTransfer.setData('application/x-koubo-component', def.slug);
                          event.dataTransfer.effectAllowed = 'copy';
                        }}
                        onDragEnd={() => {
                          draggedDefinitionRef.current = null;
                        }}
                      >
                        <span className="component-priority">{def.priority}</span>
                        <strong>{def.title}</strong>
                        <code>{def.slug}</code>
                        <small>{guidance.aiUse}</small>
                        <em>适合：{guidance.sentenceSignals.join(' / ')}</em>
                      </button>
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
                <p className="hint-line">本地视频放到 public/media 后填写 /media/xxx.mp4，再点全屏/圆窗/左屏/右屏加入当前镜头。</p>
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
                <strong>当前镜头背景</strong>
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
              <button type="button" className="wide-button" onClick={applyActiveShotBackgroundToAll}>应用到全部镜头</button>
            </div>
            {selectedMediaTrack ? (
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
                <label className="field">
                  <span>背景色 / CSS 背景</span>
                  <input value={String(selectedComponent.props.background ?? '')} onChange={(event) => updateSelectedProps('background', event.target.value)} placeholder="#111827 或 linear-gradient(...)" />
                </label>
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
            {timelineComponents.map((component, index) => (
              <button
                key={component.id}
                type="button"
                className={selectedTarget?.kind === 'component' && selectedTarget.id === component.id ? 'clip active' : 'clip'}
                style={{ ...timelineItemStyle(component.startSec, component.durationSec), top: `${14 + timelineMediaTracks.length * 28 + index * 42}px` }}
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
      <MotionPreview component={component} definition={definition} progress={progress} enter={enter} local={local} />
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
  const style = {
    left: `${(track.x / STAGE_W) * 100}%`,
    top: `${(track.y / STAGE_H) * 100}%`,
    width: `${(track.w / STAGE_W) * 100}%`,
    height: `${(track.h / STAGE_H) * 100}%`,
    zIndex: track.z,
    borderRadius: track.radius ? `${(track.radius / Math.max(track.w, track.h)) * 100}%` : 0,
    opacity: track.opacity,
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

function MotionPreview({ component, definition, progress, enter, local }: { component: ComponentInstance; definition?: ComponentDefinition; progress: number; enter: number; local: number }) {
  const category = definition?.category ?? '字幕花字';
  const title = String(component.props.title ?? definition?.title ?? component.slug);
  const text = String(component.props.text ?? '');
  const value = String(component.props.value ?? '67%');
  const keyword = String(component.props.keyword ?? '');
  const keywordColor = String(component.props.keywordColor ?? component.props.accent ?? '#d9480f');
  const assetUrl = String(component.props.assetUrl ?? '');
  const fontSize = Number(component.props.fontSize ?? 20);

  if (component.slug === 'static-text-block') return <StaticTextPreview component={component} fontSize={fontSize} />;
  if (component.slug === 'typewriter-reveal') return <TypewriterPreview component={component} title={title} text={text} progress={progress} fontSize={fontSize} assetUrl={assetUrl} />;
  if (component.slug === 'highlighter-sweep') return <HighlighterPreview title={title} text={text} progress={progress} fontSize={fontSize} width={Number(component.props.highlightWidth ?? 70)} />;
  if (component.slug === 'hand-drawn-ellipse') return <EllipsePreview title={title} text={text} progress={progress} fontSize={fontSize} ellipseWidth={Number(component.props.ellipseWidth ?? 76)} ellipseHeight={Number(component.props.ellipseHeight ?? 42)} />;
  if (component.slug === 'ink-underline') return <InkUnderlinePreview title={title} text={text} progress={progress} fontSize={fontSize} width={Number(component.props.underlineWidth ?? 68)} />;
  if (component.slug === 'timeline-travel') return <TimelineTravelPreview progress={progress} title={title} assetUrl={assetUrl} />;
  if (component.slug === 'canvas-materialize-moves') return <CanvasMaterializePreview progress={progress} title={title} />;
  if (['step-timeline-vertical', 'numbered-step-stack', 'line-by-line-slide', 'focus-dim-spotlight'].includes(component.slug)) {
    return (
      <ListPreview
        title={title}
        items={itemsFromProps(component.props, text)}
        progress={progress}
        titleFontSize={Number(component.props.titleFontSize ?? fontSize)}
        itemFontSize={Number(component.props.itemFontSize ?? fontSize)}
        itemBackground={String(component.props.itemBackground ?? 'transparent')}
        itemTextColor={String(component.props.itemTextColor ?? component.props.textColor ?? '#111827')}
        titleOffsetX={Number(component.props.titleOffsetX ?? 0)}
        titleOffsetY={Number(component.props.titleOffsetY ?? 0)}
        itemsOffsetX={Number(component.props.itemsOffsetX ?? 0)}
        itemsOffsetY={Number(component.props.itemsOffsetY ?? 0)}
      />
    );
  }
  if (category === '数据信息图') return <DataPreview title={title} text={text} value={value} progress={progress} fontSize={fontSize} />;
  if (category === '强调标注') return <AnnotationPreview title={title} text={text} progress={progress} fontSize={fontSize} />;
  if (component.slug === 'spotlight-hero-card') return <HeroCardPreview title={title} text={text} progress={progress} assetUrl={assetUrl} fontSize={fontSize} />;
  if (category === '素材呈现' || category === '产品镜头') return <MediaPreview title={title} text={text} progress={progress} assetUrl={assetUrl} fontSize={fontSize} />;
  if (category === '转场结构') return <TransitionPreview title={title} progress={progress} />;
  if (category === '人物互动') return <HostPreview title={title} text={text} progress={progress} />;
  if (category === '运镜') return <CameraPreview title={title} text={text} local={local} assetUrl={assetUrl} />;
  return <TextPreview component={component} title={title} text={text} enter={enter} progress={progress} keyword={keyword} keywordColor={keywordColor} fontSize={fontSize} />;
}

function TextPreview({ component, title, text, enter, progress, keyword, keywordColor, fontSize }: { component: ComponentInstance; title: string; text: string; enter: number; progress: number; keyword: string; keywordColor: string; fontSize: number }) {
  return (
    <div className="motion-text" style={{ ...textLayerVars(component.props, fontSize), transform: `translateY(${(1 - enter) * 28}px) scale(${0.96 + enter * 0.04})` } as CSSProperties}>
      <strong>{highlightText(title, keyword, keywordColor)}</strong>
      <span>{highlightText(text, keyword, keywordColor)}</span>
      <i style={{ transform: `scaleX(${clamp(progress * 1.4, 0, 1)})` }} />
    </div>
  );
}

function StaticTextPreview({ component, fontSize }: { component: ComponentInstance; fontSize: number }) {
  const title = String(component.props.title ?? '');
  const text = String(component.props.text ?? '');
  const align = String(component.props.align ?? 'left');
  return (
    <div className={`motion-static-text align-${align}`} style={textLayerVars(component.props, fontSize)}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function TypewriterPreview({ component, title, text, progress, fontSize, assetUrl }: { component: ComponentInstance; title: string; text: string; progress: number; fontSize: number; assetUrl: string }) {
  const shown = text.slice(0, Math.max(1, Math.round(text.length * clamp(progress * 1.8, 0, 1))));
  return (
    <div className={assetUrl ? 'motion-typewriter with-asset' : 'motion-typewriter'} style={textLayerVars(component.props, fontSize)}>
      <div className="type-panel">
        <strong>{title}</strong>
        <pre>{shown}</pre>
      </div>
      {assetUrl ? <img src={assetUrl} alt="" /> : null}
    </div>
  );
}

function HighlighterPreview({ title, text, progress, fontSize, width }: { title: string; text: string; progress: number; fontSize: number; width: number }) {
  const sweep = clamp(progress * 1.6, 0, 1);
  return (
    <div className="motion-mark-preview" style={{ '--motion-font': `${fontSize}px`, '--mark-width': `${clamp(width, 18, 100)}%` } as CSSProperties}>
      <strong>{title}</strong>
      <span>{text}</span>
      <i className="highlighter-line" style={{ transform: `scaleX(${sweep})` }} />
    </div>
  );
}

function EllipsePreview({ title, text, progress, fontSize, ellipseWidth, ellipseHeight }: { title: string; text: string; progress: number; fontSize: number; ellipseWidth: number; ellipseHeight: number }) {
  const draw = clamp(progress * 1.55, 0, 1);
  return (
    <div className="motion-mark-preview" style={{ '--motion-font': `${fontSize}px`, '--ellipse-width': `${clamp(ellipseWidth, 30, 100)}%`, '--ellipse-height': `${clamp(ellipseHeight, 20, 80)}%` } as CSSProperties}>
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

function InkUnderlinePreview({ title, text, progress, fontSize, width }: { title: string; text: string; progress: number; fontSize: number; width: number }) {
  const draw = clamp(progress * 1.7, 0, 1);
  return (
    <div className="motion-mark-preview" style={{ '--motion-font': `${fontSize}px`, '--mark-width': `${clamp(width, 18, 100)}%` } as CSSProperties}>
      <strong>{title}</strong>
      <span>{text}</span>
      <svg className="ink-underline-svg" viewBox="0 0 600 64" aria-hidden="true">
        <path d="M18 36 C110 18, 176 56, 260 34 S452 18, 582 38" style={{ strokeDashoffset: 720 - draw * 720 }} />
      </svg>
    </div>
  );
}

function AnnotationPreview({ title, text, progress, fontSize }: { title: string; text: string; progress: number; fontSize: number }) {
  return (
    <div className="motion-annotation" style={{ '--motion-font': `${fontSize}px` } as CSSProperties}>
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="highlight" style={{ transform: `scaleX(${clamp((progress - 0.16) * 2.2, 0, 1)})` }} />
      <svg viewBox="0 0 300 120" aria-hidden="true">
        <path d="M35 75 C80 18, 224 20, 260 70 C235 112, 65 114, 35 75" style={{ strokeDashoffset: 640 - clamp(progress * 1.8, 0, 1) * 640 }} />
      </svg>
    </div>
  );
}

function DataPreview({ title, text, value, progress, fontSize }: { title: string; text: string; value: string; progress: number; fontSize: number }) {
  const bars = [0.42, 0.68, 0.52, 0.86, 1];
  return (
    <div className="motion-data" style={{ '--motion-font': `${fontSize}px` } as CSSProperties}>
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
  title,
  items,
  progress,
  titleFontSize,
  itemFontSize,
  itemBackground,
  itemTextColor,
  titleOffsetX,
  titleOffsetY,
  itemsOffsetX,
  itemsOffsetY,
}: {
  title: string;
  items: string[];
  progress: number;
  titleFontSize: number;
  itemFontSize: number;
  itemBackground: string;
  itemTextColor: string;
  titleOffsetX: number;
  titleOffsetY: number;
  itemsOffsetX: number;
  itemsOffsetY: number;
}) {
  const visibleItems = items.length ? items : ['项目目标', '开发规则', '验收标准'];
  return (
    <div
      className="motion-list"
      style={{
        '--motion-title-font': `${titleFontSize}px`,
        '--motion-item-font': `${itemFontSize}px`,
        '--motion-item-bg': itemBackground,
        '--motion-item-color': itemTextColor,
        '--list-title-x': `${titleOffsetX}px`,
        '--list-title-y': `${titleOffsetY}px`,
        '--list-items-x': `${itemsOffsetX}px`,
        '--list-items-y': `${itemsOffsetY}px`,
      } as CSSProperties}
    >
      <strong>{title}</strong>
      <div>
        {visibleItems.slice(0, 5).map((item, index) => {
          const reveal = easeOut(clamp((progress - index * 0.14) * 3, 0, 1));
          return (
            <span key={`${item}-${index}`} style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 26}px)` }}>
              <i>{index + 1}</i>
              <b>{item}</b>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function HeroCardPreview({ title, text, progress, assetUrl, fontSize }: { title: string; text: string; progress: number; assetUrl: string; fontSize: number }) {
  const reveal = easeOut(clamp(progress * 1.8, 0, 1));
  return (
    <div className="motion-hero-card" style={{ '--motion-font': `${fontSize}px` } as CSSProperties}>
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

function MediaPreview({ title, text, progress, assetUrl, fontSize }: { title: string; text: string; progress: number; assetUrl: string; fontSize: number }) {
  const reveal = easeOut(clamp(progress * 1.7, 0, 1));
  const scan = clamp((progress - 0.26) * 1.8, 0, 1);
  return (
    <div className="motion-media">
      <div className="media-evidence-card" style={{ '--motion-font': `${fontSize}px`, opacity: reveal, transform: `translateX(${(1 - reveal) * 46}px) scale(${0.95 + reveal * 0.05})` } as CSSProperties}>
        <div className="media-evidence-frame">
          {assetUrl ? <img src={assetUrl} alt="" /> : <div className="asset-missing">待绑定截图 / 视频素材</div>}
          <i style={{ transform: `translateY(${(1 - scan) * -115}%)` }} />
        </div>
        <div className="media-evidence-copy">
          <b>{title}</b>
          <span>{text || (assetUrl ? '已绑定真实素材' : '请在右侧素材地址中绑定截图、录屏或视频')}</span>
        </div>
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

function itemsFromProps(props: Record<string, string | number | boolean>, fallback = '') {
  const fromItems = String(props.items ?? '').trim();
  const numbered = ['item1', 'item2', 'item3', 'item4', 'item5']
    .map((key) => String(props[key] ?? '').trim())
    .filter(Boolean);
  const source = fromItems || fallback;
  const split = source
    .split(/\n|\/|、|，|,|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
  return numbered.length ? numbered : split;
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
    itemBackground: '条目背景',
    itemTextColor: '条目文字色',
    value: '数字/指标',
    label: '标签',
    sourceLabel: '来源标注',
    assetUrl: '截图/素材 URL',
  };
  return labels[key] ?? key;
}

function defaultPropValue(key: string): string | number | boolean {
  if (key.toLowerCase().includes('fontfamily')) return fontFamilyOptions[0].value;
  if (key.toLowerCase().includes('offset')) return 0;
  if (key.toLowerCase().includes('size')) return 20;
  if (key.toLowerCase().includes('width')) return 70;
  if (key.toLowerCase().includes('height')) return 42;
  if (key.toLowerCase().includes('fontweight')) return key === 'textFontWeight' ? 500 : 800;
  if (key === 'titleColor' || key === 'bodyColor') return '#111827';
  if (key === 'background') return 'transparent';
  if (key === 'itemBackground') return 'transparent';
  if (key === 'itemTextColor') return '#111827';
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

function textLayerVars(props: Record<string, string | number | boolean>, baseFontSize: number): CSSProperties {
  const titleSize = Number(props.titleFontSize ?? props.fontSize ?? baseFontSize);
  const bodySize = Number(props.textFontSize ?? props.fontSize ?? baseFontSize);
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
  } as CSSProperties;
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
