;
!function () {
  // 验证登录表单
  function validFormLogin ($Form) {
    var
      flag = true

    if (!($Form && $Form.length)) {
      flag = false
    } else {

      var
        $mobile = $Form.find('[name="user_mobile"]'),
        // 图像验证码
        $secode = $Form.find('[name="pic_secode"]'),
        // 短信验证码
        $smscode = $Form.find('[name="secode"]'),

        mobile = $.trim($mobile.val()),
        secode = $.trim($secode.val()),
        smscode = $.trim($smscode.val())

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

  // 获取短信验证码之前,对于手机号和图片输入校验
  function validSeCode ($Target) {
    var
      flag = true

    if (!($Target && $Target.length)) {
      flag = false
    } else {

      var
        $Form = $Target.closest('form'),
        $mobile = $Form.find('[name="user_mobile"]'),
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

  // 获取验证码
  function smsCodeEvent ($Form, $this) {
    var
      $me = $this,
      $form = $me.closest('form'),  // 获取当前的form表单
      $mobile = $form.find('[name=user_mobile]'), // 获取手机输入框元素
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
      $form = $this.closest('form'),
      $secode = $form.find('[name=pic_secode]'),
      src = '/secode/?rands=' + Math.random()

    // 更换图片验证码
    $me.attr('src', src)
    // 置空验证码输入框内容,并且获取焦点
    $secode.val('').focus()
  }

  //确认提交
  function submitData ($Form, $this) {
    if (!validFormLogin($Form)) {
      return false
    }
    var
      $form = $Form,
      $mobile = $form.find('[name=user_mobile]'),
      $secode = $form.find('[name=secode]')
    // 发送数据提交请求
    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: {
        'user_mobile': $.trim($mobile.val()),
        'secode': $.trim($secode.val())
      },
      dataType: 'json',
      timeout: 5000,
      success: function (res) {
        if (res['errno']) {
          return $.dialog.toast(res['errmsg'], 2000)
        }
        showAlertTips()
      },
      error: function (err) {
        $.dialog.toast('系统错误,请刷新页面重试', 2000)
      }
    })
  }

  // 显示登录弹窗
  function showAlertTips () {
    var html_st = '<div class="third-invitation-dialog-content">\n' +
      '               <h3>报名成功！</h3>\n' +
      '                <p class="c1 third-invitation-tips">确认评价信息后，工作人员将在一个工作日内发放红包，请注意查收。</p>\n' +
      '                <div class="third-invitation-btn">\n' +
      '                    <input id="ensureButton" type="button" value="我知道了">\n' +
      '                </div>\n' +
      '            </div>'
    dialog = tcb.showDialog(html_st, {
      className: 'third-invitation-dialog-tips',
      withClose: false,
      middle: true
    })
  }
  // 点击弹窗确定按钮后的事件
  function clickEnsureButton () {
    tcb.closeDialog();
    window.location.reload(); // 刷新当前页面
  }

  // 表单事件
  function submitDataEvent () {
    $Form = $('#submitDataForm')
    // 获取验证码点击
    $('#getSmsCodeBtn').on('click', function (e) {
      smsCodeEvent($Form, $(this))
    })
    // 刷新图片验证码
    $Form.find('.vcode-img').on('click', function (e) {
      refreshSmsCode($Form, $(this))
    })
    // 提交页面数据
    $Form.on('submit', function (e) {
      e.preventDefault()
      submitData($Form, $(this))
    })
    // 点击弹窗中确认按钮后的事件
    $('body').on('click', '#ensureButton', function () {
      clickEnsureButton();
    })
  }

  submitDataEvent()
}()