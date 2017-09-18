var globalToken = "";
var agentSessionId = "";
var accountNumber = "";

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

                agentSessionId = parsedData.agentSessionLocation.link["@href"].split("/")[parsedData.agentSessionLocation.link["@href"].split("/").length - 1];

                console.log(agentSessionId);

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
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentSessionId + "/chat?chatSessionKeys=" + chatSessionKeys + "&v=1&NC=true",
                method: "GET",
                body: "",
                token: globalToken
            },
            success: function (data) {
                var parsedData = JSON.parse(data);

                console.log(JSON.parse(data));

                var divChatList = document.getElementById("divChatList");

                $.each(parsedData.chats.chat, function(i, obj) {
                    divChatList.innerHTML += '<li class="left clearfix" id="' + obj.info.chatSessionKey + '"><span class="chat-img pull-left"><img src="http://www.joomilak.com/media/com_easydiscuss/images/default_avatar.png" alt="User Avatar" class="img-circle"></span><div class="chat-body clearfix" ><div class="header_sec"><strong class="primary-font">' + obj.info.visitorName + '</strong> <strong class="pull-right">' + moment(obj.info.lastUpdate).format("HH:mm") + '</strong></div><div class="contact_sec"><strong class="primary-font">(123) 123-456</strong> <span class="badge pull-right">3</span></div>';
                });                
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
                token: globalToken
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

                $.each(parsedData.chatSessions.chatSession, function (i, obj) {
                    arrChatSession.push(obj.chatSessionKey);
                })

                var joinArray = arrChatSession.join(",")

                chat.chatlist(accountnumber, joinArray);
            },
            error: function () {
                console.log("Login Error (API)")
            }
        });
    }
}