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

  function onZoomInClick()
  {
    if( scale < 1.5 )
    {
      setScale( scale + 0.1 );
    }
    else
    {
      setScale( scale + 0.5 );
    }
  }

  return (
    <Paper className={styles.root}>
      {scale < 1 ?
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
        onClick={() => setScale( scale - 0.1 )}
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
        onClick={onZoomInClick}
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
