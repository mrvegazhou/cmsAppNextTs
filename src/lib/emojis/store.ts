import { EmojiGroup } from "@/interfaces";

export const EMOJIS = {
    _key: 'EMOJIS_KEY', 
    set: function (emojis: EmojiGroup[] | object) {
        try {
            var emojisStr = JSON.stringify(emojis);
            localStorage.setItem(this._key, emojisStr);
        } catch (error) {
            console.error('Failed to stringify localStorage data:', error);
        }
    },
    get: function () {
        try {
            return JSON.parse(localStorage.getItem(this._key)!);
        } catch (error) {
            console.error('Failed to parse localStorage data:', error);
        }
    },
    clean: function () {
        localStorage.removeItem(this._key);
    },
    get notEmpty() {
        var datas = this.get();
        if (typeof datas=='undefined' || datas==null || datas=="") {
            return false;
        }
        return true;
    }
};