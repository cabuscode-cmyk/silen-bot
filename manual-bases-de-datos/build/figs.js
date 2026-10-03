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
const F={};
F['f1-1']=`<div class="row"><div class="col" style="align-items:center"><div class="title">Datos sueltos</div><div class="row" style="gap:12px"><div class="chip">Ana</div><div class="chip">34</div><div class="chip">Madrid</div></div><div class="lab">¿De qué son? ¿De quién?</div></div>
<div class="col" style="align-items:center"><div class="arrow">→</div><div class="lab">+ contexto</div></div>
<div class="col"><div class="title">Información</div>${tbl({title:'personas',cols:['nombre','edad','ciudad'],rows:[['Ana',34,'Madrid']]})}<div style="font-size:18px;font-weight:700;color:#0b1b4d;margin-top:6px">«Ana tiene 34 años y vive en Madrid»</div></div></div>`;
F['f1-2']=`<div class="win" style="width:720px"><div class="bar" style="background:#1e7a45"><i style="background:#ff5f56"></i><i style="background:#ffbd2e"></i><i style="background:#27c93f"></i><span>pedidos.xlsx — Hoja de cálculo</span></div>
<table style="font-size:16px"><thead><tr><th style="width:40px"></th><th>A · Cliente</th><th>B · Teléfono</th><th>C · Pedido</th><th>D · Total</th></tr></thead><tbody>
<tr><td style="background:#e9eefb">1</td><td>Ana García</td><td>600111222</td><td>101</td><td>45,90</td></tr>
<tr><td style="background:#e9eefb">2</td><td>Ana García</td><td>600111222</td><td>103</td><td>80,50</td></tr>
<tr><td style="background:#e9eefb">3</td><td style="background:#ffe9a8">Ana Garcia</td><td style="background:#ffb3b3;font-weight:700">600111223</td><td>110</td><td>20,00</td></tr></tbody></table></div>
<div class="leg" style="font-size:15px"><span><b style="background:#ffb3b3"></b>Teléfono distinto: ¿cuál es el correcto?</span><span><b style="background:#ffe9a8"></b>Nombre escrito de otra forma</span></div>`;
F['f1-3']=`<svg width="860" height="330" viewBox="0 0 860 330" font-family="Liberation Sans,DejaVu Sans,sans-serif">
<defs><marker id="a" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0 0L12 6L0 12z" fill="#ff7a1a"/></marker></defs>
${[['Web',50],['App móvil',140],['Automatización',230]].map(([t,y])=>`<rect x="10" y="${y}" width="190" height="62" rx="12" fill="#fff" stroke="#0e9bd8" stroke-width="3"/><text x="105" y="${y+38}" text-anchor="middle" font-size="19" font-weight="700" fill="#0b1b4d">${t}</text><path d="M200 ${y+31} L340 165" stroke="#ff7a1a" stroke-width="3" fill="none" marker-end="url(#a)"/>`).join('')}
<text x="105" y="32" text-anchor="middle" font-size="16" fill="#44506b">Aplicaciones</text>
<rect x="345" y="85" width="190" height="160" rx="16" fill="#7a3fe0"/><text x="440" y="150" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">PostgreSQL</text><text x="440" y="178" text-anchor="middle" font-size="16" fill="#e5d8ff">el gestor (SGBD)</text><text x="440" y="214" text-anchor="middle" font-size="26">🔒</text>
<text x="440" y="66" text-anchor="middle" font-size="16" fill="#44506b">Gestor: comprueba permisos</text>
<path d="M535 165 L640 165" stroke="#ff7a1a" stroke-width="3" marker-end="url(#a)"/>
<g transform="translate(655 100)"><path d="M0 20 V110 A80 22 0 0 0 160 110 V20Z" fill="#0e9bd8"/><ellipse cx="80" cy="20" rx="80" ry="22" fill="#9fe3fa"/><text x="80" y="82" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">Datos</text><text x="80" y="104" text-anchor="middle" font-size="14" fill="#e6f8ff">archivos en disco</text></g>
<text x="735" y="66" text-anchor="middle" font-size="16" fill="#44506b">La base de datos</text></svg>`;
F['f1-3b']=`<div class="title" style="font-size:17px">Gestor PostgreSQL (un solo programa)</div><div class="row" style="align-items:flex-start;gap:20px;border:3px solid #7a3fe0;border-radius:14px;padding:16px;background:#faf6ff">
${[['tienda',['clientes','pedidos','productos'],'#0e9bd8'],['crm',['empresas','contactos','tareas'],'#e08a00'],['pruebas',['borrador'],'#2e9e5b']].map(([n,t,c])=>`<div class="col" style="border:3px solid ${c};border-radius:12px;padding:12px;background:#fff;min-width:200px"><div style="font-weight:700;color:${c};font-size:18px">Base de datos: ${n}</div>${t.map(x=>`<div style="background:#eef3fb;border-radius:6px;padding:6px 10px;font-size:15px">tabla ${x}</div>`).join('')}</div>`).join('')}</div>`;
F['f1-4']=tbl({title:'tienda · clientes',cols:['id','nombre','email','telefono'],rows:clientes,rowCls:{1:'hrow'},colCls:{2:'hcol'},cellCls:{'1,2':'hcell'}})+`<div class="leg"><span><b style="background:#ffe3c7"></b>Fila = registro (Luis)</span><span><b style="background:#d6ebff"></b>Columna = campo (email)</span><span><b style="background:#ffb26b"></b>Valor</span></div>`;
F['f1-5']=tbl({title:'tienda · productos',types:true,cols:[{n:'nombre',t:'texto'},{n:'stock',t:'entero'},{n:'precio_eur',t:'decimal'},{n:'alta',t:'fecha'},{n:'activo',t:'verdadero/falso'}],rows:[['Camiseta',12,'19.95','2026-01-15','true'],['Gorra',0,'9.90','2026-02-03','false'],['Mochila',5,'34.50','2026-02-20','true']]});
F['f1-6']=`<div class="row" style="align-items:flex-start">${tbl({title:'tienda · clientes',cols:['id','nombre','email','telefono'],rows:clientes})}
<div class="col" style="min-width:300px"><div class="title">Tres casos que parecen iguales</div>
<div style="background:#fff;border:2px solid #8a93ad;border-radius:10px;padding:10px 14px"><b class="null" style="padding:2px 8px">NULL</b> — no se sabe / no hay valor</div>
<div style="background:#fff;border:2px solid #0e9bd8;border-radius:10px;padding:10px 14px"><b>0</b> — valor conocido: cero</div>
<div style="background:#fff;border:2px solid #0e9bd8;border-radius:10px;padding:10px 14px"><b>''</b> — valor conocido: texto sin letras</div></div></div>`;
F['f1-7']=`<div class="row" style="align-items:flex-start">${tbl({title:'tienda · clientes',cols:['id','nombre','email'],pk:[0],rows:clientes.map(r=>r.slice(0,3)),rc:{0:'#dcebff',1:'#eceef5',2:'#ffe6cf'}})}
<div class="col" style="align-items:center;justify-content:center;align-self:center"><div class="arrow">←</div><div class="lab">cliente_id<br>apunta al id</div></div>
${tbl({title:'tienda · pedidos',cols:['id','cliente_id','fecha','total'],pk:[0],fk:[1],rows:pedidos,rc:{0:'#dcebff',1:'#ffe6cf',2:'#dcebff'}})}</div>
<div class="leg"><span><b style="background:#dcebff"></b>Ana (pedidos 101 y 103)</span><span><b style="background:#ffe6cf"></b>Marta (pedido 102)</span><span><b style="background:#eceef5"></b>Luis (sin pedidos)</span></div>`;
F['f1-7b']=`<div class="code" style="width:760px"><span class="kw">INSERT INTO</span> pedidos (id, cliente_id, fecha, total)<br><span class="kw">VALUES</span> (<span class="num">104</span>, <span class="num">9</span>, <span class="cm">'2026-03-12'</span>, <span class="num">20.00</span>);</div>
<div style="width:760px;background:#fff0f0;border:2px solid #d1383d;border-radius:10px;padding:14px 18px;margin-top:12px;font-family:'DejaVu Sans Mono',monospace;font-size:14px;color:#8b1a1f;line-height:1.6"><b>ERROR:</b> insert or update on table "pedidos" violates foreign key constraint "pedidos_cliente_id_fkey"<br><b>DETAIL:</b> Key (cliente_id)=(9) is not present in table "clientes".</div>
<div style="margin-top:10px;font-size:16px;color:#0b1b4d"><b>Resultado:</b> el pedido no se guarda. No existe el cliente 9.</div><div class="tag">Ilustración: el texto exacto depende del gestor.</div>`;
F['f1-8']=`<div class="row" style="align-items:flex-start;gap:40px"><div class="col"><div class="title">Índice de un libro</div><div class="win"><table><thead><tr><th>Palabra</th><th>Página</th></tr></thead><tbody><tr><td>bosque</td><td>212</td></tr><tr><td>cielo</td><td>45</td></tr><tr><td>río</td><td>133</td></tr><tr><td>sol</td><td>301</td></tr></tbody></table></div><div class="lab">Ordenado: vas directo a la página</div></div>
<div class="col"><div class="title">Índice de la columna email</div><div class="win"><table><thead><tr><th>email (ordenado)</th><th>fila</th></tr></thead><tbody><tr><td>ana@ejemplo.com</td><td>1</td></tr><tr><td>luis@ejemplo.com</td><td>2</td></tr><tr class="hrow"><td>marta@ejemplo.com</td><td>3</td></tr></tbody></table></div><div class="lab">Buscas marta@… → fila 3, sin recorrer todo</div></div></div>`;
F['f1-9']=`<div class="row" style="align-items:flex-start"><div class="col"><div class="title">Consulta</div><div class="code"><span class="kw">SELECT</span> nombre, email<br><span class="kw">FROM</span> <span class="id">clientes</span>;</div></div><div class="arrow" style="align-self:center">→</div><div class="col"><div class="title">Resultado: 3 filas</div>${tbl({title:'resultado',cols:['nombre','email'],rows:clientes.map(r=>[r[1],r[2]])})}</div></div>`;
F['f1-9b']=`<div class="row" style="align-items:flex-start"><div class="col"><div class="title">pedidos (3 filas)</div>${tbl({title:'tienda · pedidos',cols:['id','cliente_id','total'],rows:pedidos.map(r=>[r[0],r[1],r[3]]),rc:{1:'#eceef5'}})}<div class="code"><span class="kw">SELECT</span> id, cliente_id, total<br><span class="kw">FROM</span> <span class="id">pedidos</span><br><span class="kw">WHERE</span> total <span class="num">&gt; 40</span>;</div></div><div class="arrow" style="align-self:center">→</div><div class="col"><div class="title">Resultado: 2 filas</div>${tbl({title:'resultado',cols:['id','cliente_id','total'],rows:[[101,1,'45.90'],[103,1,'80.50']],rc:{0:'#e3f7ea',1:'#e3f7ea'}})}<div class="lab">El pedido 102 (12.00) no cumple total &gt; 40</div></div></div>`;
F['f1-10']=`<svg width="900" height="360" viewBox="0 0 900 360" font-family="Liberation Sans,DejaVu Sans,sans-serif">
<defs><marker id="b" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0 0L12 6L0 12z" fill="#ff7a1a"/></marker><marker id="g" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0 0L12 6L0 12z" fill="#2e9e5b"/></marker></defs>
<rect x="10" y="60" width="170" height="64" rx="12" fill="#fff" stroke="#0e9bd8" stroke-width="3"/><text x="95" y="98" text-anchor="middle" font-size="19" font-weight="700" fill="#0b1b4d">Navegador</text>
<rect x="10" y="200" width="170" height="64" rx="12" fill="#fff" stroke="#0e9bd8" stroke-width="3"/><text x="95" y="238" text-anchor="middle" font-size="19" font-weight="700" fill="#0b1b4d">App móvil</text>
<text x="95" y="38" text-anchor="middle" font-size="16" fill="#44506b">Clientes</text>
<rect x="290" y="30" width="590" height="300" rx="18" fill="#f9fbff" stroke="#7a3fe0" stroke-width="3" stroke-dasharray="10 7"/><text x="585" y="56" text-anchor="middle" font-size="16" fill="#7a3fe0">Servidor (por ejemplo, un VPS): todo junto, o cada pieza en un servicio distinto</text>
<rect x="320" y="130" width="200" height="100" rx="14" fill="#0e9bd8"/><text x="420" y="172" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">API</text><text x="420" y="200" text-anchor="middle" font-size="15" fill="#e6f8ff">la ventanilla con reglas</text>
<g transform="translate(655 120)"><path d="M0 20 V105 A80 22 0 0 0 160 105 V20Z" fill="#e08a00"/><ellipse cx="80" cy="20" rx="80" ry="22" fill="#ffd98a"/><text x="80" y="78" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">Base de datos</text><text x="80" y="100" text-anchor="middle" font-size="14" fill="#fff0d0">PostgreSQL</text></g>
<path d="M180 92 L318 165" stroke="#ff7a1a" stroke-width="3" marker-end="url(#b)"/><path d="M180 232 L318 195" stroke="#ff7a1a" stroke-width="3" marker-end="url(#b)"/>
<path d="M520 155 L652 155" stroke="#ff7a1a" stroke-width="3" marker-end="url(#b)"/><path d="M652 205 L520 205" stroke="#2e9e5b" stroke-width="3" marker-end="url(#g)"/>
<path d="M318 220 L180 270" stroke="#2e9e5b" stroke-width="3" marker-end="url(#b)" opacity="0"/>
${[[240,100,'1'],[586,140,'3'],[586,232,'4']].map(([x,y,n])=>`<circle cx="${x}" cy="${y}" r="15" fill="#ff7a1a"/><text x="${x}" y="${y+6}" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">${n}</text>`).join('')}
<circle cx="250" cy="215" r="15" fill="#ff7a1a"/><text x="250" y="221" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">1</text>
<text x="585" y="272" text-anchor="middle" font-size="15" fill="#44506b">2 · la API comprueba quién eres y qué puedes ver</text>
<text x="585" y="310" text-anchor="middle" font-size="15" fill="#2e9e5b" font-weight="700">5 · la respuesta vuelve por el mismo camino hasta la pantalla</text></svg>`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1100,height:800},deviceScaleFactor:2});
const meta={};
for(const k of Object.keys(F)){await p.setContent(`<!doctype html><meta charset="utf-8"><style>${CSS}</style><div id="fig">${F[k]}</div>`);
 const el=await p.$('#fig');const bb=await el.boundingBox();await el.screenshot({path:`figs/${k}.png`});meta[k]={w:Math.round(bb.width),h:Math.round(bb.height)};}
fs.writeFileSync('figs/meta.json',JSON.stringify(meta));await b.close();console.log(meta);})();
