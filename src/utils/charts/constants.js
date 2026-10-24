import { translate } from '../i18n';

/**
 * As of %12.10 all annotations are added as a decorations
 * by piggybacking a scatter series. The series should
 * have 'annotations' as name for the annotation tooltips
 * to work.
 *
 * More info here https://github.com/khulnasoft/khulnasoft/-/merge_requests/28825
 *
 */
export const ANNOTATIONS_SERIES_NAME = 'annotations';
/**
 * Annotations have a line (markLine) and an arrow (markPoint).
 * When the markPoint is hovered, a tooltip is displayed to
 * show the annotation description.
 *
 * All markPoints have this component type
 */
export const ANNOTATIONS_COMPONENT_TYPE = 'markPoint';

/**
 * This is a slight offset that gets applied to the left
 * of the chart tooltips to ensure a correct position.
 */
export const TOOLTIP_LEFT_OFFSET = 2;

/**
 * This is a slight offset that gets applied to the left
 * of the chart tooltips to ensure a correct position.
 */
export const TOOLTIP_TOP_OFFSET = 10;

/**
 * These are the accepted values for the layout prop
 * of the chart legend component
 */
export const LEGEND_LAYOUT_INLINE = 'inline';
export const LEGEND_LAYOUT_TABLE = 'table';

/**
 * Default values for the chart legend field labels
 */
export const LEGEND_AVERAGE_TEXT = () => translate('GlChartLegend.average', 'Avg');
export const LEGEND_CURRENT_TEXT = () => translate('GlChartLegend.current', 'Current');
export const LEGEND_MIN_TEXT = () => translate('GlChartLegend.min', 'Min');
export const LEGEND_MAX_TEXT = () => translate('GlChartLegend.max', 'Max');

/**
 * These arrow symbols are used as markPoints under the annotations lines
 * within area and line charts. This icon doesn't exist in the svg
 * library yet. The below issue is to track the progress of the svg icon
 * https://khulnasoft.com/khulnasoft-org/khulnasoft-svgs/-/issues/118
 */
export const arrowSymbol = 'path://m5 229 5 8h-10z';

// Constants for the type property of charts
export const CHART_TYPE_BAR = 'bar';
export const CHART_TYPE_LINE = 'line';

// Constants for "series.stack" option, series with the same value stack on top of each other
export const CHART_DEFAULT_SERIES_STACK = 'default-series-stack';
export const CHART_DEFAULT_SERIES_SECONDARY_STACK = 'default-series-secondary-stack';

// Constants for height "auto"
export const HEIGHT_AUTO_CLASSES = 'gl-chart-h-auto gl-flex gl-flex-col gl-h-full';
export const HEIGHT_AUTO_HORIZONTAL_LAYOUT_CLASSES = 'gl-flex gl-h-full';
