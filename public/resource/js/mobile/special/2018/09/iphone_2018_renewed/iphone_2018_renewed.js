;(function () {
  // 非 oppo以旧换新页面,直接返回
  if (window.__PAGE !== '2018-09-iphone-2018-renewed-iphone-2018-renewed') {
    return
  }

  window.__Province = {}
  window.__City = {}

  var wxData = {}
  var curCityCode = '010' // 当前的城市区号,默认 010

  // 微信分享的数据
  wxData = {
    "title": "iPhone新品以旧换新",
    "desc": "购iPhone，来苏宁，旧机回收享原价",
    "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
    "imgUrl": 'https://p4.ssl.qhmsg.com/t018ebbc7e82c152116.png',
    "success": function () {
      $.dialog.toast('分享成功', 2000)
    }, // 用户确认分享的回调
    "cancel": tcb.noop // 用户取消分享
  }
  if (typeof wx !== 'undefined') {
    wx.ready(function () {

      // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
      wx.onMenuShareAppMessage(wxData)
      // 点击分享到朋友圈，会执行下面这个代码
      wx.onMenuShareTimeline(wxData)
      //分享到QQ
      wx.onMenuShareQQ(wxData)
      //分享到QZone
      wx.onMenuShareQZone(wxData)
    })
  }

  // 提交手机号弹窗
  function showOrderPanelDialog() {
    var html_str = $.tmpl($.trim($('#JsIphoneRenewedOrderPanelTpl').html()))(),
      config = {
        middle: true,
        withClose : true,
        className: 'oppo-order-panel submit-panel'
      }
    tcb.showDialog(html_str, config)
    __citySelect($('.trigger-select-city'))
  }

  // 获取验证码
  function smsCodeEvent ($Form, $this) {
    var
      $me = $this,
      $form = $me.closest('form'),  // 获取当前的form表单
      $mobile = $form.find('[name=mobile]'), // 获取手机输入框元素
      $secode = $form.find('[name=pic_secode]'), // 获取图片验证码元素
      $smsType = $form.find('[name=sms_type]') // 图片验证码类型
    if (!validSeCode($me)) {
      return false
    }
    // 获取验证码
    getSmsCode($Form, {
      'mobile': $.trim($mobile.val()),
      'pic_secode': $.trim($secode.val()),
      'sms_type': $.trim($smsType.val())
    }, function (data) {
      $me.addClass('btn-get-sms-code-disabled').html('发送成功')
      setTimeout(function () {
        $me.html('60秒后再次发送')
        tcb.distimeAnim(60, function (time) {
          if (time <= 0) {
            $me.removeClass('btn-get-sms-code-disabled').html('发送验证码')
          } else {
            $me.html(time + '秒后再次发送')
          }
        })
      }, 1000)
    })
  }

  // 获取验证码请求
  function getSmsCode ($Form, params, callback, error) {
    $.ajax({
      type: 'POST',
      url: '/aj/doSendSmsCode',
      data: params,
      dataType: 'json',
      timeout: 5000,
      success: function (res) {
        if (res['errno']) {
          // 刷新验证码
          refreshSmsCode($Form, $Form.find('.vcode-img'))
          return $.dialog.toast(res['errmsg'], 2000)
        }
        typeof callback === 'function' && callback(res['result'])
      },
      error: function (err) {
        typeof error === 'function' && error()
      }
    })
  }

  // 刷新图片验证码
  function refreshSmsCode ($Form, $this) {
    var
      $me = $this,
      $form = $me.closest('form'),
      $secode = $form.find('[name=pic_secode]'),
      src = '/secode/?rands=' + Math.random()

    // 更换图片验证码
    $me.attr('src', src)
    // 置空验证码输入框内容,并且获取焦点
    $secode.val('').focus()
  }

  // 获取短信验证码之前,对于手机号和图片输入校验
  function validSeCode ($Target) {
    var
      flag = true

    if (!($Target && $Target.length)) {
      flag = false
    } else {

      var
        $Form = $Target.closest('form'),
        $mobile = $Form.find('[name="mobile"]'),
        $secode = $Form.find('[name="pic_secode"]'),

        mobile = $.trim($mobile.val()),
        secode = $.trim($secode.val())

      if ($Target.hasClass('btn-get-sms-code-disabled')) {
        flag = false
      } else {
        var
          $focus_el = null,
          err_msg = ''

        // 验证手机号
        if (!mobile) {
          $.errorAnimate($mobile)
          $focus_el = $focus_el || $mobile
          err_msg = '手机号码不能为空'
        }
        else if (!tcb.validMobile(mobile)) {
          $.errorAnimate($mobile)
          $focus_el = $focus_el || $mobile
          err_msg = '手机号码格式错误'
        }

        // 验证图形验证码
        if (!secode) {
          $.errorAnimate($secode)
          $focus_el = $focus_el || $secode
          err_msg = err_msg || '图片验证码不能为空'
        }

        if (err_msg) {
          flag = false

          setTimeout(function () {
            $focus_el && $focus_el.focus()
          }, 500)

          $.dialog.toast(err_msg)
        }

      }
    }

    return flag
  }

  // 验证登录表单
  function validFormLogin ($Form) {
    var
      flag = true

    if (!($Form && $Form.length)) {
      flag = false
    } else {

      var
        $mobile = $Form.find('[name="mobile"]'),
        // 图像验证码
        $secode = $Form.find('[name="pic_secode"]'),
        // 短信验证码
        $smscode = $Form.find('[name="code"]'),
        // 城市选择
        $city = $Form.find('[name="city"]'),

        mobile = $.trim($mobile.val()),
        secode = $.trim($secode.val()),
        smscode = $.trim($smscode.val()),
        city = $.trim($city.val())

      var
        $focus_el = null,
        err_msg = ''

      // 验证手机号
      if (!mobile) {
        $.errorAnimate($mobile)
        $focus_el = $focus_el || $mobile
        err_msg = '手机号码不能为空'
      }
      else if (!tcb.validMobile(mobile)) {
        $.errorAnimate($mobile)
        $focus_el = $focus_el || $mobile
        err_msg = '手机号码格式错误'
      }

      // 验证是否选择城市
      if(!city){
        $.errorAnimate($('.trigger-select-city'))
        err_msg = err_msg || '请选择城市'
      }

      // 验证图形验证码
      if (!secode) {
        $.errorAnimate($secode)
        $focus_el = $focus_el || $secode
        err_msg = err_msg || '图片验证码不能为空'
      }

      // 验证短信验证码
      if (!smscode) {
        $.errorAnimate($smscode)
        $focus_el = $focus_el || $smscode
        err_msg = err_msg || '短信验证码不能为空'
      }

      if (err_msg) {
        flag = false

        setTimeout(function () {
          $focus_el && $focus_el.focus()
        }, 500)

        $.dialog.toast(err_msg)
      }
    }

    return flag
  }

  //确认提交
  function submitData ($Form, $this) {
    if (!validFormLogin($Form)) {
      return false
    }
    var
      $form = $Form,
      $mobile = $form.find('[name=mobile]'),
      $city = $form.find('[name=city]'),
      $secode = $form.find('[name=code]')
    // 发送数据提交请求
    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: {
        'mobile': $.trim($mobile.val()),
        'code': $.trim($secode.val()),
        'city': $.trim($city.val())
      },
      dataType: 'json',
      timeout: 5000,
      success: function (res) {
        if (res['errno']) {
          return $.dialog.toast(res['errmsg'], 2000)
        }
        window.location.href = '/huodong/iPhone2018OrderSuccess?cityCode=' + curCityCode
      },
      error: function (err) {
        $.dialog.toast('系统错误,请刷新页面重试', 2000)
      }
    })
  }

  // 选择城市
  function __citySelect (trigger) {
    var $trigger = trigger

    // 禁止城市选择
    if ($trigger.hasClass('disabled')){
      $trigger.on('click', function(e){
        e.preventDefault()
        $.dialog.toast('无法切换城市', 2000)
      })
      return
    }

    var
      province = $trigger.attr ('data-province') || '',
      city = $trigger.attr ('data-city') || '',
      area = '',
      options = {
        // 实例化的时候自动执行init函数
        flagAutoInit     : true,
        selectorTrigger  : '.trigger-select-city',
        province         : province,
        city             : city,
        area             : area,
        //show_city        : false,
        show_area        : false,
        not_render       : true,
        callback_cancel  : null,
        callback_confirm : function (region) {
          region = region || {}

          var
            city = region['city'] || '',
            city_id = region['city_id'] || '',
            province = region['province'] || '',
            province_id = region['province_id'] || ''

          // 城市切换没有任何变化，那么不做任何处理
          if ($trigger.val === city) {
            return
          }

          // 设置全局的省、市信息
          window.__Province['id'] = province_id
          window.__Province['name'] = province
          window.__Province['code'] = ''
          window.__City['id'] = city_id
          window.__City['name'] = city
          window.__City['code'] = ''

          citySelectDone($trigger, region)

        }
      }

    // 初始化省/市/区县选择器
    Bang.AddressSelect (options)
  }

  /**
   * 完成选择城市
   * @param $trigger 选择城市触发器
   * @param region   选中的省、市、省id、市id
   * @param callback 选择成功后的回调
   */
  function citySelectDone ($trigger, region, callback) {
    region = region || {}
    var
      city = region[ 'city' ] || '',
      city_id = region[ 'city_id' ] || '',
      province = region[ 'province' ] || '',
      province_id = region[ 'province_id' ] || ''

    $trigger
      .attr ('data-city', city)
      .attr ('data-city-id', city_id)
      .attr ('data-province', province)
      .attr ('data-province-id', province_id)
      .html ('<span class="city-value">' + city + '</span>')

    curCityCode = doGenerateCityCode(city)
    $ ('input[name="city"]').val (city)
    $ ('.row-hs-style-checked').removeClass ('row-hs-style-checked')
    $ ('.block-order-form').hide ()
    
  }

  /**
   * 根据选择城市返回对应城市的 cityCode
   * @param cityName
   * @returns 默认为 010(北京)
   */
  function doGenerateCityCode (cityName) {
    var _baseCode = '010'
    if(!cityName) return _baseCode

    var _cityCode = ''
    // 城市对应 地区区号
    var _cityCodeMap = {
      "北京":"010",
      "天津":"022",
      "哈尔滨":"451",
      "沈阳":"024",
      "石家庄":"311",
      "兰州":"931",
      "西安":"029",
      "郑州":"371",
      "太原":"351",
      "长沙":"731",
      "南京":"025",
      "贵阳":"851",
      "南宁":"771",
      "杭州":"571",
      "广州":"020",
      "上海":"021",
      "重庆":"023",
      "长春":"431",
      "西宁":"971",
      "银川":"951",
      "济南":"531",
      "合肥":"551",
      "武汉":"027",
      "成都":"028",
      "昆明":"871",
      "拉萨":"089",
      "南昌":"791",
      "福州":"591",
      "海口":"898"
    }

    _cityCode = _cityCodeMap[cityName]

    if(_cityCode){
      return _cityCode
    } else {
      return _baseCode
    }
  }

  // 表单事件
  function submitDataEvent () {
    var orderBtn = $('#orderBtn')
    orderBtn.on('click', function () {

      showOrderPanelDialog()
    })

    tcb.bindEvent({

      // 获取验证码点击
      '#getSmsCodeBtn': function (e) {
        smsCodeEvent($('#submitDataForm'), $(this))
      },

      // 刷新图片验证码
      '.vcode-img': function (e) {
        refreshSmsCode($('#submitDataForm'), $(this))
      },

      // 提交页面数据
      '#submitOrderBtn': function (e) {
        submitData($('#submitDataForm'), $(this))
      }
    })

  }

  submitDataEvent()

})()