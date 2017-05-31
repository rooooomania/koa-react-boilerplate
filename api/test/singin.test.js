import sinon from 'sinon';
import { expect } from 'chai';
import * as Database from '../src/dummy/fakeDatabase';
import { checkPrecondition } from '../src/route/signin';

describe('Given checkPrecondition()', () => {
    describe('Given a clientId and redirct endpoint', () => {

        context('When the clientId is invalid', () => {
            it('will return false', () => {
                let ctx = {};
                expect(checkPrecondition('wrongUserId', 'https://www.itsol.co.jp', ctx)).to.be.false;
                expect(ctx.status).to.equal(401);

            });
        });
        context('When the endpoint is invalid', () => {
            it('will return false', () => {
                let ctx = {};
                expect(checkPrecondition('6fu6vegopk4ucpt4srv7cjk1i9', 'https://wwww.itsol.co.jp', ctx)).to.be.false;
                expect(ctx.status).to.equal(401);
            });
        });
        context('When params are valid', () => {
            it('will return true', () => {
                expect(checkPrecondition('6fu6vegopk4ucpt4srv7cjk1i9', 'https://www.itsol.co.jp', {})).to.be.true;
            });
        });
    });
});

