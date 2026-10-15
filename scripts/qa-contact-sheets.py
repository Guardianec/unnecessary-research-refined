"""Optional visual-review helper; requires Pillow. Does not modify source images."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path('test-results')
names = ['summary', 'scope', 'evidence', 'statistics', 'simulation', 'strategy', 'mechanism', 'model', 'review', 'verdict']
for device in ['desktop', 'tablet', 'mobile']:
    for index, group in enumerate([names[:3], names[3:6], names[6:]]):
        images = []
        for name in group:
            source = Image.open(root / f'{device}-{name}.png')
            images.append(source.resize((420, round(source.height * 420 / source.width))))
        canvas = Image.new('RGB', (440 * len(images), max(i.height for i in images) + 30), 'white')
        for column, image in enumerate(images):
            canvas.paste(image, (column * 440, 30))
            ImageDraw.Draw(canvas).text((column * 440 + 10, 8), f'{device}: {group[column]}', fill='black')
        canvas.save(root / f'contact-{device}-{index}.png')
