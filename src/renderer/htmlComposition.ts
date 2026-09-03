import type { Layer, RichTextLine, RichTextSpan, ShotBackgroundStyle, WorkbenchProject } from '../types';

export function exportHyperframesHtml(project: WorkbenchProject) {
  const duration = Math.max(
    1,
    ...project.shots.map((shot) => shot.startSec + shot.durationSec),
    ...project.layers.map((layer) => layer.startSec + layer.durationSec),
    ...project.components.map((component) => component.startSec + component.durationSec),
    ...(project.media?.tracks ?? []).map((track) => track.startSec + track.durationSec),
  );
  const background = project.design.useGlobalBackground ? project.design.backgroundStyle : project.shots[0]?.backgroundStyle;
  const cues = [
    ...project.layers.flatMap((layer) =>
      layer.sfxEnabled
        ? (layer.sfxCues ?? []).map((cue) => ({ ...cue, absoluteSec: Number((layer.startSec + cue.t).toFixed(3)) }))
        : [],
    ),
    ...project.components.flatMap((component) =>
      component.sfxEnabled
        ? component.sfxCues.map((cue) => ({ ...cue, absoluteSec: Number((component.startSec + cue.t).toFixed(3)) }))
        : [],
    ),
  ];

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(project.meta.name)} · HyperFrames</title>
</head>
<body>
  <div
    id="koubo-composition"
    data-composition-id="koubo-composition"
    data-start="0"
    data-duration="${duration.toFixed(3)}"
    data-width="1920"
    data-height="1080"
  >
    <div class="hf-bg" style="${backgroundStyle(background)}"></div>
    ${cornerBugHtml(project)}
    ${project.media.tracks.map((track, index) => mediaTrackHtml(project, track, index)).join('\n    ')}
    ${project.layers.map((layer, index) => layerHtml(layer, index)).join('\n    ')}
    ${project.subtitles.enabled ? subtitleHtml(project) : ''}
    ${project.voice.src ? `<audio id="voiceover" src="${escapeAttr(project.voice.src)}"></audio>` : ''}
    ${cues.map((cue, cueIndex) => `<audio id="sfx-${cueIndex + 1}" data-cue="${cue.absoluteSec}" data-volume="${cue.volume}" src="${escapeAttr(assetPath(project, cue.assetId))}"></audio>`).join('\n    ')}
  </div>
  <style>
    html, body { margin: 0; width: 100%; height: 100%; background: #000; }
    #koubo-composition { position: relative; width: 1920px; height: 1080px; overflow: hidden; font-family: ${cssValue(project.design.theme.fontFamily || 'Inter, system-ui, sans-serif')}; color: ${cssValue(project.design.theme.textColor)}; }
    .hf-bg { position: absolute; inset: 0; }
    .clip { position: absolute; overflow: hidden; }
    .hf-layer { position: absolute; inset: 0; box-sizing: border-box; overflow: hidden; transform-origin: center; border: 0 solid transparent; }
    .hf-child { position: absolute; box-sizing: border-box; overflow: hidden; display: grid; align-items: center; line-height: 1.12; overflow-wrap: anywhere; white-space: normal; border: 0 solid transparent; }
    .hf-text { padding: var(--pad, 0); }
    .hf-rich-text { align-content: center; }
    .hf-rich-lines { display: grid; width: 100%; gap: .08em; }
    .hf-rich-line { display: block; line-height: 1.06; }
    .hf-rich-line.align-center { text-align: center; }
    .hf-rich-line.align-right { text-align: right; }
    .hf-rich-line span { display: inline; padding: 0 .03em; border-radius: .18em; }
    .hf-media, .hf-media img, .hf-media video { width: 100%; height: 100%; object-fit: var(--media-fit, cover); display: block; }
    .hf-shape.line { height: var(--line-height, 8px); background: var(--line-color, currentColor); transform-origin: left center; }
    .hf-shape.rect, .hf-shape.pill, .hf-shape.circle { background: currentColor; }
    .hf-shape.pill, .hf-shape.circle { border-radius: 999px; }
    .hf-corner { position: absolute; z-index: 50; display: grid; gap: 4px; max-width: 520px; padding: 12px 16px; border-radius: 8px; border-left: 5px solid ${cssValue(project.design.cornerBug.accent)}; box-shadow: 0 14px 34px rgba(15,23,42,.12); }
    .hf-corner strong { font-size: ${project.design.cornerBug.fontSize}px; line-height: 1.08; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hf-corner span { font-size: ${Math.round(project.design.cornerBug.fontSize * 0.48)}px; font-weight: 800; opacity: .76; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hf-subtitles { position: absolute; left: 9%; right: 9%; bottom: 8%; z-index: 60; display: flex; flex-wrap: wrap; justify-content: center; gap: 0 .08em; padding: .28em .55em .34em; color: ${cssValue(project.subtitles.textColor)}; background: ${subtitleBackground(project)}; border-radius: 8px; font-size: ${project.subtitles.fontSize}px; font-weight: 900; line-height: 1.36; text-align: center; text-shadow: 0 2px 5px rgba(0,0,0,.55); }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    document.querySelectorAll('.clip').forEach((clip) => {
      const start = Number(clip.dataset.start || 0);
      const duration = Number(clip.dataset.duration || 1);
      const el = clip.querySelector('.hf-layer');
      if (!el) return;
      const motion = el.dataset.motion || 'fade-up';
      tl.set(el, { autoAlpha: 0 }, Math.max(0, start - 0.001));
      if (motion === 'none') {
        tl.set(el, { autoAlpha: 1 }, start);
      } else if (motion === 'pop') {
        tl.fromTo(el, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'back.out(1.6)' }, start);
      } else if (motion === 'strike') {
        tl.fromTo(el, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power3.out' }, start);
        const line = el.querySelector('.hf-shape.line');
        if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.36, ease: 'power2.out' }, start + 0.12);
      } else {
        tl.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }, start);
      }
      el.querySelectorAll('[data-stagger]').forEach((child, index) => {
        tl.fromTo(child, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power3.out' }, start + index * 0.08);
      });
      tl.set(el, { autoAlpha: 0 }, start + duration);
    });
    window.__timelines['koubo-composition'] = tl;
  </script>
</body>
</html>`;
}

function layerHtml(layer: Layer, index: number): string {
  const children = layer.kind === 'group'
    ? (layer.children ?? []).map((child, childIndex) => childHtml(child, layer, childIndex)).join('\n      ')
    : childHtml(layer, layer, 0);
  return `<section id="${escapeAttr(layer.id)}-clip" class="clip" data-start="${layer.startSec}" data-duration="${layer.durationSec}" data-track-index="${20 + index}" style="${rectStyle(layer.x, layer.y, layer.w, layer.h, layer.z)}">\n      <div id="${escapeAttr(layer.id)}" class="hf-layer" data-motion="${layer.motion}" style="${styleText(layer.style, layer.opacity)}">\n        ${children}\n      </div>\n    </section>`;
}

function childHtml(layer: Layer, parent: Layer, _index: number): string {
  const style = childRectStyle(layer, parent) + styleText(layer.style, layer.opacity);
  const stagger = parent.motion === 'list-stagger' || parent.motion === 'roadmap-travel' ? ' data-stagger="true"' : '';
  if (layer.kind === 'text') {
    const richClass = layer.richText?.length ? ' hf-rich-text' : '';
    const content = layer.richText?.length ? richTextHtml(layer.richText) : escapeHtml(layer.text ?? '');
    return `<div class="hf-child hf-text${richClass}"${stagger} style="${style}">${content}</div>`;
  }
  if (layer.kind === 'image') return `<div class="hf-child hf-media"${stagger} style="${style}">${layer.src ? `<img src="${escapeAttr(layer.src)}" alt="">` : '替换素材'}</div>`;
  if (layer.kind === 'video') return `<div class="hf-child hf-media"${stagger} style="${style}"><video src="${escapeAttr(layer.src ?? '')}"></video></div>`;
  if (layer.kind === 'shape') return `<div class="hf-child hf-shape ${escapeAttr(layer.shape ?? 'rect')}"${stagger} style="${style}; --line-color:${cssValue(layer.style.lineColor ?? layer.style.color ?? '#111827')}; --line-height:${Math.max(2, layer.h)}px;"></div>`;
  return `<div class="hf-child"${stagger} style="${style}"></div>`;
}

function richTextHtml(lines: RichTextLine[]) {
  return `<div class="hf-rich-lines">${lines.map((line) => (
    `<div class="hf-rich-line align-${escapeAttr(line.align ?? 'left')}">${line.spans.map(spanHtml).join('')}</div>`
  )).join('')}</div>`;
}

function spanHtml(span: RichTextSpan) {
  const style = [
    span.color ? `color:${cssValue(span.color)}` : '',
    span.background ? `background:${cssValue(span.background)}` : '',
    typeof span.fontSize === 'number' ? `font-size:${span.fontSize}px` : '',
    typeof span.fontWeight === 'number' ? `font-weight:${span.fontWeight}` : '',
  ].filter(Boolean).join(';');
  return `<span style="${style}">${escapeHtml(span.text)}</span>`;
}

function mediaTrackHtml(project: WorkbenchProject, track: WorkbenchProject['media']['tracks'][number], index: number) {
  const source = project.media.sources.find((item) => item.id === track.sourceId);
  if (!source) return '';
  const style = `border-radius:${track.radius}px; opacity:${track.opacity};`;
  const content = source.type === 'image'
    ? `<img src="${escapeAttr(source.src)}" alt="">`
    : `<video src="${escapeAttr(source.src)}"></video>`;
  return `<section class="clip" data-start="${track.startSec}" data-duration="${track.durationSec}" data-track-index="${5 + index}" style="${rectStyle(track.x, track.y, track.w, track.h, track.z)}"><div class="hf-layer hf-media" data-motion="media-zoom" style="${style}">${content}</div></section>`;
}

function cornerBugHtml(project: WorkbenchProject) {
  const bug = project.design.cornerBug;
  if (!bug.enabled) return '';
  const left = bug.position === 'topLeft' ? bug.x : 1920 - bug.x - 520;
  const style = `left:${left}px; top:${bug.y}px; color:${cssValue(bug.textColor)}; background:${cssValue(bug.background)}; opacity:${bug.opacity};`;
  return `<div class="hf-corner" style="${style}"><strong>${escapeHtml(bug.title)}</strong><span>${escapeHtml(bug.subtitle)}</span></div>`;
}

function subtitleHtml(project: WorkbenchProject) {
  const text = project.script.map((line) => line.text).join(' ');
  return `<div class="hf-subtitles">${escapeHtml(text)}</div>`;
}

function backgroundStyle(style?: ShotBackgroundStyle) {
  if (!style) return '';
  if (style.type === 'solid') return `background:${cssValue(style.color)};`;
  if (style.type === 'image' && style.imageUrl) return `background-image:url('${escapeAttr(style.imageUrl)}'); background-size:cover; background-position:center;`;
  if (style.type === 'darkGrid') return 'background:linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px), radial-gradient(circle at 70% 18%, rgba(201,103,82,.22), transparent 30%), #111827; background-size:48px 48px,48px 48px,auto,auto;';
  return `background:linear-gradient(rgba(35,100,170,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(35,100,170,.08) 1px, transparent 1px), radial-gradient(circle at 70% 18%, rgba(201,103,82,.16), transparent 30%), ${cssValue(style.color)}; background-size:48px 48px,48px 48px,auto,auto;`;
}

function rectStyle(x: number, y: number, w: number, h: number, z: number) {
  return `left:${x}px; top:${y}px; width:${w}px; height:${h}px; z-index:${z};`;
}

function childRectStyle(layer: Layer, parent: Layer) {
  if (layer === parent) return 'left:0; top:0; width:100%; height:100%;';
  return `left:${layer.x}px; top:${layer.y}px; width:${layer.w}px; height:${layer.h}px;`;
}

function styleText(style: Layer['style'], opacity = 1) {
  return [
    style.color ? `color:${cssValue(style.color)}` : '',
    style.background ? `background:${cssValue(style.background)}` : '',
    style.borderColor ? `border-color:${cssValue(style.borderColor)}` : '',
    typeof style.borderWidth === 'number' ? `border-width:${style.borderWidth}px` : '',
    style.borderStyle ? `border-style:${style.borderStyle}` : '',
    typeof style.radius === 'number' ? `border-radius:${style.radius}px` : '',
    typeof style.padding === 'number' ? `--pad:${style.padding}px` : '',
    typeof style.fontSize === 'number' ? `font-size:${style.fontSize}px` : '',
    style.fontFamily ? `font-family:${cssValue(style.fontFamily)}` : '',
    typeof style.fontWeight === 'number' ? `font-weight:${style.fontWeight}` : '',
    style.align ? `text-align:${style.align}; justify-content:${style.align === 'center' ? 'center' : style.align === 'right' ? 'end' : 'start'}` : '',
    style.boxShadow ? `box-shadow:${cssValue(style.boxShadow)}` : '',
    style.textShadow ? `text-shadow:${cssValue(style.textShadow)}` : '',
    style.backdropFilter ? `backdrop-filter:${cssValue(style.backdropFilter)}` : '',
    style.objectFit ? `--media-fit:${cssValue(style.objectFit)}` : '',
    `opacity:${opacity}`,
  ].filter(Boolean).join(';');
}

function subtitleBackground(project: WorkbenchProject) {
  if (project.subtitles.shape === 'solid') return cssValue(project.subtitles.background);
  return `linear-gradient(90deg, transparent 0%, ${cssValue(project.subtitles.background)} 22%, ${cssValue(project.subtitles.background)} 78%, transparent 100%)`;
}

function assetPath(project: WorkbenchProject, assetId: string) {
  return `${project.assets.sfxRoot}/${assetId}.mp3`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function cssValue(value: string) {
  return String(value || '').replace(/[;"<>]/g, '');
}
