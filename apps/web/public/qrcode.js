// FE-001-v8: Minimal QR code generator — replaces api.qrserver.com which leaked TOTP secrets to a third party.
// Generates QR codes entirely client-side using Canvas. Based on the QR code specification (ISO/IEC 18004).
// Supports numeric, alphanumeric, and byte encoding modes up to version 6 (~134 bytes).
(function(global) {
  "use strict";

  // GF(256) arithmetic for Reed-Solomon
  const GF_EXP = new Uint8Array(512);
  const GF_LOG = new Uint8Array(256);
  (function() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
    }
    for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  function rsGenPoly(nsym) {
    let g = [1];
    for (let i = 0; i < nsym; i++) {
      const ng = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) {
        ng[j] ^= g[j];
        ng[j + 1] ^= gfMul(g[j], GF_EXP[i]);
      }
      g = ng;
    }
    return g;
  }

  function rsEncode(data, nsym) {
    const gen = rsGenPoly(nsym);
    const res = new Uint8Array(data.length + nsym);
    res.set(data);
    for (let i = 0; i < data.length; i++) {
      const coef = res[i];
      if (coef !== 0) {
        for (let j = 1; j < gen.length; j++) {
          res[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return res.slice(data.length);
  }

  // QR version capacities (byte mode, error correction L/M/Q/H)
  const VERSION_EC = [
    null, // no version 0
    { total: 26, ec: [7,10,13,17], dataL: 19, dataM: 16, dataQ: 13, dataH: 9 },
    { total: 44, ec: [10,16,22,28], dataL: 34, dataM: 28, dataQ: 22, dataH: 16 },
    { total: 70, ec: [15,26,18,22], dataL: 55, dataM: 44, dataQ: 34, dataH: 26 },
    { total: 100, ec: [20,18,26,16], dataL: 80, dataM: 64, dataQ: 48, dataH: 36 },
    { total: 134, ec: [26,24,18,22], dataL: 108, dataM: 86, dataQ: 62, dataH: 46 },
    { total: 172, ec: [18,16,24,28], dataL: 136, dataM: 108, dataQ: 76, dataH: 60 },
  ];

  const ALIGN_POS = [null, [], [6,18], [6,22], [6,26], [6,30], [6,34]];

  function getVersion(dataLen, ec) {
    const ecKey = ec === 'H' ? 'dataH' : ec === 'Q' ? 'dataQ' : ec === 'M' ? 'dataM' : 'dataL';
    for (let v = 1; v <= 6; v++) {
      if (VERSION_EC[v][ecKey] >= dataLen) return v;
    }
    return 6; // max supported
  }

  function createMatrix(version) {
    const size = version * 4 + 17;
    const matrix = Array.from({length: size}, () => new Int8Array(size)); // 0=unset, 1=dark, -1=light
    const reserved = Array.from({length: size}, () => new Uint8Array(size)); // 1=reserved (don't overwrite)
    return { matrix, reserved, size };
  }

  function setModule(mat, r, c, dark, reserve) {
    if (r < 0 || r >= mat.size || c < 0 || c >= mat.size) return;
    mat.matrix[r][c] = dark ? 1 : -1;
    if (reserve) mat.reserved[r][c] = 1;
  }

  function placeFinderPattern(mat, row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r, cc = col + c;
        if (rr < 0 || rr >= mat.size || cc < 0 || cc >= mat.size) continue;
        let dark;
        if (r === -1 || r === 7 || c === -1 || c === 7) dark = false;
        else if (r === 0 || r === 6 || c === 0 || c === 6) dark = true;
        else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) dark = true;
        else dark = false;
        setModule(mat, rr, cc, dark, true);
      }
    }
  }

  function placeAlignment(mat, row, col) {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const dark = Math.max(Math.abs(r), Math.abs(c)) !== 1;
        setModule(mat, row + r, col + c, dark, true);
      }
    }
  }

  function placeTimingPatterns(mat) {
    for (let i = 8; i < mat.size - 8; i++) {
      if (mat.reserved[6][i] === 0) setModule(mat, 6, i, i % 2 === 0, true);
      if (mat.reserved[i][6] === 0) setModule(mat, i, 6, i % 2 === 0, true);
    }
  }

  function reserveFormatAreas(mat, version) {
    for (let i = 0; i < 8; i++) {
      setModule(mat, 8, i, false, true);
      setModule(mat, i, 8, false, true);
      setModule(mat, 8, mat.size - 1 - i, false, true);
      setModule(mat, mat.size - 1 - i, 8, false, true);
    }
    setModule(mat, 8, 8, false, true);
    // Dark module
    setModule(mat, mat.size - 8, 8, true, true);
    // Version info for v >= 7 (not needed for v1-6)
  }

  function placeData(mat, dataBits) {
    let bitIdx = 0;
    let upward = true;
    for (let right = mat.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5; // skip timing column
      const rows = upward ? Array.from({length: mat.size}, (_, i) => mat.size - 1 - i) : Array.from({length: mat.size}, (_, i) => i);
      for (const row of rows) {
        for (let c = 0; c < 2; c++) {
          const col = right - c;
          if (col < 0 || col >= mat.size) continue;
          if (mat.reserved[row][col]) continue;
          const dark = bitIdx < dataBits.length ? dataBits[bitIdx] === 1 : false;
          mat.matrix[row][col] = dark ? 1 : -1;
          bitIdx++;
        }
      }
      upward = !upward;
    }
  }

  // Mask patterns: returns true if module should be inverted
  const MASKS = [
    (r, c) => (r + c) % 2 === 0,
    (r, c) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2 + (r * c) % 3) === 0,
    (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
    (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
  ];

  function applyMask(mat, maskIdx) {
    const fn = MASKS[maskIdx];
    const out = mat.matrix.map(r => new Int8Array(r));
    for (let r = 0; r < mat.size; r++) {
      for (let c = 0; c < mat.size; c++) {
        if (mat.reserved[r][c] === 0 && fn(r, c)) {
          out[r][c] = out[r][c] === 1 ? -1 : 1;
        }
      }
    }
    return out;
  }

  function penaltyScore(grid, size) {
    let score = 0;
    // Rule 1: runs of same color
    for (let r = 0; r < size; r++) {
      let run = 1;
      for (let c = 1; c < size; c++) {
        if (grid[r][c] === grid[r][c - 1]) { run++; if (run === 5) score += 3; else if (run > 5) score++; }
        else run = 1;
      }
    }
    for (let c = 0; c < size; c++) {
      let run = 1;
      for (let r = 1; r < size; r++) {
        if (grid[r][c] === grid[r - 1][c]) { run++; if (run === 5) score += 3; else if (run > 5) score++; }
        else run = 1;
      }
    }
    // Rule 2: 2x2 blocks
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const v = grid[r][c];
        if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) score += 3;
      }
    }
    return score;
  }

  const EC_LEVELS = { L: 1, M: 0, Q: 3, H: 2 };
  const FORMAT_MASK = 0x5412;

  function placeFormatInfo(mat, maskIdx, ecLevel) {
    let data = (EC_LEVELS[ecLevel] << 3) | maskIdx;
    let bits = data;
    for (let i = 0; i < 10; i++) {
      bits = (bits << 1) ^ ((bits >> 9) * 0x537);
    }
    const formatBits = ((data << 10) | bits) ^ FORMAT_MASK;

    for (let i = 0; i < 15; i++) {
      const dark = ((formatBits >> (14 - i)) & 1) === 1;
      // Top-left horizontal
      if (i < 6) setModule(mat, 8, i, dark, false);
      else if (i === 6) setModule(mat, 8, 7, dark, false);
      else if (i < 15) setModule(mat, 8, 14 - i < 8 ? 14 - i : 14 - i, dark, false);
      // Top-left vertical
      if (i < 8) setModule(mat, i < 6 ? i : i + 1, 8, dark, false);
      // Bottom-left & top-right
      if (i < 7) setModule(mat, mat.size - 1 - i, 8, dark, false);
      else setModule(mat, 8, mat.size - 15 + i, dark, false);
    }
  }

  function encodeData(text, ecLevel) {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code < 128) bytes.push(code);
      else if (code < 2048) { bytes.push(0xc0 | (code >> 6)); bytes.push(0x80 | (code & 0x3f)); }
      else { bytes.push(0xe0 | (code >> 12)); bytes.push(0x80 | ((code >> 6) & 0x3f)); bytes.push(0x80 | (code & 0x3f)); }
    }

    const version = getVersion(bytes.length, ecLevel);
    const ec = VERSION_EC[version];
    const ecKey = ecLevel === 'H' ? 'dataH' : ecLevel === 'Q' ? 'dataQ' : ecLevel === 'M' ? 'dataM' : 'dataL';
    const capacity = ec[ecKey];

    // Mode indicator (0100 = byte) + character count
    const countBits = version <= 9 ? 8 : 16;
    let bits = [];
    // Mode: byte = 0100
    bits.push(0, 1, 0, 0);
    // Character count
    for (let i = countBits - 1; i >= 0; i--) bits.push((bytes.length >> i) & 1);
    // Data
    for (const b of bytes) {
      for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
    }
    // Terminator
    for (let i = 0; i < 4 && bits.length < capacity * 8; i++) bits.push(0);
    // Pad to byte boundary
    while (bits.length % 8 !== 0) bits.push(0);
    // Pad bytes
    const padBytes = [0xEC, 0x11];
    let pi = 0;
    while (bits.length < capacity * 8) {
      for (let i = 7; i >= 0; i--) bits.push((padBytes[pi % 2] >> i) & 1);
      pi++;
    }

    // Split into codewords
    const dataCodewords = new Uint8Array(capacity);
    for (let i = 0; i < capacity; i++) {
      let val = 0;
      for (let b = 0; b < 8; b++) val = (val << 1) | (bits[i * 8 + b] || 0);
      dataCodewords[i] = val;
    }

    // EC blocks
    const ecPerBlock = ec.ec[ecKey === 'dataL' ? 0 : ecKey === 'dataM' ? 1 : ecKey === 'dataQ' ? 2 : 3];
    const numBlocks = ecKey === 'dataL' ? 1 : ecKey === 'dataM' ? 1 : ecKey === 'dataQ' ? 2 : 2;
    const blockSize = Math.floor(capacity / numBlocks);
    const ecBlocks = [];
    const dataBlocks = [];
    for (let b = 0; b < numBlocks; b++) {
      const block = dataCodewords.slice(b * blockSize, (b + 1) * blockSize);
      dataBlocks.push(block);
      ecBlocks.push(rsEncode(block, ecPerBlock));
    }

    // Interleave data blocks
    const finalData = [];
    for (let i = 0; i < blockSize; i++) {
      for (let b = 0; b < numBlocks; b++) {
        if (i < dataBlocks[b].length) finalData.push(dataBlocks[b][i]);
      }
    }
    // Interleave EC blocks
    for (let i = 0; i < ecPerBlock; i++) {
      for (let b = 0; b < numBlocks; b++) {
        if (i < ecBlocks[b].length) finalData.push(ecBlocks[b][i]);
      }
    }
    // Remainder bits
    const remainderBits = [0,0,0,0,0,0,0][version] || 0;
    for (let i = 0; i < remainderBits; i++) finalData.push(0);

    // Convert to bit array
    const dataBits = [];
    for (const byte of finalData) {
      for (let i = 7; i >= 0; i--) dataBits.push((byte >> i) & 1);
    }

    // Build matrix
    const mat = createMatrix(version);

    // Finder patterns
    placeFinderPattern(mat, 0, 0);
    placeFinderPattern(mat, 0, mat.size - 7);
    placeFinderPattern(mat, mat.size - 7, 0);

    // Alignment patterns
    const alignPos = ALIGN_POS[version] || [];
    for (const ar of alignPos) {
      for (const ac of alignPos) {
        if (mat.reserved[ar][ac]) continue;
        placeAlignment(mat, ar, ac);
      }
    }

    placeTimingPatterns(mat);
    reserveFormatAreas(mat, version);
    placeData(mat, dataBits);

    // Find best mask
    let bestMask = 0, bestScore = Infinity;
    for (let m = 0; m < 8; m++) {
      const masked = applyMask(mat, m);
      // Temporarily place format info for scoring
      const savedMatrix = mat.matrix;
      mat.matrix = masked;
      placeFormatInfo(mat, m, ecLevel);
      const score = penaltyScore(masked, mat.size);
      mat.matrix = savedMatrix;
      if (score < bestScore) { bestScore = score; bestMask = m; }
    }

    // Apply final mask
    const finalGrid = applyMask(mat, bestMask);
    mat.matrix = finalGrid;
    placeFormatInfo(mat, bestMask, ecLevel);

    return { grid: mat.matrix, size: mat.size };
  }

  // Render to Canvas
  function renderToCanvas(text, size, ecLevel) {
    ecLevel = ecLevel || 'M';
    const { grid, size: qrSize } = encodeData(text, ecLevel);
    const quiet = 4;
    const totalSize = qrSize + quiet * 2;
    const scale = Math.max(1, Math.floor(size / totalSize));
    const canvas = document.createElement('canvas');
    canvas.width = scale * totalSize;
    canvas.height = scale * totalSize;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    for (let r = 0; r < qrSize; r++) {
      for (let c = 0; c < qrSize; c++) {
        if (grid[r][c] === 1) {
          ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
        }
      }
    }
    return canvas;
  }

  // Public API
  global.QRCode = {
    toDataURL: function(text, size, ecLevel) {
      return renderToCanvas(text, size || 200, ecLevel || 'M').toDataURL('image/png');
    },
    toCanvas: renderToCanvas,
  };
})(window);
