;(function (global) {
  // 非下单页,直接返回不做任何处理
  if (window.__PAGE !== 'zhimacredit-shopHs-order-coupon') {

    return
  }
  // // 页面跳转
  // function handleBackToIndex ($ele) {
  //   if (!$ele) return
  //   $ele.on('click', function (e) {
  //     e.preventDefault()
  //     window.location.href = tcb.setUrl('/zhimacredit/shopHs')
  //   })
  // }
  //
  // function init () {
  //   var $ele = $('.back-btn')
  //   handleBackToIndex($ele)
  // }
  //
  // init()
})(this)