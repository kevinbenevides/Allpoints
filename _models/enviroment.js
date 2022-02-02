class Environment
{
    constructor()
    {
        if (
            window.location.host.indexOf("localhost") !== -1 ||
            window.location.host.indexOf("127.168.0.1") !== -1 ||
            window.location.host.indexOf("127.0.0.1") !== -1 ||
            window.location.host.indexOf("192.168") !== -1
        )
        {
            this.env = "local";
        }
        else if (window.location.host.indexOf("dev") !== -1)
        {
            this.env = "dev";
        }
        else if (window.location.host.indexOf("stage") !== -1)
        {
            this.env = "stage";
        }
        else if (window.location.host.indexOf("live") !== -1 || window.location.host.indexOf("www") !== -1)
        {
            this.env = "live";
        }

        // this.env = "live";
    }

    Keys()
    {
        let keys = {};

        if (this.GetEnv() == "dev" || this.GetEnv() == "local")
        {
            keys.messages = 'a7603c97a36f7c114d81855685c18c33';
            keys.gateway = '748f5214bd4abf44e6982e902b84725f';
        }

        if (this.GetEnv() == "stage")
        {
            keys.messages = 'f3103c97a36f7c114d81855685c18c77';
            keys.gateway = 'f57192f8b164539fdc591d49b6e9b301'
        }


        if (this.GetEnv() == "live")
        {
            keys.messages = 'a7603c97a36f7c114d81855685c18c33';
            keys.gateway = '748f5214bd4abf44e6982e902b84725f';
        }

        return keys;
    }

    URIs()
    {

        let uris = {};

        if (this.GetEnv() == "dev" || this.GetEnv() == "local")
        {
            uris.objects = "objects";
            uris.sapiens = "sapiens";
            uris.auth_sapiens = "";
            uris.keys = "keys";
            uris.identity = "https://allpoints-id-dev.azurewebsites.net";
            uris.files = "files";
            uris.graph = "https://graph.microsoft.com/v1.0/me/photo/$value";
            uris.passport = "passport";
            uris.gateway = "https://allpoints-api-dev.azurewebsites.net";
            uris.microsoftAuth = "";
            uris.facebookAuth = "";
            uris.googleAuth = "";
            uris.blob = "";
            uris.mineralBlob = "";
            uris.mineral = "";
            uris.messages = "https://allpoints-messages-api-dev.azurewebsites.net";
            uris.messagesApiKey = "a7603c97a36f7c114d81855685c18c33";
            uris.iuguAccountId = "63089365B5374105A2CFCD82EBEACBE8";
        }

        if (this.GetEnv() == "stage")
        {
            uris.objects = "objects";
            uris.sapiens = "sapiens";
            uris.auth_sapiens = "";
            uris.keys = "keys";
            uris.identity = "https://id.allpoints.club";
            uris.files = "files";
            uris.graph = "https://graph.microsoft.com/v1.0/me/photo/$value";
            uris.passport = "passport";
            uris.gateway = "https://api.allpoints.club";
            uris.microsoftAuth = "";
            uris.facebookAuth = "";
            uris.googleAuth = "";
            uris.blob = "";
            uris.mineralBlob = "";
            uris.mineral = "";
            uris.messages = "https://allpoints-messages-api-stage.azurewebsites.net";
            uris.messagesApiKey = "f3103c97a36f7c114d81855685c18c77",
                uris.iuguAccountId = "63089365B5374105A2CFCD82EBEACBE8"
        }

        if (this.GetEnv() == "live")
        {
            uris.objects = "objects";
            uris.sapiens = "sapiens";
            uris.auth_sapiens = "";
            uris.keys = "keys";
            uris.identity = "https://id.allpoints.club";
            uris.files = "files";
            uris.graph = "https://graph.microsoft.com/v1.0/me/photo/$value";
            uris.passport = "passport";
            uris.gateway = "https://api.allpoints.club";
            uris.microsoftAuth = "";
            uris.facebookAuth = "";
            uris.googleAuth = "";
            uris.blob = "";
            uris.mineralBlob = "";
            uris.mineral = "";
            uris.messages = "https://allpoints-messages-live.azurewebsites.net";
            uris.messagesApiKey = "f3103c97a36f7c114d81855685c18c77";
            uris.iuguAccountId = "63089365B5374105A2CFCD82EBEACBE8";
        }

        return uris;
    }

    GetEnv()
    {
        return this.env;
    }

    SetLocalStorage(item, value, isJson = false)
    {

        if (isJson)
        {
            const stringified = JSON.stringify(value);

            localStorage.setItem(item + '-' + this.GetEnv(), stringified);
        }
        else
        {
            localStorage.setItem(item + '-' + this.GetEnv(), value);
        }

    }

    DeleteLocalStorage(item)
    {
        localStorage.removeItem(item + '-' + this.GetEnv());
    }

    GetLocalStorage(item, isJson = false)
    {

        if (isJson)
        {
            const stringfied = localStorage.getItem(item + '-' + this.GetEnv());

            return JSON.parse(stringfied);

        }
        else
        {
            return localStorage.getItem(item + '-' + this.GetEnv());
        }

    }
}

window.markerConfig = {
    destination: '60c279799743567dcce4f9fa',
};

! function (e, r, a)
{
    if (!e.Marker)
    {
        e.Marker = {};
        var t = [],
            n = { __cs: t };
        ["show", "hide", "isVisible", "capture", "cancelCapture", "unload", "reload", "isExtensionInstalled", "setReporter", "on", "off"].forEach(function (e)
        {
            n[e] = function ()
            {
                var r = Array.prototype.slice.call(arguments);
                r.unshift(e), t.push(r)
            }
        }), e.Marker = n;
        var s = r.createElement("script");
        s.async = 1, s.src = "https://edge.marker.io/latest/shim.js";
        var i = r.getElementsByTagName("script")[0];
        i.parentNode.insertBefore(s, i)
    }
}(window, document);

(function (h, o, t, j, a, r)
{
    h.hj = h.hj || function ()
    {
        (h.hj.q = h.hj.q || []).push(arguments)
    };
    h._hjSettings = { hjid: 2437324, hjsv: 6 };
    a = o.getElementsByTagName('head')[0];
    r = o.createElement('script');
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
})(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
// new Environment().CheckStuff();

window.userSignOut = function ()
{
    var cookies = localStorage.getItem("accepted_cookies");

    localStorage.clear();

    if (cookies)
    {
        localStorage.setItem("accepted_cookies", cookies);
    }

};

window.Environment = Environment;
export { Environment }