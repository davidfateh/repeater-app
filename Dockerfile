FROM  node:14.17-alpine


RUN apk --no-cache add curl vim

# make the 'app' folder the current working directory
WORKDIR /srv/app

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

RUN rm -rf node_modules .next

## install project dependencies
RUN npm install


## SET THE HEALTH CHECKS
RUN /srv/app/scripts/docker/build_log.sh
RUN cat public/build.log


EXPOSE 3000
CMD ["/srv/app/scripts/docker/start.sh"]

