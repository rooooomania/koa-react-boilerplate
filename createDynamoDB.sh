#!/bin/bash

DYNAMO_TABLE_NAME='MySession'
DYNAMO_HASH_TYPE='S'
DYNAMO_HASH_NAME='id'
DYNAMO_ATTRIBUTE="AttributeName=${DYNAMO_HASH_NAME},AttributeType=${DYNAMO_HASH_TYPE}"
DYNAMO_KEY_SCHEMA="AttributeName=${DYNAMO_HASH_NAME},KeyType=HASH"
DYNAMO_READ_UNIT='10'
DYNAMO_WRITE_UNIT='5'
DYNAMO_PROV_THPUT="ReadCapacityUnits=${DYNAMO_READ_UNIT},WriteCapacityUnits=${DYNAMO_WRITE_UNIT}"

cat << ETX
  DYNAMO_TABLE_NAME: ${DYNAMO_TABLE_NAME}
  DYNAMO_ATTRIBUTE:  ${DYNAMO_ATTRIBUTE}
  DYNAMO_KEY_SCHEMA: ${DYNAMO_KEY_SCHEMA}
  DYNAMO_PROV_THPUT: ${DYNAMO_PROV_THPUT}
ETX

aws dynamodb create-table \
  --table-name ${DYNAMO_TABLE_NAME} \
  --attribute-definition ${DYNAMO_ATTRIBUTE} \
  --key-schema ${DYNAMO_KEY_SCHEMA} \
  --provisioned-throughput ${DYNAMO_PROV_THPUT} \
  --endpoint-url http://localhost:8000
