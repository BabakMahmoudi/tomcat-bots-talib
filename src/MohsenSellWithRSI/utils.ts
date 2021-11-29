import tomcat from '@gostarehnegar/tomcat'
import axios from 'axios'
import path from 'path'
import fs from 'fs'

// import { CandleStickCollection } from '../../../tomcat/build/main/lib/common/CandleStickCollection'
// import { CandleStickData } from '../../../tomcat/build/main/lib/common/CandleStickData'
// import { CandleStickCollection, CandleStickData } from '@gostarehnegar/tomcat/src/lib/common'

type CandleStickData = tomcat.Domain.Base.CandleStickData
type CandleStickCollection = tomcat.Domain.Base.CandleStickCollection
export class Utils {

    static isGreen(candle: CandleStickData) {
        return candle.close > candle.open
    }
    static countGreenCandle = (candles: CandleStickCollection, t1: number, t2: number) => {
        const t1Index = candles.items.findIndex(x => x.openTime >= t1)
        const t2Index = candles.items.findIndex(x => x.openTime == t2)
        let res = 0
        if (t1Index < 0 || t2Index < 0) {
            return res
        }
        for (let i = t1Index; i <= t2Index; i++) {
            if (Utils.isGreen(candles.items[i])) {
                res++
            }
        }
        return res
    }
    static getArgumentValue(args: string[], key: string) {
        for (let i = 0; i < args.length; i++) {
            if (args[i].toLowerCase().includes(key)) {
                return args[i + 1]
            }
        }
        return null
    }
    static async checkSymbol(symbol: string) {
        axios.get(`https://api.binance.com/api/v3/exchangeInfo?symbol=${symbol}`).then((res) => {
            (res)
            return symbol
        })
            .catch((err) => {
                (err)
                throw "symbol not found"
            })
    }
    public static ReadConfig<T>(fileName: string): T {

        // var configFile = path.resolve(dir, 'config.json')
        // console.log(configFile);
        var data = fs.existsSync(fileName)
            ? fs.readFileSync(fileName).toString()
            : null;
        if (data) {
            var result = JSON.parse(data) as T;
            Object.assign(tomcat.config, result);
            return result;
        }
        return {} as T;
    }

}
export class Mohsen {
    signal: string
    candle: CandleStickData
}