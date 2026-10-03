const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
const p=await b.newPage({viewport:{width:1240,height:1754},deviceScaleFactor:1.5});
await p.goto('file://'+process.cwd()+'/cover.html');await p.screenshot({path:'cover.png'});await b.close();})();
