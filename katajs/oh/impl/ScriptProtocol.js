/*  Kata Javascript Network Layer
 *  ScriptProtocol.js
 *
 *  Copyright (c) 2010, Ewen Cheslack-Postava
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in
 *    the documentation and/or other materials provided with the
 *    distribution.
 *  * Neither the name of Sirikata nor the names of its contributors may
 *    be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


Kata.require([
    'katajs/core/URL.js',
    'katajs/core/Location.js',
    'katajs/core/Time.js'
], function() {

     /** Script protocol contains classes for inter-thread
      * communication with a script, i.e. the objects that should be
      * used to send information back and forth between the script and
      * the object host. These generally contain no methods -- they
      * are intended to be a simple protocol -- so their are only
      * methods for constructing and dispatching these messages.
      *
      * Messages fall into one of two categories: FromScript for
      * messages generated by the script and destined for the object
      * host, and ToScript for messages generated by the object host
      * and destined for the script.  Most ToScript messages are
      * wrapped in a Presence message to simplify dispatching to the
      * appropriate handler.
      *
      * This is mostly boiler-plate code, just constructing the
      * objects in a way that supports updates, improvements, and
      * refactoring in the future, instead of specifying objects
      * directly in javascript.
      *
      * @namespace
      */
     Kata.ScriptProtocol = {

         commonReconstitute : function(data) {
             // "Reconstituting" is really just reallocating member variables
             // so they have the correct type, allowing them to access methods
             // of their original types.  This is necessary because the
             // migration across strands loses the prototype and functions.

             // FIXME currently there are just some generic rules, but we
             // probably need some message specific approach based on looking
             // up a function based on __type.

             if (typeof(data.space) != "undefined")
                 data.space = Kata.URL(data.space);

             if (typeof(data.spaceid) != "undefined")
                 data.spaceid = Kata.URL(data.spaceid);

             return data;
         },

         /** Messages from a script to the ObjectHost or related services.
          * @namespace
          */
         FromScript : {

             Types : {
                 Connect : "fcon",
                 Disconnect : "fdis",
                 SendODPMessage : "fodp",
                 Location : "floc",
                 Visual : "fvis",
                 Query : "fque",
                 Subscription : "fsub",

                 CreateObject : "fcre",
                 GraphicsMessage : "fgfm",
                 EnableGUIMessage : "feui",
                 DisableGUIMessage : "fdui",

                 GUIMessage : "fgui"
             },

             reconstitute : function(data) {
                 data = Kata.ScriptProtocol.commonReconstitute(data);
                 return data;
             },

             Connect : function(space, auth, loc, vis, query) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.Connect;
                 this.space = space;
                 this.auth = auth;
                 if (loc)
                     Kata.LocationCopyUnifyTime(loc,this);
                 if (vis)
                     this.visual = vis;
                 if (query)
                     this.query = query;
             },
             RegisterGUIMessage : function (event) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.EnableGUIMessage;
                 this.event = event;
             },            
             UnregisterGUIMessage : function (event) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.DisableGUIMessage;
                 this.event = event;  
             },

             GUIMessage : function (msg, event) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GUIMessage;
                 this.msg = msg;
                 this.event = event;
             },

             Disconnect : function(space, id) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.Disconnect;
                 this.space = space;
                 this.id = id;
             },

             SendODPMessage : function(space, source_object, source_port, dest_object, dest_port, payload) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.SendODPMessage;
                 this.space = space;
                 this.source_object = source_object;
                 this.source_port = source_port;
                 this.dest_object = dest_object;
                 this.dest_port = dest_port;
                 this.payload = payload;
             },

             /** Location update.  Providing a subset of the information is permitted.
              */
             Location : function(space, id, loc, vis) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.Location;
                 this.space = space;
                 this.id = id;
                 if(loc) {
                     Kata.LocationCopyUnifyTime(loc,this);
                 }
                 if(vis) this.vis = vis;
             },

             Visual : function(space, id, vis) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.Visual;
                 this.space = space;
                 this.id = id;
                 this.vis = vis;
             },

             Query : function(space, id, sa) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.Query;
                 this.space = space;
                 this.id = id;
                 this.sa = sa;
             },

             Subscription : function(space, id, observed, enable) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.Subscription;
                 this.space = space;
                 this.id = id;
                 this.observed = observed;
                 this.enable = enable;
             },
             CreateObject : function(script, cons, args) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.CreateObject;
                 this.script = script;
                 this.constructor = cons;
                 this.args = args;
             },
             GFXCreateNode : function(space, observer, remotePresence) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;
                 this.msg="Create";
                 this.space = space+observer;
                 this.id = remotePresence.id();
				 this.spaceid = this.space;
                 Kata.LocationCopyUnifyTime(remotePresence.mLocation,this);
             },
             GFXCustom : function(space, observer, data) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;
                 this.msg="Custom";
                 this.data=data;
                 this.space = space+observer;
				 this.spaceid = this.space;
             },
             GFXMoveNode : function(space, observer, remotePresence, data) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;
                 this.msg="Move";
                 this.space = space+observer;
                 this.id = remotePresence.id();
				 this.spaceid = this.space;
                 if (data)
                     Kata.LocationCopyUnifyTime(data.loc,this);
             },
             GFXAnimate : function(space, observer, remotePresence, animation) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;
                 this.msg="Animate";
                 this.space = space+observer;
                 this.id = remotePresence.id();
                 this.spaceid = this.space;
                 this.animation = animation;
             },
             GFXLabel : function(space, observer, remoteID, label, offset) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;
                 this.msg="Label";
                 this.space = space+observer;
                 this.id = remoteID;
                 this.spaceid = this.space;
                 this.label = label;
                 this.offset = offset;
             },
             GFXDestroyNode : function(space, observer, remotePresence) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;

                 this.space = space+observer;
                 this.msg="Destroy";
                 this.id = remotePresence.id();
             },
             generateGFXUpdateVisualMessages : function(space, observer, remotePresence) {
                 var messageList=[];
                 if (remotePresence.rMesh) {
                     messageList.push(new Kata.ScriptProtocol.FromScript.GFXUpdateVisualMesh(space, 
                        observer, remotePresence.id(), remotePresence.rMesh, remotePresence.rAnim, remotePresence.rUpAxis,
                        remotePresence.rCenter, remotePresence.scale()));
                 }else {
                    //MIGHT be a light or somesuch
                 }
                 return messageList;
             },
             GraphicsMessage:function(space,observer,id) {
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;
                 this.space = space+observer;
				 this.spaceid = this.space;
                 this.id = id;
             },
             // Generates either a Mesh, Light, WebView, or Camera message, or the Destroy variants.
             GFXUpdateVisualMesh : function(space, observer, id, mesh, anim, up, center, scale) {
                 Kata.ScriptProtocol.FromScript.GraphicsMessage.call(this, space, observer, id);
                 if (mesh == null) {
                     this.msg = "DestroyMesh";
                 } else {
                     this.msg = "Mesh";
                     this.mesh = mesh;
                     this.anim = anim;
                     this.up_axis = up;
                     this.center = center;
                     this.scale = [1,1,1];
                 }
             },
             GFXAttachCamera : function(space, observer, id, canvasId) {
                 Kata.ScriptProtocol.FromScript.GraphicsMessage.call(this, space, observer, id);
                 this.msg="AttachCamera";
                 this.target=canvasId;
             },
             GFXAttachCameraTexture : function(space, observer, id, textureObjectSpace, textureObjectID, texture) {
                 Kata.ScriptProtocol.FromScript.GraphicsMessage.call(this, space, observer, id);

                 this.msg="AttachCameraTexture";
                 this.space = space+observer;
                 this.id = id;
                 this.texobjid=textureObjectId;
                 this.texobjspace=textureObjectSpace;
                 this.texname=textureName;
             },
             GFXDetachCamera : function(space, observer, id) {
                 Kata.ScriptProtocol.FromScript.GraphicsMessage.call(this, space, observer, id);
                 this.msg="DetachCamera";
                 this.space = space+observer;
                 this.id = id;
             },

             GFXEnableEvent : function(space, type) {
                 this.msg="Enable";
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;
                 this.space = space;
                 this.type = type;
             },
             GFXDisableEvent : function(space, type) {
                 this.msg="Disable";
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;
                 this.space = space;
                 this.type = type;
             },
             GFXRaytrace : function(space, requestid, pos, dir, multiple, infinite) {
                 this.msg="Raytrace";
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;
                 this.space = space; // space uuid
                 this.requestid = requestid; // number/string
                 this.pos = pos; // position vector
                 this.dir = dir; // unit vector
                 this.multiple = multiple; // boolean
                 this.infinite = infinite; // boolean
             },
             GFXHighlight : function(space, objid, enable) {
                 this.msg="Highlight";
                 this.__type = Kata.ScriptProtocol.FromScript.Types.GraphicsMessage;
                 this.space = space;
                 this.id = objid;
                 this.enable = enable;
             }
         },

         /** Messages to a script from the ObjectHost or related services.
          * @namespace
          */
         ToScript : {

             Types : {
                 Connected : "tcon",
                 ConnectionFailed : "tfyl",
                 Disconnected : "tdis",
                 ReceiveODPMessage : "todp",
                 QueryEvent : "tque",
                 PresenceLocUpdate : "tloc",
                 GUIMessage : "tgui"

             },

             reconstitute : function(data) {
                 data = Kata.ScriptProtocol.commonReconstitute(data);
                 return data;
             },

             Connected : function(space, id, loc, bounds, visual) {
                 this.__type = Kata.ScriptProtocol.ToScript.Types.Connected;
                 this.space = space;
                 this.id = id;
                 this.loc = loc;
                 this.bounds = bounds;
                 this.visual = visual;
             },

             ConnectionFailed : function(space, object, reason) {
                 this.__type = Kata.ScriptProtocol.ToScript.Types.ConnectionFailed;
                 this.space = space;
                 this.object = object;
                 this.reason = reason;
             },

             Disconnected : function(space) {

                 this.__type = Kata.ScriptProtocol.ToScript.Types.Disconnected;
                 this.space = space;
             },
             
             GUIMessage : function (msg) {
                 for (field in msg) {
                     this[field]=msg[field];
                 }
                 this.__type = Kata.ScriptProtocol.ToScript.Types.GUIMessage;
             },

             ReceiveODPMessage : function(space, source_object, source_port, dest_object, dest_port, payload) {
                 this.__type = Kata.ScriptProtocol.ToScript.Types.ReceiveODPMessage;
                 this.space = space;
                 this.source_object = source_object;
                 this.source_port = source_port;
                 this.dest_object = dest_object;
                 this.dest_port = dest_port;
                 this.payload = payload;
             },
    
             QueryEvent : function(space, observed, entered, loc, visual) {
                 this.__type = Kata.ScriptProtocol.ToScript.Types.QueryEvent;
                 this.space = space;
                 this.observed = observed;
                 this.entered = entered;
                 this.loc = loc;
                 this.visual = visual;
             },

             PresenceLocUpdate : function(space, observed, loc, visual) {
                 this.__type = Kata.ScriptProtocol.ToScript.Types.PresenceLocUpdate;
                 this.space = space;
                 this.observed = observed;
                 this.loc = loc;
                 this.visual = visual;
             }

         }
     };

}, 'katajs/oh/impl/ScriptProtocol.js');
