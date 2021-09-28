var Dialog = (function(txt){
    function showMask(){
        return $('<div class="ui-dialog"></div>').appendTo('body').css({
            'position' : 'fixed',
            'top' : 0,
            'right' : 0,
            'bottom' : 0,
            'left' : 0,
            'z-index' : 11000,
            'background' : 'rgba(0,0,0, 0.7)',
            'font-size' : '14px'
        });
    }

    function show(txt){
        var box = showMask();
        var cntBox = $('<div class="dialog-content"><span class="close">x</span><div class="dialog-txt">'+txt+'</div></div>').appendTo(box).css({
            'position' : 'absolute',
            'left' : '10%',
            'right' : '10%',
            'top' : '20%',
            'min-height' : '160px',
            'max-height' : '600px',
            'background' : 'url(https://p.ssl.qhimg.com/t0112d6649a275a40cf.jpg) repeat 0 0',
            'border-radius' : '10px',
            'padding' : '20px',
            'color' : '#666',
            'line-height' : '1.8'
        });

        cntBox.find('.close').css({
            'position' : 'absolute',
            'top' : '-10px',
            'right' : '-10px',
            'width' : '20px',
            'height' : '20px',
            'line-height' : '20px',
            'border-radius' : '50%',
            'border' : '1px solid #ccc',
            'background' : 'url(https://p.ssl.qhimg.com/t0112d6649a275a40cf.jpg) repeat 0 0',
            'font-size' : '16px',
            'text-align' : 'center',
            'font-family' : 'arial',
            'color' : '#999'
        }).on('click', hide);

        return box;
    }

    function showBox(cnt){
        var box = showMask();
        return box.html(cnt);
    }

    function hide(){
        $('.ui-dialog').remove();
    }

    return{
        'show' : show,
        'showBox' : showBox,
        'hide' : hide
    }
})();
