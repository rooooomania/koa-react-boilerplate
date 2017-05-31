/**
 * Created by moriyasei on 2017/02/03.
 */
import app from '../src/server';
import supertest from 'supertest';
import chai, { expect } from 'chai';
import sinon from 'sinon' ;
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
import * as authN from '../src/helper/authenticationHelper';
import Database from '../src/helper/databaseHelper';


const request = supertest.agent(app.listen());

xdescribe('Hello World TEST', () => {
    describe('when request to \'\/\'', () => {
        it('should return 200 error status code', async () => {
            await request
                .get('/')
                .expect(200);
        });

        it('should return hello world as a body', async () => {
            await request
                .get('/')
                .expect(200)
                .expect('hello world');
        });
    });
});

xdescribe('URL parameters', () => {
    it('should get variables from url params', async () => {
        await request
            .get('/moriya/sei')
            .expect(200)
            .expect('MORIYASEI');
    });
});

describe('POST /signin', () => {
    let verifyUserStub,
        signInStub,
        getItemStub,
        putItemStub,
        updateItemStub;
    beforeEach(() => {
        // databaseHelperの偽装
        getItemStub = sinon.stub(Database, 'getItem').withArgs('xxxxx').returns({
            Item: {
                id: 'xxxxx',
                idtoken: '123485798789743',
                allowedClient: [],
            }
        });
        putItemStub = sinon.stub(Database, 'putItem').returns({
            Item: {
                id: 'aaaaaa'
            }
        });
        updateItemStub = sinon.stub(Database, 'updateItem').returns({
            Item: {
                id: 'aaaaaa'
            }
        });

        verifyUserStub = sinon.stub(authN, 'verifyUser').returns(true);
        signInStub = sinon.stub(authN, 'signIn');
        signInStub.withArgs(
            'Sei',
            'Temporary1@',
            '6fu6vegopk4ucpt4srv7cjk1i9'
        ).returns(() => Promise.resolve(true));
        signInStub.withArgs(
            'Sei',
            'xemporary1@',
            '6fu6vegopk4ucpt4srv7cjk1i9'
        ).returns(() => Promise.resolve(false));
    });

    afterEach(() => {
        verifyUserStub.restore();
        authN.signIn.restore();
        Database.getItem.restore();
        putItemStub.restore();
        updateItemStub.restore();
    });
    context('Sign in succeed', () => {
        it('will return 302' /* 初めての認証を済ませ、同意確認ページへ */, async () => {
            await request
                .post('/signin')
                .send({
                    redirectEndpoint: 'https://www.itsol.co.jp',
                    clientId: '6fu6vegopk4ucpt4srv7cjk1i9',
                    username: 'Sei',
                    password: 'Temporary1@',
                })
                .expect(302)
                .then(response => {
                    expect(response.header.location).to.equal('/authz?clientId=6fu6vegopk4ucpt4srv7cjk1i9&redirectEndpoint=https://www.itsol.co.jp');
                });
        });
    });
    context('Sign in fail', () => {
        it('will return 401', async () => {
            await request
                .post('/signin')
                .send({
                    redirectEndpoint: 'https://www.itsol.co.jp',
                    clientId: '6fu6vegopk4ucpt4srv7cjk1i9',
                    username: 'Sei',
                    password: 'xemporary1@',
                })
                .expect(401);
        });
    });
});

describe('GET /signin', () => {
    let verifyUserStub,
        signInStub,
        getItemStub,
        putItemStub,
        updateItemStub;
    beforeEach(() => {
        // databaseHelperの偽装
        getItemStub = sinon.stub(Database, 'getItem').withArgs('xxxxx').returns({
            Item: {
                id: 'xxxxx',
                idtoken: '123485798789743',
                allowedClient: [],
            }
        });
        putItemStub = sinon.stub(Database, 'putItem').returns({
            Item: {
                id: 'aaaaaa'
            }
        });
        updateItemStub = sinon.stub(Database, 'updateItem').returns({
            Item: {
                id: 'aaaaaa'
            }
        });

        verifyUserStub = sinon.stub(authN, 'verifyUser').returns(true);
        signInStub = sinon.stub(authN, 'signIn');
        signInStub.withArgs(
            'Sei',
            'Temporary1@',
            '6fu6vegopk4ucpt4srv7cjk1i9'
        ).returns(() => Promise.resolve(true));
        signInStub.withArgs(
            'Sei',
            'xemporary1@',
            '6fu6vegopk4ucpt4srv7cjk1i9'
        ).returns(() => Promise.resolve(false));
    });

    afterEach(() => {
        verifyUserStub.restore();
        authN.signIn.restore();
        Database.getItem.restore();
        putItemStub.restore();
        updateItemStub.restore();
    });
    context('When login at first', () => {
        context('Sign in succeed', () => {
            it('will return 302' /* 初めての認証を済ませ、同意確認ページへ */, async () => {
                await request
                    .get('/signin')
                    .query({redirectEndpoint: 'https://www.itsol.co.jp'})
                    .query({clientId: '6fu6vegopk4ucpt4srv7cjk1i9'})
                    .query({username: 'Sei'})
                    .query({password: 'Temporary1@'})
                    .expect(302)
                    .then(response => {
                        expect(response.header.location).to.equal('/authz?clientId=6fu6vegopk4ucpt4srv7cjk1i9&redirectEndpoint=https://www.itsol.co.jp');
                    });

                //  1. authN.signIn()から idTokenが返却される
                //  2. Database.putItemが呼び出され、sessionに登録される
                //  3. 302ステータスコードを返す
            });
        });
        context('Sign in fail', () => {
            it('will return 401', async () => {
                await request
                    .get('/signin')
                    .query({redirectEndpoint: 'https://www.itsol.co.jp'})
                    .query({clientId: '6fu6vegopk4ucpt4srv7cjk1i9'})
                    .query({username: 'Sei'})
                    .query({password: 'xemporary1@'})
                    .expect(401)

                //  1. authN.signIn()から idTokenが返却される
                //  2. Database.putItemが呼び出され、sessionに登録される
                //  3. 302ステータスコードを返す
            });
        });
    });

    context('Given a session', () => {
        context('Sign in succeed', () => {
            it('will return 302' /* 初めての認証を済ませ、同意確認ページへ */, async () => {
                await request
                    .get('/signin')
                    .query({redirectEndpoint: 'https://www.itsol.co.jp'})
                    .query({clientId: '6fu6vegopk4ucpt4srv7cjk1i9'})
                    .query({username: 'Sei'})
                    .query({password: 'Temporary1@'})
                    .set('Cookie', ['sessionKey=xxxxx'])
                    .expect(302)
                    .then(response => {
                        expect(response.header.location).to.equal('/authz?clientId=6fu6vegopk4ucpt4srv7cjk1i9&redirectEndpoint=https://www.itsol.co.jp');
                    });

            //  1. authN.signIn()から idTokenが返却される
            //  2. Database.putItemが呼び出され、sessionに登録される
            //  3. 302ステータスコードを返す
            });
        });
    });
});

describe('GET /authorization', () => {
    let verifyUserStub,
        putItemStub,
        updateItemStub;
    beforeEach(() => {
        // databaseHelperの偽装
        sinon.stub(Database, 'getItem').withArgs('xxxxx').returns({
            Item: {
                id: 'xxxxx',
                idtoken: '123485798789743',
                allowedClient: ['xxxxx'],
            }
        });
        putItemStub = sinon.stub(Database, 'putItem').returns({
            Item: {
                id: 'aaaaaa'
            }
        });
        updateItemStub = sinon.stub(Database, 'updateItem').returns({
            Item: {
                id: 'aaaaaa'
            }
        });
        verifyUserStub = sinon.stub(authN, 'verifyUser').returns(true);
    });

    afterEach(() => {
        verifyUserStub.restore();
        Database.getItem.restore();
        putItemStub.restore();
        updateItemStub.restore();
    });

    context('authorization succeed', () => {
        it('will return 302', async () => {
            await request
                .get('/authorization')
                .set('Cookie', ['sessionKey=xxxxx'])
                .query({redirectEndpoint: 'https://www.itsol.co.jp'})
                .query({clientId: 'Sei'})
                .expect(302);
        });
    });
    context('authorization fail', () => {
        it('will return 401', async () => {
            await request
                .get('/authorization')
                .set('Cookie', ['sessionKey=wrong session'])
                .query({redirectEndpoint: 'https://www.itsol.co.jp'})
                .expect(401);
        });
    });
});

describe('POST /authorization', () => {
    let verifyUserStub,
        putItemStub,
        updateItemStub;
    beforeEach(() => {
        // databaseHelperの偽装
        sinon.stub(Database, 'getItem').withArgs('xxxxx').returns({
            Item: {
                id: 'xxxxx',
                idtoken: '123485798789743',
                allowedClient: ['xxxxx'],
            }
        });
        putItemStub = sinon.stub(Database, 'putItem').returns({
            Item: {
                id: 'aaaaaa'
            }
        });
        updateItemStub = sinon.stub(Database, 'updateItem').returns({
            Item: {
                id: 'aaaaaa'
            }
        });
        verifyUserStub = sinon.stub(authN, 'verifyUser').returns(true);
    });

    afterEach(() => {
        verifyUserStub.restore();
        Database.getItem.restore();
        putItemStub.restore();
        updateItemStub.restore();
    });
    context('authorization succeed', () => {
        it('will return 302', async() => {
            await request
                .post('/authorization')
                .set('Cookie', ['sessionKey=xxxxx'])
                .send({
                    redirectEndpoint: 'https://www.itsol.co.jp',
                    clientId: 'Sei',
                })
                .expect(302)
                .then(() => {
                    expect(updateItemStub).to.have.been.calledWith({
                        // added clientKey in the session after authorization
                        id: 'xxxxx',
                        idtoken: '123485798789743',
                        allowedClient: ['Sei', "xxxxx"],
                    });
                });
        });
    });

    context('authorization fail', () => {
        it('will return 401', async () => {
            await request
                .post('/authorization')
                .set('Cookie', ['sessionKey=wrong session'])
                .send({
                    redirectEndpoint: 'https://www.itsol.co.jp'
                })
                .expect(401);
        });
    });
});

// /authz の Content-Type は text/html
describe('GET /authz', () => {
    context('After authentication', () => {
        it('will return 200', async () => {
            await request
                .get('/authz')
                .expect(200);
        });
    });
    context('Access before authentication', () => {
        it('will return 401', async () => {
            await request
                .get('/authz')
                .expect(401);
        });
    });
});

xdescribe('POST /authz', () => {
    context('After authentication', () => {
        it('will return 200');
    });
    context('Access before authentication', () => {
        it('will return 401');
    });
});

xdescribe('POST /check', () => {
    context('When sent a valid id token with post parameter', () => {
        it('will return 200');
    });
    context('When sent an invalid id token with post parameter', () => {
        it('will return 400(Bad Request)');
    });
});

xdescribe('POST /signout', () => {

});

// FIXME: Javascript SDKを使っている間はシークレットキーが使えないため`refresh token`を利用できない
// なので、username/passwordを記憶して都度 /signin を経由していく方式をとる
xdescribe('POST /refresh', () => {
    context('When refresh token is sent', () => {
        it('will return 200');
        it('will send new id token in the body');
    });

    context('When an invalid session is sent', () => {
        it('will return 403');
    });

});
