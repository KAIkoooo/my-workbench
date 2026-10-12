'use strict';
/* ============ 工具 ============ */
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const pad=n=>(n<10?'0':'')+n;
const ymd=d=>{d=d?new Date(d):new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const ts=d=>{const x=d?new Date(d):new Date();return (x.getMonth()+1)+'/'+x.getDate()};
const daysBetween=(a,b)=>Math.floor((new Date(b)-new Date(a))/86400000);
const money=n=>'¥'+(+n||0).toFixed(2);
function rng(seed){let a=0;for(const c of String(seed))a=(a*31+c.charCodeAt(0))>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1700)}
function dl(name,content,type){const b=new Blob([content],{type:type||'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)}
function dlURL(url,name){const a=document.createElement('a');a.href=url;a.download=name;a.click()}


const KEY='personal_workbench_20261012';
let db={weather:{city:{name:'深圳',lat:22.5431,lon:114.0579},cur:null,fc:[],upd:0},fits:[]};
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&saved.weather&&Array.isArray(saved.fits))db=saved}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){toast('保存失败，请检查浏览器存储空间')}}
function openSheet(html){$('sheetBody').innerHTML=html;$('sheet').classList.add('on')}
function closeSheet(){$('sheet').classList.remove('on')}
let cur='home';
function go(v){if(!['home','fit','profile','chatgpt'].includes(v))return;cur=v;document.querySelectorAll('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));document.querySelectorAll('nav button').forEach(e=>e.classList.toggle('on',e.dataset.v===v));$('pageTitle').textContent={home:'我的工作台',fit:'出行',profile:'个人主页',chatgpt:'ChatGPT'}[v];window.scrollTo(0,0);if(v==='home')renderHome();if(v==='fit')renderFit();if(v==='profile'&&!$('profileFrame').src)$('profileFrame').src=$('profileFrame').dataset.src}
function renderHome(){const d=new Date();$('homeDate').textContent=d.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long',timeZone:'Asia/Shanghai'});$('homeSub').textContent='保持好奇，按照自己的节奏生活';paintWeather();fetchWeather();renderCalendar();renderVirgo();renderLiuri()}
function openSettings(){openSheet('<h3>工作台设置</h3><p class="hint">天气与运动记录只保存在当前浏览器。</p><button class="btn" onclick="exportLocal()">导出本地备份</button><label class="lb">导入备份</label><input type="file" accept=".json" onchange="importLocal(this)"><p class="hint">安卓 Chrome：菜单 → 添加到主屏幕 / 安装应用。</p><button class="btn ghost" onclick="closeSheet()">关闭</button>')}
function exportLocal(){dl('workbench-backup.json',JSON.stringify(db,null,2),'application/json')}
async function importLocal(inp){try{const x=JSON.parse(await inp.files[0].text());if(!x.weather||!x.weather.city||!Number.isFinite(x.weather.city.lat)||!Number.isFinite(x.weather.city.lon)||!Array.isArray(x.fits)||x.fits.some(f=>!Number.isFinite(f.min)||typeof f.type!=='string'||typeof f.date!=='string'))throw Error();db={weather:x.weather,fits:x.fits};save();closeSheet();go(cur);toast('已导入')}catch(e){toast('备份格式不正确')}}
/* ============ 天气 ============ */
const WMO={0:['晴','☀️'],1:['晴间少云','🌤️'],2:['多云','⛅'],3:['阴','☁️'],45:['雾','🌫️'],48:['雾凇','🌫️'],51:['毛毛雨','🌦️'],53:['毛毛雨','🌦️'],55:['毛毛雨','🌦️'],56:['冻毛毛雨','🌧️'],57:['冻毛毛雨','🌧️'],61:['小雨','🌧️'],63:['中雨','🌧️'],65:['大雨','🌧️'],66:['冻雨','🌧️'],67:['冻雨','🌧️'],71:['小雪','🌨️'],73:['中雪','🌨️'],75:['大雪','❄️'],77:['雪粒','🌨️'],80:['阵雨','🌦️'],81:['阵雨','🌦️'],82:['强阵雨','⛈️'],85:['阵雪','🌨️'],86:['阵雪','🌨️'],95:['雷阵雨','⛈️'],96:['雷暴冰雹','⛈️'],99:['雷暴冰雹','⛈️']};
const WQ_CITIES=[['北京',39.9042,116.4074],['上海',31.2304,121.4737],['广州',23.1291,113.2644],['深圳',22.5431,114.0579],['杭州',30.2741,120.1551],['南京',32.0603,118.7969],['成都',30.5728,104.0668],['武汉',30.5928,114.3055],['西安',34.3416,108.9398],['重庆',29.563,106.5516],['苏州',31.2989,120.5853],['天津',39.3434,117.3616],['长沙',28.2282,112.9388],['郑州',34.7466,113.6254],['青岛',36.0671,120.3826],['厦门',24.4798,118.0894],['合肥',31.8206,117.2272],['福州',26.0745,119.2965],['昆明',25.0389,102.7183],['贵阳',26.647,106.6302],['济南',36.6512,117.1201],['石家庄',38.0428,114.5149],['太原',37.8706,112.5489],['沈阳',41.8057,123.4315],['长春',43.8171,125.3235],['哈尔滨',45.8038,126.5349],['南昌',28.682,115.8579],['南宁',22.817,108.3665],['海口',20.0444,110.1999],['兰州',36.0611,103.8343],['乌鲁木齐',43.8256,87.6168],['拉萨',29.652,91.1721],['西宁',36.6171,101.7782],['银川',38.4872,106.2309],['呼和浩特',40.8424,111.75],['南通',32.0163,120.8654]];
function paintWeather(){
  const w=db.weather;if(!w||!$('wxIcon'))return;
  $('wxCity').textContent='📍 '+w.city.name;
  if(!w.cur){return}
  const t=WMO[w.cur.code]||['未知','🌡️'];
  $('wxIcon').textContent=t[1];
  $('wxTemp').textContent=Math.round(w.cur.t)+'°';
  $('wxTxt').textContent=t[0];
  $('wxSub').textContent='湿度 '+w.cur.hum+'% · 风 '+Math.round(w.cur.wind)+'km/h · 体感 '+Math.round(w.cur.feel)+'°';
}
async function fetchWeather(force){
  const w=db.weather;if(!w)return;
  if(!force&&w.cur&&Date.now()-w.upd<20*60000){paintWeather();return}
  try{
    const u='https://api.open-meteo.com/v1/forecast?latitude='+w.city.lat+'&longitude='+w.city.lon+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=6';
    const j=await(await fetch(u)).json();
    w.cur={t:j.current.temperature_2m,hum:j.current.relative_humidity_2m,feel:j.current.apparent_temperature,code:j.current.weather_code,wind:j.current.wind_speed_10m};
    w.fc=j.daily.time.map((d,i)=>({y:+d.slice(0,4),m:+d.slice(5,7),d:+d.slice(8,10),code:j.daily.weather_code[i],hi:j.daily.temperature_2m_max[i],lo:j.daily.temperature_2m_min[i]}));
    w.upd=Date.now();save();paintWeather();
    if($('sheet').classList.contains('on')&&$('wxFcBox'))openWx();
  }catch(e){
    if(!w.cur){$('wxIcon').textContent='🌡️';$('wxTemp').textContent='--';$('wxTxt').textContent='天气获取失败，点击重试';$('wxSub').textContent='请检查网络'}
  }
}
function fcLabel(f,i){
  const wd='日一二三四五六';
  if(i===0)return['今天',f.m+'/'+f.d];
  if(i===1)return['明天',f.m+'/'+f.d];
  return['周'+wd[new Date(f.y,f.m-1,f.d).getDay()],f.m+'/'+f.d];
}
function openWx(){
  const w=db.weather;
  const rows=(w.fc||[]).map((f,i)=>{const t=WMO[f.code]||['未知','🌡️'];const lb=fcLabel(f,i);
    return '<div class="fc-row"><div class="fd"><b>'+lb[0]+'</b><span>'+lb[1]+'</span></div><span class="fi">'+t[1]+'</span><span class="ft">'+t[0]+'</span><span class="fbar"><b>'+Math.round(f.hi)+'°</b><span>'+Math.round(f.lo)+'°</span></span></div>'}).join('');
  const cur=w.cur?('<p class="meta" style="margin-top:4px">湿度 '+w.cur.hum+'% · 风 '+Math.round(w.cur.wind)+'km/h · 体感 '+Math.round(w.cur.feel)+'° · 更新于 '+new Date(w.upd).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})+'</p>'):'';
  openSheet('<h3>📍 '+esc(w.city.name)+' · 天气</h3>'+cur
   +'<div id="wxFcBox" style="margin-top:8px">'+(rows||'<p class="hint">预报加载中，请稍候…</p>')+'</div>'
   +'<div class="actions"><button class="btn ghost" onclick="fetchWeather(1)">↻ 刷新</button><button class="btn" onclick="openCityPicker()">切换地区</button></div>');
  if(!w.fc||!w.fc.length)fetchWeather(1);
}
let WX_RES=[],wxQT;
function openCityPicker(){
  openSheet('<h3>选择地区</h3><div class="quick" style="margin-top:8px"><input id="wxQ" placeholder="输入城市名搜索，如：南通" oninput="wxSearch()"><button class="btn ghost" onclick="wxSearch()">搜索</button></div>'
   +'<p class="hint" style="margin-top:12px">热门城市 · 直接点击</p>'
   +'<div class="chips" style="flex-wrap:wrap;overflow:visible">'+WQ_CITIES.map((c,i)=>'<button class="mini" onclick="wxPickHot('+i+')">'+c[0]+'</button>').join('')+'</div>'
   +'<div id="wxRes"><p class="hint" style="margin-top:12px">或输入城市名搜索（支持区县）</p></div>');
}
async function wxSearch(){
  clearTimeout(wxQT);
  wxQT=setTimeout(async()=>{
    const q=($('wxQ').value||'').trim();if(!q)return;
    const box=$('wxRes');if(!box)return;
    box.innerHTML='<p class="hint">搜索中…</p>';
    try{
      const j=await(await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(q)+'&count=15&language=zh&format=json')).json();
      const list=(j.results||[]).filter(x=>x.country_code==='CN'||x.country_code==='TW');
      WX_RES=list;
      box.innerHTML=list.length?'<p class="hint">搜索结果 · 点击选择</p>'+list.map((x,i)=>{
        const region=x.country_code==='TW'?'中国台湾':((x.admin1||'')+(x.admin2&&x.admin2!==x.name?' '+x.admin2:''));
        return '<div class="wx-rs" onclick="wxPick('+i+')"><span>📍 '+esc(x.name)+'</span><span class="meta">'+esc(region)+'</span></div>'}).join(''):'<p class="hint">未找到「'+esc(q)+'」，换个名称试试</p>';
    }catch(e){box.innerHTML='<p class="hint">搜索失败，请检查网络</p>'}
  },400);
}
function wxPick(i){
  const x=WX_RES[i];if(!x)return;
  db.weather.city={name:x.name,lat:+(+x.latitude).toFixed(4),lon:+(+x.longitude).toFixed(4)};db.weather.upd=0;save();
  closeSheet();toast('已切换到 '+x.name);fetchWeather(1);
}
function wxPickHot(i){
  const c=WQ_CITIES[i];
  db.weather.city={name:c[0],lat:c[1],lon:c[2]};db.weather.upd=0;save();
  closeSheet();toast('已切换到 '+c[0]);fetchWeather(1);
}

/* ============ 万年历（农历/干支/节气/宜忌） ============ */
const LUNAR_INFO=[0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,0x0d520];
const LMON=['正','二','三','四','五','六','七','八','九','十','冬','腊'];
const LDAYN=['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
const GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥',SXN='鼠牛虎兔龙蛇马羊猴鸡狗猪';
const TERMS=['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
const TERM_MS=[0,21208,42436,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758];
const JCHU=[
 ['建',['出行','上任','会友','见工','求职'],['动土','开仓','掘井','乘船']],
 ['除',['祭祀','祈福','除旧布新','沐浴','求医'],['嫁娶','赴任','栽种']],
 ['满',['祭祀','祈福','纳财','开市','交易'],['服药','栽种','动土']],
 ['平',['修饰垣墙','平整道路','安床'],['词讼','开市','交易']],
 ['定',['祭祀','祈福','嫁娶','订盟','签约','纳采'],['诉讼','出行','求医']],
 ['执',['祈福','祭祀','求嗣','嫁娶','捕捉'],['搬家','远行','开市']],
 ['破',['破屋','坏垣','拆卸','求医'],['嫁娶','签约','开市','出行']],
 ['危',['祭祀','纳畜','静养'],['登高','行船','冒险','出行']],
 ['成',['开市','入学','嫁娶','求职','入宅'],['诉讼','争辩']],
 ['收',['纳财','进人口','收纳','购置'],['放债','开仓','出货']],
 ['开',['开市','开工','动土','求医','入学'],['安葬','破土','行丧']],
 ['闭',['安葬','筑堤','补垣','塞穴'],['开市','嫁娶','出行']]];
const SOLAR_F={'1-1':'元旦','2-14':'情人节','3-8':'妇女节','3-12':'植树节','5-1':'劳动节','5-4':'青年节','6-1':'儿童节','7-1':'建党节','8-1':'建军节','9-10':'教师节','10-1':'国庆节','11-11':'双十一','12-24':'平安夜','12-25':'圣诞节'};
const LUNAR_F={'1-1':'春节','1-15':'元宵节','2-2':'龙抬头','3-3':'上巳节','5-5':'端午节','7-7':'七夕节','7-15':'中元节','8-15':'中秋节','9-9':'重阳节','12-8':'腊八节','12-23':'小年'};
function leapMonthOf(y){return LUNAR_INFO[y-1900]&0xf}
function leapDaysOf(y){return leapMonthOf(y)?((LUNAR_INFO[y-1900]&0x10000)?30:29):0}
function lMonthDays(y,m){return (LUNAR_INFO[y-1900]&(0x10000>>m))?30:29}
function lYearDays(y){let s=348;for(let i=0x8000;i>0x8;i>>=1)if(LUNAR_INFO[y-1900]&i)s++;return s+leapDaysOf(y)}
function s2l(y,m,d){
  let off=Math.floor((Date.UTC(y,m-1,d)-Date.UTC(1900,0,31))/86400000);
  let ly=1900,temp=0;
  for(let i=1900;i<2101&&off>0;i++){temp=lYearDays(i);off-=temp;ly=i+1}
  if(off<0){off+=temp;ly--}
  let lm=1,leap=false;
  const lpm=leapMonthOf(ly);
  for(let i=1;i<13&&off>0;i++){
    if(lpm>0&&i===lpm+1&&leap===false){--i;leap=true;temp=leapDaysOf(ly)}
    else temp=lMonthDays(ly,i);
    if(leap===true&&i===lpm+1)leap=false;
    off-=temp;lm++;
  }
  if(off===0&&lpm>0&&lm===lpm+1){if(leap){leap=false}else{leap=true;lm--}}
  if(off<0){off+=temp;lm--}
  return {y:ly,m:lm,d:off+1,leap};
}
function termOf(y,n){
  const t=new Date(31556925974.7*(y-1900)+TERM_MS[n]*60000+Date.UTC(1900,0,6,2,5));
  return {y:t.getUTCFullYear(),m:t.getUTCMonth()+1,d:t.getUTCDate()};
}
function calInfo(y,m,d){
  const L=s2l(y,m,d);
  let gy=y;
  const lc=termOf(y,2);
  if(m<lc.m||(m===lc.m&&d<lc.d))gy=y-1;
  const yg=((gy-4)%10+10)%10,yz=((gy-4)%12+12)%12;
  let mi=-1;
  const tms=[];
  for(let n=0;n<24;n++){const t=termOf(y,n);tms.push({n,t});
    if(n%2===0&&t.y===y&&(t.m<m||(t.m===m&&t.d<=d)))mi=n;
  }
  const mz=mi<0?0:((mi/2)+1)%12;
  const mo=(mz-2+12)%12;
  const mg=(yg%5*2+2+mo)%10;
  const jdn=Math.floor(Date.UTC(y,m-1,d)/86400000)+2440588;
  const di=(jdn+49)%60;
  const dg=di%10,dz=di%12;
  const jc=(dz-mz+12)%12;
  let term='',fest='';
  for(const it of tms){if(it.t.y===y&&it.t.m===m&&it.t.d===d){term=TERMS[it.n];break}}
  fest=SOLAR_F[m+'-'+d]||LUNAR_F[L.m+'-'+L.d]||'';
  if(term==='清明'&&!fest)fest='清明节';
  return {L,yg,yz,mg,mz,dg,dz,jc,term,fest,
    gzY:GAN[yg]+ZHI[yz],gzM:GAN[mg]+ZHI[mz],gzD:GAN[dg]+ZHI[dz],sx:SXN[yz]};
}
let calY=0,calM=0;
function renderCalendar(){
  const now=new Date(),ty=now.getFullYear(),tm=now.getMonth()+1,td=now.getDate();
  if(!calY){calY=ty;calM=tm}
  const I=calInfo(ty,tm,td);
  const lunarStr=(I.L.leap?'闰':'')+LMON[I.L.m-1]+'月'+LDAYN[I.L.d-1];
  const j=JCHU[I.jc];
  $('calCard').innerHTML=
   '<div class="today"><div class="t-num"><b>'+pad(td)+'</b><span>'+ty+'年'+tm+'月</span></div>'
   +'<div class="t-info">'
   +'<div class="ln"><b>'+new Date(ty,tm-1,td).toLocaleDateString('zh-CN',{weekday:'long'})+'</b>'+(I.term?' · <span class="fest">'+I.term+'</span>':'')+(I.fest?' · <span class="fest">'+I.fest+'</span>':'')+'</div>'
   +'<div class="ln">农历 <b>'+lunarStr+'</b> · 属'+I.sx+'</div>'
   +'<div class="ln">干支 '+I.gzY+'年 '+I.gzM+'月 '+I.gzD+'日 · '+j[0]+'执位</div>'
   +'</div></div>'
   +'<div class="yj"><div><b>宜</b><span>'+j[1].join(' · ')+'</span></div><div><b>忌</b><span>'+j[2].join(' · ')+'</span></div></div>'
   +'<div class="m-hd"><button onclick="calShiftM(-1)">‹</button><b>'+calY+'年'+calM+'月</b><span class="row" style="gap:6px"><button onclick="calTodayM()" style="width:30px;font-size:12px">今</button><button onclick="calShiftM(1)">›</button></span></div>'
   +'<div class="mgrid" id="mgrid"></div>';
  calGrid();
  const g=$('mgrid');
  if(g&&!g._sw){
    g._sw=1;let sx=0,sy=0;
    g.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
    g.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.6)calShiftM(dx<0?1:-1)},{passive:true});
  }
}
function calGrid(){
  const g=$('mgrid');if(!g)return;
  const now=new Date(),td=now.getDate(),tmNow=now.getMonth()+1,tyNow=now.getFullYear();
  const lead=new Date(calY,calM-1,1).getDay();
  const days=new Date(calY,calM,0).getDate();
  let h='日一二三四五六'.split('').map(w=>'<span class="w">'+w+'</span>').join('');
  for(let i=0;i<lead;i++)h+='<span class="cd dim"></span>';
  for(let d=1;d<=days;d++){
    const I=calInfo(calY,calM,d);
    let lab=LDAYN[I.L.d-1],isF=false;
    if(I.L.d===1)lab=(I.L.leap?'闰':'')+LMON[I.L.m-1]+'月';
    if(I.fest){lab=I.fest;isF=true}
    if(I.term){lab=I.term;isF=true}
    let cls='cd';
    if(d===td&&calM===tmNow&&calY===tyNow)cls+=' today';
    h+='<span class="'+cls+'" onclick="calDay('+calY+','+calM+','+d+')"><span class="d">'+d+'</span><span class="l'+(isF?' fest':'')+'">'+lab+'</span></span>';
  }
  g.innerHTML=h;
}
function calShiftM(n){calM+=n;if(calM<1){calM=12;calY--}if(calM>12){calM=1;calY++}renderCalendar()}
function calTodayM(){calY=0;calM=0;renderCalendar()}
function calDay(y,m,d){
  const I=calInfo(y,m,d);
  const j=JCHU[I.jc];
  openSheet('<h3>'+y+'年'+m+'月'+d+'日 · '+new Date(y,m-1,d).toLocaleDateString('zh-CN',{weekday:'long'})+'</h3>'
   +'<p style="font-size:13px;color:var(--muted);margin-top:4px">农历 '+(I.L.leap?'闰':'')+LMON[I.L.m-1]+'月'+LDAYN[I.L.d-1]+' · 属'+I.sx+' · '+I.gzY+'年 '+I.gzM+'月 '+I.gzD+'日 · '+j[0]+'执位</p>'
   +(I.term||I.fest?'<p style="font-size:13px;color:var(--coral);margin-top:4px">'+(I.fest?I.fest+' ':'')+(I.term||'')+'</p>':'')
   +'<div style="display:flex;gap:8px;margin-top:10px">'
   +'<div style="flex:1;background:#E1F5EE;border-radius:10px;padding:10px;font-size:12px;line-height:1.8"><b style="color:var(--teal)">宜</b><br>'+j[1].join('、')+'</div>'
   +'<div style="flex:1;background:#FAECE7;border-radius:10px;padding:10px;font-size:12px;line-height:1.8"><b style="color:var(--coral)">忌</b><br>'+j[2].join('、')+'</div></div>'
   +'<div class="actions"><button class="btn ghost" onclick="closeSheet()">关闭</button></div>');
}

const FIT_TYPES=['跑步','骑行','深圳地铁'];
let fitType='跑步';
function renderFitTypes(){$('fitTypes').innerHTML=FIT_TYPES.map(t=>'<button class="'+(fitType===t?'on':'')+'" onclick="fitType=\''+t+'\';renderFit()">'+t+'</button>').join('');const isMetro=fitType==='深圳地铁';$('fitForm').style.display=isMetro?'none':'';$('metroSection').style.display=isMetro?'block':'none';$('fitStats').style.display=isMetro?'none':'';$('fitWeek').style.display=isMetro?'none':'';$('fitList').style.display=isMetro?'none':'';if(isMetro)loadMetro()}
function addFit(){
  const m=parseInt($('fitMin').value,10);
  if(!m||m<=0){toast('请填写时长');return}
  const coins=0;
  db.fits.unshift({id:uid(),date:ymd(),type:fitType,min:m,note:$('fitNote').value.trim(),coins});
  save();
  $('fitMin').value='';$('fitNote').value='';
  renderFit();toast('打卡成功');
}
function delFit(id){const f=db.fits.find(x=>x.id===id);if(!f)return;db.fits=db.fits.filter(x=>x.id!==id);save();renderFit();toast('已删除')}

/* ============ 深圳地铁 ============ */
let METRO=null,METRO_S=null,METRO_L=null,METRO_A=null,METRO_P=null;
let METRO_ROUTE=null,METRO_LAST_SUG=null;
let metroVM={scale:1,tx:0,ty:0},metroVM2={scale:1,tx:0,ty:0};
async function loadMetro(){
  if(METRO) return METRO;
  try{
    const r=await fetch('metro/sz_stations.json?v=20260929b');
    METRO=await r.json();
  }catch(e){toast('地铁数据加载失败');return null}
  METRO_S=METRO.stations;METRO_L=METRO.lines;METRO_A=METRO.adj;METRO_P=METRO.portals;
  drawMetroMap();
  // 重置视图：官方图 + 互动图
  setTimeout(()=>{
    const im=$('metroImg');
    if(im&&im.complete)metroFitView();
    else if(im)im.addEventListener('load',()=>metroFitView(),{once:true});
    metroFitViewSvg();
  },50);
  // 视口变化时重新适配（无路线时）
  window.addEventListener('resize',()=>{if(METRO&&!METRO_ROUTE&&$('metroSection')&&$('metroSection').style.display!=='none'){metroFitView();metroFitViewSvg()}});
  return METRO;
}
function metroSuggest(which){
  const inp=$(which==='from'?'metroFrom':'metroTo');
  const sug=$('metroSug');
  if(!METRO_S){if(!METRO)loadMetro();sug.innerHTML='<div class="meta" style="padding:6px 8px">地铁数据加载中…</div>';return}
  const q=inp.value.trim();
  if(!q){sug.innerHTML='';return}
  const ql=q.toLowerCase();
  const list=METRO_S.filter(x=>x.name.includes(q)||x.name.toLowerCase().includes(ql)).slice(0,12);
  if(!list.length){sug.innerHTML='<div class="meta" style="padding:6px 8px">未匹配到站点</div>';return}
  sug.innerHTML='<div class="card" style="padding:4px;margin:6px 0"><div class="metro-sug-list">'+list.map(s=>'<div class="metro-sug-row" onclick="metroPick(\''+which+'\','+s.i+',\''+s.name.replace(/'/g,'\\')+'\')"><b>'+s.name+'</b><span class="meta">'+(s.lines||[]).map(l=>{
    const lo=METRO_L.find(x=>x.id===l);return lo?lo.name:l;
  }).join(' / ')+'</span></div>').join('')+'</div>';
}
function metroPick(which,ind,name){
  const inp=$(which==='from'?'metroFrom':'metroTo');
  inp.value=name;inp.dataset.sid=ind;
  $('metroSug').innerHTML='';
}
function metroClear(){
  $('metroFrom').value='';$('metroFrom').dataset.sid='';
  $('metroTo').value='';$('metroTo').dataset.sid='';
  $('metroSug').innerHTML='';$('metroResult').innerHTML='';
  METRO_ROUTE=null;
  drawMetroMap();
  metroFitView();
  metroFitViewSvg();
}
function haversine(a,b){
  const R=6371,toRad=x=>x*Math.PI/180;
  const dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng);
  const x=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
function metroSegs(path){
  const segs=[];let cur=null;
  for(let i=0;i<path.length-1;i++){
    const u=path[i],v=path[i+1];
    const uL=new Set(METRO_S[u].lines||[]);
    const shared=(METRO_S[v].lines||[]).filter(l=>uL.has(l));
    if(cur && shared.indexOf(cur.lineId)>=0){cur.to=v}
    else{if(cur)segs.push(cur);cur={lineId:shared[0]||'',from:u,to:v}}
  }
  if(cur)segs.push(cur);
  return {segs,transfers:Math.max(0,segs.length-1)};
}
function metroSearch(){
  if(!METRO_S){toast('数据加载中…');return}
  const a=parseInt($('metroFrom').dataset.sid||'-1',10);
  const b=parseInt($('metroTo').dataset.sid||'-1',10);
  if(isNaN(a)||isNaN(b)||a<0||b<0){toast('请先从下拉中选择起、始站');return}
  if(a===b){toast('起、始站相同');return}
  // BFS
  const N=METRO_S.length,prev=new Array(N).fill(-1),dist=new Array(N).fill(Infinity);
  dist[a]=0;const q=[a];
  while(q.length){
    let mi=0;for(let i=1;i<q.length;i++)if(dist[q[i]]<dist[q[mi]])mi=i;
    const u=q.splice(mi,1)[0];
    if(u===b)break;
    for(const v of METRO_A[u]||[]){
      if(dist[v]===Infinity){dist[v]=dist[u]+1;prev[v]=u;q.push(v)}
    }
  }
  if(dist[b]===Infinity){toast('暂未找到可达路线');METRO_ROUTE=null;drawMetroMap();return}
  const path=[];for(let cur=b;cur!==-1;cur=prev[cur])path.unshift(cur);
  // 距离
  let distKm=0;
  for(let i=0;i<path.length-1;i++)distKm+=haversine(METRO_S[path[i]],METRO_S[path[i+1]]);
  const sg=metroSegs(path);
  METRO_ROUTE={path,segs:sg.segs,transfers:sg.transfers,distKm:Math.round(distKm*10)/10,stations:path.length-1};
  renderMetroResult();
  drawMetroMap();
  // 互动图自动聚焦到结果
  const cs=METRO_S[a],ct=METRO_S[b];
  const cx=(cs.x+ct.x)/2, cy=(cs.y+ct.y)/2;
  const cw=Math.max(120,Math.abs(cs.x-ct.x)+80);
  const ch=Math.max(120,Math.abs(cs.y-ct.y)+80);
  const cont=$('metroCanvas2');
  const rect=cont.getBoundingClientRect();
  const scale=Math.min(rect.width/cw, rect.height/ch);
  metroVM2.scale=Math.max(0.5,Math.min(4,scale));
  metroVM2.tx=rect.width/2-cx*metroVM2.scale;
  metroVM2.ty=rect.height/2-cy*metroVM2.scale;
  applyMetroViewSvg();
}
function renderMetroResult(){
  const r=METRO_ROUTE;if(!r){$('metroResult').innerHTML='';return}
  $('metroResult').innerHTML=
    '<div class="card metro-result"><div class="row" style="justify-content:space-between"><div><b>约 '+r.distKm+' 公里</b></div><div class="meta">'+r.stations+' 站 · '+r.transfers+' 次换乘</div></div>'
    +'<div style="margin-top:10px">'+r.segs.map(s=>{
      const lo=METRO_L.find(x=>x.id===s.lineId);
      const c=lo&&lo.color?lo.color:'#534AB7';
      return '<div class="metro-seg"><span class="metro-line-dot" style="background:'+c+'"></span><span class="metro-seg-name">'+(lo?lo.name:s.lineId)+'</span><span class="meta">'+METRO_S[s.from].name+' → '+METRO_S[s.to].name+'</span></div>';
    }).join('<div class="meta" style="text-align:center;margin:2px 0">↓ 换乘 ↓</div>')+'</div></div>';
}
/* 官方线网图（图片） */
function applyMetroView(){
  const img=$('metroImg');if(!img)return;
  img.style.transform='translate('+metroVM.tx+'px,'+metroVM.ty+'px) scale('+metroVM.scale+')';
}
function metroFitView(){
  const img=$('metroImg');if(!img)return;
  const cont=$('metroCanvas');const rect=cont.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const iw=img.naturalWidth||1200,ih=img.naturalHeight||1200;
  metroVM.scale=Math.min(rect.width/iw, rect.height/ih)*0.98;
  metroVM.tx=(rect.width-iw*metroVM.scale)/2;
  metroVM.ty=(rect.height-ih*metroVM.scale)/2;
  applyMetroView();
}
/* 互动线路图（SVG，路线高亮） */
function drawMetroMap(){
  if(!METRO)return;
  const svg=$('metroSvg');if(!svg)return;
  // 不设 viewBox：缩放平移完全由 #metroG 的 transform 控制（避免双重缩放）
  svg.removeAttribute('viewBox');
  let html='';
  METRO_L.forEach(L=>{
    const pts=L.path.filter(i=>i!==null).map(i=>METRO_S[i]);
    if(pts.length<2)return;
    const d=pts.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' ');
    html+='<path d="'+d+'" stroke="'+(L.color||'#999')+'" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="'+(L.status==='运营'?1:0.4)+'"/>';
  });
  METRO_S.forEach(s=>{
    html+='<circle cx="'+s.x+'" cy="'+s.y+'" r="2.2" fill="#fff" stroke="#7a76a8" stroke-width="0.8"/>';
  });
  // 站名标签（字号在 applyMetroViewSvg 中反向补偿，保持屏幕恒定大小）
  html+='<g id="metroLbG">'+METRO_S.map(s=>'<text transform="translate('+s.x+','+s.y+')" dy="1.25em">'+s.name+'</text>').join('')+'</g>';
  // 路线高亮
  if(METRO_ROUTE){
    const pts=METRO_ROUTE.path.map(i=>METRO_S[i]);
    const d=pts.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' ');
    html+='<path d="'+d+'" stroke="#534AB7" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>';
    const a=METRO_S[METRO_ROUTE.path[0]];
    const b=METRO_S[METRO_ROUTE.path[METRO_ROUTE.path.length-1]];
    html+='<circle cx="'+a.x+'" cy="'+a.y+'" r="6" fill="#0F6E56" stroke="#fff" stroke-width="2"/>';
    html+='<text x="'+(a.x+8)+'" y="'+(a.y-6)+'" font-size="11" fill="#0F6E56" font-weight="700">起点</text>';
    html+='<circle cx="'+b.x+'" cy="'+b.y+'" r="6" fill="#993C1D" stroke="#fff" stroke-width="2"/>';
    html+='<text x="'+(b.x+8)+'" y="'+(b.y-6)+'" font-size="11" fill="#993C1D" font-weight="700">终点</text>';
  }
  svg.innerHTML='<g id="metroG">'+html+'</g>';
  applyMetroViewSvg();
}
function applyMetroViewSvg(){
  const g=$('metroG');if(!g)return;
  g.setAttribute('transform','translate('+metroVM2.tx+','+metroVM2.ty+') scale('+metroVM2.scale+')');
  const lb=$('metroLbG');
  if(lb){
    lb.setAttribute('font-size',(9/metroVM2.scale).toFixed(2));
    lb.setAttribute('stroke-width',(2.2/metroVM2.scale).toFixed(2));
  }
}
function metroFitViewSvg(){
  if(!METRO)return;
  const cont=$('metroCanvas2');if(!cont)return;
  const rect=cont.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  // 按站点实际包围盒适应，避免大片空白
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  METRO_S.forEach(s=>{if(s.x<x0)x0=s.x;if(s.x>x1)x1=s.x;if(s.y<y0)y0=s.y;if(s.y>y1)y1=s.y});
  const pad=Math.max((x1-x0),(y1-y0))*0.06+18;
  x0-=pad;y0-=pad;x1+=pad;y1+=pad;
  const w=x1-x0,h=y1-y0;
  metroVM2.scale=Math.min(rect.width/w, rect.height/h)*0.98;
  metroVM2.tx=(rect.width-w*metroVM2.scale)/2-x0*metroVM2.scale;
  metroVM2.ty=(rect.height-h*metroVM2.scale)/2-y0*metroVM2.scale;
  applyMetroViewSvg();
}
function metroZoomSvg(f){
  const cont=$('metroCanvas2');if(!cont)return;
  const rect=cont.getBoundingClientRect();
  const cx=rect.width/2,cy=rect.height/2;
  const ns=Math.max(0.5,Math.min(4,metroVM2.scale*f));
  const k=ns/metroVM2.scale;
  metroVM2.tx=cx-(cx-metroVM2.tx)*k;
  metroVM2.ty=cy-(cy-metroVM2.ty)*k;
  metroVM2.scale=ns;
  applyMetroViewSvg();
}
function metroZoom(f){
  const cont=$('metroCanvas');const rect=cont.getBoundingClientRect();
  const cx=rect.width/2,cy=rect.height/2;
  const ns=Math.max(0.5,Math.min(4,metroVM.scale*f));
  const k=ns/metroVM.scale;
  metroVM.tx=cx-(cx-metroVM.tx)*k;
  metroVM.ty=cy-(cy-metroVM.ty)*k;
  metroVM.scale=ns;
  applyMetroView();
}
function bindGestures(id,vm,applyFn){
  const el=$(id);if(!el)return;
  const pointers=[];let pinch=null;
  el.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch'&&!el.classList.contains('map-active'))return;el.setPointerCapture(e.pointerId);
    pointers.push({id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY});
    if(pointers.length===2){
      const [a,c]=pointers;
      pinch={d:Math.hypot(a.x-c.x,a.y-c.y),cx:(a.x+c.x)/2,cy:(a.y+c.y)/2};
    }
  });
  el.addEventListener('pointermove',e=>{
    const idx=pointers.findIndex(p=>p.id===e.pointerId);
    if(idx<0)return;
    const p=pointers[idx];p.x=e.clientX;p.y=e.clientY;
    if(pointers.length===1){
      vm.tx+=e.clientX-p.lx;
      vm.ty+=e.clientY-p.ly;
      p.lx=e.clientX;p.ly=e.clientY;
      applyFn();
    }else if(pointers.length===2 && pinch){
      const [a,c]=pointers;
      const d=Math.hypot(a.x-c.x,a.y-c.y);
      const cx=(a.x+c.x)/2,cy=(a.y+c.y)/2;
      const f=d/pinch.d;
      const ns=Math.max(0.5,Math.min(4,vm.scale*f));
      const k=ns/vm.scale;
      vm.tx=cx-(cx-vm.tx)*k;
      vm.ty=cy-(cy-vm.ty)*k;
      vm.scale=ns;
      pinch.d=d;pinch.cx=cx;pinch.cy=cy;
      applyFn();
    }
  });
  function end(e){
    const i=pointers.findIndex(p=>p.id===e.pointerId);if(i>=0)pointers.splice(i,1);
    if(pointers.length<2)pinch=null;
  }
  el.addEventListener('pointerup',end);
  el.addEventListener('pointercancel',end);
  el.addEventListener('wheel',e=>{
    if(!el.classList.contains('map-active'))return;e.preventDefault();
    const rect=el.getBoundingClientRect();
    const cx=e.clientX-rect.left,cy=e.clientY-rect.top;
    const f=e.deltaY>0?0.9:1.1;
    const ns=Math.max(0.5,Math.min(4,vm.scale*f));
    const k=ns/vm.scale;
    vm.tx=cx-(cx-vm.tx)*k;
    vm.ty=cy-(cy-vm.ty)*k;
    vm.scale=ns;
    applyFn();
  },{passive:false});
}
(function bindMetroGestures(){
  function attach(){
    bindGestures('metroCanvas',metroVM,applyMetroView);
    bindGestures('metroCanvas2',metroVM2,applyMetroViewSvg);
  }
  document.addEventListener('DOMContentLoaded',attach);
  if(document.readyState!=='loading')setTimeout(attach,0);
})();
function renderFit(){
  renderFitTypes();
  const today=ymd(),wk=[];
  for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*86400000);const ds=ymd(d);wk.push({d:ds,min:db.fits.filter(f=>f.date===ds).reduce((s,f)=>s+f.min,0),lb:(d.getMonth()+1)+'/'+d.getDate()})}
  $('fsWeek').textContent=wk.reduce((s,x)=>s+x.min,0);
  const m0=today.slice(0,7);
  $('fsCnt').textContent=db.fits.filter(f=>f.date.slice(0,7)===m0).length;
  let streak=0;for(let i=0;;i++){const ds=ymd(new Date(Date.now()-i*86400000));if(db.fits.some(f=>f.date===ds))streak++;else if(i>0)break;else break}
  $('fsStreak').textContent=streak;
  $('fsCoin').textContent=db.fits.reduce((s,f)=>s+f.min,0);
  const mx=Math.max(...wk.map(x=>x.min),1);
  $('fitWeek').innerHTML='<div class="section-title" style="margin:0 0 2px"><span>近7天锻炼（分钟）</span></div><div class="week-bar">'+wk.map(x=>'<div class="wb" style="height:'+Math.max(3,x.min/mx*70)+'px" title="'+x.min+'分钟"><b>'+(x.min||'')+'</b><i>'+x.lb+'</i></div>').join('')+'</div>';
  $('fitList').innerHTML=db.fits.length?db.fits.slice(0,20).map(f=>'<div class="item"><div class="body"><div class="txt">'+f.type+' · '+f.min+' 分钟'+(f.coins?'<span class="tag">+'+f.coins+'金币</span>':'')+'</div><div class="meta">'+f.date+(f.note?' · '+esc(f.note):'')+'</div></div><button class="btn warn sm" onclick="delFit(\''+f.id+'\')">删</button></div>').join(''):'<div class="empty"><div class="big">🏃</div>还没有打卡记录</div>';
}

/* 生日排盘采用北京时间 UTC+8；节气分月；不作真太阳时修正。 */
function toggleMap(btn){const active=!$('metroCanvas').classList.contains('map-active');['metroCanvas','metroCanvas2'].forEach(id=>$(id).classList.toggle('map-active',active));btn.textContent=active?'退出地图操作（恢复页面滚动）':'开启地图操作'}
function renderLiuri(){
 const birth=Solar.fromYmdHms(1999,7,9,0,59,0).getLunar().getEightChar();birth.setSect(2);
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date());
 const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
 const daily=Solar.fromYmdHms(+p.year,+p.month,+p.day,12,0,0).getLunar().getEightChar();
 const gan='甲乙丙丁戊己庚辛壬癸',zhi='子丑寅卯辰巳午未申酉戌亥';
 const dm=gan.indexOf(birth.getDayGan()),dg=gan.indexOf(daily.getDayGan());
 const element=['木','火','土','金','水'];const a=Math.floor(dm/2),b=Math.floor(dg/2),same=dm%2===dg%2;
 const delta=(b-a+5)%5;
 const ss=[same?'比肩':'劫财',same?'食神':'伤官',same?'偏财':'正财',same?'七杀':'正官',same?'偏印':'正印'][delta];
 const tips={比肩:'适合交流想法、整理协作分工。',劫财:'给消费和人情往来留出清晰边界。',食神:'为表达、创作和休息留一点时间。',伤官:'记录灵感，沟通时多确认对方的意思。',偏财:'整理机会与成本，先做事实核对。',正财:'适合整理账目、按计划完成手头事项。',七杀:'把复杂任务拆成小步，适当安排休息。',正官:'检查流程、约定和待办事项。',偏印:'适合学习、研究和独立思考。',正印:'复习已有知识，向可信的人请教。'};
 const pillars=[birth.getYear(),birth.getMonth(),birth.getDay(),birth.getTime()];
 const dz=daily.getDayZhi();const relations=[];
 const he={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
 pillars.forEach((v,i)=>{const bz=v[1];if((zhi.indexOf(dz)-zhi.indexOf(bz)+12)%12===6)relations.push(['年','月','日','时'][i]+'支 '+bz+' 与流日 '+dz+' 相冲');if(he[dz]===bz)relations.push(['年','月','日','时'][i]+'支 '+bz+' 与流日 '+dz+' 六合')});
 $('liuriCard').innerHTML='<div class="v-hd"><b>八字 · 每日干支</b><span>北京时间</span></div><p class="v-note">公历 1999-07-09 00:59 · 男 · 贵州黔南瓮安</p><div class="birth-grid">'+pillars.map((v,i)=>'<div><span>'+['年柱','月柱','日柱','时柱'][i]+'</span><b>'+v+'</b></div>').join('')+'</div><p>日主 <b>'+birth.getDayGan()+element[a]+'</b> · 今日 <b>'+daily.getDay()+'</b> · 流日天干十神 <b>'+ss+'</b></p><div class="v-box"><b class="vb-t">今日参考</b>'+tips[ss]+'</div><div class="v-box"><b class="vb-t">地支关系</b>'+(relations.join('<br>')||'今日流日支与四柱地支无六合或六冲。')+'</div><p class="v-note">采用北京时间 UTC+8、节气分月，日界按零点；出生地不用于真太阳时修正。仅展示传统历法关系与娱乐提示，不据此判断吉凶、健康或投资，也不沿用原版的身弱、喜忌结论。</p>';
}
const AI_URL='https://worutterfly-909d.hifteidiruofjeosud867.workers.dev/api/reading';
let aiToken='',aiBusy=false,aiResult=null;
function renderVirgo(){
 $('virgoCard').innerHTML='<div class="v-hd"><b>♋ 今日 AI 解读</b><span>巨蟹座 · 壬水日主</span></div><p class="v-note">根据你的四柱与今日干支生成，结果仅供娱乐。生成时会把排盘资料发送至 Cloudflare Workers AI。</p><div class="row" style="gap:8px;margin-top:12px"><button id="aiGenerate" class="btn" onclick="generateReading()" '+(aiBusy?'disabled':'')+'>'+(aiBusy?'正在生成…':'生成今日 AI 解读')+'</button><button class="btn ghost" onclick="aiSettings()">设置密钥</button></div><p id="aiStatus" class="v-note" role="status"></p><div id="aiText" style="white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.85;margin-top:12px"></div><p id="aiMeta" class="v-note"></p>';
 if(aiResult){$('aiText').textContent=aiResult.text;$('aiMeta').textContent='模型：'+aiResult.model+' · 生成于 '+new Date(aiResult.generatedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'})}
}
function aiSettings(){openSheet('<h3>AI 访问密钥</h3><p class="hint">输入 Cloudflare 中 APP_TOKEN 的值。仅保留在当前页面内存中，刷新后需重新输入，不会写入备份或 GitHub。</p><input class="tf" id="aiTokenInput" type="password" autocomplete="off" placeholder="至少32位访问密钥"><div class="row" style="gap:8px;margin-top:12px"><button class="btn" onclick="saveAIToken()">确认</button><button class="btn ghost" onclick="aiToken=\'\';closeSheet();toast(\'密钥已清除\')">清除密钥</button></div>')}
function saveAIToken(){const token=$('aiTokenInput').value.trim();if(token.length<32){toast('请输入至少32位的密钥');return}aiToken=token;$('aiTokenInput').value='';closeSheet();toast('密钥已设置')}
async function generateReading(){
 if(aiBusy)return;if(!aiToken){aiSettings();return}aiBusy=true;renderVirgo();$('aiStatus').textContent='正在请求 AI，请稍候…';
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),90000);
 try{
  const context=$('liuriCard').innerText+'\n太阳星座：巨蟹座。请给出今天的传统文化娱乐性解读。';
  const response=await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+aiToken},body:JSON.stringify({context}),signal:controller.signal});
  const data=await response.json();if(!response.ok)throw Error(data.error||'接口暂时不可用');if(typeof data.text!=='string'||!data.text.trim())throw Error('没有收到解读文本');
  aiResult=data;$('aiText').textContent=data.text;$('aiMeta').textContent='模型：'+data.model+' · 生成于 '+new Date(data.generatedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'});$('aiStatus').textContent='生成完成';
 }catch(e){$('aiStatus').textContent=e.name==='AbortError'?'请求超时，请稍后重试。':e instanceof TypeError?'连接失败，请检查网络或接口的跨域设置。':e.message}
 finally{clearTimeout(timer);aiBusy=false;$('aiGenerate').disabled=false;$('aiGenerate').textContent='生成今日 AI 解读'}
}
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>go(b.dataset.v)));
go('home');
setInterval(()=>{if(cur==='home')fetchWeather()},15*60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&cur==='home')renderHome()});
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
