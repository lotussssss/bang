// 工具方法
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    a.util = {}

    tcb.mix (a.util, {
        /**
         * 判断是否为检测流程,
         *      true：检测流程
         *      false：普通流程
         * @returns {*}
         */
        is_detect : function () {
            var
                is_detect_map = {
                    '1' : false,// 普通流程
                    '2' : true  // 检测流程
                },
                is_detect = a.cache (a.KEY_FLAG_IS_DETECT) || ''
            // 获取不到is_detect标识值，
            // 表示没有识别过是不是检测流程的评估，那么识别处理下
            if (!(is_detect && typeof is_detect_map[ is_detect ] !== 'undefined')) {
                var
                    detect_key = tcb.queryUrl (window.location.search, 'detect_key')

                is_detect = detect_key ? '2' : '1'
                a.cache (a.KEY_FLAG_IS_DETECT, is_detect)
            }

            return is_detect_map[ is_detect ]
        },
        /**
         * 数组去重
         * @param arr
         * @returns {Array}
         */
        numUnique : function (arr) {
            var
                ret = []

            for (var i = 0, n = arr.length; i < n; i++) {
                var _has = false
                for (var j = ret.length - 1; j >= 0; j--) {
                    if (ret[ j ] === arr[ i ]) {
                        _has = true
                        break
                    }
                }

                if (!_has) {
                    ret.push (arr[ i ])
                }
            }

            return ret
        },

        /**
         * 获取属性输出的列数
         * @param cate_id
         * @param is_sku
         * @returns {number}
         */
        getColNumByCateId : function (cate_id, is_sku) {
            is_sku = is_sku || false
            var
                col = 1,
                col_arr = [ 1,
                    2,
                    3 ], // 列数数组
                col_map = {
                    'mix' : col_arr[ 0 ], // 综合 2 列

                    'sku_2' : col_arr[ 0 ], // 容量 3 列
                    'sku_4' : col_arr[ 0 ], // 颜色 3 列
                    'sku_6' : col_arr[ 0 ],  // 渠道 1 列

                    '4'  : col_arr[ 0 ], // 保修情况 2 列
                    '26' : col_arr[ 0 ], // 新旧程度（边框外壳） 1 列
                    '32' : col_arr[ 0 ], // 屏幕外观 1 列
                    '34' : col_arr[ 0 ], // 账号密码 1 列
                    '18' : col_arr[ 0 ]  // 维修拆机史 2 列
                }

            col = col_map[ is_sku ? 'sku_' + cate_id : cate_id ] || col

            return col
        },

        /**
         * 判断$TheOption是否为sku选项
         * @param $TheOption
         * @returns {boolean}
         */
        is_sku : function ($TheOption) {
            var
                is_sku = false
            if ($TheOption) {
                if (typeof $TheOption !== 'object') {
                    var
                        option_id = $TheOption

                    $TheOption = $ ('.' + a.CLASS_NAME.option_item + '[data-id="' + option_id + '"]')
                }

                is_sku = $TheOption.closest ('.' + a.CLASS_NAME.block_model_basic_info).length
                    ? true
                    : false
            }

            return is_sku
        },

        /**
         * 判断选择项id是否已经被选中
         * @param option_id
         * @param is_sku
         * @returns {boolean}
         */
        is_checked : function (option_id, is_sku) {
            var
                is_checked = false,
                checked_comb = a.cache.doGetCheckedComb (is_sku)

            option_id = option_id.toString ()

            if (is_sku) {

                if (tcb.inArray (option_id, checked_comb) > -1) {
                    is_checked = true
                }
            } else {
                var
                    mix_special = checked_comb[ 0 ] || '',
                    special = checked_comb[ 1 ] || []

                if (tcb.inArray (option_id, mix_special.split (',')) > -1) {
                    // 混合专有选项
                    is_checked = true
                } else if (tcb.inArray (option_id, special) > -1) {
                    // 非混合专有选项
                    is_checked = true
                }
            }

            return is_checked
        },

        /**
         * 是否为混合评估项
         * @param $Option
         * @returns {boolean}
         */
        is_mix : function ($Option) {
            if (!($Option && $Option.length)) {
                return false
            }

            return $Option.attr ('data-checked-id')
        },

        /**
         * 锁定标识
         * @returns {*}
         */
        lock                 : function (key) {
            key = key
                ? '_' + key
                : ''

            return a.cache (a.KEY_FLAG_LOCKING + key, true)
        },
        unlock               : function (key) {
            key = key
                ? '_' + key
                : ''

            a.cache (a.KEY_FLAG_LOCKING + key, false)
        },
        is_lock              : function (key) {
            key = key
                ? '_' + key
                : ''

            return a.cache (a.KEY_FLAG_LOCKING + key)
        },
        resizeModelImg       : function ($imgs) {
            $imgs = $imgs || a.$Model.find ('.the-img img')

            $imgs.each (function () {
                var
                    me = this
                me.style.width = ''
                me.style.height = ''

                setTimeout (function () {
                    var
                        $img = $ (me),
                        img_width = $img.width (),
                        img_height = $img.height (),
                        max_size = Math.max (img_width, img_height)

                    tcb.setImgElSize ($img, max_size, max_size)
                }, 300)
            })
        },
        // 获取有描述信息的选项id集合
        getOptionDescIds   : function () {

            return [ '6', '62', '66', '68', '70', '72', '78', '80', '246', '82', '22', '26', '40'/*, '36', '108', '116' */]
        },
        // 获取所以选项描述信息
        getOptionDescAll : function () {

            return {
                // 1个月以上
                // '6': {
                //     img: ['https://p.ssl.qhimg.com/t0134b483f8fde986fe.png'],
                //     desc: ['iPhone手机可根据序列号或者IMEI号查询到保修情况，将序列号或IMEI号输入以下网址进行查询。\n查询地址：https://selfsolve.apple.com/agreementWarrantyDynamic.do?locale=zh_CN\n如何查看iPhone手机的序列号或IMEI号？\n在 “设置>通用>关于本机”中查看序列号或IMEI号，长按可复制。']
                // },

                // START 边框外壳
                // 全新手机
                '62': {
                    // img: ['https://p.ssl.qhimg.com/t01dbd8d82f6882dab7.png'],
                    img: ['https://p2.ssl.qhimg.com/t018357e25ac66d3878.png'],
                    desc: ['仅仅指未拆开过包装的手机。']
                },
                // 外壳完好
                '66': {
                    // img: [],
                    img: ['https://p5.ssl.qhimg.com/t012c03265a1dabbf79.png'],
                    desc: ['外观无任何磕伤，磨伤，划痕或瑕疵。']
                },
                // 外壳有划痕
                '68': {
                    // img: ['https://p2.ssl.qhimg.com/t0101c28965ecc81cf4.png'],
                    img: ['https://p5.ssl.qhimg.com/t012fc3f0ca2fe3b2da.png'],
                    desc: ['外壳边框或背板有明显划痕。']
                },
                // 外壳有磕碰或掉漆
                '70': {
                    // img: ['https://p3.ssl.qhimg.com/t0101a0ab22b9032d1c.png'],
                    img: ['https://p3.ssl.qhimg.com/t0176b53613010be294.png'],
                    desc: ['边框或者背板有磕碰角或裂痕，或出现掉漆现象。']
                },
                // 外壳碎裂
                '247': {
                    img: ['https://p2.ssl.qhimg.com/t01a0cfc483b4de63da.png'],
                    desc: []
                },
                // 机身变形或残裂
                '72': {
                    // img: ['https://p.ssl.qhimg.com/t0104b04fa105e9f7aa.png'],
                    img: ['https://p1.ssl.qhimg.com/t01515b7737b2003201.png'],
                    desc: ['机身的外壳有弯曲，变形或翘起，屏幕与外壳出现分离的现象。']
                },
                // END 边框外壳

                // START 屏幕外观
                // 无划痕/无使用痕迹
                '78': {
                    // img: [],
                    img: ['https://p0.ssl.qhimg.com/t01f1d79bd4efff2326.png'],
                    desc: ['手机未使用过或使用期间一直贴膜保护，屏幕在光照下无可见划痕或磨损。']
                },
                // 屏幕轻微划痕
                '80': {
                    // img: ['https://p3.ssl.qhimg.com/t0192cd49ac29dc86a0.png'],
                    img: ['https://p5.ssl.qhimg.com/t01ff45a8a443b4b51e.png'],
                    desc: [] // '在不贴膜的情况下，屏幕有轻微划痕。'
                },
                // 屏幕明显划痕
                '246': {
                    // img: ['https://p1.ssl.qhimg.com/t01175b34733385a942.png'],
                    img: ['https://p5.ssl.qhimg.com/t01c27b02cb616a0f20.png'],
                    desc: []
                },
                // 屏幕碎裂
                '82': {
                    // img: ['https://p.ssl.qhimg.com/t016d990d7b726de7f8.png'],
                    img: ['https://p5.ssl.qhimg.com/t0125773ad406dd5602.png'],
                    desc: ['屏幕有磕碰角,裂痕或碎裂。']
                },
                // END 屏幕外观

                // START 屏幕显示
                // 显示和触摸正常
                '20': {
                    img: ['https://p4.ssl.qhimg.com/t0115cfac59765d757c.png'],
                    desc: []
                },
                // 有坏点/亮点/色差
                '22': {
                    // img: ['https://p.ssl.qhimg.com/t01099af737252008e0.png'],
                    img: ['https://p5.ssl.qhimg.com/t01736f07e94c751c29.png'],
                    desc: ['1.屏幕上不可修复的单一颜色点或是一块区域，比如屏幕出现白斑或其他颜色斑点等；<br>2.在全屏纯黑色或白色背景下，屏幕出现亮点或者坏点情况；<br>3. 在纯色背景下，出现屏幕色差情况，以蓝色纯色背景图为例，顶部有明显色差。']
                },
                // 触摸异常/显示异常/非原装屏
                '26': {
                    // img: ['https://p.ssl.qhimg.com/t01236188bc143ba0ba.png'],
                    img: ['https://p2.ssl.qhimg.com/t012c6d5b3d0bea43fe.png'],
                    desc: ['屏幕出现触摸无反应，触摸失灵等情况；<br>液晶显示异常，屏幕出现漏液，错乱，严重老化等现象。']
                },
                // 透图/透字/烧屏
                '253': {
                    img: ['https://p1.ssl.qhmsg.com/t01ebe09a0304311cc9.png']
                },
                //修过主板/改容量
                '42': {
                    desc: ['扩容、换壳、主板盖章/贴签、黑纸坏、盖板开、飞线、无IMEI/与实际不符、电池更换/松动/撬痕、维修尾插/扬声器、内部螺丝/零件尾插螺丝/排线盖板螺丝确实或无法打开']
                },
                // 不显示
                // https://p0.ssl.qhimg.com/t01cbfdc984a5a8ff43.png
                // END 屏幕显示

                // START 维修拆机史
                // 修过小部件
                // '40': {
                //     img: ['https://p.ssl.qhimg.com/t01d8876df825617cb9.png'],
                //     desc: ['手机后盖螺丝有拆过，除主板外，维修过手机屏幕，扬声器，尾插等其他小部件。']
                // }
                // END 维修拆机史
            }
        },
        // 获取选项描述信息
        getOptionDesc : function (option_id) {

            var descMap = this.getOptionDescAll()

            return descMap[option_id] || null
        },

        /**
         * 生成评估组数据
         * @param groupData
         * @returns {{
         *      group_title: *,
         *      group_id: (*|string),
         *      options: *,
         *      selected: (*|string),
         *      selected_comb: (*|Array),
         *      col: number,
         *      is_sku: (*|boolean),
         *      no_active: *,
         *      no_outer: (*|boolean),
         *      mix: (*|boolean)
         *      }}
         */
        genGroupData : function (groupData) {
            var
                group_id = groupData[ 1 ] || '',
                mix = groupData[ 5 ][ 'mix' ] || false,
                is_sku = groupData[ 5 ][ 'is_sku' ] || false,
                col = a.util.getColNumByCateId (mix ? 'mix' : group_id, is_sku)

            return {
                // 标题
                group_title   : groupData[ 0 ],
                // id
                group_id      : group_id,
                // 选项集合
                options       : groupData[ 2 ],
                // 被选中的选项id
                selected      : groupData[ 3 ] || '',
                // 被选中的选项id组合
                selected_comb : groupData[ 4 ] || [],
                // 显示列
                col           : col,
                // 是否sku
                is_sku        : is_sku,
                // 不激活状态
                no_active     : groupData[ 5 ][ 'no_active' ],
                // 不要外部容器
                no_outer      : groupData[ 5 ][ 'no_outer' ] || false,
                // 聚合选项
                mix           : mix,
                // 只读不可修改
                readonly      : groupData[ 5 ][ 'readonly' ] || false,
                // 选中并收起
                collapse      : groupData[ 5 ][ 'collapse' ] || false
            }
        }

    })

} (this)
