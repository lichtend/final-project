import { IDisposable } from '@phosphor/disposable';
/**
 * A thin caching wrapper around a 2D canvas rendering context.
 *
 * #### Notes
 * This class is mostly a transparent wrapper around a canvas rendering
 * context which improves performance when writing context state.
 *
 * For best performance, avoid reading state from the `gc`. Writes are
 * cached based on the previously written value.
 *
 * Unless otherwise specified, the API and semantics of this class are
 * identical to the builtin 2D canvas rendering context:
 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 *
 * The wrapped canvas context should not be manipulated externally
 * until the wrapping `GraphicsContext` object is disposed.
 */
export declare class GraphicsContext implements IDisposable {
    /**
     * Create a new graphics context object.
     *
     * @param context - The 2D canvas rendering context to wrap.
     */
    constructor(context: CanvasRenderingContext2D);
    dispose(): void;
    readonly isDisposed: boolean;
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    font: string;
    textAlign: string;
    textBaseline: string;
    lineCap: string;
    lineDashOffset: number;
    lineJoin: string;
    lineWidth: number;
    miterLimit: number;
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    imageSmoothingEnabled: boolean;
    globalAlpha: number;
    globalCompositeOperation: string;
    getLineDash(): number[];
    setLineDash(segments: number[]): void;
    rotate(angle: number): void;
    scale(x: number, y: number): void;
    transform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void;
    translate(x: number, y: number): void;
    setTransform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void;
    save(): void;
    restore(): void;
    beginPath(): void;
    closePath(): void;
    isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    lineTo(x: number, y: number): void;
    moveTo(x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    rect(x: number, y: number, w: number, h: number): void;
    clip(fillRule?: CanvasFillRule): void;
    fill(fillRule?: CanvasFillRule): void;
    stroke(): void;
    clearRect(x: number, y: number, w: number, h: number): void;
    fillRect(x: number, y: number, w: number, h: number): void;
    fillText(text: string, x: number, y: number, maxWidth?: number): void;
    strokeRect(x: number, y: number, w: number, h: number): void;
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    measureText(text: string): TextMetrics;
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern;
    createImageData(imageData: ImageData): ImageData;
    createImageData(sw: number, sh: number): ImageData;
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
    putImageData(imagedata: ImageData, dx: number, dy: number): void;
    putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
    drawImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap, dstX: number, dstY: number): void;
    drawImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap, dstX: number, dstY: number, dstW: number, dstH: number): void;
    drawImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap, srcX: number, srcY: number, srcW: number, srcH: number, dstX: number, dstY: number, dstW: number, dstH: number): void;
    drawFocusIfNeeded(element: Element): void;
    private _disposed;
    private _state;
    private _context;
}
