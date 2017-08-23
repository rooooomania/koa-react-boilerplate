/**
 * Created by seimoriya on 2017/05/20.
 */

export function promisify(callbackBasedApi) {
    return function(){
        const args = [].slice.call(arguments);
        return new Promise((resolve, reject) => {
            args.push(function(err, result){
                if (err) {
                    return reject(err);
                }
                if (arguments.length <= 2){
                    resolve(result);
                } else {
                    resolve([].slice.call(arguments, 1));
                }
            });
            callbackBasedApi.apply(null, args);
        });
    };
}

export function objectify(queryString) {
    return queryString.indexOf('=') === -1 ?
        removeAmpersand(queryString ):
        removeAmpersand(queryString)
            .split('&')
            .map(separateWithEqual)
            .reduce((acc, obj) => {
                return Object.assign({}, acc, obj);
            });
}

/*
 * 文字列をとって、＆を除いた文字列を返す
 * @params string
 * @returns string
 */
function removeAmpersand(string) {
    return string
        .split('')
        .filter(c => c != '?')
        .join('');
}
/*
 * `xxx=yyy`をとって、{xxx:yyy} を返す
 * @params string
 * @returns object
 */
function separateWithEqual(partOfQueryString) {
    const separate = partOfQueryString.split('=');
    return {
        [separate[0]]: separate[1]
    };
}

export const authHost =
    process.env.NODE_ENV === 'production'
        ? 'https://auth.rooooomania.click': 'http://localhost:4000';
