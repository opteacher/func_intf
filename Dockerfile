FROM mhart/alpine-node:latest

WORKDIR /app

COPY . /app
RUN apt-get install git \
  && git submodule init && git submodule update \
  && npm config set registry http://registry.npm.taobao.org \
  && npm install -g npm@8.14.0 \
  && npm install --unsafe-perm=true --allow-root \
  && npm run build

RUN npm i http-server
COPY ./dist/* /public

EXPOSE 8080

ENTRYPOINT [ "http-server" ]
CMD [ "-P", "http://nginx" ]
