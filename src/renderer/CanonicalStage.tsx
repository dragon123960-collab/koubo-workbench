import type { CSSProperties, PointerEvent } from 'react';
import { Maximize2, Trash2 } from 'lucide-react';
import type { Layer, RichTextLine, RichTextSpan } from '../types';

const STAGE_W = 1920;
const STAGE_H = 1080;

export function CanonicalLayer({
  layer,
  currentTime,
  selected,
  readOnly = false,
  onSelect,
  onDelete,
  onMoveStart,
  onResizeStart,
}: {
  layer: Layer;
  currentTime: number;
  selected: boolean;
  readOnly?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveStart: (event: PointerEvent) => void;
  onResizeStart: (event: PointerEvent) => void;
}) {
  const local = Math.max(0, Math.min(layer.durationSec, currentTime - layer.startSec));
  const progress = layer.durationSec <= 0 ? 1 : local / layer.durationSec;
  const opacity = layer.opacity * motionOpacity(layer.motion, progress);
  const style = {
    left: `${(layer.x / STAGE_W) * 100}%`,
    top: `${(layer.y / STAGE_H) * 100}%`,
    width: `${(layer.w / STAGE_W) * 100}%`,
    height: `${(layer.h / STAGE_H) * 100}%`,
    zIndex: layer.z,
    opacity,
    '--layer-progress': progress,
    '--layer-enter': enterProgress(progress),
  } as CSSProperties;

  return (
    <div
      className={`canonical-layer-host motion-${layer.motion}${selected ? ' selected' : ''}`}
      style={style}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (readOnly) return;
        onSelect();
        onMoveStart(event);
      }}
    >
      <LayerContent layer={layer} progress={progress} />
      {selected && !readOnly ? (
        <button
          type="button"
          className="delete-handle"
          title="删除图层组"
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
        <button type="button" className="resize-handle" title="缩放图层组" onPointerDown={onResizeStart}>
          <Maximize2 size={14} />
        </button>
      ) : null}
    </div>
  );
}

function LayerContent({ layer, progress }: { layer: Layer; progress: number }) {
  if (layer.kind === 'group') {
    return (
      <div className="canonical-group" style={layerVars(layer)}>
        {layer.children?.map((child, index) => (
          <ChildLayer key={child.id} layer={child} index={index} parent={layer} progress={progress} />
        ))}
      </div>
    );
  }
  return <ChildLayer layer={layer} index={0} parent={layer} progress={progress} />;
}

function ChildLayer({ layer, parent, index, progress }: { layer: Layer; parent: Layer; index: number; progress: number }) {
  const stagger = layerVisibleProgress(parent.motion, progress, index);
  const style = {
    left: `${(layer.x / parent.w) * 100}%`,
    top: `${(layer.y / parent.h) * 100}%`,
    width: `${(layer.w / parent.w) * 100}%`,
    height: `${(layer.h / parent.h) * 100}%`,
    zIndex: layer.z,
    opacity: layer.opacity * stagger,
    ...layerVars(layer),
  } as CSSProperties;
  const variantClass = layer.style.variant ? ` variant-${layer.style.variant}` : '';

  if (layer.kind === 'text') {
    return (
      <div className={`canonical-child canonical-text${layer.richText?.length ? ' canonical-rich-text' : ''}${variantClass}`} style={style}>
        {layer.richText?.length ? <RichText lines={layer.richText} /> : layer.text}
      </div>
    );
  }

  if (layer.kind === 'shape') {
    return <div className={`canonical-child canonical-shape shape-${layer.shape ?? 'rect'}${variantClass}`} style={style} />;
  }

  if (layer.kind === 'video') {
    return (
      <video className={`canonical-child canonical-media${variantClass}`} style={style} src={layer.src} muted autoPlay loop playsInline />
    );
  }

  if (layer.kind === 'image') {
    return (
      <div className={`canonical-child canonical-media-wrap${variantClass}`} style={style}>
        {layer.src ? <img src={layer.src} alt="" /> : <span>替换素材</span>}
      </div>
    );
  }

  return <div className="canonical-child" style={style} />;
}

function RichText({ lines }: { lines: RichTextLine[] }) {
  return (
    <div className="rich-text-lines">
      {lines.map((line) => (
        <div key={line.id} className={`rich-text-line align-${line.align ?? 'left'}`}>
          {line.spans.map((span, index) => (
            <span key={`${line.id}-${index}`} style={spanStyle(span)}>
              {span.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function spanStyle(span: RichTextSpan): CSSProperties {
  return {
    color: span.color,
    background: span.background,
    fontSize: span.fontSize,
    fontWeight: span.fontWeight,
  };
}

function layerVars(layer: Layer): CSSProperties {
  const style = layer.style;
  return {
    color: style.color,
    background: style.background,
    borderColor: style.borderColor,
    borderWidth: typeof style.borderWidth === 'number' ? style.borderWidth : undefined,
    borderStyle: style.borderStyle,
    borderRadius: style.radius,
    padding: style.padding,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    textAlign: style.align,
    boxShadow: style.boxShadow,
    textShadow: style.textShadow,
    backdropFilter: style.backdropFilter,
    objectFit: style.objectFit,
    '--layer-line-color': style.lineColor ?? style.borderColor ?? style.color,
    '--media-fit': style.objectFit ?? 'cover',
  } as CSSProperties;
}

function layerVisibleProgress(motion: Layer['motion'], progress: number, index: number) {
  if (motion !== 'list-stagger' && motion !== 'roadmap-travel') return 1;
  const step = Math.max(0, progress - index * 0.08);
  return Math.max(0, Math.min(1, step * 4));
}

function motionOpacity(motion: Layer['motion'], progress: number) {
  if (motion === 'none') return 1;
  return enterProgress(progress);
}

function enterProgress(progress: number) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, progress * 4)), 3);
}
