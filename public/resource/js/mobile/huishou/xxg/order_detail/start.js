!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    // 开始入口
    function start(data) {
        tcb.loadingStart()

        // 将全局数据挂在到 BusinessCommon 的 rootData 上
        window.XXG.BusinessCommon.rootData = data
        window.XXG.BusinessCommon.fnQueueRenderDone.push(window.XXG.BusinessCommon.eventBindDeviceResetAndUploadPhoto) // 绑定设备重置图片上传相关事件

        /***** 根据条件初始化不同的业务流程 *****/
        if (window.__IS_SF_FIX_RE_NEW || window.__IS_SF_FIX_RECYCLE) {
            // 丰修

            if (window.__IS_SF_FIX_ONE_STOP_ORDER) {
                // 丰修一站式换新
                window.XXG.BusinessSfFixOneStopOrder.init(data, done)
            } else {
                // 丰修纯回收 或 以旧换新
                window.XXG.BusinessSfFix.init(data, done)
            }
        } else if (window.__IS_ONE_STOP_ORDER) {
            // 一站式换新

        } else {
            // 默认流程
            window.XXG.BusinessCommon.init(data, done)
        }

        function done() {
            // 轮询获取回寄物流信息
            window.XXG.BusinessCommon.actionLoopExpressInfo(data)
            // 开启分配回寄物流单号【如果需要的话】
            window.XXG.BusinessCommon.actionStartDeliveryExpressCountdown(data)

            setTimeout(function () {
                tcb.loadingDone()
            }, 500)
            console.log('执行到这里不容易的')
        }
    }

    // DOM Ready
    $(function () {
        /***** 初始化数据预处理（不需要异步获取的数据，尽量都在此默认设置） *****/
            // 订单信息
        var order = window.__ORDER = window.__ORDER || {}
        var isMobile = order.category_id == '1' // 手机、平板
        var isNotebook = order.category_id == '10' // 笔记本
        var isDeviceResetAndUploadPhoto = !!window.__IS_DEVICE_RESET_AND_UPLOAD_PHOTO // 是否展示妥投码（基于是否还原、拍照的逻辑）
        // 远程验机数据
        var serviceRemoteCheck = {
            remote_check_flag: window.__REMOTE_CHECK_FLAG, // 是否支持远程验机：远程验机表示，true表示支持远程验机，false不支持
            // 远程验机进度：验机状态值：1，表示正在排队，2，表示正在验机中，3，表示验机成功，-1，表示验机驳回重传图片
            remote_check_flag_process: window.__REMOTE_CHECK_FLAG_PROCESS,
            remote_check_options: window.__REMOTE_CHECK_OPTIONS, // 远程验机信息
            remote_check_price: window.__REMOTE_CHECK_PRICE, // 检验价格
            remote_check_remarks: window.__REMOTE_CHECK_REMARKS, // 驳回说明
            remote_check_timeout: window.__REMOTE_CHECK_TIMEOUT, // 检测目标时间，当前验机状态的超时时间节点
            remote_check_api: window.__REMOTE_CHECK_API, // 远程验机api host
            remote_check_add: window.__REMOTE_CHECK_ADD, // socket链接地址
            remote_check_auth: window.__REMOTE_CHECK_AUTH, // 连接校验token
            remote_check_id: window.__REMOTE_CHECK_ID, // 远程验机id
            remote_check_tomorrow: window.__REMOTE_CHECK_TOMORROW, // 黑名单店铺在特定时间段内是否为明天下单,true是明天,false是现在可以下单
            remote_check_tagging_imgs: window.__REMOTE_CHECK_TAGGING_IMGS, // 远程验机处理的图片：差异圈出 或者 被驳回的图片
            remote_check_work_time: window.__REMOTE_CHECK_WORK_TIME // 远程验机工作时间
        }
        // 丰修数据
        var sfFixData = window.__SF_FIX_DATA || {}
        // 评估详情
        var assessDetail = window.XXG.BusinessCommon.reassessGetOrderAssessDetail(order.order_id, order.hs_model.model_id)
        // 上门回收到达前的状态（订单状态status的值小于12）
        var isBeforeArrive = window.__IS_BEFORE_ARRIVE || false
        var isOneStopOrder = window.__IS_ONE_STOP_ORDER || false
        if (window.__IS_SF_FIX_RE_NEW) {/*丰修换新*/
            sfFixData.__re_new = true
        }
        if (window.__IS_SF_FIX_RECYCLE) {/*丰修纯回收*/
            sfFixData.__recycle = true
        }
        var servicePrivacyProtocol = window.__SERVICE_PRIVACY_PROTOCOL || {}
        var servicePrivateData = window.__SERVICE_PRIVATE_DATA || {}
        // migrateFlag强制转成数字，当没有选择是否迁移之前，默认为0
        servicePrivateData.migrateFlag = +servicePrivateData.migrateFlag || 0
        var model_name = ((order.hs_model && order.hs_model.model && order.hs_model.model.model_name) || '').toLowerCase()
        var isIphone = (model_name.indexOf('iphone') > -1) || (model_name.indexOf('ipad') > -1)
        // isIphone = false
        var isNewDeviceNeedActivation = !!window.__IS_NEW_DEVICE_NEED_ACTIVATION
        if (isNewDeviceNeedActivation) {
            // 新机需要激活的时候，不能显示核验码
            sfFixData.verification_code_hide = true
        }
        var data = {
            order: order,
            isScannedReAssess: !!window.IS_SCANNED_RE_ASSESS, // 是否已经扫码重新评估
            inSfFixApp: !!window.__IS_XXG_IN_SF_FIX_APP,
            isMobile: isMobile,
            isNotebook: isNotebook,
            isIphone: isIphone,
            isNeedPayInfo: window.__IS_NEED_PAYINFO && window.__IS_NEED_PAYINFO[order.order_id] && !isOneStopOrder,
            isNewDeviceNeedActivation: isNewDeviceNeedActivation,
            isOneStopOrder: isOneStopOrder,
            isDeviceResetAndUploadPhoto: isDeviceResetAndUploadPhoto,
            assessDetail: assessDetail, // 评估详情
            isBeforeArrive: isBeforeArrive,
            serviceRemoteCheck: serviceRemoteCheck, // 远程验机
            servicePrivacyProtocol: servicePrivacyProtocol,// 隐私协议相关
            servicePrivateData: servicePrivateData,// 隐私数据相关
            sfFixData: sfFixData, // 丰修数据
            oneStopData: {} // 一站式换新数据
        }
        // data.order.status = 11
        window.xxxxxx = data

        // 开始入口
        start(data)
    })
}()
