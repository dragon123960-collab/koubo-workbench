#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log([
    'Usage:',
    '  node adapters/remotion-shotcraft/prepare-shotcraft-project.mjs <remotion-props.json> <target-remotion-project>',
    '',
    'Example:',
    '  node adapters/remotion-shotcraft/prepare-shotcraft-project.mjs C:\\Users\\dp177\\Downloads\\remotion-props.json D:\\project\\shortvideo\\render',
  ].join('\n'));
}

const [propsPathArg, targetArg] = process.argv.slice(2);
if (!propsPathArg || !targetArg) {
  usage();
  process.exit(1);
}

const propsPath = path.resolve(propsPathArg);
const targetRoot = path.resolve(targetArg);
const props = JSON.parse(fs.readFileSync(propsPath, 'utf8'));
const shotcraftRoot = path.resolve(String(props.shotcraft?.root ?? 'D:/project/video-shotcraft'));
const cards = Array.isArray(props.shotcraft?.cards) ? props.shotcraft.cards : [];

if (!cards.length) {
  console.log('No shotcraft cards found in props.shotcraft.cards.');
  process.exit(0);
}

const srcRoot = path.join(targetRoot, 'src', 'shotcraft');
const publicRoot = path.join(targetRoot, 'public');
const manifestPath = path.join(srcRoot, 'manifest.json');

ensureDir(srcRoot);
ensureDir(publicRoot);

copyIfExists(path.join(shotcraftRoot, 'demos', '_fixtures'), path.join(srcRoot, 'demos', '_fixtures'));
copyIfExists(path.join(shotcraftRoot, 'demos', '_textures'), path.join(srcRoot, 'demos', '_textures'));
copyIfExists(path.join(shotcraftRoot, 'assets', 'lib'), path.join(srcRoot, 'assets', 'lib'));
copyIfExists(path.join(shotcraftRoot, 'assets', 'audio'), path.join(publicRoot, 'shotcraft-audio'));
copyTextures(shotcraftRoot, publicRoot);

const manifestCards = [];
const missing = [];

for (const card of cards) {
  const cardName = String(card.cardName ?? '').trim();
  const category = String(card.category ?? '').trim();
  if (!cardName || !category) {
    missing.push({ card, reason: 'missing cardName/category' });
    continue;
  }

  const sourceDir = path.join(shotcraftRoot, 'demos', category, cardName);
  const targetDir = path.join(srcRoot, 'demos', category, cardName);
  const recipePath = String(card.recipePath ?? '');
  const selectedDemoFile = String(card.selectedDemoFile ?? '');

  if (fs.existsSync(sourceDir)) {
    copyDir(sourceDir, targetDir);
  } else {
    missing.push({ cardName, category, reason: `missing demo dir: ${sourceDir}` });
  }

  manifestCards.push({
    componentId: card.componentId,
    slug: card.slug,
    cardName,
    styleKey: card.styleKey,
    styleLabel: card.styleLabel,
    category,
    recipePath,
    selectedDemoFile,
    nativeDurationFrames: Number(card.nativeDurationFrames ?? 0),
    copiedDemoDir: fs.existsSync(targetDir) ? toPosix(path.relative(targetRoot, targetDir)) : '',
    copiedSelectedDemoFile: copiedDemoPath(targetRoot, srcRoot, selectedDemoFile, shotcraftRoot),
    previewUrl: card.previewUrl,
    renderMode: card.renderMode,
    nativeStatus: card.nativeStatus,
    editableBounds: card.editableBounds,
  });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  propsPath,
  shotcraftRoot,
  targetRoot,
  cards: manifestCards,
  missing,
  notes: [
    'Copy the generated src/shotcraft folder into a Remotion project, or run this script with that project as target.',
    'Register the copied demo components in your Remotion root. See ShotcraftRegistry.example.tsx and ShotcraftLayer.example.tsx.',
    'Some demo files depend on @remotion/motion-blur, three, @react-three/fiber, and @remotion/three. Install them only if the selected demos import them.',
  ],
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(srcRoot, 'ShotcraftRegistry.example.tsx'), registryExample(manifestCards), 'utf8');
fs.writeFileSync(path.join(srcRoot, 'ShotcraftLayer.example.tsx'), layerExample(), 'utf8');
fs.writeFileSync(path.join(srcRoot, 'README.md'), adapterReadme(), 'utf8');

console.log(`Prepared ${manifestCards.length} shotcraft card(s).`);
console.log(`Manifest: ${manifestPath}`);
if (missing.length) {
  console.log(`Missing or recipe-only entries: ${missing.length}`);
}

function copiedDemoPath(targetRootValue, srcRootValue, selectedDemoFile, sourceRoot) {
  if (!selectedDemoFile) return '';
  const relative = path.relative(sourceRoot, selectedDemoFile);
  if (relative.startsWith('..')) return '';
  return toPosix(path.relative(targetRootValue, path.join(srcRootValue, relative)));
}

function copyTextures(sourceRoot, publicRootValue) {
  const textures = path.join(sourceRoot, 'demos', '_textures');
  if (!fs.existsSync(textures)) return;
  copyDir(textures, path.join(publicRootValue, 'textures'));
  copyDir(textures, path.join(publicRootValue, 'textures', 'live'));
}

function copyIfExists(from, to) {
  if (fs.existsSync(from)) copyDir(from, to);
}

function copyDir(from, to) {
  const stat = fs.statSync(from);
  if (!stat.isDirectory()) {
    ensureDir(path.dirname(to));
    fs.copyFileSync(from, to);
    return;
  }
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else if (entry.isFile()) {
      ensureDir(path.dirname(target));
      fs.copyFileSync(source, target);
    }
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function toPosix(value) {
  return value.replace(/\\/g, '/');
}

function registryExample(cardsValue) {
  const imports = [];
  const rows = [];
  const usedNames = new Set();

  for (const card of cardsValue) {
    const file = card.copiedSelectedDemoFile;
    if (!file) continue;
    const importPath = `./${toPosix(path.relative(path.join(targetRoot, 'src', 'shotcraft'), path.join(targetRoot, file))).replace(/\.(tsx|ts)$/, '')}`;
    const baseName = path.basename(file).replace(/\.(tsx|ts)$/, '');
    const componentName = uniqueIdentifier(baseName, usedNames);
    imports.push(`import { ${baseName} as ${componentName} } from '${importPath}';`);
    rows.push(`  '${card.componentId}': ${componentName},`);
  }

  return `${imports.join('\n')}

export const shotcraftRegistry = {
${rows.join('\n')}
};

export function getShotcraftComponent(componentId: string) {
  return shotcraftRegistry[componentId as keyof typeof shotcraftRegistry];
}
`;
}

function layerExample() {
  return `import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import manifest from './manifest.json';
import { getShotcraftComponent } from './ShotcraftRegistry.example';

type WorkbenchComponent = {
  id: string;
  startSec: number;
  durationSec: number;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  renderer?: {
    kind: 'video-shotcraft-native';
    componentId: string;
    nativeDurationFrames?: number;
  };
};

export function ShotcraftLayer({ component }: { component: WorkbenchComponent }) {
  const { fps } = useVideoConfig();
  if (component.renderer?.kind !== 'video-shotcraft-native') return null;
  const NativeComponent = getShotcraftComponent(component.renderer.componentId);
  if (!NativeComponent) return null;

  const from = Math.round(component.startSec * fps);
  const durationInFrames = Math.max(1, Math.round(component.durationSec * fps));
  const scaleX = component.w / 1920;
  const scaleY = component.h / 1080;

  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      <AbsoluteFill style={{ zIndex: component.z, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: component.x,
            top: component.y,
            width: component.w,
            height: component.h,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 1920,
              height: 1080,
              transform: \`scale(\${scaleX}, \${scaleY})\`,
              transformOrigin: 'top left',
            }}
          >
            <NativeComponent />
          </div>
        </div>
      </AbsoluteFill>
    </Sequence>
  );
}

export const shotcraftManifest = manifest;
`;
}

function uniqueIdentifier(name, used) {
  const clean = name.replace(/[^a-zA-Z0-9_$]/g, '') || 'ShotcraftComponent';
  let next = clean;
  let index = 2;
  while (used.has(next)) {
    next = `${clean}${index}`;
    index += 1;
  }
  used.add(next);
  return next;
}

function adapterReadme() {
  return `# Shotcraft Adapter Output

This folder was generated by Koubo Workbench's remotion-shotcraft adapter.

It copies the selected video-shotcraft demo source files and shared dependencies needed by the exported project JSON. The workbench preview is only an editing proxy; final render should use these native Remotion demo components.

Next steps:

1. Install Remotion dependencies in the target render project.
2. Check \`manifest.json\` for \`selectedDemoFile\` and \`nativeStatus\`.
3. Use \`ShotcraftRegistry.example.tsx\` and \`ShotcraftLayer.example.tsx\` as the starting point for registering copied demo components.
4. Map each workbench component's \`renderer.componentId\` to the copied component and place it at \`editableBounds\`.
5. For exact timing, render Shotcraft cards at their \`nativeDurationFrames\` when possible, or intentionally time-stretch the clip in a controlled wrapper.
6. Replace placeholder textures or demo copy with your real product screenshots where the selected card requires assets.
`;
}
