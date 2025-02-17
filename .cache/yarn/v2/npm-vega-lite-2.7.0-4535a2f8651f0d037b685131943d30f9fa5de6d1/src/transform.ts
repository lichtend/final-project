import {AggregateOp} from 'vega';

import {BinParams} from './bin';
import {Data} from './data';
import {LogicalOperand, normalizeLogicalOperand} from './logical';
import {normalizePredicate, Predicate} from './predicate';
import {SortField} from './sort';
import {TimeUnit} from './timeunit';

export interface FilterTransform {
  /**
   * The `filter` property must be one of the predicate definitions:
   *
   * 1) an [expression](https://vega.github.io/vega-lite/docs/types.html#expression) string,
   * where `datum` can be used to refer to the current data object
   *
   * 2) one of the field predicates: [`equal`](https://vega.github.io/vega-lite/docs/filter.html#equal-predicate),
   * [`lt`](https://vega.github.io/vega-lite/docs/filter.html#lt-predicate),
   * [`lte`](https://vega.github.io/vega-lite/docs/filter.html#lte-predicate),
   * [`gt`](https://vega.github.io/vega-lite/docs/filter.html#gt-predicate),
   * [`gte`](https://vega.github.io/vega-lite/docs/filter.html#gte-predicate),
   * [`range`](https://vega.github.io/vega-lite/docs/filter.html#range-predicate),
   * or [`oneOf`](https://vega.github.io/vega-lite/docs/filter.html#one-of-predicate).
   *
   * 3) a [selection predicate](https://vega.github.io/vega-lite/docs/filter.html#selection-predicate)
   *
   * 4) a logical operand that combines (1), (2), or (3).
   */
  // TODO: https://github.com/vega/vega-lite/issues/2901
  filter: LogicalOperand<Predicate>;
}

export function isFilter(t: Transform): t is FilterTransform {
  return t['filter'] !== undefined;
}

export interface CalculateTransform {
  /**
   * A [expression](https://vega.github.io/vega-lite/docs/types.html#expression) string. Use the variable `datum` to refer to the current data object.
   */
  calculate: string;

  /**
   * The field for storing the computed formula value.
   */
  as: string;
}

export interface BinTransform {
  /**
   * An object indicating bin properties, or simply `true` for using default bin parameters.
   */
  bin: boolean | BinParams;

  /**
   * The data field to bin.
   */
  field: string;

  /**
   * The output fields at which to write the start and end bin values.
   */
  as: string | string[];
}

export interface TimeUnitTransform {
  /**
   * The timeUnit.
   */
  timeUnit: TimeUnit;

  /**
   * The data field to apply time unit.
   */
  field: string;

  /**
   * The output field to write the timeUnit value.
   */
  as: string;
}

export interface AggregateTransform {
  /**
   * Array of objects that define fields to aggregate.
   */
  aggregate: AggregatedFieldDef[];

  /**
   * The data fields to group by. If not specified, a single group containing all data objects will be used.
   */
  groupby?: string[];
}

export interface AggregatedFieldDef {
  /**
   * The aggregation operations to apply to the fields, such as sum, average or count.
   * See the [full list of supported aggregation operations](https://vega.github.io/vega-lite/docs/aggregate.html#ops)
   * for more information.
   */
  op: AggregateOp;

  /**
   * The data field for which to compute aggregate function. This is required for all aggregation operations except `"count"`.
   */
  field?: string;

  /**
   * The output field names to use for each aggregated field.
   */
  as: string;
}


/**
 * @hide
 */
export interface StackTransform {
  /**
   * The field which is stacked.
   */
  stack: string;
  /**
   * The data fields to group by.
   */
  groupby: string[];
  /**
   * Mode for stacking marks.
   * __Default value:__ `"zero"`
   */
  offset?: 'zero' | 'center' | 'normalize';
  /**
   * Field that determines the order of leaves in the stacked charts.
   */
  sort?: SortField[];
  /**
   * Output field names. This can be either a string or an array of strings with
   * two elements denoting the name for the fields for stack start and stack end
   * respectively.
   * If a single string(eg."val") is provided, the end field will be "val_end".
   */
  as: string | string[];

}


export type WindowOnlyOp =
  'row_number' |
   'rank' |
   'dense_rank' |
   'percent_rank' |
   'cume_dist' |
   'ntile' |
   'lag' |
   'lead' |
   'first_value' |
   'last_value' |
   'nth_value';

export interface WindowFieldDef {
  /**
   * The window or aggregation operations to apply within a window, including `rank`, `lead`, `sum`, `average` or `count`. See the list of all supported operations [here](https://vega.github.io/vega-lite/docs/window.html#ops).
   */
  op: AggregateOp | WindowOnlyOp;

  /**
   * Parameter values for the window functions. Parameter values can be omitted for operations that do not accept a parameter.
   *
   * See the list of all supported operations and their parameters [here](https://vega.github.io/vega-lite/docs/transforms/window.html).
   */
  param?: number;

  /**
   * The data field for which to compute the aggregate or window function. This can be omitted for window functions that do not operate over a field such as `count`, `rank`, `dense_rank`.
   */
  field?: string;

  /**
   * The output name for the window operation.
   */
  as: string;
}

export interface WindowTransform {
  /**
   * The definition of the fields in the window, and what calculations to use.
   */
  window: WindowFieldDef[];

  /**
   * A frame specification as a two-element array indicating how the sliding window should proceed. The array entries should either be a number indicating the offset from the current data object, or null to indicate unbounded rows preceding or following the current data object. The default value is `[null, 0]`, indicating that the sliding window includes the current object and all preceding objects. The value `[-5, 5]` indicates that the window should include five objects preceding and five objects following the current object. Finally, `[null, null]` indicates that the window frame should always include all data objects. The only operators affected are the aggregation operations and the `first_value`, `last_value`, and `nth_value` window operations. The other window operations are not affected by this.
   *
   * __Default value:__:  `[null, 0]` (includes the current object and all preceding objects)
   */
  frame?: (null | number)[];

  /**
   * Indicates if the sliding window frame should ignore peer values. (Peer values are those considered identical by the sort criteria). The default is false, causing the window frame to expand to include all peer values. If set to true, the window frame will be defined by offset values only. This setting only affects those operations that depend on the window frame, namely aggregation operations and the first_value, last_value, and nth_value window operations.
   *
   * __Default value:__ `false`
   */
  ignorePeers?: boolean;

  /**
   * The data fields for partitioning the data objects into separate windows. If unspecified, all data points will be in a single group.
   */
  groupby?: string[];

  /**
   * A sort field definition for sorting data objects within a window. If two data objects are considered equal by the comparator, they are considered “peer” values of equal rank. If sort is not specified, the order is undefined: data objects are processed in the order they are observed and none are considered peers (the ignorePeers parameter is ignored and treated as if set to `true`).
   */
  sort?: SortField[];
}

export interface LookupData {
  /**
   * Secondary data source to lookup in.
   */
  data: Data;
  /**
   * Key in data to lookup.
   */
  key: string;
  /**
   * Fields in foreign data to lookup.
   * If not specified, the entire object is queried.
   */
  fields?: string[];
}

export interface LookupTransform {
  /**
   * Key in primary data source.
   */
  lookup: string;

  /**
   * Secondary data reference.
   */
  from: LookupData;

  /**
   * The field or fields for storing the computed formula value.
   * If `from.fields` is specified, the transform will use the same names for `as`.
   * If `from.fields` is not specified, `as` has to be a string and we put the whole object into the data under the specified name.
   */
  as?: string | string[];

  /**
   * The default value to use if lookup fails.
   *
   * __Default value:__ `null`
   */
  default?: string;
}



export function isLookup(t: Transform): t is LookupTransform {
  return t['lookup'] !== undefined;
}

export function isWindow(t: Transform): t is WindowTransform {
  return t['window'] !== undefined;
}

export function isCalculate(t: Transform): t is CalculateTransform {
  return t['calculate'] !== undefined;
}

export function isBin(t: Transform): t is BinTransform {
  return !!t['bin'];
}

export function isTimeUnit(t: Transform): t is TimeUnitTransform {
  return t['timeUnit'] !== undefined;
}

export function isAggregate(t: Transform): t is AggregateTransform {
  return t['aggregate'] !== undefined;
}

export function isStack(t: Transform): t is StackTransform {
  return t['stack'] !== undefined;
}

export type Transform = FilterTransform | CalculateTransform | LookupTransform | BinTransform | TimeUnitTransform | AggregateTransform | WindowTransform | StackTransform;

export function normalizeTransform(transform: Transform[]) {
  return transform.map(t => {
    if (isFilter(t)) {
      return {
        filter: normalizeLogicalOperand(t.filter, normalizePredicate)
      };
    }
    return t;
  });
}
