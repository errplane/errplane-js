function ErrplaneApi(options) {
  this.apiKey = options.apiKey;
  this.appKey = options.appKey;
  this.envKey = options.envKey;
  this.baseUrl = options.baseUrl || "//w.apiv3.errplane.com/"
  this.secondsInDay = 86400;
}

/* Posts a data point to the Errplane API.
 *
 * @params timeSeriesName The name of the time series to write to. Ex: 'views/home'. The API will automatically fan out to two points. views and views/home.
 * @params options An object with two optional parameters: value and context. value can be an integer or double, context is a string to associate with the point
*/
ErrplaneApi.prototype.report = function(timeSeriesName, options, callback) {
  var value = options.value || 1
  var url = this.baseUrl + "api/v2/time_series/applications/" + this.appKey + "/environments/" + this.envKey + "?api_key=" + this.apiKey;

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

  data.push({n: timeSeriesName, p: [point]});

  $.ajax({
    url: url,
    type: "POST",
    data: JSON.stringify(data),
    processData: false,
    contentType: "text/plain"
  }).done(callback);
}

/* Returns an array of alerts given the ids
 *
 * @params ids An array of alert ids.
*/
ErrplaneApi.prototype.getAlertsByIds = function(ids, callback) {
  var url = this.baseUrl + "/api/v1/new_alerts/ids?api_key=" + this.apiKey + "&ids=" + ids.join(",");
  $.get(url, function(data) {
    callback(data["new_alerts"]);
  });
}

ErrplaneApi.prototype.alertToReadableDescription = function(alert) {
  var desc = "On ";
  if (alert.comparator === "gt") {
    alert.readableComparator = ">"
  } else if (alert.comparator === "lt") {
    alert.readableComparator = "<"
  } else {
    console.log("unknown comparator for alert", alert.comparator);
  }
  if (alert.alert_after_seconds != 0) {
    desc += (" no data report in " + alert.alert_after_seconds + " seconds");
  } else{
    desc += " any value";
    if (alert.value != null) {
      desc += " " + alert.readableComparator + " " + alert.value;
    }
  }
  return desc;
}

ErrplaneApi.prototype.postException = function(exceptionData) {
  var url = this.baseUrl + "databases/" + this.appKey + this.envKey + "series/exceptions?api_key=" + this.apiKey;
  $.ajax({
    url: url,
    type: "POST",
    data: JSON.stringify(exceptionData),
    processData: false,
    contentType: "text/plain"
  });
}
