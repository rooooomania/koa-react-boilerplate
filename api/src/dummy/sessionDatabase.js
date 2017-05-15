
import { v4 } from 'uuid';
import expect from 'expect';

// セッションを管理する、ダミーの`KeyValue`データベース。
class SessionManager {
    constructor() {
        this.storage = {};

    }

    putItem(obj = {}) {
        const item = Object.assign({}, {id: SessionManager.getUuIdV4()}, obj);

        this.storage = {
            [item.id]: item,
            ...this.storage
        };

        console.log(`Now store these sessions... ${JSON.stringify(this.storage)}`);

        return item;
    }

    getItem(key) {
        const id = Object.keys(this.storage).find(id => key === this.storage[id].id) || undefined;
        return this.storage[id] || undefined;
    }

    updateItem(item) {
        const id = item.id;
        // if (this.getItem(id)) {
        this.storage = {
            ...this.storage,
            [id]: item,
        };

        return id;
        // } else {
        // throw new Error('Key not found. Couldn\'t update storage');
        // }
    }

    deleteItem(key) {
        if (this.getItem(key)) {
            this.storage = Object.assign({}, Object.keys(this.storage).filter(id => !this.getItem));

        } else {
            throw new Error('Key not found. Couldn\'t delete the item');
        }
    }

    clear() {
        this.storage = {};
    }

    static getUuIdV4() {
        return v4();
    }
}

export default SessionManager;

/*
 * Testing code..
 */
function test() {
    const sessionMgr = new SessionManager();
    expect(sessionMgr.getItem('duumyID')).toEqual(undefined);

    const spyGetUuId = expect.spyOn(SessionManager, 'getUuIdV4')
        .andReturn('xxxxx');

    const putItem = sessionMgr.putItem({email: 'rooooomania@gmail.com'});
    spyGetUuId.restore();
    sessionMgr.putItem({email: 'rooooomania@icloud.com'});

    expect(putItem).toBeAn('object');
    expect(putItem).toEqual({
        id: 'xxxxx',
        email: 'rooooomania@gmail.com',
    });

    expect(sessionMgr.getItem('xxxxx')).toEqual({
        id: 'xxxxx',
        email: 'rooooomania@gmail.com',
    });

    expect(sessionMgr.updateItem({
        id: 'xxxxx',
        name: 'rooooomania',
    })).toEqual('xxxxx');

    expect(sessionMgr.getItem('xxxxx')).toEqual({
        id: 'xxxxx',
        name: 'rooooomania',
    });


    expect(sessionMgr.deleteItem('xxxxx'));
    expect(sessionMgr.getItem('xxxxx')).toEqual(undefined);

}
// test();

