import React, { useRef, useState, useEffect, useCallback } from 'react';
import { makeStyles, createStyles } from '@material-ui/core';

import ScaleControl from 'components/ScaleControl';

import { NodeDatum, LinkDatum } from 'data/Simulation';

import { distinct, reversed } from 'utilities';
import createColorSet from 'utilities/colorSet';

const BORDER_THICKNESS = 4;

const useStyles = makeStyles( ( theme ) => createStyles( {
  canvasContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    touchAction: 'none',
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

interface ClientPosition
{
  clientX: number;
  clientY: number;
}

interface CanvasPosition
{
  canvasX: number;
  canvasY: number;
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

type MouseLikeEvent = ClientPosition;

interface MouseMoveLikeEvent extends ClientPosition
{
  movementX: number;
  movementY: number;
}

function clientToCanvasPosition( canvas: HTMLCanvasElement, clientPosition: ClientPosition ): CanvasPosition
{
  let { left, top } = canvas.getBoundingClientRect();

  return {
    canvasX: clientPosition.clientX - left,
    canvasY: clientPosition.clientY - top,
  };
}

function canvasToSimulationPosition( canvasPosition: CanvasPosition, size: Size, translation: Translation, scale: number ): SimulationPosition
{
  return {
    simX: ( canvasPosition.canvasX - size.width / 2 - translation.x ) / scale,
    simY: ( canvasPosition.canvasY - size.height / 2 - translation.y ) / scale,
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

interface Props
{
  nodes: NodeDatum[];
  links: LinkDatum[];
  nodeRadius: number;
  onNodeDrag: ( nodeId: string, x: number, y: number ) => void;
  onNodeDragEnd: ( nodeId: string ) => void;
}

const CanvasGraph: React.FC<Props> = ( { nodes, links, nodeRadius, onNodeDrag, onNodeDragEnd } ) =>
{
  const styles = useStyles();

  const canvasRef = useRef<HTMLCanvasElement>( null );

  const [ size, setSize ] = useState<Size>( { width: 0, height: 0 } );
  const [ translation, setTranslation ] = useState<Translation>( { x: 0, y: 0 } );
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

  const [ mousePosition, setMousePosition ] = useState<CanvasPosition>();
  const [ touchId, setTouchId ] = useState<number>();
  const [ lastTouch, setLastTouch ] = useState<ClientPosition>();
  const [ mouseDown, setMouseDown ] = useState( false );
  const [ draggingNode, setDraggingNode ] = useState<NodeDatum>();

  const onMouseDown = useCallback( ( e: MouseLikeEvent ) =>
  {

    if( !canvasRef.current )
    {
      return;
    }

    setMouseDown( true );

    let canvasPosition = clientToCanvasPosition( canvasRef.current, e );
    let simPosition = canvasToSimulationPosition( canvasPosition, size, translation, scale );
    setDraggingNode( findNodeByPoint( nodes, nodeRadius, simPosition ) );
  }, [ nodes, size, translation, scale, nodeRadius ] );

  const onTouchStart = useCallback( ( e: React.TouchEvent<HTMLElement> ) =>
  {
    e.preventDefault();

    if( e.touches.length === 1 )
    {
      const touch = e.touches[ 0 ];
      setTouchId( touch.identifier );
      setLastTouch( {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } );

      onMouseDown( touch );
    }
  }, [ onMouseDown ] );

  const onMouseMove = useCallback( ( e: MouseMoveLikeEvent ) =>
  {
    if( !canvasRef.current )
    {
      return;
    }

    let canvasPosition = clientToCanvasPosition( canvasRef.current, e );
    setMousePosition( canvasPosition );

    if( !mouseDown )
    {
      return;
    }

    let coords = canvasToSimulationPosition( canvasPosition, size, translation, scale );

    if( draggingNode )
    {
      onNodeDrag( draggingNode.id, coords.simX, coords.simY );
    }
    else
    {
      const { movementX, movementY } = e;
      setTranslation( ( oldTranslation ) => ( {
        x: oldTranslation.x + movementX,
        y: oldTranslation.y + movementY,
      } ) );
    }
  }, [ mouseDown, size, draggingNode, onNodeDrag, translation, scale ] );

  useEffect( () =>
  {

    window.addEventListener( 'mousemove', onMouseMove );

    return () => window.removeEventListener( 'mousemove', onMouseMove );

  }, [ onMouseMove ] );

  const onTouchMove = useCallback( ( e: React.TouchEvent<HTMLElement> ) =>
  {
    e.preventDefault();

    if( typeof touchId !== 'number'
      || !lastTouch )
    {
      return;
    }

    const touch = Array.from( e.changedTouches ).find( ( t ) => t.identifier === touchId );
    if( !touch )
    {
      return;
    }

    const movementX = touch.clientX - lastTouch.clientX;
    const movementY = touch.clientY - lastTouch.clientY;

    onMouseMove( {
      clientX: touch.clientX,
      clientY: touch.clientY,
      movementX,
      movementY
    } );

    setLastTouch( {
      clientX: touch.clientX,
      clientY: touch.clientY,
    } );

  }, [ onMouseMove, lastTouch, touchId ] );

  const onMouseUp = useCallback( ( e: MouseLikeEvent ) =>
  {
    if( draggingNode )
    {
      onNodeDragEnd( draggingNode.id );
    }

    setMouseDown( false );
    setTouchId( undefined );
    setLastTouch( undefined );
    setDraggingNode( undefined );

  }, [ draggingNode, onNodeDragEnd ] );

  useEffect( () =>
  {
    window.addEventListener( 'mouseup', onMouseUp );

    return () => window.removeEventListener( 'mouseup', onMouseUp );

  }, [ onMouseUp ] );

  const onTouchEnd = useCallback( ( e: React.TouchEvent<HTMLElement> ) =>
  {
    e.preventDefault();

    if( typeof touchId !== 'number' )
    {
      return;
    }

    const touch = Array.from( e.changedTouches ).find( ( t ) => t.identifier === touchId );
    if( !touch )
    {
      return;
    }

    onMouseUp( touch );

  }, [ touchId, onMouseUp ] );

  const onWheel = useCallback( ( e: React.WheelEvent<HTMLElement> ) =>
  {
    if( !canvasRef.current )
    {
      return;
    }

    let canvasPosition = clientToCanvasPosition( canvasRef.current, e );
    let { simX, simY } = canvasToSimulationPosition( canvasPosition, size, translation, scale );
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
        context.arc( node.x, node.y, nodeRadius, 0, 2 * Math.PI, false );
        context.clip();
        context.drawImage(
          image,
          node.x - nodeRadius,
          node.y - nodeRadius,
          2 * nodeRadius,
          2 * nodeRadius
        );
        context.restore();
      }

      context.strokeStyle = node.type === 'ingredient' ? 'orange' : 'green';
      context.lineWidth = BORDER_THICKNESS;
      context.beginPath();
      context.arc( node.x, node.y, nodeRadius - BORDER_THICKNESS / 2, 0, 2 * Math.PI, false );
      context.stroke();
    }
  } );

  const hoveredNode = mousePosition && findNodeByPoint(
    nodes,
    nodeRadius,
    canvasToSimulationPosition( mousePosition, size, translation, scale )
  );

  // useEffect( () =>
  // {
  //   if( !mousePosition )
  //   {
  //     return;
  //   }

  //   if( !canvasRef.current )
  //   {
  //     return;
  //   }

  //   if( !canvasRef.current.getContext )
  //   {
  //     console.error( 'Browser does not support the canvas element.' );
  //     return;
  //   }

  //   const context = canvasRef.current.getContext( '2d' );
  //   if( !context )
  //   {
  //     console.error( 'Failed to retrieve context for canvas.' );
  //     return;
  //   }

  //   let { simX, simY } = canvasToSimulationPosition( mousePosition, size, translation, scale );
  //   context.fillStyle = hoveredNode ? 'green' : 'blue';
  //   context.beginPath();
  //   context.arc( simX, simY, 6, 0, 2 * Math.PI, false );
  //   context.fill();
  // } );

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        title={hoveredNode && hoveredNode.name}
        width={size.width}
        height={size.height}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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

export default CanvasGraph;
