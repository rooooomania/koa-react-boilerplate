/**
 * Created by moriyasei on 2017/02/15.
 */

const UserPoolId = 'us-east-1_dwWZ6QZTA';
// const ClientId = '6fu6vegopk4ucpt4srv7cjk1i9';
const CatalogueUrl = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_dwWZ6QZTA/.well-known/jwks.json';
import { CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails
} from 'amazon-cognito-identity-js';
import jws from 'jws';
import getPem from 'rsa-pem-from-mod-exp';
import Request from 'superagent';

/*
 * signIn
 * SRP計算しつつCognitoと通信して認証情報を取得する。
 * @param {string} username=
 * @param {string} password=
 * @param {string} clientId
 * @param {function} callback
 * @returns {promise} // resolve token
 */

export const signIn = (username, password, clientId) => callback =>  {
    const authenticationData = {
        Username: username,
        Password: password
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const poolData = {
        UserPoolId:  UserPoolId,
        ClientId: clientId,
    };
    const userPool = new CognitoUserPool(poolData);
    const userData = {
        Username: username,
        Pool: userPool,
    };
    const cognitoUser = new CognitoUser(userData);

    return promisifiedAuthenticateUser()
        .then(result => result.getIdToken().getJwtToken())
        .then(token => {
            return token;
        })
        .then(token => callback(null, token))
        .catch(callback);

    /*
     * SDKの関数をプロミス化している
     * @returns {promise}
     */
    function promisifiedAuthenticateUser() {
        return new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: result => {

                    return verifyUser(result)
                        .then(resolve(result))
                        .catch(reject);

                },
                onFailure: err => reject(err)
            });
        });
    }
};

/* verifyUser
 * @params {string} token idtoken
 * @returns {thenable}
 * tokenをとり、有効期限・署名を検証した結果<bool>を返却する（SSO用）
 */
export async function verifyUser (token) {
    //有効期限のチェックと署名の検証を行う。
    const isExp = await isExpired(token);
    const isVer = await verifySignature(token);
    return isExp && isVer;
}

/*
 * @param {string} token
 * @returns {promise}
 * it token の有効期限が切れているかどうかを返す
 */
export function isExpired(token) {
    const payload = jws.decode(token).payload;
    const exp = JSON.parse(payload).exp;
    const now = new Date();
    const ret =  exp > Math.floor( now.getTime() / 1000 ) ;
    return Promise.resolve(ret);
}

/*
 * Verify the signature in the IDToken taken as a parameter
 * @param {string} token idtoken
 * @returns {promise}
 */
export function verifySignature(token) {
    const URL = CatalogueUrl;
    return new Promise((resolve, reject) => {
        getCatalogueJSON(URL, (err, text) => {
            if (err) {
                return reject(err);
            }

            const catalogue = JSON.parse(text);
            const kid = jws.decode(token).header.kid;
            const {e, n} = catalogue.keys.find(e => e.kid === kid);
            const pubKey = getPem(n, e);

            resolve(jws.verify(token, 'RS256', pubKey));
        });
    });
}

/*
 * getCatalogueJSON a private method
 * @param {string} url
 * @param {function} callback
 */
function getCatalogueJSON(url, callback) {
    Request
        .get(url)
        .end((err, res) => {
            if (err) {
                return callback(err);
            }
            callback(null, res.text);
        });
}


