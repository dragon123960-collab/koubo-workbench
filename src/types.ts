export type MotionCategory =
  | '字幕花字'
  | '强调标注'
  | '数据信息图'
  | '素材呈现'
  | '转场结构'
  | '人物互动'
  | '运镜'
  | '产品镜头';

export type ScriptSentence = {
  id: string;
  text: string;
  startSec?: number;
  endSec?: number;
  chars?: { ch: string; t: number; e: number }[];
};

export type ShotBackgroundStyle = {
  type: 'lightGrid' | 'darkGrid' | 'solid' | 'image';
  color: string;
  imageUrl: string;
};

export type CornerBugSettings = {
  enabled: boolean;
  position: 'topLeft' | 'topRight';
  title: string;
  subtitle: string;
  textColor: string;
  background: string;
  accent: string;
  opacity: number;
  fontSize: number;
  x: number;
  y: number;
};

export type GlobalStyleSettings = {
  useGlobalBackground: boolean;
  backgroundStyle: ShotBackgroundStyle;
  cornerBug: CornerBugSettings;
};

export type Shot = {
  id: string;
  title: string;
  sentenceIds: string[];
  startSec: number;
  durationSec: number;
  lead: number;
  tail: number;
  background: string;
  backgroundStyle: ShotBackgroundStyle;
  cameraPath: { t: number; scale?: number; x?: number; y?: number; blur?: number; rot?: number }[];
};

export type SfxCue = {
  id: string;
  componentId: string;
  t: number;
  assetId: string;
  volume: number;
  rate?: number;
  clip?: number;
  note?: string;
};

export type SfxAsset = {
  id: string;
  category: string;
  name: string;
  path: string;
  duration?: number;
  license?: string;
  recommendedUse?: string;
};

export type VoiceTrack = {
  src: string;
  durationSec?: number;
  timestampMode: 'estimated' | 'imported';
  notes?: string;
};

export type MediaSource = {
  id: string;
  name: string;
  type: 'hostVideo' | 'demoVideo' | 'screenRecording' | 'image';
  src: string;
};

export type MediaLayout = 'full' | 'circlePip' | 'splitLeft' | 'splitRight';

export type MediaTrack = {
  id: string;
  sourceId: string;
  startSec: number;
  durationSec: number;
  layout: MediaLayout;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  radius: number;
  opacity: number;
};

export type SubtitleSettings = {
  enabled: boolean;
  position: 'top' | 'middle' | 'bottom';
  shape: 'edgeFade' | 'solid';
  textColor: string;
  keywordColor: string;
  background: string;
  keywords: string;
  fontSize: number;
};

export type ComponentDefinition = {
  slug: string;
  title: string;
  category: MotionCategory;
  priority: 'P0' | 'P1';
  summary: string;
  defaultProps: Record<string, string | number | boolean>;
  defaultTiming: { enter: number; hold: number; exit: number };
  defaultSize: { w: number; h: number };
  defaultSfxCues: SfxCue[];
};

export type ComponentInstance = {
  id: string;
  slug: string;
  shotId: string;
  startSec: number;
  durationSec: number;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  props: Record<string, string | number | boolean>;
  enter: number;
  hold: number;
  exit: number;
  sfxEnabled: boolean;
  sfxCues: SfxCue[];
};

export type WorkbenchProject = {
  meta: {
    name: string;
    createdAt: string;
    updatedAt: string;
    fps: number;
  };
  format: {
    width: 1920;
    height: 1080;
    aspect: '16:9';
  };
  script: ScriptSentence[];
  shots: Shot[];
  components: ComponentInstance[];
  design: GlobalStyleSettings;
  voice: VoiceTrack;
  media: {
    sources: MediaSource[];
    tracks: MediaTrack[];
  };
  subtitles: SubtitleSettings;
  assets: {
    sfxRoot: string;
  };
  sfx: {
    enabled: boolean;
    masterVolume: number;
  };
};
