const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = {};
const node = id => nodes[id] ||= { textContent:'', value:'', style:{}, classList:{toggle(){}}, listeners:{}, addEventListener(event,callback){this.listeners[event]=callback;}, showModal(){}, close(){}, focus(){} };
const calls = [];
let fail = false;
const context = {
  document:{getElementById:node,querySelectorAll:()=>[]},
  sessionStorage:{getItem:()=> 'test-key',setItem(){}},
  Intl, Date, Number, URLSearchParams, AbortController, setTimeout, clearTimeout,
  fetch:async url => { calls.push(new URL(url)); return {ok:!fail,json:async()=>fail?{error:{code:2006}}:{current:{temp_c:18.4,humidity:71,condition:{text:'맑음'},last_updated:'2026-11-04 11:00',wind_kph:18,wind_degree:90,precip_mm:0,uv:2,feelslike_c:17.2,is_day:1}}}; }
};
(async()=>{
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls.length,1,'load automatically requests weather');
  assert.equal(calls[0].pathname,'/v1/current.json');
  assert.equal(calls[0].searchParams.get('lang'),'ko');
  assert.equal(nodes.temp.textContent,'18');
  assert.equal(nodes.humidity.textContent,'71');
  assert.equal(nodes.condition.textContent,'맑음');
  assert.ok(nodes.updated.textContent.includes('2026-11-04 11:00'));
  await nodes.refresh.listeners.click();
  assert.equal(calls.length,2,'refresh requests weather again');
  fail=true;
  await nodes.refresh.listeners.click();
  assert.equal(nodes.temp.textContent,'—','failed request clears stale weather');
  assert.ok(nodes.status.textContent.includes('API 키가 올바르지'));
  assert.equal(nodes.refresh.disabled,false);
  console.log('PASS: automatic load, current.json, Korean, four requested fields, refresh, invalid-key recovery');
})().catch(error=>{console.error(error);process.exitCode=1;});
