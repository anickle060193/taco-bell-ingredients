import React, { useRef, useState, useEffect, useCallback } from 'react';
import { makeStyles, createStyles } from '@material-ui/core';
import * as d3 from 'd3';

import ScaleControl from 'components/ScaleControl';

import { NodeDatum, LinkDatum } from 'data/Simulation';

import { distinct, reversed } from 'utilities';
import createColorSet from 'utilities/colorSet';

const NODE_RADIUS = 16;
const BORDER_THICKNESS = 4;

const useStyles = makeStyles( ( theme ) => createStyles( {
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
  scaleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: theme.spacing( 2 ),
  }
} ) );

const colors = createColorSet();

interface MousePosition
{
  clientX: number;
  clientY: number;
}

interface Size
{
  width: number;
  height: number;
}

interface Translation
{
  x: number;
  y: number;
}

interface SimulationPosition
{
  simX: number;
  simY: number;
}

function canvasToSimulationCoords( mousePosition: MousePosition, size: Size, translation: Translation, scale: number ): SimulationPosition
{
  return {
    simX: ( mousePosition.clientX - size.width / 2 - translation.x ) / scale,
    simY: ( mousePosition.clientY - size.height / 2 - translation.y ) / scale,
  };
}

function findNodeByPoint( nodes: NodeDatum[], nodeRadius: number, simulationPosition: SimulationPosition )
{
  return reversed( nodes ).find( ( node ) =>
  {
    const xDistance = node.x - simulationPosition.simX;
    const yDistance = node.y - simulationPosition.simY;
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

  const [ size, setSize ] = useState<Size>( { width: 0, height: 0 } );
  const [ scale, setScale ] = useState( 0.4 );

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

  const [ mousePosition, setMousePosition ] = useState<MousePosition>();
  const [ translation, setTranslation ] = useState<Translation>( { x: 0, y: 0 } );
  const [ mouseDown, setMouseDown ] = useState( false );
  const [ draggingNode, setDraggingNode ] = useState<NodeDatum>();

  const onMouseDown = useCallback( ( e: React.MouseEvent<HTMLCanvasElement> ) =>
  {
    setMouseDown( true );

    let simPosition = canvasToSimulationCoords( e, size, translation, scale );
    setDraggingNode( findNodeByPoint( nodes, NODE_RADIUS, simPosition ) );
  }, [ nodes, size, translation, scale ] );

  useEffect( () =>
  {
    function onMouseMove( e: MouseEvent )
    {
      if( !canvasRef.current )
      {
        return;
      }

      let { left, top } = canvasRef.current.getBoundingClientRect();

      let mouseCoords: MousePosition = {
        clientX: e.clientX - left,
        clientY: e.clientY - top,
      };

      setMousePosition( mouseCoords );

      if( !mouseDown )
      {
        return;
      }

      let coords = canvasToSimulationCoords( mouseCoords, size, translation, scale );

      if( draggingNode )
      {
        draggingNode.fx = coords.simX;
        draggingNode.fy = coords.simY;
        simulationRef.current.alpha( 1.0 );
        simulationRef.current.restart();
      }
      else
      {
        const { movementX, movementY } = e;
        setTranslation( ( oldTranslation ) => ( {
          x: oldTranslation.x + movementX,
          y: oldTranslation.y + movementY,
        } ) );
      }
    }

    window.addEventListener( 'mousemove', onMouseMove );

    return () => window.removeEventListener( 'mousemove', onMouseMove );

  }, [ mouseDown, size, draggingNode, simulationRef, translation, scale ] );

  useEffect( () =>
  {
    function onMouseUp( e: MouseEvent )
    {
      setMouseDown( false );

      if( draggingNode )
      {
        draggingNode.fx = null;
        draggingNode.fy = null;
        simulationRef.current.alpha( 1.0 );
        simulationRef.current.restart();
      }
      setDraggingNode( undefined );

      setMousePosition( undefined );
    }

    window.addEventListener( 'mouseup', onMouseUp );

    return () => window.removeEventListener( 'mouseup', onMouseUp );

  }, [ simulationRef, draggingNode ] );

  const onWheel = useCallback( ( e: React.WheelEvent<HTMLElement> ) =>
  {
    let { simX, simY } = canvasToSimulationCoords( e, size, translation, scale );
    let newScale = Math.max( 0.1, Math.round( ( scale + e.deltaY * -0.001 ) * 100 ) / 100 );

    let newTranslation: Translation = {
      x: e.clientX - size.width / 2 - simX * newScale,
      y: e.clientY - size.height / 2 - simY * newScale,
    };
    setTranslation( newTranslation );
    setScale( newScale );
  }, [ size, translation, scale ] );

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

    context.resetTransform();
    context.clearRect( 0, 0, size.width, size.height );
    context.translate( size.width / 2.0 + translation.x, size.height / 2.0 + translation.y );
    context.scale( scale, scale );

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
  }, [ links, nodes, size, translation, scale ] );

  useEffect( onDrawCanvas );

  const hoveredNode = mousePosition && findNodeByPoint(
    nodes,
    NODE_RADIUS,
    canvasToSimulationCoords( mousePosition, size, translation, scale )
  );

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        title={hoveredNode && hoveredNode.name}
        width={size.width}
        height={size.height}
        onMouseDown={onMouseDown}
        onWheel={onWheel}
      />
      <div className={styles.scaleContainer}>
        <ScaleControl scale={scale} setScale={setScale} />
      </div>
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
