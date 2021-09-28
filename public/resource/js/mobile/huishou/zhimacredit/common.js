$(function(){
    // 用户评价滚动
    var $userCommentListWrap = $('.user-comment-list-wrap')
    if ($userCommentListWrap && $userCommentListWrap.length){
        window.Bang.slide($userCommentListWrap)
    }


})