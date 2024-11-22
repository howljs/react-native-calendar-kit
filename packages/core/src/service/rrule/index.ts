import type { DateTime } from 'luxon';
import { RRule, RRuleSet, rrulestr } from 'rrule';

import { forceUpdateZone, parseDateTime } from '../../dateUtils';
import type { DateType } from '../../types';

export class RRuleGenerator {
  private rule: RRuleSet;
  private dtstart: Date;

  constructor(rrule: string, dtstart: DateTime, exDates?: DateType[]) {
    this.dtstart = dtstart.toUTC().toJSDate();
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

  generateOccurrences(start: DateType, end: DateType): DateTime[] {
    const startDate = parseDateTime(start).toUTC().toJSDate();
    const endDate = parseDateTime(end).toUTC().toJSDate();
    const occurrences = this.rule.between(startDate, endDate, true);
    return occurrences.map((occurrence) => parseDateTime(occurrence, { zone: 'utc' }));
  }

  firstOccurrence(): DateTime | null {
    const occurrences = this.rule.after(this.dtstart, true);
    return occurrences ? parseDateTime(occurrences).setZone('utc') : null;
  }
}
