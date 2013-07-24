function ErrplaneApi(options) {
  this.apiKey = options.apiKey;
  this.appKey = options.appKey;
  this.envKey = options.envKey;
  this.secondsInDay = 86400;
  this.baseUrl = options.baseUrl || "//api.errplane.com/"
}

/* Returns array of strings that are the time series names that have been written in this application and environment.
 *
 * @returns  ['name1', 'name2', 'name3']
*/
ErrplaneApi.prototype.getTimeSeriesNames = function(callback) {
  var url = this.baseUrl + "api/v2/time_series/applications/" + this.appKey + "/environments/" + this.envKey + "?api_key=" + this.apiKey;
  $.get(url, callback);
}

/* Return an array of objects that have time series names, their sums over the interval, and the count of points.
 *
 * @param daysAgo  Returns time series that have been written in the passed number of daysAgo. 0 means just today.
 * @param singleDay  A boolean to limit the sum and count to only the given day (instead of across all days since.) So to get
 *                   yesterday's numbers pass daysAgo=1 and singleDay=true
 * @param filter  A string representing a regex to filter the time series to be returned. So passing 'new' will limit the
 *                returned time series to those that have 'new' in the name. Passing an empty string will not filter anything.
 * @param exclude  A string representing a regex to exclude time series that match. So passing 'controller' will exclude any
 *                 time series with 'controller' in the name from the result set. Passing an empty string will not exclude anything.
 *
 * @returns  {name: "...", count: 2, sum: 142}
*/
ErrplaneApi.prototype.getUpdatedTimeSeries = function(daysAgo, singleDay, filter, exclude, callback) {
  var url = this.baseUrl + "api/v2/time_series/applications/" + this.appKey + "/environments/" + this.envKey + "/updated_time_series?api_key=" + this.apiKey +
            "&days_ago=" + daysAgo;
  if (singleDay) {
    url += "&single_day=true";
  }
  if (filter !== "") {
    url += "&filter=" + encodeURIComponent(filter);
  }
  if (exclude !== "") {
    url += "&exclude=" + encodeURIComponent(exclude);
  }
  $.get(url, function(data) {
    data.forEach(function(t) {
      t.average = Math.round(t.sum / t.count * 10) / 10;
    });
    var sortedByCountDesc = data.sort(function(t1, t2) {
      return t2.count - t1.count;
    });
    callback(sortedByCountDesc);
  })
}

/* Returns array of arrays of 10 minute summaries oldest to newest.
 *
 * @returns  [[min, max, count, sum, time], [min, max, count, sum, time], ...]
*/
ErrplaneApi.prototype.getTimeSeriesSummaryForLast24Hours = function(name, callback) {
  this.getTimeSeriesSummaryForLastXSeconds(name, this.secondsInDay, callback);
}

ErrplaneApi.prototype.getTimeSeriesSummaryForLast7Days = function(name, callback) {
  this.getTimeSeriesSummaryForLastXSeconds(name, this.secondsInDay * 7, callback);
}

/* Returns array of arrays of 10 minute summaries ordered oldest to newest looking back the given number of seconds.
 * @params secondsAgo The number of seconds since right now to go back. Ex: 86400 will give summaries for the last 24 hours.
 *
 * @returns [[min, max, count, sum, time], [min, max, count, sum, time], ...]
*/
ErrplaneApi.prototype.getTimeSeriesSummaryForLastXSeconds = function(name, secondsAgo, callback) {
  var url = this.baseUrl + "api/v2/time_series/applications/" + this.appKey + "/environments/" + this.envKey +
    "/summary_data?since=" + secondsAgo +
    "&api_key=" + this.apiKey +
    "&name=" + name;
  $.get(url, function(data) {
    var dataWithMillisecondTimes = data.map(function(point) {
      point[4] = new Date(point[4] * 1000);
      return point;
    });
    dataWithMillisecondTimes = dataWithMillisecondTimes.sort(function(a, b) {return b[4] - a[4];});
    callback(dataWithMillisecondTimes);
  });
}

// Will collapse the time summaries by a given factor. So if you have 144 summary points (24 hours worth) and
// you pass in 2, you will get 72 summary points back.
ErrplaneApi.prototype.collapseTimeSeriesSummariesBy = function(summaries, factor) {
  var newSummaries = [];
  var currentSummary = [];
  summaries.forEach(function(summary, index) {
    if (index % factor == 0) {
      if (currentSummary.length > 0) {
        newSummaries.push(currentSummary);
      }
      currentSummary = summary.slice(0);
    } else {
      if (currentSummary[0] > summary[0]) {
        currentSummary[0] = summary[0]
      }
      if (currentSummary[1] < summary[1]) {
        currentSummary[1] = summary[1]
      }
      currentSummary[2] += summary[2]
      currentSummary[3] += summary[3]
      currentSummary[4] = summary[4]
    }
  });
  return newSummaries;
}

// Will collapse the time summaries into a single point
ErrplaneApi.prototype.collapseTimeSeriesSummaries = function(summaries) {
  return this.collapseTimeSummariesBy(summaries, summaries.length - 1)[0];
}

ErrplaneApi.prototype.getMinsAndTimesFromSummaries = function(summaries) {
  return summaries.map(function(summary) {return [summary[0], summary[4]]});
}

ErrplaneApi.prototype.getMaxesAndTimesFromSummaries = function(summaries) {
  return summaries.map(function(summary) {return [summary[1], summary[4]]});
}

ErrplaneApi.prototype.getSumsAndTimesFromSummaries = function(summaries) {
  return summaries.map(function(summary) {return [summary[2], summary[4]]});
}

ErrplaneApi.prototype.getCountsAndTimesFromSummaries = function(summaries) {
  return summaries.map(function(summary) {return [summary[3], summary[4]]});
}

ErrplaneApi.prototype.getAveragesAndTimesFromSummaries = function(summaries) {
  return summaries.map(function(summary) {
    if (summary[3] == 0) {
      return [0, summary[4]];
    } else {
      return [summary[2] / summary[3], summary[4]];
    }
  });
}

/* Returns the raw data points for a given time series from now to the given number of seconds ago.
 *
*/
ErrplaneApi.prototype.getPointsForTimeSeriesSince = function(timeSeriesName, secondsAgo, callback) {
  var url = this.baseUrl + "api/v2/time_series/applications/" + this.appKey + "/environments/" + this.envKey + "/data?api_key=" + this.apiKey +
    "&name=" + encodeURIComponent(timeSeriesName) +
    "&since=" + secondsAgo;
  $.get(url, function(data) {
    data.forEach(function(d) {
      d[1] = d[1] * 1000 // convert seconds to milliseconds
    })
    callback(data);
  })
}

ErrplaneApi.prototype.getAlertPointsForAlertSeriesSince = function(alertSeriesName, secondsAgo, callback) {
  this.getPointsForTimeSeriesSince(this.appKey, this.envKey, alertSeriesName, secondsAgo, function(data) {
    data.forEach(function(d) {
      if (d.length > 2) {
        var alertInfo = JSON.parse(d[2]);
        alertInfo.name = alertInfo.n;
        alertInfo.context = alertInfo.c;
        d[2] = alertInfo;
      }
    })
    callback(data);
  })
}

// Returns an array of objects that have performance stats on specific controller actions. They are sorted by average response time.
// Looks like:
// {
//   average: 266
//   count: 1
//   name: "ConfigurationsController/endpoints"
//   previous_average: 147
//   previous_count: 1
//   previous_sum: 147
//   sum: 266
//   average_percent_change: 20.9
//   count_percent_change: 0.0
// }
ErrplaneApi.prototype.getPerformanceLeaderboardForDay = function(callback) {
  var that = this;
  var url = this.baseUrl + "api/v2/time_series/applications/" + this.appKey + "/environments/" + this.envKey +
    "/leaderboards/controllers_actions?api_key=" + this.apiKey +
    "&day=" + Math.floor(new Date() / 1000);
  $.get(url, function(data) {
    that.addChangesToLeaderboard(data);
    callback(data);
  });
}

ErrplaneApi.prototype.getPerformanceLeaderboardForWeek = function(callback) {
  var that = this;
  var url = this.baseUrl + "api/v2/time_series/applications/" + this.appKey + "/environments/" + this.envKey +
    "/leaderboards/controllers_actions?api_key=" + this.apiKey +
    "&week=" + Math.floor(new Date() / 1000);
  $.get(url, function(data) {
    that.addChangesToLeaderboard(data);
    callback(data);
  });
}

ErrplaneApi.prototype.addChangesToLeaderboard = function(data) {
  data.forEach(function (d) {
    d.name = d.name.slice(d.name.indexOf("/") + 1).replace("/", "#"); // remove the leading 'controllers/'
    d.average = Math.round(d.average * 10) / 10;
    if (d.previous_average == 0) {
      d.average_percent_change = 0
      d.count_percent_change = 0
    } else {
      d.average_percent_change = Math.round((d.average - d.previous_average) / d.previous_average * 100.0 * 10) / 10;
      d.count_percent_change = Math.round((d.count - d.previous_count) / d.previous_count * 100.0 * 10) / 10;
    }
  });
}

/* Posts a data point to the Errplane API.
 *
 * @params timeSeriesName The name of the time series to write to. Ex: 'views/home'. The API will automatically fan out to two points. views and views/home.
 * @params options An object with two optional parameters: value and context. value can be an integer or double, context is a string to associate with the point
*/
ErrplaneApi.prototype.report = function(timeSeriesName, options, callback) {
  var value = options.value || 1
  var url = this.baseUrl + "api/v2/time_series/applications/" + this.appKey + "/environments/" + this.envKey + "?api_key=" + this.apiKey;
  var timeInSeconds = Math.round((new Date() - 0) / 1000);
  var data = timeSeriesName + " " + value + " " + timeInSeconds;
  }
  $.ajax({
    url: url,
    type: "POST",
    data: data,
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
  var url = this.baseUrl + "api/v1/applications/" + this.appKey + "/exceptions/" + this.envKey + "?api_key=" + this.apiKey;
  $.ajax({
    url: url,
    type: "POST",
    data: JSON.stringify(exceptionData),
    processData: false,
    contentType: "text/plain"
  });
}
