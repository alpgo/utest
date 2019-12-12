
/**
 * 对象方法
 *
 * @class
 */
export class Method {
    /**
     * 获取方法的类型
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

        this.desp = Object.getOwnPropertyDescriptor(this.obj, this.name);

        this.type = this.getMethodType(this.key);

    }

}