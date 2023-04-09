"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginImpl = exports.AsyncStates = void 0;
var AsyncStates;
(function (AsyncStates) {
    AsyncStates[AsyncStates["FULFILLED"] = 0] = "FULFILLED";
    AsyncStates[AsyncStates["ERROR"] = 1] = "ERROR";
    AsyncStates[AsyncStates["PENDING"] = 2] = "PENDING";
})(AsyncStates = exports.AsyncStates || (exports.AsyncStates = {}));
var PluginImpl = /** @class */ (function () {
    function PluginImpl(id) {
        var _this = this;
        this.id = id;
        this.selector = function () { return _this.id; };
    }
    PluginImpl.prototype.reportNoneConnectedError = function () {
        throw Error("initiator method is not called");
    };
    PluginImpl.prototype.safeExecute = function (callback) {
        var connector = this.connector;
        if (connector) {
            return callback(connector);
        }
        this.reportNoneConnectedError();
    };
    PluginImpl.prototype.chain = function () {
        var plugins = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            plugins[_i] = arguments[_i];
        }
        this.safeExecute(function (connector) {
            Array.from(plugins).forEach(function (plugin) {
                plugin.initiator(connector);
            });
        });
        return this;
    };
    return PluginImpl;
}());
exports.PluginImpl = PluginImpl;
