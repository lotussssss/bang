(function ($) {
    function errorAnimate (obj) {
        obj = $ (obj)

        obj.each (function () {
            var
                me = this,
                orig_background_color = me.style.backgroundColor

            $ (me).css ('background-color', '#f00').animate ({ 'background-color' : '#fff' }, 1200, 'cubic-bezier(.28,.2,.51,1.15)', function () {
                me.style.backgroundColor = orig_background_color || ''
            })
        })
    }

    $.errorAnimate = errorAnimate
    $.fn.shine4Error = function () {
        $.errorAnimate (this)

        return $ (this)
    }
}) (Zepto);