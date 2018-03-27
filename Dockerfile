FROM node:latest

COPY package.json yarn.lock ./
RUN yarn install

COPY cpanfile ./
RUN apt-get install cpanm && cpanm --installdeps .

WORKDIR /opt/supportal

COPY . .

RUN yarn build

CMD ["perl", "dashboard_app.pl", "daemon"]
