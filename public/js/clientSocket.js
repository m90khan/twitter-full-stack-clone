let connected = false;

let socket = io('http://localhost:3000');
socket.emit('setup', userLoggedIn);
socket.on('connected', () => {
  connected = true;
});

socket.on('notification received', () => {
  axios({
    method: 'GET',
    url: '/api/notifications/latest',
  }).then(({ data }) => {
    console.log('recieved', data);
    refreshNotificationsBadge();
    showNotificationPopup(data);
  });
});

function emitNotification(userId) {
  if (userId == userLoggedIn._id) return;

  socket.emit('notification received', userId);
}
socket.on('message received', (newMessage) => messageReceived(newMessage));
