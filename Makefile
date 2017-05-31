.PHONY: test
test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	    --timeout 5000 \
		--compilers js:babel-register \
		--reporter spec \
		./api/test/*.js
