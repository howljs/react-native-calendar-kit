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
    const startDate = parseDateTime(start);
    const endDate = parseDateTime(end);
    const occurrences = this.rule.between(
      forceUpdateZone(startDate, 'UTC').toJSDate(),
      forceUpdateZone(endDate, 'UTC').toJSDate(),
      true
    );

    return occurrences.map((occurrence) => parseDateTime(occurrence).setZone('utc'));
  }

  firstOccurrence(): DateTime | null {
    const occurrences = this.rule.after(this.dtstart, true);
    return occurrences ? parseDateTime(occurrences).setZone('utc') : null;
  }
}
