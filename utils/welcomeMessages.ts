/**
 * Utility functions for dynamic welcome messages
 */

/**
 * Calculate years since Satoshi's last known message (December 12, 2010)
 * Returns a formatted string like "Ten years", "Eleven years", etc.
 */
export function getSatoshiYearsSinceLastMessage(): string {
  const lastMessageDate = new Date('2010-12-12');
  const now = new Date();
  
  const yearsDiff = now.getFullYear() - lastMessageDate.getFullYear();
  const monthDiff = now.getMonth() - lastMessageDate.getMonth();
  const dayDiff = now.getDate() - lastMessageDate.getDate();
  
  // Adjust if we haven't reached the anniversary date this year
  let years = yearsDiff;
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years--;
  }
  
  return formatYearsAsWords(years);
}

/**
 * Convert a number to its word representation for years
 */
function formatYearsAsWords(years: number): string {
  const numberWords: { [key: number]: string } = {
    0: 'Zero years',
    1: 'One year',
    2: 'Two years',
    3: 'Three years',
    4: 'Four years',
    5: 'Five years',
    6: 'Six years',
    7: 'Seven years',
    8: 'Eight years',
    9: 'Nine years',
    10: 'Ten years',
    11: 'Eleven years',
    12: 'Twelve years',
    13: 'Thirteen years',
    14: 'Fourteen years',
    15: 'Fifteen years',
    16: 'Sixteen years',
    17: 'Seventeen years',
    18: 'Eighteen years',
    19: 'Nineteen years',
    20: 'Twenty years',
    21: 'Twenty-one years',
    22: 'Twenty-two years',
    23: 'Twenty-three years',
    24: 'Twenty-four years',
    25: 'Twenty-five years',
    26: 'Twenty-six years',
    27: 'Twenty-seven years',
    28: 'Twenty-eight years',
    29: 'Twenty-nine years',
    30: 'Thirty years',
  };
  
  if (years in numberWords) {
    return numberWords[years];
  }
  
  // For years beyond 30, use numeric format
  return `${years} years`;
}

/**
 * Get Satoshi's dynamic welcome message
 */
export function getSatoshiWelcomeMessage(): string {
  const yearsSince = getSatoshiYearsSinceLastMessage();
  return `${yearsSince} from my last message. Funny how time works. What would you like to know?`;
}





