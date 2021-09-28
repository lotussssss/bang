// 提交订单页面交互
(function(){

    Dom.ready(function(){

        var Bang = window.Bang = window.Bang || {};

        // 价格计算对象
        var wProductPriceInfo = W('.orderinfo-totalcount-desc-num');
        var PriceCalculateObj = Bang.PriceCalculate({
            'origin_price': wProductPriceInfo.attr('data-origprice')
        });

        var wAddedServerConfirmPanel;   // 附加服务确认选择面板

        tcb.bindEvent(document.body, {
            // 手机直接下单，获取验证码
            //'.get-mobile-order-secode': function(e){
            //    e.preventDefault();
            //    var wMe = W(this),
            //        txt = wMe.html();
            //
            //    if(wMe.hasClass('get-mobile-order-secode-disabled')){
            //        return;
            //    }
            //
            //    var wMobile = W('#MobileOrderMobile');
            //    if (wMobile.length) {
            //        var mobile = wMobile.val();
            //
            //        if(!tcb.validMobile(mobile)){
            //            wMobile.shine4Error().focus();
            //            return;
            //        }
            //
            //        QW.Ajax.post('/aj/send_lpsecode/', {'mobile' : mobile}, function(res){// [接口废弃]此处js已无处使用
            //            res = QW.JSON.parse(res);
            //            if(res.errno){
            //                alert('抱歉，出错了。'+res.errmsg);
            //            }else{
            //
            //                wMe.addClass('get-mobile-order-secode-disabled').html('60秒后再次发送');
            //                tcb.distimeAnim(60, function(time){
            //                    if(time<=0){
            //                        wMe.removeClass('get-mobile-order-secode-disabled').html(txt);
            //                    }else{
            //                        wMe.html( time + '秒后再次发送');
            //                    }
            //                });
            //            }
            //        });
            //    }
            //},
            // 选择支付方式(方式一)
            '.payinfo-block .payinfo-bank-code': function(e){
                var wMe = W(this),
                    wBankLine = W('.line-bank'),
                    wBankCode = W('[name="bank_code"]');

                if (wMe.val()==='wangyin') {
                    wBankLine.slideDown();
                    var wSelected = wBankLine.query('.selected');
                    if (wSelected.length) {
                        wBankCode.val(wSelected.attr('data-code'));
                    } else {
                        wBankCode.val('')
                    }
                } else {
                    wBankLine.slideUp();
                    wBankCode.val(wMe.val());
                }
            },
            // 选择银行(方式一)
            '.payinfo-block .bank-list li': function(e){
                e.preventDefault();

                var wMe = W(this);

                wMe.addClass('selected').siblings('li').removeClass('selected');

                W('[name="bank_code"]').val(wMe.attr('data-code'));
            },
            // 选择支付方式(方式二)
            '.payinfo-block2 .payinfo-bank-code': function(e){
                var wMe = W(this),
                    wBankLine = W('.line-bank'),
                    wBankCode = W('[name="bank_code"]');

                if (wMe.val()==='wangyin') {
                    wBankLine.slideDown();
                    var wSelected = wBankLine.query('[name="banklist"]');
                    if (wSelected.length) {
                        wBankCode.val(wSelected.val());
                    } else {
                        wBankCode.val('')
                    }
                } else {
                    wBankLine.slideUp();
                    wBankCode.val(wMe.val());
                }

            },
            // 选择支付方式(方式三)
            '.payinfo-block3 .pay-label': function(e){
                var wMe = W(this),
                    wInput = wMe.query('input'),
                    wBankLine = W('.line-bank'),
                    wBankCode = W('[name="bank_code"]');

                if(wMe.query('span').hasClass('pay-daofu-disabled')){
                    return;
                }
                wInput.attr('checked', true);

                var
                    bank_code = wInput.val();

                if (bank_code==='wangyin') {
                    // 网银支付
                    wBankLine.slideDown();
                    var wSelected = wBankLine.query('[name="banklist"]');
                    if (wSelected.length) {
                        wBankCode.val(wSelected.val());
                    } else {
                        wBankCode.val('')
                    }
                } else {
                    // 其他支付[支付宝\微信\货到付款 等]
                    wBankLine.slideUp();
                    wBankCode.val(bank_code);
                }

                var
                    pay_tip_str = '<span style="color: #ff0000;">在线支付，全国包邮！</span>如遇问题，请加qq群：488049033，咨询“优品答疑”'

                if (bank_code==='hdfk'){
                    pay_tip_str = '<span style="color: #ff0000;">货到付款：不包邮，邮费到付！</span>（香港，澳门，台湾地区暂不支持货到付款）'
                }
                W('.zhifu-tips').html(pay_tip_str);

                wMe
                    .addClass('pay-label-checked')
                    .siblings('.pay-label-checked').removeClass('pay-label-checked');
            },
            // 选择银行(方式二)
            '.payinfo-block2 .line-bank [name="banklist"], .payinfo-block3 .line-bank [name="banklist"]': {
                'change': function(e){
                    var wMe = W(this);

                    W('[name="bank_code"]').val(wMe.val());

                }
            },

            // 选择附加服务
            '.added-server-list-checklable': function(e){
                e.preventDefault();

                var wMe = W(this),
                    added_title = wMe.query('.added-server-name').html().trim(),
                    added_img = wMe.attr('data-img'),
                    added_extend_img = wMe.attr('data-extend-img'),
                    added_extend_img_id = wMe.attr('data-extend-img-id'),
                    wServ = wMe.query('[name="value_added_server_list[]"]'),
                    added_id = wServ.val(),
                    added_info = wMe.ancestorNode('.added-server-list-checklable-wrap').siblings('.added-server-info');

                if(wMe.hasClass('added-server-list-checklable-checked')){
                    wMe.removeClass('added-server-list-checklable-checked');
                    wServ.attr('checked', false);

                    added_info.hide();

                    // 重新设置总价
                    setTotalPrice('price_added_server_'+added_id, 0, 0, Promo.oWrap);

                } else {
                    var str = W('#JsLiangPinAddedServerConfirmPanelTpl').html().tmpl()({
                        'added_id': added_id,
                        'added_title': added_title,
                        'added_img': added_img,
                        'added_extend_img': added_extend_img,
                        'added_extend_img_id': added_extend_img_id
                    });

                    wAddedServerConfirmPanel = tcb.panel('', str, {className:'extendservice-confirm-panel-wrap'});
                }

            },
            // 确认附加服务选择
            '.extendservice-confirm-panel-wrap .btn-confirm': function(e){
                e.preventDefault();

                var $me = W(this),
                    added_id = $me.attr('data-id');

                var wChecklable = W('.added-server-list-checklable').filter(function(el){
                        return W(el).attr('data-id')==$me.attr('data-id');
                    }),
                    wServ = wChecklable.query('[name="value_added_server_list[]"]'),
                    added_info = wChecklable.ancestorNode('.added-server-list-checklable-wrap').siblings('.added-server-info');

                wChecklable.addClass('added-server-list-checklable-checked');
                wServ.attr('checked', true );
                // 重新设置总价
                setTotalPrice('price_added_server_'+added_id, wChecklable.attr('data-plusprice'), 0, Promo.oWrap);

                if(wAddedServerConfirmPanel && wAddedServerConfirmPanel.hide){
                    wAddedServerConfirmPanel.hide();
                }
                added_info.show();
            },
            // 取消不选择附加服务
            '.extendservice-confirm-panel-wrap .btn-cancel': function(e){
                e.preventDefault();

                if(wAddedServerConfirmPanel && wAddedServerConfirmPanel.hide){
                    wAddedServerConfirmPanel.hide();
                }

            },
            // 显示扩展协议
            '.extendservice-confirm-panel-wrap .js-open-another-dialog': function(e){
                e.preventDefault();

                var $me = W(this),
                    extend_id = $me.attr('data-extend-id');

                var html_str = '';
                // 无忧换机服务协议
                if (extend_id=='JsWuYouHuanJiAgreementPanelTpl'){
                    html_str = W('#JsWuYouHuanJiAgreementPanelTpl').html().trim().tmpl()();
                }

                tcb.panel('', html_str, {
                    className:'extendservice-agreement-panel panel-tom01'
                });
            }

        });

        function clearCheckedCache(){
            setTimeout(function(){
                W('.added-server-list-checklable').forEach(function(el, i){
                    var wMe = W(el)
                    if (!wMe.hasClass('added-server-list-checklable-checked')){
                        wMe.query('input').attr('checked', false)
                    }
                })
            },10)
        }
        clearCheckedCache()

        // 使用优惠码
        var promo = Promo({
            'service_type': 3,
            'price': $('.orderinfo-totalcount-desc-num').attr('data-origprice'),
            'product_id': $('[name="product_id"]').val(),
            'promo_wrap': '.promo-wrap',
            'succ': function(youhuiPrice, min_sale_price, $promo_wrap){

                // 为对象表示为折扣优惠，否则是优惠金额
                if (typeof youhuiPrice == 'object') {

                    PriceCalculateObj.deleteProductPriceInfoByProp('price_promo');

                    setTotalPrice('origin_price_promo_per', youhuiPrice['promo_per'], min_sale_price, $promo_wrap);

                } else {

                    PriceCalculateObj.deleteProductPriceInfoByProp('origin_price_promo_per');

                    setTotalPrice('price_promo', -youhuiPrice, min_sale_price, $promo_wrap);
                }
            },
            'fail': function($promo_wrap){

                PriceCalculateObj.deleteProductPriceInfoByProp('origin_price_promo_per');

                setTotalPrice('price_promo', 0, 0);
            }
        })

        var hongbao = Hongbao({
            'succ': function(hongbao_amount){
                var $youhui_code = $('[name="youhui_code"]'),
                    youhui_code = $youhui_code.val()

                promo.setPrice(PriceCalculateObj.getProductOriginPrice() - hongbao_amount)

                promo.refreshCoupon(function(coupon_list_able){
                    var flag_has_code = false

                    tcb.each(coupon_list_able, function (i, item) {

                        if(youhui_code==item.code){
                            flag_has_code = true

                            $('[data-code='+youhui_code+']').addClass('coupon-item-checked')
                        }
                    })

                    if(!flag_has_code){
                        $youhui_code.val('')
                        $('.need-promo-checked').removeClass('need-promo-checked')

                        promo.refreshPromoCode()
                    }
                })

                setTotalPrice('price_hongbao', -hongbao_amount)
            },
            'fail': function(){
                var $youhui_code = $('[name="youhui_code"]'),
                    youhui_code = $youhui_code.val()

                promo.setPrice(PriceCalculateObj.getProductOriginPrice() - 0)

                promo.refreshCoupon(function(coupon_list_able){
                    tcb.each(coupon_list_able, function (i, item) {

                        if(youhui_code==item.code){
                            $('[data-code='+youhui_code+']').addClass('coupon-item-checked')
                        }
                    })
                })

                setTotalPrice('price_hongbao', 0)
            }
        })

        // 设置总价+优惠码文案(传入参数为价格增加的变量，当传入负值，表示减去价格)
        function setTotalPrice(prop, plus_price, min_sale_price, $usePromoWrap){

            var orig_price = PriceCalculateObj.getProductOriginPrice();

            PriceCalculateObj.setProductPriceInfo(prop, plus_price);

            var fina_price = PriceCalculateObj.calculateProductPrice();

            fina_price  = Math.max( 0, tcb.formatMoney( fina_price, 2, -1) );

            // 总价格设置
            var price_str = '￥'+ fina_price;
            //if(orig_price != fina_price){
            //    price_str = '<del>￥'+orig_price+'</del> ￥'+ fina_price;
            //}
            $('.orderinfo-totalcount-desc-num').html(price_str);

            // 设置商品价格列表
            setProductPriceList();

        }
        setProductPriceList();
        // 设置商品价格列表
        function setProductPriceList(){
            var
                p = PriceCalculateObj,

                origin_price = p.getProductOriginPrice(),
                price_hongbao = p.getProductPriceInfoByProp('price_hongbao') || 0,
                price_promo = p.getProductPriceInfoByProp('price_promo') || 0,
                origin_price_promo_per = p.getProductPriceInfoByProp('origin_price_promo_per') || 0

            price_hongbao = Math.abs(price_hongbao || 0)
            //价格列表-红包抵扣
            $('.hongbao-price').html('-￥'+price_hongbao.toFixed(2))

            // 有折扣的话优先计算折扣
            if(origin_price_promo_per){
                price_promo = tcb.formatMoney( origin_price*(100-origin_price_promo_per)/100, 0, 1)
            }

            price_promo = Math.abs(price_promo || 0)

            //价格列表-商品原价
            $('.product-price').html('￥'+origin_price)

            var
                color = price_promo > 0 ? '#FE4B00' : '#333'
            //价格列表-优惠折扣
            $('.discount-price').html('-￥'+price_promo.toFixed(2))

            //价格列表-附加服务
            var
                extend_service_price_sum = 0
            $('.added-server-list-checklable-checked').each(function(index,el){
                var
                    me = $(el)

                extend_service_price_sum += me.attr('data-plusprice') - 0
            })
            $('.extend-service-price').html('￥'+extend_service_price_sum.toFixed(2))
        }

        // 默认选中第一个支付方式
        var
            $PayLabel = W ( '.payinfo-block3 .pay-label' )
        if ( $PayLabel && $PayLabel.length ) {
            $PayLabel.first ().fire ( 'click' )
        }
        // 重置登录框的位置
        function resetLoginPanelPosition () {
            var
                $LoginPanel = W ('.tinfo-login-panel')
            if ($LoginPanel && $LoginPanel.length) {

                var
                    rect = $LoginPanel.getRect (),
                    width = rect[ 'width' ],
                    win_rect = QW.DomU.getDocRect (),
                    win_width = win_rect[ 'width' ],
                    doc_width = win_rect[ 'scrollWidth' ],
                    doc_height = win_rect[ 'scrollHeight' ],
                    left = (win_width - width) / 2

                if (left > 0) {
                    $LoginPanel.css ({
                        'left'   : left,
                        'margin' : '0'
                    })
                }

                var
                    $LoginPanelMask = W ('.tinfo-login-cover')

                $LoginPanelMask.css ({
                    'width'  : doc_width,
                    'height' : doc_height
                })
            }
        }

        resetLoginPanelPosition ()

    });

    // 设置下单按钮行浮动效果
    function setSubmitLineFloat(){
        var submit_btn = $('.line-submit'),
            submit_btn_placeholder = $('.line-submit-placeholder')

        if (submit_btn.length && submit_btn_placeholder.length){
            $(window).on('scroll resize',function(){
                var
                    submit_btn_top = submit_btn_placeholder.offset().top + submit_btn.height(),
                    win_height = $(window).height(),
                    min_scroll_h =  submit_btn_top -win_height,
                    scroll_h = $(window).scrollTop();

                if(scroll_h<=min_scroll_h){
                    submit_btn.css({'position':'fixed','left':'50%','margin-left':'-600px','bottom':'0'});
                }else{
                    submit_btn.css({'position':'static','margin-left':'0px'});
                }
            });
        }
    }
    setSubmitLineFloat()

}());

