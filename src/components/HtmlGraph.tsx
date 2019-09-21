import React, { useEffect, useRef, useCallback, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import classNames from 'classnames';

import ScaleControl from 'components/ScaleControl';
import TranslationControl from 'components/TranslationControl';

import { NodeDatum, LinkDatum } from 'data/Simulation';

import createColorSet from 'utilities/colorSet';

interface StyleProps
{
  nodeRadius: number;
}

const useStyles = makeStyles<Theme, StyleProps>( ( theme ) => createStyles( {
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    userSelect: 'none',
  },
  graph: {
    position: 'relative',
    left: '50%',
    top: '50%',
    width: 0,
    height: 0,
  },
  link: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 1,
    transformOrigin: 'top left',
  },
  node: ( { nodeRadius } ) => ( {
    position: 'absolute',
    left: 0,
    top: 0,
    width: nodeRadius * 2,
    height: nodeRadius * 2,
    borderRadius: '50%',
    borderWidth: 4,
    borderStyle: 'solid',
    overflow: 'hidden',
    transform: 'translate( -50%, -50% )',
  } ),
  recipeNode: {
    borderColor: 'green',
  },
  ingredientNode: {
    borderColor: 'orange',
  },
  img: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: theme.spacing( 1 ),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    '& > *:not( :last-child )': {
      marginBottom: theme.spacing( 1 ),
    },
  },
} ) );

interface Props
{
  nodes: NodeDatum[];
  links: LinkDatum[];
  nodeRadius: number;
  onNodeDrag: ( node: NodeDatum, x: number, y: number ) => void;
  onNodeDragEnd: ( node: NodeDatum ) => void;
  onNodeClick: ( node: NodeDatum ) => void;
}

const colors = createColorSet();

const HtmlGraph: React.FC<Props> = ( { nodes, links, nodeRadius, onNodeDrag, onNodeDragEnd, onNodeClick } ) =>
{
  const styles = useStyles( { nodeRadius } );

  const containerRef = useRef<HTMLDivElement | null>( null );
  const draggingBackgroundRef = useRef( false );
  const draggingNodeRef = useRef<NodeDatum | null>( null );
  const firstMoveRef = useRef( true );
  const movedRef = useRef( false );

  const [ scale, setScale ] = useState( 0.5 );
  const [ translation, setTranslation ] = useState( { x: 0, y: 0 } );
  const setScaleBounded = useCallback( ( newScale: number ) => setScale( Math.max( 0.1, Math.round( ( newScale ) * 100 ) / 100 ) ), [] );

  const onResetTranslation = useCallback( () =>
  {
    setTranslation( { x: 0, y: 0 } );
  }, [] );

  const onBackgroundMouseDown = useCallback( () =>
  {
    draggingNodeRef.current = null;
    draggingBackgroundRef.current = true;
    firstMoveRef.current = true;
    movedRef.current = false;
  }, [] );

  const onNodeMouseDown = ( node: NodeDatum, e: React.MouseEvent<HTMLElement> ) =>
  {
    e.preventDefault();
    e.stopPropagation();

    draggingNodeRef.current = node;
    draggingBackgroundRef.current = false;
    firstMoveRef.current = true;
    movedRef.current = false;
  };

  useEffect( () =>
  {
    const onMouseMove = ( e: MouseEvent ) =>
    {
      if( draggingBackgroundRef.current )
      {
        const movementX = e.movementX;
        const movementY = e.movementY;

        setTranslation( ( { x, y } ) => ( {
          x: x + movementX,
          y: y + movementY,
        } ) );
      }
      else
      {

        if( !containerRef.current )
        {
          console.error( 'No container ref on mousemove.' );
          return;
        }

        if( !draggingNodeRef.current )
        {
          return;
        }

        const { left, top, width, height } = containerRef.current.getBoundingClientRect();

        const x = ( e.clientX - left - width / 2 - translation.x ) / scale;
        const y = ( e.clientY - top - height / 2 - translation.y ) / scale;

        if( firstMoveRef.current )
        {
          firstMoveRef.current = false;
          return;
        }

        movedRef.current = true;
        onNodeDrag( draggingNodeRef.current, x, y );
      }
    };

    window.addEventListener( 'mousemove', onMouseMove );

    return () => window.removeEventListener( 'mousemove', onMouseMove );

  }, [ onNodeDrag, scale, translation ] );

  useEffect( () =>
  {
    const onMouseUp = ( e: MouseEvent ) =>
    {
      if( draggingNodeRef.current
        && movedRef.current )
      {
        onNodeDragEnd( draggingNodeRef.current );
      }

      draggingNodeRef.current = null;
      draggingBackgroundRef.current = false;
      firstMoveRef.current = true;
    };

    window.addEventListener( 'mouseup', onMouseUp );

    return () => window.removeEventListener( 'mouseup', onMouseUp );

  }, [ onNodeDragEnd ] );

  const onNodeMouseClick = useCallback( ( node: NodeDatum ) =>
  {
    if( !movedRef.current )
    {
      onNodeClick( node );
    }
  }, [ onNodeClick ] );

  return (
    <div
      ref={containerRef}
      className={styles.root}
      onMouseDown={onBackgroundMouseDown}
    >
      <div
        className={styles.graph}
        style={{
          transform: `translate( ${translation.x}px, ${translation.y}px ) scale( ${scale} )`,
        }}
      >
        {links.map( ( link ) =>
        {
          const xDistance = link.target.x - link.source.x;
          const yDistance = link.target.y - link.source.y;

          const distance = Math.sqrt( xDistance * xDistance + yDistance * yDistance );

          const rotation = Math.atan2( yDistance, xDistance );

          return (
            <div
              key={link.id}
              className={styles.link}
              style={{
                width: distance,
                transform: `translate( ${link.source.x}px, ${link.source.y}px ) rotate( ${rotation}rad )`,
                backgroundColor: colors( link.target.id, 100, 50 ),
              }}
            />
          );
        } )}
        {nodes.map( ( node ) => (
          <div
            key={node.id}
            title={node.data.name}
            className={classNames( styles.node, {
              [ styles.recipeNode ]: node.type === 'recipe',
              [ styles.ingredientNode ]: node.type === 'ingredient',
            } )}
            style={{
              transform: `translate( ${node.x - nodeRadius}px, ${node.y - nodeRadius}px )`,
            }}
            onMouseDown={( e ) => onNodeMouseDown( node, e )}
            onClick={() => onNodeMouseClick( node )}
          >
            <img
              src={node.data.src}
              alt={node.data.name}
              className={styles.img}
            />
          </div>
        ) )}
      </div>
      <div className={styles.controls}>
        <ScaleControl
          scale={scale}
          setScale={setScaleBounded}
        />
        <TranslationControl
          centered={translation.x === 0 && translation.y === 0}
          onResetTranslation={onResetTranslation}
        />
      </div>
    </div>
  );
};

export default HtmlGraph;
