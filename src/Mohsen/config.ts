import tomcat from "@gostarehnegar/tomcat"

import { Utils } from "./utils"

class Config {
    public INITIALBALANCE
    public LOWERBAND
    public GREENCANDLECOUNT
    public UPPERBAND
    public USERSIFORSELLSIGNALS
    public STARTTIME
    public DATASTREAM
    public INDICATORSTREAM
    public SIGNALSTREAM
    public WALLETSTREAM
    public SYMBOL
    public id
    public conflicts: string[] = []
    public info: string[] = []
    Validate() {
        if (this.INITIALBALANCE) {
            if (Number(this.INITIALBALANCE)) {
                this.INITIALBALANCE == Number(this.INITIALBALANCE)
            } else {
                this.conflicts.push("initial balance must be an integer")
            }
        } else {
            this.INITIALBALANCE = 100
            this.info.push("initial balance not provided, using the default value of 100")
        }
        if (this.LOWERBAND) {
            if (Number(this.LOWERBAND)) {
                this.LOWERBAND == Number(this.LOWERBAND)
            } else {
                this.conflicts.push("lower band must be an integer")
            }
        } else {
            this.LOWERBAND = 10
            this.info.push("lower band not provided, using the default value of 10")
        }
        if (this.GREENCANDLECOUNT) {
            if (Number(this.GREENCANDLECOUNT)) {
                this.GREENCANDLECOUNT == Number(this.GREENCANDLECOUNT)
            } else {
                this.conflicts.push("green candle count must be an integer")
            }
        } else {
            this.GREENCANDLECOUNT = 2
            this.info.push("green candle count not provided, using the default value of 2")
        }
        if (this.UPPERBAND) {
            if (Number(this.UPPERBAND)) {
                this.UPPERBAND == Number(this.UPPERBAND)
            } else {
                this.conflicts.push("upper band must be an integer")
            }
        } else {
            this.UPPERBAND = 90
            this.info.push("upper band not provided, using the default value of 90")
        }
        if (this.USERSIFORSELLSIGNALS) {
            if (this.USERSIFORSELLSIGNALS == "true" || this.USERSIFORSELLSIGNALS) {
                this.USERSIFORSELLSIGNALS = true
            } else if (this.USERSIFORSELLSIGNALS == "false" || !this.USERSIFORSELLSIGNALS) {
                this.USERSIFORSELLSIGNALS = false
            } else {
                this.conflicts.push("you must set true or false for rsi sell strategy")
            }
        } else {
            this.USERSIFORSELLSIGNALS = false
            this.info.push("rsi sell strategy will not be applied")
        }
        if (this.STARTTIME) {
            this.STARTTIME = new Date(this.STARTTIME)
            if (!this.STARTTIME.getTime()) {
                this.conflicts.push("start time is not valid sample : 2020-01-01T12:00:00Z")
            }

        } else {
            this.STARTTIME = Date.UTC(2021, 9, 1, 0, 0, 0, 0)
            this.info.push("starttime was not provided using default time of october 1 2021 00:00:00")
        }
        if (!this.DATASTREAM) {

            this.DATASTREAM = tomcat.utils.randomName("data")
            this.info.push(`data stream was not provided using ${this.DATASTREAM}`)
        }
        if (!this.INDICATORSTREAM) {

            this.INDICATORSTREAM = tomcat.utils.randomName("indicator")
            this.info.push(`indicator stream was not provided using ${this.INDICATORSTREAM}`)
        }
        if (!this.SIGNALSTREAM) {

            this.SIGNALSTREAM = tomcat.utils.randomName("signal")
            this.info.push(`signal stream was not provided using ${this.SIGNALSTREAM}`)
        }
        if (!this.WALLETSTREAM) {
            this.WALLETSTREAM = tomcat.utils.randomName("wallet")
            this.info.push(`wallet stream was not provided using ${this.WALLETSTREAM}`)
        }
        if (this.SYMBOL) {
            Utils.checkSymbol(this.SYMBOL).then((res) => {
                this.SYMBOL = res
            })

        } else {
            this.SYMBOL = "SHIBUSDT"
            this.info.push("symbol not provided using SHIBUSDT")
        }
    }
    from(a) {
        this.DATASTREAM = a.DATASTREAM
        this.GREENCANDLECOUNT = a.GREENCANDLECOUNT
        this.INDICATORSTREAM = a.INDICATORSTREAM
        this.INITIALBALANCE = a.INITIALBALANCE
        this.LOWERBAND = a.LOWERBAND
        this.USERSIFORSELLSIGNALS = a.USERSIFORSELLSIGNALS
        this.SIGNALSTREAM = a.SIGNALSTREAM
        this.STARTTIME = a.STARTTIME
        this.UPPERBAND = a.UPPERBAND
        this.WALLETSTREAM = a.WALLETSTREAM
        this.SYMBOL = a.SYMBOL
        this.id = a.id
    }
}
export const config = new Config()