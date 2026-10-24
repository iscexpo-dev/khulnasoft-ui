import { ANNOTATIONS_SERIES_NAME, ANNOTATIONS_COMPONENT_TYPE } from './constants';

/**
 * Check if passed series has annotations related data.
 *
 * This is currently used in time series charts (area & line).
 *
 * @param {Array} series Array of series
 * @returns {Boolean}
 */
export const seriesHasAnnotations = (series = []) =>
  (series || []).filter(
    (seriesData) =>
      seriesData.name === ANNOTATIONS_SERIES_NAME &&
      seriesData[ANNOTATIONS_COMPONENT_TYPE]?.data?.length,
  ).length !== 0;

/**
 * Check if a data point is from an annotation series.
 *
 * This is triggered when hovered over time series charts.
 *
 * This is currently used in
 * @param {Object} params data point object
 * @returns {boolean}
 */
export const isDataPointAnnotation = (params = {}) =>
  params.name === ANNOTATIONS_SERIES_NAME && params.componentType === ANNOTATIONS_COMPONENT_TYPE;

/**
 * Date formatter to make date strings more
 * readable.
 *
 * This is currently used in area and line charts
 * stories.
 *
 * @param {String} d date string
 * @returns {String}
 */
export const timeSeriesDateFormatter = (d = '') => {
  if (!d) {
    return '';
  }
  const date = new Date(d);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};
