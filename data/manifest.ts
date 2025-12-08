/**
 * Timeline Manifest
 *
 * Metadata for all available timelines.
 * Used by Home screen to display timeline cards without loading full data.
 */

import type { ViewMode } from '../src/types/timeline';

export interface TimelineManifestEntry {
  id: string;
  filename: string;
  title: string;
  overview: string;
  eventCount: number;
  dateRange: string;
  defaultView: ViewMode;
}

/**
 * All available timelines.
 * Order determines display order on Home screen.
 */
export const timelineManifest: TimelineManifestEntry[] = [
  {
    id: 'ai_history',
    filename: 'ai_history_data.json',
    title: 'The Architecture of Minds',
    overview:
      'The history of artificial intelligence is not merely a chronicle of engineering; it is the physical manifestation of humanity\'s oldest philosophical inquiry: Can thought be mechanized?',
    eventCount: 45,
    dateRange: '1804 - 2025',
    defaultView: 'bikeride',
  },
  {
    id: 'bicycle_history',
    filename: 'bicycle_history_data.json',
    title: 'Two Wheels of Freedom',
    overview:
      'The bicycle is one of humanity\'s most elegant inventions—a simple machine that transformed transportation, liberated women, enabled sport, and now promises to reshape cities.',
    eventCount: 38,
    dateRange: '1817 - 2024',
    defaultView: 'trail',
  },
  {
    id: 'board_game_history',
    filename: 'board_game_history_data.json',
    title: 'Roll for History',
    overview:
      'Board games are among humanity\'s oldest forms of structured play, with archaeological evidence dating back 5,000 years. Today\'s tabletop gaming renaissance represents the medium\'s richest period.',
    eventCount: 52,
    dateRange: '3100 BCE - 2024',
    defaultView: 'mosaic',
  },
  {
    id: 'competitive_eating_history',
    filename: 'competitive_eating_history_data.json',
    title: 'Sport or Spectacle?',
    overview:
      'Competitive eating occupies a strange space in American culture—part sport, part spectacle, part celebration of excess. From county fair pie-eating contests to ESPN-broadcast championships.',
    eventCount: 28,
    dateRange: '1916 - 2024',
    defaultView: 'horizontal',
  },
  {
    id: 'fortune_cookie_history',
    filename: 'fortune_cookie_history_data.json',
    title: 'The Misattributed Treat',
    overview:
      'The fortune cookie is perhaps America\'s most misunderstood cultural artifact—a treat universally associated with Chinese restaurants that actually originated in Japan.',
    eventCount: 22,
    dateRange: '1878 - 2024',
    defaultView: 'vertical',
  },
  {
    id: 'godzilla_history',
    filename: 'godzilla_history_data.json',
    title: 'King of the Monsters',
    overview:
      'Godzilla is more than a monster—he is a mirror. Born from Japan\'s atomic trauma in 1954, this towering reptile has spent seven decades reflecting society\'s deepest fears.',
    eventCount: 42,
    dateRange: '1954 - 2024',
    defaultView: 'comic',
  },
  {
    id: 'kpop_history',
    filename: 'kpop_history_data.json',
    title: 'Factory-Engineered Fandom',
    overview:
      'K-Pop is not just a music genre—it\'s an industrial complex, a cultural export strategy, and a template for manufacturing global stardom.',
    eventCount: 48,
    dateRange: '1992 - 2024',
    defaultView: 'orbital',
  },
  {
    id: 'lego_history',
    filename: 'lego_history_data.json',
    title: 'Brick by Brick',
    overview:
      'From a Depression-era Danish carpenter\'s workshop to the world\'s largest toy company, LEGO transformed simple plastic bricks into a creative system that captivated billions.',
    eventCount: 44,
    dateRange: '1932 - 2024',
    defaultView: 'tree',
  },
  {
    id: 'sneaker_history',
    filename: 'sneaker_history_data.json',
    title: 'The Sole Revolution',
    overview:
      'The sneaker began as humble athletic footwear but evolved into one of the most powerful cultural symbols of the 20th and 21st centuries.',
    eventCount: 46,
    dateRange: '1839 - 2024',
    defaultView: 'train',
  },
  {
    id: 'tattoo_history',
    filename: 'tattoo_history_data.json',
    title: 'Skin as Story',
    overview:
      'For over 5,000 years, humans have marked their skin with permanent designs—for ritual, protection, punishment, identity, rebellion, and beauty.',
    eventCount: 50,
    dateRange: '3300 BCE - 2024',
    defaultView: 'strata',
  },
  {
    id: 'theme_park_history',
    filename: 'theme_park_history_data.json',
    title: 'The Engineering of Joy',
    overview:
      'Theme parks represent humanity\'s most elaborate efforts to manufacture happiness—places where architecture, technology, and storytelling converge to create immersive experiences.',
    eventCount: 54,
    dateRange: '1583 - 2024',
    defaultView: 'exhibit',
  },
];

/**
 * Get manifest entry by ID
 */
export const getTimelineManifest = (id: string): TimelineManifestEntry | undefined => {
  return timelineManifest.find((t) => t.id === id);
};

/**
 * Get all timeline IDs
 */
export const getTimelineIds = (): string[] => {
  return timelineManifest.map((t) => t.id);
};
