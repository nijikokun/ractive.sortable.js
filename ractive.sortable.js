if (!Ractive.eventDefinitions.wrap) {
  /**
   * Wrap outer methods to have reference to event definitions arguments.
   *
   * @param {Function} method Outer method to be wrapped.
   */
  Ractive.eventDefinitions.wrap = function (method) {
    return function (node, fire) {
      return method;
    };
  };
};

/**
 * Drag N' Drop Sortable Ractive Event
 * 
 * @param  {Object}   node DOM Node
 * @param  {Function} fire Method to fire back data to ractive.on
 * @return {Object}        Teardown method
 * @author  Nijiko Yonskai
 * @copyright  2013
 */
var Sortable = Ractive.eventDefinitions.sortable = function (node, fire) {
  // References
  var $self = Ractive.eventDefinitions.sortable;
  var $arguments = Array.prototype.slice.call(arguments, 0);

  // Allocation
  var Drag = ($self.Drag.apply(this, $arguments))();

  // Attach
  $self.foreach(node.children, Drag.attach);

  // Output
  return {
    teardown: function () {
      $self.foreach(node.children, Drag.detach);
    },

    update: function () {
      $self.foreach(node.children, Drag.attach);
    }
  };
};

/**
 * Sortable classname structure
 * 
 * @type {Object}
 */
Sortable.CLASSES = {
  CHILD: 'sortable-child',
  DRAGGING: 'sortable-dragging',
  OVER: 'sortable-over'
};

/**
 * Sugar for forEach method
 * 
 * @param  {Array}    iterable    List to iterate over
 * @param  {Function} callback    Callback
 * @return {void}
 */
Sortable.foreach = function (iterable, callback) {
  if (iterable.length) Array.prototype.forEach.call(iterable, callback);
};

/**
 * Prevent bubbling on events
 * 
 * @param  {Object} event Native event
 * @return {void}
 */
Sortable.prevent = function (event) {
  if (event.stopPropagation) event.stopPropagation();
  if (event.preventDefault) event.preventDefault();
  event.returnValue = false;
};

/**
 * Core
 * 
 * @return {Function} Invoking this method returns drag object.
 */
Sortable.Drag = Ractive.eventDefinitions.wrap(function () {
  var CLASSES = Sortable.CLASSES;
  var foreach = Sortable.foreach;
  var prevent = Sortable.prevent;

  // Hipster Nerd Tip:
  // !! does a type coercion to boolean: http://bonsaiden.github.io/JavaScript-Garden/#types.casting
  var ClassListSupported = !!(typeof document !== "undefined" && ("classList" in document.documentElement));

  // Hipster Nerd Tip
  // The second statement checks two flags, the first is done above it, the second is what we call an anonymous function!
  // They are super handy, read up about them here: http://bonsaiden.github.io/JavaScript-Garden/#function.scopes
  var TouchSupported = ('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch);
  var DragSupported = !TouchSupported && (function () {
    var div = document.createElement('div');
    return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
  })();

  /**
   * Sortable DOM Element Class Management
   * 
   * @param {Object} el Native DOM Element
   */
  var Class = function (el) {
    var library = {
      has: function (name) {
        if (Sortable.ClassListSupported) return el.classList.contains(name);
        else return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(el.className);
      },

      add: function (name) {
        if (Sortable.ClassListSupported) el.classList.add(name);
        else if (!library.has(name)) {
          el.className = el.className ? [el.className, name].join(' ') : name;
        }
      },

      remove: function (name) {
        if (Sortable.ClassListSupported && el.classList.contains(name)) return el.classList.remove(name);
        else if (library.has(name)) {
          var c = el.className;
          el.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), " ").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }
      }
    };

    return library;
  };

  /**
   * Delegation to reduce code repetition.
   * 
   * @param  {Function} callback Method to be invoked after delegation.
   * @return {Function}          Event capture method.
   */
  var Delegate = Ractive.eventDefinitions.wrap(function (callback) {
    return function (event) {
      var target = (Sortable.TouchSupported && event.touches && event.touches[0]) || event.target;
      var context;

      // Fix target for touch events
      if (Sortable.TouchSupported && document.elementFromPoint)
        target = document.elementFromPoint(event.pageX - document.body.scrollLeft, event.pageY - document.body.scrollTop);

      if (Class(target).has(CLASSES.CHILD))
        return callback.call(target, event);

      if (target === node)
        return;

      if (context = Drag.move.up(node, target))
        return callback.call(context, event);
    };
  });

  var Drag = {
    event: function (name) {
      return Drag[name.split("_")[1]];
    },

    current: {
      element: null,
      target: null
    },
    
    start: Delegate(function (event) {
      if (TouchSupported) prevent(event);
      if (event.dataTransfer)
        event.dataTransfer.effectAllowed = 'moving',
        event.dataTransfer.setData('Text', '*');

      Drag.current.element = this;
      Class(Drag.current.element).add(CLASSES.DRAGGING);

      foreach(node.childNodes, function (el) {
        if (el.nodeType === 1)
          Class(el).add(CLASSES.CHILD);
      });
    }),
    
    enter: Delegate(function (event) {
      if (!Drag.current.element || Drag.current.element === this)
        return true;

      var $this = this;

      // Prevent drag_enter from happening on a child by allowing drag_leave on the container
      var previous = Drag.data.enter(this);
      Drag.data.enter(this, previous + 1);

      if (previous === 0) {
        Class(this).add(CLASSES.OVER);

        fire({
          node: node,
          target: this,
          current: Drag.current.element,
          original: event,
          type: 'enter',
          move: function () {
            console.log($this);
            Drag.move.next(Drag.current.element, $this);
          }
        });
      }

      return false;
    }),

    over: Delegate(function (event) {
      if (!Drag.current.element)
        return true;

      if (event.preventDefault)
        event.preventDefault();

      return false;
    }),

    drop: Delegate(function (event) {
      var $this = this;

      if (event.type === 'drop') prevent(event);
      if (this === Drag.current.element)
        return;

      fire({
        node: node,
        target: this,
        current: Drag.current.element,
        original: event,
        type: 'drop',
        move: function () {
          var sibling = Drag.current.element.nextSibling;
          $this.parentNode.insertBefore(Drag.current.element, $this);
          $this.parentNode.insertBefore($this, sibling);
        }
      });
    }),

    leave: Delegate(function (event) {
      var previous = Drag.data.enter(this);
      Drag.data.enter(this, previous - 1);  

      // Fix for child elements firing drag_enter before parent fires drag_leave
      if (!Drag.data.enter(this)) {
        Class(this).remove(CLASSES.OVER);
        Drag.data.enter(this, false);
      }
    }),

    end: Delegate(function (event) {
      Drag.current.element = null;
      Drag.current.target = null;

      foreach(node.childNodes, function (el) {
        if (el.nodeType !== 1) return;

        var klass = Class(el);
        klass.remove(CLASSES.OVER);
        klass.remove(CLASSES.DRAGGING);
        klass.remove(CLASSES.CHILD);
        Drag.data.enter(el, false);
      });
    }),

    data: {
      enter: function (el, value) {
        if (arguments.length === 1)
          return parseInt(el.getAttribute('data-child-drag-enter'), 10) || 0;

        if (!value)
          el.removeAttribute('data-child-drag-enter');
        else
          el.setAttribute('data-child-drag-enter', Math.max(0, value));
      }
    },

    move: {
      next: function (a, b) {
        b.parentNode.insertBefore(a, Drag.checks.below(a, b) ? b : b.nextSibling);
      },

      up: function (a, b) {
        if (a == b) return null;

        var n = b;
        while(n) {
          if (n.parentNode === a)
            return n;

          n = n.parentNode;
          if (!n || !n.ownerDocument || n.nodeType === 11)
            break;
        }

        return null;
      }
    },

    checks: {
      below: function (a, b) {
        var n = a.parentNode;

        if (b.parentNode != n)
          return false;
        else n = a.previousSibling;

        while (n && n.nodeType !== 9)
          if (n === b) return true;
          else n = n.previousSibling;

        return false;
      }
    },

    attach: function (element) {
      if (element.draggable) return;

      element.draggable = true;
      element.addEventListener('dragstart', Drag.event('drag_start'));
      element.addEventListener('dragenter', Drag.event('drag_enter'));
      element.addEventListener('dragover', Drag.event('drag_over'));
      element.addEventListener('dragleave', Drag.event('drag_leave'));
      element.addEventListener('drop', Drag.event('drag_drop'));
      element.addEventListener('dragend', Drag.event('drag_end'));
    },

    detach: function (element) {
      if (element.draggable) return;

      element.draggable = false;
      element.removeEventListener('dragstart', Drag.event('drag_start'));
      element.removeEventListener('dragenter', Drag.event('drag_enter'));
      element.removeEventListener('dragover', Drag.event('drag_over'));
      element.removeEventListener('dragleave', Drag.event('drag_leave'));
      element.removeEventListener('drop', Drag.event('drag_drop'));
      element.removeEventListener('dragend', Drag.event('drag_end'));
    }
  };

  return Drag;
});