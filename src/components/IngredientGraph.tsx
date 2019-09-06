import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import * as d3 from 'd3';

import useRefInit from 'hooks/useRefInit';
import useSimulation from 'hooks/useSimulation';

import recipes from 'data/recipes.json';

const NODE_RADIUS = 6;

const useStyles = makeStyles( {
  canvasContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  link: {
    strokeWidth: '1px',
    stroke: 'white',
  },
  node: {
    fill: 'blue',
  },
} );

interface NodeDatum extends d3.SimulationNodeDatum
{
  id: string;
  name: string;
  type: 'recipe' | 'ingredient';
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum>
{
  id: string;
}

const recipeId = ( name: string ) => `recipe_${name}`;
const ingredientId = ( name: string ) => `ingredient_${name}`;

const IngredientGraph: React.FC = () =>
{
  const styles = useStyles();

  const nodesRef = useRefInit<NodeDatum[]>( () =>
  {
    const ingredients = Array.from( new Set( recipes.flatMap( ( recipe ) => recipe.ingredients ) ) );
    const recipeNames = Array.from( new Set( recipes.map( ( recipe ) => recipe.name ) ) );

    return [
      ...ingredients.map<NodeDatum>( ( ingredient ) => ( {
        id: ingredientId( ingredient ),
        name: ingredient,
        type: 'ingredient',
      } ) ),
      ...recipeNames.map<NodeDatum>( ( recipeName ) => ( {
        id: recipeId( recipeName ),
        name: recipeName,
        type: 'recipe',
      } ) )
    ];
  } );

  const linksRef = useRefInit<LinkDatum[]>( () =>
    recipes
      .flatMap( ( { name, ingredients } ) =>
        ingredients
          .map( ( ingredient ) => ( {
            id: `${name}->${ingredient}`,
            source: recipeId( name ),
            target: ingredientId( ingredient ),
          } ) )
      )
  );

  useSimulation( () =>
  {
    return d3.forceSimulation<NodeDatum, LinkDatum>( nodesRef.current )
      .force( 'link', d3.forceLink<NodeDatum, LinkDatum>( linksRef.current ).id( ( node ) => node.id ) )
      .force( 'charge', d3.forceManyBody() )
      .force( 'center', d3.forceCenter( 0, 0 ) )
      .force( 'collide', d3.forceCollide() );
  } );

  const canvasRef = useRef<HTMLCanvasElement>( null );

  const [ size, setSize ] = useState( { width: 0, height: 0 } );
  const [ scale /* , setScale */ ] = useState( 0.5 );

  useEffect( () =>
  {
    function onResize()
    {
      if( canvasRef.current )
      {
        setSize( {
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        } );
      }
    }

    window.addEventListener( 'resize', onResize );

    onResize();

    return () => window.removeEventListener( 'resize', onResize );
  }, [] );

  useEffect( () =>
  {
    if( !canvasRef.current )
    {
      return;
    }

    if( !canvasRef.current.getContext )
    {
      console.error( 'Browser does not support the canvas element.' );
      return;
    }

    const context = canvasRef.current.getContext( '2d' );
    if( !context )
    {
      console.error( 'Failed to retrieve context for canvas.' );
      return;
    }

    context.setTransform( 1, 0, 0, 1, 0, 0 );
    context.clearRect( 0, 0, size.width, size.height );
    context.translate( size.width / 2.0, size.height / 2.0 );
    context.scale( scale, scale );

    context.strokeStyle = 'lightgray';
    context.lineWidth = 0.5;

    for( let link of linksRef.current )
    {
      if( typeof link.source !== 'object'
        || typeof link.target !== 'object'
        || typeof link.source.x !== 'number'
        || typeof link.source.y !== 'number'
        || typeof link.target.x !== 'number'
        || typeof link.target.y !== 'number' )
      {
        continue;
      }

      context.beginPath();
      context.moveTo( link.source.x, link.source.y );
      context.lineTo( link.target.x, link.target.y );
      context.stroke();
    }

    context.fillStyle = 'orange';
    for( let node of nodesRef.current.filter( ( n ) => n.type === 'ingredient' ) )
    {
      if( typeof node.x !== 'number'
        || typeof node.y !== 'number' )
      {
        continue;
      }

      context.beginPath();
      context.arc( node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI, false );
      context.fill();
    }

    context.fillStyle = 'green';
    for( let node of nodesRef.current.filter( ( n ) => n.type === 'recipe' ) )
    {
      if( typeof node.x !== 'number'
        || typeof node.y !== 'number' )
      {
        continue;
      }

      context.beginPath();
      context.arc( node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI, false );
      context.fill();
    }
  } );

  const [ mousePosition, setMousePosition ] = useState<{ x: number, y: number }>();

  function onMouseMove( e: React.MouseEvent<HTMLCanvasElement> )
  {
    let x = ( e.clientX - size.width / 2 ) / scale;
    let y = ( e.clientY - size.height / 2 ) / scale;
    setMousePosition( { x, y } );
  }

  const hoveredNode = mousePosition && [ ...nodesRef.current ].reverse().find( ( node ) =>
  {
    if( typeof node.x !== 'number'
      || typeof node.y !== 'number' )
    {
      return false;
    }

    const xDistance = node.x - mousePosition.x;
    const yDistance = node.y - mousePosition.y;
    const distance = Math.sqrt( xDistance * xDistance + yDistance * yDistance );

    return distance <= NODE_RADIUS;
  } );

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        title={hoveredNode && hoveredNode.name}
        width={size.width}
        height={size.height}
        onMouseMove={onMouseMove}
        onMouseLeave={( e ) => setMousePosition( undefined )}
      />
    </div>
  );

  // return (
  //   <svg
  //     className={styles.svg}
  //     viewBox="-1000 -1000 2000 2000"
  //   >
  //     {linksRef.current.map( ( link ) =>
  //       (
  //         <line
  //           key={link.index}
  //           className={styles.link}
  //           x1={( link.source as IngredientNodeDatum ).x}
  //           y1={( link.source as IngredientNodeDatum ).y}
  //           x2={( link.target as IngredientNodeDatum ).x}
  //           y2={( link.target as IngredientNodeDatum ).y}
  //         />
  //       )
  //     )}
  //     {nodesRef.current.map( ( node ) =>
  //       (
  //         <circle
  //           key={node.name}
  //           className={styles.node}
  //           cx={node.x}
  //           cy={node.y}
  //           r={10}
  //         />
  //       )
  //     )}
  //   </svg>
  // );
};

export default IngredientGraph;
