const fs=require('fs');const { chromium } = require('/opt/node-tools/node_modules/playwright');
const CSS=`*{box-sizing:border-box}body{margin:0;background:#fff;font-family:'Liberation Sans','DejaVu Sans',sans-serif;color:#1b2440}
#fig{display:inline-block;padding:22px;background:linear-gradient(135deg,#f4f7fd,#eef3fb);border:1px solid #d5ddef;border-radius:14px}
.row{display:flex;align-items:center;gap:26px}.col{display:flex;flex-direction:column;gap:12px}
.win{background:#fff;border:1px solid #c5cee3;border-radius:10px;overflow:hidden;box-shadow:0 4px 14px rgba(20,40,100,.12)}
.bar{background:#0b1b4d;color:#cfe;font-size:13px;padding:7px 12px;display:flex;gap:6px;align-items:center}
.bar i{width:10px;height:10px;border-radius:50%;display:inline-block}.bar span{margin-left:8px;color:#cfe3ff}
table{border-collapse:collapse;font-size:16px;min-width:100%}th,td{padding:9px 16px;text-align:left;border-bottom:1px solid #e3e8f4;white-space:nowrap}
th{background:#e9eefb;color:#0b1b4d;font-size:15px}th small{display:block;font-weight:400;font-size:11px;color:#5a6690}
.badge{display:inline-block;font-size:11px;font-weight:700;color:#fff;border-radius:5px;padding:1px 6px;margin-left:6px}
.pk{background:#e08a00}.fk{background:#7a3fe0}
.null{color:#8a93ad;font-style:italic;background:#f0f2f8}
.hrow td{background:#ffe3c7!important}.hcol{background:#d6ebff!important}.hcell{background:#ffb26b!important;font-weight:700}
.chip{background:#fff;border:2px solid #0e9bd8;border-radius:10px;padding:10px 20px;font-size:20px;font-weight:700}
.arrow{font-size:34px;color:#ff7a1a;font-weight:700}
.lab{font-size:14px;color:#44506b}.title{font-size:15px;font-weight:700;color:#0b1b4d;margin-bottom:4px}
.code{background:#08122e;color:#fff;border-radius:10px;padding:16px 20px;font-family:'DejaVu Sans Mono',monospace;font-size:16px;line-height:1.6}
.kw{color:#ff9ad5}.id{color:#4fd6f5}.num{color:#ffc04d}.cm{color:#6fe3a1}
.tag{display:inline-block;font-size:12px;color:#5a6690;margin-top:8px}
.leg{display:flex;gap:18px;margin-top:12px;font-size:14px;color:#44506b}.leg b{border:1px solid #b9c3dc;display:inline-block;width:14px;height:14px;border-radius:3px;margin-right:6px;vertical-align:-2px}
`;
function tbl(o){const {title,cols,rows,rowCls={},colCls={},cellCls={},pk=[],fk=[],types=false,rc={},fz=null}=o;
 let h=`<div class="win"><div class="bar"><i style="background:#ff5f56"></i><i style="background:#ffbd2e"></i><i style="background:#27c93f"></i><span>${title}</span></div><table><thead><tr>`;
 cols.forEach((c,j)=>{const name=typeof c=='string'?c:c.n;const ty=typeof c=='string'?'':c.t;
  h+=`<th class="${colCls[j]||''}">${name}${pk.includes(j)?'<span class="badge pk">PK</span>':''}${fk.includes(j)?'<span class="badge fk">FK</span>':''}${types&&ty?`<small>${ty}</small>`:''}</th>`});
 h+='</tr></thead><tbody>';
 rows.forEach((r,i)=>{h+=`<tr class="${rowCls[i]||''}"${rc[i]?` style="background:${rc[i]}"`:''}>`;
  r.forEach((v,j)=>{const nul=v===null;let cl=(colCls[j]||'')+' '+(cellCls[i+','+j]||'');h+=`<td class="${nul?'null ':''}${cl}">${nul?'NULL':v}</td>`});h+='</tr>'});
 return h+'</tbody></table></div>';}
const clientes=[[1,'Ana García','ana@ejemplo.com','600111222'],[2,'Luis Pérez','luis@ejemplo.com',null],[3,'Marta Ruiz','marta@ejemplo.com','600333444']];
const pedidos=[[101,1,'2026-03-02','45.90'],[102,3,'2026-03-05','12.00'],[103,1,'2026-03-09','80.50']];

// ---- ER helper
function er(boxes,links,W,H){
 const bh=b=>34+b.attrs.length*26, bw=b=>b.w||210;
 const B={};boxes.forEach(b=>B[b.id]=b);
 let svg=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Liberation Sans,DejaVu Sans,sans-serif">`;
 const sides=links.map(l=>{const a=B[l.a],b=B[l.b];const ov=Math.min(a.x+bw(a),b.x+bw(b))-Math.max(a.x,b.x);
  if(ov>40)return a.y<b.y?['b','t']:['t','b'];return a.x<b.x?['r','l']:['l','r'];});
 const use={};links.forEach((l,i)=>{[[l.a,sides[i][0]],[l.b,sides[i][1]]].forEach(([id,sd])=>{const k=id+sd;(use[k]=use[k]||[]).push(i);});});
 const pt=(id,sd,i)=>{const b=B[id],arr=use[id+sd],n=arr.length,off=(arr.indexOf(i)-(n-1)/2)*34;
  if(sd=='l')return[b.x,b.y+bh(b)/2+off];if(sd=='r')return[b.x+bw(b),b.y+bh(b)/2+off];
  if(sd=='t')return[b.x+bw(b)/2+off,b.y];return[b.x+bw(b)/2+off,b.y+bh(b)];};
 links.forEach((l,i)=>{const p=pt(l.a,sides[i][0],i),q=pt(l.b,sides[i][1],i);
  svg+=`<path d="M${p[0]} ${p[1]} L${q[0]} ${q[1]}" stroke="#7a86a8" stroke-width="3" fill="none"/>`;
  const put=(pp,other,t)=>{const dx=other[0]-pp[0],dy=other[1]-pp[1],d=Math.hypot(dx,dy)||1;const x=pp[0]+dx/d*18,y=pp[1]+dy/d*18;
   svg+=`<circle cx="${x}" cy="${y}" r="11" fill="#ff7a1a"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${t}</text>`;};
  put(p,q,l.ca||'1');put(q,p,l.cb||'N');
  if(l.label){const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2-(Math.abs(q[1]-p[1])<Math.abs(q[0]-p[0])?20:0);svg+=`<rect x="${mx-l.label.length*3.6-6}" y="${my-11}" width="${l.label.length*7.2+12}" height="22" rx="6" fill="#fff" stroke="#c5cee3"/><text x="${mx}" y="${my+5}" text-anchor="middle" font-size="13" fill="#44506b">${l.label}</text>`;}});
 boxes.forEach(b=>{const h=bh(b),w=bw(b),c=b.color||'#0e9bd8';
  svg+=`<rect x="${b.x}" y="${b.y}" width="${w}" height="${h}" rx="10" fill="#fff" stroke="${c}" stroke-width="3"/><path d="M${b.x} ${b.y+34} V${b.y+10} Q${b.x} ${b.y} ${b.x+10} ${b.y} H${b.x+w-10} Q${b.x+w} ${b.y} ${b.x+w} ${b.y+10} V${b.y+34}Z" fill="${c}"/><text x="${b.x+w/2}" y="${b.y+23}" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">${b.title}</text>`;
  b.attrs.forEach((a,i)=>{const both=a.startsWith('+'),pk=a.startsWith('*')||both,fk=a.startsWith('>')||both;const t=a.replace(/^[*>+]/,'');const y=b.y+34+i*26+18;
   svg+=`<text x="${b.x+14}" y="${y}" font-size="14.5" fill="#1b2440" ${pk?'font-weight="700"':''}>${t}</text>`;
   if(pk)svg+=`<rect x="${b.x+w-(both?72:40)}" y="${y-13}" width="28" height="17" rx="4" fill="#e08a00"/><text x="${b.x+w-(both?58:26)}" y="${y}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">PK</text>`;
   if(fk)svg+=`<rect x="${b.x+w-40}" y="${y-13}" width="28" height="17" rx="4" fill="#7a3fe0"/><text x="${b.x+w-26}" y="${y}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">FK</text>`;});});
 return svg+'</svg>';}
async function render(F,tag){const p0=require('fs');
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1100,height:800},deviceScaleFactor:2});
 let meta={};try{meta=JSON.parse(fs.readFileSync('figs/meta.json','utf8'));}catch(e){}
 for(const k of Object.keys(F)){await p.setContent(`<!doctype html><meta charset="utf-8"><style>${CSS}</style><div id="fig">${F[k]}</div>`);
  const el=await p.$('#fig');const bb=await el.boundingBox();await el.screenshot({path:`figs/${k}.png`});meta[k]={w:Math.round(bb.width),h:Math.round(bb.height)};}
 fs.writeFileSync('figs/meta.json',JSON.stringify(meta));let cd={};try{cd=JSON.parse(fs.readFileSync('figs/code.json','utf8'));}catch(e){}Object.assign(cd,CODE);fs.writeFileSync('figs/code.json',JSON.stringify(cd));await b.close();console.log(tag,Object.keys(F).length,'figuras');}

// ---- PostgreSQL real
const {spawnSync}=require('child_process');
function pgrun(db,sql){const r=spawnSync('psql',['-h','/tmp','-p','5433','-U','postgres','-d',db,'-X','-c',sql],{encoding:'utf8'});return{out:r.stdout.replace(/\s+$/,''),err:r.stderr.replace(/\s+$/,'')};}
function pgcsv(db,sql){const r=spawnSync('psql',['-h','/tmp','-p','5433','-U','postgres','-d',db,'-X','-q','--csv','-c',sql],{encoding:'utf8'});
 const lines=r.stdout.trim().split('\n');const parse=l=>{const o=[];let c='',q=false;for(let i=0;i<l.length;i++){const ch=l[i];if(q){if(ch=='"'&&l[i+1]=='"'){c+='"';i++}else if(ch=='"')q=false;else c+=ch}else if(ch=='"')q=true;else if(ch==','){o.push(c);c=''}else c+=ch}o.push(c);return o};
 const rows=lines.map(parse);return{cols:rows[0],rows:rows.slice(1),err:r.stderr.trim()};}
const escH=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// term: steps=[{sql}] -> ejecuta cada una y dibuja un terminal psql con la salida real
function term(db,sqls,o={}){const w=o.w||760;let h=`<div style="width:${w}px;background:#0c1224;border-radius:10px;overflow:hidden;box-shadow:0 4px 14px rgba(20,40,100,.25)"><div class="bar" style="background:#1b2547"><i style="background:#ff5f56"></i><i style="background:#ffbd2e"></i><i style="background:#27c93f"></i><span>psql — base de datos «${db}»</span></div><div style="padding:14px 18px;font-family:'DejaVu Sans Mono',monospace;font-size:${o.fs||13.5}px;line-height:1.5;color:#e6edff;white-space:pre">`;
 sqls.forEach(q=>{const r=pgrun(db,q);const ls=q.split('\n');
  h+=ls.map((l,i)=>`<span style="color:#6fe3a1">${db}${i?'-':'='}#</span> ${escH(l)}`).join('\n')+'\n';
  if(r.out)h+=escH(r.out)+'\n';if(r.err)h+=`<span style="color:#ff8a8a">${escH(r.err)}</span>\n`;h+='\n';});
 return h.replace(/\n\n$/,'')+'</div></div>';}
function grid(db,sql,o={}){const r=pgcsv(db,sql);return tbl({title:o.title||'resultado',cols:r.cols.map(c=>({n:c})),rows:r.rows.map(x=>x.map(v=>v===''&&o.nulls!==false?null:v)),pk:o.pk||[],fk:o.fk||[],rc:o.rc||{}});}

// ---- registro de código y shell
const CODE={};
function T(id,db,sqls,o){CODE[id]={lang:'sql',text:sqls.join('\n\n')};const h=term(db,sqls,o);fs.mkdirSync('figs/txt',{recursive:true});fs.writeFileSync('figs/txt/'+id+'.txt',h.replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'));return h;}
function SH(id,cmds,o={}){const w=o.w||900;let h=`<div style="width:${w}px;background:#10161f;border-radius:10px;overflow:hidden;box-shadow:0 4px 14px rgba(20,40,100,.25)"><div class="bar" style="background:#26303f"><i style="background:#ff5f56"></i><i style="background:#ffbd2e"></i><i style="background:#27c93f"></i><span>Terminal</span></div><div style="padding:14px 18px;font-family:'DejaVu Sans Mono',monospace;font-size:${o.fs||13}px;line-height:1.5;color:#e6edff;white-space:pre-wrap">`;
 CODE[id]={lang:'sh',text:cmds.map(c=>c.show||c.cmd).join('\n')};
 cmds.forEach(c=>{const r=spawnSync('bash',['-c',c.cmd],{encoding:'utf8',cwd:o.cwd||'../sql'});h+=`<span style="color:#6fe3a1">$</span> ${escH(c.show||c.cmd)}\n`;const out=(r.stdout+(r.stderr?r.stderr:'')).replace(/\s+$/,'');if(out)h+=escH(out)+'\n';});
 return h+'</div></div>';}
module.exports={T,SH,CODE,CSS,tbl,er,render,clientes,pedidos,fs,pgrun,pgcsv,term,grid};
