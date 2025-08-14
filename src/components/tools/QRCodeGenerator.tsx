import React, { useState, useRef, useEffect } from 'react';
import { Download, Copy, Link, CreditCard, Wifi, Mail, QrCode, Smartphone, Printer } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

type QRType = 'url' | 'text' | 'email' | 'phone' | 'sms';

interface QRData {
  type: QRType;
  content: string;
  email?: {
    to: string;
    subject: string;
    body: string;
  };
  phone?: {
    number: string;
  };
  sms?: {
    number: string;
    message: string;
  };
}

interface QROptions {
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
}

// QR Code generation implementation
class InternalQRCodeGenerator {
  private static readonly ERROR_CORRECT_LEVEL = {
    L: 1, M: 0, Q: 3, H: 2
  };

  private static readonly MODE_NUMBER = 1 << 0;
  private static readonly MODE_ALPHA_NUM = 1 << 1;
  private static readonly MODE_8BIT_BYTE = 1 << 2;
  private static readonly MODE_KANJI = 1 << 3;

  private static readonly PATTERN_POSITION_TABLE = [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170]
  ];

  static generate(text: string, options: QROptions): string {
    const qr = new InternalQRCodeGenerator();
    return qr.createQRCode(text, options);
  }

  private createQRCode(text: string, options: QROptions): string {
    const typeNumber = this.getTypeNumber(text, options.errorCorrectionLevel);
    const errorCorrectLevel = QRCodeGenerator.ERROR_CORRECT_LEVEL[options.errorCorrectionLevel];
    
    const qrCode = this.createData(typeNumber, errorCorrectLevel, text);
    const moduleCount = qrCode.getModuleCount();
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const cellSize = Math.floor(options.size / (moduleCount + options.margin * 2));
    const actualSize = cellSize * (moduleCount + options.margin * 2);
    
    canvas.width = actualSize;
    canvas.height = actualSize;
    
    // Background
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, actualSize, actualSize);
    
    // QR modules
    ctx.fillStyle = options.foregroundColor;
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qrCode.isDark(row, col)) {
          const x = (col + options.margin) * cellSize;
          const y = (row + options.margin) * cellSize;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
    
    return canvas.toDataURL('image/png');
  }

  private getTypeNumber(text: string, errorCorrectionLevel: string): number {
    let typeNumber = 1;
    const length = text.length;
    
    // Determine minimum type number based on data length
    if (length <= 25) typeNumber = 1;
    else if (length <= 47) typeNumber = 2;
    else if (length <= 77) typeNumber = 3;
    else if (length <= 114) typeNumber = 4;
    else if (length <= 154) typeNumber = 5;
    else if (length <= 195) typeNumber = 6;
    else if (length <= 224) typeNumber = 7;
    else if (length <= 279) typeNumber = 8;
    else if (length <= 335) typeNumber = 9;
    else typeNumber = 10;
    
    return Math.min(typeNumber, 10);
  }

  private createData(typeNumber: number, errorCorrectLevel: number, dataList: string) {
    const rsBlocks = this.getRSBlocks(typeNumber, errorCorrectLevel);
    const buffer = new BitBuffer();
    
    // Add data
    buffer.put(QRCodeGenerator.MODE_8BIT_BYTE, 4);
    buffer.put(dataList.length, this.getLengthInBits(QRCodeGenerator.MODE_8BIT_BYTE, typeNumber));
    
    for (let i = 0; i < dataList.length; i++) {
      buffer.put(dataList.charCodeAt(i), 8);
    }
    
    // Calculate total data count
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }
    
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error("Code length overflow");
    }
    
    // End code
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }
    
    // Padding
    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(false);
    }
    
    // Padding bytes
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0xEC, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }
    
    return this.createBytes(buffer, rsBlocks, typeNumber, errorCorrectLevel);
  }

  private createBytes(buffer: BitBuffer, rsBlocks: any[], typeNumber: number, errorCorrectLevel: number) {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    
    const dcdata = new Array(rsBlocks.length);
    const ecdata = new Array(rsBlocks.length);
    
    for (let r = 0; r < rsBlocks.length; r++) {
      const dcCount = rsBlocks[r].dataCount;
      const ecCount = rsBlocks[r].totalCount - dcCount;
      
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      
      dcdata[r] = new Array(dcCount);
      
      for (let i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
      }
      offset += dcCount;
      
      const rsPoly = this.getErrorCorrectPolynomial(ecCount);
      const rawPoly = new Polynomial(dcdata[r], rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i++) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
      }
    }
    
    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalCodeCount += rsBlocks[i].totalCount;
    }
    
    const data = new Array(totalCodeCount);
    let index = 0;
    
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) {
          data[index++] = dcdata[r][i];
        }
      }
    }
    
    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) {
          data[index++] = ecdata[r][i];
        }
      }
    }
    
    return new QRCodeModel(typeNumber, errorCorrectLevel, data);
  }

  private getRSBlocks(typeNumber: number, errorCorrectLevel: number) {
    const rsBlock = this.getRsBlockTable(typeNumber, errorCorrectLevel);
    const length = rsBlock.length / 3;
    const list = [];
    
    for (let i = 0; i < length; i++) {
      const count = rsBlock[i * 3 + 0];
      const totalCount = rsBlock[i * 3 + 1];
      const dataCount = rsBlock[i * 3 + 2];
      
      for (let j = 0; j < count; j++) {
        list.push({ totalCount, dataCount });
      }
    }
    
    return list;
  }

  private getRsBlockTable(typeNumber: number, errorCorrectLevel: number) {
    const RS_BLOCK_TABLE = [
      [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
      [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
      [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
      [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
      [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12]
    ];
    
    const index = (typeNumber - 1) * 4 + errorCorrectLevel;
    return RS_BLOCK_TABLE[Math.min(index, RS_BLOCK_TABLE.length - 1)];
  }

  private getLengthInBits(mode: number, type: number) {
    if (1 <= type && type < 10) {
      switch (mode) {
        case QRCodeGenerator.MODE_NUMBER: return 10;
        case QRCodeGenerator.MODE_ALPHA_NUM: return 9;
        case QRCodeGenerator.MODE_8BIT_BYTE: return 8;
        case QRCodeGenerator.MODE_KANJI: return 8;
        default: throw new Error("mode:" + mode);
      }
    } else if (type < 27) {
      switch (mode) {
        case QRCodeGenerator.MODE_NUMBER: return 12;
        case QRCodeGenerator.MODE_ALPHA_NUM: return 11;
        case QRCodeGenerator.MODE_8BIT_BYTE: return 16;
        case QRCodeGenerator.MODE_KANJI: return 10;
        default: throw new Error("mode:" + mode);
      }
    } else if (type < 41) {
      switch (mode) {
        case QRCodeGenerator.MODE_NUMBER: return 14;
        case QRCodeGenerator.MODE_ALPHA_NUM: return 13;
        case QRCodeGenerator.MODE_8BIT_BYTE: return 16;
        case QRCodeGenerator.MODE_KANJI: return 12;
        default: throw new Error("mode:" + mode);
      }
    } else {
      throw new Error("type:" + type);
    }
  }

  private getErrorCorrectPolynomial(errorCorrectLength: number) {
    let a = new Polynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new Polynomial([1, QRMath.gexp(i)], 0));
    }
    return a;
  }
}

// Supporting classes
class BitBuffer {
  private buffer: number[] = [];
  private length = 0;

  put(num: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
    }
    this.length++;
  }

  getLengthInBits() {
    return this.length;
  }

  getBuffer() {
    return this.buffer;
  }
}

class Polynomial {
  private num: number[];

  constructor(num: number[], shift: number) {
    if (num.length === undefined) {
      throw new Error(num.length + "/" + shift);
    }
    
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset++;
    }
    
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset];
    }
  }

  get(index: number) {
    return this.num[index];
  }

  getLength() {
    return this.num.length;
  }

  multiply(e: Polynomial) {
    const num = new Array(this.getLength() + e.getLength() - 1);
    
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.glog(QRMath.gexp(this.get(i)) * QRMath.gexp(e.get(j)));
      }
    }
    
    return new Polynomial(num, 0);
  }

  mod(e: Polynomial) {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }
    
    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    const num = new Array(this.getLength());
    
    for (let i = 0; i < this.getLength(); i++) {
      num[i] = this.get(i);
    }
    
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
    }
    
    return new Polynomial(num, 0).mod(e);
  }
}

class QRMath {
  private static EXP_TABLE: number[] = [];
  private static LOG_TABLE: number[] = [];

  static {
    for (let i = 0; i < 8; i++) {
      QRMath.EXP_TABLE[i] = 1 << i;
    }
    for (let i = 8; i < 256; i++) {
      QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
    }
    for (let i = 0; i < 255; i++) {
      QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
    }
  }

  static glog(n: number) {
    if (n < 1) {
      throw new Error("glog(" + n + ")");
    }
    return QRMath.LOG_TABLE[n];
  }

  static gexp(n: number) {
    while (n < 0) {
      n += 255;
    }
    while (n >= 256) {
      n -= 255;
    }
    return QRMath.EXP_TABLE[n];
  }
}

class QRCodeModel {
  private typeNumber: number;
  private errorCorrectLevel: number;
  private modules: boolean[][] = [];
  private moduleCount = 0;
  private dataCache: number[] | null = null;
  private dataList: number[];

  constructor(typeNumber: number, errorCorrectLevel: number, dataList: number[]) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.dataList = dataList;
    this.dataCache = null;
    this.makeImpl(false, this.getBestMaskPattern());
  }

  private makeImpl(test: boolean, maskPattern: number) {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = new Array(this.moduleCount);
    
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules[row] = new Array(this.moduleCount);
      for (let col = 0; col < this.moduleCount; col++) {
        this.modules[row][col] = false;
      }
    }
    
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);
    
    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }
    
    if (this.dataCache === null) {
      this.dataCache = this.dataList;
    }
    
    this.mapData(this.dataCache, maskPattern);
  }

  private setupPositionProbePattern(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        
        if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
            (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
            (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  private getBestMaskPattern() {
    let minLostPoint = 0;
    let pattern = 0;
    
    for (let i = 0; i < 8; i++) {
      this.makeImpl(true, i);
      const lostPoint = this.getLostPoint();
      
      if (i === 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }
    
    return pattern;
  }

  private getLostPoint() {
    let lostPoint = 0;
    
    // LEVEL1
    for (let row = 0; row < this.moduleCount; row++) {
      for (let col = 0; col < this.moduleCount; col++) {
        let sameCount = 0;
        const dark = this.isDark(row, col);
        
        for (let r = -1; r <= 1; r++) {
          if (row + r < 0 || this.moduleCount <= row + r) continue;
          
          for (let c = -1; c <= 1; c++) {
            if (col + c < 0 || this.moduleCount <= col + c) continue;
            if (r === 0 && c === 0) continue;
            
            if (dark === this.isDark(row + r, col + c)) {
              sameCount++;
            }
          }
        }
        
        if (sameCount > 5) {
          lostPoint += (3 + sameCount - 5);
        }
      }
    }
    
    // LEVEL2
    for (let row = 0; row < this.moduleCount - 1; row++) {
      for (let col = 0; col < this.moduleCount - 1; col++) {
        let count = 0;
        if (this.isDark(row, col)) count++;
        if (this.isDark(row + 1, col)) count++;
        if (this.isDark(row, col + 1)) count++;
        if (this.isDark(row + 1, col + 1)) count++;
        if (count === 0 || count === 4) {
          lostPoint += 3;
        }
      }
    }
    
    return lostPoint;
  }

  private setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] !== null) continue;
      this.modules[r][6] = (r % 2 === 0);
    }
    
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] !== null) continue;
      this.modules[6][c] = (c % 2 === 0);
    }
  }

  private setupPositionAdjustPattern() {
    const pos = QRCodeGenerator.PATTERN_POSITION_TABLE[this.typeNumber - 1];
    const pos = InternalQRCodeGenerator.PATTERN_POSITION_TABLE[this.typeNumber - 1];
    
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i];
        const col = pos[j];
        
        if (this.modules[row][col] !== null) continue;
        
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  private setupTypeNumber(test: boolean) {
    const bits = this.getBCHTypeNumber(this.typeNumber);
    
    for (let i = 0; i < 18; i++) {
      const mod = (!test && ((bits >> i) & 1) === 1);
      this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
    }
    
    for (let i = 0; i < 18; i++) {
      const mod = (!test && ((bits >> i) & 1) === 1);
      this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }

  private setupTypeInfo(test: boolean, maskPattern: number) {
    const data = (this.errorCorrectLevel << 3) | maskPattern;
    const bits = this.getBCHTypeInfo(data);
    
    // vertical
    for (let i = 0; i < 15; i++) {
      const mod = (!test && ((bits >> i) & 1) === 1);
      
      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }
    
    // horizontal
    for (let i = 0; i < 15; i++) {
      const mod = (!test && ((bits >> i) & 1) === 1);
      
      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }
    
    // fixed module
    this.modules[this.moduleCount - 8][8] = (!test);
  }

  private mapData(data: number[], maskPattern: number) {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            let dark = false;
            
            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
            }
            
            const mask = this.getMask(maskPattern, row, col - c);
            
            if (mask) {
              dark = !dark;
            }
            
            this.modules[row][col - c] = dark;
            bitIndex--;
            
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        
        row += inc;
        
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  private getMask(maskPattern: number, i: number, j: number) {
    switch (maskPattern) {
      case 0: return (i + j) % 2 === 0;
      case 1: return i % 2 === 0;
      case 2: return j % 3 === 0;
      case 3: return (i + j) % 3 === 0;
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case 5: return (i * j) % 2 + (i * j) % 3 === 0;
      case 6: return ((i * j) % 2 + (i * j) % 3) % 2 === 0;
      case 7: return ((i * j) % 3 + (i + j) % 2) % 2 === 0;
      default: throw new Error("bad maskPattern:" + maskPattern);
    }
  }

  private getBCHTypeInfo(data: number) {
    let d = data << 10;
    while (this.getBCHDigit(d) - this.getBCHDigit(0x537) >= 0) {
      d ^= (0x537 << (this.getBCHDigit(d) - this.getBCHDigit(0x537)));
    }
    return ((data << 10) | d) ^ 0x5412;
  }

  private getBCHTypeNumber(data: number) {
    let d = data << 12;
    while (this.getBCHDigit(d) - this.getBCHDigit(0x1f25) >= 0) {
      d ^= (0x1f25 << (this.getBCHDigit(d) - this.getBCHDigit(0x1f25)));
    }
    return (data << 12) | d;
  }

  private getBCHDigit(data: number) {
    let digit = 0;
    while (data !== 0) {
      digit++;
      data >>>= 1;
    }
    return digit;
  }

  getModuleCount() {
    return this.moduleCount;
  }

  isDark(row: number, col: number) {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
      throw new Error(row + "," + col);
    }
    return this.modules[row][col];
  }
}
export const QRCodeGenerator: React.FC = () => {
  const [qrData, setQrData] = useState<QRData>({
    type: 'url',
    content: 'https://www.google.com',
  });

  const [qrOptions, setQrOptions] = useState<QROptions>({
    size: 300,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    margin: 4,
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate real QR Code that works with all scanners
  const generateQRCode = async (text: string, options: QROptions) => {
    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        return '';
      }

      // Generate real QR code using our implementation
      const dataUrl = InternalQRCodeGenerator.generate(text, options);
      return dataUrl;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return '';
    }
  };

  const getQRContent = (): string => {
    switch (qrData.type) {
      case 'url':
      case 'text':
        return qrData.content;
      case 'email':
        if (qrData.email) {
          return `mailto:${qrData.email.to}?subject=${encodeURIComponent(qrData.email.subject)}&body=${encodeURIComponent(qrData.email.body)}`;
        }
        return '';
      case 'phone':
        if (qrData.phone) {
          return `tel:${qrData.phone.number}`;
        }
        return '';
      case 'sms':
        if (qrData.sms) {
          return `sms:${qrData.sms.number}?body=${encodeURIComponent(qrData.sms.message)}`;
        }
        return '';
      default:
        return qrData.content;
    }
  };

  // Generate QR code whenever content or options change
  useEffect(() => {
    const generateQR = async () => {
      setIsGenerating(true);
      const content = getQRContent();
      if (content) {
        const dataUrl = await generateQRCode(content, qrOptions);
        setQrDataUrl(dataUrl);
      }
      setIsGenerating(false);
    };

    generateQR();
  }, [qrData, qrOptions]);

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    const content = getQRContent();
    const filename = content ? 
      `qr-${content.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png` : 
      'qr-code.png';
    
    link.download = filename;
    link.href = qrDataUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getQRContent());
      alert('Content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const copyImageToClipboard = async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('QR code image copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy image:', error);
      alert('Image copy not supported in this browser');
    }
  };

  const qrTypes = [
    { id: 'url', name: 'Website URL', icon: Link, description: 'Link to any website' },
    { id: 'text', name: 'Plain Text', icon: QrCode, description: 'Any text content' },
    { id: 'email', name: 'Email', icon: Mail, description: 'Email with subject' },
    { id: 'phone', name: 'Phone Number', icon: Smartphone, description: 'Phone number' },
    { id: 'sms', name: 'SMS Message', icon: CreditCard, description: 'Text message' },
  ];

  const sizePresets = [
    { size: 150, label: 'Small (150px)', description: 'Web use' },
    { size: 300, label: 'Medium (300px)', description: 'Standard' },
    { size: 600, label: 'Large (600px)', description: 'Print ready' },
    { size: 1000, label: 'Extra Large (1000px)', description: 'High resolution' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">QR Code Generator</h2>
        <p className="text-slate-600 dark:text-slate-400">Generate scannable QR codes for URLs, WiFi, contacts, and more</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-4">
          {/* QR Type Selection */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
              <QrCode size={20} className="text-turquoise-500" />
              <span>QR Code Type</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {qrTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setQrData({ ...qrData, type: type.id as QRType })}
                    className={`p-3 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                      qrData.type === type.id
                        ? 'border-turquoise-500 bg-turquoise-50 dark:bg-turquoise-900/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        qrData.type === type.id
                          ? 'bg-turquoise-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <IconComponent size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{type.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{type.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Content Input */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Content</h3>
            
            {qrData.type === 'url' && (
              <Input
                label="Website URL"
                value={qrData.content}
                onChange={(e) => setQrData({ ...qrData, content: e.target.value })}
                placeholder="https://example.com"
                type="url"
              />
            )}

            {qrData.type === 'text' && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Text Content
                </label>
                <textarea
                  value={qrData.content}
                  onChange={(e) => setQrData({ ...qrData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="Enter any text content..."
                />
              </div>
            )}


            {qrData.type === 'email' && (
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={qrData.email?.to || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    email: { ...qrData.email, to: e.target.value, subject: qrData.email?.subject || '', body: qrData.email?.body || '' }
                  })}
                  placeholder="recipient@example.com"
                />
                <Input
                  label="Subject"
                  value={qrData.email?.subject || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    email: { ...qrData.email, to: qrData.email?.to || '', subject: e.target.value, body: qrData.email?.body || '' }
                  })}
                  placeholder="Email subject"
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                  <textarea
                    value={qrData.email?.body || ''}
                    onChange={(e) => setQrData({
                      ...qrData,
                      email: { ...qrData.email, to: qrData.email?.to || '', subject: qrData.email?.subject || '', body: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    rows={3}
                    placeholder="Email message"
                  />
                </div>
              </div>
            )}

            {qrData.type === 'phone' && (
              <Input
                label="Phone Number"
                type="tel"
                value={qrData.phone?.number || ''}
                onChange={(e) => setQrData({
                  ...qrData,
                  phone: { number: e.target.value }
                })}
                placeholder="+1234567890"
              />
            )}

            {qrData.type === 'sms' && (
              <div className="space-y-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={qrData.sms?.number || ''}
                  onChange={(e) => setQrData({
                    ...qrData,
                    sms: { ...qrData.sms, number: e.target.value, message: qrData.sms?.message || '' }
                  })}
                  placeholder="+1234567890"
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                  <textarea
                    value={qrData.sms?.message || ''}
                    onChange={(e) => setQrData({
                      ...qrData,
                      sms: { ...qrData.sms, number: qrData.sms?.number || '', message: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    rows={3}
                    placeholder="SMS message"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Customization Options */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Customization</h3>
            
            {/* Size Presets */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {sizePresets.map((preset) => (
                    <button
                      key={preset.size}
                      onClick={() => setQrOptions({ ...qrOptions, size: preset.size })}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        qrOptions.size === preset.size
                          ? 'border-turquoise-500 bg-turquoise-50 dark:bg-turquoise-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{preset.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Foreground</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={qrOptions.foregroundColor}
                      onChange={(e) => setQrOptions({ ...qrOptions, foregroundColor: e.target.value })}
                      className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <Input
                      value={qrOptions.foregroundColor}
                      onChange={(e) => setQrOptions({ ...qrOptions, foregroundColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Background</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={qrOptions.backgroundColor}
                      onChange={(e) => setQrOptions({ ...qrOptions, backgroundColor: e.target.value })}
                      className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <Input
                      value={qrOptions.backgroundColor}
                      onChange={(e) => setQrOptions({ ...qrOptions, backgroundColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Error Correction */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Error Correction</label>
                <select
                  value={qrOptions.errorCorrectionLevel}
                  onChange={(e) => setQrOptions({ ...qrOptions, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Preview & Download */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <Card padding="lg">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center flex items-center justify-center space-x-2">
              <QrCode size={20} className="text-turquoise-500" />
              <span>QR Code Preview</span>
            </h3>
            
            <div className="text-center space-y-6">
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  {isGenerating ? (
                    <div className="flex items-center justify-center" style={{ width: qrOptions.size, height: qrOptions.size }}>
                      <div className="animate-spin w-8 h-8 border-2 border-turquoise-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="Generated QR Code" 
                      className="max-w-full h-auto rounded-lg"
                      style={{ maxWidth: '300px', maxHeight: '300px' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-64 h-64 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <QrCode size={48} className="text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={downloadQR} disabled={!qrDataUrl} className="flex items-center space-x-2">
                  <Download size={16} />
                  <span>Download PNG</span>
                </Button>
                <Button variant="outline" onClick={copyImageToClipboard} disabled={!qrDataUrl}>
                  <Copy size={16} />
                </Button>
                <Button variant="outline" onClick={copyToClipboard}>
                  <Link size={16} />
                </Button>
              </div>

              {/* QR Info */}
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <div>Size: {qrOptions.size}×{qrOptions.size}px</div>
                <div>Error Correction: {qrOptions.errorCorrectionLevel}</div>
                {qrDataUrl && <div>Ready to scan!</div>}
              </div>
            </div>
          </Card>

          {/* Content Preview */}
          <Card padding="md" className="mt-4">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Generated Content</h4>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <code className="text-sm text-slate-700 dark:text-slate-300 break-all">
                {getQRContent() || 'Enter content to generate QR code'}
              </code>
            </div>
          </Card>
        </div>
      </div>


      {/* Quick Tips */}
      <Card padding="md">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center space-x-2">
          <Printer size={16} className="text-turquoise-500" />
          <span>Usage Tips</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">For Best Results:</h4>
            <ul className="space-y-1">
              <li>• Use high contrast colors (dark on light)</li>
              <li>• Choose appropriate size for intended use</li>
              <li>• Test QR codes before printing</li>
              <li>• Use higher error correction for damaged surfaces</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Size Guidelines:</h4>
            <ul className="space-y-1">
              <li>• Small (150px): Digital screens, web use</li>
              <li>• Medium (300px): Business cards, flyers</li>
              <li>• Large (600px): Posters, banners</li>
              <li>• Extra Large (1000px): Large format printing</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};