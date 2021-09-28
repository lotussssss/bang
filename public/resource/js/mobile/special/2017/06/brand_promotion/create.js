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
