/* FuzzyRescue JavaScript modulu 1 */
'use strict';const $=id=>document.getElementById(id),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));const tri=(x,a,b,c)=>Math.max(0,Math.min((x-a)/(b-a),(c-x)/(c-b)));const low=(x,a,b)=>clamp((b-x)/(b-a)),high=(x,a,b)=>clamp((x-a)/(b-a));const mf={b:[x=>low(x,20,50),x=>tri(x,25,50,75),x=>high(x,50,80)],o:[x=>low(x,15,45),x=>tri(x,20,50,80),x=>high(x,55,85)],c:[x=>low(x,20,50),x=>tri(x,25,50,75),x=>high(x,50,80)],s:[x=>low(x,10,40),x=>tri(x,20,50,80),x=>high(x,60,90)]};const names={b:['Kritik','Orta','Yüksek'],o:['Yakın','Orta','Uzak'],c:['Düşük','Orta','Yüksek'],s:['Yavaş','Orta','Hızlı']};const rules=[];for(let b=0;b<3;b++)for(let o=0;o<3;o++)for(let c=0;c<3;c++){let out=b===0||o===0?0:b===1||o===1?1:c===2?1:2;rules.push({b,o,c,out,id:rules.length+1})}function infer(b,o,c){let hs=[0,0,0],fires=[];for(const r of rules){const alpha=Math.min(mf.b[r.b](b),mf.o[r.o](o),mf.c[r.c](c));hs[r.out]=Math.max(hs[r.out],alpha);fires.push({...r,alpha})}let sum=0,moment=0,points=[];for(let z=0;z<=100;z+=.5){const mu=Math.max(...hs.map((h,i)=>Math.min(h,mf.s[i](z))));points.push([z,mu]);sum+=mu;moment+=z*mu}return{speed:sum?moment/sum:0,hs,points,fires:fires.sort((a,b)=>b.alpha-a.alpha)}}const state={running:false,t:0,x:115,y:475,view:'iso',grid:true,trail:true,heat:false,returning:false,history:[],trailPts:[],targets:[{x:320,y:170,found:false},{x:740,y:310,found:false},{x:875,y:115,found:false}],logs:[],result:null,frame:0};const vals=()=>Object.fromEntries(['b','o','c','w','a'].map(id=>[id,+$(id).value]));function log(msg){const time=new Date().toLocaleTimeString('tr-TR');state.logs.unshift(`[${time}] ${msg}`);state.logs=state.logs.slice(0,100);$('logs').innerHTML=state.logs.slice(0,28).map(s=>'<div>'+s+'</div>').join('')}function update(){const v=vals(),r=infer(v.b,v.o,v.c);state.result=r;for(const [id,unit] of [['b','%'],['o',' m'],['c','%'],['w',' km/sa'],['a',' m']])$('v'+id).textContent=v[id]+unit;$('mb').textContent=v.b+'%';$('mo').textContent=v.o+' m';$('mc').textContent=v.c+'%';$('ms').textContent=r.speed.toFixed(1);$('ma').textContent=v.a+' m';$('fuzzySpeed').textContent=r.speed.toFixed(2)+' / 100';$('activeRules').textContent=r.fires.filter(f=>f.alpha>0).length+' / 27';$('strongest').textContent='#'+r.fires[0].id+' (α='+r.fires[0].alpha.toFixed(2)+')';$('centroid').textContent=r.speed.toFixed(2)+' / 100';$('decision').textContent=v.b<=15?'KRİTİK ENERJİ':v.o<=12?'ENGEL UYARISI':r.speed<34?'YAVAŞLA / BEKLE':r.speed<64?'KONTROLLÜ İLERLE':'TARAMAYA DEVAM';$('warning').textContent=v.b<=15?'Düşük batarya: görev simülasyonu üsse dönüşe alınabilir.':v.o<=12?'Yakın engel: hız komutu düşürülüyor.':'Kontrol sistemi sentetik girdilerle hesap yapıyor.';$('fired').innerHTML=r.fires.filter(f=>f.alpha>0).slice(0,5).map(f=>`<div class="row" style="font-size:11px"><span>#${f.id} ${names.b[f.b]} / ${names.o[f.o]} / ${names.c[f.c]} → ${names.s[f.out]}</span><b>${f.alpha.toFixed(2)}</b></div><div class="bar"><i style="width:${f.alpha*100}%"></i></div>`).join('');$('ruleTable').innerHTML=r.fires.slice().sort((a,b)=>a.id-b.id).map(f=>`<tr class="${f.alpha>0?'fire':''}"><td>${f.id}</td><td>${names.b[f.b]}</td><td>${names.o[f.o]}</td><td>${names.c[f.c]}</td><td>${names.s[f.out]}</td><td>${f.alpha.toFixed(3)}</td></tr>`).join('');drawMembership('cb','b',v.b);drawMembership('co','o',v.o);drawMembership('cc','c',v.c);drawMembership('cs','s',r.speed);drawDefuzz();if($('surface').classList.contains('show'))drawSurface();renderTargets()}function plotSetup(canvas){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,p=30;ctx.clearRect(0,0,w,h);ctx.strokeStyle='#274157';ctx.lineWidth=1;for(let i=0;i<=4;i++){const y=p+(h-2*p)*i/4;ctx.beginPath();ctx.moveTo(p,y);ctx.lineTo(w-p,y);ctx.stroke()}ctx.fillStyle='#8ca9bd';ctx.font='12px Consolas';ctx.fillText('0',p,h-8);ctx.fillText('100',w-p-24,h-8);return{ctx,w,h,p}}function drawMembership(id,key,value){const {ctx,w,h,p}=plotSetup($(id)),cols=['#ffbb68','#4daaff','#4ce7bc'];mf[key].forEach((fn,i)=>{ctx.beginPath();ctx.strokeStyle=cols[i];ctx.lineWidth=2.5;for(let x=0;x<=100;x++){let px=p+x/100*(w-2*p),py=h-p-fn(x)*(h-2*p);x?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke()});ctx.strokeStyle='#fff';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(p+value/100*(w-2*p),p);ctx.lineTo(p+value/100*(w-2*p),h-p);ctx.stroke();ctx.setLineDash([])}function drawDefuzz(){const{ctx,w,h,p}=plotSetup($('defuzzCanvas')),r=state.result;ctx.beginPath();ctx.moveTo(p,h-p);for(const[z,mu]of r.points)ctx.lineTo(p+z/100*(w-2*p),h-p-mu*(h-2*p));ctx.lineTo(w-p,h-p);ctx.closePath();ctx.fillStyle='#3ee7b855';ctx.fill();ctx.strokeStyle='#49e8be';ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='#ffbc68';ctx.setLineDash([7,4]);const x=p+r.speed/100*(w-2*p);ctx.beginPath();ctx.moveTo(x,p);ctx.lineTo(x,h-p);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ffbc68';ctx.font='14px Consolas';ctx.fillText('Centroid '+r.speed.toFixed(2),Math.min(x+8,w-175),p+18)}function drawSurface(){const cv=$('surfaceCanvas'),ctx=cv.getContext('2d'),w=cv.width,h=cv.height,step=8,v=vals();ctx.clearRect(0,0,w,h);for(let i=0;i<=20;i++)for(let j=0;j<=20;j++){let s=infer(i*5,j*5,v.c).speed/100;ctx.fillStyle=`hsl(${195-s*145} 72% ${18+s*36}%)`;ctx.fillRect(i*w/21,(20-j)*h/21,w/21+1,h/21+1)}ctx.fillStyle='#fff';ctx.font='bold 13px Consolas';ctx.fillText('Batarya →',w-110,h-12);ctx.save();ctx.translate(14,130);ctx.rotate(-Math.PI/2);ctx.fillText('Engel →',0,0);ctx.restore()}function renderTargets(){let n=state.targets.filter(t=>t.found).length,total=state.targets.length;$('targetCount').textContent=total+' hedef';$('targets').innerHTML=state.targets.map((t,i)=>`<div class="target"><span>◉ HEDEF ${String(i+1).padStart(2,'0')} <span class="tiny">(${Math.round(t.x)}, ${Math.round(t.y)})</span></span><b style="color:${t.found?'#49e8be':'#ffbe67'}">${t.found?'TARANDI':'BEKLİYOR'}</b></div>`).join('');let pct=total?Math.round(100*n/total):100;$('progressText').textContent=pct+'%';$('progressBar').style.width=pct+'%'}const cv=$('scene'),cx=cv.getContext('2d');const buildings=[{x:180,y:150,w:110,h:105,z:64},{x:470,y:360,w:110,h:115,z:94},{x:610,y:105,w:130,h:125,z:70},{x:795,y:400,w:115,h:95,z:85},{x:295,y:335,w:100,h:100,z:52},{x:895,y:185,w:100,h:100,z:76}];function project(x,y,z=0){if(state.view==='top')return[x,y-z*.18];return[110+(x-550)*.92+(y-310)*.34+440,40+(y-310)*.67-(x-550)*.15+270-z*.8]}function line(a,b,color,width=1){cx.strokeStyle=color;cx.lineWidth=width;cx.beginPath();cx.moveTo(...a);cx.lineTo(...b);cx.stroke()}function poly(pts,color,stroke){cx.beginPath();cx.moveTo(...pts[0]);pts.slice(1).forEach(p=>cx.lineTo(...p));cx.closePath();cx.fillStyle=color;cx.fill();if(stroke){cx.strokeStyle=stroke;cx.stroke()}}function drawScene(){const w=cv.width,h=cv.height;cx.clearRect(0,0,w,h);let grad=cx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#0a2134');grad.addColorStop(1,'#07131f');cx.fillStyle=grad;cx.fillRect(0,0,w,h);if(state.grid){for(let x=0;x<=1100;x+=55)line(project(x,0),project(x,620),'#1c3c4d',.8);for(let y=0;y<=620;y+=55)line(project(0,y),project(1100,y),'#1c3c4d',.8)}if(state.heat){for(let i=0;i<5;i++){const t=state.targets[i%state.targets.length];if(!t)continue;const p=project(t.x,t.y);let g=cx.createRadialGradient(...p,5,...p,125);g.addColorStop(0,'#ffba6b55');g.addColorStop(1,'#ffba6b00');cx.fillStyle=g;cx.fillRect(p[0]-125,p[1]-125,250,250)}}for(const b of buildings){let p1=project(b.x,b.y),p2=project(b.x+b.w,b.y),p3=project(b.x+b.w,b.y+b.h),p4=project(b.x,b.y+b.h),q1=project(b.x,b.y,b.z),q2=project(b.x+b.w,b.y,b.z),q3=project(b.x+b.w,b.y+b.h,b.z),q4=project(b.x,b.y+b.h,b.z);poly([p2,p3,q3,q2],'#183a4c','#316176');poly([p3,p4,q4,q3],'#102b3c','#316176');poly([q1,q2,q3,q4],'#285266','#4a8295');for(let i=1;i<=3;i++){let a=project(b.x+b.w,b.y+b.h*i/4,b.z*.6),d=project(b.x+b.w,b.y+b.h*i/4,b.z*.3);line(a,d,'#4a8394',3)}}for(let i=0;i<state.targets.length;i++){let t=state.targets[i],p=project(t.x,t.y),pulse=15+Math.sin(state.frame*.07+i)*5;cx.beginPath();cx.arc(...p,pulse,0,Math.PI*2);cx.strokeStyle=t.found?'#4ce8bd':'#ffbc69';cx.lineWidth=2;cx.stroke();cx.fillStyle=t.found?'#4ce8bd':'#ffbc69';cx.beginPath();cx.arc(...p,4,0,Math.PI*2);cx.fill();cx.font='bold 12px Consolas';cx.fillText('T-'+(i+1)+(t.found?' ✓':''),p[0]+17,p[1]-12)}let base=project(115,475);cx.strokeStyle='#4daaff';cx.strokeRect(base[0]-22,base[1]-22,44,44);cx.fillStyle='#9bcaff';cx.fillText('BASE',base[0]-16,base[1]+35);if(state.trail&&state.trailPts.length>1){cx.strokeStyle='#4ce8bc88';cx.lineWidth=2;cx.beginPath();state.trailPts.forEach((q,i)=>{let p=project(q.x,q.y,vals().a);i?cx.lineTo(...p):cx.moveTo(...p)});cx.stroke()}const v=vals(),p=project(state.x,state.y,v.a),ground=project(state.x,state.y);line(ground,p,'#4ce8bc66',1);cx.save();cx.translate(...p);cx.rotate(state.frame*.012);cx.strokeStyle='#a8f9e9';cx.lineWidth=6;for(let a=0;a<4;a++){let ang=Math.PI*a/2;line([Math.cos(ang)*7,Math.sin(ang)*7],[Math.cos(ang)*24,Math.sin(ang)*24],'#67f0d2',6);cx.beginPath();cx.arc(Math.cos(ang)*29,Math.sin(ang)*29,12,0,Math.PI*2);cx.strokeStyle='#62bfff';cx.lineWidth=3;cx.stroke()}cx.fillStyle='#e7ffff';cx.fillRect(-11,-11,22,22);cx.restore();cx.fillStyle='#4ce8bc';cx.font='bold 14px Consolas';cx.fillText('UAV-01',p[0]-25,p[1]-45);cx.fillStyle='#a8c3d6';cx.font='12px Consolas';cx.fillText('SİMÜLASYON // GÖREV SAHASI',16,h-18);$('hud').innerHTML=`UAV-01 / TELEMETRİ<br>X: ${state.x.toFixed(1)} m &nbsp; Y: ${state.y.toFixed(1)} m<br>AGL: ${v.a} m &nbsp; WIND: ${v.w} km/sa<br>MODE: ${state.returning?'RETURN HOME':state.running?'AUTO SEARCH':'STANDBY'}<br>SPD: ${state.result.speed.toFixed(1)} / 100`}
function drawHistory(){const{ctx,w,h,p}=plotSetup($('history'));const cols=['#4ce8bc','#4daaff','#ffbe67'];for(let j=0;j<3;j++){ctx.beginPath();ctx.strokeStyle=cols[j];ctx.lineWidth=2;state.history.forEach((d,i)=>{const x=p+i/119*(w-2*p),y=h-p-d[j]/100*(h-2*p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()}}function step(dt){state.frame++;if(state.running){let v=vals(),mult=+$('speedFactor').value;state.t+=dt*mult;const nearest=state.returning?{x:115,y:475}:state.targets.find(t=>!t.found)||{x:115,y:475};const dx=nearest.x-state.x,dy=nearest.y-state.y,dist=Math.hypot(dx,dy);const s=state.result.speed/100*58*dt*mult;if(dist>3){state.x+=dx/dist*Math.min(dist,s);state.y+=dy/dist*Math.min(dist,s)}else if(!state.returning&&nearest!==undefined&&'found'in nearest){nearest.found=true;log('Hedef taraması tamamlandı: '+state.targets.indexOf(nearest).toString());renderTargets()}else if(state.returning){state.running=false;state.returning=false;log('İHA üs konumuna ulaştı')}if($('auto').checked){$('o').value=Math.round(clamp(52+35*Math.sin(state.t*.19)+12*Math.cos(state.t*.41),0,100));$('c').value=Math.round(clamp(65+25*Math.sin(state.t*.13+1),0,100))}if($('consume').checked&&state.frame%90===0){$('b').value=Math.max(0,+$('b').value-1)}if(+$('b').value<=10&&!state.returning){state.returning=true;log('Düşük batarya: otomatik üsse dönüş tetiklendi')}if(state.frame%8===0){update();state.trailPts.push({x:state.x,y:state.y});if(state.trailPts.length>250)state.trailPts.shift()}if(state.frame%25===0){state.history.push([state.result.speed,+$('b').value,+$('c').value]);if(state.history.length>120)state.history.shift();drawHistory()}$('mt').textContent=String(Math.floor(state.t/60)).padStart(2,'0')+':'+String(Math.floor(state.t%60)).padStart(2,'0')}drawScene()}let prev=performance.now();function loop(now){let dt=Math.min((now-prev)/1000,.08);prev=now;step(dt);requestAnimationFrame(loop)}function reset(){state.running=false;state.returning=false;state.t=0;state.x=115;state.y=475;state.trailPts=[];state.history=[];state.targets=[{x:320,y:170,found:false},{x:740,y:310,found:false},{x:875,y:115,found:false}];$('b').value=82;$('o').value=56;$('c').value=72;$('w').value=6;$('a').value=45;$('mt').textContent='00:00';$('status').textContent='● SİSTEM HAZIR';update();drawHistory();log('Simülasyon sıfırlandı')}['b','o','c','w','a'].forEach(id=>$(id).addEventListener('input',()=>{update();drawScene()}));$('start').onclick=()=>{state.running=true;$('status').textContent='● GÖREV AKTİF';log('Otonom tarama başlatıldı')};$('pause').onclick=()=>{state.running=false;$('status').textContent='● DURAKLATILDI';log('Görev duraklatıldı')};$('stop').onclick=()=>{state.running=false;state.returning=false;$('status').textContent='● GÖREV DURDURULDU';log('Görev manuel durduruldu')};$('reset').onclick=reset;$('home').onclick=()=>{state.returning=true;state.running=true;log('Üsse dönüş komutu verildi')};$('addTarget').onclick=()=>{state.targets.push({x:100+Math.random()*880,y:80+Math.random()*460,found:false});renderTargets();log('Sentetik hedef eklendi')};$('scene').addEventListener('click',e=>{const r=cv.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*cv.width,py=(e.clientY-r.top)/r.height*cv.height;let best=null,err=Infinity;for(let x=40;x<1050;x+=12)for(let y=35;y<590;y+=12){let p=project(x,y),d=(p[0]-px)**2+(p[1]-py)**2;if(d<err){err=d;best={x,y}}}state.targets.push({...best,found:false});renderTargets();log('Haritadan yeni hedef işaretlendi')});document.querySelectorAll('[data-view]').forEach(btn=>btn.onclick=()=>{state.view=btn.dataset.view;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===btn));drawScene()});$('gridToggle').onclick=()=>{state.grid=!state.grid;drawScene()};$('trailToggle').onclick=()=>{state.trail=!state.trail;drawScene()};$('heatToggle').onclick=()=>{state.heat=!state.heat;drawScene()};document.querySelectorAll('[data-tab]').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));document.querySelectorAll('.tabview').forEach(v=>v.classList.toggle('show',v.id===btn.dataset.tab));update()});const scenarios={normal:[82,56,72,6,45],critical:[9,75,68,9,35],obstacle:[78,5,88,5,45],target:[90,92,98,3,55],stress:[19,9,35,27,80]};document.querySelectorAll('[data-scenario]').forEach(btn=>btn.onclick=()=>{['b','o','c','w','a'].forEach((id,i)=>$(id).value=scenarios[btn.dataset.scenario][i]);$('auto').checked=false;update();log('Test senaryosu: '+btn.textContent)});$('save').onclick=()=>{localStorage.setItem('fuzzyrescue-v2',JSON.stringify({v:vals(),targets:state.targets}));log('Senaryo tarayıcıya kaydedildi')};$('load').onclick=()=>{try{const d=JSON.parse(localStorage.getItem('fuzzyrescue-v2'));if(!d)throw Error('Kayıt yok');for(const id of ['b','o','c','w','a'])$(id).value=d.v[id];state.targets=d.targets;update();log('Senaryo geri yüklendi')}catch(e){log('Yükleme başarısız: '+e.message)}};$('clearLogs').onclick=()=>{state.logs=[];$('logs').innerHTML=''};$('snapshot').onclick=()=>{const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download='FuzzyRescue-sahne.png';a.click();log('Sahne PNG olarak dışa aktarıldı')};$('export').onclick=()=>{const v=vals(),r=state.result;let rows=[['FuzzyRescue Mission Report','Academic Simulation'],['Timestamp',new Date().toISOString()],['Battery',v.b],['Obstacle_m',v.o],['Confidence_pct',v.c],['Wind_kmh',v.w],['Altitude_m',v.a],['Centroid_speed',r.speed.toFixed(3)],['Active_rules',r.fires.filter(f=>f.alpha>0).length],[],['Rule','Battery','Obstacle','Confidence','Output','Alpha'],...r.fires.slice().sort((a,b)=>a.id-b.id).map(f=>[f.id,names.b[f.b],names.o[f.o],names.c[f.c],names.s[f.out],f.alpha.toFixed(4)])];const csv='\ufeff'+rows.map(row=>row.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(';')).join('\r\n');const a=document.createElement('a'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.href=url;a.download='FuzzyRescue_gorev_raporu.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);log('CSV görev raporu dışa aktarıldı')};update();drawHistory();log('FuzzyRescue v2.0 kontrol çekirdeği başlatıldı');requestAnimationFrame(loop);
;

/* FuzzyRescue JavaScript modulu 2 */
(()=>{'use strict';
const E=id=>document.getElementById(id),can=E('pro3d'),ctx=can.getContext('2d');if(!ctx)return;
const W=1000,H=600,cell=20,nx=50,ny=30,base={x:80,y:480};
const obstacles=[{x:180,y:150,w:110,h:105,z:75},{x:470,y:360,w:110,h:115,z:105},{x:610,y:105,w:130,h:125,z:85},{x:795,y:400,w:115,h:95,z:98},{x:295,y:335,w:100,h:100,z:65},{x:895,y:185,w:100,h:100,z:80}];
const targets=[{x:320,y:170},{x:740,y:310},{x:875,y:115}];
const colors=['#f6a8df','#ba86f4','#ffcfaa'];let fleet=[],running=false,clock=0,last=performance.now(),angle=-.73,tilt=.78,zoom=1,drag=null,violations=0;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function blocked(ix,iy){if(ix<1||iy<1||ix>=nx-1||iy>=ny-1)return true;let x=ix*cell+cell/2,y=iy*cell+cell/2;return obstacles.some(b=>x>=b.x-18&&x<=b.x+b.w+18&&y>=b.y-18&&y<=b.y+b.h+18)}
function astar(from,to){let sx=clamp(Math.round(from.x/cell),1,nx-2),sy=clamp(Math.round(from.y/cell),1,ny-2),tx=clamp(Math.round(to.x/cell),1,nx-2),ty=clamp(Math.round(to.y/cell),1,ny-2);let key=(x,y)=>x+','+y, start=key(sx,sy),goal=key(tx,ty);let open=[{x:sx,y:sy,f:0}],came=new Map(),g=new Map([[start,0]]),closed=new Set();let loops=0;while(open.length&&loops++<6000){open.sort((a,b)=>a.f-b.f);let cur=open.shift(),ck=key(cur.x,cur.y);if(closed.has(ck))continue;if(ck===goal){let path=[{x:tx*cell,y:ty*cell}],k=ck;while(came.has(k)){k=came.get(k);let [x,y]=k.split(',').map(Number);path.push({x:x*cell,y:y*cell})}return path.reverse()}closed.add(ck);for(let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){let x=cur.x+dx,y=cur.y+dy,nk=key(x,y);if(blocked(x,y)||closed.has(nk))continue;if(dx&&dy&&(blocked(cur.x+dx,cur.y)||blocked(cur.x,cur.y+dy)))continue;let ng=g.get(ck)+Math.hypot(dx,dy);if(ng<(g.get(nk)??Infinity)){came.set(nk,ck);g.set(nk,ng);open.push({x,y,f:ng+Math.hypot(tx-x,ty-y)})}}}return []}
function plan(){let mode=E('proMode').value;fleet=[0,1,2].map((i)=>{let dest=mode==='return'?base:targets[mode==='priority'?(2-i):i],start={x:base.x+i*20,y:base.y+i*20},path=astar(start,dest);return{id:i+1,x:start.x,y:start.y,z:45+i*9,battery:92-i*8,path,index:0,done:false,dist:0,dest}});clock=0;violations=0;running=false;update();draw()}
function projection(x,y,z=0){let xx=(x-W/2)/1.3,yy=(y-H/2)/1.3;let a=xx*Math.cos(angle)-yy*Math.sin(angle),b=xx*Math.sin(angle)+yy*Math.cos(angle);return[can.width/2+a*zoom,can.height*.58+(b*Math.sin(tilt)-z*Math.cos(tilt)*1.5)*zoom]}
function line(a,b,color,width=1){ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function polygon(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}
function label(text,p,color='#c7e8f6'){ctx.fillStyle=color;ctx.font='bold 15px Consolas,monospace';ctx.fillText(text,p[0]+12,p[1]-12)}
function draw(){let g=ctx.createLinearGradient(0,0,0,can.height);g.addColorStop(0,'#35133f');g.addColorStop(1,'#1b0b29');ctx.fillStyle=g;ctx.fillRect(0,0,can.width,can.height);
for(let x=0;x<=W;x+=50)line(projection(x,0),projection(x,H),'#56315f',1);for(let y=0;y<=H;y+=50)line(projection(0,y),projection(W,y),'#56315f',1);
for(let b of obstacles){let a=projection(b.x,b.y),c=projection(b.x+b.w,b.y),d=projection(b.x+b.w,b.y+b.h),e=projection(b.x,b.y+b.h),A=projection(b.x,b.y,b.z),C=projection(b.x+b.w,b.y,b.z),D=projection(b.x+b.w,b.y+b.h,b.z),F=projection(b.x,b.y+b.h,b.z);polygon([c,d,D,C],'#51245d','#39657b');polygon([d,e,F,D],'#3e1b4c','#39657b');polygon([A,C,D,F],'#75417d','#c48dc5');for(let j=1;j<4;j++)line(projection(b.x+b.w,b.y+b.h*j/4,b.z*.35),projection(b.x+b.w,b.y+b.h*j/4,b.z*.65),'#d9a4d5',3)}
let bp=projection(base.x,base.y);ctx.strokeStyle='#c58af0';ctx.strokeRect(bp[0]-15,bp[1]-15,30,30);label('BASE',bp,'#8bd9ff');targets.forEach((t,i)=>{let p=projection(t.x,t.y),r=13+Math.sin(clock*3+i)*4;ctx.beginPath();ctx.arc(...p,r,0,Math.PI*2);ctx.strokeStyle='#ffb2d9';ctx.lineWidth=2;ctx.stroke();label('TARGET-'+(i+1),p,'#ffd0e8')});
for(let f of fleet){if(f.path.length>1){ctx.beginPath();f.path.forEach((q,i)=>{let p=projection(q.x,q.y,5);i?ctx.lineTo(...p):ctx.moveTo(...p)});ctx.strokeStyle=colors[f.id-1]+'aa';ctx.lineWidth=2.5;ctx.stroke()}let p=projection(f.x,f.y,f.z),ground=projection(f.x,f.y);line(ground,p,colors[f.id-1]+'88');ctx.save();ctx.translate(...p);ctx.strokeStyle=colors[f.id-1];ctx.lineWidth=5;for(let i=0;i<4;i++){let a=i*Math.PI/2+clock*2;line([0,0],[Math.cos(a)*24,Math.sin(a)*24],colors[f.id-1],4);ctx.beginPath();ctx.arc(Math.cos(a)*27,Math.sin(a)*27,10,0,Math.PI*2);ctx.stroke()}ctx.fillStyle='#dffeff';ctx.fillRect(-8,-8,16,16);ctx.restore();label('UAV-0'+f.id,p,colors[f.id-1])}
ctx.fillStyle='#c79dd5';ctx.font='13px Consolas';ctx.fillText('ACADEMIC SIMULATION  •  SYNTHETIC TERRAIN  •  NOT FOR REAL FLIGHT',16,can.height-18)}
function update(){let done=fleet.filter(f=>f.done).length;E('proFleet').innerHTML=fleet.map(f=>`<div class="droneitem"><span style="color:${colors[f.id-1]}">● UAV-0${f.id}</span><span>${f.done?'HEDEFTE':f.path.length?'ROTA AKTİF':'ROTA YOK'} · ${f.battery.toFixed(0)}%</span></div>`).join('');E('proCoverage').textContent=Math.round(done/3*100)+'%';E('proDistance').textContent=fleet.reduce((a,f)=>a+f.dist,0).toFixed(0)+' m';E('proCollision').textContent=violations;E('proTime').textContent=String(Math.floor(clock/60)).padStart(2,'0')+':'+String(Math.floor(clock%60)).padStart(2,'0');E('proFound').textContent=done+' / 3';E('proHud').innerHTML='3D VIEW / ORBIT CAMERA<br>FLEET: '+(running?'ACTIVE':'STANDBY')+'<br>PATHFINDING: A* / 20m GRID<br>CAMERA: '+Math.round(angle*180/Math.PI)+'° / '+Math.round(tilt*180/Math.PI)+'°'}
function tick(now){let dt=Math.min((now-last)/1000,.07);last=now;if(running){let rate=+E('proRate').value;clock+=dt*rate;for(let f of fleet){if(f.done||!f.path.length)continue;let target=f.path[f.index];if(!target){f.done=true;continue}let dx=target.x-f.x,dy=target.y-f.y,dist=Math.hypot(dx,dy),speed=(10+((typeof state!=='undefined'&&state.result)?state.result.speed:50)*.3)*dt*rate;if(dist<=speed){f.x=target.x;f.y=target.y;f.index++;if(f.index>=f.path.length)f.done=true}else{f.x+=dx/dist*speed;f.y+=dy/dist*speed}f.dist+=Math.min(dist,speed);f.battery=clamp(f.battery-dt*rate*.035,0,100);if(blocked(Math.round(f.x/cell),Math.round(f.y/cell)))violations++}if(fleet.every(f=>f.done))running=false}update();draw();requestAnimationFrame(tick)}
can.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};can.setPointerCapture(e.pointerId)});can.addEventListener('pointermove',e=>{if(!drag)return;angle+=(e.clientX-drag.x)*.008;tilt=clamp(tilt+(e.clientY-drag.y)*.005,.22,1.42);drag={x:e.clientX,y:e.clientY}});can.addEventListener('pointerup',()=>drag=null);can.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom*(e.deltaY>0?.9:1.1),.5,2.2)},{passive:false});E('proStart').onclick=()=>{if(fleet.every(f=>f.done))plan();running=true};E('proPause').onclick=()=>running=false;E('proReset').onclick=plan;E('proMode').onchange=plan;E('proCam').onclick=()=>{angle=-.73;tilt=.78;zoom=1};
function download(name,txt){let blob=new Blob(['\ufeff'+txt],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
E('proExport').onclick=()=>download('FuzzyRescue_filo.csv','Drone;Batarya;Mesafe_m;Durum\r\n'+fleet.map(f=>[f.id,f.battery.toFixed(2),f.dist.toFixed(2),f.done?'tamamlandi':'devam'].join(';')).join('\r\n'));
E('runBench').onclick=()=>{let rows=[],sum=0,diff=0;for(let i=0;i<100;i++){let b=(i*37+13)%101,o=(i*61+7)%101,c=(i*29+31)%101;let result=infer(b,o,c).speed,baseline=b<20||o<15?15:c>75?35:65;sum+=result;diff+=result-baseline;if(i<12)rows.push(`<tr><td>${i+1}</td><td>${b}%</td><td>${o} m</td><td>${c}%</td><td>${result.toFixed(1)}</td><td>${baseline}</td></tr>`)}E('benchCount').textContent='100';E('benchFuzzy').textContent=(sum/100).toFixed(1);E('benchDelta').textContent=(diff/100>0?'+':'')+(diff/100).toFixed(1);E('benchRows').innerHTML=rows.join('')};
plan();requestAnimationFrame(tick);
})();
;

/* FuzzyRescue JavaScript modulu 3 */
(function(){
'use strict';
const $=id=>document.getElementById(id), ids=['mlB','mlO','mlC','mlNoise','mlRate'];
const low=(x,a,b)=>x<=a?1:x>=b?0:(b-x)/(b-a);
const high=(x,a,b)=>x<=a?0:x>=b?1:(x-a)/(b-a);
const tri=(x,a,b,c)=>Math.max(0,Math.min((x-a)/(b-a),(c-x)/(c-b)));
const mu=(x,type)=>type===0?low(x,20,50):type===1?tri(x,25,50,75):high(x,50,80);
const outmu=(z,k)=>k===0?low(z,10,40):k===1?tri(z,20,50,80):high(z,60,90);
function infer(b,o,c){
 const activation=[0,0,0],fires=[];
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++){
  const a=Math.min(mu(b,i),mu(o,j),mu(c,k));
  const cls=(i===0||j===0)?0:(i===1||j===1||k===2)?1:2;
  activation[cls]=Math.max(activation[cls],a);
  if(a>0)fires.push({name:['Kritik','Orta','Yüksek'][i]+' / '+['Yakın','Orta','Uzak'][j]+' / '+['Düşük','Orta','Yüksek'][k],cls,a});
 }
 const membership=z=>Math.max(...activation.map((a,k)=>Math.min(a,outmu(z,k))));
 let n=0,d=0;for(let z=0;z<=100;z+=.5){let a=membership(z);n+=z*a;d+=a}
 return {speed:d?n/d:0,activation,fires:fires.sort((a,b)=>b.a-a.a),membership};
}
const baseline=(b,o,c)=>b<20||o<15?15:c>75?35:65;
let rows=[],timer=null,t=0,seed=7421;
function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function log(msg){let p=document.createElement('p');p.innerHTML='<time>T+'+String(t).padStart(3,'0')+'</time>'+msg;$('mlLog').prepend(p);while($('mlLog').children.length>45)$('mlLog').lastChild.remove()}
function chart(id,series,colors,ymax=100){
 const can=$(id),ctx=can.getContext('2d'),w=can.width,h=can.height;
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#1b0b29';ctx.fillRect(0,0,w,h);
 for(let k=0;k<=5;k++){let y=25+(h-50)*k/5;ctx.strokeStyle='#60386b';ctx.beginPath();ctx.moveTo(48,y);ctx.lineTo(w-18,y);ctx.stroke();ctx.fillStyle='#b992c6';ctx.font='15px Segoe UI';ctx.fillText(String(Math.round(ymax*(5-k)/5)),9,y+5)}
 series.forEach((values,s)=>{if(values.length<2)return;ctx.beginPath();values.forEach((v,i)=>{let x=48+(w-70)*i/(Math.max(1,values.length-1)),y=h-25-(h-50)*Math.max(0,Math.min(ymax,v))/ymax;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=colors[s];ctx.lineWidth=3;ctx.stroke()});
}
function drawOutput(r){
 const c=$('mlOutput'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#1b0b29';ctx.fillRect(0,0,w,h);
 const X=z=>45+(w-65)*z/100,Y=m=>h-30-(h-60)*m;
 for(let i=0;i<=4;i++){ctx.strokeStyle='#60386b';ctx.beginPath();ctx.moveTo(45,Y(i/4));ctx.lineTo(w-20,Y(i/4));ctx.stroke()}
 ctx.beginPath();ctx.moveTo(X(0),Y(0));for(let z=0;z<=100;z+=.5)ctx.lineTo(X(z),Y(r.membership(z)));ctx.lineTo(X(100),Y(0));ctx.closePath();ctx.fillStyle='#b875c27a';ctx.fill();ctx.strokeStyle='#f4a5dd';ctx.lineWidth=3;ctx.stroke();
 ctx.beginPath();ctx.moveTo(X(r.speed),h-30);ctx.lineTo(X(r.speed),22);ctx.strokeStyle='#ffd4a0';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#ffe4f4';ctx.font='bold 17px Segoe UI';ctx.fillText('Centroid '+r.speed.toFixed(2),Math.min(w-190,X(r.speed)+9),23);
}
function redraw(){
 const last=rows[rows.length-1],b=last?last.b:+$('mlB').value,o=last?last.o:+$('mlO').value,c=last?last.c:+$('mlC').value;
 const r=infer(b,o,c),base=baseline(b,o,c);
 $('mlSpeed').textContent=r.speed.toFixed(1);$('mlBase').textContent=base;$('mlDiff').textContent=(r.speed-base>=0?'+':'')+(r.speed-base).toFixed(1);$('mlCount').textContent=rows.length;
 $('mlRules').innerHTML=r.fires.slice(0,5).map((f,i)=>'<div class="ml-rule"><span>'+(i+1)+'. '+f.name+' → '+['YAVAŞ','ORTA','HIZLI'][f.cls]+'</span><b>α='+f.a.toFixed(3)+'</b></div>').join('')||'<div class="ml-rule">Aktif kural yok</div>';
 chart('mlHistory',[rows.slice(-90).map(r=>r.speed),rows.slice(-90).map(r=>r.base)],['#f7a5df','#ffd29b']);drawOutput(r);
}
function step(){
 t++;let n=+$('mlNoise').value,noise=()=>((rand()*2)-1)*n;
 const b=Math.max(0,Math.min(100,+$('mlB').value+noise())),o=Math.max(0,Math.min(100,+$('mlO').value+noise())),c=Math.max(0,Math.min(100,+$('mlC').value+noise()));
 const r=infer(b,o,c),base=baseline(b,o,c);rows.push({t,b:+b.toFixed(2),o:+o.toFixed(2),c:+c.toFixed(2),speed:+r.speed.toFixed(3),base,delta:+(r.speed-base).toFixed(3)});
 if(rows.length>2000)rows.shift();if(t===1||t%10===0)log('Ölçüm kaydedildi · hız '+r.speed.toFixed(1)+' · engel '+o.toFixed(1)+' m');redraw();
}
function stop(){if(timer){clearInterval(timer);timer=null;$('mlRun').textContent='▶ Simülasyonu başlat';log('Simülasyon durduruldu')}}
function start(){if(timer){stop();return}timer=setInterval(step,Math.max(100,1000/(+$('mlRate').value)));$('mlRun').textContent='Ⅱ Duraklat';log('Canlı ölçüm başladı')}
const presets={normal:[78,58,68,4],battery:[12,60,75,3],obstacle:[84,8,60,2],target:[85,70,96,4],storm:[35,17,48,17]};
document.querySelectorAll('[data-ml]').forEach(b=>b.addEventListener('click',()=>{let v=presets[b.dataset.ml];['mlB','mlO','mlC','mlNoise'].forEach((id,i)=>$(id).value=v[i]);sync();log('Senaryo: '+b.textContent);}));
function sync(){ids.forEach((id,i)=>$(id+'v').textContent=$(id).value+['%',' m','%','','×'][i]);if(!rows.length)redraw()}
ids.forEach(id=>$(id).addEventListener('input',()=>{sync();if(id==='mlRate'&&timer){stop();start()}}));
$('mlRun').onclick=start;$('mlStop').onclick=stop;$('mlStep').onclick=step;
$('mlReset').onclick=()=>{stop();rows=[];t=0;seed=7421;$('mlLog').innerHTML='';log('Sıfırlandı · sabit rastgelelik tohumu 7421');redraw()};
function download(name,data,type){let blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
$('mlCsv').onclick=()=>download('FuzzyRescue_deney.csv','t;batarya;engel_m;hedef_guveni;fuzzy_hiz;sabit_hiz;fark\n'+rows.map(r=>Object.values(r).join(';')).join('\n'),'text/csv;charset=utf-8');
$('mlJson').onclick=()=>download('FuzzyRescue_deney.json',JSON.stringify({project:'FuzzyRescue',version:'6.0',mode:'synthetic',seed:7421,records:rows},null,2),'application/json');
$('mlSweep').onclick=()=>{let a=[0,20,50,80,100],o=[0,15,45,75,100],c=[0,25,50,75,100],all=[];for(let b of a)for(let d of o)for(let v of c)all.push({b,o:d,c:v,s:infer(b,d,v).speed,ref:baseline(b,d,v)});let avg=all.reduce((s,r)=>s+r.s,0)/all.length,mae=all.reduce((s,r)=>s+Math.abs(r.s-r.ref),0)/all.length;$('mlSweepResult').textContent='125 deterministik koşul tamamlandı · Ortalama bulanık hız: '+avg.toFixed(2)+' · Ortalama mutlak kontrol farkı: '+mae.toFixed(2)+' (üstünlük göstergesi değildir).';log('125 koşullu tarama tamamlandı');download('FuzzyRescue_125_kosul.csv','batarya;engel;guven;fuzzy;sabit\n'+all.map(r=>[r.b,r.o,r.c,r.s.toFixed(3),r.ref].join(';')).join('\n'),'text/csv;charset=utf-8')};
log('Mission Intelligence Lab hazır · sentetik veri');sync();
})();
;

/* FuzzyRescue JavaScript modulu 4 */
(()=>{
'use strict';
const el=id=>document.getElementById(id),can=el('aoMap'),ctx=can.getContext('2d'),W=24,H=16,C=33,ox=54,oy=1;
let seed=92741,grid=[],targets=[],drones=[],routes=[],playing=false,frame=0,raf=0,unreachable=0,visited=new Set(),eventCount=0,phase="plan";
const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
const key=(x,y)=>x+','+y,inside=(x,y)=>x>=0&&x<W&&y>=0&&y<H;
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function generate(){
 playing=false;cancelAnimationFrame(raf);frame=0;visited.clear();eventCount=0;phase="plan";el("aoEvents").innerHTML="";seed=(seed+9973)>>>0;
 grid=Array.from({length:H},()=>Array(W).fill(0));
 for(let i=0;i<14;i++){let x=2+Math.floor(rng()*(W-5)),y=1+Math.floor(rng()*(H-3)),w=1+Math.floor(rng()*3),h=1+Math.floor(rng()*3);for(let j=y;j<Math.min(H-1,y+h);j++)for(let k=x;k<Math.min(W-1,x+w);k++)grid[j][k]=1}
 drones=[{x:1,y:2,color:'#f4a2e2',id:'FR-01'},{x:1,y:8,color:'#b78bf5',id:'FR-02'},{x:1,y:13,color:'#ffd49b',id:'FR-03'}].map(d=>({...d,origin:{x:d.x,y:d.y},route:[],progress:0,target:-1}));
 targets=[];for(let i=0;i<5;i++){let p;let n=0;do{p={x:6+Math.floor(rng()*17),y:1+Math.floor(rng()*14),id:i}}while((grid[p.y][p.x]||targets.some(t=>dist(t,p)<3))&&++n<200);grid[p.y][p.x]=0;targets.push(p)}
 routes=[];unreachable=0;assign();draw();thermal();
}
function path(a,b){
 let open=[{x:a.x,y:a.y,g:0,f:dist(a,b)}],best=new Map([[key(a.x,a.y),0]]),prev=new Map();
 while(open.length){
 open.sort((u,v)=>u.f-v.f);let cur=open.shift(),ck=key(cur.x,cur.y);
 if(cur.g!==best.get(ck))continue;
 if(cur.x===b.x&&cur.y===b.y){let arr=[{x:cur.x,y:cur.y}];while(prev.has(ck)){let p=prev.get(ck);arr.push({x:p.x,y:p.y});ck=key(p.x,p.y)}return arr.reverse()}
 for(let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let x=cur.x+dx,y=cur.y+dy;if(!inside(x,y)||grid[y][x])continue;let g=cur.g+1,k=key(x,y);if(g<(best.get(k)??Infinity)){best.set(k,g);prev.set(k,{x:cur.x,y:cur.y});open.push({x,y,g,f:g+Math.abs(x-b.x)+Math.abs(y-b.y)})}}
 }return null;
}
function assign(){
 playing=false;cancelAnimationFrame(raf);frame=0;routes=[];unreachable=0;visited.clear();phase="plan";eventCount=0;el("aoEvents").innerHTML="";
 drones.forEach(d=>{d.route=[{...d.origin}];d.progress=0;d.target=-1});
 let available=targets.map((t,i)=>({...t,i})),current=drones.map(d=>({...d.origin}));
 while(available.length){let options=[];
 for(let i=0;i<drones.length;i++)for(let j=0;j<available.length;j++){let p=path(current[i],available[j]);if(p)options.push({i,j,p})}
 if(!options.length){unreachable=available.length;break}
 options.sort((a,b)=>a.p.length-b.p.length);let {i,j,p}=options[0],t=available.splice(j,1)[0];
 drones[i].route.push(...p.slice(1));current[i]={x:t.x,y:t.y};drones[i].target=t.i;routes.push({drone:drones[i].id,target:t.i+1,length:p.length-1});
 }
 el('aoCoverage').textContent=Math.round((targets.length-unreachable)/targets.length*100)+'%';
 el('aoDistance').textContent=routes.reduce((s,r)=>s+r.length,0);
 el('aoConflicts').textContent=unreachable;
 fleet();draw();updateMission();recordEvent("Görev rotaları hesaplandı · "+routes.length+" rota parçası", "plan");el('aoStatus').textContent='Görev ataması tamamlandı. '+routes.length+' rota parçası, '+unreachable+' erişilemeyen hedef. Bu metrikler planlanan rota içindir; gerçek görev başarısı değildir.';
}
function draw(){
 const w=can.width,h=can.height;
 const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#12071e');bg.addColorStop(.55,'#30113c');bg.addColorStop(1,'#1b0b29');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // Atmospheric terrain, contour paths and operational grid
 ctx.save();ctx.globalAlpha=.12;
 for(let k=0;k<8;k++){ctx.beginPath();for(let x=0;x<w;x+=8){let y=55+k*67+Math.sin(x*.012+k*.8)*17+Math.cos(x*.027+k)*8;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=k%2?'#e99bdc':'#a97ade';ctx.lineWidth=1.3;ctx.stroke()}
 ctx.restore();
 const gx=x=>ox+x*C,gy=y=>oy+y*C;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   let px=gx(x),py=gy(y),blocked=grid[y][x];
   ctx.fillStyle=blocked?'#5b305b':'#291534';ctx.globalAlpha=blocked?.95:.45;ctx.fillRect(px+1,py+1,C-2,C-2);ctx.globalAlpha=1;
   ctx.strokeStyle='#b778bd18';ctx.strokeRect(px+.5,py+.5,C,C);
   if(blocked){
     ctx.fillStyle='#6e446d';ctx.fillRect(px+5,py+5,C-10,C-10);
     ctx.fillStyle='#9c6998';ctx.fillRect(px+5,py+5,C-10,5);
     ctx.fillStyle='#2c1b38';ctx.fillRect(px+8,py+13,C-16,3);
     ctx.strokeStyle='#e7a4cf55';ctx.beginPath();ctx.moveTo(px+6,py+7);ctx.lineTo(px+C-6,py+C-7);ctx.stroke();
   }
 }
 // Survey perimeter
 ctx.strokeStyle='#dc8ac17c';ctx.lineWidth=2;ctx.setLineDash([7,7]);ctx.strokeRect(ox-4,oy-1,W*C+8,H*C+2);ctx.setLineDash([]);
 // Route paths with animated progress markers
 drones.forEach(d=>{
  if(d.route.length<2)return;
  ctx.beginPath();d.route.forEach((p,i)=>{let x=gx(p.x+.5),y=gy(p.y+.5);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
  ctx.strokeStyle=d.color+'25';ctx.lineWidth=12;ctx.stroke();
  ctx.strokeStyle=d.color;ctx.lineWidth=2.5;ctx.setLineDash([8,6]);ctx.lineDashOffset=-frame*.65;ctx.stroke();ctx.setLineDash([]);
 });
 // Targets and sonar rings
 targets.forEach(t=>{
  let x=gx(t.x+.5),y=gy(t.y+.5),r=12+(frame%45)/5;
  if(visited.has(t.id)){ctx.beginPath();ctx.arc(x,y,19,0,Math.PI*2);ctx.fillStyle="#6ed6b03b";ctx.fill();}
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle='#ffbfaa55';ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.fillStyle='#ffb6a3';ctx.shadowColor='#ffadbd';ctx.shadowBlur=18;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#301025';ctx.font='bold 12px Segoe UI';ctx.textAlign='center';ctx.fillText(visited.has(t.id)?"✓":t.id+1,x,y+4);ctx.textAlign='left';
 });
 // Individually designed aircraft: scout, rescue and heavy-lift
 drones.forEach((d,idx)=>{
  let p=d.route[Math.min(d.progress,d.route.length-1)]||d.origin,x=gx(p.x+.5),y=gy(p.y+.5);
  let pulse=1+.08*Math.sin(frame*.17+idx*2);
  ctx.save();ctx.translate(x,y);ctx.scale(pulse,pulse);
  // illuminated sensor / flight envelope
  ctx.beginPath();ctx.arc(0,0,24+Math.sin(frame*.08)*2,0,Math.PI*2);ctx.strokeStyle=d.color+'66';ctx.lineWidth=1.5;ctx.setLineDash([4,5]);ctx.stroke();ctx.setLineDash([]);
  ctx.shadowColor=d.color;ctx.shadowBlur=16;
  if(idx===0){ // compact reconnaissance quad
   ctx.strokeStyle='#1b1026';ctx.lineWidth=8;ctx.lineCap='round';
   for(let a of [-1,1]){ctx.beginPath();ctx.moveTo(-16,a*15);ctx.lineTo(16,-a*15);ctx.stroke()}
   ctx.strokeStyle=d.color;ctx.lineWidth=4;
   for(let a of [-1,1]){ctx.beginPath();ctx.moveTo(-16,a*15);ctx.lineTo(16,-a*15);ctx.stroke()}
   [[-17,-16],[17,-16],[-17,16],[17,16]].forEach(([rx,ry])=>{ctx.beginPath();ctx.arc(rx,ry,8,0,Math.PI*2);ctx.fillStyle='#1a0b24';ctx.fill();ctx.strokeStyle=d.color;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.ellipse(rx,ry,11,3,frame*.12,0,Math.PI*2);ctx.strokeStyle='#fff0f5';ctx.lineWidth=1;ctx.stroke()});
   ctx.fillStyle='#f6e8f6';ctx.beginPath();ctx.roundRect(-10,-14,20,28,7);ctx.fill();ctx.fillStyle=d.color;ctx.fillRect(-4,-10,8,9);
  }else if(idx===1){ // rescue quad with thermal payload
   ctx.strokeStyle='#e7d4f1';ctx.lineWidth=6;ctx.lineCap='round';
   ctx.beginPath();ctx.moveTo(-22,-15);ctx.lineTo(22,15);ctx.moveTo(22,-15);ctx.lineTo(-22,15);ctx.stroke();
   [[-22,-15],[22,-15],[-22,15],[22,15]].forEach(([rx,ry])=>{ctx.fillStyle='#261134';ctx.beginPath();ctx.arc(rx,ry,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle=d.color;ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.ellipse(rx,ry,13,4,frame*.13,0,Math.PI*2);ctx.strokeStyle='#f5bdf0';ctx.lineWidth=1;ctx.stroke()});
   ctx.fillStyle='#f3d8f6';ctx.beginPath();ctx.roundRect(-12,-16,24,32,8);ctx.fill();ctx.fillStyle='#704b90';ctx.fillRect(-8,-9,16,15);
   ctx.fillStyle='#ffcc9d';ctx.beginPath();ctx.arc(0,18,5,0,Math.PI*2);ctx.fill();
  }else{ // heavy lift hexacopter with cargo module
   for(let k=0;k<6;k++){let a=k*Math.PI/3,rx=Math.cos(a)*25,ry=Math.sin(a)*23;
    ctx.strokeStyle='#e7c4d8';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(rx,ry);ctx.stroke();
    ctx.fillStyle='#26162b';ctx.beginPath();ctx.arc(rx,ry,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle=d.color;ctx.lineWidth=2.5;ctx.stroke();
    ctx.beginPath();ctx.ellipse(rx,ry,11,3,frame*.12+k,0,Math.PI*2);ctx.strokeStyle='#fff0e6';ctx.lineWidth=1;ctx.stroke();
   }
   ctx.fillStyle='#f6e5dd';ctx.beginPath();ctx.roundRect(-12,-11,24,22,7);ctx.fill();ctx.fillStyle='#ad7691';ctx.fillRect(-7,-5,14,10);
   ctx.fillStyle='#ffcc9b';ctx.fillRect(-8,12,16,8);ctx.strokeStyle='#ffe4b7';ctx.strokeRect(-8,12,16,8);
  }
  ctx.shadowBlur=0;ctx.restore();
  const labelX=Math.min(w-150,Math.max(ox+4,x+25)),labelY=Math.max(36,y-47);
  ctx.fillStyle='#210e2ff2';ctx.strokeStyle=d.color;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(labelX,labelY-16,128,43,8);ctx.fill();ctx.stroke();
  ctx.fillStyle=d.color;ctx.fillRect(labelX+6,labelY-8,3,25);
  ctx.fillStyle='#fff0fa';ctx.font='bold 12px Segoe UI';ctx.fillText(d.id+' · '+['SCOUT','THERMAL','CARGO'][idx],labelX+14,labelY);
  ctx.fillStyle='#d7b5de';ctx.font='10px Segoe UI';ctx.fillText('WP '+Math.min(d.progress+1,d.route.length)+' / '+d.route.length,labelX+14,labelY+16);
 });
 // Topographic HUD labels
 ctx.fillStyle='#f7d3ee';ctx.font='bold 13px Segoe UI';ctx.fillText('TACTICAL OPERATIONS  /  LIVE GRID',ox+7,24);
 ctx.fillStyle='#d4a8d7';ctx.font='11px Consolas';ctx.fillText('SIMULATED • 24×16 • A* ROUTING',ox+7,h-15);
 ctx.fillStyle='#f5c7e8';ctx.font='11px Consolas';ctx.fillText('N ↑',w-42,25);
}
function fleet(){
 el('aoFleet').innerHTML=drones.map(d=>{
 const done=d.progress>=d.route.length-1;
 return '<tr><td><span style="display:inline-block;width:9px;height:9px;background:'+d.color+';border-radius:50%;box-shadow:0 0 10px '+d.color+';margin-right:8px"></span><b>'+d.id+'</b></td><td>'+(d.target<0?'—':'T-'+(d.target+1))+'</td><td>'+Math.max(0,d.route.length-1)+' hücre</td><td><span style="color:'+(done?'#dcb3df':'#ffcc9f')+'">'+(done?'HAZIR / TAMAM':'UÇUŞTA')+'</span></td></tr>'
 }).join('');
}

function recordEvent(message,kind="scan"){
 const box=el("aoEvents"),item=document.createElement("div");item.className="ao-event";
 const stamp=document.createElement("b");stamp.textContent=String(++eventCount).padStart(2,"0");
 const body=document.createElement("span");body.textContent=message;item.append(stamp,body);box.prepend(item);
 while(box.children.length>35)box.lastElementChild.remove();
}
function updateMission(){
 const count=visited.size,total=targets.length||5;
 el("aoProgressFill").style.width=(count/total*100)+"%";
 el("aoProgressText").textContent=count+" / "+total+" hedef ziyaret edildi (simülasyon)";
 el("aoPhase").textContent=({plan:"01 · GÖREV PLANLANDI",launch:"02 · KALKIŞ VE İNTİKAL",scan:"03 · HEDEF TARAMASI",complete:"04 · GÖREV SONUÇLANDI"})[phase];
 document.querySelectorAll("#advancedOps [data-phase]").forEach(n=>{n.classList.toggle("active",n.dataset.phase===phase)});
}
function advance(){
 if(phase==="plan"){phase="launch";recordEvent("Üç İHA için simüle kalkış komutu verildi","launch")}
 frame+=12;let moved=false;
 drones.forEach(d=>{
  if(d.progress<d.route.length-1){d.progress++;moved=true}
  const p=d.route[d.progress];if(!p)return;
  targets.forEach(t=>{if(t.x===p.x&&t.y===p.y&&!visited.has(t.id)){
   visited.add(t.id);phase="scan";recordEvent(d.id+" → T-"+(t.id+1)+" noktasına ulaştı; sanal hedef işaretlendi");
  }});
 });
 if(!moved){phase="complete";playing=false;recordEvent("Planlanan uçuş rotaları tamamlandı; "+visited.size+" hedef ziyaret edildi","complete");el("aoStatus").textContent="Simülasyon tamamlandı: "+visited.size+" / "+targets.length+" hedef ziyaret edildi. Gerçek arama/kurtarma başarısı ölçülmedi."}
 updateMission();draw();fleet();return moved;
}
function animate(){if(!playing)return;frame++;if(frame%12===0){if(!advance())return}raf=requestAnimationFrame(animate)}
function thermal(){
 let c=el('aoThermal'),g=c.getContext('2d'),w=c.width,h=c.height,noise=+el('aoNoise').value/100;
 const hot=[{x:.24,y:.58,a:1},{x:.72,y:.37,a:.8},{x:.51,y:.82,a:.55}];
 let image=g.createImageData(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 let v=.05+noise*rng();for(let p of hot){let dx=x/w-p.x,dy=y/h-p.y;v+=p.a*Math.exp(-(dx*dx+dy*dy)/.004)}
 v=Math.min(1,v);let i=(y*w+x)*4;image.data[i]=Math.round(18+237*Math.min(1,v*1.7));image.data[i+1]=Math.round(7+170*Math.max(0,v-.35));image.data[i+2]=Math.round(45+155*(1-v));image.data[i+3]=255;
 }g.putImageData(image,0,0);g.fillStyle='#fff2f8';g.font='bold 16px Consolas';g.fillText('THERMAL / SYNTHETIC',16,25);g.fillText('SIM ONLY',w-110,25);
}
el('aoGenerate').onclick=generate;el('aoAssign').onclick=assign;el('aoPlay').onclick=()=>{if(!playing){playing=true;recordEvent('Operasyon yürütülüyor');raf=requestAnimationFrame(animate)}};
el('aoPause').onclick=()=>{playing=false;cancelAnimationFrame(raf);recordEvent('Operasyon kullanıcı tarafından duraklatıldı')};el('aoNext').onclick=()=>{playing=false;cancelAnimationFrame(raf);advance()};
el('aoNoise').oninput=()=>{el('aoNoiseV').textContent=el('aoNoise').value+'%';thermal()};
el('aoThermalRefresh').onclick=thermal;
el('aoThermalSave').onclick=()=>{let a=document.createElement('a');a.href=el('aoThermal').toDataURL('image/png');a.download='FuzzyRescue_sentetik_termal.png';a.click()};
el('aoExport').onclick=()=>{let report={project:'FuzzyRescue',module:'Tactical Mission Control',version:'7.0',simulation:true,grid:{width:W,height:H,obstacles:grid},targets,drones:drones.map(d=>({id:d.id,route:d.route,target:d.target})),assignments:routes,unreachable,visitedTargetIds:[...visited],missionPhase:phase,simulationNote:'Only synthetic waypoints, no real detections'};let blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='FuzzyRescue_gorev_raporu.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
generate();
})();
;

/* FuzzyRescue JavaScript modulu 5 */
(()=>{'use strict';const $=id=>document.getElementById(id);let audit={};function toast(s){let t=$('fr-toast');t.textContent=s;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,3500)}function jump(id){$(id)?.scrollIntoView({behavior:'smooth',block:'start'})}function download(name,data){let u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}function runAudit(){let ids=['scene','history','cb','co','cc','cs','surfaceCanvas','defuzzCanvas','pro3d','aoMap','aoFleet','aoEvents','mlRun','mlStep','mlSweep','runBench','aoAssign','aoPlay'];let available=ids.filter(x=>!!$(x)),canvases=[...document.querySelectorAll('canvas')],good=canvases.filter(c=>!!c.getContext('2d'));let fuzzy={available:typeof window.infer==='function',ruleCount:typeof window.rules!=='undefined'?window.rules.length:null,samples:[]};try{if(fuzzy.available){for(const [b,o,c] of [[82,56,72],[9,75,68],[78,5,88],[90,92,98],[19,9,35]]){let r=window.infer(b,o,c);fuzzy.samples.push({battery:b,obstacle:o,confidence:c,speed:r.speed,valid:Number.isFinite(r.speed)&&r.speed>=0&&r.speed<=100&&r.fires.length===27})}}}catch(e){fuzzy.error=String(e)}let pass=available.length===ids.length&&good.length===canvases.length&&fuzzy.samples.every(x=>x.valid);audit={timestamp:new Date().toISOString(),simulation:true,modules:{present:available.length,total:ids.length,missing:ids.filter(x=>!$(x))},canvas:{working:good.length,total:canvases.length},fuzzy,pass};$('fr-modules').textContent=available.length+'/'+ids.length;$('fr-canvas').textContent=good.length+'/'+canvases.length;$('fr-rules').textContent=fuzzy.ruleCount??'27';$('fr-health').textContent=pass?'GEÇTİ':'İNCELE';$('fr-audit-details').textContent=pass?'Temel arayüz modülleri ve grafik yüzeyleri erişilebilir. Beş sentetik bulanık mantık örneği beklenen sayısal aralıkta.':'Bazı bileşenler veya testler doğrulanamadı. Ayrıntılar için denetim JSON raporunu inceleyin.';$('fr-indicator').textContent=pass?'◉ Temel arayüz denetimi başarılı · SIM ONLY':'◉ Bazı modüller inceleme gerektiriyor · SIM ONLY';return audit}function summary(){return {project:'FuzzyRescue Ultimate',version:'11.0',type:'Academic offline simulation',timestamp:new Date().toISOString(),limitations:['No real flight control','No live GPS','No real thermal/LiDAR','Not validated for rescue operations'],sensors:Object.fromEntries(['b','o','c','w','a'].map(id=>[id,Number($(id)?.value)])),fuzzy:typeof window.infer==='function'?window.infer(Number($('b')?.value),Number($('o')?.value),Number($('c')?.value)).speed:null,inspection:runAudit()}}$('fr-launch').onclick=()=>jump('advancedOps');$('fr-lab').onclick=()=>jump('missionLab');$('fr-full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(e){toast('Tam ekran tarayıcı tarafından engellendi')}};$('fr-report').onclick=()=>download('FuzzyRescue_sistem_ozeti.json',summary());$('fr-check').onclick=()=>{runAudit();jump('fr-audit');toast('Sistem denetimi güncellendi')};$('fr-recheck').onclick=()=>{runAudit();toast('Denetim tamamlandı')};$('fr-export-audit').onclick=()=>download('FuzzyRescue_denetim.json',runAudit());$('fr-copy').onclick=async()=>{let s=summary();let msg=`FUZZYRESCUE / AKADEMİK SİMÜLASYON\nBatarya: ${s.sensors.b}% | Engel: ${s.sensors.o} m | Güven: ${s.sensors.c}%\nBulanık hız: ${s.fuzzy?.toFixed(2)??'—'} / 100\nGerçek sensör bağlantısı: YOK`;try{await navigator.clipboard.writeText(msg);toast('Durum özeti kopyalandı')}catch(e){toast('Tarayıcı kopyalamaya izin vermedi')}};$('fr-help').onclick=()=>toast('Kısayollar: 1 Kontrol · 2 Filo · 3 Laboratuvar · 4 Afet · F Tam ekran · Esc Çıkış');document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName||''))return;let dest={'1':'fr-dashboard','2':'advancedModule','3':'missionLab','4':'advancedOps'}[e.key];if(dest)jump(dest);if(e.key.toLowerCase()==='f'&&!e.repeat)$('fr-full').click()});window.addEventListener('load',runAudit,{once:true});setTimeout(runAudit,200);})();
;
