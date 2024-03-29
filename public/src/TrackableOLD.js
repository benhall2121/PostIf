﻿//-----------------------------------------------------------------------------------------------------------------------------------------
//
//        class : TrackableObject
//
// parent class : none
// last updated : 02/23/2011
//       author : Yubo Dong
//        email : jswidget@gmail.com
//
// Copyright @2011. All rights reserved.
//
//-----------------------------------------------------------------------------------------------------------------------------------------

/**
 *
 * Super class for all trackable object. The OO hirarchy is:
 *
 * TrackableObject
 *       |
 *       +---- PencilObject
 *       |
 *       +---- RectangularObject
 *       |          |
 *       |          +---- LineObject
 *       |          |
 *       |          +---- RectangleObject
 *       |          |
 *       |          +---- OvalObject
 *       +---- PolylineShape
 *                  |
 *                  +---- PolylineObject
 *                  |
 *                  +---- PolygonObject
 *
 *********************************************************************************/

function TrackableObject(paintApp,sType){
   
   //
   // Shape that will be tracked
   //
   this.shape = new G_Shape(); 
   
   //
   // To seperate the trackable object with others
   //
   this.ObjectType = "trackable object";
   
   //
   // If the shape being tracked is changed, this flag will be set to true
   //
   this.dirty = false;
   
   //
   // Tracking the drawing status
   //
   this.status = "ready";

   this.mouseDown        = function(event,x,y){};
   this.mouseMove        = function(event,x,y){};
   this.mouseUp          = function(event,x,y){};
   this.dblclick         = function(event,x,y){};
   this.onStart          = null;
   this.onCompleted      = null;
   this.onDone           = null;
   
   this.onStartTransform = null;
   this.onTransforming   = null;
   this.onAfterTransform = null;
   this.onHelp           = null;
   
   return this;
}

TrackableObject.prototype.init = function(paintApp,sType,helpMsg){
   
   this.type             = sType; //shape, tool, selection
   
   this.setCanvas(paintApp);
   this.reset();
   
   this.helpMsg = helpMsg || ("Click and drag to draw " + this.shape.type.toLowerCase() + ".");
   this.help(this.helpMsg);
   
   return this;
};

/**
 * paintApp is instance of class iPaintApp 
 */
TrackableObject.prototype.deleteShape = function(){   
   this.cut(true);
};

TrackableObject.prototype.setCanvas = function(paintApp){
   this.paintApp = paintApp;
   
   this.myContext = {
                       context       : paintApp.context_draft,
                       outline       : paintApp.outline(),
                       fill          : paintApp.fillMode(),
                       lineTreatment : paintApp.PaintingAttribute.LineWidthTreatment
                    };
   return this;
};

TrackableObject.prototype.reset = function(){
   this.shape.reset();
   this.dirty = false;
   this.status = "ready";
   return this;
};

TrackableObject.prototype.isDirty = function(){
   return this.dirty;
};

TrackableObject.prototype.start = function(){
   this.reset();
   this.status = "start";
   if ( typeof (this.onStart) === "function" ){
      this.onStart(this);
   }
   return this;
};

TrackableObject.prototype.started = function(){
   return (this.status === "start" ||
           this.status === "drawing" ) ;
};

TrackableObject.prototype.complete = function(){
   this.status = "complete";
   this.help(this.helpMsg);
   if ( typeof (this.onCompleted) === "function" ){
      this.onCompleted(this);
   }
   return this;
};

TrackableObject.prototype.completed = function(){
   return (this.status === "complete") ;
};

TrackableObject.prototype.done = function(){
   if ( this.dirty ){
      this.status = "ready";
      this.dirty = false;
      
      //
      // Move shape from temp canvas to final canvas
      //
      this.paintApp.context.drawImage(document.getElementById(this.paintApp.getID("canvas_temp")), 0, 0);
      this.paintApp.context_draft.clearRect(0, 0, this.paintApp.width, this.paintApp.height);	
      this.hideFocusRing();
      
      if ( this.paintApp.fnActionComplete ){
         this.paintApp.fnActionComplete(this);
         this.paintApp.canvas_history.add(this.shape.getType(),this.shape.toString());
      }

      if ( typeof (this.onDone) === "function" ){
         this.onDone(this);
      }
   }
   return this;
};

TrackableObject.prototype.cut = function(isDelete){
   this.status = "ready";
   
   if(!isDelete && null != this.shape && this.type.toLowerCase() == "shape") {
      this.copy();
   }
   
   this.paintApp.context_draft.clearRect(0, 0, this.paintApp.width, this.paintApp.height);	
   this.hideFocusRing();
   this.reset();
};

TrackableObject.prototype.copy = function(){
   if(null != this.shape && this.type.toLowerCase() == "shape") {
      var canvas = document.createElement("canvas");
      var easing = this.paintApp.context.lineWidth;
      canvas.width = this.shape.width() + (easing*2);
      canvas.height= this.shape.height() + (easing*2);
      
      var imData = this.paintApp.context_draft.getImageData(this.shape.minX-easing,this.shape.minY-easing,this.shape.maxX+easing,this.shape.maxY+easing);
      canvas.getContext("2d").putImageData(imData,0,0);
      this.paintApp.clipboard = canvas;
      $(".tool_paste").removeClass("disabled");
   }
};

TrackableObject.prototype.getShape = function(){
   return this.shape;
};

TrackableObject.prototype.draw = function(){
   if ( this.type === "shape" ){
      this.myContext.context.clearRect(0,0,this.paintApp.width,this.paintApp.height);
      this.shape.draw(this.myContext);
      this.dirty = true;
   }
   return this;
};

TrackableObject.prototype.help = function(msg,shape){
   if ( typeof(this.onHelp) === "function" ){
      if ( shape ){
         this.onHelp(shape + ": " + msg);
      }else{
         this.onHelp(this.shape.type + ": " + msg);
      }
   }
};

TrackableObject.prototype.transform = function(fnStartTransform, fnTransforming,fnAfterTransform){
   this.onTransforming   = fnTransforming;
   this.onAfterTransform = fnAfterTransform;
   this.onStartTransform = fnStartTransform;
   this.showFocusRing(null);
};

TrackableObject.prototype.makeStraightLine = function(x1,y1,x2,y2){
   var dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
   if ( dx > dy ){
      if ( dy  > ( dx / 2 ) ){
         if ( y2 < y1 ){
            y2 = y1 - dx; 
         }else{
            y2 = y1 + dx; 
         }
      }else{
         y2 = y1;
      }
   }else{
      if ( dx < ( dy / 2 ) ){
         x2 = x1;
      }else{
         if ( x2 < x1 ){
            x2 = x1 - dy;
         }else{
            x2 = x1 + dy;
         }
      }
   }
   return {x:x2,y:y2};
};

TrackableObject.prototype.makeSquare = function(x1,y1,x2,y2){
   var dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
   var len = Math.max(dx,dy);
   x2 = (x2 < x1) ? (x1 - len) : (x1 + len);
   y2 = (y2 < y1) ? (y1 - len) : (y1 + len);
   return {x:x2,y:y2};
};

TrackableObject.prototype.clearBoundingBox = function(){
   this.paintApp.context_draft1.clearRect(0,0,this.paintApp.width,this.paintApp.height);
};

TrackableObject.prototype.showBoundingBox = function(){
   this.paintApp.context_draft1.save();
   this.paintApp.context_draft1.lineWidth = 1;
   this.paintApp.context_draft1.strokeStyle = "rgba(26,106,171,1)";
   this.paintApp.context_draft1.beginPath();
   var v = 0.5, pattern=[3,4];
   
   dashedLine(this.paintApp.context_draft1,
              this.shape.minX + v,this.shape.minY + v,
              this.shape.maxX + v,this.shape.minY + v,pattern);
   dashedLine(this.paintApp.context_draft1,
              this.shape.maxX + v,this.shape.minY + v,
              this.shape.maxX + v,this.shape.maxY + v,pattern);
   dashedLine(this.paintApp.context_draft1,
              this.shape.maxX + v,this.shape.maxY + v,
              this.shape.minX + v,this.shape.maxY + v,pattern);
   dashedLine(this.paintApp.context_draft1,
              this.shape.minX + v,this.shape.maxY + v,
              this.shape.minX + v,this.shape.minY + v,pattern);
   this.paintApp.context_draft1.stroke();
   this.paintApp.context_draft1.restore();
};

TrackableObject.prototype.hideFocusRing = function(oObject,drag_box){
   $("#focus_ring, .focus_ring_drag_box").css({visibility: "hidden"});
};

TrackableObject.prototype.showFocusRing = function(drag_box){
   var shape = this.shape;
   
   $("#focus_ring").css("z-index", "3");
   $(".focus_ring_drag_box").css("z-index", "3");
   
   if ( drag_box === "highlight" ){    
      $("#focus_ring").css({
         left   : shape.minX + "px",
         top    : shape.minY + "px",
         width  : (shape.maxX - shape.minX) + "px",
         height : (shape.maxY - shape.minY) + "px",
         visibility:"visible"
      });
      Drag.detach(document.getElementById("focus_ring"));
      return;
   }
   
   if ( drag_box !== "focus_ring" ){
      $("#focus_ring").css({
         left   : shape.minX + "px",
         top    : shape.minY + "px",
         width  : (shape.maxX - shape.minX) + "px",
         height : (shape.maxY - shape.minY) + "px",
         visibility:"visible"
      });

      this.attachFocusRingEvents(document.getElementById("focus_ring"), -this.shape.width(), this.paintApp.width, -this.shape.height(), this.paintApp.height,"0000");
   }
   
   var m_w =  shape.minX + shape.width()/2 - 2,
       m_h =  shape.minY + shape.height()/2 - 2;

   if ( drag_box !== "drag_tl" ){
      $("#drag_tl").css({visibility:"visible",left: shape.minX-2 + "px",top : shape.minY-2 + "px", cursor:"nw-resize"});
      this.attachFocusRingEvents(document.getElementById("drag_tl"),
                                 0, shape.maxX-6, 
                                 0, shape.maxY-6, "1010");
   }
   if ( drag_box !== "drag_tm" ){
      $("#drag_tm").css({visibility:"visible",left: m_w - 2 + "px",top : shape.minY-2 + "px", cursor:"n-resize"});
      this.attachFocusRingEvents(document.getElementById("drag_tm"),
                                 m_w , m_w,
                                 0, shape.maxY-6, "0010");
   }
   if ( drag_box !== "drag_tr" ){
      $("#drag_tr").css({visibility:"visible",left: shape.maxX-2 + "px",top : shape.minY-2 + "px", cursor:"ne-resize"});
      this.attachFocusRingEvents(document.getElementById("drag_tr"),
                                 shape.minX+6, this.paintApp.width,
                                 0, shape.maxY-6, "0110");
   }

   if ( drag_box !== "drag_lm" ){
      $("#drag_lm").css({visibility:"visible",left: shape.minX-2 + "px",top : m_h - 2 + "px", cursor:"w-resize"});
      this.attachFocusRingEvents(document.getElementById("drag_lm"),
                                 0, shape.maxX-6,
                                 m_h , m_h, "1000");
   }
   if ( drag_box !== "drag_rm" ){
      $("#drag_rm").css({visibility:"visible",left: shape.maxX-2 + "px",top : m_h - 2 + "px", cursor:"e-resize"});
      this.attachFocusRingEvents(document.getElementById("drag_rm"),
                                 shape.minX+6, this.paintApp.width,
                                 m_h, m_h, "0100");
   }
   if ( drag_box !== "drag_bl" ){
      $("#drag_bl").css({visibility:"visible",left: shape.minX-2 + "px",top : shape.maxY-2 + "px", cursor:"sw-resize"});
      this.attachFocusRingEvents(document.getElementById("drag_bl"),
                                 0, shape.maxX-6,
                                 shape.minY+6, this.paintApp.height, "1001");
   }
   if ( drag_box !== "drag_bm" ){
      $("#drag_bm").css({visibility:"visible",left: m_w - 2 + "px",top : shape.maxY-2 + "px", cursor:"s-resize"});
      this.attachFocusRingEvents(document.getElementById("drag_bm"),
                                 m_w, m_w,
                                 shape.minY+6, this.paintApp.height, "0001");
   }
   if ( drag_box !== "drag_br" ){
      $("#drag_br").css({visibility:"visible",left: shape.maxX-2 + "px",top : shape.maxY-2 + "px", cursor:"se-resize"});
      this.attachFocusRingEvents(document.getElementById("drag_br"),
                                 shape.minX+6, this.paintApp.width,
                                 shape.minY+6, this.paintApp.height, "0101");
   }
};

TrackableObject.prototype.attachFocusRingEvents = function(e,xmin,xmax,ymin,ymax,change_mask){
   var _this = this;
   
   $(e).unbind("dblclick");
   $(e).bind("dblclick", function(e) {
      _this.dblclick(e);
   });
   
   $(e).unbind("click");
   $(e).bind("click", function() {
      
      if ( $("#text_input").css("visibility") == "visible" ) {
         $("#text_input").focus();
         enableSelection();
      }
      
   });
   
   Drag.init(e,null,xmin,xmax,ymin,ymax);
   
   e.onDragStart = function(evt,x,y){
      this.dragStart = {x:x,y:y};
      if ( typeof(_this.onStartTransform) === "function" ){
         _this.onStartTransform(evt,_this.shape);
      }
   };
   e.onDragEnd = function(evt,x,y){
      if ( typeof(_this.onAfterTransform) === "function" ){
         _this.onAfterTransform(evt,_this.shape);
      }
   };
   e.onDrag = function(evt,nx,ny){
      
      nx += 2; ny += 2;
      
      _this.paintApp.trackingRuler(nx,ny);
      
      var h_ratio = 1, v_ratio = 1;   
      var dx = 0, dy = 0;   
      switch(change_mask){
      case "1010": 
         var newW = _this.shape.maxX - nx,
             newH = _this.shape.maxY - ny;
         var h_ratio = newW / _this.shape.width(),
             v_ratio = newH / _this.shape.height();
         h_ratio = -h_ratio; v_ratio = -v_ratio; 
         break;
      case "0110": 
         var newW = nx - _this.shape.minX,
             newH = _this.shape.maxY - ny;
         var h_ratio = newW / _this.shape.width(),
             v_ratio = newH / _this.shape.height();
         h_ratio =  h_ratio; v_ratio = -v_ratio; break;
      case "1001": 
         var newW = _this.shape.maxX - nx,
             newH = ny - _this.shape.minY;
         var h_ratio = newW / _this.shape.width(),
             v_ratio = newH / _this.shape.height();
         h_ratio = -h_ratio; v_ratio =  v_ratio; break;
      case "0101": 
         var newW = nx - _this.shape.minX,
             newH = ny - _this.shape.minY;
         var h_ratio = newW / _this.shape.width(),
             v_ratio = newH / _this.shape.height();
         h_ratio =  h_ratio; v_ratio =  v_ratio; break;
      case "0010": 
         var newH = _this.shape.maxY - ny;
         var v_ratio = newH / _this.shape.height();
         h_ratio = 1;        v_ratio = -v_ratio; break;
      case "0001": 
         var newH = ny - _this.shape.minY;
         var v_ratio = newH / _this.shape.height();
         h_ratio = 1;        v_ratio =  v_ratio; break;
      case "1000": 
         var newW = _this.shape.maxX - nx;
         var h_ratio = newW / _this.shape.width();
         h_ratio = -h_ratio; v_ratio = 1; break;
      case "0100": 
         var newW = nx - _this.shape.minX;
         var h_ratio = newW / _this.shape.width();
         h_ratio =  h_ratio; v_ratio = 1; break;
      case "0000": 
         dx = nx - this.dragStart.x - 2;
         dy = ny - this.dragStart.y - 2; 
         this.dragStart = {x:nx-2,y:ny-2};
         break;
      }
      _this.myContext.context.clearRect(0,0,_this.paintApp.width,_this.paintApp.height);
      
      _this.shape
      .scale(h_ratio,v_ratio)
      .move(dx,dy)
      .draw(_this.myContext);
      
      if ( typeof(_this.onTransforming) === "function" ){
         _this.onTransforming(evt,_this.shape);
      }
      _this.showFocusRing(this.id);
   };
};



/**
 *
 * Super class for all drawing object that can be defined within a rectanglular shape.
 * 
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *
 *********************************************************************************/

EXTEND(RectangularObject,TrackableObject);

function RectangularObject(){}

RectangularObject.prototype.mouseDown = function(event,x,y){
   this.start();
   this.shape.addNode(x,y);
};

RectangularObject.prototype.mouseMove = function(event,x,y){
   if ( this.started() ){
      if ( !event.shiftKey ){
         this.shape.setNode(1,new G_Point(x,y));
      }else{
         var fn = this.shape.firstNode();
         var x1 = fn.x, y1 = fn.y;
             
         var node;
         if ( this.shape.getType() === "Line" ){
            node = this.makeStraightLine(x1,y1,x,y);
         }else{
            node = this.makeSquare(x1,y1,x,y);
         }
         this.shape.setNode(1,new G_Point(node.x,node.y));
      }
      this.draw();
   }
};

RectangularObject.prototype.mouseUp = function(event,x,y){
   if ( this.started() ){
      this.complete();
      
      //
      // Some shapes are genereated based on specify the rectangle, such as
      // right polygons, stars etc. Thos shape will have a function called
      // transform() to transform a rectangle into the real shape.
      //
      if ( typeof(this.shape.transform) === "function" ){
         this.shape = this.shape.transform();
      }
      
      if ( this.dirty ){
         this.transform();
      }
   }
};

/**
 *
 * Line object
 *
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *                  |
 *                  +---- LineObject
 *
 *********************************************************************************/
EXTEND(LineObject,RectangularObject);

function LineObject(){}

LineObject.prototype.init = function(canvas){
   this.shape = new G_Line();
   this.parent.init.call(this,canvas,"shape","Click and drag to draw line. Press SHIFT key to draw horizontal, vertical or diagnoal line.");
   return this;
};
LineObject.prototype.deserialize = function(s){
   this.shape = new G_Line().deserialize(s);
   return this;
};
/**
 *
 * Rectangle object
 *
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *                  |
 *                  +---- RectangleObject
 *
 *********************************************************************************/

EXTEND(RectangleObject,RectangularObject);
function RectangleObject(){}
RectangleObject.prototype.init = function(canvas){
   this.shape = new G_Rectangle();
   this.parent.init.call(this,canvas,"shape","Click and drag to draw rectangle. Press SHIFT key to draw square.");
   return this;
};
RectangleObject.prototype.deserialize = function(s){
   this.shape = new G_Rectangle().deserialize(s);
   return this;
};

/**
 *
 * RoundedRectangleObject object
 *
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *                  |
 *                  +---- RoundedRectangleObject
 *
 *********************************************************************************/

EXTEND(RoundedRectangleObject,RectangularObject);
function RoundedRectangleObject(){}
RoundedRectangleObject.prototype.init = function(canvas){
   this.shape = new G_RoundedRectangle();
   this.parent.init.call(this,canvas,"shape","Click and drag to draw rounded rectangle. Press SHIFT key to draw rounded square.");
   return this;
};
RoundedRectangleObject.prototype.deserialize = function(s){
   this.shape = new G_RoundedRectangle().deserialize(s);
   return this;
};

/**
 *
 * RoundedRectangularCalloutObject object
 *
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *                  |
 *                  +---- RoundedRectangleObject
 *
 *********************************************************************************/

EXTEND(RoundedRectangularCalloutObject,RectangularObject);
function RoundedRectangularCalloutObject(){}
RoundedRectangularCalloutObject.prototype.init = function(canvas){
   this.shape = new RoundedRectangularCallout();
   this.parent.init.call(this,canvas,"shape");
   return this;
};
RoundedRectangularCalloutObject.prototype.deserialize = function(s){
   this.shape = new RoundedRectangularCallout().deserialize(s);
   return this;
};


/**
 *
 * Oval object
 *
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *                  |
 *                  +---- OvalObject
 *
 *********************************************************************************/

EXTEND(OvalObject,RectangularObject);
function OvalObject(){}
OvalObject.prototype.init = function(canvas){
   this.shape = new G_Oval();
   this.parent.init.call(this,canvas,"shape","Click and drag to draw oval. Press SHIFT key to draw circle.");
   return this;
};
OvalObject.prototype.deserialize = function(s){
   this.shape = new G_Oval().deserialize(s);
   return this;
};

/**
 *
 * Heart object
 *
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *                  |
 *                  +---- HeartObject
 *
 *********************************************************************************/

EXTEND(HeartObject,RectangularObject);
function HeartObject(){}
HeartObject.prototype.init = function(canvas){
   this.shape = new G_Heart();
   this.parent.init.call(this,canvas,"shape");
   return this;
};
HeartObject.prototype.deserialize = function(s){
   this.shape = new G_Heart().deserialize(s);
   return this;
};

/**
 *
 * MultipointStarObject object such as 5-point star etc
 *
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *                  |
 *                  +---- MultipointStarObject
 *
 *********************************************************************************/

EXTEND(MultipointStarObject,RectangularObject);
function MultipointStarObject(n){
   //
   // Define number of vertices, n should always >= 3
   //
   this.vertices = n; 
}
MultipointStarObject.prototype.init = function(canvas){
   this.shape = new G_MultipointStar(this.vertices);
   this.parent.init.call(this,canvas,"shape");
   return this;
};
MultipointStarObject.prototype.deserialize = function(s){
   this.shape = new G_MultipointStar(this.vertices).deserialize(s);
   return this;
};

/**
 *
 * RightPolygonObject object such as diamond, hexgon, pentagon etc.
 *
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *                  |
 *                  +---- RightPolygonObject
 *
 *********************************************************************************/

EXTEND(RightPolygonObject,RectangularObject);
function RightPolygonObject(n){
   //
   // Define number of vertices, n should always >= 3
   //
   this.vertices = n;
}

RightPolygonObject.prototype.init = function(canvas){
   this.shape = new G_RightPolygon(this.vertices);
   this.parent.init.call(this,canvas,"shape");
   return this;
};
RightPolygonObject.prototype.deserialize = function(s){
   this.shape = new G_RightPolygon(this.vertices).deserialize(s);
   return this;
};


/**
 *
 * ArrowObject object
 *
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *                  |
 *                  +---- ArrowObject
 *
 *********************************************************************************/

EXTEND(ArrowObject,RectangularObject);
function ArrowObject(sType){
   this.ArrowType = sType;
}

ArrowObject.prototype.init = function(canvas){
   this.shape = new G_Arrow(this.ArrowType);
   this.parent.init.call(this,canvas,"shape");
   return this;
};
ArrowObject.prototype.deserialize = function(s){
   this.shape = new G_Arrow(this.ArrowType).deserialize(s);
   return this;
};


/**
 * BezierCurveObject required 4 nodes to define:
 * start node, end code and two control nodes.
 * To draw a Bezier curve, we first draw a line and then use the two control nodes
 * to curve the line.
 */

EXTEND(BezierCurveObject,TrackableObject);

function BezierCurveObject(){
   this.nodeIndex = 0;
}

BezierCurveObject.prototype.init = function(canvas){
   this.shape = new G_Curve();
   this.parent.init.call(this,canvas,"shape","Click and drag to draw the base line, then click and drag two times to curve the line.");
   
   return this;
};

BezierCurveObject.prototype.mouseDown = function(event,x,y){
   if ( !this.started() ){
      this.start();
      this.nodeIndex = 1; // Counting the node number
      this.shape.reset().addNode(new G_Point(x,y));
      this.help("Start dragging to draw the base line.");
   }  
   
   this._drawingStatus = this.nodeIndex;
};

BezierCurveObject.prototype.mouseMove = function(event,x,y){
   if ( this.started() ){
      if ( event.shiftKey &&  this.nodeIndex === 1 ){
         var fn = this.shape.firstNode();
         var x1 = fn.x, y1 = fn.y;

         var node = this.makeStraightLine(x1,y1,x,y);
         x = node.x; y = node.y;
      }
      this.shape.setNode(this.nodeIndex,new G_Point(x,y));
      if ( this._drawingStatus === this.nodeIndex ){
         this.draw();
      }
   }
};

BezierCurveObject.prototype.mouseUp = function(event,x,y){
   if ( this.started() ){
      if ( this.nodeIndex === 3 ){
         this.complete();
         this.help("Click and drag to draw the base line, then click and drag two times to curve the line.");
         if ( typeof(this.shape.transform) === "function" ){
            this.shape = this.shape.transform();
         }
         if ( this.dirty ){
            this.transform();
         }
      }else{
         if ( this.nodeIndex === 1){
            this.help("Click and drag to curve the line");
         }
         if ( this.nodeIndex === 2){
            this.help("Click and drag to curve the line second time.");
         }
         this.nodeIndex ++;
      }
   }
};
BezierCurveObject.prototype.deserialize = function(s){
   this.shape = new G_Curve().deserialize(s);
   return this;
};



/**
 *
 * Super class for all non-regular object that needs more than 2 nodes, such as polyline, polygon etc.
 * 
 * TrackableObject
 *       |
 *       +---- PolylineShape
 *
 *********************************************************************************/

EXTEND(PolylineShape,TrackableObject);
function PolylineShape(){}

PolylineShape.prototype.mouseMove = function(event,x,y){
   if ( this.started() ){
      if ( event.shiftKey ){
         var node = this.shape.lastNode();
         var x2 = x, y2 = y;
         var oNode = this.makeStraightLine(node.x,node.y,x2,y2);
         x = oNode.x; y = oNode.y;
      }
      this.rubberLine(x,y);
   }
};

PolylineShape.prototype.mouseUp = function(event,x,y){
   if ( !this.started() ){
      this.start();
      this.shape.addNode(new G_Point(x,y));
      this.help("Click to add second vertex. Double click to finish " + this.shape.type );
   }else{
      this.status = "drawing";
      
      if ( event.shiftKey ){
         var node = this.shape.lastNode();
         var x2 = x, y2 = y;
         var oNode = this.makeStraightLine(node.x,node.y,x2,y2);
         x = oNode.x; y = oNode.y;
      }
      this.shape.addNode(new G_Point(x,y));
      
      var count = this.shape.nodesCount();
      if ( count === 2 ){
         this.help("Click to add third vertex. Double click to finish " + this.shape.type );
      }else{
         this.help("Click to add " + (this.shape.nodesCount()+1) + "th vertex. Double click to finish " + this.shape.type);
      }
      
      if ( count >= 2 ){
         this.dirty = true;
      }
   }
};


PolylineShape.prototype.done = function(){
   if ( this.completed() ){
      if ( this.dirty ){
         this.dirty = false;
         this.status = "complete";

         this.paintApp.context.drawImage(document.getElementById(this.paintApp.getID("canvas_temp")), 0, 0);
         this.paintApp.context_draft.clearRect(0, 0, this.paintApp.width, this.paintApp.height);	
         
         if ( this.paintApp.fnActionComplete ){
            this.paintApp.fnActionComplete(this);
            this.paintApp.canvas_history.add(this.shape.getType(),this.shape.toString());
         }
         this.hideFocusRing();
         
         if ( typeof (this.onDone) === "function" ){
            this.onDone(this);
         }
      }
   }
   return this;
};

PolylineShape.prototype.dblclick = function(event,x,y){
   this.myContext.context.clearRect(0, 0, this.paintApp.width, this.paintApp.height);

   this.shape.draw(this.myContext);
   
   this.complete();

   this.help("Click to add the first vertex");
   
   if ( this.dirty ){
      this.transform();
   }
};

PolylineShape.prototype.rubberLine = function(x2,y2){
   this.myContext.context.clearRect(0, 0, this.paintApp.width, this.paintApp.height);
   this.myContext.context.beginPath();
   
   var cnt = this.shape.nodesCount();
   
   var node = this.shape.getNode(0);   
   this.myContext.context.moveTo(node.x + this.myContext.lineTreatment, node.y + this.myContext.lineTreatment);
   var i;
   for ( i = 1; i < cnt; i ++ ){
      node = this.shape.getNode(i);
      this.myContext.context.lineTo(node.x + this.myContext.lineTreatment, node.y + this.myContext.lineTreatment);
   }
   this.myContext.context.lineTo(x2 + this.myContext.lineTreatment, y2 + this.myContext.lineTreatment);
};

/**
 *
 * PolylineObject object
 * 
 * TrackableObject
 *       |
 *       +---- PolylineShape
 *                   |
 *                   +---- PolylineObject
 *
 *********************************************************************************/

EXTEND(PolylineObject,PolylineShape);
function PolylineObject(){}

PolylineObject.prototype.init = function(canvas){
   this.shape = new G_Polyline();
   this.parent.init.call(this,canvas,"shape");
   this.help("Click to add the first vertex");
   return this;
};

PolylineObject.prototype.rubberLine = function(x2,y2){
   this.parent.rubberLine.call(this,x2,y2);
   if ( this.paintApp.outline() === "solid" ){
      this.myContext.context.stroke();
   }
};

PolylineObject.prototype.deserialize = function(s){
   this.shape = new G_Polyline().deserialize(s);
   return this;
};

/**
 *
 * PolylineObject object
 * 
 * TrackableObject
 *       |
 *       +---- PolylineShape
 *                   |
 *                   +---- PolygonObject
 *
 *********************************************************************************/

EXTEND(PolygonObject,PolylineShape);
function PolygonObject(){}

PolygonObject.prototype.init = function(canvas){
   this.shape = new G_Polygon();
   this.parent.init.call(this,canvas,"shape");
   this.help("Click to add the first vertex");
   return this;
};

PolygonObject.prototype.rubberLine = function(x2,y2){
   this.parent.rubberLine.call(this,x2,y2);
   if ( this.paintApp.fillMode() === "solid" ){
      this.myContext.context.fill();
   }
   if ( this.paintApp.outline() === "solid" ){
      this.myContext.context.stroke();
   }
};

PolygonObject.prototype.deserialize = function(s){
   this.shape = new G_Polygon().deserialize(s);
   return this;
};

/**
 *
 * CardinalSplineObject object
 * 
 * TrackableObject
 *       |
 *       +---- PolylineShape
 *                   |
 *                   +---- CardinalSplineObject
 *
 *********************************************************************************/

EXTEND(CardinalSplineObject,PolylineShape);
function CardinalSplineObject(){}

CardinalSplineObject.prototype.init = function(canvas){
   this.shape = new G_CardinalSpline(false);
   this.parent.init.call(this,canvas,"shape");
   this.help("Click to add the first vertex");
   return this;
};

CardinalSplineObject.prototype.rubberLine = function(x2,y2){
   this.myContext.context.clearRect(0, 0, this.paintApp.width, this.paintApp.height);
   var nodeCount = this.shape.nodesCount();
   
   var arr = [];
   var i;
   for ( i = 0; i < nodeCount; i ++ ){
      var node = this.shape.getNode(i);
      arr.push(node.x); arr.push(node.y);
   }
   this.myContext.context.beginPath();
   this.myContext.context.moveTo(arr[0],arr[1]);
   
   if ( nodeCount > 1 ){
      arr.push(x2); arr.push(y2);
      
      this.shape.cardinalSpline(this.myContext.context,arr,0,0.1,false,0,0);
   }else{
      this.myContext.context.lineTo(x2,y2);
   }
   
   if ( this.paintApp.outline() === "solid" ){
      this.myContext.context.stroke();
   }
};
CardinalSplineObject.prototype.deserialize = function(s){
   this.shape = new G_CardinalSpline(false).deserialize(s);
   return this;
};

/**
 *
 * ClosedCardinalSplineObject object
 * 
 * TrackableObject
 *       |
 *       +---- PolylineShape
 *                   |
 *                   +---- ClosedCardinalSplineObject
 *
 *********************************************************************************/

EXTEND(ClosedCardinalSplineObject,PolylineShape);
function ClosedCardinalSplineObject(){}

ClosedCardinalSplineObject.prototype.init = function(canvas){
   this.shape = new G_CardinalSpline(true);
   this.parent.init.call(this,canvas,"shape");
   this.help("Click to add the first vertex");
   return this;
};

ClosedCardinalSplineObject.prototype.rubberLine = function(x2,y2){
   this.myContext.context.clearRect(0, 0, this.paintApp.width, this.paintApp.height);
   var nodeCount = this.shape.nodesCount();
   
   var arr = [];
   var i;
   for ( i = 0; i < nodeCount; i ++ ){
      var node = this.shape.getNode(i);
      arr.push(node.x); arr.push(node.y);
   }
   this.myContext.context.beginPath();
   this.myContext.context.moveTo(arr[0],arr[1]);
   
   if ( nodeCount > 1 ){
      arr.push(x2); arr.push(y2);
      
      this.shape.cardinalSpline(this.myContext.context,arr,0,0.1,true,0,0);
   }else{
      this.myContext.context.lineTo(x2,y2);
   }
   
   if ( this.paintApp.fillMode() === "solid" ){
      this.myContext.context.fill();
   }
   if ( this.paintApp.outline() === "solid" ){
      this.myContext.context.stroke();
   }
};
ClosedCardinalSplineObject.prototype.deserialize = function(s){
   this.shape = new G_CardinalSpline(true).deserialize(s);
   return this;
};


/**
 *
 * Free pen/pencil object
 *
 * TrackableObject
 *       |
 *       +---- PencilObject
 *
 *********************************************************************************/

EXTEND(PencilObject,TrackableObject);

function PencilObject(){}

PencilObject.prototype.init = function(canvas){
   this.shape = new G_Polyline();
   this.parent.init.call(this,canvas,"shape");
   this.help("Click and move to start drawing.","Pencil");
   return this;
};

PencilObject.prototype.mouseDown = function(event,x,y){
   this.start();
   this.nodes = [{x:x,y:y}];
};

PencilObject.prototype.mouseMove = function(event,x,y){
   if ( this.started() ){
      this.shape.addNode(x,y);
      this.draw();
   }
};

PencilObject.prototype.draw = function(event,x,y){
   var prevFill = this.myContext.outline;
   this.myContext.outline = "solid";
   this.parent.draw.call(this,event,x,y);
   this.myContext.outline = prevFill;
};

PencilObject.prototype.mouseUp = function(event,x,y){
   if ( this.started() ){
      this.complete();
      this.help("Click and move to start drawing.","Pencil");
      if ( this.dirty ){
         this.transform();
      }
   }
};

PencilObject.prototype.deserialize = function(s){
   this.shape = new G_Polyline(true).deserialize(s);
   return this;
};

/**
 *
 * Eraser object
 *
 * TrackableObject
 *       |
 *       +---- EraserObject
 *
 *********************************************************************************/

EXTEND(EraserObject,TrackableObject);

function EraserObject(){}

EraserObject.prototype.init = function(canvas){
   this.parent.init.call(this,canvas,"tool");
   this.Treat  = 0;
   this.eraserSize = 20;
   this.transparentColor = {r:0,g:0,b:0,a:0};
   this.nodes = [];
   
   this.supportGlobalCompositeOperation = (this.paintApp.context.globalCompositeOperation !== "");
   
   this.help("Click and drag to erase. Press SHIFT key to increase eraser size. Press CTRL key to decrease eraser size.", "Eraser");
   return this;
};
EraserObject.prototype.createBrush = function(){
   if ( !this.brush ){
      this.brush = document.createElement("canvas");
   }
   this.brush.width = this.eraserSize;
   this.brush.height = this.eraserSize;

   var ctx = this.brush.getContext("2d");
   ctx.beginPath();
   ctx.clearRect(0,0,this.eraserSize,this.eraserSize);
   ctx.fillStyle   = "rgba(255,0,0,0)";
   ctx.arc(this.eraserSize/2,this.eraserSize/2,this.eraserSize/2,0,Math.PI * 2,true);
   ctx.fill();
};

EraserObject.prototype.erase = function(x,y,ctx){
   if ( !ctx ){
      ctx = this.paintApp.context;
   }
   ctx.save();
   ctx.beginPath();
   ctx.globalCompositeOperation = "copy";
   ctx.fillStyle   = "rgba(255,0,0,0.0)";
   ctx.arc(x,y,this.eraserSize/2,0,Math.PI * 2,true);
   ctx.clip();
   //ctx.drawImage(canvas,x - this.eraserSize/2, y - this.eraserSize/2);
   ctx.fill();
   ctx.closePath();
   ctx.restore();
   
   this.nodes.push(x);this.nodes.push(y);this.nodes.push(this.eraserSize);
};

EraserObject.prototype.mouseDown = function(event,x,y){
   this.start();
   this.nodes = [];
   this.erase(x,y);
   this.help("Click and drag to erase. Press SHIFT key to increase eraser size. Press CTRL key to decrease eraser size.", "Eraser(" + this.eraserSize + ")");   
};

EraserObject.prototype.mouseMove = function(event,x,y){
   if ( this.started() ){
      if ( event.shiftKey ){
         if ( this.eraserSize < 100 ){
            this.eraserSize += 2;
         }
      }
      if ( event.ctrlKey ){
         if ( this.eraserSize > 2 ){
            this.eraserSize -= 2;
         }
      }
      
      this.erase(x,y);
      
      this.help("Click and drag to erase. Press SHIFT key to increase eraser size. Press CTRL key to decrease eraser size.", "Eraser(" + this.eraserSize + ")");   
   }
};
EraserObject.prototype.mouseUp = function(event,x,y){
   if ( this.started() ){
      this.complete();
      this._done();
   }
};

EraserObject.prototype.done = function(){};

EraserObject.prototype._done = function(){
   if ( this.paintApp.fnActionComplete ){
      this.paintApp.fnActionComplete(this);
      this.paintApp.canvas_history.add("Eraser",["Eraser",this.nodes.join(",")].join("|"));
      this.nodes = [];
   }
   this.hideFocusRing();
   this.reset();
   return this;
};
EraserObject.prototype.deserialize = function(s,delimiter,ctx){
   delimiter = delimiter || "|";
   var arr = s.split(delimiter);
   this.nodes = [];
   var arrNodes = arr[1].split(",");
   var i;
   
   for ( i = 0; i < arrNodes.length; i += 3 ){
      this.eraserSize = arrNodes[i+2] * 1;
      this.erase(arrNodes[i] * 1,arrNodes[i+1] * 1,ctx);
   }
   return this;
};
EraserObject.prototype.drawEraser = function(x,y,size){
};

/**
 *
 * Color picker object
 *
 * TrackableObject
 *       |
 *       +---- EyeDropperObject
 *
 *********************************************************************************/

EXTEND(EyeDropperObject,TrackableObject);

function EyeDropperObject(){}

EyeDropperObject.prototype.init = function(canvas){
   this.parent.init.call(this,canvas,"tool");
   this.help("Click and drag to pick canvas color.","Eye dropper");
   return this;
};

EyeDropperObject.prototype.mouseDown = function(event,x,y){
   this.start();
   var oImgData = this.paintApp.context.getImageData(0,0,this.paintApp.width,this.paintApp.height);
   this.paintApp.imageProcessor.imageData(oImgData);
};

EyeDropperObject.prototype.mouseMove = function(event,x,y){
   if ( this.started() ){
      this.pickColor(x,y);
   }
};
EyeDropperObject.prototype.mouseUp = function(event,x,y){
   if ( this.started() ){
      this.pickColor(x,y);
      this.complete();
   }
};

EyeDropperObject.prototype.pickColor = function(x,y){
   var color = this.paintApp.imageProcessor.getColor(x,y);
   color = this.RGBA2RGB(color);
   
   var hexColorString = "#" + hex(color.r) + hex(color.g) + hex(color.b);
   var foreColorEl = $("#fore_color");

   foreColorEl.attr("current_color", hexColorString);
   foreColorEl.css("background-color", hexColorString);
   this.paintApp.foreColor( hexColorString );

   
   function hex(c){
		c=parseInt(c,10).toString(16);
		return c.length<2?"0"+c:c;
	}
};
EyeDropperObject.prototype.RGBA2RGB = function(color){
   var a = color.a / 255;
   var r = (1 - a) * 255 + a * color.r;
   var g = (1 - a) * 255 + a * color.g;
   var b = (1 - a) * 255 + a * color.b;
   return {r:r,g:g,b:b};
};


EyeDropperObject.prototype.done = function(){
   if ( this.paintApp.fnActionComplete ){
      this.paintApp.fnActionComplete(this);
   }
   this.hideFocusRing();
   this.reset();
};

/**
 *
 * DashedRectangle object
 *
 * TrackableObject
 *       |
 *       +---- RectangularObject
 *                  |
 *                  +---- DashedRectangleObject
 *
 *********************************************************************************/

EXTEND(RectangularSelectionObject,RectangularObject);
function RectangularSelectionObject(){}
RectangularSelectionObject.prototype.init = function(paintApplication){
   this.shape = new G_PolygonSelection();
   this.parent.init.call(this,paintApplication,"selection","Click and drag to select rectanglular area. Press SHIFT key to select square area.");
   this.shapeBeforeTransform = null;
   this.clearContextEnabled = true;
   return this;
};

RectangularSelectionObject.prototype.draw = function(){
   if ( this.shape.nodesCount() === 2 ){
      this.myContext.context.clearRect(0,0,this.paintApp.width,this.paintApp.height);
      this.myContext.context.save();
      
      this.myContext.context.beginPath();
      this.myContext.context.strokeStyle = "rgba(26,106,171,1)";
      this.myContext.context.lineWidth   = 1;
      
      var minX = this.shape.minX + 0.5,
          maxX = this.shape.maxX + 0.5,
          minY = this.shape.minY + 0.5,
          maxY = this.shape.maxY + 0.5;
          
      dashedLine(this.myContext.context,minX,minY,maxX,minY,[3,3]);
      dashedLine(this.myContext.context,maxX,minY,maxX,maxY,[3,3]);
      dashedLine(this.myContext.context,maxX,maxY,minX,maxY,[3,3]);
      dashedLine(this.myContext.context,minX,maxY,minX,minY,[3,3]);
      this.myContext.context.stroke();
      
      this.myContext.context.restore();
   }
   return this;
};

RectangularSelectionObject.prototype.mouseUp = function(event,x,y){
   if ( this.started() ){
      if (this.shape.nodesCount() === 2 && this.shape.width() > 0 && this.shape.height() > 0 ){
         var arr = [
            this.shape.minX,this.shape.minY, this.shape.maxX,this.shape.minY,
            this.shape.maxX,this.shape.maxY, this.shape.minX,this.shape.maxY
         ];
         this.shape.reset().addNode(arr[0],arr[1],arr[2],arr[3],arr[4],arr[5],arr[6],arr[7]);
         
         this.myContext.context.clearRect(0, 0, this.paintApp.width, this.paintApp.height);
         this.shape.draw(this.myContext);
         this.dirty = false;
         this.complete();   

         this.shapeBeforeTransform = this.shape.toString("#");
         //Select image from main canvas
         this.shape.select(this.paintApp.canvas);
         this.transforming(this.shape);      
      
         var _this = this;
         this.transformStarted = false;
         this.transform(
            function startTransform(event,shape){
               
               if ( !_this.transformStarted ){
                  _this.transformStarted = true;
                  if ( !event.ctrlKey ){

                     // clear image from original context
                     shape.makePath({context:_this.paintApp.context,lineTreatment:0.5});
                     _this.paintApp.context.save();
                     _this.paintApp.context.clip();
                     _this.paintApp.context.clearRect(shape.minX,shape.minY,shape.width(),shape.height());
                     _this.paintApp.context.restore();
                     
                     _this.transforming(shape);
                     
                     _this.shapeBeforeTransform += "1";
                     
                  }else{
                     _this.shapeBeforeTransform += "0";
                  }
               }
            },
            function onTransforming(event,shape){
               if ( _this.transformStarted ){
                  _this.transforming(shape);
                  _this.dirty = true;
               }                                                                    
                                                                 
            },
            function onTransformDone(event,shape){
               if ( _this.transformStarted ){
                  shape.ImageData =  _this.paintApp.context_draft.getImageData(shape.minX,shape.minY,shape.width(),shape.height());
               }
            }
         );
      }else{
         this.dirty = false;
         this.status = "ready";
         this.hideFocusRing();
         this.reset();
         this.myContext.context.clearRect(0, 0, this.paintApp.width, this.paintApp.height);
      }
   }
};

RectangularSelectionObject.prototype.transforming = function(shape){
   this.paintApp.context_draft.clearRect(0,0,this.paintApp.width,this.paintApp.height);

   var canvas = document.createElement("canvas");
   canvas.width = shape.ImageData.width;canvas.height = shape.ImageData.height;
   canvas.getContext("2d").putImageData(shape.ImageData,0,0);

   this.paintApp.context_draft.drawImage(canvas,0,0,shape.ImageData.width,shape.ImageData.height,
                                                shape.minX,shape.minY,shape.width(),shape.height());

   canvas = null;
   return this;
};

RectangularSelectionObject.prototype.done = function(){
   if ( this.dirty ){
      this.dirty = false;
      this.paintApp.context.drawImage(document.getElementById(this.paintApp.getID("canvas_temp")), 0, 0);
      this.paintApp.context_draft.clearRect(0, 0, this.paintApp.width, this.paintApp.height);	
      if ( this.paintApp.fnActionComplete ){
         this.paintApp.fnActionComplete(this);
         this.paintApp.canvas_history.add("Free transform selection",
          ["freetransform",this.shapeBeforeTransform + "~" + this.shape.toString("#")].join("|"));
      }
   }else{
      this.paintApp.context_draft.clearRect(0, 0, this.paintApp.width, this.paintApp.height);	
   }

   this.status = "ready";
   this.hideFocusRing();

   if ( typeof (this.onDone) === "function" ){
      this.onDone(this);
   }
   return this;
};

RectangularSelectionObject.prototype.getSelection = function(){
   this.shape.select(this.paintApp.canvas);
   return this.shape.ImageData;
};

RectangularSelectionObject.prototype.cut = function(isDelete){
   this.paintApp.context_draft.clearRect(0,0,this.paintApp.width,this.paintApp.height);
   if ( !this.transformStarted ){
      
      var historyLabel = "Delete";
      if(!isDelete) {
         historyLabel = "Cut";
         this.copy();
      }
      
      this.shape.makePath({context:this.paintApp.context,lineTreatment:0.5});
      this.paintApp.context.save();
      this.paintApp.context.clip();
      this.paintApp.context.clearRect(this.shape.minX,this.shape.minY,this.shape.width(),this.shape.height());
      this.paintApp.context.restore();
      this.paintApp.canvas_history.add(historyLabel,["cutselection",this.shape.toString("#")].join("|"));
   }
   this.hideFocusRing();
   return this;
};

RectangularSelectionObject.prototype.copy = function() {
   if(null != this.shape) {
      this.paintApp.addToClipboard(
         this.paintApp.context.getImageData(this.shape.minX,this.shape.minY,this.shape.width(),this.shape.height())
      );
   }
};

RectangularSelectionObject.prototype.deserialize = function(s){
   var arr = s.split("|");
   if ( arr[0] === "CutRect" ){
      this.shape.deserialize(arr[1],"#");
   }else{
      arr = arr[1].split("~");
      var sOldShape = arr[0], sFinalShape = arr[1];
      var clearBack = sOldShape.charAt(sOldShape.length - 1);
      sOldShape = sOldShape.substr(0,sOldShape.length - 1);
      this.shapeBeforeTransform = sOldShape;
      this.shape.deserialize(sOldShape,"#");
      this.shape.select(this.paintApp.canvas);
      
      if ( clearBack === "1" ){ //clear background image
         this.shape.makePath({context:this.paintApp.context,lineTreatment:0.5});
         this.paintApp.context.save();
         this.paintApp.context.clip();
         this.paintApp.context.clearRect(this.shape.minX,this.shape.minY,this.shape.width(),this.shape.height());
         this.paintApp.context.restore();
      }
      
      this.shapeBeforeTransform = sOldShape + clearBack;
      this.shape.deserialize(sFinalShape,"#");
      this.transforming(this.shape);
      this.dirty = true;
   }
   return this;  
};
/**
 *
 * PolylineObject object
 * 
 * TrackableObject
 *       |
 *       +---- PolylineShape
 *                   |
 *                   +---- PolygonObject
 *
 *********************************************************************************/

EXTEND(PolygonSelectionObject,PolylineShape);
function PolygonSelectionObject(){}

PolygonSelectionObject.prototype.init = function(canvas){
   this.shape = new G_PolygonSelection();
   this.parent.init.call(this,canvas,"selection","Click to add the first vertex");
   this.shapeBeforeTransform = null;
   return this;
};

PolygonSelectionObject.prototype.draw = function(){
   this.myContext.context.clearRect(0,0,this.paintApp.width,this.paintApp.height);
   this.shape.draw(this.myContext);
   
   return this;
};

PolygonSelectionObject.prototype.rubberLine = function(x2,y2){
   this.myContext.context.clearRect(0,0,this.paintApp.width,this.paintApp.height);
   this.myContext.context.save();
      
   this.myContext.context.beginPath();
   this.myContext.context.strokeStyle = "rgba(26,106,171,1)";
   this.myContext.context.lineWidth   = 1;
   
   var cnt = this.shape.nodesCount();
   var i;
   for ( i = 1; i < cnt; i ++ ){
      var node0 = this.shape.getNode(i-1);
      var node1 = this.shape.getNode(i);
      dashedLine(this.myContext.context,
                 node0.x + this.myContext.lineTreatment, node0.y + this.myContext.lineTreatment,
                 node1.x + this.myContext.lineTreatment, node1.y + this.myContext.lineTreatment,
                 [3,3]);
   }
   var node0 = this.shape.lastNode();
   dashedLine(this.myContext.context,
              node0.x + this.myContext.lineTreatment, node0.y + this.myContext.lineTreatment,
              x2 + this.myContext.lineTreatment, y2 + this.myContext.lineTreatment,
              [3,3]);
   this.myContext.context.stroke();
   
   this.myContext.context.restore();
};

PolygonSelectionObject.prototype.mouseUp = function(event,x,y){
   this.parent.mouseUp.call(this,event,x,y);
   this.dirty = false;
};

PolygonSelectionObject.prototype.dblclick = function(event,x,y){
      if (this.shape.nodesCount() >= 3 && this.shape.width() > 0 && this.shape.height() > 0 ){
         this.myContext.context.clearRect(0,0,this.paintApp.width,this.paintApp.height);
         this.shape.draw(this.myContext);
         this.dirty = false;
         this.complete();   

         this.shapeBeforeTransform = this.shape.toString("#");         
         //Select image from main canvas
         this.shape.select(this.paintApp.canvas);
         this.transforming(this.shape);      
         
         var _this = this;
         
         this.transformStarted = false;
         this.transform(
            function startTransform(event,shape){
               
               if ( !_this.transformStarted ){
                  _this.transformStarted = true;
                  if ( !event.ctrlKey ){
                     // clear image from original context
                     shape.makePath({context:_this.paintApp.context,lineTreatment:0.5});
                     _this.paintApp.context.save();
                     _this.paintApp.context.clip();
                     _this.paintApp.context.clearRect(shape.minX,shape.minY,shape.width(),shape.height());
                     _this.paintApp.context.restore();
                     _this.transforming(shape);
                     
                     _this.shapeBeforeTransform += "1";
                  }else{
                     _this.shapeBeforeTransform += "0";
                  }
               }
            },
            function onTransforming(event,shape){
               if ( _this.transformStarted ){
                  _this.transforming(shape);
                  _this.dirty = true;
               }                                                                    
                                                                 
            },
            function onTransformDone(event,shape){
               if ( _this.transformStarted ){
                  shape.ImageData =  _this.paintApp.context_draft.getImageData(shape.minX,shape.minY,shape.width(),shape.height());
               }
            }
         );
      }else{
         this.dirty = false;
         this.status = "ready";
         this.hideFocusRing();
         this.reset();
         this.myContext.context.clearRect(0, 0, this.paintApp.width, this.paintApp.height);
      }
};

PolygonSelectionObject.prototype.done = function(){
   if ( this.shape.nodesCount() >= 3 && this.shape.width() > 0 && this.shape.height() > 0 ){
      this.status = "ready";
      
      //this.transforming(this.shape);
      
      if ( this.dirty ){
         this.dirty = false;
         this.paintApp.context.drawImage(document.getElementById(this.paintApp.getID("canvas_temp")), 0, 0);
         this.paintApp.context_draft.clearRect(0, 0, this.paintApp.width, this.paintApp.height);	
         
         if ( this.paintApp.fnActionComplete ){
            this.paintApp.fnActionComplete(this);
            this.paintApp.canvas_history.add("Free transform selection",
             ["freetransform",this.shapeBeforeTransform + "~" + this.shape.toString("#")].join("|"));
         }
      }else{
        this.paintApp.context_draft.clearRect(0, 0, this.paintApp.width, this.paintApp.height);	
      }
      
      this.hideFocusRing();

      if ( typeof (this.onDone) === "function" ){
         this.onDone(this);
      }
   }
   return this;
};

PolygonSelectionObject.prototype.transforming = function(shape){
   this.paintApp.context_draft.clearRect(0,0,this.paintApp.width,this.paintApp.height);

   var canvas = document.createElement("canvas");
   canvas.width = shape.ImageData.width;canvas.height = shape.ImageData.height;
   canvas.getContext("2d").putImageData(shape.ImageData,0,0);

   this.paintApp.context_draft.drawImage(canvas,0,0,shape.ImageData.width,shape.ImageData.height,
                                                shape.minX,shape.minY,shape.width(),shape.height());
};

PolygonSelectionObject.prototype.getSelection = function(){
   this.shape.select(this.paintApp.canvas);
   return this.shape.ImageData;
};

PolygonSelectionObject.prototype.cut = function(isDelete){
   this.paintApp.context_draft.clearRect(0,0,this.paintApp.width,this.paintApp.height);
   if ( !this.transformStarted ){
      this.shape.makePath({context:this.paintApp.context,lineTreatment:0.5});
      this.paintApp.context.save();
      this.paintApp.context.clip();
      
      var historyLabel = "Delete";
      if(!isDelete) {
         historyLabel = "Cut";
      }
      
      this.paintApp.context.clearRect(this.shape.minX,this.shape.minY,this.shape.width(),this.shape.height());
      this.paintApp.context.restore();
      this.paintApp.canvas_history.add(historyLabel,["cutselection",this.shape.toString("#")].join("|"));
   }
   this.hideFocusRing();
   return this;
};

PolygonSelectionObject.prototype.copy = function(){
   if(null != this.shape) {
      this.paintApp.addToClipboard(
            this.paintApp.context.getImageData(this.shape.minX,this.shape.minY,this.shape.width(),this.shape.height()),
            this.shape
      );   
   }
};

PolygonSelectionObject.prototype.showBoundingBox = function(){
   this.paintApp.context_draft1.save();
   this.paintApp.context_draft1.lineWidth = 1;
   this.paintApp.context_draft1.strokeStyle = "rgba(26,106,171,1)";
   this.paintApp.context_draft1.beginPath();
   var v = 0.5, pattern = [6,6];

   var cnt = this.shape.nodesCount();
   var i;
   for ( i = 1; i < cnt; i ++ ){
      var node0 = this.shape.getNode(i-1);
      var node1 = this.shape.getNode(i);
      dashedLine(this.paintApp.context_draft1,
                 node0.x + v, node0.y + v,
                 node1.x + v, node1.y + v,
                 pattern);
   }
   var node0 = this.shape.lastNode();
   var node1 = this.shape.firstNode();
   dashedLine(this.paintApp.context_draft1,
              node0.x + v, node0.y + v,
              node1.x + v, node1.y + v,
              pattern);

   this.paintApp.context_draft1.stroke();
   this.paintApp.context_draft1.restore();
};

PolygonSelectionObject.prototype.deserialize = function(s){
   var arr = s.split("|");
   if ( arr[0] === "CutPolygon" ){
      this.shape.deserialize(arr[1],"#");
   }else{
      arr = arr[1].split("~");
      var sOldShape = arr[0], sFinalShape = arr[1];
      var clearBack = sOldShape.charAt(sOldShape.length - 1);
      sOldShape = sOldShape.substr(0,sOldShape.length - 1);

      this.shapeBeforeTransform = sOldShape;
      this.shape.deserialize(sOldShape,"#");
      this.shape.select(this.paintApp.canvas);
      
      if ( clearBack === "1" ){ //clear background image
         this.shape.makePath({context:this.paintApp.context,lineTreatment:0.5});
         this.paintApp.context.save();
         this.paintApp.context.clip();
         this.paintApp.context.clearRect(this.shape.minX,this.shape.minY,this.shape.width(),this.shape.height());
         this.paintApp.context.restore();
      }
      
      this.shapeBeforeTransform = sOldShape + clearBack;
      this.shape.deserialize(sFinalShape,"#");
      this.transforming(this.shape);
      this.dirty = true;
   }
   return this;  
};


EXTEND(PaintBucketObject,RectangularObject);

function PaintBucketObject(trackingObject,GradType){
   this.GradientType   = GradType;
   this.TrackingObject = trackingObject;
}

PaintBucketObject.prototype.init = function(canvas){
   this.shape = new G_Line();
   this.parent.init.call(this,canvas,"shape","Click and drag to select rectanglular area. Press SHIFT key to select square area.");
   return this;
};

PaintBucketObject.prototype.mouseDown = function(event,x,y){
   if ( this.GradientType === "Solid" ){
      var oImgData = this.paintApp.context.getImageData(0,0,this.paintApp.width,this.paintApp.height);
      this.paintApp.imageProcessor.imageData(oImgData);
      
      var oldColor = this.paintApp.imageProcessor.getColor(x,y);
      var newColor = this.paintApp.backColor();
      if ( event.shiftKey ){
         newColor = this.paintApp.foreColor();
      }
      newColor.a *= 255;
      
      this.paintApp.imageProcessor.floodFillScanlineStackOp1(x,y,newColor,oldColor);
      this.paintApp.context.putImageData(this.paintApp.imageProcessor.imageData(),0,0);

      this.seedX = x; this.seedY = y; this.seedColor = newColor; this.oldColor = oldColor;
      this.complete();
      this.dirty = true;
      this.done();
      
   }else{
      RectangularObject.prototype.mouseDown.call(this,event,x,y);
   }      
};

PaintBucketObject.prototype.mouseUp = function(event,x,y){
   if ( this.started() ){
      this.paint();
      this.complete();
      this.done();
   }
};

PaintBucketObject.prototype.draw = function(){
   this.myContext.context.clearRect(0,0,this.paintApp.width,this.paintApp.height);
   
   this.myContext.context.save();
   this.myContext.context.strokeStyle = "rgba(26,106,171,1)";
   this.myContext.context.lineWidth   = 1;
   this.myContext.context.beginPath();
   
   dashedLine(this.myContext.context,
   this.shape.firstNode().x + 0.5,this.shape.firstNode().y + 0.5,
   this.shape.lastNode().x + 0.5,this.shape.lastNode().y + 0.5,[3,3]);
   this.myContext.context.stroke();              
   this.myContext.context.restore();              
};
PaintBucketObject.prototype.solidPaint = function(ctx, seedX,seedY,seedColor,oldColor){
   var oImgData = ctx.getImageData(0,0,this.paintApp.width,this.paintApp.height);
   this.paintApp.imageProcessor.imageData(oImgData);
   this.paintApp.imageProcessor.floodFillScanlineStackOp1(seedX,seedY,seedColor,oldColor);
   var imgData = this.paintApp.imageProcessor.imageData();
   ctx.putImageData(imgData,0,0);
};
PaintBucketObject.prototype.gradientPaint = function(type,shape,colorStop1,colorStop2,targetShape){
   var grad = null;
   switch(type){
   case "Linear":
         grad = this.myContext.context.createLinearGradient(shape.firstNode().x,shape.firstNode().y,
                                                            shape.lastNode().x,shape.lastNode().y);
         grad.addColorStop(0,this.paintApp.colorStr(colorStop1));
         grad.addColorStop(1,this.paintApp.colorStr(colorStop2));
         break;
   case "Radial":
         var r = Math.sqrt(shape.width() * shape.width() + shape.height() * shape.height() );
         grad = this.myContext.context.createRadialGradient(shape.firstNode().x,shape.firstNode().y,0,
                                                            shape.firstNode().x,shape.firstNode().y,r);
         grad.addColorStop(0,this.paintApp.colorStr(colorStop1));
         grad.addColorStop(1,this.paintApp.colorStr(colorStop2));
         break;
   case "Reflected":
         var dx = shape.lastNode().x - shape.firstNode().x;
         var dy = shape.lastNode().y - shape.firstNode().y;
         var nx = shape.lastNode().x - dx * 2;
         var ny = shape.lastNode().y - dy * 2;
         grad = this.myContext.context.createLinearGradient(nx,ny,
                                                            shape.lastNode().x,shape.lastNode().y);

         grad.addColorStop(0,this.paintApp.colorStr(colorStop2));
         grad.addColorStop(0.5,this.paintApp.colorStr(colorStop1));
         grad.addColorStop(1,this.paintApp.colorStr(colorStop2));
         break;
   }         
   if ( grad ){
      this.dirty = true;
      this.myContext.context.save();
      this.myContext.context.fillStyle = grad;
      if ( targetShape && targetShape.isClosedShape() ){
         targetShape.makePath(this.myContext);
         this.myContext.context.clip();
      }
      this.myContext.context.fillRect(0,0,this.paintApp.width,this.paintApp.height);
      this.myContext.context.restore();
   }
};
PaintBucketObject.prototype.paint = function(){
   this.myContext.context.clearRect(0,0,this.paintApp.width,this.paintApp.height);
   var grad = null;
   var targetShape = null;
   if ( this.TrackingObject && this.TrackingObject.shape.isClosedShape() ){
      targetShape = this.TrackingObject.shape;
   }
   switch(this.GradientType){
   case "Solid":
         this.solidPaint(this.paintApp.context,this.seedX,this.seedY,this.seedColor,this.oldColor);
         break;
   case "Linear":
         this.gradientPaint("Linear",this.shape,this.paintApp.foreColor(),this.paintApp.backColor(),targetShape);
         this.dirty = true;
         break;
   case "Radial":
         this.gradientPaint("Radial",this.shape,this.paintApp.foreColor(),this.paintApp.backColor(),targetShape);
         this.dirty = true;
         break;
   case "Reflected":
         this.gradientPaint("Reflected",this.shape,this.paintApp.foreColor(),this.paintApp.backColor(),targetShape);
         this.dirty = true;
         break;
   }
   
   return this;
};

PaintBucketObject.prototype.done = function(){
   if ( this.dirty ){
      this.status = "ready";
      this.dirty  = false;
      //
      // Move shape from temp canvas to final canvas
      //
      this.paintApp.context.drawImage(document.getElementById(this.paintApp.getID("canvas_temp")), 0, 0);
      this.paintApp.context_draft.clearRect(0, 0, this.paintApp.width, this.paintApp.height);
      
      //
      // get G_Line shape
      var sShape = "";
      if ( this.GradientType !== "Solid" ){ 
         sShape = this.shape.toString("~");
      }
      
      this.reset();
      
      if ( this.paintApp.fnActionComplete ){
         this.paintApp.fnActionComplete(this);
         
         if ( this.GradientType === "Solid" ){
            this.paintApp.canvas_history.add("Fill - " + (( this.GradientType === "Solid" ) ? this.GradientType : this.GradientType + " gradient"),
                                             ["solidfill",
                                              this.seedX + "," + this.seedY,
                                              [this.seedColor.r,this.seedColor.g,this.seedColor.b,this.seedColor.a].join(","),
                                              [this.oldColor.r,this.oldColor.g,this.oldColor.b,this.oldColor.a].join(",")
                                             ].join("|")
                                            );
         }else{
            var foreColor   = this.paintApp.foreColor();
            var backColor   = this.paintApp.backColor();
            var targetShape = "";
            if ( this.TrackingObject && this.TrackingObject.shape.isClosedShape() ){
               targetShape = this.TrackingObject.shape.toString("~");
            }
            
            this.paintApp.canvas_history.add("Fill - " + (( this.GradientType === "Solid" ) ? this.GradientType : this.GradientType + " gradient"),
                                             ["gradientfill",
                                              this.GradientType,
                                              sShape,
                                              [foreColor.r,foreColor.g,foreColor.b,foreColor.a].join(","),
                                              [backColor.r,backColor.g,backColor.b,backColor.a].join(","),
                                              targetShape
                                             ].join("|")
                                            );
         }                                            
      }

      if ( typeof (this.onDone) === "function" ){
         this.onDone(this);
      }
   }
   return this;
};

EXTEND(ZoomGlassObject,RectangularObject);

function ZoomGlassObject(){
}

ZoomGlassObject.prototype.init = function(canvas){
      
   this.shape = new G_Rectangle();
   this.parent.init.call(this,canvas,"shape","Click and drag to select rectanglular area. Press SHIFT key to select square area.");

   this.orgWidth  = this.paintApp.width;
   this.orgHeight = this.paintApp.height;

   this.canvas = document.createElement("canvas");
   this.canvas.width = this.orgWidth; this.canvas.height = this.orgHeight;
   
   var img = this.paintApp.context.getImageData(0,0,this.orgWidth,this.orgHeight);
   this.canvas.getContext("2d").putImageData(img,0,0);
   
   this.zoomToDefaultSize();
                  
   return this;
};

ZoomGlassObject.prototype.zoomToDefaultSize = function(){
   this.zoomTo( this.paintApp.widthBeforeZoom,
                this.paintApp.heightBeforeZoom
               );
   this.complete();
   this.done();
}

ZoomGlassObject.prototype.mouseUp = function(event,x,y){
   if ( this.started() ){
      this.zoom();
      this.done();
   }
};

ZoomGlassObject.prototype.draw = function(){
   if ( this.shape.nodesCount() === 2 ){
      this.myContext.context.clearRect(0,0,this.paintApp.width,this.paintApp.height);
      this.myContext.context.save();
      
      this.myContext.context.beginPath();
      this.myContext.context.strokeStyle = "rgba(26,106,171,1)";
      this.myContext.context.lineWidth   = 1;
      
      var minX = this.shape.minX + 0.5,
          maxX = this.shape.maxX + 0.5,
          minY = this.shape.minY + 0.5,
          maxY = this.shape.maxY + 0.5;
          
      dashedLine(this.myContext.context,minX,minY,maxX,minY,[3,3]);
      dashedLine(this.myContext.context,maxX,minY,maxX,maxY,[3,3]);
      dashedLine(this.myContext.context,maxX,maxY,minX,maxY,[3,3]);
      dashedLine(this.myContext.context,minX,maxY,minX,minY,[3,3]);
      this.myContext.context.stroke();
      
      this.myContext.context.restore();
   }
};

ZoomGlassObject.prototype.zoom = function(){
   var r_x = this.paintApp.width / this.shape.width(),
       r_y = this.paintApp.height / this.shape.height();
   var r = Math.min(r_x,r_y);
   
   var newCanvasW = Math.round(this.paintApp.width * r),
       newCanvasH = Math.round(this.paintApp.height * r);

   this.zoomTo(newCanvasW, newCanvasH);
   this.complete();         
};

ZoomGlassObject.prototype.zoomTo = function(newWidth, newHeight){
   this.paintApp.sizeTo(newWidth,newHeight);
   
   this.paintApp.context.drawImage(this.canvas,0,0,this.orgWidth, this.orgHeight,
                                   0,0,newWidth,newHeight);
   
   var el = document.getElementById("inner_container");
   if(null != el ) {
      el.scrollTop  = 0;
      el.scrollLeft = 0;       
   }
};

ZoomGlassObject.prototype.done = function(){
   if ( this.dirty ){
      this.status = "ready";
      this.dirty  = false;
      //
      // Move shape from temp canvas to final canvas
      //
      this.paintApp.context.drawImage(document.getElementById(this.paintApp.getID("canvas_temp")), 0, 0);
      this.paintApp.context_draft.clearRect(0, 0, this.paintApp.width, this.paintApp.height);	
      this.reset();
      
      if ( this.paintApp.fnActionComplete ){
         this.paintApp.fnActionComplete(this);
         this.paintApp.canvas_history.add("Fill - " + (( this.GradientType === "Solid" ) ? this.GradientType : this.GradientType + " gradient"));
      }

      if ( typeof (this.onDone) === "function" ){
         this.onDone(this);
      }
   }
   return this;  
};

EXTEND(InsertedImageObject,TrackableObject);

function InsertedImageObject() {   
};

InsertedImageObject.prototype.init = function(appObj,imgObj,historyPrefix) {
   enableIcon("tool_resize","tool_rotate","tool_cut", "tool_copy");
   
   this.paintApp = appObj;
   this.img = imgObj;
   
   this.historyLabel = "Insert image";
   if(historyPrefix) {
      this.historyLabel = historyPrefix;
   }
   
   this.checkSizes();
   
   this.canvasImage = appObj.context.getImageData(0,0,appObj.width, appObj.height);
   this.shape = new G_InsertedImage(imgObj, appObj.context, this.canvasImage);

   this.parent.init.call(this,appObj,"shape","Drag, resize to adjust inserted image.");   
   this.shape.init();
   this.shape.draw();
   
   this.showFocusRing(null);

};

InsertedImageObject.prototype.checkSizes = function() {
   var isResized = false;
   
   if( this.paintApp.width < this.img.width ) {
      this.paintApp.sizeTo(this.img.width, this.paintApp.height);
      isResized = true;
   }
   
   if( this.paintApp.height < this.img.height ) {
      this.paintApp.sizeTo(this.paintApp.width, this.img.height);
      isResized = true;
   }
   
   if(isResized) {
      this.paintApp.canvas_history.add("Resize",["resize", this.paintApp.width + "," + this.paintApp.height].join("|"));
   }
};

InsertedImageObject.prototype.cut = function(isDelete) {
   if(isDelete) {
      return;
   }
   this.copy();
   this.paintApp.context.putImageData(this.canvasImage,0,0);
   this.paintApp.trackableObject = null;   
};

InsertedImageObject.prototype.copy = function() {
   if(null != this.shape) {
      this.paintApp.clipboard = this.shape.getImageElement();
   }
};

InsertedImageObject.prototype.deleteShape = function() {
   this.parent.deleteShape.call(this);
   this.paintApp.context.putImageData(this.canvasImage,0,0);
   this.paintApp.trackableObject = null;
};

InsertedImageObject.prototype.done = function() {
   this.paintApp.canvas_history.add(this.historyLabel,this.shape.toString());
   this.hideFocusRing();
   this.reset();
};

EXTEND(AddHyperlinkObject,TrackableObject);

function AddHyperlinkObject(myApp) {
   this.paintApp = myApp;
   this.setCanvas(myApp);
   this.type = "Hyperlink";
   this.shape.type = "Hyperlink";
};

AddHyperlinkObject.prototype.init = function() {
   this.hyperlinksHasChanged = false;
   
   $(".hyperlink_container").addClass("hyperlink_container_active");
   
   for(var i in this.paintApp.hyperlinks) {
      var obj = this.paintApp.hyperlinks[i];
      $(obj.div).text(obj.link);
   }
   
   this.parent.init.call(this,this.paintApp, "Add hyperlink", "Click and drag to create a new hyperlink object. Click an existing hyperlink object to edit it.");
   this.type = "Hyperlink";
   
   this.shape = new G_Hyperlink();
   this.shape.init(this.paintApp.event_canvas);
      
   return this;
};

AddHyperlinkObject.prototype.getShape = function() {
   return this.shape;
};

AddHyperlinkObject.prototype.completed = function() {
   return false;
};

AddHyperlinkObject.prototype.clearBoundingBox = function() {
}; 

AddHyperlinkObject.prototype.mouseDown = function(evt,x,y) {
   if($("#focus_ring").css("visibility") != "hidden") {
      this.beforeDone();
      this.shape = new G_Hyperlink();
      this.shape.init(this.paintApp.event_canvas);
   }

   var hyperlink = this.paintApp.findHyperlinkByCoord(x,y);
   
   if(null != hyperlink) {
      this.shape = hyperlink;
      this.showFocusRing(null);
      return;
   }
   
   this.started = true;
   
   this.prevX = x;
   this.prevY = y;
};

AddHyperlinkObject.prototype.mouseMove = function(evt,x,y) {
   if( this.started ) {
      this.shape.draw( this.prevX, this.prevY, x, y );
   }
};

AddHyperlinkObject.prototype.mouseUp = function(evt,x,y,callbackCancel) {  
   
   if(this.started) {
   var _this = this;
   var callbackOk = function(url) {
      _this.shape.link = url;
      _this.showFocusRing(null);
      _this.shape.draw();
      _this.hyperlinksHasChanged = true;
   };
   
   if(!callbackCancel) {
      var callbackCancel = function() {
         if ( _this.shape.link.indexOf("http") === -1 ) {
            $(_this.shape.div).remove();
            _this.shape.div = null;
            _this.shape = new G_Hyperlink();
            _this.shape.init(_this.paintApp.event_canvas);
            _this.hideFocusRing();
         }
      };
   }
   
   new jsWindow(this.paintApp.winMgr)
      .createDialog("insertlink", "Insert link", 380, 150)
      .load("dialog/insert-link.html", 
      function(jWin){
         if ( dialog ){
            dialog.open(jWin,_this.paintApp,callbackOk,callbackCancel, _this.shape.link);
         }
      });   
   
      this.started = false;
   }
};

AddHyperlinkObject.prototype.beforeDone = function() {
   var minAllowedSpace = 5;   
   if( (this.shape.maxX - this.shape.minX) <= minAllowedSpace 
         || (this.shape.maxY - this.shape.minY) <= minAllowedSpace  ) {
      $(this.shape.div).remove();
      this.shape.div = null;
   }
   else {
      if ( null == this.paintApp.findHyperlinkById( this.shape._id ) ){
         this.paintApp.hyperlinks.push( this.shape );
      }
   }
   
   this.saveToHistory();
   this.hideFocusRing();
};

AddHyperlinkObject.prototype.saveToHistory = function() {
   if(this.hyperlinksHasChanged) {
      this.paintApp.canvas_history.add( "Hyperlinks setup", this.paintApp.getHyperlinksAsString() );
      this.hyperlinksHasChanged = false;
   }
};

AddHyperlinkObject.prototype.done = function() {
   this.beforeDone();
   $(".hyperlink_container").removeClass("hyperlink_container_active");
   $(".hyperlink_container").text("");
};

AddHyperlinkObject.prototype.onAfterTransform = function(ev){ 
   this.hyperlinksHasChanged = true;
};

AddHyperlinkObject.prototype.deleteShape = function() {
   if ( this.shape && this.shape.div ) {
      $(this.shape.div).remove();
      
      var newHyperlinks = [];
      for ( var i in this.paintApp.hyperlinks ){
         var obj = this.paintApp.hyperlinks[ i ];
         if ( obj._id != this.shape._id ) {
            newHyperlinks.push(obj);
         }
      }
      this.paintApp.hyperlinks = newHyperlinks;
      
      this.shape = new G_Hyperlink();
      this.shape.init(this.paintApp.event_canvas);
      
      this.hyperlinksHasChanged = true;
      this.saveToHistory();
   }
   this.parent.deleteShape.call(this);
};

AddHyperlinkObject.prototype.dblclick = function(ev){ 
   var y = ev.clientY - $("#"+this.paintApp.getID("canvas_temp")).offset().top;
   var x = ev.clientX - $("#"+this.paintApp.getID("canvas_temp")).offset().left;
   var hyperlink = this.paintApp.findHyperlinkByCoord(x,y);

   if ( null != this.shape 
      && this.paintApp.isCoordInsideShape(x,y,this.shape)
      && $("#focus_ring").css("visibility") ==  "visible" ) {
      this.started = true;
      this.mouseUp(ev,x,y,function(){});
      return;
   }
   
   if(hyperlink) {
      $(hyperlink.div).trigger("dblclick");
   }
   else if( null != this.shape.div
            && x >= this.shape.minX
            && x <= this.shape.maxX
            && y >= this.shape.minY
            && y <= this.shape.maxY) {
            
      $(this.shape.div).trigger("dblclick");
   }
};

EXTEND(TextObject,TrackableObject);

function TextObject() {
};

TextObject.prototype.init = function(iPaintApp) {
   
   
   this.shape  = new G_TextShape(iPaintApp);
   this.paintApp  = iPaintApp;
   this.parent.init.call(this, this.paintApp, "Text", "Place text.");
};

TextObject.prototype.mouseDown = function(event, x, y) {
   if($("#text_input").css("visibility") == "visible") {
      this.done();
   }
   
   this.status = "drawing";

   this.clearCanvas();

   this.shape.minX = x;
   this.shape.minY= y;
   
};

TextObject.prototype.clearCanvas = function() {
   var context = this.myContext.context;
   context.clearRect(0,
                     0,
                     this.paintApp.width,
                     this.paintApp.height
            );

   
};

TextObject.prototype.mouseMove = function(event, x, y) {
   if ( this.started() ) {
      $("#text_input").val("");
      var context = this.myContext.context;
      
      context.save();
      context.lineWidth = 1;
      context.strokeStyle = "#BBBBBB";
      
   
      this.clearCanvas();
      
      this.shape.maxX = x;
      this.shape.maxY= y;
      
      context.beginPath();
      // adding 0.5 from lineTreatment for having thin lines
      context.rect(  this.shape.minX + this.myContext.lineTreatment,
                     this.shape.minY + this.myContext.lineTreatment,
                     this.shape.width(),
                     this.shape.height()
                  );
      context.stroke();
      context.restore();
   }
};

TextObject.prototype.mouseUp = function() {
   this.status = "ready";

   this.clearCanvas();

   if(this.shape.height() < 13 || this.shape.width() < 13) {
      var defaultSizeX = 200;
      var defaultSizeY = 100;
      this.shape.maxX = this.shape.minX + defaultSizeX;
      this.shape.maxY = this.shape.minY + defaultSizeY;
      this.shape.setNodesFromMins();
   }
   
   this.showFocusRing(null);
   
   $("#text_input").css("line-height", $("#text-input").css("font-size") );
   
   this.shape.draw();
   
   
};

TextObject.prototype.done = function() {
   this.canvasText();
   this.deleteShape();
};

TextObject.prototype.deleteShape= function() {
   $("#text_input").css("visibility", "hidden");
   $("#text_input").val(null);
   $("#text_input").trigger("blur");
   this.hideFocusRing();
   disableSelection();
   this.shape  = new G_TextShape(this.paintApp);   
};

TextObject.prototype.canvasText = function() {
   var el = $("#text_input");
   
   
   var context = this.paintApp.context;
   var font =  el.css("font-style") 
               + " " 
               + el.css("font-weight") 
               + " " 
               + el.css("font-size") 
               + " " 
               + el.css("font-family");
   
   var fillColor= el.css("color");
   var fontSize = el.css("font-size");
   var text =     el.val();
   var minX =     this.shape.minX;
   var minY =     this.shape.minY;
   var width =    this.shape.width();
   var height =   this.shape.height();
   
   TextObject.renderText(context, font, fillColor, fontSize, text, minX, minY, width, height);
   
   var separator = TextObject.historySeparator;
   var historyString = "Text|"
                        + font
                        + separator
                        + fillColor
                        + separator
                        + fontSize
                        + separator
                        + text
                        + separator
                        + minX
                        + separator
                        + minY
                        + separator
                        + width
                        + separator
                        + height;
                        
   this.paintApp.canvas_history.add( "Text", historyString);
};
TextObject.historySeparator = "#separator#";

TextObject.renderText = function(  context,
                                   font,
                                   fillColor,
                                   fontSize,
                                   text,
                                   minX,
                                   minY,
                                   width,
                                   height ) {
   context.save();
   
   context.font = font;
   context.fillStyle = fillColor;
   
   var correctionFactor = 5.9;
   var y = minY - parseInt( parseInt( fontSize ) / correctionFactor);
   var offsetY = parseInt(fontSize);
   context.textBaseline = "alphabetic";
   
   var maxY = y + (height);
   var rows = TextObject.divideTextInRows(context, text, width );   
   for(var i in rows ) {
      var r = rows[i];
      y += offsetY;
      if( y <  maxY ) {
         context.fillText( r, minX, y );
      }
   }  

   context.restore();
   
};

TextObject.divideTextInRows = function(context, text, maxWidth) {
   var rows = [];
   var currentLine = "";
   var offsetStart = 0;
   
   var currentPhrase = "";
   var tempLine = "";
   for(var i = 0; i < text.length; i++ ) {
      tempLine = currentLine + text.charAt(i);
      var width = context.measureText(tempLine);
      
      if(text.charAt(i) == " ") {
         width = context.measureText(tempLine + "_" + " ");
      }
      
      if(text.charAt(i) == " " || text.charAt(i) == "\n"){
         currentPhrase = tempLine;
      }
      
      if(width.width > maxWidth || text.charAt(i) == "\n") {
         var phraseWidth = context.measureText(currentPhrase);
         
         if(phraseWidth.width <= maxWidth) {
            if(currentPhrase.length > 0) {
               rows.push(currentPhrase);
            }
            var start = currentPhrase.length;
            tempLine = tempLine.substr(start, tempLine.length);
            currentPhrase = "";   
         }
         else {
            var longLineDivided = TextObject.divideLongLine(context,currentPhrase,maxWidth);
            rows = rows.concat(longLineDivided.rows);
            var start = currentPhrase.length;
            tempLine = longLineDivided.remainder + tempLine.substr(start, tempLine.length);
            currentPhrase = "";   
         }
         
         
      }
      currentLine = tempLine;
   }
   
   if(tempLine.length > 0 ) {
      var mTxt = context.measureText(tempLine);
      
      if(mTxt.width > maxWidth) {
         var d = TextObject.divideLongLine(context,tempLine,maxWidth);
         rows = rows.concat(d.rows);
         if(d.remainder.length > 0 ) {
            rows.push(d.remainder);
         }
      }
      else {
         rows.push(tempLine);
      }
   }
   

   return rows;
};

TextObject.divideLongLine = function(context, longLine, maxWidth) {
   var rows = [];
   var currentLine = "";
   var offsetStart = 0;
   
   var tempLine = "";
   for(var i = 0; i < longLine.length; i++ ) {
      tempLine = currentLine + longLine.charAt(i);
      var width = context.measureText(tempLine);
      
      if(width.width > maxWidth) {
         
         rows.push(currentLine);
         var start = currentLine.length;
         tempLine = tempLine.substr(start, tempLine.length);
         currentLine = "";   
         
      }
      currentLine = tempLine;
   }
   
   if(tempLine.length > 0 ) {
      rows.push(tempLine);
   }
   
   if(rows.length > 1) {
      var remainder = rows[ (rows.length - 1) ];
      return { rows: rows.slice(0, (rows.length - 1) ), remainder: remainder };   
   }
   
   return {rows:rows,remainder:""};
};