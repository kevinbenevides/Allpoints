class ServiceBase
{
    constructor(host)
    {
        this.api = new Api(host);
    }

    async getAsync(endpoint, headers = null)
    {
        var response = await this.api.get(endpoint, headers);

        await response.getAsync();

        return response;
    }

    async get(endpoint, headers = null)
    {
        var response = await this.api.get(endpoint, headers);

        return response;
    }

    async post(endpoint, payload, headers = null)
    {
        var response = await this.api.post(endpoint, payload, headers);

        return response;
    }

    async justPost(endpoint, payload, headers = null)
    {
        return await this.api.justPost(endpoint, payload, headers);
    }

    async justPut(endpoint, payload, headers = null)
    {
        return await this.api.put(endpoint, payload, headers);
    }

    async put(endpoint, payload, headers = null)
    {
        var response = await this.api.put(endpoint, payload, headers);

        return response;
    }

    async postEncoded(endpoint, payload, headers = null)
    {
        var response = await this.api.postEncoded(endpoint, payload, headers);

        return response;
    }

    async getTokenDecoded(token)
    {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c)
        {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }
}

window.ServiceBase = ServiceBase;

export { ServiceBase }