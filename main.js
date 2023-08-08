import "./style.css";

const baseUrl = "http://gateway.marvel.com/v1/public/characters";
const publicKey = "YOUR_PUBLIC_KEY";
const privateKey = "YOUR_PRIVATE_KEY";

const timestamp = Date.now();
const hash = md5(timestamp + privateKey + publicKey);

const initialLimit = 50;
const initialUrl = `${baseUrl}?ts=${timestamp}&apikey=${publicKey}&hash=${hash}&limit=${initialLimit}`;

let currentPage = 1;
const charactersPerPage = 20;
let isLoading = false;
let isSearchResults = false;

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAndProcessData(initialUrl);
});

//Onscroll event to fetch more characters
$(window).on("scroll", () => {
  if (!isSearchResults) {
    const scrollPosition = $(window).scrollTop();
    const windowHeight = $(window).height();
    const documentHeight = $(document).height();

    if (scrollPosition + windowHeight >= documentHeight * 0.8) {
      fetchMoreCharacters();
    }
  }
});

$("#search-input").on("change", async (ev) => {
  ev.preventDefault();
  const inputValue = ev.target.value;

  if (!inputValue) {
    await fetchAndProcessData(initialUrl);
    isSearchResults = false;
    return;
  }

  const searchUrl = `${baseUrl}?name=${inputValue}&ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;
  await fetchAndProcessData(searchUrl);
  isSearchResults = true;
});

async function fetchAndProcessData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data.data.results);
    console.log(data);

    $("#search-results").empty();

    if (data.data.results.length === 0) {
      $("#search-results").html(
        "<p>Character not found!\n Please try again.</p>"
      );
    }

    data.data.results.forEach((character) => {
      const characterCard = `
        <div class="character-card">
          <h2>${character.name}</h2>
          <img src="${character.thumbnail.path}.${character.thumbnail.extension}" alt="${character.name}">
          <p>${character.description}</p>
        </div>
      `;
      $("#search-results").append(characterCard);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

//this function fetches more characters based on the current "page"
async function fetchMoreCharacters() {
  if (isLoading) return;
  isLoading = true;

  const offset = currentPage * charactersPerPage;
  const moreCharactersUrl = `${baseUrl}?ts=${timestamp}&apikey=${publicKey}&hash=${hash}&limit=${charactersPerPage}&offset=${offset}`;

  try {
    const response = await fetch(moreCharactersUrl);
    const data = await response.json();

    if (data.data.results.length > 0) {
      data.data.results.forEach((character) => {
        const characterCard = `
          <div class="character-card">
            <h2>${character.name}</h2>
            <img src="${character.thumbnail.path}.${character.thumbnail.extension}" alt="${character.name}">
            <p>${character.description}</p>
          </div>
        `;
        $("#search-results").append(characterCard);
      });

      currentPage++;
    } else {
      return;
    }
  } catch (error) {
    console.error("Error fetching more characters:", error);
  }

  isLoading = false;
}
//TODO: handle requests in one function only