FROM node:latest

WORKDIR /opt/supportal

COPY package.json yarn.lock ./
RUN yarn install

COPY cpanfile ./
RUN apt-get install cpanm && cpanm --installdeps .

COPY . .

RUN yarn build

CMD ["perl", "dashboard_app.pl", "daemon"]
