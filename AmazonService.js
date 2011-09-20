AmazonService = {
  _ACCESS_KEY_ID : null,
  _SECRET_ACCESS_KEY : null,
  _authinfo : null,

  /**
   * Sets the credentials authentication string
   */
  setCredentials : function(ACCESS_KEY_ID, SECRET_ACCESS_KEY) {
    this._ACCESS_KEY_ID = ACCESS_KEY_ID;
    this._SECRET_ACCESS_KEY = SECRET_ACCESS_KEY;
  },

  
  sendMail: function SendMail() {
    var timeStamp = Utilities.formatDate(
      new Date(), 
      "GMT", "EEE, dd MMM yyyy HH:mm:ss");
      
    timeStamp = timeStamp + ' GMT';
    var step1 = Utilities.computeHmacSha256Signature(
      timeStamp, this._SECRET_ACCESS_KEY);
    var sig = Utilities.base64Encode(step1);
    Logger.log(timeStamp);
    var auth = 'AWS3-HTTPS AWSAccessKeyId=' + this._ACCESS_KEY_ID + 
      ',Algorithm=HMACSHA256,Signature=' + sig;
    Logger.log(auth);
    
    
    //encodeURIComponent(sql)
    
    var url = 'https://email.us-east-1.amazonaws.com/?Action=SendEmail&Source=thomas.schnocklake%40gmail.com&Destination.ToAddresses.member.1=thomas.schnocklake%40parx.com&Message.Subject.Data=Christian%20nerven%20mit%20emails.This%20is%20the%20subject%20line.%20sent%20by%20aws%20ses.%20And%20by%20GAPPS%20Script.&Message.Body.Text.Data=Hello.%20I%20hope%20you%20are%20having%20a%20good%20day.';
 /*   
    var url = 
      'https://email.us-east-1.amazonaws.com/?Action=SendEmail&Source=' + 
      encodeURIComponent(Source)
   */ 
    var response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {
        'X-Amzn-Authorization': auth,
        Date: timeStamp
      },
      contentType: "application/x-www-form-urlencoded; charset=UTF-8"
    });
    Logger.log(response.getContentText());
  },

  
  
  
  
  
  dump : ''
};