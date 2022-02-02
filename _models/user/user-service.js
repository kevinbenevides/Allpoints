import { ServiceBase } from '/_models/service-base.js'

class UserService {
    constructor(host, apiKey) {
        this.api = new ServiceBase(host);
        this.apiKey = apiKey;
    }

    async createUser(payload, type = null, accessKey) {
        if (type == "identity") {
            var response = await this.api.post('api/users', payload);
        } else {
            var response = await this.api.post('accounts/create/' + accessKey, payload);
        }

        return response;
    }

    async login(payload, type = 'email') {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        var urlencoded = new URLSearchParams();

        switch (type) {
            case 'email':
                urlencoded.append("username", payload.email);
                break;
            case 'phone':
                urlencoded.append("username", payload.phone);
                break;
            case 'cpf':
                urlencoded.append("username", payload.cpf);
                break
            default:
                break;
        }

        urlencoded.append("password", payload.password);
        urlencoded.append("scope", "user_profile_read user_profile_write user_subscriptions_read user_booking_read user_booking_write user_transaction_read user_transaction_write");
        urlencoded.append("client_id", "84532333874433681");
        urlencoded.append("client_secret", "d18bbfb73450d2955bc697480eaee9f4");
        urlencoded.append("grant_type", "password");

        var response = await this.api.postEncoded('connect/token', urlencoded, myHeaders);

        return response;
    }

    async meInfo(token) {
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        return this.api.get('me', myHeaders);
    }

    async validateEmail(email) {
        return this.api.get('users/find/email/' + email);
    }

    async validateCPF(cpf) {
        return this.api.get('users/find/cpf/' + cpf);
    }

    async validatePhone(phone) {
        return this.api.get('users/find/phone/' + phone);
    }

    async changeUser(payload, token) {
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        var response = await this.api.put('me/change', payload, myHeaders);
        return response
    }

    async expireAllpoints(token) {
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        return this.api.get('me/transactions/expire-points', myHeaders);
    }

    async postPicture(file, extencion) {
        var myHeaders = {
            "Content-Type": "image/" + extencion,
            "api-key": '748f5214bd4abf44e6982e902b84725f'
        }
        var response = await this.api.post('users/picture/' + file, file, myHeaders);
        return response
    }

    async isCodeValid(key, value, code, param = key) {
        var response = await this.api.justPost('accounts/request-confirmation/' + key + "/validate",
            {
                [param]: value,
                code: code
            });

        return response.status == 204;
    }

    async requestEmailConfirmation(value) {
        return await this.requestConfirmation("email", value)
    }

    async requestPhoneConfirmation(value) {
        return await this.requestConfirmation("phone", value)
    }

    async requestConfirmation(key, value) {
        return await this.api.post('accounts/request-confirmation/' + key,
            {
                [key]: value
            });
    }

    async codeChangePassword(payload) {

        var response = await this.api.post('accounts/reset-password', payload);

        return response;
    }

    async changePassword(payload) {
        var response = await this.api.put('accounts/reset-password', payload);

        return response;
    }

    async registerLead(payload){
        var response = await this.api.post('leads', payload);

        return response;
    }
}

window.UserService = UserService;

export { UserService }