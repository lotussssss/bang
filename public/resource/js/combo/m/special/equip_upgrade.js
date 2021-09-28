;/**import from `/resource/js/component/m/shareintro.js` **/
(function(){
    window.Bang = window.Bang || {};

    var __options = {
        hash: '',
        img: '',
        ext_html: ''
    };
    /**
     * 分享引导
     */
    function activeShareIntro(options){
        __options = options || {};

        var $share_intro = $('.m-fenxiang-intro-wrap');
        if (!$share_intro.length) {
            var html_str = '<div class="m-fenxiang-intro-wrap">'
                +'<a class="m-fenxiang-intro-bg" href="#"></a>'
                +'<div class="m-fenxiang-intro-inner">' +
                '<a class="m-fenxiang-intro" href="#">' +
                '<img class="w100" src="'+(__options.img ? __options.img : 'https://p.ssl.qhimg.com/t010deb0787edd39c10.png')+'" alt=""/>';

            if (__options&&__options['ext_html']){
                html_str += __options['ext_html'];
            }
            html_str += '</a> </div> </div>';

            var mask_h = $('body').height(),
                window_h = $(window).height();
            if (mask_h<window_h){
                mask_h = window_h;
            }

            var $html_str = $(html_str);
            $html_str.appendTo('body').css({
                'height': mask_h
            });

            setTimeout(function(){
                var mask_h = $('body').height(),
                    window_h = $(window).height();
                if (mask_h<window_h){
                    mask_h = window_h;
                }
                $html_str.css({
                    'height': mask_h
                });
            }, 1000);

            $share_intro = $('.m-fenxiang-intro-wrap');
        }

        $(window).scrollTop(0);


        var $mainbody = $('.mainbody');
        if( $mainbody && $mainbody.length ){
            $mainbody.addClass('blur');
        }

        $share_intro.show();
    }
    /**
     * 关闭分享弹层
     */
    function closeShareIntro(){
        var $intro = $('.m-fenxiang-intro-wrap');
        if ($intro.length) {
            $intro.remove();
        }

        var hash = __options['hash'] || '';
        if (hash) {
            var hashs = tcb.parseHash(window.location.hash);
            // hashs的kv对象中拥有此hash
            if ( typeof hashs[hash]!=='undefined' ) {
                delete hashs[hash];
            }

            window.location.hash = $.param(hashs)
        }

        var $mainbody = $('.mainbody');
        if( $mainbody && $mainbody.length ){
            $mainbody.removeClass('blur');
        }
    }

    function init(){

        tcb.bindEvent({
            // 关闭分享引导
            '.m-fenxiang-intro-bg, .m-fenxiang-intro': function(e){
                e.preventDefault();
                closeShareIntro();
            }

        });

    }
    init();

    window.Bang.ShareIntro = {
        active: activeShareIntro,
        close: closeShareIntro
    };
}());

;/**import from `/resource/js/mobile/special/2017/02/equip_upgrade.js` **/
// 开学季装备升级活动
;
!function () {
    var
        // 是否分享
        has_share = false,
        // 抽奖次数
        roll_count = 1,

        wxData = {
            "title"   : '开学季，装备升级好时机！',
            "desc"    : '同城帮助力开学季装备全面升级，学习娱乐两不误！',
            "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
            "imgUrl"  : 'https://p0.ssl.qhmsg.com/t01f566db2d8bc2e9aa.png',
            "success" : shareSuccess, // 用户确认分享的回调
            "cancel"  : tcb.noop // 用户取消分享
        }

    if (typeof wx !== 'undefined'){
        // 微信分享
        wx.ready ( function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage ( wxData )
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline ( wxData )
            //分享到QQ
            wx.onMenuShareQQ ( wxData )
        })
    }

    // 已登录用户分享成功
    function shareSuccess(){
        if (!has_share && roll_count<2){
            roll_count++
            has_share = true

            window.Bang.ShareIntro.close()
        }
    }

    $ (function () {

        //====================================
        // 处理抽奖转盘
        (function(){
            var
                $Lottery = $('.block-lottery'),
                $BonusCanvas = $Lottery.find('.canvas-lottery-bonus'),
                $BonusCellList = $Lottery.find('.lottery-cell-list'),
                $BonusCells = $BonusCellList.find('.cell'),
                $LuckBtn = $Lottery.find('.btn-get-my-luck'),

                cell_map = getCellMap(),
                // 奖品集合
                bonus_set = [
                    {
                        'id' : '0',
                        'name' : '谢谢参与',
                        'pos' : []
                    },
                    {
                        'id' : '1',
                        'name' : '优品112元优惠券',
                        'discount': '112',
                        'pos' : [0, 0, 164, 120]
                    },
                    {
                        'id' : '2',
                        'name' : '雷蛇鼠标',
                        'pos' : [0, 600, 164, 120]
                    },
                    {
                        'id' : '3',
                        'name' : '优品52元优惠券',
                        'discount': '52',
                        'pos' : [0, 0, 164, 120]
                    },
                    {
                        'id' : '4',
                        'name' : '雷蛇机械键盘',
                        'pos' : [0, 150, 164, 120]
                    },
                    {
                        'id' : '5',
                        'name' : '优品22元优惠券',
                        'discount': '22',
                        'pos' : [0, 0, 164, 120]
                    },
                    {
                        'id' : '6',
                        'name' : '品牌充电套装',
                        'pos' : [0, 300, 164, 120]
                    },
                    {
                        'id' : '7',
                        'name' : '优品12元优惠券',
                        'discount': '12',
                        'pos' : [0, 0, 164, 120]
                    },
                    {
                        'id' : '8',
                        'name' : 'Beats头戴耳机',
                        'pos' : [0, 450, 164, 120]
                    },
                    {
                        'id' : '9',
                        'name' : '优品212元优惠券',
                        'discount': '212',
                        'pos' : [0, 0, 164, 120]
                    }
                ],

                // roll选项
                roll_options = {
                    // 转动动画
                    easing : easeOutQuad,
                    // 转动周期
                    duration : 6000,
                    // 转动总圈数
                    turns: 8,

                    // 开始值（任意自然数，一般是开始的奖品id）
                    start: 0,

                    // 奖品数量
                    bonus_count : bonus_set.length
                }

            function init(){

                // 绘制奖励图
                drawBonusMap($BonusCanvas[0 ])
                // 绑定事件
                bindEvent()
            }
            init()

            // 绘制奖励图
            function drawBonusMap(canvas_dom){
                if (!canvas_dom.getContext){
                    return
                }
                tcb.imageOnload('https://p0.ssl.qhmsg.com/t01121260b6b4672169.png', function(img){

                    var
                        ctx = canvas_dom.getContext('2d')

                    //在给定矩形内清空一个矩形
                    ctx.clearRect (0, 0, 650, 351)

                    //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式
                    ctx.strokeStyle = "#666";

                    ctx.textBaseline = 'bottom'

                    var
                        text_font_size = 18,
                        text_font_family = 'sans-serif',//Microsoft YaHei
                        text_width, fill_x, fill_y

                    for(var i = 0; i < bonus_set.length; i++) {
                        // 遍历奖励列表

                        var
                            the_bonus = bonus_set[i ],
                            the_bonus_rect = getBonusRect(the_bonus['id'])

                        //改变画布文字颜色
                        if(i==0){
                            text_font_size = 32

                            ctx.fillStyle = "#cf1e24";
                        }else{
                            text_font_size = 18

                            ctx.fillStyle = "#666";
                        }

                        //font 属性设置或返回画布上文本内容的当前字体属性
                        ctx.font = text_font_size+'px '+text_font_family;

                        text_width = ctx.measureText (the_bonus[ 'name' ])[ 'width' ]
                        fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2
                        fill_y = i==0
                            ? the_bonus_rect[ 'top' ] + (the_bonus_rect[ 'height' ] + text_font_size) / 2
                            : the_bonus_rect[ 'top' ] + the_bonus_rect[ 'height' ] - 5

                        // 写奖品名称
                        ctx.fillText(the_bonus['name'], fill_x, fill_y)

                        // 画奖品图
                        if (the_bonus['pos']&&the_bonus['pos' ].length){

                            ctx.drawImage (img,
                                the_bonus[ 'pos' ][ 0 ],
                                the_bonus[ 'pos' ][ 1 ],
                                the_bonus[ 'pos' ][ 2 ],
                                the_bonus[ 'pos' ][ 3 ],
                                the_bonus_rect[ 'left' ],
                                the_bonus_rect[ 'top' ]-5,
                                the_bonus_rect[ 'width' ],
                                the_bonus[ 'pos' ][ 3 ] * (the_bonus_rect[ 'width' ] / the_bonus[ 'pos' ][ 2 ])
                            )
                        }

                        // 绘奖券
                        if (the_bonus['discount']){
                            ctx.fillStyle = "#cf1e24";
                            ctx.font = '18px '+text_font_family;
                            ctx.fillText('¥', the_bonus_rect[ 'left' ]+48, the_bonus_rect[ 'top' ]+35)
                            ctx.font = '34px '+text_font_family;
                            ctx.fillText(the_bonus['discount'], the_bonus_rect[ 'left' ]+60, the_bonus_rect[ 'top' ]+53)
                            ctx.font = '20px '+text_font_family;
                            ctx.fillText('优惠券', the_bonus_rect[ 'left' ]+48, the_bonus_rect[ 'top' ]+72)
                        }
                    }

                })
            }

            // 获取奖励格映射
            function getCellMap(){
                var
                    cell_map = []

                tcb.each($BonusCells, function(i, el){
                    var
                        $el = $(el),
                        data_id = $el.attr('data-id')
                    if (data_id!==''){
                        cell_map [parseInt(data_id, 10)||0] = $el
                    }
                })

                return cell_map
            }

            // 根据奖励id,获取奖励在图上的位置
            function getBonusRect(bonus_id){
                var
                    $cell = $BonusCells.filter('[data-id="'+bonus_id+'"]'),
                    cells_offset = $BonusCellList.offset(),
                    cell_offset = $cell.offset()

                var
                    top = cell_offset['top'] - cells_offset['top' ],
                    left = cell_offset['left'] - cells_offset['left' ],
                    width = $cell.width(),
                    height = $cell.height(),
                    screen_w = $(window).width(),
                    ratio = 720/screen_w

                // 当ratio小于1时，表示当前屏幕尺寸大于720px，那么ratio当做1来算，无比例缩放
                ratio = ratio < 1 ? 1 : ratio

                return {
                    top    : top * ratio,
                    left   : left * ratio,
                    width  : width * ratio,
                    height : height * ratio
                }
            }

            // 绑定事件
            function bindEvent(){

                // 点击抽奖
                $LuckBtn.on('click', function(e){
                    e.preventDefault()

                    if ($LuckBtn.hasClass('disabled')){
                        return
                    }

                    if (roll_count<1){
                        // 没有抽奖次数，直接返回

                        if (has_share){
                            // 已分享，并且抽奖次数为0，表示抽过了2次奖，
                            // 那么弹出抽过2次的提示框，其他情况弹出普通的toast提示

                            showRollEmptyPanel()
                        } else {

                            $.dialog.toast('您今天已经抽过奖啦，明天再试试吧', 2000)
                        }
                        return
                    }

                    $LuckBtn.addClass('disabled')

                    // 抽奖
                    rollBonusAtRemote(function(res){

                        var
                            bonus_id = parseInt(res['result']['prize_id'], 10) //parseInt(Math.random()*10, 10)

                        rollBonus(bonus_id, function(temp_bonus_id){

                            $BonusCells.removeClass ('cur')
                            cell_map[ temp_bonus_id ].addClass ('cur')

                        }, function(){
                            roll_count--

                            var
                                the_bonus = bonus_set[bonus_id],
                                the_bonus_name = the_bonus['name']

                            if (bonus_id){
                                // 中奖id大于0，表示有中奖

                                showBingoPanel(the_bonus_name, res['result']['desc'] || '')
                            }

                            $LuckBtn.removeClass('disabled')
                        })

                    }, function(res){

                        if (res['errno']){

                            $LuckBtn.removeClass('disabled')
                        }
                    })

                })
            }

            // 从服务器roll奖品
            function rollBonusAtRemote(success, done){
                var
                    params = {}

                if (has_share){
                    // 已分享朋友圈

                    params['share'] = 1
                }

                $.post('/youpin/doLotterySpringKXJ', params, function (res) {

                    res = $.parseJSON(res)

                    if (!res['errno']){
                        typeof success==='function' && success(res)
                    } else {
                        if (res['errno']==10710){
                            // 未登录，弹出登录框，提示登录

                            showLoginPanel()

                        } else {

                            $.dialog.toast(res['errmsg'], 2000)
                        }
                    }
                    typeof done==='function' && done(res)
                })
            }

            // 转取奖品
            function rollBonus(bonus_id, callback, done){
                var
                    options = roll_options,

                    timer_start = 0,
                    // 时钟速度
                    timer_speed = 10,

                    // 奖品总数
                    bonus_count = options.bonus_count,

                    // 奖品总数
                    easing = typeof options.easing === 'function' ? options.easing : easeOutQuad,

                    // 转动开始位置
                    start = options.start,
                    // 转动周期
                    duration = options.duration,
                    // 总圈数
                    turns = options.turns,

                    // 基于start的增量值
                    increment = bonus_count*turns

                // 加上目标id，和起始位置奖品id的差值（可能正，也可能负），计算出最终位置
                increment = Math.round( increment + (bonus_id - start % bonus_count) )

                // 更新起始位置，为下一轮抽奖做准备。。
                options.start += increment

                setTimeout (function r_fn () {

                    var
                        current_value = easing (timer_start, start, increment, duration)

                    // 取整
                    current_value = Math.round (current_value)

                    // 取余，获取当前定位的bonus的id
                    var
                        temp_bonus_id = current_value % bonus_count

                    typeof callback === 'function' && callback(temp_bonus_id)

                    timer_start += timer_speed

                    if (timer_start < duration) {
                        setTimeout (r_fn, timer_speed)
                    } else {
                        typeof done === 'function' && done(temp_bonus_id)
                    }

                }, timer_speed)
            }

            // roll动画函数
            // t：currentIteration,
            // b：startValue,
            // c：changeInValue,
            // d：totalIterations
            function easeOutQuad(t, b, c, d) {
                return -c *(t/=d)*(t-2) + b;
            }

        }())


        //====================================
        // 显示登录面板
        function showLoginPanel () {

            var
                html_fn = $.tmpl (tcb.trim ($ ('#JsM201612XmasLoginPanel').html ())),
                html_st = html_fn ()

            var
                dialog = tcb.showDialog (html_st, {
                    className : 'xmas-panel xmas-login-panel',
                    withClose : true,
                    middle    : true
                }),
                $form = dialog.wrap.find ('form')

            dialog.wrap.prepend('<div class="xmas-panel-bottom"></div>')

            bindEventLoginForm ($form)

        }
        // 关闭登录面板
        function closeLoginPanel(){

            tcb.closeDialog()
        }
        // 绑定登录表单事件
        function bindEventLoginForm($form){

            // 提交获取优惠券表单
            $form.on('submit', function(e){
                e.preventDefault()

                var
                    $form = $(this)
                if (!validFormLogin($form)){
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
                        }

                        closeLoginPanel()

                        $('.block-lottery .btn-get-my-luck').trigger('click')

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

                getSMSCode ({
                    'user_mobile' : $.trim($mobile.val ()),
                    'secode' : $.trim($secode.val ())
                }, function (data) {
                    $me.addClass ('btn-get-sms-code-disabled').html ('发送成功')
                    setTimeout(function(){

                        $me.html ('60秒后再次发送')

                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $me.removeClass ('btn-get-sms-code-disabled').html ('发送验证码')
                            } else {
                                $me.html (time + '秒后再次发送')
                            }
                        })

                    }, 1000)

                })
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
        // 验证登录表单
        function validFormLogin ($Form) {
            var
                flag = true

            if (!($Form && $Form.length)) {
                flag = false
            } else {

                var
                    $mobile = $Form.find ('[name="user_mobile"]'),
                    // 图像验证码
                    $secode = $Form.find ('[name="secode"]'),
                    // 短信验证码
                    $smscode = $Form.find ('[name="sms_code"]'),

                    mobile = $.trim ($mobile.val ()),
                    secode = $.trim ($secode.val ()),
                    smscode = $.trim ($smscode.val ())

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
        // 验证优惠码表单
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
                        return $.dialog.toast (res[ 'errmsg' ], 2000)
                    }
                    typeof callback === 'function' && callback (res[ 'result' ])
                },
                error    : function () {
                    typeof error === 'function' && error ()
                }
            })
        }

        //====================================
        // 显示中奖面板
        function showBingoPanel(bonus_name, desc){
            var
                html_fn = $.tmpl (tcb.trim ($ ('#JsM201612XmasBingoPanel').html ())),
                html_st = html_fn ({
                    bonus_name : bonus_name,
                    desc : desc,
                    show_btn: (has_share && roll_count<1) ? false : true
                })

            var
                dialog = tcb.showDialog (html_st, {
                    className : 'xmas-panel xmas-bingo-panel',
                    withClose : true,
                    middle    : true
                })

            dialog.wrap.prepend('<div class="xmas-panel-bottom"></div>')

            bindEventBingo (dialog.wrap)
        }
        // 关闭中奖面板
        function closeBingoPanel(){

            tcb.closeDialog()
        }
        // 绑定中奖界面事件
        function bindEventBingo($wrap){
            $wrap.find('.btn').on('click', function(e){
                e.preventDefault()

                closeBingoPanel()

                if (tcb.isWeChat){
                    // 微信中触发显示分享引导

                    showShareIntro()
                } else {
                    $.dialog.toast('请在微信中分享再抽奖', 2000)
                }
            })
        }
        // 触发显示分享引导
        function showShareIntro(){
            // 触发显示分享引导
            window.Bang.ShareIntro.active({
                img : 'https://p.ssl.qhimg.com/t01c5d992454e4a99d1.png',
                ext_html: '<div style="padding-top:.1rem;font-size: .14rem;text-align: center;color: #fff;">分享至好友群或朋友圈<br/>立即再抽一次</div>'
            })
        }


        //====================================
        // 显示抽奖次数用光
        function showRollEmptyPanel(){
            var
                html_fn = $.tmpl (tcb.trim ($ ('#JsM201612XmasRollEmptyPanel').html ())),
                html_st = html_fn ()

            var
                dialog = tcb.showDialog (html_st, {
                    className : 'xmas-panel xmas-roll-empty-panel',
                    withClose : true,
                    middle    : true
                })

            dialog.wrap.prepend('<div class="xmas-panel-bottom"></div>')

            bindEventRollEmpty (dialog.wrap)
        }
        // 关闭中奖面板
        function closeRollEmptyPanel(){

            tcb.closeDialog()
        }
        // 绑定中奖界面事件
        function bindEventRollEmpty($wrap){
            $wrap.find('.btn').on('click', function(e){
                e.preventDefault()

                closeRollEmptyPanel()
            })
        }


        //====================================
        // 获取中奖列表信息
        function getLotteryTopList(){

            $.get ('/youpin/doGetLotteryTopList', function (res) {
                res = $.parseJSON (res)

                if (!res[ 'errno' ] && res['result'] && res['result' ].length) {

                    var
                        html_st = ''

                    for(var i=0;i<res['result' ].length;i++){
                        html_st += '<div class="item"><span>●</span>'+res['result'][i]+'</div>'
                    }

                    var
                        $list = $('.block-lottery-bingo-list'),
                        $inner = $list.find('.inner')

                    $inner.html(html_st)

                    var
                        h = $inner.find('.item').eq(0).height()

                    setTimeout(function(){
                        var arg = arguments;
                        $inner.animate({'top': -h}, 800, function(){
                            $inner.find('.item').eq(0).appendTo($inner)

                            $inner.css({'top': 0})

                            setTimeout(arg.callee, 2000)
                        })
                    }, 2000)

                }
            })
        }
        getLotteryTopList()

        //====================================
        //通用输出模板变量
        function getProduct(obj) {
            $.get(obj.request_url,function (res) {
                try {
                    res = $.parseJSON(res);

                    if (!res['errno']) {

                        var product_list =res['result']['product_list'] || res['result']['good_list'] || res['result']['flash_list'] || res['result'];
                        // 限制显示商品数量
                        product_list.splice(parseInt(obj.num, 10), 9999);

                        // 获取商品列表的html字符串
                        obj.com_price_tit = obj.com_price_tit || '新机价：';
                        obj.price_tit = obj.price_tit || '优品价';

                        var html_fn = $.tmpl($.trim(obj.$tpl.html())),
                            html_str = html_fn({
                                'list': product_list,
                                'is_flash': obj.is_flash,
                                'huodong_name': 'equip_updata',
                                'com_price_tit':obj.com_price_tit,
                                'price_tit':obj.price_tit/*,
                                 'pn':obj.request_data.pn*/
                            });

                        $.each(product_list, function (item, i) {
                            tcb.preLoadImg(item['thum_img']);
                        });
                        // 输出数据  判断是追加还是替换
                        if (obj.is_append) {
                            obj.$target.append(html_str);
                        } else {
                            obj.$target.html(html_str);
                        }

                        setTimeout(function () {
                            tcb.lazyLoadImg({
                                'delay': 0,
                                'interval': 300 // 0:同时显示，其他时间表示实际时间间隔
                            }, obj.$target);
                        }, 300);
                        typeof obj['callback'] === 'function' && obj['callback'](obj.$target, product_list,obj.request_data)

                    } else {

                    }

                } catch (ex) {
                }

            });

        }

        //  ------------------秒杀部分----------------
        function countDownTime(product_list){
            var current_time = window.CURRENT_TIME || Date.now();
            //取出开始时间和结束时间
            $('.countdown').each(function (i, item) {
                var  target_time,
                    $me = $(this);
                var start_time = product_list[i]['flash_start_time'].replace(/-/g, '/'),
                    end_time = product_list[i]['flash_end_time'].replace(/-/g, '/');

                start_time = (new Date(start_time)).getTime();
                end_time = (new Date(end_time)).getTime();


                if(current_time<start_time) {
                    target_time = start_time;
                    $me.attr('data-descbefore','距开始');

                }else if (current_time>start_time && current_time<end_time) {
                    target_time = end_time;
                    $me.attr('data-descbefore','距结束');
                }else if (current_time>end_time){
                    $me.hide()
                    $me.closest('a').append('<div class="btn-qiang btn-disabled"></div>');
                    return;
                }
                $Target = $(this);

                // 开启倒计时
                Bang.startCountdown(target_time, current_time,$Target, {
                    start: function(){
                        // 倒计时开始前
                    },
                    process: function(current_time){
                        // 倒计时ing
                    },
                    end: function(){
                        // 倒计时结束
                        // do something at end
                        countDownTime();
                    }
                })
            })
        }

        var ms_ok = false;//用于tab栏计算距上部的高度
        getProduct ({
            'request_url' : '/youpin/doGetFlashSaleGoods',
            '$tpl'        : $("#JsMProductListVer17Tpl"),
            'is_flash'    : true,
            'num'         : 4,
            '$target'     : $(".js-ms-product-list"),
            callback:function ($target,product_list){
                countDownTime(product_list);
                ms_ok = true
            }
        });


        //  ------------------手机部分----------------
        var phone_url_list = {
            'chumen':{
                'tpl_target_name': '.js-phone-chumen-product-list',
                'url_name': '/youpin/aj_get_goods?pn=0&not_brands=50,57&price=500',
                'num':4
            },
            'zhongqi':{
                'tpl_target_name': '.js-phone-zhongqi-product-list',
                'url_name': '/youpin/aj_get_goods?pn=0&not_brands=50,57&price=1500',
                'num':4
            },
            'shen':{
                'tpl_target_name': '.js-phone-shen-product-list',
                'url_name': '/youpin/aj_get_goods?pn=0&not_brands=50,57&price=3000',
                'num':6
            }
        }
        //循环输出手机部分
        for(var key in phone_url_list){

            getProduct ({
                // 'request_url' : phone_url_list[key]['url_name'],
                // '$tpl'        :  $("#JsProductListVer17Tpl"),
                // 'is_flash'    : false,
                // 'num'         : phone_url_list[key]['num'],
                // '$target'     : $(phone_url_list[key]['tpl_target_name'])

                'request_url' : phone_url_list[key]['url_name'],
                '$tpl'        : $("#JsMProductListVer17Tpl"),
                'is_flash'    : false,
                'num'         : phone_url_list[key]['num'],
                '$target'     : $(phone_url_list[key]['tpl_target_name'])
            });
        }
        //  ------------------电脑部分----------------
        //电脑部分使用一个接口  请求回的数据需要改造
        function getProductForComputer (obj) {

            $.get (obj.request_url, function (res) {
                try {
                    res = $.parseJSON (res);

                    if (!res[ 'errno' ]) {
                        var product_all = {
                            'product_chumen_list' : {'list':res['result']['chumen'],'target':'.js-computer-chumen-product-list'},
                            'product_zhongqi_list' : {'list':res['result']['zhongqi'],'target':'.js-computer-zhongqi-product-list'},
                            'product_shen_list' : {'list':res['result']['shen'],'target':'.js-computer-shen-product-list'}
                        }
                        //循环输出电脑各个block
                        for(var key in product_all){
                            var product_list = product_all[key]['list']
                            // 限制显示商品数量
                            product_list.splice (parseInt (obj.num, 10), 9999);

                            // 获取商品列表的html字符串
                            var html_fn = $.tmpl ($.trim (obj.$tpl.html ())),
                                html_str = html_fn ({
                                    'list'     : product_list,
                                    'is_flash' : obj.is_flash,
                                    'huodong_name' : 'equip_updata',
                                    'com_price_tit': obj.com_price_tit,
                                    'price_tit': obj.price_tit
                                });

                            $.each (product_list, function (item, i) {
                                tcb.preLoadImg (item[ 'thum_img' ]);
                            });
                            // 输出数据
                            $(product_all[key]['target']).html (html_str);

                            typeof obj[ 'callback' ] === 'function' && obj[ 'callback' ] (obj.$target,product_list)
                        }
                        setTimeout (function () {
                            tcb.lazyLoadImg ({
                                'delay'    : 0,
                                'interval' : 300 // 0:同时显示，其他时间表示实际时间间隔
                            }, $('.computer_block'));
                        }, 300);
                    } else {

                    }

                } catch (ex) {}

            });

        }
        getProductForComputer ({
            // 'request_url' : '/youpin/doGetKxsjDell',
            // '$tpl'        :  $("#JsProductListVer17Tpl"),
            // 'is_flash'    : false,
            // 'num'         : 10,
            'com_price_tit':'新机价：',
            'price_tit':'优品价',
            'request_url' : '/youpin/doGetKxsjDell',
            '$tpl'        : $("#JsMProductListVer17Tpl"),
            'is_flash'    : false,
            'num'         : phone_url_list[key]['num'],
            // '$target'     : $(phone_url_list[key]['tpl_target_name'])
        });
        //  -----------------tab栏部分-----------------

        var $block_tab = $('.block-tab'),
            $tab_h = $block_tab.height(),//tab高度
            $win_h = $(window).height();//网页工作区域的高度
        var $phone_block = $('.phone_block')

        //tab栏吸顶   由于上面有秒杀部分的异步加载，需要等待加载完成再获取tab部分距顶部的高度
        var _timer = setInterval(function () {
            if(ms_ok){
                clearInterval(_timer)
                var  $tab_t = $block_tab.offset().top;//tab距上部的高度
                $(window).on('scroll reload',function () {
                    var $win_t = $(window).scrollTop();//网页被卷起来的高度
                    if($win_t>$tab_t){
                        $block_tab.addClass('fixed-flag')
                        $phone_block.css('margin-top',$tab_h)
                    }else {
                        if($block_tab.hasClass('fixed-flag')){
                            $block_tab.removeClass('fixed-flag')
                        }
                        $phone_block.css('margin-top',0)
                    }
                })
            }
        },500)
        //tab栏切换
        $block_tab.on('click','a',function (e) {
            // e.preventDefault()
            var $me = $(this);
            var $others=$me.parent().siblings().children('a')
            $me.addClass('cur')
            $others.removeClass('cur')
        })


    })
} ()