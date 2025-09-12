export enum Configs {
    CLOSE_ALPHA_MESSAGE = "close_alpha_message",
    CLOSE_FIRST_LOGIN_MESSAGE = "close_first_login_message" 
}

export const saveConfigs = (key: Configs, value: string) => localStorage.setItem(key, String(value));
export const getConfigs = (key: Configs) => localStorage.getItem(key);
export const removeConfigs = (key: Configs) => localStorage.removeItem(key);