"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
require("../style/settingeditor.css");
__export(require("./settingeditor"));
/* tslint:disable */
/**
 * The setting editor tracker token.
 */
exports.ISettingEditorTracker = new coreutils_1.Token('@jupyterlab/settingeditor:ISettingEditorTracker');
