import { ServiceBase } from '/_models/service-base.js'

class OptionService {
    constructor(host, apiKey) {
        this.api = new ServiceBase(host);
        // this.apiKey = apiKey;
    }

    async getOptions() {
        return this.api.get('options');
    }
}

window.OptionService = OptionService;

export { OptionService }