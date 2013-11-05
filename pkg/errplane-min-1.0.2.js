function ErrplaneApi(options){this.apiKey=options.apiKey;this.appKey=options.appKey;this.envKey=options.envKey;this.baseUrl=options.baseUrl||"https://w.apiv3.errplane.com/"
this.secondsInDay=86400;BrowserDetect.init();}
ErrplaneApi.prototype.report=function(name,options,callback){var url=this.baseUrl+"databases/"+this.appKey+this.envKey+"/points?api_key="+this.apiKey;data=[];point={};point["v"]=options["value"]||1;if(options["timestamp"]!=null){point["t"]=options["timestamp"];}
if(options["context"]!=null){point["c"]=JSON.stringify(options["context"]);}
if(options["dimensions"]!=null){point["d"]=options["dimensions"];}
data.push({n:name,p:[point]});$.ajax({url:url,type:"POST",data:JSON.stringify(data),processData:false,contentType:"text/plain"}).done(callback);}
ErrplaneApi.prototype.reportException=function(exceptionData){this.report("exceptions",{context:JSON.stringify(exceptionData),dimensions:{class:exceptionData.exception_class,host:"browser",browser:BrowserDetect.browser+" "+BrowserDetect.version,browser_os:BrowserDetect.OS}})}
var BrowserDetect={init:function(){this.browser=this.searchString(this.dataBrowser)||"unknown";this.version=this.searchVersion(navigator.userAgent)||this.searchVersion(navigator.appVersion)||"unknown";this.OS=this.searchString(this.dataOS)||"unknown";},searchString:function(data){for(var i=0;i<data.length;i++){var dataString=data[i].string;var dataProp=data[i].prop;this.versionSearchString=data[i].versionSearch||data[i].identity;if(dataString){if(dataString.indexOf(data[i].subString)!=-1)
return data[i].identity;}
else if(dataProp)
return data[i].identity;}},searchVersion:function(dataString){var index=dataString.indexOf(this.versionSearchString);if(index==-1)return;return parseFloat(dataString.substring(index+this.versionSearchString.length+1));},dataBrowser:[{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",identity:"OmniWeb"},{string:navigator.vendor,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:window.opera,identity:"Opera",versionSearch:"Version"},{string:navigator.vendor,subString:"iCab",identity:"iCab"},{string:navigator.vendor,subString:"KDE",identity:"Konqueror"},{string:navigator.userAgent,subString:"Firefox",identity:"Firefox"},{string:navigator.vendor,subString:"Camino",identity:"Camino"},{string:navigator.userAgent,subString:"Netscape",identity:"Netscape"},{string:navigator.userAgent,subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",identity:"Netscape",versionSearch:"Mozilla"}],dataOS:[{string:navigator.platform,subString:"Win",identity:"Windows"},{string:navigator.platform,subString:"Mac",identity:"Mac"},{string:navigator.userAgent,subString:"iPhone",identity:"iPhone/iPod"},{string:navigator.platform,subString:"Linux",identity:"Linux"}]};
function ErrplaneMetrics(options){this.apiKey=options.apiKey;this.appKey=options.appKey;this.envKey=options.envKey;this.baseUrl=options.baseUrl;this.errplaneApi=new ErrplaneApi(options);$("body").on("mouseenter","[data-errplane-enter]",{errplaneMetrics:this},this.logEnter);$("body").on("click","[data-errplane-click]",{errplaneMetrics:this},this.logClick);}
ErrplaneMetrics.prototype.logClick=function(ev){var metricName=ev.target.getAttribute("data-errplane-click");var context=ev.target.getAttribute("data-errplane-context");errplaneMetrics.errplaneApi.report(metricName,{value:1,context:context});}
ErrplaneMetrics.prototype.logEnter=function(ev){var metricName=ev.target.getAttribute("data-errplane-enter");var context=ev.target.getAttribute("data-errplane-context");errplaneMetrics.errplaneApi.report(metricName,{value:1,context:context});}
ErrplaneMetrics.prototype.time=function(metricName,functionToTime){var startTime=new Date()-0;var _this=this;var completeTimer=function(context){var endTime=new Date()-0;_this.errplaneApi.report(metricName,{value:endTime-startTime,context:context});}
functionToTime(completeTimer);}
ErrplaneMetrics.prototype.report=function(metricName,options){this.errplaneApi.report(metricName,options)}
function ErrplaneExceptions(options){this.apiKey=options.apiKey;this.appKey=options.appKey;this.envKey=options.envKey;this.baseUrl=options.baseUrl;this.customData=options.customData||{};this.errplaneApi=new ErrplaneApi(options);this.catchOnError();}
ErrplaneExceptions.prototype.catchOnError=function(){var _this=this;window.onerror=function(message,file,line){var spaceIndex=message.indexOf(" ")
var colonIndex=message.indexOf(":")
var exceptionClass=message;var exceptionMessage=message;if(colonIndex>spaceIndex){exceptionClass=message.slice(spaceIndex+1,colonIndex);}else if(colonIndex>0){exceptionClass=message.slice(0,colonIndex);}
if(colonIndex>0){exceptionMessage=message.slice(colonIndex+2,message.length);}
var backtrace=["@"+file+":"+line];var timeInSeconds=Math.floor((new Date()-0)/1000);var customData=_this.customData;customData.url=window.location.href;var exceptionData={message:message,exception_class:exceptionClass,backtrace:backtrace,time:timeInSeconds,language:"JavaScript",custom_data:customData};_this.errplaneApi.reportException(exceptionData);}}
ErrplaneExceptions.prototype.logToErrplane=function(exception,options){var customData=$.extend({},this.customData,options);customData.url=window.location.href;var timeInSeconds=Math.floor((new Date()-0)/1000);var exceptionData={message:exception.message,exception_class:exception.name,backtrace:exception.stack.split("\n"),time:timeInSeconds,language:"JavaScript",custom_data:customData};this.errplaneApi.reportException(exceptionData);}