$(function() {
    //$('#callToFrame').parent().parent().show().hide()    
    
    $('#callToFrame').parent().click(function() {
            window.webkitNotifications.requestPermission()
        });
    
    //window.webkitNotifications.requestPermission();
    $('.PhoneNumberElement, #acc10_ileinner, #con10_ileinner, #con12_ileinner, #con13_ileinner, #con14_ileinner')
        .wrapInner('<nobr title="Click2Dial" class="sipgateGCXClick2DialBubble" />')
        .append('<img src="https://c9.io/tsschnoc/gapps_script_shared/workspace/sf_autocompl/icon_click2dial.gif" class="sipgateGCXClick2DialBubbleIMG">')
        .find('img').click(function(){
            //alert($(this).parent().text());
            console.log($(this).parent().text());
            var number = $(this).parent().text().split(' ').join('').replace("(","").replace(")","");            
            console.log(number);
            var callto = 'phoner://' + escape(number).replace('+', '00');
            console.log(callto);
            location.href = callto;            
        });


    window.document.addEventListener('DOMNodeInserted',function(e) {
         if (e.srcElement.className == 'lookupInput bEditBlock') {
             console.log($(e.srcElement));
             console.log($(e.srcElement).find('#con4'));
             attachUI();
         }
         //attachUI();
    });

});

