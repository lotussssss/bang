!function () {
    window.XXG = {
        redirect: function (url, is_replace) {
            tcb.loadingStart()
            if (url) {
                setTimeout(function () {
                    tcb.loadingDone()
                }, 3000)
                return is_replace ? window.location.replace(url) : window.location.href = url
            }
            return window.location.reload()
        },

        // 绑定表单 options : {
        //      $form
        //      before
        //      after
        //      success
        //      error
        // }
        bindForm: function (options) {
            options = options || {}

            if (!(options.$form && options.$form.length)) {
                return $.dialog.toast('$form参数必须')
            }
            // 表单提交前执行
            if (typeof options.before !== 'function') {
                options.before = function ($form, next) {typeof next === 'function' && next()}
            }
            // 表单提交后执行
            if (typeof options.after !== 'function') {
                options.after = function (res) {return true}
            }
            options.$form.on('submit', function (e, before_valid, success_cb, error_cb) {
                e.preventDefault()
                var $form = options.$form
                if ($form.hasClass('form-flag-submitting')) {
                    return
                }
                options.before($form, function () {
                    $form.addClass('form-flag-submitting')
                    window.XXG.ajax({
                        url: $form,
                        success: function (res) {
                            $form.removeClass('form-flag-submitting')
                            // 表单提交后执行，返回true继续执行默认行为，false不执行后续操作
                            if (options.after(res)) {
                                if (!res.errno) {
                                    typeof options.success === 'function' && options.success(res, $form, success_cb)
                                } else {
                                    typeof options.error === 'function' && options.error(res, error_cb)
                                }
                            }
                        },
                        error: function (err) {
                            $form.removeClass('form-flag-submitting')
                            typeof options.error === 'function' && options.error(err, error_cb)
                        }
                    })
                }, before_valid)
            })
        },

        // 异步请求
        ajax: function (options) {
            options = options || {}
            if (!options.url) {
                return $.dialog.toast('请求参数url必须')
            }
            // url是form表单元素
            if (typeof options.url !== 'string' && options.url.__proto__ !== $.fn) {
                options.url = $(options.url)
            }
            if (options.url[0].tagName == 'FORM') {
                options.method = options.method || options.url[0].method
                options.data = options.data || options.url.serialize()
                options.url = options.url[0].action
            }
            $.ajax({
                type: options.method || options.type || 'GET',
                url: options.url,
                data: options.data,
                dataType: options.dataType || 'json',
                xhrFields: options.xhrFields || null,
                timeout: options.timeout || 5000,
                beforeSend: options.beforeSend || function (xhr, settings) {},
                success: options.success || function (data, status, xhr) {},
                error: options.error || function (xhr, type, error) {},
                complete: options.complete || function (xhr, status) {}
            })
        },

        // 添加笔记本验机信息，缺失显卡信息时手动选择显卡弹窗
        showDialogAddNoteBookAutoCheckGraphicsCardSelect: function (data, callback) {
            data = data || {}
            var content = '<div class="the-title">请选择</div><div class="the-group grid column justify-center align-center">'
            tcb.each(data, function (id, text) {
                content += '<a href="#" class="the-option col" data-id="' + id + '">' + text + '</a>'
            })
            content += '<a href="#" class="the-btn btn btn-radius">确认</a></div>'

            tcb.closeDialog()
            var inst = tcb.showDialog(content, {
                className: 'dialog-add-notebook-auto-check-graphics-card-select',
                withClose: false,
                middle: true
            })

            inst.wrap.find('.the-option').on('click', function (e) {
                e.preventDefault()
                var $me = $(this)
                $me.addClass('selected')
                   .siblings('.selected').removeClass('selected')
            })
            inst.wrap.find('.the-btn').on('click', function (e) {
                e.preventDefault()
                var $selected = inst.wrap.find('.selected')
                if ($selected && $selected.length) {
                    var graphicsCardId = $selected.attr('data-id')
                    typeof callback === 'function' && callback(graphicsCardId)
                    tcb.closeDialog()
                } else {
                    $.dialog.toast('信息缺失，请选择')
                }
            })
        }
    }


    //******************************
    //********和app交互的函数*********
    //******************************

    // 统一关闭弹层
    window.js4AndroidFnCloseDialog = function () {
        var closeFnQueue = tcb.cache('js4AndroidFnCloseDialog') || [],
            closeFn = closeFnQueue.pop()
        if (typeof closeFn === 'function') {
            closeFn()
            return true
        } else if (typeof window[closeFn] === 'function') {
            window[closeFn]()
            return true
        }
    }

    // xxgApp扫描成功回调函数
    window.js4AppFnQrScannerSuccess = function (res) {
        if (tcb.xxgAppIosNoticeUserUpdate()) {
            return
        }
        var successFn = tcb.cache('js4AppFnQrScannerSuccess')

        if (typeof successFn !== 'function') {
            successFn = function (result) {
                if (!result) {
                    return $.dialog.toast('扫描结果为空')
                }
                return __getCommonRedirectUrl(result, function (redirect_url) {
                    return tcb.js2AppReturnHandledQrScannerResult(redirect_url)
                })
            }
        }
        tcb.cache('js4AppFnQrScannerSuccess', '')
        successFn(res)
    }

    // 根据扫描结果获取（通用的）跳转url【非订单详情内的扫码逻辑】
    function __getCommonRedirectUrl(result, callback) {
        var redirect_url

        result = (result || '').split('|') || []

        if (result[0] === 'ARM') {
            result.shift()
            redirect_url = __handleQRCodeNewFormat(result.join(''))
        } else if (result[0] === 'ARC') {
            result.shift()
            __addNoteBookAutoCheckResult({
                encryptedStr: result.join('')
            }, function (model_id, pre_assess) {
                redirect_url = tcb.setUrl2(window.BASE_ROOT + 'm/pinggu',
                    {
                        model_id: model_id,
                        pre_assess: pre_assess
                    }
                )
                typeof callback === 'function' && callback(redirect_url)
            })
            return
        } else if (result.length === 1) {
            redirect_url = __handleCreditAssessResultByQRCode(result[0])
        } else {
            redirect_url = __handleQRCodeOldDefaultFormat(result)
        }

        typeof callback === 'function' && callback(redirect_url)

        return redirect_url
    }

    function __addNoteBookAutoCheckResult(data, callback) {
        window.XXG.ajax({
            url: '/m/addNotebookAutoCheckResult',
            data: data,
            success: function (res) {
                if (!(res && !res.errno)) {
                    var errmsg = (res && res.errmsg) || '系统错误，请稍后重试'
                    // return $.dialog.alert(errmsg)
                    $('.sm-err-alert-model-mask').show()
                    $('.sm-err-alert-model-btn-upLoade').hide()
                    $('.sm-err-alert-model-btn-confirm').show()
                    if (res.errno === 19101 || res.errno === 19104) {
                        $('.sm-err-alert-model-btn-confirm').hide()
                        $('.sm-err-alert-model-btn-upLoade').show().attr('data-sequenceCode', res.result.sequenceCode)
                    } else if (res.errno === 19106) {
                        $('.sm-err-alert-model-mask').hide()
                        // 显卡缺失,请手动选择
                        window.XXG.showDialogAddNoteBookAutoCheckGraphicsCardSelect(res.result && res.result.graphicsCardId, function (graphicsCardId) {
                            data.graphicsCardId = graphicsCardId
                            __addNoteBookAutoCheckResult(data, callback)
                        })
                    } else {
                        $('.sm-err-alert-model-mask .sm-err-alert-model-content-text').html(errmsg)
                    }
                    return
                    // if (res.errno === 19101) {
                    //     return $.dialog.alert(errmsg)
                    // }
                    // return $.dialog.toast(errmsg)
                }
                var result = res.result || {}
                if (result.modelId && result.assessKey) {
                    typeof callback === 'function' && callback(result.modelId, result.assessKey)
                } else {
                    return $.dialog.toast('数据错误')
                }
            },
            error: function (err) {
                $.dialog.toast(err.statusText || '系统错误，请稍后重试')
            }
        })
    }

    // 信用回收
    function __handleCreditAssessResultByQRCode(result) {
        return tcb.setUrl2(BASE_ROOT + 'm/scanShopCreditHs', {
            qrcode_info: result
        })
    }

    // 旧的二维码默认识别格式
    function __handleQRCodeOldDefaultFormat(result) {
        var redirect_params = {
            assess_key: result[0] || '',
            real_phone_flag: result[2] || '', //判断真假机
            scene: result[1],//场景
            is_engineer: 1,//扫码补单打点
            detect_token: result[3] //detect token
        }
        if (result[4]) {
            redirect_params.imei = result[2] //imei
            redirect_params.encrypt_xxg_qid = result[4] //Pad登录的xxg
        }
        var redirect_url = tcb.setUrl2(BASE_ROOT + 'm/pinggu_shop', redirect_params)
        if (result[1] == 'miniapp') {
            redirect_params = {
                assess_key: result[0] || '',
                imei: result[2] || '', //imei
                is_engineer: 1,//扫码补单打点
                scene: result[1], //场景
                detect_token: result[3] //detect token
            }
            redirect_url = tcb.setUrl2(BASE_ROOT + 'm/officialDiff', redirect_params)
        }
        return redirect_url
    }

    // 新的二维码识别格式
    function __handleQRCodeNewFormat(data) {
        data = data || ''
        try {
            data = $.parseJSON(data)
        } catch (e) {
            data = ''
        }
        if (!data) {
            return
        }
        data['is_engineer'] = 1
        delete data['detect_key']

        var redirect_url = tcb.setUrl2(BASE_ROOT + 'm/pinggu_shop', data)
        if (data['scene'] === 'miniapp') {
            redirect_url = tcb.setUrl2(BASE_ROOT + 'm/officialDiff', data)
        }
        return redirect_url
    }

    // 当前窗口激活
    window.js4AppFnNoticeWindowActive = function () {
        if (window.__IS_NEEDED_REFRESH) {
            window.location.reload()
        }
    }

    // DOM READY
    $(function () {
        tcb.xxgAppIosNoticeUserUpdate()

        // 在丰修APP内，获取状态栏高度
        if (window.__IS_XXG_IN_SF_FIX_APP) {
            tcb.js2AppGetStatusBarHeight(function (statusBarHeight) {
                $('#header .header-status-bar').height(statusBarHeight)
                $('.header-placeholder .header-status-bar-placeholder').height(statusBarHeight)
            })
        }

        // 绑定代理事件
        tcb.bindEvent({
            // 扫一扫评估结果
            '.js-trigger-saoyisao': function (e) {
                e.preventDefault()

                return tcb.js2AppInvokeQrScanner(true, function (result) {
                    __handleAssessResultByQRCode(result)
                })
            },
            // 修修哥到店信用回收

            '.js-trigger-xxg-shop-credit-hs': function (e) {
                e.preventDefault()

                return tcb.js2AppInvokeQrScanner(true, function (result) {
                    window.XXG.redirect(__handleCreditAssessResultByQRCode(result))
                })
            },
            // 退出登录

            '.js-trigger-xxg-logout': function (e) {
                e.preventDefault()
                $.get('/m/logout?flag_not_redirect=1', function (res) {
                    tcb.js2AppSetLogout()
                    setTimeout(function () {
                        var redirect_url = tcb.setUrl2(BASE_ROOT + 'm/hsXxgLogin', {
                            dest_url: window.location.href
                        }, ['dest_url'])
                        redirect_url = redirect_url.split('?')
                        redirect_url[0] = redirect_url[0] + '?dest_url=' + encodeURIComponent(window.location.href)
                        window.location.replace(redirect_url.join('&'))
                    }, 100)
                })
            },
            //    修改密码
            '.js-change-xxg-password': function (e) {
                e.preventDefault()
                window.location.href = '/m/modifyXxgPassword'
            },
            //    修修哥签约
            '.js-change-xxg-qy': function (e) {
                e.preventDefault()
                if ($('.signing').val() == '1') {
                    return
                } else {
                    window.location.href = '/m/companySignPartner'
                }
            },
            // 店家APP内关闭回到首页
            '.js-trigger-xxg-xiaodian-close': function (e) {
                e.preventDefault()
                tcb.js2AppInvokeGoHome()
            },
            '.sm-err-alert-model-btn-confirm': function (e) {
                e.preventDefault()
                $('.sm-err-alert-model-mask').hide()
            },
            '.sm-err-alert-model-btn-upLoade': function (e) {
                e.preventDefault()
                var sequenceCode = $(this).attr('data-sequenceCode')
                $('.sm-err-alert-model-mask').hide()
                if (sequenceCode) {
                    window.location.href = tcb.setUrl('/m/xxgQrErrorImgUpload', {sequenceCode: sequenceCode}) + '&'
                    // window.location.href='/m/xxgQrErrorImgUpload?sequenceCode='+sequenceCode
                }

            },
            // 丰修APP内返回（返回到最后将关闭页面）
            '.js-trigger-in-sf-fix-go-back': function (e) {
                e.preventDefault()
                tcb.js2AppInvokeGoBack()
            }
        })

        function __handleAssessResultByQRCode(result) {
            if (!result) {
                return $.dialog.toast('扫描结果为空')
            }

            __getCommonRedirectUrl(result, function (redirect_url) {
                redirect_url && window.XXG.redirect(redirect_url)
            })
        }

        window.test__handleAssessResultByQRCode = __handleAssessResultByQRCode

    })

}()
