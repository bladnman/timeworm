export interface TimelineMeta {
  title: string;
  version: string;
  generated_date: string;
  overview: string;
  attribution: string;
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
  type: string;
  innovator: string;
  innovation: string;
  image_urls: string[];
  description: string;
  metrics: TimelineEventMetric;
  links: TimelineEventLink[];
}

export interface TimelineData {
  meta: TimelineMeta;
  groups: TimelineGroup[];
  events: TimelineEvent[];
}

export type ViewMode = 'vertical' | 'horizontal' | 'comic' | 'river' | 'depthroad' | 'mosaic' | 'orbital' | 'strata' | 'tree' | 'bikeride' | 'train' | 'exhibit';

export interface TimelineContextType {
  data: TimelineData | null;
  isLoading: boolean;
  viewMode: ViewMode;
  selectedEventId: string | null;
  setViewMode: (mode: ViewMode) => void;
  selectEvent: (id: string | null) => void;
}
