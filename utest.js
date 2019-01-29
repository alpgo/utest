var UTEST = (function createUTestLib() {
    // 存储所有配置信息
    var container = {};

    // 启用测试工具(默认无效)
    var state = false;

    // 可追踪调用过程的打印方法
    function printMsgLoc(error, ...args) {
        // 检测参数
        if (Object.prototype.toString.call(error) != "[object Error]") {
            console.warn('the first param not an Error');
            return;
        }
        // 分解多行处理
        var lines = error.stack.split('\n');
        // error.message 输出哪些调用位置的行数信息, "1:"表示从第二个开始, ":6"表示从开始到第7个位置结束等.
        var range = error.message.split(":");
        var startLine = (+range[0]) || 1;           // 默认从第2行开始显示
        var endLine = (+range[1]) || lines.length;  // 最后的显示位置的行数
        // 打印的参数信息 {// arguments[1..] 简单的数据输出（数字, 字符串）}
        var message = [].slice.call(arguments, 1).join(" ");
        // 更新第一行数据
        var line0 = lines[0].slice(0, 5) + "\t" + message;
        // 组合多行内容
        var result = [line0].concat(lines.slice(startLine, endLine + 1)).join("\n");

        console.log(result);

        return function () {
            console.log.apply(null, arguments);
        };
    }

    // 检测测试方法的accessKey是否重复(避免不同的方法使用相同的accessKey)
    function doesAccessKeyRepeat(accessKey, target, methodKey) {
        // chess parameters
        const item = container[accessKey];
        if (item) {
            // 判断目前设置的方法与已经设置的item对应的方法是否为相同的方法
            const sameTargetAndMethod = (item.target === target && item.methodKey === methodKey);
            if (!sameTargetAndMethod) {
                // 不同的方法使用了相同的accessKey
                console.warn(`不同的函数对象使用了相同的访问属性${accessKey},请保持唯一性`);
                return true;
            } else {
                //  同一个方法, 会使用新的条件, 重复设置该方法target.methodKey为调试方法
            }
        }
        return false;
    }

    // 封装测试方法
    function createDebugObj(options) {
        let descriptor = Object.getOwnPropertyDescriptor(options.target, options.methodKey);
        if (!descriptor) {
            console.warn("配置错误: ", options);
            return null;
        }
        let originFunc = descriptor.value || descriptor.set;
        return {
            target: options.target,
            methodKey: options.methodKey,
            lastCond: options.cond,
            currentCond: options.cond,
            originFunc: originFunc,
            running: false,
            run: function (position) {
                var that = this;
                that.updateOrginMethod(function () {
                    // 注(该库的核心部分): 这里的this才是正在测试函数的调用者
                    var testFlag = false;
                    var cond = that.currentCond;
                    // 若没有条件过滤 || 条件判断正确, 则添加调试
                    if (!cond || cond.apply(this, arguments)) {
                        testFlag = true;
                        printMsgLoc(new Error(), `[method]: ${that.methodKey}`);
                        position && printMsgLoc(position, "触发该调试的位置");
                        debugger;
                    }
                    var result = that.originFunc.apply(this, arguments);
                    // 虽然支持动态测试,但是不支持多个连续的动态条件设置, 每次函数执行只支持最近一次的动态设置, 然后恢复到静态的配置.(代码确实很蹩脚,实用即可)
                    // 如果已经被测试完, 则立即恢复原函数. 否则, 继续保持待测试状态,等待测试条件满足了,测试完再恢复. 
                    testFlag && that.recoverOrginMethod();
                    // 当动态设置的条件完成测试后,该恢复静态设置的默认条件了.
                    testFlag && that.recoverDefaultOptions();
                    return result;
                });
            },
            recoverOrginMethod: function () {
                this.running = false;
                if (descriptor.value) {
                    descriptor.value = this.originFunc;
                } else if (descriptor.set) {
                    descriptor.set = this.originFunc;
                }
                Object.defineProperty(options.target, options.methodKey, descriptor);
            },
            updateOrginMethod: function (newFunc) {
                this.running = true;
                if (descriptor.value) {
                    descriptor.value = newFunc;
                } else if (descriptor.set) {
                    descriptor.set = newFunc;
                }
                Object.defineProperty(options.target, options.methodKey, descriptor);
            },
            recoverDefaultOptions: function () {
                this.currentCond = this.lastCond;
            },
            updateDefaultOptions: function (cond) {
                this.currentCond = cond;
            }
        };
    }

    /**
     * 标记原始方法为可调式方法
     * @param accessKey 直接访问的属性名称(默认: methodKey相同)
     * @param target 原始方法的对象
     * @param methodKey 原始方法的名称
     * @param cond 测试成立条件
     */
    function setDebugMethod(accessKey, target, cond, methodKey) {
        if (!state) {
            return function () { };
        }
        methodKey = methodKey || accessKey;
        if (doesAccessKeyRepeat(accessKey, target, methodKey)) {
            return;
        }
        let obj = container[accessKey] || createDebugObj({
            accessKey: accessKey,
            target: target,
            methodKey: methodKey,
            cond: cond
        });
        if (!obj) {
            return;
        }
        // 更新调试参数信息
        obj.updateDefaultOptions(cond);
        container[accessKey] = obj;
        return function () {
            obj.run(new Error("2:"));
        };
    }

    // 添加配置的测试方法
    function parseConfig(configObj) {
        var keys = Object.keys(configObj);
        keys.forEach(key => {
            var value = configObj[key];
            var target = value;
            var methodKey = key;
            var cond = null;
            // 繁琐混乱的参数解析过程.
            if (Object.prototype.toString.call(value) == '[object Array]') {
                target = value[0];
                let param2 = value[1];
                if (typeof param2 == 'string') {
                    methodKey = param2;
                    cond = value[2];
                } else {
                    cond = param2;
                }
            }
            setDebugMethod(key, target, cond, methodKey);
        });
    }

    /**
     * 通过Object.defineProperty()动态修改原始方法, 以待真正运行时, 显示调试位置 ... 
     * @param {*} accessKey String 调试方法对应的唯一标识符
     * @param {*} condition Function 通过捕获原始方法的参数, 判断是否显示测试信息
     */
    function runDebugMethod(accessKey, condition) {
        let obj = container[accessKey];
        if (!state) {
            console.warn("UTEST工具没有启用");
            return;
        }
        if (!obj) {
            console.warn(`找不到测试方法${accessKey}`);
            return;
        }
        if (condition) {
            setDebugMethod(accessKey, obj.target, condition, obj.methodKey);
        } else {
            obj.updateDefaultOptions(null);
        }
        // 传递Error对象, 即可发现该runDebugMethod何时被调用了, 忽略该方法的显示位置
        obj.run(new Error("2:"));
    }

    // 导出方法
    var UTEST = {};
    UTEST.printMsgLoc = printMsgLoc;
    UTEST.parseConfig = parseConfig;
    UTEST.setDebugMethod = setDebugMethod;
    UTEST.runDebugMethod = runDebugMethod;
    UTEST.setON = function () {
        state = true;
    };
    return UTEST;
}());