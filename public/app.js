const socket = io();

// Элементы DOM
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const usernameInput = document.getElementById('username-input');
const avatarUrlInput = document.getElementById('avatar-url-input');
const saveProfileBtn = document.getElementById('save-profile-btn');
const currentAvatarImg = document.getElementById('current-avatar');

// Инициализация профиля из LocalStorage
let userProfile = {
    username: localStorage.getItem('tg_username') || 'Пользователь ' + Math.floor(Math.random() * 1000),
    avatar: localStorage.getItem('tg_avatar') || 'https://hiclipart.com'
};

// Заполняем инпуты текущими данными
usernameInput.value = userProfile.username;
avatarUrlInput.value = userProfile.avatar;
currentAvatarImg.src = userProfile.avatar;

// Сохранение профиля
saveProfileBtn.addEventListener('click', () => {
    const newName = usernameInput.value.trim();
    const newAvatar = avatarUrlInput.value.trim();

    if (newName) userProfile.username = newName;
    if (newAvatar) userProfile.avatar = newAvatar;

    localStorage.setItem('tg_username', userProfile.username);
    localStorage.setItem('tg_avatar', userProfile.avatar);
    currentAvatarImg.src = userProfile.avatar;
    
    alert('Профиль обновлен!');
});

// Рендеринг одного сообщения на экран
function appendMessage(msg) {
    const isMe = msg.username === userProfile.username;
    const msgContainer = document.createElement('div');
    msgContainer.classList.add('msg-container');
    if (isMe) msgContainer.classList.add('my-message');

    msgContainer.innerHTML = `
        <img class="msg-avatar" src="${msg.avatar}" alt="Ava">
        <div class="msg-bubble">
            <div class="msg-author">${msg.username}</div>
            <div class="msg-text">${msg.text}</div>
            <div class="msg-time">${msg.time}</div>
        </div>
    `;

    chatMessages.appendChild(msgContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Скролл вниз
}

// Отправка формы
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    // Отправляем объект на сервер
    socket.emit('send-message', {
        username: userProfile.username,
        avatar: userProfile.avatar,
        text: text
    });

    messageInput.value = '';
    messageInput.focus();
});

// Слушаем историю сообщений при входе
socket.on('chat-history', (history) => {
    chatMessages.innerHTML = '';
    history.forEach(msg => appendMessage(msg));
});

// Слушаем новые сообщения в реальном времени
socket.on('receive-message', (msg) => {
    appendMessage(msg);
});
