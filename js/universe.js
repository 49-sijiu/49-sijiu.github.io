// 自动创建universe canvas元素
(function() {
    if (!document.getElementById('universe')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'universe';
        // CSS已经在universe.css中定义，这里不需要重复定义样式
        document.body.appendChild(canvas);
        console.log('🎯 已自动创建universe背景画布');
    }
})();

function dark() {
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    
    var n, e, i, h, t = .05,
        s = document.getElementById("universe"),
        o = !0,
        a = "180,184,240",  // 巨型星星颜色（淡蓝色）
        r = "226,225,142",  // 普通星星颜色（淡黄色）
        d = "226,225,224",  // 流星颜色（白色）
        c = [];

    // 初始化画布尺寸
    function f() {
        n = window.innerWidth;
        e = window.innerHeight;
        i = .216 * n;
        s.setAttribute("width", n);
        s.setAttribute("height", e);
    }

    // 绘制所有星星
    function u() {
        h.clearRect(0, 0, n, e);
        for (var t = c.length, i = 0; i < t; i++) {
            var s = c[i];
            s.move();
            s.fadeIn();
            s.fadeOut();
            s.draw();
        }
    }

    // 星星对象构造函数
    function y() {
        this.reset = function() {
            this.giant = m(3);
            this.comet = !this.giant && !o && m(10);
            this.x = l(0, n - 10);
            this.y = l(0, e);
            this.r = l(1.1, 2.6);
            this.dx = l(t, 6 * t) + (this.comet + 1 - 1) * t * l(50, 120) + 2 * t;
            this.dy = -l(t, 6 * t) - (this.comet + 1 - 1) * t * l(50, 120);
            this.fadingOut = null;
            this.fadingIn = !0;
            this.opacity = 0;
            this.opacityTresh = l(.2, 1 - .4 * (this.comet + 1 - 1));
            this.do = l(5e-4, .002) + .001 * (this.comet + 1 - 1);
        };

        this.fadeIn = function() {
            this.fadingIn && (this.fadingIn = !(this.opacity > this.opacityTresh), this.opacity += this.do);
        };

        this.fadeOut = function() {
            this.fadingOut && (this.fadingOut = !(this.opacity < 0), this.opacity -= this.do / 2, (this.x > n || this.y < 0) && (this.fadingOut = !1, this.reset()));
        };

        this.draw = function() {
            if (h.beginPath(), this.giant) {
                // 绘制巨型星星（圆形）
                h.fillStyle = "rgba(" + a + "," + this.opacity + ")";
                h.arc(this.x, this.y, 2, 0, 2 * Math.PI, !1);
            } else if (this.comet) {
                // 绘制流星（带轨迹）
                h.fillStyle = "rgba(" + d + "," + this.opacity + ")";
                h.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, !1);
                for (var t = 0; t < 30; t++) {
                    h.fillStyle = "rgba(" + d + "," + (this.opacity - this.opacity / 20 * t) + ")";
                    h.rect(this.x - this.dx / 4 * t, this.y - this.dy / 4 * t - 2, 2, 2);
                    h.fill();
                }
            } else {
                // 绘制普通星星（矩形）
                h.fillStyle = "rgba(" + r + "," + this.opacity + ")";
                h.rect(this.x, this.y, this.r, this.r);
            }
            h.closePath();
            h.fill();
        };

        this.move = function() {
            this.x += this.dx;
            this.y += this.dy;
            !1 === this.fadingOut && this.reset();
            (this.x > n - n / 4 || this.y < 0) && (this.fadingOut = !0);
        };

        setTimeout(function() {
            o = !1;
        }, 50);
    }

    // 随机数生成器
    function m(t) {
        return Math.floor(1e3 * Math.random()) + 1 < 10 * t;
    }

    function l(t, i) {
        return Math.random() * (i - t) + t;
    }

    // 初始化
    f();
    window.addEventListener("resize", f, !1);

    // 创建画布上下文和星星
    (function() {
        h = s.getContext("2d");
        for (var t = 0; t < i; t++) {
            c[t] = new y;
            c[t].reset();
        }
        u();
    })();

    // 动画循环（仅在黑暗模式下运行）
    (function t() {
        document.getElementsByTagName('html')[0].getAttribute('data-theme') == 'dark' && u();
        window.requestAnimationFrame(t);
    })();
}

dark();