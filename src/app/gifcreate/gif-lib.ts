// Minimal GIF89a decoder + encoder, pure TypeScript, no dependencies.
// Designed for the tool pages gifsplitter (decode) and gifcreate (encode).

// ---------- Decoder ----------

export type GifFrame = {
  width: number;
  height: number;
  delay: number; // ms
  disposal: number; // 0,1,2,3
  imageData: ImageData; // full-frame RGBA, already composited onto the canvas dims
};

export type GifDecodeResult = {
  width: number;
  height: number;
  frames: GifFrame[];
  loopCount: number; // 0 = infinite
};

export function decodeGif(buffer: ArrayBuffer): GifDecodeResult {
  const bytes = new Uint8Array(buffer);
  let p = 0;

  const readU16 = () => {
    const lo = bytes[p++];
    const hi = bytes[p++];
    return lo | (hi << 8);
  };

  // Header
  const sig = String.fromCharCode(bytes[p++], bytes[p++], bytes[p++]);
  if (sig !== "GIF") throw new Error("不是有效的 GIF 文件");
  const ver = String.fromCharCode(bytes[p++], bytes[p++], bytes[p++]);
  if (ver !== "87a" && ver !== "89a") throw new Error("不支持的 GIF 版本");

  const width = readU16();
  const height = readU16();
  const packed = bytes[p++];
  const _bgIndex = bytes[p++];
  const _aspect = bytes[p++];

  const gctFlag = (packed & 0x80) !== 0;
  const gctSize = 1 << ((packed & 0x07) + 1);

  let gct: Uint8Array | null = null;
  if (gctFlag) {
    gct = bytes.subarray(p, p + gctSize * 3);
    p += gctSize * 3;
  }

  const frames: GifFrame[] = [];
  let loopCount = 0;
  // graphic control extension state
  let gceDelay = 0;
  let gceDisposal = 0;
  let gceTransparent = false;
  let gceTransIndex = 0;

  // canvas-sized RGBA buffers for compositing
  const fullCanvas = new Uint8ClampedArray(width * height * 4);
  const prevCanvas = new Uint8ClampedArray(width * height * 4);

  const disposeFrame = (disposal: number, x: number, y: number, fw: number, fh: number) => {
    if (disposal === 2) {
      for (let yy = y; yy < y + fh && yy < height; yy++) {
        for (let xx = x; xx < x + fw && xx < width; xx++) {
          const idx = (yy * width + xx) * 4;
          fullCanvas[idx + 3] = 0;
        }
      }
    } else if (disposal === 3) {
      fullCanvas.set(prevCanvas);
    }
  };

  while (p < bytes.length) {
    const block = bytes[p++];
    if (block === 0x3b) break; // trailer
    if (block === 0x21) {
      // extension
      const label = bytes[p++];
      if (label === 0xf9) {
        // graphic control extension
        const size = bytes[p++]; // should be 4
        const pk = bytes[p++];
        gceDisposal = (pk >> 2) & 0x07;
        gceTransparent = (pk & 0x01) !== 0;
        gceDelay = readU16() * 10; // centiseconds -> ms
        gceTransIndex = bytes[p++];
        p++; // block terminator
      } else if (label === 0xff) {
        // application extension
        const blockSize = bytes[p++];
        const appId = String.fromCharCode(...bytes.subarray(p, p + blockSize));
        p += blockSize;
        if (appId.startsWith("NETSCAPE")) {
          // read sub-blocks to find loop
          while (bytes[p] !== 0) {
            const sub = bytes[p++];
            if (sub === 3) {
              p++; // sub-block id 1
              loopCount = readU16();
            } else {
              p += sub;
            }
          }
          p++; // terminator
        } else {
          // skip sub-blocks
          while (bytes[p] !== 0) {
            const sz = bytes[p++];
            p += sz;
          }
          p++;
        }
      } else {
        // skip other extensions (comment, plain text, etc.)
        while (p < bytes.length && bytes[p] !== 0) {
          const sz = bytes[p++];
          p += sz;
        }
        p++;
      }
    } else if (block === 0x2c) {
      // image descriptor
      const left = readU16();
      const top = readU16();
      const fw = readU16();
      const fh = readU16();
      const ip = bytes[p++];
      const lctFlag = (ip & 0x80) !== 0;
      const interlace = (ip & 0x40) !== 0;
      const lctSize = 1 << ((ip & 0x07) + 1);
      let lct: Uint8Array | null = null;
      if (lctFlag) {
        lct = bytes.subarray(p, p + lctSize * 3);
        p += lctSize * 3;
      }
      const palette = lct ?? gct;
      if (!palette) throw new Error("缺少调色板");

      const lzwMinCode = bytes[p++];
      const compressed = collectSubBlocks(bytes, p);
      p = compressed.next;

      const indices = lzwDecode(compressed.data, lzwMinCode);

      let pixels: Uint8Array;
      if (interlace) {
        pixels = deinterlace(indices, fw, fh);
      } else {
        pixels = indices;
      }

      // save canvas before drawing for disposal 3
      prevCanvas.set(fullCanvas);

      // draw frame pixels onto fullCanvas
      for (let yy = 0; yy < fh; yy++) {
        for (let xx = 0; xx < fw; xx++) {
          const ci = pixels[yy * fw + xx];
          const dx = left + xx;
          const dy = top + yy;
          if (dx >= width || dy >= height) continue;
          const transparent = gceTransparent && ci === gceTransIndex;
          if (transparent) continue;
          const pi = ci * 3;
          const di = (dy * width + dx) * 4;
          fullCanvas[di] = palette[pi];
          fullCanvas[di + 1] = palette[pi + 1];
          fullCanvas[di + 2] = palette[pi + 2];
          fullCanvas[di + 3] = 255;
        }
      }

      // snapshot the composited frame
      const snap = new Uint8ClampedArray(fullCanvas);
      frames.push({
        width,
        height,
        delay: gceDelay,
        disposal: gceDisposal,
        imageData: new ImageData(snap, width, height),
      });

      // dispose for next frame
      disposeFrame(gceDisposal, left, top, fw, fh);
    } else {
      // unknown / trailing byte — skip
    }
  }

  return { width, height, frames, loopCount };
}

function collectSubBlocks(bytes: Uint8Array, start: number): { data: Uint8Array; next: number } {
  const chunks: Uint8Array[] = [];
  let p = start;
  let total = 0;
  while (p < bytes.length && bytes[p] !== 0) {
    const sz = bytes[p++];
    chunks.push(bytes.subarray(p, p + sz));
    total += sz;
    p += sz;
  }
  p++; // terminator
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return { data: out, next: p };
}

function lzwDecode(data: Uint8Array, minCode: number): Uint8Array {
  const clearCode = 1 << minCode;
  const endCode = clearCode + 1;
  let codeSize = minCode + 1;
  let dict: number[][] = [];
  const resetDict = () => {
    dict = [];
    for (let i = 0; i < clearCode; i++) dict.push([i]);
    dict[clearCode] = [];
    dict[endCode] = [];
    codeSize = minCode + 1;
  };
  resetDict();

  const out: number[] = [];
  let bitBuf = 0;
  let bitCount = 0;
  let dataPos = 0;
  let prev: number[] | null = null;

  const readCode = () => {
    while (bitCount < codeSize) {
      if (dataPos >= data.length) return -1;
      bitBuf |= data[dataPos++] << bitCount;
      bitCount += 8;
    }
    const code = bitBuf & ((1 << codeSize) - 1);
    bitBuf >>= codeSize;
    bitCount -= codeSize;
    return code;
  };

  while (true) {
    const code = readCode();
    if (code === -1) break;
    if (code === clearCode) {
      resetDict();
      prev = null;
      continue;
    }
    if (code === endCode) break;

    let entry: number[];
    if (code < dict.length && dict[code] !== undefined && dict[code].length > 0) {
      entry = dict[code];
    } else if (prev !== null) {
      entry = [...prev, prev[0]];
    } else {
      break;
    }
    out.push(...entry);
    if (prev !== null) {
      dict.push([...prev, entry[0]]);
      if (dict.length === 1 << codeSize && codeSize < 12) {
        codeSize++;
      }
    }
    prev = entry;
  }
  return new Uint8Array(out);
}

function deinterlace(indices: Uint8Array, w: number, h: number): Uint8Array {
  const out = new Uint8Array(indices.length);
  const passes = [
    { start: 0, step: 8 },
    { start: 4, step: 8 },
    { start: 2, step: 4 },
    { start: 1, step: 2 },
  ];
  let srcRow = 0;
  for (const pass of passes) {
    for (let y = pass.start; y < h; y += pass.step) {
      const src = srcRow * w;
      const dst = y * w;
      out.set(indices.subarray(src, src + w), dst);
      srcRow++;
    }
  }
  return out;
}

// ---------- Encoder ----------

export type EncodeFrame = {
  rgba: Uint8ClampedArray; // full-frame RGBA
  width: number;
  height: number;
  delay: number; // ms
};

export function encodeGif(
  frames: EncodeFrame[],
  width: number,
  height: number,
  loopCount = 0,
): Blob {
  const out: number[] = [];
  const writeByte = (b: number) => out.push(b & 0xff);
  const writeU16 = (v: number) => {
    out.push(v & 0xff);
    out.push((v >> 8) & 0xff);
  };
  const writeBytes = (arr: ArrayLike<number>) => {
    for (let i = 0; i < arr.length; i++) out.push(arr[i] & 0xff);
  };

  // Header
  writeBytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
  writeU16(width);
  writeU16(height);
  // global color table flag off, resolution 8, sorted 0, gct size 0
  writeByte(0x00);
  writeByte(0x00); // bg index
  writeByte(0x00); // aspect

  // We'll use a per-frame local color table (median cut quantization).
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const { palette, indices, transIndex } = quantize(frame.rgba, width, height);

    // Graphic Control Extension
    writeByte(0x21);
    writeByte(0xf9);
    writeByte(0x04);
    const disposal = i === frames.length - 1 ? 0 : 2; // restore to bg
    const hasTrans = transIndex !== -1;
    const gcePacked =
      (hasTrans ? 0x01 : 0x00) | (disposal << 2);
    writeByte(gcePacked);
    const delay = Math.max(2, Math.round(frame.delay / 10));
    writeU16(delay);
    writeByte(hasTrans ? transIndex : 0);
    writeByte(0x00); // terminator

    // Image descriptor
    writeByte(0x2c);
    writeU16(0); // left
    writeU16(0); // top
    writeU16(width);
    writeU16(height);
    const lctSize = palette.length / 3;
    const lctBits = Math.max(2, Math.log2(lctSize));
    const ip = 0x80 | (lctBits - 1); // local color table, not interlaced
    writeByte(ip);
    writeBytes(palette);

    const minCode = lctBits;
    writeByte(minCode);
    const compressed = lzwEncode(indices, minCode);
    writeSubBlocks(compressed, out);
    writeByte(0x00); // block terminator
  }

  // Netscape loop extension if looping
  if (loopCount >= 0 && frames.length > 1) {
    // This needs to come before the frames, but we wrote it after.
    // Correct approach: write it before frames. We'll rebuild below.
  }

  writeByte(0x3b); // trailer

  // If looping needed, rebuild with the extension at the front.
  if (loopCount >= 0 && frames.length > 1) {
    const header = [
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61,
      width & 0xff, (width >> 8) & 0xff,
      height & 0xff, (height >> 8) & 0xff,
      0x00, 0x00, 0x00,
    ];
    const netscape = [
      0x21, 0xff, 0x0b,
      0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30,
      0x03, 0x01,
      loopCount & 0xff, (loopCount >> 8) & 0xff,
      0x00,
    ];
    // The body is everything after the 13-byte header.
    const body = out.slice(13);
    return new Blob([new Uint8Array([...header, ...netscape, ...body])], {
      type: "image/gif",
    });
  }

  return new Blob([new Uint8Array(out)], { type: "image/gif" });
}

function writeSubBlocks(data: Uint8Array, out: number[]) {
  let p = 0;
  while (p < data.length) {
    const chunk = Math.min(255, data.length - p);
    out.push(chunk);
    for (let i = 0; i < chunk; i++) out.push(data[p + i]);
    p += chunk;
  }
}

// Median cut color quantization. Returns palette (RGB), indices, and
// transparent index if the image has transparent pixels.
function quantize(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
): { palette: Uint8Array; indices: Uint8Array; transIndex: number } {
  const hasAlpha = rgbaHasAlpha(rgba, width, height);
  const maxColors = 256;
  const buckets: number[][] = [[]]; // each bucket is a list of pixel positions (index in rgba/4)
  // collect unique-ish pixels (sample to keep fast)
  const pixelPositions: number[] = [];
  for (let i = 0; i < rgba.length; i += 4) {
    if (hasAlpha && rgba[i + 3] < 128) continue; // transparent
    pixelPositions.push(i);
  }
  buckets[0] = pixelPositions;

  // median cut: split buckets by largest channel range
  while (buckets.length < maxColors - (hasAlpha ? 1 : 0)) {
    // find bucket with largest range
    let bestBucket = -1;
    let bestRange = -1;
    let bestChannel = 0;
    for (let b = 0; b < buckets.length; b++) {
      if (buckets[b].length < 2) continue;
      let rmin = 255, rmax = 0, gmin = 255, gmax = 0, bmin = 255, bmax = 0;
      for (const pos of buckets[b]) {
        const r = rgba[pos], g = rgba[pos + 1], bl = rgba[pos + 2];
        if (r < rmin) rmin = r; if (r > rmax) rmax = r;
        if (g < gmin) gmin = g; if (g > gmax) gmax = g;
        if (bl < bmin) bmin = bl; if (bl > bmax) bmax = bl;
      }
      const rr = rmax - rmin, gg = gmax - gmin, bb = bmax - bmin;
      const maxc = Math.max(rr, gg, bb);
      if (maxc > bestRange) {
        bestRange = maxc;
        bestBucket = b;
        bestChannel = rr >= gg && rr >= bb ? 0 : gg >= bb ? 1 : 2;
      }
    }
    if (bestBucket === -1 || bestRange === 0) break;
    const bucket = buckets[bestBucket];
    bucket.sort((a, b) => rgba[a + bestChannel] - rgba[b + bestChannel]);
    const mid = Math.floor(bucket.length / 2);
    const second = bucket.splice(mid);
    buckets.push(second);
  }

  // build palette from bucket averages
  const palList: number[][] = [];
  const palColorToIndex = new Map<string, number>();
  for (const bucket of buckets) {
    if (bucket.length === 0) {
      palList.push([0, 0, 0]);
      continue;
    }
    let r = 0, g = 0, b = 0;
    for (const pos of bucket) {
      r += rgba[pos]; g += rgba[pos + 1]; b += rgba[pos + 2];
    }
    const rr = Math.round(r / bucket.length);
    const gg = Math.round(g / bucket.length);
    const bb = Math.round(b / bucket.length);
    palList.push([rr, gg, bb]);
  }

  // reserve transparent slot
  let transIndex = -1;
  if (hasAlpha) {
    // use index 0 as transparent by convention
    transIndex = 0;
    // shift existing colors; we'll map transparent pixels to index 0
    palList.unshift([0, 0, 0]);
  }

  // pad palette to a power of 2
  let size = 2;
  while (size < palList.length) size <<= 1;
  while (palList.length < size) palList.push([0, 0, 0]);

  const palette = new Uint8Array(palList.length * 3);
  for (let i = 0; i < palList.length; i++) {
    palette[i * 3] = palList[i][0];
    palette[i * 3 + 1] = palList[i][1];
    palette[i * 3 + 2] = palList[i][2];
    palColorToIndex.set(`${palList[i][0]},${palList[i][1]},${palList[i][2]}`, i);
  }

  // map pixels to indices (nearest color)
  const indices = new Uint8Array(width * height);
  for (let i = 0, pi = 0; i < rgba.length; i += 4, pi++) {
    if (hasAlpha && rgba[i + 3] < 128) {
      indices[pi] = transIndex;
      continue;
    }
    const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
    // nearest palette color
    let best = 0;
    let bestDist = Infinity;
    for (let k = 0; k < palList.length; k++) {
      const dr = r - palList[k][0];
      const dg = g - palList[k][1];
      const db = b - palList[k][2];
      const d = dr * dr + dg * dg + db * db;
      if (d < bestDist) {
        bestDist = d;
        best = k;
      }
    }
    indices[pi] = best;
  }

  return { palette, indices, transIndex };
}

function rgbaHasAlpha(rgba: Uint8ClampedArray, w: number, h: number): boolean {
  // sample
  for (let i = 3; i < rgba.length; i += 4 * Math.max(1, Math.floor((w * h) / 4000))) {
    if (rgba[i] < 250) return true;
  }
  return false;
}

function lzwEncode(indices: Uint8Array, minCode: number): Uint8Array {
  const clearCode = 1 << minCode;
  const endCode = clearCode + 1;
  let codeSize = minCode + 1;
  let dict = new Map<string, number>();
  let nextCode = endCode + 1;
  const resetDict = () => {
    dict = new Map();
    for (let i = 0; i < clearCode; i++) dict.set(String(i), i);
    codeSize = minCode + 1;
    nextCode = endCode + 1;
  };

  const outBits: number[] = [];
  const writeCode = (code: number, bits: number) => {
    for (let i = 0; i < bits; i++) {
      outBits.push((code >> i) & 1);
    }
  };

  resetDict();
  writeCode(clearCode, codeSize);
  let w = "";
  for (let i = 0; i < indices.length; i++) {
    const c = String(indices[i]);
    const wc = w + "," + c;
    if (dict.has(wc)) {
      w = wc;
    } else {
      writeCode(dict.get(w)!, codeSize);
      if (nextCode < 4096) {
        dict.set(wc, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        writeCode(clearCode, codeSize);
        resetDict();
      }
      w = c;
    }
  }
  if (w !== "") writeCode(dict.get(w)!, codeSize);
  writeCode(endCode, codeSize);

  // pack bits into bytes
  const bytes: number[] = [];
  for (let i = 0; i < outBits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8 && i + j < outBits.length; j++) {
      b |= outBits[i + j] << j;
    }
    bytes.push(b);
  }
  return new Uint8Array(bytes);
}
