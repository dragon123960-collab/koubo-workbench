# AGENTS.md

This repository is both the source for Koubo Motion Workbench and the local control point for future short-video production. Treat this file as the first project instruction when an agent works here.

## Two Work Modes

1. Workbench development

   Use this mode when changing the React/Vite/TypeScript app, component metadata, SFX library, import/export logic, timeline, stage editing, or README.

2. Short-video production

   Use this mode when planning a new episode, writing narration, arranging voice timing, preparing screenshots/recordings, generating a workbench project JSON, or handing data to Remotion.

If a request touches both, finish the workbench/tooling change first, then generate or update the episode files.

## Workbench Development Rules

- Main app path: `D:\project\agent\koubo-workbench`.
- The editor stage must represent the final canvas. Internal layout is always `1920x1080`; the browser only scales the stage visually.
- Do not make users rely on a separate export preview to discover wrapping, overlap, or layout shifts.
- Components should default to transparent backgrounds unless a component's purpose requires a visible surface.
- Prefer flexible component props over hard-coded visuals. Large compound components should evolve toward grouped layers: group-level drag/resize, child-level text/style/offset editing.
- For list components, keep title and item styling independent. Do not couple title font/position changes to item font/position changes.
- Media tracks must be editable like components: selectable from stage or timeline, draggable, resizable, shape-configurable, deletable, and exportable.
- SFX cues must remain attached to component instances and export as Remotion-consumable data.
- Never store private TTS keys, cloned voice IDs, private voice files, raw recordings, or generated video exports in committed source.

Before finishing a workbench change, run:

```powershell
npm run build
npm run lint
```

## Short-Video Production Flow

For future episodes, do not start by manually adding components one by one in the UI. The preferred pipeline is:

1. Select the topic.
2. Verify current facts, source pages, licensing, and useful real evidence.
3. Write the Chinese narration script in short sentences.
4. Generate the voiceover externally, such as MiniMax with the user's cloned voice.
5. Use Whisper, faster-whisper, or another aligner to convert the final voiceover into a JSON with sentence and character timings.
6. Generate a complete `WorkbenchProject` JSON from the script, timing JSON, evidence assets, media tracks, component choices, subtitles, and SFX cues.
7. Import that JSON into the workbench.
8. Human-edit only the parts that need taste and precision: positions, sizes, text variants, colors, cue volumes, and exact timing.
9. Export `remotion-props.json` and `shotbook.md`.
10. Let the downstream Remotion project render and QA the final video.

The workbench JSON should already be close to the intended video. A user should not need to build the whole video from an empty canvas.

## Required Video Skills And References

When making a new AI/open-source explainer episode in this repository, use these local skills and rules in this order:

1. `open-source-video-pipeline`
2. `video-talkcraft`
3. `video-shotcraft`

Before topic selection, scripting, evidence capture, cover work, or rendering, read:

- `D:\project\demo\video\README.md`
- `D:\project\demo\video\VIDEO_ENTRY_RULES.md`
- The relevant `D:\project\demo\video\workflow\*.md` files
- `D:\project\demo\video\motion\MOTION_CATALOG.md`
- `D:\project\demo\video\motion\combinations.md`
- `D:\project\demo\video\motion\VIDEO_SHOTCRAFT_BRIDGE.md`
- `D:\project\demo\video\audio\AUDIO_CATALOG.md`

For reusable prompt and cover rules, follow:

- `C:\Users\dp177\.codex\skills\open-source-video-pipeline\references\prompt-contracts.md`
- `C:\Users\dp177\.codex\skills\open-source-video-pipeline\references\cover-system.md`

## Episode Folder Convention

Use one folder per episode. A recommended local shape is:

```text
episodes/YYYY-MM-DD-topic-slug/
  production-manifest.md
  sources.md
  script/
    narration.md
    narration.json
    voice-timing.json
    build-workbench-project.mjs
  evidence/
    screenshots/
    recordings/
  video/
    workbench-project.json
    remotion-props.json
    shotbook.md
  cover/
    cover-brief.md
    horizontal.png
    vertical.png
```

Keep heavy or private media local unless the user explicitly asks to publish it and has confirmed rights.

## Evidence And Media Rules

- Use real screenshots or recordings for repositories, product pages, stars, documentation, UI, code output, and user-visible results.
- Do not mock a real website or project UI when a real screenshot can be captured.
- If a shot needs a screenshot and the agent cannot capture it, state exactly what the user should screenshot and where it should be placed.
- Generated images are allowed for abstract support visuals and reusable cover backgrounds, not as proof of a repository, product interface, star count, or result.
- Record exact source URLs and capture dates in `sources.md`.

## Voice, Subtitles, And Timing

- Voice generation is an external input. This project should not encode MiniMax credentials or private voice IDs.
- The final narration text must match the voiceover used for timing.
- Character timing JSON drives subtitles, keyword highlights, and word-anchored effects.
- Prefer bottom subtitles with configurable background, shape, opacity, keyword color, and safe-area placement.
- If the voiceover changes, regenerate timing JSON and rebuild the workbench project JSON before fine editing.

## Covers

- Use the shared cover system. The persistent background should come first, then topic-specific title and evidence overlays.
- Do not ask image generation to render Chinese title text. Add readable cover text later as layout layers.
- Horizontal and vertical covers are separate layouts, not one automatic crop.

## Export Contract

The workbench export must keep:

- Script and sentence timing.
- Character timing where available.
- Shot timeline with absolute seconds.
- Component instances with slug, props, position, size, timing, layer, and SFX cues.
- Media sources and media tracks.
- Subtitle settings.
- SFX asset references and cue data.

Downstream Remotion code should be able to consume `remotion-props.json` without guessing missing structure.

## Git And Publishing

- Keep commits focused.
- Run build and lint before committing workbench changes.
- The public GitHub remote should be:

```powershell
git remote set-url origin https://github.com/dragon123960-collab/koubo-workbench.git
```

- If `git push` reports `Recv failure: Connection was reset`, first verify the remote URL. If the URL is correct, retry on a stable network or switch to SSH/GitHub Desktop; this is a connection failure, not a code or branch problem.
