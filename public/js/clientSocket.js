let connected = false;

let socket = io('http://localhost:3000');
socket.emit('setup', userLoggedIn);
socket.on('connected', () => {
  connected = true;
});

socket.on('notification received', async () => {
  console.log('recived');
  try {
    const { data } = await axios({
      method: 'GET',
      url: '/api/notifications/latest',
    });

    console.log('Worked');
    console.log(data);
    refreshNotificationsBadge();
    showNotificationPopup(data);
  } catch (error) {
    console.log(error);
  }
});

function emitNotification(userId) {
  if (userId == userLoggedIn._id) return;

  socket.emit('notification received', userId);
}
socket.on('message received', (newMessage) => messageReceived(newMessage));
