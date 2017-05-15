import Koa from 'koa';
import koaLogger from 'koa-logger';
import koaBodyparser from 'koa-bodyparser';
import koaCors from 'koa-cors';
import Router from 'koa-router';
import * as authN from './helper/authenticationHelper';
import { pageNotFound } from './middlewares';
import SessionStore from './dummy/fakeSessionStore';
import * as Signin from './route/signin';
import views from 'koa-views';
import serve from 'koa-static';
import path from 'path';

let sessionMgr = SessionStore.createInstance();

console.log('SessionMgr initiated', sessionMgr);
// Create API
const router = Router();
router
// Views
    .get('/', async (ctx, next) => {
        ctx.body = 'hello world';

        next();
    })
    .get('/authn', async (ctx, next) => {
        await ctx.render('index');
        next();
    })
    .get('/authz', async (ctx, next) => {
        await ctx.render('index');
        next();
    })
    // APIs
    /*
     * サインイン画面のフォームが使う認証リクエスト用API。
     * 正常に処理されると同意確認画面へリダイレクトする
     */
    .get('/signin', Signin.get())
    .post('/signin', Signin.post())
    /*
     * 同意確認を済ませた（済ませている）UAが呼び出すAPI。
     * Cookieに含んだセッションキー(必須）を元に、同意情報を登録する。
     */
    .get('/authorization', async (ctx, next) => {
        const sessionMgr = SessionStore.getInstance();

        const { clientId, redirectEndpoint } = ctx.query;

        // 通常ならセットされているセッションキーを確認し、その情報が有効かどうかを確認する
        const sessionKey = ctx.cookies.get('sessionKey');
        if (sessionKey) {
            const session = sessionMgr.getItem(sessionKey);
            if (session) {
                if (await authN.verifyUser(session.idtoken)) {
                    //TODO: 同意済み情報をセッションに保持する
                    const isContain = session.allowedClient.find(elm => elm === clientId);
                    if (!isContain) {
                        sessionMgr.updateItem(
                            Object.assign(
                                session,
                                {allowedClient: [clientId].concat(session.allowedClient)},
                            )
                        );
                    }
                    ctx.redirect(`${redirectEndpoint}?session=${session.id}`);
                    return;
                }
            }
        }

        // セッションが無効ならば、`Unauthorized User`
        ctx.status = 401;

        next();
    })
    .post('/authorization', async (ctx, next) => {
        const sessionMgr = SessionStore.getInstance();

        const { clientId, redirectEndpoint } = ctx.request.body;

        // 通常ならセットされているセッションキーを確認し、その情報が有効かどうかを確認する
        const sessionKey = ctx.cookies.get('sessionKey');
        if (sessionKey) {
            const session = sessionMgr.getItem(sessionKey);
            if (session) {
                if (await authN.verifyUser(session.idtoken)) {
                    //TODO: 同意済み情報をセッションに保持する
                    const isContain = session.allowedClient.find(elm => elm === clientId);
                    if (!isContain) {
                        sessionMgr.updateItem(
                            Object.assign(
                                session,
                                {allowedClient: [clientId].concat(session.allowedClient)},
                            )
                        );
                    }
                    ctx.redirect(`${redirectEndpoint}?session=${session.id}`);
                    return;
                }
            }
        }
        // TODO: idTokenエンドポイントの用意。ClientIDとSessionKeyをとって、保有しているID Token を返す。
        // この後クライアント側で、ID Tokenの検証が必要になる。

        // セッションが無効ならば、`Unauthorized User`
        ctx.status = 401;

        next();
    });

// Create View
const app = new Koa();
const publicPath = path.resolve(__dirname, '..');

// Apply middlewares
app
    .use(koaLogger())
    .use(koaCors({
        origin: true,
        credentials: true,
    }))
    .use(koaBodyparser())
    .use(pageNotFound())
    .use(serve(path.resolve(publicPath, 'build/public')))
    .use(views(publicPath))
    .use(router.routes())
    .use(router.allowedMethods());

export default app;
