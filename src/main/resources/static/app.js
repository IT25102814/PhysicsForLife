const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const today=()=>new Date().toLocaleDateString([],{day:'numeric',month:'short',year:'numeric'});
const NAV={student:[['Payments',[['mypay','My Payments','▣'],['bank','Bank Details','⌂']]],['Support',[['revisions','Revision Requests','✉']]]],
admin:[['Payments',[['invoices','Invoices','▦'],['receipts','Payment Receipts','▣']]],['Support',[['revisions','Revision Requests','✉']]]]};
const ME={id:'ST1042',name:'Kavya S.'};
const PORTALS=[['Cambridge',['2029 OL','2028 OL','2027 OL','2028 AL']],['Edexcel',['2028 OL','2027 OL','2027 AL','2028 AL']]];
const ALLC=PORTALS.flatMap(([g,l])=>l.map(x=>g+': '+x));
const FEES=Object.fromEntries(ALLC.map(k=>[k,/AL$/.test(k)?6000:4500])); /* sample monthly fees - change here */
const seed=()=>{const rc=`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='210'><rect width='100%' height='100%' fill='#fff' stroke='#ccc'/><text x='20' y='40' font-size='17' font-family='sans-serif' font-weight='bold'>Commercial Bank - Transfer Receipt</text><text x='20' y='85' font-size='14' font-family='sans-serif'>To: Physics for Life (2000282462)</text><text x='20' y='115' font-size='14' font-family='sans-serif'>Amount: LKR 6,000.00</text><text x='20' y='145' font-size='14' font-family='sans-serif'>Reference: ST1077</text><text x='20' y='185' font-size='12' font-family='sans-serif' fill='#16a34a'>Transaction successful</text></svg>`;
return {role:'student',i:[{id:1,s:'ST1001',k:'Cambridge: 2028 AL',a:6000,p:6000},{id:2,s:'ST1042',k:'Cambridge: 2027 OL',a:4500,p:2000},{id:3,s:'ST1077',k:'Edexcel: 2027 AL',a:6000,p:0}],
p:[{id:1,i:3,a:6000,ref:'ST1077',f:'slip_ST1077.svg',u:'data:image/svg+xml;utf8,'+encodeURIComponent(rc),st:'PENDING',d:today()}],
r:[{id:1,s:'ST1001',c:'I get confused when a question mixes Faraday\'s law and Lenz\'s law. I need more worked examples.',st:'PENDING'}]}};
let S=JSON.parse(localStorage.getItem('pfl6')||'null')||seed();const save=()=>localStorage.setItem('pfl6',JSON.stringify(S));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tc=s=>s[0]+s.slice(1).toLowerCase(),chip=s=>`<span class="chip ${s.toLowerCase()}">${tc(s)}</span>`,st=i=>i.p>=i.a?'PAID':i.p>0?'PARTIAL':'UNPAID',sum=k=>S.i.reduce((x,i)=>x+i[k],0),fd=f=>Object.fromEntries(new FormData(f));
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('show'),2600)};
const shake=e=>{e.classList.remove('sh');void e.offsetWidth;e.classList.add('sh')};
const cu=(el,v)=>{let n=0;const t=setInterval(()=>{n+=v/30;if(n>=v){n=v;clearInterval(t)}el.textContent=Math.round(n).toLocaleString()},20)};
const P={},A={},F={},I={};let cur='mypay',pc=null;
const inv=id=>S.i.find(i=>i.id==id),same=(a,b)=>String(a).trim().toLowerCase()==String(b).trim().toLowerCase(),myinv=k=>S.i.find(i=>same(i.s,ME.id)&&i.k==k),pend=i=>S.p.find(p=>p.i==i.id&&p.st=='PENDING'),bal=i=>i.a-i.p;
const hero=(ic,t,p)=>`<div class="hero"><i>${ic}</i><div><h1>${t}</h1><p>${p}</p></div></div>`;
const nid=a=>Math.max(0,...a.map(x=>x.id))+1;

/* ---------- bank accounts (shown to students) ---------- */
const BK=[['Commercial Bank','Bambalapitiya · Branch 29','Physics for Life','2000282462'],['Commercial Bank','Bambalapitiya · Branch 29','Physics for Life (Savings)','2000282470']];
const accounts=()=>BK.map(b=>`<div class="acc"><h4>${b[0]} <span class="tag">${b[1].split('· ')[1]}</span></h4><small>${b[1].split(' ·')[0]}</small><div class="fld"><div><small>Account name</small><b style="letter-spacing:0">${b[2]}</b></div><button class="b g sm" data-a="cp" data-v="${b[2]}">Copy</button></div><div class="fld"><div><small>Account number</small><b>${b[3]}</b></div><button class="b g sm" data-a="cp" data-v="${b[3]}">Copy</button></div></div>`).join('');
P.bank=()=>hero('🏛','Bank Payment Details','Pick one of the accounts below and transfer your fee.')+`<div class="g2"><div class="card"><div class="ct">How to pay</div>${[['Choose the class','Open My Payments and select the class you are paying for.','#6366f1'],['Transfer the fee','Pay by bank deposit or online transfer. Use your student ID as the reference.','#06b6d4'],['Upload the receipt','Upload your bank receipt on the class payment page. It shows as Paid once the admin accepts it.','#22c55e']].map((s,i)=>`<div class="step"><b class="n" style="background:${s[2]}">${i+1}</b><h4>${s[0]}</h4><p>${s[1]}</p></div>`).join('')}</div><div class="card"><div class="ct" style="display:flex;justify-content:space-between">Our bank accounts <span class="chip unpaid">${BK.length} accounts</span></div>${accounts()}</div></div>`;
A.cp=b=>{navigator.clipboard?.writeText(b.dataset.v);b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy',1500)};

/* ---------- STUDENT: my payments ---------- */
P.mypay=()=>{
 if(pc&&ALLC.includes(pc))return classPage(pc);
 pc=null;
 return hero('▣','My Payments','Select the class you are paying for.')+PORTALS.map(([g,l])=>`<div class="ct" style="margin-top:6px">${g}</div><div class="g3" style="margin-bottom:22px">${l.map(x=>{const k=g+': '+x,i=myinv(k)||{a:FEES[k],p:0,id:0},p=i.id&&pend(i),s=st(i);return `<div class="card hv pick" data-a="pick" data-v="${k}"><h3 style="margin:0 0 10px">${x}</h3><div class="li" style="padding:6px 0"><span>Fee</span><b>LKR ${i.a.toLocaleString()}</b></div><div class="li" style="padding:6px 0"><span>Paid</span><b>LKR ${i.p.toLocaleString()}</b></div><div class="li" style="padding:6px 0"><span>Balance</span><b>LKR ${bal(i).toLocaleString()}</b></div><div style="margin-top:10px">${p?chip('PENDING')+' <span class="sub">waiting for admin</span>':chip(s)}</div><button class="b sm" style="margin:12px 0 0">${s=='PAID'?'View':'Pay for this class'}</button></div>`}).join('')}</div>`).join('');
};
function classPage(k){
 const i=myinv(k)||{id:0,s:ME.id,k,a:FEES[k],p:0},p=i.id&&pend(i),s=st(i),rc=i.id?S.p.filter(x=>x.i==i.id).reverse():[];
 const status=s=='PAID'?`<div class="ok2"><b>✓ Paid</b><p style="margin-top:4px">Your fee for ${esc(k)} is fully paid. Thank you!</p></div>`:p?`<div class="ok2" style="background:#fffbeb"><b>⏳ Slip submitted</b><p style="margin-top:4px">Your slip for LKR ${p.a.toLocaleString()} is waiting for the admin to accept it. It will show as paid once accepted.</p><button class="b g sm" style="margin:10px 0 0" data-a="vw" data-v="${p.id}">View my slip</button></div>`:
 `<div class="card"><div class="ct">2 · Upload your payment slip <span class="req">required</span></div><form data-f="pay" id="payf"><div class="row"><label>Amount paid (LKR)<input name="a" type="number" min="1" max="${bal(i)}" value="${bal(i)}" required></label><label>Bank reference (optional)<input name="r" placeholder="Transfer reference"></label></div><label>Payment slip <span class="req">*</span><input name="f" type="file" accept="image/*,.pdf" data-i="slip" required></label><div id="slipv" class="slipv" hidden></div><button class="b" id="sbtn" disabled>Submit payment slip</button></form></div>`;
 return `<button class="b g sm" style="margin:0 0 12px" data-a="back">← All classes</button>`+hero('▣',esc(k),'Pay your fee for this class')+
 `<div class="g3" style="margin-bottom:18px"><div class="card stat bl"><span>Fee (LKR)</span><b data-n="${i.a}">0</b></div><div class="card stat bl"><span>Paid</span><b data-n="${i.p}">0</b></div><div class="card stat bl"><span>Balance</span><b data-n="${bal(i)}">0</b></div></div>`+
 (s!='PAID'&&!p?`<div class="card"><div class="ct">1 · Transfer to one of our accounts</div><div class="g2">${accounts()}</div><p class="sub" style="margin:0">Use <b>${ME.id}</b> as your transfer reference, then upload the slip below.</p></div>`:'')+status+
 `<div class="card"><div class="ct">Payments for this class</div>${rc.map(x=>`<div class="li"><span>#${x.id} · LKR ${x.a.toLocaleString()} · ${esc(x.d||'')}${x.st=='REJECTED'?`<br><span class="sub">Reason: ${esc(x.why||'Not specified')}</span>`:''}</span>${chip(x.st)}</div>`).join('')||'<p class="sub" style="margin:0">No payments yet.</p>'}</div>`;
}
I.slip=el=>{const f=el.files[0],v=$('#slipv'),b=$('#sbtn');b.disabled=!f;if(!f){v.hidden=true;return}v.hidden=false;v.innerHTML=(f.type.startsWith('image/')?`<img src="${URL.createObjectURL(f)}" alt="">`:'<span class="big2">📄</span>')+`<div><b>${esc(f.name)}</b><br><span class="sub">${Math.round(f.size/1024)} KB · ready to submit</span></div>`};
A.pick=b=>{pc=b.dataset.v;go('mypay')};A.back=()=>{pc=null;go('mypay')};
F.pay=f=>{const d=fd(f),file=d.f;
 if(!file||!file.name){shake(f);return toast('Upload your payment slip. It is required.')}
 let i=myinv(pc);if(!i){i={id:nid(S.i),s:ME.id,k:pc,a:FEES[pc],p:0};S.i.push(i)}
 const a=+d.a;if(!(a>0)||a>bal(i)){shake(f);return toast('Amount must be between 1 and '+bal(i))}
 const done=u=>{S.p.push({id:nid(S.p),i:i.id,a,ref:d.r||'',f:file.name,u,st:'PENDING',d:today()});save();go('mypay');hdr();toast('Slip sent to the admin')};
 if(file.size<=600000&&/^(image\/|application\/pdf)/.test(file.type)){const r=new FileReader();r.onload=()=>done(r.result);r.readAsDataURL(file)}else done('')};

/* ---------- ADMIN: invoices ---------- */
P.invoices=()=>{const b=sum('a'),p=sum('p');return hero('▦','Invoices','Monthly fees per student with live totals.')+`<div class="g3"><div class="card stat bl"><span>Billed (LKR)</span><b data-n="${b}">0</b></div><div class="card stat bl"><span>Collected</span><b data-n="${p}">0</b></div><div class="card stat bl"><span>Outstanding</span><b data-n="${b-p}">0</b></div></div><div class="card" style="margin-top:18px"><div class="ct">Generate invoice</div><form data-f="inv" class="row"><label>Student ID<input name="s" placeholder="e.g. ST1042" required></label><label>Class<select name="k" data-i="fee">${ALLC.map(k=>`<option>${k}</option>`).join('')}</select></label><label>Amount (LKR)<input name="a" id="fa" type="number" value="${FEES[ALLC[0]]}" required></label><button class="b">Generate</button></form></div><div class="card"><table><thead><tr><th>#</th><th>Student ID</th><th>Class</th><th>Amount</th><th>Paid</th><th>Status</th><th></th></tr></thead><tbody>${S.i.map(i=>`<tr><td>${i.id}</td><td>${esc(i.s)}</td><td>${esc(i.k||'-')}</td><td>${i.a}</td><td>${i.p}</td><td>${chip(st(i))}</td><td style="text-align:right"><button class="b sm r" style="margin:0" data-a="di" data-v="${i.id}" title="Delete invoice" aria-label="Delete invoice">🗑</button></td></tr>`).join('')}</tbody></table></div>`};
I.fee=el=>{$('#fa').value=FEES[el.value]};F.inv=f=>{const d=fd(f);S.i.push({id:nid(S.i),s:d.s.trim(),k:d.k.trim(),a:+d.a,p:0});save();go('invoices');hdr();toast('Invoice generated')};
A.di=b=>{const i=inv(b.dataset.v);if(!confirm('Delete invoice #'+i.id+' for '+i.s+'? Its receipts will also be removed.'))return;S.i=S.i.filter(x=>x.id!=i.id);S.p=S.p.filter(p=>p.i!=i.id);save();go('invoices');hdr();toast('Invoice deleted')};

/* ---------- ADMIN: payment receipts ---------- */
const rcard=p=>{const i=inv(p.i)||{s:'?',k:'?'};return `<div class="acc"><h4>${esc(i.k)} <span class="tag">${esc(i.s)}</span></h4><small>Invoice #${p.i} · submitted ${esc(p.d||'')}</small><div class="fld"><div><small>Amount</small><b style="letter-spacing:0">LKR ${p.a.toLocaleString()}</b></div><div><small>Reference</small><b style="letter-spacing:0">${esc(p.ref||'-')}</b></div><button class="b g sm" data-a="vw" data-v="${p.id}">View receipt</button></div><div style="margin-top:12px"><button class="b sm" style="margin-left:0" data-a="ok" data-v="${p.id}">Accept</button><button class="b sm r" data-a="no" data-v="${p.id}">Reject</button></div></div>`};
P.receipts=()=>{const pd=S.p.filter(p=>p.st=='PENDING'),dn=S.p.filter(p=>p.st!='PENDING').reverse();return hero('▣','Payment Receipts','Check each bank receipt, then accept or reject it.')+`<div class="card"><div class="ct">Waiting for you (${pd.length})</div>${pd.map(rcard).join('')||'<p class="sub" style="margin:0">No receipts waiting.</p>'}</div><div class="card"><div class="ct">History</div>${dn.map(p=>{const i=inv(p.i)||{s:'?',k:'?'};return `<div class="li"><span>${esc(i.s)} · ${esc(i.k)} · LKR ${p.a.toLocaleString()}${p.st=='REJECTED'?`<br><span class="sub">Reason: ${esc(p.why||'Not specified')}</span>`:''}</span>${chip(p.st)}</div>`}).join('')||'<p class="sub" style="margin:0">Nothing yet.</p>'}</div>`};
A.ok=b=>{const p=S.p.find(p=>p.id==b.dataset.v),i=inv(p.i);p.st='ACCEPTED';i.p=Math.min(i.a,i.p+p.a);save();go('receipts');hdr();toast('Accepted. The student now sees it as '+(i.p>=i.a?'paid':'partly paid'))};
A.no=b=>{const w=prompt('Reason for rejecting (the student will see this):');if(w===null)return;const p=S.p.find(p=>p.id==b.dataset.v);p.st='REJECTED';p.why=w.trim();save();go('receipts');hdr();toast('Receipt rejected')};
A.vw=b=>{const p=S.p.find(p=>p.id==b.dataset.v),m=document.createElement('div');m.id='mod';
 m.innerHTML=`<div><div class="qh2"><b>${esc(p.f||'Receipt')}</b><button class="b g sm" style="margin:0" data-x>Close</button></div>${p.u?(p.u.startsWith('data:application/pdf')?`<embed src="${p.u}" type="application/pdf" width="640" height="480">`:`<img src="${p.u}" alt="Receipt">`):'<p class="sub" style="margin:14px 0 0">Preview not stored for this file (too large). File name: '+esc(p.f||'-')+'</p>'}</div>`;
 m.onclick=e=>{if(e.target==m||e.target.dataset.x!==undefined)m.remove()};document.body.append(m)};

/* ---------- revisions (by role) ---------- */
const fmt=v=>v?new Date(v).toLocaleString([],{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}):'';
const reply=r=>`<div class="ok2">${r.ans?`<b>Tutor's answer</b><p style="margin:4px 0 ${r.slot?'10px':'0'}">${esc(r.ans)}</p>`:''}${r.slot?`<b>Call time slot</b><p style="margin-top:4px">📞 ${fmt(r.slot)}</p>`:''}</div>`;
P.revisions=()=>{const stu=S.role=='student',L=stu?S.r.filter(r=>same(r.s,ME.id)):S.r;
 return hero('✉','Revision Requests',stu?'Tell the tutor what you are finding difficult.':'Reply with an answer, a call time slot, or both.')+(stu?
 `<div class="card"><div class="ct">New request</div><form data-f="rev"><label>Student ID<input name="s" value="${ME.id}" readonly></label><label>Concerns<textarea name="c" rows="4" placeholder="Tell the tutor what you are struggling with" required></textarea></label><button class="b">Send to tutor</button></form></div>
 <div class="card"><div class="ct">My requests</div>${L.map(r=>`<div class="li" style="align-items:flex-start"><span style="flex:1"><b>Student ID: ${esc(r.s)}</b><br><span class="sub">${esc(r.c||'')}</span>${r.st=='RESPONDED'?reply(r):''}</span>${chip(r.st)}</div>`).join('')||'<p class="sub">No requests yet.</p>'}</div>`:
 `<div class="card"><div class="ct">Waiting for you</div>${S.r.filter(r=>r.st=='PENDING').map(r=>`<div class="acc"><h4>Student ID <span class="tag">${esc(r.s)}</span></h4><small>Student concerns</small><p>${esc(r.c||'')}</p><div style="margin-top:10px"><button class="b g sm" style="margin-left:0" data-a="tp" data-v="an-${r.id}">Answer</button><button class="b g sm" data-a="tp" data-v="sl-${r.id}">Give a time slot</button></div><div id="an-${r.id}" hidden><label>Your answer<textarea rows="3"></textarea></label></div><div id="sl-${r.id}" hidden><label>Time slot to call the student<input type="datetime-local"></label></div><button class="b" data-a="snd" data-v="${r.id}">Send to student</button></div>`).join('')||'<p class="sub">No pending requests.</p>'}</div>
 <div class="card"><div class="ct">Replied</div>${S.r.filter(r=>r.st=='RESPONDED').map(r=>`<div class="li" style="align-items:flex-start"><span style="flex:1"><b>Student ID: ${esc(r.s)}</b>${reply(r)}</span>${chip(r.st)}</div>`).join('')||'<p class="sub">Nothing replied yet.</p>'}</div>`)};
A.tp=b=>{const e=$('#'+b.dataset.v);e.hidden=!e.hidden;b.classList.toggle('g',e.hidden);if(!e.hidden)$('textarea,input',e).focus()};
A.snd=b=>{const id=b.dataset.v,card=b.closest('.acc'),an=$('#an-'+id),sl=$('#sl-'+id),ans=an.hidden?'':$('textarea',an).value.trim(),slot=sl.hidden?'':$('input',sl).value;
 if(!ans&&!slot){shake(card);return toast('Add an answer, a time slot, or both')}
 const r=S.r.find(r=>r.id==id);r.ans=ans;r.slot=slot;r.st='RESPONDED';save();go('revisions');hdr();toast('Sent back to the student')};
F.rev=f=>{const d=fd(f);S.r.unshift({id:nid(S.r),s:d.s.trim(),c:d.c,st:'PENDING'});save();go('revisions');hdr();toast('Request sent to the tutor')};

/* ---------- shell ---------- */
const page=$('#page');
function go(k){cur=k;page.innerHTML=P[k]();$$('.nv').forEach(n=>n.classList.toggle('on',n.dataset.k==k));$$('[data-n]',page).forEach(e=>cu(e,+e.dataset.n));$('#side').classList.remove('open');scrollTo(0,0)}
function hdr(){const ad=S.role=='admin';let n=[],c=0;
 if(ad){const pr=S.p.filter(p=>p.st=='PENDING'),rv=S.r.filter(r=>r.st=='PENDING');c=pr.length+rv.length;n=[...pr.map(p=>`New receipt from ${esc((inv(p.i)||{}).s||'?')} for ${esc((inv(p.i)||{}).k||'?')}`),...rv.map(r=>`Revision request from ${esc(r.s)}`)]}
 else{const rp=S.p.filter(p=>inv(p.i)&&same(inv(p.i).s,ME.id)&&p.st!='PENDING'),rr=S.r.filter(r=>same(r.s,ME.id)&&r.st=='RESPONDED');c=rp.length+rr.length;n=[...rp.map(p=>`Your payment for ${esc(inv(p.i).k)} was ${p.st.toLowerCase()}`),...rr.map(()=>'The tutor replied to your revision request')]}
 $('#bd').textContent=c;$('#bd').hidden=!c;$('#pop').innerHTML=n.map(t=>`<p>${t}</p>`).join('')||'<p>You are all caught up.</p>';
 $('#av').firstChild.textContent=ad?'AD':'KS';$$('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.r==S.role))}
function nav(){$('#nav').innerHTML=NAV[S.role].map(([h,l])=>`<div class="sec">${h}</div>`+l.map(([k,n,i])=>`<button class="nv" data-k="${k}"><span>${i}</span>${n}</button>`).join('')).join('')}
$('#nav').onclick=e=>{const b=e.target.closest('.nv');if(b){pc=null;go(b.dataset.k)}};$('#burger').onclick=()=>$('#side').classList.toggle('open');$('#bell').onclick=()=>$('#pop').hidden=!$('#pop').hidden;
$('.seg').onclick=e=>{const b=e.target.closest('button');if(!b||b.dataset.r==S.role)return;S.role=b.dataset.r;pc=null;save();nav();hdr();go(S.role=='admin'?'invoices':'mypay')};
page.onclick=e=>{const b=e.target.closest('[data-a]');b&&A[b.dataset.a](b)};page.onsubmit=e=>{e.preventDefault();F[e.target.dataset.f](e.target)};page.oninput=e=>{const f=e.target.dataset.i;f&&I[f](e.target)};
nav();hdr();go(S.role=='admin'?'invoices':'mypay');
