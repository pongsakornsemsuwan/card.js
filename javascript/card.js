(function(){
    function getScriptElement(){
        var target = document.documentElement;
        while (target.childNodes.length && target.lastChild.nodeType == 1) {
            target = target.lastChild;
        }

        return target;
    }

    function getScriptParent(){
        return scriptElement.parentNode;
    }

    function createIframe(){
        var merchantName, key, image, description, amount;
        if(scriptElement){
            merchantName = scriptElement.dataset.name;
            key = scriptElement.dataset.key;
            image = scriptElement.dataset.image;
            description = scriptElement.dataset.description;
            amount = scriptElement.dataset.amount;
        }

        iframe = document.createElement("IFRAME");
        iframe.id = "OmiseCardJsIFrame";
        iframe.src = "card.html";
        iframe.style.visibility = "hidden";
        iframe.style.zIndex= "9999"
        iframe.style.position = "absolute";
        iframe.style.top = "0px";
        iframe.style.left = "0px";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.overflowX = "hidden";
        iframe.style.opacity = "0";
        iframe.style.backgroundColor = 'rgba(' + [0,0,0,0.6].join(',') + ')';
        iframe.style.setProperty("-webkit-user-select", "none");
        iframe.style.setProperty("-moz-user-select", "none");
        iframe.style.setProperty("-ms-user-select", "none");
        iframe.style.setProperty("-o-user-select", "none");
        iframe.style.setProperty("user-select", "none");
        iframe.style.setProperty("-webkit-perspective", "800");
        iframe.style.setProperty("-webkit-transition", "200ms opacity ease");
        iframe.style.setProperty("-moz-transition", "200ms opacity ease");
        iframe.style.setProperty("-ms-transition", "200ms opacity ease");
        iframe.style.setProperty("-o-transition", "200ms opacity ease");
        iframe.style.setProperty("transition", "200ms opacity ease");
        iframe.style.webkitTransform= "scale(0.1)";

        iframe.addEventListener("load", iframeLoaded);

        function iframeLoaded(event){
            var iframe = event.currentTarget;
            if(iframe){
                var json = {
                    "merchantName": merchantName,
                    "key": key,
                    "image": image,
                    "description": description,
                    "amount": amount
                    };

                iframe.contentWindow.postMessage(JSON.stringify(json), "*");
            }
        }

        document.body.appendChild(iframe);
    }

    function createHiddenFields(){
        omiseTokenHiddenField = document.createElement('INPUT');
        omiseFullNameHiddenField = document.createElement('INPUT');

        omiseTokenHiddenField.type="hidden";
        omiseTokenHiddenField.name="omiseToken";

        omiseFullNameHiddenField.type="hidden";
        omiseFullNameHiddenField.name="omiseFullName";

        if(scriptParent){
            scriptParent.appendChild(omiseTokenHiddenField);
            scriptParent.appendChild(omiseFullNameHiddenField);
        }
    }

    function getIframe(){
        return document.getElementById("OmiseCardJsIFrame");
    }

    function renderPayNowButton(){
        var button = document.createElement("BUTTON");
        button.innerHTML = "PAY NOW";
        button.addEventListener("click", function(event){
            event.preventDefault();
            if(iframe){
                iframe.style.opacity = "1";
                iframe.style.visibility = "visible";
                iframe.style.webkitTransform= "scale(1)";
                document.body.style.overflow = "hidden";
            }else{
                console.log("error: Unable to find CardJS iframe");
            }
        })
        
        if(scriptParent){
            scriptParent.appendChild(button);
        }
    }

    function listenToCardJsIframeMessage(event){
        if(event.data=="closeOmiseCardJsPopup"){
            if(iframe){
                iframe.style.opacity = "0";
                iframe.style.visibility = "hidden";
                document.body.style.overflow = "";
            }
        }else{
            var result = JSON.parse(event.data);
            omiseTokenHiddenField.value = result.omiseToken;
            omiseFullNameHiddenField.value = result.fullName;
            if(iframe){
                iframe.style.visibility = "hidden";
                document.body.style.overflow = "";
            }
        }
    }

    var omiseTokenHiddenField, omiseFullNameHiddenField, iframe;
    var scriptElement = getScriptElement();
    var scriptParent = getScriptParent();

    createIframe();
    renderPayNowButton();
    createHiddenFields();
    window.removeEventListener("message", listenToCardJsIframeMessage);
    window.addEventListener("message", listenToCardJsIframeMessage, false);
})();


