document.addEventListener('DOMContentLoaded', () => {
  if (selectedTab === 'followers') {
    loadFollowers();
  } else {
    loadFollowing();
  }
});

const loadFollowers = async () => {
  const followContainer = document.querySelector('.followResultsContainer');
  try {
    const { data } = await axios({
      method: 'GET',
      url: `/api/users/${profileUserId}/followers`,
    });

    if (data) {
      outputUsers(data.followers, followContainer);
    }
  } catch (error) {
    console.log(error);
  }
};
const loadFollowing = async () => {
  const followingContainer = document.querySelector('.followResultsContainer');

  try {
    const { data } = await axios({
      method: 'GET',
      url: `/api/users/${profileUserId}/following`,
    });

    if (data) {
      outputUsers(data.following, followingContainer);
    }
  } catch (error) {
    console.log(error);
  }
};
