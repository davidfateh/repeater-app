.PHONY: local start start-lite restart stop build rebuild logs shell speak k8-start k8-test
SHELL = /bin/sh

PROJECT = pensieve
ID=$(shell (docker ps | grep $(PROJECT) | awk '{print $$1}'))

local: ## spin it up and watch the logs
local: stop build start logs

build: ## build the container to run the vue app
	docker build -t $(PROJECT) -f Dockerfile .

rebuild: ## rebuild the container without caches to run the vue app
	docker build --no-cache -t $(PROJECT) -f Dockerfile .

start: ## run the vue app (runs npm install and build)
	docker run -d -t -e HOST=0.0.0.0 --expose 3000 -p 3000:3000 $(PROJECT)

restart: ## rerun the vue app (stop, build, and start the app again)
restart: stop start logs

stop: ## stop a running container
	docker container stop $(ID) || echo "stopped already"

logs: ## tail the logs of the container
	docker logs -f $(ID)

shell: ## jump onto the container
	docker exec -it $(ID) sh

speak: ## say when a build is done
	say "build has completed"

help: ## show targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
  | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'
