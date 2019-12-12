import * as utils from '../utils/index';

/**
 * @class
 */
export class Method {
    /**
     * 获取方法的类型
     * @static
     * @param {string} [key] - 方法对应的唯一键值
     * @return {string} "get" | "set" | ""
     */
    static getMethodType(key) {
        let type = key.split('-')[1];
        return type;
    }

    /**
     * @param {object} [options] - 配置参数.
     * @param {string} [options.key] - 与配置对应的唯一键值
     * @param {object} [options.obj] - 包含原方法的对象
     * @param {string} [options.name] - 原方法的函数名称
     * @param {function | undefined} [options.cond] - 捕获方法的原始参数, 根据参数决定是否添加断点
     */
    constructor(options) {
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
        this.func = utils.getOriginFunc(this.type, this.obj, this.name);
    }

    /**
     * 设置代理方法
     * @param {function} newFunc
     */
    setProxyMethod(newFunc) {
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
    }

    /**
     * 恢复原始方法
     */
    setOriginMethod() {
        const type = this.type;
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
    }

    toDebug() {
        let that = this;
        this.setProxyMethod(function () {
            let testFlag = false;
            let cond = that.cond;

            // 若条件判断正确, 则添加调试
            if (cond.apply(this, arguments)) {
                testFlag = true;
                utils.printLoc(new Error(), `[name]: ${that.name}`);
                debugger;
            }

            const result = that.originFunc.apply(this, arguments);

            // 如果已经被测试完, 则立即恢复原函数. 
            // 否则, 继续保持待测试状态, 直到测试完再恢复. 
            if (testFlag) {
                that.setOriginMethod();
            }

            return result;
        });
    }
}