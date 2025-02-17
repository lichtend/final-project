"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fielddef_1 = require("../../fielddef");
var sort_1 = require("../../sort");
var util_1 = require("../../util");
var facet_1 = require("../facet");
var dataflow_1 = require("./dataflow");
/**
 * A class for the window transform nodes
 */
var WindowTransformNode = /** @class */ (function (_super) {
    tslib_1.__extends(WindowTransformNode, _super);
    function WindowTransformNode(parent, transform) {
        var _this = _super.call(this, parent) || this;
        _this.transform = transform;
        return _this;
    }
    WindowTransformNode.makeFromFacet = function (parent, facet) {
        var row = facet.row, column = facet.column;
        if (row && column) {
            var newParent = null;
            // only need to make one for crossed facet
            for (var _i = 0, _a = [row, column]; _i < _a.length; _i++) {
                var fieldDef = _a[_i];
                if (sort_1.isSortField(fieldDef.sort)) {
                    var _b = fieldDef.sort, field = _b.field, op = _b.op;
                    parent = newParent = new WindowTransformNode(parent, {
                        window: [{
                                op: op,
                                field: field,
                                as: facet_1.facetSortFieldName(fieldDef, fieldDef.sort)
                            }],
                        groupby: [fielddef_1.vgField(fieldDef)],
                        frame: [null, null]
                    });
                }
            }
            return newParent;
        }
        return null;
    };
    WindowTransformNode.prototype.clone = function () {
        return new WindowTransformNode(this.parent, util_1.duplicate(this.transform));
    };
    WindowTransformNode.prototype.producedFields = function () {
        var _this = this;
        var out = {};
        this.transform.window.forEach(function (windowFieldDef) {
            out[_this.getDefaultName(windowFieldDef)] = true;
        });
        return out;
    };
    WindowTransformNode.prototype.getDefaultName = function (windowFieldDef) {
        return windowFieldDef.as || fielddef_1.vgField(windowFieldDef);
    };
    WindowTransformNode.prototype.assemble = function () {
        var fields = [];
        var ops = [];
        var as = [];
        var params = [];
        for (var _i = 0, _a = this.transform.window; _i < _a.length; _i++) {
            var window_1 = _a[_i];
            ops.push(window_1.op);
            as.push(this.getDefaultName(window_1));
            params.push(window_1.param === undefined ? null : window_1.param);
            fields.push(window_1.field === undefined ? null : window_1.field);
        }
        var frame = this.transform.frame;
        var groupby = this.transform.groupby;
        var sortFields = [];
        var sortOrder = [];
        if (this.transform.sort !== undefined) {
            for (var _b = 0, _c = this.transform.sort; _b < _c.length; _b++) {
                var sortField = _c[_b];
                sortFields.push(sortField.field);
                sortOrder.push(sortField.order || 'ascending');
            }
        }
        var sort = {
            field: sortFields,
            order: sortOrder,
        };
        var ignorePeers = this.transform.ignorePeers;
        var result = {
            type: 'window',
            params: params,
            as: as,
            ops: ops,
            fields: fields,
            sort: sort,
        };
        if (ignorePeers !== undefined) {
            result.ignorePeers = ignorePeers;
        }
        if (groupby !== undefined) {
            result.groupby = groupby;
        }
        if (frame !== undefined) {
            result.frame = frame;
        }
        return result;
    };
    return WindowTransformNode;
}(dataflow_1.DataFlowNode));
exports.WindowTransformNode = WindowTransformNode;
//# sourceMappingURL=window.js.map