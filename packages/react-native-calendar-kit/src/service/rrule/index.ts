import type { DateTime } from 'luxon';
import { RRule, RRuleSet, rrulestr } from 'rrule';
import type { DateType } from '../../types';
import { forceUpdateZone, parseDateTime } from '../../utils/dateUtils';

export class RRuleGenerator {
  private rule: RRuleSet;
  private dtstart: Date;

  constructor(rrule: string, dtstart: DateType, exDates?: DateType[]) {
    this.dtstart = forceUpdateZone(dtstart, 'UTC').toJSDate();
    const parsedRule = rrulestr(rrule, {
      dtstart: this.dtstart,
    });
    const rruleSet = new RRuleSet();
    rruleSet.rrule(new RRule(parsedRule.origOptions));
    exDates?.forEach((d) => {
      return rruleSet.exdate(forceUpdateZone(d, 'UTC').toJSDate());
    });
    this.rule = rruleSet;
  }

  generateOccurrences(
    start: DateType,
    end: DateType,
    timeZone?: string
  ): DateTime[] {
    const startDate = parseDateTime(start);
    const endDate = parseDateTime(end);
    const occurrences = this.rule.between(
      forceUpdateZone(startDate, 'UTC').toJSDate(),
      forceUpdateZone(endDate, 'UTC').toJSDate(),
      true
    );

    return occurrences.map((occurrence) =>
      forceUpdateZone(parseDateTime(occurrence).toUTC(), timeZone)
    );
  }

  firstOccurrence(timeZone?: string): DateTime | null {
    const occurrences = this.rule.after(this.dtstart, true);
    return occurrences
      ? forceUpdateZone(parseDateTime(occurrences).toUTC(), timeZone)
      : null;
  }
}
