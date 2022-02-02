class Api
{
    constructor(host)
    {
        this.host = host;
        this.env = new Environment();
    }

    _defaultHeaders(customHeaders)
    {
        var headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "api-key": this.env.Keys().gateway
        };

        if (customHeaders != null)
        {
            if (customHeaders?.Authorization)
            {
                headers.Authorization = customHeaders.Authorization

                return headers;
            }

            return customHeaders;
        }

        return headers;
    }

    async post(endpoint, data = null, headers = null)
    {
        var options = {
            method: "POST",
            headers: this._defaultHeaders(headers)
        }

        if (data)
        {
            options.body = JSON.stringify(data);
        }

        this.HandleGateway()

        var response = await fetch(this.host + "/" + endpoint, options);

        return response.json();
    }

    async justPost(endpoint, data = null, headers = null)
    {
        var options = {
            method: "POST",
            headers: this._defaultHeaders(headers)
        }

        if (data)
        {
            options.body = JSON.stringify(data);
        }

        return await fetch(this.host + "/" + endpoint, options);
    }

    async postEncoded(endpoint, data = null, headers = null)
    {
        var options = {
            method: "POST",
            headers: headers,
            body: data
        }

        this.HandleGateway()

        var response = await fetch(this.host + "/" + endpoint, options);

        return response.json();
    }

    async get(endpoint, headers = null)
    {
        this.HandleGateway()

        var response = await fetch(this.host + "/" + endpoint, {
            method: 'GET',
            headers: this._defaultHeaders(headers)
        });

        if (response.status == 200)
        {
            return response.json();
        } else
        {
            return response.status
        }
    }

    async put(endpoint, data = null, headers = null)
    {
        var options = {
            method: "PUT",
            headers: this._defaultHeaders(headers),
            body: data
        }

        if (data)
        {
            options.body = JSON.stringify(data);
        }

        this.HandleGateway()

        var response = await fetch(this.host + "/" + endpoint, options);

        return response
    }

    async justPut(endpoint, data = null, headers = null)
    {
        var options = {
            method: "PUT",
            headers: this._defaultHeaders(headers),
            body: data
        }

        if (data)
        {
            options.body = JSON.stringify(data);
        }

        this.HandleGateway()

        return await fetch(this.host + "/" + endpoint, options);
    }

    HandleGateway()
    {

        let uris = this.env.URIs();

        let universum_services = ["keys", "files", "passport", "objects", "mineral", "sapiens", ""];

        let universum = false;

        let urn = null;

        for (const service of universum_services)
        {

            if (this.host == uris[service])
            {
                universum = true;

                if (uris[service] != "")
                {
                    urn = "/" + uris[service];
                } else
                {
                    urn = "";
                }

            }

        }

        if (universum)
        {

            this.host = new Environment().URIs().gateway + urn;

        }

    }
}

window.Api = Api;

export { Api };