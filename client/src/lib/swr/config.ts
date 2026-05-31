import type { SWRConfiguration } from 'swr';

export const defaultSwrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  shouldRetryOnError: false,
};
