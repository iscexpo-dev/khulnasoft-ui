import { BLUE_500 } from '../../tokens/build/js/tokens';
import { hexToRgba } from '../utils';
import { colorFromDefaultPalette } from './theme';

export const mockDefaultDataZoomConfig = {
  dataZoom: [
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
      disabled: true,
    },
  ],
  grid: {
    bottom: 81,
  },
  xAxis: {
    nameGap: 67,
  },
};

/**
 * This is currently used in area.stories.js and line.stories.js
 */
export const mockAnnotationsSeries = {
  series: [
    {
      type: 'scatter',
      name: 'annotations',
      data: [],
      markLine: {
        lineStyle: {
          color: BLUE_500,
        },
        data: [
          { xAxis: '2018-01-25T01:00:00.000Z' },
          { xAxis: '2018-01-25T10:00:00.000Z' },
          { xAxis: '2018-02-06T08:00:00.000Z' },
        ],
      },
      markPoint: {
        symbol: 'path://m5 229 5 8h-10z',
        symbolSize: '8',
        symbolOffset: [0, ' 60%'],
        itemStyle: {
          color: BLUE_500,
        },
        data: [
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
        ],
      },
    },
  ],
};

/**
 * This is currently used in area.stories.js and line.stories.js
 */
export const mockAnnotationsConfigs = {
  annotations: [
    {
      min: '2018-01-25T01:00:00.000Z',
      max: '2018-01-25T01:00:00.000Z',
      tooltipData: { content: 'Scranton strangler was caught.' },
    },
    {
      min: '2018-01-25T10:00:00.000Z',
      max: '2018-01-25T10:00:00.000Z',
      tooltipData: { content: 'Tobys green car is missing.' },
    },
    {
      min: '2018-02-06T08:00:00.000Z',
      max: '2018-02-06T08:00:00.000Z',
      tooltipData: { content: 'It was actually Toby!' },
    },
  ],
};

export const mockDefaultStackedBarData = [
  { name: 'Fun 1', data: [58, 49, 38, 23, 27, 68, 38, 35, 7, 64, 65, 31] },
  { name: 'Fun 2', data: [8, 6, 34, 19, 9, 7, 17, 25, 14, 7, 10, 32] },
  { name: 'Fun 3', data: [67, 60, 66, 32, 61, 54, 13, 50, 16, 11, 47, 28] },
  { name: 'Fun 4', data: [8, 9, 5, 40, 13, 19, 58, 21, 47, 59, 23, 46] },
];

export const mockMultiStackBarData = [
  { name: 'Fun 1', data: [58, 49, 38, 23, 27, 68, 38, 35, 7, 64, 65, 31], stack: 'stack-1' },
  { name: 'Fun 2', data: [8, 6, 34, 19, 9, 7, 17, 25, 14, 7, 10, 32], stack: 'stack-1' },
  { name: 'Fun 3', data: [67, 60, 66, 32, 61, 54, 13, 50, 16, 11, 47, 28], stack: 'stack-2' },
  { name: 'Fun 4', data: [8, 9, 5, 40, 13, 19, 58, 21, 47, 59, 23, 46], stack: 'stack-2' },
];

export const mockDefaultStackedLineData = [
  { name: 'Stacked median line', data: [67, 60, 66, 32, 61, 54, 13, 50, 16, 11, 47, 28] },
];

export const mockDefaultLineData = [
  {
    name: 'Median line',
    data: [
      ['Joe', 1120],
      ['Sarah', 732],
      ['Tom', 501],
      ['Mary', 634],
      ['Mike', 290],
      ['Ben', 130],
      ['Jane', 120],
    ],
  },
];

export const mockDefaultBarData = [
  {
    name: 'Full',
    data: [
      ['Joe', 1220],
      ['Sarah', 932],
      ['Tom', 901],
      ['Mary', 934],
      ['Mike', 1290],
      ['Ben', 1330],
      ['Jane', 1320],
    ],
  },
];

export const mockRawBarData = [
  ['Mon', 1220],
  ['Tue', 932],
  ['Wed', 901],
  ['Thu', 934],
  ['Fri', 1290],
  ['Sat', 1330],
  ['Sun', 1320],
];

const color = colorFromDefaultPalette(0);
export const mockDefaultLineChartConfig = {
  name: 'Line chart',
  data: [],
  type: 'line',
  yAxisIndex: 0,
  lineStyle: { color },
  itemStyle: { color },
};

export const mockDefaultBarChartConfig = {
  type: 'bar',
  name: 'Bar chart',
  data: [],
  stack: null,
  barMaxWidth: '50%',
  yAxisIndex: 0,
  itemStyle: {
    color: hexToRgba(color, 0.2),
    borderColor: color,
    borderWidth: 1,
  },
  emphasis: {
    itemStyle: {
      color: hexToRgba(color, 0.4),
    },
  },
};

export const mockSecondaryData = [
  {
    name: 'Secondary 1',
    data: [13, 25, 38, 23, 27, 28, 29, 27, 1, 15, 65, 31],
  },
];

export const mockSecondaryBarData = [
  {
    name: 'Secondary',
    type: 'bar',
    data: [
      ['Joe', 220],
      ['Sarah', 392],
      ['Tom', 291],
      ['Mary', 594],
      ['Mike', 320],
      ['Ben', 230],
      ['Jane', 120],
      ['Anne', 290],
    ],
  },
];

export const mockSecondaryTrendlineData = [
  {
    type: 'line',
    name: 'Median line',
    data: [
      ['Joe', 220],
      ['Sarah', 392],
      ['Tom', 291],
      ['Mary', 594],
      ['Mike', 320],
      ['Ben', 230],
      ['Jane', 120],
      ['Anne', 290],
    ],
  },
];
