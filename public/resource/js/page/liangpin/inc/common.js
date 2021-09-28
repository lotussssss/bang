// 公共功能
(function(){
    Dom.ready(function(){
        var statistic_page_class_map = {
            //首页
            'index'   : [ '_trackEvent', 'pc优品', '统计', '首页', '1', '' ],
            // 商品详情页
            'product' : [ '_trackEvent', 'pc优品', '统计', '商品详情页', '1', '' ],
            // 下单页
            'tinfo'   : [ '_trackEvent', 'pc优品', '统计', '下单页', '1', '' ],
            // 搜索页
            'search'  : [ '_trackEvent', 'pc优品', '统计', '搜索页', '1', '' ],
            // 收银台页
            'cashier'  : [ '_trackEvent', 'pc优品', '统计', '收银台页', '1', '' ],
            // 支付成功页
            'paysuccess'  : [ '_trackEvent', 'pc优品', '统计', '支付成功页', '1', '' ]
        }
        if (statistic_page_class_map[ window.__PageSymbol ]) {
            // 添加事件统计
            tcb.statistic (statistic_page_class_map[ window.__PageSymbol ])
        }

        tcb.bindEvent(document.body, {
            // 优品首页、搜索页商品交互
            '.search-result .p-item': {
                'mouseenter': function(e){
                    var wMe = W(this);

                    wMe.addClass('p-item-hover');
                },
                'mouseleave': function(e){
                    var wMe = W(this);

                    wMe.removeClass('p-item-hover');
                }
            },

            // 点击商品
            '.prd-item-awrap, .prd-item .prd-buy': {
                'mousedown': function(e){
                    var $me = $(this),
                        href = $me.attr('href');

                    $me.attr('href', tcb.setUrl(href, {"from": tcb.queryUrl(window.location.href, 'from')}));
                }
            },
            // 无忧换机大礼包
            '.product-detail-wuyouhuanji': function(e){
                e.preventDefault();

                tcb.panel('', W('#JsWuYouHuanJiTipPanelTpl').html().tmpl()(), {
                    className:'extendservice-confirm-panel-wrap wuyouhuanji-tip-panel-wrap'
                });

            },
            // 无忧换机大礼包协议
            '.show-wuyouhuanji-agreement': function(e){
                e.preventDefault();

                tcb.panel('', W('#JsWuYouHuanJiAgreementPanelTpl').html().tmpl()(), {
                    className:'wuyouhuanji-agreement-panel panel-tom01'
                });
            },
            // 新春大礼包
            '.trigger-new-year-customer-gift-shower': function(e){
                e.preventDefault()

                tcb.panel('', W('#JsNewYearCustomerGiftShowerPanelTpl').html().tmpl()(), {
                    className:'extendservice-confirm-panel-wrap new-year-customer-gift-shower-panel-wrap'
                })
            },
            // 年中大促
            '.btn-year-middle-promo': function(e){
                e.preventDefault()

                var
                    qrcode_img = 'https://p.ssl.qhimg.com/t01cd557789c534b36d.jpg',
                    html_st = '<h3>扫码领取618活动优惠码</h3>' +
                        '<div class="desc">仅限6月16～26日</div>' +
                        '<div class="img">' +
                        '<img src="https://p.ssl.qhimg.com/t017ee3be501e423c98.gif" alt="" />' +
                        '</div>'
                tcb.panel('  ', html_st, {
                    className: 'panel-tom01 year-middle-promo-panel'
                })

                setTimeout(function(){

                    tcb.imageOnload(qrcode_img, function(){

                        W('.year-middle-promo-panel .img img' ).attr('src', qrcode_img)
                    })
                }, 200)


                // 添加事件统计
                //tcb.statistic ( [ '_trackEvent', '优惠券促销', '点击领券', '618促销', '1', 'btn-year-middle-promo' ] )
            },

            //右侧新人二维码
            '.js-ewm-unexpand':function (e) {
                e.preventDefault()
                var wMe = W(this)
                W('.js-ewm-expand').css('display','block')
                W('.right-service-inner').hide()
            },
            '.js-ewm-expand':function (e) {
                e.preventDefault()
                var wMe = W(this)
                wMe.hide()
                W('.right-service-inner').show()
            },
            //回到顶部
            '.js-trigger-go-to-top': function (e) {
                e.preventDefault()
                $(window).scrollTop(0)
            },
            // 展示停服公告
            '.js-trigger-show-tingfu-notice': {
                'click': function (e) {
                    e.preventDefault()
                },
                'mouseenter': function (e) {
                    var $BlockNoticeWrap = $('.block-notice-wrap')
                    var $me = $(this)
                    var offset = $me.offset()
                    if (offset.top < 500) {
                        $BlockNoticeWrap.css({
                            bottom: '-485px'
                        })
                    }
                    console.log($me.offset())
                    $BlockNoticeWrap.show()
                },
                'mouseleave': function (e) {
                    $('.block-notice-wrap').hide()
                }
            }
        })

    })

    // 设置许愿postkey
    function setXYPostkey(postkey){
        window.XYPostkey = postkey;
    }
    // 获取许愿postkey
    function getXYPostkey(){
        return window.XYPostkey;
    }

    window.setXYPostkey = setXYPostkey;
    window.getXYPostkey = getXYPostkey;

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

    //心愿 smarty模板变量变为异步取数据（hot_model、model、brand）
    function getXYData(callback) {

        QW.Ajax.get('/youpin/doGetXyModelList',function (res) {
            res = QW.JSON.parse(res)
            if(!res.errno){
                typeof callback == 'function' && callback(res.result)
            }
        })
    }
    tcb.getXYData =  getXYData;

    // 优品许愿
    function lpWishFormSubmit(wWishForm){
        var wWish = wWishForm||W('.wish-form');
        if(!wWish.length){
            return ;
        }
        var
            selector_container = '.wish-cont';

        tcb.getXYData(function (res) {
            // 发布许愿里的型号选择列表
            if(res['brand']&&res['model']){
                window.WishModelSelectList = [res['brand'],res['model']];
            }

            //设置xy_postkey
            W('[name="xy_postkey"]').val( res.xy_postkey);
            setXYPostkey(res.xy_postkey);

            // 设置host_model
            var html_str =  W('#JsXYHotModel').html().trim().tmpl()({
                'list': res['hot_model']
            });
            W('.wish-form .model-list').html(html_str);
            //设置第一个为默认选中
            W('.wish-form .model-list span:first-child').addClass('item-cur');
            var init_price = W('.wish-form .model-list span:first-child').attr('data-wprice'),
                init_model_id = W('.wish-form .model-list span:first-child').attr('data-modelid')
            W('.wish-form .ipt-text').val(init_price);
            wWish.query('[name="model_id"]').val(init_model_id);
        });

        //许愿
        wWish.on('submit', function(e){
            e.preventDefault();
            var F = this;
            var wAmount = W(F).query('[name="amount"]');

            // 金额输入框强制失去焦点，避免输入金额回车后浏览器自带联想内容下拉层不消失
            wAmount.blur();

            if(wAmount && wAmount.length){
                if( !(/^\d+\.?\d*$/).test(wAmount.val()) ){
                    wAmount.shine4Error().focus();
                    return false;
                }
            }
            if(wAmount.val()<50){
                var str_wrap = '<div class="wish-qrcode-wrap" id="WishQrcodeWrap">'
                    +'<div class="row tcenter"><div class="tip mt50">亲，这个价格，<br/>臣妾真的做不到啊！</div></div>'
                    +'<div class="row tcenter"><a href="#" class="wish-again">重新许愿</a></div>'
                    +'</div>';
                var rect = wWish.ancestorNode(selector_container).getRect();
                var wStr_wrap = W(str_wrap);
                wStr_wrap.css({
                    'position': 'absolute',
                    'top': +rect['top'],
                    'left': rect['left'],
                    'width': rect['width'],
                    'height': +rect['height'],
                    'z-index' : 10
                });

                wStr_wrap.appendTo(W('body'));
                wStr_wrap.query('.wish-again').on('click', function(e){
                    e.preventDefault();

                    W(this).un();
                    wStr_wrap.removeNode();
                });
                setTimeout(function(){
                    if(wStr_wrap && wStr_wrap.length){
                        wStr_wrap.query('.wish-again').un();
                        wStr_wrap.removeNode();
                    }
                }, 10000);

                return ;
            }

            W(F).attr('action', '/aj_lp/sub_xinyuan');
            // 设置最新的postkey
            W('[name="xy_postkey"]').val(getXYPostkey());
            QW.Ajax.post(F, function(rs){
                rs = QW.JSON.parse(rs);
                if(rs.errno){
                    alert(rs.errmsg+'，请刷新页面重试');
                }else{
                    setXYPostkey(rs.result.xy_postkey);
                    var str_wrap = '<div class="wish-qrcode-wrap" id="WishQrcodeWrap">'
                        +'<div class="row tcenter"><img src="'+rs.result.qrcode+'" alt=""/><div class="tip">扫码，同步至微信</div></div>'
                        +'<div class="row tcenter">心仪手机一旦出现，我们第一时间通知您</div>'
                        +'</div>';
                    var rect = wWish.ancestorNode(selector_container).getRect();
                    var wStr_wrap = W(str_wrap);
                    wStr_wrap.css({
                        'position': 'absolute',
                        'top': +rect['top'],
                        'left': rect['left'],
                        'width': rect['width'],
                        'height': +rect['height'],
                        'z-index' : 10
                    });

                    wStr_wrap.appendTo(W('body'));
                    setTimeout(function(){
                        if(wStr_wrap && wStr_wrap.length){
                            wStr_wrap.removeNode();
                        }
                    }, 60000);
                    //alert("许愿成功。如果有合适您的手机，我们会及时联系您");
                    //F.reset();
                }
            });
        });
        // 选择心仪的手机型号
        var wItem = wWish.query('.item');

        tcb.bindEvent(wWish,{
            '.item' : function (e) {
                var wMe = W(this);
                // 其他机型
                if(wMe.hasClass('item-other')){
                    // 进入选择机型第一步
                    selectModel(0);
                } else {
                    wMe.addClass('item-cur').siblings('.item-cur').removeClass('item-cur');
                    var model_id = wMe.attr('data-modelid');
                    // 设置选择的型号
                    wWish.query('[name="model_id"]').val(model_id);
                    wWish.query('[name="amount"]').val(wMe.attr('data-wprice'));
                }
            }
        })
        // 设置心仪手机选项文本不能被选择
        tcb.setUnselect(wItem);

        // 选择其他型号
        function selectModel(step, pid){
            step = +step || 0;
            pid = +pid || 0;
            var List = window.WishModelSelectList;
            if( !(List && List.length) ){
                return ;
            }

            var Sub_List = List[step];

            var wWrap = W('#WishModelSelectWrap');
            if( !(wWrap&&wWrap.length) ){
                wWrap = W('<ul id="WishModelSelectWrap" class="wish-model-select-wrap"></ul>');
                wWrap.appendTo(W('body'));
            }
            //wWrap.html('loading');
            var str = '', item, i, len;
            if(step==0){
                str += '<li class="tit">请选择品牌：</li>';
                for(i= 0, len=Sub_List.length; i<len; i++){
                    item = Sub_List[i];
                    str += '<li data-id="'+item['brand_id']+'" data-step="'+step+'">'+item['brand_name']+'</li>';
                }
            } else {
                str += '<li class="tit">请选择型号：</li>';
                Sub_List = Sub_List[pid];
                for(i= 0, len=Sub_List.length; i<len; i++){
                    item = Sub_List[i];
                    str += '<li data-id="'+item['model_id']+'" data-step="'+step+'">'+item['model_name']+'</li>';
                }
            }

            setTimeout(function(){
                var rect = wWish.ancestorNode(selector_container).getRect();
                wWrap.query('li').un();
                wWrap.html(str).css({
                    'position': 'absolute',
                    'top': +rect['top'],
                    'left': rect['left'],
                    'width': rect['width'],
                    'height': +rect['height'],
                    'z-index' : 10
                });
                wWrap.query('li').on('click', function(e){
                    e.preventDefault();

                    var wMe = W(this),
                        step = +wMe.attr('data-step')+1,
                        pid = +wMe.attr('data-id');
                    if(wMe.hasClass('tit')){
                        return ;
                    }
                    // 选择型号最后一步
                    if(step-List.length>-1){
                        wWish.query('[name="amount"]').val('');
                        wWish.query('[name="model_id"]').val(pid);
                        wWish.query('.item-other').html(wMe.html()).addClass('item-cur').siblings('.item-cur').removeClass('item-cur');
                        wWrap.query('li').un();
                        wWrap.removeNode();
                    } else {
                        selectModel(step, pid);
                    }
                });
            }, 0);
        }

        W(document.body).on('mousedown', function(e){
            var target = e.target,
                wTarget = W(target);
            if( !(wTarget.attr('id')=='WishModelSelectWrap' || wTarget.ancestorNode('#WishModelSelectWrap').length) ){
                W('#WishModelSelectWrap li').un();
                W('#WishModelSelectWrap').removeNode();
            }
        });
    }
    tcb.lpWishFormSubmit = tcb.lpWishFormSubmit || lpWishFormSubmit;

}());
