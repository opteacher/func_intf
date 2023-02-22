FROM mhart/alpine-node:latest

WORKDIR /app

COPY . /app
RUN npm config set registry http://registry.npm.taobao.org \
  && npm install -g npm@8.14.0 \
  && npm install --unsafe-perm=true --allow-root \
  && npm run build

COPY /app/dist/* /public
RUN npm i http-server

EXPOSE 8080

ENTRYPOINT [ "http-server" ]
CMD [ "-P", "http://nginx" ]
