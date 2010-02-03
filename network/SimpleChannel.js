/*  Kata Javascript Utilities
 *  SimpleChannel.js
 *
 *  Copyright (c) 2010, Patrick Reiter Horn
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

if (typeof(Kata) == "undefined") {Kata = {};}
(function() {

    // public final class SimpleChannel extends Channel
    var SUPER = Kata.Channel.prototype;
    Kata.SimpleChannel = function (partner) {
        if (partner) {
            this.pair(partner);
        }
    };
    Kata.SimpleChannel.prototype = new SUPER.constructor;

    Kata.SimpleChannel.prototype.pair = function (otherChannel) {
        if (!(otherChannel instanceof Kata.SimpleChannel)) {
            console.error("otherChannel "+otherChannel+" is not instance of SimpleChannel");
            throw "Error in SimpleChannel.pair";
        }
        otherChannel.mPartner = this;
        this.mPartner = otherChannel;
    }
    Kata.SimpleChannel.prototype.sendMessage = function (data) {
        this.mPartner.callListeners(data);
    }

})();
