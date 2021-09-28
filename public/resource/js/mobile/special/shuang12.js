wx.ready(function () {
    var noop = function () {
    };
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title": '双12年终特惠，满1000减100！',
        "desc": '同城帮优品双12年终盛典，全场领券减50，热销机型满1000减100！',
        "link": "http://bang.360.cn/youpin/erhuo",
        "imgUrl": 'https://p.ssl.qhimg.com/t0112e8eeb1263d4ba2.jpg',
        "success": noop, // 用户确认分享的回调
        "cancel": noop // 用户取消分享
    };
    // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
    wx.onMenuShareAppMessage(wxData);
    // 点击分享到朋友圈，会执行下面这个代码
    wx.onMenuShareTimeline(wxData);
    //分享到QQ
    wx.onMenuShareQQ(wxData);
});

$(function () {


//-------------------------------------------------------------
    var __cacheParams= {
        pn: 0,
        // page_size: 20
    };
    var targetTime = new Date('2016/12/10 00:00:00').getTime();
    var is_weixin = window.is_weixin || false;//判断是否为微信打开


    tcb.bindEvent(document.body, {

        '.btn-disabled': function (e) {
            e.preventDefault();
        },
        '.get-coupon-btn': function(e){
            e.preventDefault();
            var $me = $(this);

            var coupon_params = {
                module_type:6,
                code_type:120
            };

            $.get('/youpin/doYouhuiCode',coupon_params,function (res) {

                res = JSON.parse(res);
                if (!res['errno']) {
                    showCouponWrap(res.result);
                    $('.coupon-right .coupon-text-number').text(res.result)
                    $('.get-coupon-btn').css('display','none')
                    $('.coupon-right').css('display','block')
            }else {
                    showNoCouponWrap(res['errmsg'])
                }
            })
        }
    });

    //页面初始化
    function init(){
        clearLocking()

        setKhmsList({
            'pn': __cacheParams.pn,
            // 'page_size': __cacheParams.page_size
        });

        isWeiXin(is_weixin,function(result){
            $('.get-coupon-btn').css('display','none')
            $('.coupon-right .coupon-text-number').text(result[0].code)
            $('.coupon-right').css('display','block')
        })
    }
    init();

    //解锁活动商品
    function clearLocking(){
        if(window.CURRENT_TIME < targetTime){
            $('.lock-block-inner').css('display','block');
        }
    }

    function setKhmsList(params, is_append) {
        getProduct({
            'request_url': '/youpin/aj_get_goods',
            '$tpl': $("#JsMShuang11ProductListTpl"),
            'is_flash': false,
            'num': 10,
            '$target': $(".js-khms-product-list"),
            'request_data': params,
            'is_append': is_append || false,
            callback: function ($target, product_list,params) {

            }
        });
    }
    //通用输出模板变量
    function getProduct(obj) {
        $.get(obj.request_url, obj.request_data, function (res) {
            try {
                res = $.parseJSON(res);

                if (!res['errno']) {

                    var product_list =res['result']['product_list'] || res['result']['good_list'] || res['result']['flash_list'] || res['result'];
                    // 限制显示商品数量
                    product_list.splice(parseInt(obj.num, 10), 9999);

                    // 获取商品列表的html字符串
                    obj.is_today = obj.is_today || false;
                    var html_fn = $.tmpl($.trim(obj.$tpl.html())),
                        html_str = html_fn({
                            'list': product_list,
                            'is_flash': obj.is_flash,
                            'is_today': obj.is_today,
                            'huodong_name': 'shuang12',
                            'pn':obj.request_data.pn
                        });

                    $.each(product_list, function (item, i) {
                        tcb.preLoadImg(item['thum_img']);
                    });
                    // 输出数据  判断是追加还是替换
                    if (obj.is_append) {
                        obj.$target.append(html_str);
                    } else {
                        obj.$target.html(html_str);
                    }


                    setTimeout(function () {
                        tcb.lazyLoadImg({
                            'delay': 0,
                            'interval': 300 // 0:同时显示，其他时间表示实际时间间隔
                        }, obj.$target);
                    }, 300);
                    typeof obj['callback'] === 'function' && obj['callback'](obj.$target, product_list,obj.request_data)

                } else {

                }

            } catch (ex) {
            }

        });

    }


    // 首先判断是否为微信打开  如果为微信打开 查看用户已经存在的优惠券 有的话替换的页面中
    function isWeiXin(is_winxin,callback){
        if(is_weixin) {
            $.get('/youpin/getYouhuiCode', function (res) {
                var
                    res = JSON.parse(res),
                    result = res['result'];

                if (!res['errno']) {
                    typeof  callback && callback(result)
                }
            });
        }
    }

    //优惠码弹层
    function showCouponWrap(coupon_number) {
        $('body').append('<div class="allWrap">' +
            '<div class="inner-Wrap">' +
            '<span>优惠券领取成功！</span>' +
            '<span>您的优惠券号码为：</span>' +
            '<span>'+coupon_number+'</span>' +
            // '<div class="confirm">确定</div>' +
            '</div>' +
            '</div>');
        $('.allWrap').css({
            'z-index':9,
            'position':'fixed',
            'top': 0,
            'left': 0,
            'bottom': 0,
            'right': 0,
            'background':'rgba(0,0,0,.5)',
        });
        $('.allWrap .inner-Wrap').css({
            'z-index': 99,
            'background-color': '#fff',
            'opacity': '.8',
            'width': '50%',
            'position':'absolute',
            'top':'25%',
            'left':'50%',
            'margin-left':'-25%'
        });
        $('.allWrap span').css({
            'display':'block',
            'padding': '.1rem 0',
            'text-align': 'center',
            'color':'#000'
        });
        // $('.confirm').css({
        //     'padding':'.05rem',
        //     'border-top':'1px solid #000',
        //     'text-align':'center'
        // });
        $('.allWrap').on('click',function () {
            $(this).remove()
        })

    }
    function showNoCouponWrap(content) {
        $('body').append('<div class="allWrap">' +
            '<div class="inner-Wrap">' +
            '<span>'+content+'</span>' +
            '</div>' +
            '</div>');
        $('.allWrap').css({
            'z-index':9,
            'position':'fixed',
            'top': 0,
            'left': 0,
            'bottom': 0,
            'right': 0,
            'background':'rgba(0,0,0,.5)',
        });
        $('.allWrap .inner-Wrap').css({
            'z-index': 99,
            'background-color': '#fff',
            'opacity': '.8',
            'width': '50%',
            'position':'absolute',
            'top':'25%',
            'left':'50%',
            'margin-left':'-25%'
        });
        $('.allWrap span').css({
            'display':'block',
            'padding': '.1rem 0',
            'text-align': 'center',
            'color':'#000'
        });
        $('.allWrap').on('click',function () {
            $(this).remove()
        })

    }

});
