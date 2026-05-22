import type { SWRConfiguration } from 'swr';

export const defaultSwrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  shouldRetryOnError: false,
};
