;/**import from `/resource/js/component/m/scroll.js` **/
!function (global) {
    var
        Root = tcb.getRoot (),
        noop = tcb.noop,
        scroll = {}
    var
        s = {
            inst                : null,
            callback            : noop,
            // 设置元素的translate和zoom，若不支持translate，使用margin替代
            setTranslateAndZoom : tcb.setTranslateAndZoom
        }

    // 添加到根作用域
    tcb.addToRoot ('scroll', scroll)

    tcb.mix (scroll, {
        getDoc : tcb.getDoc,
        getWin : tcb.getWin,
        $Win   : null,
        $Doc   : null,

        $Container : null,
        $Inner     : null,

        getContainer : function () {return this.$Container},

        getInner : function () {
            if (!(this.$Inner && this.$Inner.length)) {
                return console.error ('请先设置scroll的inner页面')
            }
            return this.$Inner
        },
        setInner : function ($Inner) {return this.$Inner = $Inner},

        getInst    : getInst,
        setRunning : setRunning,

        setPosition   : setPosition,
        setDimensions : setDimensions,

        init : init

    })
    // 获取实例
    function getInst (options) {
        var inst = s.inst

        if (inst) { return inst }

        // 生成一个scroll实例
        inst = new Scroll (function (left, top, zoom) {
            // 此函数在滚动过程中实时执行，需要注意处理效率

            typeof s.callback === 'function' && s.callback (left, top, zoom)
        }, options)

        return s.inst = inst
    }

    function setRunning (callback) {
        var
            $Inner = scroll.getInner ()

        s.callback = function (left, top, zoom) {

            if (typeof callback === 'function') {

                callback (left, top, zoom, $Inner, s.setTranslateAndZoom)
            }
        }
    }

    function setPosition (left, top) {
        var
            inst = scroll.getInst ()

        left = left || 0
        top = top || 0

        inst.setPosition (left, top)
    }

    function setDimensions (main_width, main_height, inner_width, inner_height) {
        var
            $Container = scroll.getContainer (),
            $Inner = scroll.getInner (),
            inst = scroll.getInst ()

        main_width = main_width || $Container.width ()
        main_height = main_height || $Container.height ()
        inner_width = inner_width || Math.max ($Inner.width (), main_width)
        inner_height = inner_height || Math.max ($Inner.height (), main_height)

        // 设置容器尺寸
        inst.setDimensions (main_width, main_height, inner_width, inner_height)
    }

    function init ($Container, options) {
        if (!($Container && $Container.length)) {

            return
        }

        scroll.$Doc = scroll.getDoc ()
        scroll.$Win = scroll.getWin ()
        scroll.$Container = $Container

        options = options || {
            // 禁止横向滚动
            scrollingX : true,
            // 不要回弹
            bouncing   : false
        }

        var inst = scroll.getInst (options)

        __bindEvent ()

        return inst
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    // 绑定事件
    function __bindEvent () {
        var
            $Doc = scroll.getDoc (),
            $Container = scroll.getContainer (),
            inst = scroll.getInst (),
            // 用来标识在Container中的滑动
            flag = false

        if ('ontouchstart' in window) {
            // 绑定滚动事件
            $Container.on ('touchstart', function (e) {
                //// 滑动开始点位在表单元素上，直接返回，不执行滑动操作
                //if (e.target.tagName.match (/input|textarea|select/i)) {
                //    return
                //}

                // flag设置为true表示滑动开始
                flag = true

                // 滑动开始
                inst.doTouchStart (e.touches, e.timeStamp)

            })

            $Doc.on ('touchmove', function (e) {
                if (flag){
                    e.preventDefault ()

                    // 滑动ing
                    inst.doTouchMove (e.touches, e.timeStamp)
                }
            }, {passive : false})

            $Doc.on ('touchend', function (e) {
                if (flag){
                    // 滑动完成
                    inst.doTouchEnd (e.timeStamp)
                    // flag重置为false，表示滑动结束
                    flag = false
                }
            })
            $Doc.on ('touchcancel', function (e) {
                if (flag){
                    // 滑动完成
                    inst.doTouchEnd (e.timeStamp)
                    // flag重置为false，表示滑动结束
                    flag = false
                }
            })
        } else {
            function __clickPreventDefault(e){
                e.preventDefault()
            }
            var flag_mousemoveing = false,
                start_time = 0,
                start_y = 0,
                counter_mousemoveing = 0,
                $targetItem = null
            // 绑定滚动事件
            $Container.on ('mousedown', function (e) {

                // flag设置为true表示滑动开始
                flag = true

                // 滑动开始
                inst.doTouchStart ([ { pageX : e.pageX, pageY : e.pageY } ], e.timeStamp)
                // 设置滑动起始时间、点
                start_time = e.timeStamp
                start_y = e.pageY
                $targetItem = $(e.target).closest('a')
            })

            $Doc.on ('mousemove', function (e) {
                if (flag) {
                    e.preventDefault ()

                    // 滑动ing
                    inst.doTouchMove ([ { pageX : e.pageX, pageY : e.pageY } ], e.timeStamp)

                    if (!flag_mousemoveing && !counter_mousemoveing) {
                        $Container.on ('click', __clickPreventDefault)
                    }

                    if (counter_mousemoveing > 2) {
                        if ((e.timeStamp - start_time) > 6 && Math.abs (e.pageY - start_y) > 2) {
                            flag_mousemoveing = true
                        } else {
                            $Container.off ('click', __clickPreventDefault)
                            $targetItem && $targetItem.length && $targetItem.trigger('click')
                        }
                    } else {
                        // counter_mousemoveing还是0的时候执行timeout
                        !counter_mousemoveing && setTimeout (function () {
                            if (counter_mousemoveing < 3) {// 移动事件执行次数小于3次，那么表示没移动！
                                $Container.off ('click', __clickPreventDefault)
                                $targetItem && $targetItem.length && $targetItem.trigger('click')
                            }
                        }, 200)
                    }

                    counter_mousemoveing++
                    if (counter_mousemoveing>99){
                        counter_mousemoveing = 3
                    }
                }
            })

            $Doc.on ('mouseup', function (e) {
                if (flag){
                    // 滑动完成
                    inst.doTouchEnd (e.timeStamp)
                    // flag重置为false，表示滑动结束
                    flag = false
                    flag_mousemoveing = false
                    start_time = 0
                    start_y = 0
                    counter_mousemoveing = 0

                    setTimeout(function(){
                        $Container.off('click', __clickPreventDefault)
                    }, 500)
                }

            })
        }
    }


} (this)

;/**import from `/resource/js/component/m/slide.js` **/
// 滑动slide
(function () {

    window.Bang = window.Bang || {}

    var
    //============ 选择器 ============
    // 滑动模块最外层容器
    selector_wrap = '.slide-shower-wrap',
    // 滑动单元块
    selector_item = '.s-item',
    // 滑动导航标识点
    selector_nav = '.slide-nav',
    // 向左
    selector_go_left = '.slide-go-left',
    // 向右
    selector_go_right = '.slide-go-right',


    //============ 元素类class ============
    class_nav_cur = 'cur',
    class_item_hide = 's-item-hide',

    //============ 参数标识 ============
    // 隐藏nav
    data_hide_nav = 'data-hidenav',
    // 是否有滑动尾部(即不连续滑动)
    data_has_end = 'data-has-end',
    // 是否自动滑动
    data_auto = 'data-auto',
    // 开始位置
    data_start = 'data-start',
    // 滑动速度
    data_speed = 'data-speed'

    /**
     * 开启滑动功能
     * @param $slideWrap
     */
    function slide ( $slideWrap , callback) {
        var
            objSwipe = null

        $slideWrap = $slideWrap || $ ( selector_wrap );

        if ( !$slideWrap.length ) {
            return;
        }

        var
            $sitem = $slideWrap.find ( selector_item )
        if ( !$sitem.length ) {
            return;
        }

        var
            params = {
                hide_nav   : parseInt ( $slideWrap.attr ( data_hide_nav ), 10 ) || 0,
                auto       : parseInt ( $slideWrap.attr ( data_auto ), 10 ) || 0,
                startSlide : parseInt ( $slideWrap.attr ( data_start ), 10 ) || 0,
                speed      : parseInt ( $slideWrap.attr ( data_speed ), 10 ) || 400,
                continuous : !(parseInt ( $slideWrap.attr ( data_has_end ), 10 ) || 0)
            }

        // nav处理
        var
            $nav = $slideWrap.find ( selector_nav ),
            $nitem;
        if ( $nav.length ) {
            // 隐藏nav
            if ( params[ 'hide_nav' ] ) {
                $nav.hide ();
            }
            $nitem = $nav.children ();

            if ( !$nitem.length ) {
                var nav_item_str = '';
                for ( var i = 0; i < $sitem.length; i++ ) {
                    nav_item_str += i == 0 ? '<span class="' + class_nav_cur + '"></span>' : '<span></span>';
                }
                $nitem = $ ( nav_item_str ).appendTo ( $nav );
            }
        }
        // 滑动item数大于1个才有滑动效果
        if ( $sitem.length > 1 ) {
            $sitem.removeClass ( class_item_hide );
            //console.log ( params.continuous )

            // 初始化slide滑动
            objSwipe = Swipe ( $slideWrap[ 0 ], {
                startSlide      : params[ 'start' ],
                speed           : params[ 'speed' ],
                auto            : params[ 'auto' ],
                continuous      : params[ 'continuous' ],
                disableScroll   : false,
                stopPropagation : false,
                callback        : function ( index, element ) {

                    if ( $nitem && $nitem.length ) {
                        if ( $nitem.length < 3 && this.continuous ) {
                            $nitem.removeClass ( class_nav_cur ).eq ( index % $nitem.length ).addClass ( class_nav_cur );
                        }
                        else {
                            $nitem.removeClass ( class_nav_cur ).eq ( index ).addClass ( class_nav_cur );
                        }
                    }

                    typeof callback=='function' && callback()
                },
                transitionEnd   : function ( index, element ) {

                    // 设置左右滑动按钮初始化
                    setGoBtnStatus ()
                }
            } )

            // 设置左右滑动按钮初始化
            setGoBtnStatus ()

            var
            // 向左滑动按钮
            $GoLeft = $slideWrap.find ( selector_go_left ),
            // 向右滑动按钮
            $GoRight = $slideWrap.find ( selector_go_right )

            // 向左滑动
            $GoLeft.on ( 'click', function ( e ) {
                e.preventDefault ()

                objSwipe.next ()

            } )

            // 向右滑动
            $GoRight.on ( 'click', function ( e ) {
                e.preventDefault ()

                objSwipe.prev ()

            } )

            /**
             * 设置左右滑动按钮的状态
             */
            function setGoBtnStatus () {
                var
                // 向左滑动按钮
                $GoLeft = $slideWrap.find ( selector_go_left ),
                // 向右滑动按钮
                $GoRight = $slideWrap.find ( selector_go_right ),
                // 当前位置
                cur_pos = objSwipe.getPos (),
                // 所有数量
                all_num = objSwipe.getNumSlides ()

                if ( !($GoLeft.length && $GoRight.length) ) {
                    return
                }

                if ( cur_pos == 0 ) {
                    $GoRight.hide ()
                    $GoLeft.show ()
                }
                else if ( cur_pos == (all_num - 1) ) {
                    $GoRight.show ()
                    $GoLeft.hide ()
                }
                else {
                    $GoRight.show ()
                    $GoLeft.show ()
                }

            }
        }

        return objSwipe
    }


    //====================== Export ========================
    window.Bang.slide = slide

} ())

;/**import from `/resource/js/mobile/special/2017/06/brand_promotion/share.js` **/
// 微信分享
!function(){
    var wxData = {
        "title"   : '聪明花钱，0元拿iPhone！',
        "desc"    : '说出你聪明花钱的态度或小故事，即可参与瓜分60万大奖，还有机会0元拿iPhone！',
        "link"    : window.location.protocol + '//' + window.location.host + '/youpin/huodong?_from=share',
        "imgUrl"  : 'https://p0.ssl.qhmsg.com/t019fb34c4310e605e6.png',
        "success" : shareSuccess, // 用户确认分享的回调
        "cancel"  : tcb.noop // 用户取消分享
    }
    if (typeof wx !== 'undefined'){
        // 海报制作成功页 + 我的排行榜页，
        // 分享内容为我的投票页，其他页面直接分享
        if (window.__WX_OPEN_ID){
            wxData.title = '就差你的助力！'
            wxData.desc = '因为我们都有一颗对聪明花钱乐于探索的心！'
            wxData.link = window.location.protocol + '//' + window.location.host + '/youpin/cmhqShareFriend?cmhq_opid='+window.__WX_OPEN_ID+'&_from=share'

            if (window.__PAGE=='2017-06-brand-promotion-create-succ'){
                // 海报制作成功页
                wxData.success = function(){
                    window.location.href = '/youpin/cmhqAfterShare?_from=share'
                }
            }
        }

        // 微信分享
        wx.ready ( function () {
            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage ( wxData )
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline ( wxData )
            //分享到QQ
            wx.onMenuShareQQ ( wxData )
            //分享到QZone
            wx.onMenuShareQZone ( wxData )
        })
    }
    // 已登录用户分享成功
    function shareSuccess(){
        window.Bang.ShareIntro.close()
    }
}()

;/**import from `/resource/js/mobile/special/2017/06/brand_promotion/create.js` **/
!function(){
    if (window.__PAGE!='2017-06-brand-promotion-create'){
        return
    }

    $(function(){
        var tcbRoot = tcb.getRoot()

        // =================================================================
        // 私有接口 private
        // =================================================================
        function __defaultAnimate (left, top, zoom, $el, setTranslateAndZoom) {

            setTranslateAndZoom ($el[ 0 ], left, top, zoom)
        }

        // 触发选择上传图片
        function __triggerChooseImage(){

            if (!(wx && wx.chooseImage)) {
                return
            }
            wx.chooseImage({
                count: 1, // 默认9
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    var localIds = res.localIds // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                    localIds = localIds[0]

                    var $PosterImgUserUpload = $ ('#PosterImgUserUpload')
                    if (!($PosterImgUserUpload && $PosterImgUserUpload.length)) {
                        var html_st = '<a id="PosterImgUserUpload" class="poster-img-item" href="#"> ' +
                            '<div class="poster-img-item-inner"></div>' +
                            '</a>'
                        $ ('.poster-img-inner').prepend (html_st)

                        $PosterImgUserUpload = $ ('#PosterImgUserUpload')
                    }

                    // wkwebview内核
                    if (window.__wxjs_is_wkwebview){
                        wx.getLocalImgData({
                            localId: localIds, // 图片的localID
                            success: function (res) {
                                var localData = res.localData // localData是图片的base64数据，可以用img标签显示
                                localData = localData.replace('jgp', 'jpeg')

                                __setUserUploadPosterImg($PosterImgUserUpload, localIds, localData)
                            }
                        })
                    } else {
                        __setUserUploadPosterImg($PosterImgUserUpload, localIds, localIds)
                    }
                }
            })

        }

        // 设置用户上传图片信息
        function __setUserUploadPosterImg($PosterImgUserUpload, localIds, url){
            resetScroll()

            $PosterImgUserUpload
                .addClass('selected iconfont icon-ok')
                .attr('data-local-id', localIds)
                .siblings('.selected').removeClass('selected iconfont icon-ok')

            $PosterImgUserUpload.find('.poster-img-item-inner').css({
                backgroundImage : 'url('+url+')'
            })
        }

        // 验证海报制作内容
        function __validPoster(){
            var $content = $('[name="content"]'),
                $imgs = $('.poster-img-item'),

                flag = true,
                errmsg = ''

            var content = $.trim($content.val())
            if (!content){
                errmsg = errmsg ? errmsg : '请填写“我的态度”'
                flag = false

                tcb.errorBlink($content)
            } else if (content.length>32){
                errmsg = errmsg ? errmsg : '“我的态度”文案不能超过32个字符'
                flag = false

                tcb.errorBlink($content)
            }

            var $img_selected = $imgs.filter('.selected')
            if (!$img_selected.length){
                errmsg = errmsg ? errmsg : '请上传 或 选择一张图片'
                flag = false

                tcb.errorBlink($imgs)
            }

            if (errmsg){
                $.dialog.toast(errmsg)
            }

            return flag
        }

        // 提交海报制作内容
        function __confirmPostPoster($btn, data){
            $.ajax({
                url : '/youpin/doSubActivityMakePoster',
                type     : 'POST',
                data     : data,
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    if (!res.errno){
                        window.location.href = '/youpin/cmhqEditPosterSucc'
                    } else {
                        $btn.removeClass('btn-disabled')

                        tcb.loadingDone()
                        $.dialog.toast(res.errmsg)
                    }
                },
                error    : function () {
                    $btn.removeClass('btn-disabled')

                    tcb.loadingDone()
                    $.dialog.toast('海报生成失败，请稍后重试')
                }
            })
        }

        // =================================================================
        // 公共接口 public
        // =================================================================

        function setScroll(flag_reset){
            var $Container = $('.block-poster-img'),
                $Inner = $Container.find('.poster-img-inner'),
                $Items = $Container.find('.poster-img-item'),
                main_width = $Container.width (),
                main_height = $Container.height (),
                item_width = main_width*.22,
                margin_width = main_width*.04,
                inner_width = (item_width + margin_width) * $Items.length - margin_width || Math.max ($Inner.width (), main_width),
                inner_height = main_height || Math.max ($Inner.height (), main_height)

            $Items.css({
                width : item_width,
                marginRight : margin_width
            })
            $Inner.css({
                width : inner_width
            })

            if (!flag_reset){
                tcbRoot.scroll.init($Container, {
                    scrollingX : true,
                    scrollingY : false
                })
                tcbRoot.scroll.setInner($Inner)
                tcbRoot.scroll.setRunning (__defaultAnimate)
            }
            tcbRoot.scroll.setDimensions(main_width, main_height, inner_width, inner_height)
        }

        function resetScroll(){
            setScroll(true)
        }

        function bindEvent(){
            // 绑定事件
            tcb.bindEvent('.page-hd-brand-promotion-create', {
                // 选择图片
                '.poster-img-item': function(e){
                    e.preventDefault()

                    var $me = $(this)

                    $me.siblings('.selected').removeClass('selected iconfont icon-ok')
                    $me.addClass('selected iconfont icon-ok')
                },
                // 触发自己上传选择图片
                '.js-trigger-upload-img': function(e){
                    e.preventDefault()

                    __triggerChooseImage()
                },
                // 预览海报
                '.btn-preview': function(e){
                    e.preventDefault()

                    if (!__validPoster()){
                        return
                    }

                    var content = $.trim($('[name="content"]').val()),
                        $imgSelected = $('.poster-img-item.selected'),
                        bgImg = $imgSelected.find('.poster-img-item-inner').css('background-image'),
                        posterInfo = {
                            content: tcb.html_encode(content),
                            nickname: window.__NICKNAME
                        }

                    var html_fn = $.tmpl ($.trim ($ ('#JsMBrandPromotionPreviewPosterTpl').html ())),
                        html_st = html_fn ({
                            posterInfo : posterInfo
                        })

                    var $swipe = tcbRoot.SwipeSection.getSwipeSection ('.create-preview-poster')

                    tcbRoot.SwipeSection.fillSwipeSection(html_st)
                    $swipe.find('.block-pic-inner').css({
                        backgroundImage : bgImg
                    })

                    tcbRoot.SwipeSection.doLeftSwipeSection ()
                },
                // 重新制作
                '.btn-cancel': function(e){
                    e.preventDefault()

                    tcbRoot.SwipeSection.backLeftSwipeSection()
                },
                // 点击生成海报
                '.btn-confirm': function(e){
                    e.preventDefault()

                    if (!__validPoster()){
                        return
                    }
                    var content = $.trim($('[name="content"]').val()),
                        $imgSelected = $('.poster-img-item.selected'),
                        localId = $imgSelected.attr('data-local-id'),
                        img_url = $imgSelected.attr('data-img'),
                        postData = {
                            content : content,
                            mediaId : '',
                            img_url : img_url
                        }

                    var $me = $(this)

                    if ($me.hasClass('btn-disabled')){
                        return
                    }

                    $me.addClass('btn-disabled')
                    tcb.loadingStart()

                    if (localId){
                        if (wx && wx.uploadImage){
                            wx.uploadImage({
                                localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                                isShowProgressTips: 0, // 默认为1，显示进度提示
                                success: function (res) {
                                    postData.mediaId = res.serverId; // 返回图片的服务器端ID

                                    __confirmPostPoster($me, postData)
                                },
                                fail: function(){
                                    $.dialog.toast('海报生成失败，请稍后重试')

                                    $me.removeClass('btn-disabled')
                                    tcb.loadingDone()
                                }
                            })
                        }
                    } else {
                        __confirmPostPoster($me, postData)
                    }
                }
            })
        }


        function init(){
            // 设置选择图片轮播
            setScroll()

            // 绑定事件
            bindEvent()
        }

        init()
    })
}()


;/**import from `/resource/js/mobile/special/2017/07/brand_promotion/gt.js` **/
/**
 * Created by Administrator on 2017/7/3 0003.
 */
// "v0.4.6 Geetest Inc.";

(function (window) {
    "use strict";
    if (typeof window === 'undefined') {
        throw new Error('Geetest requires browser environment');
    }

    var document = window.document;
    var Math = window.Math;
    var head = document.getElementsByTagName("head")[0];

    function _Object(obj) {
        this._obj = obj;
    }

    _Object.prototype = {
        _each: function (process) {
            var _obj = this._obj;
            for (var k in _obj) {
                if (_obj.hasOwnProperty(k)) {
                    process(k, _obj[k]);
                }
            }
            return this;
        }
    };

    function Config(config) {
        var self = this;
        new _Object(config)._each(function (key, value) {
            self[key] = value;
        });
    }

    Config.prototype = {
        api_server: 'api.geetest.com',
        protocol: 'http://',
        typePath: '/gettype.php',
        fallback_config: {
            slide: {
                static_servers: ["static.geetest.com", "dn-staticdown.qbox.me"],
                type: 'slide',
                slide: '/static/js/geetest.0.0.0.js'
            },
            fullpage: {
                static_servers: ["static.geetest.com", "dn-staticdown.qbox.me"],
                type: 'fullpage',
                fullpage: '/static/js/fullpage.0.0.0.js'
            }
        },
        _get_fallback_config: function () {
            var self = this;
            if (isString(self.type)) {
                return self.fallback_config[self.type];
            } else if (self.new_captcha) {
                return self.fallback_config.fullpage;
            } else {
                return self.fallback_config.slide;
            }
        },
        _extend: function (obj) {
            var self = this;
            new _Object(obj)._each(function (key, value) {
                self[key] = value;
            })
        }
    };
    var isNumber = function (value) {
        return (typeof value === 'number');
    };
    var isString = function (value) {
        return (typeof value === 'string');
    };
    var isBoolean = function (value) {
        return (typeof value === 'boolean');
    };
    var isObject = function (value) {
        return (typeof value === 'object' && value !== null);
    };
    var isFunction = function (value) {
        return (typeof value === 'function');
    };

    var callbacks = {};
    var status = {};

    var random = function () {
        return parseInt(Math.random() * 10000) + (new Date()).valueOf();
    };

    var loadScript = function (url, cb) {
        var script = document.createElement("script");
        script.charset = "UTF-8";
        script.async = true;

        script.onerror = function () {
            cb(true);
        };
        var loaded = false;
        script.onload = script.onreadystatechange = function () {
            if (!loaded &&
                (!script.readyState ||
                "loaded" === script.readyState ||
                "complete" === script.readyState)) {

                loaded = true;
                setTimeout(function () {
                    cb(false);
                }, 0);
            }
        };
        script.src = url;
        head.appendChild(script);
    };

    var normalizeDomain = function (domain) {
        // special domain: uems.sysu.edu.cn/jwxt/geetest/
        // return domain.replace(/^https?:\/\/|\/.*$/g, ''); uems.sysu.edu.cn
        return domain.replace(/^https?:\/\/|\/$/g, ''); // uems.sysu.edu.cn/jwxt/geetest
    };
    var normalizePath = function (path) {
        path = path.replace(/\/+/g, '/');
        if (path.indexOf('/') !== 0) {
            path = '/' + path;
        }
        return path;
    };
    var normalizeQuery = function (query) {
        if (!query) {
            return '';
        }
        var q = '?';
        new _Object(query)._each(function (key, value) {
            if (isString(value) || isNumber(value) || isBoolean(value)) {
                q = q + encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
            }
        });
        if (q === '?') {
            q = '';
        }
        return q.replace(/&$/, '');
    };
    var makeURL = function (protocol, domain, path, query) {
        domain = normalizeDomain(domain);

        var url = normalizePath(path) + normalizeQuery(query);
        if (domain) {
            url = protocol + domain + url;
        }

        return url;
    };

    var load = function (protocol, domains, path, query, cb) {
        var tryRequest = function (at) {

            var url = makeURL(protocol, domains[at], path, query);
            loadScript(url, function (err) {
                if (err) {
                    if (at >= domains.length - 1) {
                        cb(true);
                    } else {
                        tryRequest(at + 1);
                    }
                } else {
                    cb(false);
                }
            });
        };
        tryRequest(0);
    };


    var jsonp = function (domains, path, config, callback) {
        if (isObject(config.getLib)) {
            config._extend(config.getLib);
            callback(config);
            return;
        }
        if (config.offline) {
            callback(config._get_fallback_config());
            return;
        }

        var cb = "geetest_" + random();
        window[cb] = function (data) {
            if (data.status == 'success') {
                callback(data.data);
            } else if (!data.status) {
                callback(data);
            } else {
                callback(config._get_fallback_config());
            }
            window[cb] = undefined;
            try {
                delete window[cb];
            } catch (e) {
            }
        };
        load(config.protocol, domains, path, {
            gt: config.gt,
            callback: cb
        }, function (err) {
            if (err) {
                callback(config._get_fallback_config());
            }
        });
    };

    var throwError = function (errorType, config) {
        var errors = {
            networkError: '网络错误',
            gtTypeError: 'gt字段不是字符串类型'
        };
        if (typeof config.onError === 'function') {
            config.onError(errors[errorType]);
        } else {
            throw new Error(errors[errorType]);
        }
    };

    var detect = function () {
        return window.Geetest || document.getElementById("gt_lib");
    };

    if (detect()) {
        status.slide = "loaded";
    }

    window.initGeetest = function (userConfig, callback) {

        var config = new Config(userConfig);

        if (userConfig.https) {
            config.protocol = 'https://';
        } else if (!userConfig.protocol) {
            config.protocol = window.location.protocol + '//';
        }

        // for KFC
        if (userConfig.gt === '050cffef4ae57b5d5e529fea9540b0d1' ||
            userConfig.gt === '3bd38408ae4af923ed36e13819b14d42') {
            config.apiserver = 'yumchina.geetest.com/'; // for old js
            config.api_server = 'yumchina.geetest.com';
        }

        if (isObject(userConfig.getType)) {
            config._extend(userConfig.getType);
        }
        jsonp([config.api_server || config.apiserver], config.typePath, config, function (newConfig) {
            var type = newConfig.type;
            var init = function () {
                config._extend(newConfig);
                callback(new window.Geetest(config));
            };

            callbacks[type] = callbacks[type] || [];
            var s = status[type] || 'init';
            if (s === 'init') {
                status[type] = 'loading';

                callbacks[type].push(init);

                load(config.protocol, newConfig.static_servers || newConfig.domains, newConfig[type] || newConfig.path, null, function (err) {
                    if (err) {
                        status[type] = 'fail';
                        throwError('networkError', config);
                    } else {
                        status[type] = 'loaded';
                        var cbs = callbacks[type];
                        for (var i = 0, len = cbs.length; i < len; i = i + 1) {
                            var cb = cbs[i];
                            if (isFunction(cb)) {
                                cb();
                            }
                        }
                        callbacks[type] = [];
                    }
                });
            } else if (s === "loaded") {
                init();
            } else if (s === "fail") {
                throwError('networkError', config);
            } else if (s === "loading") {
                callbacks[type].push(init);
            }
        });

    };


})(window);

;/**import from `/resource/js/mobile/special/2017/06/brand_promotion/brand_promotion.js` **/
!function () {

    $ (function () {

        tcb.bindEvent({
            // 回退
            '.js-go-back': function(e){
                e.preventDefault();

                window.history.back();

                setTimeout(function(){
                    window.location.href = tcb.setUrl('/youpin/huodong', window.__PARAMS);
                }, 1000);
            },
            // 查看我的排名页 如已参加跳转到排名页,未参加给提示
            '.trigger-to-my-ranking': function(e){
                var $me = $(this)

                $.get('/youpin/doCheckHasParticipatedCmhq',function (res) {
                    var res = $.parseJSON(res)

                    if(!res['errno']){
                        window.location.href = tcb.setUrl('/youpin/cmhqPersonalRank', window.__PARAMS)
                    }else{
                        $.dialog.toast('您还未参与本次活动哦', 2000)
                    }
                })
            },
            // 点击分享
            '.trigger-btn-share': function(e){
                e.preventDefault()

                // 触发显示分享引导
                window.Bang.ShareIntro.active({
                    img : 'https://p.ssl.qhimg.com/t01c5d992454e4a99d1.png',
                    ext_html: '<div style="padding-top:.1rem;font-size: .14rem;text-align: center;color: #fff;">分享至好友群或朋友圈</div>'
                })
            },
            // 查看奖项细则
            '.trigger-to-prize-intro':function (e) {
                e.preventDefault()

                Bang.SwipeSection.getSwipeSection ()
                var html_fn = $.tmpl($.trim($('#JsMCMHQPrizeDescTpl').html())),
                    html_str = html_fn()

                Bang.SwipeSection.fillSwipeSection (html_str)

                Bang.SwipeSection.doLeftSwipeSection ()
            }
            ,
            // 填写领奖信息
            '.trigger-edit-winner-info':function (e) {
                e.preventDefault()

                $.get('/youpin/doCheckGetCmhqPrize',function (res) {
                    res = $.parseJSON(res)

                    if(!res['errno']){
                        showEditInfoPanel()
                    }else{
                        $.dialog.toast(res[ 'errmsg' ], 5000)
                    }
                })
            },
            // 查看中奖名单
            '.js-trigger-show-winner-list': function(e){
                e.preventDefault()

                //return $.dialog.toast('中奖名单稍后公布，敬请期待~')

                var html_str = '<img class="w100" src="https://p2.ssl.qhmsg.com/t01e93d165f942a99ed.png">'

                Bang.SwipeSection.getSwipeSection ()
                Bang.SwipeSection.fillSwipeSection (html_str)
                Bang.SwipeSection.doLeftSwipeSection ()
            }
        })

        // 轮播图
        window.Bang.slide ( $ ( '.slide-shower-wrap' ))
        // 视频
        window.Bang.playVideo($('.trigger-play-video'))

        // 活动说明页人气排名
        function getRankingList() {
            $.get('/youpin/getPopularityRanking',function (res) {
                var res = $.parseJSON(res)

                if(!res['errno']){
                    var ranking_list = res['result']

                    var html_fn = $.tmpl($.trim($('#JsMCMHQRankingListTpl').html())),
                        html_str = html_fn({
                            'ranking_list':ranking_list
                        })

                    $('.page-hd-brand-promotion-intro .js-ranking-list').html(html_str)
                }else{

                }
            })
        }

        if (window.__PAGE == '2017-06-brand-promotion-intro') {
            // 每三分钟更新一次
            setTimeout (function () {
                var arg = arguments
                getRankingList ()

                setTimeout (arg.callee, 1000 * 60 * 3)
            }, 1)

            // 滚动用户评论的数据
            function rollCommentsList(){
                var $list_inner = $('.page-hd-brand-promotion-intro .comments-list-inner')
                if($list_inner && $list_inner.length){
                    var $list_comments_item = $list_inner.find('.comments-item'),
                        list_inner_row_height = $list_comments_item.first().height()

                    // 大于3条中奖信息才滚滚滚
                    if($list_comments_item.length>3){
                        (function(){
                            var arg = arguments
                            $list_inner.animate({'top': -list_inner_row_height}, 1000, function(){
                                $list_inner.find('.comments-item').first().appendTo($list_inner)
                                $list_inner.css({'top': 0})

                                setTimeout(arg.callee, 3000)
                            })
                        }())
                    }

                }
            }

            rollCommentsList()
        }


        // 显示填写信息面板
        function showEditInfoPanel () {

            var
                html_fn = $.tmpl (tcb.trim ($ ('#JsMCMHQWinnerInfoPanel').html ())),
                html_st = html_fn ()

            var
                dialog = tcb.showDialog (html_st, {
                    className : 'erhuojie-panel erhuojie-login-panel',
                    withClose : true,
                    middle    : true
                }),
                $form = dialog.wrap.find ('form')

            dialog.wrap.prepend('<div class="erhuojie-panel-bottom"></div>')

            bindEventSubmitForm ($form)

        }
        // 关闭登录面板
        function closeLoginPanel(){

            tcb.closeDialog()
        }
        // 绑定提交表单事件
        function bindEventSubmitForm($form){

            // 提交填写中奖人信息表单
            $form.on('submit', function(e){
                e.preventDefault()

                var
                    $form = $(this)
                if (!validFormSubmit($form)){
                    return
                }

                $.ajax ({
                    type     : $form.attr('method'),
                    url      : $form.attr('action'),
                    data     : $form.serialize(),
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {

                        if (res[ 'errno' ]) {
                            return $.dialog.toast (res[ 'errmsg' ], 2000)
                        }else{
                            alert('信息提交成功！我们将在1周内为您发放奖品/奖金')
                        }

                        closeLoginPanel()
                    },
                    error    : function () {
                        $.dialog.toast('系统错误，请刷新页面重试', 2000)
                    }
                })
            })
            // 获取手机验证码
            $form.find('.btn-get-sms-code').on('click', function(e){
                e.preventDefault()

                var
                    $me = $ (this),
                    $form = $me.closest ('form'),
                    $mobile = $form.find ('[name="user_mobile"]'),
                    $secode = $form.find ('[name="secode"]')

                if (!validSeCode($me)) {
                    return
                }

                getSMSCode (
                    {
                        'user_mobile' : $.trim ($mobile.val ()),
                        'secode'      : $.trim ($secode.val ())
                    },
                    function (data) {
                        $me.addClass ('btn-get-sms-code-disabled').html ('发送成功')
                        setTimeout (function () {

                            $me.html ('60秒后再次发送')

                            tcb.distimeAnim (60, function (time) {
                                if (time <= 0) {
                                    $me.removeClass ('btn-get-sms-code-disabled').html ('发送验证码')
                                } else {
                                    $me.html (time + '秒后再次发送')
                                }
                            })

                        }, 1000)
                    },
                    function () {

                        $form.find ('.vcode-img').click ()
                    }
                )
            })
            // 刷新图像验证码
            $form.find('.vcode-img').on('click', function(e){
                var
                    $me = $(this),
                    $secode_img = $('.vcode-img'),
                    $secode = $('[name="secode"]'),
                    src = '/secode/?rands=' + Math.random ()

                $secode_img.attr ('src', src)

                $secode.val('')

                $me.closest('.row').find('[name="secode"]').focus()
            })
        }
        // 验证提交表单
        function validFormSubmit ($Form) {
            var
                flag = true

            if (!($Form && $Form.length)) {
                flag = false
            } else {

                var
                    $user_name = $Form.find ('[name="user_name"]'),
                    $user_address = $Form.find ('[name="user_address"]'),
                    $wechat_id = $Form.find ('[name="wechat_id"]'),
                    $mobile = $Form.find ('[name="user_mobile"]'),
                    // 图形验证码
                    $secode = $Form.find ('[name="secode"]'),
                    // 短信验证码
                    $smscode = $Form.find ('[name="sms_code"]'),

                    user_name = $.trim ($user_name.val ()),
                    user_address = $.trim ($user_address.val ()),
                    wechat_id = $.trim ($wechat_id.val ()),
                    mobile = $.trim ($mobile.val ()),
                    secode = $.trim ($secode.val ()),
                    smscode = $.trim ($smscode.val ())

                var
                    $focus_el = null,
                    err_msg = ''

                // 验证用户名
                if (!user_name) {
                    $.errorAnimate ($user_name)
                    $focus_el = $focus_el || $user_name
                    err_msg = '姓名不能为空'
                }

                // 验证地址
                if (!user_address) {
                    $.errorAnimate ($user_address)
                    $focus_el = $focus_el || $user_address
                    err_msg = err_msg || '地址不能为空'
                }

                // 验证微信号
                if (!wechat_id) {
                    $.errorAnimate ($wechat_id)
                    $focus_el = $focus_el || $wechat_id
                    err_msg = err_msg || '微信号不能为空'
                }

                // 验证手机号
                if (!mobile) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = err_msg || '手机号码不能为空'
                }

                else if (!tcb.validMobile (mobile)) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = err_msg || '手机号码格式错误'
                }

                // 验证图形验证码
                if (!secode) {
                    $.errorAnimate ($secode)
                    $focus_el = $focus_el || $secode
                    err_msg = err_msg || '图片验证码不能为空'
                }

                // 验证短信验证码
                if (!smscode) {
                    $.errorAnimate ($smscode)
                    $focus_el = $focus_el || $smscode
                    err_msg = err_msg || '短信验证码不能为空'
                }

                if (err_msg) {
                    flag = false

                    setTimeout (function () {
                        $focus_el && $focus_el.focus ()
                    }, 500)

                    $.dialog.toast (err_msg)
                }
            }

            return flag
        }
        // 获取图形验证码表单验证
        function validSeCode ($Target) {
            var
                flag = true

            if (!($Target && $Target.length)) {
                flag = false
            } else {

                var
                    $Form = $Target.closest ('form'),
                    $mobile = $Form.find ('[name="user_mobile"]'),
                    $secode = $Form.find ('[name="secode"]'),

                    mobile = $.trim ($mobile.val ()),
                    secode = $.trim ($secode.val ())

                if ($Target.hasClass ('btn-get-sms-code-disabled')) {
                    flag = false
                } else {
                    var
                        $focus_el = null,
                        err_msg = ''

                    // 验证手机号
                    if (!mobile) {
                        $.errorAnimate ($mobile)
                        $focus_el = $focus_el || $mobile
                        err_msg = '手机号码不能为空'
                    }
                    else if (!tcb.validMobile (mobile)) {
                        $.errorAnimate ($mobile)
                        $focus_el = $focus_el || $mobile
                        err_msg = '手机号码格式错误'
                    }

                    // 验证图形验证码
                    if (!secode){
                        $.errorAnimate ($secode)
                        $focus_el = $focus_el || $secode
                        err_msg = err_msg || '图片验证码不能为空'
                    }

                    if (err_msg) {
                        flag = false

                        setTimeout (function () {
                            $focus_el && $focus_el.focus ()
                        }, 500)

                        $.dialog.toast (err_msg)
                    }

                }
            }

            return flag
        }
        // 获取手机验证码
        function getSMSCode (params, callback, error) {
            $.ajax ({
                type     : 'POST',
                url      : '/m/doSendSmscode/',
                data     : params,
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {

                    if (res[ 'errno' ]) {
                        typeof error === 'function' && error ()

                        return $.dialog.toast (res[ 'errmsg' ], 2000)
                    }
                    typeof callback === 'function' && callback (res[ 'result' ])
                },
                error    : function () {
                    typeof error === 'function' && error ()
                }
            })
        }

    })
} ()
