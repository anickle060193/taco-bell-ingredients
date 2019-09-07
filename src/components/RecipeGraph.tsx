import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core';
import * as d3 from 'd3';

import CanvasGraph from 'components/CanvasGraph';
import RecipesInformation from 'components/RecipesInformation';

import useRefInit from 'hooks/useRefInit';
import useSimulation from 'hooks/useSimulation';

import { Recipe, Ingredient, recipes as allRecipes } from 'data/Recipes';
import { NodeDatum, LinkDatum } from 'data/Simulation';

import { distinct } from 'utilities';

const NODE_RADIUS = 6;

const useStyles = makeStyles( ( theme ) => createStyles( {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  information: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: theme.spacing( 2 ),
  },
} ) );

const DISPLAYED_CATEGORIES = new Set( [
  'Breakfast',
  'Morning Dollar Value Menu',
  'Burritos',
  'Dollar Cravings Menu',
  'Freezes',
  'Fresco Menu',
  'Limited Time Offer',
  'Power Menu',
  'Sides',
  'Specialties',
  'Drinks & Sweets',
  'Tacos',
  'Cantina Menu',
  'Cantina Beer, Wine and Spirits',
  'Las Vegas Cantina Menu',
  'Vegetarian Menu',
] );
const recipes: Recipe[] = distinct(
  allRecipes.filter( ( recipe ) => DISPLAYED_CATEGORIES.has( recipe.category ) ),
  ( recipe ) => recipe.name
);
console.log( 'Filtered Recipe Count:', recipes.length, 'Total Recipe Count:', allRecipes.length );

const recipeId = ( recipe: Recipe ) => `recipe_${recipe.name}`;
const ingredientId = ( ingredient: Ingredient ) => `ingredient_${ingredient.name}`;
const linkId = ( recipe: Recipe, ingredient: Ingredient ) => `${recipeId( recipe )}->${ingredientId( ingredient )}`;

const RecipeGraph: React.FC = () =>
{
  const styles = useStyles();

  const nodesRef = useRefInit<NodeDatum[]>( () =>
  {
    const ingredients = distinct( recipes.flatMap( ( recipe ) => recipe.ingredients ), ( ingredient ) => ingredient.name );

    return [
      ...ingredients.map<NodeDatum>( ( ingredient ) => ( {
        id: ingredientId( ingredient ),
        name: ingredient.name,
        type: 'ingredient',
        data: ingredient,
      } ) ),
      ...recipes.map<NodeDatum>( ( recipe ) => ( {
        id: recipeId( recipe ),
        name: `${recipe.name} (${recipe.category})`,
        type: 'recipe',
        data: recipe,
      } ) )
    ];
  } );

  const linksRef = useRefInit<LinkDatum[]>( () =>
    recipes
      .flatMap( ( recipe ) =>
        recipe.ingredients
          .map( ( ingredient ) => ( {
            id: linkId( recipe, ingredient ),
            source: recipeId( recipe ),
            target: ingredientId( ingredient ),
          } ) )
      )
  );

  useSimulation( () =>
  {
    return d3.forceSimulation<NodeDatum, LinkDatum>( nodesRef.current )
      .force( 'link',
        d3.forceLink<NodeDatum, LinkDatum>( linksRef.current ).id( ( node ) => node.id )
          .distance( 100 )
      )
      .force( 'charge', d3.forceManyBody().strength( -200 ) )
      .force( 'center', d3.forceCenter( 0, 0 ) )
      .force( 'collide', d3.forceCollide( NODE_RADIUS ) );
  } );

  return (
    <div className={styles.container}>
      <CanvasGraph
        nodeRadius={NODE_RADIUS}
        nodes={nodesRef.current}
        links={linksRef.current}
      />
      <div className={styles.information}>
        <RecipesInformation recipes={recipes} />
      </div>
    </div>
  );
};

export default RecipeGraph;
