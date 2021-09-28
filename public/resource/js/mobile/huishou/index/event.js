// 绑定事件
!function (global) {
    var
        Root = tcb.getRoot (),
        i = Root.Index

    i.eventMap = {
        modelList : eventModelList
    }

    // 添加event到page

    i.event = {}

    tcb.mix (i.event, {

        init : initEvent

    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    function initEvent () {
        var $SearchForm =$('#brandSearchForm')

        // 搜索机型
        $SearchForm.on('submit', function(e){
            e.preventDefault()

            var $form = $(this),
                $keyword = $form.find('[name="keyword"]'),
                keyword = $.trim($keyword.val())

            if (!keyword){
                $.errorAnimate($keyword)

                setTimeout(function(){
                    $keyword.focus()
                }, 10)
                return
            }

            // 使用keyword前必须encode以下，
            // 避免iPhone的webview对于url中带中文时的解析错误问题
            i.router_inst.go('!/search/'+encodeURIComponent(keyword))
        })

        // 返回
        $SearchForm.find('.icon-back2').on('click', function(e){
            e.preventDefault()

            window.history.go(-1)
        })

        //用户评价滚动
        hotCommentSlide()
    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    function eventModelList () {

    }
    function hotCommentSlide(){
        // 用户评价滚动
        var $userCommentListWrap = $('.user-comment-list-wrap')
        if ($userCommentListWrap && $userCommentListWrap.length){
            window.Bang.slide($userCommentListWrap)
        }
    }

} (this)