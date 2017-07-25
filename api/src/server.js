import Koa from 'koa';
const log4js = require('koa-log4');
const logger = log4js.getLogger('app');
log4js.configure('log4js.json');

//import koaLogger from 'koa-logger';
import koaBodyparser from 'koa-bodyparser';
import koaCors from 'koa-cors';
import Router from 'koa-router';
import * as authN from './helper/authenticationHelper';
import { pageNotFound } from './middlewares';
import Database from './helper/databaseHelper';
import * as Signin from './route/signin';
import views from 'koa-views';
import serve from 'koa-static';
import path from 'path';

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
        // 通常ならセットされているセッションキーを確認し、その情報が有効かどうかを確認する
        const sessionKey = ctx.cookies.get('sessionKey');
        if (!sessionKey) {
            return ctx.status = 401;
        }
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

        const { clientId, redirectEndpoint } = ctx.query;

        // 通常ならセットされているセッションキーを確認し、その情報が有効かどうかを確認する
        const sessionKey = ctx.cookies.get('sessionKey');
        if (sessionKey) {
            const session = await Database.getItem(sessionKey);
            if (session && session.Item) {
                if (await authN.verifyUser(session.Item.idtoken)) {
                    //TODO: 同意済み情報をセッションに保持する
                    const isContain = session.Item.allowedClient.find(elm => elm === clientId);
                    if (!isContain) {
                        Database.updateItem(
                            Object.assign(
                                session.Item,
                                {allowedClient: [clientId].concat(session.Item.allowedClient)},
                            )
                        );
                    }
                    ctx.redirect(`${redirectEndpoint}?session=${session.Item.id}`);
                    return;
                }
            }
        }

        // セッションが無効ならば、`Unauthorized User`
        ctx.status = 401;

        next();
    })
    .post('/authorization', async (ctx, next) => {

        const { clientId, redirectEndpoint } = ctx.request.body;

        // 通常ならセットされているセッションキーを確認し、その情報が有効かどうかを確認する
        const sessionKey = ctx.cookies.get('sessionKey');
        if (sessionKey) {
            const session = await Database.getItem(sessionKey);
            if (session && session.Item) {
                if (await authN.verifyUser(session.Item.idtoken)) {
                    //TODO: 同意済み情報をセッションに保持する
                    const isContain = session.Item.allowedClient.find(elm => elm === clientId);
                    if (!isContain) {
                        Database.updateItem(
                            Object.assign(
                                session.Item,
                                {allowedClient: [clientId].concat(session.Item.allowedClient)},
                            )
                        );
                    }
                    ctx.redirect(`${redirectEndpoint}?session=${session.Item.id}`);
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
    .use(log4js.koaLogger(log4js.getLogger("http"), { level: 'auto' }))
//    .use(koaLogger())
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

// logger
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

export default app;
