!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "据说，优秀员工能领最新iPhone",
        "desc": "测测你在苹果担任什么职务？",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname,
        "imgUrl": 'https://p3.ssl.qhimg.com/t017b4795869ea94c5c.png',
        "success": tcb.noop, // 用户确认分享的回调
        "cancel": tcb.noop // 用户取消分享
    }

    if (typeof wx !== 'undefined') {
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ(wxData)
            //分享到QZone
            wx.onMenuShareQZone(wxData)
        })
    }

    var __errmsg = '系统异常,请重试!'
    var __msgMap = {
        0: {
            id: 0,
            text: 'Hi，我是Cook。',
            user_id: 1,
            next: 1
        },
        1: {
            id: 1,
            text: '你愿意接受这次苹果秋季面试的邀请吗？',
            user_id: 1,
            next: [2, 3]
        },
        2: {
            id: 2,
            text: '丑拒',
            text_option: '拒绝邀请',
            user_id: 2,
            option: true,
            hidden: true,
            next: 4
        },
        3: {
            id: 3,
            text: '接受邀请',
            text_option: '接受邀请',
            user_id: 2,
            option: true,
            hidden: true,
            stop: true,
            next: 9
        },
        4: {
            id: 4,
            text: '真的不要么？我们有非常丰厚的内部员工福利哟',
            user_id: 1,
            next: 5
        },
        5: {
            id: 5,
            text: '比如，一言不合就会发最新款iPhone。',
            user_id: 1,
            next: 6
        },
        6: {
            id: 6,
            text: '真的不再考虑下吗？',
            user_id: 1,
            next: [7, 8]
        },
        7: {
            id: 7,
            text: '拒绝x2',
            text_option: '拒绝x2',
            user_id: 2,
            option: true,
            hidden: true,
            reject: true,
            end: true
        },
        8: {
            id: 8,
            text: '接受邀请',
            text_option: '接受挽留',
            user_id: 2,
            option: true,
            hidden: true,
            stop: true,
            next: 9
        },
        9: {
            id: 9,
            text: 'ok，下面正式进入面试环节',
            user_id: 1,
            next: 10
        },
        10: {
            id: 10,
            text: '好！',
            user_id: 2,
            next: 11
        },
        11: {
            id: 11,
            text: '下面播放的4段手机铃声，你觉得哪个不是苹果的铃声？(请关闭静音模式)',
            user_id: 1,
            next: 12
        },
        12: {
            id: 12,
            text: 'https://s1.ssl.qhres2.com/static/e5c360c469fb4440.mp3',
            user_id: 1,
            msg_type: 'audio',
            text_option: 'A',
            seconds: 37,
            next: 13
        },
        13: {
            id: 15,
            text: 'https://s3.ssl.qhres2.com/static/d95326bcaa238265.mp3',
            user_id: 1,
            msg_type: 'audio',
            text_option: 'B',
            seconds: 12,
            next: 14
        },
        14: {
            id: 14,
            text: 'https://s0.ssl.qhres2.com/static/247eec83b3e06d26.mp3',
            user_id: 1,
            msg_type: 'audio',
            text_option: 'C',
            seconds: 18,
            next: 15
        },
        15: {
            id: 15,
            text: 'https://s0.ssl.qhres2.com/static/c6844675a8f67027.mp3',
            user_id: 1,
            msg_type: 'audio',
            text_option: 'D',
            seconds: 26,
            next: [16, 17, 18, 19]
        },
        16: {
            id: 16,
            text: 'A!',
            text_option: 'A',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 20
        },
        17: {
            id: 17,
            text: 'B!',
            text_option: 'B',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 20
        },
        18: {
            id: 18,
            text: 'C!',
            text_option: 'C',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 20
        },
        19: {
            id: 19,
            text: 'D!',
            text_option: 'D',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            correct: true,
            stop: true,
            next: 21
        },
        20: {
            id: 20,
            text: '两长两短选2B，长短不一选4D！！！',
            user_id: 1,
            next: 22
        },
        21: {
            id: 21,
            text: 'https://p0.ssl.qhimg.com/t01119a024c985a51fd.gif',
            user_id: 1,
            msg_type: 'image',
            next: 22
        },
        22: {
            id: 22,
            text: '以下哪个是苹果正版Logo',
            user_id: 1,
            next: [23, 24, 25, 26]
        },
        23: {
            id: 23,
            text: 'A!',
            text_option: 'A',
            option_image: 'https://p2.ssl.qhimg.com/t01ba04941610c40678.jpg',
            option_type: 'image',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 27
        },
        24: {
            id: 24,
            text: 'B!',
            text_option: 'B',
            option_image: 'https://p4.ssl.qhimg.com/t010c0aa23ce5a28119.jpg',
            option_type: 'image',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 27
        },
        25: {
            id: 25,
            text: 'C!',
            text_option: 'C',
            option_image: 'https://p2.ssl.qhimg.com/t015341c700496d6c84.jpg',
            option_type: 'image',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 29
        },
        26: {
            id: 26,
            text: 'D!',
            text_option: 'D',
            option_image: 'https://p0.ssl.qhimg.com/t016c8d74a37c389e59.jpg',
            option_type: 'image',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            stop: true,
            next: 27
        },
        27: {
            id: 27,
            text: 'https://p1.ssl.qhimg.com/t010f115aaafbe1803a.png',
            user_id: 1,
            msg_type: 'image',
            next: 28
        },
        28: {
            id: 28,
            text: '看我手势C',
            user_id: 1,
            next: 30
        },
        29: {
            id: 29,
            text: 'https://p5.ssl.qhimg.com/t0177d73002be390407.gif',
            user_id: 1,
            msg_type: 'image',
            next: 30
        },
        30: {
            id: 30,
            text: '你最喜欢苹果的哪个设计？',
            user_id: 1,
            next: 31
        },
        31: {
            id: 31,
            text: 'A:刘海<br>B:Home键<br>C:Logo<br>D:包装盒',
            user_id: 1,
            next: [32, 33, 34, 35]
        },
        32: {
            id: 32,
            text: 'A!',
            text_option: 'A',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 36
        },
        33: {
            id: 33,
            text: 'B!',
            text_option: 'B',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 36
        },
        34: {
            id: 34,
            text: 'C!',
            text_option: 'C',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 36
        },
        35: {
            id: 35,
            text: 'D!',
            text_option: 'D',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            stop: true,
            next: 36
        },
        36: {
            id: 36,
            text: 'https://p3.ssl.qhimg.com/t0111501ead6824050b.gif',
            user_id: 1,
            msg_type: 'image',
            next: 37
        },
        37: {
            id: 37,
            text: '你认为这里面装的是什么？',
            user_id: 1,
            next: 38
        },
        38: {
            id: 38,
            text: 'https://p5.ssl.qhimg.com/t0137113405bfee01df.jpg',
            user_id: 1,
            msg_type: 'image',
            next: 39
        },
        39: {
            id: 39,
            text: 'A:房产证<br>B:签证材料<br>C:Macbook<br>D:股权转让书',
            user_id: 1,
            next: [40, 41, 42, 43]
        },
        40: {
            id: 40,
            text: 'A!',
            text_option: 'A',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 44
        },
        41: {
            id: 41,
            text: 'B!',
            text_option: 'B',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 44
        },
        42: {
            id: 42,
            text: 'C!',
            text_option: 'C',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 44
        },
        43: {
            id: 43,
            text: 'D!',
            text_option: 'D',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            stop: true,
            next: 44
        },
        44: {
            id: 44,
            text: '鹅。。。鹅妹子嘤',
            user_id: 1,
            next: 45
        },
        45: {
            id: 45,
            text: '请填空：iPh_ne，_处应该填什么？',
            user_id: 1,
            next: 46
        },
        46: {
            id: 46,
            text: 'A:0<br>B:O<br>C:o<br>D:。',
            user_id: 1,
            next: [47, 48, 49, 50]
        },
        47: {
            id: 47,
            text: 'A!',
            text_option: 'A',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 51
        },
        48: {
            id: 48,
            text: 'B!',
            text_option: 'B',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            next: 51
        },
        49: {
            id: 49,
            text: 'C!',
            text_option: 'C',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            correct: true,
            next: 52
        },
        50: {
            id: 50,
            text: 'D!',
            text_option: 'D',
            user_id: 2,
            is_answer: true,
            option: true,
            hidden: true,
            stop: true,
            next: 51
        },
        51: {
            id: 51,
            text: '你没听过一首歌吗？（《都选C》）',
            user_id: 1,
            next: 53
        },
        52: {
            id: 52,
            text: 'https://p0.ssl.qhimg.com/t0170f6046ba14c0ae3.gif',
            user_id: 1,
            msg_type: 'image',
            next: 53
        },
        53: {
            id: 53,
            text: '你已经成功答完所有面试题！不说福利的面试都是耍流氓',
            user_id: 1,
            next: 54
        },
        54: {
            id: 54,
            text: '福利敲重点：最新款iPhone会送给能抓住机会的员工。',
            user_id: 1,
            next: 55
        },
        55: {
            id: 55,
            text: '现在，耐心等待一会儿，你的职位马上就会生成。',
            user_id: 1,
            end: true
        }
    }

    var __userAvatar = {
            1: 'https://p3.ssl.qhimg.com/t017b4795869ea94c5c.png',
            2: window.__HEADIMAGE
        },
        __userNickName = window.__NICKNAME,
        __checkedOptions = [],
        __soundInstMap = {},
        __soundInstPlaying = null


    function getInterviewResult(callback) {
        var request_url = '/huodong/doGetNickName',
            params = {
                first_blood:__checkedOptions[0],
                double_kill:__checkedOptions[1],
                triple_kill:__checkedOptions[2],
                quadra_kill:__checkedOptions[3],
                penta_kill:__checkedOptions[4]
            }

        request_url = tcb.setUrl(request_url, params)
        _ajaxGet(request_url, callback)
    }


    function _ajaxGet(request_url, callback) {
        $.get(request_url, function (res) {
            try {
                res = $.parseJSON(res)
            } catch (ex) {
            }

            if (res && !res.errno) {
                $.isFunction(callback) && callback(res.result)
            } else {
                $.dialog.toast(res && res.errmsg && __errmsg)
            }
        })
    }

    // 输出chat
    function renderMsg(msg, msg_id) {
        var html_fn = $.tmpl($.trim($('#JsMApplePositionChatTpl').html())),
            html_st = html_fn({
                msg: msg,
                msg_id: msg_id,
                avatar: __userAvatar[msg.user_id]
            })

        if (msg.msg_type) {
            initSoundInst(msg.text)
        }

        $('.block-chat').append(html_st)

        $.scrollTo({endY: $('body').height(), duration: 500})
    }

    function initSoundInst(sound_file) {
        var soundInst = __soundInstMap[sound_file]
        var src = sound_file.split(',')
        if (!soundInst) {
            soundInst = __soundInstMap[sound_file] = new Howl({
                src: src,
                volume: 1,
                loop: false,
                preload: true,
                autoplay: false,
                mute: false,
                onend: function () {
                    __soundInstPlaying = null
                }
            })
        }

        return soundInst
    }

    function stopSound(soundInst, callback) {
        var vol = __soundInstPlaying.volume()
        __soundInstPlaying.once('fade', function () {
            __soundInstPlaying.stop()
            __soundInstPlaying.volume(vol)

            typeof callback == 'function' && callback()
        })
        __soundInstPlaying.fade(vol, 0, 500)
    }

    // 输出选项
    function renderOptions(options, optionIds) {
        var html_fn = $.tmpl($.trim($('#JsMApplePositionOptionsTpl').html())),
            html_st = html_fn({
                options: options,
                optionIds: optionIds
            })

        var $blockOption = $('.block-option')

        $blockOption.html(html_st)

        showBlockOption($blockOption)

        $.scrollTo({endY: $('body').height(), duration: 500})
    }

    function __next(ids, end_callback) {
        if (!$.isArray(ids)) {
            ids = [ids]
        }

        var msgFlow = [],
            msgIdFlow = [],
            next,
            stop = false,
            end = false,
            endMsg
        $.each(ids, function (k, id) {
            var msg = __msgMap[id]

            if (msg.stop) {
                stop = true
            }
            if (msg.end) {
                endMsg = msg
                end = true
            }
            msgIdFlow.push(id)
            msgFlow.push(msg)
            next = msg.next
        })

        __nextRender(msgFlow, msgIdFlow)

        if (!(stop || end)) {
            setTimeout(function () {
                __next(next, end_callback)
            }, 1000)
        }
        if (end) {
            typeof end_callback == 'function' && end_callback(endMsg)
        }
    }

    function __nextRender(msgFlow, msgIdFlow) {
        var optionFlow = [],
            optionIdFlow = []

        function _render() {
            if (!msgFlow.length) {
                return optionFlow && optionFlow.length && renderOptions(optionFlow, optionIdFlow)
            }

            var _msg = msgFlow.shift(),
                _msg_id = msgIdFlow.shift()

            if (_msg['option'] && !_msg['checked']) {
                optionFlow.push(_msg)
                optionIdFlow.push(_msg_id)
            }
            if (_msg['hidden']) {
                return _render()
            }
            renderMsg(_msg, _msg_id)

            setTimeout(_render, 1000)
        }

        _render()
    }

    function bindEvent() {
        tcb.bindEvent(document.body, {
            // 重新接受
            '.js-trigger-re-accept': function (e) {
                e.preventDefault()

                hideReject()
            },
            // 播放音频
            '.js-trigger-play-audio': function (e) {
                e.preventDefault()

                var $me = $(this),
                    $dot = $me.closest('.row-audio').find('.dot'),
                    sound_file = $me.attr('data-audio')

                $dot.css({visibility: 'hidden'})

                var soundInst = __soundInstMap[sound_file] || initSoundInst(sound_file)

                if (__soundInstPlaying) {
                    stopSound(__soundInstPlaying, function () {
                        __soundInstPlaying = soundInst
                        soundInst.play()
                    })
                } else {
                    __soundInstPlaying = soundInst
                    soundInst.play()
                }
            },
            // 选择option
            '.js-trigger-check-option': function (e) {
                e.preventDefault()

                var $me = $(this)
                if ($me.data('triggering')) {
                    return
                }
                $me.data('triggering', 1)

                if (__soundInstPlaying) {
                    stopSound(__soundInstPlaying)
                }

                var msg_id = parseInt($me.attr('data-msg-id'), 10) || undefined,
                    msg = __msgMap[msg_id]

                if (msg.is_answer) {
                    __checkedOptions.push(msg.text_option)
                }

                var $blockOption = $me.closest('.block-option')

                msg.stop = false
                msg.hidden = false
                msg.checked = true

                hideBlockOption($blockOption, function () {
                    $me.data('triggering', '')

                    __next(msg_id, function (endMsg) {

                        if (msg.reject) {
                            // 拒绝x2
                            showRejectImageGeneratingTips(function () {

                                showReject()

                                var $posterRejectHtml = $('#posterRejectHtml'),
                                    $posterRejectTarget = $('#posterRejectTarget')

                                __html2canvas($posterRejectHtml, $posterRejectTarget)

                                setTimeout(function () {
                                    $posterRejectTarget.show()

                                    resize($posterRejectTarget)

                                    $posterRejectHtml.closest('.block-poster-wrap').remove()

                                    hideRejectImageGeneratingTips()
                                }, 3000)
                            })
                        } else if (!endMsg.reject) {
                            getInterviewResult(function (res) {
                                showPositionGeneratingTips(function () {

                                    showPoster(res['role'], res['talk'])

                                    var $posterPositionHtml = $('#posterPositionHtml'),
                                        $posterPositionTarget = $('#posterPositionTarget')

                                    __html2canvas($posterPositionHtml, $posterPositionTarget)

                                    setTimeout(function () {
                                        $posterPositionTarget.show()

                                        resize($posterPositionTarget)

                                        $posterPositionHtml.closest('.block-poster-wrap').remove()

                                        hidePositionGeneratingTips()
                                    }, 3000)
                                })
                            })

                        }

                    })

                })

            },
            // 领取福利
            '.js-trigger-fuli':function (e) {
                e.preventDefault()

                var html_fn = $.tmpl($.trim($('#JsMApplePositionGetFuliPanelTpl').html())),
                    html_str = html_fn({})

                tcb.showDialog (html_str, {
                    className : 'ui-common-login-dialog',
                    withClose : true,
                    middle    : true
                })
            },
            // 提交表单
            '.ui-login-form':{
                'submit':function (e) {
                    e.preventDefault ()

                    var $form = $(this)
                    if(!validMobile($form)){
                        return
                    }

                    $.post ('/huodong/doSendYouHui', $form.serialize(), function (res) {

                        try{
                            if (!res[ 'errno' ]) {
                                $.dialog.toast('领取成功',3000)
                            } else {
                                $.dialog.toast('参与人数太多啦，请稍后再试',3000)
                            }
                            tcb.closeDialog()
                        } catch (ex){
                            $.dialog.toast('抱歉，数据错误，请稍后再试',3000)
                        }
                    })
                }
            }
        })
    }
    // 验证手机号
    function validMobile($form) {
        if (!($form && $form.length)) {
            return false
        }

        var flag = true

        var $mobile = $form.find ('[name="mobile"]'),
            mobile_val = $.trim ($mobile.val ())

        if (!tcb.validMobile (mobile_val)) {
            flag = false
            $.errorAnimate($mobile.focus ())
        }

        return flag
    }

    function showBlockOption($blockOption) {
        $blockOption = $blockOption || $('.block-option')

        var blockOptionHeight = $blockOption.height()

        $blockOption.css({
            visibility: 'hidden',
            transform: 'translateY(' + blockOptionHeight + 'px)',
            transition: ''
        })

        setTimeout(function () {
            $blockOption.css({
                visibility: 'visible',
                transform: 'translateY(0px)',
                transition: 'transform .5s ease-in-out'
            })
        }, 0)

        $('.mainbody-inner').css({
            'padding-bottom': blockOptionHeight + 'px'
        })

        $.scrollTo({endY: $('body').height(), duration: 500})
    }

    function hideBlockOption($blockOption, callback) {
        $blockOption = $blockOption || $('.block-option')

        var blockOptionHeight = $blockOption.height()

        $blockOption.css({
            transform: 'translateY(' + (blockOptionHeight + 1) + 'px)',
            transition: 'transform .5s ease-in-out'
        })

        var $mainbodyInner = $('.mainbody-inner')

        $mainbodyInner.css({
            'padding-bottom': '.0854rem',
            transition: 'padding-bottom .5s ease-in-out'
        })


        setTimeout(function () {
            $mainbodyInner.css({
                transition: ''
            })

            typeof callback == 'function' && callback()
        }, 600)
    }

    function showPoster(position, word) {
        var html_fn = $.tmpl($.trim($('#JsMApplePositionPosterTpl').html())),
            html_st = html_fn({
                avatar: __userAvatar[2],
                nickname: __userNickName,
                position: position,
                word: word
            })
        var $html_st = $(html_st)
        $html_st.appendTo('body')

        resize($html_st)
    }

    function showReject() {
        var html_fn = $.tmpl($.trim($('#JsMApplePositionRejectTpl').html())),
            html_st = html_fn({
                avatar: __userAvatar[2],
                nickname: __userNickName,
                text: '很遗憾Cook没有留住你<br>那么，从今天开始<br>两大巨头背道而驰',
                // word: '你对苹果的研究已经登峰<br>造极，咬一口是如此专业'
            })

        var $html_st = $(html_st)
        $html_st.appendTo('body')

        resize($html_st)
    }

    function resize($target) {
        var $inner = $target.find('.block-poster-inner'),
            inner_width = $inner.width(),
            inner_height = $inner.height(),
            ratio = inner_width / inner_height,
            win_width = $(window).width(),
            win_height = $(window).height(),
            win_ratio = win_width / win_height

        if (win_ratio > ratio) {
            $inner.css({
                transform: 'scale('+.95*ratio/win_ratio+')'
            })
        }
    }

    function hideReject() {
        $('.block-poster-reject').css({
            opacity: 0,
            transition: 'opacity .5s'
        }).one('transitionend', function (e) {
            $('.js-trigger-check-option').last().trigger('click')
            $(this).remove()
        })
    }

    function showRejectImageGeneratingTips(callback) {
        var html_st = '<div id="RejectImageGeneratingTips" class="row" style="height: 1rem; line-height: 1rem;justify-content: center; text-align: center;">职位生成中...</div>'

        $('.block-chat').append(html_st)

        $.scrollTo({endY: $('body').height(), duration: 500, callback: callback})
    }

    function hideRejectImageGeneratingTips() {
        $('#RejectImageGeneratingTips').remove()
    }

    function showPositionGeneratingTips(callback) {
        var html_st = '<div id="PositionGeneratingTips" class="row" style="height: 1rem; line-height: 1rem;justify-content: center; text-align: center;">职位生成中...</div>'

        $('.block-chat').append(html_st)

        $.scrollTo({endY: $('body').height(), duration: 500, callback: callback})
    }

    function hidePositionGeneratingTips() {
        $('#PositionGeneratingTips').remove()
    }

    function __html2canvas($html, $target) {
        //两个参数：所需要截图的元素id，截图后要执行的函数， canvas为截图后返回的最后一个canvas
        html2canvas($html[0], {
            scale: 2,
            useCORS: true
        }).then(function (canvas) {
            $target.append('<img src="' + canvas.toDataURL('image/png') + '" style="position: absolute; top:0; width: 100%;">')
        })
    }

    // 预加载
    function preload() {
        var preload_html = ''
        preload_html += '<link rel="preload" as="image" href="' + window.__HEADIMAGE + '">'
        tcb.each(__msgMap, function (k, item) {
            if(item.msg_type=='audio'){
                preload_html += '<link rel="preload" as="audio" href="' + item.text + '">'
            } else if(item.msg_type=='image'){
                if(item.option_image){
                    preload_html += '<link rel="preload" as="image" href="' + item.option_image + '">'
                } else {
                    preload_html += '<link rel="preload" as="image" href="' + item.text + '">'
                }
            }
        })
        $('head').append(preload_html)
    }

    function init() {
        preload()
        bindEvent()
        __next(0)

    }

    $(function () {
        init()
    })

}()

