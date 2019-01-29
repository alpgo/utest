declare namespace UTEST {
    // 启用调试工具
    function setON(): void;
    // [静态配置] 配置哪些函数可以被调试(obj = {key: 方法名称, value: 方法所属对象 })
    function parseConfig(obj: Object): void;
    // 类似console.log, 但是包含相关的函数调用位置信息
    function printMsgLoc(error, ...args): void;
    // [动态配置] 为了灵活性, 可动态地添加配置, 一般会结合条件参数过滤原始函数的调试触发时机
    function setDebugMethod(accessKey: string, target: Object, cond?: Function, methodKey?: string): Function;
    // 所谓的[静态配置]及[动态配置]只是记录了一些配置信息而已
    // runDebugMethod会利用配置信息, 通过Object.defineProperty动态修改原始函数, 使得原始函数具备了调试功能
    // 特别地, 此处并没有主动调用了原始函数, 所以该调试工具没有影响被调试原项目的一切逻辑. 只是当原项目中的某个函数被调用了, 会自动触发调试而已. 
    function runDebugMethod(accessKey: string, condition?: Function): void;
}

// [备注] UTEST 与 测试工具的区别: 
// UTEST应该理解为"调试工具", 是一个调试帮手, 可以帮助我们快速的调试某一个函数, 快速了解一个函数的前后调用顺序与关系, 然后进入函数内部, 逐步调试, 理解原理或者检查错误.
// 而一般地测试框架或测试工具, 是写了很多测试代码, 然后(主动)运行所有测试方法, 验证原项目的代码正确性. 
// 而调试工具不会调用任何原始方法, 只是将原始方法标记为调试方法, 调试方法在原项目运行时, 算是被动的触发了. 