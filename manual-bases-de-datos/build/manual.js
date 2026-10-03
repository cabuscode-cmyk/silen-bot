const fs=require('fs');const { execFileSync }=require('child_process');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const D=require('/opt/node-tools/node_modules/docx');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,ImageRun,HeadingLevel,AlignmentType,Footer,Header,PageNumber,LevelFormat,TabStopType}=D;
const NUM=process.argv[2]||'01', LABEL=process.argv[3]||'PARTE 1 · FUNDAMENTOS ABSOLUTOS';
let VALS={};try{VALS=JSON.parse(fs.readFileSync('figs/vals.json','utf8'));}catch(e){}
let src=fs.readFileSync(`../capitulos/parte-${NUM}.md`,'utf8').replace(/\{\{(\w+)\}\}/g,(_,k)=>{if(!(k in VALS))throw new Error('falta valor '+k);return VALS[k];}).split('\n');
// numeración automática de figuras por sección
(function(){let sec=null;const LAB={},cnt={};
 src.forEach(l=>{let mm=l.match(/^## (\d+\.\d+)\b/);if(mm)sec=mm[1];mm=l.match(/^@(?:fig|demo) ([\w-]+) \|/);if(mm&&sec){cnt[sec]=(cnt[sec]||0)+1;LAB[mm[1]]=sec+'-'+String.fromCharCode(96+cnt[sec]);}});
 src=src.map(l=>{let mm=l.match(/^@(?:fig|demo) ([\w-]+) \|/);if(mm&&LAB[mm[1]])l=l.replace(/Figura [\d.]+-[a-z]\./,'Figura '+LAB[mm[1]]+'.');
  return l.replace(/\{\{fig:([\w-]+)\}\}/g,(_,id)=>{if(!LAB[id])throw new Error('figura sin etiqueta '+id);return LAB[id];});});})();
const meta=JSON.parse(fs.readFileSync('figs/meta.json','utf8'));const CODEJ=JSON.parse(fs.readFileSync('figs/code.json','utf8'));
const NAVY='0B1B4D',CY='0E9BD8',ORG='FF7A1A';
// ---------- parse
const A=[];let i=0;
while(i<src.length){const l=src[i];let m;
 if(l.startsWith('# ')){A.push({t:'h1',x:l.slice(2)});i++;continue;}
 if(l.startsWith('## ')){A.push({t:'h2',x:l.slice(3)});i++;continue;}
 if(l.startsWith('### ')){A.push({t:'h3',x:l.slice(4)});i++;continue;}
 if(!l.trim()){i++;continue;}
 if(l.startsWith('```')){const lang=l.slice(3);const c=[];i++;while(!src[i].startsWith('```')){c.push(src[i]);i++;}i++;A.push({t:'code',x:c,lang});continue;}
 if(l.startsWith('@code ')){const id=l.slice(6).trim();const c=CODEJ[id];if(!c)throw new Error('sin código para '+id);A.push({t:'code',x:c.text.split('\n'),lang:c.lang});i++;continue;}
 if(l.startsWith('@demo ')){const [id,cap]=l.slice(6).split('|').map(s=>s.trim());const c=CODEJ[id];if(!c)throw new Error('sin código para '+id);A.push({t:'code',x:c.text.split('\n'),lang:c.lang,demo:id,db:c.db});A.push({t:'fig',id,cap});i++;continue;}
 if(l.startsWith('@fig ')){const [id,cap]=l.slice(5).split('|').map(s=>s.trim());A.push({t:'fig',id,cap});i++;continue;}
 if(l.startsWith('> ')){const c=[];while(i<src.length&&src[i].startsWith('> ')){c.push(src[i].slice(2));i++;}A.push({t:'call',x:c.join(' ')});continue;}
 if(l.startsWith('|')){const rows=[];while(i<src.length&&src[i].startsWith('|')){if(!/^\|\s*-/.test(src[i]))rows.push(src[i].split('|').slice(1,-1).map(s=>s.trim()));i++;}A.push({t:'table',x:rows});continue;}
 if(l.startsWith('- ')){const c=[];while(i<src.length&&src[i].startsWith('- ')){c.push(src[i].slice(2));i++;}A.push({t:'ul',x:c});continue;}
 if(m=l.match(/^\d+\.\s/)){const c=[];while(i<src.length&&/^\d+\.\s/.test(src[i])){c.push(src[i].replace(/^\d+\.\s/,''));i++;}A.push({t:'ol',x:c});continue;}
 A.push({t:'p',x:l});i++;}

// ---- script .sql descargable de la parte
(function(){
 const demos=A.filter(n=>n.t=='code'&&n.demo);
 if(!demos.length)return;
 const dbs=[...new Set(demos.filter(d=>d.lang=='sql'&&d.db).map(d=>d.db))].filter(d=>d!='postgres');
 let out=`-- ============================================================\n-- Manual completo de bases de datos — Parte ${NUM}\n-- Todo el código de los ejemplos, en el orden en que aparece.\n--\n-- Cómo usarlo:  psql -U postgres -f parte-${NUM}.sql\n--           (o, dentro de psql:  \\i parte-${NUM}.sql )\n--\n-- IMPORTANTE:\n--  * Algunas sentencias FALLAN A PROPÓSITO para mostrar un error;\n--    el manual lo explica en cada figura.\n--  * Los bloques usan \\c para cambiar de base de datos.\n--  * Los comandos de terminal aparecen como comentarios (-- $ ...) con los\n--    parámetros de conexión del entorno donde se generó el manual\n--    (-h, -p, -U); en tu instalación usa los tuyos.\n--  * Está pensado para una instalación de prácticas, no para datos reales.\n-- ============================================================\n\n`;
 if(dbs.length){out+=`-- Bases de datos que usa esta parte (si ya existen, el error es inofensivo)\n`;dbs.forEach(d=>out+=`CREATE DATABASE ${d};\n`);out+='\n';}
 demos.forEach(d=>{
  out+=`-- ------------------------------------------------------------\n-- Figura ${d.demo}`+(d.lang=='sql'?` (base de datos: ${d.db})`:` (comandos de terminal)`)+`\n-- ------------------------------------------------------------\n`;
  if(d.lang=='sql'){out+=`\\c ${d.db}\n`;out+=d.x.join('\n')+'\n\n';}
  else{out+=d.x.map(l=>'-- $ '+l).join('\n')+'\n\n';}
 });
 fs.mkdirSync('../ejemplos/sql',{recursive:true});
 fs.writeFileSync(`../ejemplos/sql/parte-${NUM}.sql`,out);
})();

// ---------- HTML
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const inl=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\*([^*]+)\*/g,'<i>$1</i>');
const KW=/\b(CREATE TABLE|CREATE UNIQUE INDEX|CREATE INDEX|CREATE VIEW|CREATE DATABASE|ALTER TABLE|ADD COLUMN|ADD CONSTRAINT|CONSTRAINT|PRIMARY KEY|FOREIGN KEY|NOT NULL|UNIQUE|CHECK|DEFAULT|GENERATED ALWAYS AS IDENTITY|REFERENCES|ON DELETE CASCADE|ON DELETE SET NULL|ON DELETE RESTRICT|SELECT|FROM|WHERE|AS|ON|JOIN|LEFT JOIN|ORDER BY|INSERT INTO|VALUES|RETURNING|UPDATE|SET|DELETE FROM|IS NULL|IS NOT NULL|AT TIME ZONE|LIKE|AND|OR|IN|NULL|DEFAULT VALUES)\b/g;
const hl=s=>/^\s*--/.test(s)?`<span class="st">${esc(s)}</span>`:/^\\/.test(s)?`<span class="nu">${esc(s)}</span>`:esc(s).replace(KW,'<span class="kw">$1</span>').replace(/('[^']*')/g,'<span class="st">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g,'<span class="nu">$1</span>');
let h='';let figN=0;
A.forEach(n=>{switch(n.t){
 case 'h1':h+=`<h1>${esc(n.x)}</h1>`;break;
 case 'h2':h+=`<h2 class="${/^\d+\.\d+/.test(n.x)?'pb':''}">${esc(n.x)}</h2>`;break;
 case 'h3':h+=`<h3>${esc(n.x)}</h3>`;break;
 case 'p':h+=`<p>${inl(n.x)}</p>`;break;
 case 'ul':h+=`<ul>${n.x.map(x=>`<li>${inl(x)}</li>`).join('')}</ul>`;break;
 case 'ol':h+=`<ol>${n.x.map(x=>`<li>${inl(x)}</li>`).join('')}</ol>`;break;
 case 'call':h+=`<div class="call">${inl(n.x)}</div>`;break;
 case 'code':h+=`<pre>${n.x.map(l=>['sql','psql',''].includes(n.lang||'')?hl(l):esc(l)).join('\n')}</pre>`;break;
 case 'fig':h+=`<figure><img src="figs/${n.id}.png" style="width:${Math.min(meta[n.id].w,640)}px"><figcaption>${esc(n.cap)}</figcaption></figure>`;break;
 case 'table':h+=`<table><thead><tr>${n.x[0].map(c=>`<th>${inl(c)}</th>`).join('')}</tr></thead><tbody>${n.x.slice(1).map(r=>`<tr>${r.map(c=>`<td>${inl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;break;}});
const secs=A.filter(n=>n.t=='h2').map(n=>n.x);
const title=A.find(n=>n.t=='h1').x;
const idx=`<h1 style="border-color:#FF7A1A">Contenido de esta parte</h1>`+secs.map(s=>`<div class="ip">${esc(s)}</div>`).join('');
const html=`<!doctype html><html lang="es"><meta charset="utf-8"><style>
*{box-sizing:border-box}body{font-family:'Liberation Sans','DejaVu Sans',sans-serif;font-size:11pt;line-height:1.55;color:#222;margin:0}
h1{font-size:25pt;color:#0B1B4D;border-bottom:5px solid #0E9BD8;padding-bottom:6px;margin:0 0 16px}
h2{font-size:17pt;color:#0B1B4D;background:#EEF3FB;border-left:8px solid #0E9BD8;padding:7px 12px;margin:26px 0 12px;page-break-after:avoid}h2.pb{page-break-before:always;margin-top:0}
h3{font-size:12pt;color:#fff;background:#0E9BD8;display:block;width:max-content;padding:2px 12px;border-radius:4px;margin:16px 0 6px;break-after:avoid-page;page-break-after:avoid;break-inside:avoid}h3+p,h3+ul,h3+ol,h3+figure,h3+pre,h3+table,h3+.call{break-before:avoid-page}
p{margin:0 0 8px}ul,ol{margin:4px 0 10px;padding-left:26px}li{margin:3px 0}
code{font-family:'DejaVu Sans Mono',monospace;background:#EEF3FB;color:#7a2fd0;padding:0 4px;border-radius:3px;font-size:10pt}
pre{background:#08122E;color:#fff;border-radius:8px;padding:12px 16px;font-family:'DejaVu Sans Mono',monospace;font-size:9.5pt;line-height:1.5;margin:8px 0 12px;white-space:pre-wrap;page-break-inside:avoid}
.kw{color:#ff9ad5}.st{color:#6fe3a1}.nu{color:#ffc04d}
.call{background:#FFF4E8;border-left:6px solid #FF7A1A;padding:9px 14px;margin:10px 0;border-radius:0 6px 6px 0;page-break-inside:avoid}
figure{margin:12px 0;text-align:center;page-break-inside:avoid}figure img{max-width:100%;height:auto;border-radius:8px}figcaption{font-size:9.5pt;color:#44506B;margin-top:5px;font-style:italic}
table{border-collapse:collapse;width:100%;margin:8px 0 14px;font-size:10pt;page-break-inside:avoid}th{background:#0B1B4D;color:#fff;text-align:left;padding:6px 9px}td{padding:6px 9px;border:1px solid #C9D1E3;vertical-align:top}tbody tr:nth-child(even) td{background:#F2F5FB}
.ip{padding:5px 12px;border-bottom:1px dotted #99a;font-size:11pt}.wrap{page-break-after:always}
</style><body><div class="wrap">${idx}</div>${h}</body></html>`;
fs.writeFileSync('chapter.html',html);
// ---------- DOCX
const W=9638;
function runs(t,base={}){const out=[];t.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/).forEach(s=>{if(!s)return;
 if(s[0]=='`')out.push(new TextRun({text:s.slice(1,-1),font:'Consolas',color:'7A2FD0',...base}));
 else if(s.startsWith('**'))out.push(new TextRun({text:s.slice(2,-2),bold:true,...base}));
 else if(s[0]=='*'&&s.length>2)out.push(new TextRun({text:s.slice(1,-1),italics:true,...base}));
 else out.push(new TextRun({text:s,...base}));});return out;}
const body=[];let first=true;let olN=0;const numCfg=[{reference:'ul',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]}];
A.forEach(n=>{switch(n.t){
 case 'h1':body.push(new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{after:240},border:{bottom:{style:BorderStyle.SINGLE,size:24,color:CY,space:6}},children:[new TextRun({text:n.x,bold:true,size:48,color:NAVY})]}));break;
 case 'h2':body.push(new Paragraph({heading:HeadingLevel.HEADING_2,pageBreakBefore:/^\d+\.\d+/.test(n.x),keepNext:true,spacing:{before:320,after:160},shading:{type:ShadingType.CLEAR,fill:'EEF3FB'},border:{left:{style:BorderStyle.SINGLE,size:36,color:CY,space:8}},children:[new TextRun({text:n.x,bold:true,size:34,color:NAVY})]}));break;
 case 'h3':body.push(new Paragraph({heading:HeadingLevel.HEADING_3,keepNext:true,spacing:{before:240,after:80},children:[new TextRun({text:' '+n.x+' ',bold:true,size:24,color:'FFFFFF',shading:{type:ShadingType.CLEAR,fill:CY}})]}));break;
 case 'p':body.push(new Paragraph({spacing:{after:120,line:312},children:runs(n.x,{size:22})}));break;
 case 'ul':n.x.forEach(x=>body.push(new Paragraph({numbering:{reference:'ul',level:0},spacing:{after:60,line:300},children:runs(x,{size:22})})));break;
 case 'ol':{const ref='ol'+(olN++);numCfg.push({reference:ref,levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]});n.x.forEach(x=>body.push(new Paragraph({numbering:{reference:ref,level:0},spacing:{after:60,line:300},children:runs(x,{size:22})})));break;}
 case 'call':body.push(new Paragraph({spacing:{before:120,after:160,line:300},shading:{type:ShadingType.CLEAR,fill:'FFF4E8'},border:{left:{style:BorderStyle.SINGLE,size:36,color:ORG,space:8}},indent:{left:200},children:runs(n.x,{size:21})}));break;
 case 'code':n.x.forEach((c,k)=>body.push(new Paragraph({spacing:{after:0},shading:{type:ShadingType.CLEAR,fill:'08122E'},indent:{left:120,right:120},keepNext:k<n.x.length-1,children:[new TextRun({text:c||' ',font:'Consolas',size:19,color:'FFFFFF'})]})));body.push(new Paragraph({spacing:{after:120},children:[]}));break;
 case 'fig':{const m=meta[n.id];const w=Math.min(m.w,600),hh=Math.round(m.h*w/m.w);body.push(new Paragraph({alignment:AlignmentType.CENTER,keepNext:true,spacing:{before:120,after:60},children:[new ImageRun({type:'png',data:fs.readFileSync(`figs/${n.id}.png`),transformation:{width:w,height:hh},altText:{title:n.cap,description:n.cap,name:n.id}})]}));
  body.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:160},children:[new TextRun({text:n.cap,italics:true,size:19,color:'44506B'})]}));break;}
 case 'table':{const cols=n.x[0].length;const widths=cols==2?[2800,W-2800]:cols==3?[2400,2300,W-4700]:Array(cols).fill(Math.floor(W/cols));const tw=widths.reduce((a,b)=>a+b,0);
  const bd={style:BorderStyle.SINGLE,size:4,color:'C9D1E3'};const borders={top:bd,bottom:bd,left:bd,right:bd};
  body.push(new Table({width:{size:tw,type:WidthType.DXA},columnWidths:widths,rows:n.x.map((r,ri)=>new TableRow({tableHeader:ri==0,cantSplit:true,children:r.map((c,ci)=>new TableCell({borders,width:{size:widths[ci],type:WidthType.DXA},margins:{top:70,bottom:70,left:110,right:110},shading:ri==0?{type:ShadingType.CLEAR,fill:NAVY}:(ri%2==0?{type:ShadingType.CLEAR,fill:'F2F5FB'}:undefined),children:[new Paragraph({children:runs(c,{size:20,bold:ri==0,color:ri==0?'FFFFFF':'222222'})})]}))}))}));
  body.push(new Paragraph({spacing:{after:120},children:[]}));break;}}});
const idxd=[new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{after:200},border:{bottom:{style:BorderStyle.SINGLE,size:24,color:ORG,space:6}},children:[new TextRun({text:'Contenido de esta parte',bold:true,size:44,color:NAVY})]}),
 ...secs.map(s=>new Paragraph({spacing:{after:80},border:{bottom:{style:BorderStyle.DOTTED,size:4,color:'99AAAA',space:2}},children:[new TextRun({text:s,size:22})]}))];
const mkCov=()=>[new Paragraph({alignment:AlignmentType.CENTER,children:[new ImageRun({type:'png',data:fs.readFileSync('cover-part.png'),transformation:{width:793,height:1121},altText:{title:'Portada',description:'Portada',name:'portada'}})]})];
const mkDoc=()=>{const cov=mkCov();return new Document({creator:'Silen',title:`Manual completo de bases de datos — ${title}`,
 styles:{default:{document:{run:{font:'Calibri',size:22}}},paragraphStyles:[
  {id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:48,bold:true,color:NAVY},paragraph:{outlineLevel:0}},
  {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:34,bold:true,color:NAVY},paragraph:{outlineLevel:1}},
  {id:'Heading3',name:'Heading 3',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:24,bold:true},paragraph:{outlineLevel:2}}]},
 numbering:{config:numCfg},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:0,bottom:0,left:0,right:0,header:0,footer:0}}},children:cov},
  {properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134,header:500,footer:500},pageNumbers:{start:1}}},
   headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,border:{bottom:{style:BorderStyle.SINGLE,size:6,color:'C9D1E3',space:4}},children:[new TextRun({text:`Manual completo de bases de datos · ${title}`,size:17,color:'44506B'})]})]})},
   footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'Página ',size:17,color:'44506B'}),new TextRun({children:[PageNumber.CURRENT],size:17,color:'44506B'})]})]})},
   children:[...idxd,new Paragraph({pageBreakBefore:true,children:[]}),...body]}]});};
(async()=>{
 // cover
 let c=fs.readFileSync('cover.html','utf8').replace('MANUAL PROFESIONAL · ÍNDICE MAESTRO',LABEL);fs.writeFileSync('cover-part.html',c);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 let p=await b.newPage({viewport:{width:1240,height:1754},deviceScaleFactor:1.5});await p.goto('file://'+process.cwd()+'/cover-part.html');await p.screenshot({path:'cover-part.png'});
 fs.writeFileSync('cover-page-part.html','<!doctype html><style>@page{size:A4;margin:0}html,body{margin:0}img{display:block;width:210mm;height:297mm}</style><img src="cover-part.png">');
 p=await b.newPage();await p.goto('file://'+process.cwd()+'/cover-page-part.html');await p.pdf({path:'cover-p.pdf',width:'210mm',height:'297mm',printBackground:true});
 await p.goto('file://'+process.cwd()+'/chapter.html');
 await p.pdf({path:'chapter-p.pdf',format:'A4',printBackground:true,margin:{top:'20mm',bottom:'18mm',left:'20mm',right:'20mm'},displayHeaderFooter:true,
  headerTemplate:`<div style="font-size:8px;color:#44506B;width:100%;text-align:right;padding-right:20mm;font-family:sans-serif">Manual completo de bases de datos · ${title}</div>`,
  footerTemplate:'<div style="font-size:8px;color:#44506B;width:100%;text-align:center;font-family:sans-serif">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>'});
 await b.close();
 execFileSync('pdfunite',['cover-p.pdf','chapter-p.pdf',`../Manual-Bases-de-Datos-Parte-${NUM}.pdf`]);
 fs.writeFileSync(`../Manual-Bases-de-Datos-Parte-${NUM}.docx`,await Packer.toBuffer(mkDoc()));console.log('ok');})();
