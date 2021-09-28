;(function () {

    var Root = tcb.getRoot()

    var default_options = {
        startSlide: 0,
        speed: 400,
        auto: 1000,
        continuous: true,
        disableScroll: false,
        stopPropagation: false,
        callback: function(index, elem) {},
        transitionEnd: function(index, elem) {}
    }

    function SwipeFactory($container,options) {
            if(!$container || $container.length == 0){
                $container = $container || $('#swipe-container')
            }
        var
            container = $container[0],
            options = tcb.mix(default_options, options),
            $swipe_items = $container.find('.swipe-item'),
            $swipe_nav = $container.find('.swipe-nav'),
            origin_cb = options.callback

        //增加小点点
        function addSwipeNavItem(cb){
            if(!$swipe_nav || $swipe_nav.length == 0) return;
            var
                nav_items_len = $swipe_items.length,
                nav_items_str = ''

            for(var i=0; i<nav_items_len; i++){
                nav_items_str+= '<span class="swipe-nav-item"></span>'
            }
            $swipe_nav.html(nav_items_str)


            typeof cb === 'function' && cb(nav_items_len)
        }


        function new_cb(index, elem){
            //先执行外面传进来的callback，再添加其他操作
            origin_cb(index, elem)
            changeCurNavItem(index)
        }

        function changeCurNavItem(index){
            var $nav_items = $('.swipe-nav-item')
            if($nav_items.hasClass('active')){
                $nav_items.removeClass('active')
            }
            $($nav_items[index]).addClass('active')
        }


        return function init(){
            addSwipeNavItem(function(len){
                if(len !==1){
                    //如果点点的数量超过1 改变swipe 的callback
                    options.callback = new_cb
                }
            })

            return new Swipe(container, options)
        }()
    }

    Root.SwipeFactory = Root.SwipeFactory || SwipeFactory
})()