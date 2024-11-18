import type { DateTime } from 'luxon';

/**
 * Type of date
 *
 * - Date
 * - String: ISOString or 'YYYY-MM-DD'
 * - Number: Unix timestamps in milliseconds
 */
export type DateType = Date | number | string | DateTime;
