(function($) {

    var config = {
        startIndex : 0,
        root : 'body'
    };

    var registry = {};

    var Layers = {
        add : function(name, level) {
            var layer = $('<div></div>');

            layer.css({
                position : 'absolute',
                top : 0,
                left : 0,
                zIndex : config.startIndex + level,
                width : '100%',
                height : 0,
                overflow : 'visible'
            });

            $(config.root).append(layer);
            registry[name] = layer;
            return layer;

        },

        remove : function(name) {
            registry[name].off().remove();
            delete registry[name];

        },

        'get' : function(name) {
            return registry[name];

        },

        configure : function(settings) {
            $.extend(config, settings);

        }
    };

    $.extend({
        layers : Layers
    });

})(jQuery);