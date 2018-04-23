FROM node:latest

WORKDIR /opt/supportal

RUN apt-get update && apt-get install -y \
    cpanminus \
    libdbd-mysql-perl \
    && rm -rf /var/lib/apt/lists/*

COPY cpanfile ./
RUN cpanm --installdeps --notest .

COPY package.json yarn.lock ./
RUN yarn install && yarn cache clean

COPY . .

RUN yarn build

EXPOSE 3000

RUN mkdir -p sessions

ARG GIT_COMMIT_HASH
LABEL commit=$GIT_COMMIT_HASH
CMD ["perl", "dashboard_app.pl", "daemon"]
