!function () {

    // 获取有描述信息的选项id集合
    function getOptionDescIds () {

        return [ '6', '62', '66', '68', '70', '72', '78', '80', '246', '82', '22', '26', '40', '42'/*, '36', '108', '116'*/ ]
    }

    // 获取选项描述信息
    function getOptionDesc (option_id) {

        var descMap = {
            // 1个月以上
            '6'  : {
                img  : [ 'https://p.ssl.qhimg.com/t0134b483f8fde986fe.png' ],
                desc : [ 'iPhone手机可根据序列号或者IMEI号查询到保修情况，将序列号或IMEI号输入以下网址进行查询。<br>查询地址：<a href="https://selfsolve.apple.com/agreementWarrantyDynamic.do?locale=zh_CN" target="_blank">https://selfsolve.apple.com/agreementWarrantyDynamic.do?locale=zh_CN</a><br>如何查看iPhone手机的序列号或IMEI号？<br>在 “设置”>通用>关于本机”中查看序列号或IMEI号。' ]
            },
            // 全新手机
            '62' : {
                img  : [ 'https://p.ssl.qhimg.com/t01dbd8d82f6882dab7.png' ],
                desc : [ '仅仅指未拆开过包装的手机。' ]
            },
            // 外壳完好
            '66' : {
                img  : [ ],
                desc : [ '外观无任何磕伤，磨伤，划痕或瑕疵。' ]
            },
            // 外壳有划痕
            '68' : {
                img  : [ 'https://p2.ssl.qhimg.com/t0101c28965ecc81cf4.png' ],
                desc : [ '外壳边框或背板有明显划痕。' ]
            },
            // 外壳有磕碰或掉漆
            '70' : {
                img  : [ 'https://p3.ssl.qhimg.com/t0101a0ab22b9032d1c.png' ],
                desc : [ '边框或者背板有磕碰角或裂痕，或出现掉漆现象。' ]
            },
            // 机身变形或残裂
            '72' : {
                img  : [ 'https://p.ssl.qhimg.com/t0104b04fa105e9f7aa.png' ],
                desc : [ '机身的外壳有弯曲，变形或翘起，屏幕与外壳出现分离的现象。' ]
            },
            // 无划痕/无使用痕迹
            '78'  : {
                img  : [],
                desc : [ '手机未使用过或使用期间一直贴膜保护，屏幕在光照下无可见划痕或磨损。' ]
            },
            // 屏幕轻微划痕
            '80' : {
                img  : [ 'https://p3.ssl.qhimg.com/t0192cd49ac29dc86a0.png'],
                desc : [ /*'在不贴膜的情况下，屏幕有轻微划痕。'*/ ]
            },
            // 屏幕明显划痕
            '246' : {
                img  : [ 'https://p1.ssl.qhimg.com/t01175b34733385a942.png'],
                desc : []
            },
            // 屏幕碎裂
            '82' : {
                img  : [ 'https://p.ssl.qhimg.com/t016d990d7b726de7f8.png' ],
                desc : [ '屏幕有碰角、裂痕碎裂、假壳、后压屏。' ]
            },
            // 有坏点/亮点/色差
            '22' : {
                img  : [ 'https://p.ssl.qhimg.com/t01099af737252008e0.png' ],
                desc : [ '1.屏幕上不可修复的单一颜色点或是一块区域，比如屏幕出现白斑或其他颜色斑点等；<br>2.在全屏纯黑色或白色背景下，屏幕出现亮点或者坏点情况；<br>3. 在纯色背景下，出现屏幕色差情况，以蓝色纯色背景图为例，顶部有明显色差。' ]
            },
            // 触摸异常/显示异常/非原装屏
            '26' : {
                img  : [ 'https://p.ssl.qhimg.com/t01236188bc143ba0ba.png' ],
                desc : [ '屏幕出现触摸无反应，触摸失灵等情况；<br>液晶显示异常，屏幕出现漏液，错乱，严重老化等现象。' ]
            },
            // 修过小部件
            '40' : {
                img  : [ 'https://p.ssl.qhimg.com/t01d8876df825617cb9.png' ],
                desc : [ '手机后盖螺丝有拆过，除主板外，维修过手机屏幕，扬声器，尾插等其他小部件。' ]
            },
            //修过主板/改容量
            '42' : {
                img  : [],
                desc : [ '扩容、换壳、主板盖章/贴签、黑纸坏、盖板开、飞线、无IMEI/与实际不符、电池更换/松动/撬痕、维修尾插/扬声器、内部螺丝/零件尾插螺丝/排线盖板螺丝确实或无法打开。' ]
            }
            //// 有进水
            //'36'  : {
            //    img  : [ 'https://p.ssl.qhimg.com/t018dd4e3275a3acfe4.png' ],
            //    desc : [ '手机防潮标变色；<br>显示屏内有水珠或者水雾；<br>手机螺丝口，主板有生锈的痕迹等情况。' ]
            //},
            //// 官换机(系统型号N开头)
            //'108' : {
            //    img  : [ 'https://p.ssl.qhimg.com/t0191b6c76d49ec4733.png' ],
            //    desc : [ '在“设置->通用->关于本机”中的型号查看，型号以N开头为官换机。' ]
            //},
            //// 卡贴机/有网络锁
            //'116' : {
            //    img  : [],
            //    desc : [ '水货有锁手机不能接收国内的通讯信号，需要卡贴来把国内通讯信号转换为可以识别的信号，因此称为“卡贴机”。' ]
            //}
        };

        return descMap[ option_id ] || null
    }

    // 显示评估项描述信息
    function showOptionDesc(wOption, desc){
        var
            html_fn = W ('#JsHSAssessOptionDescTpl').html ().trim ().tmpl (),
            html_st = html_fn ({
                data : desc
            })

        var
            wDesc = W (html_st),
            wBody = W ('body')

        wDesc.appendTo (wBody[ 0 ])

        var
            rect_box = wOption.ancestorNode ('.phone-option-box').getRect (),
            rect_option = wOption.getRect (),
            rect_desc = wDesc.getRect ()

        var
            in_client = tcb.queryUrl(window.location.search, 'inclient')
        if (in_client){
            // 客户端内，由于限定高度（而且底部没有内容撑开），
            // 为了避免在评估项底部现实的时候无法显示完整，所以当评估项离顶部高度大于220px的时候换成在评估项顶部显示的方式，
            // 否则，还是在评估项底部显示

            var
                rect_body = wBody.getRect()

            wDesc.css({
                'left' : rect_option[ 'left' ]-rect_body['left']
            })

            if (rect_option[ 'top' ]>220){

                wDesc.css({
                    'bottom'  : rect_body['height']-rect_option[ 'top' ]-1
                })

            } else {
                wDesc.css({
                    'top'  : rect_option[ 'top' ] + rect_option[ 'height' ] - 1
                })
            }

        } else {
            // 普通浏览器内

            wDesc.css({
                'top'  : rect_option[ 'top' ] + rect_option[ 'height' ] - 1,
                'left' : rect_option[ 'left' ]
            })

            if (rect_option[ 'left' ] + rect_desc[ 'width' ] > rect_box[ 'left' ] + rect_box[ 'width' ]) {
                // 弹层宽度超出了最右边界，那么需要修正左对齐的位置，让其贴右边框对齐
                wDesc.css ({
                    'left' : rect_option[ 'left' ] - (rect_desc[ 'width' ] - rect_option[ 'width' ])
                })
            }
        }

    }

    // 关闭隐藏评估项描述信息
    function hideOptionDesc (wDesc) {
        wDesc = wDesc || W ('#AssessOptionDesc')

        if (wDesc && wDesc.length) {

            wDesc.removeNode ()
        }
    }

    Dom.ready (function () {

        tcb.bindEvent (document.body, {

            '#AssessOptionDesc' : {
                'mouseleave' : function (e) {
                    var
                        toElement = e.toElement || e.relatedTarget,
                        wToElement = W (toElement)

                    // 移开鼠标后的目标元素为空的时候，也隐藏弹层（一般情况不会出现没有toElement的情况，但是嵌入客户端的时候会存在这样的情况）
                    if (!(wToElement && wToElement.length)
                        || !(wToElement.hasClass ('icon-check-item-desc') || wToElement.ancestorNode ('.icon-check-item-desc').length)) {
                        hideOptionDesc ()
                    }
                }
            },

            '#PhoneOptions .check-item' : {
                'mousedown'  : function (e) {
                    //var
                    //    wTarget = W(e.target)

                    //if (!wTarget.hasClass('icon-show-desc')){

                        hideOptionDesc ()
                    //}
                },
                'mouseleave' : function (e) {
                    var
                        toElement = e.toElement || e.relatedTarget,
                        wToElement = W (toElement)

                    // 移开鼠标后的目标元素为空的时候，也隐藏弹层（一般情况不会出现没有toElement的情况，但是嵌入客户端的时候会存在这样的情况）
                    if ( !(wToElement && wToElement.length)
                        || !(wToElement.hasClass ('assess-option-desc') || wToElement.ancestorNode ('.assess-option-desc').length )) {
                        hideOptionDesc ()
                    }
                }
            },

            '#PhoneOptions .check-item .icon-show-desc' : {
                'mouseenter' : function (e) {
                    var
                        wMe = W (this),
                        wDesc = W ('#AssessOptionDesc')

                    if (wDesc && wDesc.length) {

                        //hideOptionDesc (wDesc)

                        return
                    }

                    var
                        wOption = wMe.ancestorNode ('.check-item'),
                        d_id = wOption.attr ('data-select'),
                        d_is_sku = wOption.attr ('data-is-sku'),
                        desc = getOptionDesc (d_id)

                    if (!desc || d_is_sku) {
                        return
                    }

                    // 显示评估项描述信息
                    showOptionDesc(wOption, desc)

                    //var
                    //    html_fn = W ('#JsHSAssessOptionDescTpl').html ().trim ().tmpl (),
                    //    html_st = html_fn ({
                    //        data : desc
                    //    })
                    //
                    //wDesc = W (html_st)
                    //
                    //wDesc.appendTo (W ('body')[ 0 ])
                    //
                    //var
                    //    rect_box = wOption.ancestorNode ('.phone-option-box').getRect (),
                    //    rect_option = wOption.getRect (),
                    //    rect_desc = wDesc.getRect ()
                    //
                    //wDesc.css ({
                    //    'top'  : rect_option[ 'top' ] + rect_option[ 'height' ] - 1,
                    //    'left' : rect_option[ 'left' ]
                    //})
                    //
                    //if (rect_option[ 'left' ] + rect_desc[ 'width' ] > rect_box[ 'left' ] + rect_box[ 'width' ]) {
                    //    // 弹层宽度超出了最右边界，那么需要修正左对齐的位置，让其贴右边框对齐
                    //    wDesc.css ({
                    //        'left' : rect_option[ 'left' ] - (rect_desc[ 'width' ] - rect_option[ 'width' ])
                    //    })
                    //}

                }

                //'mousedown'  : function (e) {
                //    hideOptionDesc ()
                //},
                //'mouseenter' : function (e) {
                //    hideOptionDesc ()
                //
                //    var
                //        wMe = W (this),
                //        d_id = wMe.attr ('data-select'),
                //        d_is_sku = wMe.attr ('data-is-sku'),
                //        desc = getOptionDesc (d_id)
                //
                //    if (!desc || d_is_sku) {
                //        return
                //    }
                //
                //    var
                //        html_fn = W ('#JsHSAssessOptionDescTpl').html ().trim ().tmpl (),
                //        html_st = html_fn ({
                //            data : desc
                //        })
                //
                //    var
                //        wDesc = W (html_st)
                //
                //    wDesc.appendTo (W ('body')[ 0 ])
                //
                //    var
                //        rect_box = wMe.ancestorNode ('.phone-option-box').getRect (),
                //        rect_option = wMe.getRect (),
                //        rect_desc = wDesc.getRect ()
                //
                //    wDesc.css ({
                //        'top'  : rect_option[ 'top' ] + rect_option[ 'height' ] - 1,
                //        'left' : rect_option[ 'left' ]
                //    })
                //
                //    if (rect_option[ 'left' ] + rect_desc[ 'width' ] > rect_box[ 'left' ] + rect_box[ 'width' ]) {
                //        // 弹层宽度超出了最右边界，那么需要修正左对齐的位置，让其贴右边框对齐
                //        wDesc.css ({
                //            'left' : rect_option[ 'left' ] - (rect_desc[ 'width' ] - rect_option[ 'width' ])
                //        })
                //    }
                //},
                //'mouseleave' : function (e) {
                //    hideOptionDesc ()
                //}
            }

        })

    })

    window.Pinggu = window.Pinggu || {}


    tcb.mix (window.Pinggu, {
        getOptionDescIds : getOptionDescIds
    })

} ()
