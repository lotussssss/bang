var BottomTip = BottomTip || (function(){    
    var tip = null, offsettop = 0;

    function show(txt, otop){

        if(QW.Browser.ie6){ return;} // Don't suport IE6.

        txt = txt || '';
        offsettop = otop || 0;
        tip = $('<div class="ui-bottom-tip"><div class="tip-content">'+txt+'</div><span class="tip-close" title="点击关闭">x</span></div>').appendTo('body');

        bindEvent();
    }

    function posBotTip(){
        if(tip == null){ return; }

        var st = document.body.scrollTop || document.documentElement.scrollTop;
        if(st > offsettop && tip.css('display')=='none'){
            tip.slideDown(300);
        }else if(st <= offsettop && tip.css('display')!='none'){
            tip.slideUp(300);
        }
    }

    function bindEvent(){
        W(window).on('scroll', posBotTip);
        W(window).on('load', posBotTip);
        W(window).on('resize', posBotTip);

        tip.find('.tip-close').on('click', function(e){
            e.preventDefault();
            tip.remove();
            tip = null;
        });
    }

    return {
        show : show
    }
})();