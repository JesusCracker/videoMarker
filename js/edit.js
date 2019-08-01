////////////create by ljs
(function(win, $) {
    var IE_HACK = (/msie/i.test(navigator.userAgent) &&
    !/opera/i.test(navigator.userAgent));

    document.ondragstart = function() {
        return false;
    };

    var Edit = function() {
        p = this;
        x = 0;
        y = 0;
        currentTextBox = null;

        TEXTBOX_CLASSNAME = "textbox";

        isAddTextBoxAble = null;

        isDrawText = null;

        z_idx = 0;

    };
    Edit.prototype = {
        editNode : null,
        configs : {charWidth:0, charHeight:0, drawContext: null},
        pushHistory : function (dataURL, time) {
            var historyObj = {"dataURL":dataURL, "time":time};
            p.push(historyObj);
        },
        //设置输入文本框的Container
        setEditNode : function (node) {
            if (node.tagName == "DIV") {
                //node.contentEditable = true;
                p.editNode = node;
            }
            else {
                //Console.log("error");
                throw DOMException("must be div");
            }
        },
        //初始化
        init : function() {
            var cols = $(p.editNode).width() / p.configs.charWidth;
            var rows = $(p.editNode).height() / p.configs.charHeight;

            //for (var i = 0; i < rows; i++) {
            //    var row = document.createElement("div");
            //    var content = "";
            //    for (var j = 0; j < cols; j++) {
            //        content += "&nbsp;";
            //    }
            //    row.innerHTML = content;
            //    p.editNode.appendChild(row);
            //}
            //$(p.editNode).dblclick(function(e) {
            //    p.createEditDiv(e);
            //});

            $(p.editNode).click(function(e) {
                var isTextBoxFocused = false;
                $("." + TEXTBOX_CLASSNAME).each(function (index, element) {
                    //判断是否有文本框获取到焦点
                    if (element === document.activeElement) {
                        isTextBoxFocused = true;
                        return false;
                    }
                });

                //$(".scale").each(function (index, element) {
                //    if (element === document.activeElement) {
                //        isScaleSpanFocused = true;
                //        return false;
                //    }
                //});

                //如果没有文本框获取到焦点并且不是缩放span的点击，则把文本框的字画到canvas中，并且清空container的innerHTML
                if (!isTextBoxFocused && (isDrawText == null || isDrawText())) {
                    p.drawCanvasText(p.configs.drawContext)
                    p.editNode.innerHTML = "";
                }
                //如果没有文本框获取到焦点并且，不是在文本框中点击， 则创建新的文本框
                if (!isTextBoxFocused && (isAddTextBoxAble == null || isAddTextBoxAble())) {
                    p.createEditDiv(e);
                }
            });
        },
        //创建新的文本框
        createEditDiv : function(e) {
            var row = document.createElement("div");
            $(row).addClass(TEXTBOX_CLASSNAME);
            //$(row).draggable().click(function () {
            //    $(this).draggable({disabled : false});
            //}).dblclick(function () {
            //    $(this).draggable({disabled : true});
            //});
            $(row).css("position", "absolute");
            //$(row).height(14);
            $(row).width($(p.editNode).width()/2);

            row.innerHTML = "&nbsp;";
            $(row).click(function() {
                isAddTextBoxAble = function () {
                    isAddTextBoxAble = null;
                    return false;
                };
                lEdit.setScaleSpansPositon(this);
            }).keyup(function(e) {
                p.setScaleSpansPositon(this);
            });

            row.contentEditable = true;
            p.editNode.appendChild(row);

            $(row).offset({
                left:e.pageX,
                top:e.pageY
            });

            //判断是否在边界，如果在边界就缩小文本框，以避免超出边界
            //var srcRange = {left: $(row).offset().left, top: $(row).offset().top, width:$(row).width(), height:$(row).height()};
            var disRange = {left: $(row).offset().left, top: $(row).offset().top, width:$(row).width(), height:$(row).height()};
            if (disRange.left+disRange.width > $(lEdit.editNode).offset().left+$(lEdit.editNode).width()) {
                $(row).width($(row).width()-(disRange.left+disRange.width - ($(lEdit.editNode).offset().left+$(lEdit.editNode).width())));
            }
            //if (disRange.top+disRange.height > $(lEdit.editNode).offset().top+$(lEdit.editNode).height()) {
            //    $(row).height($(row).height()-(disRange.top+disRange.height - ($(lEdit.editNode).offset().top+$(lEdit.editNode).height())));
            //}

            //所有的缩放span都要加上class "scale"
            var scaleSpans = $(".scale");
            if (scaleSpans.length == 0) {
                p.createScaleSpans(row);
            }
            else {
                p.setScaleSpansPositon(row)
            }

            $(row).drags(null, p);
        },
        //设置初始配置
        setConfigs : function (c) {
            configs = c;
        },
        getLength : function(s) {
            return s.replace(/[^/x00-^/xff]/ig, "aa").length;
        },
        //改变文本颜色
        setColor : function(color) {
            p.textSelectedNodes({"fontColor" : color});
        },
        //改变文本字体大小
        setFontSize : function(size) {
            p.textSelectedNodes({"fontSize" : size+"px"});
        },
        //获取选中文本Range
        textSelectedNodes : function(conf) {

            var userSelection, rangeObject, currentNode;
            if (window.getSelection) {
                //现代浏览器
                userSelection = window.getSelection();
            } else if (document.selection) {
                //IE浏览器 考虑到Opera，应该放在后面
                userSelection = document.selection.createRange();
            }

            //Range对象
            rangeObject = userSelection;
            if (userSelection.getRangeAt) {
                //现代浏览器
                rangeObject = userSelection.getRangeAt(0);
            }

            if (rangeObject.collapsed) {
                return null;
            }

            p.dillWith(rangeObject.commonAncestorContainer, rangeObject, conf);

            return null;
        },
        checkSpaceStr : function(str) {
            return /^(\s|\u00A0)*$/.test(str);
        },
        //具体对选中文本做处理
        dillWith : function(node, rangeObject, conf) {
            //nodeType==1是element node, 然后遍历element node的所有子节点递归处理
            if (node.nodeType == 1) {
                $(node).contents().filter(function(){
                    return this.nodeType == 1 || (this.nodeType == 3 && !p.checkSpaceStr(this.textContent));
                }).each(function(index, element) {
                    p.dillWith(element, rangeObject, conf);
                });
                //node.childNodes[]
            }
            //nodeType==3是text node, 只有是text node的时候才会去处理
            else if (node.nodeType == 3) {
                 var text = node.textContent;
                 var content = "";
                 //创建span
                 var getSpan = function(conf, innerStr, srcSpan) {
                     var nsp;
                     if (srcSpan !== undefined) {
                         nsp = srcSpan.cloneNode(true);
                         nsp.innerHTML = "";
                     }
                     else {
                         nsp = document.createElement("span");
                         nsp.innerHTML = "";
                     }

                     if (conf.fontColor !== undefined) {
                         $(nsp).css("color", conf.fontColor);
                     }
                     if (conf.fontSize !== undefined) {
                         $(nsp).css("font-size", conf.fontSize);
                     }
                     nsp.innerHTML = innerStr;

                     return nsp;
                 }
                 //这是为了兼容万恶的ie
                 if (node.parentElement == null || node.parentElement === undefined) {
                     if (node.parentNode.nodeType == 1) {
                         node.parentElement = node.parentNode;
                     }
                 }
                 //选中文本的开始和结束都是在同一个node的时候
                 if (node === rangeObject.startContainer && node === rangeObject.endContainer) {
                     var text = rangeObject.startContainer.textContent;
                     if (rangeObject.startContainer.parentElement.nodeName == "DIV" || node.parentElement.nodeName == "P") {

                         content += text.substring(0, rangeObject.startOffset);
                         content += getSpan(conf, text.substring(rangeObject.startOffset, rangeObject.endOffset)).outerHTML;
                         content += text.substring(rangeObject.endOffset, text.length);
                         $(rangeObject.startContainer).replaceWith(content);
                     }
                     else if (rangeObject.startContainer.parentElement.nodeName == "SPAN") {
                         var cn1 = rangeObject.startContainer.parentElement.cloneNode(true);
                         var cn2 = rangeObject.startContainer.parentElement.cloneNode(true);
                         cn1.innerHTML = text.substring(0, rangeObject.startOffset);
                         cn2.innerHTML = text.substring(rangeObject.endOffset, text.length);
                         if (!p.checkSpaceStr(cn1.innerHTML)) {
                             content += cn1.outerHTML;
                         }
                         content += getSpan(conf, text.substring(rangeObject.startOffset, rangeObject.endOffset), cn1).outerHTML;
                         if (!p.checkSpaceStr(cn2.innerHTML)) {
                             content += cn2.outerHTML;
                         }
                         $(rangeObject.startContainer.parentElement).replaceWith(content);
                     }

                 }
                 //选中文本的开始节点
                 else if (node === rangeObject.startContainer) {
                     if (node.parentElement.nodeName == "DIV" || node.parentElement.nodeName == "P") {
                         content += text.substring(0, rangeObject.startOffset);
                         content += getSpan(conf, text.substring(rangeObject.startOffset, text.length)).outerHTML;
                         $(node).replaceWith(content);
                     }
                     else if (node.parentElement.nodeName == "SPAN") {
                         var cn1 = node.parentElement.cloneNode(true);
                         cn1.innerHTML = text.substring(0, rangeObject.startOffset);
                         if (!p.checkSpaceStr(cn1.innerHTML)) {
                             content += cn1.outerHTML;
                         }
                         content += getSpan(conf, text.substring(rangeObject.startOffset, text.length), cn1).outerHTML;
                         $(node.parentElement).replaceWith(content);
                     }
                 }
                 //选择文本的结束节点
                 else if (node === rangeObject.endContainer) {
                     if (node.parentElement.nodeName == "DIV" || node.parentElement.nodeName == "P") {
                         content += getSpan(conf, text.substring(0, rangeObject.endOffset)).outerHTML;
                         content += text.substring(rangeObject.endOffset, text.length);
                         $(node).replaceWith(content);
                     }
                     else if (node.parentElement.nodeName == "SPAN") {
                         var cn1 = node.parentElement.cloneNode(true);
                         var cn2 = node.parentElement.cloneNode(true);
                         cn2.innerHTML = text.substring(rangeObject.endOffset, text.length);
                         if (!p.checkSpaceStr(text.substring(0, rangeObject.endOffset))) {
                             content += getSpan(conf, text.substring(0, rangeObject.endOffset), cn1).outerHTML;
                         }
                         if (!p.checkSpaceStr(cn2.innerHTML)) {
                             content += cn2.outerHTML;
                         }
                         $(node.parentElement).replaceWith(content);
                     }
                 }
                 //选中文本的中间节点
                 else if (p.rangeCompareNode(rangeObject, node)) {
                     if (node.parentElement.nodeName == "DIV" || node.parentElement.nodeName == "P") {
                         content += getSpan(conf, text.substring(0, text.length)).outerHTML;
                         $(node).replaceWith(content);
                     }
                     else if (node.parentElement.nodeName == "SPAN") {
                         content += getSpan(conf,  text.substring(0, text.length), node.parentElement).outerHTML;
                         $(node.parentElement).replaceWith(content);
                     }
                 }
            }
        },
        //判断是否选中文本中的节点
        rangeCompareNode : function(range, node) {
            var nodeRange = node.ownerDocument.createRange();
            var start = -1, incStart = -1, incEnd = -1, end = -1;
            try {
                nodeRange.selectNode(node);
            }
            catch (e) {
                nodeRange.selectNodeContents(node);
            }
            //return range.compareBoundaryPoints(Range.START_TO_END, nodeRange);

            start = range.compareBoundaryPoints(Range.START_TO_END, nodeRange);
            if (start >= 0 && incStart <= 0) {
                incStart = range.compareBoundaryPoints(Range.START_TO_START, nodeRange);
            }
            if (incStart >= 0 && incEnd <= 0) {
                incEnd = range.compareBoundaryPoints(Range.END_TO_END, nodeRange);
            }
            if (incEnd >= 0 && end <= 0) {
                end = range.compareBoundaryPoints(Range.END_TO_START, nodeRange);
            }
            if (end >= 0) {
                return false;
            }

            if (start > 0) {
                return true;
            }

            return false;
        },
        //把文本框中的文本draw到canvas中
        drawCanvasText : function(ctx) {
            var defaultColor1 = "#000000";
            var defaultFont = "12px Arial";
            //获取相对container的左偏移位置
            var getRelativeLeft = function(node) {
                //var left = $(node.offsetParent).offset().left - $(p.editNode).offset().left + node.offsetLeft;
                var left = $(node).offset().left - $(p.editNode).offset().left
                //console.log(node.innerHTML + " left:" +left);
                return left
            }
            //获取相对container的右偏移位置
            var getRelativeTop = function(node) {
                //var top = $(node.offsetParent).offset().top - $(p.editNode).offset().top + node.offsetTop;
                var top = $(node).offset().top - $(p.editNode).offset().top
                //console.log(node.innerHTML + " top:" +top);
                return top;
            }

            var currentTextBox;
            //预处理，是为了统一把父节点不是span的textnode的节点用span包起来
            var preDill = function(node) {
                if (node.nodeType == 1) {
                    $(node).contents().filter(function () {
                        return this.nodeType == 1 || (this.nodeType == 3 && !p.checkSpaceStr(this.textContent));
                    }).each(function (index, element) {
                        preDill(element, ctx);
                    });
                }
                else if (node.nodeType == 3) {
                    if (node.parentElement == null || node.parentElement === undefined) {
                        if (node.parentNode.nodeType == 1) {
                            node.parentElement = node.parentNode;
                        }
                    }
                    if (node.parentElement.nodeName != "SPAN") {
                        $(node).replaceWith("<span>"+node.textContent+"</span>");
                    }
                }

                return node;
            }
            //开始处理draw text的方法
            var draw = function(node, ctx) {
                if (node.nodeType == 1) {
                    if (node.nodeName == "DIV") {
                        //y += currentFontSize;
                        //x =
                    }

                    $(node).contents().filter(function () {
                        return this.nodeType == 1 || (this.nodeType == 3 && !/^\s*$/.test(this.textContent));
                    }).each(function (index, element) {
                        draw(element, ctx);
                    });
                }
                //只有当nodeType==3的时候才真正处理
                else if (node.nodeType == 3) {
                    if (node.parentElement == null || node.parentElement === undefined) {
                        if (node.parentNode.nodeType == 1) {
                            node.parentElement = node.parentNode;
                        }
                    }
                    if (node.parentElement.nodeName == "SPAN") {
                        ctx.font = $(node.parentElement).css("font-size") + " Arial";
                        ctx.fillStyle = $(node.parentElement).css("color");
                        ctx.textBaseline = "top";
                        ctx.fillText(node.textContent, getRelativeLeft(node.parentElement), getRelativeTop(node.parentElement));
                    }
                    //else {
                    //    $(node).replaceWith("<span>"+node.textContent+"</span>");
                    //    ctx.font = defaultFont;
                    //    ctx.fillStyle = defaultColor1;
                    //    ctx.fillText(node.textContent, getRelativeLeft(node.parentElement), getRelativeTop(node.parentElement));
                    //}
                    else if (node.parentElement.nodeName == "DIV") {
                        if (node.previousSibling == null) {
                            ctx.font = defaultFont;
                            ctx.fillStyle = defaultColor1;
                            ctx.textBaseline = "top";
                            ctx.fillText(node.textContent, getRelativeLeft(node.parentElement), getRelativeTop(node.parentElement));
                        }
                        else {
                            if (node.previousSibling.nodeName == "SPAN") {
                                ctx.font = defaultFont;
                                ctx.fillStyle = defaultColor1;
                                ctx.textBaseline = "top";
                                ctx.fillText(node.textContent,getRelativeLeft(node.previousSibling)+$(node.previousSibling).width(), getRelativeTop(node.parentElement));
                            }
                            else if (node.previousSibling.nodeName == "DIV") {
                                ctx.font = defaultFont;
                                ctx.fillStyle = defaultColor1;
                                ctx.textBaseline = "top";
                                ctx.fillText(node.textContent,getRelativeLeft(node.parentElement), getRelativeTop(node.previousSibling)+$(node.previousSibling).height());
                            }
                        }
                    }
                }
            };

            $(p.editNode).contents().filter(function(){
                return this.className == "textbox";
            }).each(function(index, element) {
                x = $(element).offset().left;
                y = $(element).offset().top;
                currentTextBox = element;
                var elm = preDill(element);
                draw(elm, ctx);
            });
        },
        clean : function() {
            p.editNode.innerHTML = "";
        },
        //创建文本框边上的缩放span
        createScaleSpans : function(attachElement1) {
            if (attachElement1 == null)
                return;

            for (var i=0; i<8; i++) {
                 var span1 = document.createElement("div");
                 $(span1).css("border", "1px solid #000").css("width", "6px").css("height","6px").css("position","relative").css("background", "#fff");
                 $(span1).css("z-index", $(attachElement1).css("z-index")+1);
                 $(span1).addClass("scale");
                 $(span1).click(function(e) {
                     //isAddTextBoxAble = function () {
                     //    console.log("span add text box able");
                     //    isAddTextBoxAble = null;
                     //    return false;
                     //};
                 });

                 if (i == 0) {//左上
                     $(span1).css("cursor", "nw-resize");
                     $(span1).addClass("lt");
                 } else if (i == 1) {//右上
                     $(span1).css("cursor", "ne-resize");
                     $(span1).addClass("rt");
                 } else if (i == 2) {//右下
                     $(span1).css("cursor", "se-resize");
                     $(span1).addClass("rb");
                 }else if (i == 3) {//左下
                     $(span1).css("cursor", "sw-resize");
                     $(span1).addClass("lb");
                 }
                 else if (i == 4) {//上中
                     $(span1).css("cursor", "n-resize");
                     $(span1).addClass("tm");
                 }else if (i == 5) {//右中
                     $(span1).css("cursor", "e-resize");
                     $(span1).addClass("rm");
                 }else if (i == 6) {//下中
                     $(span1).css("cursor", "s-resize");
                     $(span1).addClass("bm");
                 }else if (i == 7) {//左中
                     $(span1).css("cursor", "w-resize");
                     $(span1).addClass("lm");
                 }
                 p.editNode.appendChild(span1);

                 span1.atcEle = attachElement1;
                 $(span1).on("mousedown", function(e) {
                     isAddTextBoxAble = function () {
                         //console.log("span add text box able mousedown");
                         isAddTextBoxAble = null;
                         return false;
                     };

                     isDrawText = function() {
                         isDrawText = null;
                         return false;
                     }

                     $(this).addClass("actscale");
                     //e.stopPropagation();

                     z_idx = $(this.atcEle).css('z-index');
                     $(this.atcEle).addClass("scaleable");
                     var move = function(e) {
                         var sclable = $(".scaleable")[0];
                         if (sclable === undefined) {
                             return;
                         }

                         e.stopPropagation();//禁止事件的冒泡传播

                         var dx = e.pageX - $(sclable).offset().left;
                         var dy = e.pageY - $(sclable).offset().top;
                         //console.log("dx:"+dx + " dy:"+ dy);
                         //console.log("e.pageX:"+e.pageX + " e.pageY:"+ e.pageY);
                         //console.log("left:"+$(sclable).offset().left + " top:"+ $(sclable).offset().top);
                         var minw = 20, minh = 12;
                         var actscale = $(".actscale")[0];
                         if (actscale.className.indexOf("lt")>=0) {//左上
                             if ($(sclable).width() - dx < minw || $(sclable).height() - dy < minh) return;
                             var srcRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: $(sclable).width(), height:$(sclable).height()};
                             var dstRange = {left: e.pageX, top: e.pageY, width: $(sclable).width() - dx, height:$(sclable).height() - dy};
                             var range = p.checkBorder(srcRange, dstRange);
                             $(sclable).width(range.width);
                             $(sclable).height(range.height);
                             $(sclable).offset({left: range.left, top: range.top});
                             p.setScaleSpansPositon(sclable);
                         }else if (actscale.className.indexOf("rt")>=0) {//右上
                             if (dx < minw || $(sclable).height() - dy < minh) return;
                             var srcRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: $(sclable).width(), height:$(sclable).height()};
                             var dstRange = {left: $(sclable).offset().left, top: e.pageY, width: dx, height:$(sclable).height() - dy};
                             var range = p.checkBorder(srcRange, dstRange);
                             $(sclable).width(range.width);
                             $(sclable).height(range.height);
                             $(sclable).offset({left: range.left, top:range.top});
                             p.setScaleSpansPositon(sclable);
                         }else if (actscale.className.indexOf("rb")>=0) {//右下
                             if (dx < minw || dy < minh) return;
                             var srcRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: $(sclable).width(), height:$(sclable).height()};
                             var dstRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: dx, height:dy};
                             var range = p.checkBorder(srcRange, dstRange);
                             $(sclable).width(range.width);
                             $(sclable).height(range.height);
                             p.setScaleSpansPositon(sclable);
                         }else if (actscale.className.indexOf("lb")>=0) {//左下
                             if ($(sclable).width() - dx < minw || dy < minh) return;
                             var srcRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: $(sclable).width(), height:$(sclable).height()};
                             var dstRange = {left: e.pageX, top: $(sclable).offset().top, width: $(sclable).width() - dx, height:dy};
                             var range = p.checkBorder(srcRange, dstRange);
                             $(sclable).width(range.width);
                             $(sclable).height(range.height);
                             $(sclable).offset({left: range.left, top:range.top});
                             p.setScaleSpansPositon(sclable);
                         }
                         else if (actscale.className.indexOf("tm")>=0) {//上中
                             if ($(sclable).height() - dy < minh) return;
                             var srcRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: $(sclable).width(), height:$(sclable).height()};
                             var dstRange = {left: $(sclable).offset().left, top: e.pageY, width: $(sclable).width(), height:$(sclable).height() - dy};
                             var range = p.checkBorder(srcRange, dstRange);
                             $(sclable).height(range.height);
                             $(sclable).offset({left: range.left, top:range.top});
                             p.setScaleSpansPositon(sclable);
                         }else if (actscale.className.indexOf("rm")>=0) {//右中
                             if (dx < minw) return;
                             var srcRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: $(sclable).width(), height:$(sclable).height()};
                             var dstRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: dx, height:$(sclable).height()};
                             var range = p.checkBorder(srcRange, dstRange);
                             $(sclable).width(range.width);
                             $(sclable).height(range.height);
                             p.setScaleSpansPositon(sclable);
                         }else if (actscale.className.indexOf("bm")>=0) {//下中
                             if (dy < minh) return;
                             var srcRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: $(sclable).width(), height:$(sclable).height()};
                             var dstRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: $(sclable).width(), height:dy};
                             var range = p.checkBorder(srcRange, dstRange);
                             $(sclable).height(range.height);
                             p.setScaleSpansPositon(sclable);
                         }else if (actscale.className.indexOf("lm")>=0) {//左中
                             if ($(sclable).width() - dx < minw) return;
                             var srcRange = {left: $(sclable).offset().left, top: $(sclable).offset().top, width: $(sclable).width(), height:$(sclable).height()};
                             var dstRange = {left: e.pageX, top: $(sclable).offset().top, width: $(sclable).width() - dx, height:$(sclable).height()};
                             var range = p.checkBorder(srcRange, dstRange);
                             $(sclable).width(range.width);
                             $(sclable).offset({left: range.left, top:range.top});
                             p.setScaleSpansPositon(sclable);
                         }

                     };
                     //$(self).css('z-index', 10).on("mousemove", move);
                     //$(self).css('z-index', 10).parent().on("mousemove", move);
                     //当缩放span触发了点击事件后，在鼠标左键抬起前，鼠标在文本框的父节点移动时，也触发缩放事件
                     $(self).css('z-index', 10).on("mousemove", move).parents().on("mousemove", move);

                 }).on("mouseup", function(e) {
                     $(".actscale").removeClass("actscale");
                     $(".scaleable").removeClass("scaleable").css("z-index", z_idx);
                 }).parents().on("mouseup", function(e) {
                     $(".actscale").removeClass("actscale");
                     $(".scaleable").removeClass("scaleable").css("z-index", z_idx);
                 });
             }
            p.setScaleSpansPositon(attachElement1);
        } ,
        //设置ScaleSpans的位置
        setScaleSpansPositon : function(attachElement1) {
            var scaleSpans = $(".scale");
            for (var i=0; i<scaleSpans.length; i++) {
                scaleSpans[i].atcEle = attachElement1;
                var halfWidth = $(scaleSpans[i]).width()/2;
                var halfHeight = $(scaleSpans[i]).height()/2;
                var attachLeft = $(attachElement1).offset().left;
                var attachTop = $(attachElement1).offset().top;
                var attachWith = $(attachElement1).width();
                var attachHeight = $(attachElement1).height();
                if (i == 0) {//左上
                    $(scaleSpans[i]).offset({
                        left: attachLeft-halfWidth,
                        top: attachTop-halfHeight
                    });
                } else if (i == 1) {//右上
                    $(scaleSpans[i]).offset({
                        left:attachLeft + attachWith - halfWidth,
                        top: attachTop-halfHeight
                    });
                } else if (i == 2) {//右下
                    $(scaleSpans[i]).offset({
                        left: attachLeft + attachWith - halfWidth,
                        top: attachTop + attachHeight - halfHeight
                    });
                }
                else if (i == 3) {//左下
                    $(scaleSpans[i]).offset({
                        left: attachLeft - halfWidth,
                        top: attachTop + attachHeight - halfHeight
                    });
                }
                else if (i == 4) {//上中
                    $(scaleSpans[i]).offset({
                        left: attachLeft + attachWith / 2 - halfWidth,
                        top: attachTop - halfHeight
                    });
                }
                else if (i == 5) {//右中
                    $(scaleSpans[i]).offset({
                        left: attachLeft + attachWith - halfWidth,
                        top: attachTop + attachHeight / 2 - halfHeight
                    });
                }
                else if (i == 6) {//下中
                    $(scaleSpans[i]).offset({
                        left: attachLeft + attachWith / 2 - halfWidth,
                        top: attachTop + attachHeight - halfHeight
                    });
                }
                else if (i == 7) {//左中
                    $(scaleSpans[i]).offset({
                        left: attachLeft - halfWidth,
                        top: attachTop + attachHeight / 2 - halfHeight
                    });
                }
            }
        },
        //用来做文本框移动和缩放时候的边界校验
        checkBorder : function(srcRange, dstRange) {
            var isSetWidth = true, isSetHeight = true;
            if (dstRange.left < $(lEdit.editNode).offset().left) {
                srcRange.left = $(lEdit.editNode).offset().left;
                isSetWidth = false;
            }
            else {
                srcRange.left = dstRange.left;
                isSetWidth = true;
            }
            if (dstRange.top < $(lEdit.editNode).offset().top) {
                srcRange.top = $(lEdit.editNode).offset().top;
                isSetHeight = false;
            }
            else {
                srcRange.top = dstRange.top;
                isSetHeight  = true;
            }

            if (dstRange.left + dstRange.width > $(lEdit.editNode).offset().left+$(lEdit.editNode).width()) {
                //srcRange.width = $(lEdit.editNode).offset().left+$(lEdit.editNode).width() - srcRange.left;
                srcRange.left = $(lEdit.editNode).offset().left+$(lEdit.editNode).width() - srcRange.width;
            }
            else {
                if (isSetWidth) {
                    srcRange.width = dstRange.width;
                }
            }
            if (dstRange.top + dstRange.height > $(lEdit.editNode).offset().top + $(lEdit.editNode).height()) {
                //srcRange.height = $(lEdit.editNode).offset().top+$(lEdit.editNode).height() - srcRange.top;
                srcRange.top = $(lEdit.editNode).offset().top+$(lEdit.editNode).height() - srcRange.height;
            }
            else {
                if (isSetHeight) {
                    srcRange.height = dstRange.height;
                }
            }

            return srcRange;
        }
    };

    win.lEdit = new Edit();
})(window, jQuery);