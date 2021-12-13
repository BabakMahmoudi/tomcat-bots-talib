import tomcat from '@gostarehnegar/tomcat'
import { CCXTExchange } from '@gostarehnegar/tomcat/build/main/lib/exchanges'

export class Trade {
    constructor(public amount: number, public price: number, public side, public time: number, public balance: number, public pnl: number = 0, public fee: number = 0) {
    }
}
const bus = tomcat.Infrastructure.Bus.RedisBus.Bus
tomcat.config.data.redis.publicUrl = "redis://localhost:6379"

export class TradeCollection {
    public items: Trade[] = []
    getPNL() {
        let pnl = 0
        if (this.items.length > 0) {
            this.items.map(x => {
                pnl += x.pnl
            })
        }
        return pnl
    }
}
export class Wallet {
    public trades: TradeCollection = new TradeCollection()
    public stream;
    public ccxtExchange: CCXTExchange;
    constructor(public initialBalance: number, public streamName: string) {
        this.ccxtExchange = new CCXTExchange('coinex', 'spot')
        this.stream = new tomcat.Domain.Streams.Stream<Trade>(streamName)
    }
    get Balance() {
        return this.initialBalance + this.trades.getPNL()
    }
    buy(price: number, time) {
        const trade = new Trade(this.Balance / price, price, "buy", time, this.Balance)
        this.trades.items.push(trade)
        this.stream.write(trade.time, trade)
    }
    sell(price: number, time: number) {
        const trade = new Trade(this.trades.items[this.trades.items.length - 1].amount, price, "sell", time, this.Balance)
        trade.pnl = (price - this.trades.items[this.trades.items.length - 1].price) * this.trades.items[this.trades.items.length - 1].amount;
        const buyFee = (this.trades.items[this.trades.items.length - 1].price * this.trades.items[this.trades.items.length - 1].amount) * 0.002
        const sellFee = (price * this.trades.items[this.trades.items.length - 1].amount) * 0.002
        trade.fee = buyFee + sellFee
        this.trades.items.push(trade)
        this.stream.write(trade.time, trade)
    }
    async buyEx(time) {
        if (Math.abs(tomcat.utils.toTimeEx().ticks - time) < 15 * 60 * 1000) {
            const balance = await this.ccxtExchange.getBalance()
            await this.ccxtExchange.buyWithoutPrice("DOGE/USDT", balance["USDT"].free)
            const balanceAfter = await this.ccxtExchange.getBalance()
            bus.publish("bots/mohsen/wallet/buy", { doge: balanceAfter["DOGE"].free, usdt: balanceAfter["USDT"].free, time: new Date().toISOString() })
        }
    }
    async sellEx(time) {
        if (Math.abs(tomcat.utils.toTimeEx().ticks - time) < 15 * 60 * 1000) {
            const balance = await this.ccxtExchange.getBalance()
            await this.ccxtExchange.sell("DOGE/USDT", balance["DOGE"].free)
            const balanceAfter = await this.ccxtExchange.getBalance()
            bus.publish("bots/mohsen/wallet/buy", { doge: balanceAfter["DOGE"].free, usdt: balanceAfter["USDT"].free, time: new Date().toISOString() })
        }
    }
}