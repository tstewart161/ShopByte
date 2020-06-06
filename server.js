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
// const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@sms-news-cluster-ta7l1.mongodb.net/test?retryWrites=true&w=majority`;


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
	// Get user data.
	let user = req.body.profile;

	const databaseClient = new MongoClient(uri, { useNewUrlParser: true });
	databaseClient.connect(err => {
		const userData = databaseClient.db("SMS-News").collection("Users - Active");

		userData.insertOne(user, (error, res) => {
			if (error) throw error;
			console.log("Successfully added new user.");
		})
		databaseClient.close();
	});
});


app.post('/create-profile', async (req, res) => {
	// 1. Associate user profile with authId and store in 'Profiles' section of db.
	let profile = req.body.profile;

	const databaseClient = new MongoClient(uri, { useNewUrlParser: true });
	databaseClient.connect(err => {
		const profileData = databaseClient.db("ShopByte").collection("Profiles - Active");

		profileData.insertOne(profile, (error, res) => {
			if (error) throw error;
			console.log("Successfully added new profile.");
		})
		databaseClient.close();
	});
});


app.post('/add-money', async (req, res) => {
	// Allow user to add their own money to the store.
	// 1. Maintain an account object? Look up how stripe handles this kind of thing.
});


app.post('/pay-users', async (req, res) => {
	// Once a day after completing particular actions (checklist, goals, etc), add some money from biz 
	// subscriptions to user accounts based on profile (actions complete like people invited, purchase 
	// velocity).
	// Again: look up how to maintain account object.
});


app.post('/purchase-product', (req, res) => {
	// Decrement account object and send order info to business.
	// How do other companies handle this biz logic?
});


app.post('/get-user-profile', async (req, res) => {
	const userId = req.body.userId;
	let profile;

	// const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@sms-news-cluster-ta7l1.mongodb.net/test?retryWrites=true&w=majority`;
	const databaseClient = new MongoClient(uri, { useNewUrlParser: true });
	databaseClient.connect(async (err) => {
		const profileData = databaseClient.db("ShopByte").collection("Profiles - Active");
		profile = await profileData.findOne({UserId: userId});
		res.send(profile);
		databaseClient.close();	
	});
});



/// Businesses:
///
app.post('/create-business', async (req, res) => {
	const business = await stripe.customers.create({
		email: req.body.email,
		phone: req.body.phone
	}).catch((error) => {
		console.log(`Server Error - Creating business failed: ${error}`);
	})
	console.log(`Creating business: ${business.email}...`);
	// Recommendation: save the customer.id in your database.
	res.send({ business });
});


app.post('/create-product', async (req, res) => {
	// Check to make sure customer is active!
	let product = req.body.product;
	// Upload product with business that created it.
	const databaseClient = new MongoClient(uri, { useNewUrlParser: true });
	databaseClient.connect((err) => {
		const productData = databaseClient.db("ShopByte").collection("Products");
		// Get user data.
		productData.insertOne(product, (error, res) => {
			if (error) throw error;
			console.log("Successfully added new product.");
		})
		databaseClient.close();	
	});
});


app.post('/update-product', async (req, res) => {
	// Check to make sure customer is active!
	const userId = req.body.userId;
	const updatedField = req.body.updatedField;
	const updatedValue = req.body.updatedValue
	const productId = req.body.productId;

	const databaseClient = new MongoClient(uri, { useNewUrlParser: true });
	databaseClient.connect((err) => {
		const productData = databaseClient.db("ShopByte").collection("Products");
		const userData = databaseClient.db("ShopByte").collection("Users - Active");

		if (userData.findOne({UserId: userId})) {
			// productData.findOneAndUpdate({CustomerId: customerId}, {$set: {${updatedField}: updatedValue}} (error) => {
			// if (error) throw error;
			// console.log("Updated user plan");
			// });
		} else {
			console.log("Subscription not active, can't update products.");
		}

		// Get user data.
		
		databaseClient.close();	
	});
});


app.post('/create-business-subscription', async (req, res) => {
	// Attach the payment method to the customer.
	try {
		await stripe.paymentMethods.attach(req.body.customerId.paymentMethodId, {
			customer: req.body.customerId.customerId,
		}) 
	} catch(error) {
		console.log(error.message);
		return res.status('402').send({ error: { message: error.message } });
	}

	// Change the default invoice settings on the customer to the new payment method
	await stripe.customers.update(
		req.body.customerId.customerId,
		{
			invoice_settings: {
				default_payment_method: req.body.customerId.paymentMethodId,
			},
		}
	);
	console.log("Creating subscription...");
	// Create the subscription
	const subscription = await stripe.subscriptions.create({
		customer: req.body.customerId.customerId,
		items: [{ price: req.body.customerId.priceId }],
		expand: ['latest_invoice.payment_intent'],
	});
	console.log("Success");

	// Get user data.
	const user = JSON.stringify({
		UserId: req.body.customerId.userId,
		CustomerId: subscription.customer,
		Preferences: "",
		Phone: req.body.customerId.phone,
		Name: req.body.customerId.name,
		Email: req.body.customerId.email,
		SubscriptionId: subscription.id,
		SubscriptionEnd: subscription.current_period_end,
		PaymentMethodId: req.body.customerId.paymentMethodId,
		PriceId: req.body.customerId.priceId
	});

	const options = {
		hostname: 'localhost',
		port: 3002,
		path: '/create-user',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': user.length
		}
	};
	httpRequest(options, user);

	res.send(subscription);
});


app.post('/cancel-subscription', async (req, res) => {
	// End user subscription -> move them to Inactive, end their plan (Stripe?)
	// 1. Get user data from active users.
	// 2. Get subscriptionId and cancel subscription. 
	// End user subscription -> move them to Inactive, end their plan (Stripe?)
	// 1. Get user data from active users.
	// 2. Get subscriptionId and cancel subscription. 
	let userToUnsubscribe;
	const userId = req.body.userId;

	const databaseClient = new MongoClient(uri, { useNewUrlParser: true });
	databaseClient.connect(async (err) => {
		let userData = databaseClient.db("ShopByte").collection("Users - Active");
		// Get user data.
		userToUnsubscribe = await userData.findOne({UserId: userId}); // Get user from db.
		const subscriptionId = userToUnsubscribe.SubscriptionId; // Get subId from user.
		stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
		// Move user from Active to Inactive
		userData.findOneAndDelete({UserId: userId}); // User deleted.

		// Add user to Inactive.
		userData = databaseClient.db("ShopByte").collection("Users - Inactive");
		userData.insertOne(userToUnsubscribe, (error, res) => {
			if (error) throw error;
			console.log("Successfully moved user to inactive.");
		});
		databaseClient.close();
	});
});


app.post('/sell-product', async (req, res) => {
	// How to handle selling product? Notify biz and release payment after sending item?
});


app.post('/withdrawal-from-account', async (req, res) => {
	// Allow company to withdrawal from their account to a connected bank account.
});


app.post('/get-customer-profiles', async (req, res) => {
	// Return list of all the customer profiles from products sold
});


app.post('/get-current-products', async (req, res) => {
	// Return snapshot of current products for a business.
});

function httpRequest(options, payload) {
	let request = http.request(options, (result) => {
		console.log('statusCode:', result.statusCode);
  	console.log('headers:', result.headers);

		result.on('data', (d) => {
			process.stdout.write(d);
		});
	});

	request.on('error', (e) => {
		console.error(e);
	});
	
	request.write(payload);
	request.end();
}


http.createServer(app).listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});