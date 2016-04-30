## 1.1.0

* Rework the behaviour of nested DOM.select()s to make them act more logically, e.g.

```
DOM.select("a").select(".test") // matches "a.test" or "a .test"
DOM.select("a").select("p") // matches "a p", NOT "ap"
```

## 1.0.1

* Remove accidentally added dependency

## 1.0.0

* Initial release based on [cycle-snabbdom](https://github.com/TylorS/cycle-snabbdom)
