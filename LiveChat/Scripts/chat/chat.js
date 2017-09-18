var globalToken = "";
var test = "";

$(document).ready(function () {
    $("#panelLogin").show();
    $("#panelTable").hide();

    $("#btn-login").unbind().click(function () {

        if ($("#tbAccountNumber").val() == "" || $("#tbUsername").val() == "" || $("#tbPassword").val() == "") {
            alert("please insert detail");
            return false;
        }

        chat.login($("#tbAccountNumber").val(), $("#tbUsername").val(), $("#tbPassword").val());

        return false;
    });
})

var chat = {
    login: function (accountnumber, username, password) {
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/login?v=1.3",
                method: "POST",
                body: '{ "username" : "' + username + '", "password" : "' + password + '"  }',
                token: ""
            },
            success: function (data) {
                var parsedData = JSON.parse(data);

                $("#spanName").text(parsedData.config.loginName);

                globalToken = parsedData.bearer;

                chat.agentsession(accountnumber, globalToken);

                $("#panelLogin").hide();
                $("#panelTable").show();
            },
            error: function () {
                console.log("Login Error (API)")
            }
        });
    },
    agentsession: function (accountnumber, token) {
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession?v=1&NC=true",
                method: "POST",
                body: '{ "loginData": ""  }',
                token: token
            },
            success: function (data) {
                var parsedData = JSON.parse(data);

                test = parsedData.agentSessionLocation.link["@href"].split("/")[parsedData.agentSessionLocation.link["@href"].split("/").length - 1];

                console.log(test);

                //var agentSessionId = 
            },
            error: function () {
                console.log("agentsession Error (API)")
            }
        });
    },
    chatlist: function () {  // ini pakai API di halaman https://developers.liveperson.com/agent-retrieve-data.html
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/login?v=1.3",
                method: "GET",
                body: "",
                token: ""
            },
            success: function (data) {
                console.log(JSON.parse(data));
            },
            error: function () {
                console.log("Login Error (API)")
            }
        });
    },
    incomingchatrequest: function (accountnumber, agentsessionid) {
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentsessionid + "/incomingRequests?v=1&NC=true",
                method: "GET",
                body: "",
                token: ""
            },
            success: function (data) {
                console.log(JSON.parse(data));
            },
            error: function () {
                console.log("Login Error (API)")
            }
        });
    },
    sendmessage: function (accountnumber, agentsessionid, chatid) {
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentsessionid + "/chat/" + chatid + "/info/events?v=1&NC=true",
                method: "POST",
                body: '{ "event": { "@type": "line", "text": "<div dir="ltr" style="direction: ltr; text-align: left;">this is a line of text</div>", "textType": "html"  }',
                token: ""
            },
            success: function (data) {
                console.log(JSON.parse(data));
            },
            error: function () {
                console.log("Login Error (API)")
            }
        });
    },
    chatsessions: function (accountnumber, agentsessionid) {
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentsessionid + "chatSessions?v=1&NC=true",
                method: "GET",
                body: "",
                token: ""
            },
            success: function (data) {
                console.log(JSON.parse(data));
            },
            error: function () {
                console.log("Login Error (API)")
            }
        });
    },
    retrievevisitorname: function (accountnumber, agentsessionid, chatid) {
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentsessionid + "/chat/" + chatid + "/info/visitorName?v=1&NC=true",
                method: "GET",
                body: "",
                token: ""
            },
            success: function (data) {
                console.log(JSON.parse(data));
            },
            error: function () {
                console.log("retrievevisitorname Error (API)")
            }
        });
    }
}