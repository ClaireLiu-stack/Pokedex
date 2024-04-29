const baseURL = "https://pokeapi.co/api/v2/pokemon";
let offset = 0;
const limit = 20;
const $pokemonGallery = document.querySelector(".pokemon-gallery");
const $loadMoreBtn = document.getElementById("load-more");
const $modal = document.getElementById("pokemon_modal");
let selectedPokemonCard = null;
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
    pokemonCard.classList.toggle(
      "caught",
      caughtPokemon.includes(pokemon.name)
    );

    // 添加已捕捉 Pokemon 的样式
    if (caughtPokemon.includes(pokemon.name)) {
      const caughtOverlay = document.createElement("div");
      caughtOverlay.classList.add("caught-overlay");
      caughtOverlay.textContent = "CAUGHT";
      pokemonCard.appendChild(caughtOverlay);
    }
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
  console.log(details);

  $modal.style.display = "flex";
  // 使用map方法提取每个对象中type对象的name属性
  const names = details.types.map((item) => item.type.name);
  // 使用join方法将提取出的name属性用逗号分隔开来，形成一个字符串
  const joinedNames = names.join(", ");
  const isCaught = caughtPokemon.includes(details.name); //当前Pokemon card是否被捕捉

//   console.log(details.name);
//   console.log(isCaught);
  console.log(caughtPokemon);

  $modal.innerHTML = `
        <div class="pokemon-details">
            <div class="pokemon-details-head">
                <h3>${details.name.toUpperCase()}</h3>
                <button class="close-btn" onclick="$modal.style.display='none'">Close</button>
            </div>
            <div class="pokemon-details-footer">
                <div class="details-footer-image">
                    <img src="${
                      details.sprites.other["official-artwork"].front_default
                    }" alt="${details.name}" />
                </div>
                <div class="details-types-moves">
                    <h3>Types</h3>
                    <p>${joinedNames}</p>
                    <h3>Order</h3>
                    <p>${details.order}</p>
                    <button class="catch-btn" onclick="$modal.style.display='none'">${
                      isCaught ? "Release" : "Catch"
                    }</button>
                </div>
            </div>
        </div>
    `;
  toggleCatchButton(selectedPokemonCard, details.name);
}

// Toggle catch/release status of a Pokémon 切换Pokemon的捕捉状态
function toggleCatchButton(pokemonCard, pokemonName) {
  const isCaught = caughtPokemon.includes(pokemonName);
  const $catchButton = $modal.querySelector(".catch-btn");

  $catchButton.addEventListener("click", (e) => {
    e.preventDefault();

    if (isCaught) {
      // Release Pokémon
      const caughtOverlay = pokemonCard.querySelector(".caught-overlay");
      if (caughtOverlay) {
        caughtOverlay.remove();
      }
      $catchButton.textContent = "Catch";
      // $catchButton.classList.remove("release");
      // $catchButton.classList.add("catch");
      
      // console.log('1');
      const index = caughtPokemon.indexOf(pokemonName);
      caughtPokemon.splice(index, 1);
      pokemonCard.classList.remove("caught");
    } else {
      const caughtOverlay = document.createElement("div");
      caughtOverlay.classList.add("caught-overlay");
      caughtOverlay.textContent = "CAUGHT";
      pokemonCard.appendChild(caughtOverlay);
      $catchButton.textContent = "Release";
      // $catchButton.classList.remove("catch");
      // $catchButton.classList.add("release");
      // console.log("2");
      caughtPokemon.push(pokemonName);
      pokemonCard.classList.add("caught");
    }
    localStorage.setItem("caughtPokemon", JSON.stringify(caughtPokemon));
  });
}

$loadMoreBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  offset += limit;
  await fetchPokemon();
});

// Event listener for Pokémon card click (show details)
$pokemonGallery.addEventListener("click", (event) => {
  event.preventDefault();
  const pokemonCard = event.target.closest(".pokemon-card"); //获取当前Pokemon card的元素
  if (pokemonCard) {
    selectedPokemonCard = pokemonCard;
    const pokemonName = pokemonCard.dataset.name;
    fetchPokemonDetails(pokemonName); //
  }
});
document.getElementById("load-more").addEventListener("click", async () => {
  offset += limit;
  await fetchPokemon();
});

fetchPokemon();
