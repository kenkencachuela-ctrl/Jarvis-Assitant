const $ = id => document.getElementById(id);
const messages = $('messages');
let recognition = null, listening = false;
const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
const notesKey = 'jarvis-v2-notes';

function addMessage(role, text) {
  const node = document.createElement('div'); node.className = `bubble ${role}`;
  const who = document.createElement('span'); who.textContent = role === 'user' ? 'YOU' : 'J.A.R.V.I.S.';
  const p = document.createElement('p'); p.textContent = text;
  node.append(who,p); messages.append(node); messages.scrollTop = messages.scrollHeight;
}
function say(text) {
  if (!$('speakToggle').checked || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = $('languageSelect').value; u.rate = 1; u.pitch = .92;
  speechSynthesis.speak(u);
}
function setState(text) { $('systemState').textContent = text.toUpperCase(); }
function openSite(url) { window.open(url, '_blank', 'noopener'); }
function saveNote(text) {
  const list = JSON.parse(localStorage.getItem(notesKey) || '[]');
  list.unshift({id:Date.now(),text,created:new Date().toLocaleString()});
  localStorage.setItem(notesKey, JSON.stringify(list)); renderNotes();
}
function renderNotes() {
  const list = JSON.parse(localStorage.getItem(notesKey) || '[]'); const target=$('notesList'); target.replaceChildren();
  if (!list.length) { const empty=document.createElement('p'); empty.className='voice-hint'; empty.textContent='No notes saved yet.'; target.append(empty); return; }
  list.forEach(n=>{const row=document.createElement('div');row.className='note';const p=document.createElement('p');p.textContent=n.text;const del=document.createElement('button');del.textContent='DELETE';del.onclick=()=>{localStorage.setItem(notesKey,JSON.stringify(list.filter(x=>x.id!==n.id)));renderNotes()};row.append(p,del);target.append(row)});
}
async function getReply(raw) {
  const q=raw.trim(), s=q.toLowerCase();
  if (/^(hi|hello|hey jarvis|good morning|good afternoon|good evening)[.! ]*$/.test(s)) return 'Hello. I am online and ready to assist.';
  if (/\b(time|what time)\b/.test(s)) return `The time is ${new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}.`;
  if (/\b(date|what day|today)\b/.test(s)) return `Today is ${new Date().toLocaleDateString([], {weekday:'long',year:'numeric',month:'long',day:'numeric'})}.`;
  if (/system status|status report|command center/.test(s)) return `System online. Voice recognition: ${Speech?'supported by this browser':'not supported'}. Speech output: ${'speechSynthesis' in window?'available':'unavailable'}. AI brain: ${'checking secure backend'}.`;
  if (/what can you do|help|commands/.test(s)) return 'I can tell you the time and date, open supported websites, search the web, save notes, and speak replies. Connect a secure AI backend for open-ended intelligent conversations.';
  const openMatch=s.match(/^(?:jarvis[, ]*)?(?:open|launch|go to)\s+(youtube|google|gmail|wikipedia|facebook|tiktok|instagram)$/);
  if (openMatch) { const sites={youtube:'https://www.youtube.com',google:'https://www.google.com',gmail:'https://mail.google.com',wikipedia:'https://www.wikipedia.org',facebook:'https://www.facebook.com',tiktok:'https://www.tiktok.com',instagram:'https://www.instagram.com'}; openSite(sites[openMatch[1]]); return `Opening ${openMatch[1]}.`; }
  const searchMatch=s.match(/^(?:jarvis[, ]*)?(?:search(?: the web)? for|google)\s+(.+)/);
  if (searchMatch) {openSite('https://www.google.com/search?q='+encodeURIComponent(searchMatch[1]));return `Searching the web for ${searchMatch[1]}.`;}
  const noteMatch=q.match(/^(?:jarvis[, ]*)?(?:save a note|take a note|note)\s+(.+)/i);
  if (noteMatch) {saveNote(noteMatch[1]);return 'Your note has been saved on this device.';}
  if (/show notes|open notes/.test(s)) {switchView('notes');return 'Opening your notes.';}
  try {
    const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q})});
    if(response.ok){const data=await response.json();if(data.reply)return data.reply;}
  } catch(e) {}
  return 'I heard you. My local command set cannot answer that yet because the AI brain is not connected. Add a secure /api/chat backend to enable natural, open-ended conversations.';
}
async function send(raw) {
  const q=raw.trim(); if(!q)return;
  addMessage('user',q); $('messageInput').value=''; setState('Processing request');
  const reply=await getReply(q); addMessage('assistant',reply); say(reply); setState('Awaiting your command');
}
$('composer').addEventListener('submit',e=>{e.preventDefault();send($('messageInput').value)});
document.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.command)));
$('clearChat').onclick=()=>{messages.replaceChildren();addMessage('assistant','Conversation cleared. Ready for your next command.')};
function switchView(name) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('show'));
  $(name+'View').classList.add('show');
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===name));
  $('pageTitle').textContent={assistant:'Assistant',dashboard:'Dashboard',notes:'Notes'}[name];
  $('sidebar').classList.remove('open');
}
document.querySelectorAll('.nav').forEach(n=>n.addEventListener('click',()=>switchView(n.dataset.view)));
$('menuBtn').onclick=()=>$('sidebar').classList.toggle('open');
$('settingsBtn').onclick=()=>$('settingsDialog').showModal();
$('noteForm').addEventListener('submit',e=>{e.preventDefault();const v=$('noteInput').value.trim();if(v){saveNote(v);$('noteInput').value=''}});
function updateClock() {
  const now=new Date();$('dashTime').textContent=now.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});$('dashDate').textContent=now.toLocaleDateString([], {month:'short',day:'numeric'});
}
updateClock();setInterval(updateClock,10000);renderNotes();
$('voiceStatus').textContent=Speech?'AVAILABLE':'UNAVAILABLE';
async function checkAI(){try{const r=await fetch('/api/health');$('aiStatus').textContent=r.ok?'CONNECTED':'NOT CONNECTED'}catch(e){$('aiStatus').textContent='NOT CONNECTED'}}
checkAI();
$('listenBtn').onclick=()=>{
  if(!Speech){$('voiceHint').textContent='This browser does not support speech recognition. Try Chrome on Android.';return;}
  if(listening){recognition.stop();return;}
  recognition=new Speech();recognition.lang=$('languageSelect').value;recognition.interimResults=false;recognition.continuous=false;
  recognition.onstart=()=>{listening=true;$('listenBtn').classList.add('listening');$('listenBtn').querySelector('b').textContent='LISTENING...';$('voiceHint').textContent='Listening for one command...';setState('Listening');};
  recognition.onresult=e=>{const spoken=e.results[0][0].transcript;send(spoken);};
  recognition.onerror=e=>{$('voiceHint').textContent='Voice input error: '+e.error+'. You can type your command instead.'};
  recognition.onend=()=>{listening=false;$('listenBtn').classList.remove('listening');$('listenBtn').querySelector('b').textContent='START VOICE MODE';if($('systemState').textContent==='LISTENING')setState('Awaiting your command');if($('voiceHint').textContent==='Listening for one command...')$('voiceHint').textContent='Tap to speak again.'};
  recognition.start();
};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
