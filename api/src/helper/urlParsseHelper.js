/**
 * Created by moriyasei on 2017/02/23.
 */

/*
 * URL文字列がホワイトリストにマッチするかどうかを返す
 * @param {string} url
 * @returns {bool}
 */
export function containedInWhitelist(whitelist, url) {
    let ret = false;
    whitelist.forEach(re => {
        ret = ret || isValidUrl(url, re);
    });
    return ret;
}

/*
 * URL文字列と正規表現を取り、正規表現にマッチするかどうかを返す
 * @param {string} url
 * @param {string} regexp
 * @returns {bool}
 */
export function isValidUrl(url, regexp) {
    if (!regexp) {
        return false;
    }
    const reg = new RegExp(escapeRegExp(regexp), 'i');
    return !!url.match(reg);
}

function escapeRegExp(string){
    // inspired from http://MORIYA-SEI-no-MacBook-Pro.local:51817/Dash/rmytkrbi/developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions.html
    // return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

    // RexExpコンストラクタ向けに、ホワイトリストに含まれるバックスラッシュをエスケープさせる
    return string.replace(/\\/g, '\\$&'); // $& means the whole matched string
}

/*
 * parseRequest
 * クライアントアプリからのHTTPリクエスト情報をパースして、認証に必要な情報を返す
 * @param {object} request
 * @returns {object} object for signIn
 */
export function parseRequest(request) {
  // koa-body-parseにより、request bodyの情報がパースされている
    try {
        const body = request.body;
        const { username, password, clientId, redirectEndpoint } = body;
        return {
            username,
            password,
            clientId,
            redirectEndpoint,
        };
    }
    catch (e){
        throw e;
    }
}

/*
 * @param {array} ids
 * @param {string} id
 * @returns {bool}
 */
export function isRegisterd(ids, id) {
    return !!ids.find(i => i === id);
}