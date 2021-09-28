;/**import from `/resource/js/lib/m/exif.js` **/
(function() {

    var debug = false;

    var root = this;

    var EXIF = function(obj) {
        if (obj instanceof EXIF) return obj;
        if (!(this instanceof EXIF)) return new EXIF(obj);
        this.EXIFwrapped = obj;
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = EXIF;
        }
        exports.EXIF = EXIF;
    } else {
        root.EXIF = EXIF;
    }

    var ExifTags = EXIF.Tags = {

        // version tags
        0x9000 : "ExifVersion",             // EXIF version
        0xA000 : "FlashpixVersion",         // Flashpix format version

        // colorspace tags
        0xA001 : "ColorSpace",              // Color space information tag

        // image configuration
        0xA002 : "PixelXDimension",         // Valid width of meaningful image
        0xA003 : "PixelYDimension",         // Valid height of meaningful image
        0x9101 : "ComponentsConfiguration", // Information about channels
        0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

        // user information
        0x927C : "MakerNote",               // Any desired information written by the manufacturer
        0x9286 : "UserComment",             // Comments by user

        // related file
        0xA004 : "RelatedSoundFile",        // Name of related sound file

        // date and time
        0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
        0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
        0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
        0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
        0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

        // picture-taking conditions
        0x829A : "ExposureTime",            // Exposure time (in seconds)
        0x829D : "FNumber",                 // F number
        0x8822 : "ExposureProgram",         // Exposure program
        0x8824 : "SpectralSensitivity",     // Spectral sensitivity
        0x8827 : "ISOSpeedRatings",         // ISO speed rating
        0x8828 : "OECF",                    // Optoelectric conversion factor
        0x9201 : "ShutterSpeedValue",       // Shutter speed
        0x9202 : "ApertureValue",           // Lens aperture
        0x9203 : "BrightnessValue",         // Value of brightness
        0x9204 : "ExposureBias",            // Exposure bias
        0x9205 : "MaxApertureValue",        // Smallest F number of lens
        0x9206 : "SubjectDistance",         // Distance to subject in meters
        0x9207 : "MeteringMode",            // Metering mode
        0x9208 : "LightSource",             // Kind of light source
        0x9209 : "Flash",                   // Flash status
        0x9214 : "SubjectArea",             // Location and area of main subject
        0x920A : "FocalLength",             // Focal length of the lens in mm
        0xA20B : "FlashEnergy",             // Strobe energy in BCPS
        0xA20C : "SpatialFrequencyResponse",    //
        0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
        0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
        0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
        0xA214 : "SubjectLocation",         // Location of subject in image
        0xA215 : "ExposureIndex",           // Exposure index selected on camera
        0xA217 : "SensingMethod",           // Image sensor type
        0xA300 : "FileSource",              // Image source (3 == DSC)
        0xA301 : "SceneType",               // Scene type (1 == directly photographed)
        0xA302 : "CFAPattern",              // Color filter array geometric pattern
        0xA401 : "CustomRendered",          // Special processing
        0xA402 : "ExposureMode",            // Exposure mode
        0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
        0xA404 : "DigitalZoomRation",       // Digital zoom ratio
        0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
        0xA406 : "SceneCaptureType",        // Type of scene
        0xA407 : "GainControl",             // Degree of overall image gain adjustment
        0xA408 : "Contrast",                // Direction of contrast processing applied by camera
        0xA409 : "Saturation",              // Direction of saturation processing applied by camera
        0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
        0xA40B : "DeviceSettingDescription",    //
        0xA40C : "SubjectDistanceRange",    // Distance to subject

        // other tags
        0xA005 : "InteroperabilityIFDPointer",
        0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
    };

    var TiffTags = EXIF.TiffTags = {
        0x0100 : "ImageWidth",
        0x0101 : "ImageHeight",
        0x8769 : "ExifIFDPointer",
        0x8825 : "GPSInfoIFDPointer",
        0xA005 : "InteroperabilityIFDPointer",
        0x0102 : "BitsPerSample",
        0x0103 : "Compression",
        0x0106 : "PhotometricInterpretation",
        0x0112 : "Orientation",
        0x0115 : "SamplesPerPixel",
        0x011C : "PlanarConfiguration",
        0x0212 : "YCbCrSubSampling",
        0x0213 : "YCbCrPositioning",
        0x011A : "XResolution",
        0x011B : "YResolution",
        0x0128 : "ResolutionUnit",
        0x0111 : "StripOffsets",
        0x0116 : "RowsPerStrip",
        0x0117 : "StripByteCounts",
        0x0201 : "JPEGInterchangeFormat",
        0x0202 : "JPEGInterchangeFormatLength",
        0x012D : "TransferFunction",
        0x013E : "WhitePoint",
        0x013F : "PrimaryChromaticities",
        0x0211 : "YCbCrCoefficients",
        0x0214 : "ReferenceBlackWhite",
        0x0132 : "DateTime",
        0x010E : "ImageDescription",
        0x010F : "Make",
        0x0110 : "Model",
        0x0131 : "Software",
        0x013B : "Artist",
        0x8298 : "Copyright"
    };

    var GPSTags = EXIF.GPSTags = {
        0x0000 : "GPSVersionID",
        0x0001 : "GPSLatitudeRef",
        0x0002 : "GPSLatitude",
        0x0003 : "GPSLongitudeRef",
        0x0004 : "GPSLongitude",
        0x0005 : "GPSAltitudeRef",
        0x0006 : "GPSAltitude",
        0x0007 : "GPSTimeStamp",
        0x0008 : "GPSSatellites",
        0x0009 : "GPSStatus",
        0x000A : "GPSMeasureMode",
        0x000B : "GPSDOP",
        0x000C : "GPSSpeedRef",
        0x000D : "GPSSpeed",
        0x000E : "GPSTrackRef",
        0x000F : "GPSTrack",
        0x0010 : "GPSImgDirectionRef",
        0x0011 : "GPSImgDirection",
        0x0012 : "GPSMapDatum",
        0x0013 : "GPSDestLatitudeRef",
        0x0014 : "GPSDestLatitude",
        0x0015 : "GPSDestLongitudeRef",
        0x0016 : "GPSDestLongitude",
        0x0017 : "GPSDestBearingRef",
        0x0018 : "GPSDestBearing",
        0x0019 : "GPSDestDistanceRef",
        0x001A : "GPSDestDistance",
        0x001B : "GPSProcessingMethod",
        0x001C : "GPSAreaInformation",
        0x001D : "GPSDateStamp",
        0x001E : "GPSDifferential"
    };

     // EXIF 2.3 Spec
    var IFD1Tags = EXIF.IFD1Tags = {
        0x0100: "ImageWidth",
        0x0101: "ImageHeight",
        0x0102: "BitsPerSample",
        0x0103: "Compression",
        0x0106: "PhotometricInterpretation",
        0x0111: "StripOffsets",
        0x0112: "Orientation",
        0x0115: "SamplesPerPixel",
        0x0116: "RowsPerStrip",
        0x0117: "StripByteCounts",
        0x011A: "XResolution",
        0x011B: "YResolution",
        0x011C: "PlanarConfiguration",
        0x0128: "ResolutionUnit",
        0x0201: "JpegIFOffset",    // When image format is JPEG, this value show offset to JPEG data stored.(aka "ThumbnailOffset" or "JPEGInterchangeFormat")
        0x0202: "JpegIFByteCount", // When image format is JPEG, this value shows data size of JPEG image (aka "ThumbnailLength" or "JPEGInterchangeFormatLength")
        0x0211: "YCbCrCoefficients",
        0x0212: "YCbCrSubSampling",
        0x0213: "YCbCrPositioning",
        0x0214: "ReferenceBlackWhite"
    };

    var StringValues = EXIF.StringValues = {
        ExposureProgram : {
            0 : "Not defined",
            1 : "Manual",
            2 : "Normal program",
            3 : "Aperture priority",
            4 : "Shutter priority",
            5 : "Creative program",
            6 : "Action program",
            7 : "Portrait mode",
            8 : "Landscape mode"
        },
        MeteringMode : {
            0 : "Unknown",
            1 : "Average",
            2 : "CenterWeightedAverage",
            3 : "Spot",
            4 : "MultiSpot",
            5 : "Pattern",
            6 : "Partial",
            255 : "Other"
        },
        LightSource : {
            0 : "Unknown",
            1 : "Daylight",
            2 : "Fluorescent",
            3 : "Tungsten (incandescent light)",
            4 : "Flash",
            9 : "Fine weather",
            10 : "Cloudy weather",
            11 : "Shade",
            12 : "Daylight fluorescent (D 5700 - 7100K)",
            13 : "Day white fluorescent (N 4600 - 5400K)",
            14 : "Cool white fluorescent (W 3900 - 4500K)",
            15 : "White fluorescent (WW 3200 - 3700K)",
            17 : "Standard light A",
            18 : "Standard light B",
            19 : "Standard light C",
            20 : "D55",
            21 : "D65",
            22 : "D75",
            23 : "D50",
            24 : "ISO studio tungsten",
            255 : "Other"
        },
        Flash : {
            0x0000 : "Flash did not fire",
            0x0001 : "Flash fired",
            0x0005 : "Strobe return light not detected",
            0x0007 : "Strobe return light detected",
            0x0009 : "Flash fired, compulsory flash mode",
            0x000D : "Flash fired, compulsory flash mode, return light not detected",
            0x000F : "Flash fired, compulsory flash mode, return light detected",
            0x0010 : "Flash did not fire, compulsory flash mode",
            0x0018 : "Flash did not fire, auto mode",
            0x0019 : "Flash fired, auto mode",
            0x001D : "Flash fired, auto mode, return light not detected",
            0x001F : "Flash fired, auto mode, return light detected",
            0x0020 : "No flash function",
            0x0041 : "Flash fired, red-eye reduction mode",
            0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
            0x0047 : "Flash fired, red-eye reduction mode, return light detected",
            0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059 : "Flash fired, auto mode, red-eye reduction mode",
            0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod : {
            1 : "Not defined",
            2 : "One-chip color area sensor",
            3 : "Two-chip color area sensor",
            4 : "Three-chip color area sensor",
            5 : "Color sequential area sensor",
            7 : "Trilinear sensor",
            8 : "Color sequential linear sensor"
        },
        SceneCaptureType : {
            0 : "Standard",
            1 : "Landscape",
            2 : "Portrait",
            3 : "Night scene"
        },
        SceneType : {
            1 : "Directly photographed"
        },
        CustomRendered : {
            0 : "Normal process",
            1 : "Custom process"
        },
        WhiteBalance : {
            0 : "Auto white balance",
            1 : "Manual white balance"
        },
        GainControl : {
            0 : "None",
            1 : "Low gain up",
            2 : "High gain up",
            3 : "Low gain down",
            4 : "High gain down"
        },
        Contrast : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        Saturation : {
            0 : "Normal",
            1 : "Low saturation",
            2 : "High saturation"
        },
        Sharpness : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        SubjectDistanceRange : {
            0 : "Unknown",
            1 : "Macro",
            2 : "Close view",
            3 : "Distant view"
        },
        FileSource : {
            3 : "DSC"
        },

        Components : {
            0 : "",
            1 : "Y",
            2 : "Cb",
            3 : "Cr",
            4 : "R",
            5 : "G",
            6 : "B"
        }
    };

    function addEvent(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    }

    function imageHasData(img) {
        return !!(img.exifdata);
    }


    function base64ToArrayBuffer(base64, contentType) {
        contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        var binary = atob(base64);
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

    function objectURLToBlob(url, callback) {
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.responseType = "blob";
        http.onload = function(e) {
            if (this.status == 200 || this.status === 0) {
                callback(this.response);
            }
        };
        http.send();
    }

    function getImageData(img, callback) {
        function handleBinaryFile(binFile) {
            var data = findEXIFinJPEG(binFile);
            img.exifdata = data || {};
            var iptcdata = findIPTCinJPEG(binFile);
            img.iptcdata = iptcdata || {};
            if (EXIF.isXmpEnabled) {
               var xmpdata= findXMPinJPEG(binFile);
               img.xmpdata = xmpdata || {};               
            }
            if (callback) {
                callback.call(img);
            }
        }

        if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
                var arrayBuffer = base64ToArrayBuffer(img.src);
                handleBinaryFile(arrayBuffer);

            } else if (/^blob\:/i.test(img.src)) { // Object URL
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    handleBinaryFile(e.target.result);
                };
                objectURLToBlob(img.src, function (blob) {
                    fileReader.readAsArrayBuffer(blob);
                });
            } else {
                var http = new XMLHttpRequest();
                http.onload = function() {
                    if (this.status == 200 || this.status === 0) {
                        handleBinaryFile(http.response);
                    } else {
                        throw "Could not load image";
                    }
                    http = null;
                };
                http.open("GET", img.src, true);
                http.responseType = "arraybuffer";
                http.send(null);
            }
        } else if (self.FileReader && (img instanceof self.Blob || img instanceof self.File)) {
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                if (debug) console.log("Got file of length " + e.target.result.byteLength);
                handleBinaryFile(e.target.result);
            };

            fileReader.readAsArrayBuffer(img);
        }
    }

    function findEXIFinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength,
            marker;

        while (offset < length) {
            if (dataView.getUint8(offset) != 0xFF) {
                if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
                return false; // not a valid marker, something is wrong
            }

            marker = dataView.getUint8(offset + 1);
            if (debug) console.log(marker);

            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data

            if (marker == 225) {
                if (debug) console.log("Found 0xFFE1 marker");

                return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

                // offset += 2 + file.getShortAt(offset+2, true);

            } else {
                offset += 2 + dataView.getUint16(offset+2);
            }

        }

    }

    function findIPTCinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength;


        var isFieldSegmentStart = function(dataView, offset){
            return (
                dataView.getUint8(offset) === 0x38 &&
                dataView.getUint8(offset+1) === 0x42 &&
                dataView.getUint8(offset+2) === 0x49 &&
                dataView.getUint8(offset+3) === 0x4D &&
                dataView.getUint8(offset+4) === 0x04 &&
                dataView.getUint8(offset+5) === 0x04
            );
        };

        while (offset < length) {

            if ( isFieldSegmentStart(dataView, offset )){

                // Get the length of the name header (which is padded to an even number of bytes)
                var nameHeaderLength = dataView.getUint8(offset+7);
                if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
                // Check for pre photoshop 6 format
                if(nameHeaderLength === 0) {
                    // Always 4
                    nameHeaderLength = 4;
                }

                var startOffset = offset + 8 + nameHeaderLength;
                var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

                return readIPTCData(file, startOffset, sectionLength);

                break;

            }


            // Not the marker, continue searching
            offset++;

        }

    }
    var IptcFieldMap = {
        0x78 : 'caption',
        0x6E : 'credit',
        0x19 : 'keywords',
        0x37 : 'dateCreated',
        0x50 : 'byline',
        0x55 : 'bylineTitle',
        0x7A : 'captionWriter',
        0x69 : 'headline',
        0x74 : 'copyright',
        0x0F : 'category'
    };
    function readIPTCData(file, startOffset, sectionLength){
        var dataView = new DataView(file);
        var data = {};
        var fieldValue, fieldName, dataSize, segmentType, segmentSize;
        var segmentStartPos = startOffset;
        while(segmentStartPos < startOffset+sectionLength) {
            if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
                segmentType = dataView.getUint8(segmentStartPos+2);
                if(segmentType in IptcFieldMap) {
                    dataSize = dataView.getInt16(segmentStartPos+3);
                    segmentSize = dataSize + 5;
                    fieldName = IptcFieldMap[segmentType];
                    fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
                    // Check if we already stored a value with this name
                    if(data.hasOwnProperty(fieldName)) {
                        // Value already stored with this name, create multivalue field
                        if(data[fieldName] instanceof Array) {
                            data[fieldName].push(fieldValue);
                        }
                        else {
                            data[fieldName] = [data[fieldName], fieldValue];
                        }
                    }
                    else {
                        data[fieldName] = fieldValue;
                    }
                }

            }
            segmentStartPos++;
        }
        return data;
    }



    function readTags(file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getUint16(dirStart, !bigEnd),
            tags = {},
            entryOffset, tag,
            i;

        for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
            tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
        }
        return tags;
    }


    function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getUint16(entryOffset+2, !bigEnd),
            numValues = file.getUint32(entryOffset+4, !bigEnd),
            valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }

            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return getStringFromDB(file, offset, numValues-1);

            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                    }
                    return vals;
                }

            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 5:    // rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset+4, !bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                        denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                    }
                    return vals;
                }
        }
    }

    /**
    * Given an IFD (Image File Directory) start offset
    * returns an offset to next IFD or 0 if it's the last IFD.
    */
    function getNextIFDOffset(dataView, dirStart, bigEnd){
        //the first 2bytes means the number of directory entries contains in this IFD
        var entries = dataView.getUint16(dirStart, !bigEnd);

        // After last directory entry, there is a 4bytes of data,
        // it means an offset to next IFD.
        // If its value is '0x00000000', it means this is the last IFD and there is no linked IFD.

        return dataView.getUint32(dirStart + 2 + entries * 12, !bigEnd); // each entry is 12 bytes long
    }

    function readThumbnailImage(dataView, tiffStart, firstIFDOffset, bigEnd){
        // get the IFD1 offset
        var IFD1OffsetPointer = getNextIFDOffset(dataView, tiffStart+firstIFDOffset, bigEnd);

        if (!IFD1OffsetPointer) {
            // console.log('******** IFD1Offset is empty, image thumb not found ********');
            return {};
        }
        else if (IFD1OffsetPointer > dataView.byteLength) { // this should not happen
            // console.log('******** IFD1Offset is outside the bounds of the DataView ********');
            return {};
        }
        // console.log('*******  thumbnail IFD offset (IFD1) is: %s', IFD1OffsetPointer);

        var thumbTags = readTags(dataView, tiffStart, tiffStart + IFD1OffsetPointer, IFD1Tags, bigEnd)

        // EXIF 2.3 specification for JPEG format thumbnail

        // If the value of Compression(0x0103) Tag in IFD1 is '6', thumbnail image format is JPEG.
        // Most of Exif image uses JPEG format for thumbnail. In that case, you can get offset of thumbnail
        // by JpegIFOffset(0x0201) Tag in IFD1, size of thumbnail by JpegIFByteCount(0x0202) Tag.
        // Data format is ordinary JPEG format, starts from 0xFFD8 and ends by 0xFFD9. It seems that
        // JPEG format and 160x120pixels of size are recommended thumbnail format for Exif2.1 or later.

        if (thumbTags['Compression']) {
            // console.log('Thumbnail image found!');

            switch (thumbTags['Compression']) {
                case 6:
                    // console.log('Thumbnail image format is JPEG');
                    if (thumbTags.JpegIFOffset && thumbTags.JpegIFByteCount) {
                    // extract the thumbnail
                        var tOffset = tiffStart + thumbTags.JpegIFOffset;
                        var tLength = thumbTags.JpegIFByteCount;
                        thumbTags['blob'] = new Blob([new Uint8Array(dataView.buffer, tOffset, tLength)], {
                            type: 'image/jpeg'
                        });
                    }
                break;

            case 1:
                console.log("Thumbnail image format is TIFF, which is not implemented.");
                break;
            default:
                console.log("Unknown thumbnail image format '%s'", thumbTags['Compression']);
            }
        }
        else if (thumbTags['PhotometricInterpretation'] == 2) {
            console.log("Thumbnail image format is RGB, which is not implemented.");
        }
        return thumbTags;
    }

    function getStringFromDB(buffer, start, length) {
        var outstr = "";
        for (var n = start; n < start+length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
        }
        return outstr;
    }

    function readEXIFData(file, start) {
        if (getStringFromDB(file, start, 4) != "Exif") {
            if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
            return false;
        }

        var bigEnd,
            tags, tag,
            exifData, gpsData,
            tiffOffset = start + 6;

        // test for TIFF validity and endianness
        if (file.getUint16(tiffOffset) == 0x4949) {
            bigEnd = false;
        } else if (file.getUint16(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        } else {
            if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }

        if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
            if (debug) console.log("Not valid TIFF data! (no 0x002A)");
            return false;
        }

        var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

        if (firstIFDOffset < 0x00000008) {
            if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
            return false;
        }

        tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

        if (tags.ExifIFDPointer) {
            exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource" :
                    case "Flash" :
                    case "MeteringMode" :
                    case "ExposureProgram" :
                    case "SensingMethod" :
                    case "SceneCaptureType" :
                    case "SceneType" :
                    case "CustomRendered" :
                    case "WhiteBalance" :
                    case "GainControl" :
                    case "Contrast" :
                    case "Saturation" :
                    case "Sharpness" :
                    case "SubjectDistanceRange" :
                    case "FileSource" :
                        exifData[tag] = StringValues[tag][exifData[tag]];
                        break;

                    case "ExifVersion" :
                    case "FlashpixVersion" :
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;

                    case "ComponentsConfiguration" :
                        exifData[tag] =
                            StringValues.Components[exifData[tag][0]] +
                            StringValues.Components[exifData[tag][1]] +
                            StringValues.Components[exifData[tag][2]] +
                            StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }

        if (tags.GPSInfoIFDPointer) {
            gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID" :
                        gpsData[tag] = gpsData[tag][0] +
                            "." + gpsData[tag][1] +
                            "." + gpsData[tag][2] +
                            "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }

        // extract thumbnail
        tags['thumbnail'] = readThumbnailImage(file, tiffOffset, firstIFDOffset, bigEnd);

        return tags;
    }

   function findXMPinJPEG(file) {

        if (!('DOMParser' in self)) {
            // console.warn('XML parsing not supported without DOMParser');
            return;
        }
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
           if (debug) console.log("Not a valid JPEG");
           return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength,
            dom = new DOMParser();

        while (offset < (length-4)) {
            if (getStringFromDB(dataView, offset, 4) == "http") {
                var startOffset = offset - 1;
                var sectionLength = dataView.getUint16(offset - 2) - 1;
                var xmpString = getStringFromDB(dataView, startOffset, sectionLength)
                var xmpEndIndex = xmpString.indexOf('xmpmeta>') + 8;
                xmpString = xmpString.substring( xmpString.indexOf( '<x:xmpmeta' ), xmpEndIndex );

                var indexOfXmp = xmpString.indexOf('x:xmpmeta') + 10
                //Many custom written programs embed xmp/xml without any namespace. Following are some of them.
                //Without these namespaces, XML is thought to be invalid by parsers
                xmpString = xmpString.slice(0, indexOfXmp)
                            + 'xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" '
                            + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                            + 'xmlns:tiff="http://ns.adobe.com/tiff/1.0/" '
                            + 'xmlns:plus="http://schemas.android.com/apk/lib/com.google.android.gms.plus" '
                            + 'xmlns:ext="http://www.gettyimages.com/xsltExtension/1.0" '
                            + 'xmlns:exif="http://ns.adobe.com/exif/1.0/" '
                            + 'xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#" '
                            + 'xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" '
                            + 'xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/" '
                            + 'xmlns:xapGImg="http://ns.adobe.com/xap/1.0/g/img/" '
                            + 'xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '
                            + xmpString.slice(indexOfXmp)

                var domDocument = dom.parseFromString( xmpString, 'text/xml' );
                return xml2Object(domDocument);
            } else{
             offset++;
            }
        }
    }

    function xml2json(xml) {
        var json = {};
      
        if (xml.nodeType == 1) { // element node
          if (xml.attributes.length > 0) {
            json['@attributes'] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
              var attribute = xml.attributes.item(j);
              json['@attributes'][attribute.nodeName] = attribute.nodeValue;
            }
          }
        } else if (xml.nodeType == 3) { // text node
          return xml.nodeValue;
        }
      
        // deal with children
        if (xml.hasChildNodes()) {
          for(var i = 0; i < xml.childNodes.length; i++) {
            var child = xml.childNodes.item(i);
            var nodeName = child.nodeName;
            if (json[nodeName] == null) {
              json[nodeName] = xml2json(child);
            } else {
              if (json[nodeName].push == null) {
                var old = json[nodeName];
                json[nodeName] = [];
                json[nodeName].push(old);
              }
              json[nodeName].push(xml2json(child));
            }
          }
        }
        
        return json;
    }

    function xml2Object(xml) {
        try {
            var obj = {};
            if (xml.children.length > 0) {
              for (var i = 0; i < xml.children.length; i++) {
                var item = xml.children.item(i);
                var attributes = item.attributes;
                for(var idx in attributes) {
                    var itemAtt = attributes[idx];
                    var dataKey = itemAtt.nodeName;
                    var dataValue = itemAtt.nodeValue;

                    if(dataKey !== undefined) {
                        obj[dataKey] = dataValue;
                    }
                }
                var nodeName = item.nodeName;

                if (typeof (obj[nodeName]) == "undefined") {
                  obj[nodeName] = xml2json(item);
                } else {
                  if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];

                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                  }
                  obj[nodeName].push(xml2json(item));
                }
              }
            } else {
              obj = xml.textContent;
            }
            return obj;
          } catch (e) {
              console.log(e.message);
          }
    }

    EXIF.enableXmp = function() {
        EXIF.isXmpEnabled = true;
    }

    EXIF.disableXmp = function() {
        EXIF.isXmpEnabled = false;
    }

    EXIF.getData = function(img, callback) {
        if (((self.Image && img instanceof self.Image)
            || (self.HTMLImageElement && img instanceof self.HTMLImageElement))
            && !img.complete)
            return false;

        if (!imageHasData(img)) {
            getImageData(img, callback);
        } else {
            if (callback) {
                callback.call(img);
            }
        }
        return true;
    }

    EXIF.getTag = function(img, tag) {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }
    
    EXIF.getIptcTag = function(img, tag) {
        if (!imageHasData(img)) return;
        return img.iptcdata[tag];
    }

    EXIF.getAllTags = function(img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.exifdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }
    
    EXIF.getAllIptcTags = function(img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.iptcdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    EXIF.pretty = function(img) {
        if (!imageHasData(img)) return "";
        var a,
            data = img.exifdata,
            strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    } else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                } else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    }

    EXIF.readFromBinaryFile = function(file) {
        return findEXIFinJPEG(file);
    }

    if (typeof define === 'function' && define.amd) {
        define('exif-js', [], function() {
            return EXIF;
        });
    }
}.call(this));



;/**import from `/resource/js/component/m/signature_pad.js` **/
// 签字板
!function (global) {
    var Bang = window.Bang = window.Bang || {}

    Bang.SignaturePad = function (options) {

        return new SignaturePad(options)
    }

    var __penSizeMap = {
        1: 4.5,
        2: 4.25,
        3: 4,
        4: 3.75,
        5: 3.5,
        6: 3.25,
        7: 3,
        8: 2.75,
        9: 2.5,
        10: 2.25,
        11: 2.2,
        12: 2.15,
        13: 2.1,
        14: 2.05,
        15: 2,
        16: 1.95,
        17: 1.9,
        18: 1.85,
        19: 1.8,
        20: 1.75,
        21: 1.7,
        22: 1.65,
        23: 1.6,
        24: 1.55,
        25: 1.5,
        26: 1.48,
        27: 1.46,
        28: 1.44,
        29: 1.42,
        30: 1.4,
        31: 1.38,
        32: 1.36,
        33: 1.34,
        34: 1.32,
        35: 1.3,
        36: 1.28,
        37: 1.26,
        38: 1.24,
        39: 1.22,
        40: 1.2,
        41: 1.18,
        42: 1.16,
        43: 1.14,
        44: 1.12,
        45: 1.1,
        46: 1.08,
        47: 1.06,
        48: 1.04,
        49: 1.02,
        50: 1
    }

    function SignaturePad(options) {
        options = options || {}
        var me = this,
            defaults = {
                canvas: null,
                canvasConfig: {
                    penColor: '#000',
                    penSize: 3,
                    penSizeMap: null,
                    backgroundColor: '#fff',
                    onStart: null,
                    onEnd: null
                },
                flagAutoInit: true,
                readOnly: false
            },
            pointGroups = []

        options = tcb.mix(defaults, options, true)

        me.options = options
        me.__pointGroups = pointGroups
        me.$canvas = null
        me.__penSize = options.canvasConfig.penSize || 3
        me.__penColor = options.canvasConfig.penColor || '#000'
        me.__ctx = null
        me.__offset = null
        me.__penSizeMap = options.penSizeMap || __penSizeMap
        me.__maxLineWidth = __getMaxLineWidth.apply(me)

        if (!options.canvas || !((me.$canvas = $(options.canvas)) && me.$canvas.length)) {
            return tcb.error('canvas参数必须，并且元素必须存在')
        }
        // 设置canvas的宽高
        __setSize(me.$canvas)

        // 确保签字的颜色值为rgb格式的数组,eg. [0, 0, 0]
        me.__penColor = __ensureRgb(me.__penColor || '#000')
        me.__ctx = me.$canvas[0].getContext('2d')

        if (options.flagAutoInit) {
            me.init()
        }
    }

    SignaturePad.prototype = {
        constructor: SignaturePad,

        init: init,
        draw: draw,
        clear: clear,
        clearAll: clearAll,
        toDataUrl: toDataUrl,
        getPointGroups: getPointGroups,
        getStripPointGroups: getStripPointGroups
    }


    function init() {
        var me = this,
            options = me.options

        me.clearAll()

        !options.readOnly &&
        __bindEvent.apply(me)
    }

    function draw(pointGroups) {
        if (!(pointGroups && pointGroups.length)) {
            return
        }
        var me = this
        pointGroups.forEach(function (group) {
            if (!(group && group.length)) return
            if (group.length === 1) {
                __drawDot.apply(me, group[0])
            } else {
                group.forEach(function (point, i) {
                    if (i === 0) return
                    var lastPoint = point
                    var newPoint = group[i - 1]
                    // 划线
                    __draw.apply(me, [newPoint, lastPoint])
                })
            }
        })
    }

    function clear() {
        var me = this,
            options = me.options,
            $canvas = me.$canvas,
            ctx = me.__ctx

        ctx.fillStyle = options.canvasConfig.backgroundColor || 'rgba(0,0,0,0)'
        ctx.clearRect(0, 0, $canvas[0].width, $canvas[0].height)
        ctx.fillRect(0, 0, $canvas[0].width, $canvas[0].height)
    }

    function clearAll() {
        var me = this

        me.clear()
        return me.__pointGroups = []
    }

    function toDataUrl(type) {
        var me = this,
            args = Array.prototype.slice.call(arguments)

        if (!type) {
            type = 'image/jpeg'

            args = [type]
        }

        return me.__ctx.canvas.toDataURL.apply(me.__ctx.canvas, args)
    }

    function getPointGroups() {
        var me = this

        return me.__pointGroups
    }

    function getStripPointGroups() {
        var me = this,
            pointGroups = me.__pointGroups,
            ret = []

        pointGroups.forEach(function (group) {
            ret.push([])
            group.forEach(function (point) {
                ret[ret.length - 1].push({
                    delta: point.delta,
                    xDraw: point.xDraw,
                    yDraw: point.yDraw
                })
            })
        })

        return ret
    }

    function __bindEvent() {
        var me = this,
            options = me.options,
            $canvas = me.$canvas,
            $win = tcb.getWin(),
            $doc = tcb.getDoc()

        // 鼠标事件
        var onCanvasMouseDown = function (e) {

                __strokeStart.apply(me, [e.pageX, e.pageY, e.timeStamp])

                $canvas.on('mousemove', onCanvasMouseMove)
                $doc.on('mouseup', onCanvasMouseUp)
            },
            onCanvasMouseMove = function (e) {
                __strokeUpdate.apply(me, [e.pageX, e.pageY, e.timeStamp])
            },
            onCanvasMouseUp = function (e) {

                __strokeEnd.apply(me, [e.pageX, e.pageY, e.timeStamp])

                $canvas.off('mousemove', onCanvasMouseMove)
                $doc.off('mouseup', onCanvasMouseUp)
            },

            // 触摸事件
            onCanvasTouchStart = function (e) {
                if (e.touches.length == 1) {
                    e.preventDefault()

                    __strokeStart.apply(me, [e.touches[0].pageX, e.touches[0].pageY, e.timeStamp])

                    $canvas.on('touchmove', onCanvasTouchMove, {passive: false})
                    $canvas.on('touchend', onCanvasTouchEnd)
                }
            },
            onCanvasTouchMove = function (e) {
                if (e.touches.length == 1) {
                    e.preventDefault()

                    __strokeUpdate.apply(me, [e.touches[0].pageX, e.touches[0].pageY, e.timeStamp])
                }
            },
            onCanvasTouchEnd = function (e) {
                if (e.touches.length === 0) {
                    e.preventDefault()

                    __strokeEnd.apply(me)

                    $canvas.off('touchmove', onCanvasTouchMove)
                    $canvas.off('touchend', onCanvasTouchEnd)
                }
            },

            onCanvasResize = function () {
                var $wrap = $canvas.parent()
                $canvas[0].width = $wrap.width()
                $canvas[0].height = $wrap.height()
            }

        $canvas.on('mousedown', onCanvasMouseDown)
        $canvas.on('touchstart', onCanvasTouchStart)
        //$win.on('resize', onCanvasResize)

        //onCanvasResize()
    }

    // 根据点划线
    function __draw(newPoint, lastPoint) {
        if (!(newPoint && lastPoint)) {
            return
        }

        var me = this,
            ctx = me.__ctx,
            penColor = me.__penColor,
            penSizeMap = me.__penSizeMap,
            penSize = me.__penSize,
            maxLineWidth = me.__maxLineWidth

        var lineWidth = penSizeMap[newPoint.delta] + penSize / maxLineWidth

        ctx.beginPath()

        // 绘制主线条的半透明背景边缘
        ctx.strokeStyle = __makeStrokeStyle(penColor, 0.35)
        ctx.lineWidth = lineWidth + 2
        ctx.lineCap = 'butt'
        ctx.lineJoin = 'miter'

        ctx.moveTo(lastPoint.xDraw, lastPoint.yDraw)
        ctx.lineTo(newPoint.xDraw, newPoint.yDraw)
        ctx.stroke()

        // 绘制主线
        ctx.strokeStyle = __makeStrokeStyle(penColor, 1)
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.moveTo(lastPoint.xDraw, lastPoint.yDraw)
        ctx.lineTo(newPoint.xDraw, newPoint.yDraw)
        ctx.stroke()
    }

    function __drawDot(newPoint) {
        if (!newPoint) {
            return
        }

        var me = this,
            ctx = me.__ctx,
            penColor = me.__penColor,
            penSizeMap = me.__penSizeMap,
            penSize = me.__penSize,
            maxLineWidth = me.__maxLineWidth,
            dotSize = penSizeMap[newPoint.delta] + penSize / maxLineWidth

        ctx.beginPath()
        ctx.arc(newPoint.xDraw, newPoint.yDraw, dotSize / 2, 0, 2 * Math.PI, false)
        ctx.fillStyle = __makeStrokeStyle(penColor, 1)
        ctx.closePath()
        ctx.fill()
    }

    function __strokeStart(pageX, pageY, time) {
        var me = this

        // 添加新组
        __addGroupToPointGroups.apply(me)

        var newPoint = __generatePoint.apply(me, [pageX, pageY, time])
        // 添加进pointGroup
        __addPointToPointGroups.apply(me, [newPoint])
    }

    // 更新线条
    function __strokeUpdate(pageX, pageY, time) {
        var me = this

        var lastPoint = __getLastPoint.apply(me)
        if (!lastPoint) {
            lastPoint = __generatePoint.apply(me, [pageX, pageY, time])
            // 添加进pointGroup
            __addPointToPointGroups.apply(me, [lastPoint])
        }

        var newPoint = __generatePoint.apply(me, [pageX, pageY, time])
        // 添加进pointGroup
        __addPointToPointGroups.apply(me, [newPoint])

        // 划线
        __draw.apply(me, [newPoint, lastPoint])
    }

    function __strokeEnd(pageX, pageY, time) {
        var me = this,
            lastGroup = __getLastGroup.apply(me)

        if (!(lastGroup && lastGroup.length)) {
            return
        }

        if (lastGroup.length === 1) {
            __drawDot.apply(me, lastGroup)
        }
    }

    // 获取最大划线宽度
    function __getMaxLineWidth() {
        var me = this,
            penSizeMap = me.__penSizeMap,
            maxLineWidth = 0
        for (var key in penSizeMap) {
            maxLineWidth = Math.max(maxLineWidth, penSizeMap[key])
        }
        return maxLineWidth
    }

    // 获取最后一个点
    function __getLastPoint() {
        var me = this,
            pointGroups = me.__pointGroups || [],
            points = pointGroups.length ? pointGroups[pointGroups.length - 1] : []

        return points.length ? points[points.length - 1] : null
    }

    // 获取最后一个组
    function __getLastGroup() {
        var me = this,
            pointGroups = me.__pointGroups || []

        return pointGroups.length ? pointGroups[pointGroups.length - 1] : null
    }

    // 生成一个点
    function __generatePoint(pageX, pageY, time) {
        var me = this,
            lastPoint = __getLastPoint.apply(me),
            offset = __getOffset.apply(me),
            x = pageX - offset.left,
            y = pageY - offset.top,
            xDraw = x,
            yDraw = y,
            xDelta = 0,
            yDelta = 0,
            delta = 0

        if (lastPoint) {
            delta = Math.abs(lastPoint.x - x)
            if (lastPoint.delta && (2 <= Math.abs(lastPoint.delta - delta))) {
                delta = (lastPoint.delta < delta)
                    ? (lastPoint.delta + 1)
                    : (lastPoint.delta - 1)
            }

            xDelta = (lastPoint.xDelta + (lastPoint.xDraw - x) * .08) * .7
            xDraw = lastPoint.xDraw - xDelta

            yDelta = (lastPoint.yDelta + (lastPoint.yDraw - y) * .08) * .7
            yDraw = lastPoint.yDraw - yDelta
        }

        return {
            x: x,
            y: y,
            xDraw: xDraw,
            yDraw: yDraw,
            xDelta: xDelta,
            yDelta: yDelta,
            delta: delta || 1//,
            // time   : time || new Date ().getTime ()//,
            //div    : .08,
            //ease   : .7
        }
    }

    // 为pointGroups添加一个新的空组
    function __addGroupToPointGroups() {
        var me = this,
            pointGroups = me.__pointGroups = me.__pointGroups || []

        return pointGroups.push([])
    }

    // 将点加入pointGroups
    function __addPointToPointGroups(point) {
        var me = this,
            pointGroups = me.__pointGroups = me.__pointGroups || [],
            points = pointGroups.length ? pointGroups[pointGroups.length - 1] : [],
            lastPoint = __getLastPoint.apply(me)

        if (!pointGroups.length) {
            pointGroups.push(points)
        }
        if (!__isPointEqual(point, lastPoint)) {
            points.push(point)
        }

        return pointGroups
    }

    // 比较是否为同一个点
    function __isPointEqual(point1, point2) {
        return point1 && point2
            && point1.x === point2.x
            && point1.y === point2.y
            && point1.xDraw === point2.xDraw
            && point1.yDraw === point2.yDraw
            && point1.xDelta === point2.xDelta
            && point1.yDelta === point2.yDelta
            && point1.delta === point2.delta
        //&& point1.time === point2.time
    }

    // 获取canvas相对页面的offset
    function __getOffset() {
        var me = this,
            $canvas = me.$canvas

        if (!me.__offset) {
            me.__offset = $canvas.offset()
        }

        return me.__offset
    }

    function __setSize($canvas) {
        var $wrap = $canvas.parent()
        $canvas[0].width = $wrap.width()
        $canvas[0].height = $wrap.height()
    }

    function __makeStrokeStyle(penColor, opacity) {
        opacity = opacity || 1

        return 'rgba(' + penColor[0] + ', ' + penColor[1] + ', ' + penColor[2] + ',  ' + opacity + ')'
    }

    function __ensureRgb(color) {
        var colorsArray = [0, 0, 0]
        if (/^#./.test(color)) {
            colorsArray = __hexToRgbArray(color)
        } else if (/^rgb\(./.test(color)) {
            colorsArray = color.substring(4, color.length - 1)
                               .replace(/ /g, '')
                               .split(',')
        } else if (/^rgba\(./.test(color)) {
            colorsArray = color.substring(5, color.length - 1)
                               .replace(/ /g, '')
                               .split(',')
            colorsArray.pop()
        } else if (Object.prototype.toString.call(color) === '[object Array]') {
            colorsArray = color
        }

        return colorsArray
    }

    function __hexToRgbArray(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b
        })

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
            ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
            : [0, 0, 0]
    }

}(this)


;/**import from `/resource/js/component/m/takePhotoUpload.js` **/
!function () {
    var defaults = {
        $trigger: null,
        file_post_name: 'pingzheng',
        upload_url: '/m/doUpdateImg',
        upload_url_base64: '/m/doUpdateImgForBase64',
        is_silent: false,
        capture: 'camera',
        supportCapture: true,
        supportCustomCamera: false,
        compress_width: 1080,
        compress_height: 1920,
        compress_quality: .7,
        callback_upload_before: null,
        callback_upload_process: null,
        callback_upload_success: null,
        callback_upload_fail: null,
        callback_upload_complete: function (me) {
            me.$triggerInvoke.val('')
        }
    }

    var isAutoOrientated

    tcb.checkAutoOrientated &&
    tcb.checkAutoOrientated(function (res) {
        isAutoOrientated = res
    })

    window.TakePhotoUpload = TakePhotoUpload

    function TakePhotoUpload(options) {
        options = options || {}
        options = tcb.mix({}, [defaults, options])
        var me = this
        if (!(options.$trigger && options.$trigger.length)) {
            return
        }
        me.$trigger = $(options.$trigger)
        me.$triggerCurrent = null
        me.options = options

        me.init()
    }

    // 设置原型方法
    TakePhotoUpload.prototype = {
        constructor: TakePhotoUpload,
        readUploadFile: readUploadFile,
        compressUpload: compressUpload,
        getCompressedImg: getCompressedImg,
        uploadImgBase64: uploadImgBase64,
        originalUpload: originalUpload,
        uploadImg: uploadImg,
        getCompactCompressSize: getCompactCompressSize,
        isSupportMegaPixelImg: isSupportMegaPixelImg,
        takePhoto: takePhoto,
        bindEventUploadPicture: bindEventUploadPicture,
        bindEvent: bindEvent,
        init: initTakePhotoUpload
    }

    function initTakePhotoUpload() {
        var me = this
        var options = me.options

        var trigger_invoke_wrap = '<div style="position:relative;width: 0;height: 0;overflow: hidden;">' +
            '<input type="file" accept="image/*"'
        if (options.supportCapture && options.capture) {
            trigger_invoke_wrap += ' capture="' + options.capture + '" '
        }
        trigger_invoke_wrap += 'style="position: absolute;left:-99999px;width: 1px;height: 1px;">' +
            '</div>'
        var $triggerInvokeWrap = $(trigger_invoke_wrap)
        $triggerInvokeWrap.appendTo('body')
        me.$triggerInvoke = $triggerInvokeWrap.find('input')

        me.bindEvent()
        me.bindEventUploadPicture()
    }

    function bindEvent() {
        var me = this
        me.$trigger.on('click', function (e) {
            e.preventDefault()
            me.$triggerCurrent = $(this)
            me.takePhoto()
        })
    }

    function bindEventUploadPicture() {
        var me = this
        me.$triggerInvoke.on('change', function (e) {
            // 获取文件列表对象
            var files = e.target.files || e.dataTransfer.files,
                file = files[0]

            try {
                // 压缩、上传图片
                me.readUploadFile(file, function () {
                    me.compressUpload(this.result)
                })
            } catch (ex) {
                // 压缩上传报错失败了，再次尝试用普通方式上传
                tcb.warn(ex)
                me.originalUpload(file)
            }
        })
    }


    function takePhoto() {
        var me = this
        var options = this.options
        var $triggerCurrent = this.$triggerCurrent
        var mode
        if ($triggerCurrent && $triggerCurrent.length) {
            mode = $triggerCurrent.attr('data-mode') || ''
        }
        if ((window.__IS_XXG_IN_SUNING && !window.__IS_XXG_IN_SUNING_ANDROID) || !tcb.js2AppInvokeTakePicture(function (imgBase64) {
            imgBase64 = imgBase64.indexOf('base64,') > -1
                ? imgBase64
                : 'data:image/png;base64,' + imgBase64
            me.compressUpload(imgBase64)
        }, mode)) {
            if (tcb.isXxgAppAndroidSupportCustomCamera() && options.supportCustomCamera && mode) {
                me.$triggerInvoke.attr('accept', 'tcb-camera/' + mode)
            }
            me.$triggerInvoke.trigger('click')
        }
    }

    function uploadImgBase64(imgBase64) {
        var me = this
        var options = me.options
        var formData = new FormData()
        formData.append(options.file_post_name, imgBase64)

        me.uploadImg(formData, options.upload_url_base64)
    }

    function uploadImg(formData, url) {
        if (!(formData && url)) {
            return
        }
        var me = this
        var options = me.options
        var callback_upload_before = $.isFunction(options.callback_upload_before)
            ? options.callback_upload_before
            : function (inst, img, next) {next()}
        callback_upload_before(me, formData.get(options.file_post_name), function () {
            !options.is_silent && tcb.loadingStart()
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                cache: false,
                processData: false,
                contentType: false,
                data: formData,
                success: function (data) {
                    $.isFunction(options.callback_upload_success) && options.callback_upload_success(me, data)
                },
                error: function (xhr, status, err) {
                    $.isFunction(options.callback_upload_fail) && options.callback_upload_fail(me, xhr, status, err)
                },
                complete: function () {
                    !options.is_silent && setTimeout(function () {
                        tcb.loadingDone()
                    }, 500)
                    $.isFunction(options.callback_upload_complete) && options.callback_upload_complete(me)
                }
            })
        })
    }

    // 读取文件，获取base64内容
    function readUploadFile(file, callback) {
        callback = $.isFunction(callback) ? callback : function () {}

        var reader = new FileReader()
        reader.onload = callback
        reader.readAsDataURL(file)
    }

    // 压缩、上传图片
    function compressUpload(imgBase64) {
        var me = this
        var maxSize = 500 * 1024 // 500KB

        if (imgBase64.length < maxSize) {
            me.uploadImgBase64(imgBase64)
        } else {
            tcb.imageOnload(imgBase64, function (imgObj) {
                var file_type = (imgBase64.split(';')[0]).split(':')[1] || ''
                me.getCompressedImg(imgObj, file_type, function (compressImgBase64) {
                    me.uploadImgBase64(compressImgBase64)
                })
            })
        }
    }

    // 获取压缩后的图片
    function getCompressedImg(img, file_type, callback) {
        var me = this
        var options = me.options
        EXIF.getData(img, function () {
            var imgObj = this
            var orientation = isAutoOrientated ? 0 : EXIF.getTag(imgObj, 'Orientation')
            var size = me.getCompactCompressSize(imgObj.naturalWidth || imgObj.width, imgObj.naturalHeight || imgObj.height),
                w = size[0],
                h = size[1]
            if (orientation == 6 || orientation == 8) {
                w = size[1]
                h = size[0]
            }

            var deg = 0,
                canvas = __createCanvas(w, h),
                ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, w, h)

            switch (orientation) {
                // 正位竖着照
                case 6:
                    ctx.translate(w, 0)
                    deg = 90
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, h, w)
                    break
                // 倒位竖着照
                case 8:
                    ctx.translate(0, h)
                    deg = 270
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, h, w)
                    break
                // 反向横着照
                case 3:
                    ctx.translate(w, h)
                    deg = 180
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, w, h)
                    break
                default :
                    ctx.drawImage(imgObj, 0, 0, w, h)
                    break
            }

            return callback(ctx.canvas.toDataURL('image/jpeg', options.compress_quality))
            //return callback(file_type === 'image/png'
            //    ? ctx.canvas.toDataURL (file_type)
            //    : ctx.canvas.toDataURL ('image/jpeg', compress_quality))
        })
    }

    function __createCanvas(w, h) {
        var canvas = tcb.cache('XXG_UPLOAD_PICTURE_CANVAS')
        if (!canvas) {
            canvas = document.createElement('canvas')
            tcb.cache('XXG_UPLOAD_PICTURE_CANVAS', canvas)
        }

        canvas.width = w
        canvas.height = h
        return canvas
    }

    function getCompactCompressSize(width, height) {
        var me = this
        var options = me.options
        var w_ratio = Math.min(width, height) / options.compress_width,
            h_ratio = Math.max(width, height) / options.compress_height,
            ratio = Math.max(w_ratio, h_ratio)

        if (me.isSupportMegaPixelImg()) {
            var ratio_log2 = Math.min(Math.floor(Math.log2(w_ratio)), Math.floor(Math.log2(h_ratio)))

            ratio = Math.pow(2, ratio_log2)
        }

        return [width / ratio, height / ratio]
    }

    function isSupportMegaPixelImg() {
        var is_support = tcb.cache('IS_SUPPORT_MEGA_PIXEL_IMG')
        if (typeof is_support == 'undefined') {
            var canvas = __createCanvas(2500, 2500)
            is_support = !!(canvas.toDataURL('image/png').indexOf('data:image/png') == 0)
        }
        return is_support
    }

    // 原图上传
    function originalUpload(file) {
        var me = this
        var options = me.options
        var formData = new FormData()
        formData.append(options.file_post_name, file)
        me.uploadImg(formData, options.upload_url)
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/_common.js` **/
!function () {
    window.XXG = {
        redirect: function (url, is_replace) {
            tcb.loadingStart()
            if (url) {
                setTimeout(function () {
                    tcb.loadingDone()
                }, 3000)
                return is_replace ? window.location.replace(url) : window.location.href = url
            }
            return window.location.reload()
        },

        // 绑定表单 options : {
        //      $form
        //      before
        //      after
        //      success
        //      error
        // }
        bindForm: function (options) {
            options = options || {}

            if (!(options.$form && options.$form.length)) {
                return $.dialog.toast('$form参数必须')
            }
            // 表单提交前执行
            if (typeof options.before !== 'function') {
                options.before = function ($form, next) {typeof next === 'function' && next()}
            }
            // 表单提交后执行
            if (typeof options.after !== 'function') {
                options.after = function (res) {return true}
            }
            options.$form.on('submit', function (e, before_valid, success_cb, error_cb) {
                e.preventDefault()
                var $form = options.$form
                if ($form.hasClass('form-flag-submitting')) {
                    return
                }
                options.before($form, function () {
                    $form.addClass('form-flag-submitting')
                    window.XXG.ajax({
                        url: $form,
                        success: function (res) {
                            $form.removeClass('form-flag-submitting')
                            // 表单提交后执行，返回true继续执行默认行为，false不执行后续操作
                            if (options.after(res)) {
                                if (!res.errno) {
                                    typeof options.success === 'function' && options.success(res, $form, success_cb)
                                } else {
                                    typeof options.error === 'function' && options.error(res, error_cb)
                                }
                            }
                        },
                        error: function (err) {
                            $form.removeClass('form-flag-submitting')
                            typeof options.error === 'function' && options.error(err, error_cb)
                        }
                    })
                }, before_valid)
            })
        },

        // 异步请求
        ajax: function (options) {
            options = options || {}
            if (!options.url) {
                return $.dialog.toast('请求参数url必须')
            }
            // url是form表单元素
            if (typeof options.url !== 'string' && options.url.__proto__ !== $.fn) {
                options.url = $(options.url)
            }
            if (options.url[0].tagName == 'FORM') {
                options.method = options.method || options.url[0].method
                options.data = options.data || options.url.serialize()
                options.url = options.url[0].action
            }
            $.ajax({
                type: options.method || options.type || 'GET',
                url: options.url,
                data: options.data,
                dataType: options.dataType || 'json',
                xhrFields: options.xhrFields || null,
                timeout: options.timeout || 5000,
                beforeSend: options.beforeSend || function (xhr, settings) {},
                success: options.success || function (data, status, xhr) {},
                error: options.error || function (xhr, type, error) {},
                complete: options.complete || function (xhr, status) {}
            })
        },

        // 添加笔记本验机信息，缺失显卡信息时手动选择显卡弹窗
        showDialogAddNoteBookAutoCheckGraphicsCardSelect: function (data, callback) {
            data = data || {}
            var content = '<div class="the-title">请选择</div><div class="the-group grid column justify-center align-center">'
            tcb.each(data, function (id, text) {
                content += '<a href="#" class="the-option col" data-id="' + id + '">' + text + '</a>'
            })
            content += '<a href="#" class="the-btn btn btn-radius">确认</a></div>'

            tcb.closeDialog()
            var inst = tcb.showDialog(content, {
                className: 'dialog-add-notebook-auto-check-graphics-card-select',
                withClose: false,
                middle: true
            })

            inst.wrap.find('.the-option').on('click', function (e) {
                e.preventDefault()
                var $me = $(this)
                $me.addClass('selected')
                   .siblings('.selected').removeClass('selected')
            })
            inst.wrap.find('.the-btn').on('click', function (e) {
                e.preventDefault()
                var $selected = inst.wrap.find('.selected')
                if ($selected && $selected.length) {
                    var graphicsCardId = $selected.attr('data-id')
                    typeof callback === 'function' && callback(graphicsCardId)
                    tcb.closeDialog()
                } else {
                    $.dialog.toast('信息缺失，请选择')
                }
            })
        }
    }


    //******************************
    //********和app交互的函数*********
    //******************************

    // 统一关闭弹层
    window.js4AndroidFnCloseDialog = function () {
        var closeFnQueue = tcb.cache('js4AndroidFnCloseDialog') || [],
            closeFn = closeFnQueue.pop()
        if (typeof closeFn === 'function') {
            closeFn()
            return true
        } else if (typeof window[closeFn] === 'function') {
            window[closeFn]()
            return true
        }
    }

    // xxgApp扫描成功回调函数
    window.js4AppFnQrScannerSuccess = function (res) {
        if (tcb.xxgAppIosNoticeUserUpdate()) {
            return
        }
        var successFn = tcb.cache('js4AppFnQrScannerSuccess')

        if (typeof successFn !== 'function') {
            successFn = function (result) {
                if (!result) {
                    return $.dialog.toast('扫描结果为空')
                }
                return __getCommonRedirectUrl(result, function (redirect_url) {
                    return tcb.js2AppReturnHandledQrScannerResult(redirect_url)
                })
            }
        }
        tcb.cache('js4AppFnQrScannerSuccess', '')
        successFn(res)
    }

    // 根据扫描结果获取（通用的）跳转url【非订单详情内的扫码逻辑】
    function __getCommonRedirectUrl(result, callback) {
        var redirect_url

        result = (result || '').split('|') || []

        if (result[0] === 'ARM') {
            result.shift()
            redirect_url = __handleQRCodeNewFormat(result.join(''))
        } else if (result[0] === 'ARC') {
            result.shift()
            __addNoteBookAutoCheckResult({
                encryptedStr: result.join('')
            }, function (model_id, pre_assess) {
                redirect_url = tcb.setUrl2(window.BASE_ROOT + 'm/pinggu',
                    {
                        model_id: model_id,
                        pre_assess: pre_assess
                    }
                )
                typeof callback === 'function' && callback(redirect_url)
            })
            return
        } else if (result.length === 1) {
            redirect_url = __handleCreditAssessResultByQRCode(result[0])
        } else {
            redirect_url = __handleQRCodeOldDefaultFormat(result)
        }

        typeof callback === 'function' && callback(redirect_url)

        return redirect_url
    }

    function __addNoteBookAutoCheckResult(data, callback) {
        window.XXG.ajax({
            url: '/m/addNotebookAutoCheckResult',
            data: data,
            success: function (res) {
                if (!(res && !res.errno)) {
                    var errmsg = (res && res.errmsg) || '系统错误，请稍后重试'
                    // return $.dialog.alert(errmsg)
                    $('.sm-err-alert-model-mask').show()
                    $('.sm-err-alert-model-btn-upLoade').hide()
                    $('.sm-err-alert-model-btn-confirm').show()
                    if (res.errno === 19101 || res.errno === 19104) {
                        $('.sm-err-alert-model-btn-confirm').hide()
                        $('.sm-err-alert-model-btn-upLoade').show().attr('data-sequenceCode', res.result.sequenceCode)
                    } else if (res.errno === 19106) {
                        $('.sm-err-alert-model-mask').hide()
                        // 显卡缺失,请手动选择
                        window.XXG.showDialogAddNoteBookAutoCheckGraphicsCardSelect(res.result && res.result.graphicsCardId, function (graphicsCardId) {
                            data.graphicsCardId = graphicsCardId
                            __addNoteBookAutoCheckResult(data, callback)
                        })
                    } else {
                        $('.sm-err-alert-model-mask .sm-err-alert-model-content-text').html(errmsg)
                    }
                    return
                    // if (res.errno === 19101) {
                    //     return $.dialog.alert(errmsg)
                    // }
                    // return $.dialog.toast(errmsg)
                }
                var result = res.result || {}
                if (result.modelId && result.assessKey) {
                    typeof callback === 'function' && callback(result.modelId, result.assessKey)
                } else {
                    return $.dialog.toast('数据错误')
                }
            },
            error: function (err) {
                $.dialog.toast(err.statusText || '系统错误，请稍后重试')
            }
        })
    }

    // 信用回收
    function __handleCreditAssessResultByQRCode(result) {
        return tcb.setUrl2(BASE_ROOT + 'm/scanShopCreditHs', {
            qrcode_info: result
        })
    }

    // 旧的二维码默认识别格式
    function __handleQRCodeOldDefaultFormat(result) {
        var redirect_params = {
            assess_key: result[0] || '',
            real_phone_flag: result[2] || '', //判断真假机
            scene: result[1],//场景
            is_engineer: 1,//扫码补单打点
            detect_token: result[3] //detect token
        }
        if (result[4]) {
            redirect_params.imei = result[2] //imei
            redirect_params.encrypt_xxg_qid = result[4] //Pad登录的xxg
        }
        var redirect_url = tcb.setUrl2(BASE_ROOT + 'm/pinggu_shop', redirect_params)
        if (result[1] == 'miniapp') {
            redirect_params = {
                assess_key: result[0] || '',
                imei: result[2] || '', //imei
                is_engineer: 1,//扫码补单打点
                scene: result[1], //场景
                detect_token: result[3] //detect token
            }
            redirect_url = tcb.setUrl2(BASE_ROOT + 'm/officialDiff', redirect_params)
        }
        return redirect_url
    }

    // 新的二维码识别格式
    function __handleQRCodeNewFormat(data) {
        data = data || ''
        try {
            data = $.parseJSON(data)
        } catch (e) {
            data = ''
        }
        if (!data) {
            return
        }
        data['is_engineer'] = 1
        delete data['detect_key']

        var redirect_url = tcb.setUrl2(BASE_ROOT + 'm/pinggu_shop', data)
        if (data['scene'] === 'miniapp') {
            redirect_url = tcb.setUrl2(BASE_ROOT + 'm/officialDiff', data)
        }
        return redirect_url
    }

    // 当前窗口激活
    window.js4AppFnNoticeWindowActive = function () {
        if (window.__IS_NEEDED_REFRESH) {
            window.location.reload()
        }
    }

    // DOM READY
    $(function () {
        tcb.xxgAppIosNoticeUserUpdate()

        // 在丰修APP内，获取状态栏高度
        if (window.__IS_XXG_IN_SF_FIX_APP) {
            tcb.js2AppGetStatusBarHeight(function (statusBarHeight) {
                $('#header .header-status-bar').height(statusBarHeight)
                $('.header-placeholder .header-status-bar-placeholder').height(statusBarHeight)
            })
        }

        // 绑定代理事件
        tcb.bindEvent({
            // 扫一扫评估结果
            '.js-trigger-saoyisao': function (e) {
                e.preventDefault()

                return tcb.js2AppInvokeQrScanner(true, function (result) {
                    __handleAssessResultByQRCode(result)
                })
            },
            // 修修哥到店信用回收

            '.js-trigger-xxg-shop-credit-hs': function (e) {
                e.preventDefault()

                return tcb.js2AppInvokeQrScanner(true, function (result) {
                    window.XXG.redirect(__handleCreditAssessResultByQRCode(result))
                })
            },
            // 退出登录

            '.js-trigger-xxg-logout': function (e) {
                e.preventDefault()
                $.get('/m/logout?flag_not_redirect=1', function (res) {
                    tcb.js2AppSetLogout()
                    setTimeout(function () {
                        var redirect_url = tcb.setUrl2(BASE_ROOT + 'm/hsXxgLogin', {
                            dest_url: window.location.href
                        }, ['dest_url'])
                        redirect_url = redirect_url.split('?')
                        redirect_url[0] = redirect_url[0] + '?dest_url=' + encodeURIComponent(window.location.href)
                        window.location.replace(redirect_url.join('&'))
                    }, 100)
                })
            },
            //    修改密码
            '.js-change-xxg-password': function (e) {
                e.preventDefault()
                window.location.href = '/m/modifyXxgPassword'
            },
            //    修修哥签约
            '.js-change-xxg-qy': function (e) {
                e.preventDefault()
                if ($('.signing').val() == '1') {
                    return
                } else {
                    window.location.href = '/m/companySignPartner'
                }
            },
            // 店家APP内关闭回到首页
            '.js-trigger-xxg-xiaodian-close': function (e) {
                e.preventDefault()
                tcb.js2AppInvokeGoHome()
            },
            '.sm-err-alert-model-btn-confirm': function (e) {
                e.preventDefault()
                $('.sm-err-alert-model-mask').hide()
            },
            '.sm-err-alert-model-btn-upLoade': function (e) {
                e.preventDefault()
                var sequenceCode = $(this).attr('data-sequenceCode')
                $('.sm-err-alert-model-mask').hide()
                if (sequenceCode) {
                    window.location.href = tcb.setUrl('/m/xxgQrErrorImgUpload', {sequenceCode: sequenceCode}) + '&'
                    // window.location.href='/m/xxgQrErrorImgUpload?sequenceCode='+sequenceCode
                }

            },
            // 丰修APP内返回（返回到最后将关闭页面）
            '.js-trigger-in-sf-fix-go-back': function (e) {
                e.preventDefault()
                tcb.js2AppInvokeGoBack()
            }
        })

        function __handleAssessResultByQRCode(result) {
            if (!result) {
                return $.dialog.toast('扫描结果为空')
            }

            __getCommonRedirectUrl(result, function (redirect_url) {
                redirect_url && window.XXG.redirect(redirect_url)
            })
        }

        window.test__handleAssessResultByQRCode = __handleAssessResultByQRCode

    })

}()


;/**import from `/resource/js/mobile/huishou/xxg/login.js` **/
!function () {
    if (!(window.__PAGE == 'xxg-login' || window.__PAGE == 'xxg-suning-bind-mobile')) {
        return
    }

    $ (function () {

        var $FormLogin = $ ('#FormLogin'),
            $BtnGetSmsCode = $FormLogin.find ('.btn-get-sms-code'),
            //图片验证码 (img)
            $VcodeImg = $FormLogin.find ('.vcode-img'),
            //图片验证码 (input)
            $PicSecode = $FormLogin.find ('[name="pic_secode"]'),
            $MobileZone = $FormLogin.find('[name="mobile_zone"]')//手机号国际码

        function initMobielZonePicker($Form){
            var pickerData = []
            $.get('/aj/doGetMobileZone',function (res) {
                if(!res.errno){
                    var mobile_zone_list = res.result

                    $.each(mobile_zone_list||{}, function(i, item){
                        pickerData.push({
                            id : i,
                            name : i+' '+item
                        })
                    })
                    Bang.Picker({
                        // 实例化的时候自动执行init函数
                        flagAutoInit     : true,
                        // 触发器
                        selectorTrigger  : $('.trigger-select-mobile-zone'),

                        col: 1,
                        data: [pickerData],
                        dataPos: [0],

                        // 回调函数(确认/取消)
                        callbackConfirm : function(inst){
                            var data = inst.options.data || [],
                                dataPos = inst.options.dataPos || [],
                                col = 0,
                                selectedData = data[ col ][ dataPos[ col] ]

                            $MobileZone.val(selectedData['id'])
                            $('.trigger-select-mobile-zone').html(selectedData['id'])
                        },
                        callbackCancel  : null
                    })
                }else {
                    $.dialog.toast (res.errmsg)
                }
            })
        }
        if($MobileZone&&$MobileZone.length){
            initMobielZonePicker($FormLogin)
        }

        $FormLogin.on ('submit', function (e) {
            e.preventDefault ()
            var $me = $FormLogin
            if ($me.attr('data-loading') || !__validLoginForm ($me)) {
                return
            }
            $me.attr('data-loading', '1')
            tcb.loadingStart()

            var dest_url = $me.find ('[name="dest_url"]').val () || '',
                from_page = $me.find ('[name="from_page"]').val () || ''

            $.post ($me.attr ('action'), $me.serialize (), function (res) {
                try {
                    res = $.parseJSON (res)

                    if (!res[ 'errno' ]) {

                        // 通知客户端登录成功
                        tcb.js2AppSetLoginSuccess (tcb.trim ($me.find ('[name="tel"]').val ()))

                        setTimeout (function () {
                            var secode = $me.find ('[name="secode"]').val ()

                            if (dest_url) {
                                // 这里的逻辑：
                                // 登录的时候secode为`999999`，表示为guest模式登录，
                                // 那么如果回跳地址包含`/m/hsXxgOption`，那么将其替换成`/m/hsXxgGuestOption`后再跳转，
                                // secode不是`999999`的时候，表示有正常管理权限的xxg登录，
                                // 如果回跳地址包含`/m/hsXxgGuestOption`，那么将其替换成`/m/hsXxgOption`后再跳转；
                                dest_url = decodeURIComponent (dest_url)
                                if (secode == '999999' && dest_url.indexOf ('/m/hsXxgOption') > -1) {

                                    dest_url = dest_url.replace ('/m/hsXxgOption', '/m/hsXxgGuestOption')
                                } else if (secode != '999999' && dest_url.indexOf ('/m/hsXxgGuestOption') > -1) {
                                    dest_url = dest_url.replace ('/m/hsXxgGuestOption', '/m/hsXxgOption')
                                }
                                return window.location.replace (dest_url)

                            }

                            if (secode == '999999') {
                                //
                                return window.location.replace (tcb.setUrl ('/m/hsXxgGuestOption', {
                                    from_page : from_page
                                }))

                            }

                            return window.location.replace (tcb.setUrl ('/m/hsXxgOption', {
                                from_page : from_page
                            }))

                        }, 100)
                    } else {
                        tcb.loadingDone()
                        $.dialog.toast (res.errmsg)
                        $me.removeAttr('data-loading')
                    }
                } catch (ex) {
                    tcb.loadingDone()
                    $.dialog.toast ("抱歉，数据错误，请稍后再试")
                    $me.removeAttr('data-loading')
                }
            })
        })



        // 获取短信验证码
        $BtnGetSmsCode.on ('click', function (e) {
            e.preventDefault ()

            var $me = $BtnGetSmsCode,
                $Form = $FormLogin

            if ($me.hasClass ('hsbtn-vcode-dis')) {
                return
            }

            if (!__validGetSmsCode ($Form)) {
                return
            }

            $me.addClass ('hsbtn-vcode-dis');

            var $mobile = $Form.find ('[name="tel"]'),
                $pic_secode = $Form.find ('[name="pic_secode"]'),
                $sms_type = $Form.find ('[name="sms_type"]'),
                $mobile_zone = $Form.find ('[name="mobile_zone"]'),
                url = '/aj/doSendXXGSmsCode',
                params = {}

                if($MobileZone&&$MobileZone.length){
                    params = {
                        'mobile'     : $mobile.val ().trim (),
                        'pic_secode' : $pic_secode.val ().trim (),
                        'sms_type'   : $sms_type.val ().trim (),
                        'mobile_zone'   : $mobile_zone.val ().trim ()
                    }
                }else {
                    params = {
                        'mobile'     : $mobile.val ().trim (),
                        'pic_secode' : $pic_secode.val ().trim (),
                        'sms_type'   : $sms_type.val ().trim ()
                    }
                }

            $.post (url, params, function (data) {
                data = JSON.parse (data);

                if (data.errno) {
                    $.dialog.toast (data.errmsg, 2000)
                    $me.removeClass ('hsbtn-vcode-dis')
                    $VcodeImg.click ()
                } else {
                    $me.html ('60秒后再次发送')
                    tcb.distimeAnim (60, function (time) {
                        if (time <= 0) {
                            $me.removeClass ('hsbtn-vcode-dis').html ('发送验证码')
                        } else {
                            $me.html (time + '秒后再次发送')
                        }
                    })
                }
            })
        })
        // 图片验证码刷新
        $VcodeImg.on ('click', function (e) {
            var $me = $VcodeImg,
                src = tcb.setUrl2('/ClosedLoop/captcha/?rands=' + Math.random ())
            $me.attr ('src', src)

            $PicSecode.val ('')
            $PicSecode.focus ()
        })

        // 验证获取手机短信验证码表单
        function __validGetSmsCode ($Form) {
            if (!($Form && $Form.length)) {
                return false
            }
            var flag = true

            var $Mobile = $Form.find ('[name="tel"]'),
                mobile_val = $Mobile.val ().trim ()



            if($MobileZone&&$MobileZone.length){

                if($MobileZone.val()=='+852'){
                    // 验证香港手机号
                    if(!(mobile_val&&/^[5689]\d{7}$/.test(mobile_val))){
                        flag = false
                        $Mobile.shine4Error ().focus ()
                    }
                }else {
                    if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                        // 验证手机号，截取前11位来验证，
                        // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                        flag = false
                        $Mobile.shine4Error ().focus ()
                    }
                }

            }else {
                if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                    // 验证手机号，截取前11位来验证，
                    // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                    flag = false
                    $Mobile.shine4Error ().focus ()
                }
            }

            var $PicSecode = $Form.find ('[name="pic_secode"]'),
                pic_secode_val = $PicSecode.val ().trim ()
            if (!pic_secode_val) {
                $PicSecode.shine4Error ()
                if (flag) {
                    $PicSecode.focus ()
                }
                flag = false
            }

            return flag
        }

        // 验证手机号登录表单
        function __validLoginForm ($Form) {
            if (!($Form && $Form.length)) {
                return false
            }
            var flag = true,
                $focus = null

            // var $PicSecode = $Form.find ('[name="pic_secode"]'),
            //     pic_secode_val = tcb.trim ($PicSecode.val ())
            // if (!pic_secode_val) {
            //     flag = false
            //     $focus = $focus || $PicSecode
            //     $PicSecode.shine4Error ()
            // }



            //判断是否勾选了协议
            var $checkbox = $Form.find('.agree_checkbox')
            if($checkbox && $checkbox.length){
                if (!$checkbox.is(':checked')){
                    $('.agree_label').shine4Error ().focus ()
                    flag=false
                }
            }

            if ($focus && $focus.length) {
                setTimeout (function () {
                    $focus.focus ()
                }, 300)
            }
            var loginType= $('#FormLogin').find ('[name="loginType"]').val ()
           if(loginType&&loginType=='mobile'){

               var $PicSecode = $Form.find ('[name="pic_secode"]'),
                   pic_secode_val = tcb.trim ($PicSecode.val ())
               if (!pic_secode_val) {
                   flag = false
                   $focus = $focus || $PicSecode
                   $PicSecode.shine4Error ()
               }
               var $Secode = $Form.find ('[name="secode"]'),
                   secode_val = tcb.trim ($Secode.val ())
               if (!secode_val) {
                   flag = false
                   $focus = $focus || $Secode
                   $Secode.shine4Error ()
               }

               var $Mobile = $Form.find ('[name="tel"]'),
                   mobile_val = tcb.trim ($Mobile.val ())
               if($MobileZone&&$MobileZone.length){

                   if($MobileZone.val()=='+852'){
                       // 验证香港手机号
                       if(!(mobile_val&&/^[5689]\d{7}$/.test(mobile_val))){
                           flag = false
                           $focus = $focus || $Mobile
                           $Mobile.shine4Error ()
                       }
                   }else {
                       if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                           // 验证手机号，截取前11位来验证，
                           // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                           flag = false
                           $focus = $focus || $Mobile
                           $Mobile.shine4Error ()
                       }
                   }

               }else {
                   if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                       // 验证手机号，截取前11位来验证，
                       // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                       flag = false
                       $focus = $focus || $Mobile
                       $Mobile.shine4Error ()
                   }
               }


           }else if(loginType&&loginType=='user'){


               var $user_name = $Form.find ('[name="user_name"]'),
                   user_name = tcb.trim ($user_name.val ())
               if (!user_name) {
                   flag = false
                   $focus = $focus || $user_name
                   $user_name.shine4Error ()
               }


               var $password = $Form.find ('[name="password"]'),
                   password = tcb.trim ($password.val ())
               if (!password) {
                   flag = false
                   $focus = $focus || $password
                   $password.shine4Error ()
               }



           }else{
               var $Mobile = $Form.find ('[name="tel"]'),
                   mobile_val = tcb.trim ($Mobile.val ())
               if($MobileZone&&$MobileZone.length){

                   if($MobileZone.val()=='+852'){
                       // 验证香港手机号
                       if(!(mobile_val&&/^[5689]\d{7}$/.test(mobile_val))){
                           flag = false
                           $focus = $focus || $Mobile
                           $Mobile.shine4Error ()
                       }
                   }else {
                       if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                           // 验证手机号，截取前11位来验证，
                           // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                           flag = false
                           $focus = $focus || $Mobile
                           $Mobile.shine4Error ()
                       }
                   }

               }else {
                   if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                       // 验证手机号，截取前11位来验证，
                       // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                       flag = false
                       $focus = $focus || $Mobile
                       $Mobile.shine4Error ()
                   }
               }

           }


            return flag
        }
    })

} ()


;/**import from `/resource/js/mobile/huishou/xxg/index.js` **/
// 修修哥首页
$(function () {
    if (window.__PAGE !== 'xxg-index' && window.__PAGE !== 'xxg-index-sf-fix') {
        return
    }

    function apiValidOrderOverdueDelivery(callback) {
        window.XXG.ajax({
            url: '/xxgHs/getWaitFahuoTimeoutList',
            success: function (res) {
                if (!(res && !res.errno)) {
                    return $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试')
                }
                if (res && res.result && res.result.cnt > 0) {
                    typeof callback == 'function' && callback()
                }
            },
            error: function (err) {
                $.dialog.toast(err.statusText || '系统错误，请稍后重试')
            }
        })
    }

    function validOrderOverdueDelivery() {
        var qid = window.__XXG_QID || ''
        if (!qid) {
            return
        }
        var hasShow = $.fn.cookie('HS_XXG_ORDER_OVERDUE_DELIVERY_' + qid)
        if (!hasShow) {
            apiValidOrderOverdueDelivery(function () {
                var dateObj = new Date()
                var todayStart = [
                    dateObj.getFullYear(),
                    dateObj.getMonth() + 1,
                    dateObj.getDate()
                ].join('/') + ' 00:00:00'
                var todayStartObj = new Date(todayStart)
                var tomorrowObj = new Date(todayStartObj.getTime() + 24 * 60 * 60 * 1000)

                $.fn.cookie('HS_XXG_ORDER_OVERDUE_DELIVERY_' + qid, 1, {
                    path: '/m/hsXxgOption',
                    expires: tomorrowObj
                })

                var html_fn = $.tmpl($.trim($('#JsXxgIndexDialogOrderOverdueDeliveryTpl').html())),
                    html_st = html_fn()
                var dialogInst = tcb.showDialog(html_st, {
                    className: 'dialog-order-overdue-delivery',
                    withClose: false,
                    middle: true
                })
                dialogInst.wrap.find('.js-trigger-goto-delivery-overdue-order').on('click', function (e) {
                    e.preventDefault()
                    tcb.closeDialog(dialogInst)
                    window.XXG.redirect(tcb.setUrl2('/m/hs_xxg_order_list?search_status=90'))
                })
                dialogInst.wrap.find('.js-trigger-hold-overdue-order').on('click', function (e) {
                    e.preventDefault()
                    tcb.closeDialog(dialogInst)
                })
            })
        }
    }

    function bindEvent() {
        tcb.bindEvent({
            '.js-trigger-show-remote-check-notice': function (e) {
                e.preventDefault()
                var html_fn = $.tmpl($.trim($('#JsXxgIndexDialogRemoteCheckNoticeTpl').html())),
                    html_st = html_fn()
                var dialogInst = tcb.showDialog(html_st, {
                    className: 'dialog-remote-check-notice',
                    withClose: false,
                    middle: true
                })
                dialogInst.wrap.find('.btn-confirm').on('click', function (e) {
                    e.preventDefault()
                    tcb.closeDialog(dialogInst)
                })
            },
            '.js-trigger-go-to-gold-assess': function (e) {
                e.preventDefault()
                window.__IS_NEEDED_REFRESH = true
                var $me = $(this)
                window.location.href = $me.attr('href')
            }
        })
    }

    function renderRewardSummary() {
        $.get('/xxgHs/doGetSfFixBonusAggregation', function (res) {
            if (!res.errno && res.result) {
                var tmpl_fn = $.tmpl($.trim($('#JsXxgSfFixIndexRewardSummaryTpl').html())),
                    tmpl_str = tmpl_fn({
                        data: res.result
                    })
                $('.block-top').html(tmpl_str)
            }
        })
    }

    // 弹幕
    function initDanmu() {
        var list1 = [
                '北京 郑XX 获30元回收成功奖励',
                '北京 王X 获120元回收成功奖励',
                '江苏 杨XX 获88元回收成功奖励',
                '上海 任X 获10元回收成功奖励',
                '浙江 李XX 获87元回收成功奖励',
                '上海 曹X 获32元回收成功奖励',
                '四川 胡XX 获69元回收成功奖励',
                '北京 刘X 获56元回收成功奖励',
                '上海 孙XX 获58元回收成功奖励',
                '上海 孟X 获120元回收成功奖励',
                '上海 毕X 获58元回收成功奖励',
                '上海 王XX 获80元回收成功奖励',
                '上海 黎XX 获47元回收成功奖励',
                '四川 江X 获85元回收成功奖励',
                '上海 何X 获40元回收成功奖励',
                '北京 武XX 获42元回收成功奖励',
                '广东 宋XX 获100元回收成功奖励',
                '广东 张XX 获119元回收成功奖励',
                '上海 王X 获37元回收成功奖励',
                '北京 李XX 获57元回收成功奖励',
                '北京 王X 获25元回收成功奖励',
                '浙江 刘X 获55元回收成功奖励',
                '上海 孙XX 获118元回收成功奖励',
                '北京 王X 获41元回收成功奖励',
                '北京 张XX 获81元回收成功奖励'
            ],
            list2 = [
                '江苏 王X 获183元回收成功奖励',
                '重庆 胡XX 获102元回收成功奖励',
                '江苏 毕X 获36元回收成功奖励',
                '湖北 宋XX 获24元回收成功奖励',
                '四川 孙XX 获117元回收成功奖励',
                '湖北 张XX 获31元回收成功奖励',
                '上海 政XX 获27元回收成功奖励',
                '上海 高XX 获113元回收成功奖励',
                '江苏 李XX 获197元回收成功奖励',
                '重庆 刘X 获120元回收成功奖励',
                '江苏 孙XX 获22元回收成功奖励',
                '江苏 王X 获71元回收成功奖励',
                '江苏 杨XX 获162元回收成功奖励',
                '北京 任X 获57元回收成功奖励',
                '广东 李XX 获28元回收成功奖励',
                '广东 何X 获17元回收推广奖励',
                '上海 陈XX 获28元回收成功奖励',
                '北京 李XX 获49元回收成功奖励',
                '江苏 王X 获41元回收成功奖励',
                '江苏 杨X 获132元回收成功奖励',
                '北京 黑XX 获99元回收成功奖励',
                '上海 姜X 获105元回收成功奖励',
                '北京 李XX 获10元回收成功奖励',
                '北京 孙XX 获59元回收成功奖励',
                '北京 张XX 获26元回收成功奖励'
            ],
            list3 = [
                '上海 政XX 获117元回收成功奖励',
                '北京 高XX 获162元回收成功奖励',
                '北京 李XX 获57元回收成功奖励',
                '江苏 刘X 获55元回收成功奖励',
                '北京 武XX 获89元回收成功奖励',
                '重庆 宋XX 获103元回收成功奖励',
                '北京 张XX 获60元回收成功奖励',
                '浙江 王X 获85元回收成功奖励',
                '江苏 李XX 获155元回收成功奖励',
                '浙江 王X 获93元回收成功奖励',
                '江苏 刘X 获59元回收成功奖励',
                '江苏 孙XX 获64元回收成功奖励',
                '北京 李XX 获94元回收成功奖励',
                '广东 刘X 获21元回收成功奖励',
                '北京 胡XX 获28元回收成功奖励',
                '江苏 刘X 获48元回收成功奖励',
                '上海 孙XX 获117元回收成功奖励',
                '北京 孟X 获82元回收成功奖励',
                '浙江 毕X 获28元回收成功奖励',
                '重庆 王XX 获49元回收成功奖励',
                '广东 刘X 获102元回收成功奖励',
                '江苏 江X 获37元回收成功奖励',
                '江苏 刘X 获66元回收成功奖励',
                '上海 李XX 获78元回收成功奖励',
                '江苏 李XX 获168元回收成功奖励'
            ]
        var html_str1 = '',
            html_str2 = '',
            html_str3 = ''
        var $itemWrap = $('.block-danmu').find('.item-wrap'),
            $itemWrap1 = $itemWrap.eq(0),
            $itemWrap2 = $itemWrap.eq(1),
            $itemWrap3 = $itemWrap.eq(2)

        tcb.each(list1, function (i, item) {
            html_str1 += '<div class="item">' + item + '</div>'
        })
        tcb.each(list2, function (i, item) {
            html_str2 += '<div class="item">' + item + '</div>'
        })
        tcb.each(list3, function (i, item) {
            html_str3 += '<div class="item">' + item + '</div>'
        })

        $itemWrap1.html(html_str1)
        $itemWrap2.html(html_str2)
        $itemWrap3.html(html_str3)

        var $items1 = $itemWrap1.find('.item'),
            $items2 = $itemWrap2.find('.item'),
            $items3 = $itemWrap3.find('.item')

        var stopDanmu1 = tcb.noop,
            stopDanmu2 = tcb.noop,
            stopDanmu3 = tcb.noop
        var t1, t2, t3
        var initFlag = true

        $(window).on('load visibilitychange', function (e) {
            if (initFlag || document.visibilityState === 'visible') {
                // 开始弹幕
                t1 = setTimeout(function () {
                    stopDanmu1 = startDanmu($items1)
                }, 1500)
                t2 = setTimeout(function () {
                    stopDanmu2 = startDanmu($items2)
                }, 0)
                t3 = setTimeout(function () {
                    stopDanmu3 = startDanmu($items3)
                }, 4000)
            } else {
                // 停止弹幕
                clearTimeout(t1)
                clearTimeout(t2)
                clearTimeout(t3)
                stopDanmu1()
                stopDanmu2()
                stopDanmu3()
            }
            initFlag = false
        })
    }

    function startDanmu($items) {
        var max = $items.length
        var pos = 0

        function _animationend() {
            var $me = $(this)
            $me.removeClass('item-slidein')
        }

        $items.on('animationend', _animationend)

        var t = null

        function loop() {
            if (pos >= max) {
                pos = 0
            }
            $items.eq(pos).addClass('item-slidein')
            pos++
            t = setTimeout(loop, 3000)
        }

        loop()
        return function () {
            clearTimeout(t)
            $items.removeClass('item-slidein')
            $items.off('animationend', _animationend)
        }
    }

    function init() {
        var isNeedQrScanner = false
        if (window.__PAGE === 'xxg-index') {
            isNeedQrScanner = true
            // 通知App，js加载完成
            tcb.js2AppNoticeLoadDown()/*非丰修修修哥首页才执行此函数*/

            bindEvent()
            validOrderOverdueDelivery()
        }
        tcb.js2AppNeedQrScanner(isNeedQrScanner)

        // 丰修修修哥首页
        if (window.__XXG_INDEX_SF_FIX) {
            renderRewardSummary()
            // initDanmu()
        }
    }

    init()
})


;/**import from `/resource/js/mobile/huishou/xxg/user_info.js` **/
!function () {
    if (window.__PAGE != 'xxg-user-info') {
        return
    }
    $ (function () {
        tcb.bindEvent (document.body, {
            // 设置上下班
            '.js-btn-is-work': function (e) {
                e.preventDefault();
                __actionSetIsWork($(this))
            },
        })
        // 激活订单取消弹窗
        function __actionSetIsWork($btn) {
            if ($btn.hasClass('btn-disabled')) {
                return
            }
            var params = {
                is_work: $btn.data('flag')
            }
            var url = tcb.setUrl2('/m/changeEngineerWork', params)
            tcb.loadingStart()
            window.XXG.ajax({
                url: url,
                success: function (res) {
                    tcb.loadingDone()
                    if (!res.errno) {
                        setTimeout(function () {
                            window.XXG.redirect()
                        }, 10)
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                },
                error: function (res) {
                    tcb.loadingDone()
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }
    })
} ()

;/**import from `/resource/js/mobile/huishou/xxg/order_list.js` **/
// 修修哥订单列表
!function () {
    if (window.__PAGE !== 'xxg-order-list') {
        return
    }

    $(function () {

        // 订单列表相关信息
        var __PageCache = {
            pn: 0,
            pn_max: 0,
            page_size: 20,
            is_loading: false,
            is_end: false,
            load_padding: 50,
            cur_date: '', // 存放某一笔订单的下单时间
            is_manual_mail: !!tcb.queryUrl(window.location.search, 'manualMail') // 是否是手动发货页
        }

        // 设置订单状态切换tab的滚动
        function setTabScroll() {
            //tab滑动
            var inst = new Scroll(function (left, top, zoom) {
                    // 此函数在滚动过程中实时执行，需要注意处理效率

                    __defaultAnimate(left, top, zoom, $BlockTabListInner, tcb.setTranslateAndZoom)
                }, {
                    scrollingY: false,
                    bouncing: false,
                    snapping: false
                }),
                $BlockTabList = $('.block-tab-list'),
                $BlockTabListInner = $BlockTabList.find('.tab-list-inner'),
                $SelectedItem = $BlockTabList.find('.item-cur'),
                $Doc = tcb.getDoc(),
                // 用来标识在Container中的滑动
                flag = false

            inst.setDimensions($BlockTabList.width(), $BlockTabList.height(), $BlockTabListInner.width(), $BlockTabListInner.height())
            if ($SelectedItem.offset()) {
                inst.scrollTo($SelectedItem.offset().left - $BlockTabListInner.offset().left, 0, true)
            }

            // 绑定滚动事件
            $BlockTabList.on('touchstart', function (e) {

                // flag设置为true表示滑动开始
                flag = true
                // 滑动开始
                inst.doTouchStart(e.touches, e.timeStamp)
            })

            $Doc.on('touchmove', function (e) {
                if (flag) {
                    e.preventDefault()

                    // 滑动ing
                    inst.doTouchMove(e.touches, e.timeStamp)
                }
            }, {passive: false})

            $Doc.on('touchend', function (e) {

                // 滑动ing
                inst.doTouchEnd(e.timeStamp)
                // flag重置为false，表示滑动结束
                flag = false
            })
        }

        // 默认滚动函数
        function __defaultAnimate(left, top, zoom, $el, setTranslateAndZoom) {
            setTranslateAndZoom($el[0], left, top, zoom)
        }

        //获取及输出订单列表
        function getXxgOrderList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = options.page_size || __PageCache.page_size,
                params = {
                    pn: pn,
                    page_size: page_size
                },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id'),
                search_status = tcb.queryUrl(window.location.search, 'search_status'),
                search_status_sets = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '110', '120']

            search_status = tcb.inArray(search_status, search_status_sets) > -1 ? search_status : 0
            params['search_status'] = search_status

            if (order_mobile_id) {
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetXxgOrderList', params, function (res) {
                // try {
                res = $.parseJSON(res)

                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()

                    var order_list = res['result']['order_list'],
                        total_count = res['result']['total'],
                        $List

                    if (!__PageCache.pn_max) {

                        __PageCache.pn_max = Math.floor(total_count / __PageCache.page_size)
                    }

                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsXxgOrderListTpl').html())),
                            html_str = html_fn({
                                'list': order_list
                            })

                        var $html_str = $(html_str)
                        $List = $('.block-order-list')
                        $html_str.appendTo($List)
                        // $List.append(html_str)
                        var $CopyBtn = $html_str.find('.js-trigger-copy-the-text')
                        if (ClipboardJS.isSupported()) {
                            $CopyBtn.each(function () {
                                new ClipboardJS(this).on('success', function (e) {
                                    $.dialog.toast('复制成功：' + e.text)
                                })
                            })
                        } else {
                            $CopyBtn.hide()
                        }

                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)

                        __PageCache.pn = pn
                    }

                    if (__PageCache.pn >= __PageCache.pn_max) {
                        __PageCache.is_end = true

                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-order-list')
                        uiAddNoMoreHtml($List)
                    }

                    orderItemEvent()
                }
                // }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        //再来一单需求 给每个订单绑定事件
        function orderItemEvent() {

            $('.js-test-order-satisfy-zlyd').on('click', function () {
                var order_id = $(this).attr('data-order-id'),
                    againOneOrderIsUsable = $(this).attr('data-again-one-order-is-usable'),
                    zlydSuccess = $('.zlyd-alert-model .zlyd-success'),
                    zlydErr = $('.zlyd-alert-model .zlyd-err'),
                    tel = $(this).attr('data-tel'),
                    address = $(this).attr('data-address'),
                    errText = $('.zlyd-err .zlyd-err-text'),
                    zlydMask = $('.zlyd-alert-model-mask')

                if (tel) {
                    $('.zlyd-alert-model .zlyd-user-information span').html(tel)
                }
                if (address) {
                    $('.zlyd-alert-model .zlyd-user-address').html(address)
                }
                $('.zlyd-alert-model-btn-confirm').attr('href', '/huishou/confirmAgainOneOrder?order_id=' + order_id)
                zlydMask.show()
                if (againOneOrderIsUsable == 10) {
                    zlydSuccess.show()
                    zlydErr.hide()
                } else if (againOneOrderIsUsable == 20) {
                    zlydSuccess.hide()
                    zlydErr.show()
                } else if (againOneOrderIsUsable == 30) {
                    errText.html('仅现场回收订单，才可使用再来一单功能哦')
                    zlydSuccess.hide()
                    zlydErr.show()
                }
            })
        }

        // 门店发货列表
        function getMenDianFahuo(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = options.page_size || __PageCache.page_size,
                params = {
                    pn: pn,
                    page_size: page_size
                },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id'),
                search_status = tcb.queryUrl(window.location.search, 'search_status'),
                search_status_sets = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90']

            search_status = tcb.inArray(search_status, search_status_sets) > -1 ? search_status : 0
            params['search_status'] = search_status

            if (order_mobile_id) {
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetXxgFahuo', params, function (res) {
                // try {
                res = $.parseJSON(res)

                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()

                    var order_list = res['result']['order']['order_list'],
                        total_count = res['result']['order']['total'],
                        $List

                    // 发货信息
                    var express_status = res['result']['express']['status'],
                        express_fivecode = res['result']['express']['fiveCode'],
                        refreshButtonFlag = res['result']['express']['flushFlag'],
                        $expressStatus
                    if (express_status) {
                        var express_html_fn = $.tmpl($.trim($('#JsXxgStoreDelivery').html())),
                            express_html_str = express_html_fn({
                                'express_status': express_status,
                                'express_fivecode': express_fivecode,
                                'refresh_button_flag': refreshButtonFlag
                            })
                        express_html_str = tcb.trim(express_html_str || '')

                        $expressStatus = $('.__xxg-mendianfahuo')
                        express_html_str
                            ? $expressStatus.html(express_html_str).show()
                            : $expressStatus.hide()
                        doRefreshExpressStatus()  // 刷新快递
                    }

                    if (!__PageCache.pn_max) {

                        __PageCache.pn_max = Math.floor(total_count / __PageCache.page_size)
                    }

                    // console.log(order_list.length)
                    if (order_list.length > 0) {
                        // $('#mendianManual').show()
                        $('#MendianFahuoBtns').show()
                    }

                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsXxgOrderListTpl').html())),
                            html_str = html_fn({
                                'list': order_list
                            })

                        $List = $('.block-order-list')
                        $List.append(html_str)

                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)

                        __PageCache.pn = pn
                    }

                    if (__PageCache.pn >= __PageCache.pn_max) {
                        __PageCache.is_end = true

                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-order-list')
                        uiAddNoMoreHtml($List)
                    }
                }
                // }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        // 门店订单列表
        function getMendianOrderList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = options.page_size || __PageCache.page_size,
                params = {
                    pn: pn,
                    page_size: page_size
                },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id')

            params['search_status'] = 100

            if (order_mobile_id) {
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetXxgMenDianOrderList', params, function (res) {
                // try {
                res = $.parseJSON(res)

                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()

                    var order_list = res['result']['order_list'],
                        total_count = res['result']['total'],
                        $List

                    if (!__PageCache.pn_max) {

                        __PageCache.pn_max = Math.floor(total_count / __PageCache.page_size)
                    }

                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsXxgOrderListTpl').html())),
                            __cur_date = __PageCache.cur_date, // 当前列表第一条的创建时间
                            html_str = html_fn({
                                'list': order_list,
                                'cur_date': __cur_date.split(' ')[0]
                            })
                        $List = $('.block-order-list')
                        $List.append(html_str)

                        // 记录上次数据的最后一条记录的日期
                        __PageCache.cur_date = order_list[order_list.length - 1].create_time || ''

                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)

                        __PageCache.pn = pn
                    }

                    if (__PageCache.pn >= __PageCache.pn_max) {
                        __PageCache.is_end = true

                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-order-list')
                        uiAddNoMoreHtml($List)
                    }
                }
                // }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        // 手动发货列表
        function getManualList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = 50 // 产品要求改成一次请求50条 options.page_size || __PageCache.page_size,
            params = {
                pn: pn,
                page_size: page_size
            },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id')

            params['search_status'] = 20 // 待发货状态码

            if (order_mobile_id) {
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetmanualList', params, function (res) {
                // try {
                res = $.parseJSON(res)

                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()

                    var order_list = res['result']['order_list'],
                        total_count = res['result']['total'],
                        $List

                    if (!__PageCache.pn_max) {

                        __PageCache.pn_max = Math.floor(total_count / page_size)
                    }

                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsXxgOrderListTpl').html())),
                            html_str = html_fn({
                                'list': order_list
                            })

                        $List = $('.block-order-list')
                        $List.append(html_str)

                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)

                        __PageCache.pn = pn
                    }

                    if (__PageCache.pn >= __PageCache.pn_max) {
                        __PageCache.is_end = true

                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-order-list')
                        uiAddNoMoreHtml($List)
                    }
                }
                // }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        // 获取预约单订单列表
        function getXxgYuYueDanOrderList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 1,
                params = {
                    page: pn
                }

            // 加载中
            __PageCache.is_loading = true
            var url = '/m/getShopSubscribeOrder'
            window.XXG.ajax({
                url: url,
                data: params,
                success: function (res) {
                    if (!res['errno']) {
                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()

                        var order_list = res['result']['data'],
                            total_count = res['result']['total'],
                            page_size = res['result']['per_page'] || __PageCache.page_size,
                            $List

                        if (!__PageCache.pn_max) {
                            __PageCache.pn_max = Math.floor(total_count / page_size)
                        }

                        if (order_list && order_list.length) {
                            var html_fn = $.tmpl($.trim($('#JsXxgYuYueDanOrderListTpl').html())),
                                html_str = html_fn({
                                    'list': order_list
                                })

                            var $html_str = $(html_str)
                            $List = $('.block-order-list')
                            $html_str.appendTo($List)

                            // 添加加载ing的html显示
                            uiAddLoadingHtml($List)

                            __PageCache.pn = pn
                        }

                        if (__PageCache.pn >= __PageCache.pn_max) {
                            __PageCache.is_end = true

                            // 移除商品加载ing的html
                            uiRemoveLoadingHtml()
                            $List = $List || $('.block-order-list')
                            uiAddNoMoreHtml($List)
                        }
                    }

                    // 加载完成
                    __PageCache.is_loading = false
                },
                error: function (err) {
                    $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                }
            })
        }

        // 添加没有更多商品的html显示
        function uiAddNoMoreHtml($target) {
            var html_st = '<div class="ui-no-more" id="UINoMore">已经没有更多内容~</div>'

            $target = $target || $('body')

            $target.append(html_st)
        }

        // 添加加载ing的html显示
        function uiAddLoadingHtml($target) {
            var
                $Loading = $('#UILoading')

            if ($Loading && $Loading.length) {

                return
            }
            var img_html = '<img class="ui-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif">',
                loading_html = '<div class="ui-loading" id="UILoading">' + img_html + '<span class="ui-loading-txt">加载中...</span></div>'

            $target = $target || $('body')

            $target.append(loading_html)
        }

        // 移除加载ing的html
        function uiRemoveLoadingHtml() {
            var
                $Loading = $('#UILoading')

            if ($Loading && $Loading.length) {

                $Loading.remove()
            }
        }

        // 页面checkbox的事件
        function handleCheckboxEvent(e) {
            var event = e || {}
            var has_checked = false
            var checkedListLength = __getBatchExpressDeliveryCheckedOrdersData()['names'].length || 0
            $('.xxg_batch_express_delivery').each(function () {
                if ($(this).get(0).checked) {
                    has_checked = true
                }
            })
            var $btn = $('.xxg_batch_express_delivery_btn')
            var $countELe = $('#fahuoTotalCount')
            if (has_checked) {
                $btn.removeAttr('disabled').removeClass('fahuo-btn-disabled')
                $countELe.html(checkedListLength)
            } else {
                $btn.attr('disabled', 'disabled').addClass('fahuo-btn-disabled')
                $countELe.html(checkedListLength)
            }
        }

        // 绑定事件
        function bindEvent() {
            tcb.bindEvent(document.body, {
                //批量发货/批量填写快递单号
                //checkbox事件
                '.xxg_batch_express_delivery': function (e) {
                    handleCheckboxEvent()
                    setAllCheckListStatus()
                },
                // 修修哥批量发货提交快递单号
                '.xxg_batch_express_delivery_btn': function (e) {
                    if (!$(this).prop('disabled')) {  // 如果按钮不是禁用状态,执行发货弹窗等事件
                        e.preventDefault()
                        __actionActiveBatchExpressDelivery()
                    } else {  // 按钮时禁用状态,弹出提示文字
                        $.dialog.toast('请至少选择1个订单进行发货')
                    }
                },
                // 手动发货页面,底部的悬浮全选按钮
                '._all_checkbox': function (e) {
                    doAllCheckList()
                },
                '.block-order-list .item': __handleClickOrderList,
                // 预约单，触发接单
                '.js-trigger-xxg-yuyuedan-jiedan': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var order_id = $me.attr('data-order-id')
                    var $alert = $.dialog.alert('<div class="grid justify-center" style="font-size: .14rem;">确认接单？</div>', function () {
                        window.XXG.redirect(tcb.setUrl2('/m/hs_xxg_order', {order_id: order_id}))
                    }, {})
                    $alert.find('.close').show()
                },
                // 预约上门取件
                '.js-trigger-xxg-select-schedule-pickup-time': function (e) {
                    e.preventDefault()
                    var schedulePickupTimeData = getSchedulePickupTimeData()
                    var html_fn = $.tmpl(tcb.trim($('#JsDialogXXGSelectSchedulePickupTimeTpl').html())),
                        html_st = html_fn({
                            schedulePickupTimeData: schedulePickupTimeData
                        })
                    var dialogInst = tcb.showDialog(html_st, {
                        className: 'dialog-xxg-select-schedule-pickup-time',
                        fromBottom: true
                    })
                    var $wrap = dialogInst.wrap

                    var selected_day = ''
                    var selected_time = ''
                    // 选择日期
                    $wrap.find('.the-day>.col').on('click', function (e) {
                        e.preventDefault()
                        var $me = $(this)
                        if ($me.hasClass('selected')) {
                            return
                        }
                        $me.addClass('selected').siblings('.selected').removeClass('selected')
                        var index = +$me.attr('data-index') || 0
                        var data = schedulePickupTimeData[index]
                        var html_time = ''
                        tcb.each(data.time || [], function (i, item) {
                            html_time += ['<a class="col auto" href="#" data-time="', item.value, '">', item.text, '</a>'].join('')
                        })
                        $wrap.find('.the-time').html(html_time)

                        selected_day = $me.attr('data-day')
                        selected_time = ''
                    })
                    // 选择时间
                    $wrap.find('.the-time').on('click', '.col', function (e) {
                        e.preventDefault()
                        var $me = $(this)
                        if ($me.hasClass('selected')) {
                            return
                        }
                        $me.addClass('selected').siblings('.selected').removeClass('selected')

                        selected_time = $me.attr('data-time')
                    })
                    // 确认提交
                    $wrap.find('.js-trigger-xxg-confirm-schedule-pickup-time').on('click', function (e) {
                        e.preventDefault()
                        if (!(selected_day && selected_time)) {
                            return $.dialog.toast('请选择日期和时间！')
                        }
                        var selected = [selected_day, selected_time].join(' ')

                        submitSchedulePickupTime(selected, function () {
                            tcb.closeDialog(dialogInst)
                            return $.dialog.toast('请等待上门取件，顺丰上门取件后请手动填写订单号', 3000)
                        })
                    })
                    // 默认选中第一个日期
                    $wrap.find('.the-day>.col').eq(0).trigger('click')
                }
            })

            var $win = tcb.getWin(),
                $body = $('body'),
                //可见区域的高度
                viewH = $win.height(),
                scrollHandler = function (e) {
                    // 已经滚动加载完所有订单，那么干掉滚动事件
                    if (__PageCache.is_end) {
                        return $win.off('scroll', scrollHandler)
                    }
                    // 加载中，不再重复执行加载
                    if (__PageCache.is_loading) {
                        return
                    }
                    //可滚动内容的高度(此值可变，只能放在scroll滚动时动态获取)
                    var scrollH = $body[0].scrollHeight,
                        // 计算可滚动最大高度，即滚动到时了最底部
                        maxSH = scrollH - viewH,
                        //滚动条向上滚出的高度
                        st = $win.scrollTop()

                    if (st >= (maxSH - __PageCache.load_padding)) {
                        curPageStatusReq({
                            pn: __PageCache.pn + 1
                        })
                        setAllCheckListStatus(false)
                    }
                }
            $win.on('scroll', scrollHandler)
        }

        var pickupTimeHour = {
            start: 9,
            end: 18
        }

        // 获取取件时间数据
        function getSchedulePickupTimeData() {
            var now_padding = window.__NOW_PADDING || 0
            var now = (new Date).getTime() + now_padding
            var nowDate = new Date(now)
            var tomorrowDate = new Date(now + 24 * 60 * 60 * 1000)
            var today_text = '今天'
            var tomorrow_text = '明天'
            var hour = nowDate.getHours()
            if (hour < pickupTimeHour.start) {
                hour = pickupTimeHour.start
            } else if (hour >= pickupTimeHour.end) {
                hour = pickupTimeHour.start
                nowDate = new Date(now + 24 * 60 * 60 * 1000)
                tomorrowDate = new Date(now + 24 * 60 * 60 * 1000 * 2)
                today_text = '明天'
                tomorrow_text = '后天'
            } else {
                hour += 1
            }
            var today = getSchedulePickupTimeDataByDate(nowDate, hour, today_text)
            var tomorrow = getSchedulePickupTimeDataByDate(tomorrowDate, pickupTimeHour.start, tomorrow_text)

            return [today, tomorrow]
        }

        function getSchedulePickupTimeDataByDate(dateObj, hour_start, text) {
            var time = []
            while (pickupTimeHour.end - hour_start > -1) {
                time.push({
                    text: [[hour_start, '00'].join(':'), [hour_start + 1, '00'].join(':')].join(' - '),
                    value: [fix2Length(hour_start), '00', '00'].join(':')
                })
                hour_start++
            }

            return {
                text: text,
                value: [dateObj.getFullYear(), fix2Length(dateObj.getMonth() + 1), fix2Length(dateObj.getDate())].join('-'),
                time: time
            }
        }

        /**
         * 修复为2个字符长度，长度不足以前置0补齐;
         * @return {[type]} [description]
         */
        function fix2Length(str){
            str = str.toString();
            return str.length < 2 ? '0' + str : str;
        }

        // 提交预约上门取件
        function submitSchedulePickupTime(send_time, callback) {
            window.XXG.ajax({
                url: '/xxgHs/doShopCallCourier',
                type: 'POST',
                data: {
                    send_time: send_time
                },
                success: function (res) {
                    if (!(res && !res.errno)) {
                        var errmsg = (res && res.errmsg) || '系统错误，请稍后重试'
                        return $.dialog.toast(errmsg)
                    }
                    typeof callback === 'function' && callback()
                },
                error: function (err) {
                    $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                }
            })
        }


        // 修修哥编辑订单信息表单
        function xxgEditForm($form, valid_submit, before_submit, after_submit) {
            $form.on('submit', function (e) {
                e.preventDefault()

                var $form = $(this)

                if (typeof valid_submit === 'function' && !valid_submit($form)) {
                    return false
                }

                if (!notEqualDefaultVal($form)) {
                    window.location.reload()
                    return
                }

                // 订单提交前执行
                if (typeof before_submit !== 'function') {
                    before_submit = function ($form, callback) {
                        typeof callback === 'function' && callback()
                    }
                }
                // 订单提交后执行
                if (typeof after_submit !== 'function') {
                    after_submit = function () {return true}
                }

                before_submit($form, function () {
                    $.post($form.attr('action'), $form.serialize(), function (res) {
                        res = $.parseJSON(res)

                        // 表单提交后执行，返回true继续执行以下默认操作，false不执行以下操作
                        if (after_submit(res)) {
                            if (!res.errno) {
                                window.location.reload()
                            } else {
                                alert(res.errmsg)
                            }
                        }
                    })

                })
            })

        }

        // 比较是否和默认值不相等
        function notEqualDefaultVal($form) {
            // 默认相等
            var flag = false

            var $input = $form.find('input,textarea')

            $input.forEach(function (item, i) {
                var $item = $(item),
                    default_val = $item.attr('data-default')

                // 默认值不为空字符串,并且默认值和修改后的值不相等，设置flag为true，表示有不相等的值，可以正常提交表单
                if (default_val) {
                    if (default_val !== $item.val()) {
                        flag = true
                    }
                } else {
                    // 确保是空字符串，而不是未定义状态或者null
                    if (default_val === '' && $item.val()) {
                        flag = true
                    }
                }
            })

            return flag
        }

        function __handleClickOrderList(e) {
            var $target = $(e.target),
                $me = $(this),
                order_id = $me.attr('data-order-id')

            if ($target.hasClass('btn-view-check-info')) {
                //验机详情跳转链接
                e.preventDefault()

                return window.XXG.redirect(tcb.setUrl2('/m/hsXXGThirdPingguNotEqualOrderDetail', {
                    order_id: order_id
                }))
            } else if ($target.hasClass('btn-edit-complaint')) {
                //填写验机差异申诉原因
                e.preventDefault()

                var html_st = $.tmpl($.trim($('#JsXxgEditComplaintTpl').html()))({
                        'order_id': order_id
                    }),
                    dialog = tcb.showDialog(html_st, {
                        withMask: true,
                        middle: true
                    })
                window.XXG.bindForm({
                    $form: dialog.wrap.find('form'),
                    before: function ($form, callback) {
                        __validFormOrderAppeal($form) && callback()
                    },
                    success: function () {
                        // 数据更新成功
                        window.XXG.redirect()
                    },
                    error: function (res) {
                        $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                    }
                })
            }
        }

        // 验证订单申诉表单
        function __validFormOrderAppeal($form) {
            var flag = true

            var $appeal_reason = $form.find('[name="appeal_reason"]'),
                appeal_reason_val = $.trim($appeal_reason.val())

            if (!appeal_reason_val) {
                flag = false
                $.errorAnimate($appeal_reason.focus())
            }
            return flag
        }

        function __actionActiveBatchExpressDelivery() {
            //取选中数据
            var ordersData = __getBatchExpressDeliveryCheckedOrdersData(),
                html_st = __getBatchExpressDeliveryPanelHtml(ordersData['ids'], ordersData['names'], ordersData['fivecodes'], ordersData['xxgName']),
                dialog = tcb.showDialog(html_st, {
                    withMask: true,
                    middle: true
                })
            window.XXG.bindForm({
                $form: dialog.wrap.find('form'),
                before: function ($form, callback) {
                    __validFormBatchExpressDelivery($form) && callback()
                },
                success: function () {
                    // 数据更新成功
                    window.XXG.redirect()
                },
                error: function (res) {
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }

        function __getBatchExpressDeliveryCheckedOrdersData() {
            var orderIds = [],
                orderNames = [],
                orderFiveCode = [],
                orderxgName = []
            $('.xxg_batch_express_delivery').each(function () {
                var $me = $(this)
                if ($me[0].checked) {
                    orderIds.push($me.attr('data-orderid'))
                    orderNames.push($me.attr('data-ordername'))
                    orderFiveCode.push($me.attr('data-fivecode'))
                    orderxgName.push($me.attr('data-xxgName'))
                }
            })
            return {
                ids: orderIds,
                names: orderNames,
                fivecodes: orderFiveCode,
                xxgName: orderxgName
            }
        }

        function __getBatchExpressDeliveryPanelHtml(orderIds, orderNames, orderFiveCode, orderxgName) {
            var html_st = $.tmpl($.trim($('#JsXxgEditExpressTpl').html()))(),
                $tmpHtml = $('<div>' + html_st + '</div>'),
                $tmpForm = $tmpHtml.find('form'),
                _htmlList = '', // 机器列表
                _html = ''  // 结构

            for (var i in orderNames) { // 遍历生成列表结构
                _htmlList += '<li class="fahuo-item"><div class="fahuo-item-text">'
                    + orderNames[i]
                    + '<span class="five-code">('
                    + orderFiveCode[i]
                    + ')</span></div><span>'
                    + orderxgName[i]
                    + '</span></li>'
            }
            // 元素结构
            _html = '<div class="row"><div class="fahuo-title"><span class="title-text">发货物品：</span><span>共计 '
                + orderNames.length
                + ' 件</span></div><ul class="fahuo-list">'
                + _htmlList
                + '</ul></div>'
            // 插入页面
            $tmpForm.prepend(_html)
                    .attr('action', '/m/doBatchSubExpressInfo')
                    .attr('method', 'post')
            $tmpForm.find('[name="parent_id"]').attr('name', 'parent_ids').val(orderIds.join(','))

            return $tmpHtml.html()
        }

        function __validFormBatchExpressDelivery($form) {
            var flag = true

            var $express_id = $form.find('[name="express_id"]'),
                express_id = $.trim($express_id.val())

            if (!express_id) {
                flag = false
                $.dialog.toast('快递单号不能为空')
                $.errorAnimate($express_id.focus())
            }
            return flag
        }

        // 设置全选按钮的状态, status = true (选中) / false (未选中)
        function setAllCheckListStatus(status) {
            var $checkEle = $('._all_checkbox')
            if ($checkEle.length === 0) return
            if (typeof status === 'undefined') {
                $checkEle.get(0).checked = handleCompareListCount()
            } else {
                $checkEle.get(0).checked = status
            }

        }

        // 判断当前选中的元素与页面元素是否相等
        function handleCompareListCount() {
            // 已选择的列表数量
            var checkedListLength = __getBatchExpressDeliveryCheckedOrdersData()['names'].length || 0
            // 页面上的 checkbox 数量
            var eleListLength = $('.xxg_batch_express_delivery').length || 0
            return checkedListLength === eleListLength
        }

        // 手动发货--全选按钮/取消全选
        function doAllCheckList() {
            if (!handleCompareListCount()) { // 选择的列表数不等于页面元素的数,可以直接全选
                $('.xxg_batch_express_delivery').each(function () {
                    var $me = $(this)
                    $me[0].checked = true
                })
            } else {  // 反之,全选取消
                $('.xxg_batch_express_delivery').each(function () {
                    var $me = $(this)
                    $me[0].checked = false
                })
            }
            handleCheckboxEvent()
        }

        // 页面数据重置
        function resetPageData() {
            __PageCache = {
                pn: 0,
                pn_max: 0,
                page_size: 20,
                is_loading: false,
                is_end: false,
                load_padding: 50
            }
            $('.block-order-list').html('')
            $('.__xxg-mendianfahuo').hide().html('')
        }

        // 请求刷新快递状态
        function getRefreshExpressStatus() {
            $.get('/m/doGetXxgFahuoStatus', function (res) {
                res = $.parseJSON(res)
                if (res['errno']) {
                    $.dialog.toast(res['errmsg'])
                }
                init()  // 初始化
            })
        }

        // 刷新快递状态
        function doRefreshExpressStatus() {
            var $ele = $('#refreshExpressStatus')
            $ele.on('click', function (e) {
                var $eleTarget = e.target
                var flag = $eleTarget.dataset.disabled || ''
                flag = eval(flag) // 字符串转 Boolean
                if (flag) {
                    resetPageData() // 先重置数据
                    getRefreshExpressStatus() // 在请求刷新接口
                } else {
                    $.dialog.toast('请稍后刷新')
                }
            })
        }

        // 判断当前页面的订单状态,请求不同接口
        function curPageStatusReq(options) {
            var curStatus = tcb.queryUrl(window.location.search, 'search_status')
            var xxg_shop_manager = window.__XXG_SHOP_MANAGER || false
            if (curStatus === 'yuyuedan') {
                // 预约单
                getXxgYuYueDanOrderList(options)
            } else if (curStatus === '90') {
                // 如果是门店发货或者门店订单页,单独处理
                // 门店发货
                getMenDianFahuo(options)
            } else if (curStatus === '100' && xxg_shop_manager) {
                // 店长身份,可以看到门店订单列表
                getMendianOrderList(options)
            } else if (__PageCache.is_manual_mail) {
                getManualList(options)
            } else {
                getXxgOrderList(options)
            }
        }

        // 页面初始化入口函数
        function init() {
            // 设置订单状态切换tab的滚动
            setTabScroll()

            // 绑定事件
            bindEvent()

            // 当前页面数据加载请求
            curPageStatusReq()
        }

        if (!__PageCache.is_manual_mail) {  // 不是手动发货页时,执行初始化
            init()
        } else {  // 手动发货,执行的初始化
            // 绑定事件
            bindEvent()
            curPageStatusReq()
        }
    })

}()


;/**import from `/resource/js/mobile/huishou/xxg/gold_infos.js` **/
// 修修哥订单列表
!function () {
    if (window.__PAGE !== 'xxg-gold-infos') {
        return
    }

    $(function () {
        // 订单列表相关信息
        var __PageCache = {
            pn: 1,
            is_loading: false,
            is_end: false,
            load_padding: 50,
            cur_date: '' // 存放某一笔订单的下单时间
        }

        // 设置订单状态切换tab的滚动
        function setTabScroll() {
            //tab滑动
            var inst = new Scroll(function (left, top, zoom) {
                        // 此函数在滚动过程中实时执行，需要注意处理效率

                        __defaultAnimate(left, top, zoom, $BlockTabListInner, tcb.setTranslateAndZoom)
                    }, {
                        scrollingY: false,
                        bouncing: false,
                        snapping: false
                    }),
                    $BlockTabList = $('.block-tab-list'),
                    $BlockTabListInner = $BlockTabList.find('.tab-list-inner'),
                    $SelectedItem = $BlockTabList.find('.item-cur'),
                    $Doc = tcb.getDoc(),
                    // 用来标识在Container中的滑动
                    flag = false

            inst.setDimensions($BlockTabList.width(), $BlockTabList.height(), $BlockTabListInner.width(), $BlockTabListInner.height())
            if ($SelectedItem.offset()) {
                inst.scrollTo($SelectedItem.offset().left - $BlockTabListInner.offset().left, 0, true)
            }

            // 绑定滚动事件
            $BlockTabList.on('touchstart', function (e) {
                // flag设置为true表示滑动开始
                flag = true
                // 滑动开始
                inst.doTouchStart(e.touches, e.timeStamp)
            })

            $Doc.on('touchmove', function (e) {
                if (flag) {
                    e.preventDefault()
                    // 滑动ing
                    inst.doTouchMove(e.touches, e.timeStamp)
                }
            }, {passive: false})

            $Doc.on('touchend', function (e) {
                // 滑动ing
                inst.doTouchEnd(e.timeStamp)
                // flag重置为false，表示滑动结束
                flag = false
            })
        }

        // 默认滚动函数
        function __defaultAnimate(left, top, zoom, $el, setTranslateAndZoom) {
            setTranslateAndZoom($el[0], left, top, zoom)
        }

        //获取及输出订单列表
        function getGoldOrderList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                    params = {
                        page: pn
                    }
            // 加载中
            __PageCache.is_loading = true
            $.get('/m/getGoldOrders', params, function (res) {
                res = $.parseJSON(res)
                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()
                    var result = res['result'];
                    var order_list = result['data'],
                            $List
                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsGoldOrderListTpl').html())),
                                html_str = html_fn({
                                    'list': order_list
                                })
                        var $html_str = $(html_str)
                        $List = $('.block-gold-content')
                        $html_str.appendTo($List)
                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)
                        __PageCache.pn = pn
                    }
                    if (result['current_page'] >= result['last_page']) {
                        __PageCache.is_end = true
                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-gold-content')
                        uiAddNoMoreHtml($List)
                    }
                }
                // 加载完成
                __PageCache.is_loading = false
            })
        }

        //获取及输出订单列表
        function getGoldAssessList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                    params = {
                        page: pn
                    }
            // 加载中
            __PageCache.is_loading = true
            $.get('/m/getGoldAssesses', params, function (res) {
                res = $.parseJSON(res)
                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()
                    var result = res['result'];
                    var order_list = result['data'],
                            $List
                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsGoldAssessListTpl').html())),
                                html_str = html_fn({
                                    'list': order_list
                                })
                        var $html_str = $(html_str)
                        $List = $('.block-gold-content')
                        $html_str.appendTo($List)
                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)
                        __PageCache.pn = pn
                    }
                    if (result['current_page'] >= result['last_page']) {
                        __PageCache.is_end = true
                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-gold-content')
                        uiAddNoMoreHtml($List)
                    }
                }
                // 加载完成
                __PageCache.is_loading = false
            })
        }

        //获取及输出订单列表
        function getGoldAddress(options) {
            __PageCache.is_loading = true
            $.get('/m/getGoldAddress', {}, function (res) {
                res = $.parseJSON(res)
                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()
                    var address = res['result'],
                            $List
                    var html_fn = $.tmpl($.trim($('#JsGoldAddressManagerTpl').html())),
                            html_str = html_fn({
                                'address': address
                            })
                    var $html_str = $(html_str)
                    $List = $('.block-gold-content')
                    $html_str.appendTo($List)
                    initAddressSelect()
                    // 添加加载ing的html显示
                    uiAddLoadingHtml($List)
                    __PageCache.is_end = true
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()
                }
                // 加载完成
                __PageCache.is_loading = false
            })

        }

        // 添加没有更多商品的html显示
        function uiAddNoMoreHtml($target) {
            var html_st = '<div class="ui-no-more" id="UINoMore">已经没有更多内容~</div>'
            $target = $target || $('body')
            $target.append(html_st)
        }

        // 添加加载ing的html显示
        function uiAddLoadingHtml($target) {
            var $Loading = $('#UILoading')
            if ($Loading && $Loading.length) {
                return
            }
            var img_html = '<img class="ui-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif">',
                    loading_html = '<div class="ui-loading" id="UILoading">' + img_html + '<span class="ui-loading-txt">加载中...</span></div>'
            $target = $target || $('body')
            $target.append(loading_html)
        }

        // 移除加载ing的html
        function uiRemoveLoadingHtml() {
            var $Loading = $('#UILoading')
            if ($Loading && $Loading.length) {
                $Loading.remove()
            }
        }

        // 绑定事件
        function bindEvent() {
            tcb.bindEvent(document.body, {
                // 还款
                '.js-trigger-xxg-repayment': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var url = $me.attr('data-url')
                    window.__IS_NEEDED_REFRESH = true
                    window.XXG.redirect(tcb.setUrl2(url))
                },
                // 苏宁礼品卡
                '.js-trigger-xxg-suning-gift-card': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var order_id = $me.attr('data-order-id')
                    window.XXG.ajax({
                        url: tcb.setUrl2('/xxgHs/getGiftCardJumpAddr'),
                        type: 'POST',
                        data: {
                            order_id: order_id
                        },
                        success: function (res) {
                            if (res.errno) {
                                $.dialog.toast(res['errmsg'], 2000)
                            } else {
                                if (res.result.result) {
                                    window.__IS_NEEDED_REFRESH = true
                                    window.XXG.redirect(tcb.setUrl2(res.result.result))
                                } else {
                                    $.dialog.toast(res['errmsg'], 2000)
                                }
                            }
                        },
                        error: function (err) {
                            $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                        }
                    })
                },
                // 金牌代叫快递
                '.js-trigger-xxg-edit-express': function (e) {
                    e.preventDefault()

                    var order_id = $(this).attr('data-order-id'),
                            is_edit = $(this).attr('data-act') === 'edit',
                            redirect_url = window.location.href

                    // 普通邮寄回收
                    YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {
                        var html_fn = $.tmpl(tcb.trim($('#JsMHSSchedulePickupPanelTpl').html())),
                                html_st = html_fn({
                                    data: {
                                        province: window.__Province['name'],
                                        city: window.__City['name'],
                                        area_list: res['area_list'] || [],
                                        mobile: res['default_mobile'],
                                        order_id: order_id,
                                        url: redirect_url
                                    }
                                })

                        var DialogObj = tcb.showDialog(html_st, {
                            className: 'schedule-pickup-panel',
                            withClose: false,
                            middle: true,
                            onClose: function () {
                                window.location.href = redirect_url
                            }
                        })

                        if (is_edit) {
                            var userName = $('.form-schedule-pickup input[name="express_username"]'),
                                    userTel = $('.form-schedule-pickup input[name="express_tel"]'),
                                    userRegion = $('.form-schedule-pickup input[name="express_useraddr"]'),
                                    userTime = $('.form-schedule-pickup input[name="express_time_alias"]'),
                                    regionWrap = $('.form-schedule-pickup .region-wrap'),
                                    btnWrap = $('.form-schedule-pickup .kuaidi-btn-wrap'),
                                    changeTimeForm = $('.form-schedule-pickup')
                            regionWrap.remove()
                            btnWrap.css('margin-top', '.4rem')
                            changeTimeForm.attr('action', '/huishou/doUpdateExpressTime')
                            userName.val(res.express_username).attr({readonly: 'true'})
                            userTel.val(res.express_tel).attr({readonly: 'true'})
                            userRegion.val(res.user_addr).attr({readonly: 'true'})
                            userTime.val(res.express_time)
                        }

                        // 绑定预约取件相关事件
                        YuyueKuaidi.bindEventSchedulePickup(DialogObj.wrap, redirect_url)
                    })
                },
                // 重叫快递
                '.js-trigger-xxg-retry-call-express': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var order_id = $me.attr('data-order-id')
                    window.XXG.ajax({
                        url: tcb.setUrl2('/m/goldOrderRetryCallExpress'),
                        type: 'POST',
                        data: {
                            order_id: order_id
                        },
                        success: function (res) {
                            if (res.errno) {
                                $.dialog.toast(res['errmsg'], 2000)
                            } else {
                                $.dialog.toast('操作成功!', 2000)
                            }
                        },
                        error: function (err) {
                            $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                        }
                    })
                },
                // 上传还原图片
                '.js-trigger-xxg-need-privacy-clearance': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var order_id = $me.attr('data-order-id')
                    var brand_id = $me.attr('data-brand-id')
                    window.__IS_NEEDED_REFRESH = true
                    window.XXG.redirect(tcb.setUrl2('/page/huishou-jinpai/#/uploadResetPhoto', {
                        order_id: order_id,
                        brand_id: brand_id
                    }))
                },
                // 查看质检
                '.js-trigger-xxg-show-quality-report': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var order_id = $me.attr('data-order-id')
                    window.XXG.redirect(tcb.setUrl2('/m/userQuality', {order_id: order_id, goldInfos: 1}))
                },
                // 去下单
                '.js-trigger-xxg-create-order': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var assess_key = $me.attr('data-assess-key')
                    window.__IS_NEEDED_REFRESH = true
                    var targetUrl = '/m/goldUseToolsOrder?assess_key=' + assess_key
                    window.XXG.redirect(tcb.setUrl2('/m/goldHideJump', {target_url: targetUrl}))
                },
                // 查看评估
                '.js-trigger-xxg-view-assess': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var assess_key = $me.attr('data-assess-key')
                    var targetUrl = '/page/huishou-jinpai/?_global_data=%7B%22is_gold_engineer%22%3A1%7D#/remoteCheck?redirect=1&assess_key=' + assess_key
                    window.__IS_NEEDED_REFRESH = true
                    window.XXG.redirect(tcb.setUrl2('/m/goldHideJump', {target_url: targetUrl}))
                },
                // 金修扫码搜索
                '.js-trigger-jinpai-scan-express-no': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    if (!tcb.js2AppInvokeQrScanner(true, function (result) {
                        result = tcb.trim(result || '')
                        if (result) {
                            var $form = $me.closest('form')
                            var $express_id = $form.find('[name="express_id"]')
                            $express_id.val(encodeURIComponent(result))
                            $form.trigger('submit')
                        }
                    })) {
                        console.error('扫码呼起失败，你想想是不是哪里错了？')
                    }
                },
                // 地址管理
                '.js-trigger-xxg-address-manager': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var $form = $me.closest('form')
                    window.XXG.ajax({
                        url: tcb.setUrl2($form.attr('action')),
                        type: 'POST',
                        data: $form.serialize(),
                        success: function (res) {
                            if (res.errno) {
                                $.dialog.toast(res['errmsg'], 2000)
                            } else {
                                $.dialog.toast('操作成功!', 2000)
                                setTimeout(function () {
                                    window.location.reload()
                                }, 300)
                            }
                        },
                        error: function (err) {
                            tcb.loadingDone()
                            $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                        }
                    })
                },
                // 发货
                '.js-trigger-xxg-sendout': function (e) {
                    e.preventDefault()
                    $(this).parent().hide();
                    $.dialog.toast('发货成功!')
                }
            })

            // 金修快递搜索
            $('form.form-jinpai-xxg-express-search').on('submit', function (e) {
                        e.preventDefault()

                        var $form = $(this)
                        tcb.loadingStart()
                        window.XXG.ajax({
                            url: tcb.setUrl2('/m/searchGoldOrderWaitExpress'),
                            type: 'POST',
                            data: $form.serialize(),
                            success: function (res) {
                                tcb.loadingDone()

                                if (res.errno) {
                                    $.dialog.toast(res['errmsg'], 2000)
                                } else {
                                    // 加载中
                                    __PageCache.is_loading = true
                                    // 移除商品加载ing的html
                                    uiRemoveLoadingHtml()
                                    var item = res.result,
                                            $List
                                    var html_fn = $.tmpl($.trim($('#JsGoldExpressSearchTpl').html())),
                                            html_str = html_fn({
                                                'item': item
                                            })
                                    // var $html_str = $(html_str)
                                    $List = $('.block-gold-content')
                                    // $html_str.appendTo($List)
                                    $List.html(html_str)
                                    // 加载完成
                                    __PageCache.is_loading = false
                                }
                            },
                            error: function (err) {
                                $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                            }
                        })
                    }
            )

            var $win = tcb.getWin(),
                    $body = $('body'),
                    //可见区域的高度
                    viewH = $win.height(),
                    scrollHandler = function (e) {
                        // 已经滚动加载完所有订单，那么干掉滚动事件
                        if (__PageCache.is_end) {
                            return $win.off('scroll', scrollHandler)
                        }
                        // 加载中，不再重复执行加载
                        if (__PageCache.is_loading) {
                            return
                        }
                        //可滚动内容的高度(此值可变，只能放在scroll滚动时动态获取)
                        var scrollH = $body[0].scrollHeight,
                                // 计算可滚动最大高度，即滚动到时了最底部
                                maxSH = scrollH - viewH,
                                //滚动条向上滚出的高度
                                st = $win.scrollTop()

                        if (st >= (maxSH - __PageCache.load_padding)) {
                            curPageStatusReq({
                                pn: __PageCache.pn + 1
                            })
                        }
                    }
            $win.on('scroll', scrollHandler)
        }

        // 判断当前页面的订单状态,请求不同接口
        function curPageStatusReq(options) {
            var type = tcb.queryUrl(window.location.search, 'type')
            if (type === '1') {
                getGoldAssessList(options)
            } else if (type === '2') {
            } else if (type === '3') {
                getGoldAddress(options);
            } else {
                getGoldOrderList(options)
            }
        }

        function initAddressSelect() {
            var $trigger = $('.trigger-select-city')
            var clientLocation = window.__CLIENT_LOCATION || {},
                    province = $trigger.attr('data-province') || clientLocation && clientLocation.province && clientLocation.province.name,
                    city = $trigger.attr('data-city') || clientLocation && clientLocation.city && clientLocation.city.name,
                    area = $trigger.attr('data-area') || clientLocation && clientLocation.area && clientLocation.area.name,
                    options = {
                        selectorTrigger: '.trigger-select-city',
                        province: province,
                        city: city,
                        area: area,
                        callback_cancel: null,
                        selectorProvince: '[name="province_code"]',
                        selectorCity: '[name="city_code"]',
                        selectorArea: '[name="area_code"]'
                    }
            // 初始化省/市/区县选择器
            Bang.AddressSelect2(options)
        }

        // 页面初始化入口函数
        function init() {
            // 设置订单状态切换tab的滚动
            setTabScroll()
            // 绑定事件
            bindEvent()
            // 当前页面数据加载请求
            curPageStatusReq()
        }

        init()
    })
}()


;/**import from `/resource/js/mobile/huishou/xxg/manager.js` **/
// 修修哥店员管理
!function(){
    if (window.__PAGE!=='xxg-manager'){
        return
    }

    $(function () {
        // 绑定事件
        tcb.bindEvent(document.body, {
            // 点击弹出在职/离职状态弹窗
            '.js-trigger-edit-job-status': function(e){
                e.preventDefault()

                var $me = $(this),
                    xxg_qid = $me.attr('data-xxg-qid')

                var html_str = $.tmpl($.trim($('#JsXxgEditJobStatusPanelTpl').html()))({
                    'xxg_qid': xxg_qid
                    }),
                    config = {
                        middle: true,
                        className: 'xxg-edit-job-status-panel'
                    }
                tcb.showDialog(html_str, config)
            },
            // 设置在职/离职状态
            '.btn-panel-edit': function(e){
                e.preventDefault()

                var $me = $(this),
                    xxg_qid = $me.attr('data-xxg-qid'),
                    status = $me.attr('data-status')

                $.get('/m/jobTagTrans',{
                    xxg_qid : xxg_qid,
                    status : status
                },function (res) {
                    res = $.parseJSON(res)

                    if(!res['errno']){
                        $.dialog.toast('设置成功!', 2000)

                        setTimeout(function () {
                            window.location.reload()
                        },1000)
                    } else {
                        $.dialog.toast(res.errmsg, 2000)
                    }
                })
            },
            // 添加店员
            '.js-trigger-add-staff': function(e){
                e.preventDefault()

                var html_str = $.tmpl($.trim($('#JsXxgAddStaffPanelTpl').html()))({}),
                    config = {
                        middle: true,
                        className: 'xxg-add-staff-panel'
                    }
                tcb.showDialog(html_str, config)
                bindEventSubmitForm($('#AddStaffForm'))
            }
        })

        function bindEventSubmitForm($Form) {
            $Form.on('submit',function (e) {
                e.preventDefault()

                var
                    $form = $(this)
                if (!validSubmitForm($form)){
                    return
                }

                $.post ($form.attr ('action'), $form.serialize(), function (res) {
                    try {
                        res = $.parseJSON (res)

                        if (!res[ 'errno' ]) {
                            $.dialog.toast('添加成功!', 2000)

                            setTimeout(function () {
                                window.location.reload()
                            },1000)
                        }else{
                            $.dialog.toast(res.errmsg, 2000)
                        }
                    } catch (ex){
                        $.dialog.toast('系统错误，请刷新页面重试', 2000)
                    }
                })
            })

        }
        function validSubmitForm ($Form) {
            var
                flag = true

            if (!($Form && $Form.length)) {
                flag = false
            } else {

                var
                    $user_name = $Form.find ('[name="user_name"]'),
                    $mobile = $Form.find ('[name="mobile"]'),

                    user_name = $.trim ($user_name.val ()),
                    mobile = $.trim ($mobile.val ())
                var
                    $focus_el = null,
                    err_msg = ''

                // 验证姓名
                if (!user_name) {
                    $.errorAnimate ($user_name)
                    $focus_el = $focus_el || $user_name
                    err_msg = '姓名不能为空'
                }
                // 验证手机号
                if (!mobile) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = err_msg || '手机号码不能为空'
                }
                else if (!tcb.validMobile (mobile)) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = err_msg || '手机号码格式错误'
                }

                if (err_msg) {
                    flag = false

                    setTimeout (function () {
                        $focus_el && $focus_el.focus ()
                    }, 500)

                    $.dialog.toast (err_msg)
                }
            }

            return flag
        }
    })

}()

;/**import from `/resource/js/mobile/huishou/xxg/order_check.js` **/
// 修修哥店员管理
!function () {
    if (window.__PAGE !== 'xxg-order-check') {
        return
    }

    $ (function () {
        // 绑定事件
        tcb.bindEvent (document.body, {
            // 点击tab
            //'.block-tab-list .item':function (e) {
            //    e.preventDefault()
            //
            //    $me = $(this)
            //
            //    $me.addClass('cur').siblings('.item').removeClass('cur')
            //},
            // 触发审核、驳回弹窗
            '.js-trigger-check' : function (e) {
                e.preventDefault ()

                var $me = $ (this)
                var order_id = $me.attr ('data-order-id'),
                    flag = $me.attr ('data-flag'),
                    confirm_text = '确定驳回订单么？'
                if (flag == 'success') {
                    confirm_text = '确定订单通过审核么？'
                }
                $.dialog.confirm (confirm_text, function () {
                    // 点击确定
                    $.get ('/m/subShopManagerCheck', {
                        order_id : order_id,
                        type : flag
                    }, function (res) {
                        res = $.parseJSON (res)

                        if (!res[ 'errno' ]) {
                            $.dialog.toast ('操作成功!', 2000)

                            var $item = $me.closest ('.item')
                            $item.one ('transitionend', function () {
                                var $siblings = $item.siblings ()
                                if (!($siblings && $siblings.length)) {
                                    $item.after('<div style="margin: .3rem 0;text-align: center;font-size: .24rem;">暂无订单</div>')
                                }
                                $item.remove ()
                            }).css ({
                                opacity : 0,
                                padding : '0 .12rem',
                                height : 0
                            })
                        } else {
                            $.dialog.toast (res.errmsg, 2000)
                        }
                    })
                }, function () {
                    // 点击取消
                })
            }
        })

    })

} ()

;/**import from `/resource/js/mobile/huishou/xxg/payee_info.js` **/
!function () {
    // 修修哥顾客收款信息
    if (window.__PAGE!=='xxg-payee-info'){
        return
    }

    $(function () {
        var $FormEditPayeeZfbInfo = $ ('#FormEditPayeeZfbInfo'),
            $FormEditPayeeBankInfo = $ ('#FormEditPayeeBankInfo')

        tcb.bindEvent(document.body,{
            // 选择打款方式
            '.tab-item':function (e) {
                e.preventDefault()

                var $me = $(this),
                    data_type = $me.attr('data-type')

                $me.addClass('cur').siblings('.cur').removeClass('cur')
                $('.payee-cont[data-type="'+data_type+'"]').show().siblings('.payee-cont').hide()

                $('[name="pay_method"]').val(data_type)
            },
             // 处理银行卡格式
            '#FormEditPayeeBankInfo [name="bank_no"]' : {
                'keyup change' : function (e) {
                    var
                        $me = $(this)
                    $me.val ($me.val ().replace (/\D/g, ''))
                }
            },
            // 展示确认弹窗
            '.js-trigger-confirm-dialog':function (e) {
                e.preventDefault()

                var pay_method = $('[name="pay_method"]').val(),
                    payeeInfoList = []

                //打款方式：40支付宝；50网银
                if(pay_method==40){
                    var zfb_no = $FormEditPayeeZfbInfo.find('[name="bank_no"]').val(),
                        zfb_username = $FormEditPayeeZfbInfo.find('[name="bank_username"]').val()

                    payeeInfoList = [
                        ['收款方式','支付宝'],
                        ['支付宝账号',zfb_no] ,
                        ['支付宝姓名',zfb_username]
                    ]

                    if(!validForm($FormEditPayeeZfbInfo)){
                        return
                    }
                }else if(pay_method==50){
                    var bank_no = $FormEditPayeeBankInfo.find('[name="bank_no"]').val(),
                        bank_username = $FormEditPayeeBankInfo.find('[name="bank_username"]').val()

                    payeeInfoList = [
                        ['收款方式','银行卡'],
                        ['开户行',$('[name="bank_name"]').val()],
                        ['开户行省份',$('[name="province"]').val()],
                        ['开户行城市',$('[name="city"]').val()],
                        ['开户账号',bank_no],
                        ['开户人姓名',bank_username]
                    ]

                    if(!validForm($FormEditPayeeBankInfo)){
                        return
                    }
                }

                showDialogConfirmPayeeInfo(payeeInfoList)
            },
            // 提交表单
            '.js-trigger-submit':function (e) {
                e.preventDefault()

                var pay_method = $('[name="pay_method"]').val()

                if(pay_method==40){
                    $FormEditPayeeZfbInfo.trigger('submit')
                }else if(pay_method==50){
                    $FormEditPayeeBankInfo.trigger('submit')
                }
            },
            '.js-trigger-cancel':function (e) {
                e.preventDefault()

                tcb.closeDialog()
            }
        })

        // 开户行选择器
        function initBankNamePicker($Form){
            var
                $bankName = $Form.find ('[name="bank_name"]'),
                $trigger = $('.trigger-select-bank-name')

            var
                pickerData = []
            $.each(window.__BANKLIST||[], function(i, item){
                pickerData.push({
                    id : i,
                    name : item
                })
            })

            Bang.Picker({
                // 实例化的时候自动执行init函数
                flagAutoInit     : true,
                // 触发器
                selectorTrigger  : $trigger,

                col: 1,
                data: [pickerData],
                dataPos: [0],

                // 回调函数(确认/取消)
                callbackConfirm : function(inst){
                    var data = inst.options.data || [],
                        dataPos = inst.options.dataPos || [],
                        selectedData = data[ 0 ][ dataPos[ 0 ] ]

                    $trigger.find('.txt').html(selectedData['name'])
                    $bankName.val(selectedData['name'])
                },
                callbackCancel  : null
            })
        }

        // 城市选择器
        function initCitySelect ($Form) {

            var
                $trigger = $('.trigger-select-province-city-area'),
                province = $Form.find ('.i-shipping-province').html () || '',
                city = $Form.find ('.i-shipping-city').html () || '',
                area = $Form.find ('.i-shipping-area').html () || '',
                options = {
                    // 实例化的时候自动执行init函数
                    flagAutoInit     : true,
                    selectorTrigger  : $trigger,
                    //selectorProvince : '[name="receiver_province_id"]',
                    //selectorCity     : '[name="receiver_city_id"]',
                    //selectorArea     : '[name="receiver_area_id"]',
                    province         : province,
                    city             : city,
                    area             : area,
                    //show_city        : false,
                    show_area        : false,
                    not_render       : true,
                    callback_cancel  : null,
                    callback_confirm : function (region) {
                        region = region || {}

                        $Form.find ('[name="province"]').val ( region[ 'province' ])
                        $Form.find ('[name="city"]').val ( region[ 'city' ])

                        var str = ''
                        // 设置省
                        str += '<span class="i-shipping-province">' + region[ 'province' ] + '</span>'
                        // 设置城市
                        str += ' <span class="i-shipping-city">' + region[ 'city' ] + '</span>'
                        $trigger.removeClass ('default').find('.txt').html (str)
                    }
                }

            // 初始化省/市/区县选择器
            Bang.AddressSelect (options)
        }

        // 确认弹窗
        function showDialogConfirmPayeeInfo(data) {
            var html_str = $.tmpl( $.trim($('#JsXxgConfirmPayeeInfoDialogTpl').html()) )({
                    payeeInfoList:data
                }),
                config = {
                    withMask: true,
                    middle: true,
                    className:'dialog-xxg-confirm-payee-info'
                }

            var dialog = tcb.showDialog(html_str, config)
        }

        // 验证表单
        function validForm ($form) {
            var
                flag = true,
                pay_method = $form.find ('[name="pay_method"]').val()

            if(pay_method==40){
                // 支付宝
                var
                    $zfb_no = $form.find ('[name="bank_no"]'),
                    $zfb_username = $form.find ('[name="bank_username"]')

                // 支付宝账号
                if ($zfb_no.length && !$.trim($zfb_no.val ())) {
                    $.errorAnimate ($zfb_no.focus ())
                    flag = false
                }
                // 支付宝名
                if ($zfb_username.length && !$.trim($zfb_username.val ())) {
                    $.errorAnimate (flag
                        ? $zfb_username.focus ()
                        : $zfb_username)
                    flag = false
                }
            }else if(pay_method==50){
                // 银行卡
                var
                    $bank_no = $form.find ('[name="bank_no"]'),
                    $bank_username = $form.find ('[name="bank_username"]'),
                    $bank_name = $form.find ('[name="bank_name"]'),
                    $bank_trigger = $form.find ('.trigger-select-bank-name'),
                    $province = $form.find ('[name="province"]'),
                    $city = $form.find ('[name="city"]'),
                    $city_trigger = $form.find ('.trigger-select-province-city-area')

                // 开户行
                if ($bank_name.length && !$.trim($bank_name.val ())) {
                    $.errorAnimate ($bank_trigger.focus ())
                    flag = false
                }
                // 开户行省市
                if ($province.length && !$province.val ()) {
                    $.errorAnimate (flag
                        ? $city_trigger.focus ()
                        : $city_trigger)
                    flag = false
                }
                if ($city.length && !$city.val ()) {
                    $.errorAnimate (flag
                        ? $city_trigger.focus ()
                        : $city_trigger)
                    flag = false
                }
                // 开户账号
                if ($bank_no.length && !$.trim($bank_no.val ())) {
                    $.errorAnimate (flag
                        ? $bank_no.focus ()
                        : $bank_no)
                    flag = false
                }
                // 开户人姓名
                if ($bank_username.length && !$.trim($bank_username.val ())) {
                    $.errorAnimate (flag
                        ? $bank_username.focus ()
                        : $bank_username)
                    flag = false
                }

            }

            return flag
        }

        // 绑定提交表单事件
        function bindEventSubmitForm($form) {
            if(!($form&&$form.length)){
                return
            }

            $form.on('submit', function (e) {
                e.preventDefault()

                var
                    $me = $ (this)

                // 验证表单
                if (!validForm ($me)) {
                    return
                }

                $.ajax ({
                    type     : 'POST',
                    url      : $me.attr ('action') || '/xxgHs/doUpFailCashInfo',
                    data     : $me.serialize (),
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {
                        try {

                            if (!res[ 'errno' ]) {

                                // 提交成功
                                $.dialog.toast ('提交成功', 3000)
                                tcb.closeDialog()

                                setTimeout(function () {
                                    window.location.href='/m/hs_xxg_order?order_id='+window.__ORDER_ID
                                },3000)

                                return
                            } else {
                                $.dialog.toast (res[ 'errmsg' ], 3000)
                            }
                        } catch (ex) {
                            $.dialog.toast ('返回异常，请刷新页面重试', 3000)
                        }
                    },
                    error    : function () {
                        $.dialog.toast ('返回异常，请刷新页面重试', 3000)
                    }
                })
            })
        }

        function init() {
            var pay_method = $('.tab-item.cur').attr('data-type')
            $('[name="pay_method"]').val(pay_method)

            initBankNamePicker($FormEditPayeeBankInfo)
            initCitySelect($FormEditPayeeBankInfo)

            bindEventSubmitForm($FormEditPayeeZfbInfo)
            bindEventSubmitForm($FormEditPayeeBankInfo)
        }
        init()

    })
} ()

;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_common/init.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        data: null,
        init: init,
        setupService: setupService
    })

    function init(data, done) {
        var $Wrap = $('#mainbody .mainbody-inner')
        window.XXG.BusinessCommon.data = data
        window.XXG.BusinessCommon.$Wrap = $Wrap
        window.XXG.BusinessCommon.render(data)
        window.XXG.BusinessCommon.eventBind(data)
        /***** 载入服务 *****/
        window.XXG.BusinessCommon.setupService([
            // 初始化上传图片
            [window.XXG.ServiceUploadPicture, {
                data: data,
                init: function (next, final) {
                    next()
                }
            }],
            // 初始化远程验机
            [window.XXG.ServiceRemoteCheck, {
                $trigger: $Wrap.find('.js-trigger-go-next'),
                $target: $Wrap,
                addType: 'prepend',
                data: data,
                init: function (next, final) {
                    next()
                }
            }]
        ], function () {
            typeof done === 'function' && done()
        })
    }

    // 载入service
    function setupService(services, fn_final) {
        var fnQueueInit = []
        tcb.each(services || [], function (i, service) {
            var serviceObj = service[0]
            var serviceOptions = service[1]
            if (serviceObj.setup) {
                serviceObj.setup(serviceOptions || {})
            }
            var init
            if (serviceOptions && typeof serviceOptions.init === 'function') {
                init = serviceOptions.init
            } else if (typeof serviceObj.init === 'function') {
                init = serviceObj.init
            }
            init && fnQueueInit.push(init)
        })
        // 执行init函数，每个init函数必然会有一个next参数作为继续执行的回调函数，和一个final作为结束执行的回调函数，
        // 如果next没有被init执行，那么表示执行中断，不再执行后续service的init，
        // init没有被中断，并且都已经执行过了，那么final将在最后执行，
        // 如果init中主动调用final，那么将提前中断后续的init，
        // 如果final传入一个true，那么将不会执行fn_final，否则默认会执行fn_final
        /***!!! 每个init函数都应该执行next或者final函数，否则可能会出现非预期的行为 !!!***/
        !function executeFnQueue(fnQueue, fn_final) {
            if (!fnQueue.length) {
                return typeof fn_final === 'function' && fn_final()
            }
            var fn = fnQueue.shift()
            fn(function () {
                executeFnQueue(fnQueue, fn_final)
            }, function (isStop) {
                !isStop && typeof fn_final === 'function' && fn_final()
            })
        }(fnQueueInit, fn_final)
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_common/action.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        actionJieDan: doJieDan,
        actionChuFa: doChuFa,
        actionFillUpInfo: doFillUpInfo,
        actionTriggerCancelAndRefund: doTriggerCancelAndRefund,
        actionScanQRCode: actionScanQRCode,
        actionReScanQRCode: actionReScanQRCode,
        __test_actionScanQRCode: __test_actionScanQRCode,
        __test_actionReScanQRCode: __test_actionReScanQRCode,
        actionCantScanQRCode: doCantScanQrcode,
        actionServiceRemoteCheckShowStartTips: actionServiceRemoteCheckShowStartTips,
        actionLoopExpressInfo: actionLoopExpressInfo,
        actionStartDeliveryExpressCountdown: actionStartDeliveryExpressCountdown,
        actionShowCityManagerInfo: actionShowCityManagerInfo
    })
    var startCountdown = Bang.startCountdown

    // 更新订单状态
    function __actionApiActionBeforeArrive($btn, success) {
        tcb.loadingStart()
        window.XXG.BusinessCommon.apiActionBeforeArrive($btn,
            function (result) {
                setTimeout(function () {
                    tcb.loadingDone()
                }, 1000)
                if (typeof success === 'function') {
                    success(result)
                } else if (success === true) {
                    window.XXG.redirect()
                }
            },
            function () {
                tcb.loadingDone()
            }
        )
    }

    // 接单
    function doJieDan($btn, data) {
        var text = '接单后无法取消<br>请联系用户上门服务'
        if (data.oneStopData.__sf_fix || data.sfFixData.__re_new) {
            text = '接单后无法取消<br>收到新机后请联系用户上门服务'
        }
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            __actionApiActionBeforeArrive($btn, true)
        }, text)
    }

    // 出发
    function doChuFa($btn) {
        __actionApiActionBeforeArrive($btn, true)
    }

    // 提交价格等表单信息，然后到下一步操作
    function doFillUpInfo($btn, data) {
        window.XXG.BusinessCommon.eventTriggerFormUpdateOrderInfoGoNext($btn, data)
    }

    // 取消订单，并且退款
    function doTriggerCancelAndRefund($btn, data) {
        var order_id = $btn.attr('data-order-id'),
            refund_type = $btn.attr('data-refund-type'),
            html_fn = $.tmpl($.trim($('#JsXxgCancelOrderAndRefundTpl').html())),
            html_st = html_fn({
                'order_id': order_id
            }),
            dialogInst = tcb.showDialog(html_st, {
                withClose: true,
                middle: true
                // fromBottom: true
            })
        var $Form = dialogInst.wrap.find('form')
        window.XXG.BusinessCommon.eventBindCancelOrderAndRefund($Form, $btn, function () {
            tcb.closeDialog()
            setTimeout(function () {
                window.XXG.redirect(tcb.setUrl2('/Recycle/Engineer/CashierDesk', {
                    order_id: order_id,
                    business_id: refund_type
                }))
            }, 10)
        })
    }

    // 扫码同步验机信息
    function actionScanQRCode($btn) {
        // var rootData = window.XXG.BusinessCommon.rootData
        // var order_id = rootData.order.order_id
        var now_status = $btn.attr('data-now-status')
        var next_status = $btn.attr('data-next-status')
        // 如果按钮上存在当前status，和下一个目标status，
        // 那么需要执行BeforeArrive逻辑，更新订单状态
        var isChangeStatus = !!(now_status && next_status)

        __scanQRCodeReassess(
            // 扫码成功
            function (params, isNotebook) {
                isChangeStatus
                    ? __actionApiActionBeforeArrive($btn, function () {
                        __actionScanQRCodeSuccess({
                            params: params,
                            isNotebook: isNotebook
                        })
                    })
                    : __actionScanQRCodeSuccess({
                        params: params,
                        isNotebook: isNotebook
                    })
            },
            // 扫码失败
            function () {
                // 扫码失败，表示当前环境没有可用的扫码功能，
                // 那么直接略过，当做【无法自动验机】处理
                isChangeStatus
                    ? __actionApiActionBeforeArrive($btn, function () {
                        __actionScanQRCodeFail(true)
                    })
                    : __actionScanQRCodeFail(true)
            }
        )
    }

    // 重新扫码同步验机信息
    function actionReScanQRCode() {
        __scanQRCodeReassess(
            // 扫码成功
            function (params, isNotebook) {
                __actionScanQRCodeSuccess({
                    params: params,
                    isNotebook: isNotebook
                })
            },
            // 扫码失败
            function () {
                // 扫码失败，表示当前环境没有可用的扫码功能，
                // 那么直接略过，当做【无法自动验机】处理
                __actionScanQRCodeFail()
            }
        )
    }

    function __test_actionScanQRCode(resultStr) {
        var $btn = $('<a href="#">测试测试</a>')
        var rootData = window.XXG.BusinessCommon.rootData
        var order = rootData.order
        var order_id = order.order_id
        if (order.status == 11) {
            $btn
                .attr('data-order-id', order_id)
                .attr('data-now-status', '11')
                .attr('data-next-status', '12')
        }
        var now_status = $btn.attr('data-now-status')
        var next_status = $btn.attr('data-next-status')
        // 如果按钮上存在当前status，和下一个目标status，
        // 那么需要执行BeforeArrive逻辑，更新订单状态
        var isChangeStatus = !!(now_status && next_status)
        var result = (resultStr || '').split('|') || []
        var params = window.XXG.BusinessCommon.scanGetReAssessDataByQRCode(order_id, result)
        var isNotebook = result[0] === 'ARC'
        isChangeStatus
            ? __actionApiActionBeforeArrive($btn, function () {
                __actionScanQRCodeSuccess({
                    params: params,
                    isNotebook: isNotebook
                })
            })
            : __actionScanQRCodeSuccess({
                params: params,
                isNotebook: isNotebook
            })
    }

    // 重新扫码同步验机信息
    function __test_actionReScanQRCode(resultStr) {
        var rootData = window.XXG.BusinessCommon.rootData
        var order_id = rootData.order.order_id
        var result = (resultStr || '').split('|') || []
        var params = window.XXG.BusinessCommon.scanGetReAssessDataByQRCode(order_id, result)
        var isNotebook = result[0] === 'ARC'
        __actionScanQRCodeSuccess({
            params: params,
            isNotebook: isNotebook
        })
    }

    // 扫码成功
    function __actionScanQRCodeSuccess(options) {
        options = options || {}
        var rootData = window.XXG.BusinessCommon.rootData
        var params = options.params,
            success = options.success,
            fail = options.fail

        if (options.isNotebook) {
            // 笔记本扫码成功
            return __actionScanQRCodeSuccessNotebook(options)
        }

        tcb.loadingStart()
        window.XXG.BusinessCommon.apiDoScanRePinggu(params, function (res) {
            tcb.loadingDone()
            if (res && res.errno === 12014) {
                // 错误码 12014 代表订单机型 和 检测机型不一致 弹窗提示用户走再来一单重新下单
                __actionScanReassessErrorDiffModel(res, options)
            } else if (res && res.errno === 12015) {
                // 扫码重新评估，SKU不同
                __actionScanReassessErrorDiffSku(res.result || [])
            } else {
                if (typeof success === 'function') {
                    success()
                } else {
                    var msg = (res && !res.errno)
                        ? (rootData.serviceRemoteCheck.remote_check_flag ? '扫码同步成功！' : '新的评估价为：' + res['result'])
                        : (res && res.errmsg) || '系统错误'
                    window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                        window.XXG.redirect()
                    }, msg, {
                        withoutClose: true
                    })
                }
            }
        }, function (err) {
            tcb.loadingDone()
            typeof fail === 'function' && fail(err)
        })
    }

    // 【笔记本】扫码成功
    function __actionScanQRCodeSuccessNotebook(options) {
        options = options || {}
        var params = options.params,
            success = options.success,
            fail = options.fail
        tcb.loadingStart()
        window.XXG.BusinessCommon.apiAddNotebookAutoCheckResult(params, function (res) {
            if (res && !res.errno) {
                var result = res.result || {}
                if (result.modelId && result.assessKey) {
                    var bindingArcRecordParams = {
                        order_id: params.order_id,
                        arc_assess_key: result.assessKey
                    }
                    if (params.ignore_model_check === true) {
                        bindingArcRecordParams.ignore_model_check = true
                    }
                    return window.XXG.BusinessCommon.apiBindingArcRecord(bindingArcRecordParams, function (res) {
                        tcb.loadingDone()
                        if (typeof success === 'function') {
                            success()
                        } else {
                            var msg = (res && !res.errno)
                                ? '扫码同步成功！'
                                : (res && res.errmsg) || '系统错误'
                            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                                window.XXG.redirect()
                            }, msg, {
                                withoutClose: true
                            })
                        }
                    }, function (err) {
                        tcb.loadingDone()
                        typeof fail === 'function' && fail(err)
                    })
                }
                res.errmsg = '数据错误'
            }
            tcb.loadingDone()
            // ['errno' => 19101, 'errmsg' => '笔记本机型映射不存在']
            // ['errno' => 19104, 'errmsg' => '笔记本SKU映射不存在']
            // ['errno' => 19106, 'errmsg' => '显卡缺失,请手动选择']
            // ['errno' => 12014, 'errmsg' => '验机机型和本订单回收机型不一致，请重新检验']
            if (res.errno === 12014 && res.result && res.result.canChangeModelFlag) {
                // 可以修改机型，进入此流程
                __actionScanReassessErrorDiffModel(res, options)
            } else if (res.errno === 19101 || res.errno === 19104) {
                res.result &&
                res.result.sequenceCode &&
                window.XXG.BusinessCommon.apiAutoCheckModelNotMatchNotice({
                    sequenceCode: res.result.sequenceCode
                }, null, null, {
                    silent: true
                })
                window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                    window.XXG.redirect()
                }, '验机结果同步处理延迟！请您稍等2-3分钟后再次尝试扫码', {
                    withoutClose: true
                })
            } else if (res.errno === 19106) {
                // 显卡缺失,请手动选择
                window.XXG.showDialogAddNoteBookAutoCheckGraphicsCardSelect(res.result && res.result.graphicsCardId, function (graphicsCardId) {
                    options.params = options.params || {}
                    options.params.graphicsCardId = graphicsCardId
                    __actionScanQRCodeSuccessNotebook(options)
                })
            } else {
                $.dialog.toast((res && res.errmsg) || '系统错误')
            }
        }, function (err) {
            tcb.loadingDone()
            typeof fail === 'function' && fail(err)
        })
    }

    //扫码成功后  订单机型 和 检测机型不一致 弹窗提示用户走再来一单重新下单
    function __actionScanReassessErrorDiffModel(res, options) {
        var result = res.result || {}
        if (result.canChangeModelFlag) {
            // canChangeModelFlag为true，表示支持更新机型，
            // 那么进入更新机型的流程
            return __actionScanReassessErrorDiffModelCanChange(res, options)
        }

        var differentModel = $('.different-alert-model-mask'),
            orderModelName = $('.different-alert-model-mask .order-model-name'),
            testModelName = $('.different-alert-model-mask .test-model-name')
        orderModelName.html(res.result.orderModelName)
        testModelName.html(res.result.assessModelName)
        differentModel.show()

        //播放提示音频
        var playNum = 1,
            timer,
            sound = new Howl({
                src: ['https://s5.ssl.qhres2.com/static/92875ec4bcd43b0d.mp3'],
                onend: function () {
                    //间隔两秒 再放一次。。。。。。
                    if (playNum === 1) {
                        timer = setTimeout(function () {
                            playNum++
                            sound.play()
                        }, 2000)
                    } else {
                        clearTimeout(timer)
                    }
                }
            })
        sound.play()
    }

    function __actionScanReassessErrorDiffModelCanChange(res, options) {
        var html_fn = $.tmpl(tcb.trim($('#JsXxgOrderDetailReassessErrorDiffModelCanChangeTpl').html())),
            html_st = html_fn(res.result),
            $html_st = $(html_st).appendTo('body')

        $html_st.find('.order-model').css('background-color', '#f7f7f7')
        $html_st.find('.test-model').css('background-color', '#ffe9dd')

        $html_st.find('.js-trigger-not-change-model-reassess').on('click', function (e) {
            // 回收原机型，重新验机，
            // 直接刷新页面
            e.preventDefault()
            window.XXG.redirect()
        })
        $html_st.find('.js-trigger-confirm-change-model').on('click', function (e) {
            // 回收检测机型
            e.preventDefault()

            $html_st.remove()

            options.params = options.params || {}
            // 当选择【回收检测机型】时，
            // 将请求参数增加ignore_model_check属性，并且设置为true
            options.params.ignore_model_check = true

            __actionScanQRCodeSuccess(options)
        })
    }

    // window.__actionScanReassessErrorDiffModelCanChange = __actionScanReassessErrorDiffModelCanChange

    // 扫码重新评估，SKU不同
    function __actionScanReassessErrorDiffSku(result) {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            if (typeof window.XXG.BusinessCommon.callbackReAssessSkuDiff === 'function') {
                window.XXG.BusinessCommon.callbackReAssessSkuDiff()
            } else {
                $('.btn-old-deal-cancel.js-trigger-go-next')
                    .trigger('click')
            }
        }, window.XXG.BusinessCommon.htmlTpl('#JsMXxgOrderDetailBusinessCommonSkuNotMatchTpl', result), {
            withoutClose: true,
            noWrap: true,
            className: 'dialog-order-detail-sku-not-match',
            title: '检测到该回收手机与上一次检测的不一致，交易取消',
            options: {
                btn: '旧机不成交'
            }
        })
    }

    // 扫码失败
    function __actionScanQRCodeFail(refresh) {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            refresh && window.XXG.redirect()
        }, '无法自动验机，请联系客服！！！<br>手动<span class="marked">修改评估项</span>，<span class="marked">修改SKU</span>', {
            withoutClose: true
        })
    }

    // 调起扫码，重新评估
    function __scanQRCodeReassess(callback, fail) {
        var rootData = window.XXG.BusinessCommon.rootData
        var order_id = rootData.order.order_id

        return window.XXG.BusinessCommon.scanQRCode(function (resultStr) {
            var result = (resultStr || '').split('|') || []
            var params = window.XXG.BusinessCommon.scanGetReAssessDataByQRCode(order_id, result)
            typeof callback === 'function' && callback(params, result[0] === 'ARC')
        }, fail)
    }

    // 无法自动验机
    function doCantScanQrcode($btn) {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            __actionApiActionBeforeArrive($btn, true)
        }, '无法自动验机，请联系客服<br>手动<span class="marked">修改评估项</span>，<span class="marked">修改SKU</span>')
    }

    // 展示开始远程验机弹窗提示
    function actionServiceRemoteCheckShowStartTips(data) {
        if (!window.XXG.ServiceRemoteCheck.actionIsRemoteCheckWorkTime()) {
            // 不在远程验机时间内，那么弹出提示
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null, '服务时间为早9点至晚10点，请在此时间段内操作订单')
        } else if (data.isScannedReAssess || data.serviceRemoteCheck.remote_check_flag_process) {
            // 已经扫码重新评估 || 已经进入了远程验机流程
            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                window.XXG.ServiceUploadPicture.show()
            }, '是否开始智能验机？', {
                // withoutClose: true,
                options: {
                    btn: '开始'
                }
            })
        } else {
            window.XXG.BusinessCommon.helperShowAlertConfirm(null, '请先扫码评估！')
        }
    }

    function actionLoopExpressInfo(data) {
        var order = data.order || {}
        if (order.status == 13 && !(order.send_out && (order.send_out.logistics_mail_no || order.send_out.logistics_express_status_fail))) {
            // 订单服务完成，但是还没有快递单号，那么轮询获取快递信息，获取到了之后刷新页面
            var loopDone = false

            function loopExpressInfo() {
                if (loopDone) {
                    return
                }
                window.XXG.BusinessCommon.apiGetOrderExpressInfo({order_id: order.order_id}, function (res) {
                    if (res && res.express && (res.express.express_id || res.express.express_status_fail)) {
                        loopDone = true
                        if (res.express.express_id) {
                            order.send_out = {
                                logistics_mail_no: res.express.express_id,
                                logistics_company_name: res.express.express_name
                            }
                        } else if (res.express.express_status_fail) {
                            order.send_out = {
                                logistics_express_status_fail: res.express.express_status_fail
                            }
                        }
                        window.XXG.redirect()
                    }
                }, null, {silent: 1})
                setTimeout(loopExpressInfo, 2000)
            }

            loopExpressInfo()
        }
    }

    function actionStartDeliveryExpressCountdown(data) {
        var $countdown = $('.delivery-express-countdown')
        if (!$countdown.length) {
            return
        }
        var order = data.order || {}
        var newstatus_time = order.newstatus_time || ''
        var now_time = window.XXG.BusinessCommon.helperNowTime()
        // var end_time = now_time + 2 * 60 * 1000
        var end_time = Date.parse(newstatus_time.replace(/-/g, '/')) + 10 * 60 * 1000
        if (end_time <= now_time) {
            return
        }
        startCountdown(end_time, now_time, $countdown, {
            end: function () {
                window.XXG.redirect()
            }
        })
    }

    // 丰修上门回收--显示城市督导信息
    function actionShowCityManagerInfo($btn, data, callback) {
        var order = data.order || {}
        var serviceRemoteCheck = data.serviceRemoteCheck || {}

        if (serviceRemoteCheck.remote_check_flag && serviceRemoteCheck.remote_check_flag_process == 3) {
            window.XXG.BusinessCommon.apiGetCityManagerInfo({
                order_id: order.order_id
            }, function (res) {
                var info = res.info || {}
                var html_st = window.XXG.BusinessCommon.htmlBusinessCommonDialogCityManager({info: info})
                var dialogInst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
                    withClose: true
                })
                dialogInst.wrap.find('.js-trigger-sf-fix-re-cancel-order').on('click', function (e) {
                    e.preventDefault()

                    window.XXG.BusinessCommon.helperCloseDialog(dialogInst)

                    $.isFunction(callback) && callback($btn, data)
                })
            }, function () {
                $.isFunction(callback) && callback($btn, data)
            })
        } else {
            $.isFunction(callback) && callback($btn, data)
        }
    }
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_common/api.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        apiActionBeforeArrive: apiActionBeforeArrive,
        apiDoScanRePinggu: apiDoScanRePinggu,
        apiAddNotebookAutoCheckResult: apiAddNotebookAutoCheckResult,
        apiBindingArcRecord: apiBindingArcRecord,
        apiAutoCheckModelNotMatchNotice: apiAutoCheckModelNotMatchNotice,
        apiUpdateOrder: apiUpdateOrder,
        apiCloseOrder: apiCloseOrder,
        apiFinishOrder: apiFinishOrder,
        apiUpdateServerTime: apiUpdateServerTime,
        apiGetFinalPriceStructure: apiGetFinalPriceStructure,
        apiGetOrderExpressInfo: apiGetOrderExpressInfo,
        apiGetMobileRestoreSituation: apiGetMobileRestoreSituation,
        apiOrderXxgTrace: apiOrderXxgTrace,
        apiGetCityManagerInfo: apiGetCityManagerInfo
    })

    // 修修哥开始服务前的操作：1、接单；2、出发；3、到达
    function apiActionBeforeArrive($btn, callback, fail) {
        var btn_text = $btn.html(),
            order_id = $btn.attr('data-order-id'),
            now_status = $btn.attr('data-now-status'),
            next_status = $btn.attr('data-next-status')

        window.XXG.ajax({
            url: tcb.setUrl('/m/aj_xxg_parent_status'),
            data: {
                'parent_id': order_id,
                'now_status': now_status,
                'next_status': next_status
            },
            beforeSend: function () {
                if ($btn.hasClass('btn-disabled')) {
                    return false
                }
                $btn.addClass('btn-disabled').html('处理中...')
            },
            success: function (res) {
                if (!res.errno) {
                    setTimeout(function () {
                        $btn.removeClass('btn-disabled').html(btn_text)
                    }, 1000)
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $btn.removeClass('btn-disabled').html(btn_text)
                    $.dialog.toast(res.errmsg)
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $btn.removeClass('btn-disabled').html(btn_text)
                $.dialog.toast('系统错误，请稍后重试')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 扫码评估（重新评估）
    function apiDoScanRePinggu(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/doScanRePinggu'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 添加笔记本自动评估结果（获取modelId和assessKey）
    function apiAddNotebookAutoCheckResult(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/addNotebookAutoCheckResult'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 笔记本自动验机绑定到订单（重新评估）
    function apiBindingArcRecord(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/bindingArcRecord'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    /**
     * 自动验机-机型映射不存在的通知
     * @param data
     *      {
     *          sequenceCode,
     *          [imageUrl]
     *      }
     * @param callback
     * @param fail
     */
    function apiAutoCheckModelNotMatchNotice(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl('/m/autoCheckModelNotMactchNotice'),
            type: 'POST',
            data: data,
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 更新订单信息
    function apiUpdateOrder(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/aj_up_order_info'),
            type: 'POST',
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 关闭订单
    function apiCloseOrder(data, callback, fail) {
        // var data = {
        //     order_id: order_id,
        //     xxg_memo: ''
        // }
        window.XXG.ajax({
            url: tcb.setUrl('/m/aj_close_order'),
            type: 'POST',
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 完成订单
    function apiFinishOrder($btn, callback, fail) {
        var btn_text = $btn.html(),
            order_id = $btn.attr('data-order-id'),
            now_status = $btn.attr('data-now-status')

        window.XXG.ajax({
            url: tcb.setUrl('/m/aj_wancheng_order'),
            data: {
                'order_id': order_id,
                'status': now_status
            },
            beforeSend: function () {
                if ($btn.hasClass('btn-disabled')) {
                    return false
                }
                $btn.addClass('btn-disabled').html('处理中...')
            },
            success: function (res) {
                if (!res.errno) {
                    setTimeout(function () {
                        $btn.removeClass('btn-disabled').html(btn_text)
                    }, 1000)
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $btn.removeClass('btn-disabled').html(btn_text)
                    $.dialog.toast(res.errmsg)
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $btn.removeClass('btn-disabled').html(btn_text)
                $.dialog.toast('系统错误，请稍后重试')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 更新上门服务时间
    function apiUpdateServerTime(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl2('/m/changeOrderToHomeDate'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    function apiGetFinalPriceStructure(data, success, fail, complete) {
        window.XXG.ajax({
            url: '/m/doGenFinalPriceStructure',
            data: data,
            success: function (res) {
                var add_price = -1
                var sum_price
                if (res && !res.errno) {
                    var result = res.result
                    add_price = result.add_price
                    sum_price = result.sum_price
                    typeof success === 'function' && success(add_price, sum_price)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试')
                    typeof fail === 'function' && fail()
                }
                typeof complete === 'function' && complete(add_price, sum_price)
            },
            error: function (err) {
                $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                typeof fail === 'function' && fail()
                typeof complete === 'function' && complete(-1)
            }
        })
    }

    /**
     * 获取修修哥回寄的订单信息
     * @param data
     *      {
     *          order_id
     *      }
     * @param callback
     * @param fail
     */
    function apiGetOrderExpressInfo(data, callback, fail, options) {
        window.XXG.ajax({
            url: tcb.setUrl2('/m/getOrderExpressInfo'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    /**
     * 获取修修哥回传机器还原图片是否正确
     * @param data
     *      {
     *          order_id
     *          img_url
     *      }
     * @param callback
     * @param fail
     */
    function apiGetMobileRestoreSituation(data, callback, fail, options) {
        window.XXG.ajax({
            url: tcb.setUrl2('/m/getMobileRestoreSituation'),
            type: 'POST',
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    /**
     *
     * @param data
     *      {
     *          order_id
     *          scene   10开始验机  20扫码验机结果
     *      }
     * @param callback
     * @param fail
     */
    function apiOrderXxgTrace(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl2('/orderXxgTrace'),
            data: data,
            beforeSend: function () {},
            complete: function () {
                typeof callback === 'function' && callback()
            }
        })
    }

    // 获取城市督导信息
    function apiGetCityManagerInfo(data, callback, fail) {
        window.XXG.ajax({
            type: 'POST',
            url: tcb.setUrl('/xxgHs/getMerchandiserInfo'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno && res.result && res.result.info && res.result.info.name) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                typeof fail === 'function' && fail()
            }
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_common/event.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        $FormUpdateOrderInfo: null,
        fnQueueTriggerReScanQRCode: [],
        fnQueueRenderDone: [],

        eventBind: eventBind,
        eventBindFormUpdateOrderInfo: eventBindFormUpdateOrderInfo,
        eventBindPickupServerTime: eventBindPickupServerTime,
        eventBindCancelOrderAndRefund: eventBindCancelOrderAndRefund,
        eventBindFormSfFixReturn: eventBindFormSfFixReturn,
        eventBindCopy: eventBindCopy,
        eventBindDeviceResetAndUploadPhoto: eventBindDeviceResetAndUploadPhoto,

        eventTriggerRenderDone: eventTriggerRenderDone,
        eventTriggerFormUpdateOrderInfo: eventTriggerFormUpdateOrderInfo,
        eventTriggerFormUpdateOrderInfoGoNext: eventTriggerFormUpdateOrderInfoGoNext
    })

    // 根据触发器绑定代理事件，只能执行一次
    function eventBind(data) {
        if (eventBind.__bind) {
            return
        }
        eventBind.__bind = true
        tcb.bindEvent({
            // 展开/收起 更多订单信息
            '.js-trigger-expand-n-collapse': function (e) {
                e.preventDefault()
                var $me = $(this)
                var $orderDeal = $me.closest('.block-order-deal')
                if (!$orderDeal.length) {
                    return
                }
                $me.toggleClass('arrow-down arrow-up')
                $orderDeal.find('.block-order-base-info-extend').slideToggle(200)
            },
            // 手动更新成交价
            '.js-trigger-update-deal-price': function (e) {
                e.preventDefault()
                var order = data.order
                if (parseFloat(order.final_price) > 0) {
                    window.XXG.BusinessCommon.eventTriggerFormUpdateOrderInfo()
                } else {
                    window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                        window.XXG.BusinessCommon.eventTriggerFormUpdateOrderInfo()
                    }, '价格提交后将不能再更改评估项！')
                }
            },
            // 订单下一步
            '.js-trigger-go-next': function (e) {
                e.preventDefault()
                var $me = $(this)
                var fnQueueGoNext = window.XXG.BusinessCommon.eventBind.fnQueueGoNext || []
                // 遍历执行下一步的函数队列
                tcb.each(fnQueueGoNext, function (i, fn) {
                    if (fn(e, $me, data) === false) {
                        // 如果事件队列中某一个返回false，那么退出执行队列
                        return false
                    }
                })
            },
            // 显示评估详情
            '.js-trigger-sf-fix-show-assess-detail': function (e) {
                e.preventDefault()
                window.XXG.BusinessCommon.reassessShowOrderAssessDetail($(this))
            },
            // 重新扫码
            '.js-trigger-re-scan-qrcode': function (e) {
                e.preventDefault()
                var $me = $(this)
                var fnQueueTriggerReScanQRCode = [].concat(window.XXG.BusinessCommon.fnQueueTriggerReScanQRCode || [],
                    function () {
                        window.XXG.BusinessCommon.actionReScanQRCode($me, data)
                    }
                )
                // 遍历执行下一步的函数队列
                !function executeFnQueue(fnQueue, fn_final) {
                    if (!fnQueue.length) {
                        return typeof fn_final === 'function' && fn_final()
                    }
                    var fn = fnQueue.shift()
                    // 如果事件队列中某一个函数不执行下一个的回调时退出执行队列
                    fn(e, $me, data, function () {
                        executeFnQueue(fnQueue, fn_final)
                    }, function (isStop) {
                        !isStop && typeof fn_final === 'function' && fn_final()
                    })
                }(fnQueueTriggerReScanQRCode)
            },
            // 查看回收手机参数详情
            '.js-trigger-show-assess-options': function (e) {
                e.preventDefault()
                window.XXG.BusinessCommon.reassessShowOrderAssessOptions($(this))
            },
            // 查看回收手机SKU属性详情
            '.js-trigger-show-assess-sku': function (e) {
                e.preventDefault()
                window.XXG.BusinessCommon.reassessShowOrderAssessSku($(this))
            },
            // 展开收起评估结果
            '.js-trigger-toggle-order-detail-assess-item': function (e) {
                e.preventDefault()
                var $me = $(this)
                var $inner = $me.find('span')
                var $assessItemSame = $me.closest('.block-assess-detail').find('.assess-item-same')
                var $assessItemSameTip = $me.closest('.block-assess-detail').find('.assess-item-same-tip')

                if ($inner.hasClass('arrow-down')) {
                    $inner.removeClass('arrow-down').addClass('arrow-up').html('收起')
                    $assessItemSame.show()
                    $assessItemSameTip.length && $assessItemSameTip.hide()
                } else {
                    $inner.removeClass('arrow-up').addClass('arrow-down').html('查看全部')
                    $assessItemSame.hide()
                    $assessItemSameTip.length && $assessItemSameTip.show()
                }
                $.scrollTo({
                    endY: $('.block-order-deal').offset()['top']
                })
            },
            // 扫码获取物流单号
            '.js-trigger-scan-express-no': function (e) {
                e.preventDefault()
                var $me = $(this)
                window.XXG.BusinessCommon.scanQRCode(function (str) {
                    $me.siblings('input').val(str)
                })
            },
            //   用户重新下单 走再来一单流程
            //     '.js-re-order':function (e) {
            //         e.preventDefault()
            //         var differentMask = $('.different-alert-model-mask'),
            //             differentOrderId = $(this).attr('data-different-order-id'),
            //             differentPhone = $(this).attr('data-different-phone')
            //         //关掉当前页面弹窗
            //         differentMask.hide()
            //         window.location.href = tcb.setUrl('/m/hs_xxg_order_list', {"source_page":"zlyd"});
            //             var mask = $('.zlyd-alert-model-mask'),
            //                 zlydSuccess = $('.zlyd-alert-model-mask .zlyd-success')
            //             $('.zlyd-alert-model .zlyd-user-information span').html(differentPhone)
            //             $('.zlyd-alert-model-btn-confirm').attr('href','/huishou/confirmAgainOneOrder?order_id='+differentOrderId)
            //             zlydSuccess.show()
            //             mask.show()
            //
            //
            //     },
            // 关闭机型不一致弹窗
            '.close-different-model': function (e) {
                e.preventDefault()
                // var differentMask = $('.different-alert-model-mask')
                // differentMask.hide()
                window.XXG.redirect()
            },
            '.js-trigger-reload-express-info': function (e) {
                e.preventDefault()
                var $me = $(this)
                var $icon = $me.find('.icon-reload-express-info')
                $icon.off()
                $icon.on('transitionend', function (e) {
                    console.log(111)
                    $icon.css({
                        'transition': 'none',
                        'transform': 'rotate(0deg)'
                    })
                })
                $icon.css({
                    'transition': 'transform 1.2s',
                    'transform': 'rotate(360deg)'
                })
            },
            '.js-trigger-order-xxg-trace': function (e) {
                var $me = $(this)
                var order_id = $me.attr('data-order-id')
                var scene = $me.attr('data-tap-scene')
                window.XXG.BusinessCommon.apiOrderXxgTrace({order_id: order_id, scene: scene})
            }
        })
    }

    // 设置 fnQueueGoNext
    eventBind.fnQueueGoNext = [__fnGoNext]

    // 事件--下一步
    function __fnGoNext(e, $trigger, data) {
        var isContinue = true
        if (!__validGoNext($trigger)) {
            return false
        }
        var act = $trigger.attr('data-act')
        switch (act) {
            case 'jiedan':
                // 接单
                isContinue = false
                window.XXG.BusinessCommon.actionJieDan($trigger, data)
                break
            case 'chufa':
                // 出发
                isContinue = false
                window.XXG.BusinessCommon.actionChuFa($trigger)
                break
            case 'fill-up-info':
                // 填写完善旧机信息
                isContinue = false
                window.XXG.BusinessCommon.actionFillUpInfo($trigger, data)
                break
            case 'cancel-refund':
                // 取消订单，并且去退款
                isContinue = false
                window.XXG.BusinessCommon.actionTriggerCancelAndRefund($trigger, data)
                break
            case 'scan-qrcode':
                // 扫码同步验机信息
                isContinue = false
                window.XXG.BusinessCommon.actionScanQRCode($trigger, data)
                break
            case 'cant-scan-qrcode':
                // 无法自动验机
                isContinue = false
                window.XXG.BusinessCommon.actionCantScanQRCode($trigger)
                break
            case 'trigger-remote-check-upload-picture':
                // 触发远程验机传图
                isContinue = false
                window.XXG.BusinessCommon.actionServiceRemoteCheckShowStartTips(data)
                break
            default:
                break
        }

        return isContinue
    }

    function __validGoNext($trigger) {
        if ($trigger && $trigger.length && $trigger.hasClass('btn-go-next-lock')) {
            return
        }
        var errMsg = ''
        if (!errMsg && window.__SUNING_YUNDIAN_MINIAPP_NEED_FILL_UP) {
            errMsg = '请完善用户收款信息。'
        }
        if (!errMsg && window.__IS_NEEDED_MANAGER_CHECK && window.__IS_MANAGER_CHECK_STARTED) {
            // 店长审核校验
            if (!window.__IS_MANAGER_CHECK_SUCCESS) {
                // 审核没有通过，那么提示审核通过了之后之后再操作。
                // 在此只是设置错误提示信息，还不做操作，
                // 如果还有远程验机相关操作，那么先保证远程验机操作可以继续，例如远程验机被驳回，那么可以继续传图等
                errMsg = '请等待审核通过再操作。'
            }
        }
        // if (!errMsg && window.__IDCARD_INFO__.force_flag !== null && (window.__IDCARD_INFO__.force_flag && !window.__IDCARD_INFO__.have_flag)) {
        //     // 校验是否填写身份证信息
        //     if (window.__IDCARD_INFO__.force_flag && !window.__IDCARD_INFO__.have_flag) {
        //         errMsg = '请填写顾客身份证后再提交。'
        //     }
        // }
        if (errMsg) {
            $.dialog.toast(errMsg)
            return
        }
        return true
    }

    // 绑定更新订单信息表单
    function eventBindFormUpdateOrderInfo($form, $trigger, callback) {
        if (!($form && $form.length)) {
            return
        }
        window.XXG.BusinessCommon.$FormUpdateOrderInfo = $form

        var trigger_text = $trigger.html()

        window.XXG.bindForm({
            $form: $form,
            before: function ($form, next, before_cb) {
                if (!__validUpdateOrderByGoNext($form)) {
                    return false
                }
                if ($trigger.hasClass('btn-disabled')) {
                    return false
                }
                if (typeof before_cb === 'function' && !before_cb($form)) {
                    return false
                }

                $trigger.addClass('btn-disabled').html('处理中...')
                tcb.loadingStart()
                next()
            },
            success: function (res, $form, success_cb) {
                tcb.loadingDone()
                var imei = tcb.trim($form.find('[name="imei"]').val() || '')
                var memo = tcb.trim($form.find('[name="memo"]').val() || '')
                window.__ORDER.imei = window.__ORDER_INFO.imei = imei
                window.__ORDER.memo = window.__ORDER_INFO.memo = memo

                // 数据更新成功
                setTimeout(function () {
                    $trigger.removeClass('btn-disabled').html(trigger_text)
                }, 400)

                if (typeof success_cb === 'function') {
                    success_cb(res, $form, $trigger)
                } else {
                    typeof callback === 'function' && callback()
                }

                // return window.showPageCustomerSignature && window.showPageCustomerSignature()
            },
            error: function (res, error_cb) {
                tcb.loadingDone()
                window.__SAMSUMG_SUBSIDY_5G = false
                $trigger.removeClass('btn-disabled').html(trigger_text)
                if (typeof error_cb === 'function') {
                    return error_cb(res)
                }
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })

        function __bindPriceEvent($form) {
            var $price = $form.find('[name="price"]')
            var $order_id = $form.find('[name="order_id"]')
            $price.on('input change', function () {
                var $me = $(this)
                var price = $me.val()
                var order_id = $order_id.val()
                window.XXG.BusinessCommon.apiGetFinalPriceStructure({
                    orderId: order_id,
                    price: price
                }, null, null, function (add_price) {
                    if (add_price > -1) {
                        $('.price-structure-add-price').html(add_price > 0 ? '再+' + add_price + '元补贴' : '')
                    }
                })
            })
        }

        __bindPriceEvent($form)
    }

    // 验证下一步前的提交参数
    function __validUpdateOrderByGoNext($Form) {
        var flag = true,
            toast_text = '',
            $focus = null

        var $assessPrice = $('.row-order-assess-price .col-12-8'),
            $dealPrice = $Form.find('[name="price"]'),
            $dealImei = $Form.find('[name="imei"]'),
            $dealMemo = $Form.find('[name="memo"]')

        if ($dealPrice && $dealPrice.length) {
            var price = parseFloat(tcb.trim($dealPrice.val()))
            if (!price) {
                flag = false
                $focus = $focus || $dealPrice
                $dealPrice.closest('.form-item-row').shine4Error()
            }
        }
        if ($dealImei && $dealImei.length) {
            var imei = tcb.trim($dealImei.val())
            if (!imei) {
                flag = false
                $focus = $focus || $dealImei
                $dealImei.closest('.form-item-row').shine4Error()
            }
        }
        if ($dealMemo && $dealMemo.length) {
            var memo = tcb.trim($dealMemo.val())
            var assess_price = tcb.trim($assessPrice.html())
            if (price && parseFloat(price) != parseFloat(assess_price) && !memo) {
                flag = false
                $focus = $focus || $dealMemo
                $dealMemo.closest('.form-item-row').shine4Error()
                toast_text = '评估价和成交价不一致，请填写备注'
            }
        }

        if ($focus && $focus.length) {
            setTimeout(function () {
                $focus.focus()
            }, 200)
        }

        if (toast_text) {
            $.dialog.toast(toast_text, 2000)
        }

        return flag
    }

    // 选择上门服务时间
    function eventBindPickupServerTime($trigger) {
        var order_id = $trigger.attr('data-order-id')
        var pickerData = []
        tcb.each(window.__ALLOW_SERVER_TIME__ || [], function (i, item) {
            pickerData.push({
                id: i,
                name: item
            })
        })

        var pos = 0

        Bang.Picker({
            // 实例化的时候自动执行init函数
            flagAutoInit: true,
            // 触发器
            selectorTrigger: $trigger,

            col: 1,
            data: [pickerData],
            dataTitle: ['请选择时间'],
            dataPos: [pos],

            callbackTriggerBefore: function () {
                if (!(pickerData && pickerData.length)) {
                    $.dialog.toast('抱歉选择时间缺失，无法选择', 3000)
                    return false
                }
            },
            // 回调函数(确认/取消)
            callbackConfirm: function (inst) {
                var data = inst.options.data || [],
                    dataPos = inst.options.dataPos || [],
                    selectedData = data[0][dataPos[0]],
                    serverTime = selectedData.name
                var requestData = {
                    order_id: order_id,
                    datetime: serverTime
                }
                if (window.__IS_SHOW_DAODIAN_SERVER_TIME) {
                    // 到店时间选择
                    var tips = '<div style="text-align: center">注意：您填写的时间将短信通知用户！</div>'
                    window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                        __updateServerTime(requestData, function () {
                            window.__DAODIAN_SERVER_TIME = serverTime
                            $.dialog.toast('填写成功，已短信通知用户预约时间', 3000)
                            $trigger.closest('.row').find('.col-server-time').html(serverTime)
                        })
                    }, tips)
                } else {
                    // 普通上门时间选择
                    __updateServerTime(requestData, function () {
                        setTimeout(function () {
                            window.XXG.redirect()
                        }, 10)
                    })
                }
            },
            callbackCancel: null
        })
    }

    function __updateServerTime(data, callback) {
        tcb.loadingStart()
        window.XXG.BusinessCommon.apiUpdateServerTime(data, function (res) {
            tcb.loadingDone()
            typeof callback === 'function' && callback(res)
        }, function () {
            tcb.loadingDone()
        })
    }

    // 取消订单，并且退款
    function eventBindCancelOrderAndRefund($form, $trigger, callback) {
        window.XXG.bindForm({
            $form: $form,
            before: function ($form, next) {
                var $xxg_memo = $form.find('[name="xxg_memo"]'),
                    xxg_memo = tcb.trim($xxg_memo.val())
                if (!xxg_memo) {
                    $xxg_memo.attr('data-error-msg') && $.dialog.toast($xxg_memo.attr('data-error-msg'))
                    return $xxg_memo.shine4Error()
                }
                tcb.loadingStart()
                next()
            },
            success: function () {
                tcb.loadingDone()
                typeof callback === 'function' && callback()
            },
            error: function (res) {
                tcb.loadingDone()
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })
    }

    // 绑定丰修退回新机和寄回旧机的快递表单
    function eventBindFormSfFixReturn($Form, $trigger, callback) {
        if (!($Form && $Form.length)) {
            return
        }

        $Form.find('[name="mail_no"]').on('input change', function (e) {
            var $me = $(this),
                val = $me.val()

            val = val.replace(/[^\dA-Za-z]/g, '').toUpperCase()
            $me.val(val)
        })

        var trigger_text = $trigger.html()

        window.XXG.bindForm({
            $form: $Form,
            before: function ($Form, callback) {
                if (!__validFormSfFixReturn($Form)) {
                    return false
                }
                if ($trigger.hasClass('btn-disabled')) {
                    return false
                }
                $trigger.addClass('btn-disabled').html('处理中...')
                callback()
            },
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (res) {
                $trigger.removeClass('btn-disabled').html(trigger_text)
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })
    }

    function __validFormSfFixReturn($Form) {
        var flag = true,
            toast_text = '',
            $focus = null

        var $company_name = $Form.find('[name="company_name"]'),
            $mail_no = $Form.find('[name="mail_no"]')

        if ($company_name && $company_name.length) {
            var company_name = tcb.trim($company_name.val())
            if (!company_name) {
                flag = false
                $focus = $focus || $company_name
                $company_name.closest('.form-item-row').shine4Error()
            }
        }
        if ($mail_no && $mail_no.length) {
            var mail_no = tcb.trim($mail_no.val())

            if (!mail_no) {
                flag = false
                $focus = $focus || $mail_no
                $mail_no.closest('.form-item-row').shine4Error()
            }
        }
        if ($focus && $focus.length) {
            setTimeout(function () {
                $focus.focus()
            }, 200)
        }

        if (toast_text) {
            $.dialog.toast(toast_text, 2000)
        }

        return flag
    }

    // 绑定复制事件
    function eventBindCopy($el) {
        $el.each(function () {
            new ClipboardJS(this).on('success', function (e) {
                $.dialog.toast('复制成功：' + (e.text.replace(/\\n/ig, '<br>')))
            })
        })
    }

    // 绑定设备重置图片上传相关事件
    function eventBindDeviceResetAndUploadPhoto(next, final) {
        var $wrap = $('.block-device-reset-and-upload-photo')
        if (!$wrap.length) {
            return
        }

        var $trigger_show_big = $wrap.find('.js-trigger-show-big-figure-picture')
        var $trigger = $wrap.find('.js-trigger-device-reset-and-upload-photo')
        var $trigger_submit = $wrap.find('.js-trigger-submit-device-reset-and-upload-photo')
        var inst = new window.TakePhotoUpload({
            $trigger: $trigger,
            callback_upload_success: function (inst, data) {
                // console.log('触发了上传图片的函数')
                if (data && !data.errno) {
                    var $triggerCurrent = inst.$triggerCurrent
                    if (!($triggerCurrent && $triggerCurrent.length)) {
                        return
                    }
                    // console.log(inst, data)
                    $triggerCurrent.css('backgroundImage', 'url(' + data.result + ')')
                    $triggerCurrent.find('div').hide()
                    $trigger_submit.attr('data-img', data.result)
                } else {
                    return $.dialog.toast((data && data.errmsg) || '系统错误')
                }
            },
            callback_upload_fail: function (me, xhr, status, err) {
                $.dialog.toast(xhr.statusText || '上传失败，请稍后再试')
            }
        })

        $trigger_show_big.on('click', function (e) {
            e.preventDefault()

            var $me = $(this)
            var img_url = $me.attr('data-big')
            var $big = $('<div class="grid column justify-center align-center" style="position: fixed;top: 0;right: 0;bottom: 0;left: 0;background-color: rgba(0,0,0,0.5);">' +
                '<div class="col" style="padding-top:100%;background: transparent url(' + img_url + ') no-repeat center;background-size: contain;"></div>' +
                '</div>')
            $big.appendTo('body')
            $big.on('click', function (e) {
                e.preventDefault()
                $big.remove()
            })
        })
        $trigger_submit.on('click', function (e) {
            e.preventDefault()

            var $me = $(this)
            if ($me.attr('data-is-clicking')) {
                return
            }
            var img_url = $me.attr('data-img')
            if (!img_url) {
                return $.dialog.toast('请拍照上传还原后照片')
            }
            $me.attr('data-is-clicking', '1')
            var rootData = window.XXG.BusinessCommon.rootData
            var order_id = rootData.order.order_id
            window.XXG.BusinessCommon.apiGetMobileRestoreSituation({
                order_id: order_id,
                img_url: img_url
            }, function (res) {
                var result = res.result || {}
                if (!result.adoptFlag) {
                    $me.attr('data-is-clicking', '')
                    $.dialog.toast('照片有误，请重新上传！')
                    var $triggerCurrent = inst.$triggerCurrent
                    if (!($triggerCurrent && $triggerCurrent.length)) {
                        return
                    }
                    // console.log(inst, data)
                    $triggerCurrent.css('backgroundImage', '')
                    $triggerCurrent.find('div').show()
                    $trigger_submit.attr('data-img', '')
                    return
                }
                setTimeout(function () {
                    window.XXG.redirect()
                }, 10)
            }, function () {
                $me.attr('data-is-clicking', '')
            })
        })

        next()
    }

    /*********** TRIGGER ***********/
    function eventTriggerRenderDone(fn_final) {
        var fnQueueRenderDone = [].concat(window.XXG.BusinessCommon.fnQueueRenderDone || [])
        // 遍历执行下一步的函数队列
        !function executeFnQueue(fnQueue, fn_final) {
            if (!fnQueue.length) {
                return typeof fn_final === 'function' && fn_final()
            }
            var fn = fnQueue.shift()
            // 如果事件队列中某一个函数不执行下一个的回调时退出执行队列
            fn(function () {
                executeFnQueue(fnQueue, fn_final)
            }, function (isStop) {
                !isStop && typeof fn_final === 'function' && fn_final()
            })
        }(fnQueueRenderDone, fn_final)
    }

    // 触发订单更新-更新完成后直接刷新页面
    function eventTriggerFormUpdateOrderInfo() {
        var $Form = window.XXG.BusinessCommon.$FormUpdateOrderInfo || null
        if (!($Form && $Form.length)) {
            return
        }
        $Form.trigger('submit', [
            null,
            function (res, $form, $trigger) {
                window.XXG.redirect()
            }
        ])
    }

    // 触发订单更新-更新完成进入通用流程下一步
    function eventTriggerFormUpdateOrderInfoGoNext() {
        var $Form = window.XXG.BusinessCommon.$FormUpdateOrderInfo || null
        if (!($Form && $Form.length)) {
            return
        }
        $Form.trigger('submit', [
            function ($form) {
                if (window.__IS_SHOW_DAODIAN_SERVER_TIME &&
                    (!window.__DAODIAN_SERVER_TIME || window.__DAODIAN_SERVER_TIME === '0000-00-00 00:00:00')) {
                    $.dialog.toast('请选择上门时间')
                    return false
                }

                return true
            },
            function (res, $form, $trigger) {
                var order_id = $form.find('[name="order_id"]').val()
                var price = $form.find('[name="price"]').val()

                var checked_need = false
                var checked_done = true
                if (window.__IS_NEEDED_MANAGER_CHECK) {
                    checked_need = true
                    if (!window.__IS_MANAGER_CHECK_SUCCESS) {
                        // 店长审核--暂未通过
                        checked_done = false
                    }
                }
                if (window.__REMOTE_CHECK_FLAG) {
                    checked_need = true
                    if (window.__REMOTE_CHECK_FLAG_PROCESS != 3) {
                        // 远程验机--暂未通过
                        checked_done = false
                    }
                }
                if (checked_need && checked_done) {
                    // 店长审核||远程验机，完成
                    return window.isNeedCheckUnlocked(function (is_need_unlock) {
                        if (is_need_unlock) {
                            // 检查解锁状态
                            window.checkUnlocked(function () {
                                // 已解锁
                                window.showPageCustomerSignature && window.showPageCustomerSignature()
                            })
                        } else {
                            window.showPageCustomerSignature && window.showPageCustomerSignature()
                        }
                    })
                }
                if (window.__IS_HUANBAOJI || !window.__IS_NEEDED_PIC) {
                    // 环保机 || 不需要imei和传图
                    return window.showPageCustomerSignature && window.showPageCustomerSignature()
                }

                window.isNeedCheckUnlocked(function (is_need_unlock) {
                    if (is_need_unlock) {
                        window.addCheckUnlockQueue()
                    }
                })
                if (window.__SAMSUMG_SUBSIDY_5G) {
                    window.__SAMSUMG_SUBSIDY_5G = false
                    window.location.href = tcb.setUrl2('/m/activity?orderId=' + order_id + '&subsidyType=' + window.__SAMSUNG__ACTIVITY_INFO['5G']['subsidyType'])
                } else {
                    // 显示上传图片界面
                    window.XXG.ServiceUploadPicture.show()
                    // window.showPageUploadPicture && window.showPageUploadPicture({
                    //     order_id: order_id,
                    //     price: price
                    // })
                }
            }
        ])
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_common/helper.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        helperNowTime: helperNowTime,
        helperShowDialog: helperShowDialog,
        helperCloseDialog: helperCloseDialog,
        helperShowAlertConfirm: helperShowAlertConfirm,
        helperShowConfirm: helperShowConfirm
    })

    var NOW_PADDING = window.__NOW - Date.now()

    function helperNowTime() {
        return window.__NOW = Date.now() + NOW_PADDING
    }

    function helperShowDialog(content, options) {
        options = tcb.mix({
            middle: true
        }, options || {})
        options.className = options.className
            ? [options.className, 'dialog-xxg-order-detail-v2020'].join(' ')
            : 'dialog-xxg-order-detail-v2020'
        if (options.fromBottom) {
            delete options.middle
        }
        return tcb.showDialog(content, options)
    }

    function helperCloseDialog(dialogInst) {
        tcb.closeDialog(dialogInst)
    }

    // 确认提示
    function helperShowAlertConfirm(callback, content, options) {
        callback = typeof callback === 'function' ? callback : tcb.noop
        options = options || {}
        var title = options.title || ''
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailBusinessCommonAlertConfirmTpl').html())),
            html_st = html_fn({
                content: content,
                title: title,
                noWrap: options.noWrap || false,
                className: options.className || '',
                noTitle: options.noTitle || false
            })
        var $alert = $.dialog.alert(html_st, callback, options.options)
        !options.withoutClose && $alert.find('.close').show()
        return $alert
    }

    // 确认、取消提示
    function helperShowConfirm(content, options) {
        var callbackConfirm = typeof options.callbackConfirm === 'function' ? options.callbackConfirm : tcb.noop
        var callbackCancel = typeof options.callbackCancel === 'function' ? options.callbackCancel : tcb.noop
        options = options || {}
        var title = options.title || ''
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailBusinessCommonAlertConfirmTpl').html())),
            html_st = html_fn({
                content: content,
                title: title,
                noWrap: options.noWrap || false,
                className: options.className || '',
                noTitle: options.noTitle || false
            })
        return $.dialog.confirm(html_st, callbackConfirm, callbackCancel, options.options)
    }

}()



;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_common/reassess.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        reassessShowOrderAssessDetail: showOrderAssessDetail,
        reassessShowOrderAssessOptions: showOrderAssessOptions,
        reassessShowOrderAssessSku: showOrderAssessSku,
        reassessGetOrderAssessDetail: getOrderAssessDetail
    })

    function __sortSpecialGroups(groups) {
        var ret = []
        tcb.each(groups, function (i, group) {
            ret.push(group)
        })
        ret.sort(function (a, b) {
            return +a.group > +b.group ? 1 : -1
        })
        return ret
    }

    function __getAssessOptionsData(order_id, model_id) {
        var assessResult = __sortSpecialGroups(window.__SPECIAL_ASSESS[order_id] || {}),
            assessResultLast = __sortSpecialGroups(window.__SPECIAL_REASSESS[order_id] || {}),
            assessGroup = (window.__SPECIAL_GROUPS || {})[model_id] || {},

            assessResultByUser = [], // 用户的评估结果
            assessResultAtLast = []  // 最后一次，再次评估结果
        if (assessResult && assessResult.length) {
            $.each(assessResult, function (i, item) {
                assessResultByUser.push({
                    'name': item['name'],
                    'selected': item['select']
                })
            })
        }

        if (assessResultLast && assessResultLast.length) {
            $.each(assessResultLast, function (i, item) {
                var change = (assessResult[i] && assessResult[i]['select'] === item['select']) ? false : true
                assessResultAtLast.push({
                    'name': item['name'],
                    'group': assessGroup[item['group']].sub,
                    'selected': item['select'],
                    'selected_id': item['id'],
                    'change': change
                })
            })
        }

        return [assessResultByUser, assessResultAtLast]
    }

    function __getAssessSkuData(order_id) {
        var assessSku = (window.__SKU_ASSESS || {})[order_id],
            assessSkuLast = (window.__SKU_REASSESS || {})[order_id],
            skuGroups = (window.__SKU_GROUPS || {})[order_id],

            assessSkuByUser = [], // 用户的评估sku
            assessSkuAtLast = []  // 最后一次，再次评估sku
        var nameMap = {
            2: '容量',
            4: '颜色',
            6: '渠道',
            10: '处理器',
            12: '内存',
            14: '硬盘',
            16: '显卡'
        }
        if (assessSku) {
            $.each(assessSku, function (i, item) {
                assessSkuByUser.push({
                    'name': nameMap[i],
                    'selected': item['attr_valuename']
                })
            })
        }

        if (assessSkuLast) {
            $.each(assessSkuLast, function (i, item) {
                var change = false
                if (!(assessSku[i] && assessSku[i].attr_valueid == item.attr_valueid)) {
                    change = true
                }
                assessSkuAtLast.push({
                    'name': nameMap[i],
                    'group': skuGroups[i],
                    'selected': item['attr_valuename'],
                    'selected_id': item['attr_valueid'],
                    'change': change,
                    'disable_change': !item['allowChange']
                })
            })
        }

        return [assessSkuByUser, assessSkuAtLast]
    }

    function getOrderAssessDetail(order_id, model_id) {
        var assessOptionsData = __getAssessOptionsData(order_id, model_id),
            assessSkuData = __getAssessSkuData(order_id)
        var assessDetailByUser = [].concat(assessSkuData[0], assessOptionsData[0]),
            assessDetailAtLast = [].concat(assessSkuData[1], assessOptionsData[1])
        var assessDetail = {
            data: [],
            diffCount: 0,
            sameCount: 0,
            count: 0
        }
        var diffCount = 0
        tcb.each(assessDetailAtLast, function (i, item) {
            // if (item.name === '屏幕显示') {
            //     item.selected = '显示触摸正常'
            //     item.change = true
            // }
            var _item = {
                name: item.name,
                lastSelected: item.selected
            }
            if (item.change && assessDetailByUser[i] && item.selected !== assessDetailByUser[i].selected) {
                _item.change = item.change
                _item.userSelected = assessDetailByUser[i].selected
                diffCount++
            }
            assessDetail.data.push(_item)
        })
        assessDetail.diffCount = diffCount
        assessDetail.sameCount = assessDetail.data.length - diffCount
        assessDetail.count = assessDetail.data.length
        return assessDetail
    }

    function showOrderAssessDetail($trigger) {
        var order_id = $trigger.attr('data-order-id'),
            model_id = $trigger.attr('data-model-id')

        var assessOptionsData = __getAssessOptionsData(order_id, model_id),
            assessSkuData = __getAssessSkuData(order_id)
        var assessDetailByUser = [].concat(assessSkuData[0], assessOptionsData[0]),
            assessDetailAtLast = [].concat(assessSkuData[1], assessOptionsData[1])
        var html_fn = $.tmpl($.trim($('#JsXxgViewHsAssessDetailTpl').html())),
            html_st = html_fn({
                'assessDetailAtLast': assessDetailAtLast,
                'assessDetailByUser': assessDetailByUser
            })
        var dialogInst = tcb.showDialog(html_st, {
            withMask: true,
            middle: true
        })
        __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))
    }

    function showOrderAssessOptions($trigger) {
        var order_id = $trigger.attr('data-order-id'),
            model_id = $trigger.attr('data-model-id')
        var assessOptionsData = __getAssessOptionsData(order_id, model_id)
        var html_fn = $.tmpl($.trim($('#JsXxgViewHsDetailTpl').html())),
            html_st = html_fn({
                'assessResultByUser': assessOptionsData[0],
                'assessResultAtLast': assessOptionsData[1],
                'order_id': order_id,
                'order_status': window.__ORDER_STATUS || 0
            })

        var dialogInst = tcb.showDialog(html_st, {
            withMask: true,
            middle: true
        })
        __bindEventFormEditAssessOptions(dialogInst.wrap.find('form'))
        __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))
    }

    // 重新评估回收手机参数
    function __bindEventFormEditAssessOptions($form) {
        if (!($form && $form.length)) {
            return
        }
        $form.on('submit', function (e) {
            e.preventDefault()
            $.getJSON('/m/aj_edit_options_new', $form.serialize(), function (res) {
                if (!res['errno']) {
                    tcb.closeDialog()
                    var new_price = res['result'] || 0
                    $.dialog.alert('<div class="grid align-center justify-center">重新评估价格为' + new_price + '元</div>', function () {
                        window.XXG.redirect()
                    })
                } else {
                    $.dialog.toast(res['errmsg'])
                }
            })
        })
    }

    function showOrderAssessSku($trigger) {
        var order_id = $trigger.attr('data-order-id')
        var assessSkuData = __getAssessSkuData(order_id)
        var html_fn = $.tmpl($.trim($('#JsXxgViewHsSkuTpl').html())),
            html_st = html_fn({
                'assessSkuByUser': assessSkuData[0],
                'assessSkuAtLast': assessSkuData[1],
                'order_id': order_id,
                'order_status': window.__ORDER_STATUS || 0
            }),
            dialogInst = tcb.showDialog(html_st, {
                withMask: true,
                middle: true
            })
        var sku_pc_auto_check = (window.__SKU_PC_AUTO_CHECK && window.__SKU_PC_AUTO_CHECK[order_id]) || []
        if (sku_pc_auto_check && sku_pc_auto_check.length && !window.__SKU_PC_AUTO_CHECK_FLAG[order_id]) {
            var $subSkuNew = dialogInst.wrap.find('#sub_sku_new')
            var $btnEditSku = $subSkuNew.find('.btn-edit-sku')
            var sku_pc_auto_check_html = []
            tcb.each(sku_pc_auto_check, function (i, val) {
                sku_pc_auto_check_html.push('<div>' + val.group_name + '：' + val.group_value + '</div>')
            })
            sku_pc_auto_check_html = '<div class="pre-assess-sku-list" style="color: #f84;">' + sku_pc_auto_check_html.join('') + '</div>'
            if ($btnEditSku && $btnEditSku.length) {
                $btnEditSku.before(sku_pc_auto_check_html)
            } else {
                $subSkuNew.append(sku_pc_auto_check_html)
            }
        }
        __bindEventFormEditAssessSku(dialogInst.wrap.find('form'))
        __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))
    }

    // 重新评估回收手机SKU
    function __bindEventFormEditAssessSku($form) {
        if (!($form && $form.length)) {
            return
        }

        $form.on('submit', function (e) {
            e.preventDefault()
            $.getJSON('/m/aj_edit_sku_options_new', $form.serialize(), function (res) {
                if (!res['errno']) {
                    tcb.closeDialog()
                    var new_price = res['result'] || 0
                    $.dialog.alert('<div class="grid align-center justify-center">重新评估价格为' + new_price + '元</div>', function () {
                        window.XXG.redirect()
                    })
                } else {
                    $.dialog.toast(res['errmsg'])
                }
            })
        })
    }

    // 弹窗tab切换
    function __bindEventChangeCompareTab($tab) {
        $tab.on('click', function (e) {
            e.preventDefault()

            var $me = $(this)
            $me.addClass('item-cur').siblings('.item-cur').removeClass('item-cur')
            $me.parents('.dialog-inner').find('.tab-cont .item').eq($me.index()).show().siblings('.item').hide()
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_common/render.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        render: render,
        renderHtml: renderHtml,
        renderBusinessCommonStatus: renderBusinessCommonStatus,
        renderBusinessCommonProduct: renderBusinessCommonProduct,
        renderBusinessCommonDeal: renderBusinessCommonDeal,
        renderBusinessCommonInfo: renderBusinessCommonInfo,
        renderBusinessCommonExtend: renderBusinessCommonExtend,
        renderBusinessCommonBtn: renderBusinessCommonBtn,
        renderVerificationCodeBarcode: renderVerificationCodeBarcode,
        renderLogisticsMailNoBarcode: renderLogisticsMailNoBarcode,

        htmlTpl: htmlTpl,
        htmlBusinessCommonStatus: htmlBusinessCommonStatus,
        htmlBusinessCommonStatusTitle: htmlBusinessCommonStatusTitle,
        htmlBusinessCommonStatusShippingInfo: htmlBusinessCommonStatusShippingInfo,
        htmlBusinessCommonStatusShippingInfoAuto: htmlBusinessCommonStatusShippingInfoAuto,
        htmlBusinessCommonStatusPickupServiceTime: htmlBusinessCommonStatusPickupServiceTime,
        htmlBusinessCommonStatusAddressInfo: htmlBusinessCommonStatusAddressInfo,
        htmlBusinessCommonStatusAddressInfoTips: htmlBusinessCommonStatusAddressInfoTips,
        htmlBusinessCommonStatusDeviceResetAndUploadPhoto: htmlBusinessCommonStatusDeviceResetAndUploadPhoto,

        htmlBusinessCommonProduct: htmlBusinessCommonProduct,
        htmlBusinessCommonProductTitle: htmlBusinessCommonProductTitle,
        htmlBusinessCommonProductOld: htmlBusinessCommonProductOld,
        htmlBusinessCommonProductPriceInfo: htmlBusinessCommonProductPriceInfo,

        htmlBusinessCommonDeal: htmlBusinessCommonDeal,
        htmlBusinessCommonDealAssessDetail: htmlBusinessCommonDealAssessDetail,
        htmlBusinessCommonDealUpdateOrder: htmlBusinessCommonDealUpdateOrder,

        htmlBusinessCommonInfo: htmlBusinessCommonInfo,

        htmlBusinessCommonExtend: htmlBusinessCommonExtend,

        htmlBusinessCommonBtn: htmlBusinessCommonBtn,
        htmlBusinessCommonBtnShangMen: htmlBusinessCommonBtnShangMen,
        htmlBusinessCommonBtnDaoDian: htmlBusinessCommonBtnDaoDian,

        htmlBusinessCommonDialogCityManager: htmlBusinessCommonDialogCityManager
    })

    //=========== render到页面 =============
    // 输出html到页面，并且绑定相关事件
    function render(data, $target) {
        data = data || {}
        if (!($target && $target.length)) {
            $target = $('#mainbody .mainbody-inner')
        }
        var order = data.order
        /********** 模板输出 **********/
        // 订单状态
        window.XXG.BusinessCommon.renderBusinessCommonStatus(data, $target)
        // 物品信息
        window.XXG.BusinessCommon.renderBusinessCommonProduct(data, $target, 'append')
        if (order.status >= 12 && order.status != 50) {
            // 旧机评估
            // 订单状态 大于等于12（到达之后），并且不为50（取消）的时候才输出旧机评估信息
            window.XXG.BusinessCommon.renderBusinessCommonDeal(data, $target, 'append')
        }
        // 订单信息
        window.XXG.BusinessCommon.renderBusinessCommonInfo(data, $target, 'append')
        // 订单扩展信息
        window.XXG.BusinessCommon.renderBusinessCommonExtend(data, $target, 'append')
        // 操作按钮
        window.XXG.BusinessCommon.renderBusinessCommonBtn(data, $target, 'append')
        // 输出核验码的条形码
        window.XXG.BusinessCommon.renderVerificationCodeBarcode()
        // 输出快递单号条形码
        window.XXG.BusinessCommon.renderLogisticsMailNoBarcode()
        $target.show()

        /********** 事件绑定 **********/
        // 绑定copy
        window.XXG.BusinessCommon.eventBindCopy($target.find('.js-trigger-copy-the-text'))
        // 选择上门或者到店时间
        window.XXG.BusinessCommon.eventBindPickupServerTime($target.find('.js-trigger-pickup-service-time'))
        // 绑定价格更新表单
        window.XXG.BusinessCommon.eventBindFormUpdateOrderInfo(
            $target.find('#FormUpdateOrderInfoByGoNext'),
            $target.find('.js-trigger-update-deal-price')
        )
        if (order.status == 12 && !order.order_scan) {// 未扫码，展开更改评估和价格编辑
            $target.find('.js-trigger-expand-n-collapse').trigger('click')
        }

        window.XXG.BusinessCommon.eventTriggerRenderDone()
    }

    function renderHtml(html_st, $target, addType) {
        if (!($target && $target.length)) {
            console.warn('出错了，$target没有，看看代码是不是写错了！')
            return
        }
        var $html_st = $(html_st)
        var addTypeSet = ['append', 'prepend', 'after', 'before', 'html']
        // addType 默认值设置为 append
        addType = addTypeSet.indexOf(addType) > -1 ? addType : 'append'
        $target[addType]($html_st)

        return $html_st
    }

    // 输出订单状态信息
    function renderBusinessCommonStatus(data, $target, addType) {
        var $Status = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatus(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusTitle(data), $Status)
        if (data.order.status == 13) {
            // 旧机--服务完成
            // renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusShippingInfo(data), $Status)
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusShippingInfoAuto(data), $Status)
        }
        if (data.order.status != 13
            || (data.order.send_out && !data.order.send_out.logistics_mail_no && data.order.send_out.logistics_express_status_fail)) {
            // 非完成服务 || 完成服务 && 没有快递单号 && 自动预约寄件失败
            // 上门地址信息
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusAddressInfo(data), $Status)
        }
        if (data.isBeforeArrive) {
            // 上门回收--到达之前
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusPickupServiceTime(data), $Status)
        }
        if (data.order.status == 11) {
            // 确认收到新机后，扫码前
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusAddressInfoTips(data), $Status)
        }

        return $Status
    }

    // 输出订单商品信息
    function renderBusinessCommonProduct(data, $target, addType) {
        var $Product = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProduct(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProductTitle(data), $Product)
        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProductOld(data), $Product)
        if (!data.serviceRemoteCheck.remote_check_flag ||
            (data.serviceRemoteCheck.remote_check_flag && data.serviceRemoteCheck.remote_check_flag_process == 3)) {
            // 非远程验机 || 远程验机并且已经验机完成
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProductPriceInfo(data), $Product)
        }

        return $Product
    }

    // 输出旧机评估
    function renderBusinessCommonDeal(data, $target, addType) {
        var $Deal = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonDeal(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonDealAssessDetail(data), $Deal)
        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonDealUpdateOrder(data), $Deal)

        return $Deal
    }

    // 输出订单基本信息
    function renderBusinessCommonInfo(data, $target, addType) {
        var $Info = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonInfo(data), $target, addType || 'html')
        return $Info
    }

    // 输出订单扩展信息
    function renderBusinessCommonExtend(data, $target, addType) {
        var $Extend = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonExtend(data), $target, addType || 'html')
        return $Extend
    }

    // 输出订单操作按钮
    function renderBusinessCommonBtn(data, $target, addType) {
        var $Btn = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonBtn(data), $target, addType || 'html')

        if (order.sale_type == 2) {
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonBtnShangMen(data), $Btn)
        } else if (order.sale_type == 3) {
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonBtnDaoDian(data), $Btn)
        }

        return $Btn
    }

    // 输出核验码的条形码
    function renderVerificationCodeBarcode() {
        var id = '#SfFixVerificationCodeBarcode'
        if (!$(id).length) {
            return
        }
        JsBarcode(id, $(id).attr('data-verification-code'), {
            width: 3,
            height: 40,
            margin: 0,
            displayValue: false
        })
    }

    // 输出快递单号条形码
    function renderLogisticsMailNoBarcode() {
        var id = '#SfFixLogisticsMailNo'
        if (!$(id).length) {
            return
        }
        var mail_no = $(id).attr('data-logistics-mail-no') || ''
        if (/[\u4e00-\u9fa5]+/.test(mail_no)) {
            return $(id).hide()
        }
        JsBarcode(id, mail_no, {
            width: 2.5,
            height: 60,
            margin: 0,
            displayValue: false
        })
    }


    //=========== HTML输出 =============
    function htmlTpl(selector, data) {
        var html_fn = $.tmpl($.trim($(selector).html())),
            html_st = html_fn(data || {})
        return html_st
    }

    /*订单状态*/
    function htmlBusinessCommonStatus(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusTpl', data)
    }

    // 订单状态---title
    function htmlBusinessCommonStatusTitle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusTitleTpl', data)
    }

    // 订单状态---旧机发货信息
    function htmlBusinessCommonStatusShippingInfo(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusShippingInfoTpl', data)
    }

    // 订单状态---旧机发货信息-自动分配寄回单号
    function htmlBusinessCommonStatusShippingInfoAuto(data) {
        var order = data.order || {}
        var newstatus_time = order.newstatus_time || ''
        var timeDurationAfterOrderFinish = window.XXG.BusinessCommon.helperNowTime() - Date.parse(newstatus_time.replace(/-/g, '/'))
        // data.timeDurationAfterOrderFinish = 1000
        data.timeDurationAfterOrderFinish = timeDurationAfterOrderFinish
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusShippingInfoAutoTpl', data)
    }

    // 订单状态---上门取件时间
    function htmlBusinessCommonStatusPickupServiceTime(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusPickupServiceTimeTpl', data)
    }

    // 订单状态---上门地址信息
    function htmlBusinessCommonStatusAddressInfo(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusAddressInfoTpl', data)
    }

    // 订单状态---提示确认上门时间
    function htmlBusinessCommonStatusAddressInfoTips(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusAddressInfoTipsTpl', data)
    }

    // 订单状态---是否展示妥投码（基于是否还原、拍照的逻辑）
    function htmlBusinessCommonStatusDeviceResetAndUploadPhoto(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusDeviceResetAndUploadPhotoTpl', data)
    }

    /*物品信息*/
    function htmlBusinessCommonProduct(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonProductTpl', data)
    }

    // 物品信息---title
    function htmlBusinessCommonProductTitle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonProductTitleTpl', data)
    }

    // 物品信息---旧机信息
    function htmlBusinessCommonProductOld(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonProductOldTpl', data)
    }

    // 物品信息---价格、优惠信息等
    function htmlBusinessCommonProductPriceInfo(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonProductPriceInfoTpl', data)
    }

    /*旧机评估*/
    function htmlBusinessCommonDeal(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonDealTpl', data)
    }

    // 旧机评估---评估结果信息
    function htmlBusinessCommonDealAssessDetail(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonDealAssessDetailTpl', data)
    }

    // 旧机评估---更新订单信息（评估结果、价格、imei、备注等）
    function htmlBusinessCommonDealUpdateOrder(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonDealUpdateOrderTpl', data)
    }

    // 订单信息
    function htmlBusinessCommonInfo(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonInfoTpl', data)
    }

    // 订单扩展信息
    function htmlBusinessCommonExtend(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonExtendTpl', data)
    }

    // 操作按钮
    function htmlBusinessCommonBtn(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonBtnTpl', data)
    }

    // 操作按钮---上门
    function htmlBusinessCommonBtnShangMen(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonBtnShangMenTpl', data)
    }

    // 操作按钮---到店
    function htmlBusinessCommonBtnDaoDian(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonBtnDaodianTpl', data)
    }

    // 订单取消城市督导弹窗
    function htmlBusinessCommonDialogCityManager(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixDialogCityManagerTpl', data)
    }
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_common/scan.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        scanQRCode: actionScan,
        scanGetReAssessDataByQRCode: __getReAssessDataByQRCode
    })

    function actionScan(callback, fail) {
        if (tcb.js2AppInvokeQrScanner(true, function (result) {
            typeof callback === 'function' && callback(result)
        })) {
            return true
        }
        typeof fail === 'function' && fail()
        return false
    }

    // 根据二维码信息，获取重新评估的参数数据
    function __getReAssessDataByQRCode(order_id, result) {
        result = result.join('|')
        result = (result || '').split('|') || []

        var data
        if (result[0] === 'ARM') {
            result.shift()
            try {
                data = $.parseJSON(result.join(''))
            } catch (e) {}
        } else if (result[0] === 'ARC') {
            result.shift()
            data = {
                encryptedStr: result.join('')
            }
        } else {
            data = {
                assess_key: result[0] || '',
                scene: result[1] || ''
            }
            if (result[1] === 'miniapp') {
                data['imei'] = result[2] || '' //imei
            }
            if (result[4]) {
                data['imei'] = result[2] //imei
                data['encrypt_xxg_qid'] = result[4] //Pad登录的xxg
            }
        }
        if (data) {
            data['order_id'] = order_id
        }
        return data
    }

}()



;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_common/sound.js` **/
// 声音逻辑
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        soundPlay: soundPlay,
        soundPlaySequence: soundPlaySequence,
        soundStop: soundStop
    })

    var __soundInstMap = {}
    var __soundInstPlaying = null
    var __soundInstPlayingTimeHandler = null

    // 播放声音
    function soundPlay(options) {
        var src = options.src
        var repeat = options.repeat || 1
        var interval = options.interval || 1000
        var callback = options.callback
        if (!src) {
            return
        }
        var count = 0
        var soundInst = initSoundInst(src, function () {
            count++
            if (count === repeat) {
                typeof callback === 'function' && callback()
            } else {
                __soundInstPlayingTimeHandler = setTimeout(function () {
                    soundInst.play()
                }, interval)
            }
        })
        soundInst.play()
    }

    // 停止播放声音
    function soundStop() {
        if (__soundInstPlayingTimeHandler) {
            clearTimeout(__soundInstPlayingTimeHandler)
        }
        if (__soundInstPlaying) {
            __soundInstPlaying.stop()
        }
    }

    // 顺序播放多个声音
    function soundPlaySequence(optionsQueue, callbackFinal) {
        !function executeFnQueue(optionsQueue, callbackFinal) {
            var options = optionsQueue.shift()
            var delay = options.delay || 0
            options.callback = optionsQueue.length
                ? function () {
                    __soundInstPlayingTimeHandler = setTimeout(function () {
                        executeFnQueue(optionsQueue)
                    }, delay)
                }
                : callbackFinal
            window.XXG.BusinessCommon.soundPlay(options)
        }(optionsQueue, callbackFinal)
    }

    function initSoundInst(src, callback) {
        var soundFile = src.join(',')
        var soundInst = __soundInstMap[soundFile]
        if (!soundInst) {
            var inst = new Howl({
                src: src,
                volume: 1,
                loop: false,
                preload: true,
                autoplay: false,
                mute: false
            })

            function onEnd() {
                var callback
                if (__soundInstPlaying) {
                    __soundInstPlaying.inst.off('end', onEnd)
                    callback = __soundInstPlaying.onEnd
                }
                __soundInstPlaying = null
                typeof callback === 'function' && callback()
            }

            function play() {
                var me = this
                me.inst.on('end', onEnd)
                me.inst.play()
                __soundInstPlaying = this
            }

            function stop() {
                var me = this
                var vol = me.inst.volume()
                me.inst.once('fade', function () {
                    __soundInstPlaying = null
                    me.inst.stop()
                    me.inst.volume(vol)
                })
                me.inst.fade(vol, 0, 100)
                me.inst.off('end', onEnd)
            }

            soundInst = __soundInstMap[soundFile] = {
                inst: inst,
                play: play,
                stop: stop,
                onEnd: callback
            }
        }
        soundInst.onEnd = callback

        return soundInst
    }

}()



;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix/init.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFix = tcb.mix(window.XXG.BusinessSfFix || {}, {
        data: null,
        $Wrap: null,
        init: init
    })

    function init(data, done) {
        // 设置提交更新订单时的默认备注
        data.order.memo = '丰修--修修哥'

        var $Wrap = $('.block-order-sf-fix-order')
        window.XXG.BusinessSfFix.data = data
        window.XXG.BusinessSfFix.$Wrap = $Wrap
        window.XXG.BusinessSfFix.render(data)
        window.XXG.BusinessCommon.eventBind(data)
        window.XXG.BusinessSfFix.eventBind(data)

        /***** 载入服务 *****/
        window.XXG.BusinessCommon.setupService([
            // 初始化用户隐私协议
            [window.XXG.ServicePrivacyProtocolSign, {
                data: data,
                init: function (next, final) {
                    console.log('路过隐私协议处理')
                    next()
                },
                callbackConfirmAgree: function () {
                    window.XXG.ServiceIntroAppDetect.actionShowSelect()
                }
            }],
            // 初始化隐私数据处理
            [window.XXG.ServicePrivateData, {
                data: data,
                init: function (next, final) {
                    var order = data.order
                    var servicePrivateData = data.servicePrivateData
                    var sfFixData = data.sfFixData
                    if (order.status == 12 && servicePrivateData.isHas && (sfFixData.__recycle || servicePrivateData.isMigrateFlow)) {
                        // 有隐私数据 && (是丰修纯回收 || 需要进入迁移隐私数据流程)

                        window.XXG.ServicePrivateData.renderServicePrivateDataBtn(data)
                        // window.XXG.ServicePrivateData.actionShowAlipayWithholding()
                        if (servicePrivateData.migrateFlag == 1 && !servicePrivateData.isPayed) {
                            // 需要迁移隐私数据 && 还未签约代扣或者支付成功，
                            // 那么直接展示出签约代扣的弹窗
                            window.XXG.ServicePrivateData.actionTriggerAlipayWithholding()
                        } else if (servicePrivateData.migrateFlag == 1
                            && servicePrivateData.isPayed
                            && !servicePrivateData.isMigrate
                            && !servicePrivateData.isVisitAgain) {
                            window.XXG.ServicePrivateData.actionDeliveredNewDeviceSoundPlay()

                            var text = '<div style="padding-bottom: 0.1rem;font-size: .13rem;line-height: 1.4;text-align: left;">' +
                                '客户转移数据：请<span style="color: #FE6E2C;">妥投新机</span>，' +
                                '引导用户<span style="color: #FE6E2C;">转移数据</span>旧手机留给用户，再次上门后<span style="color: #FE6E2C;">重新验机</span>' +
                                '<br><br><span style="color: #FE6E2C;">备注:<br>请小哥当面与客预约二次上门取旧机的时间</span></div>'
                            $('#SfFixVerificationCodeBarcode').before(text)
                        }
                        if (!$('.btn-old-deal-cancel.js-trigger-go-next').length) {
                            window.XXG.BusinessCommon.callbackReAssessSkuDiff = function () {
                                var $trigger = $('<a class="js-trigger-go-next" href="#">旧机不成交</a>').appendTo('body')
                                window.XXG.ServicePrivateData.actionTriggerOldDeviceCancel($trigger)
                                $trigger.remove()
                            }
                        }
                    }

                    console.log('路过隐私数据处理')
                    next()
                },
                // 二次上门扫码重新验机
                callbackScanReassessAgain: function () {
                    window.XXG.ServiceIntroAppDetect.actionShowDirectScan()
                }
            }],
            // 初始化上传图片
            [window.XXG.ServiceUploadPicture, {
                data: data,
                init: function (next, final) {
                    window.XXG.ServiceUploadPicture.fnQueueSubmitSuccess.push(
                        function (next, final) {
                            // 上传图片提交成功后
                            window.XXG.ServiceRemoteCheck.start()
                            next()
                        }
                    )
                    console.log('路过图片上传')
                    next()
                }
            }],
            // 初始化远程验机
            [window.XXG.ServiceRemoteCheck, {
                $target: $Wrap,
                addType: 'prepend',
                data: data,
                callbackStatusChangeBefore: function (serviceRemoteCheck, start, next) {
                    if (!start) {
                        // 非处是状态的change，那么粗暴点，刷新页面
                        return window.XXG.redirect()
                    }
                    if (serviceRemoteCheck.remote_check_flag_process == -1) {
                        // 驳回时，先清除当前ui内容，保留输出远程验机区域
                        window.XXG.ServiceRemoteCheck.render($Wrap, 'html')
                    } else {
                        // window.XXG.BusinessSfFix.render(data)
                        window.XXG.ServiceRemoteCheck.render($Wrap, 'prepend')
                    }
                    typeof next === 'function' && next()
                },
                callbackStatusChangeDone: function (serviceRemoteCheck, start) {
                    if (serviceRemoteCheck.remote_check_flag_process) {
                        // 开启远程验机之后，不在允许重新扫码
                        window.XXG.BusinessCommon.fnQueueTriggerReScanQRCode.push(function (e, $trigger, data, next, final) {
                            var tips = serviceRemoteCheck.remote_check_flag_process == 3
                                ? '已经完成远程验机，不能再重新扫码'
                                : '已经开启远程验机，不能再重新扫码'
                            window.XXG.BusinessCommon.helperShowAlertConfirm(null, tips)
                        })
                    }
                    if (data.servicePrivateData && data.servicePrivateData.isVisitAgain) {
                        // 隐私导数，二次上门，远程验机完成，不显示远程验机信息
                        window.XXG.ServiceRemoteCheck.actionHideBlockRemoteCheck()
                    }
                },
                // 初始化远程验机逻辑
                init: function (next, final) {
                    // 进入详情页之后，若还没有开启远程验机流程，那么不开启远程验机监听状态，
                    // 否则开启远程验机监听状态
                    var serviceRemoteCheck = data.serviceRemoteCheck
                    var order = data.order
                    // 支持远程验机，并且订单状态为12（已到达）
                    if (serviceRemoteCheck.remote_check_flag && order.status == 12) {
                        if (serviceRemoteCheck.remote_check_flag_process) {
                            // remote_check_flag_process为非0的值的时候，
                            // 表示远程验机状态已经开启，那么直接再次开启监听状态
                            window.XXG.ServiceRemoteCheck.start()
                        } else {
                            // remote_check_flag_process为0的值的时候，远程验机还没有开始，
                            // 那么进入开启远程验机提示流程（实际上是去传图），如果有一些非满足开启条件阻断，那么将无法开启，
                            // 例如 没有重新扫码，或者，不在远程验机时间内
                            window.XXG.BusinessCommon.actionServiceRemoteCheckShowStartTips(data)
                        }
                    }
                    console.log('路过远程验机')
                    next()
                }
            }],
            // 初始化引导APP检测
            [window.XXG.ServiceIntroAppDetect, {
                data: data,
                init: function (next, final) {
                    // var data = window.XXG.ServiceIntroAppDetect.rootData
                    // if (data.order.status == 11 && data.isIphone) {
                    //     // 订单状态为11 && 为iPhone
                    //     window.XXG.ServiceIntroAppDetect.render(data, $Wrap.find('.block-order-extend'))
                    // }
                    console.log('路过引导APP检测')
                    next()
                },
                callbackBeforeShowSelect: function (next) {
                    // 需要签约隐私协议，并且还没有签署，那么触发隐私协议签约逻辑，
                    // 否则进入正常逻辑
                    var data = window.XXG.ServiceIntroAppDetect.rootData
                    var servicePrivacyProtocol = data.servicePrivacyProtocol
                    if (servicePrivacyProtocol.isNeedSign
                        && !servicePrivacyProtocol.isSigned) {
                        window.XXG.ServicePrivacyProtocolSign.actionConfirmUserCleanDevice()
                    } else {
                        next()
                    }
                },
                callbackBeforeTriggerScanQRCode: function (next) {
                    var rootData = window.XXG.ServiceIntroAppDetect.rootData
                    var order = rootData.order
                    var servicePrivateData = rootData.servicePrivateData
                    if (servicePrivateData.isMigrateFlow
                        && servicePrivateData.migrateFlag == 1
                        && servicePrivateData.isPayed) {
                        // 迁移隐私数据流程 && 用户需要迁移数据 && 用户已经为迁移数据支付成功或者签约代扣成功
                        // 此种情况下扫码，表示二次上门，那么保存已经二次上门状态
                        window.XXG.ServicePrivateData.apiSavePrivateDataVisitAgain({
                            order_id: order.order_id
                        }, function () {
                            next()
                        })
                    } else {
                        next()
                    }
                }
            }],
            // 初始化无法扫码检测旧机，直接购买新机
            [window.XXG.ServiceCantScanBuyNew, {
                data: data,
                callbackConfirm: function () {
                    window.XXG.BusinessSfFix.actionSfFixFullPay(null, data)
                },
                init: function (next, final) {
                    var data = window.XXG.ServiceCantScanBuyNew.rootData
                    if (data.sfFixData.__re_new && data.order.status == 11) {
                        // 以旧换新 && 订单状态为11
                        window.XXG.ServiceCantScanBuyNew.render(data, $Wrap.find('.block-order-extend'))
                    }
                    console.log('路过无法扫码检测旧机，直接购买新机')
                    next()
                }
            }],
            // 初始化纯回收上门转邮寄
            [window.XXG.ServiceShangmenToYouji, {
                data: data,
                callbackConfirm: function (callback) {
                    window.XXG.ServiceShangmenToYouji.renderToYouji(data, $Wrap)
                    typeof callback === 'function' && callback()
                },
                init: function (next, final) {
                    window.XXG.BusinessCommon.fnQueueRenderDone.push(renderServiceShangmenToYouji)
                    renderServiceShangmenToYouji()

                    function renderServiceShangmenToYouji() {
                        if (window.XXG.ServiceShangmenToYouji.actionIsConverted()) {
                            window.XXG.ServiceShangmenToYouji.renderToYouji(data, $Wrap)
                        } else if (data.order.status == 11 && data.sfFixData.__recycle) {
                            // 丰修纯回收 && 订单状态为11才能上门转邮寄

                            // 新模式下，在点击【开始验机】按钮后的弹窗里才显示上门转邮寄的触发按钮，
                            // 所以此处不在输出触发入口
                            // window.XXG.ServiceShangmenToYouji.render(data, $Wrap.find('.block-order-extend'))
                        }
                    }

                    console.log('路过纯回收上门转邮寄')
                    next()
                }
            }],
            // 初始化新机激活
            [window.XXG.ServiceNewDeviceActivation, {
                data: data,
                init: function (next, final) {
                    // 是否需要新机激活
                    if (data.isNewDeviceNeedActivation) {
                        window.XXG.ServiceNewDeviceActivation.actionShow()
                    }

                    console.log('路过新机激活')
                    next()
                }
            }]
        ], function () {
            typeof done === 'function' && done()
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix/action.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFix = tcb.mix(window.XXG.BusinessSfFix || {}, {
        actionSfFixConfirmReceivedNewDevice: doConfirmReceivedNewDevice,
        actionSfFixConfirmTradeIn: doSfFixConfirmTradeIn,
        actionTriggerSfFixFullPay: doTriggerSfFixFullPay,
        actionSfFixFullPay: doSfFixFullPay,
        actionSfFixReturnNew: doSfFixReturnNew,
        actionSfFixConfirm: doSfFixConfirm,
        actionSfFixCancelOrder: doSfFixCancelOrder
    })

    // 确认新机收货
    function doConfirmReceivedNewDevice($btn) {
        var order_id = $btn.attr('data-order-id')
        tcb.loadingStart()
        // 先确认收到新机，再更新订单状态
        window.XXG.BusinessSfFix.apiSfFixConfirmNewDeviceReceived(order_id,
            function () {
                window.XXG.BusinessCommon.apiActionBeforeArrive($btn,
                    function () {
                        window.XXG.redirect()
                    },
                    function () {
                        tcb.loadingDone()
                    }
                )
            },
            function () {
                tcb.loadingDone()
            }
        )
    }

    // 丰修--确认换新（无差价直接换新，有差价先补差，再换新）
    function doSfFixConfirmTradeIn($btn, data) {
        // if (!__validFinalPrice(data)) {
        //     // 还未提交成交价
        //     return
        // }
        var $Form = $('#FormUpdateOrderInfoByGoNext')
        if (!__validSfFixConfirm($Form)) {
            return
        }
        var formData = $Form.serialize()
        // var order = data.order
        // var params = {
        //     'order_id': order.order_id,
        //     'only_new': 0,
        //     'price': order.final_price,
        //     'imei': order.imei
        // }
        var params = tcb.queryUrl(formData)
        delete params.memo
        params.price = parseInt(params.price, 10)
        params.only_new = 0
        tcb.loadingStart()
        window.XXG.BusinessSfFix.apiSfFixPayment(params, function (res) {
            var paymentUrl = res && res.paymentUrl
            if (paymentUrl) {
                tcb.loadingDone()
                tcb.showDialog('<iframe frameborder="0" src="' + paymentUrl + '" style="overflow-y: auto;width: 100%;height: 20rem;max-height: 85vh;">', {
                    fromBottom: true,
                    onClose: function () {
                        __stopCheckPayment()
                    }
                })
                __startCheckPayment({
                    'order_id': params.order_id
                }, function () {
                    tcb.closeDialog()
                    __stopCheckPayment()
                    window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                        window.XXG.redirect()
                    }, '恭喜您支付成功！', {
                        withoutClose: true
                    })
                })
            } else {
                // 无需补差直接完成
                window.XXG.redirect()
                tcb.loadingDone()
                // window.XXG.BusinessCommon.apiFinishOrder($btn, function (res_finish) {
                //     window.XXG.redirect()
                //     tcb.loadingDone()
                //     // window.__SHOW_CASH_FLAG = res.result.show_cash_flag
                //     // window.showPageCustomerServiceComplete && window.showPageCustomerServiceComplete()
                // }, function () {
                //     tcb.loadingDone()
                // })
            }
        }, function () {
            tcb.loadingDone()
        })
    }

    // 验证是否已经有了成交价
    function __validFinalPrice(data) {
        var flag = true
        var order = data.order
        if (!(parseFloat(order.final_price) > 0)) {
            // 还未提交成交价
            flag = false
        }
        if (!flag) {
            window.XXG.BusinessCommon.helperShowAlertConfirm(null, '请先确认提交成交价')
            $('.row-order-deal-price').shine4Error()
        }
        return flag
    }

    // 验证下一步前的提交参数
    function __validSfFixConfirm($Form) {
        var flag = true,
            toast_text = '',
            $focus = null

        var $price = $Form.find('[name="price"]'),
            $imei = $Form.find('[name="imei"]')

        if ($imei && $imei.length) {
            var imei = tcb.trim($imei.val())
            if (!imei) {
                flag = false
                $focus = $focus || $imei
                toast_text = '请输入imei号'
                $imei.closest('.form-item-row').shine4Error()
            }
        }

        if ($price && $price.length) {
            var price = parseFloat(tcb.trim($price.val()))
            if (!price) {
                flag = false
                $focus = $focus || $price
                $price.closest('.form-item-row').shine4Error()
            }
        }

        if ($focus && $focus.length) {
            setTimeout(function () {
                $focus.focus()
            }, 200)
        }

        if (toast_text) {
            $.dialog.toast(toast_text, 2000)
        }

        return flag
    }

    // 丰修以旧换新--触发旧机不成交（全款购机）
    function doTriggerSfFixFullPay($btn, data) {
        window.XXG.BusinessCommon.actionShowCityManagerInfo($btn, data, __doTriggerSfFixFullPay)
    }

    function __doTriggerSfFixFullPay($btn, data) {
        var html_fn = $.tmpl($.trim($('#JsMXxgOrderDetailBusinessSfFixFullPayTpl').html())),
            html_st = html_fn(data)
        tcb.showDialog(html_st, {
            withClose: true,
            fromBottom: true
        })
    }

    // 丰修--旧机不成交（全款购机）
    function doSfFixFullPay($btn, data) {
        var order = data.order
        var params = {
            'order_id': order.order_id,
            'only_new': 1,
            'price': '',
            'imei': ''
        }
        tcb.loadingStart()
        window.XXG.BusinessSfFix.apiSfFixPayment(params, function (res) {
            tcb.loadingDone()
            var paymentUrl = res && res.paymentUrl
            if (paymentUrl) {
                tcb.closeDialog()
                tcb.showDialog('<iframe frameborder="0" src="' + paymentUrl + '" style="overflow-y: auto;width: 100%;height: 20rem;max-height: 85vh;">', {
                    fromBottom: true,
                    onClose: function () {
                        __stopCheckPayment()
                    }
                })
                __startCheckPayment({
                    'order_id': params.order_id
                }, function () {
                    tcb.closeDialog()
                    __stopCheckPayment()
                    window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                        window.XXG.redirect()
                    }, '恭喜您支付成功！', {
                        withoutClose: true
                    })
                })
            } else {
                $.dialog.toast('没有获取到支付信息，请重试！')
            }
        }, function () {
            tcb.loadingDone()
        })
    }


    var checkPaymentHandler = null
    var isStoppedCheckPayment = false

    // 丰修--检查用户是否全款购机完成
    function __startCheckPayment(data, callback) {
        isStoppedCheckPayment = false

        function loop() {
            if (isStoppedCheckPayment) {
                return __stopCheckPayment()
            }
            window.XXG.BusinessSfFix.apiGetSfFixPaymentStatus(data,
                function (res) {
                    var isPayment = res && res.isPayment
                    if (isPayment) {
                        typeof callback === 'function' && callback()
                    } else {
                        checkPaymentHandler = setTimeout(loop, 3000)
                    }
                },
                function () {
                    checkPaymentHandler = setTimeout(loop, 3000)
                }
            )
        }

        loop()
    }

    function __stopCheckPayment() {
        isStoppedCheckPayment = true
        if (checkPaymentHandler) {
            clearTimeout(checkPaymentHandler)
            checkPaymentHandler = null
        }
    }

    // 丰修--退回新机（旧不卖，新不买）
    function doSfFixReturnNew($btn, data) {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            var order = data.order
            tcb.loadingStart()
            window.XXG.BusinessCommon.apiCloseOrder({
                order_id: order.order_id,
                xxg_memo: '丰修--退回新机'
            }, function () {
                tcb.closeDialog()
                window.XXG.redirect()
            }, function () {
                tcb.loadingDone()
            })
        }, '请确认订单不成交，退回新机<br>确认后订单状态不可变更')
    }

    // 丰修纯上门回收--确认回收
    function doSfFixConfirm($btn, data) {
        var $Form = $('#FormUpdateOrderInfoByGoNext')
        if (!__validSfFixConfirm($Form)) {
            return
        }
        var order = data.order
        var formData = $Form.serialize()

        if (data.isNeedPayInfo) {
            // 如果需要完善用户收款信息【并且是非一站式订单】，那么跳转到完善收款页面
            tcb.loadingStart()
            return window.XXG.BusinessCommon.apiUpdateOrder(formData, function () {
                window.XXG.redirect(tcb.setUrl2('/m/scanAuth', {
                    orderId: order.order_id
                }), true)
                tcb.loadingDone()
            }, function () {
                tcb.loadingDone()
            })
        } else {
            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                tcb.loadingStart()
                window.XXG.BusinessCommon.apiUpdateOrder(formData, function () {
                    window.XXG.BusinessCommon.apiFinishOrder($btn, function () {
                        window.XXG.redirect()
                        tcb.loadingDone()
                    }, function () {
                        tcb.loadingDone()
                    })
                }, function () {
                    tcb.loadingDone()
                })
            }, '请确认旧机成交<br>确认后订单状态不可变更<br><span class="marked">确认后将会给用户打款</span>', {
                options: {
                    lock: 4
                }
            })
        }
    }

    // 丰修纯上门回收--取消订单
    function doSfFixCancelOrder($btn, data) {
        window.XXG.BusinessCommon.actionShowCityManagerInfo($btn, data, __doSfFixCancelOrder)
    }

    function __doSfFixCancelOrder($btn, data) {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            var order = data.order
            tcb.loadingStart()
            window.XXG.BusinessCommon.apiCloseOrder({
                order_id: order.order_id,
                xxg_memo: '丰修纯回收--取消订单'
            }, function () {
                window.XXG.redirect()
            }, function () {
                tcb.loadingDone()
            })
        }, '请确认旧机不成交<br>确认后订单状态不可变更')
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix/api.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFix = tcb.mix(window.XXG.BusinessSfFix || {}, {
        apiSfFixConfirmNewDeviceReceived: apiSfFixConfirmNewDeviceReceived,
        apiSfFixPayment: apiSfFixPayment,
        apiSfFixReturn: apiSfFixReturn,
        apiGetSfFixPaymentStatus: apiGetSfFixPaymentStatus
    })

    // 确认新机收货
    function apiSfFixConfirmNewDeviceReceived(order_id, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/sfFixConfirmNewDeviceReceived'),
            data: {'order_id': order_id},
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 补差款/全款购新
    // 返回值 paymentUrl
    function apiSfFixPayment(data, callback, fail) {
        // var data = {
        //     'order_id': order_id,
        //     'only_new': '',
        //     'price': '',
        //     'imei': ''
        // }
        window.XXG.ajax({
            url: tcb.setUrl('/m/sfFixPayment'),
            type: 'POST',
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 新机/旧机退回
    function apiSfFixReturn(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/sfFixReturn'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 丰修扫码支付结果查询接口
    // 返回值 isPayment
    function apiGetSfFixPaymentStatus(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/getSfFixPaymentStatus'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    // $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                // $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix/event.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFix = tcb.mix(window.XXG.BusinessSfFix || {}, {
        eventBind: eventBind
    })

    // 丰修一站式换新---事件绑定
    function eventBind(data) {
        if (eventBind.__bind) {
            return
        }
        eventBind.__bind = true

        if (typeof __fnGoNext === 'function') {
            window.XXG.BusinessCommon &&
            window.XXG.BusinessCommon.eventBind &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext.push(__fnGoNext)
        }
        tcb.bindEvent({})
    }

    // 事件--下一步（将会被加入的下一步的事件队列里）
    function __fnGoNext(e, $trigger, data) {
        var isContinue = true
        if (!__validGoNext($trigger)) {
            return false
        }
        var act = $trigger.attr('data-act')
        switch (act) {
            // start 丰修
            case 'confirm-received-new-device':
                // 确认新机收货
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixConfirmReceivedNewDevice($trigger)
                break
            case 'sf-fix-confirm-trade-in':
                // 丰修--确认换新（无差价直接换新，有差价先补差，再换新）
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixConfirmTradeIn($trigger, data)
                break
            case 'trigger-sf-fix-full-pay':
                // 丰修--触发旧机不成交（全款购机）
                isContinue = false
                window.XXG.BusinessSfFix.actionTriggerSfFixFullPay($trigger, data)
                break
            case 'sf-fix-full-pay':
                // 丰修--旧机不成交（全款购机）
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixFullPay($trigger, data)
                break
            case 'sf-fix-return-new':
                // 丰修--退回新机（旧不卖，新不买）
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixReturnNew($trigger, data)
                break
            case 'sf-fix-confirm':
                // 丰修纯上门回收--确认回收
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixConfirm($trigger, data)
                break
            case 'sf-fix-cancel-order':
                // 丰修纯上门回收--取消订单
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixCancelOrder($trigger, data)
                break
            // end 丰修
        }
        return isContinue
    }

    function __validGoNext($trigger) {
        if ($trigger && $trigger.length && $trigger.hasClass('btn-go-next-lock')) {
            return
        }
        return true
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix/render.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFix = tcb.mix(window.XXG.BusinessSfFix || {}, {
        render: render,
        renderBusinessSfFixStatus: renderBusinessSfFixStatus,
        renderBusinessSfFixProduct: renderBusinessSfFixProduct,
        renderBusinessSfFixBtn: renderBusinessSfFixBtn,

        htmlBusinessSfFixStatusRecycle: htmlBusinessSfFixStatusRecycle,
        htmlBusinessSfFixStatusReNew: htmlBusinessSfFixStatusReNew,

        htmlBusinessSfFixProductNew: htmlBusinessSfFixProductNew,
        htmlBusinessSfFixProductOld: htmlBusinessSfFixProductOld,
        htmlBusinessSfFixProductPriceInfoReNew: htmlBusinessSfFixProductPriceInfoReNew,
        htmlBusinessSfFixProductPriceInfoRecycle: htmlBusinessSfFixProductPriceInfoRecycle,

        htmlBusinessSfFixBtnReNew: htmlBusinessSfFixBtnReNew,
        htmlBusinessSfFixBtnRecycle: htmlBusinessSfFixBtnRecycle
    })
    var renderHtml = window.XXG.BusinessCommon.renderHtml
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl

    //=========== render到页面 =============
    // 输出html到页面，并且绑定相关事件
    function render(data) {
        var $target = window.XXG.BusinessSfFix.$Wrap
        if (!($target && $target.length)) {
            $target = $('#mainbody .mainbody-inner')
        }
        var order = data.order
        /********** 模板输出 **********/
        // 订单状态
        window.XXG.BusinessSfFix.renderBusinessSfFixStatus(data, $target)
        // 物品信息
        window.XXG.BusinessSfFix.renderBusinessSfFixProduct(data, $target, 'append')
        if (order.status >= 12 && order.status != 50) {
            // 旧机评估
            // 订单状态 大于等于12（到达之后），并且不为50（取消）的时候才输出旧机评估信息
            window.XXG.BusinessCommon.renderBusinessCommonDeal(data, $target, 'append')
        }
        // 订单信息
        window.XXG.BusinessCommon.renderBusinessCommonInfo(data, $target, 'append')
        // 订单扩展信息
        window.XXG.BusinessCommon.renderBusinessCommonExtend(data, $target, 'append')
        // 操作按钮
        window.XXG.BusinessSfFix.renderBusinessSfFixBtn(data, $target, 'append')
        // 输出核验码的条形码
        window.XXG.BusinessCommon.renderVerificationCodeBarcode()
        // 输出快递单号条形码
        window.XXG.BusinessCommon.renderLogisticsMailNoBarcode()
        $target.show()

        /********** 事件绑定 **********/
        // 绑定copy
        window.XXG.BusinessCommon.eventBindCopy($target.find('.js-trigger-copy-the-text'))
        // 选择上门或者到店时间
        window.XXG.BusinessCommon.eventBindPickupServerTime($target.find('.js-trigger-pickup-service-time'))
        // 绑定价格更新表单
        window.XXG.BusinessCommon.eventBindFormUpdateOrderInfo(
            $target.find('#FormUpdateOrderInfoByGoNext'),
            $target.find('.js-trigger-update-deal-price')
        )
        // 绑定丰修退回新机和寄回旧机的快递表单
        window.XXG.BusinessCommon.eventBindFormSfFixReturn(
            $target.find('#FormSfFixReturn'),
            $target.find('.btn-edit-express-confirm'),
            function () {
                window.XXG.redirect()
            }
        )
        if (order.status == 12 && !order.order_scan) {// 未扫码，展开更改评估和价格编辑
            $target.find('.js-trigger-expand-n-collapse').trigger('click')
        }
        window.XXG.BusinessCommon.eventTriggerRenderDone()
    }

    // 输出订单状态信息
    function renderBusinessSfFixStatus(data, $target, addType) {
        var $Status = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatus(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusTitle(data), $Status)
        if (data.order.status == 13 && data.isDeviceResetAndUploadPhoto) {
            // 服务完成 && 需要上传设备还原后的照片（确认还原后再）
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusDeviceResetAndUploadPhoto(data), $Status)
        } else if (data.sfFixData.__recycle) {
            // 丰修--纯回收
            renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixStatusRecycle(data), $Status)
        } else if (data.sfFixData.__re_new) {
            // 丰修--以旧换新
            renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixStatusReNew(data), $Status)
        }
        if (data.order.status == 13) {
            // 旧机--服务完成
            // renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusShippingInfo(data), $Status)
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusShippingInfoAuto(data), $Status)
        }
        if (data.order.status != 13
            || (data.order.send_out && !data.order.send_out.logistics_mail_no && data.order.send_out.logistics_express_status_fail)) {
            // 非完成服务 || 完成服务 && 没有快递单号 && 自动预约寄件失败
            // 上门地址信息
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusAddressInfo(data), $Status)
        }
        if (data.isBeforeArrive) {
            // 上门回收--到达之前
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusPickupServiceTime(data), $Status)
        }
        if (data.order.status == 11) {
            // 确认收到新机后，扫码前
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusAddressInfoTips(data), $Status)
        }

        return $Status
    }

    // 输出订单商品信息
    function renderBusinessSfFixProduct(data, $target, addType) {
        var $Product = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProduct(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProductTitle(data), $Product)
        if (data.sfFixData.new_device) {
            renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixProductNew(data), $Product)
        }
        renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixProductOld(data), $Product)
        if (!data.serviceRemoteCheck.remote_check_flag ||
            (data.serviceRemoteCheck.remote_check_flag && data.serviceRemoteCheck.remote_check_flag_process == 3)) {
            // 非远程验机 || 远程验机并且已经验机完成
            if (data.sfFixData.__re_new) {
                renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixProductPriceInfoReNew(data), $Product)
            } else if (data.sfFixData.__recycle) {
                renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixProductPriceInfoRecycle(data), $Product)
            }
        }

        return $Product
    }

    // 输出订单操作按钮
    function renderBusinessSfFixBtn(data, $target, addType) {
        var $Btn = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonBtn(data), $target, addType || 'html')

        if (data.sfFixData.__re_new) {
            renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixBtnReNew(data), $Btn)
        } else if (data.sfFixData.__recycle) {
            renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixBtnRecycle(data), $Btn)
        }

        return $Btn
    }


    //=========== HTML输出 =============
    // 订单状态---丰修纯回收
    function htmlBusinessSfFixStatusRecycle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixStatusRecycleTpl', data)
    }

    // 订单状态---丰修换新
    function htmlBusinessSfFixStatusReNew(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixStatusReNewTpl', data)
    }

    // 物品信息---丰修新机信息
    function htmlBusinessSfFixProductNew(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixProductNewTpl', data)
    }

    // 物品信息---丰修旧机信息
    function htmlBusinessSfFixProductOld(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixProductOldTpl', data)
    }

    // 物品信息---丰修换新价格、优惠信息等
    function htmlBusinessSfFixProductPriceInfoReNew(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixProductPriceInfoReNewTpl', data)
    }

    // 物品信息---丰修新机信息
    function htmlBusinessSfFixProductPriceInfoRecycle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixProductPriceInfoRecycleTpl', data)
    }

    // 按钮操作---丰修换新
    function htmlBusinessSfFixBtnReNew(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixBtnReNewTpl', data)
    }

    // 按钮操作---丰修纯回收
    function htmlBusinessSfFixBtnRecycle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixBtnRecycleTpl', data)
    }
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix_one_stop_order/init.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder = tcb.mix(window.XXG.BusinessSfFixOneStopOrder || {}, {
        data: null,
        cache: {
            hasBalance: false, // true表示需要补差款
            isTcbPay: false, // true表示同城帮付款给用户
            isPaySuccess: false, // true表示用户付款成功
            isFullPaySuccess: false, // true表示用户全额购机付款成功
            continueBalance: false // true表示可继续补差价
        },
        $Wrap: null,
        init: init,
        getCache: getCache,
        setCache: setCache
    })

    function init(data, done) {
        // 设置提交更新订单时的默认备注
        data.order.memo = '丰修一站式--修修哥'
        // data.order.status = 12
        // data.servicePrivateData.isVisitAgain = false

        var $Wrap = $('.block-order-sf-fix-suning-one-stop-order')
        window.XXG.BusinessSfFixOneStopOrder.data = data
        window.XXG.BusinessSfFixOneStopOrder.$Wrap = $Wrap
        // 先获取一站式订单信息，然后输出订单信息
        window.XXG.BusinessSfFixOneStopOrder.apiGetOneStopOrderInfo({
            order_id: data.order.order_id
        }, function (oneStopData) {
            oneStopData = oneStopData || {}
            oneStopData.__sf_fix = true
            // 设置一站式换新数据
            data.oneStopData = oneStopData

            // 添加回调狗子
            // 全款支付前的回调
            window.XXG.BusinessSfFixOneStopOrder.callbackBeforeFullPay = function (next) {
                var servicePrivateData = data.servicePrivateData
                var order_id = data.order.order_id
                if (servicePrivateData.isHas && servicePrivateData.isMigrateFlow) {
                    // 导数流程
                    window.XXG.ServicePrivateData.apiGetSfFixSuningOneStopFullPaymentUrl({
                        order_id: order_id
                    }, function (result) {
                        next(result && result.pathUrl)
                    })
                } else {
                    // 普通丰修苏宁一站式
                    next('/xxgHs/fullAmountPay')
                }
            }

            window.XXG.BusinessSfFixOneStopOrder.render(data)
            window.XXG.BusinessCommon.eventBind(data)
            window.XXG.BusinessSfFixOneStopOrder.eventBind(data)

            /***** 载入服务 *****/
            window.XXG.BusinessCommon.setupService([
                // 初始化用户隐私协议
                [window.XXG.ServicePrivacyProtocolSign, {
                    data: data,
                    init: function (next, final) {
                        console.log('路过隐私协议处理')
                        next()
                    },
                    callbackConfirmAgree: function () {
                        window.XXG.ServiceIntroAppDetect.actionShowSelect()
                    }
                }],
                // 初始化隐私数据处理
                [window.XXG.ServicePrivateData, {
                    data: data,
                    init: function (next, final) {
                        var order = data.order
                        var servicePrivateData = data.servicePrivateData
                        var sfFixData = data.sfFixData
                        if (order.status == 12 && servicePrivateData.isHas && (sfFixData.__recycle || servicePrivateData.isMigrateFlow)) {
                            // 有隐私数据 && (是丰修纯回收 || 需要进入迁移隐私数据流程)

                            window.XXG.ServicePrivateData.renderServicePrivateDataBtn(data)
                            // window.XXG.ServicePrivateData.actionShowAlipayWithholding()
                            if (servicePrivateData.migrateFlag == 1 && !servicePrivateData.isPayed) {
                                // 需要迁移隐私数据 && 还未签约代扣或者支付成功，
                                // 那么直接展示出签约代扣的弹窗
                                window.XXG.ServicePrivateData.actionTriggerAlipayWithholding()
                            } else if (servicePrivateData.migrateFlag == 1
                                && servicePrivateData.isPayed
                                && !servicePrivateData.isMigrate
                                && !servicePrivateData.isVisitAgain) {
                                window.XXG.ServicePrivateData.actionDeliveredNewDeviceSoundPlay()

                                var text = '<div style="padding-bottom: 0.1rem;font-size: .13rem;line-height: 1.4;text-align: left;">' +
                                    '客户转移数据：请<span style="color: #FE6E2C;">妥投新机</span>，' +
                                    '引导用户<span style="color: #FE6E2C;">转移数据</span>旧手机留给用户，再次上门后<span style="color: #FE6E2C;">重新验机</span>' +
                                    '<br><br><span style="color: #FE6E2C;">备注:<br>请小哥当面与客预约二次上门取旧机的时间</span></div>'
                                $('#SfFixVerificationCodeBarcode').before(text)
                            }
                            if (!$('.btn-old-deal-cancel.js-trigger-go-next').length) {
                                window.XXG.BusinessCommon.callbackReAssessSkuDiff = function () {
                                    var $trigger = $('<a class="js-trigger-go-next" href="#">旧机不成交</a>').appendTo('body')
                                    window.XXG.ServicePrivateData.actionTriggerOldDeviceCancel($trigger)
                                    $trigger.remove()
                                }
                            }
                        }

                        console.log('路过隐私数据处理')
                        next()
                    },
                    // 二次上门扫码重新验机
                    callbackScanReassessAgain: function () {
                        window.XXG.ServiceIntroAppDetect.actionShowDirectScan()
                    }
                }],
                // 初始化上传图片
                [window.XXG.ServiceUploadPicture, {
                    data: data,
                    init: function (next, final) {
                        window.XXG.ServiceUploadPicture.fnQueueSubmitSuccess.push(
                            function (next, final) {
                                // 上传图片提交成功后
                                window.XXG.ServiceRemoteCheck.start()
                                next()
                            }
                        )
                        console.log('路过图片上传')
                        next()
                    }
                }],
                // 初始化远程验机
                [window.XXG.ServiceRemoteCheck, {
                    $target: $Wrap,
                    addType: 'prepend',
                    data: data,
                    callbackStatusChangeBefore: function (serviceRemoteCheck, start, next) {
                        if (!start) {
                            // 非处是状态的change，那么粗暴点，刷新页面
                            return window.XXG.redirect()
                        }
                        if (serviceRemoteCheck.remote_check_flag_process == -1) {
                            // 驳回时，先清除当前ui内容，保留输出远程验机区域
                            window.XXG.ServiceRemoteCheck.render($Wrap, 'html')
                        } else {
                            // window.XXG.BusinessSfFixOneStopOrder.render(data)
                            window.XXG.ServiceRemoteCheck.render($Wrap, 'prepend')
                        }
                        typeof next === 'function' && next()
                    },
                    callbackStatusChangeDone: function (serviceRemoteCheck) {
                        if (serviceRemoteCheck.remote_check_flag_process) {
                            // 开启远程验机之后，不在允许重新扫码
                            window.XXG.BusinessCommon.fnQueueTriggerReScanQRCode.push(function (e, $trigger, data, next, final) {
                                var tips = serviceRemoteCheck.remote_check_flag_process == 3
                                    ? '已经完成远程验机，不能再重新扫码'
                                    : '已经开启远程验机，不能再重新扫码'
                                window.XXG.BusinessCommon.helperShowAlertConfirm(null, tips)
                            })
                        }
                        if (data.servicePrivateData && data.servicePrivateData.isVisitAgain) {
                            // 隐私导数，二次上门，远程验机完成，不显示远程验机信息
                            window.XXG.ServiceRemoteCheck.actionHideBlockRemoteCheck()
                        }
                    },
                    // 初始化远程验机逻辑
                    init: function (next, final) {
                        // 进入详情页之后，若还没有开启远程验机流程，那么不开启远程验机监听状态，
                        // 否则开启远程验机监听状态
                        var serviceRemoteCheck = data.serviceRemoteCheck
                        var order = data.order
                        // 支持远程验机，并且订单状态为12（已到达）
                        if (serviceRemoteCheck.remote_check_flag && order.status == 12) {
                            if (serviceRemoteCheck.remote_check_flag_process) {
                                // remote_check_flag_process为非0的值的时候，
                                // 表示远程验机状态已经开启，那么直接再次开启监听状态
                                window.XXG.ServiceRemoteCheck.start()
                            } else {
                                // remote_check_flag_process为0的值的时候，远程验机还没有开始，
                                // 那么进入开启远程验机提示流程（实际上是去传图），如果有一些非满足开启条件阻断，那么将无法开启，
                                // 例如 没有重新扫码，或者，不在远程验机时间内
                                window.XXG.BusinessCommon.actionServiceRemoteCheckShowStartTips(data)
                            }
                        }
                        console.log('路过远程验机')
                        next()
                    }
                }],
                // 初始化引导APP检测
                [window.XXG.ServiceIntroAppDetect, {
                    data: data,
                    init: function (next, final) {
                        // var data = window.XXG.ServiceIntroAppDetect.rootData
                        // if (data.order.status == 11 && data.isIphone) {
                        //     // 订单状态为11 && 为iPhone
                        //     window.XXG.ServiceIntroAppDetect.render(data, $Wrap.find('.block-order-extend'))
                        // }
                        console.log('路过引导APP检测')
                        next()
                    },
                    callbackBeforeShowSelect: function (next) {
                        // 需要签约隐私协议，并且还没有签署，那么触发隐私协议签约逻辑，
                        // 否则进入正常逻辑
                        var data = window.XXG.ServiceIntroAppDetect.rootData
                        var servicePrivacyProtocol = data.servicePrivacyProtocol
                        if (servicePrivacyProtocol.isNeedSign
                            && !servicePrivacyProtocol.isSigned) {
                            window.XXG.ServicePrivacyProtocolSign.actionConfirmUserCleanDevice()
                        } else {
                            next()
                        }
                    },
                    callbackBeforeTriggerScanQRCode: function (next) {
                        var rootData = window.XXG.ServiceIntroAppDetect.rootData
                        var order = rootData.order
                        var servicePrivateData = rootData.servicePrivateData
                        if (servicePrivateData.isMigrateFlow
                            && servicePrivateData.migrateFlag == 1
                            && servicePrivateData.isPayed) {
                            // 迁移隐私数据流程 && 用户需要迁移数据 && 用户已经为迁移数据支付成功或者签约代扣成功
                            // 此种情况下扫码，表示二次上门，那么保存已经二次上门状态
                            window.XXG.ServicePrivateData.apiSavePrivateDataVisitAgain({
                                order_id: order.order_id
                            }, function () {
                                next()
                            })
                        } else {
                            next()
                        }
                    }
                }],
                // 初始化无法扫码检测旧机，直接购买新机
                [window.XXG.ServiceCantScanBuyNew, {
                    data: data,
                    callbackConfirm: function () {
                        window.XXG.BusinessSfFixOneStopOrder.actionSfFixOneStopOrderFullPay()
                    },
                    init: function (next, final) {
                        var data = window.XXG.ServiceCantScanBuyNew.rootData
                        if (data.order.status == 11) {
                            // 一站式换新，订单状态为11
                            window.XXG.ServiceCantScanBuyNew.render(data, $Wrap.find('.block-order-extend'))
                        }
                        console.log('路过无法扫码检测旧机，直接购买新机')
                        next()
                    }
                }],
                // 初始化新机激活
                [window.XXG.ServiceNewDeviceActivation, {
                    data: data,
                    init: function (next, final) {
                        // 是否需要新机激活
                        if (data.isNewDeviceNeedActivation) {
                            window.XXG.ServiceNewDeviceActivation.actionShow()
                        }

                        console.log('路过新机激活')
                        next()
                    }
                }]
            ], function () {
                typeof done === 'function' && done()
                // if (data.serviceRemoteCheck.remote_check_flag_process == -1) {
                //     window.XXG.ServiceRemoteCheck.render($Wrap, 'html')
                //     window.XXG.ServiceRemoteCheck.actionRemoteCheckReject()
                // }
            })
        })
    }

    function getCache(key) {
        var Cache = window.XXG.BusinessSfFixOneStopOrder.cache || {}
        if (typeof key !== 'undefined') {
            return Cache[key]
        }
        return Cache
    }

    function setCache(key, val) {
        var Cache
            = window.XXG.BusinessSfFixOneStopOrder.cache
            = window.XXG.BusinessSfFixOneStopOrder.cache || {}
        if (typeof key === 'object') {
            tcb.each(key, function (k, v) {
                Cache[k] = v
            })
        } else {
            Cache[key] = val
        }
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix_one_stop_order/action.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder = tcb.mix(window.XXG.BusinessSfFixOneStopOrder || {}, {
        actionSfFixOneStopOrderConfirmTradeIn: actionSfFixOneStopOrderConfirmTradeIn,
        actionTriggerSfFixOneStopOrderFullPay: actionTriggerSfFixOneStopOrderFullPay,
        actionSfFixOneStopOrderFullPay: actionSfFixOneStopOrderFullPay,
        actionSfFixOneStopOrderSupplement: actionSfFixOneStopOrderSupplement,
        actionSfFixOneStopOrderReturnNew: actionSfFixOneStopOrderReturnNew
    })
    var getCache = window.XXG.BusinessSfFixOneStopOrder.getCache
    var setCache = window.XXG.BusinessSfFixOneStopOrder.setCache

    // 丰修一站式--确认换新（无差价直接正常流程换新，有差价先补差，再换新）
    function actionSfFixOneStopOrderConfirmTradeIn($btn, data) {
        if (getCache('isTcbPay')) {
            // 如果是同城帮支付（同城帮补差）
            // 【先弹窗提示给用户打款，然后直接提交更新订单信息表单，并且成功之后完成订单】
            var tips = '完成服务后<br>补差金额将发放至用户易付宝账户'
            var title = '已告知顾客，下一步'
            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                window.XXG.BusinessSfFixOneStopOrder.eventTriggerFormUpdateOrderInfoSfFixOneStop($btn, data)
            }, tips, {
                title: title
            })
        } else {
            // 需要用户补差价【先让用户补差款，然后提交更新订单信息表单，再完成订单】
            // 或者不需要补差价【直接提交更新订单信息表单，并且成功之后完成订单】
            window.XXG.BusinessSfFixOneStopOrder.eventTriggerFormUpdateOrderInfoSfFixOneStop($btn, data)
        }
    }

    // 丰修一站式换新--触发旧机不成交（全款购机）
    function actionTriggerSfFixOneStopOrderFullPay($btn, data) {
        window.XXG.BusinessCommon.actionShowCityManagerInfo($btn, data, __actionTriggerSfFixOneStopOrderFullPay)
    }

    function __actionTriggerSfFixOneStopOrderFullPay($btn, data) {
        var html_fn = $.tmpl($.trim($('#JsMXxgOrderDetailBusinessSfFixOneStopOrderFullPayTpl').html())),
            html_st = html_fn(data)
        tcb.showDialog(html_st, {
            withClose: true,
            fromBottom: true
        })
    }

    // 丰修一站式换新--旧机不成交（全款购机）
    function actionSfFixOneStopOrderFullPay() {
        var rootData = window.XXG.BusinessCommon.rootData
        var order_id = rootData.order.order_id
        // 获取全款购新的支付地址，
        // 如果返回的支付地址为空，那么表示不需要补款购新，并且同时旧机已经被取消，直接刷新页面
        window.XXG.BusinessSfFixOneStopOrder.callbackBeforeFullPay(function (paymentUrl) {
            if (!paymentUrl) {
                return window.XXG.redirect()
            }
            paymentUrl = tcb.setUrl2(paymentUrl/*'/xxgHs/fullAmountPay'*/, {
                order_id: order_id,
                inner_iframe: true
            })
            tcb.closeDialog()
            tcb.showDialog('<iframe frameborder="0" src="' + paymentUrl + '" style="overflow-y: auto;width: 100%;height: 20rem;max-height: 85vh;">', {
                fromBottom: true,
                onClose: function () {
                    __stopCheckSuningOneStopFullPayment()
                }
            })
            __startCheckSuningOneStopFullPayment({
                'order_id': order_id
            }, function () {
                tcb.closeDialog()
                __stopCheckSuningOneStopFullPayment()
                window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                    // 由于全款购新支付成功后会自动取消旧机订单，
                    // 所以此处只需显示全款购新成功提示页，然后确认后刷新页面即可
                    // window.XXG.BusinessSfFixOneStopOrder.helperShowOrderFullPaySuccessPanel(rootData, function () {
                        window.XXG.redirect()
                    // })
                }, '恭喜您支付成功！', {
                    withoutClose: true
                })
            })
        })
    }

    // 丰修一站式换新--确认换新（无差价直接换新，有差价先补差，再换新）
    function actionSfFixOneStopOrderSupplement($btn, data) {
        var order_id = $btn.attr('data-order-id')
        var paymentUrl = tcb.setUrl2('/xxgHs/supplementAmountPay', {
            order_id: order_id,
            inner_iframe: true
        })
        tcb.showDialog('<iframe frameborder="0" src="' + paymentUrl + '" style="overflow-y: auto;width: 100%;height: 20rem;max-height: 85vh;">', {
            fromBottom: true,
            onClose: function () {
                __stopCheckSuningOneStopSupplement()
            }
        })
        __startCheckSuningOneStopSupplement({
            'order_id': order_id
        }, function () {
            tcb.closeDialog()
            __stopCheckSuningOneStopSupplement()
            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                setCache({
                    isPaySuccess: true
                })
                window.XXG.BusinessSfFixOneStopOrder.eventTriggerFormUpdateOrderInfoSfFixOneStop($btn, data)
            }, '恭喜您支付成功！', {
                withoutClose: true
            })
        })
    }

    var checkPaymentHandler = null
    var isStoppedCheckPayment = false

    // 丰修一站式换新--检查用户是否全款购机完成
    function __startCheckSuningOneStopFullPayment(data, callback) {
        isStoppedCheckPayment = false

        function loop() {
            if (isStoppedCheckPayment) {
                return __stopCheckSuningOneStopFullPayment()
            }
            window.XXG.BusinessSfFixOneStopOrder.apiGetSfFixSuningOneStopFullPaymentStatus(data,
                function (res) {
                    var isPayment = res
                    if (isPayment) {
                        typeof callback === 'function' && callback()
                    } else {
                        checkPaymentHandler = setTimeout(loop, 3000)
                    }
                },
                function () {
                    checkPaymentHandler = setTimeout(loop, 3000)
                }
            )
        }

        loop()
    }

    function __stopCheckSuningOneStopFullPayment() {
        isStoppedCheckPayment = true
        if (checkPaymentHandler) {
            clearTimeout(checkPaymentHandler)
            checkPaymentHandler = null
        }
    }

    // 丰修一站式换新--检查用户是否补差完成
    function __startCheckSuningOneStopSupplement(data, callback) {
        isStoppedCheckPayment = false

        function loop() {
            if (isStoppedCheckPayment) {
                return __stopCheckSuningOneStopSupplement()
            }
            window.XXG.BusinessSfFixOneStopOrder.apiGetSfFixSuningOneStopSupplementStatus(data,
                function (res) {
                    var isPayment = res
                    if (isPayment) {
                        typeof callback === 'function' && callback()
                    } else {
                        checkPaymentHandler = setTimeout(loop, 3000)
                    }
                },
                function () {
                    checkPaymentHandler = setTimeout(loop, 3000)
                }
            )
        }

        loop()
    }

    function __stopCheckSuningOneStopSupplement() {
        isStoppedCheckPayment = true
        if (checkPaymentHandler) {
            clearTimeout(checkPaymentHandler)
            checkPaymentHandler = null
        }
    }

    // 丰修一站式换新--退回新机（旧不卖，新不买）
    function actionSfFixOneStopOrderReturnNew($btn, data) {
        // 一站式订单修修哥不能手动取消订单，
        // 所以此处无法取消订单，只能提示
        tcb.closeDialog()
        window.XXG.BusinessCommon.helperShowAlertConfirm(null, '新机拒收退回，请提示用户到苏宁易购取消订单')
        return
        // window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
        //     var order = data.order
        //     tcb.loadingStart()
        //     window.XXG.BusinessCommon.apiCloseOrder({
        //         order_id: order.order_id,
        //         xxg_memo: '丰修一站式--退回新机'
        //     }, function () {
        //         tcb.closeDialog()
        //         tcb.loadingDone()
        //
        //         window.XXG.BusinessSfFixOneStopOrder.helperShowOrderCancelPanel(data, function () {
        //             window.XXG.redirect()
        //         })
        //     }, function () {
        //         tcb.loadingDone()
        //     })
        // }, '请确认取消订单，并将新机退回')
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix_one_stop_order/api.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder = tcb.mix(window.XXG.BusinessSfFixOneStopOrder || {}, {
        apiGetOneStopOrderInfo: apiGetOneStopOrderInfo,
        apiCheckOneStopPriceLetThrough: apiCheckOneStopPriceLetThrough,
        apiGetSfFixSuningOneStopFullPaymentStatus: apiGetSfFixSuningOneStopFullPaymentStatus,
        apiGetSfFixSuningOneStopSupplementStatus: apiGetSfFixSuningOneStopSupplementStatus
    })
    var getCache = window.XXG.BusinessSfFixOneStopOrder.getCache
    var setCache = window.XXG.BusinessSfFixOneStopOrder.setCache

    // 获取一站式换新机信息
    function apiGetOneStopOrderInfo(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/xxgHs/getOneStopOrderInfo'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    var result = res.result
                    var diffPrice = result.diffPrice || {}
                    var buyInfo = result.buyInfo || null
                    var suning_one_stop_notice_customer = tcb.queryUrl(window.location.search)['suning_one_stop_notice_customer']

                    var hasBalance = !!diffPrice.price
                    setCache({
                        hasBalance: hasBalance,
                        isTcbPay: hasBalance && !diffPrice.beacon,
                        // buyInfo存在，并且属性1或2或18或19或20有值，或者query中suning_one_stop_notice_customer有值，表示客户支付成功
                        isPaySuccess: !!((buyInfo && (buyInfo[1] || buyInfo[2] || buyInfo[18] || buyInfo[19] || buyInfo[20])) || suning_one_stop_notice_customer)
                    })
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 校验一站式换新金额允许继续（差异款是否大于冻结款）
    function apiCheckOneStopPriceLetThrough(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl2('/xxgHs/checkOneStopPriceLetThrough'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(true)
                } else {
                    typeof callback === 'function' && callback(false)
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 获取一站式换新机，全款购新补差扫码支付结果查询接口
    // 返回值 isPayment
    function apiGetSfFixSuningOneStopFullPaymentStatus(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/xxgHs/fullAmountSuc'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(true)
                } else {
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                typeof fail === 'function' && fail()
            }
        })
    }

    // 获取一站式换新机，用户支付补差扫码支付结果查询接口
    // 返回值 isPayment
    function apiGetSfFixSuningOneStopSupplementStatus(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/xxgHs/oneStopSupplementSuc'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(true)
                } else {
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                typeof fail === 'function' && fail()
            }
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix_one_stop_order/event.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder = tcb.mix(window.XXG.BusinessSfFixOneStopOrder || {}, {
        eventBind: eventBind,
        eventTriggerFormUpdateOrderInfoSfFixOneStop: eventTriggerFormUpdateOrderInfoSfFixOneStop
    })
    var getCache = window.XXG.BusinessSfFixOneStopOrder.getCache
    var setCache = window.XXG.BusinessSfFixOneStopOrder.setCache

    // 丰修一站式换新---事件绑定
    function eventBind(data) {
        if (eventBind.__bind) {
            return
        }
        eventBind.__bind = true

        if (typeof __fnGoNext === 'function') {
            window.XXG.BusinessCommon &&
            window.XXG.BusinessCommon.eventBind &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext.push(__fnGoNext)
        }
        tcb.bindEvent({})
    }

    // 事件--下一步（将会被加入的下一步的事件队列里）
    function __fnGoNext(e, $trigger, data) {
        var isContinue = true
        if (!__validGoNext($trigger)) {
            return false
        }
        var act = $trigger.attr('data-act')
        switch (act) {
            // start 丰修一站式
            case 'sf-fix-suning-one-stop-confirm-trade-in':
                // 丰修一站式换新--确认换新（无差价直接换新，有差价先补差，再换新）
                isContinue = false
                window.XXG.BusinessSfFixOneStopOrder.actionSfFixOneStopOrderConfirmTradeIn($trigger, data)
                break
            case 'trigger-sf-fix-suning-one-stop-full-pay':
                // 丰修一站式换新--触发旧机不成交（全款购机）
                isContinue = false
                window.XXG.BusinessSfFixOneStopOrder.actionTriggerSfFixOneStopOrderFullPay($trigger, data)
                break
            case 'sf-fix-suning-one-stop-full-pay':
                // 丰修一站式换新--旧机不成交（全款购机）
                isContinue = false
                window.XXG.BusinessSfFixOneStopOrder.actionSfFixOneStopOrderFullPay()
                break
            case 'sf-fix-suning-one-stop-return-new':
                // 丰修一站式换新--退回新机（旧不卖，新不买）
                isContinue = false
                window.XXG.BusinessSfFixOneStopOrder.actionSfFixOneStopOrderReturnNew($trigger, data)
                break
            // end 丰修一站式
        }
        return isContinue
    }

    function __validGoNext($trigger) {
        if ($trigger && $trigger.length && $trigger.hasClass('btn-go-next-lock')) {
            return
        }
        return true
    }

    // 丰修一站式换新--触发订单更新
    function eventTriggerFormUpdateOrderInfoSfFixOneStop($btn, data) {
        var $Form = window.XXG.BusinessCommon.$FormUpdateOrderInfo || null
        if (!($Form && $Form.length)) {
            return
        }

        var order_id = $btn.attr('data-order-id')

        $Form.trigger('submit', [
            function () {
                if (getCache('hasBalance') &&
                    !getCache('isTcbPay') &&
                    !getCache('continueBalance') &&
                    !getCache('isPaySuccess')) { // [在此逻辑下默认就是一站式，所以此处不再需要显示的判断是否一站式] && 需要补差 && 非同城帮补差 && 非继续补差状态 && 未补差成功
                    window.XXG.BusinessSfFixOneStopOrder.apiCheckOneStopPriceLetThrough({
                        order_id: order_id
                    }, function (valid) {
                        if (valid) { // 可以正常补差
                            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                                setCache({
                                    continueBalance: true
                                })
                                window.XXG.BusinessSfFixOneStopOrder.eventTriggerFormUpdateOrderInfoSfFixOneStop($btn, data)
                            }, '请确认验机是否无误，进入补差后将不可更改选项', {
                                title: '即将进入补差'
                            })
                        } else { // 异常情况，订单操作终止
                            window.XXG.BusinessCommon.helperShowAlertConfirm(null, '由于补贴款大于冻结款，所以无法继续完成订单', {
                                title: '补贴款大于冻结款'
                            })
                        }
                    })
                    return false
                }

                return true
            },
            function (res, $form, $trigger) {
                if (getCache('continueBalance')) {
                    setCache({
                        continueBalance: false
                    })
                    window.XXG.BusinessSfFixOneStopOrder.actionSfFixOneStopOrderSupplement($btn, data)
                    return
                }

                // 已经补差完成 或者 不需要补差，那么直接完成订单
                tcb.loadingStart()
                window.XXG.BusinessCommon.apiFinishOrder($btn, function () {
                    tcb.loadingDone()
                    // window.XXG.BusinessSfFixOneStopOrder.helperShowOrderSuccessPanel(data, function () {
                        window.XXG.redirect()
                    // })
                }, function () {
                    tcb.loadingDone()
                })
            }
        ])
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix_one_stop_order/helper.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder= tcb.mix(window.XXG.BusinessSfFixOneStopOrder|| {}, {
        helperShowOrderSuccessPanel: helperShowOrderSuccessPanel,
        helperShowOrderFullPaySuccessPanel: helperShowOrderFullPaySuccessPanel,
        helperShowOrderCancelPanel: helperShowOrderCancelPanel,
    })

    // 回收成功
    function helperShowOrderSuccessPanel(data, callback) {
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailBusinessSfFixOneStopOrderSuccessTpl').html())),
            html_st = html_fn(data || {})
        var dialogInst = tcb.showDialog(html_st, {
            withClose: false,
            fromBottom: true
        })
        var $wrap = dialogInst.wrap
        new ClipboardJS($wrap.find('.js-trigger-copy-the-text')[0]).on('success', function (e) {
            $.dialog.toast('复制成功：' + (e.text.replace(/\\n/ig, '<br>')))
        })

        $wrap.find('.btn-confirm').on('click', function (e) {
            e.preventDefault()
            tcb.closeDialog()

            typeof callback === 'function' && callback()
        })
    }

    // 全款购新成功
    function helperShowOrderFullPaySuccessPanel(data, callback) {
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailBusinessSfFixOneStopOrderFullPaySuccessTpl').html())),
            html_st = html_fn(data || {})
        var dialogInst = tcb.showDialog(html_st, {
            withClose: false,
            fromBottom: true
        })
        dialogInst.wrap.find('.btn-confirm').on('click', function (e) {
            e.preventDefault()
            tcb.closeDialog()

            typeof callback === 'function' && callback()
        })
    }

    // 订单取消提示【退新机，不卖旧机】
    function helperShowOrderCancelPanel(data, callback) {
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailBusinessSfFixOneStopOrderCancelTpl').html())),
            html_st = html_fn(data || {})
        var dialogInst = tcb.showDialog(html_st, {
            withClose: false,
            fromBottom: true
        })
        dialogInst.wrap.find('.btn-confirm').on('click', function (e) {
            e.preventDefault()
            tcb.closeDialog()

            typeof callback === 'function' && callback()
        })
    }

}()



;/**import from `/resource/js/mobile/huishou/xxg/order_detail/business_sf_fix_one_stop_order/render.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder = tcb.mix(window.XXG.BusinessSfFixOneStopOrder || {}, {
        render: render,
        renderBusinessSfFixOneStopOrderStatus: renderBusinessSfFixOneStopOrderStatus,
        renderBusinessSfFixOneStopOrderProduct: renderBusinessSfFixOneStopOrderProduct,
        renderBusinessSfFixOneStopOrderBtn: renderBusinessSfFixOneStopOrderBtn,

        htmlBusinessSfFixOneStopOrderStatusTitle: htmlBusinessSfFixOneStopOrderStatusTitle,
        htmlBusinessSfFixOneStopOrderStatusVerificationCode: htmlBusinessSfFixOneStopOrderStatusVerificationCode,

        htmlBusinessSfFixOneStopOrderProductNew: htmlBusinessSfFixOneStopOrderProductNew,
        htmlBusinessSfFixOneStopOrderProductOld: htmlBusinessSfFixOneStopOrderProductOld,
        htmlBusinessSfFixOneStopOrderProductPriceInfo: htmlBusinessSfFixOneStopOrderProductPriceInfo,

        htmlBusinessSfFixOneStopOrderBtn: htmlBusinessSfFixOneStopOrderBtn
    })
    var renderHtml = window.XXG.BusinessCommon.renderHtml
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl

    //=========== render到页面 =============
    // 输出html到页面，并且绑定相关事件
    function render(data) {
        var $target = window.XXG.BusinessSfFixOneStopOrder.$Wrap
        if (!($target && $target.length)) {
            $target = $('#mainbody .mainbody-inner')
        }
        var order = data.order
        /********** 模板输出 **********/
        // 订单状态
        window.XXG.BusinessSfFixOneStopOrder.renderBusinessSfFixOneStopOrderStatus(data, $target)
        // 物品信息
        window.XXG.BusinessSfFixOneStopOrder.renderBusinessSfFixOneStopOrderProduct(data, $target, 'append')
        if (order.status >= 12 && order.status != 50) {
            // 旧机评估
            // 订单状态 大于等于12（到达之后），并且不为50（取消）的时候才输出旧机评估信息
            window.XXG.BusinessCommon.renderBusinessCommonDeal(data, $target, 'append')
        }
        // 订单信息
        window.XXG.BusinessCommon.renderBusinessCommonInfo(data, $target, 'append')
        // 订单扩展信息
        window.XXG.BusinessCommon.renderBusinessCommonExtend(data, $target, 'append')
        // 操作按钮
        window.XXG.BusinessSfFixOneStopOrder.renderBusinessSfFixOneStopOrderBtn(data, $target, 'append')
        // 输出核验码的条形码
        window.XXG.BusinessCommon.renderVerificationCodeBarcode()
        // 输出快递单号条形码
        window.XXG.BusinessCommon.renderLogisticsMailNoBarcode()
        $target.show()

        /********** 事件绑定 **********/
        // 绑定copy
        window.XXG.BusinessCommon.eventBindCopy($target.find('.js-trigger-copy-the-text'))
        // 选择上门或者到店时间
        window.XXG.BusinessCommon.eventBindPickupServerTime($target.find('.js-trigger-pickup-service-time'))
        // 绑定价格更新表单
        window.XXG.BusinessCommon.eventBindFormUpdateOrderInfo(
            $target.find('#FormUpdateOrderInfoByGoNext'),
            $target.find('.js-trigger-update-deal-price')
        )
        // 绑定丰修退回新机和寄回旧机的快递表单
        window.XXG.BusinessCommon.eventBindFormSfFixReturn(
            $target.find('#FormSfFixReturn'),
            $target.find('.btn-edit-express-confirm'),
            function () {
                window.XXG.redirect()
            }
        )
        if (order.status == 12 && !order.order_scan) {// 未扫码，展开更改评估和价格编辑
            $target.find('.js-trigger-expand-n-collapse').trigger('click')
        }
        window.XXG.BusinessCommon.eventTriggerRenderDone()
    }

    // 输出订单状态信息
    function renderBusinessSfFixOneStopOrderStatus(data, $target, addType) {
        var $Status = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatus(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderStatusTitle(data), $Status)
        if (data.oneStopData.__sf_fix) {
            // 丰修一站式
            if (data.order.status == 13 && data.isDeviceResetAndUploadPhoto) {
                // 服务完成 && 需要上传设备还原后的照片
                renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusDeviceResetAndUploadPhoto(data), $Status)
            } else {
                renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderStatusVerificationCode(data), $Status)
            }
        }
        if (data.order.status == 13) {
            // 旧机--服务完成
            // renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusShippingInfo(data), $Status)
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusShippingInfoAuto(data), $Status)
        }
        if (data.order.status != 13
            || (data.order.send_out && !data.order.send_out.logistics_mail_no && data.order.send_out.logistics_express_status_fail)) {
            // 非完成服务 || 完成服务 && 没有快递单号 && 自动预约寄件失败
            // 上门地址信息
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusAddressInfo(data), $Status)
        }
        if (data.isBeforeArrive) {
            // 上门回收--到达之前
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusPickupServiceTime(data), $Status)
        }
        if (data.order.status == 11) {
            // 确认收到新机后，扫码前
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusAddressInfoTips(data), $Status)
        }
        return $Status
    }

    // 输出订单商品信息
    function renderBusinessSfFixOneStopOrderProduct(data, $target, addType) {
        var $Product = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProduct(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProductTitle(data), $Product)
        renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderProductNew(data), $Product)
        renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderProductOld(data), $Product)
        var serviceRemoteCheck = data.serviceRemoteCheck
        var order = data.order
        if (order.status != 50
            && (!serviceRemoteCheck.remote_check_flag || (serviceRemoteCheck.remote_check_flag && serviceRemoteCheck.remote_check_flag_process == 3))
        ) {
            // 非远程验机 || 远程验机并且已经验机完成
            renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderProductPriceInfo(data), $Product)
        }

        return $Product
    }

    // 输出订单操作按钮
    function renderBusinessSfFixOneStopOrderBtn(data, $target, addType) {
        var $Btn = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonBtn(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderBtn(data), $Btn)

        return $Btn
    }

    //=========== HTML输出 =============
    // 订单状态---丰修一站式title
    function htmlBusinessSfFixOneStopOrderStatusTitle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderStatusTitleTpl', data)
    }

    // 订单状态---丰修一站式核验码
    function htmlBusinessSfFixOneStopOrderStatusVerificationCode(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderStatusVerificationCodeTpl', data)
    }

    // 物品信息---丰修一站式新机信息
    function htmlBusinessSfFixOneStopOrderProductNew(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderProductNewTpl', data)
    }

    // 物品信息---丰修一站式旧机信息
    function htmlBusinessSfFixOneStopOrderProductOld(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderProductOldTpl', data)
    }

    // 物品信息---丰修一站式价格、优惠信息等
    function htmlBusinessSfFixOneStopOrderProductPriceInfo(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderProductPriceInfoTpl', data)
    }

    // 按钮操作---丰修一站式
    function htmlBusinessSfFixOneStopOrderBtn(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderBtnTpl', data)
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_remote_check/setup.js` **/
// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServiceRemoteCheck = tcb.mix(window.XXG.ServiceRemoteCheck || {}, {
        $Wrap: null,
        data: null,
        rootData: null,
        callbackStatusChangeDone: null,
        callbackStatusChangeBefore: null,
        setup: setup,
        init: init,
        start: start,
        setData: setData,
        getData: getData
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServiceRemoteCheck.data = (options.data && options.data.serviceRemoteCheck) || {}
        window.XXG.ServiceRemoteCheck.rootData = options.data || {}
        window.XXG.ServiceRemoteCheck.callbackStatusChangeDone = options.callbackStatusChangeDone || tcb.noop
        window.XXG.ServiceRemoteCheck.callbackStatusChangeBefore = options.callbackStatusChangeBefore || tcb.noop
        window.XXG.ServiceRemoteCheck.eventBind(options.data)
        window.XXG.ServiceRemoteCheck.render(options.$target, options.addType)
        // window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus()
    }

    function init(next, final) {
        next()
    }

    function start(is_force_auth) {
        var rootData = window.XXG.ServiceRemoteCheck.rootData
        var order_id = rootData.order && rootData.order.order_id
        if (!order_id) {
            return console.warn('完犊子，订单id丢失了，快检查下是不是参数传错了！')
        }
        window.XXG.ServiceRemoteCheck.actionStartListen(order_id, is_force_auth)
    }

    function setData(key, val) {
        if (typeof key === 'object') {
            tcb.each(key, function (k, v) {
                k += ''
                v = k === 'remote_check_timeout' ? v * 1000 : v
                window.XXG.ServiceRemoteCheck.data[k] = v
                window['__' + k.toUpperCase()] = v
            })
        } else {
            key += ''
            val = key === 'remote_check_timeout' ? val * 1000 : val
            window.XXG.ServiceRemoteCheck.data[key] = val
            window['__' + key.toUpperCase()] = val
        }
    }

    function getData(key) {
        return key
            ? window.XXG.ServiceRemoteCheck.data[key]
            : window.XXG.ServiceRemoteCheck.data
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_remote_check/action.js` **/
// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServiceRemoteCheck = tcb.mix(window.XXG.ServiceRemoteCheck || {}, {
        actionStartListen: actionStartListen,
        actionCloseListen: actionCloseListen,
        actionSetRemoteCheckStatus: actionSetRemoteCheckStatus,
        actionRemoteCheckReject: actionRemoteCheckReject,
        actionRemoteCheckWaiting: actionRemoteCheckWaiting,
        actionRemoteCheckWaitingOutTime: actionRemoteCheckWaitingOutTime,
        actionRemoteCheckTomorrow: actionRemoteCheckTomorrow,
        actionRemoteChecking: actionRemoteChecking,
        actionRemoteCheckingOutTime: actionRemoteCheckingOutTime,
        actionRemoteCheckSuccess: actionRemoteCheckSuccess,
        actionShowBlockRemoteCheck: actionShowBlockRemoteCheck,
        actionHideBlockRemoteCheck: actionHideBlockRemoteCheck,
        actionGetRemoteCheckOptions: actionGetRemoteCheckOptions,
        actionSetupUploadRejectPicture: actionSetupUploadRejectPicture,
        actionRemoteCheckRejectReSubmit: actionRemoteCheckRejectReSubmit,
        actionIsRemoteCheckWorkTime: actionIsRemoteCheckWorkTime
    })

    var startCountdown = Bang.startCountdown
    var wsInst
    var __checkWaitingCountdownStopHandle
    var __checkingCountdownStopHandle
    var __flag_stop = true

    function actionStartListen(order_id, is_force_auth) {
        window.XXG.ServiceRemoteCheck.actionCloseListen()

        var data = window.XXG.ServiceRemoteCheck.getData()

        if (!data.remote_check_flag) {
            // 不支持远程验机，直接返回不做任何处理
            return
        }
        if (!data.remote_check_auth) {
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                '无法获取远程验机的权证，无法开启远程验机，请重试',
                {withoutClose: true}
            )
        }

        try {
            if (!is_force_auth && data.remote_check_id) {
                __startLoopCheck(data.remote_check_id)
            } else {
                __remoteCheckAuth(function () {
                    __remoteOrderPush(order_id, function () {
                        __startLoopCheck(data.remote_check_id)
                    })
                })
            }
        } catch (e) {
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                e.message || '远程验机通道建立失败，请重试',
                {withoutClose: true}
            )
        }
    }

    function actionCloseListen() {
        __stopLoopCheck()
    }

    // 远程验机校权
    function __remoteCheckAuth(callback) {
        var data = window.XXG.ServiceRemoteCheck.getData()
        if (!data.remote_check_api) {
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                '无法获取接口服务器信息，请服务器管理员',
                {withoutClose: true}
            )
        }
        window.XXG.ServiceRemoteCheck.apiRemoteCheckAuth(
            data.remote_check_api + '/RemoteCheck/Common/auth',
            {
                'auth_token': data.remote_check_auth,
                'auth': 1
            },
            function (res) {
                if (!res || res.errno) {
                    return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                        res.errmsg || '系统错误，暂时无法提供远程验机服务',
                        {withoutClose: true}
                    )
                }
                typeof callback == 'function' && callback(res)
            },
            function (err) {
                return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                    err.statusText || '系统错误，暂时无法提供远程验机服务',
                    {withoutClose: true}
                )
            }
        )
    }

    // 将远程验机加入队列，并且获取远程验机id，赋值给data.remote_check_id
    function __remoteOrderPush(order_id, callback) {
        var data = window.XXG.ServiceRemoteCheck.getData()
        if (!data.remote_check_api) {
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                '无法获取接口服务器信息，请服务器管理员',
                {withoutClose: true}
            )
        }
        window.XXG.ServiceRemoteCheck.apiRemoteCheckOrderPush(
            data.remote_check_api + '/RemoteCheck/Engineer/orderPush',
            {
                'order_id': order_id
            },
            function (res) {
                if (!res || res.errno) {
                    return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                        res.errmsg || '系统错误，暂时无法提供远程验机服务',
                        {withoutClose: true}
                    )
                }
                if (res && res.data && res.data.check_id) {
                    window.XXG.ServiceRemoteCheck.setData({
                        remote_check_id: res.data.check_id
                    })
                }
                typeof callback == 'function' && callback(res)
            },
            function (err) {
                return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                    err.statusText || '系统错误，暂时无法提供远程验机服务',
                    {withoutClose: true}
                )
            }
        )
    }

    // 循环检测远程验机状态和数据
    function __startLoopCheck(remote_check_id) {
        __flag_stop = false

        var delay = 2000

        function loop(start) {
            if (__flag_stop) return

            wsInst = setTimeout(loop, delay)
            checking(function (remoteCheck) {
                var remote_check_flag_process = window.XXG.ServiceRemoteCheck.getData('remote_check_flag_process')
                var remote_check_flag_process_latest = remoteCheck.remote_check_flag_process
                if (start || (remote_check_flag_process != remote_check_flag_process_latest)) {
                    window.XXG.ServiceRemoteCheck.setData(remoteCheck)
                    window.XXG.ServiceRemoteCheck.actionSetRemoteCheckStatus(start)
                }
            }, remote_check_id)
        }

        function checking(callback, remote_check_id) {
            window.XXG.ServiceRemoteCheck.actionGetRemoteCheckOptions(function (remoteCheck) {
                if (!remoteCheck) return
                typeof callback == 'function' && callback(remoteCheck)
            }, remote_check_id)
        }

        loop(true)
    }

    // 停止循环检测
    function __stopLoopCheck() {
        __flag_stop = true
        if (wsInst) {
            clearTimeout(wsInst)
            wsInst = null
        }
    }

    // 设置远程验机状态
    function actionSetRemoteCheckStatus(start) {
        if (typeof __checkWaitingCountdownStopHandle == 'function') {
            __checkWaitingCountdownStopHandle()
            __checkWaitingCountdownStopHandle = null
        }
        if (typeof __checkingCountdownStopHandle == 'function') {
            __checkingCountdownStopHandle()
            __checkingCountdownStopHandle = null
        }

        var data = window.XXG.ServiceRemoteCheck.getData()
        window.XXG.ServiceRemoteCheck.callbackStatusChangeBefore(data, start, function () {
            switch (data.remote_check_flag_process) {
                case -1: // 驳回
                    window.XXG.ServiceRemoteCheck.actionRemoteCheckReject()
                    break
                case 1: // 正在排队
                    if (data.remote_check_tomorrow) {
                        // 黑名单用户,超过特定时间只能明天下单
                        window.XXG.ServiceRemoteCheck.actionRemoteCheckTomorrow()
                    } else if (data.remote_check_timeout > window.XXG.BusinessCommon.helperNowTime()) {
                        // 判断时间
                        // 等待审核中
                        window.XXG.ServiceRemoteCheck.actionRemoteCheckWaiting()
                    } else {
                        // 等待超时
                        window.XXG.ServiceRemoteCheck.actionRemoteCheckWaitingOutTime()
                    }
                    break
                case 2: // 审核中
                    window.XXG.ServiceRemoteCheck.actionRemoteChecking()
                    break
                case 3: // 审核成功
                    window.XXG.ServiceRemoteCheck.actionRemoteCheckSuccess()
                    break
                default:
                    // 值为空 或者 0，表示还没有开启验机流程
                    if (!data.remote_check_flag_process) {
                        window.XXG.ServiceRemoteCheck.actionCloseListen()
                        window.XXG.ServiceRemoteCheck.actionHideBlockRemoteCheck()
                    }
            }

            window.XXG.ServiceRemoteCheck.callbackStatusChangeDone(data, start)
        })
    }

    // 远程验机等待ing
    function actionRemoteCheckWaiting() {
        var $BlockOrderRemoteCheck = window.XXG.ServiceRemoteCheck.renderRemoteCheckOptions({
            check_tip: '预计<span class="remote-check-countdown"></span>分钟内处理',
            check_tip_desc: '已提交审核，请您稍候'
        })
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(1)
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()

        var data = window.XXG.ServiceRemoteCheck.getData()
        var timeout = data.remote_check_timeout
        var $countdown = $BlockOrderRemoteCheck.find('.remote-check-countdown')
        __checkWaitingCountdownStopHandle = startCountdown(timeout, window.XXG.BusinessCommon.helperNowTime(), $countdown, {
            end: function () {
                window.XXG.ServiceRemoteCheck.actionRemoteCheckWaitingOutTime()
            }
        })
    }

    // 远程验机等待超时
    function actionRemoteCheckWaitingOutTime() {
        window.XXG.ServiceRemoteCheck.renderRemoteCheckOptions({
            check_tip: '正在加急处理，请耐心等待!',
            check_tip_desc: '已提交审核，请您稍候'
        })
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(1)
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()
        // 判断时间
        var data = window.XXG.ServiceRemoteCheck.getData()
        if (data.remote_check_timeout > window.XXG.BusinessCommon.helperNowTime()) {
            window.XXG.ServiceRemoteCheck.actionSetRemoteCheckStatus()
        }
    }

    // 远程验机ing
    function actionRemoteChecking() {
        var $BlockOrderRemoteCheck = window.XXG.ServiceRemoteCheck.renderRemoteCheckOptions({
            check_tip: '预计<span class="remote-check-countdown"></span>分钟内完成',
            check_tip_desc: '审核人员正在处理，请您稍候'
        })
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(1)
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()

        var data = window.XXG.ServiceRemoteCheck.getData()
        var timeout = data.remote_check_timeout
        var $countdown = $BlockOrderRemoteCheck.find('.remote-check-countdown')
        __checkingCountdownStopHandle = startCountdown(timeout, window.XXG.BusinessCommon.helperNowTime(), $countdown, {
            end: function () {
                // window.XXG.ServiceRemoteCheck.actionRemoteCheckingOutTime()
            }
        })
    }

    // 远程验机超时
    function actionRemoteCheckingOutTime() {
        window.XXG.ServiceRemoteCheck.actionCloseListen()
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(2)
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()
        window.XXG.ServiceRemoteCheck.setData({
            remote_check_flag_process: 3
        })
        window.XXG.BusinessCommon.helperNowTime()
        window.XXG.ServiceRemoteCheck.actionSetRemoteCheckStatus()
    }

    // 远程验机被驳回
    function actionRemoteCheckReject() {
        window.XXG.ServiceRemoteCheck.actionCloseListen()
        var rootData = window.XXG.ServiceRemoteCheck.rootData || {}
        var order = rootData.order || {}
        window.XXG.ServiceUploadPicture.apiGetUploadPictureShootRule({
            categoryId: order.category_id
        }, function (res) {
            var uploadList = res.result || []
            var _uploadKeySet = []
            var _uploadKeyMap = {}
            tcb.each(uploadList, function (i, item) {
                _uploadKeySet.push(item.name)
                _uploadKeyMap[i + 1] = item.name
            })
            uploadKeySet = _uploadKeySet
            uploadKeyMap = _uploadKeyMap

            var $Block = window.XXG.ServiceRemoteCheck.renderRemoteCheckReject({
                remote_check_remarks: window.XXG.ServiceRemoteCheck.getData('remote_check_remarks'),
                remote_check_tagging_imgs: window.XXG.ServiceRemoteCheck.getData('remote_check_tagging_imgs') || {},
                uploadList: uploadList
            })
            window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(3)
            window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()
            window.XXG.ServiceRemoteCheck.actionSetupUploadRejectPicture($Block, window.XXG.ServiceRemoteCheck.getData('remote_check_tagging_imgs') || {})
        })
    }

    // 远程验机成功
    function actionRemoteCheckSuccess() {
        window.XXG.ServiceRemoteCheck.actionCloseListen()

        var remote_check_options = window.XXG.ServiceRemoteCheck.getData('remote_check_options') || []
        var remote_check_tagging_imgs = window.XXG.ServiceRemoteCheck.getData('remote_check_tagging_imgs') || {}
        var remote_check_remarks = window.XXG.ServiceRemoteCheck.getData('remote_check_remarks') || ''
        var isSuccessPerfect = true
        tcb.each(remote_check_options, function (i, item) {
            if (!item.succ) {
                isSuccessPerfect = false
            }
        })
        tcb.each(remote_check_tagging_imgs, function (i, item) {
            if (item) {
                isSuccessPerfect = false
            }
        })

        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(2)
        if (isSuccessPerfect) {
            // 完美通过审核
            window.XXG.ServiceRemoteCheck.renderRemoteCheckSuccessPerfect({
                remote_check_options: remote_check_options,
                remote_check_remarks: remote_check_remarks
            })
        } else {
            // 审核通过，但是有差异项
            window.XXG.ServiceRemoteCheck.renderRemoteCheckSuccessDiff({
                remote_check_options: remote_check_options,
                remote_check_remarks: remote_check_remarks,
                remote_check_tagging_imgs: remote_check_tagging_imgs
            })
        }
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()
    }

    // 黑名单用户超过特定时间段,只可明天下单,修改页面文案
    function actionRemoteCheckTomorrow() {
        window.XXG.ServiceRemoteCheck.actionCloseListen()
        window.XXG.ServiceRemoteCheck.renderRemoteCheckOptions({
            check_tip: '超出订单提交时间,请在工作时间提交',
            check_tip_desc: '请在规定时间内提交订单,其余时间不接单'
        })
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(1)
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()
    }


    function actionShowBlockRemoteCheck() {
        window.XXG.ServiceRemoteCheck.$Wrap.show()
    }

    function actionHideBlockRemoteCheck() {
        window.XXG.ServiceRemoteCheck.$Wrap.hide()
    }

    // 获取远程验机状态
    function actionGetRemoteCheckOptions(callback, remote_check_id) {
        if (tcb.cache('__getRemoteCheckOptionsTimeout')) {
            return callback()
        }
        var params = {
            order_id: tcb.queryUrl(window.location.search, 'order_id')
        }
        if (remote_check_id) {
            params = {
                remote_check_id: remote_check_id
            }
        }
        window.XXG.ServiceRemoteCheck.apiGetRemoteCheckOptions(params, function (res) {
            if (!res) {
                return setTimeout(function () {
                    window.XXG.ServiceRemoteCheck.actionGetRemoteCheckOptions(callback)
                }, 300)
            }
            typeof callback == 'function' && callback(res.result)
        }, function (err) {
            setTimeout(function () {
                window.XXG.ServiceRemoteCheck.actionGetRemoteCheckOptions(callback)
            }, 300)
        })
    }

    var uploadRejectPictureMap = {}
    var uploadKeySet = []
    var uploadKeyMap = {}
    // var uploadKeySet = ['pingzheng1', 'pingzheng2', 'pingzheng3', 'pingzheng4']
    // var uploadKeyMap = {
    //     1: 'pingzheng1',
    //     2: 'pingzheng2',
    //     3: 'pingzheng3',
    //     4: 'pingzheng4'
    // }

    // 装载远程验机被驳回后重新传图验机的功能
    function actionSetupUploadRejectPicture($wrap, remote_check_tagging_imgs) {
        uploadRejectPictureMap = {}
        tcb.each(remote_check_tagging_imgs, function (k) {
            uploadRejectPictureMap[uploadKeyMap[k]] = ''
        })
        var $trigger = $wrap.find('.js-trigger-upload-picture')
        new window.TakePhotoUpload({
            $trigger: $trigger,
            supportCustomCamera: true,
            callback_upload_success: function (inst, data) {
                console.log('触发了上传图片的函数')
                if (data && !data.errno) {
                    var $triggerCurrent = inst.$triggerCurrent
                    if (!($triggerCurrent && $triggerCurrent.length)) {
                        return
                    }
                    $triggerCurrent.css('backgroundImage', 'url(' + data.result + ')')
                    $triggerCurrent.closest('.trigger-wrap').find('.tip-upload-picture').hide()
                    uploadRejectPictureMap[$triggerCurrent.attr('data-for')] = data.result
                } else {
                    return $.dialog.toast((data && data.errmsg) || '系统错误')
                }
            },
            callback_upload_fail: function (me, xhr, status, err) {
                $.dialog.toast(xhr.statusText || '上传失败，请稍后再试')
            }
        })


        // __bindEvent($wrap)
        // __bindEventUploadPicture($wrap.find('.trigger-invoke-camera'))
    }

    // 提交重新上传图片
    function actionRemoteCheckRejectReSubmit($trigger, data) {
        if (!window.XXG.ServiceRemoteCheck.actionIsRemoteCheckWorkTime()) {
            // 不在远程验机时间内，那么弹出提示
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null, '服务时间为早9点至晚10点，请在此时间段内操作订单')
        }
        var order = data.order
        var order_id = order.order_id
        var params = {
            order_id: order_id
        }
        var flag = true
        tcb.each(uploadRejectPictureMap, function (k, v) {
            if (!v) {
                return flag = false
            }
            params[k] = v
        })
        if (!flag) {
            return $.dialog.toast('请重新上传所有的驳回照片')
        }
        tcb.loadingStart()
        window.XXG.ServiceUploadPicture.apiGetPicture(order_id, function (res) {
            if (res.errno) {
                return tcb.loadingDone()
            }
            var imgs = res.result || []
            tcb.each(imgs, function (i, img) {
                if (!params[uploadKeySet[i]]) {
                    params[uploadKeySet[i]] = img
                }
            })
            window.XXG.ServiceUploadPicture.apiUpdatePicture(params, function () {
                tcb.loadingDone()
                setTimeout(function () {
                    window.XXG.ServiceRemoteCheck.start(true)
                    tcb.loadingDone()
                }, 1000)
            }, function () {
                tcb.loadingDone()
            })
        })
    }

    // 判断是都在远程验机工作时间内
    function actionIsRemoteCheckWorkTime() {
        var data = window.XXG.ServiceRemoteCheck.getData()

        var remote_check_work_time = data.remote_check_work_time || {}
        var nowObj = new Date()
        var nowTimestamp = nowObj.getTime()
        var year = nowObj.getFullYear()
        var month = nowObj.getMonth() + 1
        var day = nowObj.getDate()
        var start = [year, month, day].join('/') + ' ' + remote_check_work_time.beginAt
        var end = [year, month, day].join('/') + ' ' + remote_check_work_time.endsAt

        return nowTimestamp >= (new Date(start)).getTime() &&
            nowTimestamp <= (new Date(end)).getTime()
    }
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_remote_check/api.js` **/
// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServiceRemoteCheck = tcb.mix(window.XXG.ServiceRemoteCheck || {}, {
        apiRemoteCheckAuth: apiRemoteCheckAuth,
        apiRemoteCheckOrderPush: apiRemoteCheckOrderPush,
        apiGetRemoteCheckOptions: apiGetRemoteCheckOptions
    })

    // 获取远程验机信息
    function apiGetRemoteCheckOptions(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl2('/m/getRemoteCheckProcess'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                typeof fail === 'function' && fail(err)
            }
        })
    }

    // 远程验机校权
    function apiRemoteCheckAuth(url, data, callback, fail) {
        window.XXG.ajax({
            url: url,
            data: data,
            method: 'POST',
            xhrFields: {withCredentials: true},
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                typeof fail === 'function' && fail(err)
            }
        })
    }

    // 将远程验机加入队列，并且获取远程验机id，
    function apiRemoteCheckOrderPush(url, data, callback, fail) {
        window.XXG.ajax({
            url: url,
            data: data,
            method: 'POST',
            xhrFields: {withCredentials: true},
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                typeof fail === 'function' && fail(err)
            }
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_remote_check/event.js` **/
// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServiceRemoteCheck = tcb.mix(window.XXG.ServiceRemoteCheck || {}, {
        eventBind: eventBind
    })

    function eventBind(data) {
        if (eventBind.__bind) {
            return
        }
        eventBind.__bind = true

        if (typeof __fnGoNext === 'function') {
            window.XXG.BusinessCommon &&
            window.XXG.BusinessCommon.eventBind &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext.push(__fnGoNext)
        }
        // 绑定事件
        tcb.bindEvent({})
    }

    // 事件--下一步（将会被加入的下一步的事件队列里）
    function __fnGoNext(e, $trigger, data) {
        var isContinue = true
        if (!__validGoNext($trigger)) {
            return false
        }
        var act = $trigger.attr('data-act')
        switch (act) {
            case 'service-remote-check-reject-re-submit':
                // 提交远程验机驳回后重新传的照片
                isContinue = false
                window.XXG.ServiceRemoteCheck.actionRemoteCheckRejectReSubmit($trigger, data)
                break
        }
        return isContinue
    }

    function __validGoNext($trigger) {
        if ($trigger && $trigger.length && $trigger.hasClass('btn-go-next-lock')) {
            return
        }
        return true
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_remote_check/render.js` **/
// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServiceRemoteCheck = tcb.mix(window.XXG.ServiceRemoteCheck || {}, {
        render: render,
        renderSetUIButtonStatus: renderSetUIButtonStatus,
        renderRemoteCheckOptions: renderRemoteCheckOptions,
        renderRemoteCheckSuccessPerfect: renderRemoteCheckSuccessPerfect,
        renderRemoteCheckSuccessDiff: renderRemoteCheckSuccessDiff,
        renderRemoteCheckReject: renderRemoteCheckReject
    })
    var renderHtml = window.XXG.BusinessCommon.renderHtml
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var openBiggerShow = Bang.openBiggerShow

    // addType 只支持 append prepend after before 以及 html
    function render($target, addType) {
        var $OrderDetailServiceRemoteCheck = $('#OrderDetailServiceRemoteCheck')
        if ($OrderDetailServiceRemoteCheck && $OrderDetailServiceRemoteCheck.length) {
            $OrderDetailServiceRemoteCheck.remove()
        }
        window.XXG.ServiceRemoteCheck.$Wrap = renderHtml(htmlTpl('#JsXxgOrderDetailServiceRemoteCheckTpl'), $target, addType)
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus()
    }

    function renderSetUIButtonStatus(type) {
        var $trigger = $('.btn-go-next').eq(0)
        switch (type) {
            case 1:
                // 审核中
                $trigger
                    .addClass('btn-go-next-lock')
                    .html('审核中...')
                break
            case 2:
                // 远程验机成功/超时
                $trigger
                    .removeClass('btn-go-next-lock')
                    // .html('完成订单')
                    .html($trigger.attr('data-default-text'))
                break
            case 3:
                // 驳回
                $trigger
                    .removeClass('btn-go-next-lock')
                    .html('重新提交')
                break
            case 4:
                // 将按钮文案恢复到默认状态
                $trigger
                    .removeClass('btn-go-next-lock')
                    .html($trigger.attr('data-default-text'))
                break
            default:
                // 记录按钮的默认文案
                $trigger.attr('data-default-text', $trigger.html())
        }
        return $trigger
    }

    function renderRemoteCheckOptions(data) {
        return renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceRemoteCheckOptionsTpl', data),
            window.XXG.ServiceRemoteCheck.$Wrap
        )
    }

    function renderRemoteCheckSuccessPerfect(data) {
        return renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceRemoteCheckSuccessPerfectTpl', data),
            window.XXG.ServiceRemoteCheck.$Wrap
        )
    }

    function renderRemoteCheckSuccessDiff(data) {
        var remote_check_tagging_imgs = []
        tcb.each(data.remote_check_tagging_imgs || {}, function (k, v) {
            remote_check_tagging_imgs.push(v)
        })
        data.remote_check_tagging_imgs = remote_check_tagging_imgs

        var $Wrap = window.XXG.ServiceRemoteCheck.$Wrap
        var $Ret = renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceRemoteCheckSuccessDiffTpl', data),
            $Wrap
        )

        setTimeout(function () {
            var $imgs = $Wrap.find('.js-trigger-show-big-img')
            var $cols = $Wrap.find('.row-picture .col-2-1')
            var $pics = $Wrap.find('.row-picture .col-2-1 .pic')
            if ($imgs.length) {
                var s = $cols.eq(0).width() - 1
                openBiggerShow($imgs)
                $cols.css({
                    'width': s,
                    'height': s
                })
                $pics.css({
                    'line-height': (s * .96) + 'px'
                })
                tcb.setImgElSize($imgs, s * .96 * .9, s * .96 * .9)
            }
        }, 300)

        return $Ret
    }

    function renderRemoteCheckReject(data) {
        return renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceRemoteCheckRejectTpl', data),
            window.XXG.ServiceRemoteCheck.$Wrap
        )
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_upload_picture/setup.js` **/
// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceUploadPicture = tcb.mix(window.XXG.ServiceUploadPicture || {}, {
        // data: null,
        rootData: null,
        fnQueueSubmitSuccess: [],
        setup: setup,
        init: init,
        show: show,
    })

    // 显示拍照上传页
    function setup(options) {
        options = options || {}
        var rootData = options.data || {}
        window.XXG.ServiceUploadPicture.rootData = rootData
    }

    function init(next, final) {
        next()
    }

    function show() {
        window.XXG.ServiceUploadPicture.actionShow()
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_upload_picture/action.js` **/
// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceUploadPicture = tcb.mix(window.XXG.ServiceUploadPicture || {}, {
        actionShow: actionShow,
        actionClose: actionClose,
        actionDelPicture: actionDelPicture,
        actionShowProcessBar: actionShowProcessBar,
        actionShowProcessBar100: actionShowProcessBar100,
        actionHideProcessBar: actionHideProcessBar,
        actionSetUploadingPicture: actionSetUploadingPicture,
        actionSetUploadedPicture: actionSetUploadedPicture
    })
    var SwipeSection = window.Bang.SwipeSection

    function actionShow() {
        var rootData = window.XXG.ServiceUploadPicture.rootData || {}
        var order = rootData.order || {}
        window.XXG.ServiceUploadPicture.apiGetUploadPictureShootRule({
            categoryId: order.category_id
        }, function (res) {
            var uploadList = res.result || []
            var $swipe = window.XXG.ServiceUploadPicture.renderSwipe({
                order_id: order.order_id,
                dealPrice: order.price,
                uploadList: uploadList
            })
            var $trigger = $swipe.find('.js-trigger-upload-picture')

            window.XXG.ServiceUploadPicture.apiGetPicture(order.order_id, function (res) {
                tcb.each(res.result || [], function (i) {
                    var $triggerCurrent = $trigger.eq(i)
                    $triggerCurrent.removeClass('icon-close').css({
                        'border': '1px solid #ddd',
                        'background-image': 'url(' + tcb.imgThumbUrl(res.result[i], 300, 300, 'edr') + ')'
                    })
                    window.XXG.ServiceUploadPicture.actionSetUploadedPicture($triggerCurrent, res.result[i])
                })
            })

            window.XXG.ServiceUploadPicture.eventBind($swipe)
            window.XXG.ServiceUploadPicture.eventBindTakePhotoUpload($trigger)
            window.XXG.ServiceUploadPicture.eventBindFormXxgOrderSubmitPicture($swipe.find('#FormXxgOrderUploadPicture'))

            SwipeSection.doLeftSwipeSection()
        })
    }

    function actionClose() {
        SwipeSection.backLeftSwipeSection()
    }

    function actionDelPicture($delTrigger) {
        $delTrigger.hide()

        var $TriggerUploadPicture = $delTrigger.siblings('.js-trigger-upload-picture'),
            $TriggerInvokeCamera = $delTrigger.siblings('.trigger-invoke-camera')

        $TriggerInvokeCamera.val('')

        $TriggerUploadPicture
        //.addClass ('icon-close')
            .css({
                'border': '0',
                'background-image': ''
            })
        $('[name="' + $TriggerUploadPicture.attr('data-for') + '"]').val('')

        window.XXG.ServiceUploadPicture.actionHideProcessBar($delTrigger.siblings('.fake-upload-progress'))
    }

    function actionShowProcessBar($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.show()

        var percent_val = 25
        $processBarInner.css({'width': percent_val + '%'})

        setTimeout(function h() {
            percent_val += 12
            if (percent_val > 100) {
                return
            }
            if ($processBarInner.css('width') == '100%') {
                return
            }
            $processBarInner.css({'width': percent_val + '%'})

            if (percent_val < 100) {
                setTimeout(h, 500)
            }
        }, 500)
    }

    function actionShowProcessBar100($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.show()
        $processBarInner.css({'width': '100%'})
    }

    function actionHideProcessBar($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.hide()
        $processBarInner.css({'width': '0'})
    }

    function actionSetUploadingPicture($trigger, img) {
        if (!img) {
            return
        }
        $trigger
            .css({
                'border': '1px solid #ddd',
                'background-image': 'url(' + img + ')' // tcb.imgThumbUrl(img, 300, 300, 'edr')
            })
    }

    function actionSetUploadedPicture($trigger, img) {
        if (!img) {
            return
        }
        var $DelPicture = $trigger.siblings('.js-trigger-del-picture')

        $DelPicture.show()
        //$trigger.removeClass ('icon-close').css ({
        //    'border': '1px solid #ddd',
        //    'background-image' : 'url(' + img + ')' // tcb.imgThumbUrl(img, 300, 300, 'edr')
        //})
        $('[name="' + $trigger.attr('data-for') + '"]').val(img)
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_upload_picture/api.js` **/
// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceUploadPicture = tcb.mix(window.XXG.ServiceUploadPicture || {}, {
        apiGetPicture: apiGetPicture,
        apiUpdatePicture: apiUpdatePicture,
        apiGetUploadPictureShootRule: apiGetUploadPictureShootRule
    })

    // 获取指定order_id已经上传的图片
    function apiGetPicture(order_id, callback) {
        window.XXG.ajax({
            url: '/m/doGetPingzheng',
            data: {
                order_id: order_id
            },
            success: function (res) {
                if (!res.errno) {
                    $.isFunction(callback) && callback(res)
                } else {
                    $.dialog.toast(res.errmsg)
                }
            },
            error: function (err) {
                $.dialog.toast('系统错误，请稍后重试')
            }
        })
    }

    function apiUpdatePicture(data, callback, fail) {
        window.XXG.ajax({
            url: '/m/doUpdatePingzheng',
            type: 'POST',
            data: data,
            success: function (res) {
                if (!res.errno) {
                    $.isFunction(callback) && callback(res)
                } else {
                    $.dialog.toast(res.errmsg)
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 获取上传图片的规则列表
    function apiGetUploadPictureShootRule(data, callback, fail) {
        window.XXG.ajax({
            url: '/Recycle/Engineer/getShootRule',
            data: data,
            success: function (res) {
                if (!res.errno) {
                    $.isFunction(callback) && callback(res)
                } else {
                    $.dialog.toast(res.errmsg)
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_upload_picture/event.js` **/
// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceUploadPicture = tcb.mix(window.XXG.ServiceUploadPicture || {}, {
        eventBind: eventBind,
        eventBindTakePhotoUpload: eventBindTakePhotoUpload,
        eventBindFormXxgOrderSubmitPicture: eventBindFormXxgOrderSubmitPicture
    })

    // 绑定事件
    function eventBind($wrap) {
        tcb.bindEvent($wrap[0], {
            // 关闭上传弹层
            '.js-trigger-close-upload-swipe': function (e) {
                e.preventDefault()
                window.XXG.ServiceUploadPicture.actionClose()
            },

            // 删图
            '.js-trigger-del-picture': function (e) {
                e.preventDefault()
                window.XXG.ServiceUploadPicture.actionDelPicture($(this))
            }
        })
    }

    // 绑定图片提交表单
    function eventBindFormXxgOrderSubmitPicture($form) {
        window.XXG.bindForm({
            $form: $form,
            before: function ($form, callback) {
                tcb.loadingStart()
                if (__validFormXxgOrderSubmitPicture($form)) {
                    callback()
                } else {
                    tcb.loadingDone()
                }
            },
            success: function () {
                var fnQueueSubmitSuccess = [].concat(window.XXG.ServiceUploadPicture.fnQueueSubmitSuccess || [],
                    function () {
                        setTimeout(function () {
                            tcb.loadingDone()
                            window.XXG.ServiceUploadPicture.actionClose()
                        }, 1500)
                    }
                )
                // 遍历执行下一步的函数队列
                !function executeFnQueue(fnQueue, fn_final) {
                    if (!fnQueue.length) {
                        return typeof fn_final === 'function' && fn_final()
                    }
                    var fn = fnQueue.shift()
                    // 如果事件队列中某一个函数不执行下一个的回调时退出执行队列
                    fn(function () {
                        executeFnQueue(fnQueue, fn_final)
                    }, function (isStop) {
                        !isStop && typeof fn_final === 'function' && fn_final()
                    })
                }(fnQueueSubmitSuccess)
            },
            error: function (res) {
                tcb.loadingDone()
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })
    }

    function __validFormXxgOrderSubmitPicture($form) {
        var flag = true

        var $uploadPingzheng = $form.find('.hidden-upload-pingzheng')
        $uploadPingzheng.each(function () {
            var $me = $(this)
            var upload_picture = tcb.trim($me.val())
            if ($me && $me.length && !upload_picture) {
                flag = false
                $('[data-for="' + $me.attr('name') + '"]').closest('.trigger-wrap').find('.trigger-upload-picture-cover').shine4Error()
            }
        })

        if (!flag) {
            $.dialog.toast('请上传所有的照片！', 2000)
        }

        return flag
    }

    // 拍照 并 上传图片
    function eventBindTakePhotoUpload($trigger) {
        new window.TakePhotoUpload({
            $trigger: $trigger,
            supportCustomCamera: true,
            callback_upload_before: function (inst, img, next) {
                img = typeof img === 'string' ? img : window.URL.createObjectURL(img)
                var $triggerCurrent = inst.$triggerCurrent
                var $processBar = $triggerCurrent.siblings('.fake-upload-progress')

                window.XXG.ServiceUploadPicture.actionSetUploadingPicture($triggerCurrent, img)
                window.XXG.ServiceUploadPicture.actionShowProcessBar($processBar)

                next()
            },
            callback_upload_success: function (inst, data) {
                var $triggerCurrent = inst.$triggerCurrent
                var $processBar = $triggerCurrent.siblings('.fake-upload-progress')
                if (data && !data.errno) {
                    window.XXG.ServiceUploadPicture.actionShowProcessBar100($processBar)
                    window.XXG.ServiceUploadPicture.actionSetUploadedPicture($triggerCurrent, data.result)
                } else {
                    window.XXG.ServiceUploadPicture.actionDelPicture($triggerCurrent.siblings('.js-trigger-del-picture'))
                    return $.dialog.toast((data && data.errmsg) || '系统错误')
                }
            },
            callback_upload_fail: function (inst, xhr, status, err) {
                var $triggerCurrent = inst.$triggerCurrent
                window.XXG.ServiceUploadPicture.actionDelPicture($triggerCurrent.siblings('.js-trigger-del-picture'))
                $.dialog.toast(xhr.statusText || '上传失败，请稍后再试')
            }
        })
    }
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_upload_picture/render.js` **/
// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceUploadPicture = tcb.mix(window.XXG.ServiceUploadPicture || {}, {
        render: render,
        renderSwipe: renderSwipe
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml
    var SwipeSection = window.Bang.SwipeSection

    function render(data, $target, addType) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        var $Wrap = renderHtml(
            htmlTpl('#JsMXxgOrderDetailServiceUploadPictureTpl', data),
            $target,
            addType || 'html'
        )
        var $blockModelInfo = $Wrap.find('.block-model-info'),
            $blockModelTakePicture = $Wrap.find('.block-model-take-picture'),
            $swipeBlockBtn = $Wrap.find('.swipe-block-btn')

        $blockModelTakePicture.css({
            height: $(window).height() - $Wrap.find('header').height() - $blockModelInfo.height() - $swipeBlockBtn.height()
        })
        return $Wrap
    }

    function renderSwipe(data) {
        var $swipe = SwipeSection.getSwipeSection('.swipe-page-service-upload-picture')
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailServiceUploadPictureTpl').html())),
            html_st = html_fn(data)
        SwipeSection.fillSwipeSection(html_st)

        var $swipeMainContent = $swipe.find('.swipe-main-content'),
            $blockModelInfo = $swipe.find('.block-model-info'),
            $blockModelTakePicture = $swipe.find('.block-model-take-picture'),
            $swipeBlockBtn = $swipe.find('.swipe-block-btn')

        $blockModelTakePicture.css({
            height: $(window).height() - $swipe.find('header').height() - $blockModelInfo.height() - $swipeBlockBtn.height()
        })
        return $swipe
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_shangmen_to_youji/setup.js` **/
// 纯回收上门转邮寄
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceShangmenToYouji = tcb.mix(window.XXG.ServiceShangmenToYouji || {}, {
        callbackConfirm: null,
        rootData: null,
        setup: setup,
        init: init
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServiceShangmenToYouji.rootData = options.data || {}
        window.XXG.ServiceShangmenToYouji.callbackConfirm = options.callbackConfirm || tcb.noop
        window.XXG.ServiceShangmenToYouji.eventBind()
    }

    function init(next, final) {
        next()
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_shangmen_to_youji/action.js` **/
// 纯回收上门转邮寄
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceShangmenToYouji = tcb.mix(window.XXG.ServiceShangmenToYouji || {}, {
        actionShowServiceShangmenToYoujiReasonList: actionShowServiceShangmenToYoujiReasonList,
        actionCloseServiceShangmenToYoujiReasonList: actionCloseServiceShangmenToYoujiReasonList,
        actionConfirmServiceShangmenToYouji: actionConfirmServiceShangmenToYouji,
        actionIsConverted: actionIsConverted
    })

    function actionShowServiceShangmenToYoujiReasonList() {
        var html_st = window.XXG.ServiceShangmenToYouji.htmlReasonList()
        var inst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
            withClose: true,
            fromBottom: true
        })
        // 绑定相应事件
        window.XXG.ServiceShangmenToYouji.eventBindSelectReason(inst.wrap)
    }

    function actionCloseServiceShangmenToYoujiReasonList() {
        window.XXG.BusinessCommon.helperCloseDialog()
    }

    function actionConfirmServiceShangmenToYouji() {
        if (tcb.supportLocalStorage()) {
            var storage = window.localStorage
            var rootData = window.XXG.ServiceShangmenToYouji.rootData
            var order_id = rootData.order && rootData.order.order_id
            if (order_id) {
                storage.setItem('service-shangmen-to-youji-' + order_id, 1)
            }
        }
    }

    function actionIsConverted() {
        if (tcb.supportLocalStorage()) {
            var storage = window.localStorage
            var rootData = window.XXG.ServiceShangmenToYouji.rootData
            var order_id = rootData.order && rootData.order.order_id
            if (order_id) {
                return !!storage.getItem('service-shangmen-to-youji-' + order_id, 1)
            }
        }
        return false
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_shangmen_to_youji/event.js` **/
// 纯回收上门转邮寄
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceShangmenToYouji = tcb.mix(window.XXG.ServiceShangmenToYouji || {}, {
        eventBind: eventBind,
        eventBindSelectReason: eventBindSelectReason
    })

    // 绑定事件
    function eventBind() {
        tcb.bindEvent({
            // 触发上门转邮寄选择框
            '.js-trigger-service-shangmen-to-youji': function (e) {
                e.preventDefault()
                window.XXG.BusinessCommon.helperCloseDialog()
                window.XXG.ServiceShangmenToYouji.actionShowServiceShangmenToYoujiReasonList()
            }
        })
    }

    function eventBindSelectReason($wrap) {
        $wrap.find('.js-trigger-service-shangmen-to-youji-select-reason').on('click', function (e) {
            e.preventDefault()
            var $me = $(this)
            $me.addClass('reason-item-selected').siblings('.reason-item-selected').removeClass('reason-item-selected')
        })
        $wrap.find('.js-trigger-service-shangmen-to-youji-submit').on('click', function (e) {
            e.preventDefault()
            var $me = $(this)
            var $reasonList = $me.closest('.service-shangmen-to-youji-reason-list')
            var $selected = $reasonList.find('.reason-item-selected')
            if ($selected && $selected.length) {
                window.XXG.ServiceShangmenToYouji.actionCloseServiceShangmenToYoujiReasonList()
                return window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                    tcb.loadingStart()
                    window.XXG.ServiceShangmenToYouji.actionConfirmServiceShangmenToYouji()
                    window.XXG.ServiceShangmenToYouji.callbackConfirm(function () {
                        setTimeout(function () {
                            tcb.loadingDone()
                        }, 1000)
                    })
                }, '告知客户，旧机将邮寄到检测中心<br>进行检测，检测后会有客服联系打款', {
                    noTitle: true,
                    // withoutClose: true,
                    options: {
                        btn: '已告知用户，将本订单转为邮寄'
                    }
                })
            }
            $reasonList.find('.js-trigger-service-shangmen-to-youji-select-reason').shine4Error()
            $.dialog.toast('请选择原因')
        })
    }
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_shangmen_to_youji/render.js` **/
// 纯回收上门转邮寄
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceShangmenToYouji = tcb.mix(window.XXG.ServiceShangmenToYouji || {}, {
        render: render,
        renderToYouji: renderToYouji,
        renderToYoujiStatus: renderToYoujiStatus,

        htmlReasonList: htmlReasonList,
        htmlServiceShangmenToYoujiStatus: htmlServiceShangmenToYoujiStatus
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml

    function render(data, $target, addType) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        var $Wrap = renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceShangmenToYoujiTpl', data),
            $target,
            addType || 'append'
        )
        return $Wrap
    }

    function renderToYouji(data, $target) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        data.order.status_name = '已到达'

        /********** 模板输出 **********/
        $.scrollTo({
            endY: 0
        })
        // 订单状态
        window.XXG.ServiceShangmenToYouji.renderToYoujiStatus(data, $target, 'html')
        // 物品信息
        window.XXG.BusinessSfFix.renderBusinessSfFixProduct(data, $target, 'append')
        // 订单信息
        window.XXG.BusinessCommon.renderBusinessCommonInfo(data, $target, 'append')
        // 输出核验码的条形码
        window.XXG.BusinessCommon.renderVerificationCodeBarcode()
        $target.show()

        /********** 事件绑定 **********/
        // 绑定copy
        window.XXG.BusinessCommon.eventBindCopy($target.find('.js-trigger-copy-the-text'))
    }

    function renderToYoujiStatus(data, $target, addType) {
        var $Status = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatus(data), $target, addType)

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusTitle(data), $Status)
        renderHtml(window.XXG.ServiceShangmenToYouji.htmlServiceShangmenToYoujiStatus(data), $Status)
        // 上门地址信息
        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusAddressInfo(data), $Status)

        return $Status
    }

    //=========== HTML输出 =============
    function htmlReasonList() {
        return htmlTpl('#JsXxgOrderDetailServiceShangmenToYoujiReasonListTpl')
    }

    // 订单状态---纯回收上门转邮寄
    function htmlServiceShangmenToYoujiStatus(data) {
        return htmlTpl('#JsXxgOrderDetailServiceShangmenToYoujiStatusTpl', data)
    }


}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_intro_app_detect/setup.js` **/
// 引导APP检测
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceIntroAppDetect = tcb.mix(window.XXG.ServiceIntroAppDetect || {}, {
        rootData: null,
        data: {
            type: ''
        },
        callbackBeforeSelect: null,
        setup: setup,
        init: init
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServiceIntroAppDetect.rootData = options.data || {}
        window.XXG.ServiceIntroAppDetect.callbackBeforeShowSelect = options.callbackBeforeShowSelect || callbackBeforeShowSelect
        window.XXG.ServiceIntroAppDetect.callbackBeforeTriggerScanQRCode = options.callbackBeforeTriggerScanQRCode || callbackBeforeTriggerScanQRCode
        window.XXG.ServiceIntroAppDetect.eventBind()
    }

    function init(next, final) {
        next()
    }

    function callbackBeforeShowSelect(next) {
        next()
    }

    function callbackBeforeTriggerScanQRCode(next) {
        next()
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_intro_app_detect/action.js` **/
// 引导APP检测
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceIntroAppDetect = tcb.mix(window.XXG.ServiceIntroAppDetect || {}, {
        actionTriggerScanQRCode: actionTriggerScanQRCode,
        actionShowSelect: actionShowSelect,
        actionShowDirectScan: actionShowDirectScan,
        actionShowIntro: actionShowIntro,
        actionCloseIntro: actionCloseIntro,
        actionPlaySoundSequence: actionPlaySoundSequence,
        actionPlaySound: actionPlaySound,
        actionStopSound: actionStopSound,
        actionPlaySoundStep1: actionPlaySoundStep1,
        actionPlaySoundStep3: actionPlaySoundStep3,
        actionPlayVideo: actionPlayVideo,
        actionStopVideo: actionStopVideo,
        actionDisposeVideo: actionDisposeVideo,
        actionPlayVideoStep2: actionPlayVideoStep2,
        actionShowScanGuide:actionShowScanGuide
    })
    var SwipeSection = window.Bang.SwipeSection
    var __soundSrc = [
        ['https://s5.ssl.qhres2.com/static/f3a763e9f5bd69f7.mp3'],// v5
        ['https://s5.ssl.qhres2.com/static/d925aea4c12bac43.mp3'],// v6
        ['https://s4.ssl.qhres2.com/static/b2ae25d7ffab080f.mp3'] // v7
    ]
    var __videoSrc = [
        [{
            src: 'https://s0.ssl.qhres2.com/static/86b2403a6c3f8151.mp4',
            type: 'video/mp4'
        }]
    ]
    var __videoInstPlaying = null

    function actionTriggerScanQRCode($trigger) {
        var rootData = window.XXG.BusinessCommon.rootData
        var order = rootData.order
        if (order.status == 11) {
            $trigger
                .attr('data-order-id', order.order_id)
                .attr('data-now-status', '11')
                .attr('data-next-status', '12')
        }
        window.XXG.BusinessCommon.actionScanQRCode($trigger)
    }

    // 引导APP检测--方式选择
    function actionShowSelect() {
        var html_st = window.XXG.ServiceIntroAppDetect.htmlServiceIntroAppDetectSelect()
        window.XXG.BusinessCommon.helperShowDialog(html_st, {
            className: 'dialog-service-intro-app-detect-select'
        })
    }

    // 引导APP检测--直接扫码
    function actionShowDirectScan() {
        var html_st = window.XXG.ServiceIntroAppDetect.htmlServiceIntroAppDetectDirectScan()
        window.XXG.BusinessCommon.helperShowDialog(html_st, {
            withClose: false,
            className: 'dialog-service-intro-app-detect-direct-scan'
        })
    }

    function actionShowIntro() {
        var $swipe = SwipeSection.getSwipeSection('.swipe-page-service-intro-app-detect')
        var type = window.XXG.ServiceIntroAppDetect.data.type
        var html_st = window.XXG.ServiceIntroAppDetect.htmlServiceIntroAppDetectStep(type)
        SwipeSection.fillSwipeSection(html_st)
        SwipeSection.doLeftSwipeSection(0, function () {
            if (type === 'mini') {
                window.XXG.ServiceIntroAppDetect.actionPlaySoundStep1()
            }
        })
        // 绑定相关事件
        window.XXG.ServiceIntroAppDetect.eventBindStep($swipe)
    }
    //修修哥如何扫码下载引导页
    function actionShowScanGuide() {
        // var $swipe = SwipeSection.getSwipeSection('.swipe-page-service-intro-app-detect')
        var $swipe = SwipeSection.getSwipeSection('.swipe-page-service-intro-app-detect-scan-step-guide')
        var type = window.XXG.ServiceIntroAppDetect.data.type
        var html_st = window.XXG.ServiceIntroAppDetect.htmlServiceIntroAppScanStepGuide(type)
        SwipeSection.fillSwipeSection(html_st)
        SwipeSection.doLeftSwipeSection(0, function () {
        })
        // 绑定相关事件
        window.XXG.ServiceIntroAppDetect.eventBindStep($swipe)
    }

    function actionCloseIntro(callback, flag_static) {
        var type = window.XXG.ServiceIntroAppDetect.data.type
        if (type === 'mini') {
            window.XXG.ServiceIntroAppDetect.actionStopSound()
            window.XXG.ServiceIntroAppDetect.actionDisposeVideo()
        }
        SwipeSection.backLeftSwipeSection(callback, flag_static)
    }

    function actionPlayVideo(src) {
        var player = __videoInstPlaying
        if (player) {
            player.src(src)
            player.load()
            player.play()
            return
        }
        player = videojs('ServiceIntroAppDetectStep2Video', {
            sources: src,
            preload: 'auto',
            controls: true,
            bigPlayButton: false,
            controlBar: {
                volumePanel: {
                    // 非行内音量（即为：纵向）
                    inline: false,
                    volumeControl: {
                        vertical: true
                    }
                },
                currentTimeDisplay: false,
                durationDisplay: false,
                progressControl: {
                    seekBar: {
                        loadProgressBar: false,
                        mouseTimeDisplay: false,
                        playProgressBar: true
                    }
                },
                remainingTimeDisplay: false,
                customControlSpacer: false,
                pictureInPictureToggle: false,
                fullscreenToggle: true
            }
        }, function () {
            this.load()
            this.play()
        })
        __videoInstPlaying = player
    }

    function actionStopVideo() {
        if (__videoInstPlaying) {
            __videoInstPlaying.reset()
        }
    }

    function actionDisposeVideo() {
        if (__videoInstPlaying) {
            __videoInstPlaying.dispose()
            __videoInstPlaying = null
        }
    }

    function actionPlayVideoStep2() {
        window.XXG.ServiceIntroAppDetect.actionPlayVideo(__videoSrc[0])
    }

    function actionPlaySoundStep1() {
        window.XXG.ServiceIntroAppDetect.actionPlaySoundSequence([__soundSrc[0], __soundSrc[1]], 5000)
    }

    function actionPlaySoundStep3() {
        window.XXG.ServiceIntroAppDetect.actionPlaySound(__soundSrc[2])
    }

    function actionPlaySoundSequence(srcArr, delay, callback) {
        var optionsQueue = []
        tcb.each(srcArr, function (src) {
            optionsQueue.push({
                src: src,
                repeat: 2,
                interval: 3000,
                delay: delay
            })
        })
        window.XXG.BusinessCommon.soundPlaySequence(optionsQueue, callback)
    }

    function actionPlaySound(src, callback) {
        window.XXG.BusinessCommon.soundPlay({
            src: src,
            repeat: 2,
            interval: 3000,
            callback: callback
        })
    }

    function actionStopSound() {
        window.XXG.BusinessCommon.soundStop()
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_intro_app_detect/event.js` **/
// 引导APP检测
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceIntroAppDetect = tcb.mix(window.XXG.ServiceIntroAppDetect || {}, {
        eventBind: eventBind,

        eventBindStep: eventBindStep
    })

    // 绑定事件
    function eventBind() {
        tcb.bindEvent({
            // 触发引导APP检测--方式选择
            '.js-trigger-service-intro-app-detect-select': function (e) {
                e.preventDefault()
                window.XXG.ServiceIntroAppDetect.callbackBeforeShowSelect(function () {
                    window.XXG.ServiceIntroAppDetect.actionShowSelect()
                })
            },
            // // 触发引导APP检测--帮验宝pad验机后扫码
            // '.js-trigger-service-intro-app-detect-pad-detect-scan': function (e) {
            //     e.preventDefault()
            //     window.XXG.BusinessCommon.helperCloseDialog()
            //
            //     var $me = $(this)
            //     window.XXG.ServiceIntroAppDetect.callbackBeforeTriggerScanQRCode(function () {
            //         window.XXG.ServiceIntroAppDetect.actionTriggerScanQRCode($me)
            //     })
            // },
            // 触发引导APP检测
            '.js-trigger-service-intro-app-detect': function (e) {
                e.preventDefault()
                window.XXG.BusinessCommon.helperCloseDialog()

                var $me = $(this)
                var type = $me.attr('data-type')
                window.XXG.ServiceIntroAppDetect.data.type = type
                window.XXG.ServiceIntroAppDetect.actionShowIntro()
            },
            // 扫码
            '.js-trigger-service-intro-app-scan': function (e) {
                e.preventDefault()

                var $me = $(this)
                var not_intro = $me.attr('data-not-intro')
                if (not_intro) {
                    window.XXG.BusinessCommon.helperCloseDialog()
                    window.XXG.ServiceIntroAppDetect.callbackBeforeTriggerScanQRCode(function () {
                        window.XXG.ServiceIntroAppDetect.actionTriggerScanQRCode($me)
                    })
                } else {
                    window.XXG.ServiceIntroAppDetect.actionCloseIntro(function () {
                        window.XXG.ServiceIntroAppDetect.callbackBeforeTriggerScanQRCode(function () {
                            window.XXG.ServiceIntroAppDetect.actionTriggerScanQRCode($me)
                        })
                    }, true)
                }
            }

        })
    }

    function eventBindStep($Wrap) {
        tcb.bindEvent($Wrap[0], {
            // 关闭滑层
            '.js-trigger-close-swipe': function (e) {
                e.preventDefault()
                window.XXG.ServiceIntroAppDetect.actionCloseIntro()
            },
            // 下一步
            '.js-trigger-service-intro-app-step-next': function (e) {
                e.preventDefault()
                var $me = $(this)
                var step = $me.attr('data-step')
                var $step = $me.closest('.step')
                $step.addClass('hide').next('.hide').removeClass('hide')

                var type = window.XXG.ServiceIntroAppDetect.data.type
                if (type === 'mini') {
                    if (step == 1) {
                        window.XXG.ServiceIntroAppDetect.actionStopSound()
                        window.XXG.ServiceIntroAppDetect.actionPlayVideoStep2()
                    } else if (step == 2) {
                        window.XXG.ServiceIntroAppDetect.actionStopVideo()
                        // 播放第3步声音
                        window.XXG.ServiceIntroAppDetect.actionPlaySoundStep3()
                    }
                }
            },
            // 上一步
            '.js-trigger-service-intro-app-step-prev': function (e) {
                e.preventDefault()
                var $me = $(this)
                var step = $me.attr('data-step')
                var $step = $me.closest('.step')
                $step.addClass('hide').prev('.hide').removeClass('hide')

                var type = window.XXG.ServiceIntroAppDetect.data.type
                if (type === 'mini') {
                    if (step == 3) {
                        window.XXG.ServiceIntroAppDetect.actionStopSound()
                        window.XXG.ServiceIntroAppDetect.actionPlayVideoStep2()
                    } else if (step == 2) {
                        window.XXG.ServiceIntroAppDetect.actionStopVideo()
                        // 播放第1步声音
                        window.XXG.ServiceIntroAppDetect.actionPlaySoundStep1()
                    }
                }
            },
            //    跳转扫码教程
            '.js-show-course-btn': function (e) {
                e.preventDefault()
                window.XXG.ServiceIntroAppDetect.actionShowScanGuide()
            }


        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_intro_app_detect/render.js` **/
// 引导APP检测
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceIntroAppDetect = tcb.mix(window.XXG.ServiceIntroAppDetect || {}, {
        render: render,

        htmlServiceIntroAppDetectSelect: htmlServiceIntroAppDetectSelect,
        htmlServiceIntroAppDetectDirectScan: htmlServiceIntroAppDetectDirectScan,
        htmlServiceIntroAppDetectStep: htmlServiceIntroAppDetectStep,
        htmlServiceIntroAppScanStepGuide:htmlServiceIntroAppScanStepGuide
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml

    function render(data, $target, addType) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        var $Wrap = renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceIntroAppDetectTpl', data),
            $target,
            addType || 'append'
        )
        return $Wrap
    }

    //=========== HTML输出 =============

    // 引导APP检测--方式选择
    function htmlServiceIntroAppDetectSelect() {
        var data = window.XXG.ServiceIntroAppDetect.rootData
        var isIphone = data.isIphone
        var isNotebook = data.isNotebook
        // 非一站式 && 纯回收，才支持上门转邮寄
        var isSupportShangmenToYouji = !data.isOneStopOrder && data.sfFixData.__recycle
        return htmlTpl('#JsXxgOrderDetailServiceIntroAppDetectSelectTpl', {
            isIphone: isIphone,
            isNotebook: isNotebook,
            isSupportShangmenToYouji: isSupportShangmenToYouji
        })
    }

    // 引导APP检测--直接扫码
    function htmlServiceIntroAppDetectDirectScan() {
        var data = window.XXG.ServiceIntroAppDetect.rootData
        var isIphone = data.isIphone
        var isNotebook = data.isNotebook
        return htmlTpl('#JsXxgOrderDetailServiceIntroAppDetectDirectScanTpl', {
            isIphone: isIphone,
            isNotebook: isNotebook
        })
    }

    // 引导APP检测--步骤引导
    function htmlServiceIntroAppDetectStep(type) {
        var data = window.XXG.ServiceIntroAppDetect.rootData
        var isIphone = data.isIphone
        var isMac = data.order
            && data.order.hs_model
            && data.order.hs_model.model
            && data.order.hs_model.model.model_name
            && RegExp(/.*mac.*/ig).test(data.order.hs_model.model.model_name || '')
        return htmlTpl('#JsXxgOrderDetailServiceIntroAppDetectStepTpl', {
            isIphone: isIphone,
            isMac: isMac,
            type: type
        })
    }

    // 引导APP检测--跳转到如何扫码引导
    function htmlServiceIntroAppScanStepGuide(type) {
        var data = window.XXG.ServiceIntroAppDetect.rootData
        var isIphone = data.isIphone
        var isMac = data.order
            && data.order.hs_model
            && data.order.hs_model.model
            && data.order.hs_model.model.model_name
            && RegExp(/.*mac.*/ig).test(data.order.hs_model.model.model_name || '')
        return htmlTpl('#JsXxgOrderDetailServiceIntroAppScanStepGuideTpl', {
            isIphone: isIphone,
            isMac: isMac,
            type: type
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_cant_scan_buy_new/setup.js` **/
// 无法扫码检测旧机，直接购买新机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceCantScanBuyNew = tcb.mix(window.XXG.ServiceCantScanBuyNew || {}, {
        callbackConfirm: null,
        rootData: null,
        setup: setup,
        init: init
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServiceCantScanBuyNew.rootData = options.data || {}
        window.XXG.ServiceCantScanBuyNew.callbackConfirm = options.callbackConfirm || tcb.noop
        window.XXG.ServiceCantScanBuyNew.eventBind(options.data)
    }

    function init(next, final) {
        next()
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_cant_scan_buy_new/action.js` **/
// 无法扫码检测旧机，直接购买新机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceCantScanBuyNew = tcb.mix(window.XXG.ServiceCantScanBuyNew || {}, {
        actionCantScanBuyNew: actionCantScanBuyNew
    })

    // 无法检测旧机，直接购买新机
    function actionCantScanBuyNew(data) {
        var order = data.order || {}
        var status = order.status
        var order_id = order.order_id
        window.XXG.BusinessCommon.helperShowConfirm('用户明确表示直接购买新机么？', {
            noTitle: true,
            options: {
                className: 'dialog-confirm-cant-scan-buy-new',
                textConfirm: '已明确表示购买新机',
                lock: 10
            },
            callbackConfirm: function () {
                if (status == 11) {
                    var $btn = $('<a href="#" data-order-id="' + order_id + '" data-now-status="11" data-next-status="12"></a>')
                    tcb.loadingStart()
                    window.XXG.BusinessCommon.apiActionBeforeArrive($btn,
                        function () {
                            tcb.loadingDone()
                            order.status = 12
                            window.XXG.ServiceCantScanBuyNew.callbackConfirm &&
                            window.XXG.ServiceCantScanBuyNew.callbackConfirm()
                        },
                        function () {
                            tcb.loadingDone()
                        }
                    )
                } else if (status == 12) {
                    window.XXG.ServiceCantScanBuyNew.callbackConfirm &&
                    window.XXG.ServiceCantScanBuyNew.callbackConfirm()
                } else {
                    $.dialog.toast('订单状态异常')
                }
                // window.XXG.redirect()
            }
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_cant_scan_buy_new/event.js` **/
// 无法扫码检测旧机，直接购买新机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceCantScanBuyNew = tcb.mix(window.XXG.ServiceCantScanBuyNew || {}, {
        eventBind: eventBind
    })

    // 绑定事件
    function eventBind(data) {
        tcb.bindEvent({
            // 触发直接购买新机
            '.js-trigger-service-cant-scan-buy-new': function (e) {
                e.preventDefault()
                window.XXG.ServiceCantScanBuyNew.actionCantScanBuyNew(data)
            }
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_cant_scan_buy_new/render.js` **/
// 无法扫码检测旧机，直接购买新机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceCantScanBuyNew = tcb.mix(window.XXG.ServiceCantScanBuyNew || {}, {
        render: render
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml

    function render(data, $target, addType) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        var $Wrap = renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceCantScanBuyNewTpl', data),
            $target,
            addType || 'append'
        )
        return $Wrap
    }

    //=========== HTML输出 =============

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_privacy_protocol_sign/setup.js` **/
// 用户隐私协议
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivacyProtocolSign = tcb.mix(window.XXG.ServicePrivacyProtocolSign || {}, {
        rootData: null,
        data: {
            isRead: false,
            signature: ''
        },
        $Wrap: null,
        callbackConfirmAgree: null,
        setup: setup,
        init: init
    })

    // 显示拍照上传页
    function setup(options) {
        options = options || {}
        var rootData = options.data || {}
        window.XXG.ServicePrivacyProtocolSign.rootData = rootData
        window.XXG.ServicePrivacyProtocolSign.callbackConfirmAgree = options.callbackConfirmAgree || tcb.noop
    }

    function init(next, final) {
        next()
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_privacy_protocol_sign/action.js` **/
// 用户隐私协议
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivacyProtocolSign = tcb.mix(window.XXG.ServicePrivacyProtocolSign || {}, {
        actionConfirmUserCleanDevice: actionConfirmUserCleanDevice,
        actionShowPrivacyProtocol: actionShowPrivacyProtocol,
        actionSetPrivacyProtocolReadCountdown: actionSetPrivacyProtocolReadCountdown,
        actionClosePrivacyProtocol: actionClosePrivacyProtocol,
        actionPrivacyProtocolIsToEnd: actionPrivacyProtocolIsToEnd,
        actionReleaseConfirmAgreeBtn: actionReleaseConfirmAgreeBtn,
        actionConfirmAgreePrivacyProtocol: actionConfirmAgreePrivacyProtocol,
        actionSignaturePadActive: actionSignaturePadActive,
        actionSignaturePadClose: actionSignaturePadClose,
        actionSignatureClear: actionSignatureClear,
        actionSignatureConfirm: actionSignatureConfirm
    })
    var SwipeSection = window.Bang.SwipeSection
    var instSignaturePad
    var __soundSrc = [
        ['https://s0.ssl.qhres2.com/static/35709c0402637b92.mp3']// v1
    ]

    // 询问用户是否已清空手机
    function actionConfirmUserCleanDevice() {
        window.XXG.BusinessCommon.soundPlay({
            src: __soundSrc[0],
            repeat: 2,
            interval: 500
        })
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            window.XXG.BusinessCommon.soundStop()
            window.XXG.ServicePrivacyProtocolSign.actionShowPrivacyProtocol()
        }, '询问客户是否已清空手机？', {
            noTitle: true,
            withoutClose: true,
            options: {
                btn: '我已询问'
            }
        })
    }

    // 显示隐私协议签署界面
    function actionShowPrivacyProtocol() {
        tcb.loadingStart()
        window.XXG.ServicePrivacyProtocolSign.apiGetPrivacyProtocol(function (result) {
            tcb.loadingDone()
            var $swipe = SwipeSection.getSwipeSection('.swipe-page-service-privacy-protocol-sign')
            var html_st = window.XXG.ServicePrivacyProtocolSign.htmlServicePrivacyProtocolSign(result)
            SwipeSection.fillSwipeSection(html_st)
            SwipeSection.doLeftSwipeSection()
            window.XXG.ServicePrivacyProtocolSign.$Wrap = $swipe
            window.XXG.ServicePrivacyProtocolSign.data.isRead = false

            if (window.XXG.ServicePrivacyProtocolSign.actionPrivacyProtocolIsToEnd()) {
                window.XXG.ServicePrivacyProtocolSign.actionReleaseConfirmAgreeBtn()
            } else {
                window.XXG.ServicePrivacyProtocolSign.actionSetPrivacyProtocolReadCountdown()
            }
            window.XXG.ServicePrivacyProtocolSign.eventBind()
            window.XXG.ServicePrivacyProtocolSign.eventBindPrivacyProtocolScroll()
        }, function () {
            tcb.loadingDone()
        })
    }

    // 设置隐私协议阅读倒计时
    function actionSetPrivacyProtocolReadCountdown() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $btn = $Wrap.find('.js-trigger-service-privacy-protocol-sign-confirm')
        var text_default = $btn.html()
        $btn.html('请仔细阅读，5秒')

        var delay = 5
        tcb.distimeAnim(delay, function (time) {
            $btn.html('请仔细阅读，' + time + '秒')
            if (time <= 0) {
                $btn.html(text_default)
                window.XXG.ServicePrivacyProtocolSign.data.isRead = true
                window.XXG.ServicePrivacyProtocolSign.actionReleaseConfirmAgreeBtn()
            }
        })
    }

    // 关闭隐私协议签署界面
    function actionClosePrivacyProtocol() {
        instSignaturePad = null
        window.XXG.ServicePrivacyProtocolSign.$Wrap = null

        SwipeSection.backLeftSwipeSection()
    }

    // 隐私协议是否已经滚动到底部
    function actionPrivacyProtocolIsToEnd() {
        var isRead = !!window.XXG.ServicePrivacyProtocolSign.data.isRead
        if (isRead) {
            return true
        }
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $cont = $Wrap.find('.block-privacy-protocol .cont')
        var $contInner = $Wrap.find('.block-privacy-protocol .cont-inner')
        if ($contInner.height() <= $cont.height()) {
            isRead = true
        }
        window.XXG.ServicePrivacyProtocolSign.data.isRead = isRead

        return isRead
    }

    // 确认同意隐私协议
    function actionConfirmAgreePrivacyProtocol(version) {
        var rootData = window.XXG.ServicePrivacyProtocolSign.rootData
        var data = {
            order_id: rootData.order.order_id,
            version: version,
            signature: window.XXG.ServicePrivacyProtocolSign.data.signature
        }
        tcb.loadingStart()
        // 保存签名
        window.XXG.ServicePrivacyProtocolSign.apiAgreePrivacyProtocol(data, function () {
            tcb.loadingDone()
            // 设置已经签约隐私协议
            window.XXG.ServicePrivacyProtocolSign.rootData.servicePrivacyProtocol.isSigned = true
            // 关闭隐私协议界面
            window.XXG.ServicePrivacyProtocolSign.actionClosePrivacyProtocol()
            // 确认同意隐私协议回调函数
            window.XXG.ServicePrivacyProtocolSign.callbackConfirmAgree()
        }, function () {
            tcb.loadingDone()
        })
    }

    // 激活签名板
    function actionSignaturePadActive() {
        __openCustomerSignaturePad()
    }

    // 激活签名板
    function actionSignaturePadClose() {
        __closeCustomerSignaturePad()
    }

    // 清除签名
    function actionSignatureClear() {
        __clearSignature()
    }

    // 确认签名
    function actionSignatureConfirm() {
        __confirmSignature()
    }

    // 符合条件的情况下释放同意隐私协议按钮的锁定状态
    function actionReleaseConfirmAgreeBtn() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $btn = $Wrap.find('.js-trigger-service-privacy-protocol-sign-confirm')
        if (__validSignAndRead(true)) {
            $btn.removeClass('btn-disabled')
        } else {
            $btn.addClass('btn-disabled')
        }
    }

    function __openCustomerSignaturePad() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $PadWrap = $Wrap.find('.customer-signature-pad-wrap'),
            $BtnRow = $PadWrap.find('.customer-signature-pad-btn'),
            $Pad = $PadWrap.find('.customer-signature-pad'),
            $win = tcb.getWin(),
            w_width = $win.width(),
            w_height = $win.height()

        $PadWrap.css({
            display: 'block',
            width: w_width + 'px',
            height: w_height + 'px'
        })
        $Pad.css({
            width: (w_width - $BtnRow.height()) + 'px',
            height: w_height + 'px'
        })
        $BtnRow.css({
            width: w_height + 'px',
            right: '-' + (w_height - $BtnRow.height()) / 2 + 'px'
        })

        if (!instSignaturePad) {
            instSignaturePad = window.Bang.SignaturePad({
                canvas: $Wrap.find('.customer-signature-pad-canvas'),
                canvasConfig: {
                    penColor: '#000',
                    penSize: 3,
                    backgroundColor: '#cbcbcb'
                },
                flagAutoInit: true
            })
        }

        $BtnRow.css({
            transform: 'rotate(-90deg)'
        })
        tcb.js2AndroidSetDialogState(true, function () {
            __closeCustomerSignaturePad()
        })
    }

    function __closeCustomerSignaturePad() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $PadWrap = $Wrap.find('.customer-signature-pad-wrap'),
            $BtnRow = $PadWrap.find('.customer-signature-pad-btn')

        $PadWrap.hide()
        $BtnRow.css({
            transform: 'none'
        })
        tcb.js2AndroidSetDialogState(false)
        window.XXG.ServicePrivacyProtocolSign.actionReleaseConfirmAgreeBtn()
    }

    function __rotateImg(img, deg, fn) {

        tcb.imageOnload(img, function (imgObj) {

            var w = imgObj.naturalHeight,
                h = imgObj.naturalWidth

            var canvas = __createCanvas(w, h),
                ctx = canvas.getContext('2d')

            ctx.save()
            ctx.translate(w, 0)
            ctx.rotate(deg * Math.PI / 180)
            ctx.drawImage(imgObj, 0, 0, h, w)
            ctx.restore()

            var newImg = ctx.canvas.toDataURL('image/jpeg')

            typeof fn === 'function' && fn(newImg)
        })
    }

    function __createCanvas(w, h) {
        var canvas = document.createElement('canvas')

        canvas.width = w
        canvas.height = h
        return canvas
    }

    function __validSignAndRead(silent) {
        var signature = window.XXG.ServicePrivacyProtocolSign.data.signature
        var flag = true
        var msg = ''
        if (!msg && !window.XXG.ServicePrivacyProtocolSign.actionPrivacyProtocolIsToEnd()) {
            flag = false
            msg = '请阅读完成隐私协议，并将协议滑动到底部'
        }
        if (!msg && !signature) {
            flag = false
            msg = '请先签名确认'
        }

        if (msg && !silent) {
            $.dialog.toast(msg)
        }
        return flag
    }


    function __clearSignature() {
        if (instSignaturePad && instSignaturePad.clearAll) {
            instSignaturePad.clearAll()

            var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
            var $trigger = $Wrap.find('.js-trigger-service-privacy-protocol-sign-signature-pad-active')
            $trigger.css({
                fontSize: '',
                backgroundImage: ''
            })

            window.XXG.ServicePrivacyProtocolSign.data.signature = ''
        }
    }

    function __confirmSignature() {
        if (!instSignaturePad) {
            return
        }
        var pointGroups = instSignaturePad.getPointGroups()
        if (!(pointGroups && pointGroups[0] && pointGroups[0][0])) {
            return $.dialog.toast('请先签名').css({
                transform: 'rotate(-90deg)'
            })
        }

        var dataUrl = instSignaturePad.toDataUrl('image/jpeg')

        __rotateImg(dataUrl, 90, function (img) {
            var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
            var $trigger = $Wrap.find('.js-trigger-service-privacy-protocol-sign-signature-pad-active')
            $trigger.css({
                fontSize: 0,
                backgroundImage: 'url(' + img + ')'
            })
        })

        window.XXG.ServicePrivacyProtocolSign.data.signature = JSON.stringify(instSignaturePad.getStripPointGroups())

        __closeCustomerSignaturePad()
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_privacy_protocol_sign/api.js` **/
// 用户隐私协议
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivacyProtocolSign = tcb.mix(window.XXG.ServicePrivacyProtocolSign || {}, {
        apiGetPrivacyProtocol: apiGetPrivacyProtocol,
        apiAgreePrivacyProtocol: apiAgreePrivacyProtocol
    })

    /**
     * 获取隐私协议数据
     * @param callback
     *      @return
     *          {
     *              version
     *              content
     *          }
     * @param fail
     * @param options
     */
    function apiGetPrivacyProtocol(callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Privacy/getAgreementInfo'),
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 同意隐私协议
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *          version	版本号	Y	integer	1.1接口中返回的 version
     *          signature	签字内容	Y	string	签字坐标内容
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiAgreePrivacyProtocol(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Privacy/doAgree'),
            data: data,
            type: 'POST',
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail(err)
            }
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_privacy_protocol_sign/event.js` **/
// 用户隐私协议
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivacyProtocolSign = tcb.mix(window.XXG.ServicePrivacyProtocolSign || {}, {
        eventBind: eventBind,
        eventBindPrivacyProtocolScroll: eventBindPrivacyProtocolScroll
    })

    // 绑定事件
    function eventBind() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        tcb.bindEvent($Wrap[0], {
            // 关闭弹层
            '.js-trigger-service-privacy-protocol-sign-close': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivacyProtocolSign.actionClosePrivacyProtocol()
            },

            // 签名并且确认同意隐私协议
            '.js-trigger-service-privacy-protocol-sign-confirm': function (e) {
                e.preventDefault()
                var $me = $(this)
                if ($me.hasClass('btn-disabled')) {
                    return
                }

                var version = $me.attr('data-version')
                window.XXG.ServicePrivacyProtocolSign.actionConfirmAgreePrivacyProtocol(version)
            },

            // 激活签名板
            '.js-trigger-service-privacy-protocol-sign-signature-pad-active': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivacyProtocolSign.actionSignaturePadActive()
            },
            // 关闭签名板
            '.js-trigger-service-privacy-protocol-sign-signature-pad-close': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivacyProtocolSign.actionSignaturePadClose()
            },
            // 清除签名
            '.js-trigger-service-privacy-protocol-sign-signature-clear': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivacyProtocolSign.actionSignatureClear()
            },
            // 确认签名
            '.js-trigger-service-privacy-protocol-sign-signature-confirm': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivacyProtocolSign.actionSignatureConfirm()
            }
        })
    }

    function eventBindPrivacyProtocolScroll() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $cont = $Wrap.find('.block-privacy-protocol .cont')
        $cont.on('scroll', function (e) {
            if (window.XXG.ServicePrivacyProtocolSign.actionPrivacyProtocolIsToEnd()) {
                return
            }
            var $cont = $(this)
            var $end = $cont.find('.block-privacy-protocol-end')

            var contOffset = $cont.offset()
            var endOffset = $end.offset()
            if ((endOffset.top - contOffset.top) <= contOffset.height) {
                window.XXG.ServicePrivacyProtocolSign.data.isRead = true
                window.XXG.ServicePrivacyProtocolSign.actionReleaseConfirmAgreeBtn()
            }
        })
    }
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_privacy_protocol_sign/render.js` **/
// 用户隐私协议
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivacyProtocolSign = tcb.mix(window.XXG.ServicePrivacyProtocolSign || {}, {
        // render: render,

        htmlServicePrivacyProtocolSign: htmlServicePrivacyProtocolSign
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml

    function render(data, $target, addType) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        var $Wrap = renderHtml(
            htmlTpl('#JsMXxgOrderDetailServicePrivacyProtocolSignTpl', data),
            $target,
            addType || 'html'
        )

        return $Wrap
    }

    //=========== HTML输出 =============

    // 签约隐私协议
    function htmlServicePrivacyProtocolSign(data) {
        data = data || {}
        var rootData = window.XXG.ServicePrivateData.rootData
        rootData.servicePrivacyProtocol.version = data.version
        rootData.servicePrivacyProtocol.content = data.content
        return htmlTpl('#JsMXxgOrderDetailServicePrivacyProtocolSignTpl', rootData)
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_private_data/setup.js` **/
// 隐私数据处理
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivateData = tcb.mix(window.XXG.ServicePrivateData || {}, {
        rootData: null,
        data: {
            type: ''
        },
        setup: setup,
        init: init
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServicePrivateData.rootData = options.data || {}
        window.XXG.ServicePrivateData.callbackScanReassessAgain = options.callbackScanReassessAgain || tcb.noop
        window.XXG.ServicePrivateData.eventBind()
    }

    function init(next, final) {
        next()
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_private_data/action.js` **/
// 隐私数据处理
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivateData = tcb.mix(window.XXG.ServicePrivateData || {}, {
        actionTriggerOldDeviceCancel: actionTriggerOldDeviceCancel,
        actionTriggerNoMigrateFlowRecycle: actionTriggerNoMigrateFlowRecycle,
        actionTriggerTradeIn: actionTriggerTradeIn,
        actionTriggerTradeInAgain: actionTriggerTradeInAgain,
        // actionConfirmRecycle: actionConfirmRecycle,
        // actionConfirmTradeIn: actionConfirmTradeIn,
        actionTriggerScanReassessAgain: actionTriggerScanReassessAgain,
        actionTriggerCloseOneStopOrder: actionTriggerCloseOneStopOrder,
        actionTriggerMigrate: actionTriggerMigrate,
        actionConfirmMigrate: actionConfirmMigrate,
        actionTriggerCleaned: actionTriggerCleaned,
        actionConfirmCleaned: actionConfirmCleaned,
        actionTriggerMigrateAndCleaned: actionTriggerMigrateAndCleaned,
        actionConfirmMigrateAndCleaned: actionConfirmMigrateAndCleaned,
        actionTriggerAlipayWithholding: actionTriggerAlipayWithholding,
        actionShowAlipayWithholding: __actionShowAlipayWithholding,
        actionShowMigrateFullPay: actionShowMigrateFullPay,
        actionCheckPayStatus: actionCheckPayStatus,
        actionDeliveredNewDeviceSoundPlay: actionDeliveredNewDeviceSoundPlay
    })
    var __soundSrc = [
        ['https://s2.ssl.qhres2.com/static/43acd60a191d35da.mp3'],// v2
        ['https://s0.ssl.qhres2.com/static/8b265c58fdddc771.mp3'],// v5
        ['https://s2.ssl.qhres2.com/static/66a46fc230f1cefd.mp3'],// v6
        ['https://s5.ssl.qhres2.com/static/5243bb96d5dfcbeb.mp3'] // v7
    ]

    // 触发旧机取消
    function actionTriggerOldDeviceCancel($btn) {
        var rootData = window.XXG.ServicePrivateData.rootData
        window.XXG.BusinessCommon.actionShowCityManagerInfo($btn, rootData, __actionTriggerOldDeviceCancel)
    }
    function __actionTriggerOldDeviceCancel($trigger) {
        if ($trigger.attr('data-locking')) {
            return
        }
        $trigger.attr('data-locking', 1)
        var rootData = window.XXG.ServicePrivateData.rootData
        var sfFixData = rootData.sfFixData
        var isOneStopOrder = rootData.isOneStopOrder
        var act
        if (isOneStopOrder) {
            // 丰修一站式
            act = 'trigger-sf-fix-suning-one-stop-full-pay'
        } else if (sfFixData.__recycle) {
            // 丰修纯回收
            act = 'sf-fix-cancel-order'
        }
        if (act) {
            $trigger
                .attr('data-act', act)
                .attr('data-locking', '')
            $trigger.trigger('click')
            return
        }
        // @TODO 其他合作方可能的取消订单方式
        // var html_fn = $.tmpl($.trim($('#JsMXxgOrderDetailServicePrivateDataOldDeviceCancelTpl').html())),
        //     html_st = html_fn(rootData)
        // window.XXG.BusinessCommon.helperShowDialog(html_st, {
        //     withClose: true,
        //     fromBottom: true,
        //     onClose: function () {
        //         $trigger.attr('data-locking', '')
        //     }
        // })
    }

    // 有隐私数据，非导数流程，触发回收（包括纯回收 或者 以旧换新，也包括一站式换新）
    function actionTriggerNoMigrateFlowRecycle() {
        var rootData = window.XXG.ServicePrivateData.rootData
        if (rootData.isOneStopOrder) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-suning-one-stop-confirm-trade-in')
        } else if (rootData.sfFixData.__re_new) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm-trade-in')
        } else {
            // window.XXG.ServicePrivateData.actionTriggerCleaned('sf-fix-confirm')
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm')
        }
    }

    // 触发以旧换新
    function actionTriggerTradeIn() {
        var rootData = window.XXG.ServicePrivateData.rootData
        if (rootData.servicePrivateData.migrateFlag == 2) {
            // 用户已经选择了无需迁移隐私数据
            if (rootData.isOneStopOrder) {
                window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-suning-one-stop-confirm-trade-in')
            } else if (rootData.sfFixData.__re_new) {
                window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm-trade-in')
            } else {
                window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm')
            }
            return
        } else if (rootData.servicePrivateData.migrateFlag == 1) {
            // 用户已经选择了需要迁移隐私数据
            window.XXG.ServicePrivateData.actionTriggerAlipayWithholding(true)
            return
        }

        // 以下为：用户还未选择过是否需要迁移隐私数据

        if (rootData.isOneStopOrder) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-suning-one-stop-confirm-trade-in')
        } else if (rootData.sfFixData.__re_new) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm-trade-in')
        } else {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm')
        }
    }

    // // 触发以旧换新
    // function actionTriggerTradeIn() {
    //     var rootData = window.XXG.ServicePrivateData.rootData
    //     if (rootData.servicePrivateData.migrateFlag == 2) {
    //         // 用户已经选择了无需迁移隐私数据
    //         __actionConfirmNotNeedMigrate()
    //         return
    //     } else if (rootData.servicePrivateData.migrateFlag == 1) {
    //         // 用户已经选择了需要迁移隐私数据
    //         window.XXG.ServicePrivateData.actionTriggerAlipayWithholding(true)
    //         return
    //     }
    //
    //     // 以下为：用户还未选择过是否需要迁移隐私数据
    //
    //     // 开始播放提示音
    //     __actionSoundPlay(__soundSrc[1])
    //     var html_st = window.XXG.ServicePrivateData.htmlServicePrivateDataDialogConfirmMigrate()
    //     window.XXG.BusinessCommon.helperCloseDialog()
    //     var dialogInst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
    //         className: 'service-private-data-dialog-confirm-migrate',
    //         withClose: false
    //     })
    //     var $dialog = dialogInst.wrap
    //     var $second = $dialog.find('.confirm-countdown-second')
    //     var $btn = $dialog.find('.btn')
    //     tcb.distimeAnim(6, function (time) {
    //         $second.html(time)
    //         if (time <= 0) {
    //             $btn.removeClass('btn-disabled')
    //         }
    //     })
    //     $btn.on('click', function (e) {
    //         e.preventDefault()
    //         var $me = $(this)
    //         if ($me.hasClass('btn-disabled')) {
    //             return
    //         }
    //         // 停止播放提示音
    //         __actionSoundStop()
    //
    //         var isNeedMigrate = !!$me.attr('data-migrate')
    //         tcb.loadingStart()
    //         var rootData = window.XXG.ServicePrivateData.rootData
    //         var data = {
    //             order_id: rootData.order.order_id,
    //             migrationFlag: isNeedMigrate ? 1 : 2
    //         }
    //         window.XXG.ServicePrivateData.apiSavePrivateDataNeedMigrate(data,
    //             function () {
    //                 rootData.servicePrivateData.migrateFlag = data.migrationFlag // 设置是否需要迁移隐私数据
    //                 window.XXG.BusinessCommon.helperCloseDialog(dialogInst)
    //                 tcb.loadingDone()
    //                 if (isNeedMigrate) {
    //                     // 需要迁移隐私数据
    //                     __actionConfirmNeedMigrate()
    //                 } else {
    //                     // 不需要迁移隐私数据
    //                     __actionConfirmNotNeedMigrate()
    //                 }
    //             },
    //             function () {
    //                 tcb.loadingDone()
    //             }
    //         )
    //
    //     })
    // }
    //
    // 确认需要迁移隐私数据
    function __actionConfirmNeedMigrate() {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            window.XXG.ServicePrivateData.actionTriggerAlipayWithholding(true)
        }, '新机将会妥投，旧手机将留给用户转移数据，需再次上门回收。' +
            '<span style="color: #fe5800;">请小哥当面与客户预约二次上门取旧机的时间</span>', {
            noTitle: true,
            withoutClose: true,
            options: {
                btn: '好'
            }
        })
    }

    // 确认不需要迁移隐私数据
    function __actionConfirmNotNeedMigrate() {
        __actionTriggerCleanedAndConfirmTradeIn()
    }

    // 触发清除隐私数据 && 触发真实换新补差
    function __actionTriggerCleanedAndConfirmTradeIn() {
        var rootData = window.XXG.ServicePrivateData.rootData
        if (rootData.isOneStopOrder) {
            // 一站式订单
            return window.XXG.ServicePrivateData.actionTriggerCleaned('sf-fix-suning-one-stop-confirm-trade-in')
        }

        // @TODO 非一站式的继续补差
    }

    // 触发代扣弹窗
    function actionTriggerAlipayWithholding(refresh) {
        window.XXG.ServicePrivateData.actionCheckPayStatus(function () {
            // 已经支付，直接刷新页面
            window.XXG.BusinessCommon.helperCloseDialog()
            refresh && window.XXG.redirect()
        }, function () {
            tcb.loadingStart()
            var rootData = window.XXG.ServicePrivateData.rootData
            var data = {
                order_id: rootData.order.order_id
            }
            // 获取支付宝代扣url
            window.XXG.ServicePrivateData.apiGetPrivateDataAlipayWithholdingInfo(data,
                function (result) {
                    tcb.loadingDone()
                    var url = result.alipay_url
                    __actionShowAlipayWithholding(url)
                }, function () {
                    tcb.loadingDone()
                }
            )
        })
    }

    // 检查用户是否已经支付
    function actionCheckPayStatus(payed_callback, waiting_pay_callback) {
        tcb.loadingStart()
        var rootData = window.XXG.ServicePrivateData.rootData
        var data = {
            order_id: rootData.order.order_id
        }
        // 获取用户支付状态
        window.XXG.ServicePrivateData.apiGetPrivateDataUserPayStatus(data,
            function (result) {
                tcb.loadingDone()
                var isPay = result.pay_flag
                if (isPay) {
                    typeof payed_callback === 'function' && payed_callback()
                } else {
                    typeof waiting_pay_callback === 'function' && waiting_pay_callback()
                }
            }, function () {
                tcb.loadingDone()
                typeof waiting_pay_callback === 'function' && waiting_pay_callback()
            },
            {
                silent: true
            }
        )
    }

    function __actionShowAlipayWithholding(url) {
        __actionSoundPlay(__soundSrc[2])
        // url = 'https://bang.360.cn/alipayWithhold?businessId=1&businessUid=42389789537798453798&scan=1&ext=1'
        // url = 'https://payauth.alipay.com/appAssign.htm?alipay_exterface_invoke_assign_target=invoke_6531ea32e245e98704d05fa5af46a0b5_uid80&alipay_exterface_invoke_assign_sign=f_juli_jz_u3_q3%2Ba_q4_frwp_t_kl8_a2_nm_wj_ev_m_a_syj_ol9_b_c_nbx_w_kx_e_l_j4_frg%3D%3D#/'
        var html_st = window.XXG.ServicePrivateData.htmlServicePrivateDataDialogAlipayWithholding({
            url: url
        })
        window.XXG.BusinessCommon.helperCloseDialog()
        window.XXG.BusinessCommon.helperShowDialog(html_st, {
            className: 'service-private-data-dialog-alipay-withholding',
            withClose: false
        })
    }

    // 显示迁移隐私数据全款支付页面
    function actionShowMigrateFullPay() {
        // 停止播放提示音
        __actionSoundStop()

        var rootData = window.XXG.ServicePrivateData.rootData
        var order_id = rootData.order.order_id
        var paymentUrl = tcb.setUrl2('/Recycle/Engineer/Migration/fullAmountPay', {
            order_id: order_id,
            inner_iframe: true
        })
        var html_st = '<iframe frameborder="0" src="' + paymentUrl + '" style="overflow-y: auto;width: 100%;height: 20rem;max-height: 85vh;">'
        window.XXG.BusinessCommon.helperCloseDialog()
        window.XXG.BusinessCommon.helperShowDialog(html_st, {
            fromBottom: true,
            onClose: function () {
                __stopCheckMigrateFullPay()
            }
        })
        __startCheckMigrateFullPay({
            'order_id': order_id
        }, function () {
            tcb.closeDialog()
            __stopCheckMigrateFullPay()
            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                window.XXG.redirect()
            }, '恭喜您支付成功！', {
                withoutClose: true
            })
        })
    }

    var checkPaymentHandler = null
    var isStoppedCheckPayment = false

    function __startCheckMigrateFullPay(data, callback) {
        isStoppedCheckPayment = false

        function loop() {
            if (isStoppedCheckPayment) {
                return __stopCheckMigrateFullPay()
            }
            window.XXG.ServicePrivateData.actionCheckPayStatus(function () {
                // 支付成功
                typeof callback === 'function' && callback()
            }, function () {
                // 未检查到支付成功（或者接口出错）
                checkPaymentHandler = setTimeout(loop, 3000)
            })
        }

        loop()
    }

    function __stopCheckMigrateFullPay() {
        isStoppedCheckPayment = true
        if (checkPaymentHandler) {
            clearTimeout(checkPaymentHandler)
            checkPaymentHandler = null
        }
    }

    // 触发二次上门以旧换新
    function actionTriggerTradeInAgain() {
        // __actionTriggerCleanedAndConfirmTradeIn()
        var rootData = window.XXG.ServicePrivateData.rootData
        if (rootData.isOneStopOrder) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-suning-one-stop-confirm-trade-in')
        } else if (rootData.sfFixData.__re_new) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm-trade-in')
        } else {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm')
        }
    }

    // // 确认纯回收
    // function actionConfirmRecycle() {
    //
    // }
    //
    // // 确认以旧换新
    // function actionConfirmTradeIn() {
    //
    // }

    // 触发二次上门扫码重新验机
    function actionTriggerScanReassessAgain() {
        window.XXG.ServicePrivateData.callbackScanReassessAgain()
    }

    // 触发二次上门之前关闭一站式订单
    function actionTriggerCloseOneStopOrder($btn, data){
        window.XXG.BusinessCommon.actionShowCityManagerInfo($btn, data, __actionTriggerCloseOneStopOrder)
    }

    function __actionTriggerCloseOneStopOrder() {
        window.XXG.BusinessCommon.helperShowConfirm('确定结束订单么？', {
            noTitle: true,
            options: {
                textCancel: '取消',
                textConfirm: '结束'
            },
            callbackConfirm: function () {
                var rootData = window.XXG.BusinessCommon.rootData
                var data = {
                    order_id: rootData.order.order_id
                }
                tcb.loadingStart()
                window.XXG.ServicePrivateData.apiSavePrivateDataCloseOneStopOrder(data, function () {
                    tcb.loadingDone()
                    window.XXG.redirect()
                }, function () {
                    tcb.loadingDone()
                })
            }
        })
    }

    // 触发数据迁移
    function actionTriggerMigrate() {
        var html_st = window.XXG.ServicePrivateData.htmlServicePrivateDataDialogStartMigrate()
        window.XXG.BusinessCommon.helperShowDialog(html_st)
    }

    // 确认数据迁移
    function actionConfirmMigrate() {
        var rootData = window.XXG.ServicePrivateData.rootData
        var order_id = rootData.order.order_id
        tcb.loadingStart()
        window.XXG.ServicePrivateData.apiSavePrivateDataMigrated({order_id: order_id},
            function () {
                setTimeout(function () {
                    tcb.loadingDone()
                }, 1000)
                window.XXG.BusinessCommon.helperCloseDialog()
                window.XXG.redirect()
            },
            function () {
                tcb.loadingDone()
            }
        )
    }

    // 触发已清除隐私数据
    function actionTriggerCleaned(confirmAct) {
        // 开始播放提示音
        __actionSoundPlay(__soundSrc[0])
        var html_st = window.XXG.ServicePrivateData.htmlServicePrivateDataDialogCleanPrivateData({
            confirmAct: confirmAct || ''
        })
        window.XXG.BusinessCommon.helperCloseDialog()
        window.XXG.BusinessCommon.helperShowDialog(html_st, {
            // withClose: false
        })
    }

    // 触发转移、已清除隐私数据
    function actionTriggerMigrateAndCleaned(confirmAct) {
        // 开始播放提示音
        __actionSoundPlay(__soundSrc[0])
        var html_st = window.XXG.ServicePrivateData.htmlServicePrivateDataDialogMigrateAndCleanPrivateData({
            confirmAct: confirmAct || ''
        })
        window.XXG.BusinessCommon.helperCloseDialog()
        var dialogInst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
            withClose: false
        })
        var rootData = window.XXG.ServicePrivateData.rootData
        var isMigrateFlow = rootData.servicePrivateData.isMigrateFlow
        var migrateFlag = rootData.servicePrivateData.migrateFlag
        var isVisitAgain = rootData.servicePrivateData.isVisitAgain
        if (isMigrateFlow && !migrateFlag && !isVisitAgain) {
            var $dialog = dialogInst.wrap
            var $btn = $dialog.find('.btn')
            var btn_text = $btn.html()
            var delay = 5
            $btn.html('<div class="confirm-countdown grid nowrap justify-center align-baseline">' +
                '<div class="confirm-countdown-second">' + delay + '</div>' +
                '<div class="confirm-countdown-symbol">s</div></div>' + btn_text)
            $btn.addClass('btn-disabled btn-go-next-lock')
            var $second = $btn.find('.confirm-countdown-second')
            tcb.distimeAnim(delay, function (time) {
                $second.html(time)
                if (time <= 0) {
                    $btn.removeClass('btn-disabled btn-go-next-lock').html(btn_text)
                }
            })
        }
    }

    // 确认已清除隐私数据
    function actionConfirmCleaned($trigger) {
        if ($trigger.attr('data-locking')) {
            return
        }
        $trigger.attr('data-locking', 1)
        var act = $trigger.attr('data-combine-act')
        if (act) {
            $trigger
                .attr('data-act', act)
                .attr('data-combine-act', '')
                .attr('data-locking', '')
            $trigger.trigger('click')
        }
        // 停止播放提示音
        __actionSoundStop()

        window.XXG.BusinessCommon.helperCloseDialog()
    }

    // 确认迁移、清除隐私数据
    function actionConfirmMigrateAndCleaned($trigger) {
        if ($trigger.attr('data-locking')) {
            return
        }
        $trigger.attr('data-locking', 1)

        var rootData = window.XXG.ServicePrivateData.rootData
        var act = $trigger.attr('data-combine-act')
        var isMigrateFlow = rootData.servicePrivateData.isMigrateFlow
        var migrateFlag = rootData.servicePrivateData.migrateFlag
        var isVisitAgain = rootData.servicePrivateData.isVisitAgain
        if (!isMigrateFlow || migrateFlag || isVisitAgain) {
            // 非数据迁移流程 || 已经确认过【需要迁移：1】或者【不需要迁移：2】 || 二次验机
            if (act) {
                $trigger
                    .attr('data-act', act)
                    .attr('data-combine-act', '')
                    .attr('data-locking', '')
                $trigger.trigger('click')
            }
            // 停止播放提示音
            __actionSoundStop()

            window.XXG.BusinessCommon.helperCloseDialog()
        } else {
            // 还未确认过，需要先确认
            var isNeedMigrate = !!$trigger.attr('data-migrate')
            tcb.loadingStart()
            var data = {
                order_id: rootData.order.order_id,
                migrationFlag: isNeedMigrate ? 1 : 2
            }
            // 确认选择【需要迁移：1】或者【不需要迁移：2】
            window.XXG.ServicePrivateData.apiSavePrivateDataNeedMigrate(data,
                function () {
                    rootData.servicePrivateData.migrateFlag = data.migrationFlag // 设置是否需要迁移隐私数据
                    tcb.loadingDone()
                    // 停止播放提示音
                    __actionSoundStop()

                    if (isNeedMigrate) {
                        // 需要迁移隐私数据
                        window.XXG.BusinessCommon.helperCloseDialog()
                        __actionConfirmNeedMigrate()
                    } else {
                        // 不需要迁移隐私数据
                        if (act) {
                            $trigger
                                .attr('data-act', act)
                                .attr('data-combine-act', '')
                                .attr('data-locking', '')
                            $trigger.trigger('click')
                        }
                        window.XXG.BusinessCommon.helperCloseDialog()
                    }
                },
                function () {
                    tcb.loadingDone()
                }
            )
        }
    }

    // 播放提示音提示妥投新机
    function actionDeliveredNewDeviceSoundPlay() {
        __actionSoundPlay(__soundSrc[3])
    }

    function __actionSoundPlay(src) {
        window.XXG.BusinessCommon.soundPlay({
            src: src,
            repeat: 2,
            interval: 500
        })
    }

    function __actionSoundStop() {
        window.XXG.BusinessCommon.soundStop()
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_private_data/api.js` **/
// 隐私数据处理
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServicePrivateData = tcb.mix(window.XXG.ServicePrivateData || {}, {
        apiSavePrivateDataNeedMigrate: apiSavePrivateDataNeedMigrate,
        apiGetPrivateDataUserPayStatus: apiGetPrivateDataUserPayStatus,
        apiGetPrivateDataAlipayWithholdingInfo: apiGetPrivateDataAlipayWithholdingInfo,
        apiSavePrivateDataMigrated: apiSavePrivateDataMigrated,
        apiSavePrivateDataCloseOneStopOrder: apiSavePrivateDataCloseOneStopOrder,
        apiSavePrivateDataVisitAgain: apiSavePrivateDataVisitAgain,
        apiGetSfFixSuningOneStopFullPaymentUrl: apiGetSfFixSuningOneStopFullPaymentUrl,
    })

    /**
     * 保存是否需要迁移隐私数据
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *          migrationFlag	转移标志	Y	string	枚举值：1-需要迁移 2-无需迁移
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiSavePrivateDataNeedMigrate(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Migration/doUserNeedMigration'),
            data: data,
            type: 'POST',
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 获取隐私数据迁移用户支付信息
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     *      @return
     *          {
     *              pay_flag	支付成功标志	N	int	1-支付成功
     *              pay_type	支付方式	N	int	枚举值：1-支付宝代扣 2-全款购新
     *          }
     * @param fail
     * @param options
     */
    function apiGetPrivateDataUserPayStatus(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Migration/getUserPayStatus'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 获取隐私数据支付宝代扣信息
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     *      @return
     *          {
     *              alipay_url	支付宝返回的url	Y	string	-
     *          }
     * @param fail
     * @param options
     */
    function apiGetPrivateDataAlipayWithholdingInfo(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Migration/getWithholdServiceUrl'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 保存已经迁移隐私数据
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiSavePrivateDataMigrated(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Migration/doStartMigration'),
            data: data,
            type: 'POST',
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 二次上门之前关闭一站式订单
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiSavePrivateDataCloseOneStopOrder(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/xxgHs/doCloseOneStopOrder'),
            data: data,
            type: 'POST',
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 保存已经二次上门
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiSavePrivateDataVisitAgain(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Migration/doSecondService'),
            data: data,
            type: 'POST',
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 获取一站式换新机，全款购新的url
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiGetSfFixSuningOneStopFullPaymentUrl(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/xxgHs/getOneStopFullAmountPayUrl'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail(err)
            }
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_private_data/event.js` **/
// 隐私数据处理
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivateData = tcb.mix(window.XXG.ServicePrivateData || {}, {
        eventBind: eventBind
    })

    // 绑定事件
    function eventBind() {
        if (eventBind.__bind) {
            return
        }
        eventBind.__bind = true

        if (typeof __fnGoNext === 'function') {
            window.XXG.BusinessCommon &&
            window.XXG.BusinessCommon.eventBind &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext.push(__fnGoNext)
        }

        tcb.bindEvent({
            // 检查隐私转移前支付状态
            '.js-trigger-service-private-data-check-pay-status': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivateData.actionCheckPayStatus(function () {
                    // 代扣签约成功，直接刷新页面
                    window.XXG.BusinessCommon.helperCloseDialog()
                    window.XXG.redirect()
                }, function () {
                    // 还未代扣签约成功，toast提示
                    $.dialog.toast('请等待，还未成功签约代扣！')
                })
            },
            // 切换成全款购新
            '.js-trigger-service-private-data-full-pay': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivateData.actionCheckPayStatus(function () {
                    $.dialog.toast('已经成功签约代扣，无需支付差额！')
                    setTimeout(function () {
                        window.XXG.BusinessCommon.helperCloseDialog()
                        window.XXG.redirect()
                    }, 1000)
                }, function () {
                    window.XXG.BusinessCommon.helperCloseDialog()
                    // 切换为支付差额
                    window.XXG.ServicePrivateData.actionShowMigrateFullPay()
                })
            }
        })
    }

    // 事件--下一步（将会被加入的下一步的事件队列里）
    function __fnGoNext(e, $trigger, data) {
        var isContinue = true
        if (!__validGoNext($trigger)) {
            return false
        }
        var act = $trigger.attr('data-act')
        switch (act) {
            case 'service-private-data-trigger-old-device-cancel':
                // 触发旧机不成交
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerOldDeviceCancel($trigger, data)
                break
            case 'service-private-data-trigger-no-migrate-flow-recycle':
                // 有隐私数据，非导数流程，触发回收（包括纯回收 或者 以旧换新）
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerNoMigrateFlowRecycle($trigger, data)
                break
            case 'service-private-data-trigger-trade-in':
                // 导数流程--触发以旧换新
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerTradeIn($trigger, data)
                break
            case 'service-private-data-trigger-trade-in-again':
                // 导数流程--触发二次上门以旧换新
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerTradeInAgain($trigger, data)
                break
            case 'service-private-data-trigger-scan-reassess-again':
                // 触发二次上门扫码重新验机
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerScanReassessAgain($trigger, data)
                break
            case 'service-private-data-trigger-close-one-stop-order':
                // 触发二次上门之前关闭一站式订单
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerCloseOneStopOrder($trigger, data)
                break
            case 'service-private-data-trigger-migrate':
                // 触发数据迁移
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerMigrate($trigger, data)
                break
            case 'service-private-data-confirm-migrate':
                // 确认数据迁移
                isContinue = false
                window.XXG.ServicePrivateData.actionConfirmMigrate($trigger, data)
                break
            // case 'service-private-data-confirm-cleaned':
            //     // 确认已清除隐私数据
            //     isContinue = false
            //     window.XXG.ServicePrivateData.actionConfirmCleaned($trigger, data)
            //     break
            case 'service-private-data-migrate-and-clean':
                // 迁移、清除隐私数据
                isContinue = false
                window.XXG.ServicePrivateData.actionConfirmMigrateAndCleaned($trigger, data)
                break
        }
        return isContinue
    }

    function __validGoNext($trigger) {
        if ($trigger && $trigger.length && $trigger.hasClass('btn-go-next-lock')) {
            return
        }
        return true
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_private_data/render.js` **/
// 隐私数据处理
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivateData = tcb.mix(window.XXG.ServicePrivateData || {}, {
        renderServicePrivateDataBtn: renderServicePrivateDataBtn,

        htmlServicePrivateDataBtn: htmlServicePrivateDataBtn,
        htmlServicePrivateDataDialogConfirmMigrate: htmlServicePrivateDataDialogConfirmMigrate,
        htmlServicePrivateDataDialogCleanPrivateData: htmlServicePrivateDataDialogCleanPrivateData,
        htmlServicePrivateDataDialogMigrateAndCleanPrivateData: htmlServicePrivateDataDialogMigrateAndCleanPrivateData,
        htmlServicePrivateDataDialogAlipayWithholding: htmlServicePrivateDataDialogAlipayWithholding,
        htmlServicePrivateDataDialogStartMigrate: htmlServicePrivateDataDialogStartMigrate
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml

    function renderServicePrivateDataBtn(data, $target, addType) {
        $target = $target || $('.block-order-bottom-btn')
        addType = addType || 'html'
        renderHtml(
            window.XXG.ServicePrivateData.htmlServicePrivateDataBtn(data),
            $target,
            addType
        )
    }

    //=========== HTML输出 =============

    // 隐私清除+数据迁移底部按钮
    function htmlServicePrivateDataBtn(data) {
        return htmlTpl('#JsMXxgOrderDetailServicePrivateDataBtnTpl', data)
    }

    // 弹窗--清除隐私数据---隐私数据操作
    function htmlServicePrivateDataDialogCleanPrivateData(data) {
        var rootData = window.XXG.ServicePrivateData.rootData
        rootData.servicePrivateData.confirmCleanedAct = data.confirmAct
        return htmlTpl('#JsXxgOrderDetailServicePrivateDataDialogCleanPrivateDataTpl', rootData)
    }

    // 弹窗--转移、清除隐私数据---隐私数据操作
    function htmlServicePrivateDataDialogMigrateAndCleanPrivateData(data) {
        var rootData = window.XXG.ServicePrivateData.rootData
        rootData.servicePrivateData.confirmCleanedAct = data.confirmAct
        return htmlTpl('#JsXxgOrderDetailServicePrivateDataDialogMigrateAndCleanPrivateDataTpl', rootData)
    }

    // 弹窗--转移隐私数据询问弹窗---隐私数据操作
    function htmlServicePrivateDataDialogConfirmMigrate() {
        var rootData = window.XXG.ServicePrivateData.rootData
        return htmlTpl('#JsXxgOrderDetailServicePrivateDataDialogConfirmMigrateTpl', rootData)
    }

    // 弹窗--支付宝代扣弹窗---隐私数据操作
    function htmlServicePrivateDataDialogAlipayWithholding(data) {
        var rootData = window.XXG.ServicePrivateData.rootData
        rootData.servicePrivateData.alipayWithholdingUrl = data.url || ''
        return htmlTpl('#JsXxgOrderDetailServicePrivateDataDialogAlipayWithholdingTpl', rootData)
    }

    // 弹窗--开始数据迁移---隐私数据操作
    function htmlServicePrivateDataDialogStartMigrate() {
        var rootData = window.XXG.ServicePrivateData.rootData
        return htmlTpl('#JsMXxgOrderDetailServicePrivateDataDialogStartMigrateTpl', rootData)
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_new_device_activation/setup.js` **/
// 订单详情服务--新机激活
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceNewDeviceActivation = tcb.mix(window.XXG.ServiceNewDeviceActivation || {}, {
        rootData: null,
        $processBar: null,
        setup: setup,
        init: init
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServiceNewDeviceActivation.rootData = options.data || {}
        window.XXG.ServiceNewDeviceActivation.eventBind()
    }

    function init(next, final) {
        next()
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_new_device_activation/action.js` **/
// 订单详情服务--新机激活
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceNewDeviceActivation = tcb.mix(window.XXG.ServiceNewDeviceActivation || {}, {
        actionShow: actionShow,
        actionShowUploadFail: actionShowUploadFail,

        actionShowProgress: actionShowProgress,
        actionShowProcessBar: actionShowProcessBar,
        actionShowProcessBar100: actionShowProcessBar100
    })

    // 新机激活--展示拍照弹窗
    function actionShow() {
        var html_st = window.XXG.ServiceNewDeviceActivation.htmlServiceNewDeviceActivationUpload()
        var inst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
            className: 'dialog-service-new-device-activation-upload',
            withClose: false
        })
        var $trigger = inst.wrap.find('.js-trigger-service-new-device-activation-take-photo-and-upload')
        var instProgress
        // 绑定拍照、上传事件
        window.XXG.ServiceNewDeviceActivation.eventBindTakePhotoAndUpload({
            $trigger: $trigger,
            is_silent: true,
            callback_upload_before: function (inst, img, next) {
                instProgress = window.XXG.ServiceNewDeviceActivation.actionShowProgress()
                next()
            },
            callback_upload_success: function (inst, data) {
                if (data && !data.errno) {
                    var rootData = window.XXG.ServiceNewDeviceActivation.rootData
                    var order_id = rootData.order.order_id
                    var img_url = data.result
                    window.XXG.ServiceNewDeviceActivation.apiSaveActivationEvidence({
                        order_id: order_id,
                        img_url: img_url
                    }, function () {
                        window.XXG.ServiceNewDeviceActivation.actionShowProcessBar100()
                        if (instProgress) {
                            instProgress.wrap.find('.the-title').html('完成！')
                        }
                        setTimeout(function () {
                            window.XXG.BusinessCommon.helperCloseDialog()
                            window.XXG.redirect()
                        }, 300)
                    }, function () {
                        window.XXG.ServiceNewDeviceActivation.actionShowUploadFail()
                    }, {
                        silent: true
                    })
                } else {
                    window.XXG.ServiceNewDeviceActivation.actionShowUploadFail()
                }
            },
            callback_upload_fail: function (inst, xhr, status, err) {
                window.XXG.ServiceNewDeviceActivation.actionShowUploadFail()
            }
        })
    }

    function actionShowUploadFail() {
        window.XXG.BusinessCommon.helperCloseDialog()

        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            window.XXG.ServiceNewDeviceActivation.actionShow()
        }, '上传出现错误，请重新上传', {
            noTitle: true,
            withoutClose: true,
            options: {
                btn: '好'
            }
        })
    }

    function actionShowProgress() {
        window.XXG.BusinessCommon.helperCloseDialog()

        var html_st = window.XXG.ServiceNewDeviceActivation.htmlServiceNewDeviceActivationUploadProgress()
        var inst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
            className: 'dialog-service-new-device-activation-upload-progress',
            withClose: false
        })
        window.XXG.ServiceNewDeviceActivation.$processBar = inst.wrap.find('.upload-progress')
        window.XXG.ServiceNewDeviceActivation.actionShowProcessBar()
        return inst
    }

    function actionShowProcessBar() {
        var $processBar = window.XXG.ServiceNewDeviceActivation.$processBar
        if (!($processBar && $processBar.length)) {
            return
        }
        var $processBarInner = $processBar.find('.upload-progress-inner')
        $processBar.show()

        var percent_val = 25
        $processBarInner.css({'width': percent_val + '%'})

        setTimeout(function h() {
            percent_val += 6
            if (percent_val > 80) {
                return
            }
            if ($processBarInner.css('width') == '100%') {
                return
            }
            $processBarInner.css({'width': percent_val + '%'})

            if (percent_val < 100) {
                setTimeout(h, 500)
            }
        }, 500)
    }

    function actionShowProcessBar100() {
        var $processBar = window.XXG.ServiceNewDeviceActivation.$processBar
        if (!($processBar && $processBar.length)) {
            return
        }
        var $processBarInner = $processBar.find('.upload-progress-inner')
        $processBar.show()
        $processBarInner.css({'width': '100%'})
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_new_device_activation/api.js` **/
// 订单详情服务--新机激活
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceNewDeviceActivation = tcb.mix(window.XXG.ServiceNewDeviceActivation || {}, {
        apiSaveActivationEvidence: apiSaveActivationEvidence
    })

    /**
     * 保存新机激活拍照证据
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *          img_url	所拍照片	Y	string	-
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiSaveActivationEvidence(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/xxgHs/doSaveActivationEvidence'),
            data: data,
            type: 'POST',
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    var errmsg = (res && res.errmsg) || '系统错误'
                    !options.silent && $.dialog.toast(errmsg)
                    typeof fail === 'function' && fail(errmsg)
                }
            },
            error: function (err) {
                var errmsg = (err && err.statusText) || '系统错误'
                !options.silent && $.dialog.toast(errmsg)
                typeof fail === 'function' && fail(errmsg)
            }
        })
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_new_device_activation/event.js` **/
// 订单详情服务--新机激活
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceNewDeviceActivation = tcb.mix(window.XXG.ServiceNewDeviceActivation || {}, {
        eventBind: eventBind,

        eventBindTakePhotoAndUpload: eventBindTakePhotoAndUpload
    })

    // 绑定事件
    function eventBind() {
        tcb.bindEvent({})
    }

    function eventBindTakePhotoAndUpload(options) {
        new window.TakePhotoUpload(options)
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/service_new_device_activation/render.js` **/
// 订单详情服务--新机激活
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceNewDeviceActivation = tcb.mix(window.XXG.ServiceNewDeviceActivation || {}, {

        htmlServiceNewDeviceActivationUpload: htmlServiceNewDeviceActivationUpload,
        htmlServiceNewDeviceActivationUploadProgress: htmlServiceNewDeviceActivationUploadProgress,
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml


    //=========== HTML输出 =============

    // 新机激活--拍照弹窗
    function htmlServiceNewDeviceActivationUpload() {
        return htmlTpl('#JsXxgOrderDetailServiceNewDeviceActivationUploadTpl')
    }

    // 新机激活--拍照上传进度条
    function htmlServiceNewDeviceActivationUploadProgress() {
        return htmlTpl('#JsXxgOrderDetailServiceNewDeviceActivationUploadProgressTpl')
    }

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/start.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    // 开始入口
    function start(data) {
        tcb.loadingStart()

        // 将全局数据挂在到 BusinessCommon 的 rootData 上
        window.XXG.BusinessCommon.rootData = data
        window.XXG.BusinessCommon.fnQueueRenderDone.push(window.XXG.BusinessCommon.eventBindDeviceResetAndUploadPhoto) // 绑定设备重置图片上传相关事件

        /***** 根据条件初始化不同的业务流程 *****/
        if (window.__IS_SF_FIX_RE_NEW || window.__IS_SF_FIX_RECYCLE) {
            // 丰修

            if (window.__IS_SF_FIX_ONE_STOP_ORDER) {
                // 丰修一站式换新
                window.XXG.BusinessSfFixOneStopOrder.init(data, done)
            } else {
                // 丰修纯回收 或 以旧换新
                window.XXG.BusinessSfFix.init(data, done)
            }
        } else if (window.__IS_ONE_STOP_ORDER) {
            // 一站式换新

        } else {
            // 默认流程
            window.XXG.BusinessCommon.init(data, done)
        }

        function done() {
            // 轮询获取回寄物流信息
            window.XXG.BusinessCommon.actionLoopExpressInfo(data)
            // 开启分配回寄物流单号【如果需要的话】
            window.XXG.BusinessCommon.actionStartDeliveryExpressCountdown(data)

            setTimeout(function () {
                tcb.loadingDone()
            }, 500)
            console.log('执行到这里不容易的')
        }
    }

    // DOM Ready
    $(function () {
        /***** 初始化数据预处理（不需要异步获取的数据，尽量都在此默认设置） *****/
            // 订单信息
        var order = window.__ORDER = window.__ORDER || {}
        var isMobile = order.category_id == '1' // 手机、平板
        var isNotebook = order.category_id == '10' // 笔记本
        var isDeviceResetAndUploadPhoto = !!window.__IS_DEVICE_RESET_AND_UPLOAD_PHOTO // 是否展示妥投码（基于是否还原、拍照的逻辑）
        // 远程验机数据
        var serviceRemoteCheck = {
            remote_check_flag: window.__REMOTE_CHECK_FLAG, // 是否支持远程验机：远程验机表示，true表示支持远程验机，false不支持
            // 远程验机进度：验机状态值：1，表示正在排队，2，表示正在验机中，3，表示验机成功，-1，表示验机驳回重传图片
            remote_check_flag_process: window.__REMOTE_CHECK_FLAG_PROCESS,
            remote_check_options: window.__REMOTE_CHECK_OPTIONS, // 远程验机信息
            remote_check_price: window.__REMOTE_CHECK_PRICE, // 检验价格
            remote_check_remarks: window.__REMOTE_CHECK_REMARKS, // 驳回说明
            remote_check_timeout: window.__REMOTE_CHECK_TIMEOUT, // 检测目标时间，当前验机状态的超时时间节点
            remote_check_api: window.__REMOTE_CHECK_API, // 远程验机api host
            remote_check_add: window.__REMOTE_CHECK_ADD, // socket链接地址
            remote_check_auth: window.__REMOTE_CHECK_AUTH, // 连接校验token
            remote_check_id: window.__REMOTE_CHECK_ID, // 远程验机id
            remote_check_tomorrow: window.__REMOTE_CHECK_TOMORROW, // 黑名单店铺在特定时间段内是否为明天下单,true是明天,false是现在可以下单
            remote_check_tagging_imgs: window.__REMOTE_CHECK_TAGGING_IMGS, // 远程验机处理的图片：差异圈出 或者 被驳回的图片
            remote_check_work_time: window.__REMOTE_CHECK_WORK_TIME // 远程验机工作时间
        }
        // 丰修数据
        var sfFixData = window.__SF_FIX_DATA || {}
        // 评估详情
        var assessDetail = window.XXG.BusinessCommon.reassessGetOrderAssessDetail(order.order_id, order.hs_model.model_id)
        // 上门回收到达前的状态（订单状态status的值小于12）
        var isBeforeArrive = window.__IS_BEFORE_ARRIVE || false
        var isOneStopOrder = window.__IS_ONE_STOP_ORDER || false
        if (window.__IS_SF_FIX_RE_NEW) {/*丰修换新*/
            sfFixData.__re_new = true
        }
        if (window.__IS_SF_FIX_RECYCLE) {/*丰修纯回收*/
            sfFixData.__recycle = true
        }
        var servicePrivacyProtocol = window.__SERVICE_PRIVACY_PROTOCOL || {}
        var servicePrivateData = window.__SERVICE_PRIVATE_DATA || {}
        // migrateFlag强制转成数字，当没有选择是否迁移之前，默认为0
        servicePrivateData.migrateFlag = +servicePrivateData.migrateFlag || 0
        var model_name = ((order.hs_model && order.hs_model.model && order.hs_model.model.model_name) || '').toLowerCase()
        var isIphone = (model_name.indexOf('iphone') > -1) || (model_name.indexOf('ipad') > -1)
        // isIphone = false
        var isNewDeviceNeedActivation = !!window.__IS_NEW_DEVICE_NEED_ACTIVATION
        if (isNewDeviceNeedActivation) {
            // 新机需要激活的时候，不能显示核验码
            sfFixData.verification_code_hide = true
        }
        var data = {
            order: order,
            isScannedReAssess: !!window.IS_SCANNED_RE_ASSESS, // 是否已经扫码重新评估
            inSfFixApp: !!window.__IS_XXG_IN_SF_FIX_APP,
            isMobile: isMobile,
            isNotebook: isNotebook,
            isIphone: isIphone,
            isNeedPayInfo: window.__IS_NEED_PAYINFO && window.__IS_NEED_PAYINFO[order.order_id] && !isOneStopOrder,
            isNewDeviceNeedActivation: isNewDeviceNeedActivation,
            isOneStopOrder: isOneStopOrder,
            isDeviceResetAndUploadPhoto: isDeviceResetAndUploadPhoto,
            assessDetail: assessDetail, // 评估详情
            isBeforeArrive: isBeforeArrive,
            serviceRemoteCheck: serviceRemoteCheck, // 远程验机
            servicePrivacyProtocol: servicePrivacyProtocol,// 隐私协议相关
            servicePrivateData: servicePrivateData,// 隐私数据相关
            sfFixData: sfFixData, // 丰修数据
            oneStopData: {} // 一站式换新数据
        }
        // data.order.status = 11
        window.xxxxxx = data

        // 开始入口
        start(data)
    })
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/entry.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }
    window.__FINAL_PRICE_STRUCTURE_LIST = window.__FINAL_PRICE_STRUCTURE_LIST || {}

    window.renderOrderDealInfo = renderOrderDealInfo
    window.hideOrderDealInfo = hideOrderDealInfo
    window.isRemoteCheckWorkTime = isRemoteCheckWorkTime
    window.getRemoteCheckOptions = getRemoteCheckOptions
    window.getFinalPriceStructure = getFinalPriceStructure
    window.getAppleCesOrderInfo = getAppleCesOrderInfo
    window.showAppleCesOrderInfo = showAppleCesOrderInfo

    function renderOrderDealInfo() {
        var orderInfo = window.__ORDER_INFO || {}
        var idCardInfo = window.__IDCARD_INFO__ || {}
        var finalPriceStructure = window.__FINAL_PRICE_STRUCTURE_LIST[orderInfo.order_id] || {}

        var html_fn = $.tmpl($.trim($('#JsXxgOrderDealInfoTpl').html())),
            html_st = html_fn({
                _order_info: orderInfo,
                _remote_check: {
                    remote_check_flag: window.__REMOTE_CHECK_FLAG,
                    remote_check_flag_process: window.__REMOTE_CHECK_FLAG_PROCESS,
                    remote_check_options: window.__REMOTE_CHECK_OPTIONS,
                    remote_check_price: window.__REMOTE_CHECK_PRICE,
                    remote_check_remarks: window.__REMOTE_CHECK_REMARKS,
                    remote_check_timeout: window.__REMOTE_CHECK_TIMEOUT
                },
                _realname_info: {
                    real_name: (idCardInfo &&
                        idCardInfo.realname_info &&
                        idCardInfo.realname_info.real_name) || '',
                    id_number: (idCardInfo &&
                        idCardInfo.realname_info &&
                        idCardInfo.realname_info.id_number) || ''
                },
                _user_allowance: window.__USER_ALLOWANCE || {},
                _engineer_allowance: window.__ENGINEER_ALLOWANCE || {},
                _final_price_structure: finalPriceStructure
            }),
            $OrderDealInfo = $('.block-order-deal-info')

        $OrderDealInfo.html(html_st)
        $OrderDealInfo.show()

        renderDoneOrderDealInfo($OrderDealInfo)

        return $OrderDealInfo
    }

    // OrderDealInfo内的html渲染完毕，
    // 这里可以执行一些事件绑定
    function renderDoneOrderDealInfo($OrderDealInfo) {
        var $Form = $OrderDealInfo.find('#FormUpdateOrderInfoByGoNext')
        var $Btn = $('.btn-go-next')
        window.bindEventFormUpdateOrderInfo($Form, $Btn)
        window.imeiOcrInit($OrderDealInfo.find('.block-order-deal-info-main'))

        // 点击选择带单人员
        initTriggerDaidanStaff()
        // 选择上门时间
        initTriggerServerTime($OrderDealInfo.find('.js-trigger-edit-server-time'))

        $Form.find('[name="price"]').trigger('change')
    }

    function hideOrderDealInfo() {
        var $OrderDealInfo = $('.block-order-deal-info')
        $OrderDealInfo.hide()
    }

    // 判断是都在远程验机工作时间内
    function isRemoteCheckWorkTime() {
        var remote_check_work_time = window.__REMOTE_CHECK_WORK_TIME || {}
        var nowObj = new Date()
        var nowTimestamp = nowObj.getTime()
        var year = nowObj.getFullYear()
        var month = nowObj.getMonth() + 1
        var day = nowObj.getDate()
        var start = [year, month, day].join('/') + ' ' + remote_check_work_time.beginAt
        var end = [year, month, day].join('/') + ' ' + remote_check_work_time.endsAt

        return nowTimestamp >= (new Date(start)).getTime() &&
            nowTimestamp <= (new Date(end)).getTime()
    }

    function getRemoteCheckOptions(callback, remote_check_id) {
        if (tcb.cache('__getremoteCheckOptionsTimeout')) {
            return callback()
        }
        var params
        if (remote_check_id) {
            params = {
                remote_check_id: remote_check_id
            }
        }
        var url = tcb.setUrl2('/m/getRemoteCheckProcess', params || {
            order_id: tcb.queryUrl(window.location.search, 'order_id')
        })
        window.XXG.ajax({
            url: url,
            success: function (res) {
                if (!res) {
                    return setTimeout(function () {
                        getRemoteCheckOptions(callback)
                    }, 300)
                }
                typeof callback == 'function' && callback(res.result)
            },
            error: function () {
                setTimeout(function () {
                    getRemoteCheckOptions(callback)
                }, 300)
            }
        })
    }

    function getFinalPriceStructure(price, complete) {
        var orderInfo = window.__ORDER_INFO || {}
        var order_id = orderInfo.order_id
        window.XXG.ajax({
            url: '/m/doGenFinalPriceStructure',
            data: {
                orderId: order_id,
                price: price
            },
            success: function (res) {
                var add_price = -1
                var sum_price
                if (res && !res.errno) {
                    var result = res.result
                    add_price = result.add_price
                    sum_price = result.sum_price
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试')
                }
                typeof complete === 'function' && complete(add_price, sum_price)
            },
            error: function (err) {
                $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                typeof complete === 'function' && complete(-1)
            }
        })
    }

    function showAppleCesOrderInfo(order_id) {
        getAppleCesOrderInfo(order_id, function (appleCesOrderInfo) {
            var bonus = parseInt(appleCesOrderInfo.subsidy_price, 10) || 0
            var realPrice = parseInt(appleCesOrderInfo.new_product_price * 100 - appleCesOrderInfo.hs_model_price * 100 - bonus * 100, 10) / 100
            var instalmentName = appleCesOrderInfo.loan_name || 'JD白条分期付款'
            var instalmentRate = appleCesOrderInfo.loan_rate || 0
            var instalmentPeriod = parseInt(appleCesOrderInfo.loan_rate_number, 10) || 0
            var instalmentPaymentPerPeriod = (instalmentPeriod
                ? parseInt(realPrice / instalmentPeriod * 100 + realPrice * instalmentRate * 100, 10) / 100
                : realPrice).toFixed(2)
            var $BlockOrderBaseInfoAppleCesOrderInfo = $('#BlockOrderBaseInfoAppleCesOrderInfo')
            if ($BlockOrderBaseInfoAppleCesOrderInfo && $BlockOrderBaseInfoAppleCesOrderInfo.length) {
                $BlockOrderBaseInfoAppleCesOrderInfo.remove()
                $BlockOrderBaseInfoAppleCesOrderInfo = null
            }
            var html_st = '<div id="BlockOrderBaseInfoAppleCesOrderInfo">'
            html_st += '<div class="row row-order-id-barcode" style="text-align: center"><svg id="XxgOrderDetailOrderIdBarcode"></svg></div>'
            html_st += '<div class="row"><div class="col-12-4">新机编码</div><div class="col-12-8">' + appleCesOrderInfo.new_product_id + '</div></div>'
            html_st += '<div class="row"><div class="col-12-4">新机型号</div><div class="col-12-8">' + appleCesOrderInfo.new_product_name + '</div></div>'
            html_st += '<div class="row"><div class="col-12-4">新机价格</div><div class="col-12-8">¥ ' + appleCesOrderInfo.new_product_price + '</div></div>'
            if (appleCesOrderInfo.coupon_code) {
                html_st += '<div class="row"><div class="col-12-4">促销码</div><div class="col-12-8">' + appleCesOrderInfo.coupon_code + '</div></div>'
            }
            if (!window.__REMOTE_CHECK_FLAG || window.__REMOTE_CHECK_FLAG_PROCESS == 3) {
                html_st += '<div class="row"><div class="col-12-4">抵扣金额</div><div class="col-12-8">- ¥ ' + appleCesOrderInfo.hs_model_price + '</div></div>'
                if (bonus) {
                    html_st += '<div class="row"><div class="col-12-4">换新补贴</div><div class="col-12-8">￥ ' + bonus + '</div></div>'
                }
                html_st += '<div class="row"><div class="col-12-4">换购价格</div><div class="col-12-8 c5">' + (realPrice > 0 ? '¥ ' + realPrice : '- ¥ ' + Math.abs(realPrice)) + '</div></div>'
                if (instalmentPeriod && realPrice > 0) {
                    html_st += '<div class="row"><div class="col-12-4">' + instalmentName + '</div><div class="col-12-8">￥ ' + instalmentPaymentPerPeriod + ' x ' + instalmentPeriod + '期</div></div>'
                }
            }
            html_st += '</div>'
            $('.block-order-base-info .row-order-status').after(html_st)
            JsBarcode('#XxgOrderDetailOrderIdBarcode', order_id, {
                height: 80
            })
        })
    }

    function getAppleCesOrderInfo(order_id, success) {
        if (!window.__APPLE_CES_ORDER_FLAG) {
            return
        }
        var appleCesOrderInfo = null
        // var appleCesOrderInfo = tcb.cache('XXG_CACHE_APPLE_CES_ORDER_INFO')
        // if (appleCesOrderInfo) {
        //     typeof success == 'function' && success(appleCesOrderInfo)
        // } else {
        window.XXG.ajax({
            url: '/xxgHs/doGetAppleCesOrderInfo',
            method: 'GET',
            data: {
                order_id: order_id
            },
            success: function (res) {
                if (!res || res.errno) {
                    return $.dialog.alert(res.errmsg)
                }
                appleCesOrderInfo = res.result || {}
                tcb.cache('XXG_CACHE_APPLE_CES_ORDER_INFO', appleCesOrderInfo)
                typeof success == 'function' && success(appleCesOrderInfo)
            },
            error: function (err) {
                return $.dialog.alert(err.statusText)
            }
        })
        // }
    }

    // 点击选择带单人员
    function initTriggerDaidanStaff() {
        // var pickerData = window.__DAIDANSTAFFLIST,
        var pickerData = [],
            $trigger = $('.js-trigger-daidan-staff')
        if (!$trigger.attr('data-flag')) {
            return
        }
        var qid = $trigger.find('.daidan-staff-name').attr('data-qid')
        var pos = 0

        tcb.each(window.__DAIDANSTAFFLIST || [], function (i, item) {
            pickerData.push({
                id: item['qid'],
                name: item['name']
            })
            if (qid == item['qid']) {
                pos = i
            }
        })

        Bang.Picker({
            // 实例化的时候自动执行init函数
            flagAutoInit: true,
            // 触发器
            selectorTrigger: $trigger,

            col: 1,
            data: [pickerData],
            dataTitle: ['请选择带单人员'],
            dataPos: [pos],

            // 回调函数(确认/取消)
            callbackConfirm: function (inst) {
                var data = inst.options.data || [],
                    dataPos = inst.options.dataPos || [],
                    selectedData = data[0][dataPos[0]],

                    $trigger = inst.getTrigger(),
                    order_id = $trigger.attr('data-order-id'),
                    qid = selectedData.id

                $trigger.find('.daidan-staff-name').attr('data-qid', qid)

                $.get('/m/setWithASingleRecord', {
                    orderId: order_id,
                    qid: qid
                }, function (res) {
                    if (!res.errno) {
                        inst.getTrigger().find('.daidan-staff-name').html(selectedData.name)
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                })

                tcb.js2AndroidSetDialogState(false)
            },
            callbackCancel: null
        })
    }

    // 选择上门时间
    function initTriggerServerTime($trigger) {
        var pickerData = []
        tcb.each(window.__ALLOW_SERVER_TIME__ || [], function (i, item) {
            pickerData.push({
                id: i,
                name: item
            })
        })

        var pos = 0

        Bang.Picker({
            // 实例化的时候自动执行init函数
            flagAutoInit: true,
            // 触发器
            selectorTrigger: $trigger,

            col: 1,
            data: [pickerData],
            dataTitle: ['请选择时间'],
            dataPos: [pos],

            callbackTriggerBefore: function () {
                if (!(pickerData && pickerData.length)) {
                    $.dialog.toast('抱歉选择时间缺失，无法选择', 3000)
                    return false
                }
            },
            // 回调函数(确认/取消)
            callbackConfirm: function (inst) {
                var data = inst.options.data || [],
                    dataPos = inst.options.dataPos || [],
                    selectedData = data[0][dataPos[0]],
                    serverTime = selectedData.name

                if (window.__IS_SHOW_DAODIAN_SERVER_TIME) {
                    // 到店时间选择
                    var tips = '<div style="text-align: center">注意：您填写的时间将短信通知用户！</div>'
                    $.dialog.confirm(tips, function () {
                        updateServerTime(serverTime, function () {
                            $trigger.closest('.row').find('.col-server-time').html(serverTime)
                            $.dialog.toast('填写成功，已短信通知用户预约时间', 3000)
                        })
                    })
                } else {
                    // 普通上门时间选择
                    updateServerTime(serverTime, function () {
                        setTimeout(function () {
                            window.XXG.redirect()
                        }, 10)
                    })
                }
            },
            callbackCancel: null
        })
    }

    function updateServerTime(serverTime, callback) {
        var params = {
            order_id: window.__ORDER_ID,
            datetime: serverTime
        }
        tcb.loadingStart()
        window.XXG.ajax({
            url: tcb.setUrl2('/m/changeOrderToHomeDate', params),
            success: function (res) {
                tcb.loadingDone()
                if (!res.errno) {
                    window.__DAODIAN_SERVER_TIME = serverTime
                    window.__DAODIAN_REACH_TIME = serverTime
                    typeof callback === 'function' && callback()
                } else {
                    $.dialog.toast(res.errmsg)
                }
            },
            error: function (res) {
                tcb.loadingDone()
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })
    }

    $(function () {
        var order_id = tcb.queryUrl(window.location.search, 'order_id')

        tcb.loadingStart()

        if (window.__REMOTE_CHECK_FLAG_PROCESS) {
            // 进入详情页只是，若还没有开启远程验机流程，那么不开启远程验机监听状态，
            // 否则开启远程验机监听状态
            window.remoteCheckListenStart(order_id)
        } else {
            renderOrderDealInfo()
        }

        showAppleCesOrderInfo(order_id)

        setTimeout(function () {
            tcb.loadingDone()
        }, 500)
    })

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/base_action.js` **/
// 一些基本操作
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    var __cacheAssessOptionsExempt = {}
    window.bindEventFormUpdateOrderInfo = __bindEventFormUpdateOrderInfo
    window.showPageCustomerSignatureBeforeCallback = __showPageCustomerSignatureBeforeCallback

    function __bindEventFormUpdateOrderInfo($form, $trigger) {
        if (!($form && $form.length)) {
            return
        }
        var trigger_text = $trigger.html()

        window.XXG.bindForm({
            $form: $form,
            before: function ($form, callback) {
                if (!__validUpdateOrderByGoNext($form)) {
                    return false
                }
                if ($trigger.hasClass('btn-disabled')) {
                    return false
                }
                if (window.__ORDER.sale_type == 3) {
                    // console.log(window.__DAODIAN_REACH_TIME);
                    if (window.__DAODIAN_REACH_TIME &&
                        (!window.__DAODIAN_REACH_TIME || window.__DAODIAN_REACH_TIME === '0000-00-00 00:00:00')) {
                        $.dialog.toast('请选择到店时间')
                        return false
                    }
                } else {
                    if (window.__IS_SHOW_DAODIAN_SERVER_TIME &&
                        (!window.__DAODIAN_SERVER_TIME || window.__DAODIAN_SERVER_TIME === '0000-00-00 00:00:00')) {
                        $.dialog.toast('请选择上门时间')
                        return false
                    }
                }
                if (!window.__IS_ONE_STOP_ORDER_CONTINUE
                    && window.__IS_ONE_STOP_ORDER && !window.__IS_ONE_STOP_ORDER_NO_DIFF && !window.__IS_ONE_STOP_ORDER_SUCCESS) {
                    var order_id = $form.find('[name="order_id"]').val()
                    window.SuningOneStopOrder.checkOneStopPriceLetThrough(order_id)
                    return false
                }
                $trigger.addClass('btn-disabled').html('处理中...')
                callback()
            },
            success: __successFillUp,
            //success: window.__IS_BEFORE_ARRIVE
            //    ? __successUpdateBeforeArrive
            //    : __successFillUp,
            error: function (res) {
                window.__SAMSUMG_SUBSIDY_5G = false
                $trigger.removeClass('btn-disabled').html(trigger_text)
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })

        //function __successUpdateBeforeArrive(){
        //    $trigger.removeClass ('btn-disabled').html (trigger_text)
        //    __actionBeforeArrive($trigger)
        //}
        function __successFillUp() {
            window.__ORDER_INFO.imei = tcb.trim($form.find('[name="imei"]').val() || '')
            window.__ORDER_INFO.memo = tcb.trim($form.find('[name="memo"]').val() || '')
            // if (!window.__IS_XXG_APP_VERSION_BETA){
            //     return window.XXG.ajax ({
            //         url : tcb.setUrl ('/m/aj_wancheng_order'),
            //         data : {
            //             'order_id' : $trigger.attr ('data-order-id'),
            //             'status'   : $trigger.attr ('data-now-status')
            //         },
            //         success : function (res) {
            //             setTimeout(function(){
            //                 $trigger.removeClass ('btn-disabled').html (trigger_text)
            //             }, 400)
            //
            //             if (!res.errno) {
            //                 window.showPageCustomerServiceComplete && window.showPageCustomerServiceComplete ()
            //             } else {
            //                 $.dialog.toast (res.errmsg)
            //             }
            //         },
            //         error : function (err) {
            //             $trigger.removeClass ('btn-disabled').html (trigger_text)
            //             $.dialog.toast ('系统错误，请稍后重试')
            //         }
            //     })
            // } else {
            // 数据更新成功
            setTimeout(function () {
                $trigger.removeClass('btn-disabled').html(trigger_text)
            }, 400)

            var order_id = $form.find('[name="order_id"]').val()
            var price = $form.find('[name="price"]').val()

            if (window.__IS_ONE_STOP_ORDER_CONTINUE) {
                window.__IS_ONE_STOP_ORDER_CONTINUE = false
                window.SuningOneStopOrder.confirmGoToPriceDifference(order_id)
                return
            }

            var checked_need = false
            var checked_done = true
            if (window.__IS_NEEDED_MANAGER_CHECK) {
                checked_need = true
                if (!window.__IS_MANAGER_CHECK_SUCCESS) {
                    // 店长审核--暂未通过
                    checked_done = false
                }
            }
            if (window.__REMOTE_CHECK_FLAG) {
                checked_need = true
                if (window.__REMOTE_CHECK_FLAG_PROCESS != 3) {
                    // 远程验机--暂未通过
                    checked_done = false
                    if (!window.isRemoteCheckWorkTime()) {
                        return $.dialog.alert('服务时间为早9点至晚10点，请在此时间段内操作订单')
                    }
                }
            }
            if (checked_need && checked_done) {
                // 店长审核||远程验机，完成
                return window.isNeedCheckUnlocked(function (is_need_unlock) {
                    if (is_need_unlock) {
                        // 检查解锁状态
                        window.checkUnlocked(function () {
                            // 已解锁
                            window.showPageCustomerSignature && window.showPageCustomerSignature()
                        })
                    } else {
                        window.showPageCustomerSignature && window.showPageCustomerSignature()
                    }
                })
            }
            if (window.__IS_HUANBAOJI || !window.__IS_NEEDED_PIC) {
                // 环保机 || 不需要imei和传图
                return window.showPageCustomerSignature && window.showPageCustomerSignature()
            }

            window.isNeedCheckUnlocked(function (is_need_unlock) {
                if (is_need_unlock) {
                    window.addCheckUnlockQueue()
                }
            })
            if (window.__SAMSUMG_SUBSIDY_5G) {
                window.__SAMSUMG_SUBSIDY_5G = false
                window.location.href = tcb.setUrl2('/m/activity?orderId=' + order_id)
            } else {
                window.showPageUploadPicture && window.showPageUploadPicture({
                    order_id: order_id,
                    price: price,
                    category_id: window.__ORDER_INFO.category_id
                })
            }
            // }
        }

        $form.find('[name="price"]').on('input change', function (e) {
            var $me = $(this)
            var price = $me.val()

            e.type === 'change' && tcb.loadingStart()

            window.getFinalPriceStructure(price, function (add_price, sum_price) {
                if (add_price > -1) {
                    $('.price-structure-add-price').html(add_price > 0 ? '再+' + add_price + '元补贴' : '')
                }
                var bottomRowPriceHtml = /*'<div class="col shrink">成交价：'
                    + price
                    + (add_price > 0 ? ' 补贴:' + add_price : '')
                    + '</div>'
                    + */'<div class="col shrink"></div><div class="col auto marked">到手价：' + sum_price.toFixed(2) + '</div>'
                $('.row-btn .bottom-row-price')
                    .show()
                    .children('.grid').html(bottomRowPriceHtml)
                setTimeout(function () {
                    e.type === 'change' && tcb.loadingDone()
                }, 500)
            })
        })
    }

    // 验证下一步前的提交参数
    function __validUpdateOrderByGoNext($Form) {
        var flag = true,
            toast_text = '',
            $focus = null

        var $assessPrice = $('.row-order-assess-price .col-12-8'),
            $dealPrice = $Form.find('[name="price"]'),
            $dealImei = $Form.find('[name="imei"]'),
            $dealMemo = $Form.find('[name="memo"]')

        if ($dealPrice && $dealPrice.length) {
            var price = parseFloat(tcb.trim($dealPrice.val()))
            if (!price) {
                flag = false
                $focus = $focus || $dealPrice
                $dealPrice.closest('.row').shine4Error()
            }
        }
        if ($dealImei && $dealImei.length) {
            var imei = tcb.trim($dealImei.val())
            if (!imei) {
                flag = false
                $focus = $focus || $dealImei
                $dealImei.closest('.row').shine4Error()
            }
        }
        if ($dealMemo && $dealMemo.length) {
            var memo = tcb.trim($dealMemo.val())
            var assess_price = tcb.trim($assessPrice.html())
            if (price && parseFloat(price) != parseFloat(assess_price) && !memo) {
                flag = false
                $focus = $focus || $dealMemo
                $dealMemo.closest('.row').shine4Error()
                toast_text = '评估价和成交价不一致，请填写备注'
            }
        }

        if ($focus && $focus.length) {
            setTimeout(function () {
                $focus.focus()
            }, 200)
        }

        if (toast_text) {
            $.dialog.toast(toast_text, 2000)
        }

        return flag
    }

    // 显示签名前的回调逻辑
    function __showPageCustomerSignatureBeforeCallback(next) {
        var idCardInfo = window.__IDCARD_INFO__ || {}
        if (idCardInfo.realname_info
            && idCardInfo.realname_info.real_name
            && idCardInfo.realname_info.id_number) {
            return typeof next === 'function' && next()
        }

        var orderInfo = window.__ORDER_INFO || {}
        var $trigger = $('<a data-order-id="' + orderInfo.parent_id + '"></a>')
        __actionActiveFillUpIdCard($trigger, function () {
            typeof next === 'function' && next()
        })
    }

    // 填写身份证
    function __actionActiveFillUpIdCard($trigger, success) {
        if (!($trigger && $trigger.length)) {
            return
        }
        var idCardInfo = window.__IDCARD_INFO__ || {}
        var html_fn = $.tmpl($.trim($('#JsXxgEditIdNumTpl').html())),
            html_st = html_fn({
                parent_id: $trigger.attr('data-order-id'),
                real_name: (idCardInfo &&
                    idCardInfo.realname_info &&
                    idCardInfo.realname_info.real_name) || '',
                id_number: (idCardInfo &&
                    idCardInfo.realname_info &&
                    idCardInfo.realname_info.id_number) || '',
                is_force: idCardInfo.force_flag || false
            }),
            dialog = tcb.showDialog(html_st, {
                middle: true,
                withClose: false
            })
        dialog.mask.css({'z-index': tcb.zIndex()})
        dialog.wrap.css({'z-index': tcb.zIndex()})

        dialog.wrap.find('.js-trigger-edit-id-num-skip').on('click', function (e) {
            e.preventDefault()

            tcb.closeDialog()

            typeof success === 'function' && success()
        })
        window.XXG.bindForm({
            $form: dialog.wrap.find('form'),
            before: function ($form, next) {
                var errmsg = ''
                var $real_name = $form.find('[name="real_name"]'),
                    $id_num = $form.find('[name="id_num"]'),
                    real_name = tcb.trim($real_name.val()),
                    id_num = tcb.trim($id_num.val())
                if (!real_name) {
                    errmsg = errmsg || '请输入姓名'
                    $real_name.shine4Error()
                }
                if (!tcb.validIDCard(id_num)) {
                    errmsg = errmsg || '请输入正确的身份证格式'
                    $id_num.shine4Error()
                }
                if (errmsg) {
                    return $.dialog.toast(errmsg)
                }

                tcb.loadingStart()
                next()
            },
            success: function (res, $form) {
                var real_name = tcb.trim($form.find('[name="real_name"]').val())
                var id_number = tcb.trim($form.find('[name="id_num"]').val())
                $('.row-order-deal-customer-id-num .customer-info-name').html(real_name)
                $('.row-order-deal-customer-id-num .customer-info-idnum').html(id_number)
                var idCardInfo = window.__IDCARD_INFO__ || {}
                idCardInfo.force_flag = false
                idCardInfo.have_flag = true
                idCardInfo.realname_info = {
                    real_name: real_name,
                    id_number: id_number
                }
                window.__IDCARD_INFO__ = idCardInfo

                tcb.closeDialog()
                tcb.loadingDone()

                typeof success === 'function' && success()
                //setTimeout(function () {
                //    window.XXG.redirect()
                //}, 10)
            },
            error: function (res) {
                tcb.loadingDone()
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })
    }

    $(function () {
        var $BlockOrderBaseInfo = $('.block-order-base-info'),
            $BlockOrderDealInfo = $('.block-order-deal-info')

        function init() {
            new ClipboardJS('.js-trigger-copy').on('success', function (e) {
                $.dialog.toast('复制成功：' + e.text)
            })
            __bindEvent()
            __setShowPicturesRowStatus()
        }

        init()

        // ************
        // 处理函数
        // ************

        function __bindEvent() {
            tcb.bindEvent($BlockOrderBaseInfo[0], {
                // 展开/收起 更多订单信息
                '.js-trigger-expand-n-collapse': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    $me.toggleClass('arrow-down arrow-up')
                    $me.siblings('.block-order-base-info-extend').slideToggle(200)
                }
            })

            tcb.bindEvent(document.body, {
                // 取消订单

                '.js-btn-cancel': function (e) {
                    e.preventDefault()
                    __actionActiveCancelOrder($(this))
                },
                // 下一步

                '.js-btn-go-next': function (e) {
                    e.preventDefault()
                    __actionActiveGoNextStep($(this))
                },
                // 扫描评估结果

                '.btn-scan-assess': function (e) {
                    e.preventDefault()
                    if (window.__IS_MANAGER_CHECK_SUCCESS) {
                        return $.dialog.toast('本订单已完成店长审核，不再支持修改验机结果')
                    } else if (window.__REMOTE_CHECK_FLAG_PROCESS == 3) {
                        return $.dialog.toast('本订单已完成远程验机，不再支持修改验机结果')
                    }
                    __actionScanAssess($(this))
                },
                // 查看回收手机参数详情

                '.btn-view-hs-detail': function (e) {
                    e.preventDefault()
                    __showOrderAssessOptions($(this))
                },
                // 查看免检订单回收手机参数详情

                '.btn-view-hs-detail-exempt': function (e) {
                    e.preventDefault()
                    __showOrderAssessOptionsExempt($(this))
                },
                // 查看回收手机SKU属性详情

                '.btn-view-hs-sku': function (e) {
                    e.preventDefault()
                    __showOrderAssessSku($(this))
                },
                // 修修哥单独填写备注

                '.btn-edit-memo': function (e) {
                    e.preventDefault()
                    __actionActiveFillUpMemo($(this))
                },
                // 填写身份证号

                '.btn-view-hs-idnum': function (e) {
                    e.preventDefault()
                    __actionActiveFillUpIdCard($(this))
                },
                // 显示imei条形码

                '.js-trigger-show-imei-bar-code': function (e) {
                    e.preventDefault()
                    __showImeiBarCode($(this))
                },
                //订单号转换为条形码
                '.js-trigger-show-order-id-bar-code': function (e) {
                    e.preventDefault()
                    __showImeiBarCode($(this), true)
                },
                // 显示顾客抽奖二维码

                '.js-trigger-show-customer-draw-qrcode': function (e) {
                    e.preventDefault()
                    __showCustomerDrawQRCode($(this))
                },
                // 显示苏宁礼品二维码

                '.js-trigger-show-suning-gift-card': function (e) {
                    e.preventDefault()
                    __showSuningGiftCardQrcode($(this))
                },
                // 展示机器细节图片

                '.js-trigger-show-pictures': function (e) {
                    e.preventDefault()
                    __showDetailPictures($(this))
                },
                // 合作方换新补贴

                '.js-trigger-show-partner-switch-phone-subsidies': function (e) {
                    e.preventDefault()
                    __showPartnerSwitchPhoneSubsidies($(this))
                },

                // 切换订单展示信息的tab
                '.row-order-deal-title-tab .tab-item': function (e) {
                    e.preventDefault()

                    var $me = $(this)

                    if ($me.hasClass('tab-item-checked')) {
                        return
                    }
                    $me.closest('.row-order-deal-title-tab')
                       .find('.tab-item-checked')
                       .removeClass('tab-item-checked')
                    $me.addClass('tab-item-checked')

                    if ($me.attr('data-remote-check')) {
                        $('.block-order-deal-info-check-info').show()
                        $('.block-order-deal-info-main').hide()
                    } else {
                        $('.block-order-deal-info-check-info').hide()
                        $('.block-order-deal-info-main').show()
                    }
                },
                '.js-trigger-active-remote-check-tab': function (e) {
                    e.preventDefault()

                    $('.row-order-deal-title-tab .tab-item').eq(1).trigger('click')
                },
                '.js-trigger-active-order-info-tab': function (e) {
                    e.preventDefault()

                    $('.row-order-deal-title-tab .tab-item').eq(0).trigger('click')
                },
                '#get_markup_price': function (e) {
                    e.preventDefault()
                    __actionGetMarkupPrice($(this))
                },
                // 修改免检加价
                '.js-trigger-edit-exempt-price': function (e) {
                    e.preventDefault()

                    var $me = $(this),
                        order_id = window.__ORDER_INFO.order_id,
                        $Form = $BlockOrderDealInfo.find('#FormUpdateOrderInfoByGoNext'),
                        $imei_inpt = $Form.find('[name="imei"]'),
                        imei = tcb.trim($imei_inpt.val() || ''),
                        price = $me.closest('.row-order-deal-exempt').find('[name="price"]').val()

                    if (!imei) {
                        $imei_inpt.closest('.row').shine4Error()
                    } else {
                        window.XXG.ajax({
                            type: 'POST',
                            url: '/Recycle/Engineer/Exempt/checkImeiAndPrice',
                            data: {
                                order_id: order_id,
                                imei: imei,
                                price: price
                            },
                            success: function (res) {
                                if (!res.errno) {
                                    $.dialog.alert('<div style="text-align: center;">加价成功！</div>', function () {
                                        window.XXG.redirect()
                                    })
                                } else {
                                    $.dialog.alert(res.errmsg)
                                }
                            },
                            error: function (err) {
                                $.dialog.toast('系统错误，请稍后重试')
                            }
                        })
                    }
                },
                // 关闭机型不一致弹窗
                '.close-different-model': function (e) {
                    e.preventDefault()
                    // var differentMask = $('.different-alert-model-mask')
                    // differentMask.hide()
                    window.XXG.redirect()
                }
            })
        }

        function __actionGetMarkupPrice($trigger, callback) {

            var order_id = $trigger.attr('data-order-id')
            window.XXG.ajax({
                url: '/m/aj_get_markup',
                data: {
                    order_id: order_id
                },
                success: function (res) {
                    //console.log(res['result']['add_price']);
                    if (!res.errno) {
                        $.dialog.alert('经理特权加价为：' + res['result']['add_price_float'], function () {
                            window.XXG.redirect()
                        })
                        //$.isFunction(callback) && callback(res)
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                },
                error: function (err) {
                    $.dialog.toast('系统错误，请稍后重试')
                }
            })
        }

        function __actionScanAssess($trigger) {
            var order_id = $trigger.attr('data-order-id')

            return tcb.js2AppInvokeQrScanner(true, function (result) {
                __orderDetailScanQRCodeSuccess(order_id, result)
            })
        }

        function __orderDetailScanQRCodeSuccess(order_id, result) {
            result = (result || '').split('|') || []

            // 根据二维码信息，获取重新评估的参数数据
            var data = __getReAssessDataByQRCode(order_id, result)
            if (!data) {
                return $.dialog.toast('二维码数据异常')
            }
            if (result[0] === 'ARC') {
                __doScanRePingguNotebook(data)
            } else {
                __doScanRePinggu(data)
            }
        }

        // 笔记本重新评估
        function __doScanRePingguNotebook(data) {
            __addNoteBookAutoCheckResult(
                data,
                function (model_id, pre_assess) {
                    var bindingArcRecordParams = {
                        order_id: data.order_id,
                        arc_assess_key: pre_assess
                    }
                    if (data.ignore_model_check === true) {
                        bindingArcRecordParams.ignore_model_check = true
                    }
                    __bindingArcRecord(bindingArcRecordParams, function () {
                        window.XXG.redirect()
                    })
                }
            )
        }

        function __addNoteBookAutoCheckResult(data, callback) {
            window.XXG.ajax({
                url: '/m/addNotebookAutoCheckResult',
                data: data,
                success: function (res) {
                    if (!(res && !res.errno)) {
                        var errmsg = (res && res.errmsg) || '系统错误，请稍后重试'
                        if (res && res.errno === 12014 && res.result && res.result.canChangeModelFlag) {
                            // 错误码 12014 代表订单机型 和 检测机型不一致 弹窗提示用户走再来一单重新下单
                            return __actionScanReassessErrorDiffModelCanChange(res, function () {
                                // 当选择【回收检测机型】时，
                                // 将请求参数增加ignore_model_check属性，并且设置为true
                                data.ignore_model_check = true
                                __addNoteBookAutoCheckResult(data, callback)
                            })
                        }
                        $('.sm-err-alert-model-mask').show()
                        $('.sm-err-alert-model-btn-upLoade').hide()
                        $('.sm-err-alert-model-btn-confirm').show()
                        if (res.errno === 19101 || res.errno === 19104) {
                            $('.sm-err-alert-model-btn-confirm').hide()
                            $('.sm-err-alert-model-btn-upLoade').show().attr('data-sequenceCode', res.result.sequenceCode)
                        } else if (res.errno === 19106) {
                            $('.sm-err-alert-model-mask').hide()
                            // 显卡缺失,请手动选择
                            window.XXG.showDialogAddNoteBookAutoCheckGraphicsCardSelect(res.result && res.result.graphicsCardId, function (graphicsCardId) {
                                data.graphicsCardId = graphicsCardId
                                __addNoteBookAutoCheckResult(data, callback)
                            })
                        } else {
                            $('.sm-err-alert-model-mask .sm-err-alert-model-content-text').html(errmsg)
                        }
                        return
                    }
                    var result = res.result || {}
                    if (result.modelId && result.assessKey) {
                        typeof callback === 'function' && callback(result.modelId, result.assessKey)
                    } else {
                        return $.dialog.toast('数据错误')
                    }
                },
                error: function (err) {
                    $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                }
            })
        }

        function __bindingArcRecord(data, callback) {
            window.XXG.ajax({
                url: '/m/bindingArcRecord',
                data: data,
                success: function (res) {
                    if (!(res && !res.errno)) {
                        return $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试')
                    }
                    typeof callback === 'function' && callback()
                },
                error: function (err) {
                    $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                }
            })
        }

        // 手机重新评估
        function __doScanRePinggu(data) {
            window.XXG.ajax({
                url: tcb.setUrl('/m/doScanRePinggu'),
                data: data,
                beforeSend: function () {},
                success: function (res) {
                    if (res && res.errno === 12014 && res.result && res.result.canChangeModelFlag) {
                        // 错误码 12014 代表订单机型 和 检测机型不一致 弹窗提示用户走再来一单重新下单
                        return __actionScanReassessErrorDiffModelCanChange(res, function () {
                            // 当选择【回收检测机型】时，
                            // 将请求参数增加ignore_model_check属性，并且设置为true
                            data.ignore_model_check = true
                            __doScanRePinggu(data)
                        })
                    }
                    var msg = (res && !res.errno)
                        ? '新的评估价为：' + res['result']
                        : (res && res['errmsg']) || '系统错误'
                    $.dialog.alert(msg, function () {
                        window.XXG.redirect()
                    })
                },
                error: function (err) {
                    $.dialog.toast((err && err.statusText) || '系统错误')
                }
            })
        }

        // 根据二维码信息，获取重新评估的参数数据
        function __getReAssessDataByQRCode(order_id, result) {
            result = result.join('|')
            result = (result || '').split('|') || []

            var data
            if (result[0] === 'ARM') {
                result.shift()
                try {
                    data = $.parseJSON(result.join(''))
                } catch (e) {}
            } else if (result[0] === 'ARC') {
                result.shift()
                data = {
                    encryptedStr: result.join('')
                }
            } else {
                data = {
                    assess_key: result[0] || '',
                    scene: result[1] || ''
                }
                if (result[1] === 'miniapp') {
                    data['imei'] = result[2] || '' //imei
                }
                if (result[4]) {
                    data['imei'] = result[2] //imei
                    data['encrypt_xxg_qid'] = result[4] //Pad登录的xxg
                }
            }
            if (data) {
                data['order_id'] = order_id
            }
            return data
        }

        window.test__doScanRePinggu = function (result) {
            var order_id = window.__ORDER_ID
            if (!order_id) {
                return console.error('当前页面没有order_id，无法继续')
            }
            __orderDetailScanQRCodeSuccess(order_id, result)
        }

        //扫码成功后  订单机型 和 检测机型不一致
        function __actionScanReassessErrorDiffModelCanChange(res, change_model_callback) {
            var html_fn = $.tmpl(tcb.trim($('#JsXxgOrderDetailReassessErrorDiffModelCanChangeTpl').html())),
                html_st = html_fn(res.result),
                $html_st = $(html_st).appendTo('body')

            $html_st.find('.order-model').css('background-color', '#f7f7f7')
            $html_st.find('.test-model').css('background-color', '#ffe9dd')

            $html_st.find('.js-trigger-not-change-model-reassess').on('click', function (e) {
                // 回收原机型，重新验机，
                // 直接刷新页面
                e.preventDefault()
                window.XXG.redirect()
            })
            $html_st.find('.js-trigger-confirm-change-model').on('click', function (e) {
                // 回收检测机型
                e.preventDefault()

                $html_st.remove()

                typeof change_model_callback === 'function' && change_model_callback()
            })
        }

        window.__actionScanReassessErrorDiffModelCanChange = __actionScanReassessErrorDiffModelCanChange

        // 触发下一步操作
        function __actionActiveGoNextStep($btn) {
            if (!($btn && $btn.length)) {
                return $.dialog.toast('$btn参数必须')
            }
            if ($btn.hasClass('btn-go-next-lock')) {
                return
            }
            var errMsg = ''
            if (!errMsg && window.__IS_FORCE_SCAN_BYB) {
                errMsg = '请先使用帮验宝验机，并扫码同步验机结果'
                return $.dialog.alert(errMsg)
            }
            if (!errMsg && window.__SUNING_YUNDIAN_MINIAPP_NEED_FILL_UP) {
                errMsg = '请完善用户收款信息。'
            }
            if (!errMsg && window.__IS_NEEDED_MANAGER_CHECK && window.__IS_MANAGER_CHECK_STARTED) {
                // 店长审核校验
                if (!window.__IS_MANAGER_CHECK_SUCCESS) {
                    // 审核没有通过，那么提示审核通过了之后之后再操作。
                    // 在此只是设置错误提示信息，还不做操作，
                    // 如果还有远程验机相关操作，那么先保证远程验机操作可以继续，例如远程验机被驳回，那么可以继续传图等
                    errMsg = '请等待审核通过再操作。'
                }
            }
            if (!errMsg && window.__REMOTE_CHECK_FLAG) {
                // 远程验机校验
                if (window.__REMOTE_CHECK_FLAG_PROCESS == -1) {
                    // 远程验机被驳回
                    window.remoteCheckUploadRejectPicturesubmitPicture()
                    return
                }
                // if (!errMsg && window.__REMOTE_CHECK_FLAG_PROCESS != 3) {
                //     errMsg = '请先等待远程验机完成。'
                // }
            }
            // if (!errMsg && window.__IDCARD_INFO__.force_flag !== null && (window.__IDCARD_INFO__.force_flag && !window.__IDCARD_INFO__.have_flag)) {
            //     // 校验是否填写身份证信息
            //     if (window.__IDCARD_INFO__.force_flag && !window.__IDCARD_INFO__.have_flag) {
            //         errMsg = '请填写顾客身份证后再提交。'
            //     }
            // }
            if (errMsg) {
                return $.dialog.toast(errMsg)
            }

            var act = $btn.attr('data-act')
            switch (act) {
                case 'jiedan':
                case 'chufa':
                case 'daoda':
                    // 上门修修哥开始服务前的操作
                    __actionBeforeArrive($btn)
                    break
                case 'fill-up-info':
                    // 填写完善旧机信息
                    $BlockOrderDealInfo.find('#FormUpdateOrderInfoByGoNext').trigger('submit')
                    break
                default :
                    break
            }
        }

        // 修修哥开始服务前的操作：1、接单；2、出发；3、到达
        function __actionBeforeArrive($btn) {
            var btn_text = $btn.html(),
                order_id = $btn.attr('data-order-id'),
                now_status = $btn.attr('data-now-status'),
                next_status = $btn.attr('data-next-status')

            window.XXG.ajax({
                url: tcb.setUrl('/m/aj_xxg_parent_status'),
                data: {
                    'parent_id': order_id,
                    'now_status': now_status,
                    'next_status': next_status
                },
                beforeSend: function () {
                    if ($btn.hasClass('btn-disabled')) {
                        return false
                    }
                    $btn.addClass('btn-disabled').html('处理中...')
                },
                success: function (res) {
                    if (!res.errno) {
                        window.XXG.redirect()
                    } else {
                        $btn.removeClass('btn-disabled').html(btn_text)
                        $.dialog.toast(res.errmsg)
                    }
                },
                error: function (err) {
                    $btn.removeClass('btn-disabled').html(btn_text)
                    $.dialog.toast('系统错误，请稍后重试')
                }
            })
        }

        // 激活订单取消弹窗
        function __actionActiveCancelOrder($btnCancel) {
            if ($btnCancel.hasClass('btn-disabled')) {
                return
            }

            var act = $btnCancel.attr('data-act')

            switch (act) {
                case 'cancel-refund':
                    // 取消订单，并且去退款
                    __actionCancelOrderAndRefund($btnCancel)
                    break
                default :
                    // 订单完成前，取消订单
                    __actionCancelOrderBeforeFinnish($btnCancel)
                    break
            }
        }

        // 订单完成前，取消订单
        function __actionCancelOrderBeforeFinnish($btnCancel) {
            var html_fn = $.tmpl($.trim($('#JsXxgCancelOrderTpl').html())),
                html_st = html_fn({
                    'order_id': $btnCancel.attr('data-order-id')
                }),
                dialog = tcb.showDialog(html_st, {middle: true})
            window.XXG.bindForm({
                $form: dialog.wrap.find('form'),
                before: function ($form, callback) {
                    var $xxg_memo = $form.find('[name="xxg_memo"]'),
                        xxg_memo = tcb.trim($xxg_memo.val())
                    if (!xxg_memo) {
                        $.dialog.toast('请输入取消原因')
                        return $xxg_memo.shine4Error()
                    }
                    tcb.loadingStart()
                    callback()
                },
                success: function () {
                    tcb.closeDialog()
                    setTimeout(function () {
                        window.XXG.redirect()
                    }, 10)
                },
                error: function (res) {
                    tcb.loadingDone()
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }

        // 取消订单，并且退款
        function __actionCancelOrderAndRefund($btnCancel) {
            var order_id = $btnCancel.attr('data-order-id'),
                refund_type = $btnCancel.attr('data-refund-type'),
                html_fn = $.tmpl($.trim($('#JsXxgCancelOrderAndRefundTpl').html())),
                html_st = html_fn({
                    'order_id': order_id
                }),
                dialog = tcb.showDialog(html_st, {middle: true})
            window.XXG.bindForm({
                $form: dialog.wrap.find('form'),
                before: function ($form, callback) {
                    var $xxg_memo = $form.find('[name="xxg_memo"]'),
                        xxg_memo = tcb.trim($xxg_memo.val())
                    if (!xxg_memo) {
                        $xxg_memo.attr('data-error-msg') && $.dialog.toast($xxg_memo.attr('data-error-msg'))
                        return $xxg_memo.shine4Error()
                    }
                    tcb.loadingStart()
                    callback()
                },
                success: function () {
                    tcb.closeDialog()
                    setTimeout(function () {
                        window.XXG.redirect(tcb.setUrl2('/Recycle/Engineer/CashierDesk', {
                            order_id: order_id,
                            business_id: refund_type
                        }))
                    }, 10)
                },
                error: function (res) {
                    tcb.loadingDone()
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }

        // 填写备注
        function __actionActiveFillUpMemo($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            var html_fn = $.tmpl($.trim($('#JsXxgEditMemoTpl').html())),
                html_st = html_fn({
                    'order_id': $trigger.attr('data-order-id'),
                    'content': tcb.html_decode($trigger.attr('data-content'))
                }),
                dialog = tcb.showDialog(html_st, {middle: true})
            window.XXG.bindForm({
                $form: dialog.wrap.find('form'),
                before: function ($form, callback) {
                    var $memo = $form.find('[name="memo"]'),
                        memo = tcb.trim($memo.val())
                    if (!memo) {
                        $memo.attr('data-error-msg') && $.dialog.toast($memo.attr('data-error-msg'))
                        return $memo.shine4Error()
                    }
                    tcb.loadingStart()
                    callback()
                },
                success: function (res, $form) {
                    var memo = tcb.trim($form.find('[name="memo"]').val())
                    $('.row-order-deal-memo .col-12-7').html(tcb.html_encode(memo))
                    $trigger.attr('data-content', memo)
                    tcb.closeDialog()
                    tcb.loadingDone()
                },
                error: function (res) {
                    tcb.loadingDone()
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }

        // imei条形码
        function __showImeiBarCode($trigger, $isOrderId) {
            if (!($trigger && $trigger.length)) {
                return
            }

            var order_id = $trigger.attr('data-order-id'),
                imei = $trigger.attr('data-imei'),
                parameter = {
                    type: 1,
                    orderId: order_id,
                    imei: imei
                }
            //如果是true 则生成订单号转换的条码！
            if ($isOrderId) {
                parameter.isOrderFlag = true
            }

            var img_url = tcb.setUrl('/aj/genBarCode', parameter)

            tcb.showDialog('<img style="height:1rem;width:100%;" src="' + img_url + '" alt="">', {
                className: 'dialog-imei-bar-code',
                withMask: true,
                middle: true
            })
        }

        function __showCustomerDrawQRCode($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            var qrcode = $trigger.attr('data-qrcode')
            var dialog_str = '<div style="margin: 0 auto;width: 2.88rem;height: 2.88rem;"><img src="' + qrcode + '" alt="" style="width:100%"></div>'
            tcb.showDialog(dialog_str, {
                className: 'qrcode-wrap',
                withMask: true,
                middle: true
            })
            tcb.statistic(['_trackEvent', 'xxg', '显示', '用户二维码', '1', ''])
        }

        function __showSuningGiftCardQrcode($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            var qrcode = tcb.cache('huodong-doCheckSuningCard')
            if (qrcode) {
                var dialog_str = '<div style="margin: 0 auto;width: 2.88rem;height: 3.3rem;">' +
                    '<div style="padding-top: .1rem;line-height: 2;font-size: .18rem;text-align: center;">请用户使用微信扫码领取</div>' +
                    '<img src="' + qrcode + '" alt="" style="width:100%"></div>'
                tcb.showDialog(dialog_str, {
                    className: 'qrcode-wrap',
                    withClose: true,
                    withMask: true,
                    middle: true
                })
            } else {
                var order_id = $trigger.attr('data-order-id')

                window.XXG.ajax({
                    url: '/huodong/doCheckSuningCard',
                    data: {
                        order_id: order_id
                    },
                    success: function (res) {
                        if (!res.errno) {
                            var gift_data = res.result || {}
                            var cardtype = gift_data.card_type
                            // 如果为苏宁礼品卡,则打开弹窗,显示二维码
                            if (cardtype == 1) {
                                qrcode = gift_data.qr_code
                                if (qrcode) {
                                    tcb.cache('huodong-doCheckSuningCard', qrcode)
                                }
                                var dialog_str = '<div style="margin: 0 auto;width: 2.88rem;height: 3.3rem;">' +
                                    '<div style="padding-top: .1rem;line-height: 2;font-size: .18rem;text-align: center;">请用户使用微信扫码领取</div>' +
                                    '<img src="' + qrcode + '" alt="" style="width:100%"></div>'
                                tcb.showDialog(dialog_str, {
                                    className: 'qrcode-wrap',
                                    withClose: true,
                                    withMask: true,
                                    middle: true
                                })
                            }
                        } else {
                            $.dialog.toast(res.errmsg)
                        }
                    }
                })
            }

            tcb.statistic(['_trackEvent', 'xxg', '显示', '苏宁礼品卡二维码', '1', ''])
        }

        function __showDetailPictures($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            __getPicture($trigger.attr('data-order-id'), function (res) {
                var result = res.result,
                    dialog_str = []
                for (var i = 0; i < result.length; i++) {
                    dialog_str.push('<img src="' + tcb.imgThumbUrl(result[i], 720, 720, 'edr') + '" style="width:100%">')
                }
                tcb.showDialog(dialog_str.join(''), {
                    className: 'dialog-order-detail-picture',
                    withMask: true,
                    middle: true
                })
            })
        }

        function __showPartnerSwitchPhoneSubsidies($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            var order_id = $trigger.attr('data-order-id')
            var data_type = $trigger.attr('data-type')
            var dialog_str = []
            $.each(window.__PARTNER_SWITCH_PHONE_SUBSIDIES_MODELS, function (modelId, modelName) {
                dialog_str.push('<a class="btn" href="/m/partnerSwitchPhoneSubsidies?orderId=' + order_id + '&model=' + modelName + '" data-type="' + data_type + '" style="font-size: .2rem;"> ' + modelName + ' </a>')
            })
            tcb.showDialog(dialog_str.join(''), {
                withMask: true,
                middle: true
            })
        }

        function __showOrderAssessOptions($trigger) {
            var order_id = $trigger.attr('data-order-id'),
                model_id = $trigger.attr('data-model-id'),
                assessResult = window.__SPECIAL_ASSESS,
                assessResultLast = window.__SPECIAL_REASSESS,
                assessGroup = window.__SPECIAL_GROUPS,
                assessResultByUser = [], // 用户的评估结果
                assessResultAtLast = []  // 最后一次，再次评估结果
            if (assessResult && assessResult[order_id]) {
                $.each(assessResult[order_id], function (i, item) {
                    assessResultByUser.push({
                        'name': item['name'],
                        'selected': item['select']
                    })
                })
            }

            if (assessResultLast && assessResultLast[order_id]) {
                $.each(assessResultLast[order_id], function (i, item) {
                    var change = assessResult[order_id][i] ? false : true
                    assessResultAtLast.push({
                        'name': item['name'],
                        'group': assessGroup[model_id][item['group']].sub,
                        'selected': item['select'],
                        'selected_id': item['id'],
                        'change': change,
                        'disable_change': !item['allowChange']
                    })
                })
            }
            var html_fn = $.tmpl($.trim($('#JsXxgViewHsDetailTpl').html())),
                html_st = html_fn({
                    'assessResultByUser': assessResultByUser,
                    'assessResultAtLast': assessResultAtLast,
                    'order_id': order_id,
                    'order_status': window.__ORDER_STATUS || 0
                })

            var dialogInst = tcb.showDialog(html_st, {
                withMask: true,
                middle: true
            })
            __bindEventFormEditAssessOptions(dialogInst.wrap.find('form'))
            __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))
        }

        // 重新评估回收手机参数
        function __bindEventFormEditAssessOptions($form) {
            if (!($form && $form.length)) {
                return
            }

            $form.on('submit', function (e) {
                e.preventDefault()
                $.getJSON('/m/aj_edit_options_new', $form.serialize(), function (res) {
                    if (!res['errno']) {
                        tcb.closeDialog()

                        if (window.__REMOTE_CHECK_FLAG) {
                            $.dialog.alert('重新评估成功！', function () {
                                window.XXG.redirect()
                            })
                        } else {
                            var new_price = res['result'] || 0
                            $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                                window.XXG.redirect()
                            })
                        }

                        // __saveEditAssessPrice(new_price, function () {
                        //     $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                        //         window.XXG.redirect()
                        //     })
                        // })
                        // window.getFinalPriceStructure(new_price, function () {
                        //     $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                        //         window.XXG.redirect()
                        //     })
                        // })
                    } else {
                        $.dialog.toast(res['errmsg'])
                    }
                })
            })
        }

        function __showOrderAssessSku($trigger) {
            var order_id = $trigger.attr('data-order-id'),
                assessSku = window.__SKU_ASSESS,
                assessSkuLast = window.__SKU_REASSESS,
                skuGroups = window.__SKU_GROUPS,

                assessSkuByUser = [], // 用户的评估sku
                assessSkuAtLast = []  // 最后一次，再次评估sku

            if (assessSku && assessSku[order_id]) {
                $.each(assessSku[order_id], function (i, item) {
                    assessSkuByUser.push({
                        'selected': item['attr_valuename']
                    })
                })
            }

            if (assessSkuLast && assessSkuLast[order_id]) {
                $.each(assessSkuLast[order_id], function (i, item) {
                    var change = false
                    if (!(assessSku[order_id][i] && assessSku[order_id][i].attr_valueid == item.attr_valueid)) {
                        change = true
                    }
                    assessSkuAtLast.push({
                        'group': skuGroups[order_id][i],
                        'selected': item['attr_valuename'],
                        'selected_id': item['attr_valueid'],
                        'change': change
                    })
                })
            }

            var html_fn = $.tmpl($.trim($('#JsXxgViewHsSkuTpl').html())),
                html_st = html_fn({
                    'assessSkuByUser': assessSkuByUser,
                    'assessSkuAtLast': assessSkuAtLast,
                    'order_id': order_id,
                    'order_status': window.__ORDER_STATUS || 0
                }),
                dialogInst = tcb.showDialog(html_st, {
                    withMask: true,
                    middle: true
                })
            var sku_pc_auto_check = (window.__SKU_PC_AUTO_CHECK && window.__SKU_PC_AUTO_CHECK[order_id]) || []
            if (sku_pc_auto_check && sku_pc_auto_check.length && !window.__SKU_PC_AUTO_CHECK_FLAG[order_id]) {
                var $subSkuNew = dialogInst.wrap.find('#sub_sku_new')
                var $btnEditSku = $subSkuNew.find('.btn-edit-sku')
                var sku_pc_auto_check_html = []
                tcb.each(sku_pc_auto_check, function (i, val) {
                    sku_pc_auto_check_html.push('<div>' + val.group_name + '：' + val.group_value + '</div>')
                })
                sku_pc_auto_check_html = '<div class="pre-assess-sku-list" style="color: #f50;">' + sku_pc_auto_check_html.join('') + '</div>'
                if ($btnEditSku && $btnEditSku.length) {
                    $btnEditSku.before(sku_pc_auto_check_html)
                } else {
                    $subSkuNew.append(sku_pc_auto_check_html)
                }
            }
            __bindEventFormEditAssessSku(dialogInst.wrap.find('form'))
            __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))
        }

        // 重新评估回收手机SKU
        function __bindEventFormEditAssessSku($form) {
            if (!($form && $form.length)) {
                return
            }

            $form.on('submit', function (e) {
                e.preventDefault()
                $.getJSON('/m/aj_edit_sku_options_new', $form.serialize(), function (res) {
                    if (!res['errno']) {
                        tcb.closeDialog()

                        if (window.__REMOTE_CHECK_FLAG) {
                            $.dialog.alert('重新评估成功！', function () {
                                window.XXG.redirect()
                            })
                        } else {
                            var new_price = res['result'] || 0
                            $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                                window.XXG.redirect()
                            })
                        }

                        // __saveEditAssessPrice(new_price, function () {
                        //     $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                        //         window.XXG.redirect()
                        //     })
                        // })
                        // window.getFinalPriceStructure(new_price, function () {
                        //     $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                        //         window.XXG.redirect()
                        //     })
                        // })
                    } else {
                        $.dialog.toast(res['errmsg'])
                    }
                })
            })
        }


        // 获取精细评估数据
        function __getOrderAssessOptionsExempt(callback) {
            $.get('/Recycle/Engineer/Exempt/getItem', {
                category_id: window.__ORDER_INFO.category_id,
                order_id: window.__ORDER_INFO.order_id
            }, function (res) {
                if (!res.errno) {
                    $.isFunction(callback) && callback(res.result)
                } else {
                    $.dialog.toast(res['errmsg'])
                }
            })
        }

        // 展示精细评估弹窗
        function __showOrderAssessOptionsExempt($trigger) {
            var order_id = $trigger.attr('data-order-id'),
                assessResult = window.__SPECIAL_ASSESS,
                assessResultByUser = [] // 用户的评估结果

            if (assessResult && assessResult[order_id]) {
                $.each(assessResult[order_id], function (i, item) {
                    assessResultByUser.push({
                        'name': item['name'],
                        'selected': item['select']
                    })
                })
            }
            __getOrderAssessOptionsExempt(function (resultData) {
                var assessOptionsList = resultData.item,
                    insetImgs = resultData.insetImgs
                var html_fn = $.tmpl($.trim($('#JsXxgViewHsDetailExemptEngineerTpl').html())),
                    html_st = html_fn({
                        'insetImgs': insetImgs,
                        'assessResultByUser': assessResultByUser,
                        'assessOptionsList': assessOptionsList,
                        'order_id': order_id,
                        'order_status': window.__ORDER_STATUS || 0/*,
                        'cacheAssessOptionsList': __cacheAssessOptionsExempt*/
                    })

                var dialogInst = tcb.showDialog(html_st, {
                    withMask: true,
                    middle: true
                })
                __bindEventFormEditAssessOptionsExempt(dialogInst.wrap.find('form'))
                __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))

                //设置筛选开始日期
                $('.js-trigger-pick-date').mdater({
                    // minDate : new Date(2015, 2, 10),
                    // cancleText:'',
                    confirmCallback: function ($trigger) {
                        // var name = $trigger.attr('name'),
                        //     val = $trigger.val()
                        // __cacheAssessOptionsExempt[name] = val
                    }
                })

                //设置筛选开始日期
                $('.js-trigger-get-phone-warranty-date').on('click', function () {
                    $.dialog.confirm('是否查询保修信息?', function () {
                        $.post('/Recycle/Engineer/Exempt/getIphoneInfo', {order_id: window.__ORDER_INFO.order_id}, function (res) {
                            if (!res['errno']) {
                                var baoxiu = res['result']['baoxiu_date']
                                $('input[name="item[item_2]"]').val(baoxiu)
                                baoxiu = baoxiu === '' ? '已过期' : baoxiu
                                $.dialog.alert('保修期: ' + baoxiu)
                            } else {
                                $.dialog.toast(res['errmsg'])
                            }
                        })
                    })
                })

                // 上傳圖片
                var $TriggerUpload = $('.js-trigger-UploadPicture')
                //检测图片是否有值，有值显示图片
                if (insetImgs) {

                    $('.oneImage').css('backgroundImage', 'url(' + insetImgs.board_img + ')')
                    $('.twoImage').css('backgroundImage', 'url(' + insetImgs.screen_img + ')')
                    return

                }
                window.TakePhotoUpload && new window.TakePhotoUpload({
                    $trigger: $TriggerUpload,
                    supportCapture: false,
                    callback_upload_success: function (inst, data) {
                        console.log('触发了上传图片的函数')
                        if (data && !data.errno) {
                            var $triggerCurrent = inst.$triggerCurrent
                            if (!($triggerCurrent && $triggerCurrent.length)) {
                                return
                            }
                            $triggerCurrent.css('backgroundImage', 'url(' + data.result + ')')
                            $triggerCurrent.closest('.trigger-wrap').find('input').val(data.result)
                            // $triggerCurrent.closest('.trigger-wrap').find('.js-trigger-DelPicture').css('display','inline-block')
                            console.log('---上传图片的地址---', data.result)
                        } else {
                            return $.dialog.toast((data && data.errmsg) || '系统错误')
                        }
                    },
                    callback_upload_fail: function (me, xhr, status, err) {
                        $.dialog.toast(xhr.statusText || '上传失败，请稍后再试')
                    }
                })

                //删除图片
                // $(".js-trigger-DelPicture").on("click",function(){
                //     console.log('删除图片')
                //     $('.js-trigger-UploadPicture').css('backgroundImage', '').closest('.trigger-wrap').find('.js-trigger-DelPicture').css('display','none')
                // });
            })
        }

        // 精细评估表单绑定事件
        function __bindEventFormEditAssessOptionsExempt($form) {
            if (!($form && $form.length)) {
                return
            }


            $form.on('submit', function (e) {
                e.preventDefault()
                if (!__validFormEditAssessOptionsExempt($form)) {
                    return $.dialog.alert('精细评估项不能为空')
                }


                if ($('.img-url-one').val().length > 0 && $('.img-url-two').val().length > 0) {

                    $.dialog.confirm('精细评估项提交后无法修改，请确认后提交', function () {
                        $.post('/Recycle/Engineer/Exempt/submit', $form.serialize(), function (res) {
                            if (!res['errno']) {
                                tcb.closeDialog()
                                var new_price = res['result']['price'] || 0
                                $.dialog.alert('精细评估价格为' + new_price + '元', function () {
                                    window.XXG.redirect()
                                })
                            } else {
                                $.dialog.toast(res['errmsg'])
                            }
                        })
                    })

                } else {
                    $.dialog.alert('请上传拆机照片再提交~')

                }


            })

            // 缓存用户评估结果
            // $form.find('select, input').on('change',function (e) {
            //     e.preventDefault()
            //
            //     var $me = $(this),
            //         type = $me.attr('type'),
            //         name = $me.attr('name'),
            //         val = $me.val()
            //
            //     if (type == 'checkbox') {
            //         if(!__cacheAssessOptionsExempt[name]){
            //             __cacheAssessOptionsExempt[name] = {}
            //         }
            //         __cacheAssessOptionsExempt[name][val] = $me.prop('checked') ? true : false
            //     } else {
            //         __cacheAssessOptionsExempt[name] = val
            //     }
            // })
        }

        // 验证精细评估项
        function __validFormEditAssessOptionsExempt($form) {
            var flag = true

            $form.find('select, input[type="text"]').each(function () {
                var $me = $(this)
                var $row = $me.closest('.row')

                if (!$me.val()) {
                    flag = false
                    $row.addClass('row-error')
                } else {
                    $row.removeClass('row-error')
                }
            })
            $form.find('.row').each(function () {
                var $checkbox = $(this).find('input[type="checkbox"]')

                if ($checkbox.length) {
                    var $row = $checkbox.closest('.row')
                    var $checked = $checkbox.filter(function () {
                        return $(this).prop('checked')
                    })

                    if (!$checked.length) {
                        flag = false
                        $row.addClass('row-error')
                    } else {
                        $row.removeClass('row-error')
                    }
                }
            })

            return flag

        }

        // 弹窗tab切换
        function __bindEventChangeCompareTab($tab) {
            $tab.on('click', function (e) {
                e.preventDefault()

                var $me = $(this)
                $me.addClass('item-cur').siblings('.item-cur').removeClass('item-cur')
                $me.parents('.dialog-inner').find('.tab-cont .item').eq($me.index()).show().siblings('.item').hide()
            })
        }

        // function __saveEditAssessPrice(price, callback) {
        //     window.getFinalPriceStructure(price, function () {
        //         var orderInfo = window.__ORDER_INFO || {}
        //         var order_id = orderInfo.order_id
        //         window.XXG.ajax({
        //             url: '/m/aj_up_order_info',
        //             data: {
        //                 order_id: order_id,
        //                 price: price
        //             },
        //             success: function (res) {
        //                 if (res && !res.errno) {
        //                     typeof callback === 'function' && callback()
        //                 } else {
        //                     $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试')
        //                 }
        //             },
        //             error: function (err) {
        //                 $.dialog.toast(err.statusText || '系统错误，请稍后重试')
        //             }
        //         })
        //     })
        // }

        function __getPicture(order_id, callback) {
            window.XXG.ajax({
                url: '/m/doGetPingzheng',
                data: {
                    order_id: order_id
                },
                success: function (res) {
                    if (!res.errno) {
                        $.isFunction(callback) && callback(res)
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                },
                error: function (err) {
                    //$.dialog.toast ('系统错误，请稍后重试')
                }
            })
        }

        function __setShowPicturesRowStatus() {
            var $triggerShowPictures = $('.js-trigger-show-pictures'),
                status = $triggerShowPictures.attr('data-now-status')
            if (status >= 13 && status < 50) {
                __getPicture($triggerShowPictures.attr('data-order-id'), function (res) {
                    if (res && res.result && res.result.length) {
                        $triggerShowPictures.closest('.row').show()
                    }
                })
            }
        }

    })

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/ocr_imei.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }
    var compress_width = 1080,
        compress_height = 1920,
        compress_quality = .7

    var isAutoOrientated

    tcb.checkAutoOrientated &&
    tcb.checkAutoOrientated(function (res) {
        isAutoOrientated = res
    })

    // ************
    // 处理函数
    // ************
    function __bindEvent($wrap) {
        tcb.bindEvent($wrap[0], {
            '.js-trigger-take-photo-imei': function (e) {
                e.preventDefault()
                __triggerStartTakePhotoImei()
            }
        })
    }

    function __bindEventUploadPicture($trigger) {
        $trigger.on('change', function (e) {
            var $me = $(this)

            // 获取文件列表对象
            var files = e.target.files || e.dataTransfer.files,
                file = files[0]

            try {
                // 压缩、上传图片
                __compressUpload(file, $me)
            } catch (ex) {
                // 压缩上传报错失败了，再次尝试用普通方式上传
                tcb.warn(ex)
                __originalUpload(file, $me)
            }
        })
    }

    function __triggerStartTakePhotoImei() {
        if ((window.__IS_XXG_IN_SUNING && !window.__IS_XXG_IN_SUNING_ANDROID) || !tcb.js2AppInvokeTakePicture(function (imgBase64) {
            imgBase64 = imgBase64.indexOf('base64,') > -1
                ? imgBase64
                : 'data:image/png;base64,' + imgBase64
            __suningTakePictureSuccess(imgBase64, $('.js-trigger-take-photo-imei-invoke-camera'))
        })) {
            $('.js-trigger-take-photo-imei-invoke-camera').trigger('click')
        }
    }

    function __suningTakePictureSuccess(img_base64, $trigger) {
        __suningDoCompressImg(img_base64, __generateHandlerCompressImgSuccess($trigger))
    }

    function __suningDoCompressImg(img_base64, callback) {
        var maxSize = 500 * 1024 // 500KB
        var result = img_base64

        if (result.length < maxSize) {
            callback(result)
        } else {
            tcb.imageOnload(result, function (imgObj) {
                var file_type = (result.split(';')[0]).split(':')[1] || ''
                __getCompressedImg(imgObj, file_type, callback)
            })
        }
    }


    function __uploadImgBase64(formData, success, error) {
        __uploadImg(formData, success, error, '/m/doUpdateImgForBase64')
    }

    function __uploadImg(formData, success, error, url) {
        if (!formData) {
            return
        }
        success = $.isFunction(success) ? success : function (data) {
            console.log(data)
        }
        error = $.isFunction(error) ? error : function (xhr, status, err) {
            console.log(err)
        }
        tcb.loadingStart()
        $.ajax({
            url: url ? url : '/m/doUpdateImg',
            type: 'post',
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            data: formData,
            success: success,
            error: error,
            complete: function () {
                $('.js-trigger-take-photo-imei-invoke-camera').val('')
                setTimeout(function () {
                    tcb.loadingDone()
                }, 500)
            }
        })
    }

    function __uploadImgSuccess($trigger) {
        return function (data) {
            if (data && !data.errno) {
                __getImei({
                    imgUrl: data.result
                })
            } else {
                return $.dialog.toast((data && data.errmsg) || '系统错误')
            }
        }
    }

    function __uploadImgFail($trigger) {
        return function (xhr, status, err) {
            $.dialog.toast(xhr.statusText || '上传失败，请稍后再试')
        }
    }

    // 压缩、上传图片
    function __compressUpload(file, $trigger) {
        __doCompressImg(file, __generateHandlerCompressImgSuccess($trigger))
    }

    // 压缩图片
    function __doCompressImg(file, callback) {
        var reader = new FileReader(),
            maxSize = 500 * 1024 // 500KB

        reader.onload = function (e) {
            var result = this.result   //result为data url的形式

            if (result.length < maxSize) {
                callback(result)
            } else {
                tcb.imageOnload(result, function (imgObj) {
                    __getCompressedImg(imgObj, file.type, callback)
                })
            }
        }
        reader.readAsDataURL(file)
    }

    // 获取压缩后的图片
    function __getCompressedImg(img, file_type, callback) {
        EXIF.getData(img, function () {
            var imgObj = this
            var orientation = isAutoOrientated ? 0 : EXIF.getTag(imgObj, 'Orientation')
            var size = __getCompactCompressSize(imgObj.naturalWidth || imgObj.width, imgObj.naturalHeight || imgObj.height),
                w = size[0],
                h = size[1]
            if (orientation == 6 || orientation == 8) {
                w = size[1]
                h = size[0]
            }

            var deg = 0,
                canvas = __createCanvas(w, h),
                ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, w, h)

            switch (orientation) {
                // 正位竖着照
                case 6:
                    ctx.translate(w, 0)
                    deg = 90
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, h, w)
                    break
                // 倒位竖着照
                case 8:
                    ctx.translate(0, h)
                    deg = 270
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, h, w)
                    break
                // 反向横着照
                case 3:
                    ctx.translate(w, h)
                    deg = 180
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, w, h)
                    break
                default :
                    ctx.drawImage(imgObj, 0, 0, w, h)
                    break
            }

            return callback(ctx.canvas.toDataURL('image/jpeg', compress_quality))
            //return callback(file_type === 'image/png'
            //    ? ctx.canvas.toDataURL (file_type)
            //    : ctx.canvas.toDataURL ('image/jpeg', compress_quality))
        })
    }

    function __createCanvas(w, h) {
        var canvas = tcb.cache('XXG_UPLOAD_PICTURE_CANVAS')
        if (!canvas) {
            canvas = document.createElement('canvas')
            tcb.cache('XXG_UPLOAD_PICTURE_CANVAS', canvas)
        }

        canvas.width = w
        canvas.height = h
        return canvas
    }

    function __getCompactCompressSize(width, height) {
        var w_ratio = Math.min(width, height) / compress_width,
            h_ratio = Math.max(width, height) / compress_height,
            ratio = Math.max(w_ratio, h_ratio)

        if (__isSupportMegaPixelImg()) {
            var ratio_log2 = Math.min(Math.floor(Math.log2(w_ratio)), Math.floor(Math.log2(h_ratio)))

            ratio = Math.pow(2, ratio_log2)
        }

        return [width / ratio, height / ratio]
    }

    function __isSupportMegaPixelImg() {
        var is_support = tcb.cache('IS_SUPPORT_MEGA_PIXEL_IMG')
        if (typeof is_support == 'undefined') {
            var canvas = __createCanvas(2500, 2500)
            is_support = !!(canvas.toDataURL('image/png').indexOf('data:image/png') == 0)
        }
        return is_support
    }

    function __generateHandlerCompressImgSuccess($trigger) {
        return function (imgBase64) {
            var formData = new FormData()
            formData.append('pingzheng', imgBase64)
            __uploadImgBase64(formData, __uploadImgSuccess($trigger), __uploadImgFail($trigger))
        }
    }

    // 原图上传
    function __originalUpload(file, $trigger) {
        var formData = new FormData()
        formData.append('pingzheng', file)
        __uploadImg(formData, __uploadImgSuccess($trigger), __uploadImgFail($trigger))
    }

    function __getImei(data) {
        $.ajax({
            url: '/m/ocr_imei',
            type: 'post',
            dataType: 'json',
            data: data,
            success: function (res) {
                if (res && !res.errno) {
                    var imeiList = res.result
                    var html_fn = $.tmpl($.trim($('#JsXxgDialogOcrImeiSelectTpl').html())),
                        html_st = html_fn({
                            imeiList: imeiList
                        })
                    var dialogInst = tcb.showDialog(html_st, {
                        className: 'dialog-orc-imei',
                        middle: true,
                        withClose: false
                    })
                    var $wrap = dialogInst.wrap
                    $wrap.find('.js-trigger-select-imei-option').on('click', function (e) {
                        e.preventDefault()
                        var $me = $(this)
                        $me.addClass('selected').siblings('.selected').removeClass('selected')
                    })
                    $wrap.find('.js-trigger-confirm').on('click', function (e) {
                        e.preventDefault()
                        tcb.closeDialog()
                        var $selected = $wrap.find('.imei-select-list .selected').eq(0)
                        var imei = $selected.attr('data-imei')
                        $('[name="imei"]').val(imei)
                    })
                    $wrap.find('.js-trigger-re-take-photo').on('click', function (e) {
                        e.preventDefault()
                        tcb.closeDialog()
                        __triggerStartTakePhotoImei()
                    })
                    $wrap.find('.js-trigger-input-manual').on('click', function (e) {
                        e.preventDefault()
                        tcb.closeDialog()
                        $('[name="imei"]').focus()
                    })
                } else {
                    return $.dialog.toast((res && res.errmsg) || '系统错误')
                }
            },
            error: function (xhr) {
                $.dialog.toast(xhr.statusText || '系统错误，请稍后再试')
            }
        })
    }

    // ************
    // export
    // ************
    function init($wrap) {
        __bindEvent($wrap)
        __bindEventUploadPicture($wrap.find('.js-trigger-take-photo-imei-invoke-camera'))
    }

    window.imeiOcrInit = init

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/remote_check/upload_reject_picture.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }
    var uploadPictureMap = {}
    var keySet = ['pingzheng1', 'pingzheng2', 'pingzheng3', 'pingzheng4']
    var keyMap = {
        1: 'pingzheng1',
        2: 'pingzheng2',
        3: 'pingzheng3',
        4: 'pingzheng4'
    }
    var isAutoOrientated

    tcb.checkAutoOrientated &&
    tcb.checkAutoOrientated(function (res) {
        isAutoOrientated = res
    })

    // ************
    // 处理函数
    // ************
    function __bindEvent($wrap) {
        tcb.bindEvent($wrap[0], {
            // 启动上传
            '.js-trigger-upload-picture': function (e) {
                e.preventDefault()

                __triggerStartUpload($(this))
            },

            // 删图
            '.js-trigger-del-picture': function (e) {
                e.preventDefault()

                __delPicture($(this))
            }
        })
    }

    function __bindEventUploadPicture($trigger) {
        $trigger.on('change', function (e) {
            var $me = $(this)

            // 获取文件列表对象
            var files = e.target.files || e.dataTransfer.files,
                file = files[0]

            try {
                // 压缩、上传图片
                __compressUpload(file, $me)
            } catch (ex) {
                // 压缩上传报错失败了，再次尝试用普通方式上传
                tcb.warn(ex)

                __originalUpload(file, $me)
            }
        })
    }

    function __delPicture($delTrigger) {
        $delTrigger.hide()

        var $TriggerUploadPicture = $delTrigger.siblings('.js-trigger-upload-picture'),
            $TriggerInvokeCamera = $delTrigger.siblings('.trigger-invoke-camera')

        $TriggerInvokeCamera.val('')

        $TriggerUploadPicture
        //.addClass ('icon-close')
            .css({
                'border': '0',
                'background-image': ''
            })
        uploadPictureMap[$TriggerUploadPicture.attr('data-for')] = ''
        // $('[name="' + $TriggerUploadPicture.attr('data-for') + '"]').val('')

        __hideProcessBar($delTrigger.siblings('.fake-upload-progress'))
    }

    function __showProcessBar($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.show()

        var percent_val = 25
        $processBarInner.css({'width': percent_val + '%'})

        setTimeout(function h() {
            percent_val += 12
            if (percent_val > 100) {
                return
            }
            if ($processBarInner.css('width') == '100%') {
                return
            }
            $processBarInner.css({'width': percent_val + '%'})

            if (percent_val < 100) {
                setTimeout(h, 500)
            }
        }, 500)
    }

    function __showProcessBar100($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.show()
        $processBarInner.css({'width': '100%'})
    }

    function __hideProcessBar($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.hide()
        $processBarInner.css({'width': '0'})
    }

    function __setUploadingPicture($trigger, img) {
        if (!img) {
            return
        }
        $trigger
            .css({
                'border': '1px solid #ddd',
                'background-image': 'url(' + img + ')' // tcb.imgThumbUrl(img, 300, 300, 'edr')
            })
    }

    function __setUploadedPicture($trigger, img) {
        if (!img) {
            return
        }
        var $DelPicture = $trigger.siblings('.js-trigger-del-picture')

        $DelPicture.show()
        uploadPictureMap[$trigger.attr('data-for')] = img
        // $('[name="' + $trigger.attr('data-for') + '"]').val(img)
    }

    function __triggerStartUpload($trigger) {
        var mode
        if ($trigger && $trigger.length) {
            mode = $trigger.attr('data-mode') || ''
        }
        if ((window.__IS_XXG_IN_SUNING && !window.__IS_XXG_IN_SUNING_ANDROID) || !tcb.js2AppInvokeTakePicture(function (imgBase64) {
            imgBase64 = imgBase64.indexOf('base64,') > -1
                ? imgBase64
                : 'data:image/png;base64,' + imgBase64
            __suningTakePictureSuccess(imgBase64, $trigger.siblings('.trigger-invoke-camera'))
        }, mode)) {
            var $triggerInvoke = $trigger.siblings('.trigger-invoke-camera')
            if (tcb.isXxgAppAndroidSupportCustomCamera() && mode) {
                $triggerInvoke.attr('accept', 'tcb-camera/' + mode)
            }
            $triggerInvoke.trigger('click')
        }
    }

    // 压缩、上传图片
    function __compressUpload(file, $trigger) {
        __doCompressImg(file, __generateHandlerCompressImgSuccess($trigger))
    }

    // 原图上传
    function __originalUpload(file, $trigger) {
        var $processBar = $trigger.siblings('.fake-upload-progress')

        __setUploadingPicture($trigger.siblings('.js-trigger-upload-picture'), window.URL.createObjectURL(file))
        __showProcessBar($processBar)

        var formData = new FormData()
        formData.append('pingzheng', file)
        __uploadImg(formData, function (data) {
            if (data.errno) {
                __delPicture($trigger.siblings('.js-trigger-del-picture'))

                return $.dialog.toast(data.errmsg)
            }
            __showProcessBar100($processBar)
            __setUploadedPicture($trigger.siblings('.js-trigger-upload-picture'), data.result)
        }, function (xhr, status, err) {
            $.dialog.toast('上传失败，请稍后再试')
            __delPicture($trigger.siblings('.js-trigger-del-picture'))
        })
    }

    function __suningDoCompressImg(img_base64, callback) {
        var maxSize = 500 * 1024 // 500KB
        var result = img_base64

        if (result.length < maxSize) {
            callback(result)
        } else {
            tcb.imageOnload(result, function (imgObj) {
                var file_type = (result.split(';')[0]).split(':')[1] || ''
                __getCompressedImg(imgObj, file_type, callback)
            })
        }
    }

    function __suningTakePictureSuccess(img_base64, $trigger) {
        __suningDoCompressImg(img_base64, __generateHandlerCompressImgSuccess($trigger))
    }

    function __uploadImg(formData, success, error, url) {
        if (!formData) {
            return
        }
        success = $.isFunction(success) ? success : function (data) {
            console.log(data)
        }
        error = $.isFunction(error) ? error : function (xhr, status, err) {
            console.log(err)
        }
        $.ajax({
            //url         : '/aj/uploadPic',
            //url         : '/m/doUpdateImgForBase64',
            url: url ? url : '/m/doUpdateImg',
            type: 'post',
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            data: formData,
            success: success,
            error: error
        })
    }

    function __uploadImgBase64(formData, success, error) {
        __uploadImg(formData, success, error, '/m/doUpdateImgForBase64')
    }

    var compress_width = 1080,
        compress_height = 1920,
        compress_quality = .7

    function __doCompressImg(file, callback) {
        var reader = new FileReader(),
            maxSize = 500 * 1024 // 500KB

        reader.onload = function (e) {
            var result = this.result   //result为data url的形式

            if (result.length < maxSize) {
                callback(result)
            } else {
                tcb.imageOnload(result, function (imgObj) {
                    __getCompressedImg(imgObj, file.type, callback)
                })
            }
        }
        reader.readAsDataURL(file)
    }

    function __getCompressedImg(img, file_type, callback) {
        EXIF.getData(img, function () {
            var imgObj = this
            var orientation = isAutoOrientated ? 0 : EXIF.getTag(imgObj, 'Orientation')
            var size = __getCompactCompressSize(imgObj.naturalWidth || imgObj.width, imgObj.naturalHeight || imgObj.height),
                w = size[0],
                h = size[1]
            if (orientation == 6 || orientation == 8) {
                w = size[1]
                h = size[0]
            }

            var deg = 0,
                canvas = __createCanvas(w, h),
                ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, w, h)

            switch (orientation) {
                // 正位竖着照
                case 6:
                    ctx.translate(w, 0)
                    deg = 90
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, h, w)
                    break
                // 倒位竖着照
                case 8:
                    ctx.translate(0, h)
                    deg = 270
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, h, w)
                    break
                // 反向横着照
                case 3:
                    ctx.translate(w, h)
                    deg = 180
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, w, h)
                    break
                default :
                    ctx.drawImage(imgObj, 0, 0, w, h)
                    break
            }

            return callback(ctx.canvas.toDataURL('image/jpeg', compress_quality))
            //return callback(file_type === 'image/png'
            //    ? ctx.canvas.toDataURL (file_type)
            //    : ctx.canvas.toDataURL ('image/jpeg', compress_quality))
        })
    }

    function __generateHandlerCompressImgSuccess($trigger) {
        return function (imgBase64) {
            var $processBar = $trigger.siblings('.fake-upload-progress')

            __setUploadingPicture($trigger.siblings('.js-trigger-upload-picture'), imgBase64)
            __showProcessBar($processBar)

            var formData = new FormData()
            formData.append('pingzheng', imgBase64)
            __uploadImgBase64(formData, function (data) {
                if (data.errno) {
                    __delPicture($trigger.siblings('.js-trigger-del-picture'))

                    return $.dialog.toast(data.errmsg)
                }
                __showProcessBar100($processBar)
                __setUploadedPicture($trigger.siblings('.js-trigger-upload-picture'), data.result)
            }, function (xhr, status, err) {
                $.dialog.toast('上传失败，请稍后再试')
                __delPicture($trigger.siblings('.js-trigger-del-picture'))
            })
        }
    }

    function __createCanvas(w, h) {
        var canvas = tcb.cache('XXG_UPLOAD_PICTURE_CANVAS')
        if (!canvas) {
            canvas = document.createElement('canvas')
            tcb.cache('XXG_UPLOAD_PICTURE_CANVAS', canvas)
        }

        canvas.width = w
        canvas.height = h
        return canvas
    }

    function __getCompactCompressSize(width, height) {
        var w_ratio = Math.min(width, height) / compress_width,
            h_ratio = Math.max(width, height) / compress_height,
            ratio = Math.max(w_ratio, h_ratio)

        if (__isSupportMegaPixelImg()) {
            var ratio_log2 = Math.min(Math.floor(Math.log2(w_ratio)), Math.floor(Math.log2(h_ratio)))

            ratio = Math.pow(2, ratio_log2)
        }

        return [width / ratio, height / ratio]
    }

    function __isSupportMegaPixelImg() {
        var is_support = tcb.cache('IS_SUPPORT_MEGA_PIXEL_IMG')
        if (typeof is_support == 'undefined') {
            var canvas = __createCanvas(2500, 2500)
            is_support = !!(canvas.toDataURL('image/png').indexOf('data:image/png') == 0)
        }
        return is_support
    }

    function __getPicture(order_id, callback) {
        window.XXG.ajax({
            url: '/m/doGetPingzheng',
            data: {order_id: order_id},
            success: function (res) {
                if (!res.errno) {
                    $.isFunction(callback) && callback(true, res.result || [])
                } else {
                    $.dialog.toast(res.errmsg)
                    $.isFunction(callback) && callback(false)
                }
            },
            error: function (err) {
                $.dialog.toast('系统错误，请稍后重试')
                $.isFunction(callback) && callback(false)
            }
        })
    }

    // ************
    // export
    // ************

    function init($wrap, remote_check_tagging_imgs, uploadKeySet, uploadKeyMap) {
        if (uploadKeySet) {
            keySet = uploadKeySet
        }
        if (uploadKeyMap) {
            keyMap = uploadKeyMap
        }
        uploadPictureMap = {}
        tcb.each(remote_check_tagging_imgs, function (k) {
            uploadPictureMap[keyMap[k]] = ''
        })
        __bindEvent($wrap)
        __bindEventUploadPicture($wrap.find('.trigger-invoke-camera'))
    }

    function submitPicture() {
        if (!window.isRemoteCheckWorkTime()){
            return $.dialog.alert('服务时间为早9点至晚10点，请在此时间段内操作订单')
        }
        var order_id = window.__ORDER_ID
        var data = {
            order_id: order_id
        }
        var flag = true
        tcb.each(uploadPictureMap, function (k, v) {
            if (!v) {
                return flag = false
            }
            data[k] = v
        })
        if (!flag) {
            return $.dialog.toast('请重新上传所有的驳回照片')
        }
        tcb.loadingStart()

        __getPicture(order_id, function (isSucc, imgs) {
            if (!isSucc) {
                return tcb.loadingDone()
            }
            tcb.each(imgs, function (i, img) {
                if (!data[keySet[i]]) {
                    data[keySet[i]] = img
                }
            })
            window.XXG.ajax({
                url: '/m/doUpdatePingzheng',
                type: 'POST',
                data: data,
                success: function (res) {
                    if (!res.errno) {
                        setTimeout(function () {
                            window.remoteCheckListenStart(order_id, true)
                            tcb.loadingDone()
                        }, 1000)
                    } else {
                        $.dialog.toast(res.errmsg)
                        tcb.loadingDone()
                    }
                },
                error: function (err) {
                    $.dialog.toast('系统错误，请稍后重试')
                    tcb.loadingDone()
                }
            })
        })
    }

    window.remoteCheckUploadRejectPictureInit = init
    window.remoteCheckUploadRejectPicturesubmitPicture = submitPicture

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/remote_check.js` **/
// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    var NOW_PADDING = window.__NOW - Date.now()
    var startCountdown = Bang.startCountdown
    var openBiggerShow = Bang.openBiggerShow
    var wsInst
    var __checkWaitingCountdownStopHandle
    var __checkingCountdownStopHandle
    var __flag_stop = true

    function remoteCheckListenStart(order_id, is_force_auth) {
        remoteCheckListenClose()

        if (!window.__REMOTE_CHECK_FLAG) {
            // 不支持远程验机，直接返回不做任何处理
            return
        }
        if (!window.__REMOTE_CHECK_AUTH) {
            return $.dialog.alert('无法获取远程验机的权证，无法开启远程验机，请重试')
        }

        try {
            if (!is_force_auth && window.__REMOTE_CHECK_ID) {
                __startLoopCheck(window.__REMOTE_CHECK_ID)
            } else {
                __remoteCheckAuth(function () {
                    __remoteOrderPush(order_id, function () {
                        __startLoopCheck(window.__REMOTE_CHECK_ID)
                    })
                })
            }
        } catch (e) {
            return $.dialog.alert(e.message || '远程验机通道建立失败，请重试')
        }
    }

    function remoteCheckListenClose() {
        __stopLoopCheck()
    }

    function setRemoteCheckStatus() {
        if (typeof __checkWaitingCountdownStopHandle == 'function') {
            __checkWaitingCountdownStopHandle()
            __checkWaitingCountdownStopHandle = null
        }
        if (typeof __checkingCountdownStopHandle == 'function') {
            __checkingCountdownStopHandle()
            __checkingCountdownStopHandle = null
        }
        // 值为空 或者 0，表示还没有开启验机流程
        if (!window.__REMOTE_CHECK_FLAG_PROCESS) {
            remoteCheckListenClose()
            hideBlockRemoteCheck()
            return
        }

        if (window.__REMOTE_CHECK_FLAG_PROCESS == -1) {
            // 驳回
            remoteCheckReject()
            return window.hideOrderDealInfo()
        } else if (window.__REMOTE_CHECK_FLAG_PROCESS == 1) {
            // 判断时间
            if (window.__REMOTE_CHECK_TIMEOUT > window.__NOW) {
                // 等待审核中
                remoteCheckWaiting()
            } else {
                // 等待超时
                remoteCheckWaitingOutTime()
            }
            // 黑名单用户,超过特定时间只能明天下单
            if (window.__REMOTE_CHECK_TOMORROW) {
                remoteCheckTomorrow()
            }
        } else if (window.__REMOTE_CHECK_FLAG_PROCESS == 2) {
            // 审核中
            remoteChecking()
        } else if (window.__REMOTE_CHECK_FLAG_PROCESS == 3) {
            // 审核成功
            remoteCheckSuccess()
        }

        if (window.__REMOTE_CHECK_FLAG_PROCESS == 3) {
            // 审核成功
            var orderInfo = window.__ORDER_INFO || {}
            var finalPriceStructure = window.__FINAL_PRICE_STRUCTURE_LIST[orderInfo.order_id] || {}
            var add_price_flag = finalPriceStructure.add_price_flag
            var price_setup = parseInt(orderInfo.final_price, 10) // 已经设置过的价格
            var price = price_setup || window.__REMOTE_CHECK_PRICE

            if (add_price_flag) {
                if (orderInfo.status < 13
                    && !price_setup) {
                    // 条件说明：
                    // 1、远程验机完成
                    // 2、有加价标识
                    // 3、订单还未完成
                    // 4、还未设置final_price（当final_price大于0的时候，表示xxg编辑、保存过成交，那么不再使用远程验机价）
                    getFinalPriceStructure(price, function (add_price, sum_price) {
                        if (add_price > -1) {
                            finalPriceStructure.pinggu_price = price
                            finalPriceStructure.add_price = add_price
                            finalPriceStructure.sum_price = sum_price
                            window.__FINAL_PRICE_STRUCTURE_LIST[orderInfo.order_id] = finalPriceStructure
                        }
                        window.renderOrderDealInfo()
                    })
                } else {
                    window.renderOrderDealInfo()
                }
            } else {
                finalPriceStructure.pinggu_price = price
                finalPriceStructure.add_price = 0
                finalPriceStructure.sum_price = price
                window.__FINAL_PRICE_STRUCTURE_LIST[orderInfo.order_id] = finalPriceStructure

                window.renderOrderDealInfo()
            }
        } else {
            window.renderOrderDealInfo()
        }
    }

    // 远程验机等待ing
    function remoteCheckWaiting() {
        var $BlockOrderRemoteCheck = renderRemoteCheckOptions({
            check_tip: '预计<span class="remote-check-countdown"></span>分钟内处理',
            check_tip_desc: '已提交审核，请您稍候'
        })
        setUIButtonStatus(1)
        showBlockRemoteCheck()

        var $countdown = $BlockOrderRemoteCheck.find('.remote-check-countdown')
        var timeout = window.__REMOTE_CHECK_TIMEOUT
        __checkWaitingCountdownStopHandle = startCountdown(timeout, nowTime(), $countdown, {
            end: function () {
                remoteCheckWaitingOutTime()
            }
        })
    }

    // 远程验机等待超时
    function remoteCheckWaitingOutTime() {
        renderRemoteCheckOptions({
            check_tip: '正在加急处理，请耐心等待!',
            check_tip_desc: '已提交审核，请您稍候'
        })
        setUIButtonStatus(1)
        showBlockRemoteCheck()
        // 判断时间
        if (window.__REMOTE_CHECK_TIMEOUT > nowTime()) {
            setRemoteCheckStatus()
        }
    }

    // 远程验机ing
    function remoteChecking() {
        var $BlockOrderRemoteCheck = renderRemoteCheckOptions({
            check_tip: '预计<span class="remote-check-countdown"></span>分钟内完成',
            check_tip_desc: '审核人员正在处理，请您稍候'
        })
        setUIButtonStatus(1)
        showBlockRemoteCheck()

        var $countdown = $BlockOrderRemoteCheck.find('.remote-check-countdown')
        var timeout = window.__REMOTE_CHECK_TIMEOUT
        __checkingCountdownStopHandle = startCountdown(timeout, nowTime(), $countdown, {
            end: function () {
                // remoteCheckingOutTime()
            }
        })
    }

    // 远程验机超时
    function remoteCheckingOutTime() {
        remoteCheckListenClose()
        setUIButtonStatus(2)
        showBlockRemoteCheck()
        window.__REMOTE_CHECK_FLAG_PROCESS = 3
        nowTime()
        setRemoteCheckStatus()
    }

    // 远程验机被驳回
    function remoteCheckReject() {
        remoteCheckListenClose()
        setUIButtonStatus(3)

        var orderInfo = window.__ORDER_INFO || {}
        window.apiGetUploadPictureShootRule({
            categoryId: orderInfo.category_id
        }, function (res) {
            var uploadList = res.result || []
            var _uploadKeySet = []
            var _uploadKeyMap = {}
            tcb.each(uploadList, function (i, item) {
                _uploadKeySet.push(item.name)
                _uploadKeyMap[i+1] = item.name
            })
            var uploadKeySet = _uploadKeySet
            var uploadKeyMap = _uploadKeyMap

            var $Block = renderRemoteCheckReject({
                remote_check_remarks: window.__REMOTE_CHECK_REMARKS,
                remote_check_tagging_imgs: window.__REMOTE_CHECK_TAGGING_IMGS || {},
                uploadList: uploadList
            })
            showBlockRemoteCheck()
            window.remoteCheckUploadRejectPictureInit($Block, window.__REMOTE_CHECK_TAGGING_IMGS || {}, uploadKeySet, uploadKeyMap)
        })
    }

    // 远程验机成功
    function remoteCheckSuccess() {
        remoteCheckListenClose()

        var orderInfo = window.__ORDER_INFO || {}
        var remote_check_options = window.__REMOTE_CHECK_OPTIONS || []
        var remote_check_tagging_imgs = window.__REMOTE_CHECK_TAGGING_IMGS || {}
        var remote_check_remarks = window.__REMOTE_CHECK_REMARKS || ''
        var isSuccessPerfect = true
        tcb.each(remote_check_options, function (i, item) {
            if (!item.succ) {
                isSuccessPerfect = false
            }
        })
        tcb.each(remote_check_tagging_imgs, function (i, item) {
            if (item) {
                isSuccessPerfect = false
            }
        })

        setUIButtonStatus(2)
        if (isSuccessPerfect) {
            // 完美通过审核
            renderRemoteCheckSuccessPerfect({
                remote_check_options: remote_check_options,
                remote_check_remarks: remote_check_remarks
            })
        } else {
            // 审核通过，但是有差异项
            renderRemoteCheckSuccessDiff({
                remote_check_options: remote_check_options,
                remote_check_remarks: remote_check_remarks,
                remote_check_tagging_imgs: remote_check_tagging_imgs
            })
        }
        showBlockRemoteCheck()
        window.showAppleCesOrderInfo && window.showAppleCesOrderInfo(orderInfo.order_id)
        // window.renderOrderDealInfo()
    }

    // 黑名单用户超过特定时间段,只可明天下单,修改页面文案
    function remoteCheckTomorrow() {
        remoteCheckListenClose()
        renderRemoteCheckOptions({
            check_tip: '超出订单提交时间,请在工作时间提交',
            check_tip_desc: '请在规定时间内提交订单,其余时间不接单'
        })
        setUIButtonStatus(1)
        showBlockRemoteCheck()
    }

    // 远程验机校权
    function __remoteCheckAuth(callback) {
        if (!window.__REMOTE_CHECK_API) {
            return $.dialog.alert('无法获取接口服务器信息，请服务器管理员')
        }
        var request_url = window.__REMOTE_CHECK_API + '/RemoteCheck/Common/auth'
        window.XXG.ajax({
            url: request_url,
            method: 'POST',
            data: {
                'auth_token': window.__REMOTE_CHECK_AUTH,
                'auth': 1
            },
            xhrFields: {withCredentials: true},
            success: function (res) {
                if (!res || res.errno) {
                    return $.dialog.alert(res.errmsg || '系统错误，暂时无法提供远程验机服务')
                }
                typeof callback == 'function' && callback(res)
            },
            error: function (err) {
                return $.dialog.alert(err.statusText || '系统错误，暂时无法提供远程验机服务')
            }
        })
    }

    // 将远程验机加入队列，并且获取远程验机id，赋值给window.__REMOTE_CHECK_ID
    function __remoteOrderPush(order_id, callback) {
        if (!window.__REMOTE_CHECK_API) {
            return $.dialog.alert('无法获取接口服务器信息，请服务器管理员')
        }

        var request_url = window.__REMOTE_CHECK_API + '/RemoteCheck/Engineer/orderPush'
        window.XXG.ajax({
            url: request_url,
            method: 'POST',
            data: {
                'order_id': order_id
            },
            xhrFields: {withCredentials: true},
            success: function (res) {
                if (!res || res.errno) {
                    return $.dialog.alert(res.errmsg || '系统错误，暂时无法提供远程验机服务')
                }
                if (res && res.data && res.data.check_id) {
                    window.__REMOTE_CHECK_ID = res.data.check_id
                }
                typeof callback == 'function' && callback(res)
            },
            error: function (err) {
                return $.dialog.alert(err.statusText || '系统错误，暂时无法提供远程验机服务')
            }
        })
    }

    // 循环检测远程验机状态和数据
    function __startLoopCheck(remote_check_id) {
        __flag_stop = false

        var delay = 2000

        function loop() {
            if (__flag_stop) return

            wsInst = setTimeout(loop, delay)
            checking(function (remoteCheck) {
                if (window.__REMOTE_CHECK_FLAG_PROCESS != remoteCheck.remote_check_flag_process) {
                    setRemoteCheck(remoteCheck)
                    setRemoteCheckStatus()
                    // if (!wsInst) {
                    //     __flag_stop = false
                    //     wsInst = setTimeout(loop, delay)
                    // }
                }
            }, remote_check_id)
        }

        function checking(callback, remote_check_id) {
            window.getRemoteCheckOptions(function (remoteCheck) {
                if (!remoteCheck) return
                typeof callback == 'function' && callback(remoteCheck)
            }, remote_check_id)
        }

        function setRemoteCheck(remoteCheck) {
            window.__REMOTE_CHECK_OPTIONS = remoteCheck.remote_check_options
            window.__REMOTE_CHECK_FLAG_PROCESS = remoteCheck.remote_check_flag_process
            window.__REMOTE_CHECK_TIMEOUT = remoteCheck.remote_check_timeout * 1000
            window.__REMOTE_CHECK_REMARKS = remoteCheck.remote_check_remarks
            window.__REMOTE_CHECK_PRICE = remoteCheck.remote_check_price
            window.__REMOTE_CHECK_TAGGING_IMGS = remoteCheck.remote_check_tagging_imgs
        }

        checking(function (remoteCheck) {
            setRemoteCheck(remoteCheck)
            setRemoteCheckStatus()
            loop()
        }, remote_check_id)
        // setRemoteCheckStatus()
    }

    // 停止循环检测
    function __stopLoopCheck() {
        __flag_stop = true
        if (wsInst) {
            clearTimeout(wsInst)
            wsInst = null
        }
    }

    function setUIButtonStatus(type) {
        var $btnNext = $('.js-btn-go-next')

        switch (type) {
            case 1:
                // 审核中
                $btnNext
                    .addClass('btn-go-next-lock')
                    .html('审核中...')
                break
            case 2:
                // 远程验机成功/超时
                $btnNext
                    .removeClass('btn-go-next-lock')
                    .html('完成订单')
                break
            case 3:
                // 驳回
                $btnNext
                    .removeClass('btn-go-next-lock')
                    .html('重新提交')
                break
            case 4:
                // 将按钮文案恢复到默认状态
                $btnNext
                    .removeClass('btn-go-next-lock')
                    .html($btnNext.attr('data-default-text'))
                break
            default:
                // 记录按钮的默认文案
                $btnNext.attr('data-default-text', $btnNext.html())
        }
        return $btnNext
    }

    function renderRemoteCheckOptions(data) {
        var html_fn = $.tmpl(tcb.trim($('#JsXxgRemoteCheckOptionsTpl').html())),
            html_st = html_fn(data),
            $BlockOrderRemoteCheck = $('#BlockOrderRemoteCheck')

        $BlockOrderRemoteCheck.html(html_st)

        return $BlockOrderRemoteCheck.children().eq(0)
    }

    function renderRemoteCheckSuccessPerfect(data) {
        var html_fn = $.tmpl(tcb.trim($('#JsXxgRemoteCheckSuccessPerfectTpl').html())),
            html_st = html_fn(data),
            $BlockOrderRemoteCheck = $('#BlockOrderRemoteCheck')

        $BlockOrderRemoteCheck.html(html_st)

        return $BlockOrderRemoteCheck.children().eq(0)
    }

    function renderRemoteCheckSuccessDiff(data) {
        var remote_check_tagging_imgs = []
        tcb.each(data.remote_check_tagging_imgs || {}, function (k, v) {
            remote_check_tagging_imgs.push(v)
        })
        data.remote_check_tagging_imgs = remote_check_tagging_imgs

        var html_fn = $.tmpl(tcb.trim($('#JsXxgRemoteCheckSuccessDiffTpl').html())),
            html_st = html_fn(data),
            $BlockOrderRemoteCheck = $('#BlockOrderRemoteCheck')

        $BlockOrderRemoteCheck.html(html_st)

        setTimeout(function () {
            var $imgs = $BlockOrderRemoteCheck.find('.js-trigger-show-big-img')
            var $cols = $BlockOrderRemoteCheck.find('.row-picture .col-2-1')
            var $pics = $BlockOrderRemoteCheck.find('.row-picture .col-2-1 .pic')
            if ($imgs.length) {
                var s = $cols.eq(0).width() - 1
                openBiggerShow($imgs)
                $cols.css({
                    'width': s,
                    'height': s
                })
                $pics.css({
                    'line-height': (s * .96) + 'px'
                })
                tcb.setImgElSize($imgs, s * .96 * .9, s * .96 * .9)
            }
        }, 300)

        return $BlockOrderRemoteCheck.children().eq(0)
    }

    function renderRemoteCheckReject(data) {
        var html_fn = $.tmpl(tcb.trim($('#JsXxgRemoteCheckRejectTpl').html())),
            html_st = html_fn(data),
            $BlockOrderRemoteCheck = $('#BlockOrderRemoteCheck')

        $BlockOrderRemoteCheck.html(html_st)

        return $BlockOrderRemoteCheck.children().eq(0)
    }

    function showBlockRemoteCheck() {
        $('#BlockOrderRemoteCheck').show()
    }

    function hideBlockRemoteCheck() {
        $('#BlockOrderRemoteCheck').hide()
    }

    function nowTime() {
        return window.__NOW = Date.now() + NOW_PADDING
    }

    function bindEvent() {
        // 绑定事件
        tcb.bindEvent({
            // 刷新验机状态
            '.js-trigger-refresh-check-status': function (e) {
                e.preventDefault()

                var $me = $(this),
                    refreshCount = $me.attr('data-refresh-count')

                if ($me.attr('data-refreshing')) {
                    return
                }
                if (refreshCount > 2) {
                    return $.dialog.toast('请不要频繁刷新', 2000)
                }
                refreshCount = (parseInt(refreshCount) || 0) + 1

                $me.attr('data-refresh-count', refreshCount)
                $me.attr('data-refreshing', 1)

                tcb.loadingStart()
                $me.css({opacity: .5})

                setTimeout(function () {
                    $me.css({opacity: 1})
                    $me.attr('data-refreshing', '')
                    tcb.loadingDone()
                }, 2000)
            }
        })
    }

    function init() {
        bindEvent()
        setUIButtonStatus()
    }

    init()
    window.remoteCheckListenStart = remoteCheckListenStart
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/manager_check.js` **/
// 店长审核
(function () {
    if (!window.__IS_NEEDED_MANAGER_CHECK) {
        return
    }

    window.startShopManagerCheck = startShopManagerCheck

    var _countdownStopHandle,
        checkHandleMap = {
            10: checkWaiting,
            20: checkSuccess,
            30: checkReject,
            99: checkTimeout
        }

    // 开启店长审核
    function startShopManagerCheck() {
        getShopManagerCheckProcess(function (result) {
            if (!result) {
                return createShopManagerCheck(loopCheckProcess)
            }

            loopCheckProcess(result)
        })
    }

    function createShopManagerCheck(callback) {
        var url = tcb.setUrl2('/m/createShopManagerCheck', {
            order_id: tcb.queryUrl(window.location.search, 'order_id')
        })
        window.XXG.ajax({
            url: url,
            success: function (res) {
                if (!res || res.errno) {
                    return
                }
                res.result.flag = 10
                typeof callback == 'function' && callback(res.result)
            }
        })
    }

    function getShopManagerCheckProcess(callback) {
        var url = tcb.setUrl2('/m/getShopManagerCheckProcess', {
            order_id: tcb.queryUrl(window.location.search, 'order_id')
        })
        window.XXG.ajax({
            url: url,
            success: function (res) {
                if (!res || res.errno) {
                    return
                }
                typeof callback == 'function' && callback(res.result)
            },
            error: function () {
                typeof callback == 'function' && callback(false)
            }
        })
    }

    function loopCheckProcess(result) {
        $('.block-order-manager-check').show()
        window.__IS_MANAGER_CHECK_STARTED = true

        checkHandleMap[result.flag] && checkHandleMap[result.flag](result)

        if (!(result.flag == 10 || result.flag == 99)) {
            return
        }

        function loop() {

            getShopManagerCheckProcess(function (result) {
                if (result && !(result.flag == 10 || result.flag == 99)) {

                    return checkHandleMap[result.flag] && checkHandleMap[result.flag](result)
                }
                setTimeout(loop, 3000)
            })
        }

        setTimeout(loop, 3000)
    }

    function checkWaiting(result) {
        window.__IS_MANAGER_CHECK_SUCCESS = false

        var end_time = result.timeout_at ? new Date(result.timeout_at.replace(/-/g, '/')).getTime() : (window.__NOW + 3 * 60 * 1000)
        _countdownStopHandle = window.Bang.startCountdown(end_time, window.__NOW, $('.manager-check-countdown'), {
            end: function () {
                checkTimeout()
            }
        })

        //$ ('.js-btn-go-next').addClass ('btn-go-next-lock')
    }

    function checkSuccess(result) {
        window.__IS_MANAGER_CHECK_SUCCESS = true

        typeof _countdownStopHandle == 'function' && _countdownStopHandle()

        var $Block = $('.block-order-manager-check'),
            $CheckTip = $Block.find('.check-tip'),
            $CheckTipDesc = $Block.find('.check-tip-desc')

        $CheckTip.html('审核通过')
        $CheckTipDesc.html('快给用户下单吧')
        //$ ('.js-btn-go-next').removeClass ('btn-go-next-lock')
    }

    function checkReject(result) {
        window.__IS_MANAGER_CHECK_SUCCESS = false

        typeof _countdownStopHandle == 'function' && _countdownStopHandle()

        var $Block = $('.block-order-manager-check'),
            $CheckTip = $Block.find('.check-tip'),
            $CheckTipDesc = $Block.find('.check-tip-desc')

        $CheckTip.html('审核驳回')
        $CheckTipDesc.html('请及时与' + '<a href="tel:' + window.__MANAGER_CHECK_STAFF.mobile +'"> ' + window.__MANAGER_CHECK_STAFF.name + ' ☎️ </a>沟通订单驳回原因')

        var html_fn = $.tmpl(tcb.trim($('#JsMXxgManagerCheckRejectTpl').html())),
            html_st = html_fn({
                manager: result.uid_name,
                operate_time: result.updated_at
            }),
            $html_st = $(html_st)

        $html_st.appendTo('body')

        var mask_h = $('body').height(),
            $win = tcb.getWin(),
            win_h = $win.height()
        $html_st.filter('.dialog-xxg-manager-check-reject-mask').css({
            'height': mask_h < win_h ? win_h : mask_h
        })
        tcb.setElementMiddleScreen($html_st.filter('.dialog-xxg-manager-check-reject'), 10, 20)

        //tcb.showDialog (html_st, {
        //    className : 'dialog-xxg-manager-check-reject',
        //    withClose : false,
        //    middle : true
        //})
        //$ ('.js-btn-go-next').addClass ('btn-go-next-lock')
    }

    function checkTimeout(result) {
        window.__IS_MANAGER_CHECK_SUCCESS = false

        var $Block = $('.block-order-manager-check'),
            $CheckTip = $Block.find('.check-tip'),
            $CheckTipDesc = $Block.find('.check-tip-desc')

        $CheckTip.html('审核超时')
        $CheckTipDesc.html('请等待' + '<a href="tel:' + window.__MANAGER_CHECK_STAFF.mobile +'"> ' + window.__MANAGER_CHECK_STAFF.name + ' ☎️ </a>审核，总部正在辅助处理中')
        //$ ('.js-btn-go-next').addClass ('btn-go-next-lock')
    }

    function init() {
        getShopManagerCheckProcess(function (result) {
            if (result && checkHandleMap[result.flag]) {
                loopCheckProcess(result)
            }
        })

        // 绑定事件
        tcb.bindEvent({
            // 刷新状态
            '.js-trigger-refresh-check-status2': function (e) {
                e.preventDefault()

                var $me = $(this)

                if ($me.attr('data-refreshing')) {
                    return
                }
                $me.attr('data-refreshing', 1)

                tcb.loadingStart()
                $me.css({
                    opacity: .3,
                    filter: 'grayscale(100%)'
                })

                getShopManagerCheckProcess(function (result) {
                    if (result && !(result.flag == 10 || result.flag == 99)) {

                        return checkHandleMap[result.flag] && checkHandleMap[result.flag](result)
                    }
                })

                setTimeout(function () {
                    tcb.loadingDone()
                }, 2000)
                setTimeout(function () {
                    $me.css({
                        opacity: 1,
                        filter: ''
                    })
                    $me.attr('data-refreshing', '')
                }, 10000)
            }
        })
    }

    $(init)
}())


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/upload_picture.js` **/
// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    $(function () {
        window.showPageUploadPicture = showPageUploadPicture
        window.apiGetUploadPictureShootRule = apiGetUploadPictureShootRule

        var SwipeSection = window.Bang.SwipeSection

        var isAutoOrientated

        tcb.checkAutoOrientated &&
        tcb.checkAutoOrientated(function (res) {
            isAutoOrientated = res
        })

        // ************
        // 处理函数
        // ************


        // 显示拍照上传页
        function showPageUploadPicture(data) {
            var $swipe = SwipeSection.getSwipeSection('.swipe-page-upload-picture')

            window.apiGetUploadPictureShootRule({
                categoryId: data.category_id
            }, function (res) {
                var uploadList = res.result || []
                var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderUploadPictureTpl').html())),
                    html_st = html_fn({
                        order_id: data.order_id,
                        dealPrice: data.price,
                        uploadList: uploadList
                    })
                SwipeSection.fillSwipeSection(html_st)
                SwipeSection.doLeftSwipeSection()

                var $swipeMainContent = $swipe.find('.swipe-main-content'),
                    $blockModelInfo = $swipe.find('.block-model-info'),
                    $blockModelTakePicture = $swipe.find('.block-model-take-picture'),
                    $swipeBlockBtn = $swipe.find('.swipe-block-btn')

                $blockModelTakePicture.css({
                    height: $(window).height() - $swipe.find('header').height() - $blockModelInfo.height() - $swipeBlockBtn.height()
                })

                __getPicture(data.order_id, function (res) {
                    var $uploadTrigger = $('.js-trigger-upload-picture')
                    tcb.each(res.result || [], function (i) {
                        $uploadTrigger.eq(i).removeClass('icon-close').css({
                            'border': '1px solid #ddd',
                            'background-image': 'url(' + tcb.imgThumbUrl(res.result[i], 300, 300, 'edr') + ')'
                        })
                        __setUploadedPicture($uploadTrigger.eq(i), res.result[i])
                    })
                })
                __bindEvent($swipe)
                __bindEventUploadPicture($swipe.find('.trigger-invoke-camera'))
                __bindEventFormXxgOrderSubmitPicture($swipe.find('#FormXxgOrderUploadPicture'))
            })
        }

        function __bindEvent($wrap) {
            tcb.bindEvent($wrap[0], {
                // 关闭上传弹层
                '.js-trigger-close-upload-swipe': function (e) {
                    e.preventDefault()

                    SwipeSection.backLeftSwipeSection()
                },

                // 启动上传

                '.js-trigger-upload-picture': function (e) {
                    e.preventDefault()

                    __triggerStartUpload($(this))
                },

                // 删图

                '.js-trigger-del-picture': function (e) {
                    e.preventDefault()

                    __delPicture($(this))
                }
            })
        }

        function __bindEventUploadPicture($trigger) {
            $trigger.on('change', function (e) {
                var $me = $(this)

                // 获取文件列表对象
                var files = e.target.files || e.dataTransfer.files,
                    file = files[0]

                try {
                    // 压缩、上传图片
                    __compressUpload(file, $me)
                } catch (ex) {
                    // 压缩上传报错失败了，再次尝试用普通方式上传
                    tcb.warn(ex)

                    __originalUpload(file, $me)
                }
            })
        }

        function __bindEventFormXxgOrderSubmitPicture($form) {
            var order_id = $form.find('[name="order_id"]').val()
            window.XXG.bindForm({
                $form: $form,
                before: function ($form, callback) {
                    tcb.loadingStart()
                    if (__validFormXxgOrderSubmitPicture($form)) {
                        callback()
                    } else {
                        tcb.loadingDone()
                    }
                },
                success: function () {
                    if (window.__IS_NEEDED_MANAGER_CHECK && !window.__IS_MANAGER_CHECK_SUCCESS) {
                        if (window.__REMOTE_CHECK_FLAG) {
                            // 店长审核还没通过，并且还需要远程验机，
                            // 返回，并且开启远程验机
                            window.remoteCheckListenStart(order_id)
                        }

                        window.startShopManagerCheck()

                        return setTimeout(function () {
                            tcb.loadingDone()
                            $.dialog.toast('请等待审核通过再进行后续操作。', 3000)
                            SwipeSection.backLeftSwipeSection()
                        }, 1500)
                    }

                    if (window.__REMOTE_CHECK_FLAG) {
                        // 支持远程验机

                        window.remoteCheckListenStart(order_id)

                        setTimeout(function () {
                            tcb.loadingDone()
                            SwipeSection.backLeftSwipeSection()
                        }, 1500)

                    } else {
                        // 数据更新成功
                        tcb.loadingDone()

                        window.isNeedCheckUnlocked(function (is_need_unlock) {
                            if (is_need_unlock) {
                                // 检查解锁状态
                                window.checkUnlocked(function () {
                                    // 已解锁
                                    window.showPageCustomerSignature && window.showPageCustomerSignature()
                                })
                            } else {
                                window.showPageCustomerSignature && window.showPageCustomerSignature()
                            }
                        })
                    }
                },
                error: function (res) {
                    tcb.loadingDone()
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }

        function __validFormXxgOrderSubmitPicture($form) {
            var flag = true

            var $uploadPingzheng = $form.find('.hidden-upload-pingzheng')
            $uploadPingzheng.each(function () {
                var $me = $(this)
                var upload_picture = tcb.trim($me.val())
                if ($me && $me.length && !upload_picture) {
                    flag = false
                    $('[data-for="' + $me.attr('name') + '"]').closest('.trigger-wrap').shine4Error()
                }
            })

            if (!flag) {
                $.dialog.toast('请上传所有的照片！', 2000)
            }

            return flag
        }

        // 获取上传图片的规则列表
        function apiGetUploadPictureShootRule(data, callback, fail) {
            window.XXG.ajax({
                url: '/Recycle/Engineer/getShootRule',
                data: data,
                success: function (res) {
                    if (!res.errno) {
                        $.isFunction(callback) && callback(res)
                    } else {
                        $.dialog.toast(res.errmsg)
                        typeof fail === 'function' && fail()
                    }
                },
                error: function (err) {
                    $.dialog.toast((err && err.statusText) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            })
        }

        function __getPicture(order_id, callback) {
            window.XXG.ajax({
                url: '/m/doGetPingzheng',
                data: {
                    order_id: order_id
                },
                success: function (res) {
                    if (!res.errno) {
                        $.isFunction(callback) && callback(res)
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                },
                error: function (err) {
                    $.dialog.toast('系统错误，请稍后重试')
                }
            })
        }

        function __delPicture($delTrigger) {
            $delTrigger.hide()

            var $TriggerUploadPicture = $delTrigger.siblings('.js-trigger-upload-picture'),
                $TriggerInvokeCamera = $delTrigger.siblings('.trigger-invoke-camera')

            $TriggerInvokeCamera.val('')

            $TriggerUploadPicture
            //.addClass ('icon-close')
                .css({
                    'border': '0',
                    'background-image': ''
                })
            $('[name="' + $TriggerUploadPicture.attr('data-for') + '"]').val('')

            __hideProcessBar($delTrigger.siblings('.fake-upload-progress'))
        }

        function __showProcessBar($processBar) {
            var $processBarInner = $processBar.find('.fake-upload-progress-inner')
            $processBar.show()

            var percent_val = 25
            $processBarInner.css({'width': percent_val + '%'})

            setTimeout(function h() {
                percent_val += 12
                if (percent_val > 100) {
                    return
                }
                if ($processBarInner.css('width') == '100%') {
                    return
                }
                $processBarInner.css({'width': percent_val + '%'})

                if (percent_val < 100) {
                    setTimeout(h, 500)
                }
            }, 500)
        }

        function __showProcessBar100($processBar) {
            var $processBarInner = $processBar.find('.fake-upload-progress-inner')
            $processBar.show()
            $processBarInner.css({'width': '100%'})
        }

        function __hideProcessBar($processBar) {
            var $processBarInner = $processBar.find('.fake-upload-progress-inner')
            $processBar.hide()
            $processBarInner.css({'width': '0'})
        }

        function __setUploadingPicture($trigger, img) {
            if (!img) {
                return
            }
            $trigger
                .css({
                    'border': '1px solid #ddd',
                    'background-image': 'url(' + img + ')' // tcb.imgThumbUrl(img, 300, 300, 'edr')
                })
        }

        function __setUploadedPicture($trigger, img) {
            if (!img) {
                return
            }
            var $DelPicture = $trigger.siblings('.js-trigger-del-picture')

            $DelPicture.show()
            //$trigger.removeClass ('icon-close').css ({
            //    'border': '1px solid #ddd',
            //    'background-image' : 'url(' + img + ')' // tcb.imgThumbUrl(img, 300, 300, 'edr')
            //})
            $('[name="' + $trigger.attr('data-for') + '"]').val(img)
        }

        function __triggerStartUpload($trigger) {
            var mode
            if ($trigger && $trigger.length) {
                mode = $trigger.attr('data-mode') || ''
            }
            if ((window.__IS_XXG_IN_SUNING && !window.__IS_XXG_IN_SUNING_ANDROID) || !tcb.js2AppInvokeTakePicture(function (imgBase64) {
                imgBase64 = imgBase64.indexOf('base64,') > -1
                    ? imgBase64
                    : 'data:image/png;base64,' + imgBase64
                __suningTakePictureSuccess(imgBase64, $trigger.siblings('.trigger-invoke-camera'))
            }, mode)) {
                var $triggerInvoke = $trigger.siblings('.trigger-invoke-camera')
                if (tcb.isXxgAppAndroidSupportCustomCamera() && mode) {
                    $triggerInvoke.attr('accept', 'tcb-camera/' + mode)
                }
                $triggerInvoke.trigger('click')
            }
        }

        // 压缩、上传图片
        function __compressUpload(file, $trigger) {
            __doCompressImg(file, __generateHandlerCompressImgSuccess($trigger))
        }

        // 原图上传
        function __originalUpload(file, $trigger) {
            var $processBar = $trigger.siblings('.fake-upload-progress')

            __setUploadingPicture($trigger.siblings('.js-trigger-upload-picture'), window.URL.createObjectURL(file))
            __showProcessBar($processBar)

            var formData = new FormData()
            formData.append('pingzheng', file)
            __uploadImg(formData, function (data) {
                if (data.errno) {
                    __delPicture($trigger.siblings('.js-trigger-del-picture'))

                    return $.dialog.toast(data.errmsg)
                }
                __showProcessBar100($processBar)
                __setUploadedPicture($trigger.siblings('.js-trigger-upload-picture'), data.result)
            }, function (xhr, status, err) {
                $.dialog.toast('上传失败，请稍后再试')
                __delPicture($trigger.siblings('.js-trigger-del-picture'))
            })
        }

        function __suningDoCompressImg(img_base64, callback) {
            var maxSize = 500 * 1024 // 500KB
            var result = img_base64

            if (result.length < maxSize) {
                callback(result)
            } else {
                tcb.imageOnload(result, function (imgObj) {
                    var file_type = (result.split(';')[0]).split(':')[1] || ''
                    __getCompressedImg(imgObj, file_type, callback)
                })
            }
        }

        function __suningTakePictureSuccess(img_base64, $trigger) {
            __suningDoCompressImg(img_base64, __generateHandlerCompressImgSuccess($trigger))
        }

        function __uploadImg(formData, success, error, url) {
            if (!formData) {
                return
            }
            success = $.isFunction(success) ? success : function (data) {
                console.log(data)
            }
            error = $.isFunction(error) ? error : function (xhr, status, err) {
                console.log(err)
            }
            $.ajax({
                //url         : '/aj/uploadPic',
                //url         : '/m/doUpdateImgForBase64',
                url: url ? url : '/m/doUpdateImg',
                type: 'post',
                dataType: 'json',
                cache: false,
                processData: false,
                contentType: false,
                data: formData,
                success: success,
                error: error
            })
        }

        function __uploadImgBase64(formData, success, error) {
            __uploadImg(formData, success, error, '/m/doUpdateImgForBase64')
        }

        var compress_width = 1080,
            compress_height = 1920,
            compress_quality = .7

        function __doCompressImg(file, callback) {
            var reader = new FileReader(),
                maxSize = 500 * 1024 // 500KB

            reader.onload = function (e) {
                var result = this.result   //result为data url的形式

                if (result.length < maxSize) {
                    callback(result)
                } else {
                    tcb.imageOnload(result, function (imgObj) {
                        __getCompressedImg(imgObj, file.type, callback)
                    })
                }
            }
            reader.readAsDataURL(file)
        }

        function __getCompressedImg(img, file_type, callback) {
            EXIF.getData(img, function () {
                var imgObj = this
                var orientation = isAutoOrientated ? 0 : EXIF.getTag(imgObj, 'Orientation')
                var size = __getCompactCompressSize(imgObj.naturalWidth || imgObj.width, imgObj.naturalHeight || imgObj.height),
                    w = size[0],
                    h = size[1]
                if (orientation == 6 || orientation == 8) {
                    w = size[1]
                    h = size[0]
                }

                var deg = 0,
                    canvas = __createCanvas(w, h),
                    ctx = canvas.getContext('2d')
                ctx.clearRect(0, 0, w, h)

                switch (orientation) {
                    // 正位竖着照
                    case 6:
                        ctx.translate(w, 0)
                        deg = 90
                        ctx.rotate(deg * Math.PI / 180)
                        ctx.drawImage(imgObj, 0, 0, h, w)
                        break
                    // 倒位竖着照
                    case 8:
                        ctx.translate(0, h)
                        deg = 270
                        ctx.rotate(deg * Math.PI / 180)
                        ctx.drawImage(imgObj, 0, 0, h, w)
                        break
                    // 反向横着照
                    case 3:
                        ctx.translate(w, h)
                        deg = 180
                        ctx.rotate(deg * Math.PI / 180)
                        ctx.drawImage(imgObj, 0, 0, w, h)
                        break
                    default :
                        ctx.drawImage(imgObj, 0, 0, w, h)
                        break
                }

                return callback(ctx.canvas.toDataURL('image/jpeg', compress_quality))
                //return callback(file_type === 'image/png'
                //    ? ctx.canvas.toDataURL (file_type)
                //    : ctx.canvas.toDataURL ('image/jpeg', compress_quality))
            })
        }

        function __generateHandlerCompressImgSuccess($trigger) {
            return function (imgBase64) {
                var $processBar = $trigger.siblings('.fake-upload-progress')

                __setUploadingPicture($trigger.siblings('.js-trigger-upload-picture'), imgBase64)
                __showProcessBar($processBar)

                var formData = new FormData()
                formData.append('pingzheng', imgBase64)
                __uploadImgBase64(formData, function (data) {
                    if (data.errno) {
                        __delPicture($trigger.siblings('.js-trigger-del-picture'))

                        return $.dialog.toast(data.errmsg)
                    }
                    __showProcessBar100($processBar)
                    __setUploadedPicture($trigger.siblings('.js-trigger-upload-picture'), data.result)
                }, function (xhr, status, err) {
                    $.dialog.toast('上传失败，请稍后再试')
                    __delPicture($trigger.siblings('.js-trigger-del-picture'))
                })
            }
        }

        function __createCanvas(w, h) {
            var canvas = tcb.cache('XXG_UPLOAD_PICTURE_CANVAS')
            if (!canvas) {
                canvas = document.createElement('canvas')
                tcb.cache('XXG_UPLOAD_PICTURE_CANVAS', canvas)
            }

            canvas.width = w
            canvas.height = h
            return canvas
        }

        function __getCompactCompressSize(width, height) {
            var w_ratio = Math.min(width, height) / compress_width,
                h_ratio = Math.max(width, height) / compress_height,
                ratio = Math.max(w_ratio, h_ratio)

            if (__isSupportMegaPixelImg()) {
                var ratio_log2 = Math.min(Math.floor(Math.log2(w_ratio)), Math.floor(Math.log2(h_ratio)))

                ratio = Math.pow(2, ratio_log2)
            }

            return [width / ratio, height / ratio]
        }

        function __isSupportMegaPixelImg() {
            var is_support = tcb.cache('IS_SUPPORT_MEGA_PIXEL_IMG')
            if (typeof is_support == 'undefined') {
                var canvas = __createCanvas(2500, 2500)
                is_support = !!(canvas.toDataURL('image/png').indexOf('data:image/png') == 0)
            }
            return is_support
        }

    })
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/customer_signature.js` **/
// 客户签字
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    $(function () {
        var __is_locked = false

        window.showPageCustomerSignature = showPageCustomerSignature
        window.showPageCustomerSignatureBeforeCallback = window.showPageCustomerSignatureBeforeCallback || function (next) {
            typeof next === 'function' && next()
        }

        var SwipeSection = window.Bang.SwipeSection

        tcb.bindEvent(document.body, {
            // 关闭弹层
            '.js-trigger-close-signature-swipe': function (e) {
                e.preventDefault()
                SwipeSection.backLeftSwipeSection()
            },

            '.js-trigger-scroll-to-platform-service-agreement': function (e) {
                e.preventDefault()
                $('.block-customer-agreement-content').scrollTo({
                    endY: 0
                })
                // $('#BlockTcbPlatformServiceAgreement').
            },
            '.js-trigger-scroll-to-huishou-trade-rules': function (e) {
                e.preventDefault()
                var $Content = $('.block-customer-agreement-content')
                var scrollTop = $Content.scrollTop()
                var offset = $Content.offset()
                var targetOffset = $('#BlockHuishouTradeRules').offset()
                $('.block-customer-agreement-content').scrollTo({
                    endY: targetOffset.top - offset.top + scrollTop
                })
            },

            // 签名并且确认阅读同意协议

            '.swipe-page-customer-signature .btn-submit': function (e) {
                e.preventDefault()
                var $me = $(this)
                if (__validSignature()) {
                    if (!$me.closest('.swipe-main-content').find('[name="agree_protocol"]').prop('checked')) {
                        return $.dialog.toast('请先阅读并并同意《同城帮服务协议》和《隐私政策》')
                    }
                    // 保存签名
                    var pointGroups = JSON.stringify(window.instSignaturePad.getStripPointGroups())
                    window.XXG.ajax({
                        type: 'POST',
                        url: tcb.setUrl('/huishou/doOrderSign'),
                        data: {
                            'orderId': window.__ORDER_ID,
                            'signature': pointGroups
                        },
                        success: function (res) {
                            if (res && !res.errno) {
                                if (window.isSuningShopPlusOutDate) {
                                    window.isSuningShopPlusOutDate(function (isOutDate) {
                                        if (isOutDate) {
                                            window.showDialogSuningShopPlusOutDate(function () {
                                                __signatureConfirm($me)
                                            })
                                        } else {
                                            __signatureConfirm($me)
                                        }
                                    })
                                } else {
                                    __signatureConfirm($me)
                                }
                            } else {
                                $.dialog.toast(res.errmsg)
                            }
                        },
                        error: function (err) {
                            $.dialog.toast('系统错误，请稍后重试')
                        }
                    })
                }
            },
            // 激活签名板

            '.swipe-page-customer-signature .js-trigger-active-customer-signature': function (e) {
                e.preventDefault()
                __openCustomerSignaturePad()
            },
            // 关闭签名板

            '.swipe-page-customer-signature .js-trigger-customer-signature-pad-close': function (e) {
                e.preventDefault()
                __closeCustomerSignaturePad()
            },
            // 清除签名

            '.swipe-page-customer-signature .btn-signature-clear': function (e) {
                e.preventDefault()
                __clearSignature()
            },
            // 确认签名

            '.swipe-page-customer-signature .btn-signature-confirm': function (e) {
                e.preventDefault()
                __confirmSignature()
            }
        })


        // ************
        // 处理函数
        // ************


        function showPageCustomerSignature() {
            // __is_locked = false
            // validSelectLockByImei ()
            window.showPageCustomerSignatureBeforeCallback(function () {
                var $swipe = SwipeSection.getSwipeSection('.swipe-page-customer-signature')
                var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderCustomerSignatureTpl').html())),
                    html_st = html_fn()
                SwipeSection.fillSwipeSection(html_st)
                var html_fn1 = $.tmpl(tcb.trim($('#JsTcbPlatformServiceAgreementTpl').html())),
                    html_st1 = html_fn1()
                var html_fn2 = $.tmpl(tcb.trim($('#JsHuishouTradeRulesTpl').html())),
                    html_st2 = html_fn2()
                $swipe.find('.block-customer-agreement-content').html(html_st1 + html_st2)
                SwipeSection.doLeftSwipeSection()
            })
        }

        function __openCustomerSignaturePad() {
            var $PadWrap = $('#CustomerSignaturePadWrap'),
                $BtnRow = $PadWrap.find('.customer-signature-pad-btn'),
                $Pad = $PadWrap.find('.customer-signature-pad'),
                $win = tcb.getWin(),
                w_width = $win.width(),
                w_height = $win.height()

            $PadWrap.css({
                display: 'block',
                width: w_width + 'px',
                height: w_height + 'px'
            })
            $Pad.css({
                width: (w_width - $BtnRow.height()) + 'px',
                height: w_height + 'px'
            })
            $BtnRow.css({
                width: w_height + 'px',
                right: '-' + (w_height - $BtnRow.height()) / 2 + 'px'
            })

            if (!window.instSignaturePad) {
                window.instSignaturePad = window.Bang.SignaturePad({
                    canvas: $('#CustomerSignaturePadCanvas'),
                    canvasConfig: {
                        penColor: '#000',
                        penSize: 3,
                        backgroundColor: '#cbcbcb'
                    },
                    flagAutoInit: true
                })
            }

            $BtnRow.css({
                transform: 'rotate(-90deg)'
            })
            tcb.js2AndroidSetDialogState(true, function () {
                __closeCustomerSignaturePad()
            })
        }

        function __closeCustomerSignaturePad() {
            var $PadWrap = $('#CustomerSignaturePadWrap'),
                $BtnRow = $PadWrap.find('.customer-signature-pad-btn')

            $PadWrap.hide()
            $BtnRow.css({
                transform: 'none'
            })
            tcb.js2AndroidSetDialogState(false)
        }

        function __rotateImg(img, deg, fn) {

            tcb.imageOnload(img, function (imgObj) {

                var w = imgObj.naturalHeight,
                    h = imgObj.naturalWidth

                var canvas = __createCanvas(w, h),
                    ctx = canvas.getContext('2d')

                ctx.save()
                ctx.translate(w, 0)
                ctx.rotate(deg * Math.PI / 180)
                ctx.drawImage(imgObj, 0, 0, h, w)
                ctx.restore()

                var newImg = ctx.canvas.toDataURL('image/jpeg')

                typeof fn === 'function' && fn(newImg)
            })
        }

        function __createCanvas(w, h) {
            var canvas = document.createElement('canvas')

            canvas.width = w
            canvas.height = h
            return canvas
        }

        function __validSignature() {
            var pointGroups
            var flag = true

            if (!window.instSignaturePad
                || !((pointGroups = window.instSignaturePad.getPointGroups()) && pointGroups[0] && pointGroups[0][0])) {
                flag = false
                $.dialog.toast('请先签名确认')
            }
            return flag
        }

        function __signatureConfirm($btn) {
            var order_id = $btn.attr('data-order-id')
            var status = $btn.attr('data-now-status')

            if (window.__IS_NEED_PAYINFO && window.__IS_NEED_PAYINFO[order_id] && !window.__IS_ONE_STOP_ORDER) {
                // 如果需要完善用户收款信息【并且是非一站式订单】，那么跳转到完善收款页面
                return window.XXG.redirect(tcb.setUrl('/m/scanAuth', {
                    orderId: $btn.attr('data-order-id')
                }), true)
            }

            var btn_text = $btn.html()
            window.XXG.ajax({
                url: tcb.setUrl('/m/aj_wancheng_order'),
                data: {
                    'order_id': order_id,
                    'status': status
                },
                beforeSend: function () {
                    if ($btn.hasClass('btn-disabled')) {
                        return false
                    }
                    $btn.addClass('btn-disabled').html('处理中...')
                },
                success: function (res) {
                    if (!res.errno) {
                        // 检查当前机器是否解锁
                        // if (__is_locked){
                        //     window.showPageLockedTips && window.showPageLockedTips ()
                        // } else {
                        window.__SHOW_CASH_FLAG = res.result.show_cash_flag
                        window.__ZJ_MOBILE_CALL_URL = res.result.zj_mobile_call_url || ''

                        window.showPageCustomerServiceComplete && window.showPageCustomerServiceComplete()
                        addFiveCodeIntoPage($('.swipe-page-customer-service-complete'), res.result.five_code || '')   // 逆向物流使用该方法
                        // }
                    } else {
                        $btn.removeClass('btn-disabled').html(btn_text)
                        $.dialog.toast(res.errmsg)
                    }
                },
                error: function (err) {
                    $btn.removeClass('btn-disabled').html(btn_text)
                    $.dialog.toast('系统错误，请稍后重试')
                }
            })
        }

        // 逆向物流,添加此方法,因为要求最后订单服务完成页要添加发货码,特写此方法
        function addFiveCodeIntoPage($ele, fivecode) {
            if (!$ele && !fivecode) return
            var $__ele = $ele,
                __fivecode = fivecode,
                __htmlStr = '<div style="color: #4a7;">订单发货码：' + __fivecode + '（请贴至手机后背）</div>'
            $__ele.find('.service-complete-desc').append(__htmlStr)
        }

        function validSelectLockByImei() {
            var max = 2,
                count = 0,
                imei = window.__ORDER_INFO.imei
            if (!imei) {
                return
            }

            function loop() {
                count++
                if (count > max || __is_locked) {
                    return
                }
                window.XXG.ajax({
                    url: tcb.setUrl('/m/selectLockByImei'),
                    data: {'imei': imei},
                    timeout: 30000,
                    beforeSend: function () {},
                    success: function (res) {
                        var has_status = false
                        try {
                            if (!res.errno) {
                                has_status = true
                                if (res.result == /*'unknown'*/'locked') {
                                    return __is_locked = true
                                }
                            }
                        } catch (ex) {}

                        return !has_status && loop()
                    },
                    error: function (err) {return loop()}
                })
            }

            loop()
        }

        function __clearSignature() {
            if (window.instSignaturePad && window.instSignaturePad.clearAll) {
                window.instSignaturePad.clearAll()

                var $trigger = $('.swipe-page-customer-signature .js-trigger-active-customer-signature')
                $trigger.css({
                    fontSize: '',
                    backgroundImage: ''
                })
            }
        }

        function __confirmSignature() {
            if (!window.instSignaturePad) {
                return
            }
            var pointGroups = window.instSignaturePad.getPointGroups()
            if (!(pointGroups && pointGroups[0] && pointGroups[0][0])) {
                return $.dialog.toast('请先签名').css({
                    transform: 'rotate(-90deg)'
                })
            }

            var dataUrl = window.instSignaturePad.toDataUrl('image/jpeg')

            __rotateImg(dataUrl, 90, function (img) {
                var $trigger = $('.swipe-page-customer-signature .js-trigger-active-customer-signature')

                $trigger.css({
                    fontSize: 0,
                    backgroundImage: 'url(' + img + ')'
                })
            })

            __closeCustomerSignaturePad()
        }
    })
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/customer_service_complete.js` **/
// 一些基本操作
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    $(function () {
        window.showPageCustomerServiceComplete = showPageCustomerServiceComplete

        var SwipeSection = window.Bang.SwipeSection

        tcb.bindEvent(document.body, {
            // 关闭弹层
            '.js-trigger-close-service-complete-swipe': function (e) {
                e.preventDefault()
                __closeAndReload()
            },
            // in河南移动app--关闭弹层
            '.js-trigger-hnyd-close-service-complete-swipe': function (e) {
                e.preventDefault()
                tcb.js2AppHNYDOpenPage('IntelligentTerminal')
            }
        })

        // ************
        // 处理函数
        // ************


        function showPageCustomerServiceComplete() {
            SwipeSection.getSwipeSection('.swipe-page-customer-service-complete')

            var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderCustomerServiceCompleteTpl').html())),
                html_st = html_fn({
                    show_cash_flag: window.__SHOW_CASH_FLAG,
                    zj_mobile_call_url: window.__ZJ_MOBILE_CALL_URL
                })
            SwipeSection.fillSwipeSection(html_st)
            if (window.__APPLE_CES_ORDER_FLAG) {
                var order_id = tcb.queryUrl(window.location.search, 'order_id')
                window.getAppleCesOrderInfo && window.getAppleCesOrderInfo(order_id, function (appleCesOrderInfo) {
                    var bonus = parseInt(appleCesOrderInfo.subsidy_price, 10) || 0
                    var realPrice = parseInt(appleCesOrderInfo.new_product_price * 100 - appleCesOrderInfo.hs_model_price * 100 - bonus * 100, 10) / 100
                    var instalmentName = appleCesOrderInfo.loan_name || 'JD白条分期付款'
                    var instalmentRate = appleCesOrderInfo.loan_rate || 0
                    var instalmentPeriod = parseInt(appleCesOrderInfo.loan_rate_number, 10) || 0
                    var instalmentPaymentPerPeriod = (instalmentPeriod
                        ? parseInt(realPrice / instalmentPeriod * 100 + realPrice * instalmentRate * 100, 10) / 100
                        : realPrice).toFixed(2)
                    var html_st = '<div style="margin: .2rem .2rem 0;text-align: left;">'
                    html_st += '<div class="row"><div class="col-12-4">新机编码</div><div class="col-12-8">' + appleCesOrderInfo.new_product_id + '</div></div>'
                    html_st += '<div class="row"><div class="col-12-4">新机型号</div><div class="col-12-8">' + appleCesOrderInfo.new_product_name + '</div></div>'
                    html_st += '<div class="row"><div class="col-12-4">新机价格</div><div class="col-12-8">¥ ' + appleCesOrderInfo.new_product_price + '</div></div>'
                    if (appleCesOrderInfo.coupon_code) {
                        html_st += '<div class="row"><div class="col-12-4">促销码</div><div class="col-12-8">' + appleCesOrderInfo.coupon_code + '</div></div>'
                    }
                    html_st += '<div class="row"><div class="col-12-4">回收机型</div><div class="col-12-8">' + appleCesOrderInfo.hs_model_name + '</div></div>'
                    html_st += '<div class="row"><div class="col-12-4">回收价格</div><div class="col-12-8">¥ ' + appleCesOrderInfo.hs_model_price + '</div></div>'
                    if (bonus) {
                        html_st += '<div class="row"><div class="col-12-4">换新补贴</div><div class="col-12-8">￥ ' + bonus + '</div></div>'
                    }
                    html_st += '<div class="row"><div class="col-12-4">换购价格</div><div class="col-12-8 c5">' + (realPrice > 0 ? '¥ ' + realPrice : '- ¥ ' + Math.abs(realPrice)) + '</div></div>'
                    if (instalmentPeriod && realPrice > 0) {
                        html_st += '<div class="row"><div class="col-12-4">' + instalmentName + '</div><div class="col-12-8">￥ ' + instalmentPaymentPerPeriod + ' x ' + instalmentPeriod + '期</div></div>'
                    }
                    html_st += '<div class="row row-order-id-barcode" style="margin-top: .2rem;text-align: center"><svg id="XxgOrderDetailOrderIdBarcode2"></svg></div>'
                    html_st += '</div>'
                    var $blockServiceComplete = $('.swipe-page-customer-service-complete .block-service-complete')
                    $blockServiceComplete.find('.icon-circle-tick').css('margin', '.2rem 0 0')
                    $blockServiceComplete.append(html_st)
                    JsBarcode('#XxgOrderDetailOrderIdBarcode2', order_id, {
                        height: 80
                    })
                })
            }
            SwipeSection.doLeftSwipeSection(0, function () {
                var queue = SwipeSection.getQueue(),
                    queue_length = queue.length
                while (queue_length > 0) {
                    queue_length--
                    tcb.js2AndroidPopDialogStateCloseFn()
                }
                SwipeSection.closeAllExceptLast()
                // 先干掉最后一个弹层的关闭标识，然后再加一个新的标识和新的关闭方法
                tcb.js2AndroidSetDialogState(false)
                tcb.js2AndroidSetDialogState(true, __closeAndReload)
            })
        }

        function __closeAndReload() {
            SwipeSection.backLeftSwipeSection()

            tcb.loadingStart()

            setTimeout(function () {
                window.location.reload()
            }, 400)
        }

    })
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/locked_tips.js` **/
// 手机解锁提示
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }
    window.showPageLockedTips = showPageLockedTips
    window.showPageToUnlockedTips = showPageToUnlockedTips
    window.isNeedCheckUnlocked = isNeedCheckUnlocked
    window.addCheckUnlockQueue = addCheckUnlockQueue
    window.checkUnlocked = checkUnlocked
    // window.checkUnlockedSync = checkUnlockedSync

    var SwipeSection = window.Bang.SwipeSection
    var __is_need_unlock

    // ************
    // 处理函数
    // ************

    function showPageLockedTips() {
        __showPage(true)
    }

    function showPageToUnlockedTips() {
        __showPage(false)
    }

    function __showPage(is_locked) {
        var $swipe = SwipeSection.getSwipeSection('.swipe-page-locked-tips')
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderLockedTipsTpl').html())),
            html_st = html_fn({
                is_locked: is_locked
            })
        SwipeSection.fillSwipeSection(html_st)
        SwipeSection.doLeftSwipeSection()
        if (is_locked) {
            var $btn = $swipe.find('.js-trigger-locked-tips-show-service-complete')

            __startLockCountdown($btn)
        }
    }

    function __startLockCountdown($btn) {
        var startTime = Date.now(),
            endTime = startTime + 4 * 60 * 1000

        Bang.startCountdown(endTime, startTime, $btn.find('.check-lock-countdown'), {
            end: function () {
                $btn.attr('data-flag-block', '')
                    .html('已完成解锁')
            }
        })
    }

    // 判断是否需要接受，
    // 回调函数传入参数为true，表示需要查询解锁，
    // false表示不需要查询解锁
    function isNeedCheckUnlocked(callback) {
        if (typeof __is_need_unlock !== 'undefined') {
            callback(__is_need_unlock)
        } else {
            var order_id = window.__ORDER_INFO.order_id

            window.XXG.ajax({
                url: tcb.setUrl('/huishou/doCheckAppleNeedUnlock'),
                data: {'order_id': order_id},
                timeout: 5000,
                beforeSend: function () {},
                success: function (res) {
                    try {
                        if (!res.errno) {
                            __is_need_unlock = res.result && res.result.is_need_unlock
                        }
                    } catch (ex) {}

                    typeof callback == 'function' && callback(__is_need_unlock)
                },
                error: function () {
                    typeof callback == 'function' && callback(__is_need_unlock)
                }
            })
        }
    }

    // 同步检查是否已经解锁
    function checkUnlockedSync(callback, timeout) {
        __doSelectAppleUnlock(false, callback, timeout)
    }

    // 添加查询队列，用于异步检查
    function addCheckUnlockQueue(callback) {
        __doSelectAppleUnlock(true, callback)
    }

    function __doSelectAppleUnlock(is_async, callback, timeout) {
        timeout = (parseInt(timeout, 10) || 0) * 1000

        var order_id = window.__ORDER_INFO.order_id
        var imei = window.__ORDER_INFO.imei
        var sync = is_async ? 1 : 0

        var status = -1
        window.XXG.ajax({
            url: tcb.setUrl('/huishou/doSelectAppleUnlock'),
            data: {'order_id': order_id, 'imei': imei, 'sync': sync},
            timeout: timeout ? timeout : 5000,
            beforeSend: function () {},
            success: function (res) {
                var errmsg
                try {
                    if (!res.errno) {
                        status = res.result && res.result.status
                    } else {
                        errmsg = res.errmsg
                    }
                } catch (ex) {}

                typeof callback == 'function' && callback(status, errmsg)
            },
            error: function () {
                typeof callback == 'function' && callback(status)
            }
        })
    }

    // 异步检查是否已经解锁
    function checkUnlocked(unlocked_callback) {
        __checkUnlocked(function (status) {
            if (status < 0 || status == 0 || status == 30) {
                // 未执行查询 || 超时
                window.showPageToUnlockedTips && window.showPageToUnlockedTips()
            } else if (status == 10) {
                // 已解锁
                typeof unlocked_callback == 'function' && unlocked_callback()
            } else if (status == 20) {
                // 未解锁
                window.showPageLockedTips && window.showPageLockedTips()
            } else if (status == 50) {
                // 不是有效的IMEI
                window.showPageLockedTips && window.showPageLockedTips()
            }
        })
    }

    function __checkUnlocked(callback) {
        var order_id = window.__ORDER_INFO.order_id
        var status = -1
        window.XXG.ajax({
            url: tcb.setUrl('/huishou/doGetAppleUnlock'),
            data: {'order_id': order_id},
            timeout: 5000,
            beforeSend: function () {},
            success: function (res) {
                try {
                    if (!res.errno) {
                        status = res.result && res.result.status
                    }
                } catch (ex) {}

                typeof callback == 'function' && callback(status)
            },
            error: function () {
                typeof callback == 'function' && callback(status)
            }
        })
    }

    function __showCheckingInfo() {
        $('body').append('<div class="cover-locked-tips"><div class="cover-locked-tips-inner">查询中，请稍后...</div></div>')
    }

    function __hideCheckingInfo() {
        $('.cover-locked-tips').remove()
    }

    $(function () {
        tcb.bindEvent({
            '.js-trigger-locked-tips-show-service-complete': function (e) {
                e.preventDefault()

                var $me = $(this)
                if ($me.attr('data-flag-block')) {
                    return
                }
                var timeout = $me.attr('data-time-out')

                $me.attr('data-time-out', '')

                __showCheckingInfo()

                setTimeout(function () {
                    checkUnlockedSync(function (status, errmsg) {

                        __hideCheckingInfo()

                        if (status < 0) {
                            return $.dialog.toast(errmsg || '苹果服务器未返回ID已解锁，请稍等一分钟再查询。')
                        } else if (status == 10) {
                            // 已解锁
                            window.showPageCustomerSignature && window.showPageCustomerSignature()
                        } else if (status == 20) {
                            // 未解锁
                            $me.attr('data-flag-block', '1')
                               .html('账号未解锁，<div class="check-lock-countdown">04:00</div>后查询')
                            __startLockCountdown($me)
                            return $.dialog.toast('ID锁未解锁，请解锁后完成订单')
                        } else if (status == 30) {
                            // 超时
                            $me.attr('data-time-out', '40')
                            return $.dialog.toast('网络不好，请再试一次')
                        } else if (status == 40) {
                            // 超时2次
                            window.showPageCustomerSignature && window.showPageCustomerSignature()
                            // window.showPageCustomerServiceComplete && window.showPageCustomerServiceComplete()
                        } else if (status == 50){
                            return $.dialog.toast('不是有效的IMEI，请修改后再来')
                        }
                    }, timeout)
                }, 3000)

            }
        })
    })

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/order_detail.js` **/
// 修修哥订单详情页
!function(){
    if (window.__PAGE!=='xxg-order-detail'){
        return
    }

    $(function(){
        window.xxgEditForm = xxgEditForm
        if (tcb.queryUrl(window.location.search, 'uploadPicture') && window.__ORDER_INFO.status != 13) {
            window.showPageUploadPicture && window.showPageUploadPicture({
                order_id: window.__ORDER_INFO.parent_id,
                price: window.__ORDER_INFO.final_price,
                category_id: window.__ORDER_INFO.category_id
            })
        }

        tcb.bindEvent(document.body, {
            // 工程师订单操作
            '.btn-parent-order-act': function(e){
                e.preventDefault()

                var $me = $(this),
                    act = $me.attr('data-act'),
                    parent_id = $me.attr('data-id'),
                    now_status = $me.attr('data-status'),
                    next_status= $me.attr('next-status')


                if ($me.hasClass('btn-disabled')) {
                    return
                }

                var txt = $me.html()
                $me.addClass('btn-disabled').html('处理中...')

                var request_url = tcb.setUrl('/m/aj_xxg_parent_status', {
                    'parent_id': parent_id,
                    'now_status': now_status,
                    'next_status': next_status
                })

                $.getJSON(request_url, function(res){
                    if (!res.errno) {
                        window.location.reload()
                    } else {
                        alert(res.errmsg)
                        $me.removeClass('btn-disabled').html(txt)
                    }
                })
            },

            // 工程师订单操作
            '.btn-order-act': function(e){
                e.preventDefault()

                var $me = $(this),
                    act = $me.attr('data-act'),
                    order_id = $me.attr('data-id'),
                    status = $me.attr('data-status'),
                    txt, request_url

                if ($me.hasClass('btn-disabled')) {
                    return
                }

                if (act=='quxiao'){
                    var params_data = {
                            'order_id' : order_id
                        },
                        html_str = $.tmpl( $.trim($('#JsXxgCancelOrderTpl').html()) )(params_data)

                    var config = {
                        withMask: true,
                        middle: true
                    }

                    var dialog = tcb.showDialog(html_str, config)

                    xxgEditForm(dialog.wrap.find('form'))

                    return
                }

                if(act == 'wancheng'){
                    txt = $me.html()
                    $me.addClass('btn-disabled').html('处理中...')

                    request_url = tcb.setUrl('/m/aj_wancheng_order', {
                        'order_id': order_id,
                        'status': status
                    })

                    $.getJSON(request_url, function(res){
                        if (!res.errno) {
                            window.__SHOW_CASH_FLAG = res.result.show_cash_flag

                            var msg = '<p style="font-size: .12rem">确定服务完成</p><p style="color: #FF0202">'
                            switch (window.__CHANNEL_TYPE) {
                                case 2:
                                    msg = '旧机款将发放至用户下单的易付宝或银行卡账户.'
                                    break
                                case 3:
                                    msg = '旧机款将以"支付宝红包"形式,发放至用户下单的支付宝账户.'
                                    break
                            }
                            msg += '由于近期价格波动较大,回收完成后,请尽快将手机邮寄给同城帮对应地址!</p>'
                            $.dialog.alert(msg, function () {
                                window.location.reload()
                            })
                        } else {
                            alert(res.errmsg)
                            $me.removeClass('btn-disabled').html(txt)
                        }
                    })
                } else {
                    txt = $me.html()
                    $me.addClass('btn-disabled').html('处理中...')

                    request_url = tcb.setUrl('/m/aj_xxg_status', {
                        'order_id': order_id,
                        'status': status
                    })

                    $.getJSON(request_url, function(res){
                        if (!res.errno) {
                            window.location.reload()
                        } else {
                            alert(res.errmsg)
                            $me.removeClass('btn-disabled').html(txt)
                        }
                    })
                }
            },
            // 编辑成交价
            '.btn-edit-final-price': function(e){
                e.preventDefault()

                var $me = $(this),
                    $order_id = $me.attr('data-value')

                var params_data = {
                        'order_id':$order_id
                    },
                    html_str = $.tmpl( $.trim($('#JsXxgEditFinalPriceTpl').html()) )(params_data)

                var config = {
                    withMask: true,
                    middle: true
                }

                var dialog = tcb.showDialog(html_str, config)

                xxgEditForm(dialog.wrap.find('form'))
            },
            // 编辑IMEI号
            '.btn-edit-imei': function(e){
                e.preventDefault()

                var $me = $(this),
                    $order_id = $me.attr('data-value')

                var params_data = {
                        'order_id':$order_id
                    },
                    html_str = $.tmpl( $.trim($('#JsXxgEditImeiTpl').html()) )(params_data)

                var config = {
                    withMask: true,
                    middle: true
                }

                var dialog = tcb.showDialog(html_str, config)

                xxgEditForm(dialog.wrap.find('form'))

            },
            // 编辑发票
            '.btn-edit-invoice': function (e) {
                e.preventDefault()

                var $me = $(this)

                var params_data = {
                        'invoice_title': $me.attr('data-invoice_title'),
                        'invoice_addr': $me.attr('data-invoice_addr'),
                        'invoice_name': $me.attr('data-invoice_name')
                    },
                    html_str = $.tmpl( $.trim($('#JsXxgEditInvoiceTpl').html()) )(params_data)

                var config = {
                    withMask: true,
                    middle: true
                }

                var dialog = tcb.showDialog(html_str, config)

                xxgEditForm(dialog.wrap.find('form'))

            },

            // 编辑手机号
            '.btn-edit-chongzhimobile': function(e){
                e.preventDefault()

                var $me = $(this)

                var html_str = $.tmpl( $.trim($('#JsXxgEditMobileTpl').html()) )()
                var config = {
                    withMask: true,
                    middle: true
                }
                var dialog = tcb.showDialog(html_str, config)

                xxgEditForm(dialog.wrap.find('form'), function($form, callback){
                    var $mobile = $form.find('[name="mobile"]'),
                        mobile = $mobile.val()

                    if (!tcb.validMobile(mobile)) {
                        $.errorAnimate($mobile.focus())
                        return
                    }
                })

            },

            // 填写快递单号
            '.btn-view-hs-express': function(e){
                e.preventDefault()

                var $me = $(this),
                    order_id = $me.attr('data-value')

                var params_data = {
                        'order_id':order_id
                    },
                    html_str = $.tmpl( $.trim($('#JsXxgEditExpressTpl').html()) )(params_data)

                var config = {
                    withMask: true,
                    middle: true
                }

                var dialog = tcb.showDialog(html_str, config)
                xxgEditForm(dialog.wrap.find('form'))
            },

            // 填写新机imei
            '.btn-view-hs-newproductimei, .js-trigger-add-new-product-imei': function(e){
                e.preventDefault()

                var $me = $(this),
                    parent_id = $me.attr('data-value')

                var params_data = {
                        'parent_id':parent_id
                    },
                    html_str = $.tmpl( $.trim($('#JsXxgEditNewProductImeiTpl').html()) )(params_data)

                var config = {
                    withMask: true,
                    middle: true
                }

                var dialog = tcb.showDialog(html_str, config)
                xxgEditForm(dialog.wrap.find('form'))
            },
            '.js-get-my-prize':function(e) {
                e.preventDefault()
                var $me = $(this)
                var order_id = $.queryUrl(window.location.href)['order_id']
                $.post('/m/doGetSuningDoubleTwelverize', {'order_id': order_id}, function (res) {
                    res = JSON.parse(res)
                    if (res.errno) {
                        $.dialog.toast(res.errmsg, 2000)
                    } else {
                        showPrizeDialog(res['result'])
                    }
                })
            },
            '.samsung-5g':function(e) {
                e.preventDefault()
                window.__SAMSUMG_SUBSIDY_5G = true
                $('.js-btn-go-next').trigger('click')
            },
            '.yzs-btn-cancel':function (e) {
                e.preventDefault()
                $.dialog.confirm('<div style="text-align: center;font-weight: 600;">提示</div>' +
                    '<div style="height:.8rem;display: flex;align-items: center;justify-content: center;">您确定未拿到旧机吗？</div>',
                    function () {
                        var order_id = $.queryUrl(window.location.href)['order_id'],
                         $confirm_wrap= $('.confirm-wrap')
                        // window.location.href="/Recycle/Engineer/CashierDesk?order_id="+order_id+"&business_id=3"
                        $.post('/m/notReceivedMobileToEngineer', {'order_id': order_id}, function (res) {
                            res = JSON.parse(res)
                            if (res.errno) {
                                $.dialog.toast(res.errmsg, 2000)
                            } else {
                                if(res.result.jump){
                                    window.location.href = res.result.jump
                                }else{
                                    $.dialog.toast('操作成功！', 2000)
                                }
                                //    请求成功，隐藏确认框
                                $confirm_wrap.css('display','none')
                            }
                        })
                    }
                )
            },
            '.yzs-btn-confirm':function (e) {
                e.preventDefault()
                $.dialog.confirm('<div style="text-align: center;font-weight: 600;">提示</div>' +
                    '<div style="height:.8rem;display: flex;align-items: center;justify-content: center;">您确定拿到旧机了吗？</div>',
                    function () {
                    var $confirm_wrap= $('.confirm-wrap')
                        var order_id = $.queryUrl(window.location.href)['order_id']
                        $.post('/m/confirmReceivedMobileToEngineer', {'order_id': order_id}, function (res) {
                            res = JSON.parse(res)
                            if (res.errno) {
                                $.dialog.toast(res.errmsg, 2000)
                            } else {
                            //    请求成功，隐藏确认框
                                $confirm_wrap.css('display','none')
                            }
                        })
                    }
                )
            },
            '.user-evaluation, .js-trigger-invite-user-evaluation':function (e) {
                e.preventDefault()
                var _this = $(this)
                if (_this.hasClass('user-btn-disabled')) {
                    return
                }
                var order_id = $.queryUrl(window.location.href)['order_id']
                $.post('/m/oneStopInvteCommentsToUser', {'order_id': order_id}, function (res) {
                    res = JSON.parse(res)
                    if (res.errno) {
                        $.dialog.toast(res.errmsg, 2000)
                    } else {
                        //    请求成功，隐藏确认框
                        $.dialog.toast('短信发送成功！', 2000)
                        _this.addClass('user-btn-disabled');
                    }
                })

            }


        })


        // 获取奖励红包
        function showPrizeDialog (params) {
            params = params || {}
            var html_fn = $.tmpl ($.trim ($ ('#JsPrizeDialogTpl').html ())),
                html_st = html_fn ({
                    prize:params
                })

            var dialogInst = tcb.showDialog (html_st, {
                className : 'prize-success-dialog',
                withClose : true,
                top:120
            })

            $('.js-use-it').on('click',function (e) {
                e.preventDefault()
                dialogInst.mask.remove()
                dialogInst.wrap.remove()
            })

            $('#js-prize-wrap').html('<p>抽奖结果：'+params['prize_alis']+'</p>')
        }

        // 修修哥编辑订单信息表单
        function xxgEditForm($form, before_submit, after_submit){
            $form.on('submit', function(e){
                e.preventDefault()

                var $form = $(this)

                if (!notEqualDefaultVal($form)){
                    return window.location.reload()
                }

                // 订单提交前执行
                if (typeof before_submit!=='function') {
                    before_submit = function($form, callback){
                        typeof callback==='function' && callback()
                    }
                }
                // 订单提交后执行
                if (typeof after_submit!=='function') {
                    after_submit = function(){return true}
                }

                before_submit($form, function(){
                    $.post($form.attr('action'), $form.serialize(), function(res){
                        res = $.parseJSON(res)

                        // 表单提交后执行，返回true继续执行默认行为，false不执行后续操作
                        if (after_submit(res)) {
                            if (!res.errno) {
                                window.location.reload()
                            } else {
                                alert(res.errmsg)
                            }
                        }
                    })

                })
            })

        }

        // 比较是否和默认值不相等
        function notEqualDefaultVal($form){
            // 默认相等
            var flag = false

            var $input = $form.find('input,textarea')

            $input.forEach(function(item, i){
                var $item = $(item),
                    default_val = $item.attr('data-default')

                // 默认值不为空字符串,并且默认值和修改后的值不相等，设置flag为true，表示有不相等的值，可以正常提交表单
                if (default_val) {
                    if (default_val!==$item.val()) {
                        flag = true
                    }
                } else {
                    // 确保是空字符串，而不是未定义状态或者null
                    if (default_val===''&&$item.val()){
                        flag = true
                    }
                }
            })

            return flag
        }

    })
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/gift_card.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    function init() {
        __bindEvent()
    }

    function __bindEvent() {
        tcb.bindEvent(document.body, {
            // 调到苏宁礼品卡/以旧换新相关地址
            '.js-trigger-goto-suning-gift-card-addr,.js-trigger-goto-suning-huanxin-addr': function (e) {
                e.preventDefault()
                var order_id = $(this).attr('data-order-id')
                window.XXG.ajax({
                    url: '/xxgHs/getGiftCardJumpAddr',
                    type: 'POST',
                    data: {
                        order_id: order_id
                    },
                    success: function (res) {
                        if (!res.errno) {
                            var redirectUrl = res.result && res.result.result
                            if (!redirectUrl) {
                                return $.dialog.toast('系统错误，请稍后重试')
                            }
                            return window.XXG.redirect(redirectUrl)
                        }
                        return $.dialog.toast(res.errmsg)
                    },
                    error: function (err) {
                        $.dialog.toast('系统错误，请稍后重试')
                    }
                })
            },
            // 预售补贴逻辑
            '.js-trigger-subscribe-suning-gift-card': function (e) {
                e.preventDefault()
                var html_fn = $.tmpl($.trim($('#JsSuningSubscribeCard').html())),
                        html_st = html_fn({
                            'orderId': $(this).attr('data-order-id')
                        }),
                        dialog = tcb.showDialog(html_st, {middle: true})
                window.XXG.bindForm({
                    $form: dialog.wrap.find('form'),
                    before: function ($form, callback) {
                        tcb.loadingStart()
                        callback()
                    },
                    success: function () {
                        tcb.closeDialog()
                        setTimeout(function () {
                            window.XXG.redirect()
                        }, 10)
                    },
                    error: function (res) {
                        tcb.loadingDone()
                        $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                    }
                })
            },

            // 显示苏宁礼品二维码
            '.js-trigger-show-suning-gift-card': function (e) {
                e.preventDefault()
                __showSuningGiftCardQrcode($(this))
            }
        })
    }

    function __showSuningGiftCardQrcode($trigger) {
        if (!($trigger && $trigger.length)) {
            return
        }
        var qrcode = tcb.cache('huodong-doCheckSuningCard')
        if (qrcode) {
            var dialog_str = '<div style="margin: 0 auto;width: 2.88rem;height: 3.3rem;">' +
                '<div style="padding-top: .1rem;line-height: 2;font-size: .18rem;text-align: center;">请用户使用微信扫码领取</div>' +
                '<img src="' + qrcode + '" alt="" style="width:100%"></div>'
            tcb.showDialog(dialog_str, {
                className: 'qrcode-wrap',
                withClose: true,
                withMask: true,
                middle: true
            })
        } else {
            var order_id = $trigger.attr('data-order-id')

            window.XXG.ajax({
                url: '/huodong/doCheckSuningCard',
                data: {
                    order_id: order_id
                },
                success: function (res) {
                    if (!res.errno) {
                        var gift_data = res.result || {}
                        var cardtype = gift_data.card_type
                        // 如果为苏宁礼品卡,则打开弹窗,显示二维码
                        if (cardtype == 1) {
                            qrcode = gift_data.qr_code
                            if (qrcode) {
                                tcb.cache('huodong-doCheckSuningCard', qrcode)
                            }
                            var dialog_str = '<div style="margin: 0 auto;width: 2.88rem;height: 3.3rem;">' +
                                '<div style="padding-top: .1rem;line-height: 2;font-size: .18rem;text-align: center;">请用户使用微信扫码领取</div>' +
                                '<img src="' + qrcode + '" alt="" style="width:100%"></div>'
                            tcb.showDialog(dialog_str, {
                                className: 'qrcode-wrap',
                                withClose: true,
                                withMask: true,
                                middle: true
                            })
                        }
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                }
            })
        }

        tcb.statistic(['_trackEvent', 'xxg', '显示', '苏宁礼品卡二维码', '1', ''])
    }

    $(function () {
        init()
    })

}()


;/**import from `/resource/js/mobile/huishou/xxg/order_detail/one_stop_order.js` **/
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    window.SuningOneStopOrder = {
        checkOneStopPriceLetThrough: checkOneStopPriceLetThrough,
        confirmGoToPriceDifference: confirmGoToPriceDifference
    }

    // 获取一站式换新机信息
    function getOneStopOrderInfo(order_id) {
        window.XXG.ajax({
            url: tcb.setUrl('/xxgHs/getOneStopOrderInfo'),
            data: {'order_id': order_id},
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    var result = res.result
                    var diffPrice = result.diffPrice || {}
                    var buyInfo = result.buyInfo || null
                    var suning_one_stop_notice_customer = tcb.queryUrl(window.location.search)['suning_one_stop_notice_customer']
                    window.__IS_ONE_STOP_ORDER_TCB_PAY = !diffPrice.beacon
                    window.__IS_ONE_STOP_ORDER_NO_DIFF = !diffPrice.price
                    // buyInfo存在，并且属性1或2或18或19或20有值，或者query中suning_one_stop_notice_customer有值，表示客户支付成功
                    window.__IS_ONE_STOP_ORDER_SUCCESS = !!((buyInfo && (buyInfo[1] || buyInfo[2] || buyInfo[18] || buyInfo[19] || buyInfo[20])) || suning_one_stop_notice_customer)
                    var $rowBtnSuningOneStopOrder = $('.row-btn-suning-one-stop-order')
                    $rowBtnSuningOneStopOrder.show()
                    if (window.__IS_ONE_STOP_ORDER_SUCCESS) {
                        $rowBtnSuningOneStopOrder.find('.col-12-5').hide()
                        $rowBtnSuningOneStopOrder.find('.col-12-7').css('width', '100%')
                    }
                    renderOneStopOrderInfo(result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
            }
        })
    }

    // 校验一站式换新金额允许继续（差异款是否大于冻结款）
    function checkOneStopPriceLetThrough(order_id) {
        window.XXG.ajax({
            url: tcb.setUrl('/xxgHs/checkOneStopPriceLetThrough'),
            data: {'order_id': order_id},
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    var html_fn = $.tmpl($.trim($('#JsMXxgSuningOneStopOrderConfirmTpl').html()))
                    var html_st = html_fn({
                        order_id: order_id
                    })
                    tcb.showDialog(html_st, {
                        middle: true
                    })
                } else {
                    var html_fn = $.tmpl($.trim($('#JsMXxgSuningOneStopOrderTooMuchThanLockedTpl').html()))
                    var html_st = html_fn()
                    tcb.showDialog(html_st, {
                        middle: true
                    })
                    // $.dialog.toast((res && res.errmsg) || '系统错误')
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
            }
        })
    }

    function renderOneStopOrderInfo(data) {
        // data = {
        //     'suningOneStopOrder': {
        //         'productName': 'iPhone 11 金色 64G 全网通',
        //         'userMobile': '13520065308',
        //         'suningOrderId': '123456',
        //         'suningOrderStatus': '已下单22',
        //         'statusUpdateTime': null
        //     },
        //     'diffPrice': {
        //         'price': 734,
        //         'subsidyPrice': 100,
        //         'beacon': true
        //     },
        //     'buyInfo': {
        //         'id': 1,
        //         'pay_id': '1909264714754679290',
        //         'order_id': '1909236207230131770',
        //         'supplement_type': '1',
        //         'pay_type': 'alipay',
        //         'pay_status': '10',
        //         'pay_price': '73400',
        //         'seller_id': '2019052365376141',
        //         'pay_desc': '',
        //         'created_at': '2019-10-15 17:16:28',
        //         'updated_at': '2019-10-15 17:16:28'
        //     }
        // }
        data = data || {}
        data.orderInfo = window.__ORDER_INFO || {}
        var html_fn = $.tmpl($.trim($('#JsMXxgOrderSuningOneStopOrderTpl').html())),
            html_st = html_fn(data),
            $BlockOrderOneStopOrder = $('.block-order-suning-one-stop-order')

        $BlockOrderOneStopOrder.show().html(html_st)
        $BlockOrderOneStopOrder.find('.js-trigger-copy-the-text').each(function () {
            new ClipboardJS(this).on('success', function (e) {
                $.dialog.toast('复制成功：' + e.text)
            })
        })
    }

    function confirmGoToPriceDifference(order_id) {
        var url = tcb.setUrl2('/xxgHs/supplementAmountPay', {
            order_id: order_id
        })
        window.location.href = url
    }

    function bindEvent() {
        tcb.bindEvent({
            // 全款购机
            '.js-trigger-suning-one-stop-full-pay': function (e) {
                e.preventDefault()
                if (window.__IS_SHOW_DAODIAN_SERVER_TIME &&
                    (!window.__DAODIAN_REACH_TIME || window.__DAODIAN_REACH_TIME === '0000-00-00 00:00:00')) {
                    return $.dialog.toast('请选择到店时间')
                }
                var $me = $(this)
                var order_id = $me.attr('data-order-id')
                var url = tcb.setUrl2('/xxgHs/fullAmountPay', {
                    order_id: order_id
                })
                window.location.href = url
            },
            // 确认进入补差价
            '.js-trigger-suning-one-stop-order-confirm-submit': function (e) {
                e.preventDefault()
                tcb.closeDialog()
                window.__IS_ONE_STOP_ORDER_CONTINUE = true
                $('#FormUpdateOrderInfoByGoNext').trigger('submit')
            },
            // 取消进入补差价
            '.js-trigger-suning-one-stop-order-confirm-cancel': function (e) {
                e.preventDefault()
                tcb.closeDialog()
            }
        })
    }

    function init() {
        if (!window.__IS_ONE_STOP_ORDER || window.__IS_SF_FIX_ONE_STOP_ORDER) {
            return
        }
        // DOM Ready
        $(function () {
            var order_id = window.__ORDER_ID
            bindEvent()
            getOneStopOrderInfo(order_id)
        })
    }

    init()
}()


;/**import from `/resource/js/mobile/huishou/xxg/order_create.js` **/
!function () {
    if (window.__PAGE != 'xxg-order-create') {
        return
    }
    $ (function () {
        tcb.bindEvent (document.body, {
            // 切换tab
            '.block-tab .tab-item':function (e) {
                e.preventDefault()

                var $me = $(this),
                    pos = $me.attr('data-for-pos'),
                    $qrcode_item = $('.block-cont').find('.qrcode-item')

                $me.addClass('cur').siblings('.cur').removeClass('cur')
                $qrcode_item.hide().filter('[data-pos="'+pos+'"]').show()

                if(window.__SHOW_SHALOU_TIP_FLAG){
                    if(pos == '2'){
                        $('.block-cont .shalou-tips').show()
                        $('.block-cont .qrcode-tit').css({
                            'padding':'0',
                            'font-size': '.14rem'
                        })
                    }else{
                        $('.block-cont .shalou-tips').hide()
                        $('.block-cont .qrcode-tit').css({
                            'padding':'.12rem 0 .08rem'
                        })
                    }
                }
            },
            // 不可扫码原因弹窗
            '.js-trigger-unscannable-dialog':function (e) {
                e.preventDefault()

                var html_fn = $.tmpl($.trim($('#JsXxgUnscannableReasonDialogTpl').html())),
                    html_str = html_fn()

                var config = {
                    className: 'xxg-unscannable-reason-panel',
                    withClose: true,
                    middle: true
                }

                tcb.showDialog(html_str, config)
            },
            // 选择不可扫码原因
            '.js-trigger-option':function (e) {
                e.preventDefault()

                tcb.closeDialog()

                var $me = $(this)
                    data_id = $me.attr('data-id')

                setTimeout(function () {
                    window.XXG.redirect (tcb.setUrl2 ($me.attr ('href'), { _global_data : JSON.stringify ({ force_checked : data_id ,not_show_tab: 'notebook'}) }))
                }, 1)
            },
            // 笔记本回收
            '.js-trigger-create-notebook-order':function (e) {
                e.preventDefault()

                var $me = $(this)
                window.XXG.redirect (tcb.setUrl2 ($me.attr ('href'), { _global_data : JSON.stringify ({ not_show_tab: 'phone'}) }))
            },
            // 智能手表回收
            '.js-trigger-create-pad-order':function (e) {
                e.preventDefault()

                var $me = $(this)
                window.XXG.redirect (tcb.setUrl2 ($me.attr ('href'), { _global_data : JSON.stringify ({ not_show_tab: 'notebook', show_brands:['10'], pad: 1}) })+'#!/brand/10')
            }
        })

        $('.block-tab .tab-item').first().trigger('click')


        function startHeartBeat(){

            function heartBeat(){
                setTimeout(heartBeat, 3500)

                window.XXG.ajax({
                    url : tcb.setUrl ('/m/doGetAssessKeyByTokenForXXGInMiniapp'),
                    beforeSend : function () {},
                    success : function (res) {
                        if (!res.errno) {
                            if(res.result.imei){
                                window.XXG.redirect (tcb.setUrl2 ('/m/officialDiff/', {
                                    assess_key : res.result.assess_key,
                                    detect_token : res.result.detect_token,
                                    imei : res.result.imei,
                                    scene : res.result.scene
                                }))
                            }else{
                                window.XXG.redirect (tcb.setUrl2 ('/m/pinggu_shop/', {
                                    assess_key : res.result.assess_key,
                                    detect_token : res.result.detect_token,
                                    scene : res.result.scene
                                }))
                            }

                        }
                    },
                    error : function (err) {}
                })
            }
            heartBeat()
        }

        window.__PAGE == 'xxg-order-create' && startHeartBeat()

    })
} ()


;/**import from `/resource/js/mobile/huishou/xxg/special/shop_credit_hs.js` **/
!function(){
    if (window.__PAGE !== 'xxg-special-shop-credit-hs') {
        return
    }

    // 订单列表相关信息
    var __PageCache = {
        pn : 0,
        pn_max : 0,
        page_size: 20,
        is_loading: false,
        is_end: false,
        load_padding: 50
    }

    $ (function () {

        //获取及输出订单列表
        function getShopCreditHsXxgOrderList(options) {
            options = options ||{}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = options.page_size || __PageCache.page_size,
                params = {
                    pn: pn,
                    page_size: page_size
                },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id'),
                search_status = tcb.queryUrl(window.location.search, 'search_status'),
                search_status_sets = ['0', '10', '20', '30', '40']

            search_status = tcb.inArray(search_status, search_status_sets) > -1 ? search_status : 0
            params['search_status'] = search_status

            if(order_mobile_id){
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetXxgOrderListForCredit',params,function (res) {
                try {
                    res = $.parseJSON(res)

                    if(!res['errno']){
                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()

                        var order_list = res['result']['order_list' ],
                            total_count = res['result']['total' ],
                            $List

                        if (!__PageCache.pn_max){

                            __PageCache.pn_max = Math.floor(total_count/__PageCache.page_size)
                        }

                        if (order_list && order_list.length){
                            var html_fn = $.tmpl($.trim($('#JsShopCreditHsXxgOrderListTpl').html())),
                                html_str = html_fn({
                                    'list':order_list
                                })

                            $List = $('.block-order-list')
                            $List.append(html_str)

                            // 添加加载ing的html显示
                            uiAddLoadingHtml($List)

                            __PageCache.pn = pn
                        }

                        if (__PageCache.pn>=__PageCache.pn_max){
                            __PageCache.is_end = true

                            // 移除商品加载ing的html
                            uiRemoveLoadingHtml()
                            $List = $List || $('.block-order-list')
                            uiAddNoMoreHtml($List)
                        }
                    }
                }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        // 添加没有更多商品的html显示
        function uiAddNoMoreHtml($target) {
            var html_st = '<div class="ui-no-more" id="UINoMore">已经没有更多内容~</div>'

            $target = $target || $('body')

            $target.append(html_st)
        }

        // 添加加载ing的html显示
        function uiAddLoadingHtml($target) {
            var
                $Loading = $('#UILoading')

            if ($Loading && $Loading.length) {

                return
            }
            var
                img_html = '<img class="ui-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif">',
                loading_html = '<div class="ui-loading" id="UILoading">' + img_html + '<span class="ui-loading-txt">加载中...</span></div>'

            $target = $target || $('body')

            $target.append(loading_html)
        }
        // 移除加载ing的html
        function uiRemoveLoadingHtml() {
            var
                $Loading = $('#UILoading')

            if ($Loading && $Loading.length) {

                $Loading.remove()
            }
        }

        // 绑定事件
        function bindEvent(){

            var $win = tcb.getWin (),
                $body = $ ('body'),
                //可见区域的高度
                viewH = $win.height (),
                scrollHandler = function (e) {
                    // 已经滚动加载完所有订单，那么干掉滚动事件
                    if (__PageCache.is_end){
                        return $win.off('scroll', scrollHandler)
                    }
                    // 加载中，不再重复执行加载
                    if (__PageCache.is_loading){
                        return
                    }
                    //可滚动内容的高度(此值可变，只能放在scroll滚动时动态获取)
                    var scrollH = $body[ 0 ].scrollHeight,
                        // 计算可滚动最大高度，即滚动到时了最底部
                        maxSH = scrollH - viewH,
                        //滚动条向上滚出的高度
                        st = $win.scrollTop ()

                    if (st >= (maxSH - __PageCache.load_padding)){
                        getShopCreditHsXxgOrderList({
                            pn : __PageCache.pn+1
                        })
                    }
                }
            $win.on ('scroll', scrollHandler)
        }


        // 页面初始化入口函数
        function init(){
            // 绑定事件
            bindEvent()

            // 加载首页
            getShopCreditHsXxgOrderList()
        }
        init()

    })

}()

;/**import from `/resource/js/mobile/huishou/xxg/special/shop_youji_hs.js` **/
!function(){
    if (window.__PAGE !== 'xxg-special-shop-youji-hs') {
        return
    }

    // 订单列表相关信息
    var __PageCache = {
        pn : 0,
        pn_max : 0,
        page_size: 20,
        is_loading: false,
        is_end: false,
        load_padding: 50
    }

    $ (function () {

        //获取及输出订单列表
        function getShopYoujiHsXxgOrderList(options) {
            options = options ||{}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = options.page_size || __PageCache.page_size,
                params = {
                    pn: pn,
                    page_size: page_size
                },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id'),
                search_status = tcb.queryUrl(window.location.search, 'search_status'),
                search_status_sets = ['0', '10', '20', '30', '40']

            search_status = tcb.inArray(search_status, search_status_sets) > -1 ? search_status : 0
            params['search_status'] = search_status

            if(order_mobile_id){
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetXxgOrderListForYouji',params,function (res) {
                try {
                    res = $.parseJSON(res)

                    if(!res['errno']){
                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()

                        var order_list = res['result']['order_list' ],
                            total_count = res['result']['total' ],
                            $List

                        if (!__PageCache.pn_max){

                            __PageCache.pn_max = Math.floor(total_count/__PageCache.page_size)
                        }

                        if (order_list && order_list.length){
                            var html_fn = $.tmpl($.trim($('#JsShopYoujiHsXxgOrderListTpl').html())),
                                html_str = html_fn({
                                    'list':order_list
                                })

                            $List = $('.block-order-list')
                            $List.append(html_str)

                            // 添加加载ing的html显示
                            uiAddLoadingHtml($List)

                            __PageCache.pn = pn
                        }

                        if (__PageCache.pn>=__PageCache.pn_max){
                            __PageCache.is_end = true

                            // 移除商品加载ing的html
                            uiRemoveLoadingHtml()
                            $List = $List || $('.block-order-list')
                            uiAddNoMoreHtml($List)
                        }
                    }
                }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        // 添加没有更多商品的html显示
        function uiAddNoMoreHtml($target) {
            var html_st = '<div class="ui-no-more" id="UINoMore">已经没有更多内容~</div>'

            $target = $target || $('body')

            $target.append(html_st)
        }

        // 添加加载ing的html显示
        function uiAddLoadingHtml($target) {
            var
                $Loading = $('#UILoading')

            if ($Loading && $Loading.length) {

                return
            }
            var
                img_html = '<img class="ui-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif">',
                loading_html = '<div class="ui-loading" id="UILoading">' + img_html + '<span class="ui-loading-txt">加载中...</span></div>'

            $target = $target || $('body')

            $target.append(loading_html)
        }
        // 移除加载ing的html
        function uiRemoveLoadingHtml() {
            var
                $Loading = $('#UILoading')

            if ($Loading && $Loading.length) {

                $Loading.remove()
            }
        }

        // 绑定事件
        function bindEvent(){

            var $win = tcb.getWin (),
                $body = $ ('body'),
                //可见区域的高度
                viewH = $win.height (),
                scrollHandler = function (e) {
                    // 已经滚动加载完所有订单，那么干掉滚动事件
                    if (__PageCache.is_end){
                        return $win.off('scroll', scrollHandler)
                    }
                    // 加载中，不再重复执行加载
                    if (__PageCache.is_loading){
                        return
                    }
                    //可滚动内容的高度(此值可变，只能放在scroll滚动时动态获取)
                    var scrollH = $body[ 0 ].scrollHeight,
                        // 计算可滚动最大高度，即滚动到时了最底部
                        maxSH = scrollH - viewH,
                        //滚动条向上滚出的高度
                        st = $win.scrollTop ()

                    if (st >= (maxSH - __PageCache.load_padding)){
                        getShopYoujiHsXxgOrderList({
                            pn : __PageCache.pn+1
                        })
                    }
                }
            $win.on ('scroll', scrollHandler)
        }


        // 页面初始化入口函数
        function init(){
            // 绑定事件
            bindEvent()

            // 加载首页
            getShopYoujiHsXxgOrderList()
        }
        init()

    })

}()

;/**import from `/resource/js/mobile/huishou/xxg/special/shop_tuijian_hs.js` **/
!function(){
    if (window.__PAGE !== 'xxg-special-shop-tuijian-hs') {
        return
    }

    // 订单列表相关信息
    var __PageCache = {
        pn : 0,
        pn_max : 0,
        page_size: 20,
        is_loading: false,
        is_end: false,
        load_padding: 50
    }

    $ (function () {

        //获取及输出订单列表
        function getShopTuijianHsXxgOrderList(options) {
            options = options ||{}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = options.page_size || __PageCache.page_size,
                params = {
                    pn: pn,
                    page_size: page_size
                },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id'),
                search_status = tcb.queryUrl(window.location.search, 'search_status'),
                search_status_sets = ['0', '5', '10', '20', '30', '40']

            search_status = tcb.inArray(search_status, search_status_sets) > -1 ? search_status : 0
            params['search_status'] = search_status

            if(order_mobile_id){
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetXxgTuijianYoujiOrderlist',params,function (res) {
                try {
                    res = $.parseJSON(res)

                    if(!res['errno']){
                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()

                        var order_list = res['result']['order_list' ],
                            total_count = res['result']['total' ],
                            $List

                        if (!__PageCache.pn_max){

                            __PageCache.pn_max = Math.floor(total_count/__PageCache.page_size)
                        }

                        if (order_list && order_list.length){
                            var html_fn = $.tmpl($.trim($('#JsShopTuijianHsXxgOrderListTpl').html())),
                                html_str = html_fn({
                                    'list':order_list
                                })

                            $List = $('.block-order-list')
                            $List.append(html_str)

                            // 添加加载ing的html显示
                            uiAddLoadingHtml($List)

                            __PageCache.pn = pn
                        }

                        if (__PageCache.pn>=__PageCache.pn_max){
                            __PageCache.is_end = true

                            // 移除商品加载ing的html
                            uiRemoveLoadingHtml()
                            $List = $List || $('.block-order-list')
                            uiAddNoMoreHtml($List)
                        }
                    }
                }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        // 添加没有更多商品的html显示
        function uiAddNoMoreHtml($target) {
            var html_st = '<div class="ui-no-more" id="UINoMore">已经没有更多内容~</div>'

            $target = $target || $('body')

            $target.append(html_st)
        }

        // 添加加载ing的html显示
        function uiAddLoadingHtml($target) {
            var
                $Loading = $('#UILoading')

            if ($Loading && $Loading.length) {

                return
            }
            var
                img_html = '<img class="ui-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif">',
                loading_html = '<div class="ui-loading" id="UILoading">' + img_html + '<span class="ui-loading-txt">加载中...</span></div>'

            $target = $target || $('body')

            $target.append(loading_html)
        }
        // 移除加载ing的html
        function uiRemoveLoadingHtml() {
            var
                $Loading = $('#UILoading')

            if ($Loading && $Loading.length) {

                $Loading.remove()
            }
        }

        // 绑定事件
        function bindEvent(){

            var $win = tcb.getWin (),
                $body = $ ('body'),
                //可见区域的高度
                viewH = $win.height (),
                scrollHandler = function (e) {
                    // 已经滚动加载完所有订单，那么干掉滚动事件
                    if (__PageCache.is_end){
                        return $win.off('scroll', scrollHandler)
                    }
                    // 加载中，不再重复执行加载
                    if (__PageCache.is_loading){
                        return
                    }
                    //可滚动内容的高度(此值可变，只能放在scroll滚动时动态获取)
                    var scrollH = $body[ 0 ].scrollHeight,
                        // 计算可滚动最大高度，即滚动到时了最底部
                        maxSH = scrollH - viewH,
                        //滚动条向上滚出的高度
                        st = $win.scrollTop ()

                    if (st >= (maxSH - __PageCache.load_padding)){
                      getShopTuijianHsXxgOrderList({
                            pn : __PageCache.pn+1
                        })
                    }
                }
            $win.on ('scroll', scrollHandler)
        }


        // 页面初始化入口函数
        function init(){
            // 绑定事件
            bindEvent()

            // 加载首页
          getShopTuijianHsXxgOrderList()
        }
        init()

    })

}()

;/**import from `/resource/js/mobile/huishou/xxg/special/scan_shop_credit_hs.js` **/
!function () {
    if (window.__PAGE !== 'xxg-special-scan-shop-credit-hs') {
        return
    }

    // 判断是 小程序信用回收还是普通信用回收 标志,默认 false(非小程序信用回收)
    var aliapp_flag = false

    $ (function () {

        $('.btn-xxg-confirm').on('click', function(e){
            e.preventDefault()

            var $me = $(this)

            if ($me.hasClass('btn-disabled')){
                return
            }
            $me.addClass('btn-disabled')

            // 小程序信用回收还是普通信用回收,进行赋值
            aliapp_flag = $me.attr('data-aliapp-flag') === 'true' ? true : false
            var order_id = ''

            // 如果是 小程序
            if(aliapp_flag){

              order_id = $me.attr('data-pre-order-id')

            } else {    // 否则就是普通信用回收

              order_id = $me.attr('data-order-id')

            }

            __doConfirmShopCreditHs(order_id, function(){
                $me.addClass('btn-disabled').html('已确认以旧换新')

                $.dialog.toast('确认以旧换新成功~')

                setTimeout(function(){
                    window.location.href = window.location.href
                }, 600)
            }, function(errmsg){
                $.dialog.toast(errmsg)

                setTimeout(function(){
                    $me.removeClass('btn-disabled')
                }, 600)
            })
        })


        function __doConfirmShopCreditHs(order_id, callback, fail){

            // 如果是 小程序信用回收
            if(aliapp_flag){
              $.get('/m/doBindXxgForCreditPreOrder', {

                pre_orderid: order_id

              }, function(res){
                res = $.parseJSON(res)

                if (!res.errno){

                  'function' == typeof callback && callback()
                } else {
                  'function' == typeof fail && fail(res.errmsg)
                }
              })

            } else {    // 否则就是普通信用回收

              $.get('/m/doConfirmShopCreditHs', {

                order_id: order_id

              }, function(res){
                res = $.parseJSON(res)

                if (!res.errno){

                  'function' == typeof callback && callback()
                } else {
                  'function' == typeof fail && fail(res.errmsg)
                }
              })
            }
        }

    })

} ()

;/**import from `/resource/js/mobile/huishou/xxg/special/user_pay.js` **/
!function () {
    if (window.__PAGE !== 'xxg-special-user-pay') {
        return
    }

    $(function () {
        $('.btn-switch-payment').on('click', function (e) {
            e.preventDefault()

            var $blockAlipay = $('.block-alipay'),
                $blockWechat = $('.block-wechat')

            if ($blockAlipay.height()) {
                $blockWechat.show()
                $blockAlipay.hide()
            } else if ($blockWechat.height()) {
                $blockAlipay.show()
                $blockWechat.hide()
            }
        })

        var timerHandler
        var orderId = tcb.queryUrl(window.location.search, 'orderId')

        // showConfirmDialog({
        //     headimgurl:'https://s.gravatar.com/avatar/8cb07ae4cf42101cf2885feea4780abc?size=50&default=retro',
        //     nickname:'小火车'
        // })

        heartBeat()

        function heartBeat() {
            window.XXG.ajax({
                url: '/m/getAuthUserInfo',
                data: {
                    orderId: orderId
                },
                beforeSend: function () {
                },
                success: function (res) {
                    if (!res.errno) {
                        showConfirmDialog(res.result || {})
                    }
                },
                error: function (err) {}
            })
            timerHandler = setTimeout(heartBeat, 3500)
        }

        function showConfirmDialog(result) {
            var nickname = result.nickname,
                headimgurl = result.headimgurl,
                html_str = '<div class="tit">请和用户确认收款账号</div><div class="grid nowrap align-center justify-center">'
            if (headimgurl) {
                html_str += '<div class="col auto"><img src=' + headimgurl + ' alt=""></div>'
            }
            if (nickname) {
                html_str += '<div class="payee-col col auto"><div class="payee">' + nickname + '</div><div>收款人</div></div>'
            }
                html_str += '</div>'
            if (headimgurl || nickname) {
                // 获取到用户信息停止轮询
                clearTimeout(timerHandler)

                $.dialog.confirm(html_str, function () {
                    //点击确定收款
                    window.XXG.ajax({
                        url: '/m/xxgConfirmPaymentInfo',
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (!res.errno || res.errno == 19200) {
                                // 订单服务完成
                                window.XXG.ajax({
                                    url: '/m/aj_wancheng_order',
                                    data: {
                                        order_id: orderId,
                                        status: window.__STATUS
                                    },
                                    success: function (res) {
                                        if (!res.errno) {
                                            window.XXG.redirect(tcb.setUrl2('/m/hs_xxg_order', {
                                                order_id: orderId
                                            }), true)
                                        } else {
                                            heartBeat()
                                            $.dialog.toast(res.errmsg)
                                        }
                                    }
                                })
                            } else {
                                heartBeat()
                                $.dialog.toast(res.errmsg)
                            }
                        }
                    })
                }, function () {
                    // 点击取消
                    window.XXG.ajax({
                        url: '/m/xxgCancelPaymentInfo',
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (!res.errno) {
                                heartBeat()
                            } else {
                                $.dialog.toast(res.errmsg)
                            }
                        }
                    })
                })
                $('.ui-btn-succ').val('确认打款')
            }
        }
    })

}()


;/**import from `/resource/js/mobile/huishou/xxg/special/sf_fix_reward_list.js` **/
!function () {
    if (window.__PAGE !== 'xxg-special-sf-fix-reward-list') {
        return
    }

    $(function () {
        var cacheData = {
            'pn': 1,
            'loading': false,
            'no_more': false,
            'last_month': ''
        }

        // 输出提成汇总
        function renderRewardSummary() {
            var $block_top = $('.block-top'),
                $block_list = $('.block-list'),
                $block_none = $('.block-none')

            $.get('/xxgHs/doGetSfFixBonusAggregation', function (res) {
                if (!res.errno && res.result) {
                    if (res.result.all) {
                        $block_top.show()
                        $block_list.show()

                        var tmpl_fn = $.tmpl($.trim($('#JsXxgSfFixRewardSummaryTpl').html())),
                            tmpl_str = tmpl_fn({
                                data: res.result
                            })
                        $block_top.html(tmpl_str)
                    } else {
                        $block_none.show()
                    }
                }
            })
        }

        renderRewardSummary()

        // 获取提成列表数据
        function getRewardList(callback) {
            if (cacheData.no_more || cacheData.loading) {
                return
            }
            cacheData.loading = true

            var params = {
                page: cacheData.pn
            }
            $.get('/xxgHs/doGetSfFixBonusList', params, function (res) {
                cacheData.loading = false

                if (!res.errno && res.result) {
                    var result = res.result,
                        list = result.data || [],
                        pn_max = result.page,
                        data = {
                            list: list,
                            last_month: cacheData.last_month
                        }

                    $.isFunction(callback) && callback(data)

                    if (cacheData.pn === pn_max) {
                        cacheData.no_more = true
                        var $target = $('.block-list')
                        uiAddNoMoreHtml($target)
                    }

                    cacheData.pn++
                    cacheData.last_month = list.length && list[list.length - 1].month
                }
            })
        }

        // 添加提成列表
        function appendRewardList() {
            getRewardList(function (data) {
                var tmpl_fn = $.tmpl($.trim($('#JsXxgSfFixRewardListTpl').html())),
                    tmpl_str = tmpl_fn({
                        list: data.list,
                        last_month: data.last_month
                    })

                var $target = $('.block-list')
                $target.append(tmpl_str)
            })
        }

        // 添加没有更多商品的html显示
        function uiAddNoMoreHtml($target) {
            var html_st = '<div class="ui-no-more" id="UINoMore">已经没有更多内容~</div>'

            $target = $target || $('body')

            $target.append(html_st)
        }

        $(window).on('load scroll', function () {
            // 滚动条滚动的高度 + 可视窗口的高度 >= 文档的高度
            if ($(window).scrollTop() + $(window).height() >= $('body')[0].scrollHeight) {
                appendRewardList()
            }
        })
    })
}()


;/**import from `/resource/js/mobile/huishou/xxg/special/demo_product_list.js` **/
!function () {
    if (window.__PAGE !== 'xxg-special-demo-product-list') {
        return
    }

    $(function () {
        var cacheData = {
            'pn': 1,
            'loading': false,
            'no_more': false
        }

        // 输出筛选项
        function renderSearchOption(callback) {
            $.post('/m/getNewMachineSearchOption', function (res) {
                if (!res.errno && res.result) {
                    var result = res.result,
                        sale_channel_list = result.sale_channel,
                        shop_list = result.shop_list,
                        shopPickerData = [[{
                            id: '',
                            name: '选择门店'
                        }]]

                    tcb.each(shop_list, function (i, item) {
                        shopPickerData[0].push({
                            id: i,
                            name: item
                        })
                    })
                    $.isFunction(callback) && callback(shopPickerData)

                    var html_channel = '<option value="">渠道合作方</option>',
                        $target_channel = $('[name="channel_id"]')
                    if ($target_channel && $target_channel.length) {
                        tcb.each(sale_channel_list, function (i, item) {
                            html_channel += '<option value="' + i + '">' + item + '</option>'
                        })
                        $target_channel.html(html_channel)
                    }
                }
            })
        }

        // 选择门店
        function shopSelector($selectorTrigger, pickerData) {
            window.Bang.Picker({
                flagAutoInit: true,
                flagFilter: true,
                selectorTrigger: $selectorTrigger,
                col: 1,
                data: pickerData,
                dataPos: [0],
                dataTitle: ['选择门店'],
                callbackConfirm: function (inst) {
                    inst.getTrigger().val(inst.options.data[0][inst.options.dataPos[0]].name)
                    $('[name="shop_id"]').val(inst.options.data[0][inst.options.dataPos[0]].id)
                },
                callbackCancel: null
            })
        }

        // 筛选
        function submitFormSearch() {
            var $form = $('.form-search')
            $form.on('submit', function () {
                var channel_id = $('[name="channel_id"]').val(),
                    shop_id = $('[name="shop_id"]').val()

                if (!channel_id && !shop_id) {
                    return
                }
                cacheData.pn = 1
                cacheData.no_more = false
                cacheData.channel_id = channel_id
                cacheData.shop_id = shop_id

                appendDemoProductList()
            })
        }

        // 获取演示机列表数据
        function getDemoProductList(callback) {
            if (cacheData.no_more || cacheData.loading) {
                return
            }
            cacheData.loading = true

            var params = {
                page: cacheData.pn,
                channel_id: cacheData.channel_id,
                shop_id: cacheData.shop_id
            }
            $.post('/m/getNewMachineList', params, function (res) {
                cacheData.loading = false

                if (!res.errno && res.result) {
                    var result = res.result,
                        list = result.goods_list || []

                    if (list.length) {
                        $.isFunction(callback) && callback(list)
                        cacheData.pn++
                    } else {
                        var $target = $('.block-list')
                        cacheData.no_more = true

                        if (cacheData.pn == 1) {
                            $target.html('<div class="item-none">暂无数据</div>')
                        } else {
                            uiAddNoMoreHtml($target)
                        }
                    }
                }
            })
        }

        // 添加演示机列表
        function appendDemoProductList() {
            getDemoProductList(function (list) {
                var html_fn = $.tmpl($.trim($('#JsXxgDemoProductListTpl').html())),
                    html_str = html_fn({
                        list: list
                    })

                var $target = $('.block-list')
                if (cacheData.pn == 1) {
                    $target.html(html_str)
                } else {
                    $target.append(html_str)
                }
            })
        }

        // 添加没有更多商品的html显示
        function uiAddNoMoreHtml($target) {
            var html_st = '<div class="ui-no-more" id="UINoMore">已经没有更多内容~</div>'

            $target = $target || $('body')

            $target.append(html_st)
        }

        // 展示评估弹窗
        function showDialogAssess(list, id) {
            var html_fn = $.tmpl($.trim($('#JsXxgDemoProductAssessTpl').html())),
                html_str = html_fn({
                    list: list
                })
            var config = {
                withMask: true,
                className: 'dialog-assess-wrap',
                middle: true
            }
            tcb.showDialog(html_str, config)
            submitFormAssess(id)
        }

        // 提交评估表单
        function submitFormAssess(id) {
            var $form = $('.form-assess')

            $form.on('submit', function () {
                if (!validFormAssess($form)) {
                    return false
                }

                var params = $form.serialize() + '&id=' + id

                $.post($form.attr('action'), params, function (res) {
                    if (!res.errno) {
                        $.dialog.toast('提交成功！', 2000)
                        setTimeout(function () {
                            tcb.closeDialog()
                        }, 500)
                    } else {
                        $.dialog.toast(res.errmsg, 2000)
                    }
                })
            })
        }

        // 验证评估表单
        function validFormAssess($form) {
            var flag = true,
                $focus = null

            $form.find('select').each(function () {
                var $me = $(this)
                var $row = $me.closest('.col')

                if (!$me.val()) {
                    flag = false
                    $focus = $focus || $me
                    $row.shine4Error()
                    $.dialog.toast('请选择', 2000)
                }
            })

            return flag
        }

        tcb.bindEvent(document.body, {
            '.js-trigger-show-dialog': function (e) {
                e.preventDefault()

                var $me = $(this),
                    id = $me.attr('data-id')

                $.post('/m/getNewMachineOptionInfo', {
                    id: id
                }, function (res) {
                    if (!res.errno) {
                        var list = res.result.option || []

                        showDialogAssess(list, id)
                    } else {
                        $.dialog.toast(res.errmsg, 2000)
                    }
                })
            }
        })

        function init() {
            $(window).on('load scroll', function () {
                // 滚动条滚动的高度 + 可视窗口的高度 >= 文档的高度
                if ($(window).scrollTop() + $(window).height() >= $('body')[0].scrollHeight) {
                    appendDemoProductList()
                }
            })

            renderSearchOption(function (shopPickerData) {
                shopSelector($('[name="shop_name"]'), shopPickerData)
            })

            submitFormSearch()
        }

        init()
    })
}()


;/**import from `/resource/js/mobile/huishou/xxg/engineer_refund_cashier_desk.js` **/
// 修修哥，取消订单、补差价，退款支付平台
!function(){
    if (window.__PAGE != 'xxg-engineer-refund-cashier-desk') {
        return
    }

    $(function () {
        var
            // 支付方式列表
            pay_type_arr = ['WXPAY_JS', 'alipay'],
            // 支付方式映射表
            pay_type_map = {
                'WXPAY_JS': {},
                'alipay': {}
            }

        tcb.bindEvent(document.body, {
            // 选择支付方式
            '.row-pay': function (e) {
                e.preventDefault();
                var
                    $me = $(this),
                    pay_type = $me.attr('data-pay-type');
                if (tcb.inArray(pay_type, pay_type_arr) == -1) {
                    // 获取到的支付方式不在支付方式数组表中,将第一个支付方式当作默认支付方式
                    pay_type = pay_type_arr[0]
                }
                var
                    $other_rows = $me.siblings('.row-pay');
                $me.find('.iconfont').addClass('icon-circle-tick');
                $other_rows.find('.icon-circle-tick').removeClass('icon-circle-tick');
                if (typeof pay_type_map[pay_type] !== 'undefined') {
                    var pay_params = {
                        order_id: window.__ORDER_ID,
                        pay_type: pay_type,
                        refund_type: window.__REFUND_TYPE
                    };
                    // 支付地址
                    $('.btn-pay').attr('href', tcb.setUrl2('/m/submitEngineerRefundPay', pay_params))
                }
            },
            // 点击支付按钮
            '.btn-pay': function (e) {
                if ($('body').hasClass('page-disabled')) {
                    // 页面禁用,支付按钮不让点啦
                    return e.preventDefault()
                }
            }
        })
    })

}()


;/**import from `/resource/js/mobile/huishou/xxg/normal_cashier_desk.js` **/
// 修修哥通用支付平台
!function () {
    if (window.__PAGE != 'xxg-normal-cashier-desk') {
        return
    }

    $(function () {
        var
                // 支付方式列表
                pay_type_arr = ['WXPAY_JS', 'alipay'],
                // 支付方式映射表
                pay_type_map = {
                    'WXPAY_JS': {},
                    'alipay': {}
                }

        tcb.bindEvent(document.body, {
            // 选择支付方式
            '.row-pay': function (e) {
                e.preventDefault();
                var $me = $(this),
                        pay_type = $me.attr('data-pay-type');
                if (tcb.inArray(pay_type, pay_type_arr) == -1) {
                    // 获取到的支付方式不在支付方式数组表中,将第一个支付方式当作默认支付方式
                    pay_type = pay_type_arr[0]
                }
                var $other_rows = $me.siblings('.row-pay');
                $me.find('.iconfont').addClass('icon-circle-tick');
                $other_rows.find('.icon-circle-tick').removeClass('icon-circle-tick');
                if (typeof pay_type_map[pay_type] !== 'undefined') {
                    var pay_params = {
                        order_id: window.__ORDER_ID,
                        pay_type: pay_type,
                        business_id: window.__BUSINESS_ID,
                        scan: window.__SCAN
                    };
                    // 支付地址
                    $('.btn-pay').attr('href', tcb.setUrl2('/Recycle/Engineer/CashierDesk/submit', pay_params))
                }
            },
            // 点击支付按钮
            '.btn-pay': function (e) {
                if ($('body').hasClass('page-disabled')) {
                    // 页面禁用,支付按钮不让点啦
                    return e.preventDefault()
                }
            },
            '.js-trigger-show-customer-draw-qrcode': function (e) {
                e.preventDefault();
                __showCustomerDrawQRCode($(this))
            },
            '.js-trigger-finish-pay': function (e) {
                e.preventDefault();
                __finishPay($(this))
            }
        })

        function __showCustomerDrawQRCode($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            var qrcode = $trigger.attr('data-qrcode');
            var dialog_str = '<img src="' + qrcode + '" alt=""><div class="tips"><a class="btn btn-success js-trigger-finish-pay" href="#">已完成付款</a></div>';

            tcb.showDialog(dialog_str, {
                className: 'qrcode-wrap',
                withMask: true,
                middle: true
            });
            tcb.statistic(['_trackEvent', 'xxg', '显示', '支付二维码', '1', ''])
        }

        function __finishPay($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            window.XXG.ajax({
                url: '/Recycle/Engineer/CashierDesk/status',
                data: {
                    order_id: window.__ORDER_ID,
                    business_id: window.__BUSINESS_ID
                },
                success: function (res) {
                    if (!res.errno) {
                        if (res.result) {
                            $.dialog.alert('支付成功!', function () {
                                window.history.back(-1);
                            })
                        } else {
                            $.dialog.alert('付款还未完成,请继续完成付款');
                        }
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                }
            })
        }
    })
}()

