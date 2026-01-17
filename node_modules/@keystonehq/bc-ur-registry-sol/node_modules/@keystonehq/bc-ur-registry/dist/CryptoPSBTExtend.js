"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoPSBTExtend = exports.CoinIds = void 0;
const lib_1 = require("./lib");
const RegistryItem_1 = require("./RegistryItem");
const RegistryType_1 = require("./RegistryType");
var Keys;
(function (Keys) {
    Keys[Keys["psbt"] = 1] = "psbt";
    Keys[Keys["coinId"] = 2] = "coinId";
})(Keys || (Keys = {}));
var CoinIds;
(function (CoinIds) {
    CoinIds[CoinIds["Litecoin"] = 2] = "Litecoin";
    CoinIds[CoinIds["Dogecoin"] = 3] = "Dogecoin";
    CoinIds[CoinIds["Dash"] = 4] = "Dash";
    CoinIds[CoinIds["BitcoinCash"] = 145] = "BitcoinCash";
})(CoinIds = exports.CoinIds || (exports.CoinIds = {}));
class CryptoPSBTExtend extends RegistryItem_1.RegistryItem {
    constructor(psbt, coinId) {
        super();
        this.psbt = psbt;
        this.coinId = coinId;
        this.getRegistryType = () => RegistryType_1.RegistryTypes.CRYPTO_PSBT_EXTEND;
        this.getPSBT = () => this.psbt;
        this.getCoinId = () => this.coinId;
        this.toDataItem = () => {
            const map = {};
            map[Keys.psbt] = this.psbt;
            map[Keys.coinId] = this.coinId;
            return new lib_1.DataItem(map);
        };
    }
}
exports.CryptoPSBTExtend = CryptoPSBTExtend;
CryptoPSBTExtend.fromDataItem = (dataItem) => {
    const map = dataItem.getData();
    const psbt = map[Keys.psbt];
    const coinId = map[Keys.coinId];
    if (!coinId) {
        throw new Error(`#[ur-registry][CryptoPSBTExtend][fn.fromDataItem]: decoded [dataItem][#data][coinId] is undefined: ${dataItem}`);
    }
    if (!psbt) {
        throw new Error(`#[ur-registry][CryptoPSBTExtend][fn.fromDataItem]: decoded [dataItem][#data] is undefined: ${dataItem}`);
    }
    return new CryptoPSBTExtend(psbt, coinId);
};
CryptoPSBTExtend.fromCBOR = (_cborPayload) => {
    const dataItem = (0, lib_1.decodeToDataItem)(_cborPayload);
    return CryptoPSBTExtend.fromDataItem(dataItem);
};
//# sourceMappingURL=CryptoPSBTExtend.js.map