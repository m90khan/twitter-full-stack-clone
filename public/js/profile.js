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

const editProfileButton = document.querySelector('#submitProfileButton');

if (editProfileButton) {
  editProfileButton.addEventListener('click', (e) => {
    e.preventDefault();
    // const form = new FormData();
    const container = document.querySelector('.editFormContainer');
    const firstName = document.getElementById('nameFirstEdit').value;
    const lastName = document.getElementById('nameLastEdit').value;
    const email = document.getElementById('emailEdit').value;
    const username = document.getElementById('usernameEdit').value;
    const location = document.getElementById('locationEdit').value;
    const bio = document.getElementById('bioEdit').value;
    axios({
      method: 'PATCH',
      url: `/api/users/${userLoggedIn._id}/edit`,
      data: { firstName, lastName, email, username, location, bio },
    })
      .then((postData) => {
        console.log(postData);
      })
      .catch((error) => {
        console.log(error);
        container.insertAdjacentHTML(
          'afterbegin',
          "<span class='w-100 d-flex alert alert-info noResults errorMessage' role='alert'>Either Username or Email already exists!</span>"
        );
      });
  });
}
