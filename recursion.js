// 递归程序应用调试的小示例, 可以定位到进入num=10时, 函数暂停,然后进入函数内部单步运行, 查看函数运行效果. 
var arr = [];
var obj = {};
function f(num) {
    if (num == 0 || num == 1) {
        return 1;
    }
    if (num >= 2) {
        var a = obj.f(num - 1);
        var b = obj.f(num - 2);
        arr[num] = a + b;
        return a + b;
    }
}
obj.f = f;

// 这里配置当执行到f(10)的时候, 程序暂停, 开始单步调试了
UTEST.setON();
UTEST.setDebugMethod("f", obj, function (num) { return num == 10; })();

var value = obj.f(20);
console.log(value);
// console.log(arr);
