.PHONY: test
test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	    --timeout 5000 \
		--require babel-polyfill \
		--compilers js:babel-register \
		--reporter spec \
		./api/test/*.js
