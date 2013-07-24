function ErrplaneApi(options) {
  this.apiKey = options.apiKey;
  this.appKey = options.appKey;
  this.envKey = options.envKey;
  this.baseUrl = options.baseUrl || "https://w.apiv3.errplane.com/"
  this.secondsInDay = 86400;
  BrowserDetect.init();
}

/* Posts a data point to the Errplane API.
*
* @params timeSeriesName The name of the time series to write to. Ex: 'views/home'. The API will automatically fan out to two points. views and views/home.
* @params options An object with two optional parameters: value and context. value can be an integer or double, context is a string to associate with the point
*/
ErrplaneApi.prototype.report = function(name, options, callback) {
  var url = this.baseUrl + "databases/" + this.appKey + this.envKey + "/points?api_key=" + this.apiKey;

  data = [];
  point = {};

  point["v"] = options["value"] || 1;

  if (options["timestamp"] != null) {
    point["t"] = options["timestamp"];
  }

  if (options["context"] != null) {
    point["c"] = JSON.stringify(options["context"]);
  }

  if (options["dimensions"] != null) {
    point["d"] = options["dimensions"];
  }

  data.push({n: name, p: [point]});

  $.ajax({
    url: url,
    type: "POST",
    data: JSON.stringify(data),
    processData: false,
    contentType: "text/plain"
  }).done(callback);
}

ErrplaneApi.prototype.reportException = function(exceptionData) {
  this.report("exceptions", {
    context: JSON.stringify(exceptionData),
    dimensions: {
      host: "browser",
      browser: BrowserData.browser + " " + BrowserData.version,
      browser_os: BrowserData.OS
    }
  })
}

// http://www.quirksmode.org/js/detect.html
var BrowserDetect = {
  init: function() {
    this.browser = this.searchString(this.dataBrowser) || "unknown";
    this.version = this.searchVersion(navigator.userAgent)
      || this.searchVersion(navigator.appVersion)
      || "unknown";
    this.OS = this.searchString(this.dataOS) || "unknown";
  },

  searchString: function (data) {
    for (var i=0;i<data.length;i++)	{
      var dataString = data[i].string;
      var dataProp = data[i].prop;
      this.versionSearchString = data[i].versionSearch || data[i].identity;
      if (dataString) {
        if (dataString.indexOf(data[i].subString) != -1)
          return data[i].identity;
      }
      else if (dataProp)
        return data[i].identity;
    }
  },

  searchVersion: function (dataString) {
    var index = dataString.indexOf(this.versionSearchString);
    if (index == -1) return;
    return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
  },

  dataBrowser: [
    { string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
    { string: navigator.userAgent, subString: "OmniWeb", versionSearch: "OmniWeb/", identity: "OmniWeb" },
    { string: navigator.vendor, subString: "Apple", identity: "Safari", versionSearch: "Version" },
    { prop: window.opera, identity: "Opera", versionSearch: "Version" },
    { string: navigator.vendor, subString: "iCab", identity: "iCab" },
    { string: navigator.vendor, subString: "KDE", identity: "Konqueror" },
    { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
    { string: navigator.vendor, subString: "Camino", identity: "Camino" },
    { string: navigator.userAgent, subString: "Netscape", identity: "Netscape" },
    { string: navigator.userAgent, subString: "MSIE", identity: "Explorer", versionSearch: "MSIE" },
    { string: navigator.userAgent, subString: "Gecko", identity: "Mozilla", versionSearch: "rv" },
    { string: navigator.userAgent, subString: "Mozilla", identity: "Netscape", versionSearch: "Mozilla" }
  ],
  dataOS : [
    { string: navigator.platform, subString: "Win", identity: "Windows" },
    { string: navigator.platform, subString: "Mac", identity: "Mac" },
    { string: navigator.userAgent, subString: "iPhone", identity: "iPhone/iPod" },
    { string: navigator.platform, subString: "Linux", identity: "Linux" }
  ]
};
