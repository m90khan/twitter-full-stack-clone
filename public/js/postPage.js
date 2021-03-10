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
  if (
    results.postData.replyTo !== undefined &&
    results.postData.replyTo._id !== undefined
  ) {
    const html = createPostHtml(results.postData.replyTo);
    container.insertAdjacentHTML('beforeend', html);
  }
  const mainPostHtml = createPostHtml(results.postData, true);
  container.insertAdjacentHTML('beforeend', mainPostHtml);

  results.replies.forEach((result) => {
    const html = createPostHtml(result);
    container.insertAdjacentHTML('beforeend', html);
  });
}

// {
//   postData: {
//     likes: [],
//     retweetUsers: [ 60434893eff7ce506497bc04 ],
//     _id: 6045e742410cef3020ead1bd,
//     content: 'Khan reply to himself',
//     postedBy: {
//       profilePic: '/images/profilePic.jpeg',
//       likes: [Array],
//       retweets: [Array],
//       following: [],
//       followers: [],
//       _id: 60434893eff7ce506497bc04,
//       firstName: 'Muhammad',
//       lastName: 'Khan',
//       username: 'm90khan',
//       email: 'm90khan@gmail.com',
//       password: '$2b$12$uTu8Yb7dUUxJprNWVeXCUOJFxI7r3eCI7CwwEFxkLXC//UxglBUuO',
//       createdAt: 2021-03-06T09:17:07.044Z,
//       updatedAt: 2021-03-09T03:41:38.463Z,
//       __v: 0
//     },
//     replyTo: {
//       likes: [],
//       retweetUsers: [],
//       _id: 6045e45bd40af04fbcf994a9,
//       content: 'First Tweet',
//       postedBy: [Object],
//       createdAt: 2021-03-08T08:46:19.862Z,
//       updatedAt: 2021-03-08T08:46:19.862Z,
//       __v: 0
//     },
//     createdAt: 2021-03-08T08:58:42.791Z,
//     updatedAt: 2021-03-09T03:41:38.727Z,
//     __v: 0
//   },
//   replies: []
// }
