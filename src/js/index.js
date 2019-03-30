import {elements, renderLoader, clearLoader} from './views/base';
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeView from './views/likeView';

/*
    Global state of the app
    * - Search object
    * - current recipe object
    * - Shopping list object
    * - Liked recipes
*/

const state = {};
window.state = state;


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
    if(id) {
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        searchView.highlightSelected(id)    ;
        state.recipe = new Recipe(id);
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcTime();
            state.recipe.calcServings();
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            console.log(error);
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



/*
    // Recipe Controller Model
*/

const controlList = () => {
    if (!state.list) {
        state.list = new List();
    }
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};



/*
    // Likes Controller Model
*/

const controlLikes = () => {
    if (!state.likes) {
        state.likes = new Likes();
    }
    const currentID = state.recipe.id;
    if (!state.likes.isLiked(currentID)) {
        const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);
        likeView.toggleLikeBtn(true);
        likeView.renderLike(newLike);
    } else {
        state.likes.deleteLike(currentID);
        likeView.toggleLikeBtn(false);
        likeView.deleteLike(currentID);
    }
    likeView.toggleLikeMenu(state.likes.getNumLikes());
};



// Restore like recipes on page load

window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    likeView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likeView.renderLike(like));
})



// Handling delete and update list item

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        state.recipe.updateServings('dec');
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLikes();
    }
});

window.l = new List();