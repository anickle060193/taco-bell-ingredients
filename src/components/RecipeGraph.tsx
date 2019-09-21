import React, { useRef, useEffect, useState, useCallback } from 'react';
import { makeStyles, createStyles } from '@material-ui/core';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceRadial, forceCollide, Simulation } from 'd3-force';

import HtmlGraph from 'components/HtmlGraph';

import useRefInit from 'hooks/useRefInit';

import { Recipe, Ingredient } from 'data/Recipes';
import { NodeDatum, LinkDatum, UninitializedNodeDatum, UninitializedLinkDatum } from 'data/Simulation';

import { distinct } from 'utilities';

const NODE_RADIUS = 16;

const useStyles = makeStyles( ( theme ) => createStyles( {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
} ) );

const recipeId = ( recipe: Recipe ) => `recipe_${recipe.name}`;
const ingredientId = ( ingredient: Ingredient ) => `ingredient_${ingredient.name}`;
const linkId = ( recipe: Recipe, ingredient: Ingredient ) => `${recipeId( recipe )}->${ingredientId( ingredient )}`;

const createIngredientNode = ( ingredient: Ingredient ): UninitializedNodeDatum => ( {
  id: ingredientId( ingredient ),
  name: ingredient.name,
  type: 'ingredient',
  data: ingredient,
} );

const createRecipeNode = ( recipe: Recipe ): UninitializedNodeDatum => ( {
  id: recipeId( recipe ),
  name: `${recipe.name} (${recipe.category})`,
  type: 'recipe',
  data: recipe,
} );

interface Props
{
  recipes: Recipe[];
}

const RecipeGraph: React.FC<Props> = ( { recipes } ) =>
{
  const styles = useStyles();

  // const [ hiddenNodes, setHiddenNodes ] = useState<Set<string>>( new Set() );

  const simulationRef = useRefInit<Simulation<NodeDatum, LinkDatum>>( () =>
  {
    return forceSimulation<NodeDatum, LinkDatum>()
      .force( 'charge', forceManyBody().strength( -NODE_RADIUS * 20 ) )
      .force( 'center', forceCenter( 0, 0 ) )
      .force( 'radial', forceRadial( 500 ) )
      .force( 'collide', forceCollide( NODE_RADIUS ) );
  } );

  const nodesRef = useRef<NodeDatum[]>( [] );
  useEffect( () =>
  {
    const ingredients = distinct( recipes.flatMap( ( recipe ) => recipe.ingredients ), ( ingredient ) => ingredient.name );

    const existingNodes = new Set( nodesRef.current.map( ( n ) => n.id ) );
    const allNodes = new Set( [
      ...ingredients.map( ingredientId ),
      ...recipes.map( recipeId ),
    ] );

    nodesRef.current = [
      ...nodesRef.current.filter( ( n ) => allNodes.has( n.id ) ),
      ...ingredients.filter( ( ingredient ) => !existingNodes.has( ingredientId( ingredient ) ) ).map( createIngredientNode ),
      ...recipes.filter( ( recipe ) => !existingNodes.has( recipeId( recipe ) ) ).map( createRecipeNode ),
    ] as NodeDatum[];

    simulationRef.current.nodes( nodesRef.current );

  }, [ simulationRef, nodesRef, recipes ] );

  const linksRef = useRef<LinkDatum[]>( [] );
  useEffect( () =>
  {
    linksRef.current = recipes
      .flatMap<UninitializedLinkDatum>( ( recipe ) =>
        recipe.ingredients
          .map( ( ingredient ) => ( {
            id: linkId( recipe, ingredient ),
            source: recipeId( recipe ),
            target: ingredientId( ingredient ),
          } ) )
      ) as LinkDatum[];

    simulationRef.current
      .force( 'link',
        forceLink<NodeDatum, LinkDatum>( linksRef.current ).id( ( node ) => node.id )
          .distance( NODE_RADIUS * 10 )
      );

  }, [ simulationRef, recipes ] );

  const [ , setUpdateCount ] = useState( 0 );
  useEffect( () =>
  {
    const sim = simulationRef.current;

    function onTick()
    {
      setUpdateCount( ( oldUpdateCount ) => oldUpdateCount + 1 );
    }

    sim.on( `tick.${RecipeGraph.name}`, onTick );

    return () =>
    {
      sim.on( `tick.${RecipeGraph.name}`, null );
    };
  }, [ simulationRef ] );

  const onNodeDrag = useCallback( ( nodeId: string, x: number, y: number ) =>
  {
    const draggingNode = nodesRef.current.find( ( n ) => n.id === nodeId );
    if( !draggingNode )
    {
      return;
    }

    draggingNode.fx = x;
    draggingNode.fy = y;
    simulationRef.current.alpha( 1.0 );
    simulationRef.current.restart();
  }, [ nodesRef, simulationRef ] );

  const onNodeDragEnd = useCallback( ( nodeId: string ) =>
  {
    const draggingNode = nodesRef.current.find( ( n ) => n.id === nodeId );
    if( !draggingNode )
    {
      return;
    }

    draggingNode.fx = null;
    draggingNode.fy = null;
    simulationRef.current.alpha( 1.0 );
    simulationRef.current.restart();
  }, [ nodesRef, simulationRef ] );

  return (
    <div className={styles.container}>
      <HtmlGraph
        nodes={nodesRef.current}
        links={linksRef.current}
        nodeRadius={NODE_RADIUS}
        onNodeDrag={onNodeDrag}
        onNodeDragEnd={onNodeDragEnd}
      />
    </div>
  );
};

export default RecipeGraph;
