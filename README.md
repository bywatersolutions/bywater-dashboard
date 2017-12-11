# ByWater Supportal

## Initial setup

Install Node, NPM and CPANm using distribution packages. Then:

    $ sudo npm install -g yarn
    $ yarn install
    $ cpanm --installdeps .

## Developing

In one terminal, start Webpack to automatically compile the JS:

    $ webpack -w

In another, start the server:

    $ perl dashboard_app.pl daemon

Then, navigate to http://localhost:3000/ .
