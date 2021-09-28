!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        data: null,
        init: init,
        setupService: setupService
    })

    function init(data, done) {
        var $Wrap = $('#mainbody .mainbody-inner')
        window.XXG.BusinessCommon.data = data
        window.XXG.BusinessCommon.$Wrap = $Wrap
        window.XXG.BusinessCommon.render(data)
        window.XXG.BusinessCommon.eventBind(data)
        /***** 载入服务 *****/
        window.XXG.BusinessCommon.setupService([
            // 初始化上传图片
            [window.XXG.ServiceUploadPicture, {
                data: data,
                init: function (next, final) {
                    next()
                }
            }],
            // 初始化远程验机
            [window.XXG.ServiceRemoteCheck, {
                $trigger: $Wrap.find('.js-trigger-go-next'),
                $target: $Wrap,
                addType: 'prepend',
                data: data,
                init: function (next, final) {
                    next()
                }
            }]
        ], function () {
            typeof done === 'function' && done()
        })
    }

    // 载入service
    function setupService(services, fn_final) {
        var fnQueueInit = []
        tcb.each(services || [], function (i, service) {
            var serviceObj = service[0]
            var serviceOptions = service[1]
            if (serviceObj.setup) {
                serviceObj.setup(serviceOptions || {})
            }
            var init
            if (serviceOptions && typeof serviceOptions.init === 'function') {
                init = serviceOptions.init
            } else if (typeof serviceObj.init === 'function') {
                init = serviceObj.init
            }
            init && fnQueueInit.push(init)
        })
        // 执行init函数，每个init函数必然会有一个next参数作为继续执行的回调函数，和一个final作为结束执行的回调函数，
        // 如果next没有被init执行，那么表示执行中断，不再执行后续service的init，
        // init没有被中断，并且都已经执行过了，那么final将在最后执行，
        // 如果init中主动调用final，那么将提前中断后续的init，
        // 如果final传入一个true，那么将不会执行fn_final，否则默认会执行fn_final
        /***!!! 每个init函数都应该执行next或者final函数，否则可能会出现非预期的行为 !!!***/
        !function executeFnQueue(fnQueue, fn_final) {
            if (!fnQueue.length) {
                return typeof fn_final === 'function' && fn_final()
            }
            var fn = fnQueue.shift()
            fn(function () {
                executeFnQueue(fnQueue, fn_final)
            }, function (isStop) {
                !isStop && typeof fn_final === 'function' && fn_final()
            })
        }(fnQueueInit, fn_final)
    }

}()
