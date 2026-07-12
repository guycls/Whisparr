import {
  REFRESH_SERIES,
  SERIES_SEARCH
} from 'Commands/commandNames';
import translate from 'Utilities/String/translate';

const progressCommandNames = [
  REFRESH_SERIES,
  SERIES_SEARCH
];

const cancellingLabels = {
  [REFRESH_SERIES]: () => translate('CancellingRefresh'),
  [SERIES_SEARCH]: () => translate('CancellingSearch')
};

function hasProgress(name, progressStudio, progressPercent) {
  return progressCommandNames.includes(name) &&
    progressStudio &&
    progressPercent != null;
}

export default function formatCommandDisplayName({
  name,
  commandName,
  status,
  progressStudio,
  progressPercent,
  isCancelling
}) {
  const base = commandName;
  const showProgress = status === 'started' && hasProgress(name, progressStudio, progressPercent);

  if (isCancelling) {
    const cancellingLabel = cancellingLabels[name]?.() ?? translate('CancellingTask');
    const parts = [base];

    if (progressStudio) {
      parts.push(progressStudio);
    }

    if (showProgress) {
      parts.push(`${progressPercent}%`);
    }

    parts.push(cancellingLabel);

    return parts.join(' - ');
  }

  if (!showProgress) {
    return base;
  }

  return `${base} - ${progressStudio} - ${progressPercent}%`;
}
