var typing = false;
var lastTypingTime;
document.addEventListener('DOMContentLoaded', async () => {
  socket.emit('join room', chatId);
  socket.on(
    'typing',
    () => (document.querySelector('.typingDots').style.display = 'block')
  );
  socket.on(
    'stop typing',
    () => (document.querySelector('.typingDots').style.display = 'none')
  );

  try {
    const chatName = document.querySelector('#chatName');
    const { data } = await axios({
      method: 'GET',
      url: `/api/chats/${chatId}`,
    });
    if (data) {
      chatName.textContent = getChatName(data);
    }
  } catch (error) {
    console.log(error);
    alert('could not update');
  }

  try {
    const chatName = document.querySelector('#chatName');
    const { data } = await axios({
      method: 'GET',
      url: `/api/chats/${chatId}/messages`,
    });
    if (data) {
      const messages = [];
      let lastSenderId = '';
      data.forEach((message, index) => {
        var html = createMessageHtml(message, data[index + 1], lastSenderId);
        messages.push(html);

        lastSenderId = message.sender._id;
      });
      const messagesHtml = messages.join('');
      addMessagesHtmlToPage(messagesHtml);
      scrollToBottom(false);
      markAllMessagesAsRead();
      document.querySelector('.loadingSpinnerContainer').remove();
      document.querySelector('.chatContainer').style.visibility = 'visible';
    }
  } catch (error) {
    console.log(error);
    alert('could not update');
  }
});

const chatNameButton = document.querySelector('#chatNameButton');
if (chatNameButton) {
  chatNameButton.addEventListener('click', async (event) => {
    const name = document.querySelector('#chatNameTextbox').value.trim();
    try {
      const { data } = await axios({
        method: 'PUT',
        url: '/api/chats/' + chatId,
        data: { chatName: name },
      });
      location.reload();
    } catch (error) {
      console.log(error);
      alert('could not update');
    }
  });
}

const sendMessageButton = document.querySelector('.sendMessageButton');
if (sendMessageButton) {
  sendMessageButton.addEventListener('click', () => {
    messageSubmitted();
  });
}
const inputTextbox = document.querySelector('.inputTextbox');
if (inputTextbox) {
  inputTextbox.addEventListener('keydown', (event) => {
    updateTyping();
    if (event.which === 13) {
      messageSubmitted();
      return false;
    }
  });
}

function updateTyping() {
  if (!connected) return;

  if (!typing) {
    typing = true;
    socket.emit('typing', chatId);
  }

  lastTypingTime = new Date().getTime();
  const timerLength = 3000;

  setTimeout(() => {
    const timeNow = new Date().getTime();
    const timeDiff = timeNow - lastTypingTime;

    if (timeDiff >= timerLength && typing) {
      socket.emit('stop typing', chatId);
      typing = false;
    }
  }, timerLength);
}

function addMessagesHtmlToPage(html) {
  const container = document.querySelector('.chatMessages');
  container.insertAdjacentHTML('beforeend', html);
}

function messageSubmitted() {
  let content = document.querySelector('.inputTextbox');
  content.value.trim();
  if (content != '') {
    sendMessage(content);
    content.value = '';
    socket.emit('stop typing', chatId);
    typing = false;
  }
}

const sendMessage = async (content) => {
  const textBoxContainer = document.querySelector('.inputTextbox');
  try {
    const payload = {
      content: content,
      chatId: chatId,
    };
    const { data, status } = await axios({
      method: 'POST',
      url: `/api/messages`,
      payload,
    });
    if (status != 201) {
      alert('Could not send message');
      textBoxContainer.value = content;
      return;
    }
    if (data) {
      addChatMessageHtml(data);
    }
    if (connected) {
      socket.emit('new message', data);
    }
  } catch (error) {
    console.log(error);
  }
};

function addChatMessageHtml(message) {
  if (!message || !message._id) {
    alert('Message is not valid');
    return;
  }

  const messageDiv = createMessageHtml(message, null, '');

  addMessagesHtmlToPage(messageDiv);
  scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {
  const sender = message.sender;
  const senderName = sender.firstName + ' ' + sender.lastName;

  const currentSenderId = sender._id;
  const nextSenderId = nextMessage != null ? nextMessage.sender._id : '';

  const isFirst = lastSenderId != currentSenderId;
  const isLast = nextSenderId != currentSenderId;

  let isMine = message.sender._id == userLoggedIn._id;
  let liClassName = isMine ? 'mine' : 'theirs';

  let nameElement = '';
  if (isFirst) {
    liClassName += ' first';

    if (!isMine) {
      nameElement = `<span class='senderName'>${senderName}</span>`;
    }
  }

  let profileImage = '';
  if (isLast) {
    liClassName += ' last';
    profileImage = `<img src='${sender.profilePic}'>`;
  }

  let imageContainer = '';
  if (!isMine) {
    imageContainer = `<div class='imageContainer'>
                                ${profileImage}
                            </div>`;
  }

  return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animated) {
  const container = document.querySelector('.chatMessages');
  const scrollHeight = container[0].scrollHeight;

  if (animated) {
    container.animate({ scrollTop: scrollHeight }, 'slow');
  } else {
    container.scrollTop(scrollHeight);
  }
}

const markAllMessagesAsRead = async () => {
  const { data } = await axios({
    method: 'PUT',
    url: `/api/chats/${chatId}/messages/markAsRead`,
  });
  if (data) {
    refreshMessagesBadge();
  }
};
