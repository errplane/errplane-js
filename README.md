errplane-js
===========

Javscript library for the Errplane API.

Just include it in your head and it'll work with browsers that support CORS:

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<script src="//s3.amazonaws.com/errplane-public/errplane-min-0.1.0.js"></script>
```

Then put this somewhere in the body

```javascript
errplaneMetrics = new ErrplaneMetrics({
  apiKey: "your write only api key",
  appKey: "your app key",
  envKey: "development (for example)"
});
```

And now you can instrument DOM elements automatically. Just add the errplane attributes we'll take care of the rest.

```html
<!-- Log all clicks on this link to the metric 'clicked_link' -->
<a href="#" data-errplane-click="clicked_link">Click me<a>

<!-- Log all hovers to metric 'hovered_link' -->
<button href="#" data-errplane-hover="hovered_link">Hover me</button>

<!-- Will add the context string that will be included in any Errplane alerts -->
<a href="#" data-errplane-click="clicked_link" data-errplane-context="any string or json">Click me</a>
```

Name the metrics any string with numbers, letters, underscores, or hyphens.

And you can call it in your javascript to time function calls, or report metrics:

```javascript
errplaneMetrics.time("timed_thing", function(finish) {
  // finish is a function that should be called when the thing
  // you're timing completes. It's useful to do it this way for
  // async callbacks where you want to time the entire cycle.
  finish("an optional string included in any alerts");
});

// the value is optional. will default to 1 if you don't include.
errplaneMetrics.report("some_metric_name",
  {
    context: "this is a totally optional string that will show up in related alerts"
    value: 23
  }
);
```