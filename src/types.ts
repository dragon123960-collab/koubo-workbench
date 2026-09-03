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

export type ComponentThemeSettings = {
  accent: string;
  titleColor: string;
  bodyColor: string;
  textColor: string;
  keywordColor: string;
  lineColor: string;
  componentBackground: string;
  itemBackground: string;
  itemTextColor: string;
};

export type DesignThemeSettings = {
  name: string;
  fontFamily: string;
  accent: string;
  secondaryAccent: string;
  textColor: string;
  mutedTextColor: string;
  surfaceColor: string;
  transparentSurface: boolean;
  lineColor: string;
};

export type GlobalStyleSettings = {
  useGlobalBackground: boolean;
  backgroundStyle: ShotBackgroundStyle;
  cornerBug: CornerBugSettings;
  componentTheme: ComponentThemeSettings;
  theme: DesignThemeSettings;
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
  transitionSec?: number;
  transitionFrom?: {
    x: number;
    y: number;
    w: number;
    h: number;
    radius: number;
    opacity: number;
  };
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

export type LayerKind = 'text' | 'shape' | 'image' | 'video' | 'group' | 'sfxCue';

export type LayerMotionPreset =
  | 'none'
  | 'fade-up'
  | 'pop'
  | 'line-reveal'
  | 'list-stagger'
  | 'roadmap-travel'
  | 'media-zoom'
  | 'strike';

export type RichTextSpan = {
  text: string;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  background?: string;
};

export type RichTextLine = {
  id: string;
  spans: RichTextSpan[];
  align?: 'left' | 'center' | 'right';
};

export type LayerStyle = {
  color?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'none';
  lineColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  radius?: number;
  padding?: number;
  align?: 'left' | 'center' | 'right';
  opacity?: number;
  boxShadow?: string;
  textShadow?: string;
  backdropFilter?: string;
  objectFit?: 'cover' | 'contain';
  variant?: string;
};

export type Layer = {
  id: string;
  kind: LayerKind;
  name: string;
  templateSlug?: string;
  shotId: string;
  startSec: number;
  durationSec: number;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  opacity: number;
  motion: LayerMotionPreset;
  style: LayerStyle;
  text?: string;
  richText?: RichTextLine[];
  src?: string;
  shape?: 'rect' | 'circle' | 'pill' | 'line';
  children?: Layer[];
  sfxEnabled?: boolean;
  sfxCues?: SfxCue[];
};

export type LayerGroup = Layer & {
  kind: 'group';
  children: Layer[];
};

export type MotionLibraryItem = {
  id: string;
  slug: string;
  title: string;
  source: 'talkcraft' | 'shotcraft' | 'custom' | 'native';
  category: MotionCategory | '常用组件';
  status: 'native' | 'previewOnly' | 'needsPort';
  summary: string;
  suitableFor: string[];
  editableFields: string[];
  previewUrl?: string;
  referenceUrl?: string;
  favorite?: boolean;
  sfxCueCount: number;
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
  layers: Layer[];
  motionLibrary: MotionLibraryItem[];
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
