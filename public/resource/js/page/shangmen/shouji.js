// 手机维修
Dom.ready(function(){

    if (!W('.page-shangmen-shouji').length) {
        return ;
    }

    tcb.bindEvent(document.body, {
        // 切换维修设备类型
        '.type-tab a': function(e){
            e.preventDefault();

            var wMe = W(this),
                pos = wMe.attr('data-pos');

            wMe.addClass('tab-selected').siblings('.tab-selected').removeClass('tab-selected');

            // 滑动切换手机、平板服务项
            runBoxItemAnim(pos);
        },
        // 展开更多可选维修内容
        '.fault-list .item-more': function(e){
            e.preventDefault();

            var box = W('.fault-more-list');
            if( !box.attr('data-oheight') ){
                var oH = box.getRect().height;
                if (oH){
                    box.attr('data-oheight', oH);
                } else {
                    oH = box.show().getRect().height;
                    box.attr('data-oheight', oH).hide();
                }
            }

            var oHeight = box.attr('data-oheight');
            if( box.css('display')=='none' ){
                box.show().css('height', 0).addClass('anim-box').animate({height: oHeight}, 300, function(){
                    box.removeClass('anim-box');
                });
            }else{
                box.addClass('anim-box').animate({height: 0}, 300 , function(){
                    box.removeClass('anim-box').hide();
                });
            }
        },
        //切换二级分类故障
        '.main-fault-list .item' :{
            'mouseenter':function(e){
                e.preventDefault();
                $(this).addClass('item-cur').siblings().removeClass('item-cur');
                $('.sub-fault-list .sub-fault-box').eq($(this).index()).addClass('sub-fault-box-cur').siblings().removeClass('sub-fault-box-cur');
            }
        }
    });

    // 滑动切换手机、平板服务项
    function runBoxItemAnim(pos){
        var wBox = W('.slide-box2'),
            w = wBox.getRect().width;
        wBox.animate({
            'scrollLeft' : pos * w
        }, 800, function(){}, QW.Easing.easeBoth);
    }

    // 设置维修列表的基本宽度样式
    function setBoxSize(){
        var wBox = W('.slide-box2'),
            wList = wBox.query('.slide-list'),
            wItem = wBox.query('.slide-item'),
            w = wBox.getSize().width,
            i_count = wItem.length;

        wList.css('width',  w * i_count);
        wItem.css('width', w);
        wItem.removeClass('slide-item-hide');
    }
    setBoxSize();

    W(window).on('resize', function(){
        setBoxSize();
    });

    // 顶部banner小动画
    function topBannerAnim(){
        var wBanner = W('.top-banner'),
            wItem = wBanner.query('.item');

        wItem.item(0).css({
            'display': 'block',
            'z-index': 9
        }).siblings('.item').hide();

        if (wItem.length<2){
            return
        }
        setTimeout(function(){
            var arg = arguments;

            wItem = wBanner.query('.item');

            var wFirst  = wItem.item(0),
                wSecond = wItem.item(1);
            wSecond.css({
                'display': 'block',
                'z-index': 8,
                'opacity': 1
            });

            wFirst.animate({
                'opacity':{'from':1, 'to':0}
            }, 1000, function(){

                wFirst.css({
                    'display': 'none',
                    'z-index': 0
                }).appendTo(wBanner);

                wSecond.css({
                    'z-index': 9
                });

                setTimeout(arg.callee, 4000);
            });

        }, 4000);
    }
    topBannerAnim();

    //手机故障分两级
    function getFaultList(){
        var request_url = '/shangmen/aj_get_fault_group';
        $.get(request_url,{
            //group_type 1、手机; 2、Pad; 3、PC; 默认不传或不合法时，返回所有故障
            'group_type':1
        }, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {
                    var fault_list = res['result'];
                    var html_fn = W('#JsFaultListTpl').html().trim().tmpl();
                    var html_str = html_fn({
                            'list': fault_list
                        });
                    $('.js-fault-list').html(html_str);

                    var sub_fault_arr = [];
                    for(var i=0; i<fault_list.length; i++){
                        sub_fault_arr.push(fault_list[i].list);
                    }
                    var sub_html_fn = W('#JsSubFaultListTpl').html().trim().tmpl();
                    var sub_html_str = sub_html_fn({
                        'list': sub_fault_arr
                    });
                    $('.js-sub-fault-list').html(sub_html_str);

                } else {

                }

            } catch (ex){
                //console.log(ex);
            }

        });
    }
    //getFaultList();


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

});