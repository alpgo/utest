var UTEST = (function (exports) {
  'use strict';

  // 
  var noop = function () { };

  /**
    * 控制台打印方法. 可打印出函数的调用栈. 很方便查看函数代码的调用顺序.
    * @param {Error} [err] - 错误对象, 因为该对象包含了函数调用堆栈信息
    * @return {Function} 可进一步打印出Array或者Object等数据
    * @example
    *  printLoc(new Error(), "hello");
    *  printLoc(new Error(), "hello", "This is a message");
    *  printLoc(new Error(), "hello", "This is a message")({name: "utest"});
    *  printLoc(new Error(), "hello", "This is a message")(["one", "two"]);
    */
  function printLoc(err) {
      // 检测err
      if (Object.prototype.toString.call(err) != "[object Error]") {
          console.warn('The First param must be an Error Object');
          return noop;
      }

      // 提取函数调用堆栈信息
      var lines = err.stack.split('\n');
      var msg = Array.prototype.slice.call(arguments, 1).join(" ");
      var firstLine = "Error\t" + msg;
      var result = [firstLine].concat(lines.slice(1)).join("\n");
      console.log(result);
      return function () { console.log.apply(null, arguments); };
  }

  /**
   * 获取方法的原始函数
   * @param {string} type 方法类型(get方法, set方法, 普通方法)
   * @param {object} obj  包含方法的对象
   * @param {string} name 方法名称
   * @return {function}
   */
  function getOriginFunc(type, obj, name) {
      var desp = Object.getOwnPropertyDescriptor(obj, name);
      if (desp.value) {
          return desp.value;
      }
      if (desp.get && "get" === type) {
          return desp.get;
      }
      if (desp.set && "set" === type) {
          return desp.set;
      }
      console.warn(("something run, maybe type: " + type));
      return function () { };
  }

  /**
   * @class
   */
  var Method = function Method(options) {
      options = options || {};

      /**
       * 一个方法对应的唯一键值
       * 命令规则: 方法名-类型
       * @example 
       * name-get name-set name
       * 
       * @member {string} 
       */
      this.key = options.key;

      this.obj = options.obj;

      this.name = options.name;

      this.cond = options.cond || function () { return true };

      /**
       * 方法的descriptor
       */
      this.desp = Object.getOwnPropertyDescriptor(this.obj, this.name);

      /**
       * 方法的类型
       */
      this.type = Method.getMethodType(this.key);

      /**
       * 原始方法的函数
       */
      this.func = getOriginFunc(this.type, this.obj, this.name);
  };

  /**
   * 设置代理方法
   * @param {function} newFunc
   */
  Method.getMethodType = function getMethodType (key) {
      var type = key.split('-')[1];
      return type;
  };

  Method.prototype.setProxyMethod = function setProxyMethod (newFunc) {
      if (this.desp.value) {
          this.desp.value = newFunc;
      }
      if (this.desp.get && "get" === this.type) {
          this.desp.get = newFunc;
      }
      if (this.desp.set && "set" === this.type) {
          this.desp.set = newFunc;
      }
      Object.defineProperty(this.obj, this.name, this.desp);
  };

  /**
   * 恢复原始方法
   */
  Method.prototype.setOriginMethod = function setOriginMethod () {
      var type = this.type;
      if (this.desp.value) {
          this.desp.value = this.func;
      }
      if (type == "get" && this.desp.get) {
          this.desp.get = this.func;
      }
      if (type == "set" && this.desp.set) {
          this.desp.set = this.func;
      }
      Object.defineProperty(this.obj, this.name, this.desp);
  };

  Method.prototype.toDebug = function toDebug () {
      var that = this;
      this.setProxyMethod(function () {
          var testFlag = false;
          var cond = that.cond;

          // 若条件判断正确, 则添加调试
          if (cond.apply(this, arguments)) {
              testFlag = true;
              printLoc(new Error(), ("[name]: " + (that.name)));
              debugger;
          }

          var result = that.originFunc.apply(this, arguments);

          // 如果已经被测试完, 则立即恢复原函数. 
          // 否则, 继续保持待测试状态, 直到测试完再恢复. 
          if (testFlag) {
              that.setOriginMethod();
          }

          return result;
      });
  };

  /**
   * @constant {string: Method} container
   */
  var container = {};

  /**
   * 保存配置
   * @param {string} key 
   * @param {Method} method 
   */
  function save(key, method) {
      container[key] = method;
  }

  /**
   * 获取配置
   * @param {string} key 
   * @return {Method | null} 
   */
  function get(key) {
      return container[key] || null;
  }

  /**
   * 设置方法为待调试方法
   * 当待测试的方法运行时, 会暂停运行
   * 
   * @param {string} key 方法对应的唯一键值
   */
  function run(key) {
      var method = get(key);
      if (!method) {
          console.warn("无法找到键值: {" + key + "} 对应的对象方法");
          return;
      }
      method.toDebug();
  }

  exports.Method = Method;
  exports.get = get;
  exports.run = run;
  exports.save = save;

  return exports;

}({}));
//# sourceMappingURL=utest.js.map
