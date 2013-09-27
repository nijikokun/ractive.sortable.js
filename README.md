# ractive.sortable.js

Native Drag N' Drop Sortable Event Definition for Ractive

## Usage

After including [ractive](https://github.com/Rich-Harris/Ractive) and `ractive.sortable.js`:

**Template**
```html
<ul proxy-sortable='sort-items'>
  {{#items:i}}
    <li>{{items[i]}}</li>
  {{/items}}
</ul>
```

**Code**

Ractive Boilerplate

```js
ractive = new Ractive({
  el: containerElement,
  template: templateElement,
  data: {
    items: [
      'One', 'Two', 'Three'
    ]
  }
});
```

Sortable event watcher, on the event passed there is a pre-made `move` method which can swap dom elements for you, 
or your can make your own (check the source for how it's done).

```js
ractive.on('sort-items', function (event) {
  if (event.move) event.move();
});
```

## Event Object

- `type` Event type, currently: `enter`, and `drop`
- `target` Element that is being targeted by the current dragged element.
- `current` Element being dragged
- `original` DOM Event
- `move` Pre-made move method.
