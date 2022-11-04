import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekday from 'dayjs/plugin/weekday';
import {
  calculateDates,
  calculateHours,
  convertDateToUnixTime,
  convertUnixTimeToDate,
} from '../utils';
import { expectHourData } from '../__mock__/data';
dayjs.extend(weekday);
dayjs.extend(isoWeek);

describe('get date data', () => {
  it('2022-10-01 -> 2022-10-31', () => {
    const fromDate = '2022-10-01';
    const toDate = '2022-10-31';
    const initialDate = '2022-10-10';
    const dates = calculateDates(1, fromDate, toDate, initialDate);

    const expectData = {
      day: { length: 31, index: 9 },
      threeDays: { length: 11, index: 3 },
      workWeek: { length: 5, index: 1 },
      week: { length: 6, index: 2 },
    };

    expect(dates.week.data.length).toBe(expectData.week.length);
    expect(dates.week.index).toBe(expectData.week.index);

    expect(dates.day.data.length).toBe(expectData.day.length);
    expect(dates.day.index).toBe(expectData.day.index);

    expect(dates.workWeek.data.length).toBe(expectData.workWeek.length);
    expect(dates.workWeek.index).toBe(expectData.workWeek.index);

    expect(dates.threeDays.data.length).toBe(expectData.threeDays.length);
    expect(dates.threeDays.index).toBe(expectData.threeDays.index);
  });
});

describe('get hours from start/end', () => {
  it('Start: 0h, End: 24h, Duration = 30 minutes', () => {
    const hours = calculateHours(0, 24, 30);
    for (let i = 0; i < expectHourData.case1.length; i++) {
      const hour = hours[i];
      expect(hour?.hourNumber).toBe(expectHourData.case1[i]?.hourNumber);
      expect(hour?.text).toBe(expectHourData.case1[i]?.text);
    }
  });
  it('Start: 0h, End: 24h, Duration = 60 minutes', () => {
    const hours = calculateHours(0, 24, 60);
    for (let i = 0; i < expectHourData.case2.length; i++) {
      const hour = hours[i];
      expect(hour?.hourNumber).toBe(expectHourData.case2[i]?.hourNumber);
      expect(hour?.text).toBe(expectHourData.case2[i]?.text);
    }
  });
  it('Start: 0h, End: 24h, Duration = 120 minutes', () => {
    const hours = calculateHours(0, 24, 120);
    for (let i = 0; i < expectHourData.case3.length; i++) {
      const hour = hours[i];
      expect(hour?.hourNumber).toBe(expectHourData.case3[i]?.hourNumber);
      expect(hour?.text).toBe(expectHourData.case3[i]?.text);
    }
  });
  it('Start: 0h, End: 12h, Duration = 30 minutes', () => {
    const hours = calculateHours(0, 12, 30);
    for (let i = 0; i < expectHourData.case4.length; i++) {
      const hour = hours[i];
      expect(hour?.hourNumber).toBe(expectHourData.case4[i]?.hourNumber);
      expect(hour?.text).toBe(expectHourData.case4[i]?.text);
    }
  });
});

describe('convert unix time to date', () => {
  it('1667385834 -> 2022-11-02', () => {
    const date = convertUnixTimeToDate(1667385834);
    expect(date).toBe('2022-11-02');
  });
  it('1667126634 -> 2022-10-30', () => {
    const date = convertUnixTimeToDate(1667126634);
    expect(date).toBe('2022-10-30');
  });
});

describe('convert date to unix', () => {
  it('2022-11-02 -> 1667347200', () => {
    const unixTime = convertDateToUnixTime('2022-11-02');
    expect(unixTime).toBe(1667347200);
  });
  it('2022-10-30 -> 1667088000', () => {
    const unixTime = convertDateToUnixTime('2022-10-30');
    expect(unixTime).toBe(1667088000);
  });
});
