;
!function () {

    wxData = {
        "title": "体面过大年，甜蜜在心间",
        "desc": "同城帮短“租”特别活动，助您体体面面过年，轻轻松松拥有！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl"  : 'https://p0.ssl.qhmsg.com/t01e5d1fd4908136843.png',
        "success" : function () {}, // 用户确认分享的回调
        "cancel"  : tcb.noop // 用户取消分享
    }

    if (typeof wx !== 'undefined'){
        // 微信分享
        wx.ready ( function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage ( wxData )
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline ( wxData )
            //分享到QQ
            wx.onMenuShareQQ ( wxData )
        })
    }

    getProductListByPirse('235',function (res) {
        var $target = $('.js-export-product-list')
        renderProduct($target,res)
    })
    //获取商品列表
    function getProductListByPirse(price,callback) {
        var params = {
            price : price
        }
        if (tcb.queryUrl (window.location.search, 'version') == 'release') {
            params[ 'brand_id' ] = 2
        }
        $.get('/liangpin/aj_get_goods',params,function (res) {
            res = JSON.parse(res)
            if(!res.errno){
                typeof callback == 'function' && callback(res.result.good_list)
            }
        })
    }
    //展示商品列表
    function renderProduct($target,data){
        if(!$target || $target.length == 0){return}
        data = data.slice(0,4)
        var html_str = $.tmpl($.trim($('#JsProductItemTmpl').html()))({
            list: data
        })
        $target.append(html_str)
    }
} ()