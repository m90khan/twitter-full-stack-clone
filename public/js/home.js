document.addEventListener('DOMContentLoaded', async () => {
  const postContainer = document.querySelector('.postsContainer');
  try {
    const { data } = await axios({
      method: 'GET',
      url: '/api/posts',
      followingOnly: true,
    });

    if (data) {
      outputPosts(data, postContainer);
    }
  } catch (error) {
    console.log(error);
  }
});
