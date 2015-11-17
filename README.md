# Deployment

## Backend

1. Backend dependencies deployment (in project directory):

  ```
  cpanm --installdeps .
  ```
  
2. There is an inheritable config (options in config/config.yaml is overridden by options in config/config.local.yaml).
  Create a new config/config.local.yaml file with the correct credentials to RT and SugarCRM:
  ```
  rt:
    password: "password"
    ignore_ssl_errors: 1
  
  sugar_crm:
    login: "login"
    password: "password"
    ignore_ssl_errors: 1
  ```

## Frontend

1. Frontent dependencies deployment:
  
  Run the following commands in the project directory:
  
  ```
  sudo npm install -g gulp
  npm install
  bower install
  gulp
  ```
2. Use `gulp watch` to automatically rebuild changed assets.
