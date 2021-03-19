const fetch = require("node-fetch");

exports.handler = async (event, context) => {
	const STRIPE_API_KEY = "__stripe-secret-api-key__";
	const MAILCHIMP_SERVER = 'us1';
	const MAILCHIMP_API_KEY = `__mailchimp-api-key-${MAILCHIMP_SERVER}`;

	const { email } = JSON.parse(event.body);

	const stripe_resp = await fetch(
		`https://api.stripe.com/v1/customers?email=${email}`,
		{
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${STRIPE_API_KEY}`,
				"Content-Type": "application/x-www-form-urlencoded"
			}
		}
	);
	const stripe_data = (await stripe_resp.json()).data[0];

	const mailchimp_resp = await fetch(
		`https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/search-members?query=${email}`,
		{
			headers: {
				Authorization: `Basic: ${MAILCHIMP_API_KEY}`
			}
		}
	);
	const mailchimp_data = (await mailchimp_resp.json()).exact_matches.members[0];

	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Content-Type'
		},
		body: JSON.stringify({
			email,

			email_type: mailchimp_data.email_type,
			address: mailchimp_data.merge_fields.ADDRESS,
			phone: mailchimp_data.merge_fields.PHONE,
			first_name: mailchimp_data.merge_fields.FNAME,
			last_name: mailchimp_data.merge_fields.LNAME,
			birthday: mailchimp_data.merge_fields.BIRTHDAY,

			stripe_customer: stripe_data.id,
			discount: stripe_data.discount,
			created: stripe_data.created
		})
	};
};
