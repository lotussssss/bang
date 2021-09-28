// 绑定事件
!function (global) {
    window.__bankArea = {}
    window.__bankArea.provinces = ['北京', '上海', '天津', '重庆', '河北', '山西', '内蒙', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东',
        '广西', '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '宁夏', '青海', '新疆', '香港', '澳门', '台湾']
    window.__bankArea.cities = [['东城', '西城', '朝阳', '丰台', '石景山', '海淀', '门头沟', '房山', '通州', '顺义', '昌平', '大兴', '平谷', '怀柔', '密云', '延庆'],
        ['黄浦', '卢湾', '徐汇', '长宁', '静安', '普陀', '闸北', '虹口', '杨浦', '闵行', '宝山', '嘉定', '浦东', '金山', '松江', '青浦', '南汇', '奉贤', '崇明'],
        ['和平', '东丽', '河东', '西青', '河西', '津南', '南开', '北辰', '河北', '武清', '红挢', '塘沽', '汉沽', '大港', '宁河', '静海', '宝坻', '蓟县'],
        ['万州', '涪陵', '渝中', '大渡口', '江北', '沙坪坝', '九龙坡', '南岸', '北碚', '万盛', '双挢', '渝北', '巴南', '黔江', '长寿', '綦江', '潼南', '铜梁', '大足', '荣昌',
            '壁山', '梁平', '城口', '丰都', '垫江', '武隆', '忠县', '开县', '云阳', '奉节', '巫山', '巫溪', '石柱', '秀山', '酉阳', '彭水', '江津', '合川', '永川', '南川'],
        ['石家庄', '邯郸', '邢台', '保定', '张家口', '承德', '廊坊', '唐山', '秦皇岛', '沧州', '衡水'],
        ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '吕梁', '忻州', '晋中', '临汾', '运城'],
        ['呼和浩特', '鄂尔多斯', '包头', '乌海', '赤峰', '呼伦贝尔', '阿拉善', '哲里木', '兴安', '乌兰察布', '锡林郭勒', '巴彦淖尔', '伊克昭'],
        ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
        ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边'],
        ['哈尔滨', '齐齐哈尔', '牡丹江', '佳木斯', '大庆', '绥化', '鹤岗', '鸡西', '黑河', '双鸭山', '伊春', '七台河', '大兴安岭'],
        ['南京', '镇江', '苏州', '南通', '扬州', '盐城', '徐州', '连云港', '常州', '无锡', '宿迁', '泰州', '淮安'],
        ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
        ['合肥', '芜湖', '蚌埠', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '宿州', '池州', '淮南', '巢湖', '阜阳', '六安', '宣城', '亳州'],
        ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
        ['南昌市', '景德镇', '九江', '鹰潭', '萍乡', '新余', '赣州', '吉安', '宜春', '抚州', '上饶'],
        ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '莱芜', '临沂', '德州', '聊城', '滨州', '菏泽'],
        ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店', '济源'],
        ['武汉', '宜昌', '荆州', '襄樊', '黄石', '荆门', '黄冈', '十堰', '恩施', '潜江', '天门', '仙桃', '随州', '咸宁', '孝感', '鄂州'],
        ['长沙', '常德', '株洲', '湘潭', '衡阳', '岳阳', '邵阳', '益阳', '娄底', '怀化', '郴州', '永州', '湘西', '张家界'],
        ['广州', '深圳', '珠海', '汕头', '东莞', '中山', '佛山', '韶关', '江门', '湛江', '茂名', '肇庆', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '潮州', '揭阳',
            '云浮'], ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '南宁地区', '柳州地区', '贺州', '百色', '河池'], ['海口', '三亚'],
        ['成都', '绵阳', '德阳', '自贡', '攀枝花', '广元', '内江', '乐山', '南充', '宜宾', '广安', '达川', '雅安', '眉山', '甘孜', '凉山', '泸州', '阿坝州', '遂宁', '巴中'],
        ['贵阳', '六盘水', '遵义', '安顺', '铜仁', '黔西南', '毕节', '黔东南', '黔南'],
        ['昆明', '大理', '曲靖', '玉溪', '昭通', '楚雄', '红河', '文山', '思茅', '西双版纳', '保山', '德宏', '丽江', '怒江', '迪庆', '临沧'],
        ['拉萨', '日喀则', '山南', '林芝', '昌都', '阿里', '那曲'], ['西安', '宝鸡', '咸阳', '铜川', '渭南', '延安', '榆林', '汉中', '安康', '商洛'],
        ['兰州', '嘉峪关', '金昌', '白银', '天水', '酒泉', '张掖', '武威', '定西', '陇南', '平凉', '庆阳', '临夏', '甘南'], ['银川', '石嘴山', '吴忠', '固原'],
        ['西宁', '海东', '海南', '海北', '黄南', '玉树', '果洛', '海西'],
        ['乌鲁木齐', '石河子', '克拉玛依', '伊犁', '巴音郭勒', '昌吉', '克孜勒苏柯尔克孜', '博尔塔拉', '吐鲁番', '哈密', '喀什', '和田', '阿克苏'], ['香港'], ['澳门'],
        ['台北', '高雄', '台中', '台南', '屏东', '南投', '云林', '新竹', '彰化', '苗栗', '嘉义', '花莲', '桃园', '宜兰', '基隆', '台东', '金门', '马祖', '澎湖'],
        ['北美洲', '南美洲', '亚洲', '非洲', '欧洲', '大洋洲', '火星']]

    // 订单提交后订单跳转地址的处理
    function __redirectUrlAfterSubmit(redirect_params, not_redirect_immediately) {
        // 订单提交成功后跳转地址
        var __order_submit_done_url = '/m/order_succ/'
        // if (window.__HDID) {
        //     __order_submit_done_url = '/m/hs_user_invoice/'
        // }
        if (window.__IS_ZMXY) {
            __order_submit_done_url = '/zhimacredit/orderSucc/'
            if (window.__FLAG_SUBMIT_REDIRECT_URL_OFFLINE && window.__SUBMIT_REDIRECT_URL_OFFLINE) {
                __order_submit_done_url = window.__SUBMIT_REDIRECT_URL_OFFLINE
            } else if (window.__SUBMIT_REDIRECT_URL) {
                __order_submit_done_url = window.__SUBMIT_REDIRECT_URL
            }

            var __daijiao = ''
            if (window.__IS_SELECTED_SF_PICKUP) {
                __daijiao = 'y'
            }
            __order_submit_done_url = tcb.setUrl2(__order_submit_done_url, {
                'daijiao': __daijiao
            })
        }

        __order_submit_done_url = tcb.setUrl2(__order_submit_done_url, redirect_params || {})
        if (not_redirect_immediately) {
            return __order_submit_done_url
        }
        window.location.href = __order_submit_done_url
    }

    var Root = tcb.getRoot(),
        o = Root.Order

    var renderEventMap = {
        // 页内组件输出

        // 输出评估检测报告
        assessDetectReport: bindEventAssessDetectReport,

        // 输出下单表单
        orderSubmit: bindEventOrderSubmit,

        // 到店列表事件
        daoDianShopList: bindEventSelectDaoDianShop,

        // 输出评估报告
        assessReport: bindEventAssessReport,

        xxgApplyGoodPrice: bindEventXxgApplyGoodPrice

    }

    o.event = function (event_key) {
        var
            event_fn = o.noop
        if (event_key) {
            event_fn = typeof renderEventMap[event_key] === 'function'
                ? renderEventMap[event_key]
                : event_fn
        }
        return event_fn
    }

    tcb.mix(o.event, {

        init: initEvent,
        // 单独绑定指定服务方式的下单事件
        shangMenOrderSubmit: __submitShangMenForm,
        shangMenOrderSubmitFengxiu: __submitShangMenFormFengxiu,
        youJiOrderSubmit: __submitYouJiForm,
        youJiOrderSubmitFengXiuSuNing: __submitYouJiFormFengXiuSuNing,
        daoDianOrderSubmit: __submitDaoDianForm,
        citySelectInst: null
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    function initEvent() {
        var
            $Target = o.getDoc()

        tcb.bindEvent($Target[0], {
            /**
             * 苏宁回收红包二维码
             * @param e
             */
            '.js-show-hs-redpack': function (e) {
                e.preventDefault()
                doGetTuijianQrcode(function (res) {
                    var img_url = res.result
                    tcb.imageOnload(img_url, function (img_obj) {
                        var html_str = '<p class="redpack-tit"> <i class="icon-redpack"></i>请用户扫码领红包</p><image src="' + img_url + '"/><p style="color: #fff;width: 2rem;margin: .1rem auto;">注意：此二维码为动态二维码，如需二次扫码请关闭弹窗重新生成</p>'
                        tcb.showDialog(html_str, {
                            className: 'dialog-hs-redpack',
                            middle: true
                        })
                    })
                })
            },
            //苏宁线下门店，换新优惠，展示二维码
            '.js-show-hs-hxbt': function (e) {
                e.preventDefault()
                var html_str = $.tmpl($.trim($('#JsMXxgSuNingHxbtTpl').html()))({})
                // var config = {
                //                 //     withMask: true,
                //                 //     middle: true,
                //                 //     withClose : false,
                //                 // }
                // tcb.showDialog(html_str, config)
                $('body').append(html_str)
            },
            '.js-show-hs-tmall-redpack': function (e) {
                e.preventDefault()
                doGetTmallRedpackQrcode(function (res) {
                    var img_url = res.result
                    tcb.imageOnload(img_url, function (img_obj) {
                        var html_str = '<p class="redpack-tit"> <i class="icon-tmall-redpack"></i>请用户扫码领红包</p><image src="' + img_url + '"/><p style="color: #fff;width: 2rem;margin: .1rem auto;">注意：此二维码为动态二维码，如需二次扫码请关闭弹窗重新生成</p>'
                        tcb.showDialog(html_str, {
                            className: 'dialog-hs-redpack',
                            middle: true
                        })
                    })
                })
            },
            '.hxbt_button': function (e) {
                e.preventDefault()
                $('.mask').remove()

            },
            /**
             * 点击提交表单按钮
             * @param e
             */
            '#BtnSubmitOrderForm': function (e) {

                e.preventDefault()

                // 合作商内嵌app，
                // 没有下单表单，直接返回
                var
                    $BlockDetectPartnerOrderSubmit = $('.block-detect-partner-order-submit')
                if ($BlockDetectPartnerOrderSubmit && $BlockDetectPartnerOrderSubmit.length) {
                    o.interact.scrollToTop($BlockDetectPartnerOrderSubmit.eq(0), true)

                    return
                }

                var
                    $Label = $Target.find('.row-hs-style-check')

                if (!o.valid.checkLabel($Label)) {
                    return
                }

                var
                    $Form = $Label.filter('.row-hs-style-checked').closest('.block-order-style').find('form')

                if ($Form && $Form.length) {

                    // 触发表单提交
                    $Form.trigger('submit')
                }
            },

            /**
             * 以旧换新，删除旧机
             * @param e
             */
            '.product-item-old-del': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $Item = $me.closest('.product-item-old')

                // 删除旧机
                __deleteOldProduct($Item)
            },
            /**
             * 天猫kindle以旧换新下单页补贴说明提示
             * @param e
             */
            '.btn-butie-dialog-trigger': function (e) {
                e.preventDefault()

                var html_str = $.tmpl($.trim($('#JsMHdTmallKindleButieDetailsDialogTpl').html()))({})
                var config = {
                    withMask: true,
                    className: 'dialog-kindle-butie-details-wrap',
                    middle: true
                }
                tcb.showDialog(html_str, config)
            },

            /**
             * 显示评估报告
             * @param e
             */
            '.btn-show-assess-report': function (e) {
                e.preventDefault()

                // 输出店铺列表
                o.interact.swipeIn({
                    selector: '.assess-report-section',
                    data: {
                        assess_key: o.data.url_query['assess_key']
                    },
                    render: 'assessReport',
                    percent: 100,
                    complete: function () {}
                })

            },

            // suning spread 立即卖出
            '.btn-trigger-suning-spread-sale': function (e) {
                e.preventDefault()

                var html_fn = $.tmpl($.trim($('#JsMSuningSpreadZhimacreditOrderAuthPanelTpl').html())),
                    html_st = html_fn()

                var config = {
                    withMask: true,
                    className: 'dialog-suning-spread-zhimacredit-auth',
                    middle: true
                }
                tcb.showDialog(html_st, config)
            },
            '.btn-suning-spread-zhimacredit-auth': function (e) {
                $.dialog.toast('即将为您跳转支付宝app进行授权。<br>如果打开支付宝app失败，<br>您可点击“直接下单，回收成功后立即拿钱”~', 4000)
                setTimeout(function () {
                    $.dialog.toast('尝试打开支付宝app失败。<br>您可点击“直接下单，回收成功后立即拿钱”~', 2000)
                }, 4001)
            },
            // 价格申请
            '.js-trigger-xxg-apply-good-price': function (e) {
                e.preventDefault()

                o.interact.swipeIn({
                    selector: '.xxg-apply-good-price-section',
                    data: {
                        pinggu_price: $('#AssessedModelPrice').attr('data-price'),
                        assess_key: o.data.url_query['assess_key']
                    },
                    render: 'xxgApplyGoodPrice',
                    percent: 100,
                    complete: function () {

                    }
                })
            }
        })
    }

    //获取推荐红包动态二维码
    function doGetTuijianQrcode(callback) {
        $.ajax({
            url: '/m/doGetTuijianQrcode',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (!res.errno) {
                    typeof callback === 'function' && callback(res)
                } else {
                    $.dialog.toast(res.errmsg)
                }
            },
            fail: function (e) {
                $.dialog.toast('网络错误，请重试')
            }
        })
    }

    function doGetTmallRedpackQrcode(callback) {
        $.ajax({
            url: '/m/getTmallCouponsWechatQRCode',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (!res.errno) {
                    typeof callback === 'function' && callback(res)
                } else {
                    $.dialog.toast(res.errmsg)
                }
            },
            fail: function (e) {
                $.dialog.toast('网络错误，请重试')
            }
        })
    }

    // 评估检测报告输出后，绑定事件
    function bindEventAssessDetectReport($Target) {
        if (!($Target && $Target.length)) {
            return
        }

    }

    // 评估报告输出后，绑定事件
    function bindEventAssessReport($Target) {
        if (!($Target && $Target.length)) {
            return
        }

    }

    // 表单提交输出后，绑定事件
    function bindEventOrderSubmit($Target) {
        if (!($Target && $Target.length)) {
            return
        }

        // 江苏移动切换收款方式
        __payoutMethodChangeOfJiangSuYiDong($Target)

        // 绑定input通用方法
        __inputEvent($Target)

        // 初始化城市触发器
        __citySelect()

        // 选择服务时间
        __timeSelect()

        // 选择银行地区
        __bankAreaSelect()

        // 选择服务方式
        __checkServiceType($Target)

        // 绑定表单提交
        __submitShangMenForm($Target)
        __submitShangMenFormFengxiu($Target)
        __submitDaoDianForm($Target)
        __submitYouJiForm($Target)
        __submitYouJiFormFengXiuSuNing($Target)
        __submitDaoDianBudanForm($Target)

        // 使用优惠码
        __usePromo($Target)

        tcb.bindEvent($Target, {
            /**
             * 触发到店回收的门店选择
             * @param e
             */
            '.daodian-addr-select-trigger': function (e) {
                e.preventDefault()

                // 输出店铺列表
                o.interact.swipeIn({
                    selector: '.daodian-addr-select-section',
                    data: {
                        shop_list: window.__DaoDianShopList || []
                    },
                    render: 'daoDianShopList',
                    percent: 80,
                    complete: function () {
                        $('#SwipeSectionMask').css('backgroundColor', 'rgba(0, 0, 0, 0.3)')
                    }
                })
            },

            /**
             * 手机号码输入
             */
            '[name="tel"]': {
                'keyup change': function (e) {
                    var
                        $me = $(this),
                        mobile = $.trim($me.val())

                    if (!tcb.validMobileInput(mobile)) {
                        $me.val(mobile.replace(/\D/g, ''))
                    }
                }
            },

            /**
             * 处理银行卡格式
             */
            '[name="pay_account"]': {
                'keyup change': function (e) {
                    var
                        $me = $(this)
                    $me.val($me.val().replace(/\D/g, ''))
                }
            },

            /**
             * 刷新图片验证码
             * @param e
             */
            '.vcode-img': function (e) {
                var
                    $me = $(this),
                    $secode_img = $('.vcode-img'),
                    $secode = $('[name="secode"]'),
                    src = tcb.setUrl2('/secode/?rands=' + Math.random())

                $secode_img.attr('src', src).attr('data-out-date', '')

                $secode.val('')

                $me.closest('.row').find('[name="secode"]').focus()
            },

            /**
             * 手机验证码(上门、到店、邮寄)
             * @param e
             */
            '.btn-send-vcode': function (e) {
                e.preventDefault()

                var $me = $(this),
                    $form = $me.closest('form'),
                    $mobile = $form.find('[name="tel"]'),
                    $pic_secode = $form.find('[name="secode"]'),
                    $sms_type = $form.find('[name="sms_type"]'),
                    $vcode_img = $form.find('.vcode-img')

                if ($me.hasClass('hsbtn-vcode-dis')) {
                    return
                }

                if ($vcode_img.attr('data-out-date')) {
                    $vcode_img.trigger('click')
                }

                if (!o.valid.seCode($me)) {
                    return
                }

                var mobile = tcb.trim($mobile.val() || '')
                if (window.__IS_XXG_IN_SUNING && $me.attr('data-sn-member') != mobile) { // 苏宁店家APP内，下单前需要先校验手机号是否为苏宁会员
                    o.valid.isSnMember({mobile: mobile}, function (flag, errmsg) {
                        if (flag) {
                            // 表示为苏宁会员，校验通过
                            $me.attr('data-sn-member', mobile)
                            $me.trigger('click')
                        } else {
                            $.dialog.alert('<div class="grid column justify-center align-center">' +
                                '<div style="font-size: .14rem;color: #000;">不是有效的苏宁会员</div>' +
                                '<div style="padding: .08rem 0;text-align: center;">请让用户使用微信扫码注册会员<br>或返回修改手机号</div>' +
                                '<div style="width: 1.6rem;height: 1.6rem; background: transparent url(https://p0.ssl.qhimg.com/t01c4a767e6ac524a67.jpg) no-repeat center;background-size: contain;"></div>' +
                                '</div>', null, {
                                btn: '关闭'
                            })
                        }
                    })
                    return false
                }

                o.data.getSeCode({
                    'mobile': $.trim($mobile.val()),
                    'pic_secode': $.trim($pic_secode.val()),
                    'sms_type': $.trim($sms_type.val())
                }, function (data, errno) {
                    if (errno) {
                        $me.removeClass('hsbtn-vcode-dis')
                        $vcode_img.trigger('click')
                    } else {
                        $me.addClass('hsbtn-vcode-dis').html('60秒后再次发送')
                        $vcode_img.attr('data-out-date', '1')

                        tcb.distimeAnim(60, function (time) {
                            if (time <= 0) {
                                $me.removeClass('hsbtn-vcode-dis').html('发送验证码')
                            } else {
                                $me.html(time + '秒后再次发送')
                            }
                        })
                    }
                }, function () {
                    $.dialog.toast('系统错误，请稍后重试', 2000)
                })
            },

            /**
             * 切换邮寄回收收款方式（支付宝、银行卡、微信）
             * @param e
             */
            '.payout-method-item': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $Form = $me.closest('form')

                $Form.find('.payout-method-item.b-radius-green').removeClass('b-radius-green')
                $me.addClass('b-radius-green')

                var
                    $pay_info = $Form.find('.block-pay-info'),
                    $common_info = $Form.find('.block-common-info'),
                    rel = $me.attr('data-rel')

                if (rel == 'wechat') {
                    // 切换为微信收款

                    $('.row-hs-style-check .desc').text(' + 送现金红包')

                    if (window.__is_wechat && o.data.url_query['weixin_pay'] != '1' && !window.__is_daodian_qft_n_weixin) {
                        // 在微信内打开，并且没有weixin_pay=1（直接跳转到带weixin_pay参数为1的地址）
                        // 并且，非修修哥奇付通补单

                        window.location.href = tcb.setUrl2(window.location.href, {
                            'weixin_pay': '1',
                            'city_name': $('.trigger-select-city').attr('data-city')
                        })

                    } else {

                        // 非微信打开，或者 o.data.url_query['weixin_pay'] == '1'

                        if (!window.__is_wechat || window.__is_daodian_qft_n_weixin) {
                            // 非微信打开，o.data.url_query['weixin_pay']可能为'1'，也可能非'1'
                            // 或者，修修哥奇付通补单

                            $pay_info
                                .hide()
                                .filter(function () {return $(this).attr('data-for') === 'other-' + rel})
                                .show()
                                .find('.js-trigger-change-back-payout-account')
                                .hide()
                            $common_info.hide()

                        } else {
                            // 微信内打开 && o.data.url_query['weixin_pay'] == '1'
                            // 此处无 o.data.url_query['weixin_pay']为非'1'的情况，因为非'1'情况下，会提前跳转到 o.data.url_query['weixin_pay']为'1'的地址

                            $pay_info
                                .hide()
                                .filter(function () {return $(this).attr('data-for') === rel})
                                .show()
                            $common_info.show()
                        }

                    }

                } else {

                    if (__is_send_redpackage) {

                        $('.row-hs-style-check .desc').text('')
                    } else {
                        if (!__is_youji) {
                            $('.row-hs-style-check .desc').html('&nbsp;')
                        } else {
                            $('.row-hs-style-check .desc').text(' 满' + __reach_price + '+' + __add_price)
                        }

                    }


                    // 非微信收款，一切如旧

                    $pay_info
                        .hide()
                        .filter(function () {return $(this).attr('data-for') === rel})
                        .show()
                    $common_info.show()
                }

                o.interact.resizeScrollInnerHeight()
            },

            /**
             * 使用其他微信账号收款
             * @param e
             */
            '.js-trigger-change-payout-account': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $Form = $me.closest('form'),
                    $pay_info = $Form.find('.block-pay-info'),
                    $common_info = $Form.find('.block-common-info')

                $common_info.hide()
                $pay_info.hide()
                         .filter(function () {
                             return $(this).attr('data-for') === 'other-wechat'
                         }).show()
            },

            /**
             * 返回使用当前微信账号收款
             * @param e
             */
            '.js-trigger-change-back-payout-account': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $Form = $me.closest('form'),
                    $pay_info = $Form.find('.block-pay-info'),
                    $common_info = $Form.find('.block-common-info')

                $common_info.show()
                $pay_info.hide()
                         .filter(function () {
                             return $(this).attr('data-for') === 'wechat'
                         }).show()
            },
            /**
             * 点击按钮，改变p-type的值 1代表大陆 2代表香港
             * @param e
             */
            '.js-change-type': function (e) {
                e.preventDefault()
                var
                    $me = $(this),
                    $Form = $me.closest('form'),
                    $p_type = $Form.find('input[name="p_type"]'),
                    $mobile = $Form.find('input[name="tel"]'),
                    p_type = $p_type.val()
                $mobile.attr('maxlength') == '11' ? $mobile.attr('maxlength', '8') : $mobile.attr('maxlength', '11')
                $p_type.val(p_type == '1' ? '2' : '1')
                if ($p_type.val() == '1') {
                    $('.isShowImg_Phone').css('display', 'block')
                } else {
                    $('.isShowImg_Phone').css('display', 'none')
                }
            }
        })

    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    // 江苏移动切换收款方式
    function __payoutMethodChangeOfJiangSuYiDong($Target) {
        var $PayoutMethod = $Target.find('.row-jiangsu-yidong-payout-method')

        if (!($PayoutMethod && $PayoutMethod.length)) {
            return
        }

        $PayoutMethod.on('click', function (e) {
            var $me = $(this)

            if ($me.hasClass('row-jiangsu-yidong-payout-method-disabled')) {
                return
            }

            var $Checked = $me.find('.payout-method-radio-checked')

            if ($Checked.length) {
                return
            }

            var $Form = $me.closest('form'),
                payout_method = $me.attr('data-pay-method')
            $Form.find('.block-sub-order-form').hide()
            $Form.find('[name="pay_method"]').val(payout_method)

            $PayoutMethod.find('.payout-method-radio-checked').removeClass('payout-method-radio-checked')
            $me.find('.payout-method-radio').addClass('payout-method-radio-checked')

            $me.find('.block-sub-order-form').show()

            setTimeout(function () {
                o.interact.scrollToTop($Form, true)
            }, 200)
        })
    }

    // 选择服务时间
    function __timeSelect() {
        // 选择服务时间
        var datetimeObj = new $.datetime('[name="server_time"]', {
            remote: tcb.setUrl2('/aj/doGetValidDateByRecovery'),
            noStyle: true
        })

        tcb.cache('SHANG_MEN_DATETIME_OBJ', datetimeObj)
    }

    // 选中到店店铺
    function bindEventSelectDaoDianShop($Target) {
        if (!($Target && $Target.length)) {
            return
        }

        $Target.find('.daodian-shop-item').on('click', function (e) {
            e.preventDefault()

            var
                $me = $(this),
                $trigger = $('.daodian-addr-select-trigger'),
                $row = $trigger.closest('.row-daodian-addr-select'),
                shop_id = $me.attr('data-id'),
                shop_price = $me.attr('data-price'),
                shop_tel = $me.attr('data-tel')

            $trigger.html($me.html()).removeClass('default')
            $row.addClass('selected')

            $('[name="shop_id"]').val(shop_id)

            var
                daodian_fare = shop_price ? '报销' + shop_price + '元路费' : ''

            $('#DaodianFare').html(daodian_fare)

            var
                daodian_addr = '<span class="hs-daodian-addr">下单后，请您带旧机到' + $me.find('.s-name').html() + '（' + $me.find('.s-addr').html() + '）'
            //if (shop_price) {
            //    daodian_addr += '，交易成功补贴' + shop_price + '元！'
            //}
            daodian_addr += '</span>'
            if (shop_tel) {
                daodian_addr += '<br> 360客服电话：<span style="color:#2e74d3" href="tel:' + shop_tel + '">' + shop_tel + '</span>'
            }
            $('#DaodianAddrTips').html(daodian_addr)

            // 关闭选择层
            o.interact.swipeOut()

        })

    }

    // 选择服务方式
    function __checkServiceType($Target) {
        var $checkLine = $Target.find('.row-hs-style-check')
        //回收类型切换效果
        $checkLine.on('click', function (e) {
            e.preventDefault()
            var $t = $(e.target),
                $me = $(this),
                $common_info = $me.closest('.block-order-shangmen').find('.block-common-info')

            if ($me.attr('data-no-click') == '1') {
                $.dialog.toast($me.attr('data-no-click-text') || '当前城市尚未开通上门回收', 3000)
                return
            }

            // 显示完整的上门地址弹窗
            if ($t.attr('id') === 'OrderShangMenArea' && !$t.attr('data-no-alert')) {
                e.stopPropagation()

                $.dialog.alert('<p>' + $t.html() + '</p>')

                return false
            }

            // 已经选中
            if ($me.hasClass('row-hs-style-checked')) {
                return false
            }

            var
                $next = $me.next(),
                $blockOrderStyle = $me.closest('.block-order-style'),
                $checked = $('.row-hs-style-checked')

            //// 切换到邮寄回收，刷新图形验证码
            //if ($me.closest ('.block-order-style').attr ('data-type') == '3') {
            //
            //    $ ('.vcode-img').attr ('src', '/secode/?rands=' + Math.random ())
            //}

            if (!($checked && $checked.length)) {
                // 第一次点击选择回收方式，刷新secode

                __refreshSeCode()
            } else {
                $checked.removeClass('row-hs-style-checked')
                $checked.find('.icon-circle')
                        .addClass('b-radius-circle')
                        .removeClass('icon-zhifuchenggong')
            }

            $('.block-order-form').hide()

            var service_type = $blockOrderStyle.attr('data-type')

            if (service_type == '5' || service_type == '404') {
                // 扫码回收
                $('.block-btn').hide()
            } else {
                $('.block-btn').show()
            }

            // 选择邮寄回收时默认选中微信支付
            // 如果存在苏宁小店的时候,则默认选中苏宁小店
            var suning_tuijian = $Target.find('.payout-method-snpay')

            if (service_type == '3' && !suning_tuijian.length) {
                $Target.find('.payout-method-wechat').trigger('click')
            }
            //如果点击的是上门，则显示公共选项
            if (service_type == '1') {
                $common_info.show()
            }
            //如果点击的是上门，而且此时上门支持微信、支付宝、银行卡支付，那么默认选择微信支付
            if (service_type == '1' && window.M_SHOW_OFFLINE_PAYOUT) {
                $Target.find('.payout-method-wechat').trigger('click')
            }

            // 显示动画
            $me.find('.icon-circle')
               .addClass('icon-zhifuchenggong')
               .removeClass('b-radius-circle')
            $me.addClass('row-hs-style-checked')
               .animate({
                   'opacity': 0
               }, 0, function () {
                   $me.animate({
                       'opacity': 1
                   }, 400)
               })
               .next().show()
               .animate({
                   'opacity': 0,
                   'translateY': '-' + $me.height() + 'px'
               }, 0, function () {

                   $next.animate({
                       'opacity': 1,
                       'translateY': '0'
                   }, 400, 'ease-in', function () {
                       setTimeout(function () {
                           //var $first = $next.find ('[type="text"],[type="tel"]').first ()

                           if (!$me.attr('data-no-scroll-to-top')) {
                               o.interact.scrollToTop($me, true, function () {
                                   //$first.focus ()
                               })
                           } else {
                               o.interact.resizeScrollInnerHeight()
                           }

                       }, 200)
                   })

               })
        })
        __userAddress()
    }

    //选择用户收获地址
    function __userAddress() {
        var
            options = {
                // 实例化的时候自动执行init函数
                flagAutoInit: true,
                selectorTrigger: '.user_address',
                not_render: true,
                callback_cancel: null,
                callback_confirm: function (region) {
                    //console.log(region)
                    $('[name="province"]').val(region['province_id'])
                    $('[name="city"]').val(region['city_id'])
                    $('[name="area"]').val(region['area_id'])
                    $('.user_address').text(region['province'] + '  ' + region['city'] + '  ' + region['area'])

                }
            }

        // 初始化省/市/区县选择器
        Bang.AddressSelect(options)
    }

    // 选择城市
    function __citySelect() {
        var $trigger = $('.trigger-select-city')

        // 禁止城市选择
        if ($trigger.hasClass('disabled')) {
            $trigger.on('click', function (e) {
                e.preventDefault()
                $.dialog.toast('无法切换城市', 2000)
            })
            return
        }

        var province = $trigger.attr('data-province') || '',
            city = $trigger.attr('data-city') || '',
            area = $trigger.attr('data-area') || '',
            options = {
                // 实例化的时候自动执行init函数
                flagAutoInit: true,
                selectorTrigger: '.trigger-select-city',
                province: province,
                city: city,
                area: area,
                show_city: true,
                show_area: true,
                not_render: true,
                callback_cancel: null
                // callback_confirm : function (region) {
                //     region = region || {}
                //
                //     var city = region['city'] || '',
                //         city_id = region['city_id'] || '',
                //         province = region['province'] || '',
                //         province_id = region['province_id'] || ''
                //
                //     // 城市切换没有任何变化，那么不做任何处理
                //     if ($trigger.attr ('data-city') === city) {
                //         return
                //     }
                //
                //     // 设置全局的省、市信息
                //     window.__Province['id'] = province_id
                //     window.__Province['name'] = province
                //     window.__Province['code'] = ''
                //     window.__City['id'] = city_id
                //     window.__City['name'] = city
                //     window.__City['code'] = ''
                //
                //     o.handle.citySelectDone ($trigger, region, function(){
                //         if(window.__IS_PARTNER_LIDIANHUISHOU&&window.__IS_SUPPORT_SHANGMEN){
                //             window.__TPL_TYPE_DATA['order_server_type_default']=1
                //         }else{
                //             window.__TPL_TYPE_DATA['order_server_type_default']=3
                //         }
                //         // 判断是否有需要默认被选中的服务方式，如若有，那么将其选中展开
                //         var order_server_type_default = window.__TPL_TYPE_DATA['order_server_type_default']
                //         if (order_server_type_default){
                //             if(window.__IS_PARTNER_FENGXIU_FENGXIU) {
                //                 var $noClick=$('.m-huishou-partner-fengxiu-suning .block-order-shangmen .row-hs-style-check')
                //                 var $adderssTips = $('#OrderShangMen')
                //                 if(city=='北京'){
                //                     $noClick.attr("data-no-click",'0')
                //                     $noClick.attr("data-no-click-text",'')
                //                     $adderssTips.html('限北京东城/西城/朝阳/海淀/通州区')
                //                 } else {
                //                     order_server_type_default = 3
                //                     // 如果默认定位的城市不是北京，那么给上门回收增加标识，不可点击
                //                     $noClick.attr("data-no-click",'1')
                //                     $noClick.attr("data-no-click-text",'当前城市尚未开通上门回收')
                //                     $adderssTips.html('当前城市尚未开通')
                //                 }
                //             }else if(window.__IS_PARTNER_LIDIANHUISHOU){
                //                 //离店回收
                //                 var $notClick=$('.m-huishou-partner-ldhs .block-order-shangmen .row-hs-style-check')
                //                 var $adderssTips = $('#OrderShangMenArea')
                //                 if(window.__IS_SUPPORT_SHANGMEN){
                //                     $notClick.attr("data-not-click",'0')
                //                     $notClick.attr("data-not-click-text",'')
                //                 } else {
                //                     order_server_type_default = 3
                //                     $notClick.attr("data-not-click",'1')
                //                     $notClick.attr("data-not-click-text",'当前城市尚未开通上门回收')
                //                     $adderssTips.show()
                //                     $adderssTips.html('当前城市尚未开通')
                //                 }
                //
                //             }
                //             var $BlockOrderStyle = $('.block-order-style[data-type="'+order_server_type_default+'"]'),
                //                 $RowHSStyleCheck = $BlockOrderStyle.find ('.row-hs-style-check')
                //
                //             if (!($RowHSStyleCheck && $RowHSStyleCheck.length && $RowHSStyleCheck.height())) {
                //                 return
                //             }
                //
                //             // 设置不将回收方式选择tab滚动到顶部
                //             $RowHSStyleCheck.attr('data-no-scroll-to-top', '1').trigger ('click')
                //
                //             setTimeout(function(){
                //                 $RowHSStyleCheck.attr('data-no-scroll-to-top', '')
                //             }, 1500)
                //         }
                //     })
                // }
            }

        if (window.__IS_SUNING_YUNDIAN_MINIAPP) {
            // 苏宁云店miniAPP
            options.show_area = false
            options.show_area = false
            options.flagStorage = false
            options.url_province = '/yigou/doGetYundianProvinceList'
            options.url_city_area = '/yigou/doGetYundianProvinceLinkage'
            // 初始化省/市/区县选择器
            o.event.citySelectInst = Bang.AddressSelect(options)
        } else {
            var clientLocation = window.__CLIENT_LOCATION || {}
            options.province = clientLocation && clientLocation.province && clientLocation.province.name
            options.city = clientLocation && clientLocation.city && clientLocation.city.name
            options.area = clientLocation && clientLocation.area && clientLocation.area.name
            options.selectorProvince = '[name="ad_province_code"]'
            options.selectorCity = '[name="ad_city_code"]'
            options.selectorArea = '[name="ad_area_code"]'
            options.flagAutoInit = false // 不做自动初始化
            // 初始化省/市/区县选择器
            o.event.citySelectInst = Bang.AddressSelect2(options)
        }
    }


    function __inputEvent($Target) {
        $Target.find('input').on({
            'focus': function (e) {
                var
                    $me = $(this),
                    type = $me.attr('type').toString().toLowerCase(),
                    types = [
                        'checkbox', 'radio', 'button', 'file', 'image', 'hidden', 'reset'
                    ]

                if (tcb.inArray(type, types) > -1) {
                    return
                }

                //$ ('.block-btn').hide ()

                o.interact.resizeScrollInnerHeight($me)
            },
            'blur': function (e) {
                //$ ('.block-btn').show ()

            }
        })
    }


    // 选择银行地区
    function __bankAreaSelect() {
        new bankAreaSelector('#provenceSelect', '#citySelect', '#YouJiSaleForm [name="bank_area"]', __bankArea)
        new bankAreaSelector('#provenceSelect_sm', '#citySelect_sm', '#ShangMenSaleForm [name="bank_area"]', __bankArea)
        new bankAreaSelector('#provenceSelect', '#citySelect', '#DaoDianBudanSaleForm [name="bank_area"]', __bankArea)
        new bankAreaSelector('#provenceSelect', '#citySelect', '#ShangMenSaleFormFengxiu [name="bank_area"]', __bankArea)
        new bankAreaSelector('#provenceSelect_fxsn', '#citySelect_fxsn', '#YouJiSaleFormFengXiuSuNing [name="bank_area"]', __bankArea)
    }

    function __usePromo($Target) {
        var
            $UsePromo = $Target.find('.use-promo-wrap')
        // 使用优惠码
        $UsePromo.forEach(function (el, i) {
            var wWrap = $(el)
            // 使用优惠码
            tcb.usePromo({
                'service_type': 2,
                'product_id': '',
                'price': $('#AssessedModelPrice').attr('data-price'),
                'request_params': {
                    assess_key: tcb.queryUrl(window.location.search, 'assess_key')
                },
                'wWrap': wWrap,
                'succ': function (youhuiPrice, min_sale_price, wWrap) {
                    wWrap.find('.promoYZ').html('优惠码有效，卖出可多收' + youhuiPrice + '元').removeClass('promo-fail').addClass('promo-succ')
                },
                'fail': function (wWrap) {

                },
                'onActive': function (wWrap) {
                    o.interact.resizeScrollInnerHeight()
                }
            })
        })
    }

    // 上门回收
    function __submitShangMenForm($Target) {
        var
            $Form = $Target.find('#ShangMenSaleForm')
        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: window.__HDID ? 'huanXinShangMenForm' : 'shangMenForm',
            post: 'postShangMenForm',
            before: function ($Form) {
                var
                    $pay_channel = $Form.find('[name="pay_channel"]'),
                    $bank_name = $Form.find('[name="bank_name"]'),
                    $bank_area = $Form.find('[name="bank_area"]'),
                    $pay_account = $Form.find('[name="pay_account"]'),
                    $account_holder = $Form.find('[name="account_holder"]'),
                    $alipay_id = $Form.find('[name="alipay_id"]'),
                    $alipay_name = $Form.find('[name="alipay_name"]')

                if (!window.M_SHOW_OFFLINE_PAYOUT) {
                    // 银行卡收款
                    $bank_name.val('-1')
                    $bank_area.val('')
                    $pay_account.val('')
                    $account_holder.val('')
                    // 支付宝收款
                    $alipay_id.val('')
                    $alipay_name.val('')
                }

                // 将银行名称+银行地区的值，
                // 设置到支付通道
                $pay_channel.val($bank_name.val() + '|' + $bank_area.val())
            },
            after: function (data, errno) {
                if (errno) {
                    //$.dialog.toast ('系统异常，请重试')

                    return
                }

                // 将已经下单的assess_key存入sessionStorage以备用
                var assess_key = $Form.find('[name="assess_key"]').val()
                if (tcb.supportSessionStorage()) {
                    sessionStorage.setItem(assess_key, '1')
                }

                __redirectUrlAfterSubmit({
                    'order_id': data['parent_id']
                })
            }
        })
    }

    // 丰修上门回收
    function __submitShangMenFormFengxiu($Target) {
        var
            $Form = $Target.find('#ShangMenSaleFormFengxiu')
        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: 'shangMenFormFengxiu',
            post: 'postShangMenForm',
            before: function ($Form) {
                var
                    $pay_channel = $Form.find('[name="pay_channel"]'),
                    $bank_name = $Form.find('[name="bank_name"]'),
                    $bank_area = $Form.find('[name="bank_area"]')

                // 将银行名称+银行地区的值，
                // 设置到支付通道
                $pay_channel.val($bank_name.val() + '|' + $bank_area.val())
            },
            after: function (data, errno) {
                if (errno) {
                    //$.dialog.toast ('系统异常，请重试')

                    return
                }

                // 将已经下单的assess_key存入sessionStorage以备用
                var assess_key = $Form.find('[name="assess_key"]').val()
                if (tcb.supportSessionStorage()) {
                    sessionStorage.setItem(assess_key, '1')
                }

                __redirectUrlAfterSubmit({
                    'order_id': data['parent_id']
                })

            }
        })
    }

    // 到店回收
    function __submitDaoDianForm($Target) {
        var
            $Form = $Target.find('#DaoDianSaleForm')
        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: window.__HDID ? 'huanXinDaoDianForm' : 'daoDianForm',
            post: 'postDaoDianForm',
            before: function ($Form) {},
            after: function (data, errno) {
                if (errno) {
                    //$.dialog.toast ('系统异常，请重试')

                    return
                }

                // 将已经下单的assess_key存入sessionStorage以备用
                var assess_key = $Form.find('[name="assess_key"]').val()
                if (tcb.supportSessionStorage()) {
                    sessionStorage.setItem(assess_key, '1')
                }

                __redirectUrlAfterSubmit({
                    'order_id': data['parent_id']
                })
            }
        })
    }

    // 到店回收
    function __submitDaoDianBudanForm($Target) {
        var
            $Form = $Target.find('#DaoDianBudanSaleForm')
        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: 'daoDianBudanForm',
            post: 'postDaoDianForm',
            before: __beforeSubmitDaoDianBuDanForm,
            afterValid: __afterValidDaoDianBuDanForm,
            after: __afterSubmitDaoDianBuDanForm
        })
    }

    // 邮寄回收表单
    function __submitYouJiForm($Target) {
        var
            $Form = $Target.find('#YouJiSaleForm')

        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: window.__HDID ? 'huanXinYouJiForm' : 'youJiForm',
            post: 'postYouJiForm',
            before: function ($Form) {
                if (window.__HDID) {
                    // 以旧换新，不需要验证银行相关信息

                    return
                }
                var
                    $pay_channel = $Form.find('[name="pay_channel"]'),
                    $bank_name = $Form.find('[name="bank_name"]'),
                    $bank_area = $Form.find('[name="bank_area"]')

                // 将银行名称+银行地区的值，
                // 设置到支付通道
                $pay_channel.val($bank_name.val() + '|' + $bank_area.val())
            },
            afterValid: function ($Form) {
                if (window.__IS_GOLD_ORDER) {
                    if (window.__IS_GOLD_ORDER_CONTINUE) {
                        window.__IS_GOLD_ORDER_CONTINUE = false
                    } else {
                        return continueGoldEngineerOrderPayment($Form)
                    }
                }
            },
            after: function (data, errno) {
                if (errno) {
                    return
                }

                // 将已经下单的assess_key存入sessionStorage以备用
                var assess_key = $Form.find('[name="assess_key"]').val()
                if (tcb.supportSessionStorage()) {
                    sessionStorage.setItem(assess_key, '1')
                }

                var
                    order_id = data['parent_id'], //'1701046319322003800'
                    redirect_params = {
                        'order_id': order_id
                    },
                    redirect_url = __redirectUrlAfterSubmit(redirect_params, true)

                // if (window.__HDID){
                //     // 活动邮寄回收
                //
                //     window.location.href = redirect_url
                // } else {
                // 普通邮寄回收
                //againOneOrder   存在 表示是再来一单的订单  所以不用填地址
                if (typeof YuyueKuaidi !== 'undefined' && !data['againOneOrder'] && !window.__GOLD_ORDER_HIDE_POST_ADDRESS) {
                    YuyueKuaidi.getGuoGuoForm && YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                        var
                            html_fn = $.tmpl(tcb.trim($('#JsMHSSchedulePickupPanelTpl').html())),
                            html_st = html_fn({
                                data: {
                                    province: window.__Province['name'],
                                    city: window.__City['name'],
                                    area_list: res['area_list'] || [],
                                    mobile: res['default_mobile'],
                                    order_id: order_id,
                                    url: redirect_url
                                }
                            })

                        var
                            DialogObj = tcb.showDialog(html_st, {
                                className: 'schedule-pickup-panel',
                                withClose: false,
                                middle: true,
                                onClose: function () {
                                    window.location.href = redirect_url
                                }
                            })

                        // 绑定预约取件相关事件
                        YuyueKuaidi.bindEventSchedulePickup(DialogObj.wrap, redirect_url)

                    })
                } else {
                    window.location.href = redirect_url
                }
                // }

            }
        })

    }

    // 邮寄丰修 in苏宁引流 回收表单
    function __submitYouJiFormFengXiuSuNing($Target) {
        var
            $Form = $Target.find('#YouJiSaleFormFengXiuSuNing')

        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: window.__HDID ? 'huanXinYouJiForm' : 'youJiForm',
            post: 'postYouJiForm',
            before: function ($Form) {
                if (window.__HDID) {
                    // 以旧换新，不需要验证银行相关信息

                    return
                }
                var
                    $pay_channel = $Form.find('[name="pay_channel"]'),
                    $bank_name = $Form.find('[name="bank_name"]'),
                    $bank_area = $Form.find('[name="bank_area"]')

                // 将银行名称+银行地区的值，
                // 设置到支付通道
                $pay_channel.val($bank_name.val() + '|' + $bank_area.val())
            },
            afterValid: function ($Form) {
                if (window.__IS_GOLD_ORDER) {
                    if (window.__IS_GOLD_ORDER_CONTINUE) {
                        window.__IS_GOLD_ORDER_CONTINUE = false
                    } else {
                        return continueGoldEngineerOrderPayment($Form)
                    }
                }
            },
            after: function (data, errno) {
                if (errno) {
                    return
                }

                // 将已经下单的assess_key存入sessionStorage以备用
                var assess_key = $Form.find('[name="assess_key"]').val()
                if (tcb.supportSessionStorage()) {
                    sessionStorage.setItem(assess_key, '1')
                }

                var
                    order_id = data['parent_id'], //'1701046319322003800'
                    redirect_params = {
                        'order_id': order_id
                    },
                    redirect_url = __redirectUrlAfterSubmit(redirect_params, true)

                // if (window.__HDID){
                //     // 活动邮寄回收
                //
                //     window.location.href = redirect_url
                // } else {
                // 普通邮寄回收

                if (typeof YuyueKuaidi !== 'undefined' && !data['againOneOrder']) {
                    YuyueKuaidi.getGuoGuoForm && YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                        var
                            html_fn = $.tmpl(tcb.trim($('#JsMHSSchedulePickupPanelTpl').html())),
                            html_st = html_fn({
                                data: {
                                    province: window.__Province['name'],
                                    city: window.__City['name'],
                                    area_list: res['area_list'] || [],
                                    mobile: res['default_mobile'],
                                    order_id: order_id,
                                    url: redirect_url
                                }
                            })

                        var
                            DialogObj = tcb.showDialog(html_st, {
                                className: 'schedule-pickup-panel',
                                withClose: false,
                                middle: true,
                                onClose: function () {
                                    window.location.href = redirect_url
                                }
                            })

                        // 绑定预约取件相关事件
                        YuyueKuaidi.bindEventSchedulePickup(DialogObj.wrap, redirect_url)

                    })
                } else {
                    window.location.href = redirect_url
                }
                // }

            }
        })

    }

    function continueGoldEngineerOrderPayment($Form) {
        var data = tcb.queryUrl($Form.serialize() || '') || {}
        var html_fn = $.tmpl(tcb.trim($('#JsMHSDialogGoldEngineerOrderPaymentTpl').html())),
            html_st = html_fn({
                data: data
            })
        var inst = tcb.showDialog(html_st, {
            className: 'dialog-gold-engineer-order-payment',
            middle: true
        })
        inst.wrap.find('.js-trigger-gold-engineer-payment-submit').on('click', function (e) {
            e.preventDefault()
            var $me = $(this)
            var $dialogInner = $me.closest('.dialog-inner')
            var $advance_payment_amount = $dialogInner.find('[name="advance_payment_amount"]')
            var advance_payment_amount = parseFloat(tcb.trim($advance_payment_amount.val()))
            var int_advance_payment_amount = parseInt(tcb.trim($advance_payment_amount.val()), 10)
            if (advance_payment_amount <= 0 || int_advance_payment_amount !== advance_payment_amount) {
                return $.dialog.toast('支付金额应为大于0的整数')
            }
            $.dialog.confirm(
                '<div class="row"><div class="col-left-fixed">支付金额：</div><div class="col-right">' + advance_payment_amount + '</div></div>' +
                '<div class="row"><div class="col-left-fixed">支付宝收款人：</div><div class="col-right">' + data.alipay_name + '</div></div>' +
                '<div class="row"><div class="col-left-fixed">支付宝收款账号：</div><div class="col-right">' + data.alipay_id + '</div></div>',
                function () {
                    $Form.find('[name="advance_payment_amount"]').val(advance_payment_amount)
                    window.__IS_GOLD_ORDER_CONTINUE = true
                    tcb.closeDialog()
                    $Form.trigger('submit')
                }
            )
        })
        return false
    }

    // 绑定表单提交事件
    function __bindFormSubmit(options) {
        var
            $Form = options['$form']
        if (!($Form && $Form.length)) {
            return //console.error ('表单都没有，提交个串串？')
        }
        $Form.on('submit', function (e) {
            e.preventDefault()

            var
                $me = $(this)

            // before
            if (typeof options['before'] === 'function') {
                if (options['before']($Form) === false) {
                    // before函数返回值绝等于 false 时，直接返回退出表单提交

                    return
                }
            }

            // 验证表单
            if (options['valid'] && !o.valid[options['valid']]($Form)) {

                return console.error('表单验证失败了，检查检查呗～')
            }

            // afterValid
            if (typeof options['afterValid'] === 'function') {
                if (options['afterValid']($Form) === false) {
                    // afterValid函数返回值绝等于 false 时，直接返回退出表单提交

                    return
                }
            }

            var
                $Btn = options['$btn'] || $('#BtnSubmitOrderForm'),
                default_btn_text = $Btn.val()

            $Btn.addClass('btn-disabled').val('提交中...')

            // 提交表单数据
            o.data[options['post']]($me, function (data, errno) {

                if (errno) {
                    $Btn.removeClass('btn-disabled').val(default_btn_text)
                }

                // after
                typeof options['after'] === 'function' && options['after'](data, errno)

            }, function () {

                $.dialog.toast('系统异常，请重试')

                $Btn.removeClass('btn-disabled').val(default_btn_text)
            })

        })
    }

    // 删除旧机
    function __deleteOldProduct($Item) {
        var
            assess_key = $Item.attr('data-assess-key')

        // 删除购物车内回收机器item
        $.post('/huishou/doDelCart', {'assess_key': assess_key}, function (res) {
            res = JSON.parse(res)

            if (!res['errno']) {

                var
                    $Sib = $Item.siblings('.product-item-old')

                // 购物车中还有其他机器
                if ($Sib.length > 0) {
                    var
                        res_obj = res['result'],

                        customer_pay = res_obj.new_machine_price, // 客户支付金额（负数表示我们需要支付给用户的金额）
                        new_product_price = $('#HuanXinNewProduct').attr('data-price'), // 新机价格
                        old_product_price = new_product_price - customer_pay, // 旧机价格
                        samsung_butie_price = $('.samsung-butie').attr('data-butie-price')//三星以旧换新补贴

                    // 如有三星补贴，客户支付价格减去补贴价，否则减0
                    customer_pay -= samsung_butie_price || 0

                    var
                        str = ''
                    if (customer_pay < 0) {
                        // 客户可获得金额

                        str = '除了全新' + res_obj.model_name + '外您还能获得： <span class="final-price" id="AssessedModelPrice" data-price="' + old_product_price + '">' + Math.abs(customer_pay) + '元 '
                        if (window.__HDID == '8') {
                            str = '除了' + res_obj.model_name + '外您还能获得： <span class="final-price" id="AssessedModelPrice" data-price="' + old_product_price + '">' + Math.abs(customer_pay) + '元 '
                        }
                    } else {
                        // 客户支出金额

                        str = '换个新' + res_obj.model_name + '仅需：<span class="final-price" id="AssessedModelPrice" data-price="' + old_product_price + '">' + customer_pay + '元</span>'
                        if (window.__HDID == '8') {
                            str = '换个' + res_obj.model_name + '仅需：<span class="final-price" id="AssessedModelPrice" data-price="' + old_product_price + '">' + customer_pay + '元</span>'
                        }
                    }
                    $('.final-price-desc').html(str)

                    // 根据城市，机器价格，[hdid]，设置可用服务方式
                    var $triggerSelectCity = $('.trigger-select-city')
                    var ad_province_code = $triggerSelectCity.attr('data-province-code'),
                        ad_city_code = $triggerSelectCity.attr('data-city-code'),
                        ad_area_code = $triggerSelectCity.attr('data-area-code'),
                        city_name = $triggerSelectCity.attr('data-city')
                    var params = {
                        city_name: city_name,
                        assess_price: $('#AssessedModelPrice').attr('data-price')
                    }
                    if (ad_city_code) {
                        params.ad_province_code = ad_province_code
                        params.ad_city_code = ad_city_code
                        params.ad_area_code = ad_area_code
                    }
                    o.handle.setServiceType(params)

                    $Item.css({
                        'height': $Item.height()
                    })

                    $Item.animate({
                        'opacity': 0,
                        'height': '0px'
                    }, 400, function () {
                        $Item.remove()
                        $('.btn-add-more').show()
                    })

                } else {
                    // 删除购物车内最后一台回收的机器
                    // 跳转到m优品，重新选择换新
                    var
                        m_host = window.__MHOST

                    if (o.data.url_query['newproductid']) {
                        window.location.href = tcb.setUrl2(
                            m_host + '/youpin/product',
                            {'product_id': o.data.url_query['newproductid']},
                            ['newproductid']
                        )
                    } else {
                        window.location.href = tcb.setUrl2('/m/hs')
                    }
                }
            }

        })
    }

    // 刷新图形验证码
    function __refreshSeCode() {
        if (window.__is_secode_refreshing) {
            return
        }
        window.__is_secode_refreshing = true
        setTimeout(function () {
            var src = tcb.setUrl2('/secode/?rands=' + Math.random())
            $('.vcode-img').attr('src', src)

            window.__is_secode_refreshing = false
        }, 1)
    }

    // 到店补单表单处理函数
    // 提交表单之前，包括验证表单之前
    function __beforeSubmitDaoDianBuDanForm($Form) {
        if (!window.__IS_BUDAN_WITH_PAYMENT || !(window.__is_daodian_qft_n_weixin || window.__is_daodian_yifubao)) {
            // 非奇付通、非易付宝打款，那么不需要填写，并且也不需要弹出任何打款提示框，所以。。
            // dao_dian_bu_dan_confirm必须设置为true，以保证直接提交而不是弹出打款确认框

            if (!window.__IS_XXG_IN_SUNING) { // 苏宁店家APP内忽略以上逻辑，因为还需要做后续验证
                tcb.cache('dao_dian_bu_dan_confirm', true)
            }
        } else {
            var
                $pay_channel = $Form.find('[name="pay_channel"]'),
                $bank_name = $Form.find('[name="bank_name"]'),
                $bank_area = $Form.find('[name="bank_area"]')

            // 将银行名称+银行地区的值，
            // 设置到支付通道
            //console.log($bank_area.val ())
            $pay_channel.val($bank_name.val() + '|' + $bank_area.val())
        }
    }

    // 验证表单之后
    function __afterValidDaoDianBuDanForm($Form) {
        var
            dao_dian_bu_dan_confirm = tcb.cache('dao_dian_bu_dan_confirm')
        if (dao_dian_bu_dan_confirm) {
            // 确认到店补单，那么直接返回true，继续执行表单提交操作
            return true
        }

        if (window.__IS_XXG_IN_SUNING) { // 苏宁店家APP内，下单前需要先校验手机号是否为苏宁会员
            var mobile = $Form.find('[name="tel"]').val() || ''
            o.valid.isSnMember({mobile: mobile}, function (flag, errmsg) {
                if (flag) {
                    // 表示为苏宁会员，校验通过
                    tcb.cache('dao_dian_bu_dan_confirm', true)
                    setTimeout(function () {
                        // 避免订单提交异常，延时3秒将 dao_dian_bu_dan_confirm 设置为false
                        tcb.cache('dao_dian_bu_dan_confirm', false)
                    }, 3000)

                    $Form.trigger('submit')
                } else {
                    $.dialog.alert('<div class="grid column justify-center align-center">' +
                        '<div style="font-size: .14rem;color: #000;">不是有效的苏宁会员</div>' +
                        '<div style="padding: .08rem 0;text-align: center;">请让用户使用微信扫码注册会员<br>或返回修改手机号</div>' +
                        '<div style="width: 1.6rem;height: 1.6rem; background: transparent url(https://p0.ssl.qhimg.com/t01c4a767e6ac524a67.jpg) no-repeat center;background-size: contain;"></div>' +
                        '</div>', null, {
                        btn: '关闭'
                    })
                }
            })
            return false
        }

        var pay_method = $Form.find('[name="pay_method"]').val()
        if (pay_method === 'unified') {
            return true
        }

        if (pay_method == 'bank') {
            var
                $bank_name = $Form.find('[name="bank_name"]'),
                $pay_account = $Form.find('[name="pay_account"]'),
                $account_holder = $Form.find('[name="account_holder"]')

            $.dialog.confirm(
                '<p style="font-size: 20px;">确认用户信息</p><br/>' +
                '<p style="color: #FF0202">旧机款将打到用户银行卡:</p>' +
                '<p style="color: #FF0202">姓名:' + $account_holder.val() + '</p>' +
                '<p style="color: #FF0202">银行:' + $bank_name.val() + '</p>' +
                '<p style="color: #FF0202">账号:' + $pay_account.val() + '</p>',
                function () {
                    tcb.cache('dao_dian_bu_dan_confirm', true)
                    setTimeout(function () {
                        // 避免订单提交异常，延时3秒将 dao_dian_bu_dan_confirm 设置为false
                        tcb.cache('dao_dian_bu_dan_confirm', false)
                    }, 3000)

                    $Form.trigger('submit')
                }
            )
        } else if (pay_method == 'alipay') {
            var
                $alipay_id = $Form.find('[name="alipay_id"]'),
                $alipay_name = $Form.find('[name="alipay_name"]')

            $.dialog.confirm(
                '<p style="font-size: 20px;">确认用户信息</p><br/>' +
                '<p style="color: #FF0202">旧机款将打到用户支付宝:</p>' +
                '<p style="color: #FF0202">支付宝账号:' + $alipay_id.val() + '</p>' +
                '<p style="color: #FF0202">支付宝用户名:' + $alipay_name.val() + '</p>',
                function () {
                    tcb.cache('dao_dian_bu_dan_confirm', true)
                    setTimeout(function () {
                        // 避免订单提交异常，延时3秒将 dao_dian_bu_dan_confirm 设置为false
                        tcb.cache('dao_dian_bu_dan_confirm', false)
                    }, 3000)

                    $Form.trigger('submit')
                }
            )
        } else if (pay_method == 'weixin') {
            // 补单，微信收款

            // 获取补单用户的wxopenid，
            // 必须确保获取成功才能提交订单做后续收款操作
            __getBuDanUserWXOpenid(o.data.url_query['assess_key'], function (data) {
                // 设置用户收款的wxopenid
                $Form.find('[name="wx_openid"]').val(data['open_id'])

                $.dialog.confirm(
                    '<p style="font-size: 20px;">确认用户信息</p><br/>' +
                    '<p style="color: #FF0202">旧机款将打到用户微信账号</p>' +
                    '<p style="color: #FF0202">微信昵称：' + data['wx_name'] + '</p>',
                    function () {
                        tcb.cache('dao_dian_bu_dan_confirm', true)
                        setTimeout(function () {
                            // 避免订单提交异常，延时3秒将 dao_dian_bu_dan_confirm 设置为false
                            tcb.cache('dao_dian_bu_dan_confirm', false)
                        }, 3000)

                        $Form.trigger('submit')
                    }
                )
            })

        }

        // 弹出确认信息框后，必须return false，以确保表单不被提交，只是弹出确认信息
        return false
    }

    // 提交表单之后
    function __afterSubmitDaoDianBuDanForm(data, errno) {
        if (errno) {
            //$.dialog.toast ('系统异常，请重试')

            return
        }

        var $Form = $('#DaoDianBudanSaleForm')
        // 将已经下单的assess_key存入sessionStorage以备用
        var assess_key = $Form.find('[name="assess_key"]').val()
        if (tcb.supportSessionStorage()) {
            sessionStorage.setItem(assess_key, '1')
        }

        __redirectUrlAfterSubmit({
            'order_id': data['parent_id']
        })
    }

    // 获取补单用户的wxopenid，
    // 必须确保获取成功才能提交订单做后续收款操作
    function __getBuDanUserWXOpenid(assess_key, callback) {
        if (!assess_key) {
            return $.dialog.toast('系统异常，请重试', 2000)
        }
        $.ajax({
            type: 'POST',
            url: tcb.setUrl2('/m/doGetBudanUserWxInfoByAssessKey'),
            data: {
                assess_key: assess_key
            },
            dataType: 'json',
            timeout: 5000,
            success: function (res) {

                if (res['errno']) {
                    return $.dialog.toast(res['errmsg'], 2000)
                }

                typeof callback === 'function' && callback(res['result'])
            },
            error: function () {
                $.dialog.toast('系统异常，请重试', 2000)
            }
        })
    }

    // 获取果果相关信息
    function __getGuoGuoForm(order_id, redirect_url, callback) {
        if (!order_id) {
            return $.dialog.toast('订单号不能为空', 2000)
        }

        $.ajax({
            type: 'GET',
            url: tcb.setUrl2('/huishou/doGetGuoguoForm'),
            data: {
                parent_id: order_id
            },
            dataType: 'json',
            timeout: 5000,
            success: function (res) {

                if (res['errno']) {
                    window.location.href = redirect_url

                    return //$.dialog.toast (res[ 'errmsg' ], 2000)
                }

                typeof callback === 'function' && callback(res['result'])
            },
            error: function () {
                window.location.href = redirect_url
                //$.dialog.toast ('系统异常，请重试', 2000)
            }
        })

    }

    // 绑定预约取件相关事件
    function __bindEventSchedulePickup($Target, redirect_url) {
        if (!($Target && $Target.length)) {
            return
        }
        var
            $time_trigger = $Target.find('[name="express_time_alias"]'),
            $form = $Target.find('form'),
            $btn = $Target.find('.btn-submit')

        // 选择上门取件时间
        new $.datetime($time_trigger, {
            remote: tcb.setUrl2('/huishou/doGetAbleExpressTimeTable'),
            noStyle: true
        })

        // 预约上门取件表单
        __bindFormSubmit({
            $form: $form,
            $btn: $btn,
            valid: 'schedulePickupForm',
            post: 'postSchedulePickupForm',
            before: function ($Form) {
                var
                    $express_time_alias = $Form.find('[name="express_time_alias"]'),
                    $express_time = $Form.find('[name="express_time"]')

                $express_time.val('')
                if ($express_time_alias && $express_time_alias.val()) {
                    var
                        date_time = $express_time_alias.val()

                    date_time = date_time.split('-')
                    if (date_time.length > 1) {
                        date_time.pop()
                    }
                    date_time = date_time.join('-')

                    $express_time.val(date_time)
                }
            },
            after: function (data, errno) {
                if (errno) {
                    return
                }

                __showSchedulePickupSuccess(redirect_url)
            }
        })

    }

    // 显示预约取件成功
    function __showSchedulePickupSuccess(redirect_url) {

        var
            html_fn = $.tmpl(tcb.trim($('#JsMHSSchedulePickupSuccessPanelTpl').html())),
            html_st = html_fn({
                data: {
                    url: redirect_url
                }
            })

        tcb.closeDialog()

        tcb.showDialog(html_st, {
            className: 'schedule-pickup-success-panel',
            withClose: false,
            middle: true
        })

    }

    function bindEventXxgApplyGoodPrice($Section) {
        var $Form = $Section.find('form')
        var $target_price = $Form.find('[name="target_price"]')
        var $assess_price = $Form.find('[name="pinggu_price"]')
        var target_price_remote = 0
        var target_price
        var assess_price

        __bindFormSubmit({
            $form: $Form,
            $btn: $Form.find('.btn'),
            valid: 'xxgApplyGoodPriceForm',
            post: 'postXxgApplyGoodPriceForm',
            before: function ($Form) {
                target_price_remote = 0
                target_price = parseFloat($target_price.val()) || 0
                assess_price = parseFloat($assess_price.val()) || 0
                if (!target_price || (target_price - assess_price > 0)) {
                    return
                }

                target_price_remote = target_price
                o.interact.swipeOut(function () {
                    o.handle.showXxgApplyGoodPriceCompletePanel({
                        target_price_remote: target_price_remote,
                        target_price: target_price,
                        assess_price: assess_price
                    })
                })
                return false
            },
            after: function (data, errno) {
                if (!errno) {
                    target_price_remote = data['target_price']
                }
                o.interact.swipeOut(function () {
                    o.handle.showXxgApplyGoodPriceCompletePanel({
                        target_price_remote: target_price_remote,
                        target_price: target_price,
                        assess_price: assess_price
                    })
                })
            }
        })
    }

}(this)
