export interface Product extends Record<string, unknown> {
    id: number,
    title: string,
    price: number,
    img: string,
}

export const productsMock: Product[] = [
    {
        title: 'Wildlife Rescue Camp',
        price: 100,
        id: 60307,
        img: `${process.env.BUCKET_URI}60307.jpg`
    },
    {
        title: 'Wildlife Rescue Operation',
        price: 90,
        id: 60302,
        img: `${process.env.BUCKET_URI}60302.jpg`
    }
];
