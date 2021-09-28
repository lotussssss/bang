$(function () {
    // 获取中奖列表信息
    function getLotteryTopList(){
        var
            $list = $('.block-user-of-prize-list')
        if (!($list && $list.length)){
            return
        }

        $.get ('/m/doGetUsersOfPrize', function (res) {
            res = $.parseJSON (res)


            if (!res[ 'errno' ] && res['result'] && res['result' ].length) {

                var
                    html_st = ''

                for(var i=0;i<res['result' ].length;i++){
                    html_st += '<div class="item"><span></span>用户&nbsp;'+res['result'][i]['phone']+'抽中了<span >'+res['result'][i]['amount']+'</span>元现金红包！</div>'
                }

                var
                    $inner = $list.find('.inner')

                $inner.html(html_st)

                // $('.block-user-of-prize-list').css('display','block')

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
})
