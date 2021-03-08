document.addEventListener('DOMContentLoaded', async () => {
  const postsContainer = document.querySelector('.postsContainer');
  try {
    const { data } = await axios({
      method: 'GET',
      url: `/api/posts/${postId}`,
    });

    if (data) {
      outputPostsWithReplies(data, postsContainer);
    }
  } catch (error) {
    console.log(error);
  }
});

function outputPostsWithReplies(results, container) {
  container.innerHTML = '';
  if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
    const html = createPostHtml(results.replyTo);
    container.insertAdjacentHTML('beforeend', html);
  }

  const mainPostHtml = createPostHtml(results.postData, true);
  container.insertAdjacentHTML('beforeend', mainPostHtml);

  results.replies.forEach((result) => {
    const html = createPostHtml(result);
    container.insertAdjacentHTML('beforeend', html);
  });
}
