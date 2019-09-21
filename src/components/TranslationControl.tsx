import React from 'react';
import { IconButton, Paper, makeStyles } from '@material-ui/core';
import CenteredIcon from '@material-ui/icons/GpsFixed';
import NotCenteredIcon from '@material-ui/icons/GpsNotFixed';

const useStyles = makeStyles( {
  root: {
    borderRadius: '50%',
  }
} );

interface Props
{
  centered: boolean;
  onResetTranslation: () => void;
}

const TranslationControl: React.FC<Props> = React.memo( ( { centered, onResetTranslation } ) =>
{
  const styles = useStyles();

  return (
    <Paper className={styles.root}>
      <IconButton
        title="Reset Center"
        size="medium"
        disabled={centered}
        onClick={onResetTranslation}
      >
        {centered ?
          (
            <CenteredIcon />
          ) : (
            <NotCenteredIcon />
          )
        }
      </IconButton>
    </Paper>
  );
} );

export default TranslationControl;
