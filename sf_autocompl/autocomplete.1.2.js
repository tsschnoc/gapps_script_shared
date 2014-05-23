var _ = _;
$(function() {
    attachUI();

    window.document.addEventListener('DOMNodeInserted', function(e) {
        if (e.srcElement.className == 'lookupInput bEditBlock') {
            console.log($(e.srcElement));
            console.log($(e.srcElement).find('#con4'));
            attachUI();
        }
    });

});




function attachUI() {

    $('#autocompleteFindMeId').parent().parent().hide();

    //    var sid = _.find(document.cookie.split('; '), function(c) {
    //        return c.substring(0, 3) == "sid";
    //    });
    //    sid = sid.split('=')[1]


    


    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    ////////////////////// autocomplete    ///////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  


    var cache = {};

    window.selectors = {};
    _.each(window.autoCompleteSettings, function(obj, num) {
        if (this[obj.Type__c] == null) {
            this[obj.Type__c] = {
                idSelector: '',
                idNoEditSelector: ''
            };
        }

        this[obj.Type__c].idSelector += ', #' + obj.Name;
        this[obj.Type__c].idNoEditSelector += ', #' + obj.Name + '_ileinner';
    }, window.selectors);

    _.each(window.selectors, function(sel, d) {
        console.log(d);
        console.log(sel);
        sel.idSelector = sel.idSelector.substring(2);
        sel.idNoEditSelector = sel.idNoEditSelector.substring(2);
    });
    console.log($(window.selectors));


    ///  provide translations in display mode    


    $(window.selectors.Autocomplete.idNoEditSelector + ', ' + window.selectors.SelectOption.idNoEditSelector).each(function(e, l) {
        var fieldId = $(this).attr('id').split('_')[0];

        if ($(this).find('a').length > 0) {
            var currentId = $(this).find('a').attr('href').split('/')[1];
            this.autocompleteRequest = $.ajax({
                url: "/services/proxy",
                type: "GET",
                dataType: "json",
                context: this,
                headers: {
                    'SalesforceProxy-Endpoint': window.Partner_Server_URL.split('services')[0] + 'apex/autoCompleteSearchJSON?currentId=' + currentId + '&fieldId=' + fieldId,
                    'Authorization': 'OAuth ' + window.salesforceSessionId
                }
            });

            this.autocompleteRequest.done(function(allSearchResults) {
                console.log(allSearchResults.currentResult);
                for (var i = 0; i < allSearchResults.currentResult.length; i++) {
                    console.log(allSearchResults.currentResult[i]);

                    //                    $(this).find('a').text($(this).find('a').text() + ' --- ' + allSearchResults.currentResult[i].label);
//                    $(this).find('a').text(allSearchResults.currentResult[i].name + ' --- ' + allSearchResults.currentResult[i].label);
                    $(this).find('a').text(allSearchResults.currentResult[i].label);
                }

            });

            this.autocompleteRequest.fail(function(jqXHR, textStatus) {
                console.log("Request failed: " + textStatus + "could not load tours");
            });
        }
    });


    //attach autocomplete field
    if ($(window.selectors.Autocomplete.idSelector).parent().find('.searchHelp').length <= 0) {
        
        //attach autocomplete field
        
        $(window.selectors.Autocomplete.idSelector).each(function(e, l) {
            $(this).parent().append('<input class="searchHelp" helperFor="' + $(this).attr('id') + '"></input>');


            var fieldId = $(this).attr('id');

            var currentId = $(this).parent().parent().find('#' + $(this).attr('id') + '_lkid').val();
            this.autocompleteRequest = $.ajax({
                url: "/services/proxy",
                type: "GET",
                dataType: "json",
                context: this,
                headers: {
                    'SalesforceProxy-Endpoint': window.Partner_Server_URL.split('services')[0] + 'apex/autoCompleteSearchJSON?currentId=' + currentId + '&fieldId=' + fieldId,
                    'Authorization': 'OAuth ' + window.salesforceSessionId
                }
            });

            this.autocompleteRequest.done(function(allSearchResults) {
                console.log(allSearchResults.currentResult);
                for (var i = 0; i < allSearchResults.currentResult.length; i++) {
                    console.log(allSearchResults.currentResult[i]);
                    $(this).parent().find('.searchHelp').val(allSearchResults.currentResult[i].label);
                }

            });

            this.autocompleteRequest.fail(function(jqXHR, textStatus) {
                console.log("Request failed: " + textStatus + "could not load tours");
            });

        });

        //implement autocomplete functionality

        $(window.selectors.Autocomplete.idSelector).parent().find('.searchHelp').autocomplete({
            minLength: 2,
            focus: function(event, ui) {
                //console.log(ui.item);
                $(this).val(ui.item.label);
                return false;
            },

            select: function(event, ui) {
                $(this).val(ui.item.label);
                //            $(this).parent().parent().find('#' + this.id + '_lkid').val(ui.item.value);
                $(this).parent().parent().find('#' + $(this).attr('helperFor') + '_lkid').val(ui.item.value);
                $(this).parent().parent().find('#' + $(this).attr('helperFor') + '').val(ui.item.name);
                return false;
            },


            source: function(request, response) {
                console.log('req');

                //            var fieldId = $(this.element).attr('id');
                var fieldId = $(this.element).attr('helperFor');
                var restriction = window.restrictionFuncMap[fieldId]();

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
                        'SalesforceProxy-Endpoint': window.Partner_Server_URL.split('services')[0] + 'apex/autoCompleteSearchJSON?searchTerm=' + escape(request.term) + '&fieldId=' + fieldId + '&restriction=' + restriction,
                        'Authorization': 'OAuth ' + window.salesforceSessionId
                    }
                });

                this.autocompleteRequest.done(function(allSearchResults) {
                    console.log(allSearchResults.matchResult);
                    var data = [];
                    for (var i = 0; i < allSearchResults.matchResult.length; i++) {
                        data.push({
                            label: allSearchResults.matchResult[i].label,
                            value: allSearchResults.matchResult[i].id,
                            name: allSearchResults.matchResult[i].name

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

    } // autocomplete already attached?



//////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    ////////////////////// select options  ///////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  

    if (window.selectors.SelectOption) $(window.selectors.SelectOption.idSelector).each(function(index, Element) {
        $(this).parent().append('<select class="searchHelp" helperFor="' + $(this).attr('id') + '"></select>');
        
        console.log($(this));
        var fieldId = $(this).attr('id');
        var restriction = window.restrictionFuncMap[fieldId]();

        this.autocompleteRequest = $.ajax({
            url: "/services/proxy",
            type: "GET",
            dataType: "json",
            context: this,
            headers: {
                'SalesforceProxy-Endpoint': window.Partner_Server_URL.split('services')[0] + 'apex/autoCompleteSearchJSON?searchTerm=*&fieldId=' + fieldId + '&restriction=' + restriction,
                'Authorization': 'OAuth ' + window.salesforceSessionId
            }
        });

        this.autocompleteRequest.done(function(allSearchResults) {
            console.log(allSearchResults.matchResult);
            allSearchResults.matchResult = [{
                id: "000000000000000",
                label: "------------------------"
            }].concat(allSearchResults.matchResult);
            var fieldId = $(this).attr('id');

            var selectedId = $('#' + fieldId + '_lkid').val();
            var sel = $(this).parent().find('.searchHelp');

            for (var i = 0; i < allSearchResults.matchResult.length; i++) {
                if (allSearchResults.matchResult[i].id.substring(0, 15) == selectedId) {
                    sel.append('<option selected="selected" value="' + allSearchResults.matchResult[i].id + '" name="' + allSearchResults.matchResult[i].name + '">' + allSearchResults.matchResult[i].label + '</option>');
                }
                else {
                    sel.append('<option                     value="' + allSearchResults.matchResult[i].id + '" name="' + allSearchResults.matchResult[i].name + '">' + allSearchResults.matchResult[i].label + '</option>');
                }
            }    
            
            sel.change(function() {
                console.log($(this));
                console.log($(this).find("option:selected").attr('name'));
                console.log($(this).val());
                $(this).parent().parent().find('#' + $(this).attr('helperFor') + '_lkid').val($(this).val());
                $(this).parent().parent().find('#' + $(this).attr('helperFor') + '').val($(this).find("option:selected").attr('name'));

                
            });
        });

        this.autocompleteRequest.fail(function(jqXHR, textStatus) {
            console.log("Request failed: " + textStatus + "could not load tours");
        });

    });
    







} //attachUI

