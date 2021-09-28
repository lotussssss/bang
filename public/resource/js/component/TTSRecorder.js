!function (global) {
    global.TTSRecorder = TTSRecorder

    /**
     * 科大讯飞文字转语音
     * @param options
     *          三个必传参数：
     *          appId
     *          url
     *          transWorker
     * @constructor
     */
    function TTSRecorder(options) {
        var me = this
        var defaults = {
            url: '',
            speed: 50,
            voice: 50,
            pitch: 50,
            voiceName: 'xiaoyan',
            appId: '',
            text: '',
            tte: 'UTF8',
            bgs: 1,
            defaultText: '请输入您要合成的文本',
            transWorker: null
        }
        options = tcb.mix(defaults, options)
        if (!options.url) {
            return console.error('url不能为空')
        }
        if (!options.appId) {
            return console.error('appId不能为空')
        }
        if (!options.transWorker) {
            return console.error('transWorker不能为空')
        }
        this.url = options.url
        this.speed = options.speed
        this.voice = options.voice
        this.pitch = options.pitch
        this.voiceName = options.voiceName
        this.text = options.text
        this.tte = options.tte
        this.bgs = options.bgs
        this.defaultText = options.defaultText
        this.appId = options.appId
        this.audioData = []
        this.rawAudioData = []
        this.audioDataOffset = 0
        this.status = 'init'
        this.transWorker = options.transWorker

        this.transWorker.onmessage = function (e) {
            tcb.each(e.data.data || [], function (i, item) {
                me.audioData.push(item)
            })
            tcb.each(e.data.rawAudioData || [], function (i, item) {
                me.rawAudioData.push(item)
            })
        }
    }

    TTSRecorder.prototype = {
        constructor: TTSRecorder,

        // 修改录音听写状态
        setStatus: function (status) {
            this.onWillStatusChange && this.onWillStatusChange(this.status, status)
            this.status = status
        },
        // 设置合成相关参数
        setParams: function (params) {
            params = params || {}
            var speed = params.speed,
                voice = params.voice,
                pitch = params.pitch,
                text = params.text,
                voiceName = params.voiceName,
                tte = params.tte,
                bgs = params.bgs
            speed !== undefined && (this.speed = speed)
            voice !== undefined && (this.voice = voice)
            pitch !== undefined && (this.pitch = pitch)
            text && (this.text = text)
            tte && (this.tte = tte)
            voiceName && (this.voiceName = voiceName)
            this.bgs = parseInt(bgs, 10) || 0

            this.resetAudio()
        },
        // 连接websocket
        connectWebSocket: function () {
            var me = this
            me.setStatus('ttsing')
            var ttsWS
            var url = me.url
            if ('WebSocket' in global) {
                ttsWS = new WebSocket(url)
            } else if ('MozWebSocket' in global) {
                ttsWS = new MozWebSocket(url)
            } else {
                alert('浏览器不支持WebSocket')
                return
            }
            me.ttsWS = ttsWS
            ttsWS.onopen = function (e) {
                me.webSocketSend()
                me.playTimeout = setTimeout(function () {
                    me.audioPlay()
                }, 1000)
            }
            ttsWS.onmessage = function (e) {
                me.result(e.data)
            }
            ttsWS.onerror = function (e) {
                clearTimeout(me.playTimeout)
                me.setStatus('errorTTS')
                alert('WebSocket报错，请f12查看详情')
                console.error('详情查看：' + encodeURI(url.replace('wss:', 'https:')))
            }
            ttsWS.onclose = function (e) {
                console.log(e)
            }
        },
        // 处理音频数据
        transToAudioData: function (audioData) {},
        // websocket发送数据
        webSocketSend: function () {
            var params = {
                common: {
                    app_id: this.appId // APPID
                },
                business: {
                    aue: 'raw',
                    auf: 'audio/L16;rate=16000',
                    vcn: this.voiceName,
                    speed: this.speed,
                    volume: this.voice,
                    pitch: this.pitch,
                    // bgs: 1,
                    bgs: this.bgs,
                    tte: this.tte
                },
                data: {
                    status: 2,
                    text: this.encodeText(
                        this.text || this.defaultText,
                        this.tte === 'unicode' ? 'base64&utf16le' : ''
                    )
                }
            }
            this.ttsWS.send(JSON.stringify(params))
        },
        encodeText: function (text, encoding) {
            switch (encoding) {
                case 'utf16le' : {
                    var buf = new ArrayBuffer(text.length * 4)
                    var bufView = new Uint16Array(buf)
                    for (var i = 0, strlen = text.length; i < strlen; i++) {
                        bufView[i] = text.charCodeAt(i)
                    }
                    return buf
                }
                case 'buffer2Base64': {
                    var binary = ''
                    var bytes = new Uint8Array(text)
                    var len = bytes.byteLength
                    for (var i = 0; i < len; i++) {
                        binary += String.fromCharCode(bytes[i])
                    }
                    return global.btoa(binary)
                }
                case 'base64&utf16le' : {
                    return this.encodeText(this.encodeText(text, 'utf16le'), 'buffer2Base64')
                }
                default : {
                    return Base64.encode(text)
                }
            }
        },
        // websocket接收数据的处理
        result: function (resultData) {
            var jsonData = JSON.parse(resultData)
            // 合成失败
            if (jsonData.code !== 0) {
                alert('合成失败: ' + jsonData.code + ':' + jsonData.message)
                console.error(jsonData.code + ':' + jsonData.message)
                this.resetAudio()
                return
            }
            this.transWorker.postMessage(jsonData.data.audio)

            if (jsonData.code === 0 && jsonData.data.status === 2) {
                this.ttsWS.close()
            }
        },
        // 重置音频数据
        resetAudio: function () {
            this.audioStop()
            this.setStatus('init')
            this.audioDataOffset = 0
            this.audioData = []
            this.rawAudioData = []
            this.ttsWS && this.ttsWS.close()
            clearTimeout(this.playTimeout)
        },
        // 音频初始化
        audioInit: function () {
            var AudioContext = global.AudioContext || global.webkitAudioContext
            if (AudioContext) {
                this.audioContext = new AudioContext()
                this.audioContext.resume()
                this.audioDataOffset = 0
            }
        },
        // 音频播放
        audioPlay: function () {
            var me = this
            this.setStatus('play')
            var audioData = this.audioData.slice(this.audioDataOffset)
            this.audioDataOffset += audioData.length
            var audioBuffer = this.audioContext.createBuffer(1, audioData.length, 22050)
            var nowBuffering = audioBuffer.getChannelData(0)
            if (audioBuffer.copyToChannel) {
                audioBuffer.copyToChannel(new Float32Array(audioData), 0, 0)
            } else {
                for (var i = 0; i < audioData.length; i++) {
                    nowBuffering[i] = audioData[i]
                }
            }
            var bufferSource = this.bufferSource = this.audioContext.createBufferSource()
            bufferSource.buffer = audioBuffer
            bufferSource.connect(this.audioContext.destination)
            bufferSource.start()
            bufferSource.onended = function (event) {
                if (me.status !== 'play') {
                    return
                }
                if (me.audioDataOffset < me.audioData.length) {
                    me.audioPlay()
                } else {
                    me.audioStop()
                }
            }
        },
        // 音频播放结束
        audioStop: function () {
            this.setStatus('endPlay')
            clearTimeout(this.playTimeout)
            this.audioDataOffset = 0
            if (this.bufferSource) {
                try {
                    this.bufferSource.stop()
                } catch (e) {
                    console.log(e)
                }
            }
        },
        start: function () {
            if (this.audioData.length) {
                this.audioPlay()
            } else {
                if (!this.audioContext) {
                    this.audioInit()
                }
                if (!this.audioContext) {
                    alert('该浏览器不支持webAudioApi相关接口')
                    return
                }
                this.connectWebSocket()
            }
        },
        stop: function () {
            this.audioStop()
        }
    }
}(window)
