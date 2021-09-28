(function () {
    var wxShareData= {
        "title"   : '苹果这次发布的新产品竟然是...',
        "desc"    : '全新的体验，再次改变世界。',
        "link"    : '',
        "imgUrl"  : 'https://p2.ssl.qhmsg.com/t015b92c59031aba7a7.png',
        "success" : afterShare, // 用户确认分享的回调
        "cancel"  : tcb.noop // 用户取消分享
    }
    var wxLink = {
        act: ''
    }
    if(window.__op_id){
        wxLink.op_id = window.__op_id
    }
    function afterShare(){
        if(window.__is_sndissx){
            doUpdateRedise(true,function(res){
                if(!res.errno){
                    // $.dialog.toast ('分享成功')
                    $('.share-text-line').hide();
                    $('.sn-button-group').show()
                }else{
                    // $.dialog.toast (res.errmsg)
                }
            })
        }else{
            doUpdateRedise(true,function(res){
            })
        }
        // 添加事件统计
        if(window.__is_sndissx){
            tcb.statistic ([ '_trackEvent', 'm', 'sn统计', 'dissx转发', '1', '' ])
        }else{
            tcb.statistic ([ '_trackEvent', 'm', 'tcb统计', 'dissx转发', '1', '' ])
        }
    }

    function doUpdateRedise(is_sn,callback) {
        if(is_sn){
            var params ={channel_type:'sn'}
        }else{
            var params ={}
        }
        $.get('/huodong/doDissxFlag',params,function (res) {
            typeof  callback === 'function' && callback(res)
        });
    }

    function setWxLinkOpiton(key, value){
        wxLink[key] = value
        setWxLink()
    }
    function setWxLink(){
        var expand_str = '?'
        for(var key in wxLink){
            if(wxLink[key] && wxLink[key]!==''){
                expand_str+= '&'+ key+'='+wxLink[key]
            }
        }
        var link =window.location.protocol+ "//" + window.location.host + window.location.pathname + expand_str + window.location.hash
        wxShareData.link = link
    }
    if (typeof wx !== 'undefined'){
        // 微信分享
        wx.ready ( function () {
            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage ( wxShareData )
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline ( wxShareData )
            //分享到QQ
            wx.onMenuShareQQ ( wxShareData )
        })
    }


    window.pointGroups = []   //签名pointGroups数组
    var phoneBox = $ ('#phone-box');
    var fcLayer = $ ('#fc-layer');
    var bcLayer = $ ('.bc-layer');
    var options = {} //参数
    var $block_customer_signature_area = $('.block-customer-signature-area')

    window.group = {
        0:"2",
        1:"1",
        2:"0",
        3:"3"
    } //组合
    var rotate = {
        f : function () {
            phoneBox.removeClass ('back')
        },
        b : function () {
            phoneBox.addClass ('back')
        }
    }

    tcb.bindEvent (document.body, {
        // 关闭签名板
        '.js-trigger-customer-signature-pad-close' : function (e) {
            e.preventDefault ()
            window.signatureFunc.closeCustomerSignaturePad(function () {
                confirmCreateMask().hideMask()
                confirmCreateX()
                $block_customer_signature_area.hide()
            })
        },
        // 清除签名
        '.btn-signature-clear' : function (e) {
            e.preventDefault ()
            window.signatureFunc.clearSignature()
        },
        // 确认签名
        '.btn-signature-confirm' : function (e) {
            e.preventDefault ()
            window.signatureFunc.confirmSignature(function (img,pointGroups) {
                confirmCreateMask().hideMask()
                confirmCreateX()
                $block_customer_signature_area.css ({
                    fontSize        : 0,
                    background : 'url(' + img + ') no-repeat center center/100% 100%'                   })
                // confirmCreateX()
                // setWxLinkOpiton('pointGroups', utf8_to_b64(JSON.stringify (pointGroups)))
            })
        }
    })
    var controller = {

        init : function () {
            //上一步
            $('#lastStep').on('click',function(){
                var $cur_block = $('.content-container').find('.content-box.active'),
                    $pre_block = $cur_block.prev(),
                    pre_block_id = $pre_block.attr('id')

                if($pre_block && $pre_block.length>0){
                    $cur_block.removeClass('active')
                    $pre_block.addClass('active')

                    setBlockName(pre_block_id)

                    if(pre_block_id=='phoneColor' && $('#phoneBody').find('.active').attr('data-index')=='4'){
                        $('#lastStep').trigger('click')
                        return
                    }

                    if($pre_block.attr('data-mian') ){
                        if($pre_block.attr('data-mian')=='f'){
                            rotate.f()
                        }else{
                            rotate.b()
                        }
                    }
                }
            })
            //下一步
            $('#nextStep').on('click',function(){
                var $cur_block = $('.content-container').find('.content-box.active'),
                    $next_block = $cur_block.next(),
                    next_block_id = $next_block.attr('id')

                if($next_block && $next_block.length>0){

                    $cur_block.removeClass('active')
                    $next_block.addClass('active')

                    setBlockName(next_block_id)

                    if(next_block_id=='phoneColor' && $('#phoneBody').find('.active').attr('data-index')=='4'){
                        $('#nextStep').trigger('click')
                        return
                    }
                    if($next_block.attr('data-mian') ){
                        if($next_block.attr('data-mian')=='f'){
                            rotate.f()
                        }else{
                            rotate.b()
                        }
                    }
                }else{
                    confirmCreateMask().showMask()
                }

            })
            //翻转
            $ ('.rotateY').on ('click', function () {
                phoneBox.toggleClass ('back')
            })

            //生成
            $ ('.next').on ('click', function () {
                confirmCreateMask().showMask()
            })
            //
            $ ('.content-box li').on ('click', function (e) {
                var target = $ (this)
                var id = target.parent ().attr ('id');
                $ (this).parent ().find ("li.active").removeClass ('active')
                target.addClass ('active');

                var index = target.attr('data-index');
                ev[ id ] && ev[ id ].call (this);
                var parentIndex = target.parent().attr('data-index')
                group[ parentIndex ] = index;
                setWxLinkOpiton('act', utf8_to_b64(JSON.stringify (group)))
            })

            //E 用于测试用
            $ ('.reset').on ('click', function (params) {
                $ ('#resetConfirm').removeClass ('hide');
            })
            $ ('.cancel').on ('click', function () {
                $ ('#resetConfirm').addClass ('hide');
            })
            $ ('.confirm').on ('click', function () {
                $ ('#resetConfirm').addClass ('hide');
                options.onConfirm && options.onConfirm.apply (this)
            })


        }
    }

    window.ev = {

        //机身
        phoneBody : function (index) {
            var index = $ (this).attr ('data-index')
            //选择第几张图片
            phoneBox.find (".phone-pic").each (function (i, item) {
                var preClass = item.className.replace (/i-\d+/, "");
                $ (this).attr ('class', preClass + ' i-' + (index))
            })
            phoneBox.find ('.cover').attr ("class", "cover m-mask" + index);
            phoneBox.find ('.inner-cover').attr ("class", "inner-cover m-screen" + index);
            phoneBox.attr ("class", "phone" + index)
        },
        // 前摄
        phoneFc : function () {
            var $this = $(this),
                index = $this.attr('data-index')
            rotate.f ();
            if (index == '0') {
                fcLayer.html (""); //清除按钮
            } else {
                fcLayer.html ('<i class="icon i-fc-' + index + '"></i>');
            }

        },
        // 后摄
        phoneBc : function () {
            var $this = $(this),
                index = $this.attr('data-index')
            rotate.b ();
            bcLayer.html('<i class="icon i-bc-' + index + '"></i>')

        },

        // 颜色
        phoneColor : function (index) {
            var $this = $(this),
                index = $this.attr('data-index')
            rotate.b ();
            $ ('.main-scence .phone-pic').each (function (i, item) {
                var ignore = $ (this).attr ('ignore');
                if (ignore) {
                    return;
                }
                var preClass = item.className.replace (/color\d+/, "");
                $ (this).attr ('class', preClass + ' color' + (index))
            })
        }
    }

    function confirmCreateX(){
        options.onPublish && options.onPublish.apply (controller)
    }

    function confirmCreateMask(){
        var $createMask = $ ('#createConfirm'),
            $confirmBtn = $createMask.find('.btn-confirm'),
            $cancelBtn= $createMask.find('.btn-cancel')

        // 添加事件统计
        if(window.__is_sndissx){
            tcb.statistic ([ '_trackEvent', 'm', 'sn统计', 'dissx完成设计', '1', '' ])
        }else{
            tcb.statistic ([ '_trackEvent', 'm', 'tcb统计', 'dissx完成设计', '1', '' ])
        }


        $confirmBtn.on('click',function(){
            hideMask()
            window.signatureFunc.openCustomerSignaturePad()
        })
        $cancelBtn.on('click',function(){
            confirmCreateX()
            hideMask()
            $block_customer_signature_area.hide()
        })

        function showMask(){
            $createMask.removeClass ('hide');
        }
        function hideMask(){
            $createMask.addClass('hide');
        }


        return {
            showMask:showMask,
            hideMask:hideMask
        }
    }

    function setBlockName(blockName){
        var block_name_map = {
            'phoneBody':'设计产品外观',
            'phoneColor':'设计产品颜色',
            'phoneFc':'设计前置摄像头',
            'phoneBc':'设计后置摄像头',
        }
        $('.block-name').text(block_name_map[blockName])
    }

    window.Controller = function (option) {
        options = $.extend ({}, option);
        controller.init ();
        $ ('.section-box li').eq (0).click ()
        $ ('.content-box li').eq (0).click ()
        var that = this
        window.onpopstate = function (event) {
            if (event.state) {
                that.publish ();
            } else {
                that.back ();
            }
        }
    }
    // 清空画布
    Controller.prototype.reset = function () {
        $ ('.content-box').each (function (index, item) {
            $ (item).find ("li").eq (0).click ()
        })
        group = {
            0:"2",
            1:"1",
            2:"0",
            3:"3"
        }
    }

    Controller.prototype.setPublishImg = function (src) {
        $ ('#publish').attr ("src", src)
    }
    //渲染
    Controller.prototype.render = function (params) {
        group = params;
        var obj = {
            0 : "phoneBody",
            1 : "phoneColor",
            2 : "phoneFc",
            3 : "phoneBc"
        }
        for (var i in params) {
            var key = obj[ i ]
            if (key) {
                $ ('#' + key).find ("li[data-index='"+params[ i ]+"']").click ();
            }
        }
    }
    Controller.prototype.toString = function () {
        return JSON.stringify (group)
    }
    Controller.prototype.setLoading = function (list, time, callback) {
        var target = $ ('#loading');
        var l = list.length;
        target.removeClass ('hide');
        setTimeout (function () {
            target.addClass ('active');
        }, 10);
        $.each (list, function (index, item) {
            setTimeout (function () {
                target.find ("p").text (item.text);
                if (index == l - 1) {
                    setTimeout (function () {
                        setTimeout (function () {
                            target.addClass ('hide')
                            target.removeClass ('active')
                            callback && callback ()
                        }, 100)
                    }, time)
                }
            }, item.gap)
            //console.log(item)
        })
    }
    Controller.prototype.publish = function () {
        var dom = $ ('#phone-box').clone ()
        var dom2 = $ ('#phone-box').clone ()
        $ (".result .main-scence").html (dom2)
        $ (".result").addClass ("active")

    }
    Controller.prototype.back = function () {
        $ (".result").removeClass ("active")
    }
}) ();

var controller = new Controller ({
    onConfirm : function () {
        controller.reset (); //清空画布
    },
    onPublish : function () {
        controller.setLoading ([ {
            text : "零件组装中...",
            gap : 0,
        }, {
            text : "样机测试中...",
            gap : 1000,
        }, {
            text : "正在@所有人...",
            gap : 2000,
        } ], 1000, function () {
            history.pushState (1, "", location.pathname);
            controller.publish ();
        })
    }
});
function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}
function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}