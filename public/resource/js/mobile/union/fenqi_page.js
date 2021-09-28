;(function () {
    if (window.__PAGE != 'fenqi-page') {
        return
    }
    
    var $price_input = $('.price-input'),
        $payment3 = $('.payment3'),//3期
        $payment6 = $('.payment6'),//6期
        $payment12 = $('.payment12'),//12期
        $pay_amount = $('.pay_amount'),//最低分期总额
        $pay_rate = $('.pay_rate')//手续费

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
                var query_str = 'userid='+__userInfo['userid']+'&id='+_product_id
                window.location.href = '/union/fenqiQrcode?'+ query_str + "&memo=" + memo
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
        var payment = price_obj.payment,//分期价格数组
            pay_rate = price_obj.pay_rate,//手续费数组
            pay_amount = price_obj.pay_amount//分期总价数组

        $payment3.text(payment[0])
        $payment6.text(payment[1])
        $payment12.text(payment[2])
        $pay_amount.text(pay_amount[0])
        $pay_rate.text(pay_rate[0])

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
            $.dialog.toast('价格已远低于成本')
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

        $.post('/union/doGetHuabeiFeeInfo',{amount:amount},function (res) {
            res= JSON.parse(res)
            if(!res.errno){
                typeof callback=='function' && callback(res.result)
            }else{
                $.dialog.toast(res.errmsg, 2000)
            }
        })
    }

})()