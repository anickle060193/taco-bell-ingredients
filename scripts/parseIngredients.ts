import * as fs from 'fs';
import * as path from 'path';

import * as cheerio from 'cheerio';

/**
 * Ingredients downloaded from https://www.nutritionix.com/taco-bell/ingredient-search/premium
 */

const ingredientsHtmlFilename = path.join( __dirname, 'ingredients.html' );
const ingredientsHtml = fs.readFileSync( ingredientsHtmlFilename, { encoding: 'UTF-8' } );

const $ = cheerio.load( ingredientsHtml );

const recipes: Array<{ name: string, ingredients: string[] }> = [];

for( let recipe of Array.from( $( '#ingredientSearchGrid tbody tr.filterTextParent' ) ) )
{
  let itemName = $( recipe ).find( '.itemName' ).text();
  let ingredients = Array.from( $( recipe ).find( '.ingredientStatement strong' ) ).map( ( el ) => $( el ).text() );
  recipes.push( {
    name: itemName,
    ingredients: ingredients
  } );
}

const ingredientsFilename = path.join( __dirname, '..', 'src', 'data', 'recipes.json' );

fs.writeFileSync( ingredientsFilename, JSON.stringify( recipes, null, 2 ) );
