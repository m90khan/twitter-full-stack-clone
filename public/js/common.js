// Global Variables
let cropper;
let timer;
let selectedUsers = [];

document.addEventListener('DOMContentLoaded', function () {
  // refreshMessagesBadge();
  // refreshNotificationsBadge();
});

// POST & REPLY BUTTONS - KEYUP
window.onload = (function () {
  [
    document.querySelector('#postTextarea'),
    document.querySelector('#replyTextarea'),
  ].forEach((item) => {
    if (item !== null) {
      item.addEventListener('keyup', function (event) {
        const textbox = event.target;
        const value = textbox.value.trim();
        // replay
        const isModal = textbox.closest('.modal');

        const submitButton = isModal
          ? document.querySelector('#submitReplyButton')
          : document.querySelector('#submitPostButton');
        // submit

        if (submitButton.length == 0) return alert('No submit button found');

        if (value == '') {
          submitButton.disabled = true;
          return;
        }
        submitButton.disabled = false;
      });
    }
  });
})();
// POST & REPLY BUTTONS - ON CLICK
document.addEventListener('DOMContentLoaded', function () {
  (function () {
    [
      document.querySelector('#submitPostButton'),
      document.querySelector('#submitReplyButton'),
    ].forEach((item) => {
      if (item !== null) {
        item.addEventListener('click', async (event) => {
          const button = event.target;
          // replay
          const isModal = button.closest('.modal');
          const textbox = isModal
            ? document.querySelector('#replyTextarea')
            : document.querySelector('#postTextarea');
          // submit
          const data = {
            content: textbox.value,
          };
          if (isModal) {
            const id = button.dataset.id;
            if (id == null) return alert('Button id is null');
            data.replyTo = id;
          }

          axios({
            method: 'POST',
            url: '/api/posts',
            data,
          }).then((postData) => {
            if (postData.replyTo) {
              // emitNotification(postData.replyTo.postedBy);
              location.reload();
            } else {
              const html = createPostHtml(postData.data);
              document
                .querySelector('.postsContainer')
                .insertAdjacentHTML('afterbegin', html);
              textbox.value = '';
              button.disabled = true;
            }
          });
        });
      }
    });
  })();
});
// REPLY MODAL : ON SHOW
window.onload = (function () {
  if (document.getElementById('replyModal') !== null) {
    document.getElementById('replyModal').addEventListener('shown.bs.modal', (event) => {
      event.stopPropagation();
      event.preventDefault();
      const button = event.relatedTarget;
      const postId = getPostIdFromElement(button);

      const replyInput = document.getElementById('replyTextarea');
      replyInput.focus();
      const originalPostContainer = document.getElementById('originalPostContainer');
      let submitButton = document.getElementById('submitReplyButton');
      submitButton.dataset.id = postId;
      axios({
        method: 'GET',
        url: `/api/posts/${postId}`,
      }).then(({ data }) => {
        outputPosts(data.postData, originalPostContainer);
      });
    });
    // REPLY MODAL : REMOVE FETCHED HTML
    document.getElementById('replyModal').addEventListener('hidden.bs.modal', (event) => {
      const originalPostContainer = document.getElementById('originalPostContainer');
      originalPostContainer.innerHTML = '';
    });
  }
})();
//Delete Post MODAL
// Delete MODAL : ON SHOW
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('deletePostModal') !== null) {
    document
      .getElementById('deletePostModal')
      .addEventListener('shown.bs.modal', (event) => {
        event.stopPropagation();
        event.preventDefault();
        const button = event.relatedTarget;
        const postId = getPostIdFromElement(button);

        let submitButton = document.getElementById('deletePostButton');
        submitButton.dataset.id = postId;
      });
    document.getElementById('deletePostButton').addEventListener('click', (event) => {
      const postId = event.target.dataset.id;
      axios({
        method: 'DELETE',
        url: `/api/posts/${postId}`,
      }).then(() => {
        document.querySelector(
          '.deletePostModal-alert'
        ).innerHTML = `<span class='d-flex alert alert-success noResults errorMessage' role='alert'>Tweet Deleted.</span>`;
        setTimeout(() => {
          location.reload();
        }, 1000);
      });
    });
  }
});
// LIKE & RETWEET BUTTONS
// FOLLOW UNFOLLOW
document.addEventListener('click', (event) => {
  event.stopPropagation();
  let button = event.target;
  if (button.classList.contains('likeButton')) {
    const postId = getPostIdFromElement(button);
    if (postId === undefined) return;
    axios({
      method: 'PUT',
      url: `/api/posts/${postId}/like`,
    }).then((postData) => {
      const { data } = postData;

      data.likes.length
        ? (button.children[1].textContent = data.likes.length)
        : (button.children[1].innerHTML = '');

      if (data.likes.includes(userLoggedIn._id)) {
        button.classList.add('active');
        // emitNotification(postData.postedBy);
      } else {
        button.classList.remove('active');
      }
    });
  }
  // Retweet
  if (button.classList.contains('retweetButton')) {
    const postId = getPostIdFromElement(button);
    if (postId === undefined) return;
    axios({
      method: 'POST',
      url: `/api/posts/${postId}/retweet`,
    }).then((postData) => {
      const { data } = postData;

      data.retweetUsers.length
        ? (button.children[1].textContent = data.retweetUsers.length)
        : (button.children[1].innerHTML = '');

      if (data.retweetUsers.includes(userLoggedIn._id)) {
        button.classList.add('active');
        // emitNotification(postData.postedBy);
      } else {
        button.classList.remove('active');
      }
    });
  }
  // Redirect User to Post screen
  if (button.closest('.post')) {
    // const element = event.target;
    const postId = getPostIdFromElement(button);
    if (postId !== undefined && button.nodeName !== 'BUTTON') {
      window.location.href = '/posts/' + postId;
    }
  }
  // FOLLOW
  if (button.classList.contains('followButton')) {
    const userId = button.dataset.user;
    if (userId === undefined) return;
    axios({
      method: 'PUT',
      url: `/api/users/${userId}/follow`,
    }).then((postData) => {
      const { data } = postData;
      let difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.textContent = 'Following';
        button.classList.add('following');
      } else {
        button.textContent = 'Follow';
        button.classList.remove('following');
        difference = -1;
      }
      let followersLabel = document.querySelector('#followersValue');
      if (followersLabel.length != 0) {
        const followersText = parseInt(followersLabel.textContent);
        followersLabel.textContent = followersText + difference;
      }
    });
  }
});

function createPostHtml(postData, largeFont = false) {
  if (postData == null) return alert('post object is null');
  const isRetweet = postData.retweetData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;

  let postedBy = postData.postedBy;
  if (!postedBy) {
    return console.log('User not found!');
  }

  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? 'active' : '';
  const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id)
    ? 'active'
    : '';
  const largeFontClass = largeFont ? 'largeFont' : '';

  let retweetText = '';
  if (isRetweet) {
    retweetText = `<span>
                      <i class='fas fa-retweet'></i>
                       <a href='/profile/${retweetedBy}'>${
      userLoggedIn.username == retweetedBy
        ? 'You Retweeted'
        : 'Retweeted by ' + retweetedBy
    }</a>    
                  </span>`;
  }
  let replyFlag = '';
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return alert('Reply to is not populated');
    } else if (!postData.replyTo.postedBy) {
      return alert('Posted by is not populated');
    }

    const replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class='replyFlag greyText'>
                  Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                </div>`;
  }

  let buttons = '';
  let pinnedPostText = '';
  if (postData.postedBy._id == userLoggedIn._id) {
    let pinnedClass = '';
    const dataTarget = '#confirmPinModal';
    if (postData.pinned === true) {
      pinnedClass = 'active';
      dataTarget = '#unpinModal';
      pinnedPostText = "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
    }

    buttons = `<button class='pinButton ${pinnedClass}' data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="${dataTarget}"><i class='fas fa-thumbtack'></i></button>
                  <button data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
  }

  return `
  <div class="post ${largeFontClass}" data-id="${postData._id}">
  <div class="postActionContainer">
    ${retweetText}
  </div>
  <div class="mainContentContainer">
    <div class="userImageContainer">
      <img src="${postedBy.profilePic}" />
    </div>
    <div class="postContentContainer">
      <div class="pinnedPostText">${pinnedPostText}</div>
      <div class="header">
        <a
          href="/profile/${postedBy.username}"
          class="displayName"
          >${displayName}</a>
        <span class="username"> @${postedBy.username}</span>
        <span class="date">· ${timestamp}</span>
        ${buttons}
      </div>
      ${replyFlag}
      <div class="postBody">
        <span>${postData.content}</span>
      </div>
      <div class="postFooter">
        <div class="postButtonContainer">
          <button type="button"  class='retweetButtonModal'  data-bs-toggle="modal" data-bs-target="#replyModal">
            <i class="far fa-comment"></i>
          </button>
        </div>
        <div class="postButtonContainer green">
          <button class="retweetButton  ${retweetButtonActiveClass}">
            <i class="fas fa-retweet"></i>
            <span>${postData.retweetUsers.length || ''}</span>
          </button>
        </div>
        <div class="postButtonContainer red">
          <button class="likeButton  ${likeButtonActiveClass}">
            <i class="far fa-heart"></i>
            <span>${postData.likes.length || ''}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function createUserHtml(userData, showFollowButton) {
  const name = userData.firstName + ' ' + userData.lastName;
  const isFollowing =
    userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  const text = isFollowing ? 'Following' : 'Follow';
  const followText = isFollowing
    ? "<span class='follow-you '>You Following</span>"
    : "<span class='follow-you '>Follows You</span>";
  const buttonClass = isFollowing ? 'followButton following' : 'followButton';

  let followButton = '';
  if (showFollowButton && userLoggedIn._id != userData._id) {
    followButton = `<div class='followButtonContainer'>
                          <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                      </div>`;
  }

  console.log(followButton);

  return `<div class='user'>
              <div class='userImageContainer'>
                  <img src='${userData.profilePic}'>
              </div>
              <div class='userDetailsContainer'>
                  <div class='header'>
                      <a href='/profile/${userData.username}'>${name}</a>
                      <span class='username'>@${userData.username}  </span>
                      ${followText}
                  </div>
                  <p class='user-description'>${
                    userData.description ? userData.description : ''
                  }</p>
              </div>
              ${followButton}
          </div>`;
}
