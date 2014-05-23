<head>
    <link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery.ui.all.css"
    />
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min.js"></script>
</head>
<script type="text/javascript">
    $(function() {

        var sid = _.find(document.cookie.split('; '), function(c) {
            return c.substring(0, 3) == "sid";
        });

        console.log(sid);
        console.log($("#con4"));


        var cache = {}, lastXhr;

        $("#con4").autocomplete({
            minLength: 2,
            focus: function(event, ui) {
                console.log(ui.item);
                $("#con4").val(ui.item.label);
                return false;
            },

            select: function(event, ui) {
                $("#con4").val(ui.item.label);
                $("#con4_lkid").val(ui.item.value);

                return false;
            },


            source: function(request, response) {
                console.log('req');

                var term = request.term;
                if (term in cache) {
                    response(cache[term]);
                    return;
                }

                this.tourRequest = $.ajax({
                    url: "/services/proxy",
                    type: "GET",
                    dataType: "json",
                    context: this,
                    headers: {
                        'SalesforceProxy-Endpoint': 'https://na11.salesforce.com/services/data/v25.0/search?q=FIND+{' + request.term + '*}+IN+ALL+FIELDS+RETURNING+ACCOUNT(Id,Name)',
                        'Authorization': 'OAuth ' + sid.split('=')[1]
                    }
                });

                this.tourRequest.done(function(allSearchResults) {
                    console.log(allSearchResults);
                    var data = [];
                    for (i = 0; i < allSearchResults.length; i++) {
                        data.push({
                            label: allSearchResults[i].Name,
                            value: allSearchResults[i].Id
                        });
                        console.log(allSearchResults[i].Id);
                    }

                    response(data);
                });

                this.tourRequest.fail(function(jqXHR, textStatus) {
                    console.log("Request failed: " + textStatus + "could not load tours");
                });
            }
        });

    });
</script>