from PIL import Image, ImageDraw, ImageFont
import math
from pathlib import Path

OUT = Path(__file__).parent
W,H,S=960,640,2
NAVY='#102B54'; ORANGE='#FF9818'; INK='#243A54'; BG='#F6F8FB'
def font(n,bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),n*S)
def frame(k):
    im=Image.new('RGB',(W*S,H*S),BG); d=ImageDraw.Draw(im)
    t=k/60
    def box(xy,fill,r=0,outline=None,width=1):
        xy=tuple(int(v*S) for v in xy)
        if r:d.rounded_rectangle(xy,r*S,fill,outline,width*S)
        else:d.rectangle(xy,fill,outline,width*S)
    def line(p,fill= NAVY,width=3):d.line([(int(x*S),int(y*S)) for x,y in p],fill,width*S,joint='curve')
    def poly(p,fill):d.polygon([(int(x*S),int(y*S)) for x,y in p],fill)
    def circle(x,y,r,c):d.ellipse(((x-r)*S,(y-r)*S,(x+r)*S,(y+r)*S),fill=c)
    def text(x,y,s,n=18,c=NAVY,b=False,anchor='mm'):d.text((x*S,y*S),s,font=font(n,b),fill=c,anchor=anchor)
    text(48,34,'ADMINIO',24,NAVY,True,'lm')
    text(912,34,'ADMINISTRACIÓN INMOBILIARIA',12,INK,False,'rm')
    text(480,95,'Cuidamos tu edificio. Conectamos contigo.',32,NAVY,True)
    text(480,136,'Personas, mantenimiento y tecnología trabajando juntos.',18,INK)
    # Connection paths, with flowing orange signals.
    paths=[[(260,270),(324,270),(324,332),(393,332)],[(700,270),(640,270),(640,332),(567,332)],[(700,457),(650,457),(650,402),(565,402)]]
    for j,p in enumerate(paths):
        line(p,'#D4DFEA',3)
        lengths=[math.dist(p[i],p[i+1]) for i in range(len(p)-1)]
        pos=((t+j/3)%1)*sum(lengths)
        for i,ln in enumerate(lengths):
            if pos<=ln:
                a,b=p[i],p[i+1];f=pos/ln;circle(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,5,ORANGE);break
            pos-=ln
    # Main building, courtyard and living greenery.
    d.ellipse((330*S,494*S,634*S,539*S),fill='#E5EBF2')
    poly([(400,233),(533,233),(574,259),(441,259)],'#D9E3ED')
    poly([(533,233),(574,259),(574,506),(533,487)],'#C9D6E4')
    box((380,248,535,509),'#FFFFFF',7)
    box((380,248,535,270),NAVY,5)
    for row in range(4):
        for col in range(3):
            x=398+col*43;y=289+row*44
            warm=(row+col+k//15)%5==0
            box((x,y,x+27,y+29),'#FFE3AA' if warm else '#C6DDEA',3)
            line([(x+13,y),(x+13,y+29)],'#FFFFFF',2)
        line([(388,326+row*44),(527,326+row*44)],'#E5EBF1',4)
    box((436,469,477,509),NAVY,3)
    box((441,474,472,508),'#9CBBCD')
    line([(457,475),(457,507)],'#FFFFFF',2)
    for y in [287,331,375,419]:
        poly([(546,y),(563,y+8),(563,y+31),(546,y+23)],'#6D8BA7')
    box((362,507,593,516),'#CEDACD',5)
    for x,y in [(359,475),(605,478)]:
        line([(x,y-17),(x,y+30)],'#8A735A',5)
        circle(x,y-25,23,'#6A977E');circle(x-10,y-33,16,'#87AF8F')
    # Residents: connected, cared-for community.
    for x,y,c in [(398,512,NAVY),(522,512,ORANGE)]:
        circle(x,y-25,6,'#C98F6A');box((x-6,y-18,x+6,y+1),c,4)
        line([(x-3,y),(x-4,y+12)],NAVY,3);line([(x+3,y),(x+4,y+12)],NAVY,3)
    # White service cards.
    def card(x,y,title,sub):
        box((x+2,y+5,x+222,y+128),'#E7EDF4',18)
        box((x,y,x+220,y+123),'#FFFFFF',18)
        text(x+110,y+82,title,18,NAVY,True)
        text(x+110,y+106,sub,13,INK)
    card(60,210,'CUIDADO','Escuchamos a las personas')
    # Heart symbol, gently beating.
    cx,cy=170,247;sc=1+0.06*math.sin(t*4*math.pi)
    pts=[]
    for a in range(101):
        q=2*math.pi*a/100
        pts.append((cx+sc*1.25*16*math.sin(q)**3,cy-sc*1.25*(13*math.cos(q)-5*math.cos(2*q)-2*math.cos(3*q)-math.cos(4*q))))
    poly(pts,ORANGE)
    card(680,210,'TECNOLOGÍA + IA','Información que conecta')
    box((767,228,813,265),NAVY,9);text(790,246,'IA',22,'#FFFFFF',True)
    for xx in [755,825]:
        circle(xx,246,4,ORANGE);line([(xx,246),(767 if xx<790 else 813,246)],ORANGE,2)
    card(680,397,'MANTENIMIENTO','Atención a cada detalle')
    # Wrench icon.
    line([(778,450),(801,425)],NAVY,10)
    circle(778,450,7,NAVY);circle(778,450,2,'#FFFFFF')
    circle(803,423,13,NAVY);poly([(796,407),(796,422),(807,427),(816,417),(821,404)],'#FFFFFF')
    circle(817,451,10,ORANGE);line([(812,451),(816,455),(823,447)],'#FFFFFF',2)
    # Protection badge on building.
    poly([(486,202),(510,211),(507,235),(486,251),(465,235),(462,211)],NAVY)
    line([(475,225),(483,233),(498,215)],'#FFFFFF',4)
    text(480,564,'ADMIN(IA)',23,NAVY,True)
    text(480,598,'CUIDADO HUMANO  ·  GESTIÓN INTELIGENTE',14,INK)
    return im.resize((W,H),Image.Resampling.LANCZOS)

frames=[frame(k) for k in range(60)]
palette=frames[0].quantize(colors=128)
gifs=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in frames]
gifs[0].save(OUT/'adminio-cuidado-tecnologia-ia.gif',save_all=True,append_images=gifs[1:],duration=100,loop=0,optimize=True)
frames[0].save(OUT/'adminio-cuidado-tecnologia-ia-preview.png')
check=Image.open(OUT/'adminio-cuidado-tecnologia-ia.gif')
print({'frames':check.n_frames,'size':check.size,'bytes':(OUT/'adminio-cuidado-tecnologia-ia.gif').stat().st_size})
