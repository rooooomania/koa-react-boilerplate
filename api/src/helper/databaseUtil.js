/**
 * Created by seimoriya on 2017/05/08.
 TableName: 'TableName',
 */
import AWS from 'aws-sdk';
import { v4 } from 'uuid';

AWS.config.update({
    endpoint: 'http://localhost:8000'
});

const docClient = new AWS.DynamoDB.DocumentClient();

const putItem = (obj = {}) => {
    const item = Object.assign({}, {id: getUuidV4()}, obj);
    const params = {
        TableName: 'TableName',
        Item: ...item,
    };
    docClient.put(params, (err, data) => {
        if (err){
            return console.log(JSON.stringify(err, null));
        }
        console.log(`Added Item: ${JSON.stringify(data, null, 2)}`);
    });
};

const getItem = (id) => {
    const paramas = {
        TableName: 'TableName',
        Key: {
            id: id
        },
    };
    docClient.get(paramas, (err, data) => {
        if (err) {
            return console.log('Unable to read item. Error JSON: ', JSON.stringify(err, null));
        }
        console.log('GetItem succeeded: ', JSON.stringify(data, null, 2));
    });
};

const updateItem = (obj) => {
    const params = {
        TableName: 'TableName',
        Key: {
            'id': obj.id
        },
        UpdateExpression: 'set idtoken = :it, allowedClient = :ac ',
        ExpressionAttributeValues: {
            ':it': obj.idtoken,
            ':ac': obj.allowedClient
        },
        ReturnValues: 'ALL_NEW'
    };

    docClient.update(params, (err, data) => {
        if (err) {
            return console.log('Unable to update item. Error JSON: ', JSON.stringify(err, null));
        }
        console.log('Update succeeded: ', JSON.stringify(data, null, 2));
    });
};

const deleteItem = (obj) => {
    const params = {
        TableName: 'TableName',
        Key: {
            id: obj.id
        }
    };
    docClient(params, (err, data) => {
        if (err) {
            return console.log('Unable to delete item. Error JSON* ', JSON.stringify(err, null));
        }
        console.log('Succeeded to Delete Item: ', JSON.stringify(data, null, 2));
    })

};

const getUuidV4  = () => {
    return v4();
};

export default {
    getItem,
    updateItem,
    putItem,
    deleteItem
};
