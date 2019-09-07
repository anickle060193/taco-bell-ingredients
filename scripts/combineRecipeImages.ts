import fs from 'fs';
import path from 'path';

import recipes from './recipes.json';
import images from './images.json';

interface Ingredient
{
  name: string;
  src: string | null;
}

interface Recipe
{
  name: string;
  category: string;
  src: string | null;
  ingredients: Ingredient[];
}

interface ImageMap
{
  [ name: string ]: string;
}

const INGORED_CATEGORIES = new Set( [
  'Cantina Menu',
  'Cantina Beer, Wine and Spirits',
  'Las Vegas Cantina Menu',
  'Fresco Menu',
  'Specialties',
  'Limited Time Offer',
] );

const HARDCODED_IMAGES: ImageMap = {
  'Nestle Coffee-Mate Sweetened Original Creamer': 'https://images-na.ssl-images-amazon.com/images/I/81cTvnHQ0rL._SY355_.jpg',
  'Black Bean Burrito': 'https://www.tacobell.com/images/22392_black_bean_burrito_269x269.jpg',

  // Recipe Bases
  'Flour Tortilla': 'https://images-na.ssl-images-amazon.com/images/I/51tHnBv-8NL._SY355_.jpg',
  'Gordita Flatbread': 'https://www.tacobell.com/images/22813_cheesy_gordita_crunch_269x269.jpg',
  'Nacho Chips': 'https://www.tacobell.com/images/22269_chips_and_salsa_269x269.jpg',
  'Tostada Shell': 'https://www.tacobell.com/images/22482_spicy_tostada_269x269.jpg',
  'Taco Shell': 'https://www.tacobell.com/images/22100_crunchy_taco_269x269.jpg',
  'Chalupa Shell': 'https://www.tacobell.com/images/22850_chalupa_supreme_269x269.jpg',
  'Taco Salad Shell': 'https://www.tacobell.com/images/22297_fiesta_taco_salad_269x269.jpg',
  'Mexican Pizza Shell': 'https://www.tacobell.com/images/22303_mexican_pizza_269x269.jpg',
  'Cherry Flavored Syrup': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Cherry_Stella444.jpg/1024px-Cherry_Stella444.jpg',
};

// tslint:disable:object-literal-key-quotes
const WHOLE_NAME_REPLACEMENTS = {
  'Hashbrown': 'Hash Brown',
  'Eggs': 'Egg',
  'Cheddar Cheese': 'Cheese',
  'USDA Select Marinated Grilled Steak': 'Steak',
  'Creamy Chipotle Sauce': 'Chipotle Sauce',
  'Iceberg Lettuce': 'Lettuce',
  'Romaine Lettuce': 'Lettuce',
  'Refried Beans': 'Beans',
  'Three Cheese Blend': '3 Cheese Blend',
  'Reduced-Fat Sour Cream': 'Reduced Fat Sour Cream',
  'Premium Guacamole': 'Guacamole',
  'Potato Bites': 'Potatoes',
  'Fritos Chips': 'Fritos',
  'Fire Grilled Chicken': 'Chicken',
  'Spicy Ranch Sauce': 'Spicy Ranch',
  'Fire Roasted Salsa': 'Salsa',
  'Water': 'Cup of Water',
  'Tropicana Orange Juice': 'Orange Juice',
  'Pineapple Freeze': 'Cherry Sunset Freeze',
  'Mtn Dew Baja Blast Freeze': 'Mountain Dew Baja Blast Freeze',
  'Strawberry Skittles Freeze': 'Strawberry Skittles Freeze',
  'Cinnabon Delights': 'Cinnabon Delights 2 Pack',
  'Grande Scrambler Burrito': 'Grande Scrambler',
  'Rainforest Coffee': 'Premium Hot Coffee',
  'Beefy Nacho Loaded Griller': 'Beefy Nacho Griller',
  'Cheesy Gordita Crunch Supreme': 'Cheesy Gordita Crunch',
  'Gordita Supreme': 'Cheesy Gordita Crunch',
} as const;
// tslint:enabled:object-literal-key-quotes

const NAME_REPLACEMENTS = [
  [ /[®™]/g, '' ],
  [ /\s*\(\d+ fl oz\)$/, '' ],
  [ /\s*\(\d+ oz\)$/, '' ],
  [ /\s*- \d+ oz$/, '' ],
  [ /\s*\(\d+ portion creamer\)$/, '' ],
  [ /^Quesadilla - (.*)$/, '$1 Quesadilla' ],
  [ /- Fiesta Potato$/, 'Fiesta Potato' ],
  [ / - (Steak|Beef|Chicken|Bacon|Sausage|Egg & Cheese|Original)$/, '' ],
  [ 'Jalapeno', 'Jalapeño' ],
  [ /Doritos Locos Taco (.*?) Shell/, '$1 Doritos Locos Tacos' ],
  [ /\s*\(\d+ Pack( - Serves \d+)?\)$/, '' ],
  [ 'Mtn Dew', 'Mountain Dew' ],
  [ /^Rainforest Coffee.*$/, 'Rainforest Coffee' ],
  [ '&', 'and' ],
  [ '\'n', 'N' ],
  [ 'Pico de Gallo', 'Pico De Gallo' ],
  [ /^(.*) Doritos Locos Taco( Supreme)?$/, '$1 Doritos Locos Tacos$2' ],
  [ /^.* Doritos Double Decker Taco$/, 'Double Decker Taco' ],
] as const;

function getItemNameIndexer( name: string )
{
  let replacedName = NAME_REPLACEMENTS.reduce( ( n, [ searchValue, replacement ] ) => n.replace( searchValue, replacement ), name );
  if( replacedName in WHOLE_NAME_REPLACEMENTS )
  {
    return WHOLE_NAME_REPLACEMENTS[ replacedName as keyof typeof WHOLE_NAME_REPLACEMENTS ];
  }
  return replacedName;
}

const RECIPES_SRC_FILENAME = path.join( __dirname, '..', 'src', 'data', 'recipes.json' );

const recipeImages: ImageMap = images.recipe;
const ingredientImages: ImageMap = images.ingredient;

function getRecipeImage( recipeName: string )
{
  let key = getItemNameIndexer( recipeName );
  return HARDCODED_IMAGES[ key ] || recipeImages[ key ] || ingredientImages[ key ] || null;
}

function getIngredientImage( ingredient: string )
{
  let key = getItemNameIndexer( ingredient );
  return HARDCODED_IMAGES[ key ] || ingredientImages[ key ] || recipeImages[ key ] || null;
}

const recipesWithImages = recipes
  .filter( ( recipe ) => !recipe.name.match( /\([Rr]egional\)/ ) )
  .filter( ( recipe ) => !INGORED_CATEGORIES.has( recipe.category ) )
  .map( ( recipe ): Recipe => ( {
    ...recipe,
    src: getRecipeImage( recipe.name ),
    ingredients: recipe.ingredients.map( ( ingredient ) => ( {
      name: ingredient,
      src: getIngredientImage( ingredient ),
    } ) )
  } ) );

console.log( `Writing recipes with images to "${RECIPES_SRC_FILENAME}"...` );
fs.writeFileSync( RECIPES_SRC_FILENAME, JSON.stringify( recipesWithImages, null, 2 ) );
