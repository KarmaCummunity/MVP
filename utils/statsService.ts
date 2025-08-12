// utils/statsService.ts
import { DatabaseService, DB_COLLECTIONS } from './databaseService';

export type CommunityStats = Record<string, number>;

export const DEFAULT_STATS: CommunityStats = {
  // Core stats
  moneyDonations: 0,
  volunteerHours: 0,
  rides: 0,
  events: 0,
  activeMembers: 0,
  monthlyDonations: 0,
  monthlyGrowthPct: 0,
  activeCities: 0,
  // Extended baseline (15 more types)
  foodKg: 0,
  clothingKg: 0,
  bloodLiters: 0,
  courses: 0,
  treesPlanted: 0,
  animalsAdopted: 0,
  recyclingBags: 0,
  culturalEvents: 0,
  appActiveUsers: 0,
  appDownloads: 0,
  activeVolunteers: 0,
  kmCarpooled: 0,
  fundsRaised: 0,
  mealsServed: 0,
  booksDonated: 0,
};

export async function getGlobalStats(): Promise<CommunityStats> {
  try {
    const data = await DatabaseService.read<CommunityStats>(DB_COLLECTIONS.SETTINGS, 'global', 'community_stats');
    if (!data || typeof data !== 'object') return { ...DEFAULT_STATS };
    // Ensure defaults for missing keys
    const merged: CommunityStats = { ...DEFAULT_STATS, ...data };
    return merged;
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export async function saveGlobalStats(partial: Partial<CommunityStats>): Promise<void> {
  const current = await getGlobalStats();
  const next = { ...current, ...partial };
  await DatabaseService.create(DB_COLLECTIONS.SETTINGS, 'global', 'community_stats', next);
}

export function getStat(stats: CommunityStats, key: string, fallback = 0): number {
  const v = stats?.[key];
  return typeof v === 'number' && isFinite(v) ? v : fallback;
}

export function formatShortNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

export function parseShortNumber(s: string): number {
  if (!s) return 0;
  const m = String(s).trim().toUpperCase();
  const factor = m.endsWith('B') ? 1_000_000_000 : m.endsWith('M') ? 1_000_000 : m.endsWith('K') ? 1_000 : 1;
  const num = parseFloat(m.replace(/[BMK]/g, ''));
  return isFinite(num) ? num * factor : 0;
}


