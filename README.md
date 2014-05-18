# load-env

Load your environment configuration in a easy way and call in your code only one time and will be available through "process.env".

<a href="https://nodei.co/npm/load-env/"><img src="https://nodei.co/npm/load-env.png?downloads=true"></a>

[![Build Status](https://travis-ci.org/joaquimserafim/load-env.png?branch=master)](https://travis-ci.org/joaquimserafim/load-env)



**V1.3**

It's possible to reload the environment configuration by change the config file.
Attention, process.env convert all values to string,
must cast in case isn't a string, ex:
	
	port number for your web server => 3000
	
	console.log(process.env.WEB_PORT);// is going be '3000'
	console.log(Number(process.env.WEB_PORT));// is going be 3000
	
	
	a JSON object with some options => {port: 4000, address: 'localhost'}
	
	console.log(process.env.NET_OPTIONS);
	// is gonna be '{"port":4000,"address":"localhost"}'
	// internally we are using JSON.stringify
	
	console.log(JSON.parse(process.env.NET_OPTIONS));
	// is gonna be { port: 4000, address: 'localhost' }
	

If wants to get the primitive value of the specified object can use `process.loadenv.'key'` and don't need to do any conversion.

	 typeof process.loadenv.MONGODB_URL === 'string'
	 typeof process.loadenv.APP_PORT === 'number'
	 isJSON(process.loadenv.WINDOW_SIZE, true)


####API


`var load = require('load-env')` or `require('load-env')()`
  
`load([environment], [config_path], [reload*])`

***reload** accepts a bool (default to false/null), if wants to reload the
	enviroment when the configuration file is updated then pass `true`.
	

from CLI: `node my_app --env heroku`

in your app just need to make the require and call `load();`

`--env` is mandatory in CLI


**config** folder must be in your application current directory or can use [path]
   to define the localization of your config files, and the files must have the exactly name as your environment (heroku.json will be env heroku).

   **Example:**

      config/
          development.json
          heroku.json
          local.json




####JSON strutucture for config file

 {"var_name": {"format": "", "value":""}}

    format: value with placeholders
        %s - String
        %d - Number (both integer and float)
        %j - JSON
    value: object with the values to replace the placeholders

   **Example**

        {
          "MONGODB_URL": {
            "format": "mongodb://%s:%s@%s/%s?%s",
            "value" : {
              "user": "xpto",
              "pwd": "password",
              "host": "ec2-22-197-555-120.compute-100.amazonaws.com",
              "db": "lilidb",
              "extra": "numberOfRetries=10&retryMiliSeconds=10000"
            }
          },
          "APP_PORT": {
            "format": "%d",
            "value" : {
              "port": 4000
            }
          }
        }



       // now in your code

       require('load-env')(); // var load = require('load-env'); load();

       console.log(process.env.MONGODB_URL); // 'conn_str'
       console.log(process.env.APP_PORT); // '4000'
		
	OR
	   console.log(process.loadenv.MONGODB_URL); // 'conn_str'
       console.log(process.loadenv.APP_PORT); // 4000
       
       // CLI
       node my_app --env heroku
       
       

#### Example with JSON objects in the configuration

	{
	  "WINDOW_SIZE": {
	    "format": "%j",
	    "value": {
	      "sizes": {
	        "width": 1000,
	        "height": 600,
	        "min-width": 800,
	        "min-height": 600
	      }
	    }
	  }
	}	  
	
	
// we are using %j to specify is a JSON

call **process.loadenv.WINDOW_SIZE** will return the the JSON already parsed

`{ width: 1000, height: 600, 'min-width': 800, 'min-height': 600 }`

call **process.env.WINDOW_SIZE** must use the **JSON.parse**





	

	
	
	
	
	
	
	