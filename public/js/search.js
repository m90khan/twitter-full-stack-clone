document.addEventListener('DOMContentLoaded', () => {
  const searchBox = document.querySelector('#searchBox');
  if (searchBox) {
    searchBox.addEventListener('keydown', (event) => {
      clearTimeout(timer);
      const textbox = event.target;
      let value = textbox.value.trim();
      const searchType = textbox.dataset.search;
      timer = setTimeout(() => {
        if (value == '') {
          document.querySelector('.resultsContainer').innerHTML = '';
        } else {
          search(value, searchType);
        }
      }, 1000);
    });
  }
});

const search = async (searchTerm, searchType) => {
  const url = searchType == 'users' ? '/api/users' : '/api/posts';
  const container = document.querySelector('.resultsContainer');
  try {
    const { data } = await axios({
      method: 'GET',
      url: url,
      search: searchTerm,
    });

    if (data) {
      if (searchType == 'users') {
        outputUsers(data, container);
      } else {
        outputPosts(data, container);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
