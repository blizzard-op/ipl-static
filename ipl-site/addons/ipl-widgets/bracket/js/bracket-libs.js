
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  this.Class = function(){};
  
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    for (var name in prop) {
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super[name];

            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    function Class() {
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    Class.prototype = prototype;
    Class.prototype.constructor = Class;
    Class.extend = arguments.callee;
    
    return Class;
  };
})();


(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);

function Matrix(){}var Sylvester={version:"0.1.3",precision:1e-6};Matrix.prototype={e:function(a,b){return a<1||a>this.elements.length||b<1||b>this.elements[0].length?null:this.elements[a-1][b-1]},map:function(a){var b=[],c=this.elements.length,d=c,e,f,g=this.elements[0].length,h;do{e=d-c,f=g,b[e]=[];do h=g-f,b[e][h]=a(this.elements[e][h],e+1,h+1);while(--f)}while(--c);return Matrix.create(b)},multiply:function(a){if(!a.elements)return this.map(function(b){return b*a});var b=a.modulus?!0:!1,c=a.elements||a;typeof c[0][0]=="undefined"&&(c=Matrix.create(c).elements);if(!this.canMultiplyFromLeft(c))return null;var d=this.elements.length,e=d,f,g,h=c[0].length,i,j=this.elements[0].length,k=[],l,m,n;do{f=e-d,k[f]=[],g=h;do{i=h-g,l=0,m=j;do n=j-m,l+=this.elements[f][n]*c[n][i];while(--m);k[f][i]=l}while(--g)}while(--d);var c=Matrix.create(k);return b?c.col(1):c},x:function(a){return this.multiply(a)},canMultiplyFromLeft:function(a){var b=a.elements||a;return typeof b[0][0]=="undefined"&&(b=Matrix.create(b).elements),this.elements[0].length==b.length},setElements:function(a){var b,c=a.elements||a;if(typeof c[0][0]!="undefined"){var d=c.length,e=d,f,g,h;this.elements=[];do{b=e-d,f=c[b].length,g=f,this.elements[b]=[];do h=g-f,this.elements[b][h]=c[b][h];while(--f)}while(--d);return this}var i=c.length,j=i;this.elements=[];do b=j-i,this.elements.push([c[b]]);while(--i);return this}},Matrix.create=function(a){var b=new Matrix;return b.setElements(a)},$M=Matrix.create,function(a){if(!a.cssHooks)throw"jQuery 1.4.3+ is needed for this plugin to work";var b="transform",c,d,e,f,g,h=b.charAt(0).toUpperCase()+b.slice(1),i=["Moz","Webkit","O","MS"],j=document.createElement("div");if(b in j.style)d=b,e=j.style.perspective!==undefined;else for(var k=0;k<i.length;k++){c=i[k]+h;if(c in j.style){d=c,i[k]+"Perspective"in j.style?e=!0:f=!0;break}}d||(g="filter"in j.style,d="filter"),j=null,a.support[b]=d;var l=d,m={rotateX:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,Math.cos(a),Math.sin(-a),0],[0,Math.sin(a),Math.cos(a),0],[0,0,0,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}},rotateY:{defaultValue:0,matrix:function(a){return e?$M([[Math.cos(a),0,Math.sin(a),0],[0,1,0,0],[Math.sin(-a),0,Math.cos(a),0],[0,0,0,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}},rotateZ:{defaultValue:0,matrix:function(a){return e?$M([[Math.cos(a),Math.sin(-a),0,0],[Math.sin(a),Math.cos(a),0,0],[0,0,1,0],[0,0,0,1]]):$M([[Math.cos(a),Math.sin(-a),0],[Math.sin(a),Math.cos(a),0],[0,0,1]])}},scale:{defaultValue:1,matrix:function(a){return e?$M([[a,0,0,0],[0,a,0,0],[0,0,a,0],[0,0,0,1]]):$M([[a,0,0],[0,a,0],[0,0,1]])}},translateX:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[a,0,0,1]]):$M([[1,0,0],[0,1,0],[a,0,1]])}},translateY:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,a,0,1]]):$M([[1,0,0],[0,1,0],[0,a,1]])}},translateZ:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,a,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}}},n=function(b){var c=a(b).data("transforms"),d;e?d=$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]):d=$M([[1,0,0],[0,1,0],[0,0,1]]);for(var h in m)d=d.x(m[h].matrix(c[h]||m[h].defaultValue));e?(s="matrix3d(",s+=d.e(1,1).toFixed(10)+","+d.e(1,2).toFixed(10)+","+d.e(1,3).toFixed(10)+","+d.e(1,4).toFixed(10)+",",s+=d.e(2,1).toFixed(10)+","+d.e(2,2).toFixed(10)+","+d.e(2,3).toFixed(10)+","+d.e(2,4).toFixed(10)+",",s+=d.e(3,1).toFixed(10)+","+d.e(3,2).toFixed(10)+","+d.e(3,3).toFixed(10)+","+d.e(3,4).toFixed(10)+",",s+=d.e(4,1).toFixed(10)+","+d.e(4,2).toFixed(10)+","+d.e(4,3).toFixed(10)+","+d.e(4,4).toFixed(10),s+=")"):f?(s="matrix(",s+=d.e(1,1).toFixed(10)+","+d.e(1,2).toFixed(10)+",",s+=d.e(2,1).toFixed(10)+","+d.e(2,2).toFixed(10)+",",s+=d.e(3,1).toFixed(10)+"px,"+d.e(3,2).toFixed(10)+"px",s+=")"):g&&(s="progid:DXImageTransform.Microsoft.",s+="Matrix(",s+="M11="+d.e(1,1).toFixed(10)+",",s+="M12="+d.e(1,2).toFixed(10)+",",s+="M21="+d.e(2,1).toFixed(10)+",",s+="M22="+d.e(2,2).toFixed(10)+",",s+="SizingMethod='auto expand'",s+=")",b.style.top=d.e(3,1),b.style.left=d.e(3,2)),b.style[l]=s},o=function(b){return a.fx.step[b]=function(c){a.cssHooks[b].set(c.elem,c.now+c.unit)},{get:function(c,d,e){var f=a(c).data("transforms");return f===undefined&&(f={},a(c).data("transforms",f)),f[b]||m[b].defaultValue},set:function(c,d){var e=a(c).data("transforms");e===undefined&&(e={});var f=m[b];typeof f.apply=="function"?e[b]=f.apply(e[b]||f.defaultValue,d):e[b]=d,a(c).data("transforms",e),n(c)}}};if(l)for(var p in m)a.cssHooks[p]=o(p),a.cssNumber[p]=!0}(jQuery)
