FROM node:16.15.1
WORKDIR /app
COPY . /app
RUN npm config set registry http://registry.npm.taobao.org \
  && npm install --unsafe-perm=true --allow-root \
  && npm run build

FROM mhart/alpine-node:latest
WORKDIR /public
COPY --from=0 /app/dist/* /public
RUN npm i http-server
EXPOSE 8080
ENTRYPOINT [ "http-server" ]
CMD [ "-P", "http://nginx" ]
