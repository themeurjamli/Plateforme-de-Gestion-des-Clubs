import { Event } from '../types/index';


export function calculateEventStreak(events: Event[]): number {
  const pastEvents = events.filter((e) => e.status === 'past');
  if (pastEvents.length === 0) return 0;

  
  const months = [
    ...new Set(pastEvents.map((e) => e.date.slice(0, 7))),
  ].sort((a, b) => b.localeCompare(a));

  let streak = 1;
  for (let i = 0; i < months.length - 1; i++) {
    const [y1, m1] = months[i].split('-').map(Number);
    const [y2, m2] = months[i + 1].split('-').map(Number);
    const diff = (y1 - y2) * 12 + (m1 - m2);
    if (diff === 1) streak++;
    else break;
  }

  return streak;
}

export function getStreakLabel(streak: number): string {
  if (streak === 0) return '';
  if (streak === 1) return '🔥 1 mois actif';
  return `🔥 Actif ${streak} mois de suite`;
}