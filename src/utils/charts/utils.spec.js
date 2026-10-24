import { seriesHasAnnotations, isDataPointAnnotation, timeSeriesDateFormatter } from './utils';

const mockMarkPoint = {
  symbol: 'path://m5 229 5 8h-10z',
  symbolSize: '8',
  symbolOffset: [0, ' 60%'],
  data: [],
};

const markPointData = [
  {
    name: 'annotations',
    xAxis: '2018-01-25T01:00:00.000Z',
    yAxis: 0,
    tooltipData: { content: 'Scranton strangler was caught.' },
  },
  {
    name: 'annotations',
    xAxis: '2018-01-25T10:00:00.000Z',
    yAxis: 0,
    tooltipData: { content: 'Tobys green car is missing.' },
  },
  {
    name: 'annotations',
    xAxis: '2018-02-06T08:00:00.000Z',
    yAxis: 0,
    tooltipData: { content: 'It was actually Toby!' },
  },
];
const defaultDataWithoutMarkPoint = [
  {
    type: 'scatter',
    name: 'annotations',
    data: [],
  },
];

const defaultDataWithMarkPoint = [
  {
    ...defaultDataWithoutMarkPoint[0],
    markPoint: mockMarkPoint,
  },
];

const defaultDataWithMarkPointData = [
  {
    ...defaultDataWithoutMarkPoint[0],
    markPoint: {
      ...mockMarkPoint,
      data: markPointData,
    },
  },
];

const defaultDataWithoutAnnotations = [
  {
    type: 'line',
    name: 'Line data',
    data: [['Mon', 20]],
  },
];

const hoveredMarkPoint = (type) => ({
  ...markPointData[0],
  componentType: type,
});

describe('chart utils', () => {
  describe('seriesHasAnnotations', () => {
    it.each`
      name                                                               | input                            | expected
      ${'Returns false for no input'}                                    | ${undefined}                     | ${false}
      ${'Returns false for null input'}                                  | ${null}                          | ${false}
      ${'Returns false for empty series'}                                | ${[]}                            | ${false}
      ${'Returns false for series with no markPoint'}                    | ${defaultDataWithoutMarkPoint}   | ${false}
      ${'Returns false for series with markPoint but no markPoint.data'} | ${defaultDataWithMarkPoint}      | ${false}
      ${'Returns false for non-annotations series'}                      | ${defaultDataWithoutAnnotations} | ${false}
      ${'Returns true for series with markPoint and markPoint data'}     | ${defaultDataWithMarkPointData}  | ${true}
    `(`$name`, ({ input, expected }) => {
      expect(seriesHasAnnotations(input)).toBe(expected);
    });
  });

  describe('isDataPointAnnotation', () => {
    it.each`
      name                                                               | input                            | expected
      ${'Returns false for undefined input'}                             | ${undefined}                     | ${false}
      ${'Returns false for empty input'}                                 | ${{}}                            | ${false}
      ${'Returns false if hovered data point is a scatter series datum'} | ${hoveredMarkPoint('scatter')}   | ${false}
      ${'Returns true if hovered data point is a markPoint'}             | ${hoveredMarkPoint('markPoint')} | ${true}
    `(`$name`, ({ input, expected }) => {
      expect(isDataPointAnnotation(input)).toBe(expected);
    });
  });

  describe('timeSeriesDateFormatter', () => {
    it.each`
      name                                             | input            | expected
      ${'Returns empty string for empty input'}        | ${''}            | ${''}
      ${'Returns empty string for null input'}         | ${null}          | ${''}
      ${'Returns formatted date for epoch time input'} | ${1514707200000} | ${'2017-12-31'}
    `(`$name`, ({ input, expected }) => {
      expect(timeSeriesDateFormatter(input)).toBe(expected);
    });
  });
});
