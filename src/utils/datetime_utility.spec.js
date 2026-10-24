import * as datetimeUtility from './datetime_utility';

describe('Date time utils', () => {
  describe('newDate', () => {
    it('returns new date instance from existing date instance', () => {
      const initialDate = new Date(2019, 0, 1);
      const copiedDate = datetimeUtility.newDate(initialDate);

      expect(copiedDate.getTime()).toBe(initialDate.getTime());

      initialDate.setMonth(initialDate.getMonth() + 1);

      expect(copiedDate.getTime()).not.toBe(initialDate.getTime());
    });

    it('returns date instance when provided date param is not of type date or is undefined', () => {
      const initialDate = datetimeUtility.newDate();

      expect(initialDate instanceof Date).toBe(true);
    });
  });

  describe('get day difference', () => {
    it('should return 7', () => {
      const firstDay = new Date('07/01/2016');
      const secondDay = new Date('07/08/2016');
      const difference = datetimeUtility.getDayDifference(firstDay, secondDay);

      expect(difference).toBe(7);
    });

    it('should return 31', () => {
      const firstDay = new Date('07/01/2016');
      const secondDay = new Date('08/01/2016');
      const difference = datetimeUtility.getDayDifference(firstDay, secondDay);

      expect(difference).toBe(31);
    });

    it('should return 365', () => {
      const firstDay = new Date('07/02/2015');
      const secondDay = new Date('07/01/2016');
      const difference = datetimeUtility.getDayDifference(firstDay, secondDay);

      expect(difference).toBe(365);
    });
  });

  describe('getDateInPast', () => {
    const date = new Date('2019-07-16T00:00:00.000Z');
    const daysInPast = 90;

    it('returns the correct date in the past', () => {
      const dateInPast = datetimeUtility.getDateInPast(date, daysInPast);
      const expectedDateInPast = new Date('2019-04-17T00:00:00.000Z');

      expect(dateInPast).toStrictEqual(expectedDateInPast);
    });

    it('does not modifiy the original date', () => {
      datetimeUtility.getDateInPast(date, daysInPast);
      expect(date).toStrictEqual(new Date('2019-07-16T00:00:00.000Z'));
    });
  });

  describe('getDateInFuture', () => {
    const date = new Date('2019-07-16T00:00:00.000Z');
    const daysInFuture = 90;

    it('returns the correct date in the future', () => {
      const dateInFuture = datetimeUtility.getDateInFuture(date, daysInFuture);
      const expectedDateInFuture = new Date('2019-10-14T00:00:00.000Z');

      expect(dateInFuture).toStrictEqual(expectedDateInFuture);
    });

    it('does not modifiy the original date', () => {
      datetimeUtility.getDateInFuture(date, daysInFuture);
      expect(date).toStrictEqual(new Date('2019-07-16T00:00:00.000Z'));
    });
  });

  describe('areDatesEqual', () => {
    it.each`
      name                                               | input                                                                                                                         | expected
      ${'Returns false for no inputs'}                   | ${[]}                                                                                                                         | ${false}
      ${'Returns false for null inputs'}                 | ${[null, null]}                                                                                                               | ${false}
      ${'Returns false for empty inputs'}                | ${['', '']}                                                                                                                   | ${false}
      ${'Returns true for date without timestamp'}       | ${['2020-01-10', '2020-01-10']}                                                                                               | ${true}
      ${'Returns false for different dates in local tz'} | ${['Mon Apr 27 2020 15:21:22 GMT-0700 (Pacific Daylight Time)', 'Mon Apr 27 2020 15:22:22 GMT-0700 (Pacific Daylight Time)']} | ${false}
      ${'Returns true for same dates in local tz'}       | ${['Mon Apr 27 2020 15:22:22 GMT-0700 (Pacific Daylight Time)', 'Mon Apr 27 2020 15:22:22 GMT-0700 (Pacific Daylight Time)']} | ${true}
      ${'Returns false for different dates in UTC'}      | ${['2020-04-27 22:22:21 UTC', '2020-04-27 22:22:22 UTC']}                                                                     | ${false}
      ${'Returns true for same dates in UTC'}            | ${['2020-04-27 22:22:22 UTC', '2020-04-27 22:22:22 UTC']}                                                                     | ${true}
    `(`$name`, ({ input, expected }) => {
      expect(datetimeUtility.areDatesEqual(...input)).toBe(expected);
    });
  });
});
