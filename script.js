const baseURL = "https://pokeapi.co/api/v2/pokemon";
let offset = 0;
const limit = 20;
const $pokemonGallery = document.querySelector(".pokemon-gallery");
const $loadMoreBtn = document.getElementById("load-more");
const $modal = document.getElementById("pokemon_modal");
let caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || [];

function parseUrl(url) {
  return url.split("/").filter(Boolean).pop();
}
// Fetch initial or more Pokémon
async function fetchPokemon() {
  try {
    const response = await fetch(`${baseURL}?offset=${offset}&limit=${limit}`);
    const data = await response.json();
    displayPokemon(data.results);
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
  }
}
function toggleCatchButton(pokemonCard, pokemonName) {
    let button = pokemonCard.querySelector('button');
    if (!button) {
        button = document.createElement('button');
        button.textContent = caughtPokemon.includes(pokemonName) ? 'Release' : 'Catch';
        button.className = 'catch-btn';
        button.onclick = function(event) {
            event.stopPropagation();
            if (button.textContent === 'Catch') {
                caughtPokemon.push(pokemonName);
                button.textContent = 'Release';
                pokemonCard.classList.add('caught');
            } else {
                caughtPokemon = caughtPokemon.filter(name => name !== pokemonName);
                button.textContent = 'Catch';
                pokemonCard.classList.remove('caught');
            }
            localStorage.setItem("caughtPokemon", JSON.stringify(caughtPokemon));
        };
        pokemonCard.appendChild(button);
    }
}
// Display Pokémon in the gallery
function displayPokemon(pokemonList) {
  pokemonList.forEach((pokemon) => {
    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon-card");
    pokemonCard.dataset.name = pokemon.name; 
    pokemonCard.innerHTML = `
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${parseUrl(
              pokemon.url
            )}.png" alt="${pokemon.name}">
            <p>${pokemon.name}</p>
        `;
    // if (caughtPokemon.includes(pokemon.name)) {
    //   pokemonCard.classList.add("caught");
    // }
    // pokemonCard.onclick = () => toggleCatchButton(pokemonCard, pokemon.name);
    $pokemonGallery.appendChild(pokemonCard);
  });
}

// Fetch and display Pokémon details in modal
async function fetchPokemonDetails(pokemonName) {
  try {
    const response = await fetch(`${baseURL}/${pokemonName}`);
    const data = await response.json();
    displayPokemonDetails(data);
  } catch (error) {
    console.error("Error fetching Pokemon details:", error);
  }
}

// Show modal with Pokémon details
function displayPokemonDetails(details) {
//   console.log(details);
  $modal.style.display = "flex";
  // 使用map方法提取每个对象中type对象的name属性
  const names = details.types.map((item) => item.type.name);
  // 使用join方法将提取出的name属性用逗号分隔开来，形成一个字符串
  const joinedNames = names.join(", ");
  $modal.innerHTML = `
        <div class="pokemon-details">
            <div class="pokemon-details-head">
                <h3>${details.name.toUpperCase()}</h3>
                <button class="close-btn" onclick="$modal.style.display='none'">Close</button>
            </div>
            <div class="pokemon-details-footer">
                <div class="details-footer-image">
                    <img src="${details.sprites.other["official-artwork"].front_default}" alt="${details.name}" />
                </div>
                <div class="details-types-moves">
                    <h3>Types</h3>
                    <p>${joinedNames}</p>
                    <button class="catch-btn">Catch</button>
                </div>
            </div>
        </div>
    `;
  console.log(joinedNames);
  //   console.log(details.types.map((obj) => obj.name).join(", "));
}
$loadMoreBtn.addEventListener("click", async () => {
  offset += limit;
  await fetchPokemon();
});

// Event listener for Pokémon card click (show details)
$pokemonGallery.addEventListener("click", (event) => {
  const pokemonCard = event.target.closest(".pokemon-card");
  if (pokemonCard) {
    const pokemonName = pokemonCard.dataset.name;
    fetchPokemonDetails(pokemonName);
  }
});
document.getElementById("load-more").addEventListener("click", async () => {
  offset += limit;
  await fetchPokemon();
});

fetchPokemon();
