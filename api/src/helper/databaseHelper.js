import AWS from 'aws-sdk';
import { v4 } from 'uuid';
import { promisify } from './utilities';

const TableName = 'MySession';

AWS.config.update({
    region: 'ap-northeast-1'
});
const credentials = new AWS.SharedIniFileCredentials({
    profile: 's-moriya'
});
AWS.config.credentials = credentials;

/*
 * DynamoDBFactory
 * @return object
 */
const dynamoDBFactory = () => {
    const dynamoDB = new AWS.DynamoDB({
        // endpoint: 'http://localhost:8000',
        // region: 'ap-northeast-1',
        // accessKeyId: 'localtest',
        // secretAccessKey: 'localtest'
    });
    const docClient = new AWS.DynamoDB.DocumentClient(/*{
        service: dynamoDB
    }*/);
    return docClient;
};

/*
 * @returns promise Item{ id, idtoken, allowedClient}
 */
const putItem = (obj = {}) => {
    const docClient = dynamoDBFactory();
    const item = Object.assign({}, {id: getUuidV4()}, obj);
    const params = {
        TableName: TableName,
        Item: {
            ...item,
        },
        ReturnValues: 'ALL_OLD'

    };

    // const put = docClient.put(params).promise();
    // アロー演算子を使っているため、コールバックには明示的にthisを指定する必要がある
    const put = promisify(docClient.put.bind(docClient));
    return put(params)
        .then(() => item)
        .catch(err => {
            console.log(JSON.stringify(err, null));
        });
};

/*
 * @returns promise Item{ id, idtoken, allowedClient}
 */
const getItem = (id) => {
    // See, https://www.npmjs.com/package/aws-sdk-mock
    const docClient = dynamoDBFactory();
    const params = {
        TableName: TableName,
        Key: {
            id: id
        },
    };

    const get = promisify(docClient.get.bind(docClient));
    return get(params)
        .catch(err => {
            console.log('Unable to read item. Error JSON: ', JSON.stringify(err, null));
        });
};

/*
 * @returns promise id
 */
const updateItem = (obj) => {
    if (!obj) {
        return new Error('Must call with argument.');
    }
    const docClient = dynamoDBFactory();
    const params = {
        TableName: TableName,
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

    const update = promisify(docClient.update.bind(docClient));
    return update(params)
        .then(data => data.id)
        .catch(err => {
            console.log('Unable to update item. Error JSON: ', JSON.stringify(err, null));
        });

};

const deleteItem = (obj) => {
    if (!obj) {
        return new Error('Must call with argument.');
    }
    const docClient = dynamoDBFactory();
    const params = {
        TableName: TableName,
        Key: {
            id: obj.id
        }
    };
    const del = promisify(docClient.delete.bind(docClient));
    return del(params)
        .catch(err => {
            console.log('Unable to delete item. Error JSON: ', JSON.stringify(err, null));
        });
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
