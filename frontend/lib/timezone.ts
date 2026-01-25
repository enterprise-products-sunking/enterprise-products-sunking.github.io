/**
 * Timezone utility functions for handling UTC to local timezone conversions
 * and vice versa. The backend always works with UTC, but the frontend displays
 * times in the user's local timezone.
 */

import { parseISO, formatISO } from 'date-fns';
import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';

/**
 * Get the user's timezone from browser settings
 */
export function getUserTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
        console.warn('Failed to detect timezone, defaulting to UTC', error);
        return 'UTC';
    }
}

/**
 * Get a short timezone abbreviation (e.g., PST, IST, EAT)
 */
export function getTimezoneAbbreviation(timezone?: string): string {
    const tz = timezone || getUserTimezone();
    const date = new Date();

    try {
        const formatted = formatTz(date, 'zzz', { timeZone: tz });
        return formatted;
    } catch (error) {
        return tz;
    }
}

/**
 * Convert a UTC ISO string to a Date object in the user's local timezone
 * This is used when receiving data from the backend
 */
export function parseUTCToLocal(utcDateString: string, timezone?: string): Date {
    const tz = timezone || getUserTimezone();

    try {
        // Parse the UTC string
        const utcDate = parseISO(utcDateString);

        // Convert to user's timezone
        // Note: The returned Date object still represents the same moment in time,
        // but when formatted, it will show the local time
        return toZonedTime(utcDate, tz);
    } catch (error) {
        console.error('Failed to parse UTC date:', utcDateString, error);
        return new Date();
    }
}

/**
 * Convert a local Date object to UTC ISO string for sending to the backend
 * This is used when creating or updating shifts
 */
export function convertLocalToUTC(localDate: Date, timezone?: string): string {
    const tz = timezone || getUserTimezone();

    try {
        // Convert the local date to UTC
        const utcDate = fromZonedTime(localDate, tz);

        // Return as ISO string
        return formatISO(utcDate);
    } catch (error) {
        console.error('Failed to convert local date to UTC:', localDate, error);
        return formatISO(localDate);
    }
}

/**
 * Format a date in the user's timezone
 */
export function formatInTimezone(date: Date, formatString: string, timezone?: string): string {
    const tz = timezone || getUserTimezone();

    try {
        return formatTz(date, formatString, { timeZone: tz });
    } catch (error) {
        console.error('Failed to format date in timezone:', error);
        return formatTz(date, formatString);
    }
}

/**
 * Get timezone offset in hours (for display purposes)
 */
export function getTimezoneOffset(timezone?: string): string {
    const tz = timezone || getUserTimezone();
    const date = new Date();

    try {
        const offset = formatTz(date, 'XXX', { timeZone: tz });
        return offset;
    } catch (error) {
        return '+00:00';
    }
}

/**
 * Store user's preferred timezone in localStorage (for future enhancements)
 */
export function saveTimezonePreference(timezone: string): void {
    try {
        localStorage.setItem('user_timezone', timezone);
    } catch (error) {
        console.warn('Failed to save timezone preference', error);
    }
}

/**
 * Get stored timezone preference or detect from browser
 */
export function getTimezonePreference(): string {
    try {
        const stored = localStorage.getItem('user_timezone');
        return stored || getUserTimezone();
    } catch (error) {
        return getUserTimezone();
    }
}
