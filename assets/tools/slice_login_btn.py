#!/usr/bin/env python3
"""
生成可拉伸的登录按钮九宫格切片
策略：
  - 按钮尺寸 1470x308
  - 圆角约占高度25% → r ≈ 77px
  - 切片：四角固定(r×r)，上下左右边可拉伸，中间可拉伸
  - 输出：9张切片PNG + 一张合并预览
"""
from PIL import Image
import os

SRC = '/root/.openclaw/workspace/farm-game/assets/images/ui/home/ui_home_login_btn.png'
OUT_DIR = '/root/.openclaw/workspace/farm-game/assets/images/ui/home/login_btn_slices'
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC)
W, H = img.size
print(f'按钮尺寸: {W}x{H}')

# 九宫格切点（左/右 x坐标，上/下 y坐标）
# 圆角区域保留完整，中间1px可拉伸
r = int(H * 0.27)  # ≈83px 圆角半径
# 为了拉伸效果好，中间取1px宽/高的切片
x1 = r          # 左切点
x2 = W - r      # 右切点
y1 = r          # 上切点
y2 = H - r      # 下切点

print(f'切点: x={x1},{x2}  y={y1},{y2}')
print(f'角块尺寸: {r}x{r}')
print(f'中间可拉伸区: {x2-x1}x{y2-y1}')

# 9个区域裁切
regions = {
    'tl': (0,    0,  x1,   y1),   # 左上角
    'tc': (x1,   0,  x2,   y1),   # 上中（可横向拉伸）
    'tr': (x2,   0,  W,    y1),   # 右上角
    'ml': (0,    y1, x1,   y2),   # 左中（可纵向拉伸）
    'mc': (x1,   y1, x2,   y2),   # 正中（可双向拉伸）
    'mr': (x2,   y1, W,    y2),   # 右中（可纵向拉伸）
    'bl': (0,    y2, x1,   H),    # 左下角
    'bc': (x1,   y2, x2,   H),    # 下中（可横向拉伸）
    'br': (x2,   y2, W,    H),    # 右下角
}

for name, box in regions.items():
    piece = img.crop(box)
    path = f'{OUT_DIR}/btn_{name}.png'
    piece.save(path)
    print(f'  {name}: {piece.size} → {path}')

# 生成预览：把9块拼成目标尺寸（例如400x80，验证拉伸效果）
TW, TH = 600, 120  # 目标拉伸尺寸

def scale_piece(piece, target_w, target_h):
    if target_w <= 0 or target_h <= 0:
        return Image.new('RGBA', (max(1,target_w), max(1,target_h)), (0,0,0,0))
    return piece.resize((max(1,target_w), max(1,target_h)), Image.LANCZOS)

slices = {k: img.crop(v).convert('RGBA') for k, v in regions.items()}

# 目标切点（保持角块原始大小，等比缩小）
scale = TH / H
tr2 = int(r * scale)  # 缩放后的角块尺寸
cx2 = TW - tr2 * 2    # 中间可拉伸宽度
cy2 = TH - tr2 * 2    # 中间可拉伸高度

preview = Image.new('RGBA', (TW, TH), (200, 200, 200, 255))

def paste(piece, tw, th, px, py):
    s = scale_piece(piece, tw, th)
    preview.paste(s, (px, py), s)

paste(slices['tl'], tr2, tr2,         0,       0)
paste(slices['tc'], cx2, tr2,         tr2,     0)
paste(slices['tr'], tr2, tr2,         TW-tr2,  0)
paste(slices['ml'], tr2, cy2,         0,       tr2)
paste(slices['mc'], cx2, cy2,         tr2,     tr2)
paste(slices['mr'], tr2, cy2,         TW-tr2,  tr2)
paste(slices['bl'], tr2, tr2,         0,       TH-tr2)
paste(slices['bc'], cx2, tr2,         tr2,     TH-tr2)
paste(slices['br'], tr2, tr2,         TW-tr2,  TH-tr2)

preview_path = '/root/.openclaw/workspace/farm-game/assets/images/ui/home/login_btn_stretch_preview.png'
preview.convert('RGB').save(preview_path)
print(f'\n✓ 拉伸预览 ({TW}x{TH}): {preview_path}')

# 输出CSS border-image用法
print(f'''
===== CSS border-image 使用方式 =====
.login-btn {{
  border-image: url(ui_home_login_btn.png) {y1} {W-x2} {H-y2} {x1} fill / auto stretch;
  /* 或用 border-image-slice */
  border-image-source: url(ui_home_login_btn.png);
  border-image-slice: {y1} {W-x2} {H-y2} {x1} fill;
  border-image-repeat: stretch;
}}

===== Phaser3 / Canvas 九宫格参数 =====
leftWidth:   {x1}
rightWidth:  {W-x2}
topHeight:   {y1}
bottomHeight:{H-y2}
''')
