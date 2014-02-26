# load-env

Load your environment configuration in a easy way and only one time.

<a href="https://nodei.co/npm/load-env/"><img src="https://nodei.co/npm/load-env.png?downloads=true"></a>

[![Build Status](https://travis-ci.org/joaquimserafim/load-env.png?branch=master)](https://travis-ci.org/joaquimserafim/load-env)



**V1.1**

####API

    var load = require('load-env') || require('load-env').load()
    
    load([environment], [config_path])
    
    
    or from CLI: node my_app --env heroku
    
    in your app: load();
    
    --env is mandatory in CLI 
   
   
   **config** folder must be in your application current directory or can use [path]
   to define the localization of your config files, and the files must have the exactly name as your environment (heroku.json will be env heroku).
   
   **Example:**
   
      config/ 
          development.json
          heroku.json
          local.json    
    



####JSON

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
        
       require('load-env').load();
               
       console.log(process.env.MONGODB_URL);
       console.log(process.env.APP_PORT);
       
       
       // CLI
       node my_app --env heroku