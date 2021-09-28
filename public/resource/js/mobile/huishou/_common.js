// 多页面使用js
$(function () {

    tcb.bindEvent(document.body, {
        /**
         * 屏幕功能重测
         * @param e
         */
        '.btn-action-reassess': function (e) {
            e.preventDefault()

            var
                $me = $(this),
                action = $me.attr('data-action'),
                key = $me.attr('data-key'),
                key_map_name = {
                    'screen_display': 'pushToColorView',
                    'screen_touch': 'pushToTouchView',
                    're_detect': 'pushToRedetectView'
                }

            if (action === 're-detect') {

                exeClientFunction(key_map_name[key])
            }
        },
        // 回收协议。回收常见问题
        '.js-trigger-show-agree-protocol, .view-agree-protocol': function (e) {
            e.preventDefault()

            var $me = $(this),
                $tpl, $tpl2,
                $target

            var tplId = $me.attr('data-tpl')
            if ($me.attr('data-bangmai') == 1) {
                $tpl = $('#HuishouBangmaiProtocolTpl')
            } else if ($me.attr('data-jiadian') == 1) {
                $tpl = $('#HuishouWhiteGoodsProtocolTpl')
            } else if ($me.attr('data-xxg-login') == 1) {
                $tpl = $('#JsXxgIntegrityRecoveryTpl')
            } else {
                $tpl = $('#HuishouProtocolTpl')
                if (tplId) {
                    $tpl2 = $('#' + tplId)
                }
            }

            var html_fn = $.tmpl($.trim($tpl.html())),
                html_str = html_fn({
                    no_content: !!tplId
                })

            var $dialog = Dialog.showBox(html_str)

            if ($me.attr('data-jiadian') == 1) {
                $target = $('.huishou-white-goods-protocol-panel')
            } else {
                $target = $('.huishou-protocol-panel')
            }

            if (tplId){
                $target.append($.tmpl($.trim($tpl2.html()))())
                if(tplId==='JsTcbPlatformServiceAgreementTpl') {
                    var $tpl3 = $('#JsHuishouTradeRulesTpl')
                    $target.append($.tmpl($.trim($tpl3.html()))())
                }
            }

            var root = tcb.getRoot()
            var ScrollFactory = root.ScrollFactory
            var $Container = $('.huishou-protocol-panel-wrap')
            var $Inner = $('.huishou-protocol-panel')
            if (ScrollFactory && $Container.length && $Inner.length) {
                new ScrollFactory({
                    $Container: $Container,
                    $Inner: $Inner,
                    options: {
                        scrollingX: false,
                        scrollingY: true,
                        bouncing: true
                    }
                })
            }

            $dialog.find('.close-btn').on('click', function (e) {

                e.preventDefault()
                Dialog.hide()
            })
        },
        '.block-btn': {
            // 底部按钮行，干掉滚动行为
            'touchmove': function (e) {
                e.preventDefault()

                return
            }
        },
        //用户信息入口:我的订单、在线客服
        'header .h-user-info-enter': function (e) {
            e.preventDefault()

            $('.h-user-info-wrap .h-user-info-cont').toggle()
        },
        //下单成功页 查看解锁教程
        '.show-course': function (e) {
            e.preventDefault()

            var brand_id = $(this).attr('data-brand_id')
            var course_instance = showCourse(brand_id)
            course_instance.show()
        },
        //下单成功页 预约快递
        '.show-yuyue-btn': function (e) {
            e.preventDefault()
            var
                order_id = $.queryUrl(window.location.href, 'order_id'), //'1701046319322003800'

                redirect_url = window.location.href

            // 普通邮寄回收

            YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

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

        },
        '.block-special-youku .js-trigger-youku-desc': function (e) {
            e.preventDefault()

            var html_str = $.tmpl($.trim($('#JsMHuiShouYoukuDescTpl').html()))({})
            var config = {
                withMask: true,
                middle: true,
                className: 'huishou-youku-desc-panel'
            }
            tcb.showDialog(html_str, config)
        },
        '.js-trigger-suning-2018-shuang11-promo': function (e) {
            e.preventDefault()
            var SwipeSection = window.Bang.SwipeSection

            SwipeSection.getSwipeSection()
            SwipeSection.fillSwipeSection('<div style="width: 100%;height: 5.942857142857143rem;background: url(//p1.ssl.qhimg.com/t010d5d47b60098b66e.jpg) no-repeat center;background-size: cover;"></div>')

            var $swipe = SwipeSection.getLastSwipeSection()
            $swipe.show()
            SwipeSection.doLeftSwipeSection(0)
        },
        '.js-trigger-suning-yundian-mini-back': function (e) {
            e.preventDefault()
            if (typeof wx !== 'undefined' && wx.miniProgram) {
                wx.miniProgram.navigateTo({url: '/pages/oldfornew/index/index'})
            } else {
                $.dialog.toast('请在小程序中打开此页！')
            }
        },
        '.js-trigger-suning-yundian-mini-goto-order-list': function (e) {
            e.preventDefault()
            if (typeof wx !== 'undefined' && wx.miniProgram) {
                wx.miniProgram.navigateTo({url: '/pages/oldfornew/order/order'})
            } else {
                $.dialog.toast('请在小程序中打开此页！')
            }
        },
        // 回退上一页
        '.js-trigger-go-back': function (e) {
            e.preventDefault()
            window.history.back()
        },
        // in浙江移动小程序--回退上一页
        '.js-trigger-zjyd-miniapp-back': function (e) {
            e.preventDefault()
            window.history.back()
        },
        // in浙江移动app--回退上一页
        '.js-trigger-zjyd-app-back': function (e) {
            e.preventDefault()
            window.history.back()
        },
        // in河南移动APP--关闭当前webview，返回首页
        '.js-trigger-xxg-hnyd-app-close': function (e) {
            e.preventDefault()
            tcb.js2AppInvokeGoBack()
        },
        // in河南移动app--回退上一页
        '.js-trigger-xxg-hnyd-app-back': function (e) {
            e.preventDefault()
            var query = tcb.queryUrl(window.location.search)
            if (query.partner_flag === 'hnyd_xxg') {
                // 如果query之中带有partner_flag === 'hnyd_xxg'，
                // 那么表示是从'/henanMobile/xxg'跳转过来的，
                // 所以填写完之后再重新跳回去
                window.location.replace(tcb.setUrl2('/henanMobile/xxg'))
            } else {
                tcb.js2AppInvokeGoBack()
            }
        }
    })

    //查看解锁教程
    var showCourse = (function () {
        var instance = null

        function ShowCourse(brand_name) {
            this.brand_imgs = {
                '10': 'https://p2.ssl.qhmsg.com/t015a0074e2c96c6fee.png',
                '0': 'https://p3.ssl.qhmsg.com/t019747712197cdf1f1.png',
                '20': 'https://p0.ssl.qhmsg.com/t015eb98d84e7ea3699.png',
                '13': 'https://p2.ssl.qhmsg.com/t01962686c92775f133.png'
            }
            this.brand_img = this.brand_imgs[brand_name]

            this.init()
        }

        ShowCourse.getInstance = function (brand_name) {
            if (!instance) {
                instance = new ShowCourse(brand_name)
            }
            return instance
        }
        ShowCourse.prototype = {
            constructor: ShowCourse,
            init: function () {
                this.creatEle()
                this.bindEvent()
            },
            creatEle: function () {
                var $course_wrap = $('<div class="course-wrap"></div>')
                var inner_str = '<a href="#" class="course-mask"></a><div class="course-inner"> <div class="img-wrap"><img src="' + this.brand_img + '" alt=""></div></div>'
                $course_wrap.html(inner_str)
                $(document.body).append($course_wrap)
            },
            bindEvent: function () {
                var self = this
                $('.course-mask').on('click', function (e) {
                    e.preventDefault()
                    self.hide()
                })
            },
            show: function () {
                setTimeout(function () {
                    $('.course-wrap').css({'display': 'block'})
                }, 1)
            },
            hide: function () {
                $('.course-wrap').css({'display': 'none'})
            }
        }
        return ShowCourse.getInstance
    })()

    /**
     * 执行客户端函数
     * @param fn_name
     */
    function exeClientFunction(fn_name) {
        var fn = function () {
            alert('我是' + fn_name + '，我还没有定义！')
        }

        if (window.webkit && window.webkit.messageHandlers
            && window.webkit.messageHandlers[fn_name] && window.webkit.messageHandlers[fn_name].postMessage) {
            return window.webkit.messageHandlers[fn_name].postMessage(null)
        } else if (window.client && typeof window.client[fn_name] === 'function') {
            return window.client[fn_name]()
        } else if (typeof window[fn_name] === 'function') {
            return window[fn_name]()
        }

        fn()
    }

    function setAndroidHtmlClass() {
        if (tcb.is_android) {
            $('html').addClass('android')
        }
    }

    setAndroidHtmlClass()

    function showSuningRecommendDialog() {
        return
        var query_from = tcb.queryUrl(window.location.search, 'from'),
            query_from_page = tcb.queryUrl(window.location.search, 'from_page')
        if (window.__PAGE != 'index') {
            return
        }
        if (!(query_from == 'SuningRecommended' || query_from_page == 'SnRecommended')) {
            return
        }
        var html_st = '<div class="main-cnt">旧机满500加50元<br/>' +
            '旧机满1000加100元<br/>' +
            '旧机满2000加200元<br/>' +
            '旧机满3000加300元</div>' +
            '<div class="desc">苏宁购华为产品用户专享<br/>' +
            '回收成功，享额外加价</div>' +
            '<a class="btn" href="javascript:tcb.closeDialog();">立即评估</a>'
        tcb.showDialog(html_st, {
            top: 30,
            left: 0,
            className: 'dialog-hs-suning-recommend'
        })
    }

    showSuningRecommendDialog()

    function isSuningShopPlusOutDate(callback) {
        if (window.__IS_XXG_IN_SUNING) {
            $.ajax({
                url: '/m/checkTheStatusOfShopkeepers',
                success: function (res) {
                    if (res && !res.errno) {
                        typeof callback === 'function' && callback(res.result)
                    } else {
                        $.dialog.toast((res && res.errmsg) || '系统错误')
                    }
                },
                fail: function (xhr) {
                    $.dialog.toast(xhr.status + ' : ' + xhr.statusText)
                }
            })
        } else {
            typeof callback === 'function' && callback(false)
        }
    }

    window.isSuningShopPlusOutDate = isSuningShopPlusOutDate

    function showDialogSuningShopPlusOutDate(fnContinue) {
        var html_st = '<h3 class="tit">重要提醒</h3>' +
            '<div class="cnt">店+登录超时。<br><br><span class="c5">如果您在店+APP内，请务必退出重新下单！否则无法参加任何苏宁活动。</span><br><br>如果您不在店+App，请继续完成订单。</div>' +
            '<div class="dialog-btn">' +
            '<a class="js-suning-shop-plus-out-date-btn-confirm btn btn-confirm" href="#">继续完成订单</a>' +
            '<a class="js-suning-shop-plus-out-date-btn-cancel btn btn-cancel" href="#">关闭弹窗</a>' +
            '</div>'
        var inst = tcb.showDialog(html_st, {
            className: 'dialog-suning-shop-plus-out-date',
            withClose: false,
            middle: true
        })
        inst.mask.addClass('dialog-suning-shop-plus-out-date-mask')
        inst.wrap.find('.js-suning-shop-plus-out-date-btn-confirm').on('click', function (e) {
            e.preventDefault()
            tcb.closeDialog()
            typeof fnContinue === 'function' && fnContinue()
        })
        inst.wrap.find('.js-suning-shop-plus-out-date-btn-cancel').on('click', function (e) {
            e.preventDefault()
            tcb.closeDialog()
        })
    }

    window.showDialogSuningShopPlusOutDate = showDialogSuningShopPlusOutDate

    function doMarkedAsYundian() {
        var max_count = 4
        var count = 0

        function loop(data) {
            if (count > max_count) {
                return
            }
            count++
            $.ajax({
                url: '/yigou/doMarkedAsYundian',
                data: data,
                success: function (res) {
                    if (res && !res.errno) {
                        if (tcb.supportSessionStorage()) {
                            sessionStorage.setItem('SUNING_YUNDIAN_MINIAPP_MARKED', '1')
                        } else {
                            max_count = 0
                            $.dialog.toast('您的环境不支持sessionStorage，将会导致功能异常！')
                        }
                    } else {
                        setTimeout(function () {
                            loop(data)
                        }, 300)
                    }
                },
                fail: function (xhr) {
                    setTimeout(function () {
                        loop(data)
                    }, 300)
                }
            })
        }

        if (window.__IS_SUNING_YUNDIAN_MINIAPP && !sessionStorage.getItem('SUNING_YUNDIAN_MINIAPP_MARKED')) {
            var query = tcb.queryUrl(window.location.search)
            if (!query.channel) {
                setTimeout(function () {
                    if (typeof wx !== 'undefined' && wx.miniProgram) {
                        wx.miniProgram.navigateTo({url: 'pages/oldfornew/index/index'})
                    }
                }, 2000)
                return $.dialog.toast('缺少场景参数channel，即将返回！')
            }
            var data = {
                channel: query.channel
            }
            if (tcb.supportSessionStorage()) {
                sessionStorage.setItem('SUNING_YUNDIAN_MINIAPP_PASSIVENESS', query.channel === 'passiveness' ? '1' : '')
            }
            query.regionNo && (data.regionNo = query.regionNo)
            query.toShopCode && (data.toShopCode = query.toShopCode)
            query.promotionUser && (data.promotionUser = query.promotionUser)

            loop(data)
        }
    }

    doMarkedAsYundian()
})

!function () {
    // 设置页面统计，
    // 统计规则：URL的pathname+query参数中的(from_page+partner_flag)
    function setStatistic() {
        var pathname = window.location.pathname,
            query = tcb.queryUrl(window.location.search),
            params = {}

        if (query['from_page']) {
            params['from_page'] = query['from_page']
        }
        if (query['partner_flag']) {
            params['partner_flag'] = query['partner_flag']
        }
        if (query['self_enterprise']) {
            params['self_enterprise'] = query['self_enterprise']
        }
        if (window.__IS_DAODIAN_BUDAN) {
            params['xxg'] = 1
        }

        var url = tcb.setUrl(pathname, params)

        tcb.statistic(['_trackPageview', url])
    }

    setStatistic()
}()
