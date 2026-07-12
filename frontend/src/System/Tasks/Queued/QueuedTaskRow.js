import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { icons, kinds } from 'Helpers/Props';
import formatDate from 'Utilities/Date/formatDate';
import formatDateTime from 'Utilities/Date/formatDateTime';
import formatTimeSpan from 'Utilities/Date/formatTimeSpan';
import formatCommandDisplayName from 'Utilities/Command/formatCommandDisplayName';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import styles from './QueuedTaskRow.css';

function getStatusIconProps(status, message) {
  const title = titleCase(status);

  switch (status) {
    case 'queued':
      return {
        name: icons.PENDING,
        title
      };

    case 'started':
      return {
        name: icons.REFRESH,
        isSpinning: true,
        title
      };

    case 'completed':
      return {
        name: icons.CHECK,
        kind: kinds.SUCCESS,
        title: message === 'Completed' ? title : `${title}: ${message}`
      };

    case 'failed':
      return {
        name: icons.FATAL,
        kind: kinds.DANGER,
        title: `${title}: ${message}`
      };

    case 'cancelled':
      return {
        name: icons.WARNING,
        kind: kinds.WARNING,
        title: message === 'Cancelled' ? title : `${title}: ${message}`
      };

    case 'aborted':
      return {
        name: icons.BLOCKLIST,
        kind: kinds.DANGER,
        title: message === 'Aborted' ? title : `${title}: ${message}`
      };

    default:
      return {
        name: icons.UNKNOWN,
        title
      };
  }
}

function getFormattedDates(props) {
  const {
    queued,
    started,
    ended,
    showRelativeDates,
    shortDateFormat
  } = props;

  if (showRelativeDates) {
    return {
      queuedAt: moment(queued).fromNow(),
      startedAt: started ? moment(started).fromNow() : '-',
      endedAt: ended ? moment(ended).fromNow() : '-'
    };
  }

  return {
    queuedAt: formatDate(queued, shortDateFormat),
    startedAt: started ? formatDate(started, shortDateFormat) : '-',
    endedAt: ended ? formatDate(ended, shortDateFormat) : '-'
  };
}

class QueuedTaskRow extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      ...getFormattedDates(props),
      isCancelConfirmModalOpen: false
    };

    this._updateTimeoutId = null;
  }

  componentDidMount() {
    this.setUpdateTimer();
  }

  componentDidUpdate(prevProps) {
    const {
      queued,
      started,
      ended
    } = this.props;

    if (
      queued !== prevProps.queued ||
      started !== prevProps.started ||
      ended !== prevProps.ended
    ) {
      this.setState(getFormattedDates(this.props));
    }
  }

  componentWillUnmount() {
    if (this._updateTimeoutId) {
      this._updateTimeoutId = clearTimeout(this._updateTimeoutId);
    }
  }

  //
  // Control

  setUpdateTimer() {
    this._updateTimeoutId = setTimeout(() => {
      this.setState(getFormattedDates(this.props));
      this.setUpdateTimer();
    }, 30000);
  }

  //
  // Listeners

  onCancelPress = () => {
    this.setState({
      isCancelConfirmModalOpen: true
    });
  };

  onConfirmCancel = () => {
    const { onCancelPress } = this.props;

    onCancelPress()
      .done(() => {
        this.setState({
          isCancelConfirmModalOpen: false
        });
      });
  };

  onAbortCancel = () => {
    this.setState({
      isCancelConfirmModalOpen: false
    });
  };

  //
  // Render

  render() {
    const {
      trigger,
      name,
      commandName,
      queued,
      started,
      ended,
      status,
      duration,
      message,
      progressStudio,
      progressPercent,
      isCancelling,
      clientUserAgent,
      longDateFormat,
      timeFormat
    } = this.props;

    const {
      queuedAt,
      startedAt,
      endedAt,
      isCancelConfirmModalOpen
    } = this.state;

    let triggerIcon = icons.QUICK;

    if (trigger === 'manual') {
      triggerIcon = icons.INTERACTIVE;
    } else if (trigger === 'scheduled') {
      triggerIcon = icons.SCHEDULED;
    }

    return (
      <TableRow>
        <TableRowCell className={styles.trigger}>
          <span className={styles.triggerContent}>
            <Icon
              name={triggerIcon}
              title={titleCase(trigger)}
            />

            <Icon
              {...getStatusIconProps(status, message)}
            />
          </span>
        </TableRowCell>

        <TableRowCell>
          <span className={styles.commandName}>
            {formatCommandDisplayName({
              name,
              commandName,
              status,
              progressStudio,
              progressPercent,
              isCancelling
            })}
          </span>
          {
            clientUserAgent ?
              <span className={styles.userAgent} title={translate('TaskUserAgentTooltip')}>
                {translate('From')}: {clientUserAgent}
              </span> :
              null
          }
        </TableRowCell>

        <TableRowCell
          className={styles.queued}
          title={formatDateTime(queued, longDateFormat, timeFormat)}
        >
          {queuedAt}
        </TableRowCell>

        <TableRowCell
          className={styles.started}
          title={formatDateTime(started, longDateFormat, timeFormat)}
        >
          {startedAt}
        </TableRowCell>

        <TableRowCell
          className={styles.ended}
          title={formatDateTime(ended, longDateFormat, timeFormat)}
        >
          {endedAt}
        </TableRowCell>

        <TableRowCell className={styles.duration}>
          {formatTimeSpan(duration)}
        </TableRowCell>

        <TableRowCell
          className={styles.actions}
        >
          {
            (status === 'queued' || status === 'started') && !isCancelling &&
              <IconButton
                title={status === 'started' ? translate('CancelTask') : translate('RemovedFromTaskQueue')}
                name={icons.REMOVE}
                onPress={this.onCancelPress}
              />
          }
        </TableRowCell>

        <ConfirmModal
          isOpen={isCancelConfirmModalOpen}
          kind={kinds.DANGER}
          title={translate('Cancel')}
          message={status === 'started' ? translate('CancelRunningTask') : translate('CancelPendingTask')}
          confirmLabel={translate('YesCancel')}
          cancelLabel={translate('NoLeaveIt')}
          onConfirm={this.onConfirmCancel}
          onCancel={this.onAbortCancel}
        />
      </TableRow>
    );
  }
}

QueuedTaskRow.propTypes = {
  trigger: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  commandName: PropTypes.string.isRequired,
  queued: PropTypes.string.isRequired,
  started: PropTypes.string,
  ended: PropTypes.string,
  status: PropTypes.string.isRequired,
  duration: PropTypes.string,
  message: PropTypes.string,
  progressStudio: PropTypes.string,
  progressPercent: PropTypes.number,
  isCancelling: PropTypes.bool,
  clientUserAgent: PropTypes.string,
  showRelativeDates: PropTypes.bool.isRequired,
  shortDateFormat: PropTypes.string.isRequired,
  longDateFormat: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  onCancelPress: PropTypes.func.isRequired
};

export default QueuedTaskRow;
