(function () {
    function bindEvent($promo_wrap, options){
        var flag_click = true;

        tcb.bindEvent($promo_wrap.get(0), {
            //点击使用优惠码/券
            '.need-promo-checkable':function (e){
                var me = $(this),
                    checkbox = me.find('.checkbox'),
                    promo_cont = $('.block-promo-cont'),
                    youhui_code = $promo_wrap.find('[name="youhui_code"]');//hidden input

                //输出优惠券
                // if(flag_click){
                //     getCoupon({
                //         '$tpl':W("#JsPromoTpl"),
                //         '$target' : $promo_wrap.find('.block-promo-cont')
                //     });
                //     flag_click = false;
                // }

                //if (!youhui_code.val()){
                //    if (me.hasClass('need-promo-checked')){
                //        promo_cont.slideUp()
                //        me.removeClass('need-promo-checked')
                //    } else {
                //        promo_cont.slideDown()
                //        me.addClass('need-promo-checked');
                //    }
                //} else {
                //    me.addClass('need-promo-checked');
                //    promo_cont.slideToggle()
                //}

                //优惠码/券展开收起交互
                promo_cont.slideToggle('slow',function (){
                    if (me.hasClass ('need-promo-checked') && !youhui_code.val ()) {
                        me.removeClass ('need-promo-checked');
                    } else {
                        me.addClass ('need-promo-checked');
                    }
                })

            },
            //输入优惠码
            '.code-input':{
                'change':function (e){
                    var me = $(this),
                        btn_use_code = me.siblings('.btn-use-code'),
                        code_tips = $promo_wrap.find('.code-tips');
                    if(me.val().trim().length){
                        btn_use_code.removeClass('btn-disabled');
                    }else{
                        btn_use_code.addClass('btn-disabled');
                    }
                    code_tips.html('');
                },
                'keyup':function (e){
                    var me = $(this),
                        btn_use_code = me.siblings('.btn-use-code'),
                        code_tips = $promo_wrap.find('.code-tips');
                    if(me.val().trim().length){
                        btn_use_code.removeClass('btn-disabled');
                    }else{
                        btn_use_code.addClass('btn-disabled');
                    }
                    code_tips.html('');
                },
                //防止回车直接提交订单表单
                'keydown':function (e){
                    if(e.keyCode == 13){
                        e.preventDefault();
                    }
                }
            },
            //使用优惠码
            '.btn-use-code':function (e){
                e.preventDefault();
                var me = $(this),
                    code_input = me.siblings('.code-input'),
                    youhui_code = $promo_wrap.find('[name="youhui_code"]'),//hidden input
                    coupon_item = $promo_wrap.find('.coupon-able .coupon-item');

                coupon_item.removeClass('coupon-item-checked');
                if(!me.hasClass('btn-disabled')){
                    youhui_code.val(code_input.val()).trigger('change');
                }
            },
            //点击优惠券
            '.coupon-able .coupon-item':function (e){
                var me = $(this),
                    code_tips = $promo_wrap.find('.code-tips'),
                    code_input = $promo_wrap.find('.code-input'),
                    youhui_code = $promo_wrap.find('[name="youhui_code"]');//hidden input

                code_tips.html('');
                code_input.val('');
                if(me.hasClass('coupon-item-checked')){
                    me.removeClass('coupon-item-checked');
                    youhui_code.val('');
                }else{
                    me.addClass('coupon-item-checked').siblings('.coupon-item-checked').removeClass('coupon-item-checked');
                    youhui_code.val(me.attr('data-code'));
                }
                youhui_code.trigger('change');
            }

        })
        //hidden框值改变触发优惠码验证
        $promo_wrap.find('[name="youhui_code"]').on('change', function (){
            //alert('hidden改变啦')
            var me = $(this);
            validPromoCode(me,options);
        })
    }

    //添加优惠券信息
    function addUserPromoInfo($promo_wrap) {
        getCoupon({
            '$tpl':$("#JsPromoTpl"),
            '$target' : $promo_wrap.find('.block-promo-cont'),
            '$youhui_count_wrap': $promo_wrap.find('.youhui-count')
        })
    }

    //更新优惠券信息
    function refreshCoupon(callback) {
        var $promo_wrap = $('.promo-wrap')
        getCoupon({
            '$tpl':$("#JsPromoTpl"),
            '$target' : $promo_wrap.find('.block-promo-cont'),
            '$youhui_count_wrap': $promo_wrap.find('.youhui-count'),
            'callback': callback
        })
    }

    /**
     * 验证优惠码（优惠码优惠券都需验证）
     *
     * @param $obj      提交表单的hidden input框的优惠码
     * @param options
     *          promo_wrap : options['promo_wrap']
     *          service_type : options['service_type'] // 使用优惠码的产品类型，1：自营 ，2：回收，3：优品
     *          price: options['price']||0,
     *          product_id: options['product_id'],
     *          succ: options['succ'],
     *          fail: options['fail']
     */
    function validPromoCode($obj,options){
        var youhui_code_value = $obj.val(),
            $promo_wrap = $(options['promo_wrap']),
            code_tips = $promo_wrap.find('.code-tips'),
            params = {
            'youhui_code': youhui_code_value,
            'service_type': options['service_type'],
            'price': options['price'],
            'product_id': options['product_id']
        };


        $.post(options['url']||'/aj/doGetYouhuiAmount', params,function(res){
            try{
                res = $.parseJSON(res);
            }catch (ex){
                res = {'errno':'error'};
            }

            if(res.errno){
                var errmsg = '抱歉，'+(res.errmsg?res.errmsg+'，':'')+'优惠码验证失败。';
                //alert('错')
                //优惠码验证失败，hidden框清空，显示错误提示
                $obj.val('');
                if(youhui_code_value){
                    code_tips.html(errmsg);
                }

                if(typeof options['fail']==='function') {
                    options['fail']($promo_wrap);
                }
            }else{
                var promo_amount = res.result['promo_amount'] || 0, // 优惠价格
                    promo_per    = res.result['promo_per'] || 0;    // 折扣量
                // 折扣优先
                if (promo_per) {
                    promo_amount = {
                        'promo_per': promo_per
                    }
                }

                var min_sale_price = parseFloat(res.result['full_cut']) || 0; // 最小折扣价

                if(typeof options['succ']==='function'){
                    options['succ'](promo_amount, min_sale_price, $promo_wrap);
                }
                //优惠码验证成功，优惠码和优惠券收起
                $promo_wrap.find('.block-promo-cont').slideUp();
            }
        });
    }

    //获取、输出优惠券数据
    function getCoupon (options) {
        var product_id = tcb.queryUrl(window.location.search, 'product_id'),
            redpacket_code = $('[name="redpacket_code"]').val()

        if (!product_id){
            product_id = window.location.pathname
                .replace('/youpin/product/', '')
                .replace('.html', '')
        }

        $.post ('/youpin/doGetYouhuiCodeList',{
            product_id:product_id,
            redpacket_code:redpacket_code
        }, function (res) {
            try {
                res = $.parseJSON (res);

                if (!res[ 'errno' ]) {

                    var coupon_list_able = res['result']['youhui_list_valid' ],
                        coupon_list_disable = res['result']['youhui_list_invalid'],
                        coupon_list_able_count = coupon_list_able.length;

                    // 获取优惠券列表的html字符串
                    var html_fn = options.$tpl.html().trim().tmpl(),
                        html_str = html_fn ({
                            'list_able': coupon_list_able,
                            'list_disable': coupon_list_disable
                        });

                    // 输出数据
                    options.$target.html (html_str);

                    // //展示可用优惠券的文案
                    if(options.$youhui_count_wrap && options.$youhui_count_wrap.length>0){
                        if(coupon_list_able_count>0){
                            options.$youhui_count_wrap.html(coupon_list_able_count+'张优惠券可用')
                        }else {
                            options.$youhui_count_wrap.html('暂无优惠券可用')
                        }
                    }

                    typeof options.callback==='function' && options.callback(coupon_list_able)

                } else {

                }

            } catch (ex) {}

        });
    }

    window.Promo = function(options){
        //优先使用传入参数
        options = tcb.mix({
            'url': '/aj/doGetYouhuiAmount',
            'service_type': '',
            'price': 0,
            'product_id': '',
            'promo_wrap': '.promo-wrap',//调用未传值使用默认值
            'succ': function(){},
            'fail': function(){}
        }, options, true)

        var $promo_wrap = $(options['promo_wrap'] || '.promo-wrap'),//防止调用传空值覆盖默认值
            $youhui_code = $promo_wrap.find('[name="youhui_code"]');

        if( !($promo_wrap&&$promo_wrap.length) ){
            return;
        }

        // 绑定优惠码验证、操作等事件
        bindEvent($promo_wrap, options);

        //添加优惠券信息
        addUserPromoInfo($promo_wrap)

        // 刷新优惠码验证
        function refreshPromoCode(){
            $youhui_code.trigger('change');
        }
        // 设置商品价格
        function setPrice(price){
            options['price'] = price;
        }
        // 设置商品id
        function setProductId(product_id){
            options['product_id'] = product_id;
        }

        return {
            oWrap: $promo_wrap,
            setPrice: setPrice,                // 设置商品价格
            setProductId: setProductId,        // 设置商品id
            refreshPromoCode: refreshPromoCode, // 刷新优惠码验证
            refreshCoupon:refreshCoupon
        };
    }
}())
