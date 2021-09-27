<?php
return array(
	'DEBUG'                       	=>	true ,              //是否是debug模式，debug模式下打印各个功能编译时间
	'CACHE'                       	=>	true ,              //是否开启缓存编译
	'TPL_ENGINE'                  	=>	'smarty' ,          //模版引擎，支持Smarty和PHP
	'TPL_LEFT_DELIMITER'          	=>	'{%' ,              //smarty左界符
	'TPL_RIGHT_DELIMITER'         	=>	'%}' ,              //smarty右界符
	'TPL_SUFFIX'                  	=>	'tpl' ,             //模板文件后缀名
	'TPL_PATH'                    	=>	'src/application/views/tpls' ,//模板目录
	'STATIC_PATH'                 	=>	'src/www/resources/' ,//静态资源的目录
	'PLUGINS_PATH'                	=>	'smarty_plugins' ,  //模版插件目录
	'FILE_ENCODING'               	=>	'utf-8' ,           //项目编码
	'MOD_DIRS_CHECK'              	=>	false ,             //目录结构检测
	'MOD_FILE_CHECK'              	=>	false ,             //文件命名和位置检测
	'MOD_HTML_REGULAR_CHECK'      	=>	true ,              //HTML规范检测
	'MOD_TPL_SYNTAX_CHECK'        	=>	false ,             //模板语法检查
	'MOD_USELESS_FILE_CHECK'      	=>	false ,             //检测不在使用的文件, 主要是图片文件
	'MOD_EMPTY_CHECK'             	=>	true ,              //空文件检测
	'MOD_CSS_SPRITES'             	=>	false ,             //是否进行css sprites
	'MOD_CSS_AUTOCOMPLETE'        	=>	false ,             //css样式自动补全
	'MOD_JS_COMBINE'              	=>	true ,              //JS文件是否启用合并
	'MOD_CSS_COMBINE'             	=>	false ,             //CSS文件是否启用合并
	'MOD_HTML_COMPRESS'           	=>	false ,             //HTML文件是否启用压缩
	'MOD_JS_COMPRESS'             	=>	true ,              //JS文件是否启用压缩
	'MOD_CSS_COMPRESS'            	=>	false ,             //CSS文件是否启用压缩
	'MOD_OPTI_IMG'                	=>	false ,             //是否优化图片
	'MOD_XSS_AUTO_FIXED'          	=>	false ,             //是否进行XSS自动修复
	'MOD_IMG_DATAURI'             	=>	false ,             //将CSS中的图片地址转换为dataURI
	'MOD_STATIC_TO_CDN'           	=>	false ,             //是否将静态资源上线到CDN
	'MOD_JS_TPL_REPLACE'          	=>	false ,             //是否进行前端模版替换
	'MOD_STRING_REPLACE'          	=>	true ,              //是否进行代码替换功能
	'MOD_STATIC_VERSION'          	=>	1 ,                 //静态文件版本号，1或者true为query,2为新文件模式
	'DEBUG'                       	=>	true ,              
	'CACHE'                       	=>	true ,              
	'CSS_SPRITES_REGULAR'         	=>	'' ,                
	'MOD_CSS3_AUTOCOMPLETE'       	=>	false ,             
	'XSS_ESCAPE'                  	=>	array(              
		'url'               	=>	'', 
		'html'              	=>	'', 
		'js'                	=>	'', 
		'callback'          	=>	'', 
		'data'              	=>	'', 
		'event'             	=>	'', 
		'noescape'          	=>	'', 
		'xml'               	=>	''
	),
	'XSS_SAFE_VAR'                	=>	array(              
		'/^(?:Domain)/ies'
	),
	'IMG_DATAURI_MAX_SIZE'        	=>	3000 ,              
	'STRING_REPLACE_PATTERN'      	=>	array(              
	),
	'SIMPLE_MODE'                 	=>	false ,             
	'ONLINE_SVN_VERSION'          	=>	8409 ,              
);
