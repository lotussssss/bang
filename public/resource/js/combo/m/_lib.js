;/**import from `/resource/js/lib/m/zepto.js` **/
/* Zepto v1.2.0 - zepto event ajax form ie - zeptojs.com/license */
(function(global, factory) {
  if (typeof define === 'function' && define.amd)
    define(function() { return factory(global) })
  else
    factory(global)
}(this, function(window) {
  var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.matches || element.webkitMatchesSelector ||
                          element.mozMatchesSelector || element.oMatchesSelector ||
                          element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }

  function likeArray(obj) {
    var length = !!obj && 'length' in obj && obj.length,
      type = $.type(obj)

    return 'function' != type && !isWindow(obj) && (
      'array' == type || length === 0 ||
        (typeof length == 'number' && length > 0 && (length - 1) in obj)
    )
  }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  function Z(dom, selector) {
    var i, len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overridden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. This method can be overridden in plugins.
  zepto.Z = function(dom, selector) {
    return new Z(dom, selector)
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overridden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overridden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overridden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
      slice.call(
        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.isNumeric = function(val) {
    var num = Number(val), type = typeof val
    return val != null && type != 'boolean' &&
      (type != 'string' || val.length) &&
      !isNaN(num) && isFinite(num) || false
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }
  $.noop = function() {}

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    constructor: zepto.Z,
    length: 0,

    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    indexOf: emptyArray.indexOf,
    concat: function(){
      var i, value, args = []
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i]
        args[i] = zepto.isZ(value) ? value.toArray() : value
      }
      return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
    },

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var nodes = [], collection = typeof selector == 'object' && $(selector)
      this.each(function(_, node){
        while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
          node = node !== context && !isDocument(node) && node.parentNode
        if (node && nodes.indexOf(node) < 0) nodes.push(node)
      })
      return $(nodes)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this.pluck('textContent').join("") : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    removeProp: function(name){
      name = propMap[name] || name
      return this.each(function(){ delete this[name] })
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      if (0 in arguments) {
        if (value == null) value = ""
        return this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
      } else {
        return this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
      }
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
        return {top: 0, left: 0}
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0]
        if (typeof property == 'string') {
          if (!element) return
          return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
        } else if (isArray(property)) {
          if (!element) return
          var props = {}
          var computedStyle = getComputedStyle(element, '')
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            var arr = []
            argType = type(arg)
            if (argType == "array") {
              arg.forEach(function(el) {
                if (el.nodeType !== undefined) return arr.push(el)
                else if ($.zepto.isZ(el)) return arr = arr.concat(el.get())
                arr = arr.concat(zepto.fragment(el))
              })
              return arr
            }
            return argType == "object" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src){
              var target = el.ownerDocument ? el.ownerDocument.defaultView : window
              target['eval'].call(target, el.innerHTML)
            }
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isPlainObject = $.isPlainObject,
      isString = function(obj){ return typeof obj == 'string' },
      supportsPassiveOption = function () {
          var supportsPassiveOption = false
          try {
              var opts = Object.defineProperty ({}, 'passive', {
                  get : function () {
                      supportsPassiveOption = true
                  }
              });
              window.addEventListener ('test', null, opts)
          } catch (e) {
              supportsPassiveOption = false
          }
          return supportsPassiveOption
      } (),
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture, options){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
        options = (supportsPassiveOption && isPlainObject(options)) ? {
            capture : eventCapture(handler, capture),
            once : !!options.once,
            passive : !!options.passive
        } : eventCapture(handler, capture)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, options)
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback, options){
    return this.on(event, data, callback, options)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback, options){
    return this.on(event, selector, data, callback, options, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      event.timeStamp || (event.timeStamp = Date.now())

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback, options){
    return this.on(event, selector, callback, options)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback, options){
    $(document.body).delegate(this.selector, event, callback, options)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, options, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, options, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      options = callback, callback = data, data = selector, selector = undefined
    if (callback === undefined || isFunction(data) || data === false)
      options = callback, callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove, undefined, options)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = +new Date(),
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  function ajaxDataFilter(data, type, settings) {
    if (settings.dataFilter == empty) return data
    var context = settings.context
    return settings.dataFilter.call(context, data, type)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('Zepto' + (jsonpID++)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true,
    //Used to handle the raw response data of XMLHttpRequest.
    //This is a pre-filtering function to sanitize the response.
    //The sanitized response should be returned
    dataFilter: empty
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor, hashIndex
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      // cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))

          if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
            result = xhr.response
          else {
            result = xhr.responseText

            try {
              // http://perfectionkills.com/global-eval-what-are-the-options/
              // sanitize response accordingly if data filter callback provided
              result = ajaxDataFilter(result, dataType, settings)
              if (dataType == 'script')    (1,eval)(result)
              else if (dataType == 'xml')  result = xhr.responseXML
              else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
            } catch (e) { error = e }

            if (error) return ajaxError(error, 'parsererror', xhr, settings, deferred)
          }

          ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function(){
  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle
    window.getComputedStyle = function(element, pseudoElement){
      try {
        return nativeGetComputedStyle(element, pseudoElement)
      } catch(e) {
        return null
      }
    }
  }
})()
  return Zepto
}))


;/**import from `/resource/js/lib/m/zepto.detect.js` **/
//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
      android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
      osx = !!ua.match(/\(Macintosh\; Intel /),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      wp = ua.match(/Windows Phone ([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
      playbook = ua.match(/PlayBook/),
      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
      firefox = ua.match(/Firefox\/([\d.]+)/),
      ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
      webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
      safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
    if (wp) os.wp = true, os.version = wp[1]
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (bb10) os.bb10 = true, os.version = bb10[2]
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if (playbook) browser.playbook = true
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if (chrome) browser.chrome = true, browser.version = chrome[1]
    if (firefox) browser.firefox = true, browser.version = firefox[1]
    if (ie) browser.ie = true, browser.version = ie[1]
    if (safari && (osx || os.ios)) {browser.safari = true; if (osx) browser.version = safari[1]}
    if (webview) browser.webview = true

    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
      (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
    os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
      (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)


;/**import from `/resource/js/lib/m/zepto.touch.js` **/
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
    longTapDelay = 750,
    gesture

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event){
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
      && event.isPrimary
  }

  function isPointerEventType(e, type){
    return (e.type == 'pointer'+type ||
      e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
      .bind('MSGestureEnd', function(e){
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null
        if (swipeDirectionFromVelocity) {
          touch.el.trigger('swipe')
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
        }
      })
      .on('touchstart MSPointerDown pointerdown', function(e){
        if((_isPointerType = isPointerEventType(e, 'down')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        if (e.touches && e.touches.length === 1 && touch.x2) {
          // Clear out touch movement data if we have it sticking around
          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
          touch.x2 = undefined
          touch.y2 = undefined
        }
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
        // adds the current touch contact for IE gesture recognition
        if (gesture && _isPointerType) gesture.addPointer(e.pointerId)
      })
      .on('touchmove MSPointerMove pointermove', function(e){
        if((_isPointerType = isPointerEventType(e, 'move')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        cancelLongTap()
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY

        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
      })
      .on('touchend MSPointerUp pointerup', function(e){
        if((_isPointerType = isPointerEventType(e, 'up')) &&
          !isPrimaryTouch(e)) return
        cancelLongTap()

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            if (touch.el){
              touch.el.trigger('swipe')
              touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            }
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (deltaX < 30 && deltaY < 30) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap')
              event.cancelTouch = cancelAll
              // [by paper] fix -> "TypeError: 'undefined' is not an object (evaluating 'touch.el.trigger'), when double tap
              if (touch.el) touch.el.trigger(event)

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0

      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})(Zepto)


;/**import from `/resource/js/lib/m/zepto.cookie.min.js` **/
// Zepto.cookie plugin
// 
// Copyright (c) 2010, 2012 
// @author Klaus Hartl (stilbuero.de)
// @author Daniel Lacy (daniellacy.com)
// 
// Dual licensed under the MIT and GPL licenses:
// http://www.opensource.org/licenses/mit-license.php
// http://www.gnu.org/licenses/gpl.html
(function(a){a.extend(a.fn,{cookie:function(b,c,d){var e,f,g,h;if(arguments.length>1&&String(c)!=="[object Object]"){d=a.extend({},d);if(c===null||c===undefined)d.expires=-1;return typeof d.expires=="number"&&(e=d.expires*24*60*60*1e3,f=d.expires=new Date,f.setTime(f.getTime()+e)),c=String(c),document.cookie=[encodeURIComponent(b),"=",d.raw?c:encodeURIComponent(c),d.expires?"; expires="+d.expires.toUTCString():"",d.path?"; path="+d.path:"",d.domain?"; domain="+d.domain:"",d.secure?"; secure":""].join("")}return d=c||{},h=d.raw?function(a){return a}:decodeURIComponent,(g=(new RegExp("(?:^|; )"+encodeURIComponent(b)+"=([^;]*)")).exec(document.cookie))?h(g[1]):null}})})(Zepto);

;/**import from `/resource/js/lib/m/zepto.fx.js` **/
//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming, transitionDelay,
    animationName, animationDuration, animationTiming, animationDelay,
    cssReset = {}

  function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionDelay    = prefix + 'transition-delay'] =
  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
  cssReset[animationName      = prefix + 'animation-name'] =
  cssReset[animationDuration  = prefix + 'animation-duration'] =
  cssReset[animationDelay     = prefix + 'animation-delay'] =
  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback, delay){
    if ($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if ($.isFunction(ease))
      callback = ease, ease = undefined
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if (delay) delay = parseFloat(delay) / 1000
    return this.anim(properties, duration, ease, callback, delay)
  }

  $.fn.anim = function(properties, duration, ease, callback, delay){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
        fired = false

    if (duration === undefined) duration = $.fx.speeds._default / 1000
    if (delay === undefined) delay = 0
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      } else
        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

      fired = true
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0){
      this.bind(endEvent, wrappedCallback)
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function(){
        if (fired) return
        wrappedCallback.call(that)
      }, (duration * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null
})(Zepto)


;/**import from `/resource/js/lib/m/zepto.bindevent.js` **/
(function($){
	$.bindEvent = function(el, configs){
        el = $(el);
        for(var name in configs){
            var value = configs[name];
            if (typeof value == 'function') {
                var obj = {};
                obj.click = value;
                value = obj;
            };
            for(var type in value){
                el.delegate(name, type, value[type]);
            }
        }
    }
})(Zepto);

;/**import from `/resource/js/lib/m/zepto.strformat.js` **/
/**
 * 对目标字符串进行格式化
 * @name $.strFormat
 * @function
 * @grammar $.strFormat(source, opts)
 * @param {string} source 目标字符串
 * @param {Object|string...} opts 提供相应数据的对象或多个字符串
 * @remark
 * 
opts参数为“Object”时，替换目标字符串中的#{property name}部分。<br>
opts为“string...”时，替换目标字符串中的#{0}、#{1}...部分。
		
 *             
 * @returns {string} 格式化后的字符串
 */
(function($){
    $.strFormat = function(source, opts){
        source = String(source);
        var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
        if(data.length){
            data = data.length == 1 ? 
                /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
                (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
                : data;
            return source.replace(/#\{(.+?)\}/g, function (match, key){
                var replacer = data[key];
                // chrome 下 typeof /a/ == 'function'
                if('[object Function]' == toString.call(replacer)){
                    replacer = replacer(key);
                }
                return ('undefined' == typeof replacer ? '' : replacer);
            });
        }
        return source;
    }
})(Zepto);


;/**import from `/resource/js/lib/m/zepto.loading.js` **/
(function($){
	$.loading = function(content){
		var loading = $('.loading-box');

		if(loading.length == 0){
			loading = $('<div class="loading-box"></div>').css({
				'position' : 'fixed',
				'top' : 0,
				'right' : 0,
				'bottom' : 0,
				'left' : 0,
				'z-index' : 999999,
				'background-color'  : 'rgba(0,0,0, 0.2)',
				'padding' : '40% 10%'
			}).append( $('<div class="loading-content"> '+(content ||'加载中...')+'</div>').css({
				'font-size' : 18,
				'text-align' : 'center',
				'border-radius' : '10px',
				'background-color' : 'rgba(0,0,0, 0.7)',
				'color' : '#fff',
				'padding' : '50px 0'
			}) ).appendTo('body');

			$('<div class="loading-anim"></div>').prependTo(loading.find('.loading-content')).css({
				'width' : 32,
				'height' : 32,
				'display' :'inline-block',
				'vertical-align' : 'middle',
				'background' : 'url(https://p.ssl.qhimg.com/t015f3d5ddf0e5a1b71.png) no-repeat center',
				'background-size' : '32px'
			});			
		}

		loading.find('.loading-anim').css({			
			'-webkit-transform' : 'rotate(0)',
			'transform' : 'rotate(0)'
		});

		setTimeout(function(){ loading.find('.loading-anim').animate( { 'rotate' : '360000deg' }, 1000*1400 ) }, 100);

		return loading;
	}
})(Zepto);

;/**import from `/resource/js/lib/m/zepto.tmpl.js` **/
/*简单前端模板，改写自QWrap*/
(function($) {
	var StringH = {
		tmpl: (function() {
			var tmplFuns={};
			var sArrName = "sArrCMX",
				sLeft = sArrName + '.push("';
			var tags = {
				'=': {
					tagG: '=',
					isBgn: 1,
					isEnd: 1,
					sBgn: '",$.StringH.encode4HtmlValue(',
					sEnd: '),"'
				},
				'js': {
					tagG: 'js',
					isBgn: 1,
					isEnd: 1,
					sBgn: '");',
					sEnd: ';' + sLeft
				},
				'js': {
					tagG: 'js',
					isBgn: 1,
					isEnd: 1,
					sBgn: '");',
					sEnd: ';' + sLeft
				},
				//任意js语句, 里面如果需要输出到模板，用print("aaa");
				'if': {
					tagG: 'if',
					isBgn: 1,
					rlt: 1,
					sBgn: '");if',
					sEnd: '{' + sLeft
				},
				//if语句，写法为{if($a>1)},需要自带括号
				'elseif': {
					tagG: 'if',
					cond: 1,
					rlt: 1,
					sBgn: '");} else if',
					sEnd: '{' + sLeft
				},
				//if语句，写法为{elseif($a>1)},需要自带括号
				'else': {
					tagG: 'if',
					cond: 1,
					rlt: 2,
					sEnd: '");}else{' + sLeft
				},
				//else语句，写法为{else}
				'/if': {
					tagG: 'if',
					isEnd: 1,
					sEnd: '");}' + sLeft
				},
				//endif语句，写法为{/if}
				'for': {
					tagG: 'for',
					isBgn: 1,
					rlt: 1,
					sBgn: '");for',
					sEnd: '{' + sLeft
				},
				//for语句，写法为{for(var i=0;i<1;i++)},需要自带括号
				'/for': {
					tagG: 'for',
					isEnd: 1,
					sEnd: '");}' + sLeft
				},
				//endfor语句，写法为{/for}
				'while': {
					tagG: 'while',
					isBgn: 1,
					rlt: 1,
					sBgn: '");while',
					sEnd: '{' + sLeft
				},
				//while语句,写法为{while(i-->0)},需要自带括号
				'/while': {
					tagG: 'while',
					isEnd: 1,
					sEnd: '");}' + sLeft
				} //endwhile语句, 写法为{/while}
			};
			return function(sTmpl, opts) {
				var fun  = tmplFuns[sTmpl];
				if (!fun) {
					var N = -1,
						NStat = []; //语句堆栈;
					var ss = [
						[/\{strip\}([\s\S]*?)\{\/strip\}/g, function(a, b) {
							return b.replace(/[\r\n]\s*\}/g, " }").replace(/[\r\n]\s*/g, "");
						}],
						[/\\/g, '\\\\'],
						[/"/g, '\\"'],
						[/\r/g, '\\r'],
						[/\n/g, '\\n'], //为js作转码.
						[
							/\{[\s\S]*?\S\}/g, //js里使用}时，前面要加空格。
							function(a) {
								a = a.substr(1, a.length - 2);
								for (var i = 0; i < ss2.length; i++) {a = a.replace(ss2[i][0], ss2[i][1]); }
								var tagName = a;
								if (/^(=|.\w+)/.test(tagName)) {tagName = RegExp.$1; }
								var tag = tags[tagName];
								if (tag) {
									if (tag.isBgn) {
										var stat = NStat[++N] = {
											tagG: tag.tagG,
											rlt: tag.rlt
										};
									}
									if (tag.isEnd) {
										if (N < 0) {throw new Error("Unexpected Tag: " + a); }
										stat = NStat[N--];
										if (stat.tagG != tag.tagG) {throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName); }
									} else if (!tag.isBgn) {
										if (N < 0) {throw new Error("Unexpected Tag:" + a); }
										stat = NStat[N];
										if (stat.tagG != tag.tagG) {throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName); }
										if (tag.cond && !(tag.cond & stat.rlt)) {throw new Error("Unexpected Tag: " + tagName); }
										stat.rlt = tag.rlt;
									}
									return (tag.sBgn || '') + a.substr(tagName.length) + (tag.sEnd || '');
								} else {
									return '",(' + a + '),"';
								}
							}
						]
					];
					var ss2 = [
						[/\\n/g, '\n'],
						[/\\r/g, '\r'],
						[/\\"/g, '"'],
						[/\\\\/g, '\\'],
						[/\$(\w+)/g, 'opts["$1"]'],
						[/print\(/g, sArrName + '.push(']
					];
					for (var i = 0; i < ss.length; i++) {
						sTmpl = sTmpl.replace(ss[i][0], ss[i][1]);
					}
					if (N >= 0) {throw new Error("Lose end Tag: " + NStat[N].tagG); }
					sTmpl = sTmpl.replace(/##7b/g,'{').replace(/##7d/g,'}').replace(/##23/g,'#'); //替换特殊符号{}#
					sTmpl = 'var ' + sArrName + '=[];' + sLeft + sTmpl + '");return ' + sArrName + '.join("");';
					//alert('转化结果\n'+sTmpl);
					tmplFuns[sTmpl] = fun = new Function('opts', sTmpl);
				}
				if (arguments.length > 1) {return fun(opts); }
				return fun;
			};
		}()),
		encode4Html: function(s) {
			var el = document.createElement('pre'); //这里要用pre，用div有时会丢失换行，例如：'a\r\n\r\nb'
			var text = document.createTextNode(s);
			el.appendChild(text);
			return el.innerHTML;
		},
		encode4HtmlValue: function(s) {
     		return StringH.encode4Html(s).replace(/"/g, "&quot;").replace(/'/g, "&#039;");
		}
	};

	$.StringH = StringH;
	$.tmpl = $.StringH.tmpl;
})(Zepto);


;/**import from `/resource/js/lib/m/zepto.queryurl.js` **/
(function($) {
	function queryUrl(url, key) {
		url = url.replace(/^[^?=]*\?/ig, '').split('#')[0];	//去除网址与hash信息
		var json = {};
		//考虑到key中可能有特殊符号如“[].”等，而[]却有是否被编码的可能，所以，牺牲效率以求严谨，就算传了key参数，也是全部解析url。
		url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
			//对url这样不可信的内容进行decode，可能会抛异常，try一下；另外为了得到最合适的结果，这里要分别try
			try {
				key = decodeURIComponent(key);
			} catch(e) {}
			try {
				value = decodeURIComponent(value);
			} catch(e) {}
			if (!(key in json)) {
				json[key] = /\[\]$/.test(key) ? [value] : value; //如果参数名以[]结尾，则当作数组
			}
			else if (json[key] instanceof Array) {
				json[key].push(value);
			}
			else {
				json[key] = [json[key], value];
			}
		});
		return key ? json[key] : json;
	}

	$.queryUrl = queryUrl;
})(Zepto);


;/**import from `/resource/js/lib/m/zepto.dialog.js` **/
;(function ($) {

    var Dialog = (function () {
        function showMask() {
            return setZIndex($('<div class="bang-ui-dialog"></div>').appendTo('body'))
        }

        function show(txt) {
            var $box = showMask()
            var $cntBox = $('<div class="dialog-content"><span class="close iconfont icon-close">x</span><div class="dialog-txt">' + txt + '</div></div>').appendTo($box)

            $cntBox.find('.close').on('click', function (e) {
                e.preventDefault()
                hide()
            })
            return $box
        }

        function showBox(cnt) {
            var $box = showMask()
            return $box.html(cnt)
        }

        function alert(txt, callback, options) {
            options = options || {}
            var $box = show('<div>' + txt + '</div>' +
                '<div class="btn-box btn-box-alert">' +
                '<input class="ui-btn" type="button" value="' + (options.btn || '确定') + '"/>' +
                '</div>')
            var $close = $box.find('.close')
            var $btn = $box.find('.btn-box .ui-btn')
            if (options.className) {
                $box.addClass(options.className)
            }
            if (options.lock) {
                $btn.addClass('ui-btn-disabled')
                var text = $btn.val()
                var duration = parseInt(options.lock, 10) || 3
                $btn.val(text + '（' + duration + 's）')
                setTimeout(function countdown() {
                    duration--
                    if (duration > 0) {
                        $btn.val(text + '（' + duration + 's）')
                        setTimeout(countdown, 1000)
                    } else {
                        $btn.removeClass('ui-btn-disabled').val(text)
                    }
                }, 1000)
            }
            $close.hide()
            $btn.on('click', function () {
                var $me = $(this)
                if ($me.hasClass('ui-btn-disabled')) {
                    return
                }
                if (typeof (callback) == 'function') {
                    (callback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            return $box
        }

        function confirm(txt, succCallback, failCallback, options) {
            options = options || {}
            var $box = show('<div>' + txt + '</div>' +
                '<div class="btn-box btn-box-confirm">' +
                '<input class="ui-btn ui-btn-fail" type="button" value="' + (options.textCancel || '取消') + '"/>' +
                '<input class="ui-btn ui-btn-succ" type="button" value="' + (options.textConfirm || '确定') + '"/></div>')
            var $close = $box.find('.close')
            var $btn = $box.find('.btn-box .ui-btn')
            var $btnCancel = $btn.filter('.ui-btn-fail')
            var $btnConfirm = $btn.filter('.ui-btn-succ')

            if (options.className) {
                $box.addClass(options.className)
            }
            if (options.lock) {
                $btnConfirm.addClass('ui-btn-disabled')
                var text = $btnConfirm.val()
                var duration = parseInt(options.lock, 10) || 3
                $btnConfirm.val(text + '（' + duration + 's）')
                setTimeout(function countdown() {
                    duration--
                    if (duration > 0) {
                        $btnConfirm.val(text + '（' + duration + 's）')
                        setTimeout(countdown, 1000)
                    } else {
                        $btnConfirm.removeClass('ui-btn-disabled').val(text)
                    }
                }, 1000)
            }
            $close.hide()

            $btnConfirm.on('click', function () {
                var $me = $(this)
                if ($me.hasClass('ui-btn-disabled')) {
                    return
                }

                if (typeof succCallback === 'function') {
                    (succCallback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            $btnCancel.on('click', function () {
                if (typeof failCallback === 'function') {
                    (failCallback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            return $box
        }

        function prompt(txt, succCallback, failCallback) {

            var $box = show('<div>' + txt + '</div><div class="ui-txt-input"><input type="text" /></div><div class="btn-box btn-box-prompt"><input class="ui-btn ui-btn-fail" type="button" value=" 取消 "  /><input class="ui-btn ui-btn-succ" type="button" value=" 确定 "  /></div>')
            $box.find('.close').hide()

            var btns = $box.find('.btn-box .ui-btn')

            var txtIpt = $box.find('.ui-txt-input input')

            btns.filter('.ui-btn-succ').on('click', function () {
                if (typeof (succCallback) == 'function') {
                    (succCallback(txtIpt.val() || '') !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            btns.filter('.ui-btn-fail').on('click', function () {
                if (typeof (failCallback) == 'function') {
                    (failCallback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            return $box
        }

        function toast(txt, time) {
            // 判断当前页面是否已存在 toast
            var $eleToast = $('body').find('.bang-ui-dialog-toast') || []
            if ($eleToast.length > 0) return

            var $box = setZIndex($('<div class="bang-ui-dialog-toast"><span>' + txt + '</span></div>').appendTo('body'))

            setTimeout(function () { $box.animate({'opacity': '0'}, 300, function () { $(this).remove() }) }, time || 1500)

            return $box
        }

        function popup(txt) {
            var $box = showMask()

            var popup = $('<div class="bang-ui-dialog-popup">' + txt + '</div>').appendTo($box)

            setTimeout(function () {
                popup.css({
                    '-webkit-transform': 'translateY(0)',
                    'transform': 'translateY(0)'
                })
            }, 50)

            $box.on('click', function (e) {
                popup.animate({'translateY': '100%'}, 300, function () {
                    try { $box.remove() } catch (ex) {}
                })
            })

            return $box
        }

        function hide($box) {
            if (!($box && $box.length)) {
                $box = $('.bang-ui-dialog')
            }
            $box.remove()
        }

        return {
            'show': show,
            'showBox': showBox,
            'hide': hide,
            'alert': alert,
            'confirm': confirm,
            'prompt': prompt,
            'toast': toast,
            'popup': popup
        }
    })()

    function setZIndex($el) {
        if (typeof tcb !== 'undefined' && tcb.zIndex) {
            $el.css({'z-index': tcb.zIndex()})
        }
        return $el
    }

    $.dialog = Dialog

})(Zepto)


;/**import from `/resource/js/lib/m/zepto.erroranimate.js` **/
(function ($) {
    function errorAnimate (obj) {
        obj = $ (obj)

        obj.each (function () {
            var
                me = this,
                orig_background_color = me.style.backgroundColor

            $ (me).css ('background-color', '#f00').animate ({ 'background-color' : '#fff' }, 1200, 'cubic-bezier(.28,.2,.51,1.15)', function () {
                me.style.backgroundColor = orig_background_color || ''
            })
        })
    }

    $.errorAnimate = errorAnimate
    $.fn.shine4Error = function () {
        $.errorAnimate (this)

        return $ (this)
    }
}) (Zepto);

;/**import from `/resource/js/lib/m/zepto.iptclear.js` **/
(function($){
	$.fn.iptClear = function(plucss){		
		var me = $(this);

		if( this[0].tagName.toLowerCase() != 'input' ){
			return;
		}

		var ic = $('<span class="ui-ipt-clear"></span>').css({
			'display': 'none',
			'position' : 'absolute',			
			'top' : (me.height() - 20)/2,
			'right' : -2 ,
			'width': 20,
			'height': 20,
			'background': 'url(https://p.ssl.qhimg.com/t011e6c32277aa5fcfd.png) no-repeat center',
			'background-size' : '12px'
		}).on('click', function(){
			me.val('');
			ic.hide();
		});

		try{ ic.css(plucss); }catch(ex){}

		me.after( ic ).on('focus input keyup', function(){
			if(me.val().length > 0){
				ic.show();
			}
		}).on('blur', function(){
			if(me.val().length == 0){
				ic.hide();
			}
		});

		return me;
	}
})(Zepto);

;/**import from `/resource/js/lib/m/zepto.scroll.js` **/
/* Author:
    Max Degterev @suprMax
*/

;(function($) {
  var DEFAULTS = {
    endY: $.os.android ? 1 : 0,
    duration: 200,
    updateRate: 15
  };

  var interpolate = function (source, target, shift) {
    return (source + (target - source) * shift);
  };

  var easing = function (pos) {
    return (-Math.cos(pos * Math.PI) / 2) + .5;
  };

  var scroll = function(settings) {
    var options = $.extend({}, DEFAULTS, settings);

    if (options.duration === 0) {
      window.scrollTo(0, options.endY);
      if (typeof options.callback === 'function') options.callback();
      return;
    }

    var startY = window.pageYOffset,
        startT = Date.now(),
        finishT = startT + options.duration;

    var animate = function() {
      var now = Date.now(),
          shift = (now > finishT) ? 1 : (now - startT) / options.duration;

      window.scrollTo(0, interpolate(startY, options.endY, easing(shift)));

      if (now < finishT) {
        setTimeout(animate, options.updateRate);
      }
      else {
        if (typeof options.callback === 'function') options.callback();
      }
    };

    animate();
  };

  var scrollNode = function(settings) {
    var options = $.extend({}, DEFAULTS, settings);

    if (options.duration === 0) {
      this.scrollTop = options.endY;
      if (typeof options.callback === 'function') options.callback();
      return;
    }

    var startY = this.scrollTop,
        startT = Date.now(),
        finishT = startT + options.duration,
        _this = this;

    var animate = function() {
      var now = Date.now(),
          shift = (now > finishT) ? 1 : (now - startT) / options.duration;

      _this.scrollTop = interpolate(startY, options.endY, easing(shift));

      if (now < finishT) {
        setTimeout(animate, options.updateRate);
      }
      else {
        if (typeof options.callback === 'function') options.callback();
      }
    };

    animate();
  };

  $.scrollTo = scroll;

  $.fn.scrollTo = function() {
    if (this.length) {
      var args = arguments;
      this.forEach(function(elem, index) {
        scrollNode.apply(elem, args);
      });
    }
  };
}(Zepto));


;/**import from `/resource/js/lib/m/zepto.datetime.js` **/
(function($){
    var DateTime = function(el, config){
        var styleCss = '.ui-datetime { position: absolute; left: 0; z-index: 9000; margin: 0 auto; max-width: 1080px; min-width: 320px; background: #f8f8f8; box-shadow: 0 -.02rem .25rem #ccc; } .ui-datetime .dt-table { display: table; width: 100%; } .ui-datetime .date-box { width: 60%; display: table-cell } .ui-datetime .time-box { width: 40%; display: table-cell } .ui-datetime .date-item, .ui-datetime .time-item { display: block; text-align: center; white-space: nowrap; word-break: keep-all; cursor: pointer; margin: 0 5%; font-size: .12rem; height: .40rem; line-height: .40rem; color: #666; } .ui-datetime .date-curr, .ui-datetime .time-curr { color: #0b7; font-size: .14rem; } .ui-datetime .date-disabled { display: none; } .ui-datetime .time-disabled { display: none; background: #eee; color: #ccc; cursor: not-allowed; } .ui-datetime .date-tit, .ui-datetime .time-tit { font-size: .12rem; line-height: .36rem; text-align: center; background: #fff; border-bottom: 2px solid rgba(149, 192, 172, 0.3); color: #333; } .ui-datetime .icon-date { margin-right: .02rem; display: inline-block; vertical-align: middle; width: .24rem; height: .24rem; background: url(https://p.ssl.qhimg.com/t01fa50437b3f1ab3aa.jpg) no-repeat 0 -.03rem; background-size: .24rem; } .ui-datetime .icon-time { margin-right: .02rem; display: inline-block; vertical-align: middle; width: .24rem; height: .24rem; background: url(https://p.ssl.qhimg.com/t01fa50437b3f1ab3aa.jpg) no-repeat 0 -.32rem; background-size: .24rem; } .ui-datetime .item-select { height: 1.20rem; overflow: hidden; position: relative; } .ui-datetime .item-window { position: absolute; left: 0; top: 0; right: 0; bottom: 0; background: url("https://p.ssl.qhimg.com/t013ee84c60181f2d26.png") repeat-x 0 center; background-size: auto 100%; z-index: 10; } .ui-datetime .item-list { margin: .40rem 0; } .ui-datetime .i-w-line { display: block; height: 33%; margin: 0 .10rem; border-bottom: 1px solid rgba(208, 208, 208, 0.3); } .ui-datetime .ctrl-box { border-top: 1px solid rgba(208, 208, 208, 0.3); background: #fff } .ui-datetime .ctrl-item { display: inline-block; width: 50%; line-height: .4rem; font-size: .12rem; text-align: center; color: #778c82; } .ui-datetime .ctrl-item:active { background-color: #f8f8f8; } .ui-datetime .ctrl-item:first-child { box-shadow: -1px 0 0 rgba(208, 208, 208, 0.3) inset; }';

        this.box = null;
        this.el = null;
        this.conf = $.extend({
            remote: '',
            remoteDateTime: [],
            dateList : [ {'text' : (new Date().getMonth()+1) +'-'+ (new Date().getDate()), 'value':(new Date().getMonth()+1) +'-'+ (new Date().getDate())} ],
            timeList : [{'text':'09:00', 'value':'09:00'},
                {'text':'10:00', 'value':'10:00'},
                {'text':'11:00', 'value':'11:00'},
                {'text':'12:00', 'value':'12:00'},
                {'text':'13:00', 'value':'13:00'},
                {'text':'14:00', 'value':'14:00'},
                {'text':'15:00', 'value':'15:00'},
                {'text':'16:00', 'value':'16:00'},
                {'text':'17:00', 'value':'17:00'},
                {'text':'18:00', 'value':'18:00'}],
            onSelect : function(){ },
            noStyle : false
        }, config);

        this.init = function(el, config){
            el = $(el);
            this.el = el;

            if(el.attr('type') != 'text'){
                return;
            }

            if (!this.conf.noStyle){
                $('<style type="text/css"></style>').text(styleCss).appendTo('head');
            }

            var _this = this;
            _this.__create(function(wBox){

                el.on('focus', function(){
                    this.blur();

                    _this.show();
                });

                //$(document.body).on('click', function(e){
                //    if( e.target != _this.el[0] && e.target != _this.box[0] && !$.contains(_this.box[0], e.target) ){
                //        _this.hide();
                //    }
                //});

                wBox.delegate('.date-item', 'click', function(){
                    var $me = $(this);

                    $(this).addClass('date-curr').siblings('.date-curr').removeClass('date-curr');
                    wBox.find('.time-item').removeClass('time-disabled');

                    var today = DateTime.getDateList(0, 1)[0],
                        now = (new Date().getHours()),
                        $timelist = wBox.find('.time-item-list');

                    if (_this.conf.remote && _this.conf.remoteTime) {
                        var $cur = $timelist.find('.time-curr'),
                            cur_time = '';
                        if ($cur && $cur.length) {
                            cur_time = $cur.attr('data-value');
                        }
                        // 远程获取的数据
                        var timelist = _this.conf.remoteTime[$me.attr('data-value')];

                        $timelist.html( __genTimeHtml(timelist) );

                        $timelist.find('.time-item').each(function(){
                            var w_this = $(this);
                            if( w_this.attr('data-value') == cur_time ){
                                $timelist.find('.time-item').removeClass('time-curr');
                                w_this.addClass('time-curr');

                                var pnode = w_this.parents('.item-select'),
                                    unitH = pnode.height()/3;
                                var scrollY = $timelist.find('.time-item').filter(function(){return !$(this).hasClass('time-disabled');}).indexOf(w_this[0])*unitH;
                                $timelist.css('-webkit-transform', 'translateY(-'+scrollY+'px)');
                            }
                        });
                    }

                    if( $(this).attr('data-value') == today.value ){//如果选的是今天，就要禁止掉已经过期的时间点
                        wBox.find('.time-item').removeClass('time-curr');
                        wBox.find('.time-item').each(function(){
                            var w_this = $(this);
                            if( w_this.attr('data-value').split(':')[0]-0 <= now ){
                                w_this.addClass('time-disabled');
                            }
                        });

                        $timelist.animate({'translateY': 0 + 'px'}, 300, 'ease-out').data('scrollY',0);
                        wBox.find('.time-item').filter(function(){ if(!$(this).hasClass('time-disabled')) return $(this);  }).eq(0).trigger('click');
                    }

                    if( parseInt( _getTransY($timelist) ) == 0 ){
                        wBox.find('.time-item').filter(function(){ if(!$(this).hasClass('time-disabled')) return $(this);  }).eq(0).trigger('click');
                    }
                });

                wBox.delegate('.time-item', 'click', function(){
                    if( $(this).hasClass('time-disabled') ){
                        return false;
                    }

                    $(this).addClass('time-curr').siblings('.time-curr').removeClass('time-curr');
                    /*if( _this.box.find('.date-curr').length>0 ){
                     _this.select();
                     }*/
                });

                //touch start
                wBox.find('.item-window').on('touchstart', function(e) {
                    e.preventDefault();

                    var startY = e.touches[0].clientY;

                    var list = $(this).parents('.item-select').find('.item-list');

                    list.data('scrollY', parseInt( _getTransY(list)))
                        .data('startY', startY)
                        .data('isMove', 'yes')
                        .data('startTime', new Date().getTime());
                });

                //touch move
                wBox.find('.item-window').on('touchmove', function(e) {
                    e.preventDefault();

                    var list = $(this).parents('.item-select').find('.item-list');

                    if( list.data('isMove') != 'yes'){
                        return false;
                    }

                    var startY = list.data('startY'),
                        endY = e.touches[0].clientY,
                        detY = endY - startY;

                    _moveList(this, detY);

                }, {passive : false});

                //touch end
                wBox.find('.item-window').on('touchend', function(e) {
                    e.preventDefault();

                    var list = $(this).parents('.item-select').find('.item-list');

                    if( list.data('isMove') != 'yes'){
                        return false;
                    }

                    _moveEnd(this, (_getTransY(list)-list.data('scrollY') ), (new Date().getTime() - list.data('startTime') ));

                    list.data('scrollY', 0).data('startY', 0).data('isMove', '').data('startTime', 0);

                });

                //取消关闭
                wBox.delegate('.ctrl-cancle', 'click', function(){
                    _this.hide();
                });
                //确认选择
                wBox.delegate('.ctrl-ok', 'click', function(){
                    _this.select();
                });

                //默认选择第一项
                wBox.find('.date-item').filter(function(){ if(!$(this).hasClass('date-disabled')) return $(this);  }).eq(0).trigger('click');
                wBox.find('.time-item').filter(function(){ if(!$(this).hasClass('time-disabled')) return $(this);  }).eq(0).trigger('click');
            });

            function _moveList(obj, detY){
                var pnode = $(obj).parents('.item-select'),
                    unitH = pnode.height()/3,
                    list = pnode.find('.item-list'),
                    scrollY = parseInt(list.data('scrollY')||0),
                    children = list.find('.i-item').filter(function(){
                        if (pnode.hasClass('date-select')) {
                            // 日期
                            return !$(this).hasClass('date-disabled');
                        }
                        else if(pnode.hasClass('time-select')) {
                            // 时间
                            return !$(this).hasClass('time-disabled');
                        }
                    }),
                    maxTY = (children.length - 1) * unitH,
                    scrollY = (scrollY+detY);


                if(scrollY > 0 || scrollY< (0-maxTY)){
                    return;
                }

                //list.animate({'translateY': scrollY + 'px'}, 0);
                list.css('-webkit-transform', 'translateY('+scrollY+'px)');
                children.eq( Math.round(Math.abs(scrollY/unitH)) ).trigger('click');
            }

            function _moveEnd(obj, detY, detT){
                var pnode = $(obj).parents('.item-select'),
                    unitH = pnode.height()/3,
                    list = pnode.find('.item-list'),
                    children = list.find('.i-item').filter(function(){
                        if (pnode.hasClass('date-select')) {
                            // 日期
                            return !$(this).hasClass('date-disabled');
                        }
                        else if(pnode.hasClass('time-select')) {
                            // 时间
                            return !$(this).hasClass('time-disabled');
                        }
                    }),
                    maxTY = (children.length - 1) * unitH,
                    endTop = parseInt( _getTransY(list) );

                var lastTop =  (  Math.round(endTop / unitH) )*unitH;

                var ZN_NUM = 0.25;
                if( Math.abs(detY / detT)>ZN_NUM ){//惯性
                    var pastNum = ((detY / detT) / ZN_NUM);

                    var morePastY = Math.floor( pastNum * unitH );

                    lastTop += morePastY;

                    lastTop = Math.min(Math.max( 0-maxTY, lastTop), 0);

                    lastTop = (  Math.round(lastTop / unitH) )*unitH;

                    list.animate({'translateY': lastTop + 'px'}, 300-0+Math.ceil(Math.abs(pastNum))*100, 'ease-out');
                }else{
                    list.animate({'translateY': lastTop + 'px'}, 160, 'linear');
                }


                children.eq( Math.floor(Math.abs(lastTop/unitH)) ).trigger('click');
            }

            function _getTransY(obj){
                var trans = $(obj).css('transform') || $(obj).css('-webkit-transform') || $(obj)[0].style.webkitTransform;
                var transY = 0;
                if( trans.indexOf('translateY')>-1){
                    transY = trans.replace(/translateY\((\-?[\d\.]+)px\)/, function(m, n){ return n||0});
                }
                if(trans.indexOf('matrix')>-1){
                    transY = trans.replace(/matrix\(\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*(\-?[\d\.]+)\)/, function(m, n){ return n||0});
                }

                return transY;
            }
        };

        this.__create = function(callback){
            var me = this;
            var remote = me.conf.remote;
            if (remote) {

                me.getRemoteDateTime(function(remoteDateTime){
                    remoteDateTime = remoteDateTime || [];
                    var dateTimeHtml = __genDateTimeHtml(remoteDateTime, me.conf.remoteTime);
                    var date_str = dateTimeHtml[0],
                        time_str = dateTimeHtml[1];

                    var date_time_str = [];
                    date_time_str.push('<div class="ui-datetime"><div class="dt-table"><div class="date-box"><div class="date-tit"><span class="icon-date"> </span>日期</div>');
                    date_time_str.push('<div class="item-select date-select"><div class="item-window" data-for="date-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list date-item-list">');
                    date_time_str.push(date_str);
                    date_time_str.push('</div></div>');
                    date_time_str.push('</div><div class="time-box"><div class="time-tit"><span class="icon-time"> </span>时间</div>');
                    date_time_str.push('<div class="item-select time-select"><div class="item-window" data-for="time-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list time-item-list">');
                    date_time_str.push(time_str);
                    date_time_str.push('</div></div>');
                    date_time_str.push('</div></div><div class="ctrl-box"><span class="ctrl-item ctrl-cancle">取消</span><span class="ctrl-item ctrl-ok">确定</span></div></div>');
                    date_time_str = date_time_str.join('');
                    var wBox = $(date_time_str).appendTo($('body')).hide();
                    me.box = wBox;
                    if (typeof callback === 'function') {
                        callback(wBox)
                    }
                });
            } else {
                var dlist = this.conf.dateList;
                var tlist = this.conf.timeList;
                if( new Date().getTime() > Date.parse( dlist[0].value +' '+ tlist[tlist.length-1].value) ){
                    dlist.shift();
                }

                var dstr = '<div class="item-select date-select"><div class="item-window" data-for="date-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list date-item-list">';
                for(var i=0, n=dlist.length; i<n; i++){
                    dstr += '<span class="i-item date-item '+(i==0? 'date-curr' : '')+'" data-value="'+dlist[i].value+'">'+dlist[i].text+'</span>';
                }
                dstr += '</div></div>';

                var tstr = '<div class="item-select time-select"><div class="item-window" data-for="time-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list time-item-list">';
                for(var i=0, n=tlist.length; i<n; i++){
                    tstr += '<span class="i-item time-item '+(i==0? 'time-curr' : '')+'" data-value="'+tlist[i].value+'">'+tlist[i].text+'</span>';
                }
                tstr += '</div></div>';

                var wBox = $('<div class="ui-datetime"><div class="dt-table"><div class="date-box"><div class="date-tit"><span class="icon-date"> </span>日期</div>'+dstr+'</div><div class="time-box"><div class="time-tit"><span class="icon-time"> </span>时间</div>'+tstr+'</div></div><div class="ctrl-box"><span class="ctrl-item ctrl-cancle">取消</span><span class="ctrl-item ctrl-ok">确定</span></div></div>').appendTo($('body')).hide();
                me.box = wBox;
                if (typeof callback === 'function') {
                    callback(wBox)
                }
            }
        };

        // 生成date和time的html
        function __genDateTimeHtml(remoteDateTime, remoteTime) {
            remoteDateTime = remoteDateTime || []

            var date_str = '',
                time_str = '',
                date_curr = ''

            $.each(remoteDateTime, function(i, item){
                // 日期
                var
                    date = item[ 'date' ],
                    ext_class = ''

                if (date[ 'is_able' ]) {
                    if (!date_curr) {
                        ext_class += ' date-curr'
                        date_curr = date['value']
                    }
                } else {
                    ext_class += ' date-disabled'
                }
                date_str += '<span class="i-item date-item' + ext_class + '" data-value="' + date[ 'value' ] + '">' + date[ 'text' ] + '</span>'
                remoteTime[ date[ 'value' ] ] = item[ 'time' ]

                if (date_curr) {
                    // 时间
                    time_str = __genTimeHtml (remoteTime[ date_curr ])
                }
            })

            return [date_str, time_str];
        }
        // 生成time的html
        function __genTimeHtml(timelist) {
            timelist = timelist || [];
            var time_html = '';
            if (timelist.length){
                $.each(timelist, function(i, item){
                    time_html += '<span class="i-item time-item'+(i==0? ' time-curr' : '')+(item['is_able'] ? '' : ' time-disabled')+'" data-value="'+item['value']+'">'+item['text']+'</span>';
                });
            }

            return time_html;
        }
        // 重置远程请求url
        this.resetRemote = function(remote, reset_succ_callback){
            remote = remote || '';

            this.conf.remote = remote;

            this.resetBoxHtml(reset_succ_callback);
        };
        // 重置box内的日期选择
        this.resetBoxHtml = function(reset_succ_callback){
            var me = this;

            me.getRemoteDateTime(function(remoteDateTime){
                remoteDateTime = remoteDateTime || [];
                var dateTimeHtml = __genDateTimeHtml(remoteDateTime, me.conf.remoteTime);
                var date_str = dateTimeHtml[0],
                    time_str = dateTimeHtml[1];

                var wBox = me.box;
                if (wBox && wBox.length) {
                    wBox.find('.date-item-list').html(date_str);
                    wBox.find('.time-item-list').html(time_str);

                    typeof reset_succ_callback==='function' && reset_succ_callback(wBox, remoteDateTime);
                }

            });
        };
        // 获取远程日期、时间数据
        this.getRemoteDateTime = function(callback) {
            var me = this;
            var remote = me.conf.remote;

            $.get(remote, function(res){
                res = $.parseJSON(res);

                if (!res['errno']) {
                    me.conf.remoteTime = {};
                    me.conf.remoteDateTime = res['result'];

                    if (typeof callback === 'function') {

                        callback(me.conf.remoteDateTime);
                    }
                } else {
                    // @do nothing
                }
            });
        };


        this.select = function(){
            var val = this.box.find('.date-curr').attr('data-value') +' '+ this.box.find('.time-curr').attr('data-value');
            this.el.val( val );
            this.hide();
            if(typeof(this.conf.onSelect)=='function') this.conf.onSelect(val);
        };

        this.show = function(){
            //var elRect= this.el.offset();
            var box = this.box;

            // 判断是否有可选日期
            var $d_item = box.find('.date-item').filter(function(){return !$(this).hasClass('date-disabled')});
            if (!$d_item.length) {
                $.dialog.toast('抱歉，暂时没有可用日期');
                return ;
            }

            // 显示遮罩层
            showMask ()

            box.css({
                'position' : 'fixed',
                'left' : '0',
                'top' : '100%',
                'z-index' : tcb.zIndex (),
                'width' : '100%'
            }).show();

            //如果为android4.0以下系统，由于不支持部分CSS动画，需要特别处理
            if( $.os.android && !compareVersion($.os.version, "4.0") ){
                box.css({
                    'top' : 'auto',
                    'bottom' : 0
                });
                $.dialog.toast("抱歉，您的手机暂时无法进行时间选择", 1600);
            }else{
                box.animate({ 'translateY' : '1px' }, 10, function(){
                    box.hide();
                    setTimeout(function(){
                        box.show().animate({'translateY' : 0-box.height()+'px'}, 200, 'linear');
                    },30);
                });
            }

        };

        this.hide = function(){
            this.box.animate({'translateY' : 0}, 200, 'linear', function(){

                $(this).hide()

                hideMask ()
            });
        };

        this.init(el, config);

        function compareVersion(src, dest){
            return _version2Num(src) >= _version2Num(dest);

            function _version2Num(v){
                var arr = v.split(/\./);
                if( arr.length>2){
                    arr.length = 2;
                }else if(arr.length == 1){
                    arr[1]="0";
                }
                var vn = arr.join(".");
                vn -= 0;
                return vn;
            }
        }

        function showMask () {
            var
                $mask = $ ('#BottomSelectWrapMask')

            if (!($mask && $mask.length)) {

                var
                    mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;display: block;width: 100%;height: 100%;background:rgba(0, 0, 0, 0.2);',
                    mask_html = '<a id="BottomSelectWrapMask" href="#" style="' + mask_css + '"></a>'

                $mask = $ (mask_html).appendTo (document.body);

                $mask.on ('click', function (e) {
                    e.preventDefault ()

                })
            }

            $mask.css ({
                'z-index' : tcb.zIndex (),
                'display' : 'block'
            })
        }

        function hideMask () {
            var
                $mask = $ ('#BottomSelectWrapMask')

            if ($mask && $mask.length) {

                $mask.hide ()
            }
        }
    };

    /**
     * 获取日期列表
     * @param  {int} from    从哪天开始，0为今天，1为明天，以此类推。
     * @param  {int} dateNum 要返回的天数
     * @return {[type]}         [description]
     */
    DateTime.getDateList = function(from, dateNum){
        var DAY_ARR = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        from = from || 0;
        dateNum = dateNum || 1;
        var dateArr = [];
        for(var i=0; i<dateNum; i++){
            var nextDay = new Date( new Date().getTime() + 1000*60*60*24*(from+i) );
            var month = nextDay.getMonth() + 1;
            var date = nextDay.getDate();
            var day = nextDay.getDay();
            var year = nextDay.getFullYear();
            var dtxt = year + '-' + (month<10 ? ('0'+month) : month)+'-'+( date<10? ('0' + date): date );
            var dayTxt = DAY_ARR[day];
            if( from+i  == 0 ){
                dayTxt = '今天';
            }else if(from+i==1){
                dayTxt = '明天';
            }else if(from+i==2){
                dayTxt = '后天';
            }

            dateArr.push(  { 'text': dayTxt+'　'+dtxt, 'value' : dtxt } );
        }

        return dateArr;
    };

    $.datetime = DateTime;
})(Zepto);


;/**import from `/resource/js/lib/m/zepto.slidetoggle.js` **/
(function ($) {

    /* SlideDown */
    $.fn.slideDown = function (duration) {

        // get the element position to restore it then
        var position = this.css('position');

        // show element if it is hidden
        this.show();

        // get naturally height, margin, padding
        var marginTop = this.css('margin-top');
        var marginBottom = this.css('margin-bottom');
        var paddingTop = this.css('padding-top');
        var paddingBottom = this.css('padding-bottom');
        var height = this.css('height');

        // place it so it displays as usually but hidden
        this.css({
            position: 'absolute',
            visibility: 'hidden'
        });

        // set initial css for animation
        this.css({
            position: position,
            visibility: 'visible',
            overflow: 'hidden',
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0
        });

        // animate to gotten height, margin and padding
        this.animate({
            height: height,
            marginTop: marginTop,
            marginBottom: marginBottom,
            paddingTop: paddingTop,
            paddingBottom: paddingBottom
        }, duration);

    };

    /* SlideUp */
    $.fn.slideUp = function (duration) {

        // active the function only if the element is visible
        if (this.height() > 0) {

            var target = this;

            // get the element position to restore it then
            var position = target.css('position');

            // get the element height, margin and padding to restore them then
            var height = target.css('height');
            var marginTop = target.css('margin-top');
            var marginBottom = target.css('margin-bottom');
            var paddingTop = target.css('padding-top');
            var paddingBottom = target.css('padding-bottom');

            // set initial css for animation
            this.css({
                visibility: 'visible',
                overflow: 'hidden',
                height: height,
                marginTop: marginTop,
                marginBottom: marginBottom,
                paddingTop: paddingTop,
                paddingBottom: paddingBottom
            });

            // animate element height, margin and padding to zero
            target.animate({
                    height: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    paddingTop: 0,
                    paddingBottom: 0
                },
                {
                    // callback : restore the element position, height, margin and padding to original values
                    duration: duration,
                    queue: false,
                    complete: function(){
                        target.hide();
                        target.css({
                            visibility: 'visible',
                            overflow: 'hidden',
                            height: height,
                            marginTop: marginTop,
                            marginBottom: marginBottom,
                            paddingTop: paddingTop,
                            paddingBottom: paddingBottom
                        });
                    }
                });
        }
    };

    /* SlideToggle */
    $.fn.slideToggle = function (duration) {

        // if the element is hidden, slideDown !
        if (this.height() == 0) {
            this.slideDown(duration);
        }
        // if the element is visible, slideUp !
        else {
            this.slideUp(duration);
        }
    };

})(Zepto);


;/**import from `/resource/js/lib/m/swipe.js` **/
/*
 * Swipe 2.0
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
*/

function Swipe(container, options) {

  "use strict";

  // utilities
  var noop = function() {}; // simple no operation function
  var offloadFn = function(fn) { setTimeout(fn || noop, 0) }; // offload a functions execution

  // check browser capabilities
  var browser = {
    addEventListener: !!window.addEventListener,
    touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    transitions: (function(temp) {
      var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
      for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
      return false;
    })(document.createElement('swipe'))
  };

  // quit if no root element
  if (!container) return;
  var element = container.children[0];
  var slides, slidePos, width, length;
  options = options || {};
  var index = parseInt(options.startSlide, 10) || 0;
  var speed = options.speed || 300;
  options.continuous = options.continuous !== undefined ? options.continuous : true;

  function setup() {

    // cache slides
    slides = element.children;
    length = slides.length;

    // set continuous to false if only one slide
    if (slides.length < 2) options.continuous = false;

    //special case if two slides
    if (browser.transitions && options.continuous && slides.length < 3) {
      element.appendChild(slides[0].cloneNode(true));
      element.appendChild(element.children[1].cloneNode(true));
      slides = element.children;
    }

    // create an array to store current positions of each slide
    slidePos = new Array(slides.length);

    // determine width of each slide
    width = container.getBoundingClientRect().width || container.offsetWidth;

    element.style.width = (slides.length * width) + 'px';

    // stack elements
    var pos = slides.length;
    while(pos--) {

      var slide = slides[pos];

      slide.style.width = width + 'px';
      slide.setAttribute('data-index', pos);

      if (browser.transitions) {
        slide.style.left = (pos * -width) + 'px';
        move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
      }

    }

    // reposition elements before and after index
    if (options.continuous && browser.transitions) {
      move(circle(index-1), -width, 0);
      move(circle(index+1), width, 0);
    }

    if (!browser.transitions) element.style.left = (index * -width) + 'px';

    container.style.visibility = 'visible';

  }

  function prev() {

    if (options.continuous) slide(index-1);
    else if (index) slide(index-1);

  }

  function next() {

    if (options.continuous) slide(index+1);
    else if (index < slides.length - 1) slide(index+1);

  }

  function circle(index) {

    // a simple positive modulo using slides.length
    return (slides.length + (index % slides.length)) % slides.length;

  }

  function slide(to, slideSpeed) {

    // do nothing if already on requested slide
    if (index == to) return;

    if (browser.transitions) {

      var direction = Math.abs(index-to) / (index-to); // 1: backward, -1: forward

      // get the actual position of the slide
      if (options.continuous) {
        var natural_direction = direction;
        direction = -slidePos[circle(to)] / width;

        // if going forward but to < index, use to = slides.length + to
        // if going backward but to > index, use to = -slides.length + to
        if (direction !== natural_direction) to =  -direction * slides.length + to;

      }

      var diff = Math.abs(index-to) - 1;

      // move all the slides between index and to in the right direction
      while (diff--) move( circle((to > index ? to : index) - diff - 1), width * direction, 0);

      to = circle(to);

      move(index, width * direction, slideSpeed || speed);
      move(to, 0, slideSpeed || speed);

      if (options.continuous) move(circle(to - direction), -(width * direction), 0); // we need to get the next in place

    } else {

      to = circle(to);
      animate(index * -width, to * -width, slideSpeed || speed);
      //no fallback for a circular continuous if the browser does not accept transitions
    }

    index = to;
    offloadFn(options.callback && options.callback(index, slides[index]));
  }

  function move(index, dist, speed) {

    translate(index, dist, speed);
    slidePos[index] = dist;

  }

  function translate(index, dist, speed) {

    var slide = slides[index];
    var style = slide && slide.style;

    if (!style) return;

    style.webkitTransitionDuration =
    style.MozTransitionDuration =
    style.msTransitionDuration =
    style.OTransitionDuration =
    style.transitionDuration = speed + 'ms';

    style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
    style.msTransform =
    style.MozTransform =
    style.OTransform = 'translateX(' + dist + 'px)';

  }

  function animate(from, to, speed) {

    // if not an animation, just reposition
    if (!speed) {

      element.style.left = to + 'px';
      return;

    }

    var start = +new Date;

    var timer = setInterval(function() {

      var timeElap = +new Date - start;

      if (timeElap > speed) {

        element.style.left = to + 'px';

        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

        clearInterval(timer);
        return;

      }

      element.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';

    }, 4);

  }

  // setup auto slideshow
  var delay = options.auto || 0;
  var interval;

  function begin() {

    interval = setTimeout(next, delay);

  }

  function stop() {

    delay = 0;
    clearTimeout(interval);

  }


  // setup initial vars
  var start = {};
  var delta = {};
  var isScrolling;

  // setup event capturing
  var events = {

    handleEvent: function(event) {

      switch (event.type) {
        case 'touchstart': this.start(event); break;
        case 'touchmove': this.move(event); break;
        case 'touchend': offloadFn(this.end(event)); break;
        case 'webkitTransitionEnd':
        case 'msTransitionEnd':
        case 'oTransitionEnd':
        case 'otransitionend':
        case 'transitionend': offloadFn(this.transitionEnd(event)); break;
        case 'resize': offloadFn(setup); break;
      }

      if (options.stopPropagation) event.stopPropagation();

    },
    start: function(event) {

      var touches = event.touches[0];

      // measure start values
      start = {

        // get initial touch coords
        x: touches.pageX,
        y: touches.pageY,

        // store time to determine touch duration
        time: +new Date

      };

      // used for testing first move event
      isScrolling = undefined;

      // reset delta and end measurements
      delta = {};

      // attach touchmove and touchend listeners
      element.addEventListener('touchmove', this, false);
      element.addEventListener('touchend', this, false);

    },
    move: function(event) {

      // ensure swiping with one touch and not pinching
      if ( event.touches.length > 1 || event.scale && event.scale !== 1) return

      if (options.disableScroll) event.preventDefault();

      var touches = event.touches[0];

      // measure change in x and y
      delta = {
        x: touches.pageX - start.x,
        y: touches.pageY - start.y
      }

      // determine if scrolling test has run - one time test
      if ( typeof isScrolling == 'undefined') {
        isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
      }

      // if user is not trying to scroll vertically
      if (!isScrolling) {

        // prevent native scrolling
        event.preventDefault();

        // stop slideshow
        stop();

        // increase resistance if first or last slide
        if (options.continuous) { // we don't add resistance at the end

          translate(circle(index-1), delta.x + slidePos[circle(index-1)], 0);
          translate(index, delta.x + slidePos[index], 0);
          translate(circle(index+1), delta.x + slidePos[circle(index+1)], 0);

        } else {

          delta.x =
            delta.x /
              ( (!index && delta.x > 0               // if first slide and sliding left
                || index == slides.length - 1        // or if last slide and sliding right
                && delta.x < 0                       // and if sliding at all
              ) ?
              ( Math.abs(delta.x) / width + 1 )      // determine resistance level
              : 1 );                                 // no resistance if false

          // translate 1:1
          translate(index-1, delta.x + slidePos[index-1], 0);
          translate(index, delta.x + slidePos[index], 0);
          translate(index+1, delta.x + slidePos[index+1], 0);
        }

      }

    },
    end: function(event) {

      // measure duration
      var duration = +new Date - start.time;

      // determine if slide attempt triggers next/prev slide
      var isValidSlide =
            Number(duration) < 250               // if slide duration is less than 250ms
            && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
            || Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

      // determine if slide attempt is past start and end
      var isPastBounds =
            !index && delta.x > 0                            // if first slide and slide amt is greater than 0
            || index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0

      if (options.continuous) isPastBounds = false;

      // determine direction of swipe (true:right, false:left)
      var direction = delta.x < 0;

      // if not scrolling vertically
      if (!isScrolling) {

        if (isValidSlide && !isPastBounds) {

          if (direction) {

            if (options.continuous) { // we need to get the next in this direction in place

              move(circle(index-1), -width, 0);
              move(circle(index+2), width, 0);

            } else {
              move(index-1, -width, 0);
            }

            move(index, slidePos[index]-width, speed);
            move(circle(index+1), slidePos[circle(index+1)]-width, speed);
            index = circle(index+1);

          } else {
            if (options.continuous) { // we need to get the next in this direction in place

              move(circle(index+1), width, 0);
              move(circle(index-2), -width, 0);

            } else {
              move(index+1, width, 0);
            }

            move(index, slidePos[index]+width, speed);
            move(circle(index-1), slidePos[circle(index-1)]+width, speed);
            index = circle(index-1);

          }

          options.callback && options.callback(index, slides[index]);

        } else {

          if (options.continuous) {

            move(circle(index-1), -width, speed);
            move(index, 0, speed);
            move(circle(index+1), width, speed);

          } else {

            move(index-1, -width, speed);
            move(index, 0, speed);
            move(index+1, width, speed);
          }

        }

      }

      // kill touchmove and touchend event listeners until touchstart called again
      element.removeEventListener('touchmove', events, false)
      element.removeEventListener('touchend', events, false)

    },
    transitionEnd: function(event) {

      if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

      }

    }

  }

  // trigger setup
  setup();

  // start auto slideshow if applicable
  if (delay) begin();


  // add event listeners
  if (browser.addEventListener) {

    // set touchstart event on element
    if (browser.touch) element.addEventListener('touchstart', events, false);

    if (browser.transitions) {
      element.addEventListener('webkitTransitionEnd', events, false);
      element.addEventListener('msTransitionEnd', events, false);
      element.addEventListener('oTransitionEnd', events, false);
      element.addEventListener('otransitionend', events, false);
      element.addEventListener('transitionend', events, false);
    }

    // set resize event on window
    window.addEventListener('resize', events, false);

  } else {

    window.onresize = function () { setup() }; // to play nice with old IE

  }

  // expose the Swipe API
  return {
    setup: function() {

      setup();

    },
    slide: function(to, speed) {

      // cancel slideshow
      stop();

      slide(to, speed);

    },
    prev: function() {

      // cancel slideshow
      stop();

      prev();

    },
    next: function() {

      // cancel slideshow
      stop();

      next();

    },
    stop: function() {

      // cancel slideshow
      stop();

    },
    getPos: function() {

      // return current index position
      return index;

    },
    getNumSlides: function() {

      // return total number of slides
      return length;
    },
    kill: function() {

      // cancel slideshow
      stop();

      // reset element
      element.style.width = '';
      element.style.left = '';

      // reset slides
      var pos = slides.length;
      while(pos--) {

        var slide = slides[pos];
        slide.style.width = '';
        slide.style.left = '';

        if (browser.transitions) translate(pos, 0, 0);

      }

      // removed event listeners
      if (browser.addEventListener) {

        // remove current event listeners
        element.removeEventListener('touchstart', events, false);
        element.removeEventListener('webkitTransitionEnd', events, false);
        element.removeEventListener('msTransitionEnd', events, false);
        element.removeEventListener('oTransitionEnd', events, false);
        element.removeEventListener('otransitionend', events, false);
        element.removeEventListener('transitionend', events, false);
        window.removeEventListener('resize', events, false);

      }
      else {

        window.onresize = null;

      }

    }
  }

}


if ( window.jQuery || window.Zepto ) {
  (function($) {
    $.fn.Swipe = function(params) {
      return this.each(function() {
        $(this).data('Swipe', new Swipe($(this)[0], params));
      });
    }
  })( window.jQuery || window.Zepto )
}


;/**import from `/resource/js/lib/m/scroll.js` **/
/*
 * Scroll
 *
 * modified from http://github.com/zynga/scroller
 */

/**
 * Generic animation class with support for dropped frames both optional easing and duration.
 *
 * Optional duration is useful when the lifetime is defined by another condition than time
 * e.g. speed of an animating object, etc.
 *
 * Dropped frame logic allows to keep using the same updater logic independent from the actual
 * rendering. This eases a lot of cases where it might be pretty complex to break down a state
 * based on the pure time difference.
 */
!function (global) {
    var
        Root = global.Bang = global.Bang || {}

    var time = Date.now || function () {
            return +new Date ();
        }
    var desiredFrames = 60;
    var millisecondsPerSecond = 1000;
    var running = {};
    var counter = 1;

    // Create namespaces
    if (!global.core) {
        global.core = { effect : {} };

    } else if (!core.effect) {
        core.effect = {};
    }

    core.effect.Animate = {

        /**
         * A requestAnimationFrame wrapper / polyfill.
         *
         * @param callback {Function} The callback to be invoked before the next repaint.
         * @param root {HTMLElement} The root element for the repaint
         */
        requestAnimationFrame : (function () {

            // 检查requestAnimationFrame的支持情况
            var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
            var isNative = !!requestFrame;

            if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test (requestFrame.toString ())) {
                isNative = false;
            }

            if (isNative) {
                return function (callback, root) {
                    requestFrame (callback, root)
                };
            }

            var TARGET_FPS = 60;
            var requests = {};
            var requestCount = 0;
            var rafHandle = 1;
            var intervalHandle = null;
            var lastActive = +new Date ();

            return function (callback, root) {
                var callbackHandle = rafHandle++;

                // Store callback
                requests[ callbackHandle ] = callback;
                requestCount++;

                // Create timeout at first request
                if (intervalHandle === null) {

                    intervalHandle = setInterval (function () {

                        var time = +new Date ();
                        var currentRequests = requests;

                        // Reset data structure before executing callbacks
                        requests = {};
                        requestCount = 0;

                        for (var key in currentRequests) {
                            if (currentRequests.hasOwnProperty (key)) {
                                currentRequests[ key ] (time);
                                lastActive = time;
                            }
                        }

                        // Disable the timeout when nothing happens for a certain
                        // period of time
                        if (time - lastActive > 2500) {
                            clearInterval (intervalHandle);
                            intervalHandle = null;
                        }

                    }, 1000 / TARGET_FPS);
                }

                return callbackHandle;
            };

        }) (),

        /**
         * 停止指定的动画
         *
         * @param id {Integer} 唯一的动画ID
         * @return {Boolean} 动画是否停止成功
         */
        stop : function (id) {
            var
                cleared = running[ id ] != null
            if (cleared) {
                running[ id ] = null
            }

            return cleared
        },

        /**
         * 指定动画是否还处于运行之中
         *
         * @param id {Integer} 唯一的动画ID
         * @return {Boolean} 动画是否还处于运行之中
         */
        isRunning : function (id) {
            return running[ id ] != null
        },

        /**
         * 动画开始
         *
         * @param stepCallback {Function} Pointer to function which is executed on every step.
         *   Signature of the method should be `function(percent, now, virtual) { return continueWithAnimation; }`
         * @param verifyCallback {Function} Executed before every animation step.
         *   Signature of the method should be `function() { return continueWithAnimation; }`
         * @param completedCallback {Function}
         *   Signature of the method should be `function(droppedFrames, finishedAnimation) {}`
         * @param duration {Integer} Milliseconds to run the animation
         * @param easingMethod {Function} Pointer to easing function
         *   Signature of the method should be `function(percent) { return modifiedValue; }`
         * @param root {Element ? document.body} Render root, when available. Used for internal
         *   usage of requestAnimationFrame.
         * @return {Integer} Identifier of animation. Can be used to stop it any time.
         */
        start : function (stepCallback, verifyCallback, completedCallback, duration, easingMethod, root) {

            var start = time ();
            var lastFrame = start;
            var percent = 0;
            var dropCounter = 0;
            var id = counter++;

            if (!root) {
                root = document.body;
            }

            // Compacting running db automatically every few new animations
            if (id % 20 === 0) {
                var newRunning = {};
                for (var usedId in running) {
                    newRunning[ usedId ] = true;
                }
                running = newRunning;
            }

            // 帧函数，按指定的微秒时间调用
            var step = function (virtual) {

                // Normalize virtual value
                var render = virtual !== true;

                // 获取当前时间
                var now = time ()

                // 下一帧动画执行之前，执行验证
                if (!running[ id ] || (verifyCallback && !verifyCallback (id))) {

                    running[ id ] = null;
                    completedCallback && completedCallback (desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, false);
                    return;

                }

                // For the current rendering to apply let's update omitted steps in memory.
                // This is important to bring internal state variables up-to-date with progress in time.
                if (render) {

                    var droppedFrames = Math.round ((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
                    for (var j = 0; j < Math.min (droppedFrames, 4); j++) {
                        step (true);
                        dropCounter++;
                    }

                }

                // 计算percent的值
                if (duration) {
                    percent = (now - start) / duration;
                    if (percent > 1) {
                        percent = 1;
                    }
                }

                // 执行帧回调函数
                var
                    value = easingMethod
                        ? easingMethod (percent)
                        : percent
                if ((stepCallback (value, now, render) === false || percent === 1) && render) {
                    running[ id ] = null;
                    completedCallback && completedCallback (desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, percent === 1 || duration == null);
                } else if (render) {
                    lastFrame = now;
                    core.effect.Animate.requestAnimationFrame (step, root);
                }
            }

            // 标识动画正在运行ing
            running[ id ] = true

            // 初始化动画第一帧
            core.effect.Animate.requestAnimationFrame (step, root);

            // 返回动画唯一id
            return id
        }
    }
} (this)

var Scroll;

!function () {
    var NOOP = function () {};

    Scroll = function (callback, options) {

        this.__callback = callback;

        this.options = {
            // 开启横向滚动
            scrollingX              : true,
            // 开启纵向滚动
            scrollingY              : true,
            // 开启减速、回弹、缩放、滚动的动画
            animating               : true,
            // 滚动、缩放的动画时间周期
            animationDuration       : 250,
            // 开启回弹
            bouncing                : true,
            // 锁定开始的轴向
            locking                 : true,
            // 开启分页模式
            paging                  : false,
            // 开启滑动的像素格子模式
            snapping                : false,
            // 开启缩放模式，通过api，手指，或者鼠标滚轮
            zooming                 : false,
            // 最小缩放级别
            minZoom                 : 0.5,
            // 最大缩放级别
            maxZoom                 : 3,
            // 增减滚动速度
            speedMultiplier         : 1,
            // 滚动完成回调函数
            scrollingComplete       : NOOP,
            // 到达边界的减速变化量
            penetrationDeceleration : 0.03,
            // 到达边界的加速变化量
            penetrationAcceleration : 0.08

        };

        for (var key in options) {
            this.options[ key ] = options[ key ];
        }

    };


    // Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // Open source under the BSD License.

    /**
     * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
     **/
    var easeOutCubic = function (pos) {
        return (Math.pow ((pos - 1), 3) + 1);
    };

    /**
     * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
     **/
    var easeInOutCubic = function (pos) {
        if ((pos /= 0.5) < 1) {
            return 0.5 * Math.pow (pos, 3);
        }

        return 0.5 * (Math.pow ((pos - 2), 3) + 2);
    };


    var members = {

        /*
         ---------------------------------------------------------------------------
         状态属性
         ---------------------------------------------------------------------------
         */
        // {Boolean} 单指触摸
        __isSingleTouch             : false,
        // {Boolean} 触摸事件是否在处理中
        __isTracking                : false,
        // {Boolean} 减速动画是否完成
        __didDecelerationComplete   : false,
        // {Boolean} 是否有缩放/旋转手势，手势开始时设置为true，级别高于拖拽
        __isGesturing               : false,
        // {Boolean} 移动一段距离后设置为true。注意：在不被其他情况（如click）打断的情况下移动一段距离才被视为有效。
        __isDragging                : false,
        // {Boolean} 减速ing，没再触摸和拖拽。
        __isDecelerating            : false,
        // {Boolean} 移动ing。Smoothly animating the currently configured change
        __isAnimating               : false,


        /*
         ---------------------------------------------------------------------------
         尺寸/维度等属性
         ---------------------------------------------------------------------------
         */
        // {Integer} 离document的左边距离
        __clientLeft                : 0,
        // {Integer} 离document的顶部距离
        __clientTop                 : 0,
        // {Integer} 外层宽度
        __clientWidth               : 0,
        // {Integer} 外层高度
        __clientHeight              : 0,
        // {Integer} 内容宽度
        __contentWidth              : 0,
        // {Integer} 内容高度
        __contentHeight             : 0,
        // {Integer} 内容的snapping宽度
        __snapWidth                 : 100,
        // {Integer} 内容的snapping高度
        __snapHeight                : 100,
        // {Integer} 刷新区域高度
        __refreshHeight             : null,
        // {Boolean} 是否启用刷新功能
        __refreshActive             : false,
        // {Function} 刷新激活的回调函数
        __refreshActivate           : null,
        // {Function} 刷新取消的回调函数
        __refreshDeactivate         : null,
        // {Function} 刷新开始的回调函数
        __refreshStart              : null,
        // {Number} 缩放级别
        __zoomLevel                 : 1,
        // {Number} 横向滚动位置（x-axis 最左侧为0点）
        __scrollLeft                : 0,
        // {Number} 纵向滚动位置（y-axis 最顶部为0点）
        __scrollTop                 : 0,
        // {Number} 横向最大滚动位置
        __maxScrollLeft             : 0,
        // {Number} 纵向最大滚动位置
        __maxScrollTop              : 0,
        // {Number} 横向滚动的目标位置
        __scheduledLeft             : 0,
        // {Number} 纵向滚动的目标位置
        __scheduledTop              : 0,
        // {Number} 缩放的目标级别
        __scheduledZoom             : 0,


        /*
         ---------------------------------------------------------------------------
         最终位置
         ---------------------------------------------------------------------------
         */
        // {Number} 横向滑动起始位置
        __lastTouchLeft             : null,
        // {Number} 纵向滑动起始位置
        __lastTouchTop              : null,
        // {Date} 结束滑动的时间戳，用于限定减速范围
        __lastTouchMove             : null,
        // {Array} 位置列表，每个状态均有[left, top, timestamp]三个值
        __positions                 : null,


        /*
         ---------------------------------------------------------------------------
         减速支持
         ---------------------------------------------------------------------------
         */
        // {Integer} 横向最小减速位置
        __minDecelerationScrollLeft : null,
        // {Integer} 纵向最小减速位置
        __minDecelerationScrollTop  : null,
        // {Integer} 横向最大减速位置
        __maxDecelerationScrollLeft : null,
        // {Integer} 纵向最大减速位置
        __maxDecelerationScrollTop  : null,
        // {Number} 横向减速度
        __decelerationVelocityX     : null,
        // {Number} 纵向减速度
        __decelerationVelocityY     : null,


        /*
         ---------------------------------------------------------------------------
         公共接口API
         ---------------------------------------------------------------------------
         */

        /**
         * Configures the dimensions of the client (outer) and content (inner) elements.
         * Requires the available space for the outer element and the outer size of the inner element.
         * All values which are falsy (null or zero etc.) are ignored and the old value is kept.
         *
         * @param clientWidth {Integer ? null} Inner width of outer element
         * @param clientHeight {Integer ? null} Inner height of outer element
         * @param contentWidth {Integer ? null} Outer width of inner element
         * @param contentHeight {Integer ? null} Outer height of inner element
         */
        setDimensions : function (clientWidth, clientHeight, contentWidth, contentHeight) {

            var self = this;

            // Only update values which are defined
            if (clientWidth === +clientWidth) {
                self.__clientWidth = clientWidth;
            }

            if (clientHeight === +clientHeight) {
                self.__clientHeight = clientHeight;
            }

            if (contentWidth === +contentWidth) {
                self.__contentWidth = contentWidth;
            }

            if (contentHeight === +contentHeight) {
                self.__contentHeight = contentHeight;
            }

            // Refresh maximums
            self.__computeScrollMax ();

            // Refresh scroll position
            self.scrollTo (self.__scrollLeft, self.__scrollTop, true);

        },


        /**
         * Sets the client coordinates in relation to the document.
         *
         * @param left {Integer ? 0} Left position of outer element
         * @param top {Integer ? 0} Top position of outer element
         */
        setPosition : function (left, top) {

            var self = this;

            self.__clientLeft = left || 0;
            self.__clientTop = top || 0;

        },


        /**
         * Configures the snapping (when snapping is active)
         *
         * @param width {Integer} Snapping width
         * @param height {Integer} Snapping height
         */
        setSnapSize : function (width, height) {

            var self = this;

            self.__snapWidth = width;
            self.__snapHeight = height;

        },


        /**
         * Activates pull-to-refresh. A special zone on the top of the list to start a list refresh whenever
         * the user event is released during visibility of this zone. This was introduced by some apps on iOS like
         * the official Twitter client.
         *
         * @param height {Integer} Height of pull-to-refresh zone on top of rendered list
         * @param activateCallback {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release.
         * @param deactivateCallback {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled.
         * @param startCallback {Function} Callback to execute to start the real async refresh action. Call {@link #finishPullToRefresh} after finish of refresh.
         */
        activatePullToRefresh : function (height, activateCallback, deactivateCallback, startCallback) {

            var self = this;

            self.__refreshHeight = height;
            self.__refreshActivate = activateCallback;
            self.__refreshDeactivate = deactivateCallback;
            self.__refreshStart = startCallback;

        },


        /**
         * Starts pull-to-refresh manually.
         */
        triggerPullToRefresh : function () {
            // Use publish instead of scrollTo to allow scrolling to out of boundary position
            // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
            this.__publish (this.__scrollLeft, -this.__refreshHeight, this.__zoomLevel, true);

            if (this.__refreshStart) {
                this.__refreshStart ();
            }
        },


        /**
         * Signalizes that pull-to-refresh is finished.
         */
        finishPullToRefresh : function () {

            var self = this;

            self.__refreshActive = false;
            if (self.__refreshDeactivate) {
                self.__refreshDeactivate ();
            }

            self.scrollTo (self.__scrollLeft, self.__scrollTop, true);

        },


        /**
         * Returns the scroll position and zooming values
         *
         * @return {Map} `left` and `top` scroll position and `zoom` level
         */
        getValues : function () {

            var self = this;

            return {
                left : self.__scrollLeft,
                top  : self.__scrollTop,
                zoom : self.__zoomLevel
            };

        },


        /**
         * Returns the maximum scroll values
         *
         * @return {Map} `left` and `top` maximum scroll values
         */
        getScrollMax : function () {

            var self = this;

            return {
                left : self.__maxScrollLeft,
                top  : self.__maxScrollTop
            };

        },


        /**
         * Zooms to the given level. Supports optional animation. Zooms
         * the center when no coordinates are given.
         *
         * @param level {Number} Level to zoom to
         * @param animate {Boolean ? false} Whether to use animation
         * @param originLeft {Number ? null} Zoom in at given left coordinate
         * @param originTop {Number ? null} Zoom in at given top coordinate
         * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
         */
        zoomTo : function (level, animate, originLeft, originTop, callback) {

            var self = this;

            if (!self.options.zooming) {
                throw new Error ("Zooming is not enabled!");
            }

            // Add callback if exists
            if (callback) {
                self.__zoomComplete = callback;
            }

            // Stop deceleration
            if (self.__isDecelerating) {
                core.effect.Animate.stop (self.__isDecelerating);
                self.__isDecelerating = false;
            }

            var oldLevel = self.__zoomLevel;

            // Normalize input origin to center of viewport if not defined
            if (originLeft == null) {
                originLeft = self.__clientWidth / 2;
            }

            if (originTop == null) {
                originTop = self.__clientHeight / 2;
            }

            // Limit level according to configuration
            level = Math.max (Math.min (level, self.options.maxZoom), self.options.minZoom);

            // Recompute maximum values while temporary tweaking maximum scroll ranges
            self.__computeScrollMax (level);

            // Recompute left and top coordinates based on new zoom level
            var left = ((originLeft + self.__scrollLeft) * level / oldLevel) - originLeft;
            var top = ((originTop + self.__scrollTop) * level / oldLevel) - originTop;

            // Limit x-axis
            if (left > self.__maxScrollLeft) {
                left = self.__maxScrollLeft;
            } else if (left < 0) {
                left = 0;
            }

            // Limit y-axis
            if (top > self.__maxScrollTop) {
                top = self.__maxScrollTop;
            } else if (top < 0) {
                top = 0;
            }

            // Push values out
            self.__publish (left || 0, top || 0, level, animate);

        },


        /**
         * Zooms the content by the given factor.
         *
         * @param factor {Number} Zoom by given factor
         * @param animate {Boolean ? false} Whether to use animation
         * @param originLeft {Number ? 0} Zoom in at given left coordinate
         * @param originTop {Number ? 0} Zoom in at given top coordinate
         * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
         */
        zoomBy : function (factor, animate, originLeft, originTop, callback) {

            var self = this;

            self.zoomTo (self.__zoomLevel * factor, animate, originLeft, originTop, callback);

        },


        /**
         * Scrolls to the given position. Respect limitations and snapping automatically.
         *
         * @param left {Number?null} Horizontal scroll position, keeps current if value is <code>null</code>
         * @param top {Number?null} Vertical scroll position, keeps current if value is <code>null</code>
         * @param animate {Boolean?false} Whether the scrolling should happen using an animation
         * @param zoom {Number?null} Zoom level to go to
         */
        scrollTo : function (left, top, animate, zoom) {

            var self = this;

            // 停止减速
            if (self.__isDecelerating) {
                core.effect.Animate.stop (self.__isDecelerating);
                self.__isDecelerating = false;
            }

            // Correct coordinates based on new zoom level
            if (zoom != null && zoom !== self.__zoomLevel) {

                if (!self.options.zooming) {
                    throw new Error ("Zooming is not enabled!");
                }

                left *= zoom;
                top *= zoom;

                // Recompute maximum values while temporary tweaking maximum scroll ranges
                self.__computeScrollMax (zoom);

            } else {

                // Keep zoom when not defined
                zoom = self.__zoomLevel;

            }

            if (!self.options.scrollingX) {

                left = self.__scrollLeft;

            } else {

                if (self.options.paging) {
                    left = Math.round (left / self.__clientWidth) * self.__clientWidth;
                } else if (self.options.snapping) {
                    left = Math.round (left / self.__snapWidth) * self.__snapWidth;
                }

            }

            if (!self.options.scrollingY) {

                top = self.__scrollTop;

            } else {

                if (self.options.paging) {
                    top = Math.round (top / self.__clientHeight) * self.__clientHeight;
                } else if (self.options.snapping) {
                    top = Math.round (top / self.__snapHeight) * self.__snapHeight;
                }

            }

            // Limit for allowed ranges
            left = Math.max (Math.min (self.__maxScrollLeft, left), 0);
            top = Math.max (Math.min (self.__maxScrollTop, top), 0);

            // Don't animate when no change detected, still call publish to make sure
            // that rendered position is really in-sync with internal data
            if (left === self.__scrollLeft && top === self.__scrollTop) {
                animate = false;
            }

            // Publish new values
            if (!self.__isTracking) {
                self.__publish (left || 0, top || 0, zoom, animate);
            }

        },


        /**
         * Scroll by the given offset
         *
         * @param left {Number ? 0} Scroll x-axis by given offset
         * @param top {Number ? 0} Scroll x-axis by given offset
         * @param animate {Boolean ? false} Whether to animate the given change
         */
        scrollBy : function (left, top, animate) {

            var self = this;

            var startLeft = self.__isAnimating
                ? self.__scheduledLeft
                : self.__scrollLeft;
            var startTop = self.__isAnimating
                ? self.__scheduledTop
                : self.__scrollTop;

            self.scrollTo (startLeft + (left || 0), startTop + (top || 0), animate);

        },



        /*
         ---------------------------------------------------------------------------
         EVENT CALLBACKS
         ---------------------------------------------------------------------------
         */

        /**
         * Mouse wheel handler for zooming support
         */
        doMouseZoom : function (wheelDelta, timeStamp, pageX, pageY) {

            var self = this;
            var change = wheelDelta > 0
                ? 0.97
                : 1.03;

            return self.zoomTo (self.__zoomLevel * change, false, pageX - self.__clientLeft, pageY - self.__clientTop);

        },


        /**
         * 触摸开始（滚动预备～）
         */
        doTouchStart : function (touches, timeStamp) {

            // Array-like check is enough here
            if (touches.length == null) {
                throw new Error ("Invalid touch list: " + touches);
            }

            if (timeStamp instanceof Date) {
                timeStamp = timeStamp.valueOf ();
            }
            if (typeof timeStamp !== "number") {
                throw new Error ("Invalid timestamp value: " + timeStamp);
            }

            var self = this;

            // Reset interruptedAnimation flag
            self.__interruptedAnimation = true;

            // Stop deceleration
            if (self.__isDecelerating) {
                core.effect.Animate.stop (self.__isDecelerating);
                self.__isDecelerating = false;
                self.__interruptedAnimation = true;
            }

            // Stop animation
            if (self.__isAnimating) {
                core.effect.Animate.stop (self.__isAnimating);
                self.__isAnimating = false;
                self.__interruptedAnimation = true;
            }

            // Use center point when dealing with two fingers
            var currentTouchLeft, currentTouchTop;
            var isSingleTouch = touches.length === 1;
            if (isSingleTouch) {
                currentTouchLeft = touches[ 0 ].pageX;
                currentTouchTop = touches[ 0 ].pageY;
            } else {
                currentTouchLeft = Math.abs (touches[ 0 ].pageX + touches[ 1 ].pageX) / 2;
                currentTouchTop = Math.abs (touches[ 0 ].pageY + touches[ 1 ].pageY) / 2;
            }

            // Store initial positions
            self.__initialTouchLeft = currentTouchLeft;
            self.__initialTouchTop = currentTouchTop;

            // Store current zoom level
            self.__zoomLevelStart = self.__zoomLevel;

            // Store initial touch positions
            self.__lastTouchLeft = currentTouchLeft;
            self.__lastTouchTop = currentTouchTop;

            // Store initial move time stamp
            self.__lastTouchMove = timeStamp;

            // Reset initial scale
            self.__lastScale = 1;

            // Reset locking flags
            self.__enableScrollX = !isSingleTouch && self.options.scrollingX;
            self.__enableScrollY = !isSingleTouch && self.options.scrollingY;

            // Reset tracking flag
            self.__isTracking = true;

            // Reset deceleration complete flag
            self.__didDecelerationComplete = false;

            // Dragging starts directly with two fingers, otherwise lazy with an offset
            self.__isDragging = !isSingleTouch;

            // Some features are disabled in multi touch scenarios
            self.__isSingleTouch = isSingleTouch;

            // Clearing data structure
            self.__positions = [];

        },


        /**
         * Touch move handler for scrolling support
         */
        doTouchMove : function (touches, timeStamp, scale) {

            // Array-like check is enough here
            if (touches.length == null) {
                throw new Error ("Invalid touch list: " + touches);
            }

            if (timeStamp instanceof Date) {
                timeStamp = timeStamp.valueOf ();
            }
            if (typeof timeStamp !== "number") {
                throw new Error ("Invalid timestamp value: " + timeStamp);
            }

            var self = this;

            // Ignore event when tracking is not enabled (event might be outside of element)
            if (!self.__isTracking) {
                return;
            }


            var currentTouchLeft, currentTouchTop;

            // Compute move based around of center of fingers
            if (touches.length === 2) {
                currentTouchLeft = Math.abs (touches[ 0 ].pageX + touches[ 1 ].pageX) / 2;
                currentTouchTop = Math.abs (touches[ 0 ].pageY + touches[ 1 ].pageY) / 2;
            } else {
                currentTouchLeft = touches[ 0 ].pageX;
                currentTouchTop = touches[ 0 ].pageY;
            }

            var positions = self.__positions;

            // Are we already is dragging mode?
            if (self.__isDragging) {

                // Compute move distance
                var moveX = currentTouchLeft - self.__lastTouchLeft;
                var moveY = currentTouchTop - self.__lastTouchTop;

                // Read previous scroll position and zooming
                var scrollLeft = self.__scrollLeft;
                var scrollTop = self.__scrollTop;
                var level = self.__zoomLevel;

                // Work with scaling
                if (scale != null && self.options.zooming) {

                    var oldLevel = level;

                    // Recompute level based on previous scale and new scale
                    level = level / self.__lastScale * scale;

                    // Limit level according to configuration
                    level = Math.max (Math.min (level, self.options.maxZoom), self.options.minZoom);

                    // Only do further compution when change happened
                    if (oldLevel !== level) {

                        // Compute relative event position to container
                        var currentTouchLeftRel = currentTouchLeft - self.__clientLeft;
                        var currentTouchTopRel = currentTouchTop - self.__clientTop;

                        // Recompute left and top coordinates based on new zoom level
                        scrollLeft = ((currentTouchLeftRel + scrollLeft) * level / oldLevel) - currentTouchLeftRel;
                        scrollTop = ((currentTouchTopRel + scrollTop) * level / oldLevel) - currentTouchTopRel;

                        // Recompute max scroll values
                        self.__computeScrollMax (level);

                    }
                }

                if (self.__enableScrollX) {

                    scrollLeft -= moveX * this.options.speedMultiplier;
                    var maxScrollLeft = self.__maxScrollLeft;

                    if (scrollLeft > maxScrollLeft || scrollLeft < 0) {

                        // Slow down on the edges
                        if (self.options.bouncing) {

                            scrollLeft += (moveX / 2 * this.options.speedMultiplier);

                        } else if (scrollLeft > maxScrollLeft) {

                            scrollLeft = maxScrollLeft;

                        } else {

                            scrollLeft = 0;

                        }
                    }
                }

                // Compute new vertical scroll position
                if (self.__enableScrollY) {

                    scrollTop -= moveY * this.options.speedMultiplier;
                    var maxScrollTop = self.__maxScrollTop;

                    if (scrollTop > maxScrollTop || scrollTop < 0) {

                        // Slow down on the edges
                        if (self.options.bouncing) {

                            scrollTop += (moveY / 2 * this.options.speedMultiplier);

                            // Support pull-to-refresh (only when only y is scrollable)
                            if (!self.__enableScrollX && self.__refreshHeight != null) {

                                if (!self.__refreshActive && scrollTop <= -self.__refreshHeight) {

                                    self.__refreshActive = true;
                                    if (self.__refreshActivate) {
                                        self.__refreshActivate ();
                                    }

                                } else if (self.__refreshActive && scrollTop > -self.__refreshHeight) {

                                    self.__refreshActive = false;
                                    if (self.__refreshDeactivate) {
                                        self.__refreshDeactivate ();
                                    }

                                }
                            }

                        } else if (scrollTop > maxScrollTop) {

                            scrollTop = maxScrollTop;

                        } else {

                            scrollTop = 0;

                        }
                    }
                }

                // Keep list from growing infinitely (holding min 10, max 20 measure points)
                if (positions.length > 60) {
                    positions.splice (0, 30);
                }

                // Track scroll movement for decleration
                positions.push (scrollLeft, scrollTop, timeStamp);

                // Sync scroll position
                self.__publish (scrollLeft, scrollTop, level);

                // Otherwise figure out whether we are switching into dragging mode now.
            } else {

                var minimumTrackingForScroll = self.options.locking
                    ? 3
                    : 0;
                var minimumTrackingForDrag = 5;

                var distanceX = Math.abs (currentTouchLeft - self.__initialTouchLeft);
                var distanceY = Math.abs (currentTouchTop - self.__initialTouchTop);

                self.__enableScrollX = self.options.scrollingX && distanceX >= minimumTrackingForScroll;
                self.__enableScrollY = self.options.scrollingY && distanceY >= minimumTrackingForScroll;

                positions.push (self.__scrollLeft, self.__scrollTop, timeStamp);

                self.__isDragging = (self.__enableScrollX || self.__enableScrollY) && (distanceX >= minimumTrackingForDrag || distanceY >= minimumTrackingForDrag);
                if (self.__isDragging) {
                    self.__interruptedAnimation = false;
                }

            }

            // Update last touch positions and time stamp for next event
            self.__lastTouchLeft = currentTouchLeft;
            self.__lastTouchTop = currentTouchTop;
            self.__lastTouchMove = timeStamp;
            self.__lastScale = scale;

        },


        /**
         * Touch end handler for scrolling support
         */
        doTouchEnd : function (timeStamp) {

            if (timeStamp instanceof Date) {
                timeStamp = timeStamp.valueOf ();
            }
            if (typeof timeStamp !== "number") {
                throw new Error ("Invalid timestamp value: " + timeStamp);
            }

            var self = this;

            // Ignore event when tracking is not enabled (no touchstart event on element)
            // This is required as this listener ('touchmove') sits on the document and not on the element itself.
            if (!self.__isTracking) {
                return;
            }

            // Not touching anymore (when two finger hit the screen there are two touch end events)
            self.__isTracking = false;

            // Be sure to reset the dragging flag now. Here we also detect whether
            // the finger has moved fast enough to switch into a deceleration animation.
            if (self.__isDragging) {

                // Reset dragging flag
                self.__isDragging = false;

                // Start deceleration
                // Verify that the last move detected was in some relevant time frame
                if (self.__isSingleTouch && self.options.animating && (timeStamp - self.__lastTouchMove) <= 100) {

                    // Then figure out what the scroll position was about 100ms ago
                    var positions = self.__positions;
                    var endPos = positions.length - 1;
                    var startPos = endPos;

                    // Move pointer to position measured 100ms ago
                    for (var i = endPos; i > 0 && positions[ i ] > (self.__lastTouchMove - 100); i -= 3) {
                        startPos = i;
                    }

                    // If start and stop position is identical in a 100ms timeframe,
                    // we cannot compute any useful deceleration.
                    if (startPos !== endPos) {

                        // Compute relative movement between these two points
                        var timeOffset = positions[ endPos ] - positions[ startPos ];
                        var movedLeft = self.__scrollLeft - positions[ startPos - 2 ];
                        var movedTop = self.__scrollTop - positions[ startPos - 1 ];

                        // Based on 50ms compute the movement to apply for each render step
                        self.__decelerationVelocityX = movedLeft / timeOffset * (1000 / 60);
                        self.__decelerationVelocityY = movedTop / timeOffset * (1000 / 60);

                        // How much velocity is required to start the deceleration
                        var minVelocityToStartDeceleration = self.options.paging || self.options.snapping
                            ? 4
                            : 1;

                        // Verify that we have enough velocity to start deceleration
                        if (Math.abs (self.__decelerationVelocityX) > minVelocityToStartDeceleration || Math.abs (self.__decelerationVelocityY) > minVelocityToStartDeceleration) {

                            // Deactivate pull-to-refresh when decelerating
                            if (!self.__refreshActive) {
                                self.__startDeceleration (timeStamp);
                            }
                        } else {
                            self.options.scrollingComplete ();
                        }
                    } else {
                        self.options.scrollingComplete ();
                    }
                } else if ((timeStamp - self.__lastTouchMove) > 100) {
                    self.options.scrollingComplete ();
                }
            }

            // If this was a slower move it is per default non decelerated, but this
            // still means that we want snap back to the bounds which is done here.
            // This is placed outside the condition above to improve edge case stability
            // e.g. touchend fired without enabled dragging. This should normally do not
            // have modified the scroll positions or even showed the scrollbars though.
            if (!self.__isDecelerating) {

                if (self.__refreshActive && self.__refreshStart) {

                    // Use publish instead of scrollTo to allow scrolling to out of boundary position
                    // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
                    self.__publish (self.__scrollLeft, -self.__refreshHeight, self.__zoomLevel, true);

                    if (self.__refreshStart) {
                        self.__refreshStart ();
                    }

                } else {

                    if (self.__interruptedAnimation || self.__isDragging) {
                        self.options.scrollingComplete ();
                    }
                    self.scrollTo (self.__scrollLeft, self.__scrollTop, true, self.__zoomLevel);

                    // Directly signalize deactivation (nothing todo on refresh?)
                    if (self.__refreshActive) {

                        self.__refreshActive = false;
                        if (self.__refreshDeactivate) {
                            self.__refreshDeactivate ();
                        }

                    }
                }
            }

            // Fully cleanup list
            self.__positions.length = 0;

        },



        /*
         ---------------------------------------------------------------------------
         私有接口API
         ---------------------------------------------------------------------------
         */

        /**
         * Applies the scroll position to the content element
         *
         * @param left {Number} Left scroll position
         * @param top {Number} Top scroll position
         * @param animate {Boolean?false} Whether animation should be used to move to the new coordinates
         */
        __publish : function (left, top, zoom, animate) {

            var self = this;

            // Remember whether we had an animation, then we try to continue based on the current "drive" of the animation
            var wasAnimating = self.__isAnimating;
            if (wasAnimating) {
                core.effect.Animate.stop (wasAnimating);
                self.__isAnimating = false;
            }

            if (animate && self.options.animating) {

                // Keep scheduled positions for scrollBy/zoomBy functionality
                self.__scheduledLeft = left;
                self.__scheduledTop = top;
                self.__scheduledZoom = zoom;

                var oldLeft = self.__scrollLeft;
                var oldTop = self.__scrollTop;
                var oldZoom = self.__zoomLevel;

                var diffLeft = left - oldLeft;
                var diffTop = top - oldTop;
                var diffZoom = zoom - oldZoom;

                var step = function (percent, now, render) {

                    if (render) {

                        self.__scrollLeft = oldLeft + (diffLeft * percent);
                        self.__scrollTop = oldTop + (diffTop * percent);
                        self.__zoomLevel = oldZoom + (diffZoom * percent);

                        // Push values out
                        if (self.__callback) {
                            self.__callback (self.__scrollLeft, self.__scrollTop, self.__zoomLevel);
                        }

                    }
                };

                var verify = function (id) {
                    return self.__isAnimating === id;
                };

                var completed = function (renderedFramesPerSecond, animationId, wasFinished) {
                    if (animationId === self.__isAnimating) {
                        self.__isAnimating = false;
                    }
                    if (self.__didDecelerationComplete || wasFinished) {
                        self.options.scrollingComplete ();
                    }

                    if (self.options.zooming) {
                        self.__computeScrollMax ();
                        if (self.__zoomComplete) {
                            self.__zoomComplete ();
                            self.__zoomComplete = null;
                        }
                    }
                };

                // When continuing based on previous animation we choose an ease-out animation instead of ease-in-out
                self.__isAnimating = core.effect.Animate.start (step, verify, completed, self.options.animationDuration, wasAnimating
                    ? easeOutCubic
                    : easeInOutCubic);

            } else {

                self.__scheduledLeft = self.__scrollLeft = left;
                self.__scheduledTop = self.__scrollTop = top;
                self.__scheduledZoom = self.__zoomLevel = zoom;

                // Push values out
                if (self.__callback) {
                    self.__callback (left, top, zoom);
                }

                // Fix max scroll ranges
                if (self.options.zooming) {
                    self.__computeScrollMax ();
                    if (self.__zoomComplete) {
                        self.__zoomComplete ();
                        self.__zoomComplete = null;
                    }
                }
            }
        },


        /**
         * Recomputes scroll minimum values based on client dimensions and content dimensions.
         */
        __computeScrollMax : function (zoomLevel) {

            var self = this;

            if (zoomLevel == null) {
                zoomLevel = self.__zoomLevel;
            }

            self.__maxScrollLeft = Math.max ((self.__contentWidth * zoomLevel) - self.__clientWidth, 0);
            self.__maxScrollTop = Math.max ((self.__contentHeight * zoomLevel) - self.__clientHeight, 0);

        },



        /*
         ---------------------------------------------------------------------------
         减速动画支持
         ---------------------------------------------------------------------------
         */

        /**
         * 开始减速。当手指离开触摸，并且速度足够，切换到减速模式。
         */
        __startDeceleration : function (timeStamp) {

            var self = this;

            if (self.options.paging) {
                // 分页模式

                var scrollLeft = Math.max (Math.min (self.__scrollLeft, self.__maxScrollLeft), 0);
                var scrollTop = Math.max (Math.min (self.__scrollTop, self.__maxScrollTop), 0);
                var clientWidth = self.__clientWidth;
                var clientHeight = self.__clientHeight;

                // We limit deceleration not to the min/max values of the allowed range, but to the size of the visible client area.
                // Each page should have exactly the size of the client area.
                // 设置横向最小减速位置、纵向最小减速位置
                // 设置横向最大减速位置、纵向最大减速位置
                self.__minDecelerationScrollLeft = Math.floor (scrollLeft / clientWidth) * clientWidth;
                self.__minDecelerationScrollTop = Math.floor (scrollTop / clientHeight) * clientHeight;
                self.__maxDecelerationScrollLeft = Math.ceil (scrollLeft / clientWidth) * clientWidth;
                self.__maxDecelerationScrollTop = Math.ceil (scrollTop / clientHeight) * clientHeight;

            } else {

                self.__minDecelerationScrollLeft = 0;
                self.__minDecelerationScrollTop = 0;
                self.__maxDecelerationScrollLeft = self.__maxScrollLeft;
                self.__maxDecelerationScrollTop = self.__maxScrollTop;

            }

            // Wrap class method
            var step = function (percent, now, render) {
                self.__stepThroughDeceleration (render);
            };

            // 最小保持减速速度
            var minVelocityToKeepDecelerating = self.options.snapping
                ? 4
                : 0.001;

            // 检测是否需要继续动画步骤，
            // 如果足够慢到用户无法察觉，停止所有减速
            var verify = function () {
                var shouldContinue = Math.abs (self.__decelerationVelocityX) >= minVelocityToKeepDecelerating || Math.abs (self.__decelerationVelocityY) >= minVelocityToKeepDecelerating;
                if (!shouldContinue) {
                    self.__didDecelerationComplete = true;
                }
                return shouldContinue;
            };
            // 完成
            var completed = function (renderedFramesPerSecond, animationId, wasFinished) {
                self.__isDecelerating = false;
                if (self.__didDecelerationComplete) {
                    // 减速完成
                    self.options.scrollingComplete ();
                }

                // 此处修复最终滚到的边界位置，如果snapping激活，那么移动到栅格的边界点
                self.scrollTo (self.__scrollLeft, self.__scrollTop, self.options.snapping);
            };

            // 开始减速动画，并且开启减速ing的标识
            self.__isDecelerating = core.effect.Animate.start (step, verify, completed);

        },


        /**
         * 减速动画的时时执行函数
         *
         * @param inMemory {Boolean?false} Whether to not render the current step, but keep it in memory only. Used internally only!
         */
        __stepThroughDeceleration : function (render) {

            var self = this;

            //
            // 计算下一个滚动的位置
            //

            // 根据当前减速速度，设置最新的减速位置
            var scrollLeft = self.__scrollLeft + self.__decelerationVelocityX;
            var scrollTop = self.__scrollTop + self.__decelerationVelocityY;


            //
            // 无bouncing的硬界限滚动位置
            //

            if (!self.options.bouncing) {
                // 设置修复后的纵、横滚动位置
                //      计算方式：1、先取最大减速位置和计算的目标位置中的最小值；
                //               2、再取其与最小减速位置的最大值，最终结果就是修复后的滚动目标位置。
                // 纵、横减速度均设置为0

                var
                    scrollLeftFixed = Math.max (Math.min (self.__maxDecelerationScrollLeft, scrollLeft), self.__minDecelerationScrollLeft)
                if (scrollLeftFixed !== scrollLeft) {
                    scrollLeft = scrollLeftFixed
                    self.__decelerationVelocityX = 0
                }

                var
                    scrollTopFixed = Math.max (Math.min (self.__maxDecelerationScrollTop, scrollTop), self.__minDecelerationScrollTop)
                if (scrollTopFixed !== scrollTop) {
                    scrollTop = scrollTopFixed
                    self.__decelerationVelocityY = 0
                }

            }


            //
            // 更新滚动位置
            //

            if (render) {

                self.__publish (scrollLeft, scrollTop, self.__zoomLevel);

            } else {
                // 设置横向、纵向滚动位置

                self.__scrollLeft = scrollLeft;
                self.__scrollTop = scrollTop;

            }


            //
            // 减速
            //

            // 迭代的过程中减速（不支持分页）
            if (!self.options.paging) {

                // 阻力因子（模拟自然滑动减速）
                var frictionFactor = 0.95;

                self.__decelerationVelocityX *= frictionFactor;
                self.__decelerationVelocityY *= frictionFactor;

            }


            //
            // 支持bouncing
            //

            if (self.options.bouncing) {

                // 横向、纵向超出值
                var scrollOutsideX = 0;
                var scrollOutsideY = 0;

                // This configures the amount of change applied to deceleration/acceleration when reaching boundaries
                var penetrationDeceleration = self.options.penetrationDeceleration;
                var penetrationAcceleration = self.options.penetrationAcceleration;

                // Check limits
                if (scrollLeft < self.__minDecelerationScrollLeft) {
                    scrollOutsideX = self.__minDecelerationScrollLeft - scrollLeft;
                } else if (scrollLeft > self.__maxDecelerationScrollLeft) {
                    scrollOutsideX = self.__maxDecelerationScrollLeft - scrollLeft;
                }

                if (scrollTop < self.__minDecelerationScrollTop) {
                    scrollOutsideY = self.__minDecelerationScrollTop - scrollTop;
                } else if (scrollTop > self.__maxDecelerationScrollTop) {
                    scrollOutsideY = self.__maxDecelerationScrollTop - scrollTop;
                }

                // Slow down until slow enough, then flip back to snap position
                if (scrollOutsideX !== 0) {
                    if (scrollOutsideX * self.__decelerationVelocityX <= 0) {
                        self.__decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
                    } else {
                        self.__decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
                    }
                }

                if (scrollOutsideY !== 0) {
                    if (scrollOutsideY * self.__decelerationVelocityY <= 0) {
                        self.__decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
                    } else {
                        self.__decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
                    }
                }
            }
        }
    }

    // 将members变量值添加到原型链prototype
    for (var key in members) {
        Scroll.prototype[ key ] = members[ key ]
    }

} ()


