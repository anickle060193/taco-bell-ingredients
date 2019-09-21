import React from 'react';
import { makeStyles } from '@material-ui/core';
import classNames from 'classnames';

import { NodeDatum, LinkDatum } from 'data/Simulation';

import createColorSet from 'utilities/colorSet';

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

const colors = createColorSet();

const HtmlGraph: React.FC<Props> = ( props ) =>
{
  const { nodes, links, nodeRadius } = props;

  const styles = useStyles( props );

  return (
    <div className={styles.root}>
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
              className={styles.linkDiv}
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
