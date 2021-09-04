import 'source-map-support/register';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { productsMock } from '../../mock/productsMock';
import { getEuroUsdRate } from '../../utils/currency';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<null> = async () => {
    const rate = await getEuroUsdRate();
    if(!rate) return formatJSONResponse(productsMock);

    return formatJSONResponse(productsMock.map(item => ({...item, localPrices: [{'EUR': Math.round(item.price * rate)}]})));
};

export const main = middyfy(getProductsList);
