const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
http.createServer((req,res)=>{
  const name = new URL(req.url,'http://localhost').pathname;
  const file = ({'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css'})[name];
  if(!file){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',types[path.extname(file)]);
  fs.createReadStream(path.join(__dirname,'dist',file)).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
