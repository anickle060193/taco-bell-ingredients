import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core';
import classNames from 'classnames';

import { NodeDatum, LinkDatum } from 'data/Simulation';

import createColorSet from 'utilities/colorSet';

const useStyles = makeStyles( {
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    userSelect: 'none',
  },
  graph: {
    position: 'relative',
    width: '100%',
    height: '100%',
    transform: 'translate( 50%, 50% )',
  },
  link: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 1,
    transformOrigin: 'top left',
  },
  node: ( nodeRadius: number ) => ( {
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
} );

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
  const styles = useStyles( nodeRadius );

  const containerRef = useRef<HTMLDivElement | null>( null );
  const draggingNodeRef = useRef<NodeDatum | null>( null );
  const firstMoveRef = useRef( true );
  const movedRef = useRef( false );

  const onNodeMouseDown = ( node: NodeDatum, e: React.MouseEvent<HTMLElement> ) =>
  {
    draggingNodeRef.current = node;
    firstMoveRef.current = true;
    movedRef.current = false;
  };

  useEffect( () =>
  {
    const onMouseMove = ( e: MouseEvent ) =>
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

      const x = e.clientX - left - width / 2;
      const y = e.clientY - top - height / 2;

      if( firstMoveRef.current )
      {
        firstMoveRef.current = false;
        return;
      }

      movedRef.current = true;
      onNodeDrag( draggingNodeRef.current, x, y );
    };

    window.addEventListener( 'mousemove', onMouseMove );

    return () => window.removeEventListener( 'mousemove', onMouseMove );

  }, [ onNodeDrag ] );

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
      firstMoveRef.current = true;
      movedRef.current = false;
    };

    window.addEventListener( 'mouseup', onMouseUp );

    return () => window.removeEventListener( 'mouseup', onMouseUp );

  }, [ onNodeDragEnd ] );

  return (
    <div
      ref={containerRef}
      className={styles.root}
    >
      <div className={styles.graph}>
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
            onClick={() => onNodeClick( node )}
          >
            <img
              src={node.data.src}
              alt={node.data.name}
              className={styles.img}
            />
          </div>
        ) )}
      </div>
    </div>
  );
};

export default HtmlGraph;
