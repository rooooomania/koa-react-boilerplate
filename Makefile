.PHONY: test
test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	    --timeout 5000 \
	    --harmony-async-await \
	    --require babel-polyfill \
		--compilers js:babel-register \
		--reporter spec \
		./api/test/*.js
