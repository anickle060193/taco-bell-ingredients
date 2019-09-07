import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

const IMAGES_DATA_FILENAME = path.join( __dirname, '..', 'src', 'data', 'images.json' );

const MENU_URL = 'https://www.tacobell.com/food/new';

interface ItemImage
{
  name: string;
  type: 'recipe' | 'ingredient';
  url: string;
}

( async () =>
{
  console.log( 'Launching browser...' );
  const browser = await puppeteer.launch( { headless: false } );

  console.log( 'Opening new page...' );
  const page = await browser.newPage();
  await page.bringToFront();

  console.log( `Navigating to "${MENU_URL}"...` );
  await page.goto( MENU_URL );

  console.log( 'Selecting menus...' );
  const menuUrls = await page.$$eval( 'a[href^="/food/"].clp-ribbon-item', ( links: HTMLAnchorElement[] ) => links.map( ( link ) => link.href ) );

  const images: ItemImage[] = [];

  console.log( 'Found', menuUrls.length, 'menus...' );
  for( let menuUrl of menuUrls )
  {
    console.log( `Navigating to "${menuUrl}"...` );
    await page.goto( menuUrl );

    console.log( 'Waiting for images to load...' );
    await page.waitForFunction( () => Array.from( document.querySelectorAll( 'img' ) ).every( ( img ) => img.complete ) );

    console.log( '  Selecing recipe images...' );
    const recipeImages = await page.$$eval( '.product-image img', ( imgs: HTMLImageElement[] ): ItemImage[] =>
      imgs.map( ( img ) => ( {
        name: img.alt,
        type: 'recipe',
        url: img.currentSrc || img.src || img.srcset,
      } ) )
    );

    console.log( '  Found', recipeImages.length, 'recipe images...' );
    images.push( ...recipeImages );

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
      const ingredientImages = await page.$$eval( '.js-ingredient-entry img', ( imgs: HTMLImageElement[] ): ItemImage[] =>
        imgs.map( ( img ) => ( {
          name: img.alt,
          type: 'ingredient',
          url: img.currentSrc || img.src || img.srcset,
        } ) )
      );

      console.log( '  Found', ingredientImages.length, 'ingredient images...' );
      images.push( ...ingredientImages );

      console.log( '  Closing customize popup...' );
      await page.keyboard.press( 'Escape' );

      console.log( '  Waiting for customize popup to close...' );
      await page.waitForSelector( '.js-customization-pdp-panel', { hidden: true } );
    }
  }

  console.log( 'Closing browser...' );
  await browser.close();

  console.log( `Writing ${images.length} images to "${IMAGES_DATA_FILENAME}"...` );
  fs.writeFileSync( IMAGES_DATA_FILENAME, JSON.stringify( images, null, 2 ) );

} )();
