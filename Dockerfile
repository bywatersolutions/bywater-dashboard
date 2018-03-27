FROM node:latest

WORKDIR /opt/supportal

RUN apt-get update && apt-get install -y \
    cpanminus \
    && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install && yarn cache clean

COPY cpanfile ./
RUN cpanm --installdeps .

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["perl", "dashboard_app.pl", "daemon"]
