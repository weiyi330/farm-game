/**
 * 桃源农场 UI 控件库 v1.0
 * 纯 Canvas 绘制，零图片依赖
 * 用法：
 *   const btn = new PixelButton(canvas, { text: '登录游戏', x, y, w, h });
 *   btn.draw();
 *   btn.onClick = () => { ... };
 */

class PixelButton {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} opts
   * @param {string}  opts.text       - 按钮文字
   * @param {number}  opts.x          - 左上角 x
   * @param {number}  opts.y          - 左上角 y
   * @param {number}  opts.w          - 宽度
   * @param {number}  opts.h          - 高度
   * @param {string}  [opts.style]    - 'yellow'(默认) | 'red' | 'blue' | 'gray'
   * @param {number}  [opts.fontSize] - 字号（默认按高度自动）
   * @param {boolean} [opts.disabled] - 是否禁用
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.text   = opts.text    ?? '按钮';
    this.x      = opts.x      ?? 0;
    this.y      = opts.y      ?? 0;
    this.w      = opts.w      ?? 200;
    this.h      = opts.h      ?? 60;
    this.style  = opts.style  ?? 'yellow';
    this.fontSize = opts.fontSize ?? null;
    this.disabled = opts.disabled ?? false;
    this.pressed  = false;
    this.onClick  = null;

    // 颜色主题
    this.themes = {
      yellow: {
        outerBorder:  '#c8440a',   // 最外层橙红边
        innerBorder:  '#f5c842',   // 内层亮黄边
        bgFrom:       '#f5d84a',   // 背景渐变左（亮黄）
        bgTo:         '#e8a828',   // 背景渐变右（深黄）
        shadow:       '#7a2a00',   // 底部阴影
        highlight:    'rgba(255,255,255,0.7)', // 高光点
        textColor:    '#ffffff',
        textStroke:   '#c8440a',
      },
      red: {
        outerBorder:  '#8b0000',
        innerBorder:  '#ff6666',
        bgFrom:       '#e84040',
        bgTo:         '#b82020',
        shadow:       '#500000',
        highlight:    'rgba(255,255,255,0.5)',
        textColor:    '#ffffff',
        textStroke:   '#8b0000',
      },
      blue: {
        outerBorder:  '#003080',
        innerBorder:  '#66aaff',
        bgFrom:       '#4080e0',
        bgTo:         '#2050b0',
        shadow:       '#001050',
        highlight:    'rgba(255,255,255,0.5)',
        textColor:    '#ffffff',
        textStroke:   '#003080',
      },
      gray: {
        outerBorder:  '#444',
        innerBorder:  '#aaa',
        bgFrom:       '#888',
        bgTo:         '#555',
        shadow:       '#222',
        highlight:    'rgba(255,255,255,0.3)',
        textColor:    '#ddd',
        textStroke:   '#222',
      },
    };

    this._bindEvents();
  }

  // ── 核心绘制 ──────────────────────────────
  draw() {
    const { ctx, x, y, w, h, disabled, pressed } = this;
    const t = this.themes[this.style] || this.themes.yellow;

    // 按下偏移
    const dy = pressed ? 3 : 0;

    // 像素圆角（固定4px像素风）
    const r = Math.max(4, Math.floor(h * 0.18));
    // 边框层厚度
    const b1 = Math.max(3, Math.floor(h * 0.09));  // 外层边框
    const b2 = Math.max(2, Math.floor(h * 0.06));  // 内层边框

    ctx.save();

    // 1. 底部阴影（按下时消失）
    if (!pressed) {
      ctx.fillStyle = t.shadow;
      this._roundRect(ctx, x + 2, y + h - b1 + dy + 3, w - 2, b1, r);
      ctx.fill();
    }

    // 2. 最外层橙红边框
    ctx.fillStyle = disabled ? '#666' : t.outerBorder;
    this._roundRect(ctx, x, y + dy, w, h - (pressed ? 0 : 3), r);
    ctx.fill();

    // 3. 内层亮黄边框
    ctx.fillStyle = disabled ? '#888' : t.innerBorder;
    this._roundRect(ctx, x + b1, y + b1 + dy, w - b1 * 2, h - b1 * 2 - (pressed ? 0 : 3), r - 1);
    ctx.fill();

    // 4. 主体背景渐变
    const grad = ctx.createLinearGradient(x + b1 + b2, y, x + w - b1 - b2, y);
    if (disabled) {
      grad.addColorStop(0, '#999');
      grad.addColorStop(1, '#666');
    } else {
      grad.addColorStop(0, t.bgFrom);
      grad.addColorStop(1, t.bgTo);
    }
    ctx.fillStyle = grad;
    this._roundRect(ctx, x + b1 + b2, y + b1 + b2 + dy, w - (b1 + b2) * 2, h - (b1 + b2) * 2 - (pressed ? 0 : 3), Math.max(2, r - 2));
    ctx.fill();

    // 5. 像素高光（左上角几个小方块）
    if (!disabled) {
      ctx.fillStyle = t.highlight;
      const px = Math.max(3, Math.floor(h * 0.1));
      const hx = x + b1 + b2 + px;
      const hy = y + b1 + b2 + px + dy;
      ctx.fillRect(hx,      hy,      px, px);
      ctx.fillRect(hx + px + 1, hy, px, px);
      ctx.fillRect(hx,      hy + px + 1, px, px);
    }

    // 6. 文字
    const fs = this.fontSize ?? Math.floor(h * 0.42);
    ctx.font = `bold ${fs}px "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const tx = x + w / 2;
    const ty = y + h / 2 + dy - (pressed ? 0 : 1);

    // 文字描边（像素轮廓感）
    ctx.strokeStyle = disabled ? '#333' : t.textStroke;
    ctx.lineWidth   = Math.max(2, Math.floor(fs * 0.12));
    ctx.lineJoin    = 'round';
    ctx.strokeText(this.text, tx, ty);

    // 文字填充
    ctx.fillStyle = disabled ? '#aaa' : t.textColor;
    ctx.fillText(this.text, tx, ty);

    ctx.restore();
  }

  // ── 像素圆角矩形辅助 ─────────────────────
  _roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
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
      const scaleX = el.width  / rect.width;
      const scaleY = el.height / rect.height;
      const src = e.touches ? e.touches[0] : e;
      return {
        x: (src.clientX - rect.left)  * scaleX,
        y: (src.clientY - rect.top)   * scaleY,
      };
    };

    const onDown = (e) => {
      if (this.disabled) return;
      const p = getPos(e);
      if (this._hit(p.x, p.y)) {
        this.pressed = true;
        this.draw();
        e.preventDefault();
      }
    };
    const onUp = (e) => {
      if (!this.pressed) return;
      this.pressed = false;
      const p = getPos(e);
      this.draw();
      if (this._hit(p.x, p.y) && this.onClick) {
        this.onClick();
      }
    };

    el.addEventListener('mousedown',  onDown);
    el.addEventListener('mouseup',    onUp);
    el.addEventListener('mouseleave', () => { if (this.pressed) { this.pressed = false; this.draw(); } });
    el.addEventListener('touchstart', onDown, { passive: false });
    el.addEventListener('touchend',   onUp,   { passive: false });
  }
}


/**
 * PixelLabel — 纯文字标签（带像素描边）
 */
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
    ctx.font         = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textAlign    = align;
    ctx.textBaseline = baseline;
    ctx.strokeStyle  = stroke;
    ctx.lineWidth    = Math.max(2, fontSize * 0.1);
    ctx.lineJoin     = 'round';
    ctx.strokeText(this.text, x, y);
    ctx.fillStyle    = color;
    ctx.fillText(this.text, x, y);
    ctx.restore();
  }
}


/**
 * PixelPanel — 像素风面板（背景框）
 */
class PixelPanel {
  constructor(canvas, opts = {}) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.x       = opts.x      ?? 0;
    this.y       = opts.y      ?? 0;
    this.w       = opts.w      ?? 200;
    this.h       = opts.h      ?? 100;
    this.bgColor = opts.bgColor ?? 'rgba(0,20,0,0.85)';
    this.border  = opts.border  ?? '#4caf50';
    this.radius  = opts.radius  ?? 8;
  }

  draw() {
    const { ctx, x, y, w, h, bgColor, border, radius } = this;
    ctx.save();
    // 外边框
    ctx.strokeStyle = border;
    ctx.lineWidth   = 3;
    ctx.fillStyle   = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
    ctx.stroke();
    // 内高光线
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, w - 4, h - 4, radius - 1);
    ctx.stroke();
    ctx.restore();
  }
}

// 导出（兼容 ES module 和直接 script 引入）
if (typeof module !== 'undefined') {
  module.exports = { PixelButton, PixelLabel, PixelPanel };
}
