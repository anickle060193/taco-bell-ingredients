import allRecipes from 'data/recipes.json';

export interface Ingredient
{
  name: string;
  src: string;
}

export interface Recipe
{
  name: string;
  category: string;
  src: string;
  ingredients: Ingredient[];
}

export const recipes: Recipe[] = allRecipes;
