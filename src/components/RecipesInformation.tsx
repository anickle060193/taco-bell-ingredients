import React from 'react';
import { Typography, makeStyles, createStyles, Paper } from '@material-ui/core';
import color from 'color';

import { Recipe } from 'data/Recipes';

const useStyles = makeStyles( ( theme ) => createStyles( {
  root: {
    padding: theme.spacing( 1 ),
    backgroundColor: color( theme.palette.background.paper ).alpha( 0.6 ).string(),
    userSelect: 'none',
  },
} ) );

interface Props
{
  recipes: Recipe[];
}

const RecipesInformation: React.FC<Props> = ( { recipes } ) =>
{
  const styles = useStyles();

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
    <Paper className={styles.root}>
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
    </Paper>
  );
};

export default RecipesInformation;
