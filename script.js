const input = document.getElementById("repo-input");
const autocompleteList = document.getElementById("autocomplete-list");
const repoList = document.getElementById("repo-list");
let debounceTimer;

// Функция для дебаунса
const debounce = (fn, delay) => {
  return function (...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// Функция для получения репозиториев
const fetchRepos = async (query) => {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${query}&per_page=5`
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    return [];
  }
};

// Функция для отображения результатов автокомплита
const showAutocomplete = async (event) => {
  const query = event.target.value.trim();
  if (query === "") {
    autocompleteList.style.display = "none";
    return;
  }
  const repos = await fetchRepos(query);
  if (repos.length > 0) {
    autocompleteList.innerHTML = repos
      .map(
        (repo) =>
          `<div class="autocomplete-item" data-repo='${JSON.stringify(repo)}'>${
            repo.full_name
          }</div>`
      )
      .join("");
    autocompleteList.style.display = "block";
  } else {
    autocompleteList.style.display = "none";
  }
};

// Функция для добавления репозитория в список
const addRepoToList = (repo) => {
  const listItem = document.createElement("li");
  listItem.className = "repo-list-item";
  listItem.innerHTML = `
          <span> Name: ${repo.name}</span>
          <span> Owner: ${repo.owner.login}</span>
          <span> Stars: ${repo.stargazers_count}</span>
          <button class="delete-btn"></button>
      `;
  repoList.appendChild(listItem);

  const deleteBtn = listItem.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    repoList.removeChild(listItem);
  });
};

// Обработчик события для введенного текста с дебаунсом
input.addEventListener("input", debounce(showAutocomplete, 300));

// Обработчик события клика по элементам автокомплита
autocompleteList.addEventListener("click", (event) => {
  const repo = event.target.dataset.repo;
  if (repo) {
    addRepoToList(JSON.parse(repo));
    input.value = "";
    autocompleteList.style.display = "none";
  }
});
