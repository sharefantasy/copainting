function CanvasDrawer(ca) {
    var r = {};
    r.backcolor = [255, 255, 255, 255];
    function init() {
        var height = ca.height;
        var width = ca.width;
        var context = ca.getContext('2d');
        r.context = context;
        r.height = height;
        r.width = width;
        var image = context.getImageData(0, 0, width, height);
        r.image = image;
        r.imagedata = image.data;
    }
    init();
    r.setpixel = function (x, y, color) {
        if (x < 0) return;
        if (x >= r.width) return;
        if (y < 0) return;
        if (y >= r.height) return;
        var i = y * r.width + x;
        i *= 4;
        var data = r.imagedata;
        data[i] = color[0];
        data[i + 1] = color[1];
        data[i + 2] = color[2];
        if (3 in color) data[i + 3] = color[3];
        else data[i + 3] = 255;
    };
    r.fill = function (color, xfrom, xto, yfrom, yto) {
        var w = r.width - 1;
        var h = r.height - 1;
        var t;
        if (undefined == color) color = r.backcolor;
        if (undefined == xfrom) xfrom = 0;
        if (undefined == xto) xto = w;
        if (undefined == yfrom) yfrom = 0;
        if (undefined == yto) yto = h;
        if (xfrom > xto) {
            t = xfrom;
            xfrom = xto;
            xto = t;
        }
        if (yfrom > yto) {
            t = yfrom;
            yfrom = yto;
            yto = t;
        }
        if (xfrom < 0) xfrom = 0;
        if (xto > w) xto = w;
        if (yfrom < 0) yfrom = 0;
        if (yto > h) yto = h;
        var c = 3 in color ? color : [color[0], color[1], color[2], 255];
        var i, j, p, k;
        k = w + 1;
        p = xfrom + yfrom * k;
        p *= 4;
        k -= xto - xfrom + 1;
        k *= 4;
        var data = r.imagedata;
        for (j = yfrom; j <= yto; ++j) {
            for (i = xfrom; i <= xto; ++i) {
                data[p] = c[0];
                data[p + 1] = c[1];
                data[p + 2] = c[2];
                data[p + 3] = c[3];
                p += 4;
            }
            p += k;
        }
    };
    r.getpixel = function (x, y) {
        if (x < 0) return;
        if (x >= r.width) return;
        if (y < 0) return;
        if (y >= r.height) return;
        var i = y * r.width + x;
        i *= 4;
        data = r.imagedata;
        return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    };
    r.fillpoints = function (color, ps) {
        var px = ps.x;
        var py = ps.y;
        for (var i in px)
            r.setpixel(px[i], py[i], color);
    };
    r.update = function (img) {
        if(!img) img = r.image;
        r.context.putImageData(img, 0, 0);
        init();
    };
    r.getimage = function(){
        return r.context.getImageData(0, 0, r.width, r.height);
    };
    return r;
}
function swapas(f) {
    return function (_x, _y) {
        return f(_y, _x);
    }
}
function DrawLine(x0, x1, y0, y1) {
    // dx >= dy >= 0
    function _dl(dx, dy) {
        var r = {};
        r.x = [];
        r.y = [];
        function draw(x, y) {
            r.x.push(x);
            r.y.push(y);
        }
        var x = 0;
        var y = 0;
        var dp0 = dy + dy;
        var dp1 = dp0 - dx - dx;
        var p = dp0 - dx;
        while (x < dx) {
            draw(x, y);
            ++x;
            if (p == 0) draw(x, y);
            if (p >= 0) {
                ++y;
                p += dp1;
            } else
                p += dp0;
        }
        draw(x, y);
        return r;
    }
    var dx = x1 - x0;
    var dy = y1 - y0;
    var fx = function (_x, _y) { return _x + x0; }
    var fy = function (_x, _y) { return _y + y0; }
    var r = {};
    r.x = [];
    r.y = [];
    if (dx < 0) {
        dx = -dx;
        fx = (function (f) {
            return function (_x, _y) {
                return f(-_x, _y);
            };
        })(fx);
    }
    if (dy < 0) {
        dy = -dy;
        fy = (function (f) {
            return function (_x, _y) {
                return f(_x, -_y);
            };
        })(fy);
    }
    if (dy > dx) {
        fx = swapas(fx);
        fy = swapas(fy);
        var t = dx;
        dx = dy;
        dy = t;
    }
    var t = _dl(dx, dy);
    var tx = t.x;
    var ty = t.y;
    var rx = r.x;
    var ry = r.y;
    for (var i in tx) {
        rx.push(fx(tx[i], ty[i]));
        ry.push(fy(tx[i], ty[i]));
    }
    return r;
}
// ls = [l1, l2, l3, l4, ...]
function _dl2(ls) {
    var r = {
        x: [],
        y: []
    };
    var rx = r.x;
    var ry = r.y;
    var i, y = ls[0].y[0];
    var xl = [];
    var xr = [];
    for (i in ls) {
        var t = ls[i];
        var ty = t.y[0];
        if (ty > y) y = ty;
        for (var j in t.x) {
            ty = t.y[j];
            var tx = t.x[j];
            if (ty in xl) { if (tx < xl[ty]) xl[ty] = tx; } else xl[ty] = tx;
            if (ty in xr) { if (tx > xr[ty]) xr[ty] = tx; } else xr[ty] = tx;
        }
    }
    while (y in xl) {
        var rr = xr[y];
        for (i = xl[y]; i <= rr; ++i) {
            rx.push(i);
            ry.push(y);
        }
        --y;
    }
    return r;
}
function DrawLine2(x0, x1, y0, y1, rd) {
    var dx = y0 - y1;
    var dy = x1 - x0;
    var l = 1.0 * rd / Math.sqrt(dx * dx + dy * dy);
    dx *= l;
    dy *= l;
    dx = Math.round(dx);
    dy = Math.round(dy);
    return _dl2([DrawLine(x0 + dx, x1 + dx, y0 + dy, y1 + dy), DrawLine(x1 + dx, x1 - dx, y1 + dy, y1 - dy), DrawLine(x1 - dx, x0 - dx, y1 - dy, y0 - dy), DrawLine(x0 - dx, x0 + dx, y0 - dy, y0 + dy)]);
}
function DrawCircle(x, y, rd) {
    var r = {};
    r.x = [x];
    r.y = [y];
    if (0 == rd) return rd;
    var r2 = rd * rd;
    var j, i;
    for (j = rd; j > 0; --j) {
        var t = j - 0.5;
        var l = Math.round(Math.sqrt(r2 - t * t));
        r.x.push(x);
        r.y.push(y + j);
        r.x.push(x);
        r.y.push(y - j);
        r.x.push(x + j)
        r.y.push(y);
        r.x.push(x - j)
        r.y.push(y);
        for (i = 1; i <= l; ++i) {
            r.x.push(x + i);
            r.y.push(y + j);
            r.x.push(x + i);
            r.y.push(y - j);
            r.x.push(x - i);
            r.y.push(y + j);
            r.x.push(x - i);
            r.y.push(y - j);
        }
    }
    return r;
}
function CanvasPlane(canvas) {
    var drawer = CanvasDrawer(canvas);
    function first(type, color, x, y, param) {
        var t;
        switch (type) {
            case 1:
                t = DrawCircle(x, y, param.r);
                drawer.fillpoints(color, t);
                break;
            default:
                throw 'Unknow type';
        }
        drawer.update();
    }
    function second(type, color, X, Y, i, param) {
        switch (type) {
            case 1:
                if ((X[i - 1] == X[i]) && (Y[i - 1] == Y[i])) return;
                drawer.fillpoints(color, DrawLine2(X[i - 1], X[i], Y[i - 1], Y[i], param.r));
                drawer.fillpoints(color, DrawCircle(X[i], Y[i], param.r));
                break;
            default:
                throw 'Unknow type';
        }
        drawer.update();
    }
    function draw(Data) {
        if(!Data) return;
        var type = Data.Type;
        var color = Data.Color;
        var param = Data.Param;
        var X = Data.X;
        var Y = Data.Y;
        var i, n = X.length;
        first(type, color, X[0], Y[0], param);
        for (i = 1; i < n; ++i)
            second(type, color, X, Y, i, param);
        drawer.update();
    }
    var result = {
        Drawer: drawer,
        Type: 1,
        Color: [64, 64, 64, 255],
        Param: { r: 3 },
        AllData: [],
        Images: [],
        Image: drawer.getimage(),
        Current: null,
        Begin: function (x, y) {
            if (!!this.Current) return;
            this.Current = {
                Type: this.Type,
                Color: this.Color,
                X: [x],
                Y: [y],
                Param: this.Param
            };
            first(this.Type, this.Color, x, y, this.Param);
        },
        Continue: function (x, y) {
            var c = this.Current;
            if (!c) return;
            c.X.push(x);
            c.Y.push(y);
            second(c.Type, c.Color, c.X, c.Y, c.X.length - 1, c.Param);
        },
        End: function () {
            var c = this.Current;
            if (!c) return;
            this.Current = null;
            // drawer.update(this.Image); // not refresh
            this.OnNewDraw(c);
        },
        OnNewDraw: function(Data){
            if(!Data) return;
            this.Append(Data);
        },
        Append: function (Data) {
            if(!Data) return;
            drawer.update(this.Image);
            //this.Images.push(this.Image);
            draw(Data);
            this.Image = drawer.getimage();
            this.AllData.push(Data);
            draw(this.Current);
        },
        Update: function(){
            this.Image = drawer.getimage();
        }
    };
    canvas.onmousedown = (function (f) {
        return !f ?
            function(){
                result.Begin(event.offsetX, event.offsetY);
            }
            :
            function(){
                result.Begin(event.offsetX, event.offsetY);
                f();
            };
    })(canvas.onmousedown);
    canvas.onmousemove = (function (f) {
        return !f ?
            function(){
                result.Continue(event.offsetX, event.offsetY);
            }
            :
            function(){
                result.Continue(event.offsetX, event.offsetY);
                f();
            };
    })(canvas.onmousemove);
    canvas.onmouseup = (function (f) {
        return !f ?
            function(){
                result.End();
            }
            :
            function(){
                result.End();
                f();
            };
    })(canvas.onmouseup);
    return result;
}
function VerifyDrawData(data){
    if(!data.Type) return false;
    if(!data.Color) return false;
    try{
        if(!(0 in data.Color)) return false;
        if(!(1 in data.Color)) return false;
        if(!(2 in data.Color)) return false;
    }catch(e){ return false; }
    if(!data.X) return false;
    if(!data.Y) return false;
    if(!data.X.length) return false;
    if(!data.Y.length) return false;
    try{ if(data.X.length != data.Y.length) return false; }
    catch(e){ return false; }
    if(!data.Param) return false;
    switch(data.Type){
        case 1:
            if(!data.Param.r) return false;
            break;
        default:
            return false;
    }
    return true;
};