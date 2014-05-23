(function($){$(document).ready(function() {
    // Connect to the CometD endpoint

    console.log("asdfasdf");
    $.cometd.init({
        url: window.location.protocol + '//' + window.location.hostname + '/cometd/25.0/',
        requestHeaders: {
            Authorization: 'OAuth ' + sessionId
        }
    });
    
    
    window.Car = Backbone.Model.extend({
        initialize: function() {
        }        
    });
    
    window.CarList = Backbone.Collection.extend({
        model: Car
    });

    window.CarView = Backbone.View.extend({
        tagName: "tr",
        className: "car",
        template: _.template($('#car-template').html()),
        
        initialize: function() {        
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });    

    window.CarListView = Backbone.View.extend({
        initialize: function() {
            this.collection.on('reset', this.render, this);
            this.collection.on('add', this.addOne, this);
        },
        render: function() {
            this.collection.forEach(this.addOne, this);
        },
        addOne: function(car) {
            var carView = new CarView({
                model: car
            });
            this.$el.append(carView.render().el);
        }
    });        

    
    
    

    // Subscribe to a topic. JSON-encoded update will be returned 
    // in the callback
    $.cometd.subscribe('/topic/AccountPT', function(message) {
        console.log(message);
        $('#content').append('<p>Notification: ' + 'message: ' + JSON.stringify(message));
        $('#content').append('<p>Notification: ' + 'name: ' + JSON.stringify(message.data.sobject.Name));
    });
    
    
    
    
});
})(jQuery)
