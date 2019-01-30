var UTEST = UTEST || (function () {

    // 启用测试工具(默认无效)
    var _state = false;

    /**
     * 打印方法
     * @param {Error} err 包含了函数调用堆栈信息
     * Example: 
     *  printLoc(new Error(), "hello");
     *  printLoc(new Error(), "hello", "This is a message");
     *  printLoc(new Error(), "hello", "This is a message")({name: "utest"});
     *  printLoc(new Error(), "hello", "This is a message")(["one", "two"]);
     */
    function printLoc(err) {
        // 检测err
        if (Object.prototype.toString.call(err) != "[object Error]") {
            console.warn('The First param must be an Error Object');
            return;
        }
        // 提取函数调用堆栈信息
        var lines = err.stack.split('\n');
        var msg = Array.prototype.slice.call(arguments, 1).join(" ");
        var firstLine = "Error\t" + msg;
        var result = [firstLine].concat(lines.slice(1)).join("\n");
        console.log(result);
        return function () { console.log.apply(null, arguments); };
    }

    // 普通函数 (该文件中一般用func或fobj表示, f开头)
    function Func(fn, key, cond) {
        this.key = key;
        this.fn = fn;
        this.name = this.fn.name;
        this.str = Function.prototype.toString.call(this.fn);
        this.cond = cond;
    }

    Func.prototype.updateData = function (data) {
        this.cond = data.cond;
    };

    Func.prototype.generateStr = function () {
        var str = Function.prototype.toString.call(this.fn);
        var arr = str.split('');
        var pos = arr.indexOf('{') + 1;
        arr.splice(pos, 0, this.generateStatement());
        var newStr = arr.join("");
        return newStr;
    };

    Func.prototype.generateStatement = function () {
        return "\n\tUTEST.getFunc('" + this.key + "').apply(null, arguments);";
    };

    Func.prototype.handle = function () {
        if (!this.cond) return;
        if (this.cond === true
            || (typeof this.cond == 'function' && this.cond.apply(null, arguments))
        ) {
            this.cond = false;
            printLoc(new Error());
            debugger;
        }
    };


    // 普通函数管理模块
    var funcModule = {
        cache: {}, // Map<{String}><{Func}>
        get: function (key) {
            return this.cache[key] || null;
        },
        save: function (key, fobj) {
            if (!this.validateData(key, fobj)) {
                return false;
            }
            this.cache[key] = fobj;
            return true;
        },
        push: function (data) {
            var fobj = this.get(data.key);
            fobj && fobj.updateData(data);
        },
        validateData: function (key, fobj) {
            // 检测函数key冲突, 可能不同的函数使用了相同的key 
            // (这里并非精确判断, 实际上闭包中函数可以多次执行,也不可能做到精确判断)
            // 这里判断两个原始函数的字符串一样, 即视为相同的函数
            var theObj = this.get(key);
            if (theObj && theObj.str != fobj.str) {
                console.warn("两个普通函数的key冲突了, 函数名称分别为: [" + theObj.name + " " + fobj.name + "]");
                return false;
            }
            return true;
        },
        run: function (key) {
            var fobj = this.get(key);
            fobj && fobj.handle();
        }
    };

    // 对象方法 (该文件中一般用method或mobj表示, m开头)
    // @param {String} key 唯一键值
    // @param {Object} obj 对象(方法的拥有者)
    // @param {String} method 方法名称
    // @param {Function | null} cond 判断条件
    function Method(key, obj, method, cond) {
        this.key = key;
        this.obj = obj;
        this.method = method;
        this.cond = cond;
        this.desp = Object.getOwnPropertyDescriptor(obj, method);
        this.originFunc = this.desp.value || this.desp.set;
    }

    Method.prototype.updateData = function (data) {
        this.cond = data.cond;
    };

    Method.prototype.updateMethod = function (newFunc) {
        if (this.desp.value) {
            this.desp.value = newFunc;
        }
        if (this.desp.set) {
            this.desp.set = newFunc;
        }
        Object.defineProperty(this.obj, this.method, this.desp);
    };

    Method.prototype.recoverMethod = function () {
        if (this.desp.value) {
            this.desp.value = this.originFunc;
        }
        if (this.desp.set) {
            this.desp.set = this.originFunc;
        }
        Object.defineProperty(this.obj, this.method, this.desp);
    };

    Method.prototype.handle = function () {
        var that = this;
        this.updateMethod(function () {
            var testFlag = false;
            var cond = that.cond;
            // 若没有条件过滤 || 条件判断正确, 则添加调试
            if (!cond || cond.apply(this, arguments)) {
                testFlag = true;
                printLoc(new Error(), `[method]: ${that.method}`);
                debugger;
            }
            var result = that.originFunc.apply(this, arguments);
            // 如果已经被测试完, 则立即恢复原函数. 否则, 继续保持待测试状态, 直到测试完再恢复. 
            testFlag && that.recoverMethod();
            return result;
        });
    };

    // 对象方法管理模块
    var methodModule = {
        cache: {},  // Map<{String}><{Method}>
        get: function (key) {
            return this.cache[key] || null;
        },
        save: function (key, mobj) {
            this.cache[key] = mobj;
        },
        createObj: function (data) {
            return new Method(data.key, data.obj, data.method, data.cond);
        },
        push: function (data) {
            if (!this.validateData(data)) { return; }
            var mobj = this.get(data.key) || this.createObj(data);
            mobj.updateData(data);
            this.save(data.key, mobj);
        },
        validateData: function (data) {
            // 检测方法key冲突, 可能不同的对象方法使用了相同的key
            var mobj = this.cache[data.key];
            // 不同的对象 或者 不同的方法名称
            if (mobj && (mobj.obj !== data.obj || mobj.method !== data.method)) {
                console.warn('不同的方法使用了相同的键值: ' + data.key + ', 方法名称分别为[' + mobj.method + " " + data.method + ']');
                return false;
            }
            return true;
        },
        run: function (key, cond) {
            var mobj = this.get(key);
            if (!mobj) {
                console.warn("无法找到键值: {" + key + "} 对应的对象方法");
                return;
            }
            if (cond) {
                mobj.updateData({ cond: cond });
            } else {
                mobj.updateData({ cond: null });
            }
            mobj.handle();
        }
    };

    // 对象方法解析静态配置
    var parser = {
        type: "", // "method" or "func"
        parse: function (options) {
            var that = this;
            var keys = Object.keys(options);
            keys.forEach(function (key) {
                var data = options[key];
                if (Object.prototype.toString.call(data) == '[object Array]') {
                    (that.type == "method") ? that.parseMethodArray(key, data) : that.parseFunc(key, data);
                } else {
                    (that.type == "method") ? that.parseMethod(key, data, key, null) : that.parseFunc(key, data);
                }
            });
        },
        parseMethod: function (key, obj, method, cond) {
            methodModule.push({
                key: key,
                obj: obj,
                method: method,
                cond: cond
            });
        },
        parseMethodArray: function (key, arr) {
            // arr : [obj] or [obj, cond] or [obj, method] or [obj, method, cond] 
            var obj = arr[0];
            var method, cond;
            if (arr.length == 1) {
                method = key;
                cond = null;
            } else if (arr.length == 2) {
                if (typeof arr[1] == 'string') {
                    method = arr[1];
                    cond = null;
                } else if (typeof arr[1] == 'function') {
                    cond = arr[1];
                    method = key;
                } else {
                    console.warn('parse failure');
                }
            } else if (arr.length == 3) {
                method = arr[1];
                cond = arr[2];
            } else {
                console.warn('arr length too long');
            }

            this.parseMethod(key, obj, method, cond);
        },
        parseFunc: function (key, data) {
            funcModule.push({
                key: key,
                cond: data
            });
        }
    };

    return {
        // 工具函数
        print: printLoc,
        setON: function () {
            this._state = true;
        },
        // 普通函数
        parseFunc: function (options) {
            parser.type = "func";
            parser.parse(options);
        },
        // 动态配置普通函数的条件
        updateDebugFunc: function (key, data) {
            var obj = {};
            obj[key] = data;
            this.parseFunc(obj);
        },
        // 重新定义普通方法
        eval: function (fn, key, cond) {
            key = key || fn.name;
            var fnObj = new Func(fn, key, cond);
            return funcModule.save(key, fnObj) ? fnObj.generateStr() : "";
        },
        getFunc: function (key) {
            if (!this._state) return function () { };
            var fobj = funcModule.get(key);
            return fobj.handle.bind(fobj) || function () { };
        },
        // 对象方法
        parseMethod: function (options) {
            parser.type = "method";
            parser.parse(options);
        },
        // 更新方法, 更新后的方法支持调试
        runDebugMethod: function (key, cond) {
            if (!this._state) return;
            methodModule.run(key, cond);
        },
        // 动态配置
        setDebugMethod: function (key, obj, method, cond) {
            var data = {};
            data[key] = Array.prototype.slice.call(arguments, 1);
            this.parseMethod(data);
            return function () {
                var mobj = methodModule.get(key);
                mobj && mobj.handle();
            };
        }
    };
})();