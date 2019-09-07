import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const RECIPES_DATA_FILENAME = path.join( __dirname, 'recipes.json' );

const RECIPES_URL = 'https://www.nutritionix.com/taco-bell/ingredient-search/premium';

interface Recipe
{
  name: string;
  category: string;
  ingredients: string[];
}

async function main()
{
  console.log( 'Launching browser...' );
  const browser = await puppeteer.launch( { headless: false } );

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
    const recipeList: Recipe[] = [];

    let recipeTable = document.querySelector( '#ingredientSearchGrid tbody' );
    if( !( recipeTable instanceof HTMLElement ) )
    {
      throw new Error( 'Could not find recipe table body.' );
    }

    let category = '';

    for( let iterElement = recipeTable.firstElementChild; iterElement instanceof HTMLElement; iterElement = iterElement.nextElementSibling )
    {
      if( iterElement.matches( '.subCategory' ) )
      {
        let categoryHeading = iterElement.querySelector( 'h3' );
        if( !categoryHeading )
        {
          throw new Error( 'Category has no heading element.' );
        }
        else if( !categoryHeading.textContent )
        {
          throw new Error( 'Category heading has no text.' );
        }
        category = categoryHeading.textContent;
      }
      else if( iterElement.matches( '.filterTextParent' ) )
      {
        let recipe = iterElement.querySelector( '.itemName' );
        if( !recipe )
        {
          throw new Error( 'Recipe row has no recipe item name.' );
        }
        else if( !recipe.textContent )
        {
          throw new Error( 'Recipe item name has no text.' );
        }

        let ingredientStatement = iterElement.querySelector( '.ingredientStatement' );
        if( !ingredientStatement )
        {
          throw new Error( 'Recipe row has no ingredient statement.' );
        }

        let ingredients = Array.from( ingredientStatement.querySelectorAll( 'strong' ) )
          .map( ( el ) => el.textContent )
          .filter( ( ingredient ): ingredient is string => typeof ingredient === 'string' );

        recipeList.push( {
          name: recipe.textContent,
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
}

if( require.main === module )
{
  main();
}
