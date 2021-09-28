Dom.ready(function(){
    var _click_id;
    var _cropPopup;
    W(".add-prd-face").bind('click', function(e){
    	_click_id = W(this).attr('id');
    	
        e.preventDefault();
        
        //弹框
        W('#prdfaceError').hide();
        var tpldom = W("#imageCropTpl, #imageCropTpl_edit, #imageCropTpl_apply, #imageCropTpl_applyedit, #imageCropTpl_1, #imageCropTpl_2, #imageCropTpl_3, #imageCropTpl_4, #imageCropTpl_5");
        _cropPopup = tcb.confirm("", tpldom.html(), { wrapId : "imgCropPop", width:750} , function(){  jsCropUI.submit(); } );  
        if(jQuery && !jQuery.fn.Jcrop){
                
            loadJs("/resource/other/jquery_plugin/jquery.Jcrop.min.js", function(){
            });
            loadCss("/resource/other/jquery_plugin/css/jquery.Jcrop.css");
        }

        return false;
    });
    //W(document).delegate("#cropOrgImg", "change", ); //IE not fire, so, use  onchage=xxx
    function __fileInputChange(){
        if( W(this).val() != "" ){
            W("#imgCropSubmitForm [name='callback']").val("parent.__cropOrigPicUpOk");
            W("#imgCropSubmitForm").submit();
            W('.img-crop-box .crop-img-loading').show();
        }
    }
    window.__fileInputChange = __fileInputChange;

    function __cropOrigPicUpOk(rs){
        if( rs.errno != 0 ){
            alert("抱歉，出错了。" + rs.errmsg);
        }else if( rs.errno == 0 ){
            var psrc = rs.picsrc;
            jsCropUI.init(rs);
            W('.img-crop-box .crop-img-loading').hide();
        }
    }

    window.__cropOrigPicUpOk = __cropOrigPicUpOk;    

    /**
     * 初始化编辑器
     * @return {[type]} [description]
     */
    function initEditor(){
        if( W('#ueditor').length > 0 ){
            var editor = new UE.ui.Editor();
            editor.render("ueditor");
            window.__descEditor = editor;  
        }      
    }

    /**
     * jquery裁剪插件使用
     * @return {[type]} [description]
     */
    window.jsCropUI = (function(){
        var __cropRange, __cropPic, __origWidth, __origHeight;
        var jcrop_api,
            boundx,
            boundy,
            previewBox,
            cropSizes = [300, 70 ,50];  

        function init(picdata){
            var src = picdata.picsrc;
            __cropPic = src;
            __origWidth = picdata.width;
            __origHeight = picdata.height;

            var smallsrc;
            if( __origWidth > __origHeight ){
                smallsrc = src.replace(/\/(\w+?)(\.\w+)$/i, "/edr/300__/$1$2");
            }else{
                smallsrc = src.replace(/\/(\w+?)(\.\w+)$/i, "/edr/_300_/$1$2");
            }

            var previewBox = $('.img-crop-box .crop-prevbox');

            $('.img-crop-box .crop-picbox').html("<img src='"+smallsrc+"'>");

            for(var i=0, n=cropSizes.length; i<n; i++){
                previewBox.find('.crop-prev-'+cropSizes[i]+' .img-preview').html('<img src="'+src+'">'); 
            }

            show($('.img-crop-box .crop-picbox img'),  previewBox);
        }            
        
        function show(target, pbox){
          previewBox = pbox;

          $(target).Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            aspectRatio: 1,
            keySupport: false /*如果设置为true，chrome下面会有页面跳动的bug*/
          },function(){
            
            jcrop_api = this;

            jcrop_api.animateTo([0,0,100,100]);

            // Use the API to get the real image size
            var bounds = this.getBounds();
            boundx = bounds[0];
            boundy = bounds[1];
            // Store the API in the jcrop_api variable
            jcrop_api = this;        
            
          });
        }

        function updatePreview(c)
        {
          if (parseInt(c.w) > 0)
          {  
            __cropRange = c;

            for(var i=0, n=cropSizes.length; i<n; i++){
              resizePreview( previewBox.find('.crop-prev-'+cropSizes[i]+' .img-preview') , c);  
            }
          }
        };

        function resizePreview(box , c){
          var $pcnt = box;
          $pimg = box.find('>img');
          var xsize = $pcnt.width();
          var ysize = $pcnt.height();
          var rx = xsize / c.w;
          var ry = ysize / c.h;

          $pimg.css({
            width: Math.round(rx * boundx) + 'px',
            height: Math.round(ry * boundy) + 'px',
            marginLeft: '-' + Math.round(rx * c.x) + 'px',
            marginTop: '-' + Math.round(ry * c.y) + 'px'
          });

        }

        function getCropResult(){
            try{
                var r_w = Math.round(__cropRange.w / boundx * __origWidth);
                var r_h = Math.round(__cropRange.h / boundy * __origHeight);
                var r_x = Math.round(__cropRange.x / boundx * __origWidth);
                var r_y = Math.round(__cropRange.y / boundy * __origHeight);

                return { 'pic' : __cropPic , 'crop':{ x:r_x ,y:r_y , w: r_w, h:r_h }};
            }catch(ex){
                return false;
            }
        }

        window.__cropDoneCallback = function(rs){
            $('#imgCropPop .panel-btn-ok').attr('disabled', false).html('确定');

            if(rs.errno == 0){
                _cropPopup.hide();
                var smallpic = rs.picsrc.replace(/(\w+\.\w+)$/i, 'edr/70__/$1');
                
                if( $('#'+_click_id).attr('data-previmg') ){

                    $($('#'+_click_id).attr('data-previmg')).attr('src', rs.picsrc);

                }else{
                    if($('#cropResultPic').length > 0){
                        $('#cropResultPic').attr('src', smallpic);
                    }else{
                        $('<img id="cropResultPic" width="70" height="70" class="crop-result-pic" src="'+smallpic+'">').insertAfter('#'+_click_id);
                    }
                }

                if( $('#'+_click_id).attr('data-input') ){
                    $(  $('#'+_click_id).attr('data-input') ).val( rs.picsrc );
                }else{
                    $('#productImgInput').val( rs.picsrc );
                }               
                
                $('#'+_click_id).html('重新编辑');
            }
        }
        function submit(){
            
            var rs = getCropResult();

            if(!rs){ return;}

            $('#cropCompleteForm [name="crop_pic"]').val( rs.pic );

            $('#cropCompleteForm [name="crop_x"]').val( rs.crop.x );
            $('#cropCompleteForm [name="crop_y"]').val( rs.crop.y );
            $('#cropCompleteForm [name="crop_width"]').val( rs.crop.w );
            $('#cropCompleteForm [name="crop_height"]').val( rs.crop.h );

            $('#cropCompleteForm [name="callback"]').val( "parent.__cropDoneCallback");

            $('#cropCompleteForm').submit();

            $('#imgCropPop .panel-btn-ok').attr('disabled', true).html('处理中...');
        }

        return { 
            init : init,
            getCropResult : getCropResult,
            submit : submit
        }
      })();

    initEditor();
});