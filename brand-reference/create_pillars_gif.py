from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math
O=Path(__file__).parent
W,H,S=1200,850,2
N='#102B54'; A='#FF9818'
def font(n,b=False):return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if b else 'segoeui.ttf'),n*S)
def render(k):
 im=Image.new('RGBA',(W*S,H*S));d=ImageDraw.Draw(im);t=k/72
 def p(points,c):d.polygon([(int(x*S),int(y*S)) for x,y in points],fill=c)
 def l(points,c=N,w=2):d.line([(int(x*S),int(y*S)) for x,y in points],fill=c,width=w*S,joint='curve')
 def r(xy,c,rad=0,outline=None,w=1):d.rounded_rectangle(tuple(int(v*S) for v in xy),radius=rad*S,fill=c,outline=outline,width=w*S)
 def e(x,y,rx,ry,c):d.ellipse(((x-rx)*S,(y-ry)*S,(x+rx)*S,(y+ry)*S),fill=c)
 def txt(x,y,s,n=18,c=N,b=False,anchor='mm'):d.text((x*S,y*S),s,font=font(n,b),fill=c,anchor=anchor)
 txt(600,42,'ADMINIO',29,N,True)
 txt(600,86,'Cinco pilares. Un edificio bien cuidado.',32,N,True)
 txt(600,124,'Personas, procesos y tecnología',19,'#52677C')
 # Fine connecting network with animated signals.
 routes=[[(328,264),(380,264),(431,340)],[(872,264),(823,264),(770,340)],[(328,510),(380,510),(430,450)],[(872,510),(822,510),(769,450)],[(600,646),(600,602),(600,550)]]
 active=int(t*5)%5
 for j,pts in enumerate(routes):
  l(pts,'#CBD7E4',3)
  if active==j:l(pts,'#F2B05B',3)
  lens=[math.dist(pts[i],pts[i+1]) for i in range(2)];v=((t*2+j*.19)%1)*sum(lens)
  for i,ln in enumerate(lens):
   if v<=ln:
    x=pts[i][0]+(pts[i+1][0]-pts[i][0])*v/ln;y=pts[i][1]+(pts[i+1][1]-pts[i][1])*v/ln;e(x,y,5,5,A);break
   v-=ln
 # Deep architectural plinth with beveled layers.
 p([(408,494),(584,441),(788,510),(610,573)],'#BDCBD6')
 p([(408,494),(610,558),(788,496),(788,510),(610,573),(408,508)],'#93A8BC')
 p([(408,486),(584,433),(788,496),(610,558)],'#E5EBEC')
 p([(423,485),(585,441),(772,497),(609,546)],'#EDF1EC')
 # Building main facades.
 p([(487,252),(614,214),(614,493),(487,531)],'#E5EAF0')
 p([(614,214),(725,251),(725,529),(614,493)],'#A9BACD')
 # Precise architectural floor rhythm and windows.
 for row in range(6):
  y=264+row*37
  for col in range(3):
   x=500+col*36;yy=y-col*10.8
   color='#FFD498' if (row+col+k//18)%7<2 else '#7394AE'
   p([(x,yy),(x+24,yy-7),(x+24,yy+23),(x,yy+30)],color)
   l([(x+12,yy-3),(x+12,yy+26)],'#E6EDF1',1)
   l([(x,yy+30),(x+24,yy+23)],'#FFFFFF',2)
  for col in range(2):
   x=630+col*44;yy=250+row*37+col*14
   p([(x,yy),(x+29,yy+10),(x+29,yy+34),(x,yy+24)],'#3E617F')
   l([(x+14,yy+5),(x+14,yy+29)],'#BDCEDB',1)
  p([(481,y+34),(614,y-6),(730,y+32),(730,y+39),(614,y+1),(481,y+41)],'#F8FAFC')
  p([(481,y+41),(614,y+1),(614,y+5),(481,y+45)],'#C7D1DC')
 # Roof terrace and navy fascia.
 p([(481,243),(614,203),(731,241),(598,283)],'#F0F4F5')
 p([(481,243),(598,281),(731,241),(731,253),(598,293),(481,255)],N)
 p([(495,240),(614,213),(713,241),(598,273)],'#BBCDBD')
 for x,y in [(522,238),(550,230),(585,221),(650,234),(677,242)]:
  e(x,y,10,6,'#648977');e(x-3,y-3,7,5,'#86A28C')
 # Entrance canopy and glass doors.
 p([(551,478),(596,465),(596,512),(551,525)],N)
 p([(557,481),(590,471),(590,511),(557,521)],'#6B8EA8')
 l([(574,477),(574,516)],'#CADBE3',2)
 p([(540,475),(587,460),(612,469),(563,484)],N)
 # Landscape trees with dimensional foliage.
 for x,y in [(452,473),(751,488)]:
  l([(x,y),(x,y+32)],'#8E7866',4)
  e(x+3,y-12,22,24,'#4B705F');e(x-5,y-17,17,20,'#71917B');e(x-10,y-23,10,12,'#91AB8A')
 # Central coordinator plaque.
 r((461,559,743,623),'#CBD6E2',15);r((461,553,743,617),N,15)
 e(486,577,7,7,'#FFFFFF');r((476,586,496,603),'#FFFFFF',7)
 txt(615,576,'EL ADMINISTRADOR',17,'#FFFFFF',True)
 txt(615,598,'Coordina los cinco pilares',14,'#D8E3ED')
 # Raised service cards, bevel and small dimensional icon medallions.
 specs=[(52,197,'01','Gestión de cobranzas','Control y transparencia','fin'),(872,197,'02','Gestión de operaciones','Supervisión y mantenimiento','ops'),(52,443,'03','Gestión legal','Respaldo y cumplimiento','law'),(872,443,'04','Recursos humanos','Personas y bienestar','people'),(460,657,'05','Gestión online','Vecinos 360 + IA','ia')]
 for j,(x,y,num,title,sub,kind) in enumerate(specs):
  ww=276 if j<4 else 280
  r((x+3,y+9,x+ww+3,y+161),'#BCCBDC',19)
  r((x,y,x+ww,y+152),'#FFFFFF',19,'#DEE5ED',1)
  r((x+1,y+1,x+ww-1,y+7),A if active==j else '#E2E9F0',3)
  txt(x+ww-23,y+28,num,14,'#7E91A6',True)
  cx=x+ww/2;cy=y+48
  e(cx,cy+4,26,24,'#CDDAE6');e(cx,cy,26,24,'#F0F4F8')
  if kind=='fin':
   r((cx-12,cy-17,cx+12,cy+17),N,4);r((cx-8,cy-12,cx+8,cy-5),'#FFFFFF',1)
   for xx in [-6,5]:
    for yy in [1,9]:r((cx+xx-2,cy+yy-2,cx+xx+2,cy+yy+2),A,1)
  elif kind=='ops':
   l([(cx-12,cy+13),(cx+10,cy-10)],N,7);e(cx+10,cy-10,9,9,N);p([(cx+6,cy-22),(cx+6,cy-10),(cx+15,cy-6),(cx+23,cy-20)],'#F0F4F8');e(cx-12,cy+13,3,3,A)
  elif kind=='law':
   l([(cx,cy-17),(cx,cy+16)],N,3);l([(cx-18,cy-10),(cx+18,cy-10)],N,3);l([(cx-13,cy+17),(cx+13,cy+17)],N,3)
   for xx in [cx-14,cx+14]:
    l([(xx,cy-10),(xx-8,cy+6),(xx+8,cy+6),(xx,cy-10)],N,2);p([(xx-8,cy+6),(xx+8,cy+6),(xx+5,cy+11),(xx-5,cy+11)],A)
  elif kind=='people':
   e(cx-7,cy-9,7,7,N);e(cx+12,cy-6,5,5,A);r((cx-19,cy+1,cx+5,cy+17),N,8);r((cx+7,cy+3,cx+22,cy+17),A,6)
  else:
   r((cx-20,cy-16,cx+20,cy+13),N,6);txt(cx,cy-2,'IA',18,'#FFFFFF',True);l([(cx,cy+14),(cx,cy+20)],N,3);l([(cx-10,cy+20),(cx+10,cy+20)],A,3)
  txt(cx,y+98,title,20,N,True);txt(cx,y+128,sub,15,'#586D83')
 return im.resize((W,H),Image.Resampling.LANCZOS)

frames=[render(k) for k in range(72)]
# Reserve palette entry 255 for transparency and preserve clean opaque interiors.
base=frames[0].convert('RGB').quantize(colors=255)
pal=base.getpalette();pal=pal[:765]+[255,0,255]
base.putpalette(pal)
out=[]
for fr in frames:
 q=fr.convert('RGB').quantize(palette=base,dither=Image.Dither.NONE)
 mask=fr.getchannel('A').point(lambda v:255 if v<128 else 0)
 q.paste(255,mask=mask);q.info['transparency']=255;out.append(q)
out[0].save(O/'adminio-5-pilares-transparente.gif',save_all=True,append_images=out[1:],duration=100,loop=0,transparency=255,disposal=2,optimize=False)
frames[0].save(O/'adminio-5-pilares-preview.png')
frames[0].save(O/'adminio-5-pilares-transparente.webp',save_all=True,append_images=frames[1:],duration=100,loop=0,quality=85,method=4)
gif=Image.open(O/'adminio-5-pilares-transparente.gif')
print({'frames':gif.n_frames,'size':gif.size,'transparent':gif.info.get('transparency'),'bytes':(O/'adminio-5-pilares-transparente.gif').stat().st_size})
