function ErrplaneMetrics(options) {
  this.apiKey = options.apiKey;
  this.appKey = options.appKey;
  this.envKey = options.envKey;
  this.baseUrl = options.baseUrl;
  this.errplaneApi = new ErrplaneApi(options);

  $("body").on("mouseenter", "[data-errplane-enter]", {errplaneMetrics: this}, this.logEnter);
  $("body").on("click", "[data-errplane-click]", {errplaneMetrics: this}, this.logClick);
}

ErrplaneMetrics.prototype.logClick = function(ev) {
  var metricName = ev.target.getAttribute("data-errplane-click");
  var context    = ev.target.getAttribute("data-errplane-context");
  errplaneMetrics.errplaneApi.report(metricName, {value: 1, context: context});
}

ErrplaneMetrics.prototype.logEnter = function(ev) {
  var metricName = ev.target.getAttribute("data-errplane-enter");
  var context    = ev.target.getAttribute("data-errplane-context");
  errplaneMetrics.errplaneApi.report(metricName, {value: 1, context: context});
}

ErrplaneMetrics.prototype.time = function(metricName, functionToTime) {
  var startTime = new Date() - 0;
  var _this = this;
  var completeTimer = function(context) {
    var endTime = new Date() - 0;
    _this.errplaneApi.report(
      metricName,
      {value: endTime - startTime, context: context}
    );
  }
  functionToTime(completeTimer);
}

ErrplaneMetrics.prototype.report = function(metricName, options) {
  this.errplaneApi.report(metricName, options)
}
