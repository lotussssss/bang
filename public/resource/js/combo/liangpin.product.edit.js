;/**import from `/resource/js/page/liangpin.product.edit.js` **/
// JavaScript Document
Dom.ready(function(){
	function product_type_change(e)
	{
		W('#product_type_guanhuan_edit').on('click',function(){
		    location.href = '/liangpin_mer/product_list?add_type=guanhuan';
		});
		W('#product_type_liangpin_edit').on('click',function(){
		    location.href = '/liangpin_mer/product_list_liangpin?add_type=liangpin';
		});
        W('#product_type_huanxin_edit').on('click',function(){
            location.href = '/liangpin_mer/product_list?add_type=huanxin';
        });
	}
	product_type_change();
});
