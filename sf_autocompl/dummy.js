//When the DOM is ready
$(document).ready(function() {
    //When the submit button is clicked
    $('form').submit(function(event) {
        strPath = $('form').attr('action')
        //Check if the action attribute is set
        if (strPath) {
            //This is to prevent the default submit behaviour of button
            event.preventDefault()
            //Get content from form as multipart
            strContent = $.getMultipartData('#' + this.id);
            //Do ajax call for posting to server
            $.ajax({
                type: 'POST',
                url: '',
                contentType: 'multipart/form-data; boundary=' + strContent[0],
                data: strContent[1],
                success: function(msg) {
                    alert("data is:" + msg);
                }
            });
        }
        else {
            alert('Please fix action attribute in form');
        }
    });
});



$.randomString = function() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
};


$.getMultipartData = function(base64) {
    //Start multipart formatting
    var initBoundary = $.randomString();
    var strBoundary = "--" + initBoundary;
    var strMultipartBody = "";
    var strCRLF = "\\r\\n";
    //Create multipart for each element of the form
    strMultipartBody += strBoundary + strCRLF + 'Content-Disposition: form-data; name="' + 'bild' + '"' + strCRLF + strCRLF + base64 + strCRLF;
  
  
    //End the body by delimiting it
    strMultipartBody += strBoundary + "--" + strCRLF;
    //Return boundary without -- and the multipart content
    return [initBoundary, strMultipartBody];
};
