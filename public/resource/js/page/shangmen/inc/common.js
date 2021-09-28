// 公共功能
;(function(){

    window.Shangmen = window.Shangmen || {};

    QW.ObjectH.mix(window.Shangmen, {

        // 首页滑动
        IndexPicSlider : (function(){

            var picCombs ,
                itemWidth,
                unitNum,
                picCombShowNum = 0,
                animTime = 500,
                animTimer = null;

            function runPicAnim(){
                var nowPic = picCombShowNum % picCombs.length;

                W('.btn-list li').removeClass('cur');
                W('.slide-box').animate({'scrollLeft' : nowPic * itemWidth}, animTime, function(){
                    W('.btn-list li').item(nowPic).addClass('cur');
                }, QW.Easing.easeBoth);
            }


            function start( stop ){
                picCombShowNum = window.location.href.queryUrl("start") || 0;

                picCombs = W('.section-0 .top-pic');
                unitNum = picCombs.length;

                _setCombSize();

                W('.btn-list li').on('click', function(){
                    picCombShowNum=W(this).attr('data-sn')-0;

                    clearInterval(animTimer);

                    runPicAnim();

                    if(!stop) {

                        animTimer = setInterval(function () {
                            picCombShowNum++;
                            runPicAnim()
                        }, 5000);
                    }
                });

                //启动
                picCombs.show();
                W('.slide-box')[0].scrollLeft = picCombShowNum * itemWidth;
                if(!stop){
                    animTimer = setInterval(function(){ picCombShowNum ++; runPicAnim()}, 5000);
                }


                /*W('.section-0').on('mouseenter', function(){
                 clearInterval(animTimer);
                 });
                 W('.section-0').on('mouseleave', function(){
                 animTimer = setInterval(function(){ picCombShowNum ++; runPicAnim()}, 5000);
                 });*/

                W(window).on('resize', function(){
                    _setCombSize();
                    runPicAnim();
                });

                function _setCombSize(){
                    itemWidth = W('.slide-box').getSize().width;
                    W('.slide-box .slide-list').css('width',  itemWidth * unitNum);
                    picCombs.css('width', itemWidth);
                }
            }

            return{
                start : start,
                runPicAnim : runPicAnim
            };

        })()



    })


    // 验证表单是否可提交
    function isFormDisabled($form){
        var flag = false;

        if(!$form.length){
            return true;
        }
        if( $form.hasClass('form-disabled') ){
            flag = true;
        }

        return flag;
    }
    tcb.isFormDisabled = tcb.isFormDisabled || isFormDisabled;

    // 设置表单不可提交
    function setFormDisabled($form){
        if(!$form.length){
            return ;
        }
        $form.addClass('form-disabled');
    }
    tcb.setFormDisabled = tcb.setFormDisabled || setFormDisabled;

    // 设置表单可提交
    function releaseFormDisabled($form){
        if(!$form.length){
            return ;
        }
        $form.removeClass('form-disabled');
    }
    tcb.releaseFormDisabled = tcb.releaseFormDisabled || releaseFormDisabled;

}())

Dom.ready(function(){
    var
        Shangmen = window.Shangmen;

    // 上门首页滑动
    if( W('.slide-box').length > 0 ) {
        Shangmen.IndexPicSlider.start(window.location.href.queryUrl('stop') == 'true');
    }

    $('.wx-img-show .slide-go-left').on('click', function(e){
        $('.wx-img-show .tit').html('邮寄维修很安心');
    });

    $('.wx-img-show .slide-go-right').on('click', function(e){
        $('.wx-img-show .tit').html('上门维修很快捷');
    });

    new TuiguangSlide('.wx-img-show .slide-wrap', { animTime : 500 });

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

                if(me.config.showCtrl){ me.creatCtrl(); }

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

                if(me.config.showCtrl){ me.creatCtrl(); }

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
                var currSn = me.meBox.query('.ctrl-curr').attr('data-sn')||0;
                nextSn = currSn - 0 + 1;
                if( nextSn > me.itemNum-1 ){
                    nextSn = 0;
                }
                me.meBox.query('.ctrl-item[data-sn="'+nextSn+'"]').addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                me.go(nextSn);
            }, typeof(config.autoRun)=='number'? config.autoRun : 5000);
        };

        this.creatCtrl = function(e){

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

})
