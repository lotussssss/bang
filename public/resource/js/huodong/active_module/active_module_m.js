wx.ready(function () {
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title": window._share_title || '',
        "desc": window._share_desc || '',
        "link": window._share_link || window.location.protocol+'//'+window.location.host+window.location.pathname,
        "imgUrl": window._share_img || '',
        "success": tcb.noop, // 用户确认分享的回调
        "cancel": tcb.noop // 用户取消分享
    };
    // 用户点开右上角popup菜单后，点击分享给好友，会执行下  面这个代码
    wx.onMenuShareAppMessage(wxData);
    // 点击分享到朋友圈，会执行下面这个代码
    wx.onMenuShareTimeline(wxData);
    //分享到QQ
    wx.onMenuShareQQ(wxData);
    //分享到QQ空间
    wx.wx.onMenuShareQZone(wxData);
});


$(function () {

    function renderProduct(ele) {
        for(var i=0; i<$(ele).length; i++){

            var $me = $($(ele)[i]),
                $target = $me.find('.js-product-list'),
                request_url = $me.attr('data-search_url')

            window.Bang.renderProductList({
                $target : $target,
                $tpl : $('#JsMProductListVer1720Tpl'),
                request_url : request_url,
                request_params : {},
                col : 2,
                complete: function(result, $target){}
            })
        }
    }
    renderProduct('.block-product-list')


})