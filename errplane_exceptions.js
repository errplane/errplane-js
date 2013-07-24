function ErrplaneExceptions(options) {
  this.apiKey = options.apiKey;
  this.appKey = options.appKey;
  this.envKey = options.envKey;
  this.baseUrl = options.baseUrl;
  this.customData = options.customData || {}; // will be included with every exception logged. good place to put user ids.
  this.errplaneApi = new ErrplaneApi(options);
  this.catchOnError();
}

/* Initializes Errplane to catch all exceptions from window.onerror
*/
ErrplaneExceptions.prototype.catchOnError = function() {
  var _this = this;
  window.onerror = function(message, file, line) {
    var spaceIndex = message.indexOf(" ")
    var colonIndex = message.indexOf(":")
    var exceptionClass = message;
    var exceptionMessage = message;
    if (colonIndex > spaceIndex) {
      exceptionClass = message.slice(spaceIndex + 1, colonIndex);
    } else if (colonIndex > 0) {
      exceptionClass = message.slice(0, colonIndex);
    }
    if (colonIndex > 0) {
      exceptionMessage = message.slice(colonIndex + 2, message.length);
    }
    var backtrace = ["@" + file + ":" + line];
    var timeInSeconds = Math.floor((new Date() - 0) / 1000);
    var customData = _this.customData;
    customData.url = window.location.href;

    var exceptionData = {
      message: message,
      exception_class: exceptionClass,
      backtrace: backtrace,
      time: timeInSeconds,
      language: "JavaScript",
      custom_data: customData
    };

    _this.errplaneApi.reportException(exceptionData);
  }
}

/* Logs an exception to the Errplane api.
 *
 * @params exception A javascript exception object
 * @params options An object that can include a hash which identifies an exception and
                   overrides default Errplane exception groupings. The rest is sent through
                   as custom data.
*/
ErrplaneExceptions.prototype.logToErrplane = function(exception, options) {
  var customData = $.extend({}, this.customData, options);
  customData.url = window.location.href;
  var timeInSeconds = Math.floor((new Date() - 0) / 1000);

  var exceptionData = {
    message: exception.message,
    exception_class: exception.name,
    backtrace: exception.stack.split("\n"),
    time: timeInSeconds,
    language: "JavaScript",
    customData: customData
  };

  this.errplaneApi.reportException(exceptionData);
}
