const {CSS,tbl,er,render,clientes}=require('./figlib');const F={};
const card=(t,body,c='#0e9bd8',w=210)=>`<div style="background:#fff;border:3px solid ${c};border-radius:12px;width:${w}px;overflow:hidden"><div style="background:${c};color:#fff;font-weight:700;padding:6px 12px;font-size:16px">${t}</div><div style="padding:8px 12px;font-size:14px;line-height:1.7;color:#1b2440">${body}</div></div>`;
// f2-1
const steps=[['1','Describir','la idea con frases'],['2','Subrayar','entidades'],['3','Anotar','atributos'],['4','Buscar','relaciones'],['5','Escribir','reglas'],['6','Revisar','con preguntas reales']];
F['f2-1']=`<div class="row" style="gap:10px">${steps.map(([n,a,b],i)=>`<div style="background:#fff;border:3px solid ${i==5?'#2e9e5b':'#0e9bd8'};border-radius:12px;width:135px;padding:12px 8px;text-align:center"><div style="width:34px;height:34px;border-radius:50%;background:#ff7a1a;color:#fff;font-weight:700;font-size:18px;line-height:34px;margin:0 auto 6px">${n}</div><div style="font-weight:700;font-size:16px;color:#0b1b4d">${a}</div><div style="font-size:13px;color:#44506b">${b}</div></div>${i<5?'<div class="arrow" style="font-size:26px">→</div>':''}`).join('')}</div>
<div style="margin-top:12px;color:#d1383d;font-size:15px;font-weight:700;text-align:center">↺ Si la revisión falla, se vuelve a los pasos anteriores: diseñar es iterar</div>`;
// f2-2
const e=t=>`<span style="background:#cfe8ff;border-bottom:3px solid #0e9bd8;padding:0 3px;border-radius:3px">${t}</span>`,a=t=>`<span style="background:#ffe0c2;border-bottom:3px solid #ff7a1a;padding:0 3px;border-radius:3px">${t}</span>`,r=t=>`<span style="background:#e7dcff;border-bottom:3px solid #7a3fe0;padding:0 3px;border-radius:3px">${t}</span>`,g=t=>`<span style="background:#d6f5e0;border-bottom:3px solid #2e9e5b;padding:0 3px;border-radius:3px">${t}</span>`;
F['f2-2']=`<div style="width:760px;background:#fff;border:1px solid #c5cee3;border-radius:10px;padding:20px 24px;font-size:18px;line-height:2.1">
Una tienda ${r('vende')} ${e('productos')}. Cada ${e('cliente')} puede ${r('hacer')} varios ${e('pedidos')}. Un pedido ${r('incluye')} uno o varios productos. De cada cliente guardamos ${a('nombre')}, ${a('email')} y ${a('teléfono')}. ${g('El email es obligatorio y no puede repetirse')}; ${g('el teléfono es opcional')}. Un producto tiene ${a('nombre')} y ${a('precio')}, y ${g('el precio no puede ser negativo')}.</div>
<div class="leg" style="font-size:15px"><span><b style="background:#cfe8ff"></b>Entidades</span><span><b style="background:#ffe0c2"></b>Atributos</span><span><b style="background:#e7dcff"></b>Relaciones</span><span><b style="background:#d6f5e0"></b>Reglas</span></div>`;
// f2-3
F['f2-3']=`<div class="row" style="align-items:flex-start;gap:14px">
${card('Entidades → tablas','cliente<br>pedido<br>producto','#0e9bd8',190)}
${card('Atributos → columnas','cliente: nombre, email, teléfono<br>producto: nombre, precio','#ff7a1a',250)}
${card('Relaciones → enlaces','cliente <b>hace</b> pedidos<br>pedido <b>incluye</b> productos','#7a3fe0',230)}
${card('Reglas → restricciones','email obligatorio y único<br>teléfono opcional<br>precio no negativo','#2e9e5b',230)}</div>`;
// f2-4
F['f2-4']=`<div class="row" style="align-items:flex-start;gap:30px"><div class="win" style="width:290px"><div class="bar"><i style="background:#ff5f56"></i><i style="background:#ffbd2e"></i><i style="background:#27c93f"></i><span>Alta de cliente</span></div><div style="padding:16px;font-size:15px;line-height:1.5">
<div><b>Nombre *</b></div><div style="border:1px solid #aab;border-radius:6px;padding:6px 8px;margin:3px 0 10px;color:#44506b">Luis Pérez</div>
<div><b>Email *</b></div><div style="border:1px solid #aab;border-radius:6px;padding:6px 8px;margin:3px 0 10px;color:#44506b">luis@ejemplo.com</div>
<div>Teléfono <span style="color:#7a86a8">(opcional)</span></div><div style="border:1px dashed #aab;border-radius:6px;padding:6px 8px;margin:3px 0 10px;color:#aab">—</div>
<div style="background:#0e9bd8;color:#fff;text-align:center;border-radius:6px;padding:8px;font-weight:700">Guardar</div><div style="font-size:12px;color:#7a86a8;margin-top:8px">* obligatorio</div></div></div>
<div class="arrow" style="align-self:center">→</div>
<div>${tbl({title:'tienda · clientes',cols:[{n:'nombre',t:'obligatorio'},{n:'email',t:'obligatorio · único'},{n:'telefono',t:'opcional'}],types:true,rows:clientes.map(r=>[r[1],r[2],r[3]])})}</div></div>`;
// f2-5 burst
const nodes=[['Usuarios',0,'#7a3fe0'],['Empresas',1,'#0e9bd8'],['Contactos',2,'#0e9bd8'],['Oportunidades',3,'#0e9bd8'],['Tareas',4,'#0e9bd8'],['Notas',5,'#ff7a1a'],['Llamadas',6,'#ff7a1a'],['Emails',7,'#ff7a1a'],['Estados',8,'#7a3fe0']];
F['f2-5']=`<svg width="760" height="470" viewBox="0 0 760 470" font-family="Liberation Sans,DejaVu Sans,sans-serif">${nodes.map(([t,i,c])=>{const ang=-Math.PI/2+i*2*Math.PI/9,x=380+270*Math.cos(ang),y=235+170*Math.sin(ang);return `<path d="M380 235 L${x} ${y}" stroke="${c}" stroke-width="3" opacity=".5"/>`}).join('')}
<circle cx="380" cy="235" r="62" fill="#0b1b4d"/><text x="380" y="232" text-anchor="middle" font-size="26" font-weight="700" fill="#fff">CRM</text><text x="380" y="254" text-anchor="middle" font-size="13" fill="#9fe3fa">la idea</text>
${nodes.map(([t,i,c])=>{const ang=-Math.PI/2+i*2*Math.PI/9,x=380+270*Math.cos(ang),y=235+170*Math.sin(ang);return `<rect x="${x-68}" y="${y-19}" width="136" height="38" rx="19" fill="${c}"/><text x="${x}" y="${y+6}" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">${t}</text>`}).join('')}</svg>
<div class="leg"><span><b style="background:#0e9bd8"></b>Principales</span><span><b style="background:#ff7a1a"></b>Actividad</span><span><b style="background:#7a3fe0"></b>Organización</span></div>`;
// f2-6
F['f2-6']=`<div style="display:grid;grid-template-columns:repeat(3,230px);gap:14px">
${card('usuario','nombre<br>email<br>contraseña (cifrada)<br>rol','#7a3fe0',230)}${card('empresa','nombre<br>sector<br>web<br>ciudad','#0e9bd8',230)}${card('contacto','nombre<br>email<br>teléfono<br>cargo','#0e9bd8',230)}
${card('oportunidad','título<br>importe<br>fecha prevista de cierre','#0e9bd8',230)}${card('tarea','título<br>fecha límite<br>completada (sí/no)','#0e9bd8',230)}${card('nota','texto<br>fecha','#ff7a1a',230)}</div>`;
// f2-7
F['f2-7']=`<div class="row" style="align-items:flex-start;gap:14px">${card('llamada','fecha<br>duración<br>resumen','#ff7a1a',170)}${card('email','asunto<br>fecha<br>enviado / recibido','#ff7a1a',190)}${card('nota','texto<br>fecha','#ff7a1a',150)}${card('tarea','título<br>fecha límite<br>completada','#0e9bd8',170)}${card('estado','nombre<br>orden en el proceso','#7a3fe0',190)}</div>`;
// f2-8
F['f2-8']=er([
 {id:'u',x:20,y:20,title:'usuarios',attrs:['*id','nombre','email'],color:'#7a3fe0'},
 {id:'e',x:440,y:20,title:'empresas',attrs:['*id','nombre','sector']},
 {id:'c',x:860,y:20,title:'contactos',attrs:['*id','>empresa_id','nombre']},
 {id:'t',x:20,y:230,title:'tareas',attrs:['*id','>oportunidad_id','>usuario_id','título']},
 {id:'o',x:440,y:230,title:'oportunidades',attrs:['*id','>empresa_id','>usuario_id','>estado_id','importe']},
 {id:'s',x:860,y:230,title:'estados',attrs:['*id','nombre'],color:'#7a3fe0'},
 {id:'n',x:330,y:470,title:'notas',attrs:['*id','>oportunidad_id'],color:'#ff7a1a'},
 {id:'l',x:570,y:470,title:'llamadas',attrs:['*id','>oportunidad_id'],color:'#ff7a1a'},
 {id:'m',x:810,y:470,title:'emails',attrs:['*id','>oportunidad_id'],color:'#ff7a1a'}],
 [{a:'e',b:'c'},{a:'e',b:'o'},{a:'u',b:'o'},{a:'s',b:'o'},{a:'u',b:'t'},{a:'o',b:'t'},{a:'o',b:'n'},{a:'o',b:'l'},{a:'o',b:'m'}],1080,570);
// f2-9..11
F['f2-9']=er([{id:'c',x:20,y:20,title:'contactos',attrs:['*id','nombre','email']},{id:'t',x:400,y:20,title:'telefonos',attrs:['*id','>contacto_id','numero','tipo'],color:'#ff7a1a'},{id:'g',x:20,y:210,title:'grupos',attrs:['*id','nombre'],color:'#7a3fe0'}],
 [{a:'c',b:'t',label:'tiene'},{a:'c',b:'g',ca:'N',cb:'N',label:'pertenecen'}],640,330);
F['f2-10']=er([{id:'c',x:20,y:20,title:'clientes',attrs:['*id','nombre','email']},{id:'p',x:380,y:20,title:'pedidos',attrs:['*id','>cliente_id','fecha']},{id:'l',x:740,y:20,title:'lineas_pedido',attrs:['*id','>pedido_id','>producto_id','cantidad','precio_venta'],color:'#ff7a1a'},{id:'r',x:740,y:270,title:'productos',attrs:['*id','nombre','precio_eur'],color:'#7a3fe0'}],
 [{a:'c',b:'p',label:'hace'},{a:'p',b:'l',label:'incluye'},{a:'r',b:'l',label:'aparece en'}],990,400);
F['f2-11']=er([{id:'s',x:20,y:40,title:'socios',attrs:['*id','nombre','email']},{id:'r',x:380,y:20,title:'reservas',attrs:['*id','>socio_id','>pista_id','fecha','hora'],color:'#ff7a1a'},{id:'p',x:740,y:40,title:'pistas',attrs:['*id','nombre'],color:'#7a3fe0'}],
 [{a:'s',b:'r',label:'hace'},{a:'p',b:'r',label:'recibe'}],980,210);
// f2-12
F['f2-12']=`<div class="win" style="width:700px"><div class="bar" style="background:#0e9bd8"><i style="background:#ff5f56"></i><i style="background:#ffbd2e"></i><i style="background:#27c93f"></i><span style="color:#fff">Ficha de entidad: CLIENTE</span></div><div style="padding:14px 18px;font-size:14.5px;line-height:1.6">
<div><b>Descripción:</b> persona que compra en la tienda.</div>
<table style="margin:10px 0"><thead><tr><th>Atributo</th><th>Tipo</th><th>Obligatorio</th><th>Único</th><th>Notas</th></tr></thead><tbody>
<tr><td>id</td><td>entero</td><td>sí</td><td>sí</td><td>Identificador automático</td></tr><tr><td>nombre</td><td>texto</td><td>sí</td><td>no</td><td>Nombre completo</td></tr>
<tr><td>email</td><td>texto</td><td>sí</td><td>sí</td><td>Para iniciar sesión</td></tr><tr><td>telefono</td><td>texto</td><td>no</td><td>no</td><td>Con prefijo si se conoce</td></tr><tr><td>alta</td><td>fecha</td><td>sí</td><td>no</td><td>Por defecto, hoy</td></tr></tbody></table>
<div><b>Relaciones:</b> un cliente hace muchos pedidos (1 a N).</div><div><b>Reglas:</b> el email no se repite · el nombre no puede estar vacío.</div><div><b>Preguntas de negocio:</b> ¿cuántos clientes nuevos hay por mes? ¿qué compró cada cliente?</div></div></div>`;
render(F,'parte 2');
