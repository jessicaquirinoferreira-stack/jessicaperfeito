import type { AnalyticsEventItem } from '../types/domain';

export function trackAnalyticsAsync(input: {
  eventType: AnalyticsEventItem['eventType'];
  path: string;
  entityId?: string;
  entityTitle?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): void {
  void import('./firestoreService')
    .then((mod) => mod.trackAnalyticsEvent(input))
    .catch(() => {
      // Non-blocking analytics
    });
}
