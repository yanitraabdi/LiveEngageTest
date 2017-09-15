var LPUtils = {
    getDomain : function(account, name) {
        var domains = "api.liveperson.net";
        $.ajax({
            url: "https://" + domains + "/csdr/account/" + account + "/service/" + name + "/baseURI.json?version=1.0",
            //jsonp: "cb",
            jsonpCallback: "setCallback",
            type: "GET",
            //crossDomain: true,
            dataType: "jsonp",
            beforeSend: setHeader,
            success: function(data) {
                console.log(data);
                //LPUtils.login(account, domains)
            },
            error: function() {
                console.log("error get domain")
            }
        });
    },
    login: function (account, logindomain) {
        $.ajax({
            url: "https://" + logindomain + "/api/account/" + account + "/login?v=1.3",
            jsonp: "callback",
            dataType: "jsonp",
            success: idpResp => res(idpResp.jwt)
        });
    },

    agentProfile: function(account, agentID) {
        return new Promise((res, rej) => this.getDomain(account, "acCdnDomain").then(accdnDomain => $.ajax({
            url: `https://${accdnDomain}/api/account/${account}/configuration/le-users/users/${agentID}`,
            jsonp: "cb",
            jsonpCallback: "apCallback",
            cache: true,
            dataType: "jsonp",
            success: accdnResp => res(accdnResp)
        })))
    },

    signup: function(account) {
        return new Promise((res, rej) => this.getDomain(account, "idp").then(idpDomain => $.ajax({
            url: `https://${idpDomain}/api/account/${account}/signup.jsonp`,
            jsonp: "callback",
            dataType: "jsonp",
            success: idpResp => res(idpResp.jwt)
        })))
    },

    // fetch jwt from localstorage or create one
    getJWT: function(account) {
        const localJWT = localStorage.getItem(`${account}-jwt`);
        if (localJWT)
            return Promise.resolve(localJWT);
        else
            return this.signup(account).then(newJWT => {
                localStorage.setItem(`${account}-jwt`, newJWT);
                return Promise.resolve(newJWT);
            });
    },

    clearJWT: function(account) {
        localStorage.removeItem(`${account}-jwt`);
    }
}
// LPUtils.getDomain("qa20971604", "idp").then(r => console.log(r));
// LPUtils.signup("qa20971604").then(r => console.log(r));

class LPWs {
    static connect(url) {
        return new LPWs(url)._connect();
    }

    static connectDebug(url) {
        return new LPWs(url, true)._connect();
    }

    constructor(url, debug) {
        this.reqs = {};
        this.subs = [];
        this.url = url;
        this.debug = debug;
    }

    _connect() {
        return new Promise((resolve, reject) => {
            var ws = new WebSocket(this.url);
            this.ws = ws;
            ws.onopen = () => resolve(this);
            ws.onmessage = (msg) => this.onmessage(msg);
            ws.onclose = (evt) => {
                this.ws = null;
                reject(evt);
            };
        });
    }

    request(type, body, headers) {
        return new Promise((resolve, reject) => {
            var obj = {
                "kind": "req",
                "type": type,
                "body": body || {},
                "id": Math.floor((Math.random() * 1e9)),
                "headers": headers
            };
            this.reqs[obj.id] = (type, code, body) => resolve({
                type: type,
                code: code,
                body: body
            });
            var str = JSON.stringify(obj);
            if (this.debug) console.log("sending: " + str);
            this.ws.send(str);
        })
    }

    onNotification(filterFunc, onNotification) {
        this.subs.push({
            filter: filterFunc,
            cb: onNotification
        });
    }

    toFuncName(reqType) {
        var str = reqType.substr(1 + reqType.lastIndexOf('.'));
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    registerRequests(arr) {
        arr.forEach(reqType=>this[this.toFuncName(reqType)] = (body, headers) =>this.request(reqType, body, headers));
    }

    onmessage(msg) {
        if (this.debug) console.log("recieved: " + msg.data);
        var obj = JSON.parse(msg.data);
        if (obj.kind == "resp") {
            var id = obj.reqId;
            delete obj.reqId;
            delete obj.kind;
            this.reqs[id].call(this, obj.type, obj.code, obj.body);
            delete this.reqs[id];
        } else if (obj.kind == "notification") {
            this.subs.forEach(function (sub) {
                if (sub.filter.call(this, obj)) {
                    sub.cb.call(this, obj.body);
                };
            });
        }
    }
}

function setHeader(xhr) {
    //xhr.setRequestHeader('Authorization', token);
    xhr.setRequestHeader('Accept', 'application/json');
}

function setCallback(data) {
    console.log(data);
}

// LPWs.connect("wss://echo.websocket.org").then(lpws => console.log(`lpws was opened.`));