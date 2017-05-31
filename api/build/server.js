'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaLogger = require('koa-logger');

var _koaLogger2 = _interopRequireDefault(_koaLogger);

var _koaBodyparser = require('koa-bodyparser');

var _koaBodyparser2 = _interopRequireDefault(_koaBodyparser);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _authenticationHelper = require('./helper/authenticationHelper');

var authN = _interopRequireWildcard(_authenticationHelper);

var _middlewares = require('./middlewares');

var _fakeSessionStore = require('./dummy/fakeSessionStore');

var _fakeSessionStore2 = _interopRequireDefault(_fakeSessionStore);

var _signin = require('./route/signin');

var Signin = _interopRequireWildcard(_signin);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sessionMgr = _fakeSessionStore2.default.createInstance();

console.log('SessionMgr initiated', sessionMgr);
// Create API
var router = (0, _koaRouter2.default)();
router.get('/', function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ctx.body = 'hello world';

            next();

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()).get('/:last/:first', function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            ctx.body = ('' + ctx.params['last'] + ctx.params['first']).toUpperCase();
            next();

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}())
/*
 * サインイン画面のフォームが使う認証リクエスト用API。
 * 正常に処理されると同意確認画面へリダイレクトする
 */
.get('/signin', Signin.get()).post('/signin', Signin.post())
/*
 * 同意確認を済ませた（済ませている）UAが呼び出すAPI。
 * Cookieに含んだセッションキー(必須）を元に、同意情報を登録する。
 */
.get('/authorization', function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx, next) {
    var sessionMgr, _ctx$query, clientId, redirectEndpoint, sessionKey, session, isContain;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            sessionMgr = _fakeSessionStore2.default.getInstance();
            _ctx$query = ctx.query, clientId = _ctx$query.clientId, redirectEndpoint = _ctx$query.redirectEndpoint;

            // 通常ならセットされているセッションキーを確認し、その情報が有効かどうかを確認する

            sessionKey = ctx.cookies.get('sessionKey');

            if (!sessionKey) {
              _context3.next = 13;
              break;
            }

            session = sessionMgr.getItem(sessionKey);

            if (!session) {
              _context3.next = 13;
              break;
            }

            _context3.next = 8;
            return authN.verifyUser(session.idtoken);

          case 8:
            if (!_context3.sent) {
              _context3.next = 13;
              break;
            }

            //TODO: 同意済み情報をセッションに保持する
            isContain = session.allowedClient.find(function (elm) {
              return elm === clientId;
            });

            if (!isContain) {
              sessionMgr.updateItem((0, _assign2.default)(session, { allowedClient: [clientId].concat(session.allowedClient) }));
            }
            ctx.redirect(redirectEndpoint + '?session=' + session.id);
            return _context3.abrupt('return');

          case 13:

            // セッションが無効ならば、`Unauthorized User`
            ctx.status = 401;

            next();

          case 15:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()).post('/authorization', function () {
  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(ctx, next) {
    var sessionMgr, _ctx$request$body, clientId, redirectEndpoint, sessionKey, session, isContain;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            sessionMgr = _fakeSessionStore2.default.getInstance();
            _ctx$request$body = ctx.request.body, clientId = _ctx$request$body.clientId, redirectEndpoint = _ctx$request$body.redirectEndpoint;

            // 通常ならセットされているセッションキーを確認し、その情報が有効かどうかを確認する

            sessionKey = ctx.cookies.get('sessionKey');

            if (!sessionKey) {
              _context4.next = 13;
              break;
            }

            session = sessionMgr.getItem(sessionKey);

            if (!session) {
              _context4.next = 13;
              break;
            }

            _context4.next = 8;
            return authN.verifyUser(session.idtoken);

          case 8:
            if (!_context4.sent) {
              _context4.next = 13;
              break;
            }

            //TODO: 同意済み情報をセッションに保持する
            isContain = session.allowedClient.find(function (elm) {
              return elm === clientId;
            });

            if (!isContain) {
              sessionMgr.updateItem((0, _assign2.default)(session, { allowedClient: [clientId].concat(session.allowedClient) }));
            }
            ctx.redirect(redirectEndpoint + '?session=' + session.id);
            return _context4.abrupt('return');

          case 13:

            // セッションが無効ならば、`Unauthorized User`
            ctx.status = 401;

            next();

          case 15:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());

// Create View
var app = new _koa2.default();

// Apply middlewares
app.use((0, _koaLogger2.default)()).use((0, _koaBodyparser2.default)()).use((0, _middlewares.pageNotFound)()).use(router.routes()).use(router.allowedMethods());

exports.default = app;