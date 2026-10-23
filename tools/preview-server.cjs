const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.gif':'image/gif','.ico':'image/x-icon','.json':'application/json','.woff2':'font/woff2'};
http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(req.url.split('?')[0]);}catch{res.writeHead(400);return res.end();}
 if(url==='/')url='/index.html';
 if(url.split('/').some(part=>part.startsWith('.')) || /\.(?:php|cjs|md)$/i.test(url)){res.writeHead(403);return res.end('Forbidden');}
 const file=path.resolve(root,'.'+url);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(data);});
}).listen(8766,'0.0.0.0',()=>console.log('ADMINIO: http://127.0.0.1:8766/index.html | Red local: http://192.168.86.38:8766/index.html'));
