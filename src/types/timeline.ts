export type ViewMode = 'vertical' | 'horizontal' | 'comic' | 'river' | 'depthroad' | 'mosaic' | 'orbital' | 'strata' | 'tree' | 'bikeride' | 'train' | 'exhibit' | 'trail' | 'libraryShelf';

export interface TimelineMeta {
  title: string;
  version: string;
  generated_date: string;
  overview: string;
  attribution: string;
  defaultView?: ViewMode;
}

export interface TimelineGroup {
  id: string;
  title: string;
  date_range: string;
  description: string;
}

export interface TimelineEventMetric {
  [key: string]: string;
}

export interface TimelineEventLink {
  title: string;
  url: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date_display: string;
  date_start: string;
  date_end?: string;
  group_ids: string[];
  image_urls: string[];
  description: string;
  metrics: TimelineEventMetric;
  links?: TimelineEventLink[];
}

export interface TimelineData {
  meta: TimelineMeta;
  groups: TimelineGroup[];
  events: TimelineEvent[];
}

export interface TimelineContextType {
  // Data
  data: TimelineData | null;
  isLoading: boolean;
  setData: (data: TimelineData | null) => void;

  // View state
  viewMode: ViewMode;
  selectedEventId: string | null;
  setViewMode: (mode: ViewMode) => void;
  selectEvent: (id: string | null) => void;

  // Edit state
  isDirty: boolean;
  editingEventId: string | null;
  editingGroupId: string | null;
  setEditingEventId: (id: string | null) => void;
  setEditingGroupId: (id: string | null) => void;

  // Event mutations
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  createEvent: (event: Omit<TimelineEvent, 'id'>) => string;
  deleteEvent: (id: string) => void;

  // Group mutations
  updateGroup: (id: string, updates: Partial<TimelineGroup>) => void;
  createGroup: (group: Omit<TimelineGroup, 'id'>) => string;
  deleteGroup: (id: string) => void;

  // Meta mutations
  updateMeta: (updates: Partial<TimelineMeta>) => void;

  // Persistence
  markDirty: () => void;
  markClean: () => void;
}
