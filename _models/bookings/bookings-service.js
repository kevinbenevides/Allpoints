import {ServiceBase} from '/_models/service-base.js'

class BookingsService{
    constructor(host, apiKey){
        this.api = new ServiceBase(host);
        // this.apiKey = apiKey;
    }

    async myBookings(token){
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        return this.api.get('me/bookings', myHeaders);
    }
}

window.BookingsService = BookingsService;

export {BookingsService}