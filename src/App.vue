<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// import Logo from "./assets/Pantry Chef Logo.png"
import { getRecipe } from "./cohereApi"
import { edamamExtractFoods } from "./edamamApi"
import { ref } from "vue"

let foodItems = ref([] as Parsed_Ingredients[]);
let foodInputText = ref("");
let recipeText = ref("");
let recipeTitle = ref("");
let savedRecipes = ref([] as Recipe_Data[]);
let savedRecipesOpen = ref(false);

const loadingVerbs = ["Whisking", "Baking", "Cooking", "Carmalizing", "Dreaming of", "Taste Testing", "Measuring", "Choping", "Tossing"];
const loadingNouns = ["Sauce", "Dough", "Batter", "Spices", "Flavors", "Aromas"]

const loadFoodList = () => {
  foodItems.value = JSON.parse(localStorage.getItem("foods") || "[]") as Parsed_Ingredients[]
}

const saveFoodList = () => {
  localStorage.setItem("foods", JSON.stringify(foodItems.value))
}

const removeFood = (index: number) => {
  foodItems.value.splice(index, 1);
  console.log("removeFood", index, foodItems.value)
  saveFoodList();
}

const removeAllFood = () => {
  foodItems.value = [];
}

const addFoods = () => {
  console.log("addFoods", foodInputText.value);
  edamamExtractFoods(foodInputText.value, (foods) => {
    foodInputText.value = "";
    console.log("foods", foods);
    foodItems.value = foodItems.value.concat(foods)
    saveFoodList();
  })
}


const getRandom = (array: Array<any>) => {
  return array[Math.floor(Math.random() * array.length)]
}

const capitalize = (str: string) => {
  return str.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const getLoadingText = (extraNouns: string[] = []) => {
  return '<h2 class="text-center">' + getRandom(loadingVerbs) + " " + capitalize(getRandom(loadingNouns.concat(extraNouns))) + "...</h2>";
}

const setRecipeTitle = (title: string) => {
  recipeTitle.value = title
  document.title = title + " - Pantry Chef"
}

const getAiRecipe = () => {
  setRecipeTitle("");
  const ingredients = foodItems.value.map(food => food.originalName);
  const loadUpdate = () => recipeText.value = getLoadingText(ingredients);
  const interval = setInterval(loadUpdate, 1500); loadUpdate();
  console.log("getRecipe", ingredients);
  getRecipe(ingredients).then((recipie) => {
    setRecipeTitle(recipie.title)
    recipeText.value = recipie.body;
    clearInterval(interval);
  })
}

const loadSavedRecipeList = () => {
  savedRecipes.value = JSON.parse(localStorage.getItem("savedRecipes") || "[]") as Recipe_Data[]
}

const saveRecipeList = () => {
  localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes.value))
}

const saveRecipe = () => {
  savedRecipes.value.push({ title: recipeTitle.value, body: recipeText.value })
  saveRecipeList();
}

const removeSavedRecipe = (index: number) => {
  savedRecipes.value.splice(index, 1);
  saveRecipeList();
}

const showSavedRecipe = (index: number) => {
  const r = savedRecipes.value[index]
  setRecipeTitle(r.title)
  recipeText.value = r.body;
}

const blurFocus = (event: MouseEvent) => {
  (event.currentTarget as HTMLElement).blur();
}

loadFoodList();
loadSavedRecipeList();

// export default defineComponent({
//   data() {
//     return {
//       foodItems: [] as Parsed_Ingredients[]
//     }
//   },
//   methods: {
//     saveFoodList() {
//       localStorage.setItem("foodItems", JSON.stringify(this.foodItems))
//     },
//     loadFoodList() {
//       this.foodItems = JSON.parse(localStorage.getItem("foods") || "[]") as Parsed_Ingredients[]
//     },
//     removeFood(index: number) {
//       this.foodItems.splice(index, 1);
//       console.log("removeFood", index, this.foodItems)
//       this.saveFoodList();
//     }
//   },
//   mounted() {
//     this.loadFoodList()
//   },
// })
</script>

<template>


  <div class="w-full p-5 flex-col min-h-full max-w-5xl mx-auto pb-28 relative z-10">
    <nav class="w-full p-3 flex flex-col bottom-0 rounded-3xl bg-white prose max-w-full shadow-xl z-10">
      <!-- <h3>Ingredients</h3> -->
      <div class="relative focus-parent">
        <input type="text" @keypress="(event) => {
          if (event.key == 'Enter') addFoods();
        }" v-model="foodInputText"
          class="w-full placeholder-slate-600 p-4 rounded-xl lime-ring lime-ring-child bg-slate-200/[.7]  text-xl  pr-16"
          placeholder="Describe the ingredients you have or a dish you want to make..." />
        <button class="lime-button absolute lime-ring top-1.5 right-1.5 h-12 w-12 rounded-md "
          @click="(event) => { addFoods(); blurFocus(event) }">+</button>
      </div>
      <div class="flex flex-row justify-center items-center flex-wrap relative">
        <button
          class="block h-28 w-28 rounded-full !text-white hover-hide-child-parent lime-ring bg-cover m-3 relative overflow-hidden cursor-pointer food-item select-none"
          v-for="(food, index) in foodItems" :key="food.pureName"
          v-bind:style="{ 'background-image': `url(${food.imageUrl})` }"
          @click="(event) => { removeFood(index); blurFocus(event) }">

          <div aria-hidden="true" class="block absolute inset-0 bg-slate-900/[.7] hover:bg-slate-900/[.9]"></div>
          <span
            class="block absolute text-center translate-center font-bold hover-hide-child text-lg w-full p-1 box-border break-words capitalize">{{
              food.originalName }}</span>
          <span aria-hidden="true"
            class="close-icon absolute invisible pointer-events-none translate-center leading-9 text-center font-bold text-2xl bg-red-400 rounded-full w-10 h-10 select-none">×</span>
        </button>

        <button v-if="foodItems.length > 1"
          class="m-3 text-center red-button font-bold text-xl px-4 py-3 rounded-full select-none"
          @click="(event) => { removeAllFood(); blurFocus(event) }">
          Clear All
        </button>
      </div>


    </nav>

    <button @click="getAiRecipe" v-bind:disabled="foodItems.length < 1"
      class="rounded-full text-white block text-center yellow-ring yellow-button font-bold text-xl px-4 py-3 select-none w-1/2 m-auto mt-4 mb-3">
      Create Recipe </button>
    <article class="mx-auto max-w-7xl bg-white p-7 prose recipe-text" v-html="recipeText">
    </article>
    <p class="text-center w-full p-4" v-if="!!recipeText">⚠️ AI generated content may
      be unsafe for consumption. Use at
      your own risk. ⚠️
    </p>
    <div class="fixed bottom-3 right-0.5  flex justify-center items-center select-none "
      :class="{ 'mr-72': savedRecipesOpen && savedRecipes.length > 0 }">
      <button class="lime-button lime-ring rounded-full  py-3 px-4" @click="saveRecipe(); savedRecipesOpen = true"
        v-if="recipeTitle != ''">
        + Save
      </button> <button class="lime-button lime-ring font-medium rounded-full py-3 mx-3 px-5"
        v-bind:disabled="savedRecipes.length < 1" @click="savedRecipesOpen = !savedRecipesOpen">
        {{ savedRecipesOpen && savedRecipes.length > 0 ? '❯' : '≡' }}</button>
    </div>
  </div>
  <section class="md:w-72 w-0 shrink-0 block select-none z-20" v-if="savedRecipesOpen && savedRecipes.length > 0">
    <ul
      class="max-w-full md:shadow-none w-72 shadow-2xl ring-lime-200 ring-2 bg-slate-100  h-screen fixed top-0 right-0 overflow-y-scroll px-2">
      <li v-for="(recipe, index) in savedRecipes" @click="showSavedRecipe(index)"
        class="px-3 py-2 rounded-md lime-ring  my-2 bg-slate-200 font-bold cursor-pointer flex items-center justify-between hover-show-child-parent text-slate-900">
        <span>{{ recipe.title }}</span>
        <button aria-hidden="true" @click="(e) => { e.preventDefault(); removeSavedRecipe(index) }"
          class="red-button hover-show-child  invisible leading-3  text-center font-bold text-2xl bg-red-400 rounded-full w-10 h-10 select-none flex-grow-0 flex-shrink-0 ml-5">×</button>
      </li>
    </ul>
  </section>

  <footer class="absolute left-1 bottom-1 flex items-center z-0">
    <a href="https://www.edamam.com" class="inline-block" title="Powered by Edamam"><img alt="Powered by Edamam"
        class=" h-8" src="https://developer.edamam.com/images/transparent.svg" /></a>
    <h4 class="mx-2">+</h4>
    <a href="https://cohere.ai" title="Co:here" class="inline-block"><svg alt="Co:here" viewBox="0 0 1552 446"
        fill="none" xmlns="http://www.w3.org/2000/svg" class="block w-auto align-top h-5 false -mt-1">
        <path
          d="M1377.78 250.565C1390.73 200.116 1424.14 181.954 1451.08 181.954C1480.74 181.954 1509.72 199.107 1513.47 250.565H1377.78ZM1463.69 444.627C1502.9 444.627 1529.84 431.174 1549.95 415.703L1543.82 406.958C1525.07 420.748 1502.22 430.502 1472.9 430.502C1419.71 430.502 1372.66 398.55 1372.66 304.042C1372.66 285.88 1374.02 269.736 1375.39 263.346H1552C1540.75 195.071 1497.45 170.183 1451.08 170.183C1397.21 170.183 1327.66 217.269 1327.66 305.723C1327.66 399.896 1396.53 444.627 1463.69 444.627ZM1151.73 440.255H1244.12V430.838C1218.55 424.784 1217.87 416.712 1217.87 348.437V252.92L1246.85 221.641C1256.4 210.878 1260.83 207.515 1269.35 207.515C1281.29 207.515 1289.81 218.278 1304.13 218.278C1317.43 218.278 1324.93 207.515 1324.93 192.38C1324.93 180.609 1316.4 172.537 1301.4 172.537C1281.63 172.537 1270.04 183.299 1246.85 208.188L1217.87 239.13V170.183L1151.04 205.497V215.251C1174.91 217.269 1174.91 218.95 1174.91 292.27V348.437C1174.91 416.712 1174.23 424.784 1151.73 430.838V440.255ZM954.657 250.565C967.613 200.116 1001.03 181.954 1027.96 181.954C1057.62 181.954 1086.6 199.107 1090.35 250.565H954.657ZM1040.58 444.627C1079.79 444.627 1106.72 431.174 1126.84 415.703L1120.7 406.958C1101.95 420.748 1079.1 430.502 1049.78 430.502C996.594 430.502 949.543 398.55 949.543 304.042C949.543 285.88 950.907 269.736 952.271 263.346H1128.88C1117.63 195.071 1074.33 170.183 1027.96 170.183C974.091 170.183 904.538 217.269 904.538 305.723C904.538 399.896 973.409 444.627 1040.58 444.627ZM554.724 245.184C570.749 245.184 583.023 233.076 583.023 217.269C583.023 201.798 570.749 189.69 554.724 189.69C539.04 189.69 527.107 201.798 527.107 217.269C527.107 233.076 539.04 245.184 554.724 245.184ZM554.724 445.636C570.749 445.636 583.023 434.201 583.023 418.394C583.023 402.586 570.749 390.815 554.724 390.815C539.04 390.815 527.107 402.586 527.107 418.394C527.107 434.201 539.04 445.636 554.724 445.636ZM365.156 433.865C321.856 433.865 283.67 400.232 283.67 309.087C283.67 218.278 321.856 181.618 365.156 181.618C409.139 181.618 447.666 218.278 447.666 309.087C447.666 400.232 409.139 433.865 365.156 433.865ZM365.156 444.964C422.436 444.964 493.353 396.869 493.353 309.087C493.353 221.305 422.436 170.183 365.156 170.183C308.559 170.183 237.641 221.305 237.641 309.087C237.641 396.869 308.559 444.964 365.156 444.964ZM132.629 443.955C172.861 443.955 201.842 428.82 219.571 406.622L213.775 399.559C197.069 417.721 172.861 429.829 141.835 429.829C84.2144 429.829 44.6643 394.178 44.6643 303.369C44.6643 215.587 86.942 182.627 134.334 182.627C155.473 182.627 169.452 190.362 172.861 203.816C174.907 212.56 178.316 229.04 195.705 229.04C209.684 229.04 218.207 219.959 218.207 205.834C218.207 181.954 176.271 170.855 133.652 170.855C71.5993 170.855 0 222.986 0 306.396C0 392.496 63.0756 443.955 132.629 443.955ZM620.186 440.255H711.22V430.838C686.671 424.784 685.989 416.712 685.989 348.437V245.52L705.083 228.368C739.177 197.425 759.634 188.008 778.046 188.008C801.23 188.008 815.209 201.461 815.209 237.449V348.437C815.209 416.712 814.186 424.784 789.638 430.838V440.255H881.012V430.838C858.169 424.784 858.169 416.712 858.169 348.437V239.803C858.169 191.035 832.938 171.528 790.661 171.528C763.726 171.528 737.473 184.981 705.083 214.914L685.989 232.067V0L619.845 33.6329V42.7138C643.03 43.7228 643.03 45.4045 643.03 111.661V348.437C643.03 416.712 642.348 424.784 620.186 430.838V440.255Z"
          fill="#101010"></path>
      </svg></a>
  </footer>
</template>

<style scoped>
.translate-center {
  @apply block -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2;
}

.food-item:hover .close-icon,
.food-item:focus .close-icon {
  visibility: visible;
}

.recipe-text>>>p {
  @apply whitespace-pre-wrap;
}

.recipe-text {
  @apply break-words w-full;
}

.leading-28 {
  line-height: 7rem;
}

button {
  @apply text-black/[0.8]
}

.lime-button {
  @apply bg-lime-200 text-2xl block;
}

.lime-button:hover {
  @apply bg-lime-300;
}

.lime-button:focus {
  @apply bg-yellow-300;
}

button:disabled {
  @apply bg-slate-100 ring-slate-200 text-slate-300 pointer-events-none;
}

.blue-button {
  @apply bg-blue-200 text-2xl;
}

.blue-button:hover {
  @apply bg-blue-300;
}

.blue-button:focus {
  @apply bg-blue-400;
}

.yellow-button {
  @apply bg-yellow-300 text-2xl;
}

.yellow-button:hover {
  @apply bg-yellow-400;
}

.yellow-button:focus {
  @apply bg-yellow-500;
}


.red-button {
  @apply bg-red-300 text-2xl ring-red-400 border-0 ring-2;
}

.red-button:hover {
  @apply bg-red-400 ring-red-500 border-0 ring-2;
}

.red-button:focus {
  @apply bg-red-500 ring-red-600 border-0 ring-2;
  ;
}



.lime-ring {
  @apply ring-lime-400 border-0 ring-2;
}

.lime-ring:hover,
.focus-parent:hover .lime-ring-child {
  @apply ring-lime-500 outline-none;
}

.lime-ring:focus,
.focus-parent:focus-within .lime-ring-child {
  @apply ring-yellow-400 outline-none;
}



.yellow-ring {
  @apply ring-yellow-400 border-0 ring-2;
}

.yellow-ring:hover {
  @apply ring-yellow-500 outline-none;
}

.yellow-ring:focus {
  @apply ring-yellow-600 outline-none;
}




.hover-hide-child-parent:hover .hover-hide-child,
.hover-hide-child-parent:focus .hover-hide-child,
.hover-hide-child-parent:active .hover-hide-child {
  visibility: hidden;
}

.hover-show-child-parent:hover .hover-show-child,
.hover-show-child-parent:focus .hover-show-child,
.hover-show-child-parent:active .hover-show-child {
  visibility: visible;
}
</style>
