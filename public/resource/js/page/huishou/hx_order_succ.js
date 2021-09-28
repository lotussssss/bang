;(function () {
    $(function () {
        var $hs_hx = $('.page-hs-hx')
        if(!$hs_hx || !$hs_hx.length>0){ return }

        var href = window.location.href,
            query = tcb.queryUrl(href)


        function init() {
            __bindEvent()
        }
        init()

        function __bindEvent() {
            tcb.bindEvent(document,{
                '.js-trigger-show-yy': function (e) {
                    e.preventDefault()
                    var order_id = query['order_id']
                    var redirect_url = href;
                    YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                        var
                            html_fn = $('#JsHSSchedulePickupPanelTpl').html().trim().tmpl(),
                            html_st = html_fn ({
                                data : {
                                    province : '',
                                    city     : res['city_name'] || window.__CITY_NAME,
                                    area_list : res['area_list']||[],
                                    mobile   : res['default_mobile'],
                                    order_id : order_id,
                                    url : redirect_url
                                }
                            })

                        var
                            DialogObj = tcb.showDialog (html_st, {
                                className : 'schedule-pickup-panel',
                                withClose : false,
                                middle    : true,
                                // onClose:function () {
                                //     window.location.href = redirect_url
                                // }
                            })

                        // 绑定预约取件相关事件
                        YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

                    })
                }
            })
        }
    })
})()