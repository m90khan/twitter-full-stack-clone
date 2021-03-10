document.addEventListener('DOMContentLoaded', () => {
  if (selectedTab === 'replies') {
    loadReplies();
  } else {
    loadPosts();
  }
});
const loadPosts = async () => {
  const pinnedPostContainer = document.querySelector('.pinnedPostContainer');
  const postContainer = document.querySelector('.postsContainer');
  try {
    const { data } = await axios({
      method: 'GET',
      url: `/api/posts?postedBy=${profileUserId}&pinned=${true}`,
    });

    if (data) {
      outputPinnedPost(data, pinnedPostContainer);
    }
  } catch (error) {
    console.log(error);
  }
  try {
    const { data } = await axios({
      method: 'GET',
      url: `/api/posts?postedBy=${profileUserId}&isReply=${false}`,
    });

    if (data) {
      outputPosts(data, postContainer);
    }
  } catch (error) {
    console.log(error);
  }
};
const loadReplies = async () => {
  const postContainer = document.querySelector('.postsContainer');

  try {
    const { data } = await axios({
      method: 'GET',
      url: `/api/posts?postedBy=${profileUserId}&isReply=${true}`,
    });

    if (data) {
      outputPosts(data, postContainer);
    }
  } catch (error) {
    console.log(error);
  }
};

function outputPinnedPost(results, container) {
  if (results.length == 0) {
    container.style.display = 'none';
    return;
  }

  container.innerHTML = '';

  results.forEach((result) => {
    const html = createPostHtml(result);
    container.insertAdjacentHTML('afterbegin', html);
  });
}
