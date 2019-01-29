// 此处引用$为命名空间
var $ = (function () {
    var blueObj = {
        offsetX: 100,   // 圆心水平坐标
        radius: 50,     // 半径
        step: 1         // 运动方向(从左向右)
    };

    var redObj = {
        offsetX: 300,
        radius: 50,
        step: -1         // 运动方向(从右向左)
    };

    // 背景颜色分量
    var redColor = 255;
    var greenColor = 255;
    var blueColor = 255;

    var ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
    var stageWidth = ctx.canvas.width;
    var stageHeight = ctx.canvas.height;

    // 模块对象
    var obj = {
        count: 0,   // 相切次数
        render: function render() {
            this.renderStage();
            this.checkDistance();
        },
        renderStage: function () {
            // 添加该方法, 是为了更好的展示 UTEST.printMsgLoc 可以打印出函数的调用路径
            this.renderBg();
            this.renderBlue();
            this.renderRed();
        },
        renderBg: function renderBg() {
            ctx.clearRect(0, 0, stageWidth, stageHeight);
            ctx.fillStyle = ["rgba(" + redColor, greenColor, blueColor, "1)"].join(",");
            ctx.fillRect(0, 0, stageWidth, stageHeight);
        },
        renderBlue: function renderBlue() {
            ctx.save();
            ctx.fillStyle = "#FF0000";
            ctx.beginPath();
            ctx.arc(blueObj.offsetX, stageHeight / 2, blueObj.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        },
        renderRed: function renderRed() {
            ctx.save();
            ctx.fillStyle = "#0000FF";
            ctx.beginPath();
            ctx.arc(redObj.offsetX, stageHeight / 2, redObj.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        },
        // 动画
        animate: function animate() {
            loop(blueObj);
            loop(redObj);
            setTimeout(() => {
                animate();
            }, 20);
            function loop(obj) {
                if (obj.offsetX < obj.radius) {
                    obj.offsetX = obj.radius;
                    obj.step = 1;
                }
                if (obj.offsetX > stageWidth - obj.radius) {
                    obj.offsetX = stageWidth - obj.radius;
                    obj.step = -1;
                }
                obj.offsetX += obj.step;
            }
        },
        // 检测碰撞
        checkDistance: function checkDistance() {
            // 两圆相切
            if (Math.abs(blueObj.offsetX - redObj.offsetX) === (blueObj.radius + redObj.radius)) {
                this.count++;
                redColor = Math.floor(Math.random() * 256);
                greenColor = Math.floor(Math.random() * 256);
                blueColor = Math.floor(Math.random() * 256);
                this.qie(this.count);
            }
        },
        // 相切时被调用: (测试程序将会捕获count参数决定是否打印断点, 这个是测试工具的条件控制方法)
        qie: function (count) {
            console.log("第" + count + "次相切");
        }
    };

    // 打印当前背景颜色
    // 这里是为了演示UTEST工具同时支持set方法的配置(在typescript中set方法有着漂亮的写法, js中就是丑陋的defineProperty写法了)
    Object.defineProperty(obj, 'printColor', {
        get: function () { },
        set: function (value) {
            console.log([redColor, greenColor, blueColor].join());
        },
        enumerable: true,
        configurable: true
    });

    obj.start = function () {
        obj.animate();
        render();
    };

    function render() {
        obj.render();
        requestAnimationFrame(render);
    }

    return obj;
}());

$.start();
