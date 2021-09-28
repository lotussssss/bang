$(function(){

    // 顶部banner小动画
    function topBannerAnim(){
        var
            __C = tcb.cache('top_banner_nav_timeout_handle', {}),
            // 渐变切换中时的点击队列(切换位置)
            queue_switching_click = [],
            // 切换ing
            flag_switching = false

        // 设置nav的初始位置
        tcb.cache('top_banner_nav_pos', 0);

        var
            $nav = $('.banner-nav'),
            $nav_item = $nav.find('span');

        // 切换颜色
        $nav_item.on('click', function(e){
            e.preventDefault();

            var
                $me = $(this),
                pos = parseInt( $me.index(), 10)

            if (flag_switching){
                // 切换ing

                queue_switching_click.push(pos)
            } else {

                // 切换触发时清空队列
                queue_switching_click = []

                switchFade(pos, function(){

                    if (queue_switching_click && queue_switching_click.length){
                        // 有待切换队列,执行切换....
                        var
                            last_click_pos = queue_switching_click.pop()

                        queue_switching_click = []

                        // 触发最后一个点击点的click事件
                        $nav_item.eq(last_click_pos).trigger('click')

                    } else {

                        autoSwitch()
                    }

                })

            }
        })

        // 渐变切换
        function switchFade(pos, callback){
            clearTimeout(__C['handle'])

            var
                cur_pos = tcb.cache('top_banner_nav_pos')||0,
                tar_pos

            if (typeof pos!=='number') {
                callback = pos;
                pos = cur_pos+1;
            }
            tar_pos = tcb.cache('top_banner_nav_pos', pos)

            var
                $banner = $('.top-banner'),
                $items  = $banner.find('.item')

            var
                $nav = $('.banner-nav'),
                $nav_item = $nav.find('span');

            // tar_pos的有效值应该为0到$items.length-1,
            // 当tar_pos的值为$items.length时,标识已经轮播的最后一个,需要循环轮播显示第一个
            if ($items.length === tar_pos){
                tar_pos = tcb.cache('top_banner_nav_pos', 0);
            }

            var // 当前slide
                $current = $items.eq(cur_pos),
                // 目标slide
                $target  = $items.eq(tar_pos)

            $nav_item.eq(tar_pos).addClass('cur').siblings('.cur').removeClass('cur');

            if (cur_pos==tar_pos){
                // 当前slide和目标slide为同一个,那么直接执行回调,并且返回,不执行其他操作

                typeof callback === 'function' && callback();

                return
            }

            // 渐变切换指定两个元素,然后执行回调函数
            switchFadeElement($current, $target, callback)

        }

        // 渐变切换指定两个元素,然后执行回调函数
        function switchFadeElement($current, $target, callback){

            if (flag_switching){
                // 在切换ing,不再执行下边操作,直接返回

                return
            }

            // 设置开始切换ing
            flag_switching = true

            // step1: 隐藏当前元素以外其他元素(设置当前元素z-index)
            $current.css({
                'display': 'block',
                'z-index': 9,
                'opacity': 1
            }).siblings('.item').hide();
            // step2: 显示目标元素(设置目标元素z-index小于当前元素)
            $target.css({
                'display': 'block',
                'z-index': 8,
                'opacity': 1
            });

            // step3: 执行渐变动画效果
            $current.animate({
                'opacity': 0
            }, 1200, function(){

                $current.css({
                    'display': 'none',
                    'z-index': 0
                })

                $target.css({
                    'z-index': 9
                })

                // 动画执行完毕
                flag_switching = false

                // 执行回调
                typeof callback === 'function' && callback()
            })
        }

        // 自动切换
        function autoSwitch(){
            __C['handle'] = setTimeout(function(){

                var args = arguments;

                switchFade(function(){

                    __C['handle'] = setTimeout(args.callee, 4000);

                });

            }, 4000)
        }

        autoSwitch()
    }
    topBannerAnim()




    $('.slide-go-left').on('click', function(e){
        $('.block6 .tit').html('邮寄维修很安心');
    });

    $('.slide-go-right').on('click', function(e){
        $('.block6 .tit').html('上门维修很快捷');
    });

    new TuiguangSlide('.block6 .block_inner', { animTime : 500 });

    /**
     * 推广slide类
     * 使用 new TuiguangSlide('.slide-box');
     * @param {selector} box  [description]
     * @param {[type]} conf [description]
     */
    function TuiguangSlide(box, conf){
        var me = this;

        this.meBox = $(box);
        // 找不到需要处理的容器，直接返回
        if(!this.meBox.length){
            return ;
        }
        this.config = conf || {};
        this.btnPrev = this.meBox.find('.slide-go-left');
        this.btnNext = this.meBox.find('.slide-go-right');
        this.innerBox = this.meBox.find('.slide-inner');
        this.items = this.meBox.find('.slide-item');
        this.listBox = this.meBox.find('.slide-list');
        this.itemNum = this.meBox.find('.slide-item').length;
        this.ctrlBox = this.meBox.find('.slide-ctrl');
        this.innerBoxWidth = this.innerBox.width();

        this.autoRunTimer = null;

        this.init = function(){
            var me = this;

            var wItems = me.items;
            if (wItems && wItems.length) {
                me.itemWidth = wItems.width() + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.creatCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

            this.bindEvent();
        };
        this.resetBoxSize = function(){
            var me = this;
            me.items = me.meBox.find('.slide-item');
            var wItems = me.items;

            if (wItems && wItems.length) {
                me.itemWidth = wItems.width() + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

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

                var wMe = $(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft - me.innerBoxWidth }, config.animTime||300, 'easeInQuad', function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                });
            });
            me.btnNext.on('click', function(e){
                e.preventDefault();
                var wMe = $(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft + me.innerBoxWidth }, config.animTime||300, 'easeInQuad', function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                });
            });

            me.meBox.delegate('.ctrl-item', 'click', function(e) {
                e.preventDefault();

                $(this).addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                var sn = $(this).attr('data-sn') || 0;
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
            this.innerBox.animate({'scrollLeft' : 0 + this.innerBoxWidth*step }, config.animTime||300, 'easeInQuad', function(){});
        };

        this.autoRun = function(){
            var me = this;
            var config = this.config;

            me.autoRunTimer = setInterval(function(){
                var currSn = me.meBox.find('.ctrl-curr').attr('data-sn')||0;
                nextSn = currSn - 0 + 1;
                if( nextSn > me.itemNum-1 ){
                    nextSn = 0;
                }
                me.meBox.find('.ctrl-item[data-sn="'+nextSn+'"]').addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                me.go(nextSn);
            }, typeof(config.autoRun)=='number'? config.autoRun : 5000);
        };

        this.creatCtrl = function(e){

            if(this.ctrlBox.find('.ctrl-item').length||this.items.length<2){
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