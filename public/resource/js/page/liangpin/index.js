// 优品首页js
Dom.ready(function(){
    var wIndexPage = W('.page-liangpin-index');
    if ( !(wIndexPage && wIndexPage.length) ){
        return;
    }

    var Bang = window.Bang = window.Bang || {};

    var wTriggerShowVideo = W('.trigger-show-video')
    if (wTriggerShowVideo && wTriggerShowVideo.length){
        wTriggerShowVideo.on('click', function(e){
            e.preventDefault()

            var html_fn = W('#JsVideoPlayerPanelTpl').html().trim().tmpl(),
                html_st = html_fn()

            tcb.panel('', html_st, {
                className: 'panel-tom01 video-player-panel'
            })
        })
    }

    // 首页顶部轮播图
    new Bang.SimpleSlider ({
        container : '.block-top-banner-slide',
        auto      : 5000,
        start     : 0,
        speed     : 300,
        nav_show  : true
    })

    var HotProductListSlide = new TuiguangSlide('.tg-small', { animTime : 500 });

    tcb.bindEvent(document.body, {
        // 轮播的热门商品
        '#HotProductList .slide-item' : {
            'click'      : function ( e ) {
                var wMe = W ( this ),
                    wTarget = W ( e.target );

                if ( !(wTarget.ancestorNode ( 'a' ).length || wTarget[ 0 ].nodeName.toLowerCase () == 'a') ) {
                    wMe.query ( '.slide-img a' ).click ();
                }
            },
            'mouseenter' : function ( e ) {
                var
                    wMe = W ( this )

                wMe.addClass('slide-item-hover')

            },
            'mouseleave' : function ( e ) {
                var
                    wMe = W ( this )

                wMe.removeClass('slide-item-hover')

            }
        },
        // 关闭
        '.liangpin-prevhead-close': function(e){
            e.preventDefault();

            // W('.liangpin-prevhead').slideUp();
            W('.liangpin-prevhead').slideUp(1000, function(){
                W(this).removeNode();
            });
        },
        // 分享微博
        '.liangpin-prevhead-shareweibo a, .liangpin-lpma-usepanel .share-weibo a': {
            'click': function(e){
                e.preventDefault();

                var url = 'http://bang.360.cn/youpin?f=weibo',
                    from_url = 'http://bang.360.cn/youpin?f=weibo',
                    title_text = '360优品双十一活动火爆进行中！乔布斯留下的经典限量抢购ing！iphone4只要598元！来晚就木有了！小伙伴快来抢吧！→→（'+url+'）关注 @360手机回收 ，还能获得更多机会！',
                    open_url = 'http://service.weibo.com/share/share.php?url='+encodeURIComponent(from_url)+'&type=button&ralateUid=3519606963&language=zh_cn&appkey=766e9&title='+encodeURIComponent(title_text)+'&pic='+encodeURIComponent('https://p.ssl.qhimg.com/t012d06dc09478f2449.png')+'&searchPic=false&style=simple';

                var width = 650,
                    height = 570,
                    left = (window.screen.width-width)/2,
                    top  = (window.screen.height-height)/2;
                window.open(open_url, '_blank');//, 'left='+left+',top='+top+',width='+width+',height='+height
            },
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.ancestorNode('.liangpin-prevhead-shareweibo').addClass('liangpin-prevhead-shareweibo-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.ancestorNode('.liangpin-prevhead-shareweibo').removeClass('liangpin-prevhead-shareweibo-hover');
            }
        },
        // 分享微信
        '.liangpin-prevhead-shareweixin a, .liangpin-lpma-usepanel .share-weixin a': {
            'click': function(e){
                e.preventDefault();
            },
            'mouseenter': function(e){
                var wMe = W(this),
                    rect = wMe.getRect();

                var wWXCode = W('#LPmaWXCode');
                if (!wWXCode.length) {
                    W('body').insertAdjacentHTML('beforeend', '<div class="lpma-wxcode" id="LPmaWXCode"></div>');
                    wWXCode = W('#LPmaWXCode');
                }
                wWXCode.css({
                    'display': 'block',
                    'left': rect['left']+rect['width'],
                    'top': rect['top']
                });
                wMe.ancestorNode('.liangpin-prevhead-shareweixin').addClass('liangpin-prevhead-shareweixin-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                var wWXCode = W('#LPmaWXCode');
                if (wWXCode.length) {
                    wWXCode.hide();
                }

                wMe.ancestorNode('.liangpin-prevhead-shareweixin').removeClass('liangpin-prevhead-shareweixin-hover');
            }
        },
        // 使用LP码优惠购~
        '.liangpin-prevhead-useLP a': {
            'click': function(e){
                e.preventDefault();

                var tmpl_fn  = W('#LPmaUsepanelTpl').html().trim().tmpl(),
                    tmpl_str = tmpl_fn();

                var config = {
                    width:770,
                    height:280,
                    withMask: true
                };

                tcb.panel('', tmpl_str, config);

                bindLPmaUseForm();
            },
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.ancestorNode('.liangpin-prevhead-useLP').addClass('liangpin-prevhead-useLP-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.ancestorNode('.liangpin-prevhead-useLP').removeClass('liangpin-prevhead-useLP-hover');
            }
        },
        // 显示隐藏包装清单
        '.show-baozhuangqingdan-btn': function(e){
            e.preventDefault();

            var wMe = W(this);

            // 收起
            if (wMe.hasClass('hide-baozhuangqingdan-btn')) {
                wMe.removeClass('hide-baozhuangqingdan-btn');

                // window.scrollTo(0, W('.liangpin-prevhead').getXY()[1]);

                wMe.siblings('.show-baozhuangqingdan').slideUp();
            }
            // 展开
            else {
                wMe.addClass('hide-baozhuangqingdan-btn');

                // window.scrollTo(0, wMe.getXY()[1]);

                wMe.siblings('.show-baozhuangqingdan').slideDown();
            }
        }
    });
    // 绑定优品码使用表单
    function bindLPmaUseForm(){
        var wForm = W('#LiangPinLPmaUseForm');
        if (wForm.length) {
            wForm.on('submit', function(e){
                e.preventDefault();

                if (isFormDisabled(wForm)) {
                    return ;
                }
                if (!validLPmaUseForm(wForm)) {
                    return false;
                }

                setFormDisabled(wForm);

                setTimeout(function(){
                    QW.Ajax.get('/youpin/aj_ch_youhui', wForm[0], function(res){
                        try{
                            res = JSON.parse(res);

                            if (!res['errno']) {
                                window.location.href = tcb.setUrl('/youpin/tinfo?product_id='+res['result']+'&num=1&youhui_code='+wForm.query('[name="youhui_code"]').val().trim(), {"from": tcb.queryUrl(location.href,'from')});
                            } else {
                                alert('当前LP码不可用。'+res['errmsg']);
                            }

                        } catch(ex){}

                        releaseFormDisabled(wForm);
                    });
                }, 200);

            });
        }
    }
    // 表单是否可用
    function isFormDisabled(wForm){
        var flag = true;
        if (wForm && wForm.length && !wForm.hasClass('form-disabled')) {
            flag = false;
        }
        return flag;
    }
    // 设置表单为不可用
    function setFormDisabled(wForm){
        if (wForm && wForm.length) {
            wForm.addClass('form-disabled');
        }
    }
    // 释放不可用状态，设置为可用
    function releaseFormDisabled(wForm){
        if (wForm && wForm.length) {
            wForm.removeClass('form-disabled');
        }
    }
    // 验证优品码使用表单
    function validLPmaUseForm(wForm){
        flag = true;

        if (!(wForm&&wForm.length)) {
            return ;
        }

        var wCode = wForm.query('[name="youhui_code"]');
        if (wCode&&wCode.length) {
            var code = wCode.val().trim();
            if (!code) {
                flag = false;
                wCode.shine4Error().focus();
                wCode.siblings('.err').css({
                    'visibility': 'visible'
                });
            }
        }

        if (flag) {
            wCode.siblings('.err').css({
                'visibility': 'hidden'
            });
        }
        return flag;
    }

    //============== 推荐商品 ==============
    // 输出商品
    function renderHotProductList(){

        var wListInner = W('#HotProductList');
        if(wListInner && wListInner.length){

            getData4HotProductList(function(result){

                var list_arr;
                var curtime = result['time'],
                    flash_list   = result['flash_list'],   // 闪购
                    jingpin_list = result['jingpin_list']; // 精品

                if ( !(flash_list && jingpin_list && flash_list.length + jingpin_list.length>4) ){
                    // 限时抢 和 精品商品总数不大于4个，那么左右滑动按钮不可点

                    var
                        $Wrap = wListInner.ancestorNode('.tg-small')
                    $Wrap.query('.slide-go-left').addClass('disabled')
                    $Wrap.query('.slide-go-right').addClass('disabled')
                }

                // 闪购
                if(flash_list && flash_list.length) {
                    _forHotFlash(flash_list, curtime, wListInner);
                    if(flash_list.length<5 && jingpin_list && jingpin_list.length){
                        _forHotJingpin(jingpin_list, wListInner, true);
                    }
                }
                // 精品
                else if (jingpin_list && jingpin_list.length) {
                    _forHotJingpin(jingpin_list, wListInner);
                }

            });

        }
    }
    // 精品
    function _forHotJingpin(jingpin_list, wListInner, flag){
        var list_arr = jingpin_list;

        var html_str = W('#JsHotProductListTpl').html().trim().tmpl()({
            'list': list_arr
        });

        if(flag){
            wListInner.insertAdjacentHTML('beforeend', html_str);
        } else {
            wListInner.html(html_str);
        }

        HotProductListSlide.resetBoxSize();

    }
    // 限时抢
    function _forHotFlash(flash_list, curtime, wListInner){
        var list_arr = flash_list;
        //list_arr[0]['flash_saling']=1;
        //list_arr[0]['flash_status']='saling';

        //for(var i= 0;i<20;i++){
        //    list_arr.push(list_arr[0]);
        //}
        var html_str = W('#JsFlashProductListTpl').html().trim().tmpl()({
            'list': list_arr
        });

        wListInner.html(html_str);

        HotProductListSlide.resetBoxSize();

        // 服务器当前时间(精确到毫秒)
        curtime = Date.parse(curtime.replace(/-/g, '/')) || (new Date()).getTime();
        // 遍历倒计时
        wListInner.query('.countdown').forEach(function(el, i){
            var wEl = W(el),
                curproduct = list_arr[i], // 和当前计时器对应的商品信息
                starttime = curproduct['flash_start_time'].replace(/-/g, '/'),//'2015-11-09 18:00:40',//
                endtime   = curproduct['flash_end_time'].replace(/-/g, '/');//'2015-11-09 16:22:40';//
            starttime = Date.parse(starttime) || 0;
            endtime   = Date.parse(endtime) || 0;
            var $skill = $(el).parent().find(".seckill");
            //curproduct['flash_saling'] = 1;
            //curproduct['flash_status'] = 'saling';

            //alert('flash_saling:'+curproduct['flash_saling']);
            //alert('flash_status:'+curproduct['flash_status']);
            //alert('curtime:'+curtime);
            //alert('starttime:'+starttime);
            //alert('endtime:'+endtime);
            // 开始前倒计时
            if (!curproduct['flash_saling'] && curtime<starttime) {
                //Bang.countdown_desc = '距开始';
                wEl.addClass('countdown-start-prev')
                    .attr('data-descbefore', '距开始')

                Bang.startCountdown(starttime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy-disabled').removeClass('p-buy-disabled').html('立即抢购');

                        //Bang.countdown_desc = '距结束';
                        wEl.removeClass('countdown-start-prev')
                            //.attr('data-descbefore', '距结束')
                            .attr('data-descbefore', ' ')
                        Bang.startCountdown(endtime, starttime, wEl, {
                            'end': function(){
                                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                                wEl.html('已售出').addClass('countdown-end-next');
                                $skill.hide();
                            }
                        });
                    }
                });

            }
            // 抢购进行中&商品未被拍下
            else if (curproduct['flash_saling']==1 && curproduct['flash_status']=='saling' && curtime<endtime) {

                //Bang.countdown_desc = '距结束';
                wEl.removeClass('countdown-start-prev')
                    //.attr('data-descbefore', '距结束')
                    .attr('data-descbefore', ' ')
                Bang.startCountdown(endtime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');
                        wEl.html('已售出').addClass('countdown-end-next');
                        $skill.hide();
                    }
                });

            }
            else {
                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                wEl.html('已售出').addClass('countdown-end-next');
                $skill.hide();
            }

        });
    }
    // 获取商品数据
    function getData4HotProductList(callback){
        var request_url = '/youpin/doGetFlashSaleGoods',
            request_params = {};
        QW.Ajax.get(request_url, request_params, function(res){
            var result = [];
            res = JSON.parse(res);
            if (!res['errno']) {
                result = res['result'];
            }

            typeof callback==='function' && callback(result);
        });
    }
    renderHotProductList();

    // 输出热销机型
    window.Bang.renderProductList({
        $target : W ('.recommend-model-cont-inner'),
        $tpl : W('#JsRecommendModelProductListTpl'),
        request_url : '/youpin/getRecommendProductModel',
        request_params : {
            pn : 0,
            page_size: 5
        },
        col : 5,
        list_key       : '',
        complete: function(result, $target){
            var
                $item = $target.query ('.p-item')

            $item.on('mouseenter',function (e) {
                var wMe = W (this);

                wMe.addClass ('p-item-hover');
            })
            $item.on('mouseleave', function (e) {
                var wMe = W (this);

                wMe.removeClass ('p-item-hover');
            })

        }
    })

});