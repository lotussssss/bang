$(function () {
    tcb.bindEvent(document.body,{
        //用户信息入口:我的订单、在线客服
        '#header .h-user-info-enter':function (e) {
            e.preventDefault();

            $('.h-user-info-wrap .h-user-info-cont').toggle();
        }
    })
})