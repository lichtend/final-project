import { DataFlowNode } from './compile/data/dataflow';
import { Model } from './compile/model';
import { DateTime } from './datetime';
import { LogicalOperand } from './logical';
import { TimeUnit } from './timeunit';
export declare type Predicate = FieldEqualPredicate | FieldRangePredicate | FieldOneOfPredicate | FieldLTPredicate | FieldGTPredicate | FieldLTEPredicate | FieldGTEPredicate | SelectionPredicate | string;
export declare type FieldPredicate = FieldEqualPredicate | FieldLTPredicate | FieldGTPredicate | FieldLTEPredicate | FieldGTEPredicate | FieldRangePredicate | FieldOneOfPredicate;
export interface SelectionPredicate {
    /**
     * Filter using a selection name.
     */
    selection: LogicalOperand<string>;
}
export declare function isSelectionPredicate(predicate: LogicalOperand<Predicate>): predicate is SelectionPredicate;
export interface FieldPredicateBase {
    /**
     * Time unit for the field to be filtered.
     */
    timeUnit?: TimeUnit;
    /**
     * Field to be filtered.
     */
    field: string;
}
export interface FieldEqualPredicate extends FieldPredicateBase {
    /**
     * The value that the field should be equal to.
     */
    equal: string | number | boolean | DateTime;
}
export declare function isFieldEqualPredicate(predicate: any): predicate is FieldEqualPredicate;
export interface FieldLTPredicate extends FieldPredicateBase {
    /**
     * The value that the field should be less than.
     */
    lt: string | number | DateTime;
}
export declare function isFieldLTPredicate(predicate: any): predicate is FieldLTPredicate;
export interface FieldLTEPredicate extends FieldPredicateBase {
    /**
     * The value that the field should be less than or equals to.
     */
    lte: string | number | DateTime;
}
export declare function isFieldLTEPredicate(predicate: any): predicate is FieldLTEPredicate;
export interface FieldGTPredicate extends FieldPredicateBase {
    /**
     * The value that the field should be greater than.
     */
    gt: string | number | DateTime;
}
export declare function isFieldGTPredicate(predicate: any): predicate is FieldGTPredicate;
export interface FieldGTEPredicate extends FieldPredicateBase {
    /**
     * The value that the field should be greater than or equals to.
     */
    gte: string | number | DateTime;
}
export declare function isFieldGTEPredicate(predicate: any): predicate is FieldGTEPredicate;
export interface FieldRangePredicate extends FieldPredicateBase {
    /**
     * An array of inclusive minimum and maximum values
     * for a field value of a data item to be included in the filtered data.
     * @maxItems 2
     * @minItems 2
     */
    range: (number | DateTime | null)[];
}
export declare function isFieldRangePredicate(predicate: any): predicate is FieldRangePredicate;
export interface FieldOneOfPredicate extends FieldPredicateBase {
    /**
     * A set of values that the `field`'s value should be a member of,
     * for a data item included in the filtered data.
     */
    oneOf: string[] | number[] | boolean[] | DateTime[];
}
export declare function isFieldOneOfPredicate(predicate: any): predicate is FieldOneOfPredicate;
export declare function isFieldPredicate(predicate: Predicate): predicate is FieldOneOfPredicate | FieldEqualPredicate | FieldRangePredicate | FieldLTPredicate | FieldGTPredicate | FieldLTEPredicate | FieldGTEPredicate;
/**
 * Converts a predicate into an expression.
 */
export declare function expression(model: Model, filterOp: LogicalOperand<Predicate>, node?: DataFlowNode): string;
export declare function fieldFilterExpression(predicate: FieldPredicate, useInRange?: boolean): string;
export declare function normalizePredicate(f: Predicate): Predicate;
