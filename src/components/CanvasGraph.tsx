import React, { useRef, useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import * as d3 from 'd3';

import { distinct, reversed } from 'utilities';
import createColorSet from 'utilities/colorSet';
import { NodeDatum, LinkDatum } from 'data/Simulation';

const NODE_RADIUS = 32;
const BORDER_THICKNESS = 4;

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

const colors = createColorSet();

function findNodeByPoint( nodes: NodeDatum[], nodeRadius: number, x: number, y: number )
{
  return reversed( nodes ).find( ( node ) =>
  {
    const xDistance = node.x - x;
    const yDistance = node.y - y;
    const distance = Math.sqrt( xDistance * xDistance + yDistance * yDistance );

    return distance <= nodeRadius;
  } );
}

interface GraphProps
{
  simulationRef: React.MutableRefObject<d3.Simulation<NodeDatum, LinkDatum>>;
  nodes: NodeDatum[];
  links: LinkDatum[];
}

interface GraphComponent extends React.FC<GraphProps>
{
  nodeRadius: number;
}

const CanvasGraph: GraphComponent = ( { simulationRef, nodes, links } ) =>
{
  const styles = useStyles();

  const canvasRef = useRef<HTMLCanvasElement>( null );

  const [ size, setSize ] = useState( { width: 0, height: 0 } );

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
  const [ draggingNode, setDraggingNode ] = useState<NodeDatum>();

  function canvasToSimulationCoords( { clientX, clientY }: { clientX: number, clientY: number } )
  {
    return {
      x: ( clientX - size.width / 2 ),
      y: ( clientY - size.height / 2 ),
    };
  }

  function onMouseMove( e: React.MouseEvent<HTMLCanvasElement> )
  {
    let coords = canvasToSimulationCoords( e );
    setMousePosition( coords );

    if( draggingNode )
    {
      simulationRef.current.alpha( 1.0 );
      simulationRef.current.restart();
      draggingNode.fx = coords.x;
      draggingNode.fy = coords.y;
    }
  }

  function onMouseDown( e: React.MouseEvent<HTMLCanvasElement> )
  {
    let { x, y } = canvasToSimulationCoords( e );
    let node = findNodeByPoint( nodes, NODE_RADIUS, x, y );

    setDraggingNode( node );
  }

  const onMouseUp = useCallback( ( e: MouseEvent ) =>
  {
    if( draggingNode )
    {
      simulationRef.current.alpha( 1.0 );
      simulationRef.current.restart();
      draggingNode.fx = null;
      draggingNode.fy = null;
    }
    setDraggingNode( undefined );
  }, [ simulationRef, draggingNode ] );

  useEffect( () =>
  {
    window.addEventListener( 'mouseup', onMouseUp );

    return () => window.removeEventListener( 'mouseup', onMouseUp );
  }, [ onMouseUp ] );

  const hoveredNode = mousePosition && findNodeByPoint( nodes, NODE_RADIUS, mousePosition.x, mousePosition.y );

  const imagesRef = useRef<{ [ src: string ]: HTMLImageElement | null | undefined }>( {} );

  const onSetImage = ( src: string, image: HTMLImageElement | null ) =>
  {
    imagesRef.current[ src ] = image;
  };

  const onDrawCanvas = useCallback( () =>
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

    context.lineWidth = 1.0;

    for( let link of links )
    {
      context.strokeStyle = colors( link.target.id, 100, 50 );
      context.beginPath();
      context.moveTo( link.source.x, link.source.y );
      context.lineTo( link.target.x, link.target.y );
      context.stroke();
    }

    for( let node of nodes )
    {
      let image = imagesRef.current[ node.data.src ];
      if( image && image.complete )
      {
        context.save();
        context.beginPath();
        context.arc( node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI, false );
        context.clip();
        context.drawImage(
          image,
          node.x - NODE_RADIUS,
          node.y - NODE_RADIUS,
          2 * NODE_RADIUS,
          2 * NODE_RADIUS
        );
        context.restore();
      }

      context.strokeStyle = node.type === 'ingredient' ? 'orange' : 'green';
      context.lineWidth = BORDER_THICKNESS;
      context.beginPath();
      context.arc( node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI, false );
      context.stroke();
    }
  }, [ links, nodes, size ] );

  useEffect( () =>
  {
    const sim = simulationRef.current;
    sim.on( 'tick.render', onDrawCanvas );

    return () =>
    {
      sim.on( 'tick.render', null );
    };
  }, [ simulationRef, onDrawCanvas ] );

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        title={hoveredNode && hoveredNode.name}
        width={size.width}
        height={size.height}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={( e ) => setMousePosition( undefined )}
      />
      <div style={{ display: 'none' }}>
        {distinct( nodes.map( ( node ) => node.data.src ) ).map( ( src ) => (
          <img
            key={src}
            src={src}
            alt=""
            ref={( ref ) => onSetImage( src, ref )}
          />
        ) )}
      </div>
    </div>
  );
};

CanvasGraph.nodeRadius = NODE_RADIUS;

export default CanvasGraph;
