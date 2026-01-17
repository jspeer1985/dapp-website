/// <reference types="node" />
import { DataItem } from './lib';
import { RegistryItem } from './RegistryItem';
export declare enum CoinIds {
    Litecoin = 2,
    Dogecoin = 3,
    Dash = 4,
    BitcoinCash = 145
}
export declare class CryptoPSBTExtend extends RegistryItem {
    private psbt;
    private coinId;
    getRegistryType: () => import("./RegistryType").RegistryType;
    constructor(psbt: Buffer, coinId: CoinIds);
    getPSBT: () => Buffer;
    getCoinId: () => CoinIds;
    toDataItem: () => DataItem;
    static fromDataItem: (dataItem: DataItem) => CryptoPSBTExtend;
    static fromCBOR: (_cborPayload: Buffer) => CryptoPSBTExtend;
}
