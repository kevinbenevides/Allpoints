import { ServiceBase } from '/_models/service-base.js'

class PromosService {
    constructor(host, apiKey) {
        this.api = new ServiceBase(host);
        // this.apiKey = apiKey;
    }

    async getPromos() {
        return this.api.get('promos');
    }
}

window.PromosService = PromosService;

export { PromosService }