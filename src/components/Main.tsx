import React from 'react';

import RecipeGraph from 'components/RecipeGraph';

import { Recipe, recipes as allRecipes } from 'data/Recipes';

import { distinct } from 'utilities';

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

const Main: React.FC = () =>
{
  return (
    <RecipeGraph recipes={recipes} />
  );
};

export default Main;
