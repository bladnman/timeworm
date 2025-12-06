import { createContext } from 'react';
import type { TimelineContextType } from '../types/timeline';

export const TimelineContext = createContext<TimelineContextType | undefined>(undefined);
