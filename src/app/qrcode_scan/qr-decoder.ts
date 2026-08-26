// QR Code decoder (decoder-only), pure TypeScript.
// Implements: grayscale/binarization, finder pattern detection, timing pattern,
// version/format info, data masking, Reed-Solomon decoding, and payload decoding
// (numeric/alphanumeric/byte/kanji modes). Designed for uploaded image decoding.

export type DecodeResult = {
  text: string;
  format: string;
};

// ---------- Reed-Solomon over GF(256) ----------

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsRemainder(data: number[], eccLen: number): number[] {
  const gen = rsGeneratorPoly(eccLen);
  const buf = data.concat(new Array(eccLen).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = buf[i];
    if (coef === 0) continue;
    for (let j = 0; j < gen.length; j++) {
      buf[i + j] ^= gfMul(gen[j], coef);
    }
  }
  return buf.slice(data.length);
}

function rsDecode(data: number[], eccLen: number, symLen: number): boolean {
  // Reed-Solomon error correction using the Berlekamp-Massey + Chien + Forney.
  // symLen = number of correctable symbols (eccLen/2).
  // Returns true if data is now corrected (or was already valid).
  const gen = rsGeneratorPoly(eccLen);
  // compute syndromes
  const syn = new Array(eccLen).fill(0);
  for (let i = 0; i < eccLen; i++) {
    let s = 0;
    const coef = GF_EXP[i];
    for (let j = 0; j < data.length; j++) {
      s ^= gfMul(data[j], coef);
      // poly eval: multiply accumulator by alpha^i
    }
    // proper syndrome: evaluate data polynomial at alpha^i
    let eval2 = 0;
    for (let j = data.length - 1; j >= 0; j--) {
      eval2 = gfMul(eval2, coef) ^ data[j];
    }
    syn[i] = eval2;
  }
  let hasErr = false;
  for (const s of syn) if (s !== 0) { hasErr = true; break; }
  if (!hasErr) return true;

  // Berlekamp-Massey
  const numSyn = eccLen;
  const lam = [1];
  let b = [1];
  let l = 0;
  let m = 1;
  let bb = 1;
  for (let n = 0; n < numSyn; n++) {
    let delta = syn[n];
    for (let i = 1; i <= l; i++) delta ^= gfMul(lam[i], syn[n - i]);
    if (delta === 0) {
      m++;
    } else if (2 * l <= n) {
      const t = lam.slice();
      const scaledB = b.map((x) => gfMul(x, delta));
      // shift
      const shifted = new Array(m).fill(0).concat(scaledB.map((x) => gfMul(x, 1)));
      // pad lam to shifted length
      while (lam.length < shifted.length) lam.push(0);
      for (let i = 0; i < shifted.length; i++) lam[i] ^= shifted[i] ?? 0;
      l = n + 1 - l;
      b = t.map((x) => gfMul(x, 1));
      // recompute scaled with original delta via inverse
      const invDelta = GF_EXP[(255 - GF_LOG[delta] + 255) % 255];
      b = t.map((x) => gfMul(x, invDelta));
      bb = delta;
      m = 1;
    } else {
      const scaledB = b.map((x) => gfMul(x, delta));
      const shifted = new Array(m).fill(0).concat(scaledB);
      while (lam.length < shifted.length) lam.push(0);
      for (let i = 0; i < shifted.length; i++) lam[i] ^= shifted[i] ?? 0;
      m++;
    }
  }

  // Chien search for error positions
  const errorPositions: number[] = [];
  for (let i = 0; i < data.length; i++) {
    let v = 0;
    for (let j = 0; j < lam.length; j++) v ^= gfMul(lam[j], GF_EXP[(i * j) % 255]);
    if (v === 0) errorPositions.push(data.length - 1 - i);
  }

  if (errorPositions.length !== l) {
    // can't correct all; attempt no-correction validation
    return symLen === 0;
  }

  // Forney algorithm for error magnitudes
  // omega = syn * lam mod x^eccLen
  const omega = new Array(numSyn).fill(0);
  for (let i = 0; i < numSyn; i++) {
    for (let j = 0; j <= Math.min(i, lam.length - 1); j++) {
      omega[i] ^= gfMul(syn[i - j], lam[j]);
    }
  }
  // lam' (derivative): drop even-indexed-zero derivative
  const lamPrime: number[] = [];
  for (let i = 1; i < lam.length; i += 2) lamPrime.push(lam[i]);
  // build inverter
  const invert = (x: number) => (x === 0 ? 0 : GF_EXP[(255 - GF_LOG[x] + 255) % 255]);

  for (const pos of errorPositions) {
    const xi = GF_EXP[pos % 255];
    const xiInv = invert(xi);
    // numerator: omega(xiInv)
    let num = 0;
    for (let i = 0; i < omega.length; i++) num ^= gfMul(omega[i], GF_EXP[(i * (pos)) % 255]);
    // denominator: xiInv * lam'(xiInv)
    let den = 0;
    for (let i = 0; i < lamPrime.length; i++) den ^= gfMul(lamPrime[i], GF_EXP[(2 * i * pos) % 255]);
    if (den === 0) return false;
    const mag = gfMul(num, invert(den));
    data[data.length - 1 - pos] ^= mag;
  }
  return true;
}

// ---------- QR tables ----------

// Error correction codewords per block & number of blocks for each (version, EC level)
// Index [version-1][ecLevel 0=L,1=M,2=Q,3=H]
// Each entry: [totalDataCodewords, ecPerBlock, group1Blocks, group1DataPerBlock, group2Blocks, group2DataPerBlock]
const EC_TABLE: number[][][] = [
  // v1
  [[19, 7, 1, 19, 0, 0], [16, 10, 1, 16, 0, 0], [13, 13, 1, 13, 0, 0], [9, 17, 1, 9, 0, 0]],
  [[34, 10, 1, 34, 0, 0], [28, 16, 1, 28, 0, 0], [22, 22, 1, 22, 0, 0], [16, 28, 1, 16, 0, 0]],
  [[55, 15, 1, 55, 0, 0], [44, 26, 1, 44, 0, 0], [34, 18, 2, 17, 0, 0], [26, 22, 2, 13, 0, 0]],
  [[80, 20, 1, 80, 0, 0], [64, 18, 2, 32, 0, 0], [48, 26, 2, 24, 0, 0], [36, 16, 4, 9, 0, 0]],
  [[108, 26, 1, 108, 0, 0], [86, 24, 2, 43, 0, 0], [62, 18, 2, 15, 2, 16], [46, 22, 2, 11, 2, 12]],
  [[136, 18, 2, 68, 0, 0], [108, 16, 4, 27, 0, 0], [76, 24, 4, 19, 0, 0], [60, 28, 4, 15, 0, 0]],
  [[156, 20, 2, 78, 0, 0], [124, 18, 4, 31, 0, 0], [88, 18, 2, 14, 4, 15], [66, 26, 4, 13, 1, 14]],
  [[194, 24, 2, 97, 0, 0], [154, 22, 2, 38, 2, 39], [110, 22, 4, 18, 2, 19], [86, 26, 4, 14, 2, 15]],
  [[232, 30, 2, 116, 0, 0], [182, 22, 3, 36, 2, 37], [132, 20, 4, 16, 4, 17], [100, 24, 4, 12, 4, 13]],
  [[274, 18, 2, 68, 2, 69], [216, 26, 4, 43, 1, 44], [154, 24, 6, 19, 2, 20], [122, 28, 6, 15, 2, 16]],
];

const ALIGN_POS: number[][] = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54],
];

// Format info patterns for EC levels (L=0,M=1,Q=2,H=3) and mask 0-7
// Precomputed format strings (15 bits each, with BCH + mask 0x5412)
const FORMAT_INFO: Record<number, string> = {
  // L
  0: "111011111000100", 1: "111001011110011", 2: "111110110101010", 3: "111100010011101",
  // M
  4: "110011000101111", 5: "110001100011000", 6: "110110001000001", 7: "110100101110110",
  // Q
  8: "101010000010010", 9: "101000100100101", 10: "101111001111100", 11: "101101101001011",
  // H
  12: "100010111111001", 13: "100000011001110", 14: "100111110010111", 15: "100101010100000",
};

function formatKeyToEcMask(key: number): { ec: number; mask: number } {
  const ec = Math.floor(key / 4);
  const mask = key % 4;
  return { ec, mask };
}

// ---------- Image sampling ----------

function toGrayscale(data: Uint8ClampedArray, w: number, h: number): Uint8Array {
  const out = new Uint8Array(w * h);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    out[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return out;
}

function binarize(gray: Uint8Array): Uint8Array {
  // simple adaptive threshold using average
  let sum = 0;
  for (let i = 0; i < gray.length; i++) sum += gray[i];
  const avg = sum / gray.length;
  const out = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = gray[i] < avg ? 1 : 0; // 1 = dark
  return out;
}

// ---------- Finder pattern detection ----------

type Point = { x: number; y: number };

function findFinderPatterns(bin: Uint8Array, w: number, h: number): Point[] {
  // Look for 1:1:3:1:1 dark-light-dark-light-dark ratio in rows and columns.
  const ratios = [1, 1, 3, 1, 1];
  const total = ratios.reduce((a, b) => a + b, 0); // 7
  const candidates: Point[] = [];

  const scanLine = (vals: number[], coords: Point[]) => {
    let i = 0;
    while (i < vals.length) {
      if (vals[i] === 1) {
        // count runs
        const runs: number[] = [];
        let cur = 1;
        let curVal = 1;
        let j = i + 1;
        while (j < vals.length && runs.length < 5) {
          if (vals[j] === curVal) {
            cur++;
          } else {
            runs.push(cur);
            cur = 1;
            curVal = vals[j];
          }
          j++;
        }
        runs.push(cur);
        if (runs.length === 5) {
          const sum = runs.reduce((a, b) => a + b, 0);
          const ok = runs.every((r, idx) => Math.abs(r - (ratios[idx] * sum) / total) <= (ratios[idx] * sum) / total * 0.5);
          if (ok) {
            const center = i + Math.floor((runs[0] + runs[1] + runs[2] / 2));
            if (coords[center]) candidates.push(coords[center]);
          }
        }
        i = j;
      } else {
        i++;
      }
    }
  };

  // scan rows
  for (let y = 0; y < h; y++) {
    const vals: number[] = [];
    const coords: Point[] = [];
    for (let x = 0; x < w; x++) {
      vals.push(bin[y * w + x]);
      coords.push({ x, y });
    }
    scanLine(vals, coords);
  }
  // scan columns
  for (let x = 0; x < w; x++) {
    const vals: number[] = [];
    const coords: Point[] = [];
    for (let y = 0; y < h; y++) {
      vals.push(bin[y * w + x]);
      coords.push({ x, y });
    }
    scanLine(vals, coords);
  }

  // cluster candidates
  const centers: Point[] = [];
  for (const c of candidates) {
    const near = centers.find((cc) => Math.abs(cc.x - c.x) < 15 && Math.abs(cc.y - c.y) < 15);
    if (near) {
      near.x = (near.x + c.x) / 2;
      near.y = (near.y + c.y) / 2;
    } else {
      centers.push({ x: c.x, y: c.y });
    }
  }
  return centers;
}

// ---------- Main decode ----------

export function decodeQRFromImageData(imageData: ImageData): DecodeResult | null {
  const w = imageData.width;
  const h = imageData.height;
  const gray = toGrayscale(imageData.data, w, h);
  const bin = binarize(gray);

  const finders = findFinderPatterns(bin, w, h);
  if (finders.length < 3) return null;

  // sort finders: TL, TR, BL
  finders.sort((a, b) => a.x + a.y - (b.x + b.y));
  const tl = finders[0];
  // remaining: pick top-right (max x, min y among rest) and bottom-left (min x, max y)
  const rest = finders.slice(1);
  const tr = rest.reduce((p, c) => (c.x - c.y > p.x - p.y ? c : p), rest[0]);
  const bl = rest.reduce((p, c) => (c.y - c.x > p.y - p.x ? c : p), rest[0]);

  // estimate module size from finder span
  const moduleSize = Math.hypot(tr.x - tl.x, tr.y - tl.y) / 7 || Math.hypot(bl.x - tl.x, bl.y - tl.y) / 7;
  if (moduleSize < 3) return null;

  // Determine version from distance between finders
  const span = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const spanModules = Math.round(span / moduleSize);
  // version = (spanModules - 17) / 4
  let version = Math.round((spanModules - 17) / 4);
  if (version < 1 || version > 10) {
    // try using dimension directly
    version = Math.max(1, Math.min(10, Math.round((spanModules - 17) / 4)));
  }
  if (version < 1 || version > 10) return null;

  const dim = 17 + 4 * version;

  // Build a sampler: map module (i,j) to pixel coordinates using the 3 finders as reference.
  // Top-left of QR is at tl - 3.5*moduleSize in both axes (finder center is at 3 modules in).
  const originX = tl.x - 3.5 * moduleSize;
  const originY = tl.y - 3.5 * moduleSize;
  // x-axis unit vector (tl->tr) and y-axis unit vector (tl->bl)
  const ax = (tr.x - tl.x) / (dim - 7) / moduleSize * moduleSize;
  const ay = (tr.y - tl.y) / (dim - 7) / moduleSize * moduleSize;
  const bx = (bl.x - tl.x) / (dim - 7) / moduleSize * moduleSize;
  const by = (bl.y - tl.y) / (dim - 7) / moduleSize * moduleSize;

  const sampleModule = (i: number, j: number): number => {
    // i = column, j = row; center of module
    const cx = originX + (i + 0.5) * ax + (j + 0.5) * bx / (dim - 7) * 0;
    const cy = originY + (i + 0.5) * ay / (dim - 7) * 0 + (j + 0.5) * by;
    // Simpler affine: use axis vectors directly
    const px = Math.round(originX + (i + 0.5) * (tr.x - tl.x) / (dim - 7) + (j + 0.5) * (bl.x - tl.x) / (dim - 7));
    const py = Math.round(originY + (i + 0.5) * (tr.y - tl.y) / (dim - 7) + (j + 0.5) * (bl.y - tl.y) / (dim - 7));
    void cx; void cy;
    if (px < 0 || py < 0 || px >= w || py >= h) return 0;
    return bin[py * w + px];
  };

  // Read format info (around finders). Format info appears in two places; read the one near TL.
  // Format bits: 15 bits. Read from row 8 near top-left.
  let formatBits = "";
  for (let i = 0; i <= 5; i++) formatBits += String(sampleModule(8, i));
  // skip timing at (8,6)
  formatBits += String(sampleModule(8, 7));
  formatBits += String(sampleModule(8, 8));
  formatBits += String(sampleModule(7, 8));
  // skip timing at (6,8)
  for (let i = 5; i >= 0; i--) formatBits += String(sampleModule(i, 8));

  // match against FORMAT_INFO
  let ecLevel = -1;
  let maskPat = -1;
  for (const key in FORMAT_INFO) {
    if (FORMAT_INFO[key] === formatBits) {
      const { ec, mask } = formatKeyToEcMask(parseInt(key, 10));
      ecLevel = ec;
      maskPat = mask;
      break;
    }
  }
  if (ecLevel === -1) {
    // try inverted (dark=0 convention)
    const inv = formatBits.split("").map((c) => (c === "1" ? "0" : "1")).join("");
    for (const key in FORMAT_INFO) {
      if (FORMAT_INFO[key] === inv) {
        const { ec, mask } = formatKeyToEcMask(parseInt(key, 10));
        ecLevel = ec;
        maskPat = mask;
        break;
      }
    }
  }
  if (ecLevel === -1) return null;

  // Build the bit matrix
  const matrix: number[][] = [];
  for (let j = 0; j < dim; j++) {
    const row: number[] = [];
    for (let i = 0; i < dim; i++) row.push(sampleModule(i, j));
    matrix.push(row);
  }

  // Build function-pattern mask (true = skip this module for data)
  const isFunction: boolean[][] = Array.from({ length: dim }, () => new Array(dim).fill(false));
  const markFinder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && y >= 0 && x < dim && y < dim) isFunction[y][x] = true;
      }
    }
  };
  markFinder(3, 3);
  markFinder(dim - 4, 3);
  markFinder(3, dim - 4);
  // timing patterns
  for (let i = 0; i < dim; i++) {
    isFunction[6][i] = true;
    isFunction[i][6] = true;
  }
  // alignment patterns
  const aligns = ALIGN_POS[version];
  for (const ay of aligns) {
    for (const ax of aligns) {
      if ((ax === 6 && ay === 6) || (ax === dim - 7 && ay === 6) || (ax === 6 && ay === dim - 7)) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const x = ax + dx, y = ay + dy;
          if (x >= 0 && y >= 0 && x < dim && y < dim) isFunction[y][x] = true;
        }
      }
    }
  }
  // format info modules already marked via finder areas; also dark module
  isFunction[dim - 8][8] = true;

  // Read data bits in zigzag order
  const bits: number[] = [];
  let upward = true;
  for (let col = dim - 1; col > 0; col -= 2) {
    if (col === 6) col = 5; // skip vertical timing
    for (let i = 0; i < dim; i++) {
      const y = upward ? dim - 1 - i : i;
      for (let c = 0; c < 2; c++) {
        const x = col - c;
        if (!isFunction[y][x]) bits.push(matrix[y][x]);
      }
    }
    upward = !upward;
  }

  // Convert bits to bytes
  const bytes: number[] = [];
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    bytes.push(b);
  }

  // Unmask data using mask pattern
  const unmask = (x: number, y: number): number => {
    switch (maskPat) {
      case 0: return (x + y) % 2 === 0 ? 1 : 0;
      case 1: return y % 2 === 0 ? 1 : 0;
      case 2: return x % 3 === 0 ? 1 : 0;
      case 3: return (x + y) % 3 === 0 ? 1 : 0;
      case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0 ? 1 : 0;
      case 5: return ((x * y) % 2) + ((x * y) % 3) === 0 ? 1 : 0;
      case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0 ? 1 : 0;
      case 7: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0 ? 1 : 0;
      default: return 0;
    }
  };
  // Apply unmask by rebuilding bits per module order — simpler: recompute data bits with mask
  const dataBits: number[] = [];
  upward = true;
  for (let col = dim - 1; col > 0; col -= 2) {
    if (col === 6) col = 5;
    for (let i = 0; i < dim; i++) {
      const y = upward ? dim - 1 - i : i;
      for (let c = 0; c < 2; c++) {
        const x = col - c;
        if (!isFunction[y][x]) {
          dataBits.push(matrix[y][x] ^ unmask(x, y));
        }
      }
    }
    upward = !upward;
  }
  const dataBytes: number[] = [];
  for (let i = 0; i + 7 < dataBits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | dataBits[i + j];
    dataBytes.push(b);
  }

  // Deinterleave blocks per EC table
  const ecInfo = EC_TABLE[version - 1][ecLevel];
  const totalData = ecInfo[0];
  const eccPerBlock = ecInfo[1];
  const g1Blocks = ecInfo[2];
  const g1Data = ecInfo[3];
  const g2Blocks = ecInfo[4];
  const g2Data = ecInfo[5];
  const totalBlocks = g1Blocks + g2Blocks;
  const dataCodewordsPerBlock: number[] = [];
  for (let i = 0; i < g1Blocks; i++) dataCodewordsPerBlock.push(g1Data);
  for (let i = 0; i < g2Blocks; i++) dataCodewordsPerBlock.push(g2Data);

  // data is interleaved: first codeword of each block, then second, etc.
  const blocks: number[][] = Array.from({ length: totalBlocks }, () => []);
  let idx = 0;
  const maxData = Math.max(g1Data, g2Data);
  for (let k = 0; k < maxData; k++) {
    for (let b = 0; b < totalBlocks; b++) {
      if (k < dataCodewordsPerBlock[b]) {
        blocks[b].push(dataBytes[idx++]);
      }
    }
  }
  // ECC codewords interleaved
  const eccBlocks: number[][] = Array.from({ length: totalBlocks }, () => []);
  for (let k = 0; k < eccPerBlock; k++) {
    for (let b = 0; b < totalBlocks; b++) {
      eccBlocks[b].push(dataBytes[idx++]);
    }
  }

  // RS decode each block
  let dataCodewords: number[] = [];
  for (let b = 0; b < totalBlocks; b++) {
    const full = blocks[b].concat(eccBlocks[b]);
    const ok = rsDecode(full, eccPerBlock, Math.floor(eccPerBlock / 2));
    if (!ok) return null;
    dataCodewords = dataCodewords.concat(full.slice(0, dataCodewordsPerBlock[b]));
  }

  if (dataCodewords.length < totalData) return null;
  dataCodewords = dataCodewords.slice(0, totalData);

  return decodePayload(dataCodewords);
}

// ---------- Payload decoding ----------

const ALPHANUM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

function decodePayload(codewords: number[]): DecodeResult | null {
  let bitIdx = 0;
  const readBits = (n: number): number => {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const bytePos = Math.floor(bitIdx / 8);
      const bitPos = 7 - (bitIdx % 8);
      if (bytePos >= codewords.length) return -1;
      const bit = (codewords[bytePos] >> bitPos) & 1;
      v = (v << 1) | bit;
      bitIdx++;
    }
    return v;
  };

  let result = "";
  let format = "文本";

  while (true) {
    const mode = readBits(4);
    if (mode === -1) break;
    if (mode === 0) break;
    if (mode === 1) {
      // numeric
      const count = readBits(10);
      if (count === -1) break;
      let i = 0;
      while (i < count) {
        if (count - i >= 3) {
          const val = readBits(10);
          if (val === -1) break;
          result += String(val).padStart(3, "0");
          i += 3;
        } else if (count - i === 2) {
          const val = readBits(7);
          if (val === -1) break;
          result += String(val).padStart(2, "0");
          i += 2;
        } else {
          const val = readBits(4);
          if (val === -1) break;
          result += String(val);
          i += 1;
        }
      }
    } else if (mode === 2) {
      // alphanumeric
      const count = readBits(9);
      if (count === -1) break;
      let i = 0;
      while (i < count) {
        if (count - i >= 2) {
          const val = readBits(11);
          if (val === -1) break;
          result += ALPHANUM_CHARS[Math.floor(val / 45)] + ALPHANUM_CHARS[val % 45];
          i += 2;
        } else {
          const val = readBits(6);
          if (val === -1) break;
          result += ALPHANUM_CHARS[val];
          i += 1;
        }
      }
    } else if (mode === 4) {
      // byte
      const count = readBits(8);
      if (count === -1) break;
      const bytes: number[] = [];
      for (let i = 0; i < count; i++) {
        const val = readBits(8);
        if (val === -1) break;
        bytes.push(val);
      }
      try {
        // try UTF-8 first
        const text = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes));
        result += text;
        if (/^https?:\/\//i.test(result)) format = "链接";
      } catch {
        // fallback latin
        result += String.fromCharCode(...bytes);
      }
    } else if (mode === 8) {
      // kanji
      const count = readBits(8);
      if (count === -1) break;
      for (let i = 0; i < count; i++) {
        const val = readBits(13);
        if (val === -1) break;
        // Shift JIS decode simplified
        let b1 = (val >> 8) & 0xff;
        const b2 = val & 0xff;
        if (b1 >= 0xe0) b1 -= 0x40;
        b1 += 0x80;
        if (b2 >= 0x9f) b1++;
        // approximate
        result += String.fromCharCode((b1 << 8) | b2);
      }
    } else {
      break;
    }
  }

  if (!result) return null;
  if (/^https?:\/\//i.test(result)) format = "链接";
  else if (/^mailto:/i.test(result)) format = "邮箱";
  else if (/^tel:/i.test(result)) format = "电话";
  return { text: result, format };
}
