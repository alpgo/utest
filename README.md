# utest
 to debug javascript method simple

### `示例代码`
```
    function Person(){
        this.name = "";
    }

    Person.prototype.getName = function(num){
        return this.name;
    }

    var obj = {
        name: "", 
        getName: function(){
            return this.name;
        }
    };
```

# `对象方法的调试`

1. **设置UTEST有效. 默认时, UTEST无效.**
```
    UTEST.setON(); 
```

2. **静态配置**
-  *第一种配置方式*
```
    UTEST.parseMethod({
        getName: Person.prototype
    });

    // 下面的配置与上面的配置冲突了, 使用了相同的 getName 作为键值 (见第二种配置)
    UTEST.parseMethod({
        getName: obj
    });
```
- *第二种配置方式*  `(这里避免了第一种配置的命名冲突)`
```
    UTEST.parseMethod({
        otherGetName: [Person.prototype, "getName"],
        getName: obj
    });
```
- *第三种配置方式*  `(添加方法条件过滤)`
```
    UTEST.parseMethod({

        // 表示 Person.prototype.getName 方法运行时的参数在 num > 10 时才可以被调试
        otherGetName: [Person.prototype, "getName", function(num){return num > 10;}],

        getName: obj
    });

    // 或者
    UTEST.parseMethod({
        getName: [Person.prototype, "getName", function(num){return num > 10;}],
        otherGetName: [obj, "getName"]
    });
```

3. **动态配置**
```
    // 参数格式
    UTEST.setDebugMethod("唯一键值", 对象, 条件方法, 对象的方法名); 
```
```
    // 当无条件方法 && 方法名与键值相同
    UTEST.setDebugMethod("getName", Person.prototype); 

    // 方法名与键值不相同 (方法名不可省略)
    UTEST.setDebugMethod("otherGetName", Person.prototype, "getName", null); 

    // 有条件方法 && 方法名与键值相同
    UTEST.setDebugMethod("getName", Person.prototype, "getName", function(num){return num > 10;}); 

    // 可简写为
    UTEST.setDebugMethod("getName", Person.prototype, function(num){return num > 10;}); 
    // 有条件方法 && 方法名与键值不相同

    UTEST.setDebugMethod("otherGetName", Person.prototype, "getName", function(num){return num > 10;}); 
```

4. **将配置的方法更新为调试方法**

以上配置仅仅是记录了一些相关数据, 以及为每个方法配置了一个`唯一的键值`, 下面通过`该唯一键值设置调试方法`
```
    UTEST.runDebugMethod("otherGetName");

    // 可传入新的过滤条件, 配置默认的条件
    UTEST.runDebugMethod("otherGetName", function(num){return num > 20;});

    // 补充: 为了代码的书写, 下面的在配置完后立即更新原始方法
    UTEST.setDebugMethod("getName", Person.prototype)(); 
```

# 普通函数的调试

动机: 
- 一些第三方库中的很多函数是private, 为了运行时能够定位到内部. 
- 缺点是需要在源码中添加一行代码`eval(UTEST.eval(fn));`
- 优点: 虽然需要更改第三方库源码, 但是作为研究使用, 提供给了我们一个更多的调试记录能力.
- 在项目库中, 如果能够在发布时, 利用脚本工具, 将所有的`eval(UTEST.eval(fn));`全部清掉, 那么也没有什么影响了.

参考[代码示例](./resursion.html)
```
    UTEST.setON();
    function test(){}
    eval(UTEST.eval(test));
    UTEST.parseFunc({"test": true});
    test();
```