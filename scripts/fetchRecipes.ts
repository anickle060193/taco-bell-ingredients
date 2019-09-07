import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

const RECIPES_DATA_FILENAME = path.join( __dirname, '..', 'src', 'data', 'recipes.json' );

const RECIPES_URL = 'https://www.nutritionix.com/taco-bell/ingredient-search/premium';

( async () =>
{
  console.log( 'Launching browser...' );
  const browser = await puppeteer.launch();

  console.log( 'Opening new page...' );
  const page = await browser.newPage();
  await page.bringToFront();

  console.log( `Navigating to "${RECIPES_URL}"...` );
  await page.goto( RECIPES_URL );

  console.log( 'Clicking recipes radio button...' );
  await page.click( '#radio_recipe' );

  console.log( 'Waiting for page to update...' );
  await page.waitForSelector( '.subCategory' );

  console.log( 'Parsing recipes...' );
  const recipes = await page.evaluate( () =>
  {
    interface Recipe
    {
      name: string;
      category: string;
      ingredients: string[];
    }

    const recipeList: Recipe[] = [];

    let firstElement = document.querySelector( '#ingredientSearchGrid tbody' ).firstElementChild;
    let category = '';

    for( let iterElement = firstElement; iterElement instanceof HTMLElement; iterElement = iterElement.nextElementSibling )
    {
      if( iterElement.matches( '.subCategory' ) )
      {
        category = iterElement.querySelector( 'h3' ).textContent;
      }
      else if( iterElement.matches( '.filterTextParent' ) )
      {
        let itemName = iterElement.querySelector( '.itemName' ).textContent;
        let ingredients = Array.from( iterElement.querySelector( '.ingredientStatement' ).querySelectorAll( 'strong' ) ).map( ( el ) => el.textContent );
        recipeList.push( {
          name: itemName,
          category: category,
          ingredients: ingredients,
        } );
      }
    }

    return recipeList;
  } );

  console.log( 'Closing browser...' );
  await browser.close();

  console.log( `Writing ${recipes.length} recipes to "${RECIPES_DATA_FILENAME}"...` );
  fs.writeFileSync( RECIPES_DATA_FILENAME, JSON.stringify( recipes, null, 2 ) );
} )();
