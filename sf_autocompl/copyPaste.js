var _ = _;
$(function() {
    copyPaste();


window.salesforceSessionId = _.find(document.cookie.split('; '), function(c) {
        return c.substring(0, 3) == "sid";
    });



window.salesforceSessionId = window.salesforceSessionId.split('=')[1];
});



function copyPaste() {
    if (window.location.href.indexOf('/500') <= 0)
        return;
    console.log(window.location.href);
    //http://navkirats.blogspot.ch/2010/11/jquery-ajax-script-for-multipartform.html
    
    var saveDoc = function(base64) {        
        var content = {};
        content.Body = base64.split(',')[1];
        content.ParentId = window.location.href.split('/')[3];
        content.Name = new Date().toGMTString() + '.png';
        content.Description = 'irgendeine description';

        this.autocompleteRequest = $.ajax({
            url: "/services/proxy",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(content) ,
            context: this,
            contentType: 'application/json',
            headers: {
                'SalesforceProxy-Endpoint': 'https://testitest-developer-edition.my.salesforce.com/services/data/v26.0/sobjects/Attachment',
                'Authorization': 'OAuth ' + window.salesforceSessionId
            }
        });

        this.autocompleteRequest.done(function(allSearchResults) {
            console.log("Request ok: " + allSearchResults);
            window.location.reload();
        });

        this.autocompleteRequest.fail(function(jqXHR, textStatus) {
            console.log("Request failed: " + textStatus + "could not load tours");
        });

    };
    
    $('[name=attachFile]').after('<input id="bilder"/>');
/*
    $("#bilder").bind('dragover', function(e) {    
        console.log(e);        
    });
    */
    $("#bilder").bind('paste', function(e) {            
        var file = e.originalEvent.clipboardData.items[0].getAsFile();
        var reader = new FileReader();
        reader.onload = function(evt) {
            saveDoc(evt.target.result);
        };
        reader.readAsDataURL(file);
    });    
    
}