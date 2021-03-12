// let connected = false;

// let socket = io('http://localhost:3000');
// socket.emit('setup', userLoggedIn);

// socket.on('connected', () => (connected = true));
// socket.on('message received', (newMessage) => messageReceived(newMessage));

// socket.on('notification received', async () => {
//   try {
//     const { data } = await axios({
//       method: 'GET',
//       url: '/api/notifications/latest',
//     });

//     if (data) {
//       showNotificationPopup(data);
//       refreshNotificationsBadge();
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });

// function emitNotification(userId) {
//   if (userId == userLoggedIn._id) return;

//   socket.emit('notification received', userId);
// }
