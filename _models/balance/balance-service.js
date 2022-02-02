import {ServiceBase} from '/_models/service-base.js'

class BalanceService{
    constructor(host, apiKey){
        this.api = new ServiceBase(host);
        // this.apiKey = apiKey;
    }

    async myBalance(token){
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        return this.api.get('me/balance', myHeaders);
    }

}

window.BalanceService = BalanceService;

export {BalanceService}