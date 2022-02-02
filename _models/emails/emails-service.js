import {ServiceBase} from '/_models/service-base.js'

class EmailService{
    constructor(host, apiKey){
        this.api = new ServiceBase(host);
        this.apiKey = apiKey;
    }

    async postEmail(templateId, payload){
        return this.api.post('mail/templates/'+ templateId + '?api_key=' + this.apiKey, payload);
    }
}

window.EmailService = EmailService;

export {EmailService}