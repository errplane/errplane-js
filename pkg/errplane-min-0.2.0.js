var ErrplaneBase64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(input){var output="";var chr1,chr2,chr3,enc1,enc2,enc3,enc4;var i=0;input=ErrplaneBase64._utf8_encode(input);while(i<input.length){chr1=input.charCodeAt(i++);chr2=input.charCodeAt(i++);chr3=input.charCodeAt(i++);enc1=chr1>>2;enc2=((chr1&3)<<4)|(chr2>>4);enc3=((chr2&15)<<2)|(chr3>>6);enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64;}else if(isNaN(chr3)){enc4=64;}
output=output+
ErrplaneBase64._keyStr.charAt(enc1)+ErrplaneBase64._keyStr.charAt(enc2)+
ErrplaneBase64._keyStr.charAt(enc3)+ErrplaneBase64._keyStr.charAt(enc4);}
return output;},decode:function(input){var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<input.length){enc1=ErrplaneBase64._keyStr.indexOf(input.charAt(i++));enc2=ErrplaneBase64._keyStr.indexOf(input.charAt(i++));enc3=ErrplaneBase64._keyStr.indexOf(input.charAt(i++));enc4=ErrplaneBase64._keyStr.indexOf(input.charAt(i++));chr1=(enc1<<2)|(enc2>>4);chr2=((enc2&15)<<4)|(enc3>>2);chr3=((enc3&3)<<6)|enc4;output=output+String.fromCharCode(chr1);if(enc3!=64){output=output+String.fromCharCode(chr2);}
if(enc4!=64){output=output+String.fromCharCode(chr3);}}
output=ErrplaneBase64._utf8_decode(output);return output;},_utf8_encode:function(string){string=string.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c);}
else if((c>127)&&(c<2048)){utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128);}
else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128);}}
return utftext;},_utf8_decode:function(utftext){var string="";var i=0;var c=c1=c2=0;while(i<utftext.length){c=utftext.charCodeAt(i);if(c<128){string+=String.fromCharCode(c);i++;}
else if((c>191)&&(c<224)){c2=utftext.charCodeAt(i+1);string+=String.fromCharCode(((c&31)<<6)|(c2&63));i+=2;}
else{c2=utftext.charCodeAt(i+1);c3=utftext.charCodeAt(i+2);string+=String.fromCharCode(((c&15)<<12)|((c2&63)<<6)|(c3&63));i+=3;}}
return string;}}
function ErrplaneApi(options){this.apiKey=options.apiKey;this.appKey=options.appKey;this.envKey=options.envKey;this.secondsInDay=86400;this.baseUrl=options.baseUrl||"//api.errplane.com/"}
ErrplaneApi.prototype.getTimeSeriesNames=function(callback){var url=this.baseUrl+"api/v2/time_series/applications/"+this.appKey+"/environments/"+this.envKey+"?api_key="+this.apiKey;$.get(url,callback);}
ErrplaneApi.prototype.getUpdatedTimeSeries=function(daysAgo,singleDay,filter,exclude,callback){var url=this.baseUrl+"api/v2/time_series/applications/"+this.appKey+"/environments/"+this.envKey+"/updated_time_series?api_key="+this.apiKey+"&days_ago="+daysAgo;if(singleDay){url+="&single_day=true";}
if(filter!==""){url+="&filter="+encodeURIComponent(filter);}
if(exclude!==""){url+="&exclude="+encodeURIComponent(exclude);}
$.get(url,function(data){data.forEach(function(t){t.average=Math.round(t.sum/t.count*10)/10;});var sortedByCountDesc=data.sort(function(t1,t2){return t2.count-t1.count;});callback(sortedByCountDesc);})}
ErrplaneApi.prototype.getTimeSeriesSummaryForLast24Hours=function(name,callback){this.getTimeSeriesSummaryForLastXSeconds(name,this.secondsInDay,callback);}
ErrplaneApi.prototype.getTimeSeriesSummaryForLast7Days=function(name,callback){this.getTimeSeriesSummaryForLastXSeconds(name,this.secondsInDay*7,callback);}
ErrplaneApi.prototype.getTimeSeriesSummaryForLastXSeconds=function(name,secondsAgo,callback){var url=this.baseUrl+"api/v2/time_series/applications/"+this.appKey+"/environments/"+this.envKey+"/summary_data?since="+secondsAgo+"&api_key="+this.apiKey+"&name="+name;$.get(url,function(data){var dataWithMillisecondTimes=data.map(function(point){point[4]=new Date(point[4]*1000);return point;});dataWithMillisecondTimes=dataWithMillisecondTimes.sort(function(a,b){return b[4]-a[4];});callback(dataWithMillisecondTimes);});}
ErrplaneApi.prototype.collapseTimeSeriesSummariesBy=function(summaries,factor){var newSummaries=[];var currentSummary=[];summaries.forEach(function(summary,index){if(index%factor==0){if(currentSummary.length>0){newSummaries.push(currentSummary);}
currentSummary=summary.slice(0);}else{if(currentSummary[0]>summary[0]){currentSummary[0]=summary[0]}
if(currentSummary[1]<summary[1]){currentSummary[1]=summary[1]}
currentSummary[2]+=summary[2]
currentSummary[3]+=summary[3]
currentSummary[4]=summary[4]}});return newSummaries;}
ErrplaneApi.prototype.collapseTimeSeriesSummaries=function(summaries){return this.collapseTimeSummariesBy(summaries,summaries.length-1)[0];}
ErrplaneApi.prototype.getMinsAndTimesFromSummaries=function(summaries){return summaries.map(function(summary){return[summary[0],summary[4]]});}
ErrplaneApi.prototype.getMaxesAndTimesFromSummaries=function(summaries){return summaries.map(function(summary){return[summary[1],summary[4]]});}
ErrplaneApi.prototype.getSumsAndTimesFromSummaries=function(summaries){return summaries.map(function(summary){return[summary[2],summary[4]]});}
ErrplaneApi.prototype.getCountsAndTimesFromSummaries=function(summaries){return summaries.map(function(summary){return[summary[3],summary[4]]});}
ErrplaneApi.prototype.getAveragesAndTimesFromSummaries=function(summaries){return summaries.map(function(summary){if(summary[3]==0){return[0,summary[4]];}else{return[summary[2]/summary[3],summary[4]];}});}
ErrplaneApi.prototype.getPointsForTimeSeriesSince=function(timeSeriesName,secondsAgo,callback){var url=this.baseUrl+"api/v2/time_series/applications/"+this.appKey+"/environments/"+this.envKey+"/data?api_key="+this.apiKey+"&name="+encodeURIComponent(timeSeriesName)+"&since="+secondsAgo;$.get(url,function(data){data.forEach(function(d){d[1]=d[1]*1000})
callback(data);})}
ErrplaneApi.prototype.getAlertPointsForAlertSeriesSince=function(alertSeriesName,secondsAgo,callback){this.getPointsForTimeSeriesSince(this.appKey,this.envKey,alertSeriesName,secondsAgo,function(data){data.forEach(function(d){if(d.length>2){var alertInfo=JSON.parse(d[2]);alertInfo.name=alertInfo.n;alertInfo.context=alertInfo.c;d[2]=alertInfo;}})
callback(data);})}
ErrplaneApi.prototype.getPerformanceLeaderboardForDay=function(callback){var that=this;var url=this.baseUrl+"api/v2/time_series/applications/"+this.appKey+"/environments/"+this.envKey+"/leaderboards/controllers_actions?api_key="+this.apiKey+"&day="+Math.floor(new Date()/1000);$.get(url,function(data){that.addChangesToLeaderboard(data);callback(data);});}
ErrplaneApi.prototype.getPerformanceLeaderboardForWeek=function(callback){var that=this;var url=this.baseUrl+"api/v2/time_series/applications/"+this.appKey+"/environments/"+this.envKey+"/leaderboards/controllers_actions?api_key="+this.apiKey+"&week="+Math.floor(new Date()/1000);$.get(url,function(data){that.addChangesToLeaderboard(data);callback(data);});}
ErrplaneApi.prototype.addChangesToLeaderboard=function(data){data.forEach(function(d){d.name=d.name.slice(d.name.indexOf("/")+1).replace("/","#");d.average=Math.round(d.average*10)/10;if(d.previous_average==0){d.average_percent_change=0
d.count_percent_change=0}else{d.average_percent_change=Math.round((d.average-d.previous_average)/d.previous_average*100.0*10)/10;d.count_percent_change=Math.round((d.count-d.previous_count)/d.previous_count*100.0*10)/10;}});}
ErrplaneApi.prototype.report=function(timeSeriesName,options,callback){var value=options.value||1
var url=this.baseUrl+"api/v2/time_series/applications/"+this.appKey+"/environments/"+this.envKey+"?api_key="+this.apiKey;var timeInSeconds=Math.round((new Date()-0)/1000);var data=timeSeriesName+" "+value+" "+timeInSeconds;if(options.context&&options.context!==""){data+=" "+ErrplaneBase64.encode(options.context);}
$.ajax({url:url,type:"POST",data:data,processData:false,contentType:"text/plain"}).done(callback);}
ErrplaneApi.prototype.getAlertsByIds=function(ids,callback){var url=this.baseUrl+"/api/v1/new_alerts/ids?api_key="+this.apiKey+"&ids="+ids.join(",");$.get(url,function(data){callback(data["new_alerts"]);});}
ErrplaneApi.prototype.alertToReadableDescription=function(alert){var desc="On ";if(alert.comparator==="gt"){alert.readableComparator=">"}else if(alert.comparator==="lt"){alert.readableComparator="<"}else{console.log("unknown comparator for alert",alert.comparator);}
if(alert.alert_after_seconds!=0){desc+=(" no data report in "+alert.alert_after_seconds+" seconds");}else{desc+=" any value";if(alert.value!=null){desc+=" "+alert.readableComparator+" "+alert.value;}}
return desc;}
ErrplaneApi.prototype.postException=function(exceptionData){var url=this.baseUrl+"api/v1/applications/"+this.appKey+"/exceptions/"+this.envKey+"?api_key="+this.apiKey;$.ajax({url:url,type:"POST",data:JSON.stringify(exceptionData),processData:false,contentType:"text/plain"});}
function ErrplaneMetrics(options){this.apiKey=options.apiKey;this.appKey=options.appKey;this.envKey=options.envKey;this.baseUrl=options.baseUrl;this.errplaneApi=new ErrplaneApi(options);$("body").on("mouseenter","[data-errplane-enter]",{errplaneMetrics:this},this.logEnter);$("body").on("click","[data-errplane-click]",{errplaneMetrics:this},this.logClick);}
ErrplaneMetrics.prototype.logClick=function(ev){var metricName=ev.target.getAttribute("data-errplane-click");var context=ev.target.getAttribute("data-errplane-context");errplaneMetrics.errplaneApi.report(metricName,{value:1,context:context});}
ErrplaneMetrics.prototype.logEnter=function(ev){var metricName=ev.target.getAttribute("data-errplane-enter");var context=ev.target.getAttribute("data-errplane-context");errplaneMetrics.errplaneApi.report(metricName,{value:1,context:context});}
ErrplaneMetrics.prototype.time=function(metricName,functionToTime){var startTime=new Date()-0;var that=this;var completeTimer=function(context){var endTime=new Date()-0;that.errplaneApi.report(metricName,{value:endTime-startTime,context:context});}
functionToTime(completeTimer);}
ErrplaneMetrics.prototype.report=function(metricName,options){this.errplaneApi.report(metricName,options)}
function ErrplaneExceptions(options){this.apiKey=options.apiKey;this.appKey=options.appKey;this.envKey=options.envKey;this.baseUrl=options.baseUrl;this.customData=options.customData||{};this.customData.browser=$.browser
this.errplaneApi=new ErrplaneApi(options);this.catchOnError();}
ErrplaneExceptions.prototype.catchOnError=function(){var that=this;window.onerror=function(message,file,line){var spaceIndex=message.indexOf(" ")
var colonIndex=message.indexOf(":")
var exceptionClass=message;var exceptionMessage=message;if(colonIndex>spaceIndex){exceptionClass=message.slice(spaceIndex+1,colonIndex);}else if(colonIndex>0){exceptionClass=message.slice(0,colonIndex);}
if(colonIndex>0){exceptionMessage=message.slice(colonIndex+2,message.length);}
var backtrace=["@"+file+":"+line];var timeInSeconds=Math.floor((new Date()-0)/1000);var customData=that.customData;customData.url=window.location.href;var exceptionData={message:message,exception_class:exceptionClass,backtrace:backtrace,time:timeInSeconds,language:"Javascript",custom_data:customData};that.errplaneApi.postException(exceptionData);}}
ErrplaneExceptions.prototype.logToErrplane=function(exception,options){var hash=options.hash;delete(options.hash);var customData=$.extend({},this.customData,options);customData.url=window.location.href;var timeInSeconds=Math.floor((new Date()-0)/1000);var exceptionData={message:exception.message,exception_class:exception.name,backtrace:exception.stack.split("\n"),time:timeInSeconds,language:"Javascript",customData:customData};if(hash){exceptionData.hash=hash;}
this.errplaneApi.postException(exceptionData);}