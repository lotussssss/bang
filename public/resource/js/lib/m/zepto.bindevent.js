(function($){
	$.bindEvent = function(el, configs){
        el = $(el);
        for(var name in configs){
            var value = configs[name];
            if (typeof value == 'function') {
                var obj = {};
                obj.click = value;
                value = obj;
            };
            for(var type in value){
                el.delegate(name, type, value[type]);
            }
        }
    }
})(Zepto);