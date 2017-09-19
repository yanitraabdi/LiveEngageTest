var globalToken = "";
var agentSession = "";
var accountNumber = "";
var currentChatId = "";

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

    $("#btnSend").unbind().click(function () {
        chat.sendmessage(currentChatId, $("#txtMessage").val());
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

                chat.chatsessions(accountnumber);
                chat.getchatevent();
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
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentSession + "/chat?chatSessionKeys=" + chatSessionKeys + "&v=1&NC=true",
                method: "GET",
                body: "",
                token: globalToken
            },
            success: function (data) {
                var parsedData = JSON.parse(data);

                console.log(JSON.parse(data));

                var divChatList = document.getElementById("divChatList");

                $("#divChatList").html("");

                $.each(parsedData.chats.chat, function (i, obj) {
                    divChatList.innerHTML += '<li class="left clearfix" id="' + obj.info.chatSessionKey + '" onclick="setChatId(\''+obj.info.chatSessionKey+'\')"><span class="chat-img pull-left"><img src="http://www.joomilak.com/media/com_easydiscuss/images/default_avatar.png" alt="User Avatar" class="img-circle"></span><div class="chat-body clearfix" ><div class="header_sec"><strong class="primary-font">' + obj.info.visitorName + '</strong> <strong class="pull-right">' + moment(obj.info.lastUpdate).format("HH:mm") + '</strong></div><div class="contact_sec">' + obj.info.visitorId + '</div>';
                    //<span class="badge pull-right">3</span> ----------------- untuk unread message
                    //$("#" + obj.info.chatSessionKey).click(function () { currentChatId = obj.info.chatSessionKey; })
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
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentSession + "/incomingRequests?v=1&NC=true",
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

                if (currentChatId == "") {
                    $("#txtMessage").prop('disabled', true);
                    $("#btnSend").prop('disabled', true);
                } else {
                    $("#txtMessage").prop('disabled', false);
                    $("#btnSend").prop('disabled', false);
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
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentSession + "/incomingRequests?v=1&NC=true",
                method: "POST",
                body: "",
                token: globalToken
            },
            success: function (data) {
                console.log(JSON.parse(data));

                chat.chatsessions(accountnumber)
            },
            error: function () {
                console.log("Accept Chat Error (API)")
            }
        });
    },
    sendmessage: function (chatid, message) {
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountNumber + "/agentSession/" + agentSession + "/chat/" + chatid + "/events?v=1&NC=true",
                method: "POST",
                body: '{ "event": { "@type": "line", "text": "<span dir=\'ltr\' style=\'direction: ltr; text-align: left;\'>' + message + '</span>", "textType": "html"  } }',
                token: globalToken
            },
            success: function (data) {
                console.log(JSON.parse(data));
                var parsedData = JSON.parse(data);

                $("#txtMessage").val("");

                var divChatArea = document.getElementById("chat-events");

                $.each(parsedData.chats.chat, function (i, obj) {
                    divChatArea.innerHTML += '<li class="left clearfix admin_chat"><div class="row"><div class="chat-body1 clearfix col-xs-9"><p>' + message + '</p><div class="chat_time pull-left">' + moment().format("HH:mm") + '</div></div></div></li>';
                });
            },
            error: function () {
                console.log("Send Message Error (API)")
            }
        });
    },
    chatsessions: function (accountnumber) {
        $.ajax({
            url: "/LiveChat/api/v1/chats",
            data: {
                url: "https://sy.agentvep.liveperson.net/api/account/" + accountnumber + "/agentSession/" + agentSession + "/chatSessions?v=1&NC=true",
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
    },
    getchatevent: function () {
        if (currentChatId != "") {
            $.ajax({
                url: "/LiveChat/api/v1/chats",
                data: {
                    url: "https://sy.agentvep.liveperson.net/api/account/" + accountNumber + "/agentSession/" + agentSession + "/chat/" + currentChatId + "/events?v=1&NC=true",
                    method: "GET",
                    body: "",
                    token: globalToken
                },
                success: function (data) {
                    var parsedData = JSON.parse(data);

                    console.log(parsedData);

                    $("#chat-events").html('');

                    $.each(parsedData.events.event, function (i, obj) {
                        //console.log('<li class="left clearfix ' + obj.source == "agent" ? "admin_chat" : "" + '"><span class="chat-img1 ' + obj.source == "agent" ? "pull-right" : "pull-left" + '"><img src="' + obj.source == "agent" ? "https://lh6.googleusercontent.com/-y-MY2satK-E/AAAAAAAAAAI/AAAAAAAAAJU/ER_hFddBheQ/photo.jpg" : "http://www.joomilak.com/media/com_easydiscuss/images/default_avatar.png" + '" alt="User Avatar" class="img-circle"></span><div class="chat-body1 clearfix"><p>' + obj.text + '</p><div class="chat_time ' + obj.source == "agent" ? "pull-left" : "pull-right" + '">' + moment(obj.time).format("HH:mm") + '</div></div></li>');
                        if (obj["@type"] == "line") {
                            if (obj.source == "agent")
                                $("#chat-events").append('<li class="left clearfix admin_chat"><div class="chat-body1 clearfix"><p>' + obj.text + '</p><div class="chat_time pull-right">' + moment(obj.time).format("HH:mm") + '</div></div></li>');
                            else
                                $("#chat-events").append('<li class="left clearfix"><div class="chat-body1 clearfix"><p>' + obj.text + '</p><div class="chat_time pull-left">' + moment(obj.time).format("HH:mm") + '</div></div></li>');
                        }
                        else if (obj["@type"] == "state" && obj.state=="ended") {
                            $("#chat-events").append('<li class="chat-end">Chat Ended</li>');
                        }
                    });

                    if (currentChatId == "") {
                        $("#txtMessage").prop('disabled', true);
                        $("#btnSend").prop('disabled', true);
                    } else {
                        $("#txtMessage").prop('disabled', false);
                        $("#btnSend").prop('disabled', false);
                    }

                    var objDiv = document.getElementById("chat-events");
                    objDiv.scrollIntoView(false);

                    setTimeout(function () { chat.getchatevent(); }, 1000);
                },
                error: function () {
                    console.log("Get Chat Event Error (API)");
                    setTimeout(function () { chat.getchatevent(); }, 1000);
                }
            });
        }
        else {
            setTimeout(function () { chat.getchatevent(); }, 1000);
        }
    }
}

function setChatId(chatId) {
    currentChatId = chatId;
    $.each($("#divChatList li"), function (i, elm) {
        $(elm).css("background-color", "");
        $(elm).css("color", "");
    });
    $("#" + chatId).css("background-color", "#2980b9");
    $("#" + chatId).css("color", "#FFF");
}