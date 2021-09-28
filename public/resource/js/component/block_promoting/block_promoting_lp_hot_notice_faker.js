Dom.ready(function(){
    var wBlock=  W('.block-promoting-lp-hot-notice-faker')
    if (!(wBlock&& wBlock.length)){
        return
    }

    wBlock.show()

    var wInner = wBlock.query('.block-promoting-lp-hot-notice-faker-inner')

    function __show(){
        wInner.animate({
            'top': '-340px'
        }, 500)
    }

    function __close(){
        wInner.animate({
            'top': '0'
        }, 500, function(){

            wBlock.removeNode()
        })
    }

    __show()

    tcb.bindEvent(wBlock[0], {
        '.btn-close': function(e){
            e.preventDefault()

            __close()
        },
        '.item-figure': {
            'mouseenter': function(e){
                var wMe = W(this)

                wMe.css({
                    'background-size': '120%'
                })
            },
            'mouseleave': function(e){
                var wMe = W(this)

                wMe.css({
                    'background-size': '100%'
                })
            }
        }
    })

})