# Reduce el tamaño de las capturas (paleta de 256 colores, sin cambiar dimensiones)
import glob
from PIL import Image
for f in glob.glob('figs/*.png'):
    Image.open(f).convert('RGB').quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(f, optimize=True)
