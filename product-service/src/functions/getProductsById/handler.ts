import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { productsMock } from '../../mock/productsMock';

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<null> = async (event) => {
    const id = Number(event.pathParameters.productId);
    const item = productsMock.find(product => product.id === id);
    if (!item) return formatJSONResponse({message: 'Product not found'}, 404);

    return formatJSONResponse(item);
};

export const main = middyfy(getProductsById);
