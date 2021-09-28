/**
 * 推广slide类
 * 使用 new TuiguangSlide('.slide-box');
 * @param {selector} box  [description]
 * @param {[type]} conf [description]
 */
function TuiguangSlide(box, conf){
    var me = this;

    this.meBox = W(box);
    // 找不到需要处理的容器，直接返回
    if(!this.meBox.length){
        return ;
    }
    this.config = conf || {};
    this.btnPrev = this.meBox.query('.slide-go-left');
    this.btnNext = this.meBox.query('.slide-go-right');
    this.innerBox = this.meBox.query('.slide-inner');
    this.items = this.meBox.query('.slide-item');
    this.listBox = this.meBox.query('.slide-list');
    this.itemNum = this.meBox.query('.slide-item').length;
    this.ctrlBox = this.meBox.query('.slide-ctrl');
    this.innerBoxWidth = this.innerBox.getRect().width;

    this.autoRunTimer = null;

    this.init = function(){
        var me = this;

        var wItems = me.items;
        if (wItems && wItems.length) {
            me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

            me.listBox.css({'width' : me.itemWidth * wItems.length});

            if(me.config.showCtrl){ me.createCtrl(); }

            if(me.config.autoRun){ me.autoRun( ); }
        }

        this.bindEvent();
    };
    this.resetBoxSize = function(){
        var me = this;
        me.items = me.meBox.query('.slide-item');
        var wItems = me.items;

        if (wItems && wItems.length) {
            me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

            me.listBox.css({'width' : me.itemWidth * wItems.length});

            if(me.config.showCtrl){ me.createCtrl(); }

            if(me.config.autoRun){ me.autoRun( ); }
        }

    };
    this.bindEvent = function(){

        var me = this;
        var config = this.config;

        me.btnPrev.on('click', function(e){
            e.preventDefault();
            var wMe = W(this);
            if (wMe.attr('data-animating')) {
                return ;
            }
            wMe.attr('data-animating', '1');

            me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft - me.innerBoxWidth }, config.animTime||300, function(){
                setTimeout(function(){
                    wMe.attr('data-animating', '');
                }, 200);
            }, QW.Easing.easeOut);
        });
        me.btnNext.on('click', function(e){
            e.preventDefault();
            var wMe = W(this);
            if (wMe.attr('data-animating')) {
                return ;
            }
            wMe.attr('data-animating', '1');

            me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft + me.innerBoxWidth }, config.animTime||300, function(){
                setTimeout(function(){
                    wMe.attr('data-animating', '');
                }, 200);
            }, QW.Easing.easeOut);
        });

        me.meBox.delegate('.ctrl-item', 'click', function(e) {
            e.preventDefault();
            W(this).addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
            var sn = W(this).attr('data-sn') || 0;
            me.go(sn);
        });

        me.meBox.on('mouseenter', function(e){

            clearInterval(me.autoRunTimer);
        });
        me.meBox.on('mouseleave', function(e){
            if(config.autoRun){ me.autoRun(); }
        });
    };

    this.go = function(step){
        var config = this.config;
        step = step || 0;
        this.innerBox.animate({'scrollLeft' : 0 + this.innerBoxWidth*step }, config.animTime||300, function(){}, QW.Easing.easeOut);
    };

    this.autoRun = function(){
        var me = this;
        var config = this.config;

        me.autoRunTimer = setInterval(function(){
            var currSn = me.meBox.query('.ctrl-curr').attr('data-sn')|| 0,
                nextSn = currSn - 0 + 1;
            if( nextSn > me.itemNum-1 ){
                nextSn = 0;
            }
            me.meBox.query('.ctrl-item[data-sn="'+nextSn+'"]').addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
            me.go(nextSn);
        }, typeof(config.autoRun)=='number'? config.autoRun : 5000);
    };

    this.createCtrl = function(e){

        if(this.ctrlBox.query('.ctrl-item').length||this.items.length<2){
            return ;
        }

        str = '';
        for(var i=0, n=this.items.length; i<n; i++){
            str += '<span class="ctrl-item '+(i==0?'ctrl-curr':'')+'" data-sn="'+i+'"></span>';
        }
        this.ctrlBox.html(str);
    };

    this.init();
}