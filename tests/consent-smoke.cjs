const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
const consentStart = source.indexOf('// Only this consent version');
const attributionStart = source.indexOf('const attributionKeys');
const attributionEnd = source.indexOf('function escapeHtml');
const code = source.slice(attributionStart, attributionEnd) + '\n' + source.slice(consentStart);
const key = 'rsp24-cookie-consent';
const now = Date.now();
const record = (a, m, overrides = {}) => ({version:'2026-10-16.1', analytics:a, marketing:m, updatedAt:now-1000, expiresAt:now+3600000, ...overrides});
function fixture({saved, blocked = false, cookieSeed = []} = {}) {
  const listeners = {}, elements = {}, scripts = [], deleted = [], events = [], timers = new Map();
  const jar = new Map(cookieSeed.map(c => [`${c.name}|${c.domain}|${c.path}`, {...c}]));
  let stored = saved === undefined ? null : (typeof saved === 'string' ? saved : JSON.stringify(saved));
  let reloads = 0, nextTimer = 0;
  const element = id => elements[id] ||= {id, hidden:true, checked:false, disabled:false, handlers:{}, dataset:{},
    addEventListener(type,fn){ this.handlers[type] = fn; },
    focus(){ document.activeElement = this; },
    remove(){ scripts.splice(scripts.indexOf(this), 1); },
    querySelectorAll(){ return ['analyticsCookies','marketingCookies','acceptCookies','rejectCookies','saveCookies'].map(element); }
  };
  const document = {
    referrer:'https://referrer.example/private-person/path?email=synthetic#fragment', activeElement:null, hidden:false,
    getElementById:element,
    createElement:() => ({dataset:{}, remove(){ scripts.splice(scripts.indexOf(this),1); }}),
    head:{appendChild(node){scripts.push(node);}},
    body:{classList:{add(){}, remove(){}}},
    addEventListener(type,fn){listeners[`document:${type}`] = fn;},
    querySelectorAll:() => scripts.slice()
  };
  Object.defineProperty(document,'cookie', {
    get(){return [...jar.values()].map(c => `${c.name}=synthetic`).join('; ');},
    set(raw){
      deleted.push(raw);
      const name=raw.split('=')[0];
      const domain = (/; Domain=([^;]+)/i.exec(raw)?.[1] || 'host').replace(/^\./,'');
      const cookiePath=/; Path=([^;]+)/i.exec(raw)?.[1] || '/';
      for(const [id,cookie] of jar) if(cookie.name === name && cookie.domain.replace(/^\./,'')===domain && cookie.path===cookiePath) jar.delete(id);
    }
  });
  const window = {
    location:{href:'https://www.rechtsschutzpartner24.de/angebot/?utm_source=synthetic&utm_medium=test&utm_campaign=qa&utm_term=term&gclid=synthetic&gbraid=synthetic&wbraid=synthetic&msclkid=synthetic&fbclid=synthetic#fragment',search:'?utm_source=synthetic&utm_medium=test&utm_campaign=qa&utm_term=term&gclid=synthetic&gbraid=synthetic&wbraid=synthetic&msclkid=synthetic&fbclid=synthetic',hostname:'www.rechtsschutzpartner24.de',pathname:'/angebot/',reload(){reloads++;}},
    setTimeout(fn,ms){const id=++nextTimer;timers.set(id,{fn,ms});return id;}, clearTimeout(id){timers.delete(id);},
    addEventListener(type,fn){listeners[`window:${type}`]=fn;}, dispatchEvent(event){events.push(event);}
  };
  const localStorage = {getItem(){if(blocked)throw Error('blocked');return stored;},setItem(k,v){if(blocked)throw Error('blocked');stored=v;},removeItem(){if(blocked)throw Error('blocked');stored=null;}};
  const ctx = vm.createContext({window,document,localStorage,URL,URLSearchParams,Date,Set,Map,console,CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail;}}});
  vm.runInContext(code,ctx,{filename:'script.js:consent-fixture'});
  const call=(name,...args)=>vm.runInContext(`${name}(${args.map(a=>JSON.stringify(a)).join(',')})`,ctx);
  return {window,document,elements,scripts,deleted,jar,listeners,timers,events,call,evaluate:expr=>vm.runInContext(expr,ctx),get stored(){return stored},get reloads(){return reloads},data(){return Array.from(window.dataLayer||[],x => Array.from(x));}};
}
const results=[];
function test(name,fn){fn();results.push({name,status:'PASS'});}
const configs = f => f.data().filter(x=>x[0]==='config').map(x=>x[1]);
const conversion = f => {f.call('emitLeadConversion','synthetic-form',{utm_term:'test',utm_campaign:'test',utm_source:'test'});return f.data().filter(x=>x[0]==='event').at(-1);};
test('Initial visit: no vendor request, both purposes denied, initial banner timer',()=>{const f=fixture();assert.equal(f.scripts.length,0);assert.equal(f.window['ga-disable-G-L0TL2D4CVW'],true);assert.equal(f.window['ga-disable-AW-18073108906'],true);assert([...f.timers.values()].some(t=>t.ms===500));assert.equal(conversion(f),undefined);assert.equal(f.events.length,0);});
test('Reject: versioned necessary-only record with 180 day expiry, no vendor',()=>{const f=fixture();f.elements.rejectCookies.handlers.click();const c=JSON.parse(f.stored);assert.equal(c.version,'2026-10-16.1');assert.equal(c.analytics,false);assert.equal(c.marketing,false);assert.equal(c.expiresAt-c.updatedAt,180*86400000);assert.equal(f.scripts.length,0);});
test('Analytics-only: GA configured; Ads denied; successful conversion targets GA only',()=>{const f=fixture();f.elements.analyticsCookies.checked=true;f.elements.saveCookies.handlers.click();assert.deepEqual(configs(f),['G-L0TL2D4CVW']);assert.match(f.scripts[0].src,/id=G-L0TL2D4CVW$/);const update=f.data().find(x=>x[0]==='consent'&&x[1]==='update')[2];assert.equal(update.analytics_storage,'granted');assert.equal(update.ad_storage,'denied');assert.deepEqual(Array.from(conversion(f)[2].send_to),['G-L0TL2D4CVW']);});
test('Marketing-only: Ads configured; Analytics denied; successful conversion targets Ads only',()=>{const f=fixture();f.elements.marketingCookies.checked=true;f.elements.saveCookies.handlers.click();assert.deepEqual(configs(f),['AW-18073108906']);assert.match(f.scripts[0].src,/id=AW-18073108906$/);const update=f.data().find(x=>x[0]==='consent'&&x[1]==='update')[2];assert.equal(update.analytics_storage,'denied');assert.equal(update.ad_storage,'granted');assert.deepEqual(Array.from(conversion(f)[2].send_to),['AW-18073108906']);});
test('Accept all: existing campaign IDs unchanged; denied defaults queued before grants',()=>{const f=fixture();f.elements.acceptCookies.handlers.click();assert.deepEqual(configs(f),['G-L0TL2D4CVW','AW-18073108906']);assert.equal(f.data()[0][0],'consent');assert.equal(f.data()[0][1],'default');assert.equal(f.data()[0][2].analytics_storage,'denied');assert.equal(f.scripts.length,1);assert.deepEqual(Array.from(conversion(f)[2].send_to),['G-L0TL2D4CVW','AW-18073108906']);});
for(const [name,saved] of [['legacy all','all'],['legacy necessary','necessary'],['expired',record(true,true,{expiresAt:now-1})],['wrong version',record(true,true,{version:'old'})],['future decision',record(true,true,{updatedAt:now+3600000})],['oversized lifetime',record(true,true,{expiresAt:now+181*86400000})],['nonboolean',record('true',true)]]) test(`${name}: requires fresh consent; no vendor loaded`,()=>{const f=fixture({saved});assert.equal(f.scripts.length,0);assert.equal(conversion(f),undefined);});
test('Existing current record resumes only the permitted purpose',()=>{const f=fixture({saved:record(false,true)});assert.deepEqual(configs(f),['AW-18073108906']);});
test('Storage blocked: no crash and an explicit choice works only in memory',()=>{const f=fixture({blocked:true});assert.equal(f.scripts.length,0);f.elements.analyticsCookies.checked=true;f.elements.saveCookies.handlers.click();assert.deepEqual(configs(f),['G-L0TL2D4CVW']);assert.equal(f.stored,null);});
test('Withdrawal: persist necessary choice, remove host/apex/path tracking cookies, preserve unrelated cookie and reload',()=>{const f=fixture({saved:record(true,true),cookieSeed:[{name:'_ga',domain:'host',path:'/'},{name:'_ga_TEST',domain:'.rechtsschutzpartner24.de',path:'/'},{name:'_gcl_au',domain:'.rechtsschutzpartner24.de',path:'/angebot/'},{name:'session',domain:'.rechtsschutzpartner24.de',path:'/'}]});f.elements.rejectCookies.handlers.click();assert.equal(f.reloads,1);assert.equal(JSON.parse(f.stored).analytics,false);assert.equal(JSON.parse(f.stored).marketing,false);assert.deepEqual([...f.jar.values()].map(c=>c.name),['session']);assert.equal(f.window['ga-disable-G-L0TL2D4CVW'],true);assert.equal(conversion(f),undefined);});
test('Selective withdrawal reloads and retains only allowed settings',()=>{const f=fixture({saved:record(true,true)});f.elements.analyticsCookies.checked=true;f.elements.marketingCookies.checked=false;f.elements.saveCookies.handlers.click();assert.equal(f.reloads,1);assert.equal(JSON.parse(f.stored).analytics,true);assert.equal(JSON.parse(f.stored).marketing,false);const reloaded=fixture({saved:f.stored});assert.deepEqual(configs(reloaded),['G-L0TL2D4CVW']);});
test('Cross-tab revocation stops loaded tags',()=>{const f=fixture({saved:record(true,true)});f.listeners['window:storage']({key,newValue:JSON.stringify(record(false,false))});assert.equal(f.reloads,1);assert.equal(conversion(f),undefined);});
test('Runtime expiry blocks new conversions, clears choice and reloads',()=>{const f=fixture({saved:record(true,true)});f.evaluate('consentState.expiresAt=Date.now()-1');assert.equal(conversion(f),undefined);assert.equal(f.stored,null);assert.equal(f.reloads,1);});

test('Attribution excludes all click IDs, query and fragment; referrer is origin only',()=>{const f=fixture();const a=f.call('readLeadAttribution');for(const id of ['gclid','gbraid','wbraid','msclkid','fbclid'])assert.equal(Object.hasOwn(a,id),false);assert.equal(a.source_url,'https://www.rechtsschutzpartner24.de/angebot/');assert.equal(a.referrer_url,'https://referrer.example');assert.equal(a.utm_source,'synthetic');assert.equal(a.utm_campaign,'qa');assert.equal(f.call('attributionUrl','javascript:alert(1)'), '');});
test('Switch Ads-only to Analytics-only: requires reload then only GA resumes',()=>{const f=fixture({saved:record(false,true)});f.elements.analyticsCookies.checked=true;f.elements.marketingCookies.checked=false;f.elements.saveCookies.handlers.click();assert.equal(f.reloads,1);const reloaded=fixture({saved:f.stored});assert.deepEqual(configs(reloaded),['G-L0TL2D4CVW']);});
test('Long choice duration is scheduled within browser timer limit',()=>{const f=fixture();f.elements.acceptCookies.handlers.click();assert([...f.timers.values()].some(t=>t.ms===2147483647));assert([...f.timers.values()].every(t=>t.ms<=2147483647));});
test('Current purpose check prevents conversion while expiry closes an open document',()=>{const f=fixture({saved:record(true,false)});f.evaluate('consentState.expiresAt=Date.now()-1');f.listeners['document:visibilitychange']();assert.equal(f.reloads,1);assert.equal(conversion(f),undefined);});
const result={scope:'Isolated Node VM executing the production attribution and consent blocks unchanged; synthetic DOM/storage/cookie fixtures; no browser, vendor network, SMTP, DB or form request.',source_sha256:require('node:crypto').createHash('sha256').update(source).digest('hex'),results};
fs.writeFileSync(path.join(__dirname,'../consent-vm-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:results.length,failed:0,source_sha256:result.source_sha256}));
