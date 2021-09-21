import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { Client } from 'pg';
import { DB_CONFIG, SELECT_PRODUCTS } from '../../utils/constants';


const getProductsList: ValidatedEventAPIGatewayProxyEvent<null> = async () => {
    let client;
    try {
        console.log('getProductsList requested');
        client = new Client(DB_CONFIG);
        await client.connect();
        const resp = await client.query(SELECT_PRODUCTS);
        return formatJSONResponse(resp.rows);
    } catch (e) {
        return formatJSONResponse({message: `Internal server error`}, 500)
    }
    finally {
        client.end();
    }
};

export const main = middyfy(getProductsList);
