
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
> - POST: '/product' - To create a product (needs a 'title', 'description', 'price' and 'image_urls' (the images_urls is a string of URLs separated by ',')).
> - PUT: '/product/:id - To update a product (can pass a 'title', 'description', 'price' and 'image_urls').
> - DELETE '/product/:id - To delete a product.

> CARTS:
>
> - POST: '/cart/add' - To add a product in the cart of the logged in user (needs a 'productId' and 'quantity').
> Using a negative number in the quantity will remove the passed quantity.