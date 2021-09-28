/**
 * 移动页面基本管理
 * @return {[type]} [description]
 */
var mHuishou = (function () {
    function setPageTitle(tit) {
        $('#pageTitle').html(tit || '')
    }

    function setBackEvent(callback) {
        callback && ($('#hsheader .page-back').one('click', callback))
    }

    function hidePageBack() {
        $('#hsheader .page-back').hide()
    }

    function showPageBack() {
        $('#hsheader .page-back').show()
    }

    function showFooter() {
        $('#hsfooter').show()
    }

    function hideFooter() {
        $('#hsfooter').hide()
    }

    function scrollIntoView(obj) {
        var stop = $(obj).offset().top - $('#hsheader').height() - 6
        $(window).scrollTop(stop)
    }

    return {
        setPageTitle: setPageTitle,
        setBackEvent: setBackEvent,
        showPageBack: showPageBack,
        hidePageBack: hidePageBack,
        showFooter: showFooter,
        hideFooter: hideFooter,
        scrollIntoView: scrollIntoView
    }

})()

$(function () {
    $('.js-trigger-m-hs-page-back').on('click', function (e) {
        e.preventDefault()
        window.history.go(-1)
    })
})
