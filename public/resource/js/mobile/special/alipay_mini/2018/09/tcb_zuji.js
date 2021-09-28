;(function () {
  // 非 小程序租机页面,直接返回
  if (window.__PAGE !== 'alipay-mini-2018-09-tcb-zuji') {
    return
  }

  // 判断是否为支付宝小程序内使用,默认为 false(非小程序内部)
  var isAlipayClient = window.__isAlipayClient || ''

  var alipay_zu_phonelist = [
    {
      name: '小米6x',
      tips_info: '变焦双摄,拍人更美',
      img_url: 'https://p0.ssl.qhmsg.com/t011772dcd4c52b19ba.jpg',
      h5_link: 'https://ds.alipay.com/i/index.htm?iframeSrc=alipays%3A%2F%2Fplatformapi%2Fstartapp%3FappId%3D2018042702599100%26page%3Dpages%2Fproduct%2Fproduct%3FtagId%253d9%2526modelId%253d68',
      alimini_link: '/pages/product/product?modelId=68&tagId=9'
    },
    {
      name: '华为nova3e',
      tips_info: '2400万海报级自拍',
      img_url: 'https://p4.ssl.qhmsg.com/t01bb8908ce7e050201.jpg',
      h5_link: 'https://ds.alipay.com/i/index.htm?iframeSrc=alipays%3A%2F%2Fplatformapi%2Fstartapp%3FappId%3D2018042702599100%26page%3Dpages%2Fproduct%2Fproduct%3FtagId%253d5%2526modelId%253d28',
      alimini_link: '/pages/product/product?modelId=28&tagId=5'
    },
    {
      name: 'OPPO R15',
      tips_info: 'AI智能拍照,让美更自然',
      img_url: 'https://p0.ssl.qhmsg.com/t0148fcc780fec2520b.jpg',
      h5_link: 'https://ds.alipay.com/i/index.htm?iframeSrc=alipays%3A%2F%2Fplatformapi%2Fstartapp%3FappId%3D2018042702599100%26page%3Dpages%2Fproduct%2Fproduct%3FtagId%253d7%2526modelId%253d18',
      alimini_link: '/pages/product/product?modelId=18&tagId=7'
    },
    {
      name: '华为nova3',
      tips_info: '2400万海报级自拍',
      img_url: 'https://p4.ssl.qhmsg.com/t011f3a2a88ed552094.jpg',
      h5_link: 'https://ds.alipay.com/i/index.htm?iframeSrc=alipays%3A%2F%2Fplatformapi%2Fstartapp%3FappId%3D2018042702599100%26page%3Dpages%2Fproduct%2Fproduct%3FtagId%253d5%2526modelId%253d100',
      alimini_link: '/pages/product/product?modelId=100&tagId=5'
    },
    {
      name: 'vivo NEX',
      tips_info: '非凡一升 突破未来',
      img_url: 'https://p4.ssl.qhmsg.com/t012c025d32969ad7db.jpg',
      h5_link: 'https://ds.alipay.com/i/index.htm?iframeSrc=alipays%3A%2F%2Fplatformapi%2Fstartapp%3FappId%3D2018042702599100%26page%3Dpages%2Fproduct%2Fproduct%3FtagId%253d8%2526modelId%253d94',
      alimini_link: '/pages/product/product?modelId=94&tagId=8'
    },
    {
      name: '小米8',
      tips_info: '全面屏游戏智能手机',
      img_url: 'https://p0.ssl.qhmsg.com/t01f277bdb143ba2240.jpg',
      h5_link: 'https://ds.alipay.com/i/index.htm?iframeSrc=alipays%3A%2F%2Fplatformapi%2Fstartapp%3FappId%3D2018042702599100%26page%3Dpages%2Fproduct%2Fproduct%3FtagId%253d9%2526modelId%253d62',
      alimini_link: '/pages/product/product?modelId=62&tagId=9'
    }
  ]

  // 生成列表模板字符串,并传入列表数组,以及当前所处环境(支付宝小程序内或支付宝h5页面),以区分不同的跳转地址
  function buildList () {
    var phoneListHtmlStr = $.tmpl($.trim($('#aliMiniZuPhoneList').html()))({
      'phone_list': alipay_zu_phonelist,
      'url_type': isAlipayClient ? 'alimini_link' : 'h5_link'
    })
    $('#phoneList').html(phoneListHtmlStr)

    // 页面生成后,再显示底部的查看更多按钮
    $('.alipay-bottom-btn').show()
  }

  // 点击链接跳转
  function bindEvent () {
    $('.phone-link').on('click', function (e) {
      e.preventDefault()
      var _url = $(this).attr('data-link_url')

      linkType(_url)

    })

  }

  // 判断是小程序内部跳转,还是在支付宝网页跳转
  function linkType (url) {

    if (!url) return

    // 是支付宝小程序内部,则跳转调用支付宝小程序方法
    if (isAlipayClient) {

      my.navigateTo({url: url})

    } else {  // 非支付宝小程序内部

      window.location.href = url

    }

  }

  // 底部查看更多按钮
  $('.alipay-bottom-btn').on('click', function (e) {
    // 是支付宝小程序内部,则跳转调用支付宝小程序方法
    if (isAlipayClient) {

      my.switchTab({url: '/pages/index/index'})

    } else {  // 非支付宝小程序内部

      window.location.href = 'https://ds.alipay.com/i/index.htm?iframeSrc=alipays%3A%2F%2Fplatformapi%2Fstartapp%3FappId%3D2018042702599100'

    }
  })

  buildList()
  bindEvent()

})()