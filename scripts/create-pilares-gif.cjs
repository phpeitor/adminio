const fs = require('fs');
const sharp = require('C:/Users/USUARIO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const W=1100,H=780,N=50;
const source='C:/Users/USUARIO/AppData/Local/Temp/codex-clipboard-fffeff03-34f4-4fb1-827d-02ff4a3f83fd.png';
const cards=[
 {x:28,y:180,title:'Gestión de cobranzas',sub:'Control y transparencia',cx:300,cy:240},
 {x:792,y:180,title:'Gestión de operaciones',sub:'Supervisión y mantenimiento',cx:792,cy:240},
 {x:28,y:400,title:'Gestión legal',sub:'Respaldo y cumplimiento',cx:300,cy:460},
 {x:792,y:400,title:'Recursos humanos',sub:'Personas y bienestar',cx:792,cy:460},
 {x:410,y:628,title:'Gestión online',sub:'Vecinos 360 + IA',cx:550,cy:628}
];
(async()=>{
 const building=await sharp(source).resize(480,330,{fit:'inside'}).png().toBuffer();
 const uri='data:image/png;base64,'+building.toString('base64');
 const frames=[];
 for(let f=0;f<N;f++){
 const t=f/N,active=Math.floor(t*5),phase=(t*5)%1;
 let s=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}"><defs><radialGradient id="bg"><stop stop-color="#16406b"/><stop offset="1" stop-color="#061c3c"/></radialGradient><pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#ffffff" stroke-opacity=".025"/></pattern></defs><rect width="1100" height="780" rx="28" fill="url(#bg)"/><rect width="1100" height="780" fill="url(#grid)"/><g font-family="Arial,sans-serif" text-anchor="middle"><text x="550" y="49" fill="#ffac4f" font-size="15" font-weight="bold" letter-spacing="4">MODELO DE GESTIÓN ADMINIO</text><text x="550" y="92" fill="white" font-size="32" font-weight="bold">Cinco pilares. Un edificio bien cuidado.</text><text x="550" y="122" fill="#c3d2e6" font-size="17">Personas, procesos y tecnología</text></g>`;
 cards.forEach((c,i)=>{const x=550,y=420; s+=`<path d="M${c.cx} ${c.cy} L${x} ${y}" stroke="${i===active?'#ff941f':'#45617f'}" stroke-width="${i===active?2:1}" stroke-dasharray="5 8" fill="none"/>`;const p=(t*2+i/5)%1;s+=`<circle cx="${c.cx+(x-c.cx)*p}" cy="${c.cy+(y-c.cy)*p}" r="4" fill="${i===active?'#ffad50':'#75cced'}"/>`;});
 s+=`<image x="310" y="215" width="480" height="330" xlink:href="${uri}"/><rect x="390" y="542" width="320" height="60" rx="14" fill="#102e51" stroke="#e99336"/><g font-family="Arial,sans-serif" text-anchor="middle"><text x="550" y="567" font-size="17" fill="white" font-weight="bold">EL ADMINISTRADOR</text><text x="550" y="588" font-size="13" fill="#c3d2e6">Coordina e integra los cinco pilares</text></g>`;
 cards.forEach((c,i)=>{s+=`<rect x="${c.x}" y="${c.y}" width="280" height="120" rx="16" fill="${i===active?'#fff9f1':'#f9fbff'}" stroke="${i===active?'#ff941f':'#dce5f0'}" stroke-width="${i===active?3:1}"/><rect x="${c.x+20}" y="${c.y+18}" width="34" height="28" rx="8" fill="#062650"/><text x="${c.x+37}" y="${c.y+37}" font-family="Arial" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffac4f">0${i+1}</text><circle cx="${c.x+252}" cy="${c.y+32}" r="5" fill="${i===active?'#ed7909':'#c3d2e6'}"/><text x="${c.x+20}" y="${c.y+73}" font-family="Arial" font-size="20" font-weight="bold" fill="#062650">${c.title}</text><text x="${c.x+20}" y="${c.y+99}" font-family="Arial" font-size="14" fill="#536981">${c.sub}</text>`;});
 s+='</svg>';
 const raw=await sharp(Buffer.from(s)).ensureAlpha().raw().toBuffer();frames.push(raw);
 if(f===0)await sharp(raw,{raw:{width:W,height:H,channels:4}}).png().toFile('static/adminio-pilares-tecnologia-poster.png');
 }
 await sharp(Buffer.concat(frames),{raw:{width:W,height:H*N,channels:4,pageHeight:H}}).gif({loop:0,delay:Array(N).fill(120),colours:128,dither:0.3}).toFile('static/adminio-pilares-tecnologia.gif');
 console.log(await sharp('static/adminio-pilares-tecnologia.gif',{animated:true}).metadata());
})().catch(e=>{console.error(e);process.exit(1)});
