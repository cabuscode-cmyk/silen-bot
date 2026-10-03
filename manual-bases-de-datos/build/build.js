const fs=require('fs');
const D=require('docx');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,ImageRun,PageBreak,HeadingLevel,AlignmentType,Footer,Header,PageNumber,LevelFormat,TabStopType}=D;
const md=fs.readFileSync('../indice-maestro.md','utf8').split('\n');
const NAVY='0B1B4D',CY='0E9BD8',ORG='FF7A1A',PUR='7A3FE0',GREY='44506B';
const accent={A:CY,B:PUR,C:ORG,D:'0F7C8F',E:'C2338A',F:'D1383D',G:'2E9E5B'};
const W=9638; // A4 minus 2cm margins (11906-2*1134)
// ---- parse
const blocks=[];let i=0;
function runs(t,base={}){ // **bold**
  const out=[];t.split(/(\*\*[^*]+\*\*)/).forEach(s=>{if(!s)return;
    if(s.startsWith('**'))out.push(new TextRun({text:s.slice(2,-2),bold:true,...base}));else out.push(new TextRun({text:s,...base}));});
  return out;}
const toc=[]; // {lvl,text,modules}
let cur=null,curPart=null;
const body=[];
function para(t,opts={}){return new Paragraph({spacing:{after:120,line:300},...opts,children:runs(t,{size:22,color:'222222'})});}
function table(rows){
  const cols=rows[0].length;
  const widths= cols==2?[2400,W-2400]: cols==3?[1900,1500,W-3400]:Array(cols).fill(Math.floor(W/cols));
  const tw=widths.reduce((a,b)=>a+b,0);
  const bd={style:BorderStyle.SINGLE,size:4,color:'C9D1E3'};const borders={top:bd,bottom:bd,left:bd,right:bd};
  return new Table({width:{size:tw,type:WidthType.DXA},columnWidths:widths,rows:rows.map((r,ri)=>new TableRow({tableHeader:ri==0,cantSplit:true,children:r.map((c,ci)=>new TableCell({borders,width:{size:widths[ci],type:WidthType.DXA},
    margins:{top:80,bottom:80,left:120,right:120},
    shading:ri==0?{type:ShadingType.CLEAR,fill:cur?cur.color:NAVY}:(ri%2==0?{type:ShadingType.CLEAR,fill:'F2F5FB'}:undefined),
    children:[new Paragraph({children:runs(c,{size:20,bold:ri==0,color:ri==0?'FFFFFF':'222222'})})]}))}))});
}
let first=true;
while(i<md.length){
  const l=md[i];
  if(l.startsWith('# ')){
    const t=l.slice(2);const m=t.match(/^Bloque ([A-G])/);
    cur={color:m?accent[m[1]]:NAVY,title:t};
    toc.push({lvl:1,text:t,color:cur.color,parts:[]});
    body.push(new Paragraph({pageBreakBefore:!first,heading:HeadingLevel.HEADING_1,spacing:{before:0,after:240},
      border:{bottom:{style:BorderStyle.SINGLE,size:24,color:cur.color,space:6}},children:[new TextRun({text:t,bold:true,size:40,color:NAVY})]}));
    first=false;i++;continue;}
  if(l.startsWith('## ')){
    const t=l.slice(3);const e={text:t,n:0};
    if(toc.length&&/^Parte|^Proyecto/.test(t))toc[toc.length-1].parts.push(e);
    curPart=e;
    body.push(new Paragraph({heading:HeadingLevel.HEADING_2,keepNext:true,spacing:{before:360,after:160},
      shading:{type:ShadingType.CLEAR,fill:'EEF3FB'},border:{left:{style:BorderStyle.SINGLE,size:36,color:cur?cur.color:NAVY,space:8}},
      children:[new TextRun({text:t,bold:true,size:30,color:cur&&cur.color!=NAVY?cur.color:NAVY})]}));
    i++;continue;}
  if(l.trim()===''){i++;continue;}
  if(l.startsWith('@steps')){i++;let n=1;while(!md[i].startsWith('@end')){
    body.push(new Paragraph({spacing:{after:60},indent:{left:540,hanging:540},children:[new TextRun({text:n+'.\t',bold:true,color:ORG,size:22}),new TextRun({text:md[i],size:22})],tabStops:[{type:TabStopType.LEFT,position:540}]}));n++;i++;}
    i++;continue;}
  if(l.startsWith('|')){const rows=[];while(i<md.length&&md[i].startsWith('|')){if(!/^\|\s*-/.test(md[i]))rows.push(md[i].split('|').slice(1,-1).map(s=>s.trim()));i++;}
    body.push(table(rows));body.push(new Paragraph({spacing:{after:120},children:[]}));continue;}
  let m;
  if(m=l.match(/^(\d+\.\d+(?:\.\d+)?|F\.\d+|[A-G]\.)\s+(.*)/)){
    if(curPart&&/^\d/.test(m[1]))curPart.n++;
    const sub=/^\d+\.\d+\.\d+/.test(m[1]);
    body.push(new Paragraph({spacing:{after:70,line:290},indent:{left:(sub?1260:780),hanging:(sub?720:780)},tabStops:[{type:TabStopType.LEFT,position:sub?1260:780}],
      children:[new TextRun({text:m[1]+'\t',bold:true,color:cur?cur.color:NAVY,size:21}),...runs(m[2],{size:21,color:'222222'})]}));
    i++;continue;}
  body.push(para(l));i++;
}
// ---- cover
const cover=[new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:0},children:[new ImageRun({type:'png',data:fs.readFileSync('cover.png'),transformation:{width:793,height:1121},altText:{title:'Portada',description:'Portada del manual de bases de datos',name:'portada'}})]})];
// ---- index page
const idx=[new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{after:200},border:{bottom:{style:BorderStyle.SINGLE,size:24,color:ORG,space:6}},children:[new TextRun({text:'Índice general',bold:true,size:44,color:NAVY})]}),
 para('Mapa de los 7 bloques, las 20 partes, el proyecto final y los anexos. El número entre paréntesis indica cuántos módulos tiene cada parte.')];
toc.forEach(b=>{
  idx.push(new Paragraph({keepNext:true,spacing:{before:120,after:40},shading:{type:ShadingType.CLEAR,fill:b.color},children:[new TextRun({text:'  '+b.text,bold:true,size:24,color:'FFFFFF'})]}));
  b.parts.forEach(p=>idx.push(new Paragraph({spacing:{after:10,line:250},indent:{left:360},tabStops:[{type:TabStopType.RIGHT,position:W}],
    children:[new TextRun({text:p.text,size:21,color:'222222'}),new TextRun({text:p.n?`\t(${p.n})`:'',size:19,color:GREY})]})));
});
const cs=(s)=>({page:{size:{width:11906,height:16838},margin:s}});
const doc=new Document({creator:'Silen',title:'Manual completo de bases de datos — Índice maestro',description:'Índice maestro del manual de bases de datos',
 styles:{default:{document:{run:{font:'Calibri',size:22}}},paragraphStyles:[
  {id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:40,bold:true,font:'Calibri',color:NAVY},paragraph:{outlineLevel:0}},
  {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:30,bold:true,font:'Calibri'},paragraph:{outlineLevel:1}}]},
 sections:[
  {properties:{page:{size:{width:11906,height:16838},margin:{top:0,bottom:0,left:0,right:0,header:0,footer:0}}},children:cover},
  {properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134,header:500,footer:500},pageNumbers:{start:1}}},
   headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,border:{bottom:{style:BorderStyle.SINGLE,size:6,color:'C9D1E3',space:4}},children:[new TextRun({text:'Manual completo de bases de datos · Índice maestro',size:17,color:GREY})]})]})},
   footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'Página ',size:17,color:GREY}),new TextRun({children:[PageNumber.CURRENT],size:17,color:GREY})]})]})},
   children:[...idx,new Paragraph({children:[new PageBreak()]}),...body]}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync('../Manual-Bases-de-Datos-Indice-Maestro.docx',b);console.log('ok',toc.map(t=>t.parts.length))});
