type Populator = (body?: { resource?: { id?: number } }) => void;

let currentPopulator: Populator | null = null;
let currentReasons: string[] = [];

export function registerPagePopulator(
  populator: Populator,
  reasons: string[] = []
) {
  currentPopulator = populator;
  currentReasons = reasons;
}

export function unregisterPagePopulator(populator: Populator) {
  if (currentPopulator === populator) {
    currentPopulator = null;
    currentReasons = [];
  }
}

export function repopulatePage(
  reason?: string,
  body?: { resource?: { id?: number } }
) {
  if (!currentPopulator) {
    return;
  }

  if (!reason || currentReasons.includes(reason)) {
    currentPopulator(body);
  }
}
