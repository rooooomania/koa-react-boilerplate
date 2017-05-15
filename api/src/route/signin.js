import SessionStore from '../dummy/fakeSessionStore';
import { parseRequest, containedInWhitelist, isRegisterd } from '../helper/urlParsseHelper'
import { WhiteList, ClientsIds } from '../dummy/fakeDatabase'
import * as authN from '../helper/authenticationHelper';

// TODO: if hell をなんとかする

function singin (){
    return (method) => async (ctx, next) => {
        const sessionMgr = SessionStore.getInstance();
        // console.log('inside signin', SessionStore.getInstance());
        let redirectEndpoint,
            clientId,
            username,
            password;

        switch (method) {
        case 'GET': {
            redirectEndpoint = ctx.request.query.redirectEndpoint;
            clientId = ctx.request.query.clientId;
            username = ctx.request.query.username;
            password = ctx.request.query.password;
            break;
        }
        case 'POST': {
            const request = ctx.request;
            redirectEndpoint = parseRequest(request).redirectEndpoint;
            clientId = parseRequest(request).clientId;
            username = parseRequest(request).username;
            password = parseRequest(request).password;
            break;
        }
        default:
            break;
        }

        const authorizationEndpoint = './authz';

        if (checkPrecondition(clientId, redirectEndpoint, ctx)) {

            // もしセッションキーがあれば、その情報を再利用できるか確認する

            const sessionKey = ctx.cookies.get('sessionKey');
            const session = sessionMgr.getItem(sessionKey);
            if (sessionKey) {
                if (session) {
                    if (await authN.verifyUser(session.idtoken)) {
                        const isContain = session.allowedClient.find(e => e === clientId);

                        console.log('isContain', isContain);

                        if (isContain) {
                            return ctx.redirect(`${redirectEndpoint}?session=${session.id}`);
                        }
                        // セッションが有効だが、当該クライアントアプリを許諾していないケース
                        // ここでは、同意確認画面へのリダイレクトを走らせる
                        return ctx.redirect(`${authorizationEndpoint}?clientId=${clientId}&redirectEndpoint=${redirectEndpoint}`);

                    }
                }
            }

            const authNUser = authN.signIn(username, password, clientId);
            const tokenReceived = await authNUser((err, token) => {
                if (err) {
                    ctx.status = 401;
                    console.log('authN error occured!');
                    return;
                }
                return token;
            });

            if (tokenReceived) {
                // セッション情報をストレージに保管する
                let id;
                if (sessionKey) {
                    // セッションは有効だが`id token`が期限切れている場合、セッションは生かす
                    const sessionWithNewToken = Object.assign(
                        {},
                        session,
                        {idtoken: tokenReceived}
                    );
                    id = sessionMgr.updateItem(sessionWithNewToken);

                    if (sessionWithNewToken.allowedClient) {
                        const isContain = sessionWithNewToken.allowedClient.find(e => e === clientId);
                        if (isContain) {
                            return ctx.redirect(`${redirectEndpoint}?session=${session.id}`);
                        } else {
                            // 初めて訪れるサイトの場合、認証が必要
                            return ctx.redirect(`${authorizationEndpoint}?clientId=${clientId}&redirectEndpoint=${redirectEndpoint}`);
                        }
                    }

                } else {
                    // 以降、初めてセッションを作るフロー
                    // セッションキーを発行し、エンドユーザを管理対象にする
                    id = sessionMgr.putItem({
                        idtoken: tokenReceived,
                        allowedClient: [],
                    }).id;
                    ctx.cookies.set('sessionKey', id);
                }
                ctx.redirect(`${authorizationEndpoint}?clientId=${clientId}&redirectEndpoint=${redirectEndpoint}`);
            }
        }

        next();
    };
}

export function get (session) {
    return singin(session)('GET');
}

export function post (session) {
    return singin(session)('POST');
}

/*
 * @function checkPrecondition
 * @param {string} clientId
 * @param {string} redirect endpoint
 * @prram {object} ctx
 * @return {bool}
 */
export function checkPrecondition (clientId, endpoint, ctx) {

    console.log('clientID', clientId, endpoint);

    // Veiryfy the client id sent from app
    if (!isRegisterd(ClientsIds, clientId)) {
        ctx.status = 401;
        ctx.body = {
            message: 'Unauthorized client'
        };
        return false;
    }

    // Verify the redirect endpoint specified by the client
    if (!containedInWhitelist(WhiteList, endpoint)) {
        ctx.status = 401;
        ctx.body = {
            message: 'Unauthorized redirect'
        };
        return false;
    }
    return true;
}
