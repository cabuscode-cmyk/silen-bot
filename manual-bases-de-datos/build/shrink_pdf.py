# Recomprime las imágenes del PDF como JPEG (calidad 88) y optimiza el fichero
import sys, io, pikepdf
from pikepdf import Name, PdfImage
src, dst = sys.argv[1:3]
p = pikepdf.open(src)
n = 0
for obj in p.objects:
    if isinstance(obj, pikepdf.Stream) and obj.get('/Subtype') == Name.Image and obj.get('/ColorSpace') is not None:
        try:
            if obj.get('/Filter') == Name.DCTDecode: continue
            if '/SMask' in obj:
                m = PdfImage(obj.SMask).as_pil_image().convert('L')
                if m.getextrema()[0] < 255: continue
            im = PdfImage(obj).as_pil_image().convert('RGB')
            if im.width * im.height < 40000: continue
            b = io.BytesIO(); im.save(b, 'JPEG', quality=88, optimize=True)
            if len(b.getvalue()) < len(obj.read_raw_bytes()):
                obj.write(b.getvalue(), filter=Name.DCTDecode)
                if '/SMask' in obj: del obj['/SMask']
                obj.ColorSpace = Name.DeviceRGB; obj.BitsPerComponent = 8
                for k in ('/DecodeParms',):
                    if k in obj: del obj[k]
                n += 1
        except Exception as e:
            pass
p.save(dst, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
print('imágenes recomprimidas:', n)
