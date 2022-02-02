import { ServiceBase } from '/_models/service-base.js'

class TransactionsService {
    constructor(host, apiKey) {
        this.api = new ServiceBase(host);
        // this.apiKey = apiKey;
    }

    async myTransactions(token) {
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        return this.api.get('me/transactions', myHeaders);
    }

    async filterExtratoDate(token, begin, end, title) {
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        var body = {}
        begin !== '' ? body.begin = new Date(begin).toISOString() : null;
        end !== null ? body.end = new Date(end).toISOString() : null;
        title !== '' ? body.title = title : body.title = '';

        return this.api.post(`me/transactions/filters`, body, myHeaders
        );
    }
}

window.TransactionsService = TransactionsService;

export { TransactionsService }