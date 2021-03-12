// Create Home Posts on GET Requests
const outputPosts = (results, container) => {
  container.innerHTML = '';
  if (!Array.isArray(results)) {
    results = [results];
  }
  results.forEach((result) => {
    const html = createPostHtml(result);
    container.insertAdjacentHTML('beforeend', html);
  });

  if (results.length == 0) {
    container.insertAdjacentHTML(
      'afterbegin',
      "<span class='d-flex alert alert-info noResults errorMessage' role='alert'>No tweets to show.</span>"
    );
  }
};

function outputUsers(results, container) {
  container.innerHTML = '';

  results.forEach((result) => {
    const html = createUserHtml(result, true);
    container.insertAdjacentHTML('beforeend', html);
  });

  if (results.length == 0) {
    container.insertAdjacentHTML(
      'afterbegin',
      "<span class='w-100 d-flex alert alert-info noResults errorMessage' role='alert'>No results found!.</span>"
    );
  }
}
