//API
const API_BASE = "https://www.themealdb.com/api/json/v1/1"; // TheMealDB (no key needed for basic endpoints)

// ===== DOM refs =====
const form = document.getElementById("search-form");
const input = document.getElementById("ingredients-input");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");
//const favsBtn = document.getElementById("favorites-btn");

//Modal
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalImg = document.getElementById("modal-img");
const modalMeta = document.getElementById("modal-meta");
const modalIngredients = document.getElementById("modal-ingredients");
const modalInstructions = document.getElementById("modal-instructions");
const modalLinks = document.getElementById("modal-links");

// ===== Utilities =====
const setStatus = (msg = "") => statusEl.textContent = msg;
const normalizeIngredients = (raw) =>
  raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean); //splits by comma, removes spaces, removes empty strings




async function fetchMealsByIngredient(ingredient) {
  const url = `${API_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`
  const res = await fetch(url);
  const data = await res.json()
  console.log(data.meals[0]);
  //console.log(data.meals[0].strMealThumb);
  return data.meals || [];
}


async function fetchMealById(id) {
  const res = await fetch(url);
  const data = await res.json()
  //console.log(data.meals); //idk what type of variable this is
  //console.log(data.meals[0]);
  //console.log(data.meals[0].strIngredient1);
  return data.meals || [];
}

function parseIngredients(meal) {
  //let ingredientKeys = Object.keys(meal[0]).filter(key => key.startsWith("strIngredient"));
  //let ingredients = Object.fromEntries(ingredientKeys.map(key => [key, meal[0][key]]));
  //console.log(ingredients);
  //let measureKeys = Object.keys(meal[0]).filter(key => key.startsWith("strMeasure"));
  //let measurements = Object.fromEntries(measureKeys.map(key => [key, meal[0][key]]));
  //console.log(measurements);
  let ingredArr = [];
  let ingredients = Object.entries(meal[0])
  .filter(([key]) => key.startsWith("strIngredient"))
  .map(([key, value]) => value).filter(value => value && value.trim() !== "");

  let measurements = Object.entries(meal[0])
  .filter(([key]) => key.startsWith("strMeasure"))
  .map(([key, value]) => value).filter(value => value && value.trim() !== "");
  //console.log(ingredients);
  //console.log(measurements);
  ingredArr = measurements.map((measure, ingred) => `${measure} ${ingredients[ingred]}`)
  //console.log(ingredArr);
  return ingredArr;
}

function renderCards(meals) {
  resultsEl.innerHTML = "";
  const container = document.getElementById("results");
  //console.log(meals);
  meals.forEach(item => {
      // Create card
      const card = document.createElement("div");
      card.className = "card";

      // Add image
      const img = document.createElement("img");
      img.src = item.strMealThumb;
      card.appendChild(img);

      // Add title
      const title = document.createElement("h3");
      title.textContent = item.strMeal;
      card.appendChild(title);
/* ugly button layout
      const view = document.createElement("button");
      view.textContent = "View";
      view.id = "view";
      const fav = document.createElement("button");
      fav.textContent = "Fav";
      fav.id = "fav";
      card.appendChild(view);
      card.appendChild(fav);
*/

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "card-buttons";

      const view = document.createElement("button");
      view.textContent = "View";
      view.id = item.idMeal;
      view.class = "recipeView";
      view.addEventListener("click", function() {
        openModalById(view.id);
      });
      const fav = document.createElement("button");
      fav.textContent = "Fav";
      fav.id = "fav";
      buttonContainer.appendChild(view);
      buttonContainer.appendChild(fav);
      card.appendChild(buttonContainer);


      container.appendChild(card);
    });

  /*
    <article class="card">
     <img src="$meals" alt="meal"/> 
     <div class="body">
       <h3 class="title">Meal Name</h3>
       <div class="actions">
         <button id="view">View</button>
         <button id="fav">☆</button>
       </div>
     </div>
   </article>
====================
   function handleButtonClick()
{

	let list = ["One","Two","Three"];
	var li = document.createElement("li");
	li.innerHTML = list[count];
	var ul = document.getElementById("playlist");
	ul.appendChild(li);
	count++;
	if (count >= 3)
		count = 0;
}
window.onload = init;
</script>
	</head>
	<body>
<form>
<input type="button" id="addButton" value="Press Me">
</form>
<ul id="playlist">
</ul>
	</body>
</html>
*/
}


async function openModalById(id) {
  setStatus("Loading recipe...");
  let meal = await fetchMealById(id);
  let ingredList = parseIngredients(meal);
  document.getElementById("modal-title").innerHTML = meal[0].strMeal;
  document.getElementById("modal-img").src = meal[0].strMealThumb;
  for(let i = 0; i < ingredList.length; i++){
    let li = document.createElement("li");
    li.textContent = ingredList[i];
    document.getElementById("modal-ingredients").appendChild(li);
  }
  let links = document.getElementById("modal-links");
  let website = document.createElement("a");
  website.href = meal[0].strSource;
  website.innerText = "Detailed Instructions";
  let YTVid = document.createElement("a");
  YTVid.href = meal[0].strYoutube;
  YTVid.innerText = "Recipe Youtube Video";
  links.appendChild(website);
  links.appendChild(YTVid);
  modal.hidden = false;
  setStatus("");
}

function resetModal() {
  document.getElementById("modal-title").textContent = "";
  document.getElementById("modal-img").src = "";
  document.getElementById("modal-img").alt = "";
  document.getElementById("modal-meta").innerHTML = "";
  document.getElementById("modal-ingredients").innerHTML = "";
  document.getElementById("modal-instructions").textContent = "";
  document.getElementById("modal-links").innerHTML = "";
  document.querySelector(".modal-box").scrollTop = 0;
}

// ===== Events =====
form.addEventListener("submit", async (e) => {
  e.preventDefault(); //prevents from reloading page
  const ingredients = normalizeIngredients(input.value);
  if (ingredients.length === 0) {
    setStatus("Please enter at least one ingredient.");
    resultsEl.innerHTML = "";
    return;
  }

  setStatus("Searching…");
  resultsEl.innerHTML = "";

  try {
    // main area
    let resMeals = await fetchMealsByIngredient(ingredients[0]);
    for(let i = 1; i < ingredients.length; i++){
      let possibleMeals = await fetchMealsByIngredient(ingredients[i]);
      const meal1 = resMeals.map(meal => meal.idMeal);
      const meal2 = possibleMeals.map(meal => meal.idMeal);
      const commonIngred = meal1.filter(meal => meal2.includes(meal));

      resMeals = [...possibleMeals, ...resMeals].filter(meal => commonIngred.includes(meal.idMeal));
      const dupe = new Set();
      resMeals = resMeals.filter(meal => !dupe.has(meal.idMeal) && dupe.add(meal.idMeal));
    }
    console.log(resMeals);
    renderCards(resMeals);
    setStatus("Found " + resMeals.length + " recipes");

  } catch (err) {
    console.error(err);
    setStatus("Something went wrong. Please try again.");
  }
});

favsBtn.addEventListener("click", async () => {
  //  Show favorites view.
  //  - Read ids from getFavs()
  //  - For each id, fetch details (or store minimal info when favoriting)
  //  - Render cards
});

// Close modal
modalClose.addEventListener("click", () => {
  modal.hidden = true
  resetModal();
});
// Click outside modal box closes it
modal.addEventListener("click", (e) => {
  const box = document.querySelector(".modal-box");
  if (!box.contains(e.target)){ 
    modal.hidden = true;
    resetModal();
  }
});


setStatus("Type ingredients and press Search.");

