;(function () {
  // 非 oms 录入页面,直接返回
  if ( window.__PAGE !== 'zhimacredit-shopHs-order-OMS-submit') {
    return
  }

  var _subFlag = true // 避免多次点击提交

  // 事件初始
  function init () {
    var $omsSubBtn = $('.oms-submit-btn'),
      $form = $omsSubBtn.parent('#omsSubmitForm')
    $omsSubBtn.on('click', function (e) {
      e.preventDefault()
      if(handleCheck($form) && _subFlag){
        _subFlag = false
        handleSubmit($form)
      }
    })
  }

  // 校验数据
  function handleCheck($target){
    var flag = false
    var $form = $target
    if($form && $form.length){
      // OMS 单号
      var $omsCode = $form.find('[name = "oms"]'),
        omsCode = $.trim($omsCode.val())

      // 存放焦点元素及错误信息
      var $focus_el = null,
        err_msg = ''

      // 14位数字,校验格式,00开头,01结尾
      var reg = /^00\d{10}01$/
      if(omsCode === ''){
        $.errorAnimate($omsCode)
        $focus_el = $focus_el || $omsCode
        err_msg = '请填写OMS单号后再提交'
      }else if(!reg.test(omsCode)){
        $.errorAnimate($omsCode)
        $focus_el = $focus_el || $omsCode
        err_msg = 'OMS单号格式不正确'
      }

      if (err_msg) {
        flag = false

        setTimeout(function () {
          $focus_el && $focus_el.focus()
        }, 500)

        $.dialog.toast(err_msg)
      } else {
        flag = true
      }
    }

    return flag

  }

  // 数据提交
  function handleSubmit($Form){
    $.loading('提交中，请稍候...').show()
    var $form = $Form,
      $oms = $form.find('[name = "oms"]'),
      $orderId = $form.find('[name = "order_id"]'),
      // 只有在错误的情况下才用到该参数
      $new_phone_subsidy = $form.find('[name = "new_phone_subsidy"]')
    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: {
        'oms': $.trim($oms.val()),
        'order_id': $.trim($orderId.val())
      },
      dataType: 'json',
      success: function (res) {
        if (res['errno']) {
          $.loading().hide()
          $.dialog.toast(res['errmsg'], 2000)
          setTimeout(function () {
            window.location.href = tcb.setUrl2('/zhimacredit/newPhoneSubSidyInvalid', {'new_phone_subsidy': $.trim($new_phone_subsidy.val())})
          }, 1000)
        } else {
          // 提交成功后,跳转
          window.location.href = tcb.setUrl2('/zhimacredit/newPhoneSubsidySucc', {'order_id': $.trim($orderId.val())})
        }
        _subFlag = true
      },
      error: function (err) {
        $.loading().hide()
        _subFlag = true
        $.dialog.toast('系统错误,请刷新页面重试', 2000)
        // // 错误页面跳转
        // window.location.href = tcb.setUrl2('/zhimacredit/hs', {})
      }
    })
  }

  init();

})()