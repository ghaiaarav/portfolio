import math, random
from PIL import Image, ImageFont, ImageDraw, ImageFilter

def create_minecraft_title():
    # Deterministic noise for consistent cracks and stone texture
    random.seed(42)

    font_size = 140
    font = ImageFont.truetype('public/fonts/Minecrafter-Alt.ttf', font_size)

    text1 = 'AARAV'
    text2 = 'GHAI'

    bbox1 = font.getbbox(text1)
    bbox2 = font.getbbox(text2)

    w1 = bbox1[2] - bbox1[0]
    w2 = bbox2[2] - bbox2[0]
    h = max(bbox1[3] - bbox1[1], bbox2[3] - bbox2[1])

    gap = 48
    depth = 18
    pad_x = 40
    pad_y = 40

    canvas_w = w1 + gap + w2 + pad_x * 2 + depth * 2
    canvas_h = h + pad_y * 2 + depth * 2

    # Positions
    x1 = pad_x + int(depth * 0.4)
    y1 = pad_y - bbox1[1]
    x2 = x1 + w1 + gap
    y2 = pad_y - bbox2[1]

    # 1. Generate text mask
    text_mask = Image.new('L', (canvas_w, canvas_h), 0)
    d_mask = ImageDraw.Draw(text_mask)
    d_mask.text((x1, y1), text1, font=font, fill=255)
    d_mask.text((x2, y2), text2, font=font, fill=255)

    # 2. Generate stone texture for letter faces
    stone_face = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    face_pixels = text_mask.load()

    # Pre-render stone face gradient & noise
    for y in range(canvas_h):
        for x in range(canvas_w):
            if face_pixels[x, y] > 128:
                # Vertical gradient
                rel_y = (y - pad_y) / max(1, h)
                rel_y = max(0.0, min(1.0, rel_y))

                # Minecraft logo gradient: top highlight, mid body, bottom dark
                if rel_y < 0.12:
                    base = 210 - int(rel_y * 250)
                elif rel_y < 0.65:
                    base = 180 - int((rel_y - 0.12) * 80)
                else:
                    base = 138 - int((rel_y - 0.65) * 110)

                # Stone grain noise
                noise = random.randint(-14, 14)
                v = max(30, min(245, base + noise))

                # Slight blue/cool stone tint like vanilla Minecraft stone
                r = v
                g = v
                b = min(255, v + 4)
                stone_face.putpixel((x, y), (r, g, b, 255))

    # 3. Add iconic Minecraft stone cracks
    draw_stone = ImageDraw.Draw(stone_face)
    crack_lines = [
        # Crack on A1
        [(x1 + 35, y1 + 15), (x1 + 50, y1 + 35), (x1 + 42, y1 + 60), (x1 + 60, y1 + 90)],
        # Crack on R
        [(x1 + 175, y1 + 20), (x1 + 160, y1 + 45), (x1 + 178, y1 + 75)],
        # Crack on A2
        [(x1 + 310, y1 + 30), (x1 + 325, y1 + 55), (x1 + 315, y1 + 85)],
        # Crack on V
        [(x1 + 440, y1 + 10), (x1 + 430, y1 + 40), (x1 + 445, y1 + 70)],
        # Crack on G
        [(x2 + 30, y2 + 15), (x2 + 45, y2 + 40), (x2 + 38, y2 + 75)],
        # Crack on H
        [(x2 + 160, y2 + 25), (x2 + 175, y2 + 50), (x2 + 165, y2 + 80)],
        # Crack on A
        [(x2 + 295, y2 + 15), (x2 + 280, y2 + 45), (x2 + 295, y2 + 75)],
        # Crack on I
        [(x2 + 385, y2 + 30), (x2 + 395, y2 + 65)],
    ]

    for pts in crack_lines:
        for i in range(len(pts) - 1):
            p_start, p_end = pts[i], pts[i+1]
            # White highlight reflection edge
            draw_stone.line([(p_start[0]+1, p_start[1]+1), (p_end[0]+1, p_end[1]+1)], fill=(225, 225, 230, 210), width=2)
            # Dark fissure core
            draw_stone.line([p_start, p_end], fill=(24, 24, 28, 240), width=2)

    # 4. Top/left bevel highlight
    stone_final = stone_face.copy()
    draw_final = ImageDraw.Draw(stone_final)
    for y in range(1, canvas_h - 1):
        for x in range(1, canvas_w - 1):
            if face_pixels[x, y] > 128:
                # Top edge or left edge
                if face_pixels[x, y-1] <= 128 or face_pixels[x-1, y] <= 128:
                    draw_final.point((x, y), fill=(255, 255, 255, 200))
                # Bottom edge or right edge
                elif face_pixels[x, y+1] <= 128 or face_pixels[x+1, y] <= 128:
                    draw_final.point((x, y), fill=(35, 35, 40, 180))

    # 5. Composite Extrusion and Outer Border
    result = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    d_res = ImageDraw.Draw(result)

    # Deepest black drop shadow
    shadow_offset = (int(depth * 0.45), depth + 4)
    d_res.text((x1 + shadow_offset[0], y1 + shadow_offset[1]), text1, font=font, fill=(5, 5, 5, 255), stroke_width=6, stroke_fill=(5, 5, 5, 255))
    d_res.text((x2 + shadow_offset[0], y2 + shadow_offset[1]), text2, font=font, fill=(5, 5, 5, 255), stroke_width=6, stroke_fill=(5, 5, 5, 255))

    # Extruded 3D bevels (back to front)
    for step in range(depth, 0, -1):
        ratio = step / depth
        ox = int(-step * 0.35)
        oy = step
        # Shading from bottom (dark stone #1e1e22) to top (#4a4a52)
        gray = int(30 + (1.0 - ratio) * 55)
        r = gray
        g = gray
        b = min(255, gray + 4)
        border_col = (15, 15, 18, 255)

        d_res.text((x1 + ox, y1 + oy), text1, font=font, fill=(r, g, b, 255), stroke_width=3, stroke_fill=border_col)
        d_res.text((x2 + ox, y2 + oy), text2, font=font, fill=(r, g, b, 255), stroke_width=3, stroke_fill=border_col)

    # Draw dark inner outline for the front face
    d_res.text((x1, y1), text1, font=font, fill=(10, 10, 12, 255), stroke_width=4, stroke_fill=(10, 10, 12, 255))
    d_res.text((x2, y2), text2, font=font, fill=(10, 10, 12, 255), stroke_width=4, stroke_fill=(10, 10, 12, 255))

    # Paste textured front face on top
    result.paste(stone_final, (0, 0), stone_final)

    # Crop tight bounding box with comfortable padding
    bbox = result.getbbox()
    if bbox:
        result = result.crop((bbox[0] - 6, bbox[1] - 6, bbox[2] + 6, bbox[3] + 6))

    result.save('public/title/logo-textured.png', 'PNG')
    print('Generated public/title/logo-textured.png:', result.size)

if __name__ == '__main__':
    create_minecraft_title()
