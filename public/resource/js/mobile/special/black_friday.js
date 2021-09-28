wx.ready(function () {
    var noop = function () {
    };
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title": '黑色星期五，百款机型秒杀！',
        "desc": '同城帮优品黑色星期五狂欢，百款机型秒杀不停，抢完无补！',
        "link": "http://bang.360.cn/youpin/erhuo",
        "imgUrl": 'https://p.ssl.qhimg.com/t011a6d190b5d0093c9.png',
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

    var forwardAndBack = (function () {
        function setHash(params) {
            if($.isPlainObject(params)){
                var hash = '';
                for(var key in params){
                    hash += key+'='+params[key]+'&'
                }
                hash =  '#' + hash.slice(0,hash.length-1)
                var url = location.origin + location.pathname + hash;
                location.replace(url)
            }
        }
        function getHash() {
            var hash = location.hash.slice(1);
            var hashArr = hash.split('&');
            var params_data = {}
            hashArr.forEach(function (item) {
                var itemArr = item.split('=');
                params_data[itemArr[0]] = itemArr[1]
            })
            return params_data;
        }
        return {
            setHash: setHash,
            getHash: getHash
        }
    })();
//-------------------------------------------------------------
    var __cacheParams= {
        pn: 0,
        page_size: 20
    };
        setKhmsList({
            'pn': __cacheParams.pn,
            'page_size': __cacheParams.page_size
        });
    // if(location.hash == '') {
    //     setKhmsList({
    //         'pn': __cacheParams.pn,
    //         'page_size': __cacheParams.page_size
    //     });
    //     forwardAndBack.setHash(__cacheParams)
    // }else {
    //     var hash_params = forwardAndBack.getHash();
    //     __cacheParams.pn = hash_params.pn;
    //
    //     for(var i = 0, l =__cacheParams.pn;i<= l;i++){
    //         hash_params.pn = i;
    //         setKhmsList(hash_params,true);
    //     }
    // }

    //点击toTop
    $(window).on('scroll',function () {
        if($(window).scrollTop()>300){
            $('.top-fix').show(1000)
        }else {
            $('.top-fix').hide(1000)
        }
    });

    tcb.bindEvent(document.body, {
        '.top-fix': function () {
            $(document.body).animate({scrollTop:'0px'}, '1000')
        },
        '.btn-disabled': function (e) {
            e.preventDefault();
        }
    })




    //点击加载更多
    $('.get-more').on('click', function (e) {
        e.preventDefault();
            setKhmsList({
                'pn': ++__cacheParams.pn,
                'page_size': __cacheParams.page_size
            }, true);
        // forwardAndBack.setHash(__cacheParams)
    })


    function setKhmsList(params, is_append) {
        getProduct({
            'request_url': '/youpin/doGetBlack5FlashSalGoods',
            '$tpl': $("#JsMShuang11ProductListTpl"),
            'is_flash': true,
            'num': 20,
            '$target': $(".js-khms-product-list"),
            'request_data': params,
            'is_append': is_append || false,
            callback: function ($target, product_list,params) {
                countDownTime(product_list,params);
                if(product_list.length<20){
                    // $(".js-khms-product-list").append('<div class="no-more">没有更多商品了</div>')
                    // $('.get-more').off('click');
                    // $('.get-more').remove();
                    $('.block-more').remove();

                }
            }
        });
    }

    function countDownTime(product_list,params) {
        var current_time = window.CURRENT_TIME || Date.now();
        // var current_time = new Date().getTime();
        //取出开始时间和结束时间
        $('.js-countdown'+params.pn).each(function (i, item) {
            var target_time,
                $me = $(this);
            var start_time = product_list[i]['flash_start_time'].replace(/-/g, '/'),
                end_time = product_list[i]['flash_end_time'].replace(/-/g, '/');
            start_time = (new Date(start_time)).getTime();
            end_time = (new Date(end_time)).getTime();

            if (current_time < start_time) {
                target_time = start_time;
                $me.attr('data-descbefore', '距开始');

            } else if (current_time > start_time && current_time < end_time) {
                target_time = end_time;
                $me.attr('data-descbefore', '距结束');
            } else if (current_time > end_time) {
                $me.hide()
                $me.closest('a').append('<div class="btn-qiang btn-disabled"></div>');
                return;
            }
            $Target = $(this);
            // 开启倒计时
            Bang.startCountdown(target_time, current_time, $Target, {
                start: function () {
                    // 倒计时开始前
                },
                process: function (current_time) {
                    // 倒计时ing
                },
                end: function () {
                    // 倒计时结束
                    // do something at end
                    countDownTime();
                }
            })
        })
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
                            'huodong_name': 'erhuo_jinqiu',
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

});
