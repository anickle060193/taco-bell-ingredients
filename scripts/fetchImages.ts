import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const IMAGES_DATA_FILENAME = path.join( __dirname, 'images.json' );

const MENU_URL = 'https://www.tacobell.com/food/new';

interface Images
{
  recipe: { [ recipe: string ]: string };
  ingredient: { [ ingredient: string ]: string };
}

function formatItemName( name: string )
{
  return name.replace( /[®™]/g, '' );
}

async function main()
{
  console.log( 'Launching browser...' );
  const browser = await puppeteer.launch( { headless: false } );

  console.log( 'Opening new page...' );
  const page = await browser.newPage();
  await page.bringToFront();

  console.log( `Navigating to "${MENU_URL}"...` );
  await page.goto( MENU_URL );

  console.log( 'Selecting menus...' );
  const menuUrls = await page.evaluate( () =>
    Array.from( document.querySelectorAll<HTMLAnchorElement>( 'a[href^="/food/"].clp-ribbon-item' ) )
      .map( ( link ) => link.href )
  );

  const images: Images = {
    recipe: {},
    ingredient: {}
  };

  console.log( 'Found', menuUrls.length, 'menus...' );
  for( let menuUrl of menuUrls )
  {
    console.log( `Navigating to "${menuUrl}"...` );
    await page.goto( menuUrl );

    console.log( 'Waiting for images to load...' );
    await page.waitForFunction( () => Array.from( document.querySelectorAll( 'img' ) ).every( ( img ) => img.complete ) );

    console.log( '  Selecing recipe images...' );
    const recipeImages = await page.evaluate( () =>
      Array.from( document.querySelectorAll<HTMLImageElement>( '.product-image img' ) )
        .map( ( img ) => ( {
          recipe: img.alt,
          url: img.currentSrc || img.src || img.srcset,
        } ) )
    );

    console.log( '  Found', recipeImages.length, 'recipe images...' );
    for( let { recipe, url } of recipeImages )
    {
      images.recipe[ formatItemName( recipe ) ] = url;
    }

    console.log( 'Selecting customize buttons...' );
    const customizeButtons = await page.$$( '.product-item button.btn-customize:not( .size-select )' );
    for( let customizeButton of customizeButtons )
    {
      console.log( 'Clicking customize button...' );
      await customizeButton.click();

      console.log( '  Waiting for customize popup...' );
      await page.waitForSelector( '.js-customization-pdp-panel', { visible: true } );

      console.log( '  Waiting for images to load...' );
      await page.waitForFunction( () => Array.from( document.querySelectorAll( 'img' ) ).every( ( img ) => img.complete ) );

      console.log( '  Selecting ingredient images...' );
      const ingredientImages = await page.evaluate( () =>
        Array.from( document.querySelectorAll<HTMLImageElement>( '.js-ingredient-entry img' ) )
          .map( ( img ) => ( {
            ingredient: img.alt,
            url: img.currentSrc || img.src || img.srcset,
          } ) )
      );

      console.log( '  Found', ingredientImages.length, 'ingredient images...' );
      for( let { ingredient, url } of ingredientImages )
      {
        images.ingredient[ formatItemName( ingredient ) ] = url;
      }

      console.log( '  Closing customize popup...' );
      await page.keyboard.press( 'Escape' );

      console.log( '  Waiting for customize popup to close...' );
      await page.waitForSelector( '.js-customization-pdp-panel', { hidden: true } );
    }
  }

  console.log( 'Closing browser...' );
  await browser.close();

  console.log( `Writing ${Object.keys( images.recipe ).length + Object.keys( images.ingredient ).length} images to "${IMAGES_DATA_FILENAME}"...` );
  fs.writeFileSync( IMAGES_DATA_FILENAME, JSON.stringify( images, null, 2 ) );
}

if( require.main === module )
{
  main();
}
