// 滑动slide
(function () {

    window.Bang = window.Bang || {}

    var
    //============ 选择器 ============
    // 滑动模块最外层容器
    selector_wrap = '.slide-shower-wrap',
    // 滑动单元块
    selector_item = '.s-item',
    // 滑动导航标识点
    selector_nav = '.slide-nav',
    // 向左
    selector_go_left = '.slide-go-left',
    // 向右
    selector_go_right = '.slide-go-right',


    //============ 元素类class ============
    class_nav_cur = 'cur',
    class_item_hide = 's-item-hide',

    //============ 参数标识 ============
    // 隐藏nav
    data_hide_nav = 'data-hidenav',
    // 是否有滑动尾部(即不连续滑动)
    data_has_end = 'data-has-end',
    // 是否自动滑动
    data_auto = 'data-auto',
    // 开始位置
    data_start = 'data-start',
    // 滑动速度
    data_speed = 'data-speed'

    /**
     * 开启滑动功能
     * @param $slideWrap
     */
    function slide ( $slideWrap , callback) {
        var
            objSwipe = null

        $slideWrap = $slideWrap || $ ( selector_wrap );

        if ( !$slideWrap.length ) {
            return;
        }

        var
            $sitem = $slideWrap.find ( selector_item )
        if ( !$sitem.length ) {
            return;
        }

        var
            params = {
                hide_nav   : parseInt ( $slideWrap.attr ( data_hide_nav ), 10 ) || 0,
                auto       : parseInt ( $slideWrap.attr ( data_auto ), 10 ) || 0,
                startSlide : parseInt ( $slideWrap.attr ( data_start ), 10 ) || 0,
                speed      : parseInt ( $slideWrap.attr ( data_speed ), 10 ) || 400,
                continuous : !(parseInt ( $slideWrap.attr ( data_has_end ), 10 ) || 0)
            }

        // nav处理
        var
            $nav = $slideWrap.find ( selector_nav ),
            $nitem;
        if ( $nav.length ) {
            // 隐藏nav
            if ( params[ 'hide_nav' ] ) {
                $nav.hide ();
            }
            $nitem = $nav.children ();

            if ( !$nitem.length ) {
                var nav_item_str = '';
                for ( var i = 0; i < $sitem.length; i++ ) {
                    nav_item_str += i == 0 ? '<span class="' + class_nav_cur + '"></span>' : '<span></span>';
                }
                $nitem = $ ( nav_item_str ).appendTo ( $nav );
            }
        }
        // 滑动item数大于1个才有滑动效果
        if ( $sitem.length > 1 ) {
            $sitem.removeClass ( class_item_hide );
            //console.log ( params.continuous )

            // 初始化slide滑动
            objSwipe = Swipe ( $slideWrap[ 0 ], {
                startSlide      : params[ 'start' ],
                speed           : params[ 'speed' ],
                auto            : params[ 'auto' ],
                continuous      : params[ 'continuous' ],
                disableScroll   : false,
                stopPropagation : false,
                callback        : function ( index, element ) {

                    if ( $nitem && $nitem.length ) {
                        if ( $nitem.length < 3 && this.continuous ) {
                            $nitem.removeClass ( class_nav_cur ).eq ( index % $nitem.length ).addClass ( class_nav_cur );
                        }
                        else {
                            $nitem.removeClass ( class_nav_cur ).eq ( index ).addClass ( class_nav_cur );
                        }
                    }

                    typeof callback=='function' && callback()
                },
                transitionEnd   : function ( index, element ) {

                    // 设置左右滑动按钮初始化
                    setGoBtnStatus ()
                }
            } )

            // 设置左右滑动按钮初始化
            setGoBtnStatus ()

            var
            // 向左滑动按钮
            $GoLeft = $slideWrap.find ( selector_go_left ),
            // 向右滑动按钮
            $GoRight = $slideWrap.find ( selector_go_right )

            // 向左滑动
            $GoLeft.on ( 'click', function ( e ) {
                e.preventDefault ()

                objSwipe.next ()

            } )

            // 向右滑动
            $GoRight.on ( 'click', function ( e ) {
                e.preventDefault ()

                objSwipe.prev ()

            } )

            /**
             * 设置左右滑动按钮的状态
             */
            function setGoBtnStatus () {
                var
                // 向左滑动按钮
                $GoLeft = $slideWrap.find ( selector_go_left ),
                // 向右滑动按钮
                $GoRight = $slideWrap.find ( selector_go_right ),
                // 当前位置
                cur_pos = objSwipe.getPos (),
                // 所有数量
                all_num = objSwipe.getNumSlides ()

                if ( !($GoLeft.length && $GoRight.length) ) {
                    return
                }

                if ( cur_pos == 0 ) {
                    $GoRight.hide ()
                    $GoLeft.show ()
                }
                else if ( cur_pos == (all_num - 1) ) {
                    $GoRight.show ()
                    $GoLeft.hide ()
                }
                else {
                    $GoRight.show ()
                    $GoLeft.show ()
                }

            }
        }

        return objSwipe
    }


    //====================== Export ========================
    window.Bang.slide = slide

} ())