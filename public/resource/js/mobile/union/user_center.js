// 用户中心
!function () {
    if (window.__PAGE != 'user-center') {
        return
    }

    $ (function () {
        var swipeSection = window.Bang.SwipeSection

        function init(){
            bindEvent ();
        }

        function bindEvent () {
            var $win = tcb.getWin ()

            $win.on ('hashchange load', function (e) {
                var pureHash = tcb.getPureHash ()

                if (pureHash == 'add-bank-info') {
                    showAddBankInfoPanel ()
                } else {
                    swipeSection.backLeftSwipeSection ()
                }
            })

            tcb.bindEvent({
                '.row-fragment-tab .tab-item': function(e){
                    e.preventDefault ()

                    var $me = $ (this)
                    if ($me.hasClass ('selected')) {
                        return
                    }

                    $me.addClass ('selected').siblings ('.selected').removeClass ('selected')

                    var formId = $me.attr('data-for')

                    $('#'+formId).show().siblings('form').hide()
                }
            })


        }

        function showAddBankInfoPanel () {
            var $swipe = swipeSection.getSwipeSection ('.section-add-bank-info')

            var html_fn = $.tmpl (tcb.trim ($ ('#JsMUnionAddBankInfoPanelTpl').html ())),
                html_st = html_fn ()

            $swipe.find ('.swipe-section-inner').html (html_st)

            swipeSection.doLeftSwipeSection (0, function () {})

            bindFormEvent ($swipe.find ('form'))
        }

        function bindFormEvent ($Form) {
            if (!($Form && $Form.length)) {
                return tcb.error ('$Form不能少')
            }

            $Form.on ('submit', function (e) {
                e.preventDefault ()

                var $me = $ (this),
                    id = $me.attr ('id')

                if (id == 'FormForAlipay' && !validFormAlipay ($me)) {
                    return
                } else if (id == 'FormForBank' && !validFormBank ($me)) {
                    return
                }

                $.ajax ({
                    type     : $me.attr ('method'),
                    url      : $me.attr ('action'),
                    data     : $me.serialize (),
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {
                        if (res[ 'errno' ]) {
                            return $.dialog.toast (res[ 'errmsg' ], 2000)
                        }

                        // window.history.go (-1)
                        setTimeout (function () {
                            window.location.href = '/union/userCenter'
                        }, 600)
                    },
                    error    : function (err) {
                        $.dialog.toast (err, 2000)
                    }
                })
            })

            var $triggerBank = $Form.find('.btn-trigger-select-bank'),
                $triggerProvinceCity = $Form.find('.btn-trigger-select-province-city')

            initSelectBank($triggerBank, $Form)
            initSelectProvinceCity($triggerProvinceCity, $Form)
        }

        function initSelectBank($trigger, $Form){
            var pickerData =[
                { id : 1, name : '招商银行' },
                { id : 2, name : '中国工商银行' },
                { id : 3, name : '中国建设银行' },
                { id : 4, name : '中国农业银行' },
                { id : 5, name : '中国银行' },
                { id : 6, name : '交通银行' },
                { id : 7, name : '中国民生银行' },
                { id : 8, name : '平安银行' },
                { id : 9, name : '中信银行' },
                { id : 10, name : '华夏银行' },
                { id : 11, name : '兴业银行' },
                { id : 12, name : '中国邮政储蓄银行' },
                { id : 13, name : '中国光大银行' },
                { id : 14, name : '上海银行' },
                { id : 15, name : '北京银行' },
                { id : 16, name : '渤海银行' },
                { id : 17, name : '宁波银行' }
            ]
            Bang.Picker({
                // 实例化的时候自动执行init函数
                flagAutoInit     : true,
                // 触发器
                selectorTrigger  : $trigger,

                col: 1,
                data: [pickerData],
                dataPos: [0],

                // 回调函数(确认/取消)
                callbackConfirm : function(inst){
                    var data = inst.options.data || [],
                        dataPos = inst.options.dataPos || [],
                        selectedData = data[ 0 ][ dataPos[ 0 ] ]

                    $trigger.html(selectedData.name)
                    $Form.find('[name="bank_name"]').val(selectedData.name)
                },
                callbackCancel  : null
            })
        }

        function initSelectProvinceCity ($trigger, $Form) {
            var $province = $Form.find ('[name="bank_province"]'),
                $city = $Form.find ('[name="bank_city"]'),
                options = {
                    // 实例化的时候自动执行init函数
                    flagAutoInit     : true,
                    selectorTrigger  : $trigger,
                    province         : $province.html(),
                    city             : $city.html(),
                    area             : '',
                    show_area        : false,
                    callback_cancel  : null,
                    callback_confirm : function (region) {
                        region = region || {}

                        var province_city = []
                        region[ 'province' ] && province_city.push (region[ 'province' ])
                        region[ 'city' ] && province_city.push (region[ 'city' ])

                        $trigger.html(province_city.join(' '))
                        $province.val (province_city[0])
                        $city.val (province_city[1])
                    }
                }

            // 初始化省/市/区县选择器
            Bang.AddressSelect (options)
        }

        function validFormAlipay($Form){
            var flag = true,
                $focus = null

            var $bank_user_name = $Form.find('[name="bank_user_name"]'),
                $bank_user_number = $Form.find('[name="bank_user_number"]')

            if (!tcb.trim($bank_user_name.val())){
                flag = false
                $focus = $focus || $bank_user_name
                $bank_user_name.shine4Error()
            }
            if (!tcb.trim($bank_user_number.val())){
                flag = false
                $focus = $focus || $bank_user_number
                $bank_user_number.shine4Error()
            }

            if ($focus && $focus.length){
                setTimeout(function(){
                    $focus.focus()
                }, 300)
            }

            return flag
        }
        function validFormBank($Form){
            var flag = true,
                $focus = null

            var $bank_user_name = $Form.find('[name="bank_user_name"]'),
                $bank_user_number = $Form.find('[name="bank_user_number"]'),
                $bank_name = $Form.find('[name="bank_name"]'),
                $bank_name_trigger = $Form.find('.btn-trigger-select-bank'),
                $bank_province = $Form.find('[name="bank_province"]'),
                $bank_city = $Form.find('[name="bank_city"]'),
                $bank_province_city_trigger = $Form.find('.btn-trigger-select-province-city')

            if (!tcb.trim($bank_user_name.val())){
                flag = false
                $focus = $focus || $bank_user_name
                $bank_user_name.shine4Error()
            }
            if (!tcb.trim($bank_user_number.val())){
                flag = false
                $focus = $focus || $bank_user_number
                $bank_user_number.shine4Error()
            }
            if (!tcb.trim($bank_name.val())){
                flag = false
                $focus = $focus || $bank_name_trigger
                $bank_name_trigger.shine4Error()
            }
            if (!(tcb.trim($bank_province.val())&&tcb.trim($bank_city.val()))){
                flag = false
                $focus = $focus || $bank_province_city_trigger
                $bank_province_city_trigger.shine4Error()
            }

            if ($focus && $focus.length){
                setTimeout(function(){
                    $focus.focus()
                }, 300)
            }

            return flag
        }

        init()

    })
} ()