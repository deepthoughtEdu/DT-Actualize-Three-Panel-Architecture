// lib/timeline.ts

/**
 * Parse timeline string to Date object
 * Format: "22 Nov 2025, 8:53 pm"
 */
export function parseTimelineToDate(timeline: string): Date | null {
  try {
    // Method 1: Direct parsing (works for most formats)
    const date = new Date(timeline);

    // Check if valid date
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Method 2: Manual parsing if needed
    // Example: "22 Nov 2025, 8:53 pm"
    const parts = timeline.match(
      /(\d+)\s+(\w+)\s+(\d+),\s+(\d+):(\d+)\s+(am|pm)/i
    );

    if (parts) {
      const day = parseInt(parts[1]);
      const month = parts[2];
      const year = parseInt(parts[3]);
      let hours = parseInt(parts[4]);
      const minutes = parseInt(parts[5]);
      const meridiem = parts[6].toLowerCase();

      // Convert to 24-hour format
      if (meridiem === "pm" && hours !== 12) {
        hours += 12;
      } else if (meridiem === "am" && hours === 12) {
        hours = 0;
      }

      // Month map
      const months: { [key: string]: number } = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };

      const monthIndex = months[month.toLowerCase().substring(0, 3)];

      return new Date(year, monthIndex, day, hours, minutes);
    }

    return null;
  } catch (error) {
    console.error("Error parsing timeline:", error);
    return null;
  }
}

/**
 * Check if timeline is expired
 */
export function isTimelineExpired(timeline: string): boolean {
  const timelineDate = parseTimelineToDate(timeline);
  if (!timelineDate) return false;

  const now = new Date();
  return timelineDate < now;
}

/**
 * Get time remaining
 */
export function getTimeRemaining(timeline: string): {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
} {
  const timelineDate = parseTimelineToDate(timeline);

  if (!timelineDate) {
    return { expired: false, days: 0, hours: 0, minutes: 0 };
  }

  const now = new Date();
  const diff = timelineDate.getTime() - now.getTime();

  if (diff < 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { expired: false, days, hours, minutes };
}
