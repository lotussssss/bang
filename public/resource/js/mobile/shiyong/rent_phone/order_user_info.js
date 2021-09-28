//验证表单
;(function () {
    //验证规则
    var ValidateRule = {
        //不能为空
        isRequired: function ($el) {
            var val = $.trim($el.val())
            if(!val){
                $.errorAnimate ($el)
                return false
            }
            return true
        },
        //身份证号
        isCardNo: function ($el) {
            var val = $el.val()
            var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            if(reg.test(val) === false) {
                $.errorAnimate ($el)
                return false;
            }
            return true
        },
        //纯数字
        isPureNum: function ($el) {
            var val = $.trim($el.val())
            var reg = /^[0-9]+$/
            if(reg.test(val) === false){
                $.errorAnimate ($el)
                return false;
            }
            return true
        },
        //手机号
        isPhoneNum: function ($el) {
            var val = $.trim($el.val())
            var reg = /^1[3456789]\d{9}$/
            if(reg.test(val) === false){
                $.errorAnimate ($el)
                return false;
            }
            return true
        }
    }
    //验证方法
    var Validator = function(){
        this.cacheFn=[]
        this.flag = true
    }
    Validator.prototype.add = function ($el, rule) {
        if(!rule) return;
        this.cacheFn.push(function () {
           return ValidateRule[rule]($el)
        })
    }
    Validator.prototype.validate = function () {
        var self = this
        if(this.cacheFn.length == 0) return

        this.cacheFn.forEach(function (fn) {
            if(!fn.apply(self)){
                self.flag = false
            }
        })

        return this.flag
    }

    var Rent = window.Rent = window.Rent || {}

    Rent.Validator = Validator

})()

//苏宁 用户填写信息页面
;(function(){

    // 获取用户信息页
    if(!$('.page-order-user-info') || !$('.page-order-user-info').length){ return}

    var $win = tcb.getWin(),
        R = tcb.getRoot(),
        Rent = window.Rent || {}

    var $name = $('[name="real_name"]'),//姓名
        $id_no = $('[name="id_no"]'),//身份证号
        $buyer_mobile = $('[name="buyer_mobile"]'),//手机号
        $vcode = $('[name="vcode"]'),//图片验证码
        $bank_card = $('[name="bank_card_num"]'),//银行卡号
        $bank_name = $('[name="bank_name"]'),//银行名称
        $pcode = $('[name="pcode"]'),//手机验证码
        $address = $('[name="receiver_address"]'),//收货地址
        $buyer_province = $('[name="province"]'),//省
        $buyer_city = $('[name="city"]'),//市
        $buyer_area = $('[name="area"]'),//区
        $buyer_address = $('[name="address"]')//详细地址

    var
        __Product_id = $.queryUrl(window.location.href)['product_id'],
        __Treaty_day = $.queryUrl(window.location.href)['treaty_day'],
        __MAX_STEP = 3,//最大步数
        __CashData = {
            cur_hash_step: 1,//当前页的步数
            post_data:{
                product_id: __Product_id,
                treaty_day:__Treaty_day
            },
            user_addr_data : {
                province: [],
                province_sub:{},
                city: [],
                city_sub:{},
                area: []
            }
        },
        __REND_ORDER = '/rent/doSubRentOrder',//提交订单接口
        __REND_ADDRESS = '/rent/doMakeAddress'//补全收货地址信息


    init()
    function init() {
        __setHashStep(1)
        bindEvent()
    }

    //绑定事件
    function bindEvent(){
        var addrSelect = new MobileSelect({
            trigger: '.user-address',
            title: '家庭住址',
            wheels: [
                {data:R.SN_P_C_A_MAP}
            ],
            keyMap: {
                value: 'name',
                childs :'sub'
            },
            position:[0], //Initialize positioning
            callback: function(index, data){
                $buyer_province.val(data[0]['name'])
                $buyer_city.val(data[1]['name'])
                $buyer_area.val(data[2]['name'])
                console.log($buyer_province.val())
            }
        });
        $win.on('hashchange load',function () {

            var from_hash_step = __CashData['cur_hash_step'],
                to_hash_step = __getHashStep()

            getCurStepHeight(to_hash_step)

            handleHashChange(from_hash_step, to_hash_step)

            //改变当前hash_step值
            __CashData['cur_hash_step'] = to_hash_step
        })

        tcb.bindEvent('#mainbody',{
            //点击下一步
            '.js-trigger-next-step': function (e) {
                e.preventDefault()
                var $this = $(this)

                var cur_hash_step = __CashData['cur_hash_step']

                if($this.hasClass('disabled')) { return }

                if(cur_hash_step == 1){//储存信息，改变hash_step
                    var can_render = valide1()
                    if($buyer_province.val() == '' ||$buyer_city.val() == '' ||$buyer_area.val() ==''){
                        can_render = false
                        $.errorAnimate($('.user-address'))
                    }
                    if(can_render){
                        __add1Data()

                        //改变hash_step
                        __setHashStep(++cur_hash_step)
                    }

                }else if(cur_hash_step == 2){//提交信息，改变hash_step

                    if(valide2()){
                        __add2Data()

                        var params = __getPostData()

                        renderUserInfo(params, __REND_ORDER, function (res) {
                            if(res.errno){
                                $.dialog.toast(res.errmsg, 2000)
                                $this.addClass('disabled')
                                setTimeout(function () {
                                    $this.removeClass('disabled')
                                },2000)
                            }else {
                                //改变hash_step
                                __setHashStep(++cur_hash_step)
                                //自动填充收货地址
                                var province = $('[name="province"]').val(),//省
                                    city = $('[name="city"]').val(),//市
                                    area = $('[name="area"]').val(),//区
                                    address = $('[name="address"]').val()//详细地址
                                var add_arr = [province,city,area,address]
                                $address.val(add_arr.join(' '))
                            }
                        })
                    }
                }else if(cur_hash_step == 3){//补充地址，结束
                    //验证地址不为空
                    if(valide3()){
                        __add3Data()
                        var address = __getPostData('receiver_address')
                        var params = {receiver_address:address}
                        renderUserInfo(params, __REND_ADDRESS, function (res) {

                            if(res.errno){
                                $.dialog.toast(res.errmsg, 2000)
                                $this.addClass('disabled')
                                setTimeout(function () {
                                    $this.removeClass('disabled')
                                },2000)
                            }else {
                                var url = '/rent/rentSuc'
                                url = tcb.setUrl(url, {
                                    product_id: $.queryUrl(window.location.href)['product_id'],
                                })

                                window.location.href = url
                            }
                        })
                    }
                }

            },
            //刷新图片验证码
            '.vcode-img': function (e) {
                var $this = $(this),
                    $vcode_item = $this.closest('.vcode-item'),
                    $vcode_input = $vcode_item.find('.input-vcode'),
                    src = '/secode/?rands=' + Math.random ()

                $this.attr('src', src)
                $vcode_input.focus()
            },
            //获取手机验证码
            '.js-trigger-get-pcode':function (e) {
                e.preventDefault()

                var $this = $(this)
                if($this.hasClass('disabled')) return;

                var validInst = new Rent.Validator
                    validInst.add($buyer_mobile, 'isPhoneNum')
                    validInst.add($vcode, 'isRequired')
                var valid_res = validInst.validate()

                if(valid_res){

                    var params = {
                        mobile: $buyer_mobile.val(),
                        pic_secode: $vcode.val(),
                        sms_type: 40
                    }
                    getPhoneCode(params,function () {
                        $this.addClass ('disabled').html ('发送成功')
                        setTimeout(function(){

                            $this.html ('60秒后再次发送')

                            tcb.distimeAnim (60, function (time) {
                                if (time <= 0) {
                                    $this.removeClass ('disabled').html ('发送验证码')
                                } else {
                                    $this.html (time + '秒后再次发送')
                                }
                            })

                        }, 1000)
                    })
                }

            }
        })
    }

    //获取当前hash_step高度  赋值给#mainbody
    function getCurStepHeight(hash_step) {
        var hg = $('#step'+hash_step).height()
        $('#mainbody').height(hg)
    }

    //根据hash_step显示掩藏
    function handleHashChange(from, to) {
       //大于0从左向右出现，小余0从左向右隐藏
        if(to-from>0){
            $('#step'+to).addClass('show')
        }else if(to-from<0){
            $('#step'+from).removeClass('show')
        }
    }

    //获取短信验证码
    function getPhoneCode (params, callback, error) {
        $.ajax ({
            type     : 'POST',
            url      : '/aj/doSendSmscode/',
            data     : params,
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (res[ 'errno' ]) {
                    return $.dialog.toast (res[ 'errmsg' ], 2000)
                }
                typeof callback === 'function' && callback (res[ 'result' ])
            },
            error    : function () {
                typeof error === 'function' && error ()
            }
        })
    }

    //提交用户信息
    function renderUserInfo(params, url, callback, error) {
        $.ajax({
            type: 'POST',
            url: url,
            data: params,
            dataType: 'json',
            success: function (res) {

                typeof callback == 'function' && callback(res)
            },
            error: function () {
                typeof error == 'function'  && error()
            }
        })
    }
// ---------------------------------------------------------
    //验证第一步数据
    function valide1() {

        //验证数据
        var validInst = new Rent.Validator
            validInst.add($id_no, 'isCardNo')
            validInst.add($name, 'isRequired')
            validInst.add($buyer_province , 'isRequired')
            validInst.add($buyer_city , 'isRequired')
            validInst.add($buyer_area , 'isRequired')
            validInst.add($buyer_address , 'isRequired')
        return validInst.validate()
    }
    //添加第一步数据
    function __add1Data() {
        //将姓名和身份证号放入cache
        __setPostData('real_name',$name.val())
        __setPostData('id_no',$id_no.val())
        __setPostData('province',$buyer_province.val())
        __setPostData('city',$buyer_city.val())
        __setPostData('area',$buyer_area.val())
        __setPostData('address',$buyer_address.val())
    }
    //验证第二步数据
    function valide2() {
        //验证数据
        var validInst = new Rent.Validator
        validInst.add($bank_card, 'isPureNum')
        validInst.add($bank_name, 'isRequired')
        validInst.add($buyer_mobile, 'isPhoneNum')
        validInst.add($pcode, 'isRequired')
        return validInst.validate()
    }
    //添加第二步数据
    function __add2Data() {
         //放入数据
         __setPostData('bank_card_num',$bank_card.val())
         __setPostData('bank_name',$bank_name.val())
         __setPostData('buyer_mobile',$buyer_mobile.val())
         __setPostData('sms_code',$pcode.val())

    }
    //验证第三步数据
    function valide3() {
        //验证数据
        var validInst = new Rent.Validator
        validInst.add($address, 'isRequired')
        return  validInst.validate()
    }
    //添加第三步数据
    function __add3Data() {
        //放入数据
        __setPostData('receiver_address',$address.val())
    }

    // ------------------------------------------- //

    //设置step
    function __setHashStep(val) {
        if(!val) return
        window.location.hash = 'step=' + val
    }
    function __getHashStep() {
        return tcb.parseHash(window.location.hash)['step'];
    }

    //设置post_data
    function __setPostData(key,val) {
        return __CashData['post_data'][key] = val
    }
    function __getPostData(key) {
        if(key == undefined) {
            return __CashData['post_data']
        }else {
            return __CashData['post_data'][key]
        }
    }

    //删除/添加disabled类名
    function __handleDisabledClass($el, bloo) {
        if(!$el || !$el.length) return ;
        if(bloo){
            if($el.hasClass('disabled')){
                $el.removeClass('disabled')
            }
        }else {
            if(!$el.hasClass('disabled')){
                $el.addClass('disabled')
            }
        }
    }

}());


//乐百分 用户填写信息页面
;(function(){

    // 获取用户信息页
    if(!$('.page-order-user-info-lbf') || !$('.page-order-user-info-lbf').length){ return}

    var
        R = tcb.getRoot(),
        Rent = window.Rent || {}

    var $name = $('[name="real_name"]'),//姓名
        $buyer_mobile = $('[name="buyer_mobile"]'),//手机号
        $buyer_province = $('[name="province"]'),//省
        $buyer_city = $('[name="city"]'),//市
        $buyer_area = $('[name="area"]'),//区
        $buyer_address = $('[name="address"]')//详细地址
        $product_id = $('[name="product_id"]'),
        $treaty_day = $('[name="treaty_day"]')

    var
        __Product_id = $.queryUrl(window.location.href)['product_id'],
        __Treaty_day = $.queryUrl(window.location.href)['treaty_day'],

        __REND_ORDER = '/rent/placeorderLebaifen'//提交订单接口

    $product_id.val(__Product_id);
    $treaty_day.val(__Treaty_day);


    init()
    function init() {
        bindEvent()
    }

    //绑定事件
    function bindEvent(){
        var addrSelect = new MobileSelect({
            trigger: '.user-address',
            title: '家庭住址',
            wheels: [
                {data:R.SN_P_C_A_MAP}
            ],
            keyMap: {
                value: 'name',
                childs :'sub'
            },
            position:[0], //Initialize positioning
            callback: function(index, data){
                $buyer_province.val(data[0]['name'])
                $buyer_city.val(data[1]['name'])
                $buyer_area.val(data[2]['name'])
            }
        });
        tcb.bindEvent('#mainbody',{
            //提交
            '.js-trigger-render': function (e) {
                e.preventDefault()
                var $this = $(this)
                if($this.hasClass('disabled')) { return }

                var can_render = valideForm()
                if($buyer_province.val() == '' ||$buyer_city.val() == '' ||$buyer_area.val() ==''){
                    can_render = false
                    $.errorAnimate($('.user-address'))
                }
                if(can_render){
                    var params = $('#user-info').serialize()
                    console.log(params)
                    renderUserInfo(params, __REND_ORDER ,function (res) {
                        if(!res.errno){
                            window.location.href = res.result.lebaifen_url;
                        }else {
                            $.dialog.toast(res.errmsg, 3000)
                        }
                    })
                }
            }
        })
    }

    //提交用户信息
    function renderUserInfo(params, url, callback, error) {
        $.ajax({
            type: 'POST',
            url: url,
            data: params,
            dataType: 'json',
            success: function (res) {

                typeof callback == 'function' && callback(res)
            },
            error: function () {
                typeof error == 'function'  && error()
            }
        })
    }
    //验证第一步数据

    function valideForm() {
        //验证数据
        var validInst = new Rent.Validator
        validInst.add($buyer_mobile, 'isPhoneNum')
        validInst.add($name, 'isRequired')
        validInst.add($buyer_province , 'isRequired')
        validInst.add($buyer_city , 'isRequired')
        validInst.add($buyer_area , 'isRequired')
        validInst.add($buyer_address , 'isRequired')
        return validInst.validate()
    }

}());
