/**
 * 桃源农场 UI 控件库 v2.0
 * 像素风格，对标原始按钮素材
 */

class PixelButton {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} opts
   * @param {string}  opts.text
   * @param {number}  opts.x
   * @param {number}  opts.y
   * @param {number}  opts.w
   * @param {number}  opts.h
   * @param {string}  [opts.style]   'yellow'|'red'|'blue'|'gray'
   * @param {number}  [opts.fontSize]
   * @param {boolean} [opts.disabled]
   */
  constructor(canvas, opts = {}) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.text     = opts.text     ?? '按钮';
    this.x        = opts.x       ?? 0;
    this.y        = opts.y       ?? 0;
    this.w        = opts.w       ?? 240;
    this.h        = opts.h       ?? 64;
    this.style    = opts.style   ?? 'yellow';
    this.fontSize = opts.fontSize ?? null;
    this.disabled = opts.disabled ?? false;
    this.pressed  = false;
    this.onClick  = null;

    this.themes = {
      yellow: {
        shadow:      '#5a1a00',   // 底部阴影（最深）
        outer:       '#b83a0c',   // 外层橙红
        outerLight:  '#e05a20',   // 外层亮面（上边）
        innerBorder: '#f0a830',   // 黄色内边框
        bgFrom:      '#ffd840',   // 背景渐变（左亮）
        bgTo:        '#f0a020',   // 背景渐变（右暗）
        hlColor:     'rgba(255,255,255,0.85)',
        textColor:   '#ffffff',
        textStroke:  '#7a2000',
      },
      red: {
        shadow:      '#3a0000',
        outer:       '#8b0000',
        outerLight:  '#cc2020',
        innerBorder: '#ff6060',
        bgFrom:      '#e84040',
        bgTo:        '#b01818',
        hlColor:     'rgba(255,255,255,0.6)',
        textColor:   '#ffffff',
        textStroke:  '#500000',
      },
      blue: {
        shadow:      '#001040',
        outer:       '#0030a0',
        outerLight:  '#2060e0',
        innerBorder: '#60a0ff',
        bgFrom:      '#4080e0',
        bgTo:        '#1848b0',
        hlColor:     'rgba(255,255,255,0.5)',
        textColor:   '#ffffff',
        textStroke:  '#001060',
      },
      gray: {
        shadow:      '#111',
        outer:       '#333',
        outerLight:  '#555',
        innerBorder: '#888',
        bgFrom:      '#777',
        bgTo:        '#444',
        hlColor:     'rgba(255,255,255,0.2)',
        textColor:   '#ccc',
        textStroke:  '#111',
      },
    };

    this._bindEvents();
  }

  draw() {
    const { ctx, x, y, w, h, disabled, pressed } = this;
    const t = disabled ? this.themes.gray : (this.themes[this.style] || this.themes.yellow);
    const dy = pressed ? 2 : 0;          // 按下时整体下移
    const shadowH = pressed ? 0 : 3;     // 底部阴影高度

    // 像素边框厚度（按高度比例）
    const b  = Math.max(3, Math.round(h * 0.10));  // 外层厚度
    const b2 = Math.max(2, Math.round(h * 0.055)); // 内层厚度
    // 像素斜切角大小（固定像素风，不用圆弧）
    const cut = Math.max(3, Math.round(h * 0.14));

    ctx.save();
    ctx.imageSmoothingEnabled = false; // 像素锐化

    // ── 1. 底部阴影 ──
    if (!pressed) {
      ctx.fillStyle = t.shadow;
      this._pixelRect(ctx, x + cut, y + h - shadowH + dy, w - cut * 2, shadowH);
      this._pixelRect(ctx, x + cut + b, y + h - shadowH + 1 + dy, w - (cut + b) * 2, shadowH - 1);
    }

    // ── 2. 最外层橙红（带斜切角） ──
    ctx.fillStyle = t.outer;
    this._cutRect(ctx, x, y + dy, w, h - shadowH, cut);
    ctx.fill();

    // 上边缘亮色（高光）
    ctx.fillStyle = t.outerLight;
    this._pixelRect(ctx, x + cut, y + dy, w - cut * 2, Math.max(2, Math.round(b * 0.4)));

    // ── 3. 内层黄色边框 ──
    ctx.fillStyle = t.innerBorder;
    this._cutRect(ctx, x + b, y + b + dy, w - b * 2, h - b * 2 - shadowH, cut - Math.round(cut * 0.4));
    ctx.fill();

    // ── 4. 主体背景（渐变） ──
    const bx = x + b + b2;
    const by = y + b + b2 + dy;
    const bw = w - (b + b2) * 2;
    const bh = h - (b + b2) * 2 - shadowH;
    const cutInner = Math.max(1, cut - Math.round(cut * 0.7));

    const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
    grad.addColorStop(0,    t.bgFrom);
    grad.addColorStop(0.45, t.bgFrom);
    grad.addColorStop(1,    t.bgTo);
    ctx.fillStyle = grad;
    this._cutRect(ctx, bx, by, bw, bh, cutInner);
    ctx.fill();

    // ── 5. 像素高光（左上角小方块） ──
    const px = Math.max(2, Math.round(h * 0.07));
    const hx = bx + px * 2;
    const hy = by + px;
    ctx.fillStyle = t.hlColor;
    // 3个高光像素块
    ctx.fillRect(hx,          hy,          px, px);
    ctx.fillRect(hx + px * 2, hy,          px, px);
    ctx.fillRect(hx,          hy + px * 2, px, px);

    // ── 6. 文字 ──
    const fs = this.fontSize ?? Math.round(h * 0.44);
    ctx.font         = `900 ${fs}px "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const tx = x + w / 2;
    const ty = y + h / 2 + dy - Math.round(shadowH / 2);

    // 描边（像素轮廓）
    ctx.strokeStyle = t.textStroke;
    ctx.lineWidth   = Math.max(3, Math.round(fs * 0.14));
    ctx.lineJoin    = 'round';
    ctx.strokeText(this.text, tx, ty);
    // 填色
    ctx.fillStyle   = t.textColor;
    ctx.fillText(this.text, tx, ty);

    ctx.restore();
  }

  // ── 像素斜切角矩形路径 ──────────────────
  _cutRect(ctx, x, y, w, h, cut) {
    ctx.beginPath();
    ctx.moveTo(x + cut, y);
    ctx.lineTo(x + w - cut, y);
    ctx.lineTo(x + w, y + cut);
    ctx.lineTo(x + w, y + h - cut);
    ctx.lineTo(x + w - cut, y + h);
    ctx.lineTo(x + cut, y + h);
    ctx.lineTo(x, y + h - cut);
    ctx.lineTo(x, y + cut);
    ctx.closePath();
  }

  _pixelRect(ctx, x, y, w, h) {
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  // ── 命中检测 ─────────────────────────────
  _hit(px, py) {
    return px >= this.x && px <= this.x + this.w &&
           py >= this.y && py <= this.y + this.h;
  }

  // ── 事件绑定 ─────────────────────────────
  _bindEvents() {
    const el = this.canvas;
    const getPos = (e) => {
      const rect = el.getBoundingClientRect();
      const sx = el.width  / rect.width;
      const sy = el.height / rect.height;
      const src = e.touches ? e.touches[0] : e;
      return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
    };
    const onDown = (e) => {
      if (this.disabled) return;
      const p = getPos(e);
      if (this._hit(p.x, p.y)) { this.pressed = true; this.draw(); e.preventDefault(); }
    };
    const onUp = (e) => {
      if (!this.pressed) return;
      this.pressed = false;
      const p = getPos(e);
      this.draw();
      if (this._hit(p.x, p.y) && this.onClick) this.onClick();
    };
    el.addEventListener('mousedown',  onDown);
    el.addEventListener('mouseup',    onUp);
    el.addEventListener('mouseleave', () => { if (this.pressed) { this.pressed = false; this.draw(); } });
    el.addEventListener('touchstart', onDown, { passive: false });
    el.addEventListener('touchend',   onUp,   { passive: false });
  }
}


/** PixelLabel — 像素风文字标签 */
class PixelLabel {
  constructor(canvas, opts = {}) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.text     = opts.text     ?? '';
    this.x        = opts.x       ?? 0;
    this.y        = opts.y       ?? 0;
    this.fontSize = opts.fontSize ?? 20;
    this.color    = opts.color    ?? '#ffffff';
    this.stroke   = opts.stroke   ?? '#000000';
    this.align    = opts.align    ?? 'left';
    this.baseline = opts.baseline ?? 'top';
  }
  draw() {
    const { ctx, x, y, fontSize, color, stroke, align, baseline } = this;
    ctx.save();
    ctx.font         = `900 ${fontSize}px "PingFang SC","Microsoft YaHei","SimHei",sans-serif`;
    ctx.textAlign    = align;
    ctx.textBaseline = baseline;
    ctx.strokeStyle  = stroke;
    ctx.lineWidth    = Math.max(2, fontSize * 0.12);
    ctx.lineJoin     = 'round';
    ctx.strokeText(this.text, x, y);
    ctx.fillStyle    = color;
    ctx.fillText(this.text, x, y);
    ctx.restore();
  }
}


/** PixelPanel — 像素风面板背景框 */
class PixelPanel {
  constructor(canvas, opts = {}) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.x       = opts.x       ?? 0;
    this.y       = opts.y       ?? 0;
    this.w       = opts.w       ?? 200;
    this.h       = opts.h       ?? 100;
    this.bgColor = opts.bgColor ?? 'rgba(0,20,0,0.9)';
    this.border  = opts.border  ?? '#4caf50';
    this.cut     = opts.cut     ?? 8;
  }
  draw() {
    const { ctx, x, y, w, h, bgColor, border, cut } = this;
    ctx.save();
    // 外边框
    ctx.fillStyle = border;
    this._cutRect(ctx, x, y, w, h, cut); ctx.fill();
    // 内填充
    const b = 2;
    ctx.fillStyle = bgColor;
    this._cutRect(ctx, x + b, y + b, w - b*2, h - b*2, Math.max(1, cut - b)); ctx.fill();
    // 内高光线
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    this._cutRect(ctx, x + b*2, y + b*2, w - b*4, h - b*4, Math.max(1, cut - b*2)); ctx.stroke();
    ctx.restore();
  }
  _cutRect(ctx, x, y, w, h, cut) {
    ctx.beginPath();
    ctx.moveTo(x + cut, y);
    ctx.lineTo(x + w - cut, y);
    ctx.lineTo(x + w, y + cut);
    ctx.lineTo(x + w, y + h - cut);
    ctx.lineTo(x + w - cut, y + h);
    ctx.lineTo(x + cut, y + h);
    ctx.lineTo(x, y + h - cut);
    ctx.lineTo(x, y + cut);
    ctx.closePath();
  }
}

if (typeof module !== 'undefined') {
  module.exports = { PixelButton, PixelLabel, PixelPanel };
}
