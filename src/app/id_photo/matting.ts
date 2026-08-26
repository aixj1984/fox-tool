// MediaPipe Selfie Segmentation 加载与抠图封装。
// 通过 CDN 动态加载 @mediapipe/selfie_segmentation，对人像照片生成带透明背景的 ImageBitmap。

declare global {
  interface Window {
    SelfieSegmentation?: new (config: { locateFile: (file: string) => string }) => SelfieSegmenter;
  }
}

type SelfieSegmenter = {
  setOptions: (opts: { modelSelection: 0 | 1 }) => void;
  onResults: (cb: (results: SegResults) => void) => void;
  send: (input: { image: HTMLImageElement | HTMLCanvasElement }) => Promise<void>;
  close?: () => Promise<void>;
};

type SegResults = {
  image: CanvasImageSource;
  segmentationMask: CanvasImageSource;
};

let segmenterPromise: Promise<SelfieSegmenter> | null = null;
let scriptLoading: Promise<void> | null = null;

const CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747";

function loadScript(): Promise<void> {
  if (window.SelfieSegmentation) return Promise.resolve();
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `${CDN}/selfie_segmentation.js`;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("无法加载 MediaPipe Selfie Segmentation"));
    document.head.appendChild(s);
  });
  return scriptLoading;
}

async function getSegmenter(): Promise<SelfieSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      await loadScript();
      if (!window.SelfieSegmentation) {
        throw new Error("SelfieSegmentation 未加载");
      }
      const seg = new window.SelfieSegmentation({
        locateFile: (file) => `${CDN}/${file}`,
      });
      seg.setOptions({ modelSelection: 1 });
      return seg;
    })();
  }
  return segmenterPromise;
}

// 对一张图片做人像分割，返回带透明背景的 canvas（人像保留，背景透明）。
export async function cutoutPortrait(
  img: HTMLImageElement,
  onProgress?: (msg: string) => void,
): Promise<HTMLCanvasElement> {
  onProgress?.("加载抠图模型…");
  const seg = await getSegmenter();
  onProgress?.("分析人像…");

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const result = await new Promise<HTMLCanvasElement>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) reject(new Error("抠图超时，请重试"));
    }, 30000);

    seg.onResults((results: SegResults) => {
      settled = true;
      clearTimeout(timer);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 不可用"));
        return;
      }
      // 1. 先把 mask 画到一张临时画布，再用它作为合成遮罩，
      //    这样可以得到带 alpha 的人像（mask 是单通道灰度图）。
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = w;
      maskCanvas.height = h;
      const maskCtx = maskCanvas.getContext("2d");
      if (!maskCtx) {
        reject(new Error("Canvas 不可用"));
        return;
      }
      maskCtx.drawImage(results.segmentationMask, 0, 0, w, h);

      // 2. 用 mask 作为 alpha 通道剪切原图：
      //    先把原图画到结果画布，再用 destination-in + mask 只保留人像区域。
      ctx.drawImage(results.image, 0, 0, w, h);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      resolve(canvas);
    });

    seg.send({ image: img }).catch((e) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(e instanceof Error ? e : new Error("抠图失败"));
      }
    });
  });

  return result;
}
