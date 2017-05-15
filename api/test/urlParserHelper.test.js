/**
 * Created by moriyasei on 2017/02/23.
 */
// import expect from 'expect';
import { expect } from 'chai';
import {
    isValidUrl,
    containedInWhitelist,
    parseRequest,
    isRegisterd
} from '../src/helper/urlParsseHelper';

import {ClientsById, ClientsIds} from '../src/dummy/fakeDatabase';

describe('Given a RegExp', () => {
    context('when the RegExp is null', () => {
        it('will result in "invalid"', () => {
            const url = 'yahoo.co.jp';
            const regexp = null;
            const bool = isValidUrl(url, regexp);
            expect(bool).to.equal(false);
        });
    });
    context('when the RegExp is match with the url', () => {
        it('will result in "matched"', () => {
            const url = 'yahoo.co.jp';
            const regexp = '^yahoo.*';
            const bool = isValidUrl(url, regexp);
            expect(bool).to.equal(true);
        });
    });
});

xdescribe('Given a whitelist', () => {
    context('when the list has no regexps', () => {
        it('will result in "invalid"', () => {
            const list = [];
            const bool = containedInWhitelist(list, 'https://yahoo.co.jp');
            expect(bool).to.equal(false);
        });
    });
    context('when the list has some regexps', () => {
        const list = ['^https?:\/\/yahoo\.co\.jp', 'amazon\.co\.jp'];
        context('when a given url is contained in the list', () => {
            it('will result in "valid"', () => {
                const yahoo = containedInWhitelist(list, 'https://yahoo.co.jp');
                expect(yahoo).to.equal(true);
                const amzn = containedInWhitelist(list, 'https://amazon.co.jp');
                expect(amzn).to.equal(true);
            });
        });
    });
    context('when a given url is not contained in the list', () => {
        const list = ['^https?:\/\/yahoo\.co\.jp', 'amazon\.co\.jp'];
        it('will result in "invalid"', () => {
            const facebook = containedInWhitelist(list, 'https://facebook.co.jp');
            expect(facebook).to.equal(false);
        });
    });
});

xdescribe('Given a authentication request object', () => {
    context('when the request object is falsy', () => {
        it('will throw error', () => {
            const fn = parseRequest.bind(null, {});
            expect(fn).to.throw(Error);
        });
    });

    context('when the request object is truthy', () => {
        let req,
            result;

        before(() => {
            req = {
                body:{
                    redirectEndpoint: 'https://itsol.co.jp',
                    clientId: 'dummyId',
                    username: 'Sei',
                    password: 'aaaa',
                }
            };

            result = {
                redirectEndpoint: 'https://itsol.co.jp',
                clientId: 'dummyId',
                username: 'Sei',
                password: 'aaaa',
            };
        });

        it('will find a client id');
        it('will find a username');
        it('will find a password');
        it('will find a redirect endpoint', () => {
            expect(parseRequest(req)).to.deep.equal(result);
        });
    });
});

xdescribe('Given a ClientID', () => {
    context('when that client id is registered', () => {
        it('will regard this client as an authorized client', () => {
            const id = '6fu6vegopk4ucpt4srv7cjk1i9';
            expect(isRegisterd(ClientsIds, id)).to.equal(true);
        });
    });
    context('when than client id isn\'t registered', () => {
        it('will regard this client as an unauthorized client', () => {
            const id = 'unauthorized';
            expect(isRegisterd(ClientsIds, id)).to.equal(false);
        });
    });
});