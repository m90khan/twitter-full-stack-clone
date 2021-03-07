// Global Variables
let cropper;
let timer;
let selectedUsers = [];

document.addEventListener('DOMContentLoaded', function () {
  // refreshMessagesBadge();
  // refreshNotificationsBadge();
});

// POST & REPLY BUTTONS - KEYUP
[
  document.querySelector('#postTextarea'),
  document.querySelector('#replyTextarea'),
].forEach((item) => {
  item.addEventListener('keyup', (event) => {
    const textbox = event.target;
    const value = textbox.value.trim();
    // replay
    const isModal = textbox.parentElement.length == 1;

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
});
// POST & REPLY BUTTONS - ON CLICK
[
  document.querySelector('#submitPostButton'),
  document.querySelector('#submitReplyButton'),
].forEach((item) => {
  item.addEventListener('click', async (event) => {
    const button = event.target;
    // replay
    const isModal = button.parentElement.length == 1;
    const textbox = document.querySelector('#postTextarea');
    // isModal
    //   ? document.querySelector('#replyTextarea')
    //   : document.querySelector('#postTextarea');
    // submit
    const data = {
      content: textbox.value,
    };
    if (isModal) {
      const id = document.querySelector('.info').dataset.id;
      if (id == null) return alert('Button id is null');
      data.replyTo = id;
    }

    axios({
      method: 'POST',
      url: '/api/posts',
      data,
    }).then((postData) => {
      if (postData.replyTo) {
        emitNotification(postData.replyTo.postedBy);
        location.reload();
      } else {
        const html = createPostHtml(postData.data);
        document.querySelector('.postsContainer').insertAdjacentHTML('afterbegin', html);
        textbox.value = '';
        button.disabled = true;
      }
    });
  });
});

document.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  let button = e.target;
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
});

function createPostHtml(postData, largeFont = false) {
  if (postData == null) return alert('post object is null');
  console.log(postData);
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
                      Retweeted by <a href='/profile/${retweetedBy}'>${retweetedBy}</a>    
                  </span>`;
  }

  let replyFlag = '';
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return alert('Reply to is not populated');
    } else if (!postData.replyTo.postedBy._id) {
      return alert('Posted by is not populated');
    }

    const replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class='replyFlag'>
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

    buttons = `<button class='pinButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class='fas fa-thumbtack'></i></button>
                  <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
  }

  return `    <div class="post ${largeFontClass}" data-id="${postData._id}">
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
          >${displayName}</a
        >
        <span class="username">@${postedBy.username}</span>
        <span class="date">· ${timestamp}</span>
        ${buttons}
      </div>
      ${replyFlag}
      <div class="postBody">
        <span>${postData.content}</span>
      </div>
      <div class="postFooter">
        <div class="postButtonContainer">
          <button data-toggle="modal" data-target="#replyModal">
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
