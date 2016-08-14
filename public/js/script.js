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
        } else {
            // Show them the landing page, as a fallback.
            return $("#landing");
        }
    },
    meta: [
        "#landing",
        "#main",
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
        //
    }, message: function (message) {
        //
    }
};

var ws = new WebSocket("ws://" + document.location.host + "/websocketEndpoint");

ws.onopen = websocketUtility.open;
ws.onmessage = websocketUtility.message;

$(".toast .close").on("click", function () {
    toast.close();
});

$("#scrollToMain").on("click", function () {
    document.location.hash = "#main";
});

var initialHash = "";

window.onload = function () {
    if(document.location.hash.length != 0) {
        initialHash = document.location.hash
    } else {
        initialHash = page.meta[0];
    }
    display.genericShow(page.toDisplay(document.location.hash).show());
};

$(window).on("hashchange", function (e) {
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
        $this.attr("id", Id)
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
    var urlVal = $(this).val().trim();
    if(urlVal.length == 0) {
        return;
    }
    if(urlVal.indexOf("//") === -1) {
        urlVal = "http://" + urlVal;
    }

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
    console.log(pageDetails, url);
    pageDetails.url = url;
    pageDetails.favicon = pageDetails.faviconUri;
    delete pageDetails.faviconUri;
    pageDetails = JSON.stringify(pageDetails);
    ws.send(pageDetails);
};

$("#url").on("change", urlFetchData);
$("#urlCheckButton").on("click", urlFetchData);

var makeUrlDetails = function (pageData, url) {
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
        modal.hide();
        $(".fab").animate({
            rotation: 45
        }, {
            duration: 300,
            step: function(now, fx) {
                $(this).css({"transform": "rotate("+now+"deg)"});
            }
        });
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
    });
};

