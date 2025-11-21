.PHONY: install lint test ci projects-json

install:
	npm install

lint:
	npm run lint

test:
	npm run test

ci:
	npm run ci

projects-json:
	npx js-yaml data/projects.yml > data/projects.json
