const {steps,tbl,render}=require('./figlib');
const F={};const tb=(title,cols,rows,o={})=>tbl({title,cols,rows,bare:true,...o});
const row=(...c)=>`<div class="row" style="align-items:flex-start;gap:20px;flex-wrap:wrap">${c.join('')}</div>`;
const note=(h)=>`<div style="font-size:15px;line-height:1.8">${h}</div>`;
const P=[['Camiseta','ropa','19.95'],['Gorra','ropa','9.90'],['Mochila','accesorios','34.50'],['Zapatillas','calzado','59.90'],['Cartera','accesorios','24.00']];
F['h5-4']=steps([
 {t:'La pregunta: «productos de más de 20 euros»',html:tb('productos',['nombre','categoria','precio_eur'],P),note:'Recorre las filas con el dedo, una por una.'},
 {t:'Para cada fila, comprueba la condición precio_eur > 20 y marca verde (pasa) o rojo (no pasa)',html:tb('productos',['nombre','categoria','precio_eur'],P,{rc:{0:'#ffd0d0',1:'#ffd0d0',2:'#e3f7ea',3:'#e3f7ea',4:'#e3f7ea'}}),note:'19.95 no es mayor que 20; 9.90 tampoco. 34.50, 59.90 y 24.00 sí.'},
 {t:'El resultado son solo las filas verdes',html:tb('resultado',['nombre','categoria','precio_eur'],[P[2],P[3],P[4]]),note:'Esto es exactamente lo que hace WHERE: deja pasar las filas que cumplen la condición.'}],1000,true);
const G=[['Camiseta','ropa','19.95'],['Gorra','ropa','9.90'],['Mochila','accesorios','34.50'],['Cartera','accesorios','24.00'],['Zapatillas','calzado','59.90']];
F['h5-6']=steps([
 {t:'Parte de las filas sueltas',html:tb('productos',['nombre','categoria','precio_eur'],G),note:'Pregunta: «¿cuántos productos hay en cada categoría y cuál es su precio medio?»'},
 {t:'Agrupa las filas que comparten categoría (un color por grupo)',html:tb('productos agrupados por categoria',['nombre','categoria','precio_eur'],G,{rc:{0:'#dcebff',1:'#dcebff',2:'#ffe6cf',3:'#ffe6cf',4:'#e3f7ea'}}),note:'ropa: 2 filas (azul). accesorios: 2 filas (naranja). calzado: 1 fila (verde).'},
 {t:'Cada grupo se convierte en UNA fila del resultado, calculando con las funciones de resumen',html:tb('resultado',['categoria','count(*)','avg(precio_eur)'],[['ropa',2,'14.93'],['accesorios',2,'29.25'],['calzado',1,'59.90']],{rc:{0:'#dcebff',1:'#ffe6cf',2:'#e3f7ea'}}),note:'Media de ropa: (19.95 + 9.90) / 2 = 14.925 (14.93 redondeado). Las columnas que no están en el GROUP BY deben calcularse con una función de resumen.'}],1000,true);
const A=[['uno'],['dos'],['tres']],B=[['dos'],['tres'],['cuatro']];
const m1={rc:{1:'#e3f7ea',2:'#e3f7ea'}};
F['h5-7']=steps([
 {t:'Dos tablas pequeñas que se enlazan por la columna x',html:row(tb('a',['x'],A,{rc:{0:'#ffe6cf',1:'#e3f7ea',2:'#e3f7ea'}}),tb('b',['x'],B,{rc:{0:'#e3f7ea',1:'#e3f7ea',2:'#ffe6cf'}})),note:'En verde, los valores que están en las dos tablas (dos, tres). En naranja, los que solo están en una.'},
 {t:'INNER JOIN: solo las parejas que coinciden',html:tb('a INNER JOIN b',['a','b'],[['dos','dos'],['tres','tres']],{rc:{0:'#e3f7ea',1:'#e3f7ea'}}),note:'«uno» y «cuatro» desaparecen: no tienen pareja.'},
 {t:'LEFT JOIN: todas las filas de la izquierda, con su pareja si la hay',html:tb('a LEFT JOIN b',['a','b'],[['uno',null],['dos','dos'],['tres','tres']],{rc:{0:'#ffe6cf',1:'#e3f7ea',2:'#e3f7ea'}}),note:'«uno» se conserva y su pareja queda vacía (NULL).'},
 {t:'RIGHT JOIN: todas las filas de la derecha',html:tb('a RIGHT JOIN b',['a','b'],[[null,'cuatro'],['dos','dos'],['tres','tres']],{rc:{0:'#ffe6cf',1:'#e3f7ea',2:'#e3f7ea'}}),note:'El espejo del anterior: se conserva «cuatro».'},
 {t:'FULL JOIN: todas las filas de las dos tablas',html:tb('a FULL JOIN b',['a','b'],[['uno',null],['dos','dos'],['tres','tres'],[null,'cuatro']],{rc:{0:'#ffe6cf',1:'#e3f7ea',2:'#e3f7ea',3:'#ffe6cf'}}),note:'No se pierde nada, de ninguno de los dos lados.'},
 {t:'CROSS JOIN: todas las combinaciones posibles (3 × 3 = 9)',html:tb('a CROSS JOIN b',['a','b'],[['uno','dos'],['uno','tres'],['uno','cuatro'],['dos','dos'],['dos','tres'],['dos','cuatro'],['tres','dos'],['tres','tres'],['tres','cuatro']]),note:'No hay condición de unión: cada fila de a se empareja con cada fila de b.'}],1000,true);
F['h5-9']=steps([
 {t:'Pregunta: «productos más caros que la media»',html:tb('productos',['nombre','precio_eur'],[['Camiseta','19.95'],['Gorra','9.90'],['Mochila','34.50'],['Cartera','24.00']]),note:'Hace falta un dato que no está en la tabla: la media.'},
 {t:'Resuelve primero la pregunta interna: la media de precios',html:note('(19.95 + 9.90 + 34.50 + 24.00) / 4 = <b>22.0875</b>'),note:'Esta es la subconsulta: (SELECT avg(precio_eur) FROM productos).'},
 {t:'Resuelve la pregunta externa usando ese valor',html:tb('precio_eur > 22.0875',['nombre','precio_eur'],[['Camiseta','19.95'],['Gorra','9.90'],['Mochila','34.50'],['Cartera','24.00']],{rc:{0:'#ffd0d0',1:'#ffd0d0',2:'#e3f7ea',3:'#e3f7ea'}}),note:'Resultado: Mochila y Cartera. Una subconsulta es una pregunta dentro de otra.'}],1000,true);
render(F,'taller parte 5');
