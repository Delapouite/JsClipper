/*
* jQuery repeatedclick v1.0.5
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
* Written by: Alexandr Zykov <alexandrz@gmail.com>
*/
if (typeof(jQuery) != "undefined")
jQuery.fn.hold = function(h,j){var c=jQuery.extend({duration:300,speed:0,min:150},j);"undefined"===typeof jQuery.repeatedEvents&&(jQuery.repeatedEvents=[]);jQuery.repeatedEvents.push(h);var k=jQuery.repeatedEvents.length-1,d,e;return this.each(function(){d=function(f,b,a){var g=this;jQuery.repeatedEvents[f].call(g,a);e=setTimeout(function(){d.call(g,f,b>c.min?b*c.speed:b,a)},b)};jQuery(this).mousedown(function(a){d.call(this,k,c.duration,a)});var a=function(){"undefined"!==typeof e&&clearInterval(e)};jQuery(this).mouseout(a);jQuery(this).mouseup(a)})};