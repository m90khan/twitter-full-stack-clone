// Global Variables
let cropper;
let timer;
let selectedUsers = [];

document.addEventListener('DOMContentLoaded', function () {
  refreshMessagesBadge();
  refreshNotificationsBadge();
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
//Delete PIN UNPIN
document.addEventListener('DOMContentLoaded', function () {
  // Delete MODAL : ON SHOW
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
        sendAlert('Tweet Deleted.', '.deletePostModal-alert');

        setTimeout(() => {
          location.reload();
        }, 1000);
      });
    });
  }
  // Pin Model
  if (document.getElementById('confirmPinModal') !== null) {
    document
      .getElementById('confirmPinModal')
      .addEventListener('shown.bs.modal', (event) => {
        event.preventDefault();
        const button = event.relatedTarget;
        const postId = getPostIdFromElement(button);

        let submitButton = document.getElementById('pinPostButton');
        submitButton.dataset.id = postId;
      });
    document.getElementById('pinPostButton').addEventListener('click', (event) => {
      const postId = event.target.dataset.id;
      axios({
        method: 'PUT',
        url: `/api/posts/${postId}`,
        data: { pinned: true },
      }).then(() => {
        sendAlert('Tweet Pinned', '.createPinnedStatus');
        setTimeout(() => {
          location.reload();
        }, 800);
      });
    });
  }
  // UnPin Model
  if (document.getElementById('unpinModal') !== null) {
    document.getElementById('unpinModal').addEventListener('shown.bs.modal', (event) => {
      event.preventDefault();
      const button = event.relatedTarget;
      const postId = getPostIdFromElement(button);

      let submitButton = document.getElementById('unpinPostButton');
      submitButton.dataset.id = postId;
    });
    document.getElementById('unpinPostButton').addEventListener('click', (event) => {
      const postId = event.target.dataset.id;
      axios({
        method: 'PUT',
        url: `/api/posts/${postId}`,
        data: { pinned: false },
      }).then(() => {
        sendAlert('Tweet unPinned.', '.createunPinnedStatus');
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

// Crop Profile Image
document.addEventListener('DOMContentLoaded', function () {
  const profilePhotoButton = document.querySelector('#filePhoto');
  if (profilePhotoButton !== null) {
    profilePhotoButton.addEventListener('change', (event) => {
      const input = event.target;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const image = document.getElementById('imagePreview');
          image.src = e.target.result;

          if (cropper !== undefined) {
            cropper.destroy();
          }

          cropper = new Cropper(image, {
            aspectRatio: 1 / 1,
            background: false,
          });
        };
        reader.readAsDataURL(input.files[0]);
      } else {
        console.log('nope');
      }
    });
  }
  const coverPhotoButton = document.querySelector('#coverPhoto');

  if (coverPhotoButton !== null) {
    coverPhotoButton.addEventListener('change', (event) => {
      const input = event.target;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const image = document.getElementById('coverPreview');
          image.src = e.target.result;

          if (cropper !== undefined) {
            cropper.destroy();
          }

          cropper = new Cropper(image, {
            aspectRatio: 16 / 9,
            background: false,
          });
        };
        reader.readAsDataURL(input.files[0]);
      } else {
        console.log('no cover photo');
      }
    });
  }
});

// Image Upload Profile
document.addEventListener('DOMContentLoaded', function () {
  const uploadProfileButton = document.querySelector('#imageUploadButton');
  if (uploadProfileButton !== null) {
    uploadProfileButton.addEventListener('click', () => {
      // get selected area from cropper variable
      let canvas = cropper.getCroppedCanvas();
      if (canvas == null) {
        alert('Error: on uploading image. Make sure it is an image file.');
        return;
      }

      canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('croppedImage', blob);
        axios({
          method: 'POST',
          url: '/api/users/profilePicture',
          data: formData,
          headers: { 'Content-Type': false, processData: true },
        }).then(() => {
          location.reload();
        });
      });
    });
  }
  const uploadCoverButton = document.querySelector('#coverPhotoButton');
  if (uploadCoverButton !== null) {
    uploadCoverButton.addEventListener('click', () => {
      // get selected area from cropper variable
      let canvas = cropper.getCroppedCanvas();
      if (canvas == null) {
        alert('Error: on uploading image. Make sure it is an image file.');
        return;
      }

      canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('croppedImage', blob);
        axios({
          method: 'POST',
          url: '/api/users/coverPhoto',
          data: formData,
          headers: { 'Content-Type': false, processData: true },
        }).then(() => {
          location.reload();
        });
      });
    });
  }
});

// New Message Search Box
// STEP1: New Message > Text Input value
document.addEventListener('DOMContentLoaded', () => {
  const searchBox = document.querySelector('#userSearchTextbox');
  const createChatButton = document.querySelector('#createChatButton');
  if (searchBox) {
    const resultsContainer = document.querySelector('.resultsContainer');
    searchBox.addEventListener('keydown', (event) => {
      clearTimeout(timer);
      const textbox = event.target;
      let value = textbox.value;

      // keyCode = 8 : delete
      if (value == '' && (event.which == 8 || event.keyCode == 8)) {
        // remove user from selection
        selectedUsers.pop();
        updateSelectedUsersHtml();
        resultsContainer.innerHTML = '';

        if (selectedUsers.length == 0) {
          createChatButton.disabled = true;
        }
        return;
      }

      timer = setTimeout(() => {
        value = value.trim();
        if (value == '') {
          resultsContainer.innerHTML = '';
        } else {
          searchUsers(value);
        }
      }, 1000);
    });
  }
});
// STEP2: New Message > Search Users
const searchUsers = async (searchTerm) => {
  const resultsContainer = document.querySelector('.resultsContainer');
  try {
    const { data } = await axios({
      method: 'GET',
      url: `/api/users`,
      search: searchTerm,
    });

    if (data) {
      outputSelectableUsers(data, resultsContainer);
    }
  } catch (error) {
    console.log(error);
  }
};
// STEP3: New Message > output users from GET request

const outputSelectableUsers = (results, container) => {
  container.innerHTML = '';

  results.forEach((result) => {
    if (result._id == userLoggedIn._id) {
      return;
    }

    if (selectedUsers.some((u) => u._id == result._id)) {
      return;
    }

    const html = createUserHtml(result, false);
    container.insertAdjacentHTML('afterbegin', html);
    const element = document.querySelector('.user');
    element.addEventListener('click', (e) => {
      e.preventDefault();
      userSelected(result);
    });
  });
  if (results.length == 0) {
    container.insertAdjacentHTML(
      'afterbegin',
      "<span class='noResults'>No results found</span>"
    );
  }
};
// STEP4: New Message > add selected user to array

function userSelected(user) {
  selectedUsers.push(user);
  const userSearchTextbox = document.querySelector('#userSearchTextbox');
  const resultsContainer = document.querySelector('.resultsContainer');
  const createChatButton = document.querySelector('#createChatButton');
  updateSelectedUsersHtml();

  userSearchTextbox.value = '';
  userSearchTextbox.focus();
  resultsContainer.innerHTML = '';
  createChatButton.disabled = false;
}
// STEP5: New Message > add the selected user full name to the screeen

const updateSelectedUsersHtml = () => {
  let elements = [];
  selectedUsers.forEach((user) => {
    // const name = user.children[1].firstElementChild.children[0].innerHTML;
    var name = user.firstName + ' ' + user.lastName;

    const userElement = `<span class='selectedUser'>${name}</span>`;
    elements.push(userElement);
  });
  const selectedUserElements = document.querySelector('.selectedUser');
  if (selectedUserElements) {
    document.querySelector('.selectedUser').remove();
  }
  const selectedUsersContainer = document.querySelector('#selectedUsers');
  selectedUsersContainer.insertAdjacentHTML('afterbegin', elements);
};

// CHAT
document.addEventListener('DOMContentLoaded', () => {
  const createChatButton = document.querySelector('#createChatButton');

  // Initiate Chat
  if (createChatButton !== null) {
    createChatButton.addEventListener('click', async () => {
      const data = {
        users: JSON.stringify(selectedUsers),
      };

      axios({
        method: 'POST',
        url: '/api/chats',
        data,
      }).then(({ data }) => {
        if (!data || !data._id) return alert('Invalid response from server.');
        window.location.href = `/messages/${data._id}`;
      });
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
    let dataTarget = '#confirmPinModal';
    if (postData.pinned === true) {
      pinnedClass = 'active';
      dataTarget = '#unpinModal';
      pinnedPostText = "<i class='fas fa-thumbtack'></i> <span>  Pinned post</span>";
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
  const followsYou =
    userLoggedIn.followers && userLoggedIn.followers.includes(userData._id);
  const text = isFollowing ? 'Following' : 'Follow';
  let followText = isFollowing ? 'You Following' : followsYou ? 'Follows You' : '';
  if (userLoggedIn._id == userData._id) {
    followText = '';
  }

  const followContainer = followText && `<span class='follow-you '>${followText}</span>`;

  const buttonClass = isFollowing ? 'followButton following' : 'followButton';

  let followButton = '';
  if (showFollowButton && userLoggedIn._id != userData._id) {
    followButton = `<div class='followButtonContainer'>
                          <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                      </div>`;
  }

  return `<div class='user' id='chatUser'>
              <div class='userImageContainer'>
                  <img src='${userData.profilePic}'>
              </div>
              <div class='userDetailsContainer'>
                  <div class='header'>
                      <a href='/profile/${userData.username}'>${name}</a>
                      <span class='username'>@${userData.username}  </span>
                      ${followContainer}
                  </div>
                  <p class='user-description'>${
                    userData.description ? userData.description : ''
                  }</p>
              </div>
              ${followButton}
          </div>`;
}

function createChatHtml(chatData) {
  const chatName = getChatName(chatData);
  const image = getChatImageElements(chatData);
  const latestMessage = getLatestMessage(chatData.latestMessage);

  const activeClass =
    !chatData.latestMessage || chatData.latestMessage.readBy.includes(userLoggedIn._id)
      ? ''
      : 'active';

  return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${latestMessage}</span>
                </div>
            </a>`;
}

function getChatName(chatData) {
  let chatName = chatData.chatName;

  if (!chatName) {
    const otherChatUsers = getOtherChatUsers(chatData.users); // get all chat usrs expect loggedIn one
    const namesArray = otherChatUsers.map((user) => user.firstName + ' ' + user.lastName);
    chatName = namesArray.join(', ');
  }

  return chatName;
}
function getChatImageElements(chatData) {
  const otherChatUsers = getOtherChatUsers(chatData.users);

  let groupChatClass = '';
  let chatImage = getUserChatImageElement(otherChatUsers[0]);

  if (otherChatUsers.length > 1) {
    groupChatClass = 'groupChatImage';
    chatImage += getUserChatImageElement(otherChatUsers[1]);
  }

  return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}
function getLatestMessage(latestMessage) {
  if (latestMessage != null) {
    const sender = latestMessage.sender;
    return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
  }

  return 'New chat';
}
function getOtherChatUsers(users) {
  if (users.length == 1) return users; // only loggedIn user

  return users.filter((user) => user._id != userLoggedIn._id);
}
function getUserChatImageElement(user) {
  if (!user || !user.profilePic) {
    return alert('User passed into function is invalid');
  }

  return `<img src='${user.profilePic}' alt='User's profile pic'>`;
}

function messageReceived(newMessage) {
  if (document.querySelector(`.chatContainer`).length == 0) {
    // if (document.querySelector(`[data-room="${newMessage.chat._id}"]`).length == 0) {
    // Show popup notification
    //   showMessagePopup(newMessage);
  } else {
    addChatMessageHtml(newMessage);
    // }
    // refreshMessagesBadge();
  }
}

// NOTIFICATION

const outputNotificationList = (notifications, container) => {
  notifications.forEach((notification) => {
    const html = createNotificationHtml(notification);
    container.insertAdjacentHTML('afterbegin', html);
  });

  if (notifications.length == 0) {
    sendAlert('No Notification!', container);
  }
};

function createNotificationHtml(notification) {
  const userFrom = notification.userFrom;
  const text = getNotificationText(notification);
  const href = getNotificationUrl(notification);
  const className = notification.opened ? '' : 'active';

  return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis text-white'>${text}</span>
                </div>
            </a>`;
}

const getNotificationText = (notification) => {
  const userFrom = notification.userFrom;

  if (!userFrom.firstName || !userFrom.lastName) {
    return alert('user from data not populated');
  }

  const userFromName = `${userFrom.firstName} ${userFrom.lastName}`;

  let text;

  if (notification.notificationType == 'retweet') {
    text = `${userFromName} retweeted one of your posts`;
  } else if (notification.notificationType == 'postLike') {
    text = `${userFromName} liked one of your posts`;
  } else if (notification.notificationType == 'reply') {
    text = `${userFromName} replied to one of your posts`;
  } else if (notification.notificationType == 'follow') {
    text = `${userFromName} followed you`;
  }

  return `<span class='ellipsis'>${text}</span>`;
};

const getNotificationUrl = (notification) => {
  let url = '#';

  if (
    notification.notificationType == 'retweet' ||
    notification.notificationType == 'postLike' ||
    notification.notificationType == 'reply'
  ) {
    url = `/posts/${notification.entityId}`;
  } else if (notification.notificationType == 'follow') {
    url = `/profile/${notification.entityId}`;
  }

  return url;
};
// Notification click handler

document.addEventListener('click', (event) => {
  let notificationContainer = event.target;
  event.stopPropagation();
  if (
    notificationContainer.classList.contains('active') &&
    notificationContainer.classList.contains('notification')
  ) {
    const notificationId = notificationContainer.dataset.id;
    const href = notificationContainer.getAttribute('href');
    event.preventDefault();
    const callback = () => (window.location = href);
    markNotificationsAsOpened(notificationId, callback);
  }
});

const markNotificationsAsOpened = (notificationId = null, callback = null) => {
  if (callback == null) callback = () => location.reload();
  const url =
    notificationId != null
      ? `/api/notifications/${notificationId}/markAsOpened` // marked single as nulled
      : `/api/notifications/markAsOpened`;

  axios({
    method: 'PUT',
    url: url,
  }).then(() => {
    callback();
  });
};
//BADGES
// Refresh Messages Badge
const refreshMessagesBadge = () => {
  const messagesBadge = document.querySelector('#messagesBadge');
  console.log(messagesBadge);
  axios({
    method: 'GET',
    url: '/api/chats',
    unreadOnly: true,
  }).then(({ data }) => {
    const numResults = data.length;
    if (numResults > 0) {
      messagesBadge.innerHTML = numResults;
      messagesBadge.classList.add('active');
    } else {
      messagesBadge.innerHTML = '';
      messagesBadge.classList.remove('active');
    }
  });
};

// Refresh Messages Badge
const refreshNotificationsBadge = () => {
  const messagesBadge = document.querySelector('#notificationBadge');
  axios({
    method: 'GET',
    url: '/api/notifications',
    unreadOnly: true,
  }).then(({ data }) => {
    const numResults = data.length;
    if (numResults > 0) {
      messagesBadge.innerHTML = numResults;
      messagesBadge.classList.add('active');
    } else {
      messagesBadge.innerHTML = '';
      messagesBadge.classList.remove('active');
    }
  });
};
