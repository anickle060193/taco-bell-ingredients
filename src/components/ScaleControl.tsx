import React from 'react';
import { makeStyles, Typography, Button, Paper, createStyles, IconButton } from '@material-ui/core';
import ZoomInIcon from '@material-ui/icons/Add';
import ZoomOutIcon from '@material-ui/icons/Remove';
import ZoomedInIcon from '@material-ui/icons/ZoomIn';
import ZoomedOutIcon from '@material-ui/icons/ZoomOut';

const useStyles = makeStyles( ( theme ) => createStyles( {
  root: {
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing( 0.5, 1 ),
    color: theme.palette.text.secondary,
  },
  scaleText: {
    width: '5ch',
    textAlign: 'center',
  },
  resetButton: {
    padding: theme.spacing( 0.5, 1 ),
    minWidth: 0,
  },
  resetButtonText: {
    lineHeight: 'normal',
  }
} ) );

interface Props
{
  scale: number;
  setScale: ( scale: number ) => void;
}

const ScaleControl: React.FC<Props> = React.memo( ( { scale, setScale } ) =>
{
  const styles = useStyles();

  const setScaleBounded = ( newScale: number ) => setScale( Math.max( 0.1, Math.round( ( newScale ) * 100 ) / 100 ) );

  return (
    <Paper className={styles.root}>
      {Math.round( scale ) < 1 ?
        (
          <ZoomedOutIcon />
        ) :
        (
          <ZoomedInIcon />
        )
      }
      <IconButton
        size="small"
        color="inherit"
        title="Zoom Out"
        disabled={scale <= 0.1}
        onClick={() => setScaleBounded( scale - 0.1 )}
      >
        <ZoomOutIcon />
      </IconButton>
      <Typography className={styles.scaleText}>
        {( scale * 100 ).toFixed( 0 )}%
      </Typography>
      <IconButton
        size="small"
        color="inherit"
        title="Zoom In"
        onClick={() => setScaleBounded( scale + 0.1 )}
      >
        <ZoomInIcon />
      </IconButton>
      <Button
        className={styles.resetButton}
        classes={{
          root: styles.resetButton,
          label: styles.resetButtonText,
        }}
        color="inherit"
        disabled={scale === 1}
        onClick={() => setScale( 1 )}
      >
        Reset
      </Button>
    </Paper>
  );
} );

export default ScaleControl;
