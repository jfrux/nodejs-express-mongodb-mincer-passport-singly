module.exports = {
	development: {
		domain:'http://localhost:3000'
		,db: 'mongodb://localhost/mydatabase_dev'
		,singly: {
			clientID: "00000000000"
			, clientSecret: "00000000000"
			, callbackURL: "http://localhost:3000/auth/callback"
		}
		,email:{
			domain: "smtp.sendgrid.net",
			host: "smtp.sendgrid.net",
			port : 587,
			authentication: "login",
			auth: {
		        user: "",
		        pass: ""
		    }
		}
	}
	,test: {
		domain:'http://testdomain:3000'
		,db: 'mongodb://localhost/mydatabase_test'
		,singly: {
			clientID: ""
			, clientSecret: ""
			, callbackURL: "http://localhost:3000/auth/callback"
		}
		,email:{
			domain: "smtp.sendgrid.net",
			host: "smtp.sendgrid.net",
			port : 587,
			authentication: "login",
			auth: {
		        user: "",
		        pass: ""
		    }
		}
	}
	,production: {
		domain:'http://mysite.jit.su'
		,db: 'mongodb://productiondburl/mydatabase_prod'
		,singly: {
			clientID: ""
			, clientSecret: ""
			, callbackURL: "http://mysite.jit.su/auth/callback"
		}
		,email:{
			domain: "smtp.sendgrid.net",
			host: "smtp.sendgrid.net",
			port : 587,
			authentication: "login",
			auth: {
		        user: "",
		        pass: ""
		    }
		}
	}
}