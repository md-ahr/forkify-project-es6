import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import {elements, renderLoader, clearLoader} from './views/base';

/*
    Global state of the app
    * - Search object
    * - current recipe object
    * - Shopping list object
    * - Liked recipes
*/

const state = {};



/*
    // Search Controller Model
*/

const controlSearch = async() => {

    // 1) Get query from view
    const query = searchView.getInput();

    if (query) {

        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

       try {
            await state.search.getResults();
            clearLoader();
            searchView.renderResults(state.search.result);
       } catch (error) {
           console.log(error);
       }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});



/*
    // Recipe Controller Model
*/

const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    console.log(id);
    if(id) {
        state.recipe = new Recipe(id);
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcTime();
            state.recipe.calcServings();
            console.log(state.recipe);
        } catch (error) {
            console.log(error);
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));