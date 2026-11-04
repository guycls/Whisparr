import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import useSelectState, { SelectState } from 'Helpers/Hooks/useSelectState';
import ModelBase from './ModelBase';

export type SelectContextAction =
  | { type: 'reset' }
  | { type: 'selectAll' }
  | { type: 'unselectAll' }
  | {
      type: 'toggleSelected';
      id: number;
      isSelected: boolean;
      shiftKey: boolean;
    }
  | {
      type: 'removeItem';
      id: number;
    }
  | {
      type: 'updateItems';
      items: ModelBase[];
    };

export type SelectDispatch = (action: SelectContextAction) => void;

interface SelectProviderOptions<T extends ModelBase> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
  items: Array<T>;
}

const SelectContext = React.createContext<
  [SelectState, SelectDispatch] | undefined
>(cloneDeep(undefined));

export function SelectProvider<T extends ModelBase>(
  props: SelectProviderOptions<T>
) {
  const { items } = props;
  const itemsRef = useRef(items);
  const [state, dispatch] = useSelectState();

  itemsRef.current = items;

  const dispatchWrapper = useCallback(
    (action: SelectContextAction) => {
      const currentItems = itemsRef.current;

      switch (action.type) {
        case 'reset':
        case 'removeItem':
          dispatch(action);
          break;

        default:
          dispatch({
            ...action,
            items: currentItems,
          });
          break;
      }
    },
    [dispatch]
  );

  const value = useMemo<[SelectState, SelectDispatch]>(
    () => [state, dispatchWrapper],
    [state, dispatchWrapper]
  );

  useEffect(() => {
    dispatch({ type: 'updateItems', items });
  }, [items, dispatch]);

  return (
    <SelectContext.Provider value={value}>
      {props.children}
    </SelectContext.Provider>
  );
}

export function useSelect() {
  const context = React.useContext(SelectContext);

  if (context === undefined) {
    throw new Error('useSelect must be used within a SelectProvider');
  }

  return context;
}
