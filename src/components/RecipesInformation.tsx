import React from 'react';
import { Typography } from '@material-ui/core';

import { Recipe } from 'data/Recipes';

interface Props
{
  recipes: Recipe[];
}

const RecipesInformation: React.FC<Props> = ( { recipes } ) =>
{
  let maxIngredientRecipe = recipes.reduce( ( currentMax, recipe ) =>
  {
    if( !currentMax
      || recipe.ingredients.length > currentMax.ingredients.length )
    {
      return recipe;
    }
    else
    {
      return currentMax;
    }
  } );

  return (
    <table>
      <tbody>
        <tr>
          <Typography component="td"># of Recipes:</Typography>
          <Typography component="td">{recipes.length}</Typography>
        </tr>
        <tr>
          <Typography component="td"># of Ingredients:</Typography>
          <Typography component="td">{recipes.flatMap( ( recipe ) => recipe.ingredients ).length}</Typography>
        </tr>
        <tr>
          <Typography component="td">Avg Ingredient/Recipe:</Typography>
          <Typography component="td">
            {( recipes.reduce( ( total, recipe ) => total + recipe.ingredients.length, 0 ) / recipes.length ).toFixed( 2 )}
          </Typography>
        </tr>
        {maxIngredientRecipe && (
          <tr>
            <Typography component="td">Max Ingredient/Recipe:</Typography>
            <Typography component="td">{maxIngredientRecipe.ingredients.length} ({maxIngredientRecipe.name})</Typography>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default RecipesInformation;
