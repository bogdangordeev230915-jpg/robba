const socket = io();
let myName = '';

const $login = document.getElementById('login');
const $chat = document.getElementById('chat');
const $username = document.getElementById('username');
const $enterBtn = document.getElementById('enterBtn');
const $logoutBtn = document.getElementById('logoutBtn');
const $me = document.getElementById('me');
const $form = document.getElementById('form');
const $input = document.getElementById('input');
const $messages = document.getElementById('messages');
const $userList = document.getElementById('userList');

$enterBtn.onclick = enter;
$username.addEventListener('keydown', e => e.key === 'Enter' && enter());

function enter() {
  const name = $username.value.trim();
  if (!name) return;
  myName = name;
  socket.emit('join', name);
  $login.classList.add('hidden');
  $chat.classList.remove('hidden');
  $me.textContent = name;
  $input.focus();
}

$logoutBtn.onclick = () => location.reload();

$form.onsubmit = (e) => {
  e.preventDefault();
  const text = $input.value.trim();
  if (!text) return;
  socket.emit('message', text);
  $input.value = '';
};

socket.on('history', (msgs) => {
  $messages.innerHTML = '';
  msgs.forEach(renderMessage);
});

socket.on('message', renderMessage);

socket.on('system', (text) => {
  const div = document.createElement('div');
  div.className = 'system';
  div.textContent = text;
  $messages.appendChild(div);
  scrollDown();
});

socket.on('users', (list) => {
  $userList.innerHTML = '';
  list.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u;
    $userList.appendChild(li);
  });
});

function renderMessage({ username, text }) {
  const wrap = document.createElement('div');
  wrap.className = 'msg' + (username === myName ? ' me' : '');
  wrap.innerHTML = `<div class="author">${escapeHtml(username)}</div>
                    <div class="bubble">${escapeHtml(text)}</div>`;
  $messages.appendChild(wrap);
  scrollDown();
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function scrollDown() {
  $messages.scrollTop = $messages.scrollHeight;
}