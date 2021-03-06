function timeDifference(current, previous) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return 'Just now';

    return Math.round(elapsed / 1000) + ' seconds ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago';
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + ' months ago';
  } else {
    return Math.round(elapsed / msPerYear) + ' years ago';
  }
}

function getPostIdFromElement(element) {
  const isRoot = element.classList.contains('post');
  const rootElement = isRoot == true ? element : element.closest('.post');
  const postId = rootElement.dataset.id;

  if (postId === undefined) return alert('Post id not found!');

  return postId;
}

//
// const replyModal = document.getElementById('replyModal');

// replyModal.addEventListener('shown.bs.modal', function () {
//   const replyInput = document.getElementById('replyTextarea');
//   replyInput.focus();
// });
const getBase64Value = (
  img // upload image can rither be a file or file like object blob
) => {
  /*
  FileReadeer allows to read blocks of a file
  */
  const reader = new FileReader();
  reader.readAsDataURL(img); // read the contents of the img file
  reader.onload = () => {
    return reader.result;
  };
};

const sendAlert = (message, container) => {
  return (document.querySelector(
    container
  ).innerHTML = `<span class='w-100 d-flex alert alert-info noResults errorMessage' role='alert'>${message}</span>`);
};
