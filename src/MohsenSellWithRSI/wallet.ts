import tomcat from '@gostarehnegar/tomcat'

export class Trade {
    constructor(public amount: number, public price: number, public side, public time: number, public balance: number, public pnl: number = 0) {
    }
}

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
    constructor(public initialBalance: number, public streamName: string) {
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
        trade.pnl = (price - this.trades.items[this.trades.items.length - 1].price) * this.trades.items[this.trades.items.length - 1].amount
        this.trades.items.push(trade)
        this.stream.write(trade.time, trade)
    }
}