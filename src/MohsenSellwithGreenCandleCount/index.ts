import fs from 'fs'

import tomcat from '@gostarehnegar/tomcat'
import * as TalibIndicators from '@gostarehnegar/tomcat-indicators-talib'


import { config } from './config'
import { Mohsen, Utils } from './utils'
import { Wallet } from './wallet'

type CandleStickData = tomcat.Domain.Base.CandleStickData
const Stream = tomcat.Domain.Streams.Stream
const pipeline = new tomcat.Domain.Pipes.Pipeline()

const args = process.argv.slice(2);
if (Utils.getArgumentValue(args, "config")) {
    const a = fs.readFileSync(Utils.getArgumentValue(args, "config")) as unknown as string
    config.from(JSON.parse(a))
} else {
    config.INITIALBALANCE = Utils.getArgumentValue(args, "initbalance");
    config.LOWERBAND = Utils.getArgumentValue(args, "lowerband");
    config.GREENCANDLECOUNT = Utils.getArgumentValue(args, "greencount");
    config.UPPERBOUND = Utils.getArgumentValue(args, "upperband");
    config.USERSIFORSELLSIGNALS = Utils.getArgumentValue(args, "usersi");
    config.STARTTIME = Utils.getArgumentValue(args, "start")
    config.DATASTREAM = Utils.getArgumentValue(args, "datastream")
    config.INDICATORSTREAM = Utils.getArgumentValue(args, "indicator")
    config.SIGNALSTREAM = Utils.getArgumentValue(args, "siganl")
    config.WALLETSTREAM = Utils.getArgumentValue(args, "wallet")
    config.SYMBOL = Utils.getArgumentValue(args, "symbol")
}
config.Validate()
if (config.conflicts.length > 0) {
    for (let i = 0; i < config.conflicts.length; i++) {
        console.error('\x1b[31m%s\x1b[0m', config.conflicts[i])
    }
    // throw "resolve conflicts"
}
if (config.info.length > 0) {
    for (let i = 0; i < config.info.length; i++) {
        console.log('\x1b[33m%s\x1b[0m', config.info[i]);

    }
}
const bus = tomcat.Infrastructure.Bus.RedisBus.Bus
tomcat.config.data.redis.publicUrl = "redis://localhost:6379"

const wallet = new Wallet(config.INITIALBALANCE, config.WALLETSTREAM)
const halfTrend = TalibIndicators.HalfTrend(2, 2, 200, '30m')
const hTSignal = TalibIndicators.HTSignal(2, 2, 200, '30m')
const rsi = TalibIndicators.RSI(2, 200, '30m')
let signal = ""
let position = "sell"
let signalCandle: CandleStickData

pipeline.from('binance', 'spot', config.SYMBOL, '30m', config.DATASTREAM)
    .add(rsi)
    .add(halfTrend, { stream: true, name: config.INDICATORSTREAM })
    .add(async (candle, THIS) => {
        bus.publish("/Mohsen/data", candle)
        THIS.context.stream = THIS.context.stream || new Stream<Mohsen>(config.SIGNALSTREAM)
        const stream = THIS.context.stream as tomcat.Domain.Streams.Stream<Mohsen>
        const candles = THIS.getScaler("30m", 100).push(candle);
        if (candle.indicators.getValue<string>(hTSignal)) {
            signal = candle.indicators.getValue<string>(hTSignal)
            signalCandle = candle
        }
        if (signalCandle && candle.indicators.getNumberValue(rsi)) {
            if (candle.indicators.getNumberValue(rsi) <= config.LOWERBAND && signal == 'buy' && position != "buy") {
                position = "buy"
                wallet.buy(candle.close, candle.closeTime)
                await stream.write(tomcat.utils.toTimeEx(candle.openTime).ticks, { signal: "buy", candle: candle })
            }
        }
        if (position != "sell") {
            const count = Utils.countGreenCandle(candles, signalCandle.openTime, candle.openTime)
            if (count == config.GREENCANDLECOUNT) {
                position = "sell"
                wallet.sell(candle.close, candle.closeTime)
                await stream.write(tomcat.utils.toTimeEx(candle.openTime), { signal: "sell", candle: candle })
            }
        }
    })
pipeline.start(config.STARTTIME)


const CandleStream = tomcat.Domain.Streams.CandleStream
const PORT = Math.floor(Math.random() * 100 + 8000);
const app = tomcat
    .hosts
    .getHostBuilder("bot")
    .buildWebHost('express')
    .expressApp;
const strategyStream = new CandleStream(config.SIGNALSTREAM)
const walletStream = new CandleStream(config.WALLETSTREAM)



app.get("/query", async (req, res) => {
    const timquery = req.query["startTime"] as string
    const time = timquery.indexOf('Z') > 0 ?
        tomcat.utils.toTimeEx(new Date(timquery))
        : tomcat.utils.toTimeEx(Number(req.query["startTime"])).floorToMinutes(1)
    const result = await strategyStream.getCandle(time)
    res.json(result)

})
app.get("/trades", async (req, res) => {
    (req);
    const trades = []
    const result = await walletStream.getAll();
    for (let i = 0; i < result.length; i++) {
        const a = JSON.parse(result[i])
        a["id"] = i
        trades.push(a)
    }
    res.json(trades)
})
app.listen(PORT, () => {
    bus.publish("Mohsen/start", PORT)
    console.log(`tomcat listening on port ${PORT} ...`);
});