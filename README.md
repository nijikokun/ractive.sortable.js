# ractive.sortable.js

Sortable Event Definition for Ractive


## Usage

After including `ractive` and `ractive.sortable.js`:

**Template**
```html
<script type="text/ractive" id="template">
  <ul proxy-sortable='sort-items'>
    {{#items:i}}
      <li>{{items[i]}}</li>
    {{/items}}
  </ul>
</script>
```

Now we watch the sortable element like so, I've given you a simple method for moving the element around, or your can create your own depending on the `event.type`:

**Code**
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