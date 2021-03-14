document.addEventListener('DOMContentLoaded', async () => {
  const resultsContainer = document.querySelector('.resultsContainer');
  const markNotificationsAsRead = document.querySelector('#markNotificationsAsRead');
  try {
    const { data } = await axios({
      method: 'GET',
      url: '/api/notifications',
    });

    if (data) {
      outputNotificationList(data, resultsContainer);
    }
  } catch (error) {
    console.log(error);
  }
  // Marked all notification as read
  if (markNotificationsAsRead) {
    markNotificationsAsRead.addEventListener('click', (event) => {
      markNotificationsAsOpened();
    });
  }
});
