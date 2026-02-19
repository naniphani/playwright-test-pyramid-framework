export const ENDPOINTS = {
    products: {
        getById: (productId: string) => `/products/${productId}`,
    },

    carts: {
        create: `/carts`, // POST -> { id }
        get: (cartId: string) => `/carts/${cartId}`,
        updateQuantity: (cartId: string) => `/carts/${cartId}/product/quantity`, // PUT
        deleteProduct: (cartId: string, productId: string) =>
            `/carts/${cartId}/product/${productId}`, // DELETE
        deleteCart: (cartId: string) => `/carts/${cartId}`, // DELETE (assumed; matches REST; if Swagger differs, change here)
    },

    users: {
        me: `/users/me`,
    },

    payment: {
        check: `/payment/check`, // POST
    },
} as const;
