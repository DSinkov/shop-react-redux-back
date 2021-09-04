import axios from 'axios';

const pairUsdEuroRateUri = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/pair/USD/EUR`;

export const getEuroUsdRate = async () => {
    try {
        const resp = await axios.get<{ 'conversion_rate': number }>(pairUsdEuroRateUri);
        return resp.data.conversion_rate;
    } catch (e) {
        return 0;
    }
};
