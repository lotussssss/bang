//赠品提示
var PresentPop = function(img, link){
    this._presetnPop = null;
    var hideTimeout = 300;
    var showOffset = { left: 10, top : -60 };
    var hideTimer;

    this.init = function( img, link ){
        var box = W('<div class="ui-present-pop"><img src="'+img+'" alt="" /></div>').appendTo(W('body')).css({
            'position' : 'absolute',
            'box-shadow' : '1px 1px 3px #999',
            'z-index' : '1000',
            'background-color' : '#fff',
            'min-width' : '100px',
            'min-height' : '80px'
        }).hide();

        if(link){
            W('<a href="'+link+'" target="_blank" class="detail-info">查看详情&gt;&gt;</a>' ).appendTo( box ).css({
                'position' : 'absolute',
                'left' : 0,
                'bottom' : 0,
                'width' : '100%',
                'padding' : '20px',
                'text-align' : 'center'
            });
        }

        this._presetnPop = box;

        var me = this;
        box.on('mouseenter', function(e){

            hideTimer && clearTimeout(hideTimer);

            if( me._presetnPop.css('display')!='none' ){return;}
            me.show();
        });

        box.on('mouseleave', function(e){
            if( me._presetnPop.css('display')=='none' ){return;}
            hideTimer = setTimeout(function(){
                me.hide();
            }, hideTimeout);

        });
    }

    this.show = function(pos){
        this._presetnPop.show()
        if(pos){
            this._presetnPop.css({
                'left' : pos.left -0 + showOffset.left,
                'top' : pos.top -0 + showOffset.top
            });
        }
    }

    this.hide = function(){
        this._presetnPop.hide();
    }

    this.bind = function(obj){
        var me = this;
        W(obj).on('mouseenter', function(e){
            var wRect = W(this).getRect();
            hideTimer && clearTimeout(hideTimer);

            if( me._presetnPop.css('display')!='none' ){return;}
            me.show({
                left: wRect.left -0 + wRect.width,
                top : wRect.top
            });
        });

        W(obj).on('mouseleave', function(e){
            if( me._presetnPop.css('display')=='none' ){return;}
            hideTimer = setTimeout(function(){
                me.hide();
            }, hideTimeout);

        });
    }

    this.init(img, link);
};