import tomcat from "@gostarehnegar/tomcat"

(async () => {
    const port = 8081;
    const client = tomcat.hosts.getHostBuilder('client')
        .addMessageBus(cfg => {
            cfg.endpoint = "clinet";
            cfg.transports.websocket.url = `http://localhost:${port}/hub`;
        })
        .addMeshService(service)
        .addMeshNode((cfg) => {
            cfg.executeservice = null
            cfg.queryService = null
            cfg.serviceCapability = null
        })
        .build();
    await client.start()
    await tomcat.utils.delay(5000)
    const res = await client.bus
        .createMessage(
            tomcat.Infrastructure.Contracts.requireService(
                {
                    category: "data",
                    parameters: {
                        "interval": '1m',
                        "market": "spot",
                        "exchange": "coinex",
                        "symbol": "BTC/USDT"
                    }
                }
            ))
        .execute(null, 20000, true);
    const response = await client.bus.createMessage(tomcat.Domain.Contracts.requestData({ count: 40, exchange: 'coinex', interval: '1m', market: "spot", symbol: 'BTC/USDT', time: null })).execute();
    console.log(response);
    (res)
})();