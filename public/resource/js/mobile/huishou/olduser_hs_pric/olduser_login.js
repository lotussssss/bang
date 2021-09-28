;
!function () {
  var loginInfo = {}
  // 校验页面数据
  function validFormLogin ($Form) {
    var
      flag = true

    if (!($Form && $Form.length)) {
      flag = false
    } else {

      var
        $mobile = $Form.find('[name="old_user_mobile"]'),
        // 邀请证码
        $invicode = $Form.find('[name="invitation_code"]'),

        mobile = $.trim($mobile.val()),
        invicode = $.trim($invicode.val())

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

      // 邀请码不能为空
      if (!invicode) {
        $.errorAnimate($invicode)
        $focus_el = $focus_el || $invicode
        err_msg = err_msg || '邀请码不能为空'
      }

      if (err_msg) {
        flag = false

        setTimeout(function () {
          $focus_el && $focus_el.focus()
        }, 500)

        $.dialog.toast(err_msg)
      }
    }
    loginInfo.old_user_mobile = mobile
    loginInfo.invitation_code = invicode
    return flag
  }

  // 发起登录请求
  function doCheckOldUser (params, callback) {
    $.ajax({
      type: 'POST',
      url: '/huishou/doCheckOldUser',
      data: params,
      dataType: 'json',
      timeout: 5000,
      success: function (res) {
        if (res['errno']) {
          return $.dialog.toast('抱歉，您输入的邀请码不存在，请输入正确的邀请码', 2000)
        }
        typeof callback === 'function' && callback(res['result'])
      },
      error: function (err) {
        $.dialog.toast('系统错误,请刷新页面重试', 2000)
      }
    })
  }

  $('#submitButton').on('click', function () {
    var $_form = $('#formData')
    if(validFormLogin($_form)){
      doCheckOldUser({
        old_user_mobile: loginInfo.old_user_mobile,
        invitation_code: loginInfo.invitation_code
      }, function (data) {
        window.location.href = '/huishou/vipDetails'
      })
    }
  })

}()