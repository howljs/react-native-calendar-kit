import { createContext, useContext } from 'react';

export const LoadingContext = createContext<{ isLoading: boolean }>({
  isLoading: false,
});

export const useLoading = () => {
  const { isLoading } = useContext(LoadingContext);
  return isLoading;
};
