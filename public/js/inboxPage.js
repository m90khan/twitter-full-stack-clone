document.addEventListener('DOMContentLoaded', async () => {
  const resultsContainer = document.querySelector('.resultsContainer');
  try {
    const { data } = await axios({
      method: 'GET',
      url: '/api/chats',
    });

    if (data) {
      outputChatList(data, resultsContainer);
    }
  } catch (error) {
    console.log(error);
  }
});

function outputChatList(chatList, container) {
  chatList.forEach((chat) => {
    const html = createChatHtml(chat);
    container.insertAdjacentHTML('beforeend', html);
  });

  if (chatList.length == 0) {
    container.insertAdjacentHTML(
      'afterbegin',
      "<span class='d-flex alert alert-danger noResults errorMessage' role='alert'>No Messages to show.</span>"
    );
  }
}
