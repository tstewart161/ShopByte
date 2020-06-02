// ShopByte Server

// API requirements:
/*
	-> Customers:
		- Adding new customer.
		- Adding new customer profile.
		- Updating current customer profile.
		- Customer adding money.
		- Paying customers for data (for signing in? At what step do I do this?).
		- Purchasing product.
		- Delivering profile to business.
	-> Businesses:
		- Adding new business.
		- Adding a new product.
		- Update product.
		- Subscribing new business.
		- Cancel subscription
		- Selling a product.
		- Allowing account withdrawal. (take withdrawal fee here or take it at sale?)(Allow this at all?)
		- Current customer profiles.
	-> Both:
		- List current products in marketplace.
		- Show current profile.
*/		

const express = require('express');
const stripe = require('stripe')('STRIPE_KEY');
const http = require('http');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

let app = express();
app.use(cors({origin: 'http://localhost:3000'}));
app.use(bodyParser.json());
let PORT = 3002;

app.get('/', (req, res) => {
	res.send('Server running');
});


/// Customers:
///
app.post('/create-user', async(req, res) => {

});


app.post('/create-profile', async(req, res) => {

});


app.post('/user-profile', async(req, res) => {

});


app.post('/update-profile', async(req, res) => {

});


app.post('/add-money', async(req, res) => {

});

app.post('/pay-users', async(req, res) => {

});


app.post('/purchase-product', (req, res) => {

});


app.post('/deliver-user-profile', async(req, res) => {

});



/// Businesses:
///

app.post('/create-business', async(req, res) => {

});


app.post('/create-product', async(req, res) => {

});


app.post('/update-product', async(req, res) => {

});


app.post('/create-business-subscription', async(req, res) => {

});


app.post('/cancel-subscription', async(req, res) => {

});


app.post('/sell-product', async(req, res) => {

});


// app.post('/account-withdrawal', async(req, res) => {

// });


app.post('/display-customer-profiles', async(req, res) => {

});


app.post('/current-products', async(req, res) => {

});

http.createServer(app).listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});