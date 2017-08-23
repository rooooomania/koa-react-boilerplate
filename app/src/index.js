import React, { Component }from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import Request from 'superagent';
const parseHelper =  require('../../api/build/helper/urlParsseHelper') ;
const utilHelper = require('../../api/build/helper/utilities');

class Login extends Component {
    onClickLogin(e) {
        e.preventDefault();

        const clientId = '6fu6vegopk4ucpt4srv7cjk1i9';
        // 例として、ITZサイト専用のサインイン画面を想定(redirectEndpointを埋め込んでおく)
        const redirectEndpoint = 'http://rooooomania-markdown2textile-converter.s3-website-us-west-2.amazonaws.com/';
        alert(`username: ${this.username.value}\n
    password: ${this.password.value}\n
    clientId: ${clientId}\n
    redirectEndpoint: ${redirectEndpoint}`);

        Request
            .post('http://' + location.hostname + '/signin')
            .withCredentials()
            .set('Content-type', 'application/x-www-form-urlencoded')
            .send({
                redirectEndpoint: redirectEndpoint,
                clientId: clientId,
                username: this.username.value,
                password: this.password.value,
            })
            .end((err, res) => {
                if (err || !res.ok) {
                    console.error('err', err);
                    window.alert(err);
                    return;
                }

                const url = res.xhr.responseURL;
                const restr = '[authz|rooooomania]';
                if (url && parseHelper.isValidUrl(url, restr)) {
                    window.location.replace(url);
                } else {
                    console.log('Invalid RedirectEndpoint.');
                }

            });
    }

    render() {
        return (
            <form>
                <div className="loginform">
                    <div className="username">
                        <label htmlFor="username">username</label><br />
                        <input
                            id="username"
                            ref={(input) => {this.username = input;}}
                        />
                    </div>
                    <div className="password">
                        <label htmlFor="password">password</label><br />
                        <input type="password" id="password"
                               ref={(input) => {this.password = input;}}
                        />
                    </div>
                    <div>
                        <button onClick={this.onClickLogin.bind(this)}
                                type="submit">
                            login
                        </button>
                    </div>
                </div>
            </form>
        );
    }
}

class AuthZ extends Component {
    constructor(props) {
        super(props);
        console.log(props);
    }

    onClickContent(e) {
        e.preventDefault();

        // TODO: QueryString Parameter から RedirectEndpointとClientId を、Cookieから SessionKeyを取得する
        const queryObj = utilHelper.objectify(this.props.location.search);
        const redirectEndpoint = queryObj.redirectEndpoint;
        const clientId = queryObj.clientId;

        // const redirectEndpoint = 'http://rooooomania-markdown2textile-converter.s3-website-us-west-2.amazonaws.com/';
        // const clientId = '6fu6vegopk4ucpt4srv7cjk1i9';

        Request
            .post('http://' + location.hostname + '/authorization')
            .withCredentials()
            .set('Content-type', 'application/x-www-form-urlencoded')
            .set('Access-Control-Allow-Origin', '*')
            .set('Access-Control-AlutilHelper.low-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
            .set('Access-Control-Allow-Headers', 'Content-Type, Content-Range, Content-Disposition, Content-Description')
            .send({
                redirectEndpoint: redirectEndpoint,
                clientId: clientId,
            })
            .end((err, res) => {
                if (err || !res.ok) {
                    console.error('err', err);
                    window.alert(err);
                    return;
                }

                console.log(res.xhr.responseURL);
                window.location.href = res.xhr.responseURL;
            });

    }

    render() {
        return (
            <div>
                <h1>XXXサイトにログインしようとしています</h1>
                {this.props.location.search}<br />
                <button onClick={this.onClickContent.bind(this)}>同意する</button>
            </div>
        );
    }

}

const App = () => (
    <div>
        <Route exact path='/' />
        <Route path='/authn/' component={Login} />
        <Route path='/authz/' component={AuthZ}/>
    </div>
);

ReactDOM.render((
        <Router>
            <App />
        </Router>
    ),
    document.getElementById('root')
);

