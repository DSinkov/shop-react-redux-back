export const DB_CONFIG = {
    ssl: {rejectUnauthorized: false},
    connectionTimeoutMillis: 5000,
};

export const SELECT_PRODUCTS = `select p.*, s.count
                                from products p
                                         left join stocks s on p.id = s.product_id;`;

export const SELECT_PRODUCT_BY_ID = `select p.*, s.count
                                     from products p
                                              left join stocks s on p.id = s.product_id
                                     where id = $1;`;

export const CREATE_PRODUCT = `select new_product($1, $2, $3, $4, $5)`
