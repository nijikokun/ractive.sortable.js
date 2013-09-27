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

**Code**
```js
/**
 * Sortable classname structure
 * 
 * @type {Object}
 */
Ractive.eventDefinitions.sortable.CLASSES = {
  CHILD: 'sortable-child',
  DRAGGING: 'sortable-dragging',
  OVER: 'sortable-over'
};
```