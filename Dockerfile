FROM mhart/alpine-node:latest

WORKDIR /public

RUN npm install -g npm@8.14.0 && npm i http-server

COPY ./dist /public

EXPOSE 8080

ENTRYPOINT [ "http-server" ]
CMD [ "-P", "http://nginx" ]
