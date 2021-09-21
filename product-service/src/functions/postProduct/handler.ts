import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { CREATE_PRODUCT, DB_CONFIG } from '../../utils/constants';
import { middyfy } from '@libs/lambda';
import { Client } from 'pg';
import schema from './schema';

const postProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    let client;
    try {
        console.log('postProduct requested', JSON.stringify(event.body));
        client = new Client(DB_CONFIG);
        await client.connect();
        const resp = await client.query(CREATE_PRODUCT, [event.body.title, event.body.description || '', event.body.price, event.body.img || '', event.body.count || 0, ]);
        return formatJSONResponse({id: resp.rows[0].new_product});
    } catch (e) {
        return formatJSONResponse({message: `Internal server error`}, 500)
    }
    finally {
        client.end();
    }
};

export const main = middyfy(postProduct);
