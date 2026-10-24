import { merge } from 'lodash-es';
import { GlBreakpointInstance } from '../breakpoints';
import { hexToRgba } from '../utils';
import {
  defaultChartOptions,
  getDataZoomConfig,
  getThresholdConfig,
  mergeSeriesToOptions,
  parseAnnotations,
  generateBarSeries,
  generateLineSeries,
  getTooltipAxisConfig,
  getTooltipTitle,
  getTooltipContent,
  getTooltipParams,
} from './config';
import {
  mockDefaultDataZoomConfig,
  mockDefaultStackedBarData,
  mockDefaultLineData,
} from './mock_data';
import { colorFromDefaultPalette } from './theme';

describe('chart config helpers', () => {
  describe('getThresholdConfig', () => {
    const makeThreshold = (threshold, operator) => [
      {
        threshold,
        operator,
      },
    ];

    it('returns empty object for no thresholds', () => {
      expect(getThresholdConfig([])).toEqual({});
    });

    it('draws area below line for < threshold', () => {
      const threshold = 3;
      const thresholds = makeThreshold(threshold, '<');
      const expectedLineData = [{ yAxis: threshold }];
      const expectedAreaData = [[{ yAxis: Number.NEGATIVE_INFINITY }, { yAxis: threshold }]];

      const { markLine, markArea } = getThresholdConfig(thresholds);

      expect(markLine.data).toEqual(expectedLineData);
      expect(markArea.data).toEqual(expectedAreaData);
    });

    it('draws line only for = threshold', () => {
      const threshold = 7;
      const thresholds = makeThreshold(threshold, '=');
      const expectedLineData = [{ yAxis: threshold }];
      const expectedAreaData = [];

      const { markLine, markArea } = getThresholdConfig(thresholds);

      expect(markLine.data).toEqual(expectedLineData);
      expect(markArea.data).toEqual(expectedAreaData);
    });

    it('draws area above line for > threshold', () => {
      const threshold = 9000;
      const thresholds = makeThreshold(threshold, '>');
      const expectedLineData = [{ yAxis: threshold }];
      const expectedAreaData = [[{ yAxis: threshold }, { yAxis: Infinity }]];

      const { markLine, markArea } = getThresholdConfig(thresholds);

      expect(markLine.data).toEqual(expectedLineData);
      expect(markArea.data).toEqual(expectedAreaData);
    });
  });

  describe('parseAnnotations', () => {
    const makeAnnotation = ({ min, max }) => [
      {
        min,
        max,
      },
    ];

    it('returns empty object for no annotations', () => {
      expect(parseAnnotations([])).toEqual({
        areas: [],
        lines: [],
        points: [],
      });
    });

    it('draws an annotation range between two fixed points', () => {
      const annotation = makeAnnotation({
        min: 10,
        max: 40,
      });
      const expectedLineData = [];
      const expectedAreaData = [[{ xAxis: 10 }, { xAxis: 40 }]];

      const { lines, areas } = parseAnnotations(annotation);

      expect(lines).toEqual(expectedLineData);
      expect(areas).toEqual(expectedAreaData);
    });

    it('draws an annotation range with infinity upper bound', () => {
      const annotation = makeAnnotation({
        min: 10,
        max: Infinity,
      });
      const expectedLineData = [];
      const expectedAreaData = [[{ xAxis: 10 }, { xAxis: Infinity }]];

      const { lines, areas } = parseAnnotations(annotation);

      expect(lines).toEqual(expectedLineData);
      expect(areas).toEqual(expectedAreaData);
    });

    it('draws an annotation range with infinity lower bound', () => {
      const annotation = makeAnnotation({
        min: Number.NEGATIVE_INFINITY,
        max: 10,
      });
      const expectedLineData = [];
      const expectedAreaData = [[{ xAxis: -Infinity }, { xAxis: 10 }]];

      const { lines, areas } = parseAnnotations(annotation);

      expect(lines).toEqual(expectedLineData);
      expect(areas).toEqual(expectedAreaData);
    });

    it('draws an annotation range without upper bound', () => {
      const annotation = makeAnnotation({
        min: 10,
      });
      const expectedLineData = [];
      const expectedAreaData = [[{ xAxis: 10 }, { xAxis: undefined }]];

      const { lines, areas } = parseAnnotations(annotation);

      expect(lines).toEqual(expectedLineData);
      expect(areas).toEqual(expectedAreaData);
    });

    it('draws an annotation range without lower bound', () => {
      const annotation = makeAnnotation({
        max: 10,
      });
      const expectedLineData = [];
      const expectedAreaData = [[{ xAxis: undefined }, { xAxis: 10 }]];

      const { lines, areas } = parseAnnotations(annotation);

      expect(lines).toEqual(expectedLineData);
      expect(areas).toEqual(expectedAreaData);
    });

    it('draws an annotation line', () => {
      const annotation = makeAnnotation({
        min: 10,
        max: 10,
      });
      const expectedLineData = [{ xAxis: 10 }];
      const expectedAreaData = [];

      const { lines, areas } = parseAnnotations(annotation);

      expect(lines).toEqual(expectedLineData);
      expect(areas).toEqual(expectedAreaData);
    });

    it('draws multiple annotation lines', () => {
      const annotation1 = makeAnnotation({
        min: 10,
        max: 10,
      });
      const annotation2 = makeAnnotation({
        min: 30,
        max: 30,
      });
      const expectedLineData = [{ xAxis: 10 }, { xAxis: 30 }];
      const expectedAreaData = [];

      const { lines, areas } = parseAnnotations([...annotation1, ...annotation2]);

      expect(lines).toEqual(expectedLineData);
      expect(areas).toEqual(expectedAreaData);
    });
  });

  describe('getDataZoomConfig', () => {
    describe('on large viewports (lg, xl)', () => {
      it('creates a basic dataZoomConfig with inside scrolling being disabled', () => {
        jest.spyOn(GlBreakpointInstance, 'getBreakpointSize').mockImplementationOnce(() => 'lg');
        const actual = getDataZoomConfig();
        const expected = mockDefaultDataZoomConfig;

        expect(actual).toEqual(expected);
      });
    });

    describe('on small viewports', () => {
      it('creates a basic dataZoomConfig with inside scrolling being enabled', () => {
        jest.spyOn(GlBreakpointInstance, 'getBreakpointSize').mockImplementationOnce(() => 'sm');
        const actual = getDataZoomConfig();
        const dataZoomWithInsideEnabled = [
          {
            bottom: 22,
            filterMode: 'none',
            minSpan: 0.01,
            type: 'slider',
          },
          {
            type: 'inside',
            filterMode: 'none',
            minSpan: 0.01,
            disabled: false,
          },
        ];
        const expected = merge({}, mockDefaultDataZoomConfig, {
          dataZoom: dataZoomWithInsideEnabled,
        });

        expect(actual).toEqual(expected);
      });
    });

    it('allows the filterMode to be set', () => {
      const actual = getDataZoomConfig({ filterMode: 'filter' });
      // After https://github.com/khulnasoft/khulnasoft-ui/issues/240
      // all default dataZoom configs will have slider & inside.
      // inside is specifically to enable touch zoom for mobile devices
      const dataZoomWithFilter = [
        {
          type: 'slider',
          filterMode: 'filter',
          minSpan: null,
        },
        {
          type: 'inside',
          filterMode: 'filter',
          minSpan: null,
          disabled: true,
        },
      ];
      const expected = merge({}, mockDefaultDataZoomConfig, {
        dataZoom: dataZoomWithFilter,
      });

      expect(actual).toEqual(expected);
    });
  });

  describe('mergeSeriesToOptions', () => {
    const series = {
      areaStyle: {
        opacity: 0.2,
        color: '#1f78d1',
      },
      showSymbol: false,
      lineStyle: {
        color: '#1f78d1',
      },
      itemStyle: {
        color: '#1f78d1',
      },
      symbol: 'circle',
      type: 'line',
      width: 2,
      name: 'Values',
      data: [
        [0, 5],
        [4, 3],
        [8, 10],
      ],
    };

    it('create chart options with invalid series props', () => {
      const chartOptionsOutput = {
        ...defaultChartOptions,
        series: [],
      };
      expect(mergeSeriesToOptions(defaultChartOptions)).toEqual(chartOptionsOutput);
      expect(mergeSeriesToOptions(defaultChartOptions, [])).toEqual(chartOptionsOutput);
    });

    it('creates chart options with single series object passed as data prop', () => {
      // data for chart can also be passed as a data prop which is transformed to series
      const chartOptions = mergeSeriesToOptions({
        ...defaultChartOptions,
        series,
      });

      expect(chartOptions.series).toBeInstanceOf(Array);
      expect(chartOptions.series).toHaveLength(1);
    });

    it('creates chart options with single series array passed as data prop', () => {
      const chartOptions = mergeSeriesToOptions({
        ...defaultChartOptions,
        series: [series],
      });

      expect(chartOptions.series).toBeInstanceOf(Array);
      expect(chartOptions.series).toHaveLength(1);
    });

    it('creates chart options with multiple series array passed as data prop', () => {
      const chartOptions = mergeSeriesToOptions({
        ...defaultChartOptions,
        series: [series, series],
      });

      expect(chartOptions.series).toBeInstanceOf(Array);
      expect(chartOptions.series).toHaveLength(2);
    });

    it('creates chart options with single series object passed as series prop', () => {
      const chartOptions = mergeSeriesToOptions(defaultChartOptions, series);

      expect(chartOptions.series).toBeInstanceOf(Array);
      expect(chartOptions.series).toHaveLength(1);
    });

    it('creates chart options with single series array passed as series prop', () => {
      const chartOptions = mergeSeriesToOptions(defaultChartOptions, [series]);

      expect(chartOptions.series).toBeInstanceOf(Array);
      expect(chartOptions.series).toHaveLength(1);
    });

    it('creates chart options with multiple series array passed as series prop', () => {
      const chartOptions = mergeSeriesToOptions(defaultChartOptions, [series, series]);

      expect(chartOptions.series).toBeInstanceOf(Array);
      expect(chartOptions.series).toHaveLength(2);
    });
  });

  describe('generateBarSeries', () => {
    const defaultBarColors = {
      itemStyle: { color: hexToRgba(colorFromDefaultPalette(1), 0.2) },
      emphasis: { itemStyle: { color: hexToRgba(colorFromDefaultPalette(1), 0.4) } },
    };
    const barDefaultParams = {
      name: 'Bar chart',
      color: colorFromDefaultPalette(0),
    };

    it.each`
      param           | value                         | result
      ${'name'}       | ${'Cool new bar chart'}       | ${{ name: 'Cool new bar chart' }}
      ${'color'}      | ${colorFromDefaultPalette(1)} | ${defaultBarColors}
      ${'data'}       | ${mockDefaultStackedBarData}  | ${{ data: mockDefaultStackedBarData }}
      ${'yAxisIndex'} | ${3}                          | ${{ yAxisIndex: 3 }}
    `('with $param set will contain $result', ({ param, value, result }) => {
      expect(
        generateBarSeries({
          ...barDefaultParams,
          [param]: value,
        }),
      ).toMatchObject(result);
    });
  });
  describe('generateLineSeries', () => {
    const defaultLineColors = {
      itemStyle: { color: colorFromDefaultPalette(1) },
      lineStyle: { color: colorFromDefaultPalette(1) },
    };
    const lineDefaultParams = { name: 'Line chart', color: colorFromDefaultPalette(0) };

    it.each`
      param           | value                         | result
      ${'name'}       | ${'Cool new line chart'}      | ${{ name: 'Cool new line chart' }}
      ${'color'}      | ${colorFromDefaultPalette(1)} | ${defaultLineColors}
      ${'data'}       | ${mockDefaultLineData}        | ${{ data: mockDefaultLineData }}
      ${'yAxisIndex'} | ${2}                          | ${{ yAxisIndex: 2 }}
    `('with $param set will contain $result', ({ param, value, result }) => {
      expect(
        generateLineSeries({
          ...lineDefaultParams,
          [param]: value,
        }),
      ).toMatchObject(result);
    });
  });

  describe('getTooltipAxisConfig', () => {
    it.each([undefined, 'invalidAxis'])(
      'throws an error when `dimensionAxis` is %s',
      (dimensionAxis) => {
        expect(() => getTooltipAxisConfig(dimensionAxis)).toThrow(
          `\`dimensionAxis\` must be "xAxis" or "yAxis", received ${dimensionAxis}`,
        );
      },
    );

    it.each`
      dimensionAxis | expectedResult
      ${'xAxis'}    | ${{ dimensionIndex: 0, metricIndex: 1, valueAxis: 'yAxis' }}
      ${'yAxis'}    | ${{ dimensionIndex: 1, metricIndex: 0, valueAxis: 'xAxis' }}
    `(
      'returns the tooltip axis config as expected when dimensionAxis=$dimensionAxis',
      ({ dimensionAxis, expectedResult }) => {
        expect(getTooltipAxisConfig(dimensionAxis)).toEqual(expectedResult);
      },
    );
  });

  describe('getTooltipTitle', () => {
    const singleSeries = [{ value: ['Value 1', 99] }];
    const multipleSeries = [{ value: ['Value 1', 99] }, { value: ['Value 2', 100] }];
    const multipleRepeatedSeries = [{ value: ['Value 1', 99] }, { value: ['Value 1', 99] }];

    it('returns an empty value', () => {
      expect(getTooltipTitle()).toBe('');
    });

    it('returns title for single series', () => {
      expect(
        getTooltipTitle({
          seriesData: singleSeries,
        }),
      ).toBe('Value 1');
    });

    it('returns title for multiple series', () => {
      expect(
        getTooltipTitle({
          seriesData: multipleSeries,
        }),
      ).toBe('Value 1, Value 2');
    });

    it('returns title for multiple repeated series', () => {
      expect(
        getTooltipTitle({
          seriesData: multipleRepeatedSeries,
        }),
      ).toBe('Value 1');
    });

    it('returns title for multiple series with an axis name', () => {
      expect(
        getTooltipTitle(
          {
            seriesData: multipleSeries,
          },
          'Time',
        ),
      ).toBe('Value 1, Value 2 (Time)');
    });

    describe('dimensionIndex = 1', () => {
      it('returns title for single series', () => {
        expect(
          getTooltipTitle(
            {
              seriesData: singleSeries,
            },
            undefined,
            1,
          ),
        ).toBe('99');
      });

      it('returns title for multiple series', () => {
        expect(
          getTooltipTitle(
            {
              seriesData: multipleSeries,
            },
            undefined,
            1,
          ),
        ).toBe('99, 100');
      });

      it('returns title for multiple repeated series', () => {
        expect(
          getTooltipTitle(
            {
              seriesData: multipleRepeatedSeries,
            },
            undefined,
            1,
          ),
        ).toBe('99');
      });

      it('returns title for multiple series with an axis name', () => {
        expect(
          getTooltipTitle(
            {
              seriesData: multipleSeries,
            },
            'Time',
            1,
          ),
        ).toBe('99, 100 (Time)');
      });
    });
  });

  describe('getTooltipContent', () => {
    const singleSeries = [{ value: ['Value 1', 99], seriesName: 'Series 1', color: '#aaa' }];
    const multipleSeries = [
      { value: ['Value 1', 99], seriesName: 'Series 1', color: '#aaa' },
      { value: ['Value 2', 99], seriesName: 'Series 2', color: '#bbb' },
    ];
    const multipleRepeatedSeries = [
      { value: ['Value 1', 99], seriesName: 'Series 1', color: '#aaa' },
      { value: ['Value 1', 99], seriesName: 'Series 1', color: '#aaa' },
    ];

    it('returns an empty value', () => {
      expect(getTooltipContent()).toEqual({});
    });

    it('returns content for single series', () => {
      expect(
        getTooltipContent({
          seriesData: singleSeries,
        }),
      ).toEqual({ 'Series 1': { color: '', value: 99 } });
    });

    it('returns content for single series with an axis name', () => {
      expect(
        getTooltipContent(
          {
            seriesData: singleSeries,
          },
          'Amount',
        ),
      ).toEqual({ Amount: { color: '', value: 99 } });
    });

    it('returns content for multiple series', () => {
      expect(
        getTooltipContent({
          seriesData: multipleSeries,
        }),
      ).toEqual({
        'Series 1': { color: '#aaa', value: 99 },
        'Series 2': { color: '#bbb', value: 99 },
      });
    });

    it('returns content for multiple repeated series', () => {
      expect(
        getTooltipContent({
          seriesData: multipleRepeatedSeries,
        }),
      ).toEqual({ 'Series 1': { color: '#aaa', value: 99 } });
    });

    describe('metricIndex = 0', () => {
      it('returns content for single series', () => {
        expect(
          getTooltipContent(
            {
              seriesData: singleSeries,
            },
            undefined,
            0,
          ),
        ).toEqual({ 'Series 1': { color: '', value: 'Value 1' } });
      });

      it('returns content for single series with an axis name', () => {
        expect(
          getTooltipContent(
            {
              seriesData: singleSeries,
            },
            'Amount',
            0,
          ),
        ).toEqual({ Amount: { color: '', value: 'Value 1' } });
      });

      it('returns content for multiple series', () => {
        expect(
          getTooltipContent(
            {
              seriesData: multipleSeries,
            },
            undefined,
            0,
          ),
        ).toEqual({
          'Series 1': { color: '#aaa', value: 'Value 1' },
          'Series 2': { color: '#bbb', value: 'Value 2' },
        });
      });

      it('returns content for multiple repeated series', () => {
        expect(
          getTooltipContent(
            {
              seriesData: [
                { value: ['Value 1', 99], seriesName: 'Series 1', color: '#aaa' },
                { value: ['Value 1', 99], seriesName: 'Series 1', color: '#aaa' },
              ],
            },
            undefined,
            0,
          ),
        ).toEqual({ 'Series 1': { color: '#aaa', value: 'Value 1' } });
      });
    });
  });

  describe('getTooltipParams', () => {
    const mockChartOptions = {
      series: [
        { name: 'Series 1', stack: 'stack-1' },
        { name: 'Series 2', stack: 'stack-1' },
        { name: 'Series 3', stack: null },
      ],
    };

    const mockChartParams = {
      value: 'January',
      seriesData: [
        { seriesName: 'Series 1', seriesIndex: 0, value: 10, color: 'red' },
        { seriesName: 'Series 2', seriesIndex: 1, value: 20, color: 'blue' },
        {
          seriesName: 'Series 3',
          seriesIndex: 2,
          value: 30,
          color: 'green',
        },
      ],
    };

    it('adds stack to seriesData items', () => {
      expect(getTooltipParams(mockChartParams, mockChartOptions)).toEqual({
        value: 'January',
        seriesData: [
          {
            ...mockChartParams.seriesData[0],
            stack: 'stack-1',
          },
          {
            ...mockChartParams.seriesData[1],
            stack: 'stack-1',
          },
          {
            ...mockChartParams.seriesData[2],
            stack: null,
          },
        ],
      });
    });

    it('returns null when params are null', () => {
      expect(getTooltipParams(null, mockChartOptions)).toBeNull();
    });

    it('returns original params when options are null', () => {
      expect(getTooltipParams(mockChartParams, null)).toEqual(mockChartParams);
    });
  });
});
