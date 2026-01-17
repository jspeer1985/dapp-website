import { URDecoder } from '@ngraveio/bc-ur';
import { Bytes, CryptoAccount, CryptoCoinInfo, CryptoECKey, CryptoHDKey, CryptoKeypath, CryptoOutput, CryptoPSBT, CryptoPSBTExtend } from '..';
export declare class URRegistryDecoder extends URDecoder {
    resultRegistryType: () => Bytes | CryptoCoinInfo | CryptoKeypath | CryptoHDKey | CryptoECKey | CryptoOutput | CryptoPSBT | CryptoPSBTExtend | CryptoAccount;
}
