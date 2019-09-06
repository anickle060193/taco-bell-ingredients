import * as fs from 'fs';
import * as path from 'path';

import * as cheerio from 'cheerio';

/**
 * Ingredients downloaded from https://www.nutritionix.com/taco-bell/ingredient-search/premium
 */

const ingredientsHtmlFilename = path.join( __dirname, 'ingredients.html' );
const ingredientsHtml = fs.readFileSync( ingredientsHtmlFilename, { encoding: 'UTF-8' } );

const $ = cheerio.load( ingredientsHtml );

interface Recipe
{
  name: string;
  category: string;
  ingredients: string[];
}

const recipes: Recipe[] = [];

for( let category of Array.from( $( '#ingredientSearchGrid tbody tr.subCategory' ) ) )
{
  let $category = $( category );
  let categoryName = $category.find( 'h3' ).text();

  console.log( categoryName );
  for( let recipe of Array.from( $category.nextUntil( '.subCategory', '.filterTextParent' ) ) )
  {
    let $recipe = $( recipe );
    recipes.push( {
      name: $recipe.find( '.itemName' ).text(),
      category: categoryName,
      ingredients: Array.from( $recipe.find( '.ingredientStatement strong' ) ).map( ( el ) => $( el ).text() )
    } );
  }
}

const ingredientsFilename = path.join( __dirname, '..', 'src', 'data', 'recipes.json' );

fs.writeFileSync( ingredientsFilename, JSON.stringify( recipes, null, 2 ) );
