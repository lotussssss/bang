!function(){
    if (window.__PAGE !== 'zhimacredit-shopHs-order-xxg-confirm') {

        return
    }

    $(function(){
        var redirectUrl = ''

        setTimeout(function loopFn(){
            if (redirectUrl){
                return
            }

            __doGetXXGInfoByScan()

            setTimeout(loopFn, 3000)

        }, 3000)

        function __doGetXXGInfoByScan(){
            $.get ('/zhimacredit/doGetXXGInfoByScan', {
                order_id     : window.__ORDER_ID,
                agreement_no : window.__AGREEMENT_NO
            }, function (res) {
                res = $.parseJSON(res)
                if (!res.errno){

                    redirectUrl = res.result.rurl

                    window.location.href = redirectUrl
                }
            })
        }
    })

}()