declare namespace UTEST {
    // 打印
    function print(error, ...args): void;

    // 启用调试工具
    function setON(): void;

    // 对象方法配置
    function parseMethod(obj: any): void;

    // [动态配置] 为了灵活性, 可动态地添加配置, 一般会结合条件参数过滤原始函数的调试触发时机
    function setDebugMethod(accessKey: string, target: Object, methodKey?: string, cond?: Function): Function;

    // 所谓的[静态配置]及[动态配置]只是记录了一些配置信息而已
    // runDebugMethod会利用配置信息, 通过Object.defineProperty动态修改原始函数, 使得原始函数具备了调试功能
    // 特别地, 此处并没有主动调用了原始函数, 所以该调试工具没有影响被调试原项目的一切逻辑. 只是当原项目中的某个函数被调用了, 会自动触发调试而已. 
    function runDebugMethod(accessKey: string, condition?: Function): void;

    // 普通函数配置
    function parseFunc(obj: any);

    // 重新定义普通方法
    function eval(fn: Function, key?: string, cond?: Function | boolean);

    // 动态配置普通函数的判断条件
    function updateDebugFunc(key: string, cond: Function | boolean);
}
