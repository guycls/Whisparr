import _ from 'lodash';
import ModelBase from 'App/ModelBase';

function reconcileItems<T extends ModelBase>(existingItems: T[], nextItems: T[]) {
  if (!existingItems.length) {
    return nextItems;
  }

  const existingById = new Map(existingItems.map((item) => [item.id, item]));
  let unchanged = existingItems.length === nextItems.length;

  const reconciled = nextItems.map((item, index) => {
    const existing = existingById.get(item.id);

    if (existing && _.isEqual(existing, item)) {
      if (unchanged && existingItems[index] !== existing) {
        unchanged = false;
      }

      return existing;
    }

    unchanged = false;
    return item;
  });

  return unchanged ? existingItems : reconciled;
}

export default reconcileItems;
