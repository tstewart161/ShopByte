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
	// Get user data.
	let user = req.body.profile;

	// const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@sms-news-cluster-ta7l1.mongodb.net/test?retryWrites=true&w=majority`;
	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
		const collection = client.db("SMS-News").collection("Users - Active");

		collection.insertOne(user, (error, res) => {
			if (error) throw error;
			console.log("Successfully added new user!");
		})
		client.close();
	});
});


app.post('/create-profile', async (req, res) => {
	// 1. Associate user profile with authId and store in 'Profiles' section of db.
	let profile = req.body.profile;

	// const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@sms-news-cluster-ta7l1.mongodb.net/test?retryWrites=true&w=majority`;
	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
		const collection = client.db("ShopByte").collection("Profiles - Active");

		collection.insertOne(profile, (error, res) => {
			if (error) throw error;
			console.log("Successfully added new user!");
		})
		client.close();
	});
});


app.post('/user-profile', async (req, res) => {
	// Display user profile. 
	// 1. Use authId to find profile in database and return it.
	let authId = req.body.authId;
	let profile;

	// const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@sms-news-cluster-ta7l1.mongodb.net/test?retryWrites=true&w=majority`;
	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
		const collection = client.db("ShopByte").collection("Profiles - Active");
		// Get user data.
		profile = collection.findOne({AuthId: authId}); // Get profile from db.
		client.close();	
	});
	
	return profile;
});


app.post('/update-profile', async (req, res) => {
	
	let authId = req.body.authId;
	let updatedField = req.body.updatedField;
	let profile;

	// const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@sms-news-cluster-ta7l1.mongodb.net/test?retryWrites=true&w=majority`;
	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
		const collection = client.db("ShopByte").collection("Profiles - Active");
		// Get user data.
		// profile = collection.findOneAndUpdate({AuthId: authId}); // how does this work??
		client.close();	
	});

	return profile;
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


app.post('/deliver-user-profile', async (req, res) => {
	let authId = req.body.authId;
	let profile;

	// const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@sms-news-cluster-ta7l1.mongodb.net/test?retryWrites=true&w=majority`;
	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
		const collection = client.db("ShopByte").collection("Profiles - Active");
		// Get user data.
		// profile = collection.findOneAndUpdate({AuthId: authId}); // how does this work??
		profile = collection.findOne({AuthId: authId});
		client.close();	
	});

	return profile;
});



/// Businesses:
///
app.post('/create-business', async (req, res) => {
	const business = await stripe.customers.create({
		email: req.body.email,
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
	// const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@sms-news-cluster-ta7l1.mongodb.net/test?retryWrites=true&w=majority`;
	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
		const collection = client.db("ShopByte").collection("Products");
		// Get user data.
		// profile = collection.findOneAndUpdate({AuthId: authId}); // how does this work??
		collection.insertOne(product, (error, res) => {
			if (error) throw error;
			console.log("Successfully added new product.");
		})
		client.close();	
	});
	

});


app.post('/update-product', async (req, res) => {
	// Check to make sure customer is active!
	let customerId = req.body.customerId;
	let updatedField = req.body.updatedField;
	let product;

	// const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@sms-news-cluster-ta7l1.mongodb.net/test?retryWrites=true&w=majority`;
	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
		const collection = client.db("ShopByte").collection("Products");
		// Get user data.
		// product = collection.findOneAndUpdate({CustomerId: customerId}); // how does this work??
		client.close();	
	});
	return product;
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
	let user = JSON.stringify({
		AuthId: req.body.customerId.authId,
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

	let options = {
		hostname: 'localhost',
		port: 3002,
		path: '/create-user',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': user.length
		}
	};

	// let request = http.request(options, (result) => {
	// 	console.log('statusCode:', result.statusCode);
  // 	console.log('headers:', result.headers);

	// 	result.on('data', (d) => {
	// 		process.stdout.write(d);
	// 	});
	// });

	// request.on('error', (e) => {
	// 	console.error(e);
	// });
	
	// request.write(user);
	// request.end();
	httpRequest(options, user);

	res.send(subscription);
});


app.post('/cancel-subscription', async (req, res) => {
	// End user subscription -> move them to Inactive, end their plan (Stripe?)
	// 1. Get user data from active users.
	// 2. Get subscriptionId and cancel subscription. 
	let user;
	let authId = req.body.authId;
	const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@sms-news-cluster-ta7l1.mongodb.net/test?retryWrites=true&w=majority`;
	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
		const collection = client.db("SMS-News").collection("Users - Active");
		// Get user data.
		user = collection.findOne({AuthId: authId}); // Get user from db.
		let subscriptionId = user.SubscriptionId; // Get subId from user.
		stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
		client.close();
	});
});


app.post('/products-sold', async (req, res) => {
	// How to handle selling product? Notify biz and release payment after sending item?
});


app.post('/account-withdrawal', async (req, res) => {
	// Allow company to withdrawal from their account to a connected bank account.
});


app.post('/customer-profiles', async (req, res) => {
	// Return list of all the customer profiles from products sold
});


app.post('/deliver-current-products', async (req, res) => {
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