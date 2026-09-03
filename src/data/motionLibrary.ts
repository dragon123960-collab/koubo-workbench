import { getComponentGuidance } from './aiGuidance';
import { commonLayerTemplates } from './commonLayers';
import { componentDefinitions } from './generated';
import { shotcraftDefinitions } from './shotcraft';
import type { ComponentDefinition, MotionLibraryItem } from '../types';

export const nativeTemplateLibraryItems: MotionLibraryItem[] = commonLayerTemplates.map((template) => ({
  id: `native-${template.slug}`,
  slug: template.slug,
  title: template.title,
  source: 'native',
  category: '常用组件',
  status: 'native',
  summary: template.summary,
  suitableFor: template.suitableFor,
  editableFields: ['位置', '大小', '子图层文字', '字号', '颜色', '背景', '圆角', 'SFX'],
  favorite: true,
  sfxCueCount: 1,
}));

export function buildMotionLibraryItems(): MotionLibraryItem[] {
  return [
    ...nativeTemplateLibraryItems,
    ...componentDefinitions.map((definition) => definitionToLibraryItem(definition, 'talkcraft')),
    ...shotcraftDefinitions.map((definition) => definitionToLibraryItem(definition, 'shotcraft')),
  ];
}

function definitionToLibraryItem(definition: ComponentDefinition, source: 'talkcraft' | 'shotcraft'): MotionLibraryItem {
  const guidance = getComponentGuidance(definition);
  const previewUrl = typeof definition.defaultProps.previewUrl === 'string'
    ? definition.defaultProps.previewUrl
    : firstPreviewFromStyles(definition.defaultProps.shotcraftStylesJson);
  return {
    id: `${source}-${definition.slug}`,
    slug: definition.slug,
    title: definition.title,
    source,
    category: definition.category,
    status: source === 'shotcraft' ? 'previewOnly' : definition.priority === 'P0' ? 'needsPort' : 'previewOnly',
    summary: definition.summary,
    suitableFor: guidance.sentenceSignals,
    editableFields: guidance.editProps,
    previewUrl,
    referenceUrl: typeof definition.defaultProps.shotcraftSource === 'string' ? definition.defaultProps.shotcraftSource : undefined,
    favorite: false,
    sfxCueCount: definition.defaultSfxCues.length,
  };
}

function firstPreviewFromStyles(raw: unknown) {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  try {
    const parsed = JSON.parse(raw) as { previewUrl?: string }[];
    return parsed.find((item) => item.previewUrl)?.previewUrl;
  } catch {
    return undefined;
  }
}
