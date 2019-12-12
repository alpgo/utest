
// 
const noop = function () { };

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
export function printLoc(err) {
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