var https = require('https');
var url = require('url');

var authHeaders = {}

function doAuth() {
    var payload = 'Email=thomas.schnocklake@gmail.com&Passwd=k3%256%24ts&accountType=GOOG&source=Google-cURL-Example&service=writely';
    var options = {
        host: 'www.google.com',
        port: 443,
        path: '/accounts/ClientLogin',
        method: 'POST',
        headers: {
            Accept: "*/*",
            "GData-Version": "3.0",
            "If-match": "*",
            "content-length": payload.length,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "accept": "*/*",
        },
    };

    var req = https.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
//        console.log("headers: ", res.headers);
        res.on('data', onAuth);
    });


    req.on('error', onErr);
    req.write(payload);
    req.end();
}

function onErr(e) {
    console.error(e);
}

function onAuth(d) {
    var s = "";
    for (var v in d) {
        s += String.fromCharCode(d[v]);
    }

    var auth = s;
    auth = auth.substring(auth.indexOf("Auth=") + 5, auth.length - 1);
    process.stdout.write(auth);

    authHeaders = {
        "Accept": "*/*",
        "GData-Version": "3.0",
        "Authorization": "GoogleLogin Auth=" + auth,
    };
    fetchDocs();
}

var responseString = "";

function fetchDocs() {
    var options = {
        host: 'docs.google.com',
        port: 443,
        path: '/feeds/default/private/full/-/%7Bhttp%3A%2F%2Fschemas.google.com%2Fg%2F2005%23kind%7Dimage%2Fjpeg?alt=json&q=owner%3Athomas.schnocklake%40googlemail.com+-exif&max-results=3',
        method: 'GET',
        headers: authHeaders,
    };
    var req = https.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        res.on('data', onFetchDocsData);
        res.on('end', onFetchDocsEnd);
    });

    req.on('error', onErr);
    req.end();
}

function onFetchDocsData(d) {
    var x = d.toString();
    responseString += x;
}


function onFetchDocsEnd() {

    var obj = JSON.parse(responseString);
    //    process.stdout.write(JSON.stringify(obj));
    for (var i in obj.feed.entry) {
        var documentListEntry = obj.feed.entry[i];

        var options = url.parse(documentListEntry.content.src);
        options.method= 'GET';
        options['If-match']= "*";
        options.headers = {};
        options.headers.Accept = authHeaders.Accept;
        options.headers.Authorization = authHeaders.Authorization;
        options.headers['GData-Version'] = authHeaders['GData-Version'];
        
        options.headers.Range= "bytes=0-9999";
        console.log("documentListEntry: " + documentListEntry.id.$t);

        doRequest(options, documentListEntry);     
    }
}


  function doRequest(options, documentListEntry)
  {
    var req = https.request(options, function(res) {contentResponse(res, documentListEntry);});        
    req.on('error', onErr);
    req.end();                
  }



function contentResponse(res,dle) {
  console.log("statusCode: ", res.statusCode);
  //            console.log("headers: ", res.headers);
  var data = new Buffer(10000);
  var off = 0;
  res.on('data', function(chunk) {
    chunk.copy(data, off);
    off += chunk.length;

    console.log(off);
    console.log("dls: " + dle.id.$t);
  });

  res.on('end', function() {
    onSourceReceivedEnd(data, dle);
  });
}

function onSourceReceivedEnd(data, documentListEntry1) {
//    console.log("onEditLinkDate data: " + data.length);
//    console.log("onEditLinkDate documentListEntry1 docs$md5Checksum: " + JSON.stringify(documentListEntry1.docs$md5Checksum.$t,null,'\t'));

    console.log(data.toString("base64") );
    
    
    var BinaryFile = LoadBinLib();
    var EXIF = initExifLib();
    
    var binFile = new BinaryFile(data);
        
    var exif = EXIF.readFromBinaryFile(binFile);
    console.log(exif );
    
    
    var desc = {};
    desc.md5sum = documentListEntry1.docs$md5Checksum.$t;
    
    console.log("onSourceReceivedEnd: " + documentListEntry1.id.$t);
    
    for (var m in exif) {
      if (typeof exif[m] == "object") {
        var s = "";
        for (var v in exif[m]) {s += String.fromCharCode(exif[m][v]);}
        delete exif[m];
      }
    }
 
    desc.exif = exif;
    
    
    // http://nodejs.org/api.html#_child_processes
var exec = require('child_process').exec;
var child;

// executes `pwd`
child = exec("exiftool -G -j -", function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});
    
child.stdin.write(data);
child.stdin.end();

    
    
    return;
//    console.log(desc);
    var editLink;
    for (var j in documentListEntry1.link) {
      if (documentListEntry1.link[j].rel == 'edit') {
        editLink = documentListEntry1.link[j];
      }
    }
    //console.log(editLink);
    
    var payload =  '<?xml version="1.0" encoding="utf-8"?>';
    payload += '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:docs="http://schemas.google.com/docs/2007"><docs:description>' + JSON.stringify(desc,null, "\t") + '</docs:description></entry>';

    var options = url.parse(editLink.href);
    
    options.method= 'PUT';    
    options.headers = {};
    options.headers['If-match']= "*";
    options.headers.Accept = authHeaders.Accept;
    options.headers.Authorization = authHeaders.Authorization;
    options.headers['GData-Version'] = authHeaders['GData-Version'];
    options.headers['content-length'] = payload.length;
    options.headers['content-type'] = "application/atom+xml; charset=UTF-8";


    var req = https.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        //console.log("update headers: ", res.headers);
        
        
        
            res.on('data', function(chunk) { 
             
              
          //    console.log(chunk.toString());
            }) ;
        
         
    });

    req.on('error', onErr);

    req.write(payload);
    req.end();
  
}


doAuth();








































/*

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (var ix in this) {
    if (ix == 'clone') continue;
    if (this[ix] && typeof this[ix] == "object") {
      newObj[ix] = this[i].clone();
    } else newObj[ix] = this[ix]
  } return newObj;
};

*/

function LoadBinLib() {  
/*
 * Binary Ajax 0.1.10
 * Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */

  
  var BinaryFile = function(strData, iDataOffset, iDataLength) {
//    var data = strData;
    var data = new Buffer(strData.length);
    strData.copy(data);
    
    
    var dataOffset = iDataOffset || 0;
    var dataLength = 0;
    
    this.getRawData = function() {
      return data;
    }
    
  
    dataLength = iDataLength || data.length;

        this.getByteAt = function(iOffset) {
          var bb = data[iOffset];
/*          if (bb < 0) {
            bb = bb + 256;
          }
*/          
          return bb;
        }
        
        this.getBytesAt = function(iOffset, iLength) {
            var aBytes = [];
            
            for (var i = 0; i < iLength; i++) {
              var bb = data[iOffset + i];
/*              
              if (bb < 0) {
                bb = bb + 256;
              }
*/              
              aBytes[i] = bb;
            };
            
            return aBytes;
        }
    

/*
if (typeof strData == "string") {
        dataLength = iDataLength || data.length;

        this.getByteAt = function(iOffset) {
            return data.charCodeAt(iOffset + dataOffset) & 0xFF;
        }
        
        this.getBytesAt = function(iOffset, iLength) {
            var aBytes = [];
            
            for (var i = 0; i < iLength; i++) {
                aBytes[i] = data.charCodeAt((iOffset + i) + dataOffset) & 0xFF
            };
            
            return aBytes;
        }
    } else if (typeof strData == "unknown") {
        dataLength = iDataLength || IEBinary_getLength(data);

        this.getByteAt = function(iOffset) {
            return IEBinary_getByteAt(data, iOffset + dataOffset);
        }

        this.getBytesAt = function(iOffset, iLength) {
            return new VBArray(IEBinary_getBytesAt(data, iOffset + dataOffset, iLength)).toArray();
        }
    }
*/
    this.getLength = function() {
        return dataLength;
    }

    this.getSByteAt = function(iOffset) {
        var iByte = this.getByteAt(iOffset);
        if (iByte > 127)
            return iByte - 256;
        else
            return iByte;
    }

    this.getShortAt = function(iOffset, bBigEndian) {
        var iShort = bBigEndian ? 
            (this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1)
            : (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset)
        if (iShort < 0) iShort += 65536;
        return iShort;
    }
    this.getSShortAt = function(iOffset, bBigEndian) {
        var iUShort = this.getShortAt(iOffset, bBigEndian);
        if (iUShort > 32767)
            return iUShort - 65536;
        else
            return iUShort;
    }
    this.getLongAt = function(iOffset, bBigEndian) {
        var iByte1 = this.getByteAt(iOffset),
            iByte2 = this.getByteAt(iOffset + 1),
            iByte3 = this.getByteAt(iOffset + 2),
            iByte4 = this.getByteAt(iOffset + 3);

        var iLong = bBigEndian ? 
            (((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
            : (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
        if (iLong < 0) iLong += 4294967296;
        return iLong;
    }
    this.getSLongAt = function(iOffset, bBigEndian) {
        var iULong = this.getLongAt(iOffset, bBigEndian);
        if (iULong > 2147483647)
            return iULong - 4294967296;
        else
            return iULong;
    }

    this.getStringAt = function(iOffset, iLength) {
        var aStr = [];
        
        var aBytes = this.getBytesAt(iOffset, iLength);
        for (var j=0; j < iLength; j++) {
            aStr[j] = String.fromCharCode(aBytes[j]);
        }
        return aStr.join("");
    }
    
    this.getCharAt = function(iOffset) {
        return String.fromCharCode(this.getByteAt(iOffset));
    }
    this.toBase64 = function() {
        return window.btoa(data);
    }
    this.fromBase64 = function(strBase64) {
        data = window.atob(strBase64);
    }
}


return BinaryFile;
}


function initExifLib() {
/*
 * Javascript EXIF Reader 0.1.4
 * Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */


var EXIF = {};

(function() {

var bDebug = false;

EXIF.Tags = {

  // version tags
    0x9000 : "ExifVersion",         // EXIF version
    0xA000 : "FlashpixVersion",     // Flashpix format version

    // colorspace tags
    0xA001 : "ColorSpace",          // Color space information tag

    // image configuration
    0xA002 : "PixelXDimension",     // Valid width of meaningful image
    0xA003 : "PixelYDimension",     // Valid height of meaningful image
    0x9101 : "ComponentsConfiguration", // Information about channels
    0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

    // user information
    0x927C : "MakerNote",           // Any desired information written by the manufacturer
    0x9286 : "UserComment",         // Comments by user

    // related file
    0xA004 : "RelatedSoundFile",        // Name of related sound file

    // date and time
    0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
    0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
    0x9290 : "SubsecTime",          // Fractions of seconds for DateTime
    0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
    0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

    // picture-taking conditions
    0x829A : "ExposureTime",        // Exposure time (in seconds)
    0x829D : "FNumber",         // F number
    0x8822 : "ExposureProgram",     // Exposure program
    0x8824 : "SpectralSensitivity",     // Spectral sensitivity
    0x8827 : "ISOSpeedRatings",     // ISO speed rating
    0x8828 : "OECF",            // Optoelectric conversion factor
    0x9201 : "ShutterSpeedValue",       // Shutter speed
    0x9202 : "ApertureValue",       // Lens aperture
    0x9203 : "BrightnessValue",     // Value of brightness
    0x9204 : "ExposureBias",        // Exposure bias
    0x9205 : "MaxApertureValue",        // Smallest F number of lens
    0x9206 : "SubjectDistance",     // Distance to subject in meters
    0x9207 : "MeteringMode",        // Metering mode
    0x9208 : "LightSource",         // Kind of light source
    0x9209 : "Flash",           // Flash status
    0x9214 : "SubjectArea",         // Location and area of main subject
    0x920A : "FocalLength",         // Focal length of the lens in mm
    0xA20B : "FlashEnergy",         // Strobe energy in BCPS
    0xA20C : "SpatialFrequencyResponse",    // 
    0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
    0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
    0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
    0xA214 : "SubjectLocation",     // Location of subject in image
    0xA215 : "ExposureIndex",       // Exposure index selected on camera
    0xA217 : "SensingMethod",       // Image sensor type
    0xA300 : "FileSource",          // Image source (3 == DSC)
    0xA301 : "SceneType",           // Scene type (1 == directly photographed)
    0xA302 : "CFAPattern",          // Color filter array geometric pattern
    0xA401 : "CustomRendered",      // Special processing
    0xA402 : "ExposureMode",        // Exposure mode
    0xA403 : "WhiteBalance",        // 1 = auto white balance, 2 = manual
    0xA404 : "DigitalZoomRation",       // Digital zoom ratio
    0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
    0xA406 : "SceneCaptureType",        // Type of scene
    0xA407 : "GainControl",         // Degree of overall image gain adjustment
    0xA408 : "Contrast",            // Direction of contrast processing applied by camera
    0xA409 : "Saturation",          // Direction of saturation processing applied by camera
    0xA40A : "Sharpness",           // Direction of sharpness processing applied by camera
    0xA40B : "DeviceSettingDescription",    // 
    0xA40C : "SubjectDistanceRange",    // Distance to subject

    // other tags
    0xA005 : "InteroperabilityIFDPointer",
    0xA420 : "ImageUniqueID"        // Identifier assigned uniquely to each image
};

EXIF.TiffTags = {
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
}

EXIF.GPSTags = {
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
}

EXIF.StringValues = {
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
}

function addEvent(oElement, strEvent, fncHandler) 
{
    if (oElement.addEventListener) { 
        oElement.addEventListener(strEvent, fncHandler, false); 
    } else if (oElement.attachEvent) { 
        oElement.attachEvent("on" + strEvent, fncHandler); 
    }
}


function imageHasData(oImg) 
{
    return !!(oImg.exifdata);
}

function getImageData(oImg, fncCallback) 
{
    BinaryAjax(
        oImg.src,
        function(oHTTP) {
            var oEXIF = findEXIFinJPEG(oHTTP.binaryResponse);
            oImg.exifdata = oEXIF || {};
            if (fncCallback) fncCallback();
        }
    )
}

function findEXIFinJPEG(oFile) {
    var aMarkers = [];

    if (oFile.getByteAt(0) != 0xFF || oFile.getByteAt(1) != 0xD8) {
        return false; // not a valid jpeg
    }

    var iOffset = 2;
    var iLength = oFile.getLength();
    while (iOffset < iLength) {
        if (oFile.getByteAt(iOffset) != 0xFF) {
            if (bDebug) console.log("Not a valid marker at offset " + iOffset + ", found: " + oFile.getByteAt(iOffset));
            return false; // not a valid marker, something is wrong
        }

        var iMarker = oFile.getByteAt(iOffset+1);

        // we could implement handling for other markers here, 
        // but we're only looking for 0xFFE1 for EXIF data

        if (iMarker == 22400) {
            if (bDebug) console.log("Found 0xFFE1 marker");
            return readEXIFData(oFile, iOffset + 4, oFile.getShortAt(iOffset+2, true)-2);
            iOffset += 2 + oFile.getShortAt(iOffset+2, true);

        } else if (iMarker == 225) {
            // 0xE1 = Application-specific 1 (for EXIF)
            if (bDebug) console.log("Found 0xFFE1 marker");
            return readEXIFData(oFile, iOffset + 4, oFile.getShortAt(iOffset+2, true)-2);

        } else {
            iOffset += 2 + oFile.getShortAt(iOffset+2, true);
        }

    }

}


function readTags(oFile, iTIFFStart, iDirStart, oStrings, bBigEnd) 
{
    var iEntries = oFile.getShortAt(iDirStart, bBigEnd);
    var oTags = {};
    for (var i=0;i<iEntries;i++) {
        var iEntryOffset = iDirStart + i*12 + 2;
        var strTag = oStrings[oFile.getShortAt(iEntryOffset, bBigEnd)];
        if (!strTag && bDebug) console.log("Unknown tag: " + oFile.getShortAt(iEntryOffset, bBigEnd));
        oTags[strTag] = readTagValue(oFile, iEntryOffset, iTIFFStart, iDirStart, bBigEnd);
    }
    return oTags;
}


function readTagValue(oFile, iEntryOffset, iTIFFStart, iDirStart, bBigEnd)
{
    var iType = oFile.getShortAt(iEntryOffset+2, bBigEnd);
    var iNumValues = oFile.getLongAt(iEntryOffset+4, bBigEnd);
    var iValueOffset = oFile.getLongAt(iEntryOffset+8, bBigEnd) + iTIFFStart;

    switch (iType) {
        case 1: // byte, 8-bit unsigned int
        case 7: // undefined, 8-bit byte, value depending on field
            if (iNumValues == 1) {
                return oFile.getByteAt(iEntryOffset + 8, bBigEnd);
            } else {
                var iValOffset = iNumValues > 4 ? iValueOffset : (iEntryOffset + 8);
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getByteAt(iValOffset + n);
                }
                return aVals;
            }
            break;

        case 2: // ascii, 8-bit byte
            var iStringOffset = iNumValues > 4 ? iValueOffset : (iEntryOffset + 8);
            return oFile.getStringAt(iStringOffset, iNumValues-1);
            break;

        case 3: // short, 16 bit int
            if (iNumValues == 1) {
                return oFile.getShortAt(iEntryOffset + 8, bBigEnd);
            } else {
                var iValOffset = iNumValues > 2 ? iValueOffset : (iEntryOffset + 8);
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getShortAt(iValOffset + 2*n, bBigEnd);
                }
                return aVals;
            }
            break;

        case 4: // long, 32 bit int
            if (iNumValues == 1) {
                return oFile.getLongAt(iEntryOffset + 8, bBigEnd);
            } else {
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getLongAt(iValueOffset + 4*n, bBigEnd);
                }
                return aVals;
            }
            break;
        case 5: // rational = two long values, first is numerator, second is denominator
            if (iNumValues == 1) {
                return oFile.getLongAt(iValueOffset, bBigEnd) / oFile.getLongAt(iValueOffset+4, bBigEnd);
            } else {
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getLongAt(iValueOffset + 8*n, bBigEnd) / oFile.getLongAt(iValueOffset+4 + 8*n, bBigEnd);
                }
                return aVals;
            }
            break;
        case 9: // slong, 32 bit signed int
            if (iNumValues == 1) {
                return oFile.getSLongAt(iEntryOffset + 8, bBigEnd);
            } else {
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getSLongAt(iValueOffset + 4*n, bBigEnd);
                }
                return aVals;
            }
            break;
        case 10: // signed rational, two slongs, first is numerator, second is denominator
            if (iNumValues == 1) {
                return oFile.getSLongAt(iValueOffset, bBigEnd) / oFile.getSLongAt(iValueOffset+4, bBigEnd);
            } else {
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getSLongAt(iValueOffset + 8*n, bBigEnd) / oFile.getSLongAt(iValueOffset+4 + 8*n, bBigEnd);
                }
                return aVals;
            }
            break;
    }
}


function readEXIFData(oFile, iStart, iLength) 
{
    if (oFile.getStringAt(iStart, 4) != "Exif") {
        if (bDebug) console.log("Not valid EXIF data! " + oFile.getStringAt(iStart, 4));
        return false;
    }

    var bBigEnd;

    var iTIFFOffset = iStart + 6;

    // test for TIFF validity and endianness
    if (oFile.getShortAt(iTIFFOffset) == 0x4949) {
        bBigEnd = false;
    } else if (oFile.getShortAt(iTIFFOffset) == 0x4D4D) {
        bBigEnd = true;
    } else {
        if (bDebug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
        return false;
    }

    if (oFile.getShortAt(iTIFFOffset+2, bBigEnd) != 0x002A) {
        if (bDebug) console.log("Not valid TIFF data! (no 0x002A)");
        return false;
    }

    if (oFile.getLongAt(iTIFFOffset+4, bBigEnd) != 0x00000008) {
        if (bDebug) console.log("Not valid TIFF data! (First offset not 8)", oFile.getShortAt(iTIFFOffset+4, bBigEnd));
        return false;
    }

    var oTags = readTags(oFile, iTIFFOffset, iTIFFOffset+8, EXIF.TiffTags, bBigEnd);

    if (oTags.ExifIFDPointer) {
        var oEXIFTags = readTags(oFile, iTIFFOffset, iTIFFOffset + oTags.ExifIFDPointer, EXIF.Tags, bBigEnd);
        for (var strTag in oEXIFTags) {
            switch (strTag) {
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
                    oEXIFTags[strTag] = EXIF.StringValues[strTag][oEXIFTags[strTag]];
                    break;
    
                case "ExifVersion" :
                case "FlashpixVersion" :
                    oEXIFTags[strTag] = String.fromCharCode(oEXIFTags[strTag][0], oEXIFTags[strTag][1], oEXIFTags[strTag][2], oEXIFTags[strTag][3]);
                    break;
    
                case "ComponentsConfiguration" : 
                    oEXIFTags[strTag] = 
                        EXIF.StringValues.Components[oEXIFTags[strTag][0]]
                        + EXIF.StringValues.Components[oEXIFTags[strTag][1]]
                        + EXIF.StringValues.Components[oEXIFTags[strTag][2]]
                        + EXIF.StringValues.Components[oEXIFTags[strTag][3]];
                    break;
            }
            oTags[strTag] = oEXIFTags[strTag];
        }
    }

    if (oTags.GPSInfoIFDPointer) {
        var oGPSTags = readTags(oFile, iTIFFOffset, iTIFFOffset + oTags.GPSInfoIFDPointer, EXIF.GPSTags, bBigEnd);
        for (var strTag in oGPSTags) {
            switch (strTag) {
                case "GPSVersionID" : 
                    oGPSTags[strTag] = oGPSTags[strTag][0] 
                        + "." + oGPSTags[strTag][1] 
                        + "." + oGPSTags[strTag][2] 
                        + "." + oGPSTags[strTag][3];
                    break;
            }
            oTags[strTag] = oGPSTags[strTag];
        }
    }

    return oTags;
}


EXIF.getData = function(oImg, fncCallback) 
{
    if (!oImg.complete) return false;
    if (!imageHasData(oImg)) {
        getImageData(oImg, fncCallback);
    } else {
        if (fncCallback) fncCallback();
    }
    return true;
}

EXIF.getTag = function(oImg, strTag) 
{
    if (!imageHasData(oImg)) return;
    return oImg.exifdata[strTag];
}

EXIF.getAllTags = function(oImg) 
{
    if (!imageHasData(oImg)) return {};
    var oData = oImg.exifdata;
    var oAllTags = {};
    for (var a in oData) {
        if (oData.hasOwnProperty(a)) {
            oAllTags[a] = oData[a];
        }
    }
    return oAllTags;
}


EXIF.pretty = function(oImg) 
{
    if (!imageHasData(oImg)) return "";
    var oData = oImg.exifdata;
    var strPretty = "";
    for (var a in oData) {
        if (oData.hasOwnProperty(a)) {
            if (typeof oData[a] == "object") {
                strPretty += a + " : [" + oData[a].length + " values]\r\n";
            } else {
                strPretty += a + " : " + oData[a] + "\r\n";
            }
        }
    }
    return strPretty;
}

EXIF.readFromBinaryFile = function(oFile) {
    return findEXIFinJPEG(oFile);
}

function loadAllImages() 
{
    var aImages = document.getElementsByTagName("img");
    for (var i=0;i<aImages.length;i++) {
        if (aImages[i].getAttribute("exif") == "true") {
            if (!aImages[i].complete) {
                addEvent(aImages[i], "load", 
                    function() {
                        EXIF.getData(this);
                    }
                ); 
            } else {
                EXIF.getData(aImages[i]);
            }
        }
    }
}



})();

  
  return EXIF;
}
