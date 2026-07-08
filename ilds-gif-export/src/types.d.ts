// Injected by build.mjs (esbuild define) so the UI can show which build is live.
declare const __PLUGIN_VERSION__: string;
declare const __BUILD_TIME__: string;

// gifenc ships no type declarations. Minimal surface we use.
declare module 'gifenc' {
  export interface Encoder {
    writeFrame(
      index: Uint8Array | number[],
      width: number,
      height: number,
      opts?: {
        palette?: number[][];
        delay?: number;
        transparent?: boolean;
        transparentIndex?: number;
        repeat?: number;
        first?: boolean;
        dispose?: number;
        colorDepth?: number;
      }
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  }
  export function GIFEncoder(): Encoder;
  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    opts?: { format?: string; oklab?: boolean; clearAlpha?: boolean; oneBitAlpha?: boolean; clearAlphaColor?: number; clearAlphaThreshold?: number; useSqrt?: boolean }
  ): number[][];
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: string
  ): Uint8Array;
  export function nearestColorIndex(palette: number[][], pixel: number[]): number;
}
