;(function () {

    if (window.__PAGE != 'rent-page') {
        return
    }

    var
        $price_input = $('.price-input'),
        $total_zu_mount = $('.total-zu-mount'),//总租金
        $day_fee = $('.day-fee'),//日租金
        $qi_fee = $('.qi-fee'),//期租金
        $price_set_wrap = $('.price-set-wrap'),
        $qrcode=$('.qrcode')

    var _product_weikuan= __productInfo['product_weikuan']//尾款
    var _product_id = __productInfo['product_id']

    function init(){
        if(__productInfo['user_price'] || __productInfo['user_price'].length){
            $price_input.val(__productInfo['user_price']['price'])
            calculatePrice(__productInfo['user_price']['price'],function(res){
                changeRentPhontPrice(res)
            })
        }

        tcb.bindEvent(document.body,{
            '.price-btn':function(e){
                e.preventDefault()
                setProductPrice()
            },
            '.ewm-btn': function(e){
                e.preventDefault()
                var memo = $("#memo").val();
                var qr_url = 'http://bang.360.cn/union/buy?userid='+__userInfo['userid']+'&id='+_product_id+'&type=1&memo='+encodeURIComponent(memo)
                makeQrcode(qr_url)

                $(this).hide()
                $price_set_wrap.hide()
                $('.qrcode-wrap').show()
            },
            '.price-input':{
                'blur':function (e) {
                    setProductPrice()
                }
            }
        })
    }
    init()

    function changeRentPhontPrice(price_obj){
        var period_amount = price_obj.period_amount,//每期租金
            period_count = price_obj.period_count,//租期
            total_amount = price_obj.total_rent //总价
        $total_zu_mount .text(total_amount)
        $day_fee.text((period_amount/25).toFixed(2))
        $qi_fee.text(period_amount)
    }

    function makeQrcode(value){
        return new QRCode(document.getElementById("qrcode"), {
            text: value,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    }
    
    function getProductInfo(product_id, callback) {
        $.get('/union/getProductInfo',{id:product_id},function(res){
            res = JSON.parse(res)
            if(!res.errno){
                typeof callback=='function' && callback(res.result)
            }else{
                $.dialog.toast(res.errmsg, 2000)
            }
        })
    }

    function setProductPrice(){
        //首先提交给服务器 返回成功后 调用计算接口
        var price_input = $price_input.val()
        if(price_input<=0){ $.dialog.toast('请正确设置价格')}
        if(price_input < _product_weikuan){
            $.dialog.toast('价格不可小于押金')
            return
        }
        sendPriceToserver(price_input, function () {
            calculatePrice(price_input,function(res){
                changeRentPhontPrice(res)
                $.dialog.toast('价格设置成功')
            })
        })
    }

    function sendPriceToserver(price,callback){
        var params ={
            price:price,
            product_id:_product_id
        }
        $.post('/union/setUserPrice',params,function (res) {
            res = JSON.parse(res)
            if(!res.errno){
                typeof callback=='function' && callback(res.result)
            }else{
                $.dialog.toast(res.errmsg, 2000)
            }
        })
    }

    function calculatePrice(amount,callback){
        var params={
            amount:amount,
            weikuan:_product_weikuan,
            pid:_product_id,
        }
        $.post('/union/doGetLebaifenFeeInfo',params,function (res) {
            res= JSON.parse(res)
            if(!res.errno){
                typeof callback=='function' && callback(res.result)
            }else{
                $.dialog.toast(res.errmsg, 2000)
            }
        })
    }

})()