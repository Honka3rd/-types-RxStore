"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncStates = void 0;
var AsyncStates;
(function (AsyncStates) {
    AsyncStates[AsyncStates["FULFILLED"] = 0] = "FULFILLED";
    AsyncStates[AsyncStates["ERROR"] = 1] = "ERROR";
    AsyncStates[AsyncStates["PENDING"] = 2] = "PENDING";
})(AsyncStates = exports.AsyncStates || (exports.AsyncStates = {}));
