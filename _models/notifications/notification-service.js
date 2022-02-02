import {ServiceBase} from '/_models/service-base.js'

class NotificationService{
    constructor(host, apiKey){
        this.api = new ServiceBase(host);
        this.apiKey = apiKey;
    }

    async myNotifications(token){
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        return this.api.get('me/notifications?api_key=748f5214bd4abf44e6982e902b84725f', myHeaders );
    }

    async notificationSeen(notification_id, token){
        var payload = {
            "seen": true
        };
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        return this.api.put('me/notifications/' + notification_id + '/seen?api_key=748f5214bd4abf44e6982e902b84725f', payload, myHeaders  );
    }
    
}

window.NotificationService = NotificationService;

export {NotificationService}