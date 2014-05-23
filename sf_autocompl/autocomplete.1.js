$(function() {
    attachUI();

    window.document.addEventListener('DOMNodeInserted',function(e) {
         if (e.srcElement.className == 'lookupInput bEditBlock') {
             console.log($(e.srcElement));
             console.log($(e.srcElement).find('#con4'));
             attachUI();
         }
    });

});




function attachUI() {

    var sid = _.find(document.cookie.split('; '), function(c) {
        return c.substring(0, 3) == "sid";
    });

    console.log(sid);
    console.log(autocompleteselector);
    console.log($(autocompleteselector));


/*
var container = $('#con8').parent().parent();
var selectedId = $('#con8_lkid').val();
var selectedVal = $('#con8').val();
container.empty();
var sel =$('<select id="con8_lkid"  name="con8_lkid">  </select>');

if (selectedId == '000000000000000') {
    sel.append('<option selected="selected" value="">------------------------</option>')
} else {
    sel.append('<option value="">------------------------</option>')
    sel.append('<option selected="selected" value="' + selectedId +  '">' + selectedVal +  '</option>');
}

var cont = [
    {id:'003A000000gHIVW', name:'Mr. Avi Green'}, 
    {id:'003A000000gHIVV', name:'Ms. Edna Frank'}
    ];
    
for (i = 0; i < cont.length; i++) {    
    sel.append('<option selected="selected" value="' + cont[i].id +  '">' + cont[i].name +  '</option>');
}

container.append(sel);
*/

$('#con8, #CF00ND0000003oraB').each(function(index, Element) 
{
    console.log($(this));
    var fieldId = $(this).attr('id');
    var restriction = restrictionFuncMap[fieldId]();
    
    this.autocompleteRequest = $.ajax({
        url: "/services/proxy",
        type: "GET",
        dataType: "json",
        context: this,
        headers: {
//                    'SalesforceProxy-Endpoint': 'https://testitest-developer-edition--parxautocomp.na11.visual.force.com/apex/autoCompleteSearchJSON?searchTerm=' + escape(request.term) + '&fieldId=' + fieldId + '&restriction=' + restriction,
            'SalesforceProxy-Endpoint': Partner_Server_URL.split('services')[0] + 'apex/autoCompleteSearchJSON?searchTerm=' + escape('Le') + '&fieldId=' + fieldId + '&restriction=' + restriction,
            'Authorization': 'OAuth ' + sid.split('=')[1]
        }
    });

    this.autocompleteRequest.done(function(allSearchResults) {
        console.log(allSearchResults);
        allSearchResults = [{id: "000000000000000",label: "------------------------"}].concat(allSearchResults);
        var fieldId = $(this).attr('id');


        var container = $('#' + fieldId + '').parent().parent();
        var selectedId = $('#' + fieldId + '_lkid').val();
        var selectedVal = $('#' + fieldId + '').val();
        
        container.empty();
        var sel =$('<select id="' + fieldId + '_lkid"  name="' + fieldId + '_lkid">  </select>');
        
        /*if (selectedId == '000000000000000') {
            sel.append('<option selected="selected" value="">------------------------</option>')
        } else {
            sel.append('<option value="">------------------------</option>')
            sel.append('<option selected="selected" value="' + selectedId +  '">' + selectedVal +  '</option>');
        }
        */        
        for (i = 0; i < allSearchResults.length; i++) {
            if (allSearchResults[i].id.substring(0,15) == selectedId) {
                sel.append('<option selected="selected" value="' +allSearchResults[i].id +  '">' +allSearchResults[i].label +  '</option>');            
            } else {
                sel.append('<option value="' +allSearchResults[i].id +  '">' +allSearchResults[i].label +  '</option>');            
            }
        }        
        container.append(sel);
/*
        var data = [];
        for (i = 0; i < allSearchResults.length; i++) {
            data.push({
                label: allSearchResults[i].label,
                value: allSearchResults[i].id
            });
            //console.log(allSearchResults[i].id);
        }
*/        

//        response(data);
    });

    this.autocompleteRequest.fail(function(jqXHR, textStatus) {
        console.log("Request failed: " + textStatus + "could not load tours");
    });

}
);

//    sforce.connection.sessionId=sid.split('=')[1];
    
    var cache = {}, lastXhr;
    
    $(autocompleteselector).each(function(index, Element) 
    {
        console.log($(this));
        var fieldId = $(this).attr('id');
        $('#' + fieldId + '_lkold,#' + fieldId + '_lktp,#' + fieldId + '_lspf,#' + fieldId + '_lspfsub,#' + fieldId + '_mod').remove();
    });

    

//    $("#con4, #cas3, #cas4, #ctrc7").autocomplete({
    $(autocompleteselector).autocomplete({
        minLength: 2,
        focus: function(event, ui) {
            //console.log(ui.item);
            $(this).val(ui.item.label);
            return false;
        },

        select: function(event, ui) {
            $(this).val(ui.item.label);
            $(this).parent().parent().find('#' + this.id + '_lkid').val(ui.item.value);
            return false;
        },


        source: function(request, response) {
            console.log('req');
            
            var fieldId = $(this.element).attr('id');
            var restriction = restrictionFuncMap[fieldId]();

            var term = request.term;
            if (term in cache) {
                response(cache[term]);
                return;
            }

            this.autocompleteRequest = $.ajax({
                url: "/services/proxy",
                type: "GET",
                dataType: "json",
                context: this,
                headers: {
//                    'SalesforceProxy-Endpoint': 'https://testitest-developer-edition--parxautocomp.na11.visual.force.com/apex/autoCompleteSearchJSON?searchTerm=' + escape(request.term) + '&fieldId=' + fieldId + '&restriction=' + restriction,
                    'SalesforceProxy-Endpoint': Partner_Server_URL.split('services')[0] + 'apex/autoCompleteSearchJSON?searchTerm=' + escape(request.term) + '&fieldId=' + fieldId + '&restriction=' + restriction,
                    'Authorization': 'OAuth ' + sid.split('=')[1]
                }
            });

            this.autocompleteRequest.done(function(allSearchResults) {
                console.log(allSearchResults);
                var data = [];
                for (i = 0; i < allSearchResults.length; i++) {
                    data.push({
                        label: allSearchResults[i].label,
                        value: allSearchResults[i].id
                    });
                    //console.log(allSearchResults[i].id);
                }

                response(data);
            });

            this.autocompleteRequest.fail(function(jqXHR, textStatus) {
                console.log("Request failed: " + textStatus + "could not load tours");
            });
           
        }
    });
} //attachUI







/*
//Salesforce.com AJAX api
            var cb = function(result) {
                //console.log(result);
                
                if (!result.searchRecords) {
                    response([]);
                    return;
                }
                
                if (typeof result.searchRecords.length == "undefined" ) {
                    allSearchResults = [result.searchRecords];   
                } else {
                    allSearchResults = result.searchRecords;                       
                }
                var data = [];
                for (i = 0; i < allSearchResults.length; i++) {
                    data.push({
                        label: allSearchResults[i].record.Name,
                        value: allSearchResults[i].record.Id
                    });
                    //console.log(allSearchResults[i].record.Id);
                }

                response(data);                
                
            };
            
            
            
            sforce.connection.search('FIND {' + request.term + '*} in all fields RETURNING Account(Name,Id)', cb);
            */
/*

errcb = function(jqXHR, textStatus, errorThrown) {//console.log('err'); //console.log(jqXHR);}


$.ajax({
                url: "/services/proxy",
                type: "GET",
                dataType: "json",
                context: this,
                error: errcb,
                headers: {
                    'SalesforceProxy-Endpoint': 'https://testitest-developer-edition--c.na11.visual.force.com/apex/jsonTest',
                    'Authorization': 'OAuth ' +  + sid.split('=')[1]
                }
            });
           
jQuery.ajax({
    url: 'https://testitest-developer-edition--c.na11.visual.force.com/apex/jsonTest',
    error: errcb,
    headers: {
        "Authorization": "OAuth 00DA0000000Awxo!AQUAQFCDovgjGFnYcjBEEmuC6n8RRbgA2qBHaJurRHgdUZtF9wISrXSwrrIFPv3D2iG0_lrceKmalAZ9TrKwXqD8_hgt6rrA"
    }
});
*/ 