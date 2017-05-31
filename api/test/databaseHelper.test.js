/**
 * このテストケースを用意することで、databaseHelperが常にAWS SDKを利用していること
 * 正しくパラメータを渡していることを確認できる
 */

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import AWS from 'aws-sdk-mock';
import Database from '../src/helper/databaseHelper';

describe('Given SDK for DynamoDB', () => {
    // spyやstubをpromisifyすると、いつまでたってもresolveしないのでテストの仕方を検討する必要がある
    // つまりcalled/calledWithを使ったテストはできない。resolveされる値の検証はできる。
    beforeEach(() => {
        AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
            callback(null, 'testx');
        });
        AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
            callback(null, {
                id: 'testId',
                token: 'testToken'
            });
        });
        AWS.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
            callback(null, {id: 'testId'});
        });
        AWS.mock('DynamoDB.DocumentClient', 'delete', (params, callback) => {
            callback(null, null);
        });
    });

    afterEach(() => {
        AWS.restore();
    });

    describe('Given putItem()', () => {
        const Uuid = require('uuid');
        let v4Stub;
        beforeEach(() => {
            v4Stub = sinon.stub(Uuid, 'v4').returns('testId');
        });
        afterEach(() => {
            v4Stub.restore();
        });

        context('When passed an empty object', () => {
            it('Put method will get data as a result of querying DynamoDB', () => {
                return Database.putItem()
                    .then((data) => {
                        expect(data).to.deep.equal({
                            id: 'testId'
                        });
                    });
            });
        });

        context('When passed a object', () => {
            it('Put method will get data as a result of querying DynamoDB', () => {
                const obj = {
                    test: 'This is Test'
                };
                const paramMock = {
                    TableName: 'TableName',
                    Item: {
                        id: 'testId',
                        ...obj
                    }
                };
                return Database.putItem(obj)
                    .then((data) => {
                        expect(data).to.deep.equal({
                            id: 'testId',
                            test: 'This is Test'
                        });
                    });
            });
        });
    });

    describe('Given getItem()', () => {
        context('When passing a valid key', () => {
            it('Calls get() with params properly', () => {
                return Database.getItem('xxx')
                    .then((data) => {
                        expect(data).to.deep.equal({
                            id: 'testId',
                            token: 'testToken'
                        });
                    });
            });
        });
    });

    describe('Given updateItem()', () => {
        context('When nothing is passed',() => {
            it('returns Error', () => {
                expect(Database.updateItem()).to.deep.equal(Error('Must call with at least one argument.'));

            });
        });

        context('When passing a valid object', () => {
            it('will call update() method)', () => {
                return Database.updateItem({id: 'testId'}) // take one argument
                    .then(data => {
                        expect(data).to.equal('testId');
                    });
            });
        });
    });

    describe('Given deleteItem()', () => {
        context('When nothing is passed',() => {
            it('returns Error', () => {
                expect(Database.deleteItem()).to.deep.equal(Error('Must call with at least one argument.'));

            });
        });

        context('When passing a valid object', () => {
            it('will return nothing)', () => {
                return Database.deleteItem({})
                    .then(data => {
                        expect(data).not.to.exist;
                    });
            });
        });
    });

});
