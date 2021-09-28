;(function () {
    // 非 小程序租机页面,直接返回
    if (window.__PAGE !== 'alipay-mini-2019-02-tcb-full') {
        return
    }

    // 判断是否为支付宝小程序内使用,默认为 false(非小程序内部)
    var isAlipayClient = window.__isAlipayClient || ''

    var alipay_credut_fullprize = [
        {
            plus: 240,
            prize: '一等奖',
            title: '240元现金加价',
            desc: '获得240元现金加价，同时获得二、三、四等奖的全部权益（240元加价，回收金额满2000可用）'
        },
        {
            plus: 120,
            prize: '二等奖',
            title: '120元现金加价',
            desc: '获得120元现金加价，同时获得三、四等奖的全部权益（120元加价，回收金额满1000可用）'
        },
        {
            plus: 60,
            prize: '三等奖',
            title: '60元现金加价',
            desc: '获得60元现金加价，同时获得四等奖的全部权益（60元加价，回收金额满500可用）'
        },
        {
            plus: 25,
            prize: '四等奖',
            title: '25元现金加价',
            desc: '获得25元现金加价（25元加价，回收金额满200可用）'
        },
    ]

    // 生成列表模板字符串,并传入列表数组
    function buildList () {
        var fullprizeHtmlStr = $.tmpl($.trim($('#aliMiniCreditFullPrize').html()))({
            'full_prize_list': alipay_credut_fullprize
        })
        $('#fullPrizeList').append(fullprizeHtmlStr)
    }

    buildList()

})()