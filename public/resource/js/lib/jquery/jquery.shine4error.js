(function($){

    //$.fn.shine4Error = function(){
    //    var $me = $(this);
    //
    //    var obgc = $me.css('background-color');
    //
    //    $me.animate({'backgroundColor' : '#f00'}, 100, function(){
    //        $me.animate({'backgroundColor' : obgc}, 400);
    //    });
    //
    //    //$me.css('background-color', '#f00').animate({'backgroundColor' : '#fff'}, 400, function(){
    //    //    $me.css('background-color', obgc);
    //    //});
    //
    //    return $me;
    //}
    function errorAnimate (obj) {
        obj = $ (obj)

        obj.each (function () {
            var
                me = this,
                orig_background_color = me.style.backgroundColor

            $ (me).css ('background-color', '#f00').animate ({ 'background-color' : '#fff' }, 1200, /*'cubic-bezier(.28,.2,.51,1.15)', */function () {
                me.style.backgroundColor = orig_background_color || ''
            })
        })
    }

    $.errorAnimate = errorAnimate
    $.fn.shine4Error = function () {
        $.errorAnimate (this)

        return $ (this)
    }
})(jQuery);