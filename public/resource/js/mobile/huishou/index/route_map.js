!function (global) {
    var
        Root = tcb.getRoot (),
        i = Root.Index

    i.route_map = {
        /**
         * 首页
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!' : function (route_inst, route, direction, url, request) {
            $('.block-sn-xd-912j').show()
            __setKeywordStatus ('')
            __setRecycleCateStatus('1')

            __renderBrandList('1')

            // 设置无品牌被选中的状态
            __setBrandNoneSelected()

            // 禁止scroll y轴移动 并设置container高度
            // if(window['__SHOW_INDEX_HOT_MODEL']){
            //     setTimeout(function () {
            //         var $brand_container = i.handle.getBrandContainer(),
            //             $brand_inner = i.handle.getBrandInner(),
            //             brand_scroller = i.handle.getBrandScrollInst()
                        // $items = $brand_inner.find('.item'),
                        // brand_inner_height= (Math.ceil($items.length/3))*$items.height()

                    // brand_scroller.options.scrollingY = false
                    // $brand_container.height(brand_inner_height)
                    // i.handle.setBrandScrollY(false)
                // },1)
            // }
            i.handle.setBrandScrollY(false)
        },

        /**
         * 进入品牌页，获取品牌机型列表
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/brand/:brand_id' : function (route_inst, route, direction, url, request) {
            __setKeywordStatus ('')
            __setRecycleCateStatus('1')

            __renderBrandList('1')

            var _global_data = i.data.url_query['_global_data'] || {}
            var pad = _global_data['pad']

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : {
                    step     : 0,
                    brand_id : request[ 'brand_id' ],
                    pad      : pad
                },
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'modelList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    __setBrandStatus (request[ 'brand_id' ])

                    // 设置有品牌被选中的状态
                    __setBrandHasSelected()

                    __setModelListStatus ($The, '80%')

                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {
                        var
                            $Item = $Enter.find ('.item').eq (0)

                        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())

                    })
                }
            }, true)

            // 恢复scroll y轴移动 并设置container高度
            // if(window['__SHOW_INDEX_HOT_MODEL']){//对非江苏移动页面进行处理
            //     var $brand_container = i.handle.getBrandContainer(),
            //         brand_scroller = i.handle.getBrandScrollInst()
                // $brand_container.height('auto')
                // brand_scroller.options.scrollingY = true
                // i.handle.setBrandScrollY(true)
            // }
            i.handle.setBrandScrollY(true)

        },

        /**
         * 选中机型大类，展示机型子类
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/brand/:brand_id/pid/:model_id' : function (route_inst, route, direction, url, request) {

            __setKeywordStatus ('')
            __setRecycleCateStatus('1')

            __renderBrandList('1')

            var _global_data = i.data.url_query['_global_data'] || {}
            var pad = _global_data['pad']

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : {
                    step     : 1,
                    brand_id : request[ 'brand_id' ],
                    model_id : request[ 'model_id' ],
                    pad      : pad
                },
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'modelList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    __setBrandStatus (request[ 'brand_id' ])

                    // 设置有品牌被选中的状态
                    __setBrandHasSelected()

                    __setModelListStatus ($The, '80%')

                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {
                        var
                            $Item = $Enter.find ('.item').eq (0)

                        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())

                    })
                }
            }, true)

            i.handle.setBrandScrollY(true)
        },

        /**
         * 搜索列表
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/search/:keyword' : function (route_inst, route, direction, url, request) {

            __setKeywordStatus (request[ 'keyword' ])
            __setRecycleCateStatus()

            var $SearchForm = $('#brandSearchForm')
            var data = tcb.queryUrl($SearchForm.serialize())
            var show_index_recycle_cate = window.__SHOW_INDEX_RECYCLE_CATE || []
            if (!data.category_id && show_index_recycle_cate.length === 1) {
                data.category_id = show_index_recycle_cate[0]
            }

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : data,
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'searchList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    __setBrandStatus ('', true)

                    __setModelListStatus ($The, '100%')

                    i.handle.resetBrandListScrollDimension()
                    //setTimeout (i.handle.resetBrandListScrollDimension, 500)

                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {
                        var
                            $Item = $Enter.find ('.item').eq (0)

                        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())

                    })
                }
            }, true)
        },

        /**
         * 笔记本回收
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/notebook/brand/:brand_id' : function (route_inst, route, direction, url, request) {

            __setKeywordStatus ('')
            __setRecycleCateStatus('10')

            __renderBrandList('10')

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : {
                    step     : 0,
                    brand_id : request[ 'brand_id' ] || 10
                },
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'notebookList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    // __setBrandStatus ('', true)
                    //
                    // __setModelListStatus ($The, '100%')

                    __setBrandStatus (request[ 'brand_id' ])
                    // 设置有品牌被选中的状态
                    __setBrandHasSelected()

                    __setModelListStatus ($The, '80%')


                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {
                        var
                            $Item = $Enter.find ('.item').eq (0)

                        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())

                    })
                }
            }, true)

            i.handle.setBrandScrollY(true)
        },
        /**
         * 笔记本回收
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/notebook/brand/:brand_id/pid/:model_id' : function (route_inst, route, direction, url, request) {

            __setKeywordStatus ('')
            __setRecycleCateStatus('10')

            __renderBrandList('10')

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : {
                    step     : 1,
                    brand_id : request[ 'brand_id' ] || 10,
                    model_id : request[ 'model_id' ]
                },
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'notebookList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    // __setBrandStatus ('', true)
                    //
                    // __setModelListStatus ($The, '100%')

                    __setBrandStatus (request[ 'brand_id' ])
                    // 设置有品牌被选中的状态
                    __setBrandHasSelected()

                    __setModelListStatus ($The, '80%')

                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {
                        var
                            $Item = $Enter.find ('.item').eq (0)

                        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())

                    })
                }
            }, true)

            i.handle.setBrandScrollY(true)
        },
        /**
         * 笔记本回收
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/whitegoods' : function (route_inst, route, direction, url, request) {

            __setKeywordStatus ('')
            __setRecycleCateStatus('20')

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : {},
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'whiteGoodsList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    __setBrandStatus ('', true)

                    __setModelListStatus ($The, '100%')

                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {})
                }
            }, true)
        }

    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    function __setKeywordStatus (keyword) {
        var
            $SearchForm = $ ('#brandSearchForm')

        $SearchForm.find ('[name="keyword"]').val (decodeURIComponent (keyword || ''))

        if (keyword || 'partner-jiangsu-yidong'==window.__TPL_TYPE) {
            // 有搜索关键词，表示进入搜索页
            $SearchForm.find ('.icon-back2').show ()
            $SearchForm.find ('.input-radius-circle').css ({
                'margin-left' : '.44rem'
            })
        } else {
            $SearchForm.find ('.icon-back2').hide ()
            $SearchForm.find ('.input-radius-circle').css ({
                'margin-left' : '.12rem'
            })
        }
    }

    // 设置无品牌被选中的状态
    function __setBrandNoneSelected () {
        var
            $BlockModelList = i.getContainer (),
            $BlockBrandList = i.handle.getBrandContainer(),
            $BlockHeader = $('#Header'),
            $BlockTop = $('.block-top'),
            $BlockSearchBox = $('.block-search-box'),
            $BlockRecycleCateTab = $ ('.block-recycle-cate-tab'),
            $BlockUserOfPrize = $('.block-user-of-prize-list'),
            $BlockHotModel = $('.block-hot-model-wrap'),
            $BlockSpecialYouku = $('.block-special-youku'),
            $BlockUserComment = $('.block-user-comment'),
            $BlockHsPartner = $('.block-hs-partner')

        // 显示滑动图
        var
            $slideWrap = $BlockTop.find('.slide-shower-wrap').show(),
            slideInst = tcb.cache('keySlideInst')
        // 轮播图懒加载
        tcb.lazyLoadImg(100, $slideWrap)
        if (!slideInst){
            slideInst = Bang.slide($slideWrap)
            tcb.cache('keySlideInst', slideInst)
        }

        //显示用户中奖列表
        $BlockUserOfPrize.show()
        //显示热门机型
        $BlockHotModel.show()
        $BlockSpecialYouku.show()
        $BlockHsPartner.show()
        //显示用户评论
        $BlockUserComment.show()
        //显示现金加价，限时疯抢
        $('.block-crazy-coupon').show()
        var instBlockCrazyCouponScroll = tcb.cache('INST_BLOCK_CRAZY_COUPON_SCROLL')
        if (instBlockCrazyCouponScroll){
            instBlockCrazyCouponScroll.setDimensions()
        }

        // var top = $BlockHeader.height () + $BlockTop.height () + $BlockSearchBox.height () + $BlockRecycleCateTab.height ()
        //
        // //如果有中奖名单滚动部分，加在top上
        // if($BlockUserOfPrize && $BlockUserOfPrize.length !=0){
        //     top += $BlockUserOfPrize.height()
        // }
        // //如果有热门机型，加在top上
        // if($BlockHotModel && $BlockHotModel.length !=0){
        //     top += $BlockHotModel.height()
        // }
        //
        $BlockModelList.html ('').css ({
            // top   : top,
            width : '0'
        })

        $BlockBrandList
            .addClass ('inner-col-3').css ({
                // top     : top,
                width   : '100%',
                display : 'block',
                position: 'static'
            })
            .find ('.block-brand-list-inner').css ({
                'visibility' : 'visible'
            })
            .find ('.item').removeClass ('checked checked-prev checked-next')

        // 将所有尺寸置为0，避免由型号选择页面返回时品牌选择不置顶
        i.handle.resetBrandListScrollDimension (0, 0, 0, 0)
        // 延时设置滚动尺寸，避免动画效果的延时导致宽高检测不准确
        setTimeout (i.handle.resetBrandListScrollDimension, 500)
    }

    // 设置有品牌被选中的状态
    function __setBrandHasSelected(){
        var
            $BlockModelList = i.getContainer (),
            $BlockBrandList = i.handle.getBrandContainer()

        $BlockModelList.css ({
            width : '80%'
        })
        $BlockBrandList
            .removeClass ('inner-col-3').css ({
                width : '20%',
                position: 'absolute'
            })
            .find ('.block-brand-list-inner').css ({
                'visibility' : 'visible'
            })

        // 延时设置滚动尺寸，避免动画效果的延时导致宽高检测不准确
        setTimeout(function(){

            i.handle.resetBrandListScrollDimension()

            var
                inst = i.handle.getBrandScrollInst(),
                $Inner = i.handle.getBrandInner(),
                $checked = $BlockBrandList.find('.checked'),

                scroll_top_max = $Inner.height()-$BlockBrandList.height(),
                clicked_index = $checked.index(),
                scroll_top_target = $checked.height()*clicked_index

            // 目标滚动位置大于可滚动的最大值时，直接采用可滚动最大值作为目标滚动位置
            scroll_top_target = scroll_top_target>scroll_top_max ? scroll_top_max : scroll_top_target

            inst.scrollTo(0, scroll_top_target, true)

            //i.handle.removeBrandClickedInAttr()

        }, 100)
    }

    // 设置品牌列表的状态，选中指定品牌、或者隐藏品牌列表
    function __setBrandStatus (brand_id, hide_flag) {
        var
            $BlockBrandList = $ ('#BlockBrandList')
        if (hide_flag) {
            $BlockBrandList.hide ()
        } else {
            var
                $Items = $BlockBrandList.find ('.item'),
                $Item = $Items.filter ('[data-bid="' + brand_id + '"]')

            if (!($Item && $Item.length)) {
                $Item = $Items.filter ('[data-bid="0"]')
            }

            var $BlockHeader = $('#Header'),
                $BlockTop = $('.block-top'),
                $BlockSearchBox = $('.block-search-box'),
                $BlockRecycleCateTab = $('.block-recycle-cate-tab')

            // 显示滑动图
            $BlockTop.find('.slide-shower-wrap').hide()
            //隐藏用户中奖列表
            $('.block-user-of-prize-list').hide()
            //隐藏热门机型
            $('.block-hot-model-wrap').hide()
            $('.block-special-youku').hide()
            $('.block-hs-partner').hide()
            //隐藏用户评论
            $('.block-user-comment').hide()
            //隐藏现金加价，限时疯抢
            $('.block-crazy-coupon').hide()

            var top = $BlockHeader.height () + $BlockTop.height() + $BlockSearchBox.height() + $BlockRecycleCateTab.height()

            $BlockBrandList.css({
                top : top,
                display : 'block'
            })

            $Items.removeClass ('checked checked-prev checked-next')
            $Item.addClass ('checked')
            $Item.prev().addClass('checked-prev')
            $Item.next().addClass('checked-next')
        }
    }

    function __setModelListStatus ($Inner, width) {
        var
            $Container = i.scroll.getContainer (),
            $Item = $Inner.find ('.item').eq (0),
            innerOffset = $Inner.offset (),

            // 滚动位置
            // 根据滚动位置设定新的内容虚拟高度(限定滚动的最大位置)
            inner_height = Math.max ($Container.height (), innerOffset[ 'height' ])

        var $BlockHeader = $('#Header'),
            $BlockTop = $('.block-top'),
            $BlockSearchBox = $('.block-search-box'),
            $BlockRecycleCateTab = $('.block-recycle-cate-tab')

        // 隐藏滑动图
        $BlockTop.find('.slide-shower-wrap').hide()
        //隐藏用户中奖列表
        $('.block-user-of-prize-list').hide()
        //隐藏热门机型
        $('.block-hot-model-wrap').hide()
        $('.block-special-youku').hide()
        $('.block-hs-partner').hide()
        //隐藏用户评论
        $('.block-user-comment').hide()
        //隐藏现金加价，限时疯抢
        $('.block-crazy-coupon').hide()

        var top = $BlockHeader.height () + $BlockTop.height() + $BlockSearchBox.height() + $BlockRecycleCateTab.height()

        $Container.css ({
            top : top,
            width : width
        })

        i.scroll.setInner ($Inner)
        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())
        i.scroll.setDimensions (0, 0, 0, inner_height)
    }

    // 设置回收分类的状态
    function __setRecycleCateStatus(cate_id){
        var
            $BlockRecycleCateTab = $('.block-recycle-cate-tab'),
            $TabItem = $BlockRecycleCateTab.find('[data-cate-id="'+cate_id+'"]')
        if ($TabItem&&$TabItem.length){
            $BlockRecycleCateTab.show()
            $TabItem.addClass('item-selected').siblings('.item-selected').removeClass('item-selected')
        } else {
            $BlockRecycleCateTab.hide()
        }
    }

    function __renderBrandList(category_id) {
        var brandList = window.__BRAND_LIST_MOBILE||[]
        if (category_id=='10'){
            brandList = window.__BRAND_LIST_NOOTBOOK||[]
        } else {
            category_id = '1'
        }
        if (window.__IS_IN_YANJI_ANDROID && brandList && brandList[0] && brandList[0]['brand_id']=='10'){
            brandList.shift()
        }
        var _global_data = tcb.queryUrl(window.location.search, '_global_data'),
            showBrands = []
        if (_global_data){
            try{
                _global_data = JSON.parse(tcb.html_decode(decodeURIComponent(_global_data)))
                showBrands = _global_data['show_brands']
            }catch (ex){tcb.error(ex)}
        }

        i.renderMap.brandList({
            target: $('#BlockBrandList .block-brand-list-inner'),
            data: {
                category_id : category_id,
                brandList : showBrands&&showBrands.length ? brandList.filter(function(brandItem){return showBrands.indexOf(brandItem.brand_id)>-1}) : brandList
            },
            event: tcb.noop,
            complete: function () {
                i.handle.resetBrandListScrollDimension ()
            }
        })
    }

} (this)

