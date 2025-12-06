/* eslint-disable react-refresh/only-export-components */
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { TimelineProvider } from '../context/TimelineProvider';

const AllProviders = ({ children }: { children: ReactNode }) => (
  <TimelineProvider>{children}</TimelineProvider>
);

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
