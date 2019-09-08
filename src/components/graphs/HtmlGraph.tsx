import React from 'react';
import { makeStyles } from '@material-ui/core';
import classNames from 'classnames';

import { GraphComponent } from 'components/graphs/CommonGraph';

const NODE_RADIUS = 32;
const LINK_THICKNESS = 1;

const useStyles = makeStyles( {
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  graph: {
    position: 'relative',
    width: '100%',
    height: '100%',
    transform: 'translate( 50%, 50% )',
  },
  node: {
    position: 'absolute',
    width: 2 * NODE_RADIUS,
    height: 2 * NODE_RADIUS,
    borderRadius: '50%',
    transform: 'translate( -50%, -50% )',
    border: '4px solid transparent',
    backgroundSize: 'contain',
    backgroundClip: 'padding-box',
    backgroundOrigin: 'padding-box',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  recipeNode: {
    borderColor: 'green',
  },
  ingredientNode: {
    borderColor: 'orange',
  },
  link: {
    position: 'absolute',
    height: LINK_THICKNESS,
    backgroundColor: 'lightgray',
  }
} );

const HtmlGraph: GraphComponent = ( { nodes, links } ) =>
{
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.graph}>
        {links.map( ( link ) =>
        {
          let x1 = link.source.x;
          let y1 = link.source.y;
          let x2 = link.target.x;
          let y2 = link.target.y;

          let xDistance = x2 - x1;
          let yDistance = y2 - y1;
          let linkLength = Math.sqrt( xDistance * xDistance + yDistance * yDistance );

          let linkRotation = Math.atan2( yDistance, xDistance );

          let x = ( x1 + x2 ) / 2.0 - linkLength / 2.0;
          let y = ( y1 + y2 ) / 2.0 - LINK_THICKNESS / 2.0;

          return (
            <div
              key={link.id}
              className={styles.link}
              style={{
                left: x,
                top: y,
                width: linkLength,
                transform: `rotate( ${linkRotation}rad )`
              }}
            />
          );
        } )}
        {nodes.map( ( node ) => (
          <div
            key={node.id}
            className={classNames(
              styles.node, {
                [ styles.recipeNode ]: node.type === 'recipe',
                [ styles.ingredientNode ]: node.type === 'ingredient',
              } )}
            style={{
              left: node.x,
              top: node.y,
              backgroundImage: `url( ${node.data.src} )`,
            }}
            title={node.name}
          />
        ) )}
      </div>
    </div>
  );
};

HtmlGraph.nodeRadius = NODE_RADIUS;

export default HtmlGraph;
