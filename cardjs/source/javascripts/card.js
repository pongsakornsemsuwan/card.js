(function (window, undefined) {

  var omiseTokenHiddenField, iframe, iframeWrapper, formObject;
  var scriptElement = getScriptElement();
  var scriptParent = getScriptParent();
  var serverOrigin = "http://localhost:4569";

  renderPayNowButton();
  createHiddenFields();

  window.removeEventListener("message", listenToCardJsIframeMessage);
  window.addEventListener("message", listenToCardJsIframeMessage, false);

  function getScriptElement() {
    var target = document.documentElement;
    while (target.childNodes.length && target.lastChild.nodeType == 1) {
      target = target.lastChild;
    }

    return target;
  }

  function getScriptParent() {
    return scriptElement.parentNode;
  }

  function createIframe() {
    var merchantName, key, image, amount, currency;
    if (scriptElement) {
      merchantName = scriptElement.getAttribute("data-name");
      key = scriptElement.getAttribute("data-key");
      image = scriptElement.getAttribute("data-image");
      amount = scriptElement.getAttribute("data-amount");
      currency = scriptElement.getAttribute("data-currency");
      locationFields = scriptElement.getAttribute("data-location");
    };

    iframe = document.createElement("IFRAME");
    iframe.id = "OmiseCardJsIFrame";
    iframe.src = serverOrigin + "/index.html";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.margin = "0";
    iframe.style.opacity = "0";
    iframe.style.setProperty("-webkit-transition", "200ms opacity ease, -webkit-transform 200ms");
    iframe.style.setProperty("-moz-transition", "200ms opacity ease, -moz-transform 200ms");
    iframe.style.setProperty("-ms-transition", "200ms opacity ease, -ms-transform 200ms");
    iframe.style.setProperty("-o-transition", "200ms opacity ease, -o-transform 200ms");
    iframe.style.setProperty("transition", "200ms opacity ease, transform 200ms");
    iframe.style.webkitTransform= "scale(0.1)";
    iframe.style.MozTransform = "scale(0.1)";
    iframe.style.msTransform = "scale(0.1)";
    iframe.style.OTransform = "scale(0.1)";
    iframe.style.transform = "scale(0.1)";

    iframe.addEventListener("load", iframeLoaded);

    iframeWrapper = document.createElement("DIV");
    iframeWrapper.style.backgroundColor = 'rgba(' + [0,0,0,0.6].join(',') + ')';
    iframeWrapper.style.visibility = "hidden";
    iframeWrapper.style.zIndex= "9990"
    iframeWrapper.style.position = "fixed";
    iframeWrapper.style.top = "0px";
    iframeWrapper.style.left = "0px";
    iframeWrapper.style.width = "100%";
    iframeWrapper.style.height = "100%";
    iframeWrapper.style.overflowX = "hidden";
    iframeWrapper.style.opacity = "0";
    iframeWrapper.style.border = "none";
    iframeWrapper.style.backgroundColor = 'rgba(' + [0,0,0,0.6].join(',') + ')';
    iframeWrapper.appendChild(iframe);

    document.body.appendChild(iframeWrapper);

    function iframeLoaded(event) {
      if (event.currentTarget) {
        var data = {
          "merchantName": merchantName,
          "key": key,
          "image": image,
          "amount": amount,
          "currency": currency,
          "location": locationFields
        };

        event.currentTarget.contentWindow.postMessage(JSON.stringify(data), serverOrigin);
      };
    };
  };

  function createHiddenFields() {
    omiseTokenHiddenField = document.createElement('INPUT');
    omiseTokenHiddenField.type="hidden";
    omiseTokenHiddenField.name="omiseToken";

    if (scriptParent) {
      scriptParent.appendChild(omiseTokenHiddenField);
    };

    if (omiseTokenHiddenField.form) {
      formObject = omiseTokenHiddenField.form;
    };
  };

  function renderPayNowButton() {
    var button = document.createElement("BUTTON");
    button.innerHTML = "PAY NOW";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      createIframe();
      if (iframeWrapper && iframe) {
        iframeWrapper.style.opacity = "1";
        iframeWrapper.style.visibility = "visible";
        document.body.style.overflow = "hidden";

        setTimeout(function(){
          iframe.style.webkitTransform= "scale(1)";
          iframe.style.MozTransform = "scale(1)";
          iframe.style.msTransform = "scale(1)";
          iframe.style.OTransform = "scale(1)";
          iframe.style.transform = "scale(1)";
          iframe.style.opacity = "1";
        }, 300);
      } else {
        console.log("error: Unable to find CardJS iframe");
      };
    });
    
    if (scriptParent) {
      scriptParent.appendChild(button);
    };
  };

  function hideIframe() {
    if (iframeWrapper && iframe) {
      iframeWrapper.style.opacity = "0";
      iframeWrapper.style.visibility = "hidden";
      iframe.style.opacity = "0";
      iframe.style.webkitTransform= "scale(0.1)";
      iframe.style.MozTransform = "scale(0.1)";
      iframe.style.msTransform = "scale(0.1)";
      iframe.style.OTransform = "scale(0.1)";
      iframe.style.transform = "scale(0.1)";
      document.body.style.overflow = "";
    };
  };

  function listenToCardJsIframeMessage(event) {
    if (!event.origin) {
      return;
    };

    if (event.origin !== serverOrigin) {
      return;
    };

    if (event.data == "closeOmiseCardJsPopup") {
      hideIframe();
    } else {

      try {
        var result = JSON.parse(event.data);
        omiseTokenHiddenField.value = result.omiseToken;
        hideIframe();

        if (formObject) {
          formObject.submit();
        };
      }
      catch (e) {
        hideIframe();
      };

    };
  };

})(window);
