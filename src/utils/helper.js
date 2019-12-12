
/**
 * 获取方法的原始函数
 * @param {string} type 方法类型(get方法, set方法, 普通方法)
 * @param {object} obj  包含方法的对象
 * @param {string} name 方法名称
 * @return {function}
 */
export function getOriginFunc(type, obj, name) {
    let desp = Object.getOwnPropertyDescriptor(obj, name);
    if (desp.value) {
        return desp.value;
    }
    if (desp.get && "get" === type) {
        return desp.get;
    }
    if (desp.set && "set" === type) {
        return desp.set;
    }
    console.warn(`something run, maybe type: ${type}`);
    return function () { };
}