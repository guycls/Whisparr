import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useCallback } from 'react';
import { PathType } from 'App/State/PathsAppState';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';

function getIconName(type: PathType) {
  switch (type) {
    case 'computer':
      return icons.COMPUTER;
    case 'drive':
      return icons.DRIVE;
    case 'file':
      return icons.FILE;
    case 'parent':
      return icons.PARENT;
    default:
      return icons.FOLDER;
  }
}

interface FileBrowserRowProps {
  type: PathType;
  name: string;
  path: string;
  onPress: (path: string) => void;
}

function FileBrowserRow(props: FileBrowserRowProps) {
  const { type, name, path, onPress } = props;

  const handlePress = useCallback(() => {
    onPress(path);
  }, [path, onPress]);

  return (
    <ListItemButton onClick={handlePress}>
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Icon name={getIconName(type)} />
      </ListItemIcon>
      <ListItemText primary={name} />
    </ListItemButton>
  );
}

export default FileBrowserRow;
