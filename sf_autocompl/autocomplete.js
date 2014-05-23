var _ = _;
$(function() {
    attachUI();

//in case on inline editing, salesforce inserts input elements into the dom. 
    window.document.addEventListener('DOMNodeInserted', function(e) {
        if (e.srcElement && e.srcElement.className && e.srcElement.className == 'lookupInput bEditBlock') {
            attachUI();
        }
    });

});



function attachUI() {
    //hide sidebar
    $('#autocompleteFindMeId').parent().parent().hide();

    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    ////////////////////// autocomplete    ///////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  

    var cache = {};

    window.autoCompleteSettingsMap = {};
    window.selectors = {};
    _.each(window.autoCompleteSettings, function(obj, num) {
        try {
            window.autoCompleteSettingsMap[obj.Name] = obj;
            obj.compiledId = _.template(obj.IdPath__c);
            obj.compiledName = _.template(obj.NamePath__c);
            obj.compiledDisplayLabel = _.template(obj.DisplayLabelPath__c);
            obj.compiledValueLabel = _.template(obj.ValueLabelPath__c);
            if (this[obj.Type__c] == null) {
                this[obj.Type__c] = {
                    idSelector: '',
                    idNoEditSelector: ''
                };
            }

            this[obj.Type__c].idSelector += ', #' + obj.Name;
            this[obj.Type__c].idNoEditSelector += ', #' + obj.Name + '_ileinner';
        }
        catch (e) {

        }
    }, window.selectors);

    _.each(window.selectors, function(sel, d) {
        sel.idSelector = sel.idSelector.substring(2);
        sel.idNoEditSelector = sel.idNoEditSelector.substring(2);
    });

    if (!window.selectors.Autocomplete || !window.selectors.SelectOption) 
        return;
        
    ///  provide translations in display mode    
    $(window.selectors.Autocomplete.idNoEditSelector + ', ' + window.selectors.SelectOption.idNoEditSelector).each(function(e, l) {
        $(this).parent().find('.searchHelp').remove();

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
                var autoComplSetting = window.autoCompleteSettingsMap[$(this).attr('id').split('_')[0]];
                if (allSearchResults.currentResult)
                    for (var i = 0; i < allSearchResults.currentResult.length; i++) {
                        $(this).find('a').text(autoComplSetting.compiledDisplayLabel(allSearchResults.currentResult[i]));
                    }

            });

            this.autocompleteRequest.fail(function(jqXHR, textStatus) {
                //console.log("Request failed: " + textStatus + "could not load tours");
            });
        }
    });

    //attach autocomplete field

    $(window.selectors.Autocomplete.idSelector).each(function(e, l) {
        var fieldId = $(this).attr('id');
        $(this).parent().append('<input class="searchHelp" helperFor="' + fieldId + '"></input>');


        var currentId = $(this).parent().parent().find('#' + fieldId + '_lkid').val();
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
            var autoComplSetting = window.autoCompleteSettingsMap[$(this).attr('id')];

            for (var i = 0; i < allSearchResults.currentResult.length; i++) {
                $(this).parent().find('.searchHelp').val(autoComplSetting.compiledDisplayLabel(allSearchResults.currentResult[i]));
            }

        });

        this.autocompleteRequest.fail(function(jqXHR, textStatus) {
            //console.log("Request failed: " + textStatus + "could not load tours");
        });

    });

    //implement autocomplete functionality

    $(window.selectors.Autocomplete.idSelector).parent().find('.searchHelp').autocomplete({
        minLength: 2,
        focus: function(event, ui) {
            $(this).val(ui.item.label);
            return false;
        },

        select: function(event, ui) {
            $(this).val(ui.item.label);
            $(this).parent().parent().find('#' + $(this).attr('helperFor') + '_lkid').val(ui.item.value);
            $(this).parent().parent().find('#' + $(this).attr('helperFor') + '').val(ui.item.name);
            return false;
        },

        source: function(request, response) {
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
                var autoComplSetting = window.autoCompleteSettingsMap[$(this.element).attr('helperFor')];

                var data = [];
                for (var i = 0; i < allSearchResults.matchResult.length; i++) {

                    data.push({
                        label: autoComplSetting.compiledValueLabel(allSearchResults.matchResult[i]),
                        value: autoComplSetting.compiledId(allSearchResults.matchResult[i]),
                        name: autoComplSetting.compiledName(allSearchResults.matchResult[i])

                    });
                }

                response(data);
            });

            this.autocompleteRequest.fail(function(jqXHR, textStatus) {
                //console.log("Request failed: " + textStatus + "could not load tours");
            });

        }
    });


    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    ////////////////////// select options  ///////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  
    //////////////////////////////////////////////////////////////////////////////////////////  


    if (window.selectors.SelectOption) $(window.selectors.SelectOption.idSelector).each(function(index, Element) {
//        $(this).parent().append('<select class="searchHelp" helperFor="' + $(this).attr('id') + '"></select>');
        $(this).parent().append('<select class="searchHelp" helperFor="' + $(this).attr('id') + '"><option selected="selected" value="000000000000000" name="">------------------------</option></select>');

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
            var fieldId = $(this).attr('id');

            var selectedId = $('#' + fieldId + '_lkid').val();

            var autoComplSetting = window.autoCompleteSettingsMap[$(this).attr('id')];
            var sel = $(this).parent().find('.searchHelp');
//            sel.append('<option selected="selected" value="000000000000000" name="">------------------------</option>');

            for (var i = 0; i < allSearchResults.matchResult.length; i++) {
                if (autoComplSetting.compiledId(allSearchResults.matchResult[i]).substring(0, 15) == selectedId) {
                    sel.append('<option selected="selected" value="' + autoComplSetting.compiledId(allSearchResults.matchResult[i]) + '" name="' + autoComplSetting.compiledName(allSearchResults.matchResult[i]) + '">' + autoComplSetting.compiledValueLabel(allSearchResults.matchResult[i]) + '</option>');
                }
                else {
                    sel.append('<option                     value="' + autoComplSetting.compiledId(allSearchResults.matchResult[i]) + '" name="' + autoComplSetting.compiledName(allSearchResults.matchResult[i]) + '">' + autoComplSetting.compiledValueLabel(allSearchResults.matchResult[i]) + '</option>');
                }
            }

            sel.change(function() {
                $(this).parent().parent().find('#' + $(this).attr('helperFor') + '_lkid').val($(this).val());
                $(this).parent().parent().find('#' + $(this).attr('helperFor') + '').val($(this).find("option:selected").attr('name'));
            });
        });

        this.autocompleteRequest.fail(function(jqXHR, textStatus) {
            //console.log("Request failed: " + textStatus + "could not load tours");
        });

    });
    
    
    
    $(window.selectors.Autocomplete.idNoEditSelector + ', ' + window.selectors.SelectOption.idNoEditSelector).each(function(e, l) {
            //$(this).parent().find('.searchHelp').css("min-width","100px");
    });



} //attachUI
