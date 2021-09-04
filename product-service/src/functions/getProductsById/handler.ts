import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { Client } from 'pg';
import { DB_CONFIG, SELECT_PRODUCT_BY_ID } from '../../utils/constants';

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<null> = async (event) => {
    let client;
    try {
        console.log('getProductsById requested', JSON.stringify(event.pathParameters));
        client = new Client(DB_CONFIG);
        await client.connect();
        const resp = await client.query(SELECT_PRODUCT_BY_ID, [event.pathParameters.productId]);

        if(!resp.rows.length) return formatJSONResponse({message: 'Product not found'}, 404);

        return formatJSONResponse(resp.rows[0]);
    } catch (e) {
        console.log(`getProductsById error: ${e}`);
        return formatJSONResponse({message: 'Internal server error'}, 500)
    }
    finally {
        client.end();
    }
};

export const main = middyfy(getProductsById);
