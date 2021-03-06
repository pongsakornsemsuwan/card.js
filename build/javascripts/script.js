(function (window, $, undefined) {

  "use strict";

  var cardholderNameInput = $("#cardholder_name");
  var cardNumberInput = $("#card_number")
  var expirationMonthInput = $("#expiration_month");
  var expirationYearInput = $("#expiration_year");
  var securityCodeInput = $("#security_code");
  var postalCodeInput = $("#postal_code");
  var cityInput = $("#city");
  var errorMessage = $("#error_message");
  var clientWindowDomain;

  function formatMoney(n, c, d, t) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c, 
        d = d == undefined ? "." : d, 
        t = t == undefined ? "," : t, 
        s = n < 0 ? "-" : "", 
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  };

  function validateInput(input) {
    if ($(input).val().length == 0) {
      $(input).addClass("error");
      return 1;
    } else {
      $(input).removeClass("error");
      return 0;
    }
  };

  function resetForm() {
    cardholderNameInput.val('').removeClass('error');
    cardNumberInput.val('').removeClass('error');
    expirationMonthInput.val('').removeClass('error');
    expirationYearInput.val('').removeClass('error');
    securityCodeInput.val('').removeClass('error');
    postalCodeInput.val('').removeClass('error');
    cityInput.val('').removeClass('error');
    errorMessage.html('');
  };

  function validateForm() {
    var error = validateInput(cardholderNameInput);
    error += validateInput(cardNumberInput);
    error += validateInput(expirationMonthInput);
    error += validateInput(expirationYearInput);
    error += validateInput(securityCodeInput);

    if (error > 0) {
      return false;
    } else {
      return true;
    }
  };

  cardholderNameInput.keyup(function (event) {
    validateInput(this);
  });

  cardNumberInput.keyup(function (event) {
    validateInput(this);
  });

  expirationMonthInput.keyup(function (event) {
    validateInput(this);
  });

  expirationYearInput.keyup(function (event) {
    validateInput(this);
  });

  securityCodeInput.keyup(function (event) {
    validateInput(this);
  });

  $("#close_modal").click(function () {
    resetForm();
    parent.window.postMessage("closeOmiseCardJsPopup", "*");
  });

  $("#paynow").click(function (event) {
    event.preventDefault();

    var formIsValid = validateForm();

    if (!formIsValid) {
      return;
    };

    var card = {
      "name": cardholderNameInput.val(),
      "number": cardNumberInput.val(),
      "expiration_month": expirationMonthInput.val(),
      "expiration_year": expirationYearInput.val(),
      "security_code": securityCodeInput.val(),
      "postal_code": postalCodeInput.val(),
      "city": cityInput.val()
    };

    Omise.createToken("card", card, function (statusCode, response) {
      if(statusCode == "0" && response===undefined){
        errorMessage.html("Authentication failed.");
      }

      if (response.object == "error") {
        errorMessage.html(response.message);
      } else {
        resetForm();

        var tokenFieldId  = $("#tokenFieldId").val();
        var submitAuto    = $("#submitAuto").val();
        parent.window.postMessage('{ "omiseToken": "' + response.id + '", "submitAuto": "'+submitAuto+'", "tokenFieldId": "'+tokenFieldId+'" }', clientWindowDomain);
      };
    });
  });

  window.removeEventListener("message", listenToParentWindowMessage);
  window.addEventListener("message", listenToParentWindowMessage, false);

  function listenToParentWindowMessage(event) {
    if (event.data) {
      var data = JSON.parse(event.data);

      if (data.location && data.location == "yes") {
        $("#location_fields").show();
      };

      $("#amount").html(formatMoney(parseInt(data.amount)/100));

      if (data.frameLabel) {
        $("#merchant_name").html(data.frameLabel);
      } else {
        $("#merchant_name").html("Enter your card details");
      }

      if (data.image) {
        $("#merchant_image").attr("src", data.image);
      } else {
        $("#merchant_image").parent().hide();
      }

      if (data.submitLabel) {
        $("#submit_label").html(data.submitLabel);
      }

      if (data.tokenFieldId) {
        $("#tokenFieldId").val(data.tokenFieldId);
      }

      if (data.submitAuto) {
        $("#submitAuto").val(data.submitAuto);
      }

      clientWindowDomain = event.origin;

      if (Omise) {
        
        Omise.setPublicKey(data.key);
      };
    };
  };

})(window, jQuery);
