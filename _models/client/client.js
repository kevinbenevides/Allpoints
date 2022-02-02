const base_authorizationToken = null;

const base_retryDelay = 4000; // In Miliseconds

const base_retryQnt = 3;

class Client {

    constructor(baseUrl, retryDelay = base_retryDelay, retryQnt = base_retryQnt) {

        this.env = new Environment();

        this.baseUrl = baseUrl;

        this.retryDelay = retryDelay;

        this.retryQnt = retryQnt;

        this.http = new Http(this.retryDelay, this.retryQnt);

        this.HandleGateway();

    }

    HandleGateway()
    {

        let uris = this.env.URIs();

        let universum_services = ["keys", "files", "passport", "objects", "mineral", "sapiens", "messages"];

        let universum = false;

        let urn = null;

        for (const service of universum_services) {
            
            if (this.baseUrl == uris[service])
            {
                universum = true;
                
                if (uris[service] != "")
                {
                    urn = "/" + uris[service];
                } else {
                    urn = "";
                }

            }

        }

        if (universum) {
            
            this.baseUrl = new Environment().URIs().gateway + urn;

        }

    }

    AddHeaders(headers)
    {

        let parsedHeaders = new Headers();

        if (headers == null)
        {

            parsedHeaders.append("Content-Type", "application/json");
            
        } else {
            
            for (const key in headers) {
                
                parsedHeaders.append(key, headers[key]);

            }

            if (!parsedHeaders.get("Content-Type"))
            {

                parsedHeaders.append("Content-Type", "application/json");

            }

        }

        return parsedHeaders;

    }

    async PostAsync(endpoint, payload, headers = null, noCors = false, jsonParseResponse = true, jsonStringifyBody = true) {

        try {

            headers = this.AddHeaders(headers);
            return await this.http._post(this.baseUrl + "/" + endpoint, payload, headers, noCors, jsonParseResponse, jsonStringifyBody);
        }
        catch(error) {
            console.log('catch post');
            return error;
        };

    }

    async GetAsync(endpoint, headers = null, noCors = false, jsonParseResponse = true, jsonStringifyBody = true) {

        headers = this.AddHeaders(headers);

        return await this.http._get(this.baseUrl + "/" + endpoint, headers, noCors, jsonParseResponse, jsonStringifyBody);

    }

    async PutAsync(endpoint, _payload, headers = null, noCors = false, jsonParseResponse = true, jsonStringifyBody = true) {

        headers = this.AddHeaders(headers);

        let payload = _payload;

        if (typeof payload == "object")
        {

            if (payload.hasOwnProperty("_ct"))
            {

                delete payload["_ct"];

            }

            if (payload.hasOwnProperty("_ut"))
            {

                delete payload["_ut"];

            }

        }

        return await this.http._put(this.baseUrl + "/" + endpoint, payload, headers, noCors, jsonParseResponse, jsonStringifyBody);

    }

    async DeleteAsync(endpoint, headers = null, noCors = false, jsonParseResponse = true, jsonStringifyBody = true) {

        headers = this.AddHeaders(headers);

        return await this.http._delete(this.baseUrl + "/" + endpoint, headers, noCors, jsonParseResponse, jsonStringifyBody);

    }

    //#region Wait for condition - Start
    async waitGet(endpoint, property, satisfyingValue) {

        return await this.waitCondition(endpoint, "GET", property, satisfyingValue);

    }

    async waitPost(endpoint, payload, property, satisfyingValue) {

        return await this.waitCondition(endpoint, "POST", property, satisfyingValue, payload);

    }

    async waitPut(endpoint, payload, property, satisfyingValue) {

        return await this.waitCondition(endpoint, "PUT", property, satisfyingValue, payload);

    }

    async waitDelete(endpoint, property, satisfyingValue) {

        return await this.waitCondition(endpoint, "DELETE", property, satisfyingValue);

    }

    async waitCondition(endpoint, method, property, satisfyingValue, payload = null) {

        let retry = false;

        const satisfyingValues = satisfyingValue.split("||")
            .map(i => i.trim());

        do {

            if (retry) {

                await new Promise(s => setTimeout(s, this.retryDelay))

            }

            var res;

            switch (method) {

                case "GET":

                    res = await this.get(endpoint);

                    break;

                case "POST":

                    res = await this.post(endpoint, payload);

                    break;

                case "PUT":

                    res = await this.put(endpoint, payload);

                    break;

                case "DELETE":

                    res = await this.delete(endpoint);

                    break;

                default:

                    break;
            }

            retry = true;

            var isSatisfied = false;

            satisfyingValues.map(value => {

                if (res[property] == value) {

                    isSatisfied = true;

                }

            });

        } while (!isSatisfied);

        return res;
    }
    //#endregion Wait for condition - End

}

class Http {

    constructor(retryDelay, retryQnt) {

        this.retryQnt = retryQnt;

        this.retryDelay = retryDelay;

        this.authorization = base_authorizationToken;

    }

    async _post(endpoint, payload, customHeaders, noCors, jsonParseResponse = true, jsonStringifyBody = true) {

        try {
            return await this._fetch("POST", endpoint, this.authorization, payload, customHeaders, noCors, jsonParseResponse, jsonStringifyBody);
        }
        catch(error) {
            throw error;
        }

    }

    async _get(endpoint, customHeaders, noCors, jsonParseResponse = true, jsonStringifyBody = true) {
        return await this._fetch("GET", endpoint, this.authorization, null, customHeaders, noCors, jsonParseResponse, jsonStringifyBody);

    }

    async _put(endpoint, payload, customHeaders, noCors, jsonParseResponse = true, jsonStringifyBody = true) {

        return await this._fetch("PUT", endpoint, this.authorization, payload, customHeaders, noCors, jsonParseResponse, jsonStringifyBody);

    }

    async _delete(endpoint, customHeaders, noCors, jsonParseResponse = true, jsonStringifyBody = true) {

        return await this._fetch("DELETE", endpoint, this.authorization, null, customHeaders, noCors, jsonParseResponse, jsonStringifyBody);

    }

    async _fetch(method, endpoint, authorization, body, customHeaders, noCors, jsonParseResponse = true , jsonStringifyBody = true) {

        const defaultHeaders = {

            'Accept': 'application/json',

            'Content-Type': 'application/json'

        };

        let reqOptions = {

            method: method

        };

        noCors ? reqOptions["mode"] = "no-cors" : reqOptions["mode"] = "cors";

        if (customHeaders != null) {

            reqOptions['headers'] = customHeaders;

            if (customHeaders.get("Content-Type") == "application/x-www-form-urlencoded" ||
                customHeaders.get("Content-Type") == "multipart/formdata") {

                body != null ? reqOptions["body"] = body : null;

            } else {

                if (body)
                {

                    if (jsonStringifyBody)
                    {

                        reqOptions["body"] = JSON.stringify(body);

                    } else {

                        reqOptions["body"] = body;

                    }

                }

                // body != null ? reqOptions["body"] = JSON.stringify(body) : null;

            }

        } else if (method != "GET") { // If method == GET, it doesn't need a header

            reqOptions['headers'] = defaultHeaders;

            if (jsonStringifyBody)
            {

                reqOptions["body"] = JSON.stringify(body);

            } else {

                reqOptions["body"] = body;

            }

            // body != null ? reqOptions["body"] = JSON.stringify(body) : null;

        }

        authorization ? reqOptions['headers']['Authorization'] = "Bearer " + authorization : null;

        let res;

        let retry = 0;

        do {

            if (retry > 0) {

                await new Promise(s => setTimeout(s, this.retryDelay));

            }

            if (retry == this.retryQnt) {

                console.log('cant complete request');
                return false;

            }

            res = await fetch(endpoint, reqOptions);

            retry++;

        } while (!res.ok);

        if (jsonParseResponse) {

            try {

                return await res.clone().json();

            } catch (ex) {

                return res;

            }

        } else {

            return res;

        }

    }

}

class Gateway extends Client {

    constructor(service = null, retryDelay = base_retryDelay, retryQnt = base_retryQnt)
    {

        super(service, retryDelay, retryQnt);

        this.http = new Gateway_Http(this.retryDelay, this.retryQnt);

        if (service)
        {

            this.baseUrl = new Base_Auth().URIs().gateway + "/" + service;

        } else {

            this.baseUrl = new Base_Auth().URIs().gateway;

        }

    }

}

class Gateway_Http extends Http {

    constructor(retryDelay, retryQnt) {
    
        super(retryDelay, retryQnt);

    }

    async _fetch(method, endpoint, authorization, body, customHeaders, noCors, jsonParseResponse = true , jsonStringifyBody = true) {

        const defaultHeaders = {

            'Accept': 'application/json',

            'Content-Type': 'application/json'

        };

        let reqOptions = {

            method: method,

            headers: {}

        };

        noCors ? reqOptions["mode"] = "no-cors" : reqOptions["mode"] = "cors";

        if (customHeaders != null) {

            reqOptions['headers'] = customHeaders;

            if (customHeaders.get("Content-Type") == "application/x-www-form-urlencoded" ||
                customHeaders.get("Content-Type") == "multipart/formdata") {

                body != null ? reqOptions["body"] = body : null;

            } else {

                if (body)
                {

                    if (jsonStringifyBody)
                    {

                        reqOptions["body"] = JSON.stringify(body);

                    } else {

                        reqOptions["body"] = body;

                    }

                }

                // body != null ? reqOptions["body"] = JSON.stringify(body) : null;

            }

        } else if (method != "GET") { 

             // If method == GET, it doesn't need a header
            reqOptions['headers'] = defaultHeaders;

            if (jsonStringifyBody)
            {

                reqOptions["body"] = JSON.stringify(body);

            } else {

                reqOptions["body"] = body;

            }

            // body != null ? reqOptions["body"] = JSON.stringify(body) : null;

        }

        //#region Configurar token de acesso

        // let accessToken = new Bayer.Falcon().Auth.getAccessToken();
        // reqOptions['headers']['Authorization'] = "Bearer " + accessToken;
        
        //#endregion

        let res;

        let retry = 0;

        do {

            if (retry > 0) {

                await new Promise(s => setTimeout(s, this.retryDelay));

            }

            if (retry == this.retryQnt) {

                // new Bayer.Falcon().Auth.logout();
                return;
                // return null;

            }

            res = await fetch(endpoint, reqOptions);

            retry++;

        } while (!res.ok);

        if (jsonParseResponse) {

            try {

                return await res.json();

            } catch (ex) {

                return res;

            }

        } else {

            return res;

        }

    }

}

class Stream_Base_Client {

    constructor(baseUrl, retryDelay = base_retryDelay, retryQnt = base_retryQnt) {

        //super(baseUrl, retryDelay, retryQnt);

        this.baseUrl = baseUrl;

        this.retryDelay = retryDelay;

        this.retryQnt = retryQnt;

        this.http = new Stream_Http(this.retryDelay, this.retryQnt);

    }

    async post(endpoint, payload, headers = null, noCors = false, progressHandler) {

        return await this.http._post(this.baseUrl + "/" + endpoint, payload, headers, noCors, progressHandler);

    }

    async get(endpoint, headers = null, noCors = false, progressHandler) {

        return await this.http._get(this.baseUrl + "/" + endpoint, headers, noCors, progressHandler);

    }

    async put(endpoint, payload, headers = null, noCors = false, progressHandler) {

        return await this.http._put(this.baseUrl + "/" + endpoint, payload, headers, noCors, progressHandler);

    }

    async delete(endpoint, headers = null, noCors = false, progressHandler) {

        return await this.http._delete(this.baseUrl + "/" + endpoint, headers, noCors, progressHandler);

    }

}

class Stream_Http {

    constructor(retryDelay, retryQnt) {

        this.retryQnt = retryQnt;

        this.retryDelay = retryDelay;

        this.authorization = base_authorizationToken;

    }

    async _post(endpoint, payload, customHeaders, noCors, progressHandler) {

        return await this._fetch("POST", endpoint, this.authorization, payload, customHeaders, noCors, progressHandler);

    }

    async _get(endpoint, customHeaders, noCors, progressHandler) {
        return this._fetch("GET", endpoint, this.authorization, null, customHeaders, noCors, progressHandler);

    }

    async _put(endpoint, payload, customHeaders, noCors, progressHandler) {

        return this._fetch("PUT", endpoint, this.authorization, payload, customHeaders, noCors, progressHandler);

    }

    async _delete(endpoint, customHeaders, noCors, progressHandler) {

        return this._fetch("DELETE", endpoint, this.authorization, null, customHeaders, noCors, progressHandler);

    }

    async _fetch(method, endpoint, authorization, body, customHeaders, noCors, progressHandler) {

        const xhr = new XMLHttpRequest();

        xhr.open(method, endpoint, true);

        if (customHeaders)
        {

            for (const key in customHeaders) {

                xhr.setRequestHeader(key, customHeaders[key]);

            }

        }

        xhr.upload.addEventListener("progress", e => {

            let percentage = (100 * e.loaded) / e.total;

            e.status = xhr.status;

            e.percentage = percentage;

            e.done = false;

            e.stringStatus = getStringState(e.percentage);

            progressHandler(e);

        });

        xhr.onreadystatechange = function () {

            if (xhr.readyState === 4) {

                let res = {

                    response: tryParse(xhr.responseText),

                    status: xhr.status,

                    stringState: getStringState(100, xhr.readyState),

                    ok: getStatus(xhr.status)

                };

                progressHandler(res);

            }
        }

        xhr.send(body);

    }

}

class Stream_Gateway extends Stream_Base_Client {

    constructor(service, retryDelay = base_retryDelay, retryQnt = base_retryQnt)
    {

        super(service, retryDelay, retryQnt);

        this.http = new Stream_Gateway_Http(this.retryDelay, this.retryQnt);

        if (service)
        {

            this.baseUrl = new Base_Auth().URIs().gateway + "/" + service;
            
        } else {

            this.baseUrl = new Base_Auth().URIs().gateway;

        }

    }

}

class Stream_Gateway_Http extends Stream_Http {

    constructor(retryDelay, retryQnt)
    {

        super(retryDelay, retryQnt);
    
    }

    async _fetch(method, endpoint, authorization, body, customHeaders, noCors, progressHandler) {

        const xhr = new XMLHttpRequest();
        
        xhr.open(method, endpoint, true);

        if (customHeaders != null)
        {

            for (const key in customHeaders) {

                xhr.setRequestHeader(key, customHeaders[key]);
                
            }

        }

        // xhr.setRequestHeader('Authorization', 'Bearer ' + new Bayer.Falcon().Auth.getAccessToken());

        xhr.upload.addEventListener("progress", e => {

            let percentage = (100 * e.loaded) / e.total;

            e.status = xhr.status;

            e.percentage = percentage;

            e.done = false;

            e.stringStatus = getStringState(e.percentage);

            progressHandler(e);

        });

        xhr.onreadystatechange = function () {

            if (xhr.readyState === 4) {

                let res = {

                    response: tryParse(xhr.responseText),

                    status: xhr.status,

                    stringState: getStringState(100, xhr.readyState),

                    ok: getStatus(xhr.status)

                };

                progressHandler(res);

            }
        }

        xhr.send(body);

    }

}

class Azure_Base_Client extends Stream_Base_Client {

    constructor(baseUrl, sasEndpoint, retryDelay = base_retryDelay, retryQnt = base_retryQnt) {

        super(baseUrl, retryDelay = base_retryDelay, retryQnt = base_retryQnt);

        this.http = new Azure_Http(baseUrl, sasEndpoint, retryDelay, retryQnt);

    }

    async post(endpoint, payload, fileName = null, sasstring = null, headers = null, noCors = false, progressHandler) {

        return await this.http._post(endpoint, payload, fileName, sasstring, headers, noCors, progressHandler);

    }

}

class Azure_Http extends Stream_Http {

    constructor(baseUrl = null, sasEndpoint = null, retryDelay, retryQnt) {

        super(retryDelay, retryQnt);

        this.baseUrl = baseUrl? baseUrl : null;

        this.sasEndpoint = sasEndpoint? sasEndpoint : null;

        this.timestamp = new Date().getTime();

    }

    async _post(endpoint, payload, fileName, sastring, customHeaders, noCors, progressHandler) {

        return await this._fetch("POST", endpoint, fileName, sastring, this.authorization, payload, customHeaders, noCors, progressHandler);

    }

    async _fetch(method, endpoint, _fileName = null, _sastring = null, authorization, body, customHeaders, noCors, progressHandler = function () {}) {

        try {

            let URIs = new Environment().URIs();

            let objects = new Client(URIs.objects, base_retryDelay, base_retryQnt);

            // Get blobUrl
            let blobUrl = this.baseUrl;

            // Get blobUrl's sasString
            if (_sastring)
            {

                var sasString = _sastring;
                
            } else {
                
                // var sasStringRes = await objects.get(this.sasEndpoint);
                // var sasString = sasStringRes[0].key;

            }

            if (endpoint)
            {

                blobUrl += "/" + endpoint;

            }

            // if (_fileName)
            // {
            //     blobUrl += "/" + _fileName;
            // }

            // Instanciate Azure Helper
            const containerURL = new azblob.ContainerURL(blobUrl + sasString, azblob.StorageURL.newPipeline(new azblob.AnonymousCredential));

            let promises = [];

            let filesSize = 0;

            //body.map(async _file => {
            //let file = _file;
            // Filename

            let file = body;

            let fileName = "";
            if (_fileName)
            {

                fileName = _fileName;

            } else {

                fileName = file.name;

            }

            const blockBlobURL = azblob.BlockBlobURL.fromContainerURL(containerURL, fileName);

            promises.push(azblob.uploadBrowserDataToBlockBlob(azblob.Aborter.none, file, blockBlobURL, {

                progress: p => {

                    let percentage = (100 * p.loadedBytes) / filesSize;

                    p.percentage = percentage;

                    p.stringState = getStringState(percentage, 0); // 0 = request in progress

                    progressHandler(p);

                }

            }));

            filesSize += file.size;

            //});

            try {

                await Promise.all(promises);

            } catch (e) {

                console.log("Erro:", e);
                return "error";

            }

            progressHandler({

                percentage: 100,

                stringState: getStringState(100, 4),

                ok: getStatus(200)

            });

        } catch (error) {

            console.log('Error in Azure uploader: ', error);

            progressHandler({

                percentage: 100,

                stringState: getStringState(100, 4),

                ok: getStatus(400)

            });

        }

    }

}

class ObjectsManager extends Client {

    constructor(objectsUri, retryDelay = base_retryDelay, retryQnt = base_retryQnt, createHistoric = false, keysUri = null, currentUser = null, createOnGalileo = false, galileoUri = null) {
        super(objectsUri, retryDelay, retryQnt);

        this.objects = new Client(objectsUri);

        this.createHistoric = createHistoric;

        this.keys = null;

        this.currentUser = null;

        this.galileo = null;

        if (createHistoric == true) {

            if (keysUri == null || currentUser == null) {

                console.log("(Constructor) - The option of creating historic is enabled but requirements are missing, check if you passed correctly the Keys Uri and the Current User.");

                return {

                    message: "(Constructor) - The option of creating historic is enabled but requirements are missing, check if you passed correctly the Keys Uri and the Current User."

                };

            }

            this.currentUser = currentUser;

            this.keys = new Gateway(keysUri);

        }

        if (createOnGalileo == true) {

            if (galileoUri == null) {

                console.log("(Constructor) - The option of creating mirrored object in Galileo is enabled but requirements are missing, check if you passed correctly the Galileo Uri.");

                return {

                    message: "(Constructor) - The option of creating mirrored object in Galileo is enabled but requirements are missing, check if you passed correctly the Galileo Uri."

                };

            }

            this.galileo = new Gateway(galileoUri);

        }

    }

    // Managing Objects - Start
    async Create_edge(source, target, sourcePropName) {

        if(source.id == undefined || target.id == undefined)
            alert(`Problem getting ${source.id == undefined ? 'source identification' : 'source identification'}`)

        return await this.objects.PostAsync(source._pk + "/" + source.id +  "/addE/" + sourcePropName + "/to/" + target._pk + "/" + target.id);
        // return await this.objects.PostAsync(source._pk + "/" + source.id + "/" + sourcePropName + "/to/" + target._pk + "/" + target.id);

    }

    async Update_edge(source, target, propName) {

        return await this.objects.PutAsync(source._pk + "/" + source.id + "/" + propName + "/to/" + target._pk + "/" + target.id);

    }

    async Update_obj(oldObj, obj, createHistoric = false, createInGalileo = false) {

        const couldNotFindCurrentUser = {

            message: "The option of creating historic is enabled but requirements are missing, check if you passed correctly de Keys Uri and the Current User in the class Constructor."

        }

        const errorInPrimaryObject = {

            message: "Impossible to update items, _pk or Object Id Missing."

        };

        const errorInEdges = {

            message: "An Error ocurred in one of the edges, please check if all of them have an '_pk' and 'id' property"

        };

        if (createHistoric == true) {

            if (this.keys == null || this.currentUser == null) {

                return {

                    message: couldNotFindCurrentUser

                };

            }

        }

        if (createInGalileo == true) {

            if (this.galileo == null) {

                return {

                    message: "The option of creating mirrored object in Galileo is enabled but requirements are missing, check if you passed correctly the Galileo Uri."

                };

            }

        }

        let responses = [];

        const objPartition = obj._pk;

        const objId = obj.id;

        if (!objPartition || !objId) {

            return errorInPrimaryObject;

        }

        //Get Edges and Properties

        let edgeValues = [];

        let upToDateObj = {};

        let updateMainObject = false;

        let updates = [];

        let errorOcurred = false;

        for (const key in obj) {

            if (key == "id" || key == "_pk" || key == "_ct") {

                continue;

            }

            if (isObject(obj[key])) {

                if (isValidObject(obj[key])) {

                    // Check if value has to be updated
                    if (obj[key].name != oldObj[key].name) {

                        edgeValues = [...edgeValues, {

                            propName: key,

                            value: obj[key]

                        }];

                        updates = [...updates, {

                            propName: key,

                            oldValue: oldObj[key].name,

                            newValue: obj[key].name

                        }];

                    }

                } else {

                    errorOcurred = true;

                }

            } else if (!isArray(obj[key])) {

                if (obj[key] != oldObj[key]) {
                    updateMainObject = true;

                    upToDateObj[key] = obj[key];

                    updates = [...updates, {

                        propName: key,

                        oldValue: oldObj[key],

                        newValue: obj[key]

                    }];

                }

            }

        }

        if (errorOcurred) {

            return errorInEdges;

        }

        // Updating Edges
        const edgesResponse = await Promise.all(edgeValues.map(async edge => {

            return await this.Update_edge(obj, edge.value, edge.propName);

        }));

        responses = [...responses, {

            resName: "edgesResponse",

            resValue: edgesResponse

        }];

        // Update Object Properties
        if (updateMainObject) {

            const objectResponse = await this.objects.PutAsync(objPartition + "/" + objId, upToDateObj);

            responses = [...responses, {

                resName: "objectResponse",

                resValue: objectResponse

            }];

        }

        // Create Historic of Alterations
        if (createHistoric) {

            var historicRes = await Promise.all(updates.map(async update => {

                let payload = {

                    oldValue: update.oldValue,

                    newValue: update.newValue,

                    by: typeof this.currentUser == "object" ? JSON.stringify(this.currentUser) : this.currentUser

                };

                return await this.keys.PostAsync(objPartition + "." + objId + "/" + update.propName + "/" + new Date().getTime(), payload);

            }));

            responses = [...responses, {

                resName: "historicRes",

                resValue: historicRes

            }];

        }

        // Create Mirrored Items in Galileo
        if (createInGalileo) {

            let galileoPayload = {};

            updates.map(update => {

                galileoPayload[update.propName] = update.newValue;

            });

            galileoPayload["_ut"] = new Date().toJSON();

            let galileoRes = await this.galileo.PutAsync(objPartition, galileoPayload);

            responses = [...responses, {

                resName: "galileoRes",

                resValue: galileoRes

            }];
        }

        return responses;

    }

    async Exists(endpoint) {

        let res = await this.objects.GetAsync(endpoint);

        let exists = this.valid(res, true);

        return exists;

    }

    /**
     * 
     * @param {*} obj Any Object or Array
     * @param {*} shouldReturnObj Boolean value, if true, returns a valid object, if false, only returns 'true' or 'false'
     */
    valid(obj, shouldReturnObj = false) {

        if (Array.isArray(obj)) {

            if (obj.length == 0) {
                if (shouldReturnObj) {
                    return null;

                } else {

                    return false;
                }
            }

            if (shouldReturnObj) {
                return obj[0];
            } else {
                return true;
            }

        } else {

            if (obj == null || obj == undefined) {
                if (shouldReturnObj) {
                    return null;
                } else {
                    return false;
                }
            }

            if (shouldReturnObj) {
                return obj;
            } else {
                return true;
            }

        }

}
    // Managing Objects - End

}

// Helpers
function isObject(value) {

    if (!Array.isArray(value) && typeof value == "object") return true;
    else return false;

}

function isArray(value) {

    if (Array.isArray(value)) return true;
    else return false;

}

function isValidObject(obj) {

    if (!obj._pk || !obj.id) {

        return false;

    } else {

        return true;

    }

}

function getStatus(status) {

    if (status.toString()[0] == 2) {

        return true;

    } else {

        return false;

    }

}

function getStringState(percentage, readyState = 0) {

    if (percentage < 100) {

        return "pending";

    } else if (readyState == 4) {

        return "concluded";

    } else {

        return "pending";

    }

}

function tryParse(responseText) {

    try {

        return JSON.parse(responseText);

    } catch {

        return responseText;

    }

}

function getParsedFileName(_fileName, _timestamp) {

    let parsedFileName = _fileName.replace(/ /g, "");

    //let timestamp = _timestamp;

    //parsedFileName = timestamp + "-" + parsedFileName;

    return parsedFileName;

}