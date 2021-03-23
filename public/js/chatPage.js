let typing = false;
let lastTypingTime;
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
  // GET chat name > chatId is parsed from pug
  try {
    const chatName = document.querySelector('#chatName');
    const { data } = await axios({
      method: 'GET',
      url: `/api/chats/${chatId}`,
    });
    if (data) {
      chatName.innerHTML = getChatName(data);
    }
  } catch (error) {
    console.log(error);
    alert('could not update');
  }
  // GET chat messages
  try {
    const { data } = await axios({
      method: 'GET',
      url: `/api/chats/${chatId}/messages`,
    });
    if (data) {
      const messages = [];
      let lastSenderId = ''; // id of the sender of the last message
      data.forEach((message, index) => {
        //  data[index + 1] : to get the next message
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
// Change Chat Name
const chatNameButton = document.querySelector('#chatNameButton');
if (chatNameButton) {
  chatNameButton.addEventListener('click', async (event) => {
    const name = document.querySelector('#chatNameTextbox').value.trim();
    try {
      const { data, status } = await axios({
        method: 'PUT',
        url: '/api/chats/' + chatId,
        data: { chatName: name }, //chatName from schema
      });
      location.reload();
    } catch (error) {
      console.log(error);
      alert('could not update');
    }
  });
}
// Send Message Button
const sendMessageButton = document.querySelector('.sendMessageButton');
if (sendMessageButton) {
  sendMessageButton.addEventListener('click', () => {
    messageSubmitted();
  });
}
// Chat textbox on Enter
const inputTextbox = document.querySelector('.inputTextbox');
if (inputTextbox) {
  inputTextbox.addEventListener('keydown', (event) => {
    updateTyping();
    if (event.which === 13 && !event.shiftKey) {
      // shift+enter for new line
      messageSubmitted();
      return false; // prevent textbox to proceed further with enter key
    }
  });
}
function messageSubmitted() {
  let content = document.querySelector('.inputTextbox');
  const contentValue = content.value.trim();
  if (contentValue != '') {
    sendMessage(contentValue);
    content.value = '';
    socket.emit('stop typing', chatId);
    typing = false;
  }
}
function updateTyping() {
  if (!connected) return;

  if (!typing) {
    typing = true;
    socket.emit('typing', chatId);
  }

  lastTypingTime = new Date().getTime();
  const timerLength = 3000;
  //run after 3 seconds
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
// Send Server to Server
const sendMessage = async (content) => {
  const textBoxContainer = document.querySelector('.inputTextbox');
  try {
    const { data, status } = await axios({
      method: 'POST',
      url: `/api/messages`,
      data: {
        content: content,
        chatId: chatId,
      },
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
function monthName(mon) {
  return [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][mon];
}
function createMessageHtml(message, nextMessage, lastSenderId) {
  const sender = message.sender;
  const senderName = sender.firstName + ' ' + sender.lastName;

  const currentSenderId = sender._id;
  const nextSenderId = nextMessage != null ? nextMessage.sender._id : '';

  const isFirst = lastSenderId != currentSenderId; // lastpersonSentMessage is not currentpersonSentMessage
  const isLast = nextSenderId != currentSenderId; // nextMessageSender is not currentSender = last Message

  const isMine = message.sender._id == userLoggedIn._id;
  let liClassName = isMine ? 'mine' : 'theirs';

  const time = `${monthName(new Date(message.createdAt).getUTCMonth())} ${new Date(
    message.createdAt
  ).getUTCDate()}, ${new Date(message.createdAt).getUTCFullYear()}, ${new Date(
    message.createdAt
  ).getUTCHours()}:${new Date(message.createdAt).getUTCMinutes()}`;

  const timeElement = `<span class='senderName'>${time}</span>`;

  let nameElement = '';
  if (isFirst) {
    liClassName += ' first';
    if (!isMine) {
      nameElement = `<span class='senderName'><a href='/profile/${sender.username}'>${senderName}</a></span>`;
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
                             <a href='/profile/${sender.username}'>   ${profileImage} </a>
                            </div>`;
  }

  return `<li class='message ${liClassName}'>
                    ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                    ${timeElement}

                </div>
          </li>`;
}

function scrollToBottom(animated) {
  const container = document.querySelector('.chatMessages');
  // const scrollHeight = container[0].scrollHeight;
  container.scrollTop = container.scrollHeight;
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
