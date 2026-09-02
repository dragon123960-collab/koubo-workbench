import type { SfxAsset, SfxCue } from '../types';

export class SfxEngine {
  private context: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loading = new Map<string, Promise<AudioBuffer>>();
  private assets: SfxAsset[];

  constructor(assets: SfxAsset[]) {
    this.assets = assets;
  }

  private getContext() {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }

  async play(cue: Pick<SfxCue, 'assetId' | 'volume' | 'rate' | 'clip'>, masterVolume: number) {
    const asset = this.assets.find((item) => item.id === cue.assetId);
    if (!asset) return () => {};

    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const buffer = await this.load(asset, ctx);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    source.playbackRate.value = Number(cue.rate ?? 1);
    gain.gain.value = Math.max(0, Number(cue.volume ?? 0.35) * masterVolume);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    if (cue.clip && cue.clip > 0) {
      source.stop(ctx.currentTime + cue.clip);
    }
    return () => {
      try {
        source.stop();
      } catch {
        // Already stopped by the scheduled clip.
      }
    };
  }

  private async load(asset: SfxAsset, ctx: AudioContext) {
    const cached = this.buffers.get(asset.id);
    if (cached) return cached;

    const existing = this.loading.get(asset.id);
    if (existing) return existing;

    const promise = fetch(asset.path)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${asset.path}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        this.buffers.set(asset.id, buffer);
        this.loading.delete(asset.id);
        return buffer;
      });

    this.loading.set(asset.id, promise);
    return promise;
  }
}
