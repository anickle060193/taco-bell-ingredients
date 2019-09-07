import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';

import { NodeDatum, LinkDatum } from 'data/Simulation';

const useStyles = makeStyles( {
  canvasContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
} );

interface Props
{
  nodeRadius: number;
  nodes: NodeDatum[];
  links: LinkDatum[];
}

const CanvasGraph: React.FC<Props> = ( { nodeRadius, nodes, links } ) =>
{
  const styles = useStyles();

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

  const [ mousePosition, setMousePosition ] = useState<{ x: number, y: number }>();

  function onMouseMove( e: React.MouseEvent<HTMLCanvasElement> )
  {
    let x = ( e.clientX - size.width / 2 ) / scale;
    let y = ( e.clientY - size.height / 2 ) / scale;
    setMousePosition( { x, y } );
  }

  const hoveredNode = mousePosition && [ ...nodes ].reverse().find( ( node ) =>
  {
    if( typeof node.x !== 'number'
      || typeof node.y !== 'number' )
    {
      return false;
    }

    const xDistance = node.x - mousePosition.x;
    const yDistance = node.y - mousePosition.y;
    const distance = Math.sqrt( xDistance * xDistance + yDistance * yDistance );

    return distance <= nodeRadius;
  } );

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

    for( let link of links )
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
    for( let node of nodes.filter( ( n ) => n.type === 'ingredient' ) )
    {
      if( typeof node.x !== 'number'
        || typeof node.y !== 'number' )
      {
        continue;
      }

      context.beginPath();
      context.arc( node.x, node.y, nodeRadius, 0, 2 * Math.PI, false );
      context.fill();
    }

    context.fillStyle = 'green';
    for( let node of nodes.filter( ( n ) => n.type === 'recipe' ) )
    {
      if( typeof node.x !== 'number'
        || typeof node.y !== 'number' )
      {
        continue;
      }

      context.beginPath();
      context.arc( node.x, node.y, nodeRadius, 0, 2 * Math.PI, false );
      context.fill();
    }
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
};

export default CanvasGraph;
