import { ServiceBase } from '/_models/service-base.js'
import { UserService } from '/_models/user/user-service.js'
import { Environment } from '/_models/enviroment.js';

var env = new Environment();
class Auth
{
    constructor(host, apiKey)
    {
        this.api = new ServiceBase(host);
        this.user = new UserService(host);
        // this.apiKey = apiKey;
    }

    async authVerify(token)
    {
        var response = await this.user.meInfo(token);

        if (response == 401)
        {
            env.DeleteLocalStorage("token");
            env.DeleteLocalStorage("user");
            localStorage.setItem('expired-token', true)
            window.location.href = '/login'
        }
        else
        {
            return
        }
    }

    async isLogged(token)
    {
        var response = await this.user.meInfo(token);

        return response != 401;
    }

}

window.Auth = Auth;

export { Auth }