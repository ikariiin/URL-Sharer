var MATERIAL_COLORS = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5"
];

var NAMES = [
    "Amazing",
    "Cool",
    "Hardcore",
    "Mild",
    "Sweet",
    "Nightfall",
    "Falls",
    "Autumn",
    "HighSchool",
    "Hash",
    "Conference"
];

var page = {
    toDisplay: function (hash) {
        hash = hash.substr(1);
        if(hash.length == 0 || hash == "landing") {
            // Show them the landing page.
            return $("#landing");
        } else if(hash == "main") {
            // Show them the main content.
            return $("#main");
        } else if (hash == "configure") {
            // Show them the configure content.
            return $("#configure");
        } else if (hash == "chat") {
            // Show them the chat content.
            return $("#chat");
        } else {
            // Show them the landing page, as a fallback.
            return $("#landing");
        }
    },
    meta: [
        "#landing",
        "#main",
        "#chat",
        "#configure"
    ]
};

var display = {
    removeLeft: function (DOMObject) {
        this.DOMObject = DOMObject;
        this.animate("fadeOutLeft");
    }, removeRight: function (DOMObject) {
        this.DOMObject = DOMObject;
        this.animate("fadeOutRight");
    }, showUp: function (DOMObject) {
        this.DOMObject = DOMObject;
        this.animate("fadeInUp");
        DOMObject.show();
    }, showDown: function (DOMObject) {
        this.DOMObject = DOMObject;
        this.animate("fadeInDown");
        DOMObject.show();
    }, genericShow: function (DOMObject) {
        this.DOMObject = DOMObject;
        this.animate("fadeIn");
        DOMObject.show();
    }, genericRemove: function (DOMObject) {
        this.DOMObject = DOMObject;
        this.animate("fadeOut");
        DOMObject.show();
    }, animate: function (animationName) {
        var Callee = arguments.callee.caller.name;
        var DOMObject = this.DOMObject;
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        DOMObject.addClass("animated " + animationName).one(animationEnd, function () {
            DOMObject.removeClass("animated " + animationName);
            if(Callee.toLowerCase().indexOf("remove") !== -1) {
                DOMObject.hide();
            } else {
                DOMObject.show();
            }
        });
    }
};

var toast = {
    show: function (message) {
        var $toast = $("<div class='toast'><span class='close'><i class='material-icons'>clear</i></span></div>").append(message);
        $("body").append($toast);
        display.showUp($toast);
        setTimeout(function () {
            toast.close();
        }, 5000)
    }, close: function () {
        display.removeRight($(".toast"));
        setTimeout(function() {
            $(".toast").remove();
        }, 1000);
    }
};

var modal = {
    show: function (modalId) {
        var $modal = $(modalId);
        var $modalContainer = $modal.parent();
        display.genericShow($modalContainer);
        setTimeout(function () {
            display.showDown($modal);
        }, 1000);
    }, hide: function () {
        var $modal = $(".modal");
        var $modalContainer = $modal.parent();
        display.removeRight($modal);
        setTimeout(function () {
            display.genericRemove($modalContainer);
        }, 1000);
    }
};

var websocketUtility = {
    open: function () {
        $("#urlConnectionStat").css("background", "#4CAF50").html("Websocket connection to all machines for urls is correctly set up.");
    }, message: function (message) {
        message = JSON.parse(message.data);
        $(".urls-container").append("<div class='url' onclick='window.open(\"" + message.url + "\", \"_blank\")'><img align='middle' class='favicon' src='" + message.favicon + "'><span class='title'>" + message.title +"</span></div>")
        $(".urls-container").animate({
            scrollTop: $(".urls-container").get(0).scrollHeight
        }, 1000);
        toast.show("New url was shared. (From another machine)");
    }
};

var ws = new WebSocket("ws://" + document.location.host + "/websocketEndpoint");

ws.onopen = websocketUtility.open;
ws.onmessage = websocketUtility.message;

var chatWs = new WebSocket("ws://" + document.location.host + "/chatWebsocket");

var chatWebsocketUtility = {
    open: function () {
        $("#chatConnectionStat").css("background", "#4CAF50").html("Websocket connection to all machines for chat is correctly set up.")
    }, message: function (message) {
        message = JSON.parse(message.data);
        insertNewMessage_chat(message);
    }
};

chatWs.onopen = chatWebsocketUtility.open;
chatWs.onmessage = chatWebsocketUtility.message;

$(".toast .close").on("click", function () {
    toast.close();
});

$("#scrollToMain").on("click", function () {
    document.location.hash = "#main";
});

var initialHash = "";

var loadHistory = function () {
    fetch("/urlsHistory").then(function (data) {
        return data.json();
    }).then(function (json) {
        var jsonLength = json.length;
        for(var i = 0; i < jsonLength; i++) {
            $(".urls-container").append("<div class='url' onclick='window.open(\"" + json[i].url + "\", \"_blank\")'><img align='middle' class='favicon' src='" + json[i].favicon + "'><span class='title'>" + json[i].title +"</span></div>");
        }
        $(".urls-container").animate({
            scrollTop: $(".urls-container").get(0).scrollHeight
        }, 3000);
    }).catch(function (ex) {
        toast.show("Problem loading history from server.");
    });
};

var loadChatHistory = function () {
    fetch("/chatHistory").then(function (rawData) {
        return rawData.json();
    }).then(function (data) {
        insertBulkMessage_chat(data);
    }).catch(function (ex) {
        toast.show("There was some problem fetching chat history from the server.");
    });
};

var MACHINE_NAME;

var loadMachineName = function () {
    if(window.localStorage.MACHINE_NAME) {
        MACHINE_NAME = window.localStorage.MACHINE_NAME;
    } else {
        var random1 = NAMES[Math.floor(Math.random() * NAMES.length)];
        var random2 = NAMES[Math.floor(Math.random() * NAMES.length)];
        MACHINE_NAME = random1 + random2;
        window.localStorage.MACHINE_NAME = MACHINE_NAME;
    }
};

window.onload = function () {
    if(document.location.hash.length != 0) {
        initialHash = document.location.hash
    } else {
        initialHash = page.meta[0];
    }
    display.genericShow(page.toDisplay(document.location.hash).show());

    loadHistory();
    loadMachineName();
    loadChatHistory();
};

$(window).on("hashchange", function (e) {
    $(".urls-container").animate({
        scrollTop: $(".urls-container").get(0).scrollHeight
    }, 3000);
    e.preventDefault();
    if(initialHash == document.location.hash || document.location.hash.substr(1).length == 0) {
        return;
    } else if ($.inArray(document.location.hash, page.meta) === -1) {
        toast.show("Sorry but, the page requested within this page is not present.");
        document.location.hash = initialHash;
        return;
    } else if (page.meta.indexOf(document.location.hash) > page.meta.indexOf(initialHash)) {
        // The current page appears after the initial page.
        display.removeLeft($(initialHash));
        setTimeout(function() { display.showUp($(document.location.hash)); }, 1000);
    } else if (page.meta.indexOf(document.location.hash) < page.meta.indexOf(initialHash)) {
        // The current page appears before the initial page.
        display.removeRight($(initialHash));
        setTimeout(function() { display.showDown($(document.location.hash)); }, 1000);
    }

    initialHash = document.location.hash;
});

$(document).on("mousedown", "[data-ripple]", function(e) {
    var $self = $(this);
    if($self.is(".btn-disabled")) {
        return;
    }
    if($self.closest("[data-ripple]")) {
        e.stopPropagation();
    }
    var initPos = $self.css("position"),
        offs = $self.offset(),
        w = Math.min(this.offsetWidth, 160),
        h = Math.min(this.offsetHeight, 160),
        x = e.pageX - offs.left,
        y = e.pageY - offs.top,
        $ripple = $('<div/>', {class : "ripple",appendTo : $self });

    if(!initPos || initPos==="static") {
        $self.css({position:"relative"});
    }

    $('<div/>', {
        class : "rippleWave",
        css : {
            background: $self.data("ripple"),
            width: h,
            height: h,
            left: x - (h/2),
            top: y - (h/2)
        },
        appendTo : $ripple,
        one : {
            animationend : function(){
                $ripple.remove();
            }
        }
    });
});

var hoverIn = function() {
    $(".fab").animate({
            rotation: 360
        }, {
            duration: 300,
            step: function(now, fx) {
                $(this).css({"transform": "rotate("+now+"deg)"});
            }
        }
    );
};

var hoverOut =  function () {
    $(".fab").removeAttr("style");
};

$(".fab").hover(hoverIn, hoverOut);

var toggle = true;
$(".fab").on("click", function() {
    $(".fab").animate({
        rotation: 45
    }, {
        duration: 300,
        step: function(now, fx) {
            $(this).css({"transform": "rotate("+now+"deg)"});
        }
    });
    if(toggle) {
        $(".fab").unbind("mouseenter mouseleave");
        toggle = false;
    } else {
        $(".fab").hover(hoverIn, hoverOut);
        $(".fab").animate({
            rotation: 360
        }, {
            duration: 300,
            step: function(now, fx) {
                $(this).css({"transform": "rotate("+now+"deg)"});
            }
        });
        toggle = true;
    }
});

var devRandom = function () {
    var arr = [];
    while(arr.length < 1){
        var randomnumber=Math.ceil(Math.random()*1000)
        var found=false;
        for(var i=0;i<arr.length;i++){
            if(arr[i]==randomnumber){found=true;break}
        }
        if(!found)arr[arr.length]=randomnumber;
    }
    return arr[0];
};

var DropDownToggle = [];

$("[data-dropdown]").on("click", function (e) {
    var $this = $(this);


    if(DropDownToggle[$this.attr("id")]) {
        DropDownToggle[$this.attr("id")] = false;
        var bId = parseInt($this.attr("id")) + 1;
        display.removeLeft($("#" + bId));
        return;
    }


    var dropDownData = $this.attr("data-dropdown");
    try {
        dropDownData = JSON.parse(dropDownData);
        var dropDownLength = dropDownData.length;


        var Id = devRandom();
        var $dropDownElement = $("<div></div>", {id: Id + 1}).addClass("dropdown-container");
        $this.attr("id", Id);
        DropDownToggle[Id] = true;
        for(var i = 0; i < dropDownLength; i++) {
            var currentElement = dropDownData[i];
            var elementText = currentElement.text;
            var elementLink = currentElement.link;
            $dropDownElement.append("<a href='" + elementLink + "' class='dropdown-link'>" + elementText + "</a>");
        }


        var boundingRect = this.getBoundingClientRect();
        var top = boundingRect.top;
        var left = boundingRect.left;
        var right = boundingRect.right;
        $dropDownElement.css({left: left, top: top});
        $("body").append($dropDownElement);
        if(left + $dropDownElement.width() > $(window).width()) {
            $dropDownElement.css({left: '', right: (right / 100) + $this.width() + 30 , top: top});
        }
        display.showUp($dropDownElement);


        $(".dropdown-link").on("click", function (e) {
            var $this = $(this);

            var $parent = $this.parent();
            var parentId = parseInt($parent.attr("id")) - 1;
            DropDownToggle[parentId] = false;
            display.removeLeft($("#" + (parentId + 1)));
            $parent.removeAttr("id");
        });
    } catch (e) {
        toast.show("There was some error, parsing the JSON.")
    }
});

$(".modal .close").on("click", function () {
    modal.hide();
});

var urlFetchData = function () {
    $(".urlChecked").hide(100);
    $(".uri-data").hide(100);
    $("#createContainer").hide(100);
    $("#createURL").hide(100);
    $(".urlChecked").remove();
    $(".uri-data").remove();
    $("#createContainer").remove();
    $("#createURL").remove();

    var urlVal = $(this).val().trim();
    if(urlVal.length == 0) {
        return;
    }
    if(urlVal.indexOf("//") === -1) {
        urlVal = "http://" + urlVal;
    }

    var $loading = $("<div class='progress' id='urlFetchLoad'><div class='indeterminate'></div></div>");
    $(".modal").append($loading);

    var fetchingURL = "/info/";
    //noinspection JSUnresolvedFunction
    fetch(fetchingURL + encodeURIComponent(urlVal)).then(function (data) {
        return data.json();
    }).then(function (json) {
        makeUrlDetails(json, urlVal);
    }).catch(function (ex) {
        console.log(ex);
    });
};

var sendData = function (pageDetails, url) {
    pageDetails.url = url;
    pageDetails.favicon = pageDetails.faviconUri;
    delete pageDetails.faviconUri;
    (function () {
        pushUrlToCurrent(pageDetails);
    })();
    pageDetails = JSON.stringify(pageDetails);
    ws.send(pageDetails);
};

$("#url").on("change", urlFetchData);
$("#urlCheckButton").on("click", urlFetchData);

var makeUrlDetails = function (pageData, url) {
    $("#urlFetchLoad").hide(100);
    $("#urlFetchLoad").remove();
    if(pageData.error) {
        toast.show(pageData.description);
    } else {
        $("#urlIsChecked").attr("value", true);

        var title = pageData.title;
        var favicon = pageData.faviconUri;

        var $uriData = $("<div class='uri-data' onclick='window.open(\"" + url + "\", \"_blank\");'><img src='" + favicon + "' align='middle'><span class='title'>" + title + "</span></div>");
        $(".modal").append($uriData);

        $(".modal").append("<div class='urlChecked'><i class='material-icons'>done_all</i> Url Is Checked and Fine!</div>");
        $(".modal").append("<div style='text-align: center;' id='createContainer'><button id='createURL' data-ripple='rgba(255, 255, 255, 1)' class='btn'>Share Url! <i class='material-icons'>send</i></button></div>");
        $("#createURL").on("click", function () {
            var url = $("#url").val().trim();
            if(url.indexOf("//") === -1) {
                url = "http://" + url;
            }
            sendData(pageData, url);
            $(".fab").get(0).click();
            $(".urlChecked").hide(100);
            $(".uri-data").hide(100);
            $("#createContainer").hide(100);
            $("#createURL").hide(100);
            $(".urlChecked").remove();
            $(".uri-data").remove();
            $("#createContainer").remove();
            $("#createURL").remove();
            $("#url").val("");
        });
    }
};

var pushUrlToCurrent = function (urlData) {
    toast.show("New URL has been pushed. (From this machine)");
    $(".urls-container").append("<div class='url' onclick='window.open(\"" + urlData.url + "\", \"_blank\")'><img align='middle' class='favicon' src='" + urlData.favicon + "'><span class='title'>" + urlData.title +"</span></div>");
    $(".urls-container").animate({
        scrollTop: $(".urls-container").get(0).scrollHeight
    }, 1000);
};

var insertBulkMessage_chat = function (bulkData) {
    var bulkDataLength = bulkData.length;
    for(var i = 0; i < bulkDataLength; i++) {
        insertNewMessage_chat(bulkData[i]);
    }
    setTimeout(function () {
        $("[title]").tooltipster({
            theme: "tooltipster-light"
        });
    }, 10000);
};

var insertNewMessage_chat = function (messageData) {
    var from = messageData.from;
    var message = messageData.message;

    var fromFirst = from[0].toUpperCase();

    var self = false;
    if(from == MACHINE_NAME) {
        self = true;
    }

    var $chatMessage = $("<div class='chat-message'></div>");
    if(self) {
        $chatMessage.addClass("self");
        $chatMessage.append(message);
        $chatMessage.append("<span class='from-circle' style='background-color: #4CAF50; margin-left: 5px; margin-right: 0;' title='@" + from + "'>" + fromFirst + "</span>");
    } else {
        var color = MATERIAL_COLORS[Math.floor(Math.random() * MATERIAL_COLORS.length)];
        $chatMessage.append("<span class='from-circle' style='background-color: " + color + "' title='@" + from + "'>" + fromFirst + "</span>");
        $chatMessage.append(message);
    }

    $chatMessage.hide();
    $(".chat-transcript").append($chatMessage);
    display.showUp($chatMessage);
    $(".chat-transcript").animate({
        scrollTop: $(".chat-transcript").get(0).scrollHeight
    }, 1000);
    setTimeout(function () {
        $("[title]").tooltipster({
            theme: "tooltipster-light"
        });
    }, 6000);
};

$("#chatMessage").on("keypress", function (e) {
    if(e.keyCode == 13) {
        // Send message!!
        var $chatMessage = $("#chatMessage");
        var message = $chatMessage.val().trim();
        if(message.length == 0) {
            toast.show("The message cannot be empty =)");
            return;
        }
        if(MACHINE_NAME) {
            var messageData = {
                "from": MACHINE_NAME,
                "message": message
            };
            chatWs.send(JSON.stringify(messageData));
            $chatMessage.val("");
            insertNewMessage_chat(messageData);
        }
    }
});

