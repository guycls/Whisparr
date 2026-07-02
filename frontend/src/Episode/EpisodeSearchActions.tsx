import classNames from 'classnames';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EPISODE_SEARCH } from 'Commands/commandNames';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import Menu from 'Components/Menu/Menu';
import MenuButton from 'Components/Menu/MenuButton';
import MenuContent from 'Components/Menu/MenuContent';
import MenuItem from 'Components/Menu/MenuItem';
import SpinnerIcon from 'Components/SpinnerIcon';
import { EpisodeEntities } from 'Episode/useEpisode';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { align, icons } from 'Helpers/Props';
import { executeCommand } from 'Store/Actions/commandActions';
import createExecutingCommandsSelector from 'Store/Selectors/createExecutingCommandsSelector';
import translate from 'Utilities/String/translate';
import EpisodeDetailsModal from './EpisodeDetailsModal';
import styles from './EpisodeSearchActions.css';

interface EpisodeSearchActionsProps {
  episodeId: number;
  episodeEntity: EpisodeEntities;
  seriesId: number;
  episodeTitle: string;
  className?: string;
  isSmallScreen?: boolean;
}

function EpisodeSearchActions(props: EpisodeSearchActionsProps) {
  const {
    episodeId,
    episodeEntity,
    seriesId,
    episodeTitle,
    className,
    isSmallScreen = false,
  } = props;

  const executingCommands = useSelector(createExecutingCommandsSelector());
  const isSearching = executingCommands.some(({ name, body }) => {
    const { episodeIds = [] } = body;
    return name === EPISODE_SEARCH && episodeIds.indexOf(episodeId) > -1;
  });

  const dispatch = useDispatch();

  const [isDetailsModalOpen, setDetailsModalOpen, setDetailsModalClosed] =
    useModalOpenState(false);

  const handleSearchPress = useCallback(() => {
    dispatch(
      executeCommand({
        name: EPISODE_SEARCH,
        episodeIds: [episodeId],
      })
    );
  }, [episodeId, dispatch]);

  const modal = (
    <EpisodeDetailsModal
      isOpen={isDetailsModalOpen}
      episodeId={episodeId}
      episodeEntity={episodeEntity}
      seriesId={seriesId}
      episodeTitle={episodeTitle}
      selectedTab="search"
      startInteractiveSearch={true}
      onModalClose={setDetailsModalClosed}
    />
  );

  if (isSmallScreen) {
    return (
      <div className={classNames(styles.actions, className)}>
        <Menu alignMenu={align.RIGHT} enforceMaxHeight={false}>
          <MenuButton>
            <Icon name={icons.ACTIONS} size={18} />
          </MenuButton>

          <MenuContent>
            <MenuItem onPress={handleSearchPress} isDisabled={isSearching}>
              <SpinnerIcon
                className={styles.menuIcon}
                name={icons.SEARCH}
                isSpinning={isSearching}
              />
              {translate('AutomaticSearch')}
            </MenuItem>

            <MenuItem onPress={setDetailsModalOpen}>
              <Icon className={styles.menuIcon} name={icons.INTERACTIVE} />
              {translate('InteractiveSearch')}
            </MenuItem>
          </MenuContent>
        </Menu>

        {modal}
      </div>
    );
  }

  return (
    <div className={classNames(styles.actions, className)}>
      <SpinnerIconButton
        name={icons.SEARCH}
        isSpinning={isSearching}
        title={translate('AutomaticSearch')}
        size={20}
        onPress={handleSearchPress}
      />

      <IconButton
        name={icons.INTERACTIVE}
        title={translate('InteractiveSearch')}
        size={20}
        onPress={setDetailsModalOpen}
      />

      {modal}
    </div>
  );
}

export default EpisodeSearchActions;
