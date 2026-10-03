const fs=require('fs');const { chromium } = require('/opt/node-tools/node_modules/playwright');
const md=fs.readFileSync('../indice-maestro.md','utf8').split('\n');
const accent={A:'#0E9BD8',B:'#7A3FE0',C:'#FF7A1A',D:'#0F7C8F',E:'#C2338A',F:'#D1383D',G:'#2E9E5B'};
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const inl=s=>esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
let h='',toc=[],cur=null,part=null,color='#0B1B4D',first=true,i=0;
while(i<md.length){const l=md[i];let m;
 if(l.startsWith('# ')){const t=l.slice(2);m=t.match(/^Bloque ([A-G])/);color=m?accent[m[1]]:'#0B1B4D';
  cur={t,color,parts:[]};toc.push(cur);h+=`<h1 class="${first?'':'pb'}" style="border-color:${color}">${esc(t)}</h1>`;first=false;i++;continue;}
 if(l.startsWith('## ')){const t=l.slice(3);part={t,n:0};if(/^Parte|^Proyecto/.test(t))cur.parts.push(part);h+=`<h2 style="border-color:${color};color:${color=='#0B1B4D'?'#0B1B4D':color}">${esc(t)}</h2>`;i++;continue;}
 if(!l.trim()){i++;continue;}
 if(l.startsWith('@steps')){i++;h+='<ol class="steps">';while(!md[i].startsWith('@end')){h+=`<li>${inl(md[i])}</li>`;i++;}h+='</ol>';i++;continue;}
 if(l.startsWith('|')){const rows=[];while(i<md.length&&md[i].startsWith('|')){if(!/^\|\s*-/.test(md[i]))rows.push(md[i].split('|').slice(1,-1).map(s=>s.trim()));i++;}
  h+=`<table><thead><tr>${rows[0].map(c=>`<th style="background:${color}">${inl(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${r.map(c=>`<td>${inl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;continue;}
 if(m=l.match(/^(\d+\.\d+(?:\.\d+)?|F\.\d+|[A-G]\.)\s+(.*)/)){if(part&&/^\d/.test(m[1]))part.n++;
  h+=`<p class="mod${/^\d+\.\d+\.\d+/.test(m[1])?' sub':''}"><span class="num" style="color:${color}">${m[1]}</span><span>${inl(m[2])}</span></p>`;i++;continue;}
 h+=`<p>${inl(l)}</p>`;i++;}
const idx=`<h1 style="border-color:#FF7A1A">Índice general</h1><p>Mapa de los 7 bloques, las 20 partes, el proyecto final y los anexos. El número entre paréntesis indica cuántos módulos tiene cada parte.</p>`+
 toc.map(b=>`<div class="ib" style="background:${b.color}">${esc(b.t)}</div>`+b.parts.map(p=>`<div class="ip"><span>${esc(p.t)}</span><span class="dots"></span><span class="n">${p.n?'('+p.n+')':''}</span></div>`).join('')).join('');
const html=`<!doctype html><html lang="es"><meta charset="utf-8"><style>
*{box-sizing:border-box}body{font-family:'Liberation Sans','DejaVu Sans',sans-serif;font-size:10.5pt;line-height:1.45;color:#222;margin:0}
h1{font-size:23pt;color:#0B1B4D;border-bottom:5px solid;padding-bottom:6px;margin:0 0 14px}
h1.pb{page-break-before:always}
h2{font-size:15pt;background:#EEF3FB;border-left:7px solid;padding:6px 10px;margin:22px 0 10px;page-break-after:avoid}
p{margin:0 0 7px}
.mod{display:flex;gap:10px;margin:0 0 4px;padding-left:4px;font-size:10pt}.mod .num{font-weight:700;min-width:38px;flex:none}.mod.sub{padding-left:48px}
.steps{margin:8px 0 12px 8px;padding-left:22px}.steps li{margin:2px 0;padding-left:4px}.steps li::marker{color:#FF7A1A;font-weight:700}
table{border-collapse:collapse;width:100%;margin:8px 0 14px;font-size:9.5pt}th{color:#fff;text-align:left;padding:6px 8px}td{padding:6px 8px;border:1px solid #C9D1E3;vertical-align:top}tbody tr:nth-child(even) td{background:#F2F5FB}tr{page-break-inside:avoid}
.ib{color:#fff;font-weight:700;font-size:11.5pt;padding:3px 10px;margin:8px 0 3px;font-size:11pt;page-break-after:avoid}
.ip{display:flex;align-items:baseline;gap:6px;padding-left:16px;font-size:9.5pt;line-height:1.3;margin:0}.dots{flex:1;border-bottom:1px dotted #99a}.n{color:#44506B;font-size:9pt}
.idxwrap{page-break-after:always}
</style><body><div class="idxwrap">${idx}</div>${h}</body></html>`;
fs.writeFileSync('content.html',html);
const cover=`<!doctype html><style>@page{size:A4;margin:0}html,body{margin:0}img{display:block;width:210mm;height:297mm}</style><img src="cover.png">`;
fs.writeFileSync('cover-page.html',cover);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage();
await p.goto('file://'+process.cwd()+'/cover-page.html');await p.pdf({path:'cover.pdf',width:'210mm',height:'297mm',printBackground:true,margin:{top:'0',bottom:'0',left:'0',right:'0'}});
await p.goto('file://'+process.cwd()+'/content.html');
await p.pdf({path:'content.pdf',format:'A4',printBackground:true,margin:{top:'20mm',bottom:'18mm',left:'20mm',right:'20mm'},displayHeaderFooter:true,
 headerTemplate:'<div style="font-size:8px;color:#44506B;width:100%;text-align:right;padding-right:20mm;font-family:sans-serif">Manual completo de bases de datos · Índice maestro</div>',
 footerTemplate:'<div style="font-size:8px;color:#44506B;width:100%;text-align:center;font-family:sans-serif">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>'});
await b.close();})();
