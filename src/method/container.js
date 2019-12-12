import { Method } from "./method";

/**
 * @constant {string: Method} container
 */
const container = {};

/**
 * 保存配置
 * @param {string} key 
 * @param {Method} method 
 */
export function save(key, method) {
    container[key] = method;
}

/**
 * 获取配置
 * @param {string} key 
 * @return {Method | null} 
 */
export function get(key) {
    return container[key] || null;
}

/**
 * 设置方法为待调试方法
 * 当待测试的方法运行时, 会暂停运行
 * 
 * @param {string} key 方法对应的唯一键值
 */
export function run(key) {
    const method = get(key);
    if (!method) {
        console.warn("无法找到键值: {" + key + "} 对应的对象方法");
        return;
    }
    method.toDebug();
}