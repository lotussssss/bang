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