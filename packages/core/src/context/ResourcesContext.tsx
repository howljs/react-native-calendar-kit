import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useEffect } from 'react';

import useLazyRef from '../hooks/useLazyRef';
import { createStore, type Store } from '../store/storeBuilder';
import { useSelector } from '../store/useSelector';
import type { ResourceItem } from '../types';

export type ResourcesStore = {
  resources?: ResourceItem[];
};

export const ResourcesContext = createContext<Store<ResourcesStore> | undefined>(undefined);

const ResourcesProvider: FC<PropsWithChildren<ResourcesStore>> = ({ children, resources }) => {
  const resourcesStore = useLazyRef(() =>
    createStore<ResourcesStore>({
      resources: undefined,
    })
  ).current;

  useEffect(() => {
    resourcesStore.setState({ resources });
  }, [resources, resourcesStore]);

  return <ResourcesContext.Provider value={resourcesStore}>{children}</ResourcesContext.Provider>;
};

export default ResourcesProvider;

const selectResources = (state: ResourcesStore) => state.resources;

export const useResources = () => {
  const resourcesContext = useContext(ResourcesContext);

  if (!resourcesContext) {
    throw new Error('useResources must be used within a ResourcesProvider');
  }

  const state = useSelector(resourcesContext.subscribe, resourcesContext.getState, selectResources);
  return state;
};
