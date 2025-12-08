/**
 * Vite API Plugin
 *
 * Adds REST API endpoints for timeline data management.
 * Reads/writes directly to JSON files in the data directory.
 */

import type { Plugin, ViteDevServer } from 'vite';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

/**
 * Timeline manifest entry returned by GET /api/timelines
 */
interface TimelineManifestEntry {
  id: string;
  filename: string;
  title: string;
  overview: string;
  eventCount: number;
  dateRange: string;
  defaultView: string;
}

/**
 * Calculate date range string from events
 */
function calculateDateRange(events: Array<{ date_start: string; date_end?: string }>): string {
  if (events.length === 0) return '';

  const dates: number[] = [];

  for (const event of events) {
    // Parse year from date_start (handles both "YYYY" and "YYYY-MM-DD")
    const startMatch = event.date_start.match(/^-?\d+/);
    if (startMatch) {
      dates.push(parseInt(startMatch[0], 10));
    }

    if (event.date_end) {
      const endMatch = event.date_end.match(/^-?\d+/);
      if (endMatch) {
        dates.push(parseInt(endMatch[0], 10));
      }
    }
  }

  if (dates.length === 0) return '';

  const minYear = Math.min(...dates);
  const maxYear = Math.max(...dates);

  // Format BCE years
  const formatYear = (year: number) => (year < 0 ? `${Math.abs(year)} BCE` : `${year}`);

  return `${formatYear(minYear)} - ${formatYear(maxYear)}`;
}

/**
 * Build manifest from JSON files
 */
async function buildManifest(): Promise<TimelineManifestEntry[]> {
  const files = await readdir(DATA_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('_data.json'));

  const manifest: TimelineManifestEntry[] = [];

  for (const filename of jsonFiles) {
    try {
      const filepath = join(DATA_DIR, filename);
      const content = await readFile(filepath, 'utf-8');
      const data = JSON.parse(content);

      // Extract ID from filename (e.g., "ai_history_data.json" -> "ai_history")
      const id = filename.replace('_data.json', '');

      manifest.push({
        id,
        filename,
        title: data.meta?.title || id,
        overview: data.meta?.overview || '',
        eventCount: data.events?.length || 0,
        dateRange: calculateDateRange(data.events || []),
        defaultView: data.meta?.defaultView || 'vertical',
      });
    } catch (err) {
      console.error(`Failed to read ${filename}:`, err);
    }
  }

  // Sort alphabetically by title
  manifest.sort((a, b) => a.title.localeCompare(b.title));

  return manifest;
}

/**
 * Vite plugin that adds API middleware
 */
export function apiPlugin(): Plugin {
  return {
    name: 'timeline-api',
    configureServer(server: ViteDevServer) {
      // GET /api/timelines - List all timelines (manifest)
      server.middlewares.use('/api/timelines', async (req, res, next) => {
        // Only handle exact path, not /api/timelines/:id
        if (req.url && req.url !== '/' && req.url !== '') {
          return next();
        }

        if (req.method !== 'GET') {
          return next();
        }

        try {
          const manifest = await buildManifest();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(manifest));
        } catch (err) {
          console.error('Failed to build manifest:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to load timelines' }));
        }
      });

      // GET/PUT /api/timeline/:id - Get or update a specific timeline
      server.middlewares.use('/api/timeline/', async (req, res, next) => {
        const id = req.url?.replace(/^\//, '').replace(/\/$/, '');
        if (!id) {
          return next();
        }

        const filename = `${id}_data.json`;
        const filepath = join(DATA_DIR, filename);

        if (req.method === 'GET') {
          try {
            const content = await readFile(filepath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } catch {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Timeline not found: ${id}` }));
          }
        } else if (req.method === 'PUT') {
          try {
            // Read request body
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }

            // Validate JSON
            const data = JSON.parse(body);

            // Pretty-print for readability in version control
            const formatted = JSON.stringify(data, null, 2);

            await writeFile(filepath, formatted, 'utf-8');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, id }));
          } catch (err) {
            console.error('Failed to save timeline:', err);
            res.statusCode = 500;
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'Failed to save timeline',
              })
            );
          }
        } else {
          next();
        }
      });
    },
  };
}
