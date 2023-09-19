
# ECOMMERCE

> LOGIN:
>
> - POST: '/auth/login' - To login with JWT (needs 'email' and 'password').
> - GET: 'auth/profile' - To get the logged in user infos (need to pass the token using bearer).

> USERS:
>
> - GET: '/user' - To show all users (need to be logged in).
> - GET: '/user/:id' - To find a user by id (need to be logged in).
> - POST: '/user' - To create a user (needs a 'name', 'email', 'password' and 'address').
> - PUT: '/user/:id - To update a user (can pass a 'name', 'password', 'email', 'address' and 'balance' need to be logged in).
> - DELETE '/users/:id - To delete a user (need to be logged in).

> PRODUCTS:
>
> - GET: '/product' - To show all products.
> - GET: '/product/:id' - To find a product by id.
> - POST: '/product' - To create a product (needs a 'title', 'description', 'price' and 'image_url)'
> - PUT: '/product/:id - To update a product (can pass a 'title', 'description', 'price' and 'image_url').
> - DELETE '/product/:id - To delete a product.

> CARTS:
>
> - POST: '/cart/add' - To add a product in the cart of the logged in user (needs a 'productId' and 'quantity').
> - DELETE: '/cart/empty' - To empty the user cart.
> - GET: '/cart/' - To get all the products in the cart.
> - GET: '/cart/product/:id' - To get a specific product in the user cart.
> Using a negative number in the quantity will remove the passed quantity.

> HISTORICS:
> - POST: '/historic' - To finish the purchase of the products in the cart and create a purchase history.
> - GET: '/historic' - To get all the purchase history.
> - GET: '/historic/:id' - To get a specific purchase history.

> STORES:
> - POST: '/store' - To create a store (need to be logged in and need a name).
> - GET: '/store/sales' - To show the store sales history.
> - GET: '/store/sale/:id' - To show a sale by id.
> - GET: '/store' - To show all the stores and its products.
> - GET: '/store/:id' - To show a specific store and its products.

> DEPOSITS:
> - POST: '/deposit' - To add a amount to a account (need to be logged in and need a value).
> - DELETE: '/deposit/:id' - To reset the user balance (need to be a admin).