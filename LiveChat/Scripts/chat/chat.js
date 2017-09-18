var globalToken = "";
var agentSession = "";
var accountNumber = "";

$(document).ready(function () {
    if (globalToken == "" && agentSession == "") {
    $("#panelLogin").show();
    $("#panelTable").hide();
    }
    else {
        $("#panelLogin").hide();
        $("#panelTable").show();
    }

    $("#btn-login").unbind().click(function () {

        if ($("#tbAccountNumber").val() == "" || $("#tbUsername").val() == "" || $("#tbPassword").val() == "") {
            alert("please insert detail");
            return false;
        }

        chat.login($("#tbAccountNumber").val(), $("#tbUsername").val(), $("#tbPassword").val());

        return false;
    });

    $("#btn-accept-chat").unbind().click(function () {
        chat.acceptchatrequest(accountNumber, agentSession);
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
                accountNumber = accountnumber;

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

                agentSession = parsedData.agentSessionLocation.link["@href"].split("/")[parsedData.agentSessionLocation.link["@href"].split("/").length - 1];
                chat.incomingchatrequest(accountnumber, agentSession);

                chat.chatsessions(accountnumber, agentSessionId);
            },
            error: function () {
                console.log("agentsession Error (API)")
            }
        });
    },
    chatlist: function (accountnumber, chatSessionKeys) {  // ini pakai API di halaman https://developers.liveperson.com/agent-retrieve-data.html
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentSessionId + "/chat?chatSessionKeys=" + chatSessionKeys,
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
                token: globalToken
            },
            success: function (data) {
                var incomingData = JSON.parse(data);
                $("#no-incoming").text(incomingData.incomingRequests.ringingCount);
                if (parseInt(incomingData.incomingRequests.ringingCount) > 0) {
                    $("#btn-accept-chat").prop("disabled", false);
                }
                else {
                    $("#btn-accept-chat").prop("disabled", true);
                }
                setTimeout(function () { chat.incomingchatrequest(accountnumber, agentsessionid); }, 1000);
                console.log(JSON.parse(data));
            },
            error: function () {
                console.log("Incoming Chat Request Error (API)")
                setTimeout(function () { chat.incomingchatrequest(accountnumber, agentsessionid); }, 1000);
            }
        });
    },
    acceptchatrequest: function (accountnumber, agentsessionid) {
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentsessionid + "/incomingRequests?v=1&NC=true",
                method: "POST",
                body: "",
                token: globalToken
            },
            success: function (data) {
                console.log(JSON.parse(data));
            },
            error: function () {
                console.log("Accept Chat Error (API)")
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
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentsessionid + "/chatSessions?v=1&NC=true",
                method: "GET",
                body: "",
                token: globalToken
            },
            success: function (data) {
                var parsedData = JSON.parse(data);

                console.log(parsedData);

                var arrChatSession = [];

                $.each(parsedData.chatSessions.chatSession, function(i, obj){
                    //arrChatSession.push(parsedData.chatSessions.chatSessions[i].chatSessionKey);
                    console.log(obj);
                })

                //console.log(arrChatSession);


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