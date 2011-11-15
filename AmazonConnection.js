A256,Signature=' + sig;
  Logger.log(auth);
  //  var url = 'https://email.us-east-1.amazonaws.com/?Action=SendEmail&Source=' + encodeURIComponent(sourceAddress) + '&Destination.ToAddresses.member.1=' + encodeURIComponent(toAddress) + '&Message.Subject.Data=' + encodeURIComponent(subject) + '&Message.Body.Text.Data=' + encodeURIComponent(body) + '';
  var raw = '';
  raw += 'Subject: ' + subject + '\n';
  raw += 'From: ' + sourceAddress + '\n';
  raw += 'To: ';
  for (var i in toAddresses) {
    raw += toAddresses[i] + ',';
  }
  raw = raw.substring(0, raw.length - 1);
  raw += '\n';
  raw += 'Content-Type: text/html; charset=ISO-8859-1\n';
  raw += '\n';
  raw += body + '\n' + '\n';
  Logger.log(raw);
  raw = Utilities.base64Encode(raw);
  Logger.log(raw);
  raw = encodeURIComponent(raw);
  Logger.log(raw);
  var url = 'https://email.us-east-1.amazonaws.com/?Action=SendRawEmail&RawMessage.Data=' + raw;
  Logger.log(url);
  var response = UrlFetchApp.fetch('https://email.us-east-1.amazonaws.com', {
    method: 'post',
    headers: {
      'X-Amzn-Authorization': auth,
      Date: timeStamp
    },
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    payload: "AWSAccessKeyId=" + this._ACCESS_KEY_ID + "&Action=SendRawEmail&RawMessage.Data=" + raw + "&Timestamp=" + timeStamp + ""
  });
  Logger.log(response.getContentText());
};
AmazonConnection.prototype.amazonSearch = function(searchIndex, keyWord) {
  var timeStamp = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  var valueForSignature = "ItemSearch" + timeStamp;
  var step1 = Utilities.computeHmacSha256Signature(valueForSignature, this._SECRET_ACCESS_KEY);
  var sig = Utilities.base64Encode(step1);
  var param = ["ItemSearch", ["AWSAccessKeyId", this._ACCESS_KEY_ID],
    ["Signature", sig],
    ["Timestamp", timeStamp],
    ["Request", ["SearchIndex", searchIndex],
      ["Keywords", keyWord]
    ]
  ];
  var wsdl = SoapService.wsdl("http://webservices.amazon.com/AWSECommerceService/" + "AWSECommerceService.wsdl");
  var awseService = wsdl.getService("AWSECommerceService");
  var result = awseService.ItemSearch(param);
  var list = result.Envelope.Body.ItemSearchResponse.Items.Item;
  var items = [];
  for (var i = 0; i < list.length; i++) {
    item = {};
    item.Title = list[i].ItemAttributes.Title.getText();
    item.Manufacturer = list[i].ItemAttributes.Manufacturer.getText();
    item.DetailPageURL = list[i].DetailPageURL.getText();
    items.push(item);
  }
  return items;
};
AmazonConnection.prototype.signParams = function(HTTPVerb, ValueOfHostHeaderInLowercase, HTTPRequestURI, queryStrings) {
  var toSign = HTTPVerb + "\n" + ValueOfHostHeaderInLowercase + "\n" + HTTPRequestURI + "\n";
  var timeStamp = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss.000'Z'");
  queryStrings.push({
    key: "SignatureMethod",
    value: "HmacSHA256"
  });
  queryStrings.push({
    key: "SignatureVersion",
    value: "2"
  });
  queryStrings.push({
    key: "Timestamp",
    value: encodeURIComponent(timeStamp)
  });
  queryStrings.push({
    key: "AWSAccessKeyId",
    value: encodeURIComponent(this._ACCESS_KEY_ID)
  });
  queryStrings.sort(function(a, b) {
    if (a.key < b.key) {
      return -1;
    }
    if (a.key < b.key) {
      return 1;
    }
    return 0;
  });
  queryStrings.forEach(function(queryString, i) {
    toSign += queryString.key + "=" + queryString.value + "&";
  });
  toSign = toSign.substr(0, toSign.length - 1);
  Logger.log(toSign);
  var step1 = Utilities.computeHmacSha256Signature(
  toSign, this._SECRET_ACCESS_KEY);
  var sig = Utilities.base64Encode(step1);
  var signedParams = '?';
  queryStrings.push({
    key: "Signature",
    value: encodeURIComponent(sig)
  });
  queryStrings.sort(function(a, b) {
    if (a.key < b.key) {
      return -1;
    }
    if (a.key < b.key) {
      return 1;
    }
    return 0;
  });
  queryStrings.forEach(function(queryString, i) {
    signedParams += queryString.key + "=" + queryString.value + "&";
  });
  signedParams = signedParams.substr(0, signedParams.length - 1);
  Logger.log(signedParams);
  return signedParams;
};

AmazonConnection.prototype.VerifyEmailAddress = function() {
  var timeStamp = Utilities.formatDate(new Date(), "GMT", "EEE, dd MMM yyyy HH:mm:ss");
  timeStamp = timeStamp + ' GMT';
  var step1 = Utilities.computeHmacSha256Signature(timeStamp, this._SECRET_ACCESS_KEY);
  var sig = Utilities.base64Encode(step1);
  Logger.log(timeStamp);
  var auth = 'AWS3-HTTPS AWSAccessKeyId=' + this._ACCESS_KEY_ID + ',Algorithm=HMACSHA256,Signature=' + sig;
  Logger.log(auth);
  var response = UrlFetchApp.fetch('https://email.us-east-1.amazonaws.com/?Action=VerifyEmailAddress&EmailAddress=salesforce.admin%40parx.com', {
    method: 'get',
    headers: {
      'X-Amzn-Authorization': auth,
      Date: timeStamp
    },
    contentType: "application/x-www-form-urlencoded; charset=UTF-8"
  });
  Logger.log(response.getContentText());
};