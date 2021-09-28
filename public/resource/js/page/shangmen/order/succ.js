
!(function () {
    $(function () {

        if(!$('.page-shangmen-succ')){return}

        //下单成功页 预约快递
        $('.show-yuyue-btn').on('click',function () {

            var
                order_id = tcb.queryUrl(window.location.href)['order_id'],

                redirect_url = window.location.href
            console.log(order_id)
            YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {
                var
                    html_fn = $('#JsSMSchedulePickupPanelTpl').html().trim().tmpl(),
                    html_st = html_fn ({
                        data : {
                            province : '',
                            city     : res['city_name'] || window.__CITY_NAME,
                            area_list : res['area_list']||[],
                            user_name   : res['user_name'],
                            mobile   : res['default_mobile'],
                            express_addr   : res['express_addr'],
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
        })
    })


})()
