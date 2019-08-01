/**
 * Created by ljs on 2014/12/14.
 */
(function($) {
    $.fn.drags = function(opt, lEdit) {

        opt = $.extend({handle:"",cursor:"auto"}, opt);

        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        //鼠标移到文本框边界时的位置判断和手势设置
        var isRangeContain = function(obj, e) {
            var scaleSpan = $(".scale")[0];
            var half = $(scaleSpan).width()/2;
            var moveable = false;
            //上
            if ($(obj).offset().top - half <= e.pageY && $(obj).offset().top + half >= e.pageY
                && $(obj).offset().left <= e.pageX && $(obj).offset().left+$(obj).width() >= e.pageX) {
                $(obj).css("cursor","move");
                moveable = true;
            }
            //右
            else if ($(obj).offset().top <= e.pageY && $(obj).offset().top + $(obj).height() >= e.pageY
                && $(obj).offset().left + $(obj).width() - half <= e.pageX && $(obj).offset().left + $(obj).width() + half >= e.pageX) {
                $(obj).css("cursor","move");
                moveable = true;
            }
            //下
            else if ($(obj).offset().top + $(obj).height() - half <= e.pageY && $(obj).offset().top + $(obj).height() + half >= e.pageY
                && $(obj).offset().left <= e.pageX && $(obj).offset().left + $(obj).width() >= e.pageX) {
                $(obj).css("cursor","move");
                moveable = true;
            }
            //左
            else if ($(obj).offset().top <= e.pageY && $(obj).offset().top + $(obj).height() >= e.pageY
                && $(obj).offset().left - half <= e.pageX && $(obj).offset().left + half >= e.pageX) {
                $(obj).css("cursor","move");
                moveable = true;
            }
            else {
                $(obj).css("cursor","auto");
                moveable = false;
            }

            return moveable;
        }

        $el.on("mousemove", function(e) {
            isRangeContain(this, e);
        });

        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            var self = this;
            var moveable = isRangeContain(this, e);
            if (moveable == false) {
                //this.contentEditable = true;
                return;
            }
            else {
                //this.contentEditable = false;
                //lEdit.setScaleSpansPositon(this);
            }

            if(opt.handle === "") {
                var $drag = $(this).addClass('draggable');
            } else {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            //当可移动边界触发了点击事件后，在鼠标左键抬起前，鼠标在文本框的父节点移动时，也触发移动事件
            $drag.css('z-index', 10).parents().on("mousemove", function(e) {
                var mLeft = e.pageX + pos_x - drg_w;
                var mTop = e.pageY + pos_y - drg_h;
                var srcRange = {left: mLeft, top:mTop, width: $el.width(), height:$el.height()};
                var dstRange = {left: mLeft, top:mTop, width: $el.width(), height:$el.height()};
                var range = lEdit.checkBorder(srcRange, dstRange);
                $('.draggable').offset({
                    top:range.top,
                    left:range.left
                }).on("mouseup", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });

                lEdit.setScaleSpansPositon(self);
            });
            //e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    }
})(jQuery);