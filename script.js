'use strict';
/* TIỆM SÁCH MÈO CON — một trò chơi web hoàn toàn chạy trên trình duyệt.
   Đơn vị tính trong bộ máy game: 1 = 1.000 đồng.
   Phần tử trong localStorage có thể bị xóa khi người chơi dọn dữ liệu trình duyệt. */
const KEY = 'tiem-sach-meo-con-v1';
const DENOMS = [1,2,5,10,20,50,100,200,500];
const CATEGORIES = ['Sách','Vở','Bút','Dụng cụ','Quà tặng'];
const LEVELS = {
  easy: {name:'Dễ', emoji:'🌱', cap:95, maxUnit:35, itemCount:2, maxQty:1},
  medium: {name:'Vừa', emoji:'🌻', cap:295, maxUnit:48, itemCount:3, maxQty:4},
  hard: {name:'Khó', emoji:'🚀', cap:495, maxUnit:80, itemCount:3, maxQty:6}
};
const PEOPLE = [
  {name:'Bạn Na',emoji:'👧',words:'Mình muốn mua vài món đồ học tập nhé!'},
  {name:'Bạn Bin',emoji:'👦',words:'Bạn giúp mình tính tiền thật chuẩn nha!'},
  {name:'Chị Thỏ',emoji:'🐰',words:'Mình đến tìm sách và những món quà xinh.'},
  {name:'Bạn Gấu',emoji:'🐻',words:'Mình đã chuẩn bị tiền, nhờ bạn tính giúp!'},
  {name:'Bạn Cáo',emoji:'🦊',words:'Các món đồ dễ thương quá! Mình lấy nhé.'},
  {name:'Bạn Miu',emoji:'🐱',words:'Meo meo! Hôm nay mình muốn đọc sách!'},
  {name:'Bạn Vịt',emoji:'🐥',words:'Quầy sách của bạn thật đẹp!'}
];
const INITIAL = [
  ['sach-co-tich','Truyện cổ tích','📕','Sách',28,17,7],
  ['truyen-tranh','Truyện tranh','📗','Sách',32,19,7],
  ['sach-khoa-hoc','Sách khám phá','📘','Sách',45,27,5],
  ['sach-tho','Sách thơ thiếu nhi','📙','Sách',21,12,8],
  ['sach-toan','Sách luyện toán','📚','Sách',30,18,8],
  ['truyen-dong-vat','Sách động vật','🦒','Sách',25,15,6],
  ['vo-o-ly','Vở ô ly','📓','Vở',8,4,12],
  ['vo-ke-ngang','Vở kẻ ngang','📒','Vở',10,5,12],
  ['so-tay','Sổ tay mini','📔','Vở',15,8,8],
  ['but-chi','Bút chì','✏️','Bút',3,1,15],
  ['but-bi','Bút bi','🖊️','Bút',5,2,15],
  ['but-mau','Bút màu','🖍️','Bút',20,12,8],
  ['thuoc-ke','Thước kẻ','📏','Dụng cụ',7,3,10],
  ['tay','Cục tẩy','🧽','Dụng cụ',4,2,12],
  ['keo','Kéo an toàn','✂️','Dụng cụ',18,10,6],
  ['bo-mau','Màu nước','🎨','Dụng cụ',35,20,5],
  ['gau-bong','Gấu bông','🧸','Quà tặng',55,34,5],
  ['hop-qua','Hộp quà nhỏ','🎁','Quà tặng',40,24,6]
];
const $ = id => document.getElementById(id);
const num = n => Number.isFinite(Number(n)) ? Number(n) : 0;
const fmt = k => (Math.round(k)*1000).toLocaleString('vi-VN')+'đ';
const rand = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
const pick = list => list[Math.floor(Math.random()*list.length)];
const shuffle = list => [...list].sort(()=>Math.random()-.5);
const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const freshState = () => ({day:1,open:false,balance:500,served:0,salesToday:0,totalSales:0,stars:0,streak:0,bestStreak:0,level:'easy',counters:{easy:0,medium:0,hard:0},sound:true,items:INITIAL.map(([id,name,emoji,category,price,cost,stock])=>({id,name,emoji,category,price,cost,stock})),order:null});
function restore(){
  try{
    const old=JSON.parse(localStorage.getItem(KEY));
    if(!old||!Array.isArray(old.items)||!LEVELS[old.level]) return freshState();
    const starter=freshState();
    return {...starter,...old,items:old.items.map(item=>({...item,stock:Math.max(0,num(item.stock))})),counters:{...starter.counters,...old.counters},order:null};
  }catch{return freshState();}
}
let state=restore(), screen='shop', currentFilter='Tất cả',toastTimeout=null;
function persist(){try{localStorage.setItem(KEY,JSON.stringify({...state,order:null}));}catch(e){console.warn('Không lưu được trò chơi',e);}}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('visible'),3400);}
let audioContext=null;
function sound(kind='click'){
  if(!state.sound)return;
  try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return; audioContext=audioContext||new C();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.setValueAtTime(kind==='good'?650:kind==='bad'?220:450,audioContext.currentTime);if(kind==='good')osc.frequency.exponentialRampToValueAtTime(920,audioContext.currentTime+.13);gain.gain.setValueAtTime(.09,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.19);osc.connect(gain).connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+.20);}catch{}
}
function nav(to){screen=to;document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('is-active',el.dataset.nav===to));document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('is-active',el.id==='screen-'+to));if(to==='checkout')renderCounter();if(to==='stock')renderInventory();if(to==='rewards')renderRewards();window.scrollTo({top:0,behavior:'smooth'});}
function redraw(){
  document.body.classList.toggle('shop-is-open',state.open);
  $('shop-status').textContent=state.open?'● Đang mở cửa':'● Đang đóng cửa';$('shop-status').classList.toggle('open',state.open);
  $('stat-day').textContent=state.day;$('stat-wallet').textContent=fmt(state.balance);$('stat-served').textContent=state.served;$('stat-stars').textContent=state.stars;
  $('open-close-btn').textContent=state.open?'🔒 Đóng cửa · Kết thúc ngày':'🔓 Mở cửa hàng';
  $('door-plate').textContent=state.open?'OPEN':'CLOSED';$('door-plate').classList.toggle('open',state.open);
  $('current-level-tag').textContent=`${LEVELS[state.level].emoji} Cấp ${LEVELS[state.level].name.toLowerCase()}`;
  $('sound-btn').textContent=state.sound?'🔊':'🔇';
  document.querySelectorAll('.level-card').forEach(el=>{const selected=el.dataset.level===state.level;el.classList.toggle('is-selected',selected);el.setAttribute('aria-pressed',String(selected));});
  persist();
}
function toggleStore(){
  if(state.open){
    if(state.order&&state.order.stage!=='success'&&!confirm('Đang có khách chờ tính tiền. Đóng cửa sẽ hủy hóa đơn này. Em có chắc không?'))return;
    stopCustomerWalk();state.open=false;state.order=null;const revenue=fmt(state.salesToday);state.day++;state.salesToday=0;toast(`🌙 Đóng cửa rồi! Hôm nay bán được ${revenue}. Hẹn ngày mai!`);
  }else{
    if(!state.items.some(item=>item.stock>0)){toast('📦 Kho trống! Nhập thêm sách rồi hãy mở cửa.');nav('stock');return;}
    state.open=true;toast('🎉 Tiệm đã mở cửa! Mời khách đến mua sách nào!');
  }
  sound('good');redraw();renderCounter();
}
function changeLevel(level){
  if(!LEVELS[level]||state.level===level)return;
  if(state.order&&state.order.stage!=='success'&&!confirm('Đổi cấp độ sẽ hủy hóa đơn hiện tại. Em có muốn đổi?'))return;
  stopCustomerWalk();state.level=level;state.order=null;redraw();renderCounter();sound();toast(`Đã chọn cấp ${LEVELS[level].name}. Chúc em học giỏi!`);
}
function tenderFor(total,level){
  const acceptable=DENOMS.filter(n=>n>=total&&(level!=='easy'||n<=100));
  if(!acceptable.length)return null;
  const nearest=acceptable[0];
  const options=acceptable.slice(0,Math.min(3,acceptable.length));
  return Math.random()<.78?nearest:pick(options);
}
function tryGenerateOrder(){
  const cfg=LEVELS[state.level];
  const pool=state.items.filter(x=>x.stock>0&&x.price<=cfg.maxUnit&&x.price>0);
  if(!pool.length)return null;
  for(let trial=0;trial<180;trial++){
    const wanted=Math.min(pool.length,cfg.itemCount===3?rand(2,3):cfg.itemCount);
    const products=shuffle(pool).slice(0,wanted);
    const items=products.map((p,i)=>{
      let maxQty=Math.min(cfg.maxQty,p.stock);
      let qty=1;
      if(state.level!=='easy')qty=i===0&&maxQty>=2?rand(2,maxQty):rand(1,maxQty);
      return{id:p.id,name:p.name,emoji:p.emoji,price:p.price,qty};
    });
    if(state.level!=='easy'&&!items.some(x=>x.qty>=2))continue;
    const total=items.reduce((sum,x)=>sum+x.price*x.qty,0);
    if(total>cfg.cap||total<1)continue;
    const tender=tenderFor(total,state.level);
    if(tender===null)continue;
    return{items,total,tender,change:tender-total};
  }
  // Khi còn rất ít hàng, vẫn ưu tiên hóa đơn có thể thanh toán, không để game kẹt.
  const cheapest=[...pool].sort((a,b)=>a.price-b.price)[0];
  if(cheapest.price>cfg.cap)return null;
  const tender=tenderFor(cheapest.price,state.level);
  if(tender===null)return null;
  return{items:[{id:cheapest.id,name:cheapest.name,emoji:cheapest.emoji,price:cheapest.price,qty:1}],total:cheapest.price,tender,change:tender-cheapest.price};
}
function makeQuiz(order){
  const lines=order.items,first=lines.find(x=>x.qty>=2)||lines[0],a=lines[0],b=lines[1];
  let q;
  const i=state.counters[state.level]++;const change=order.change;
  if(state.level==='easy'){
    if(i%2===0){
      if(b){q={op:'+',label:'CỘNG',title:'Tính tổng giá tiền',prompt:`${a.name} giá ${a.price} nghìn, ${b.name} giá ${b.price} nghìn. Cả hai món hết bao nhiêu nghìn đồng?`,answer:a.price+b.price,unit:'nghìn',nums:[a.price,b.price]};}
      else{q={op:'+',label:'CỘNG',title:'Cộng hai số',prompt:`Cô Mèo chia ${a.price} nghìn đồng thành 2 phần: ${Math.floor(a.price/2)} nghìn và phần còn lại. Tổng hai phần bằng bao nhiêu nghìn?`,answer:a.price,unit:'nghìn',nums:[Math.floor(a.price/2),Math.ceil(a.price/2)]};}
    }else{q={op:'-',label:'TRỪ',title:'Tính tiền thừa',prompt:`Khách đưa ${order.tender} nghìn đồng để mua hàng hết ${order.total} nghìn. Khách cần nhận lại bao nhiêu nghìn đồng?`,answer:change,unit:'nghìn',nums:[order.tender,order.total]};}
  }else if(state.level==='medium'){
    if(i%3===0){q={op:'*',label:'NHÂN',title:'Tính giá nhiều món',prompt:`Mỗi ${first.name.toLowerCase()} giá ${first.price} nghìn đồng. Mua ${first.qty} món cùng loại hết bao nhiêu nghìn đồng?`,answer:first.price*first.qty,unit:'nghìn',nums:[first.price,first.qty]};}
    else if(i%3===1){const totalA=a.price*a.qty,totalB=b?b.price*b.qty:0;q={op:'+',label:'CỘNG',title:'Cộng tiền các món',prompt:b?`${a.qty} × ${a.price} = ${totalA} nghìn và ${b.qty} × ${b.price} = ${totalB} nghìn. Tổng tiền hai loại là bao nhiêu nghìn?`:`Khách có ${totalA} nghìn đồng và nhận thêm 10 nghìn. Khách có tất cả bao nhiêu nghìn?`,answer:b?totalA+totalB:totalA+10,unit:'nghìn',nums:b?[totalA,totalB]:[totalA,10]};}
    else{q={op:'-',label:'TRỪ',title:'Tính tiền trả lại',prompt:`Khách đưa ${order.tender} nghìn, mua hết ${order.total} nghìn. Tiền thừa là bao nhiêu nghìn?`,answer:change,unit:'nghìn',nums:[order.tender,order.total]};}
  }else{
    switch(i%4){
      case 0:{const line=first; q={op:'/',label:'CHIA',title:'Tìm giá của một món',prompt:`Một lốc gồm ${line.qty} ${line.name.toLowerCase()} giống nhau có giá ${line.price*line.qty} nghìn đồng. Nếu chia đều tiền, mỗi món giá bao nhiêu nghìn?`,answer:line.price,unit:'nghìn',nums:[line.price*line.qty,line.qty]};break;}
      case 1:q={op:'*',label:'NHÂN',title:'Tính tiền theo số lượng',prompt:`${first.qty} món ${first.name.toLowerCase()}, mỗi món ${first.price} nghìn đồng. Hết bao nhiêu nghìn đồng?`,answer:first.price*first.qty,unit:'nghìn',nums:[first.price,first.qty]};break;
      case 2:{const v1=a.qty*a.price,v2=b?b.qty*b.price:0;q={op:'+',label:'CỘNG',title:'Cộng các dòng hóa đơn',prompt:b?`Hai dòng hàng lần lượt thành tiền ${v1} nghìn và ${v2} nghìn. Cộng lại bằng bao nhiêu nghìn?`:`Tiền mua hàng ${v1} nghìn, thêm món 5 nghìn. Tổng cộng?`,answer:b?v1+v2:v1+5,unit:'nghìn',nums:b?[v1,v2]:[v1,5]};break;}
      default:q={op:'-',label:'TRỪ',title:'Tính tiền thừa',prompt:`Khách đưa ${order.tender} nghìn đồng, hóa đơn ${order.total} nghìn. Hãy tính số tiền cần trả lại.`,answer:change,unit:'nghìn',nums:[order.tender,order.total]};
    }
  }
  return q;
}
/* Khách di chuyển trên đường từ cửa -> kệ sách -> thu ngân -> ra về.
   Mọi hẹn giờ đều gắn với hóa đơn hiện tại, tránh chuyển động nhầm khách. */
let customerWalkTimers=[];
function stopCustomerWalk(){
  customerWalkTimers.forEach(clearTimeout);
  customerWalkTimers=[];
  const sprite=$('walking-customer');
  if(sprite)sprite.classList.remove('is-walking','is-celebrating');
  if($('check-answer-btn'))$('check-answer-btn').disabled=false;
  if($('quiz-answer'))$('quiz-answer').disabled=false;
}
function afterWalk(order,ms,fn){
  const timer=setTimeout(()=>{
    if(state.order===order&&state.open)fn();
  },ms);
  customerWalkTimers.push(timer);
}
function startCustomerWalk(){
  const order=state.order;if(!order)return;
  stopCustomerWalk();
  const sprite=$('walking-customer');
  sprite.style.transition='none';sprite.style.left='11%';sprite.style.opacity='1';
  sprite.classList.add('is-walking');
  $('walking-face').textContent=order.customer.emoji;
  $('walking-name').textContent=order.customer.name;
  $('walk-status').textContent='🚪 Khách vừa bước vào!';
  $('check-answer-btn').disabled=true;
  $('quiz-answer').disabled=true;
  // Cho trình duyệt vẽ vị trí ban đầu trước khi bắt đầu đi.
  afterWalk(order,80,()=>{
    sprite.style.transition='left 1.1s ease-in-out, opacity .4s ease';
    sprite.style.left='50%';
    $('walk-status').textContent='📚 Khách đang chọn sách...';
  });
  afterWalk(order,1550,()=>{
    $('walk-status').textContent='🛒 Khách mang sách ra quầy...';
    sprite.style.left='89%';
  });
  afterWalk(order,2800,()=>{
    sprite.classList.remove('is-walking');
    $('walk-status').textContent='🧮 Đã tới quầy, bé hãy tính tiền!';
    $('check-answer-btn').disabled=false;
    $('quiz-answer').disabled=false;
  });
}
function startCustomerExit(){
  const order=state.order;if(!order)return;
  stopCustomerWalk();
  const sprite=$('walking-customer');
  sprite.classList.add('is-celebrating');
  $('walk-status').textContent='🎉 Thanh toán thành công!';
  afterWalk(order,800,()=>{
    sprite.classList.remove('is-celebrating');sprite.classList.add('is-walking');
    $('walk-status').textContent='👋 Khách đang rời tiệm...';
    sprite.style.left='50%';
  });
  afterWalk(order,2050,()=>{sprite.style.left='11%';});
  afterWalk(order,3250,()=>{
    sprite.classList.remove('is-walking');sprite.style.opacity='0';
    $('walk-status').textContent='✅ Hẹn gặp lại! Mời khách tiếp theo.';
  });
}
function callCustomer(){
  if(!state.open){nav('shop');toast('Hãy mở cửa tiệm trước nhé!');return;}
  if(state.order&&state.order.stage!=='success')return;
  const generated=tryGenerateOrder();
  if(!generated){toast('📦 Thiếu hàng phù hợp với cấp độ này. Hãy nhập thêm các mặt hàng giá thấp!');nav('stock');return;}
  const quiz=makeQuiz(generated);
  state.order={...generated,quiz,customer:pick(PEOPLE),stage:'quiz',notes:[],wrong:0};
  clearScratch();
  sound();redraw();nav('checkout');
  $('quiz-answer').value='';$('quiz-feedback').textContent='';$('quiz-feedback').className='response-message';
  $('payment-feedback').textContent='';$('payment-feedback').className='response-message';
  startCustomerWalk();
}
function renderCounter(){
  const order=state.order;
  $('closed-counter').classList.toggle('hidden',state.open);
  $('no-customer').classList.toggle('hidden',!state.open||!!order);
  $('active-order').classList.toggle('hidden',!state.open||!order);
  if(!state.open||!order)return;
  $('customer-avatar').textContent=order.customer.emoji;$('customer-name').textContent=order.customer.name;
  $('customer-speech').textContent=order.customer.words;
  $('receipt-items').innerHTML=order.items.map(x=>`<div class="receipt-item"><span class="product-icon">${escapeHTML(x.emoji)}</span><div class="receipt-info"><b>${escapeHTML(x.name)}</b><small>${x.qty} × ${fmt(x.price)}</small></div><strong>${fmt(x.price*x.qty)}</strong></div>`).join('');
  $('receipt-total').textContent=fmt(order.total);
  const step=order.stage;
  $('step-question').className='step-dot '+(step==='quiz'?'active':'done');$('step-payment').className='step-dot '+(step==='payment'?'active':step==='success'?'done':'');
  $('quiz-panel').classList.toggle('hidden',step!=='quiz');$('payment-panel').classList.toggle('hidden',step!=='payment');$('success-panel').classList.toggle('hidden',step!=='success');
  if(step==='quiz'){
    $('challenge-operation').textContent=order.quiz.label;$('quiz-title').textContent=order.quiz.title;$('quiz-prompt').textContent=order.quiz.prompt;$('quiz-suffix').textContent=order.quiz.unit;
  }else if(step==='payment')renderPayment();
}
function checkAnswer(){
  const order=state.order;if(!order||order.stage!=='quiz')return;
  const raw=$('quiz-answer').value.trim();if(raw===''){setFeedback('quiz-feedback','Nhập kết quả trước khi kiểm tra nhé!','error');return;}
  const answer=Number(raw);
  if(!Number.isInteger(answer)||answer<0){setFeedback('quiz-feedback','Hãy nhập một số tự nhiên nhé!','error');return;}
  if(answer===order.quiz.answer){order.stage='payment';$('walk-status').textContent='💵 Khách đang chờ nhận tiền thừa.';sound('good');toast('🌟 Chính xác! Bây giờ đến phần thối tiền.');renderCounter();}
  else{order.wrong++;state.streak=0;setFeedback('quiz-feedback','Chưa đúng rồi. Em thử tính lại hoặc mở giấy nháp nhé! 💪','error');sound('bad');redraw();}
}
function setFeedback(id,message,type){const el=$(id);el.textContent=message;el.className='response-message '+(type||'');}
function catSVG(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 66" aria-hidden="true"><path d="M11 27 9 6l18 10Q34 10 43 16L58 6l-3 21q9 13-1 25-9 11-25 9Q6 59 7 41q0-8 4-14Z" fill="#fff7e4" stroke="#5c725c" stroke-width="2.6" stroke-linejoin="round"/><path d="m14 14 1 11 10-7ZM51 14l-1 11-10-7Z" fill="#f8b8aa"/><ellipse cx="23" cy="37" rx="3" ry="4" fill="#4a5547"/><ellipse cx="43" cy="37" rx="3" ry="4" fill="#4a5547"/><path d="m30 45 3-2 3 2-3 3Z" fill="#e9a6a3"/><path d="M33 48q-4 5-8 1m8-1q4 5 8 1" fill="none" stroke="#647b60" stroke-width="1.8" stroke-linecap="round"/><path d="M20 46 7 44m13 5L8 51m38-5 13-2m-13 5 12 2" fill="none" stroke="#647b60" stroke-width="1.6" stroke-linecap="round"/></svg>`;}
function noteHTML(value,isButton=true){const tag=isButton?'button':'div';return `<${tag} ${isButton?'type="button" data-denom="'+value+'" aria-label="Chọn tờ tiền mèo '+value+' nghìn đồng"':''} class="banknote note-${value}">${catSVG()}<span class="note-copy"><b>${value}</b><small>NGHÌN ĐỒNG</small><small>TIỀN MÈO 🐾</small></span></${tag}>`;}
function renderPayment(){
  const o=state.order;if(!o)return;
  $('customer-note').innerHTML=noteHTML(o.tender,false);$('paid-amount').textContent=fmt(o.tender);$('bill-amount').textContent=fmt(o.total);
  $('banknote-grid').innerHTML=DENOMS.map(n=>noteHTML(n)).join('');renderSelectedMoney();
}
function renderSelectedMoney(){
  const o=state.order;if(!o)return;const sum=o.notes.reduce((acc,n)=>acc+n,0);
  $('change-sum').textContent=fmt(sum);
  $('selected-notes').innerHTML=o.notes.length?o.notes.map(n=>`<span class="note-token">🐱 ${n}k</span>`).join(''):'Chưa chọn tờ tiền nào';
}
function chooseMoney(value){const o=state.order;if(!o||o.stage!=='payment')return;o.notes.push(value);renderSelectedMoney();sound();setFeedback('payment-feedback','','');}
function undoMoney(){const o=state.order;if(!o||o.stage!=='payment')return;o.notes.pop();renderSelectedMoney();}
function clearMoney(){const o=state.order;if(!o||o.stage!=='payment')return;o.notes=[];renderSelectedMoney();}
function checkChange(){
  const o=state.order;if(!o||o.stage!=='payment')return;
  const given=o.notes.reduce((s,n)=>s+n,0);
  if(given!==o.change){o.wrong++;state.streak=0;setFeedback('payment-feedback',given>o.change?'Em trả hơi nhiều rồi! Bớt một vài tờ tiền nhé.':'Còn thiếu tiền thừa. Em có thể dùng phép trừ trong giấy nháp.','error');sound('bad');redraw();return;}
  // Chỉ xuất kho khi cả phép tính và tiền thừa đều đúng.
  for(const line of o.items){const item=state.items.find(x=>x.id===line.id);if(item)item.stock=Math.max(0,item.stock-line.qty);}
  state.balance+=o.total;state.salesToday+=o.total;state.totalSales+=o.total;state.served++;state.stars+=10;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);
  o.stage='success';$('success-text').textContent=`${o.customer.name} mua hết ${fmt(o.total)}. Bé đã trả đúng ${fmt(o.change)} và thêm một lượt bán thành công!`;
  sound('good');redraw();renderCounter();startCustomerExit();toast('🏅 +10 sao! Bé thối tiền đúng rồi!');
}
function renderInventory(){
  document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('is-selected',x.dataset.filter===currentFilter));
  const filtered=state.items.filter(x=>currentFilter==='Tất cả'||x.category===currentFilter);
  $('inventory-grid').innerHTML=filtered.map(p=>`<article class="product-card"><div class="product-top"><span class="product-pic">${escapeHTML(p.emoji)}</span><span class="stock-indicator ${p.stock<3?'low':''}">Kho: ${p.stock}</span></div><h3>${escapeHTML(p.name)}</h3><div class="product-category">${escapeHTML(p.category)}</div><div class="product-prices"><div><span>Giá bán</span><b>${fmt(p.price)}</b></div><button type="button" data-edit="${escapeHTML(p.id)}" aria-label="Sửa giá bán của ${escapeHTML(p.name)}">✎ Sửa</button></div><div class="product-category">Giá nhập: ${fmt(p.cost)}/món</div><form class="restock-form" data-restock="${escapeHTML(p.id)}"><input type="number" min="1" max="99" value="5" aria-label="Số lượng muốn nhập"><button class="btn btn-primary" type="submit">＋ Nhập thêm</button></form></article>`).join('');
}
function restock(id,quantity){
  const item=state.items.find(x=>x.id===id);if(!item)return;
  if(!Number.isSafeInteger(quantity)||quantity<1||quantity>99){toast('Số lượng nhập phải từ 1 đến 99.');return;}
  const cost=quantity*item.cost;
  if(cost>state.balance){toast(`🪙 Thiếu quỹ! Cần ${fmt(cost)}, đang có ${fmt(state.balance)}.`);return;}
  item.stock+=quantity;state.balance-=cost;redraw();renderInventory();sound('good');toast(`📦 Đã nhập thêm ${quantity} ${item.name}. Trừ ${fmt(cost)}.`);
}
function addItem(form){
  const data=new FormData(form),name=String(data.get('name')||'').trim(),emoji=String(data.get('emoji')),category=String(data.get('category'));
  const price=Number(data.get('price')),cost=Number(data.get('cost')),quantity=Number(data.get('quantity'));
  if(!name||name.length>36||!CATEGORIES.includes(category)||!Number.isSafeInteger(price)||price<1||price>200||!Number.isSafeInteger(cost)||cost<1||cost>199||!Number.isSafeInteger(quantity)||quantity<0||quantity>99){toast('⚠️ Vui lòng nhập giá, số lượng và tên mặt hàng hợp lệ.');return;}
  if(cost>price){toast('Giá nhập không nên lớn hơn giá bán. Hãy sửa lại nhé.');return;}
  if(quantity*cost>state.balance){toast(`🪙 Quỹ chưa đủ ${fmt(quantity*cost)} để nhập mặt hàng này.`);return;}
  state.balance-=quantity*cost;
  state.items.push({id:'custom-'+Date.now()+'-'+rand(100,999),name,emoji,category,price,cost,stock:quantity});
  form.reset();currentFilter='Tất cả';redraw();renderInventory();sound('good');toast(`✨ Đã thêm ${name} vào cửa tiệm!`);
}
function editPrice(id){const p=state.items.find(x=>x.id===id);if(!p)return;const raw=prompt(`Giá bán mới cho ${p.name} (đơn vị nghìn đồng):`,String(p.price));if(raw===null)return;const n=Number(raw);if(!Number.isSafeInteger(n)||n<1||n>200){toast('Hãy nhập giá từ 1 đến 200 nghìn.');return;}p.price=n;redraw();renderInventory();toast(`Đã thay đổi giá ${p.name} thành ${fmt(n)}.`);}
const ACHIEVEMENTS=[
  {icon:'🌱',name:'Khách đầu tiên',desc:'Phục vụ 1 khách hàng',ready:s=>s.served>=1},
  {icon:'🧮',name:'Bé tính giỏi',desc:'Phục vụ được 5 khách hàng',ready:s=>s.served>=5},
  {icon:'🐱',name:'Bậc thầy thối tiền',desc:'Phục vụ 10 khách hàng',ready:s=>s.served>=10},
  {icon:'⭐',name:'Ngôi sao chăm chỉ',desc:'Đạt 100 sao',ready:s=>s.stars>=100},
  {icon:'🎯',name:'Siêu tập trung',desc:'Có chuỗi 5 khách không sai',ready:s=>s.bestStreak>=5},
  {icon:'🏠',name:'Tiệm sách lớn mạnh',desc:'Vượt qua 3 ngày bán hàng',ready:s=>s.day>=4}
];
function renderRewards(){
  $('achievement-grid').innerHTML=ACHIEVEMENTS.map(a=>{const ok=a.ready(state);return `<article class="achievement ${ok?'unlocked':''}"><span class="achievement-icon">${ok?a.icon:'🔒'}</span><h3>${escapeHTML(a.name)}</h3><p>${escapeHTML(a.desc)}</p><small>${ok?'✓ ĐÃ MỞ KHÓA':'CHƯA MỞ KHÓA'}</small></article>`}).join('');
  $('day-summary').innerHTML=`<div><small>Doanh thu hôm nay</small><strong>${fmt(state.salesToday)}</strong></div><div><small>Tổng doanh thu</small><strong>${fmt(state.totalSales)}</strong></div><div><small>Chuỗi đúng tốt nhất</small><strong>${state.bestStreak} khách</strong></div>`;
}
/* Canvas: vẽ bằng ngón tay / chuột; điểm được lưu theo tọa độ CSS pixel. */
let strokeHistory=[],currentStroke=null,drawScale=1;
function canvasContext(){return $('drawing-canvas').getContext('2d');}
function repaintCanvas(){
  const c=$('drawing-canvas'),rect=c.getBoundingClientRect();if(!rect.width)return;
  const ratio=Math.min(window.devicePixelRatio||1,2);drawScale=ratio;
  c.width=Math.round(rect.width*ratio);c.height=Math.round(rect.height*ratio);
  const ctx=canvasContext();ctx.setTransform(ratio,0,0,ratio,0,0);ctx.lineWidth=3.5;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#344b73';
  for(const stroke of strokeHistory){if(!stroke.length)continue;ctx.beginPath();ctx.moveTo(stroke[0].x,stroke[0].y);if(stroke.length===1)ctx.lineTo(stroke[0].x+.1,stroke[0].y+.1);else stroke.slice(1).forEach(pt=>ctx.lineTo(pt.x,pt.y));ctx.stroke();}
}
function pointAt(event){const r=$('drawing-canvas').getBoundingClientRect();return {x:event.clientX-r.left,y:event.clientY-r.top};}
function clearScratch(){strokeHistory=[];if(!$('scratch-draw').classList.contains('hidden'))repaintCanvas();$('column-result').textContent='';}
function beginStroke(e){e.preventDefault();$('drawing-canvas').setPointerCapture(e.pointerId);currentStroke=[pointAt(e)];strokeHistory.push(currentStroke);repaintCanvas();}
function moveStroke(e){if(!currentStroke)return;currentStroke.push(pointAt(e));repaintCanvas();}
function endStroke(){currentStroke=null;}
function showScratch(){
  $('scratch-modal').classList.remove('hidden');document.body.style.overflow='hidden';
  if(!$('scratch-draw').classList.contains('hidden'))requestAnimationFrame(repaintCanvas);
}
function closeScratch(){$('scratch-modal').classList.add('hidden');document.body.style.overflow='';}
function selectScratch(tab){document.querySelectorAll('.scratch-tab').forEach(t=>t.classList.toggle('is-active',t.dataset.scratch===tab));$('scratch-draw').classList.toggle('hidden',tab!=='draw');$('scratch-column').classList.toggle('hidden',tab!=='column');if(tab==='draw')requestAnimationFrame(repaintCanvas);else renderColumn();}
function loadQuizNumbers(){const o=state.order;if(!o){toast('Chưa có câu hỏi. Hãy gọi khách vào quầy trước nhé.');return;}const [a,b]=o.stage==='payment'?[o.tender,o.total]:o.quiz.nums,op=o.stage==='payment'?'-':o.quiz.op;$('col-first').value=a;$('col-second').value=b;$('col-operation').value=op;renderColumn();toast('Đã điền số của bước hiện tại. Bé tự đặt tính nhé!');}
function renderColumn(){
  const a=Math.max(0,Math.trunc(num($('col-first').value))),b=Math.max(0,Math.trunc(num($('col-second').value))),op=$('col-operation').value;
  $('column-result').textContent='';
  if(op==='/'){
    $('column-visual').innerHTML=`<div class="division-math"><div class="division-top"><span>${a}</span><div>${b}<div><input aria-label="Thương số" id="div-quotient" type="number" min="0" inputmode="numeric" placeholder="?" /></div></div></div><div class="division-below">Số dư: <input id="div-remainder" type="number" min="0" inputmode="numeric" value="0" /></div></div>`;
    return;
  }
  const symbol=op==='*'?'×':op==='-'?'−':'+';const width=Math.max(4,String(a).length+1,String(b).length+1),digits=Array.from({length:width},(_,i)=>`<input type="text" inputmode="numeric" maxlength="1" aria-label="Chữ số kết quả thứ ${i+1} từ trái sang" data-digit="${i}">`).join('');
  const carry=Array.from({length:width},(_,i)=>`<input type="text" inputmode="numeric" maxlength="1" aria-label="Số nhớ cột ${i+1}" data-carry="${i}">`).join('');
  $('column-visual').innerHTML=`<div class="column-math"><div class="math-carry">${carry}</div><div class="math-row">${a}</div><div class="math-row operator-row"><b>${symbol}</b>${b}</div><div class="math-answer">${digits}</div></div>`;
}
function checkColumn(){
  const a=Math.trunc(num($('col-first').value)),b=Math.trunc(num($('col-second').value)),op=$('col-operation').value;
  let expected=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:null;
  const el=$('column-result');
  if(op==='/'){
    if(b===0){el.textContent='Không thể chia cho 0.';return;}
    const quo=$('div-quotient').value,rem=$('div-remainder').value;
    if(quo===''||rem===''){el.textContent='Điền thương và số dư nhé.';return;}
    const q=Number(quo),r=Number(rem);
    el.textContent=Number.isInteger(q)&&Number.isInteger(r)&&q===Math.floor(a/b)&&r===a%b?'✓ Chính xác rồi!':'Em thử chia lại nhé!';
  }else{
    const fields=[...document.querySelectorAll('[data-digit]')],raw=fields.map(x=>x.value.trim()).join('');
    if(raw===''||!/^[0-9]+$/.test(raw)){el.textContent='Điền các chữ số kết quả nhé.';return;}
    el.textContent=Number(raw)===expected?'✓ Đặt tính đúng rồi!':'Chưa đúng, kiểm tra lại từng cột nhé.';
  }
}
function handleReset(){if(!confirm('Bạn có chắc muốn xóa quỹ, kho hàng và toàn bộ tiến trình? Hành động này không hoàn tác được.'))return;stopCustomerWalk();state=freshState();currentFilter='Tất cả';redraw();renderRewards();renderInventory();nav('shop');toast('Đã tạo một cửa tiệm mới từ ngày đầu tiên.');}
/* Kết nối toàn bộ nút điều khiển, không cần thư viện bên ngoài. */
document.querySelectorAll('[data-nav]').forEach(btn=>btn.addEventListener('click',()=>nav(btn.dataset.nav)));
document.querySelectorAll('[data-level]').forEach(btn=>btn.addEventListener('click',()=>changeLevel(btn.dataset.level)));
$('open-close-btn').addEventListener('click',toggleStore);$('counter-open-btn').addEventListener('click',()=>{toggleStore();nav('checkout');});
$('go-checkout-btn').addEventListener('click',()=>nav('checkout'));$('go-stock-btn').addEventListener('click',()=>nav('stock'));
$('call-customer-btn').addEventListener('click',callCustomer);$('next-customer-btn').addEventListener('click',callCustomer);
$('check-answer-btn').addEventListener('click',checkAnswer);$('quiz-answer').addEventListener('keydown',e=>{if(e.key==='Enter')checkAnswer();});
$('banknote-grid').addEventListener('click',e=>{const button=e.target.closest('[data-denom]');if(button)chooseMoney(Number(button.dataset.denom));});
$('undo-note-btn').addEventListener('click',undoMoney);$('reset-notes-btn').addEventListener('click',clearMoney);$('check-change-btn').addEventListener('click',checkChange);
$('filter-row').addEventListener('click',e=>{const btn=e.target.closest('[data-filter]');if(btn){currentFilter=btn.dataset.filter;renderInventory();}});
$('inventory-grid').addEventListener('submit',e=>{const form=e.target.closest('[data-restock]');if(!form)return;e.preventDefault();restock(form.dataset.restock,Number(form.querySelector('input').value));});
$('inventory-grid').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]');if(edit)editPrice(edit.dataset.edit);});
$('add-item-form').addEventListener('submit',e=>{e.preventDefault();addItem(e.target);});
$('reset-game-btn').addEventListener('click',handleReset);
$('sound-btn').addEventListener('click',()=>{state.sound=!state.sound;redraw();if(state.sound)sound('good');});
['open-scratch-top','open-scratch-quiz','open-scratch-pay'].forEach(id=>$(id).addEventListener('click',showScratch));
$('close-scratch').addEventListener('click',closeScratch);$('scratch-modal').addEventListener('click',e=>{if(e.target===$('scratch-modal'))closeScratch();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeScratch();});
document.querySelectorAll('[data-scratch]').forEach(btn=>btn.addEventListener('click',()=>selectScratch(btn.dataset.scratch)));
$('clear-canvas').addEventListener('click',()=>{strokeHistory=[];repaintCanvas();});$('undo-stroke').addEventListener('click',()=>{strokeHistory.pop();repaintCanvas();});
$('drawing-canvas').addEventListener('pointerdown',beginStroke);$('drawing-canvas').addEventListener('pointermove',moveStroke);['pointerup','pointercancel','lostpointercapture'].forEach(type=>$('drawing-canvas').addEventListener(type,endStroke));
['col-first','col-operation','col-second'].forEach(id=>$(id).addEventListener('input',renderColumn));$('col-check-btn').addEventListener('click',checkColumn);$('load-quiz-numbers').addEventListener('click',loadQuizNumbers);
window.addEventListener('resize',()=>{if(!$('scratch-modal').classList.contains('hidden')&&!$('scratch-draw').classList.contains('hidden'))repaintCanvas();});
redraw();renderInventory();renderRewards();renderCounter();renderColumn();
