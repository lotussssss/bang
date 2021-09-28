(function($) {
    document.domain='360.cn';

    $.extend($, {
        createUploadIframe: function(id, uri) {
            var frameId = 'jUploadFrame' + id;
            return $("<iframe />", {
                id: frameId,
                name: frameId,
                style: "position:absolute; top:-9999px; left:-9999px",
                //src: window.location.protocol+'//'+ window.location.host
                src: window.ActiveXObject ?
                    (typeof uri == 'boolean' ?
                        "javascript:false" :
                        (typeof uri == 'string' ? uri : "")
                    ) : ""
            }).appendTo("body");
        },
        createUploadForm: function(id, fileElementId, data) {
            //create form	
            var formId = 'jUploadForm' + id,
                fileId = 'jUploadFile' + id,
                $file = $("#" + fileElementId),
                $form = $("<form />", {
                    action: "",
                    method: "POST",
                    name: formId,
                    id: formId,
                    enctype: "multipart/form-data"
                });
            if(data)
                for(var i in data)
                    $form.append($("<input />", {
                        type: "hidden",
                        name: i,
                        value: data[i]
                    }));
            $file.before($file.clone());
            return $form.append($file.attr("id", fileId))
                .css({
                    position: "absolute",
                    top: "-1200px",
                    left: "-1200px"
                }).appendTo("body");
        },
        ajaxFileUpload: function(s) {
            // TODO introduce global settings, allowing the client to modify them for all requests, not only timeout
            s = $.extend({}, $.ajaxSettings, s);
            var id = (new Date()).getTime(),
                form = $.createUploadForm(id, s.fileElementId, (typeof(s.data) == 'undefined' ? false : s.data)),
                $io = $.createUploadIframe(id, s.secureuri),
                io = $io.get(0),
                frameId = 'jUploadFrame' + id,
                formId = 'jUploadForm' + id,
                xml = {},
                status,
                requestDone = false;

            var uploadCallback = function(isTimeout) {
                if(io.contentWindow) {
                    xml.responseText = io.contentWindow.document.body ? io.contentWindow.document.body.innerHTML : null;
                    xml.responseXML = io.contentWindow.document.XMLDocument ? io.contentWindow.document.XMLDocument : io.contentWindow.document;
                } else if(io.contentDocument) {
                    xml.responseText = io.contentDocument.document.body ? io.contentDocument.document.body.innerHTML : null;
                    xml.responseXML = io.contentDocument.document.XMLDocument ? io.contentDocument.document.XMLDocument : io.contentDocument.document;
                }
                if(xml || isTimeout == "timeout") {
                    requestDone = true;
                    status = isTimeout != "timeout" ? "success" : "error";
                    // Make sure that the request was successful or notmodified
                    if(status != "error") {
                        // process the data (runs the xml through httpData regardless of callback)
                        var data = $.uploadHttpData(xml, s.dataType);
                        // If a local callback was specified, fire it and pass it the data
                        if(s.success)
                            s.success(data, status);
                        if(s.complete)
                            s.complete(xml, status);
                        setTimeout(function() {
                            $io.remove();
                            form.remove();
                        }, 100);
                        xml = null
                    }
                }
            };
            // Timeout checker
            if(s.timeout > 0) {
                setTimeout(function() {
                    // Check to see if the request is still happening
                    if(!requestDone) uploadCallback("timeout");
                }, s.timeout);
            }
            form.attr({
                action: s.url,
                target: frameId
            }).submit();
            $io.on("load", uploadCallback);
        },
        uploadHttpData: function(r, type) {
            var data = type == "xml" || !type ? r.responseXML : r.responseText;
            if(type == "json")
                data = JSON.parse(data);
            return data;
        }
    })
})(Zepto);
