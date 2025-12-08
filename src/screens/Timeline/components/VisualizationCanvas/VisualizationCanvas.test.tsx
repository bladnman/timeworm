import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VisualizationCanvas } from './VisualizationCanvas';

// Mock the useTimeline hook
vi.mock('../../../../hooks/useTimeline', () => ({
  useTimeline: vi.fn(),
}));

// Mock the view components to simplify testing
vi.mock('../../../../views/Vertical/VerticalView', () => ({
  VerticalView: () => <div data-testid="vertical-view">Vertical View</div>,
}));
vi.mock('../../../../views/Horizontal/HorizontalView', () => ({
  HorizontalView: () => <div data-testid="horizontal-view">Horizontal View</div>,
}));

import { useTimeline } from '../../../../hooks/useTimeline';

const mockUseTimeline = vi.mocked(useTimeline);

const createMockContext = (overrides = {}) => ({
  data: null,
  viewMode: 'vertical' as const,
  isLoading: false,
  selectedEventId: null,
  isDirty: false,
  editingEventId: null,
  editingGroupId: null,
  setViewMode: vi.fn(),
  selectEvent: vi.fn(),
  setData: vi.fn(),
  updateEvent: vi.fn(),
  createEvent: vi.fn(),
  deleteEvent: vi.fn(),
  updateGroup: vi.fn(),
  createGroup: vi.fn(),
  deleteGroup: vi.fn(),
  updateMeta: vi.fn(),
  setEditingEventId: vi.fn(),
  setEditingGroupId: vi.fn(),
  markDirty: vi.fn(),
  markClean: vi.fn(),
  ...overrides,
});

describe('VisualizationCanvas', () => {
  it('renders nothing when data is null', () => {
    mockUseTimeline.mockReturnValue(createMockContext());

    const { container } = render(<VisualizationCanvas />);
    expect(container.innerHTML).toBe('');
  });

  it('renders VerticalView when viewMode is vertical and data exists', () => {
    mockUseTimeline.mockReturnValue(createMockContext({
      data: {
        meta: { title: 'Test', version: '1.0', generated_date: '2025-01-01', overview: 'Test', attribution: '' },
        groups: [],
        events: [],
      },
      viewMode: 'vertical',
    }));

    render(<VisualizationCanvas />);
    expect(screen.getByTestId('vertical-view')).toBeInTheDocument();
  });

  it('renders HorizontalView when viewMode is horizontal and data exists', () => {
    mockUseTimeline.mockReturnValue(createMockContext({
      data: {
        meta: { title: 'Test', version: '1.0', generated_date: '2025-01-01', overview: 'Test', attribution: '' },
        groups: [],
        events: [],
      },
      viewMode: 'horizontal',
    }));

    render(<VisualizationCanvas />);
    expect(screen.getByTestId('horizontal-view')).toBeInTheDocument();
  });
});
