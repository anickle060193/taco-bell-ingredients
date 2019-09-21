import React, { useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import classNames from 'classnames';

import { NodeDatum, LinkDatum } from 'data/Simulation';

import createColorSet from 'utilities/colorSet';

const BORDER_THICKNESS = 4;

interface Props
{
  nodes: NodeDatum[];
  links: LinkDatum[];
  nodeRadius: number;
  onNodeDrag: ( nodeId: string, x: number, y: number ) => void;
  onNodeDragEnd: ( nodeId: string ) => void;
}

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
  linksContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  link: {
    strokeWidth: 1,
  },
  linkDiv: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 1,
    transformOrigin: 'top left',
  },
  node: ( props: Props ) => ( {
    position: 'absolute',
    left: 0,
    top: 0,
    width: props.nodeRadius * 2,
    height: props.nodeRadius * 2,
    borderRadius: '50%',
    borderWidth: BORDER_THICKNESS,
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

const DEFAULT_SIZE = { width: 0, height: 0 };

const colors = createColorSet();

const HtmlGraph: React.FC<Props> = ( props ) =>
{
  const { nodes, links, nodeRadius } = props;

  const styles = useStyles( props );

  const [ size, setSize ] = useState<{ width: number, height: number }>( DEFAULT_SIZE );

  const sizeCallack = useCallback( ( element: Element | null ) =>
  {
    if( element )
    {
      setSize( {
        width: element.clientWidth,
        height: element.clientHeight,
      } );
    }
    else
    {
      setSize( DEFAULT_SIZE );
    }
  }, [] );

  return (
    <div className={styles.root}>
      {false && (
        <svg
          ref={sizeCallack}
          viewBox={`${-size.width / 2} ${-size.height / 2} ${size.width} ${size.height}`}
          className={styles.linksContainer}
        >
          {links.map( ( link ) => (
            <line
              key={link.id}
              className={styles.link}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke={colors( link.target.id, 100, 50 )}
            />
          ) )}
        </svg>
      )}
      <div className={styles.graph}>
        {true && (
          links.map( ( link ) =>
          {
            const xDistance = link.target.x - link.source.x;
            const yDistance = link.target.y - link.source.y;

            const distance = Math.sqrt( xDistance * xDistance + yDistance * yDistance );

            const rotation = Math.atan2( yDistance, xDistance );

            return (
              <div
                key={link.id}
                className={styles.linkDiv}
                style={{
                  width: distance,
                  transform: `translate( ${link.source.x}px, ${link.source.y}px ) rotate( ${rotation}rad )`,
                  backgroundColor: colors( link.target.id, 100, 50 ),
                }}
              />
            );
          } )
        )}
        {true && (
          nodes.map( ( node ) => (
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
            >
              <img
                src={node.data.src}
                alt={node.data.name}
                className={styles.img}
              />
            </div>
          ) )
        )}
      </div>
    </div>
  );
};

export default HtmlGraph;
