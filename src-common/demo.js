"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRandomInt = void 0;
function GetRandomInt(minValue, maxValue) {
    if (minValue > maxValue)
        throw new Error(`minValue > maxValue: ${minValue} > ${maxValue}`);
    let r = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
    return r;
}
exports.GetRandomInt = GetRandomInt;
//# sourceMappingURL=demo.js.map