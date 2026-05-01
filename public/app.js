let mode = 'ara';
let lastReply = "";

function setMode(m) { mode = m; }

function detectMood(text) {
  text = text.toLowerCase();

  if (text.includes("love") || text.includes("sayang"))
    return "Affectionate";
  if (text.includes("ignore") || text.includes("diam"))
    return "Annoyed";
  if (text.includes("takut"))
    return "Playful";
  if (text.includes("mati") || text.includes("bunuh"))
    return "Dangerous";

  return "Calm";
}

async function send() {
  const input = document.getElementById("input");

  if (!input.value.trim()) {
    showPopup("Pesan kosong");
    return;
  }

  document.getElementById("kurumiMood").innerText =
    "Kurumi: " + detectMood(input.value);

  addMsg(input.value, 'user');

  const userText = input.value;
  input.value = "";

  const res = await fetch('/api/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      message: userText,
      userId: "user1",
      mode
    })
  });

  const data = await res.json();

  if (!data.reply) {
    showPopup("API Error / No response");
    return;
  }

  lastReply = data.reply;
  vnEffect(lastReply);
}

function addMsg(text, type) {
  const chat = document.getElementById('chat');

  const wrapper = document.createElement('div');
  wrapper.className = 'chatWrap ' + type;

  const name = document.createElement('div');
  name.className = 'chatName';
  name.innerText = type === 'user' ? 'You' : 'Kurumi';

  const bubble = document.createElement('div');
  bubble.className = 'msg ' + type;
  bubble.innerText = text;

  wrapper.appendChild(name);
  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);

  scrollBottom();
}

function vnEffect(text) {
  const chat = document.getElementById('chat');

  const wrapper = document.createElement('div');
  wrapper.className = 'chatWrap bot';

  const name = document.createElement('div');
  name.className = 'chatName';
  name.innerText = 'Kurumi';

  const bubble = document.createElement('div');
  bubble.className = 'msg bot';

  wrapper.appendChild(name);
  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);

  let i = 0;
  const interval = setInterval(() => {
    bubble.innerText += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 18);

  scrollBottom();
}

function scrollBottom() {
  const chat = document.getElementById('chat');

  setTimeout(() => {
    chat.scrollTop = chat.scrollHeight;
  }, 50);
}

function showPopup(text) {
  const popup = document.getElementById("popup");
  popup.innerText = text;
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 2000);
}