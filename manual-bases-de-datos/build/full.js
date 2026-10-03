const fs=require('fs');const {execFileSync}=require('child_process');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const D=require('/opt/node-tools/node_modules/docx');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,ImageRun,HeadingLevel,AlignmentType,Footer,Header,PageNumber,LevelFormat,TabStopType,Bookmark,InternalHyperlink}=D;
const NAVY='0B1B4D',CY='0E9BD8',ORG='FF7A1A',GREY='44506B';
const BC={'0':'#0B1B4D',A:'#0E9BD8',B:'#7A3FE0',C:'#FF7A1A',D:'#0F7C8F',E:'#C2338A',F:'#D1383D',G:'#2E9E5B',X:'#44506B'};
const OUT=process.argv[2]||'../Manual-Completo-Bases-de-Datos';
// ---------- partes disponibles y plan completo
const files=fs.readdirSync('../capitulos').filter(f=>/^parte-\d+\.md$/.test(f)).sort();
const avail=files.map(f=>parseInt(f.match(/\d+/)[0]));
const rangeTxt=(()=>{const a=[...avail].sort((x,y)=>x-y);const r=[];let s=a[0],p=a[0];for(let i=1;i<=a.length;i++){if(a[i]!==p+1){r.push(s==p?`${s}`:`${s} a ${p}`);s=a[i];}p=a[i];}return r.join(', ');})();
let VALS={};try{VALS=JSON.parse(fs.readFileSync('figs/vals.json','utf8'));}catch(e){}
VALS.partes_disponibles=rangeTxt;
let text=['front.md',...files].map(f=>fs.readFileSync('../capitulos/'+f,'utf8')).join('\n\n');
text=text.replace(/\{\{(\w+)\}\}/g,(_,k)=>{if(!(k in VALS))throw new Error('falta valor '+k);return VALS[k];});
let src=text.split('\n');
const meta=JSON.parse(fs.readFileSync('figs/meta.json','utf8'));const CODEJ=JSON.parse(fs.readFileSync('figs/code.json','utf8'));
// numeración de figuras
(function(){let sec=null;const LAB={},cnt={};
 src.forEach(l=>{let mm=l.match(/^## (\d+\.\d+)\b/);if(mm)sec=mm[1];mm=l.match(/^@(?:fig|demo) ([\w-]+) \|/);if(mm&&sec){cnt[sec]=(cnt[sec]||0)+1;LAB[mm[1]]=sec+'-'+String.fromCharCode(96+cnt[sec]);}});
 src=src.map(l=>{let mm=l.match(/^@(?:fig|demo) ([\w-]+) \|/);if(mm&&LAB[mm[1]])l=l.replace(/Figura [\d.]+-[a-z]\./,'Figura '+LAB[mm[1]]+'.');
  return l.replace(/\{\{fig:([\w-]+)\}\}/g,(_,id)=>{if(!LAB[id])throw new Error('figura sin etiqueta '+id);return LAB[id];});});})();
// ---------- parseo
const A=[];let i=0;
while(i<src.length){const l=src[i];let m;
 if(l.startsWith('# ')){A.push({t:'h1',x:l.slice(2).replace(/`/g,'')});i++;continue;}
 if(l.startsWith('## ')){A.push({t:'h2',x:l.slice(3).replace(/`/g,'')});i++;continue;}
 if(l.startsWith('### ')){A.push({t:'h3',x:l.slice(4).replace(/`/g,'')});i++;continue;}
 if(!l.trim()){i++;continue;}
 if(l.startsWith('```')){const lang=l.slice(3);const c=[];i++;while(!src[i].startsWith('```')){c.push(src[i]);i++;}i++;A.push({t:'code',x:c,lang});continue;}
 if(l.startsWith('@demo ')){const [id,cap]=l.slice(6).split('|').map(s=>s.trim());const c=CODEJ[id];if(!c)throw new Error('sin código '+id);A.push({t:'code',x:c.text.split('\n'),lang:c.lang});A.push({t:'fig',id,cap});i++;continue;}
 if(l.startsWith('@fig ')){const [id,cap]=l.slice(5).split('|').map(s=>s.trim());if(!meta[id])throw new Error('sin figura '+id);A.push({t:'fig',id,cap});i++;continue;}
 if(l.startsWith('> ')){const c=[];while(i<src.length&&src[i].startsWith('> ')){c.push(src[i].slice(2));i++;}A.push({t:'call',x:c.join(' ')});continue;}
 if(l.startsWith('|')){const rows=[];while(i<src.length&&src[i].startsWith('|')){if(!/^\|\s*-/.test(src[i]))rows.push(src[i].split('|').slice(1,-1).map(s=>s.trim()));i++;}A.push({t:'table',x:rows});continue;}
 if(l.startsWith('- ')){const c=[];while(i<src.length&&src[i].startsWith('- ')){c.push(src[i].slice(2));i++;}A.push({t:'ul',x:c});continue;}
 if(m=l.match(/^\d+\.\s/)){const st=parseInt(l);const c=[];while(i<src.length&&/^\d+\.\s/.test(src[i])){c.push(src[i].replace(/^\d+\.\s/,''));i++;}A.push({t:'ol',x:c,start:st});continue;}
 A.push({t:'p',x:l});i++;}
// ids de encabezados
let hn=0;A.forEach(n=>{if(n.t=='h1'||n.t=='h2')n.id='h'+(hn++);});
// ---------- plan (para el índice)
const plan=[];(function(){const pl=fs.readFileSync('../indice-maestro.md','utf8').split('\n');let blk=null;
 pl.forEach(l=>{let m;if(m=l.match(/^# (Bloque (\w) — .*)$/)){blk={t:m[1],k:m[2],parts:[]};plan.push(blk);}
  else if(blk&&(m=l.match(/^## (Parte (\d+)\. .*)$/))){blk.parts.push({n:parseInt(m[2]),t:m[1]});}
  else if(blk&&(m=l.match(/^## (Proyecto final: .*)$/))){blk.parts.push({n:'PF',t:m[1]});}
  else if(m=l.match(/^# (Anexos)$/)){blk={t:'Anexos',k:'X',parts:[{n:'AX',t:'Anexos: glosario, chuleta SQL, plantillas, soluciones y recursos'}]};plan.push(blk);}});})();
// secciones disponibles por parte
const partOf={};let curH1=null;const sections={};
A.forEach(n=>{if(n.t=='h1'){curH1=n;const m=n.x.match(/^Parte (\d+)\./);if(m){partOf[parseInt(m[1])]=n;sections[parseInt(m[1])]=[];}}
 else if(n.t=='h2'&&curH1){const m=curH1.x.match(/^Parte (\d+)\./);if(m&&/^\d+\.\d+\s/.test(n.x))sections[parseInt(m[1])].push(n);}});
const frontH1=A.find(n=>n.t=='h1');
// ---------- HTML
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const inl=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\*([^*]+)\*/g,'<i>$1</i>');
const KW=/\b(CREATE TABLE|CREATE UNIQUE INDEX|CREATE INDEX|CREATE VIEW|CREATE DATABASE|CREATE ROLE|ALTER TABLE|ADD COLUMN|ADD CONSTRAINT|CONSTRAINT|PRIMARY KEY|FOREIGN KEY|NOT NULL|UNIQUE|CHECK|DEFAULT|GENERATED ALWAYS AS IDENTITY|REFERENCES|ON DELETE CASCADE|ON DELETE SET NULL|ON DELETE RESTRICT|SELECT|FROM|WHERE|AS|ON|JOIN|LEFT JOIN|ORDER BY|GROUP BY|HAVING|INSERT INTO|VALUES|RETURNING|UPDATE|SET|DELETE FROM|DROP TABLE|DROP DATABASE|IS NULL|IS NOT NULL|AT TIME ZONE|LIKE|AND|OR|IN|NULL|DEFAULT VALUES|EXCEPT|DISTINCT|EXPLAIN ANALYZE|ANALYZE|GRANT|LIMIT|DESC)\b/g;
const hl=s=>/^\s*--/.test(s)?`<span class="st">${esc(s)}</span>`:/^\\/.test(s)?`<span class="nu">${esc(s)}</span>`:esc(s).replace(KW,'<span class="kw">$1</span>').replace(/('[^']*')/g,'<span class="st">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g,'<span class="nu">$1</span>');
function blockColor(h){const m=h.x.match(/^Parte (\d+)\./);if(!m)return BC['0'];const n=+m[1];for(const b of plan)if(b.parts.some(p=>p.n===n))return BC[b.k]||BC['0'];return BC['0'];}
function bodyHTML(){let h='';let color='#0B1B4D';
 A.forEach(n=>{switch(n.t){
  case 'h1':color=blockColor(n);h+=`<h1 id="${n.id}" class="part" style="border-color:${color}">${esc(n.x)}</h1>`;break;
  case 'h2':h+=`<h2 id="${n.id}" class="${/^\d+\.\d+\s/.test(n.x)?'pb':''}" style="border-color:${color}">${esc(n.x)}</h2>`;break;
  case 'h3':h+=`<h3>${esc(n.x)}</h3>`;break;
  case 'p':h+=`<p>${inl(n.x)}</p>`;break;
  case 'ul':h+=`<ul>${n.x.map(x=>`<li>${inl(x)}</li>`).join('')}</ul>`;break;
  case 'ol':h+=`<ol start="${n.start||1}">${n.x.map(x=>`<li>${inl(x)}</li>`).join('')}</ol>`;break;
  case 'call':h+=`<div class="call">${inl(n.x)}</div>`;break;
  case 'code':h+=`<pre>${n.x.map(l=>['sql','psql',''].includes(n.lang||'')?hl(l):esc(l)).join('\n')}</pre>`;break;
  case 'fig':h+=`<figure><img src="figs/${n.id}.png" style="width:${Math.min(meta[n.id].w,640)}px"><figcaption>${esc(n.cap)}</figcaption></figure>`;break;
  case 'table':h+=`<table><thead><tr>${n.x[0].map(c=>`<th>${inl(c)}</th>`).join('')}</tr></thead><tbody>${n.x.slice(1).map(r=>`<tr>${r.map(c=>`<td>${inl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;break;}});
 return h;}
function indexHTML(PAGE){const pg=id=>PAGE&&PAGE[id]?PAGE[id]:'···';
 let h=`<h1 class="idx" style="border-color:#FF7A1A">Índice general</h1><p class="idxnote">Cada entrada es un enlace. Las partes marcadas «en preparación» se incorporarán en las siguientes ediciones.</p>`;
 h+=`<div class="ip l0"><a href="#${frontH1.id}">${esc(frontH1.x)}</a><span class="dots"></span><span class="n">${pg(frontH1.id)}</span></div>`;
 plan.forEach(b=>{const c=BC[b.k]||BC['0'];h+=`<div class="ib" style="background:${c}">${esc(b.t)}</div>`;
  b.parts.forEach(p=>{const H=partOf[p.n];
   if(H){h+=`<div class="ip l1"><a href="#${H.id}">${esc(H.x)}</a><span class="dots"></span><span class="n">${pg(H.id)}</span></div>`;
    (sections[p.n]||[]).forEach(s=>{h+=`<div class="ip l2"><a href="#${s.id}">${esc(s.x)}</a><span class="dots"></span><span class="n">${pg(s.id)}</span></div>`;});}
   else h+=`<div class="ip l1 pend"><span>${esc(p.t)}</span><span class="dots"></span><span class="n">en preparación</span></div>`;});});
 h+=`<p class="fin">— Fin del índice —</p>`;return h;}
const CSS=`
@page{size:A4;margin:20mm 20mm 18mm 20mm;@top-right{content:"Manual completo de bases de datos";font-size:8pt;color:#44506B;font-family:'Liberation Sans',sans-serif}@bottom-center{content:counter(page);font-size:8.5pt;color:#44506B;font-family:'Liberation Sans',sans-serif}}
@page cover{margin:0;@top-right{content:none}@bottom-center{content:none}}
*{box-sizing:border-box}body{font-family:'Liberation Sans','DejaVu Sans',sans-serif;font-size:11pt;line-height:1.55;color:#222;margin:0}
.cover{page:cover;height:296.4mm;break-after:page;overflow:hidden}.cover img{display:block;width:210mm;height:296.4mm}
a{color:inherit;text-decoration:none}
h1{font-size:25pt;color:#0B1B4D;border-bottom:5px solid #0E9BD8;padding-bottom:6px;margin:0 0 16px}h1.part{break-before:page}h1.idx{break-before:auto}
h2{font-size:17pt;color:#0B1B4D;background:#EEF3FB;border-left:8px solid #0E9BD8;padding:7px 12px;margin:26px 0 12px;break-after:avoid}h2.pb{break-before:page;margin-top:0}
h3{font-size:12pt;color:#fff;background:#0E9BD8;display:block;width:max-content;padding:2px 12px;border-radius:4px;margin:16px 0 6px;break-after:avoid-page;break-inside:avoid}h3+p,h3+ul,h3+ol,h3+figure,h3+pre,h3+table,h3+.call{break-before:avoid-page}
p{margin:0 0 8px}ul,ol{margin:4px 0 10px;padding-left:26px}li{margin:3px 0}
code{font-family:'DejaVu Sans Mono',monospace;background:#EEF3FB;color:#7a2fd0;padding:0 4px;border-radius:3px;font-size:10pt}
pre{background:#08122E;color:#fff;border-radius:8px;padding:12px 16px;font-family:'DejaVu Sans Mono',monospace;font-size:9.5pt;line-height:1.5;margin:8px 0 12px;white-space:pre-wrap;break-inside:avoid}
.kw{color:#ff9ad5}.st{color:#6fe3a1}.nu{color:#ffc04d}
.call{background:#FFF4E8;border-left:6px solid #FF7A1A;padding:9px 14px;margin:10px 0;border-radius:0 6px 6px 0;break-inside:avoid}
figure{margin:12px 0;text-align:center;break-inside:avoid}figure img{max-width:100%;height:auto;border-radius:8px}figcaption{font-size:9.5pt;color:#44506B;margin-top:5px;font-style:italic}
table{border-collapse:collapse;width:100%;margin:8px 0 14px;font-size:10pt;break-inside:avoid}th{background:#0B1B4D;color:#fff;text-align:left;padding:6px 9px}td{padding:6px 9px;border:1px solid #C9D1E3;vertical-align:top}tbody tr:nth-child(even) td{background:#F2F5FB}
.idxnote{font-size:10pt;color:#44506B}.ib{color:#fff;font-weight:700;font-size:11pt;padding:3px 10px;margin:10px 0 3px;break-after:avoid}
.ip{display:flex;align-items:baseline;gap:6px;margin:0;line-height:1.35}.ip .dots{flex:1;border-bottom:1px dotted #99a}.ip .n{color:#44506B;font-size:9pt;min-width:18px;text-align:right}
.l0{font-size:10.5pt;font-weight:700;padding-left:6px}.l1{font-size:10.5pt;font-weight:700;padding-left:10px;margin-top:3px}.l2{font-size:9pt;padding-left:28px;color:#333}.pend{color:#8a93ad;font-weight:400}
.fin{text-align:center;color:#8a93ad;font-size:9pt;margin-top:14px}`;
function fullHTML(PAGE){return `<!doctype html><html lang="es"><meta charset="utf-8"><title>Manual completo de bases de datos</title><style>${CSS}</style><body><div class="cover"><img src="cover-full.png"></div>${indexHTML(PAGE)}${bodyHTML()}</body></html>`;}
// ---------- DOCX
const W=9638;
function runs(t,base={}){const out=[];t.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/).forEach(s=>{if(!s)return;
 if(s[0]=='`')out.push(new TextRun({text:s.slice(1,-1),font:'Consolas',color:'7A2FD0',...base}));
 else if(s.startsWith('**'))out.push(new TextRun({text:s.slice(2,-2),bold:true,...base}));
 else if(s[0]=='*'&&s.length>2)out.push(new TextRun({text:s.slice(1,-1),italics:true,...base}));
 else out.push(new TextRun({text:s,...base}));});return out;}
const hex=c=>c.replace('#','');
function docxChildren(){const body=[];let olN=0;const numCfg=[{reference:'ul',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]}];let color=NAVY;
 A.forEach(n=>{switch(n.t){
  case 'h1':color=hex(blockColor(n));body.push(new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:true,spacing:{after:240},border:{bottom:{style:BorderStyle.SINGLE,size:24,color,space:6}},children:[new Bookmark({id:n.id,children:[new TextRun({text:n.x,bold:true,size:48,color:NAVY})]})]}));break;
  case 'h2':body.push(new Paragraph({heading:HeadingLevel.HEADING_2,pageBreakBefore:/^\d+\.\d+\s/.test(n.x),keepNext:true,spacing:{before:320,after:160},shading:{type:ShadingType.CLEAR,fill:'EEF3FB'},border:{left:{style:BorderStyle.SINGLE,size:36,color,space:8}},children:[new Bookmark({id:n.id,children:[new TextRun({text:n.x,bold:true,size:34,color:NAVY})]})]}));break;
  case 'h3':body.push(new Paragraph({heading:HeadingLevel.HEADING_3,keepNext:true,spacing:{before:240,after:80},children:[new TextRun({text:' '+n.x+' ',bold:true,size:24,color:'FFFFFF',shading:{type:ShadingType.CLEAR,fill:CY}})]}));break;
  case 'p':body.push(new Paragraph({spacing:{after:120,line:312},children:runs(n.x,{size:22})}));break;
  case 'ul':n.x.forEach(x=>body.push(new Paragraph({numbering:{reference:'ul',level:0},spacing:{after:60,line:300},children:runs(x,{size:22})})));break;
  case 'ol':{const ref='ol'+(olN++);numCfg.push({reference:ref,levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',start:n.start||1,alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]});n.x.forEach(x=>body.push(new Paragraph({numbering:{reference:ref,level:0},spacing:{after:60,line:300},children:runs(x,{size:22})})));break;}
  case 'call':body.push(new Paragraph({spacing:{before:120,after:160,line:300},shading:{type:ShadingType.CLEAR,fill:'FFF4E8'},border:{left:{style:BorderStyle.SINGLE,size:36,color:ORG,space:8}},indent:{left:200},children:runs(n.x,{size:21})}));break;
  case 'code':n.x.forEach((c,k)=>body.push(new Paragraph({spacing:{after:0},shading:{type:ShadingType.CLEAR,fill:'08122E'},indent:{left:120,right:120},keepNext:k<n.x.length-1,children:[new TextRun({text:c||' ',font:'Consolas',size:19,color:'FFFFFF'})]})));body.push(new Paragraph({spacing:{after:120},children:[]}));break;
  case 'fig':{const m=meta[n.id];const w=Math.min(m.w,600),hh=Math.round(m.h*w/m.w);body.push(new Paragraph({alignment:AlignmentType.CENTER,keepNext:true,spacing:{before:120,after:60},children:[new ImageRun({type:'png',data:fs.readFileSync(`figs/${n.id}.png`),transformation:{width:w,height:hh},altText:{title:n.cap,description:n.cap,name:n.id}})]}));
   body.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:160},children:[new TextRun({text:n.cap,italics:true,size:19,color:GREY})]}));break;}
  case 'table':{const cols=n.x[0].length;const widths=cols==2?[2800,W-2800]:cols==3?[2400,2300,W-4700]:Array(cols).fill(Math.floor(W/cols));const tw=widths.reduce((a,b)=>a+b,0);
   const bd={style:BorderStyle.SINGLE,size:4,color:'C9D1E3'};const borders={top:bd,bottom:bd,left:bd,right:bd};
   body.push(new Table({width:{size:tw,type:WidthType.DXA},columnWidths:widths,rows:n.x.map((r,ri)=>new TableRow({tableHeader:ri==0,cantSplit:true,children:r.map((c,ci)=>new TableCell({borders,width:{size:widths[ci],type:WidthType.DXA},margins:{top:70,bottom:70,left:110,right:110},shading:ri==0?{type:ShadingType.CLEAR,fill:NAVY}:(ri%2==0?{type:ShadingType.CLEAR,fill:'F2F5FB'}:undefined),children:[new Paragraph({children:runs(c,{size:20,bold:ri==0,color:ri==0?'FFFFFF':'222222'})})]}))}))}));
   body.push(new Paragraph({spacing:{after:120},children:[]}));break;}}});
 return {body,numCfg};}
function docxIndex(){const link=(id,text,o)=>new Paragraph({spacing:{after:o.after||30},indent:{left:o.left||0},children:[new InternalHyperlink({anchor:id,children:[new TextRun({text,size:o.size||21,bold:o.bold,color:o.color||'222222'})]})]});
 const out=[new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{after:160},border:{bottom:{style:BorderStyle.SINGLE,size:24,color:ORG,space:6}},children:[new TextRun({text:'Índice general',bold:true,size:48,color:NAVY})]}),
  new Paragraph({spacing:{after:120},children:[new TextRun({text:'Cada entrada es un enlace a su apartado. Las partes marcadas «en preparación» se incorporarán en las siguientes ediciones. (En Word, mantén pulsado Ctrl y haz clic en una entrada.)',size:19,color:GREY})]}),
  link(frontH1.id,frontH1.x,{bold:true,size:22})];
 plan.forEach(b=>{const c=hex(BC[b.k]||BC['0']);out.push(new Paragraph({keepNext:true,spacing:{before:140,after:50},shading:{type:ShadingType.CLEAR,fill:c},children:[new TextRun({text:'  '+b.t,bold:true,size:23,color:'FFFFFF'})]}));
  b.parts.forEach(p=>{const H=partOf[p.n];
   if(H){out.push(link(H.id,H.x,{bold:true,size:22,left:200,after:20}));(sections[p.n]||[]).forEach(s=>out.push(link(s.id,s.x,{size:19,left:560,after:6})));}
   else out.push(new Paragraph({spacing:{after:20},indent:{left:200},children:[new TextRun({text:p.t+' — en preparación',size:21,color:'8A93AD'})]}));});});
 return out;}
// ---------- construcción
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 let c=fs.readFileSync('cover.html','utf8').replace('MANUAL PROFESIONAL · ÍNDICE MAESTRO','MANUAL PROFESIONAL · EDICIÓN COMPLETA');fs.writeFileSync('cover-full.html',c);
 let p=await b.newPage({viewport:{width:1240,height:1754},deviceScaleFactor:1.5});await p.goto('file://'+process.cwd()+'/cover-full.html');await p.screenshot({path:'cover-full.png'});
 const pdfOpts={path:'book.pdf',preferCSSPageSize:true,printBackground:true,outline:true,tagged:true};
 // pasada 1
 fs.writeFileSync('book.html',fullHTML(null));p=await b.newPage();await p.goto('file://'+process.cwd()+'/book.html');await p.pdf(pdfOpts);
 const pages1=execFileSync('pdftotext',['-layout','book.pdf','-'],{encoding:'utf8',maxBuffer:1<<28}).split('\f');
 const total1=pages1.filter((x,k)=>k<pages1.length-1||x.trim()).length;
 // localizar páginas
 const heads=A.filter(n=>n.t=='h1'||(n.t=='h2'&&/^\d+\.\d+\s/.test(n.x)));
 let ptr=pages1.findIndex(t=>t.includes('Fin del índice'))+1;const PAGE={};
 heads.forEach(h=>{const key=h.x.slice(0,45);let k=ptr;for(;k<pages1.length;k++){if(pages1[k].split('\n').some(l=>l.trim().startsWith(key)))break;}
  if(k<pages1.length){PAGE[h.id]=k+1;ptr=k;}else{console.log('no encontrado:',h.x);}});
 // pasada 2
 fs.writeFileSync('book.html',fullHTML(PAGE));p=await b.newPage();await p.goto('file://'+process.cwd()+'/book.html');await p.pdf(pdfOpts);await b.close();
 const pages2=execFileSync('pdftotext',['-layout','book.pdf','-'],{encoding:'utf8',maxBuffer:1<<28}).split('\f');
 console.log('páginas pasada1/2:',total1,pages2.filter((x,k)=>k<pages2.length-1||x.trim()).length);
 fs.copyFileSync('book.pdf',OUT+'.pdf');
 // DOCX
 const {body,numCfg}=docxChildren();
 const doc=new Document({creator:'Silen',title:'Manual completo de bases de datos',description:'De cero absoluto a nivel profesional',
  styles:{default:{document:{run:{font:'Calibri',size:22}}},paragraphStyles:[
   {id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:48,bold:true,color:NAVY},paragraph:{outlineLevel:0}},
   {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:34,bold:true,color:NAVY},paragraph:{outlineLevel:1}},
   {id:'Heading3',name:'Heading 3',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:24,bold:true},paragraph:{outlineLevel:2}}]},
  numbering:{config:numCfg},
  sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:0,bottom:0,left:0,right:0,header:0,footer:0}}},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new ImageRun({type:'png',data:fs.readFileSync('cover-full.png'),transformation:{width:793,height:1121},altText:{title:'Portada',description:'Portada del manual',name:'portada'}})]})]},
   {properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134,header:500,footer:500},pageNumbers:{start:1}}},
    headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,border:{bottom:{style:BorderStyle.SINGLE,size:6,color:'C9D1E3',space:4}},children:[new TextRun({text:'Manual completo de bases de datos',size:17,color:GREY})]})]})},
    footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'Página ',size:17,color:GREY}),new TextRun({children:[PageNumber.CURRENT],size:17,color:GREY})]})]})},
    children:[...docxIndex(),...body]}]});
 fs.writeFileSync(OUT+'.docx',await Packer.toBuffer(doc));
 console.log('ok',OUT);
})();
