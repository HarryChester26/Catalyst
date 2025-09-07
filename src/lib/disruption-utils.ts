// Utility functions for disruption management

import { DisruptionReportWithUser } from "@/types/disruption";

/**
 * Check if a disruption is older than 2 hours
 */
export function isDisruptionExpired(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  
  return created < twoHoursAgo;
}

/**
 * Auto-delete expired disruptions
 */
export async function autoDeleteExpiredDisruptions(disruptions: DisruptionReportWithUser[]): Promise<string[]> {
  const expiredDisruptions = disruptions.filter(disruption => 
    isDisruptionExpired(disruption.created_at)
  );
  
  const deletedIds: string[] = [];
  
  for (const disruption of expiredDisruptions) {
    try {
      const response = await fetch(`/api/disruptions?id=${disruption.id}&auto=true`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        deletedIds.push(disruption.id);
        console.log(`Auto-deleted disruption ${disruption.id}`);
      } else {
        console.error(`Failed to auto-delete disruption ${disruption.id}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error auto-deleting disruption ${disruption.id}:`, error);
    }
  }
  
  return deletedIds;
}

/**
 * Filter out expired disruptions from the list
 */
export function filterActiveDisruptions(disruptions: DisruptionReportWithUser[]): DisruptionReportWithUser[] {
  return disruptions.filter(disruption => !isDisruptionExpired(disruption.created_at));
}
