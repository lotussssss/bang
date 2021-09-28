;
(function () {

    Dom.ready ( function () {

        var
            // 需要发票选项
            $Checkable = W ( '.need-fapiao-checkable' )

        if ( !($Checkable && $Checkable.length) ) {

            return
        }

        //修改发票信息弹出面板
        function showInvoicInfoePanel(){
            var
                invoice_flag = W ( '[name="invoice_flag"]' ).val () || 10,
                invoice_title_type = W ( '[name="invoice_title_type"]' ).val () || 1,
                invoice_title = W ( '[name="invoice_title"]' ).val () || '个人',
                // invoice_email = W ( '[name="invoice_email"]' ).val () || '',
                invoice_credit_code = W ( '[name="invoice_credit_code"]' ).val () || '',

                html_str = W ( '#JsChangeFapiaoInfoPanelTpl' ).html ().trim ().tmpl () ( {
                    invoice_flag       : invoice_flag,
                    invoice_title_type : invoice_title_type,
                    invoice_title      : invoice_title,
                    // invoice_email      : invoice_email,
                    invoice_credit_code : invoice_credit_code
                } )

            window.changeFapiaoInfoPanel = tcb.panel ( '发票信息', html_str, {
                className : 'change-fapiao-info-panel'
            } );

            new PlaceHolder ( '.fapiao-input-email' );
            new PlaceHolder ( '.fapiao-input-company' );
            new PlaceHolder ( '.fapiao-input-credit-code' );
        }

        tcb.bindEvent ( document.body, {

            /**** 发票发票 ****/
            // 下单页--[ 是否需要发票 ]
            '.need-fapiao-checkable .checkbox'                : function ( e ) {
                e.preventDefault ();

                var checkable = W ( '.need-fapiao-checkable' ),
                    fapiao_tip = W ( '.fapiao-block .block-fapiao-tip' );

                window.__FaPiao_Cache = window.__FaPiao_Cache || {}

                if ( checkable.hasClass ( 'need-fapiao-checked' ) ) {
                    checkable.removeClass ( 'need-fapiao-checked' );
                    fapiao_tip.slideUp()

                } else {
                    checkable.addClass ( 'need-fapiao-checked' );
                    fapiao_tip.slideDown()
                }
            },


            /*===============开具发票已经转移到 m端 订单列表中 以下方法已失效=========*/



            // 下单页--[ 修改发票信息 ]
            // '.fapiao-block .btn-change'                       : function ( e ) {
            //     e.preventDefault ();
            //
            //     showInvoicInfoePanel();
            //
            // },
            // // 发票信息弹窗--[ 切换tab ]
            // '.change-fapiao-info-panel .fapiao-info-tab'      : function ( e ) {
            //     e.preventDefault ();
            //
            //     var
            //         wMe = W ( this ),
            //         wCompany = W ( '.change-fapiao-info-panel .fapiao-input-company-wrap' ),
            //         wCreditCode = W ( '.change-fapiao-info-panel .fapiao-input-credit-code-wrap' ),
            //         wDianZi = W ( '.change-fapiao-info-panel .fapiao-info-dianzi' );
            //
            //     wMe.addClass ( 'fapiao-tab-checked' ).siblings ( '.fapiao-tab-checked' ).removeClass ( 'fapiao-tab-checked' );
            //
            //     //显示隐藏邮箱输入框，电子发票提示
            //     if ( W ( '.fapiao-type-tab-box .fapiao-tab-checked' ).attr ( 'data-val' ) == 10 ) {
            //         wDianZi.show ();
            //
            //     } else {
            //         wDianZi.hide ();
            //     }
            //
            //     //显示隐藏单位输入框
            //     if ( W ( '.fapiao-title-tab-box .fapiao-tab-checked' ).attr ( 'data-val' ) == 10 ) {
            //         wCompany.css ( 'visibility', 'visible' );
            //         wCompany.query ( 'input' ).val ( '' );
            //         wCreditCode.css ( 'visibility', 'visible' );
            //         wCreditCode.query ( 'input' ).val ( '' );
            //     } else {
            //         wCompany.css ( 'visibility', 'hidden' );
            //         wCompany.query ( 'input' ).val ( '个人' );
            //         wCreditCode.css ( 'visibility', 'hidden' );
            //         wCreditCode.query ( 'input' ).val ( '' );
            //     }
            // },
            // // 发票信息弹窗--[ 取消 ]
            // '.change-fapiao-info-panel .btn-cancel'           : function ( e ) {
            //     e.preventDefault ();
            //
            //     window.changeFapiaoInfoPanel.hide ();
            // },
            // // 发票信息弹窗--保存
            // '.change-fapiao-info-panel .btn-save'             : function ( e ) {
            //     e.preventDefault ();
            //
            //     //下单页发票信息
            //     var
            //         invoice_flag_tab = W ( '.change-fapiao-info-panel .fapiao-type-tab-box .fapiao-tab-checked' ),
            //         invoice_flag_txt = invoice_flag_tab.attr ( 'data-txt' ),
            //         invoice_flag_val = invoice_flag_tab.attr ( 'data-val' ); // 发票类型
            //
            //     var invoice_title_type_val = W ( '.fapiao-title-tab-box .fapiao-tab-checked' ).attr ( 'data-val' );
            //
            //     var
            //         invoice_email_txt = '' // 设置电子发票邮箱默认值
            //
            //     //data-val=1 普通发票（纸质） data-val=10 电子发票
            //     if ( invoice_flag_val == 1 ) {
            //         invoice_flag_txt = invoice_flag_txt + '（纸质）';
            //     }
            //     else {
            //         //invoice_flag_txt = invoice_flag_txt;
            //
            //         //邮箱   2018-1-23 需求：取消填写邮箱
            //         // var invoice_email = W ( '.change-fapiao-info-panel .fapiao-input-email' );
            //         // invoice_email_txt = invoice_email.val ().trim ();
            //         //
            //         // if ( !validEmail ( invoice_email_txt ) ) {
            //         //     invoice_email.shine4Error ();
            //         //     return;
            //         // }
            //     }
            //
            //     //公司抬头
            //     var invoice_title_tab = W ( '.change-fapiao-info-panel .fapiao-input-company' );
            //     var invoice_title_txt = invoice_title_tab.val ().trim ();
            //
            //     if ( !invoice_title_txt ) {
            //         invoice_title_tab.shine4Error ();
            //         return;
            //     }
            //
            //     // 信用代码
            //     if ( invoice_title_type_val == 10 ) {
            //         var invoice_credit_code_tab = W ( '.change-fapiao-info-panel .fapiao-input-credit-code' );
            //         var invoice_credit_code_txt = invoice_credit_code_tab.val ().trim ();
            //
            //         if ( !validCreditCode(invoice_credit_code_txt) ) {
            //             invoice_credit_code_tab.shine4Error ();
            //             return;
            //         }
            //     }
            //
            //     W ( '[name="invoice_flag"]' ).val ( tcb.html_encode ( invoice_flag_val ) );
            //     W ( '[name="invoice_title_type"]' ).val ( tcb.html_encode ( invoice_title_type_val ) );
            //     W ( '[name="invoice_title"]' ).val ( tcb.html_encode ( invoice_title_txt ) );
            //     // W ( '[name="invoice_email"]' ).val ( tcb.html_encode ( invoice_email_txt ) );
            //     W ( '[name="invoice_credit_code"]' ).val ( tcb.html_encode ( invoice_credit_code_txt||'' ) );
            //
            //     W ( '.fapiao-block .fapiao-type' ).html ( tcb.html_encode ( invoice_flag_txt ) );
            //     //W('.fapiao-block .fapiao-type').html( invoice_flag_txt );
            //     W ( '.fapiao-block .fapiao-title' ).html ( tcb.html_encode ( invoice_title_txt ) );
            //     window.changeFapiaoInfoPanel.hide ();
            //
            //     //点击确认后下单页显示发票信息
            //     W ( '.need-fapiao-checkable' ).addClass ( 'need-fapiao-checked' );
            //     W ( '.fapiao-block .fapiao-info' ).css ( 'visibility', 'visible' );
            //     W ( '[name="invoice_need"]' ).val ( '10' );
            // },
            // // 限制发票抬头单位填写字数
            // '.change-fapiao-info-panel .fapiao-input-company' : {
            //     'keyup'  : function ( e ) {
            //         var $me = W ( this ),
            //             invoice_title = $me.val ().trim ();
            //         if ( invoice_title.length > 50 ) {
            //             alert ( '请输入50字以内！' );
            //             $me.val ( invoice_title.substring ( 0, 50 ) );
            //         }
            //     },
            //     'change' : function ( e ) {
            //         var $me = W ( this ),
            //             invoice_title = $me.val ().trim ();
            //         if ( invoice_title.length > 50 ) {
            //             alert ( '请输入50字以内！' );
            //             $me.val ( invoice_title.substring ( 0, 50 ) );
            //         }
            //     }
            // }
            /**** 发票发票end ****/


        } )

    } )

    // 验证邮箱
    function validEmail(txt){
        var
            emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i

        return emailRegExp.test(txt) ? true : false
    }

    function validCreditCode(credit_code) {
        var flag = true

        if (credit_code.length!==15 && credit_code.length!==18){
            flag = false
            alert('纳税识别号或统一信用代码只能为15或18位')
        } else if (!(/^[\d\w]+$/.test(credit_code))){
            flag = false
            alert('纳税识别号或统一信用代码只能包含数字或字母')
        }

        return flag
    }

} ())