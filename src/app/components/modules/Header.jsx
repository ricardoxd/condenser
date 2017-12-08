import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import TopRightMenu from 'app/components/modules/TopRightMenu';
import Icon from 'app/components/elements/Icon';
import resolveRoute from 'app/ResolveRoute';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import HorizontalMenu from 'app/components/elements/HorizontalMenu';
import normalizeProfile from 'app/utils/NormalizeProfile';
import tt from 'counterpart';
import { APP_NAME } from 'app/client_config';

function sortOrderToLink(so, topic, account) {
    if (so === 'home') return '/@' + account + '/feed';
    if (topic) return `/${so}/${topic}`;
    return `/${so}`;
}

class Header extends React.Component {
    static propTypes = {
        location: React.PropTypes.object.isRequired,
        current_account_name: React.PropTypes.string,
        account_meta: React.PropTypes.object,
    };

    constructor() {
        super();
        this.state = { subheader_hidden: false };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Header');
        this.hideSubheader = this.hideSubheader.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.hideSubheader, {
            capture: false,
            passive: true,
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            const route = resolveRoute(nextProps.location.pathname);
            if (
                route &&
                route.page === 'PostsIndex' &&
                route.params &&
                route.params.length > 0
            ) {
                const sort_order =
                    route.params[0] !== 'home' ? route.params[0] : null;
                if (sort_order)
                    window.last_sort_order = this.last_sort_order = sort_order;
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.hideSubheader);
    }

    hideSubheader() {
        const subheader_hidden = this.state.subheader_hidden;
        const y =
            window.scrollY >= 0
                ? window.scrollY
                : document.documentElement.scrollTop;
        if (y === this.prevScrollY) return;

        if (y < 5) {
            this.setState({ subheader_hidden: false });
        } else if (y > this.prevScrollY) {
            if (!subheader_hidden) this.setState({ subheader_hidden: true });
        } else {
            if (subheader_hidden) this.setState({ subheader_hidden: false });
        }
        this.prevScrollY = y;
    }

    render() {
        const route = resolveRoute(this.props.location.pathname);
        const current_account_name = this.props.current_account_name;
        let home_account = false;
        let page_title = route.page;

        let sort_order = '';
        let topic = '';
        let user_name = null;
        let page_name = null;
        this.state.subheader_hidden = false;
        if (route.page === 'PostsIndex') {
            sort_order = route.params[0];
            if (sort_order === 'home') {
                page_title = tt('header_jsx.home');
                const account_name = route.params[1];
                if (
                    current_account_name &&
                    account_name.indexOf(current_account_name) === 1
                )
                    home_account = true;
            } else {
                topic = route.params.length > 1 ? route.params[1] : '';
                const type =
                    route.params[0] == 'payout_comments' ? 'comments' : 'posts';
                let prefix = route.params[0];
                if (prefix == 'created') prefix = 'New';
                if (prefix == 'payout') prefix = 'Pending payout';
                if (prefix == 'payout_comments') prefix = 'Pending payout';
                if (topic !== '') prefix += ` ${topic}`;
                page_title = `${prefix} ${type}`;
            }
        } else if (route.page === 'Post') {
            sort_order = '';
            topic = route.params[0];
        } else if (route.page == 'SubmitPost') {
            page_title = tt('header_jsx.create_a_post');
        } else if (route.page == 'Privacy') {
            page_title = tt('navigation.privacy_policy');
        } else if (route.page == 'Tos') {
            page_title = tt('navigation.terms_of_service');
        } else if (route.page == 'ChangePassword') {
            page_title = tt('header_jsx.change_account_password');
        } else if (route.page == 'CreateAccount') {
            page_title = tt('header_jsx.create_account');
        } else if (route.page == 'PickAccount') {
            page_title = `Pick Your New Steemit Account`;
            this.state.subheader_hidden = true;
        } else if (route.page == 'Approval') {
            page_title = `Account Confirmation`;
            this.state.subheader_hidden = true;
        } else if (
            route.page == 'RecoverAccountStep1' ||
            route.page == 'RecoverAccountStep2'
        ) {
            page_title = tt('header_jsx.stolen_account_recovery');
        } else if (route.page === 'UserProfile') {
            user_name = route.params[0].slice(1);
            const acct_meta = this.props.account_meta.getIn([user_name]);
            const name = acct_meta
                ? normalizeProfile(acct_meta.toJS()).name
                : null;
            const user_title = name ? `${name} (@${user_name})` : user_name;
            page_title = user_title;
            if (route.params[1] === 'followers') {
                page_title =
                    tt('header_jsx.people_following') + ' ' + user_title;
            }
            if (route.params[1] === 'followed') {
                page_title =
                    tt('header_jsx.people_followed_by') + ' ' + user_title;
            }
            if (route.params[1] === 'curation-rewards') {
                page_title =
                    tt('header_jsx.curation_rewards_by') + ' ' + user_title;
            }
            if (route.params[1] === 'author-rewards') {
                page_title =
                    tt('header_jsx.author_rewards_by') + ' ' + user_title;
            }
            if (route.params[1] === 'recent-replies') {
                page_title = tt('header_jsx.replies_to') + ' ' + user_title;
            }
            // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
            if (route.params[1] === 'posts' || route.params[1] === 'comments') {
                page_title = tt('header_jsx.comments_by') + ' ' + user_title;
            }
        } else {
            page_name = ''; //page_title = route.page.replace( /([a-z])([A-Z])/g, '$1 $2' ).toLowerCase();
        }

        // Format first letter of all titles and lowercase user name
        if (route.page !== 'UserProfile') {
            page_title =
                page_title.charAt(0).toUpperCase() + page_title.slice(1);
        }

        if (
            process.env.BROWSER &&
            (route.page !== 'Post' && route.page !== 'PostNoCategory')
        )
            document.title = page_title + ' — ' + APP_NAME;

        const logo_link =
            route.params && route.params.length > 1 && this.last_sort_order
                ? '/' + this.last_sort_order
                : current_account_name ? `/@${current_account_name}/feed` : '/';
        const topic_link = topic ? (
            <Link to={`/${this.last_sort_order || 'trending'}/${topic}`}>
                {topic}
            </Link>
        ) : null;

        const sort_orders = [
            ['trending', tt('main_menu.trending')],
            ['created', tt('g.new')],
            ['hot', tt('main_menu.hot')],
            ['promoted', tt('g.promoted')],
        ];
        if (current_account_name)
            sort_orders.unshift(['home', tt('header_jsx.home')]);
        const sort_order_menu = sort_orders
            .filter(so => so[0] !== sort_order)
            .map(so => ({
                link: sortOrderToLink(so[0], topic, current_account_name),
                value: so[1],
            }));
        const selected_sort_order = sort_orders.find(
            so => so[0] === sort_order
        );

        const sort_orders_horizontal = [
            ['trending', tt('main_menu.trending')],
            ['created', tt('g.new')],
            ['hot', tt('main_menu.hot')],
            ['promoted', tt('g.promoted')],
        ];
        // if (current_account_name) sort_orders_horizontal.unshift(['home', tt('header_jsx.home')]);
        const sort_order_menu_horizontal = sort_orders_horizontal.map(so => {
            let active = so[0] === sort_order;
            if (so[0] === 'home' && sort_order === 'home' && !home_account)
                active = false;
            return {
                link: sortOrderToLink(so[0], topic, current_account_name),
                value: so[1],
                active,
            };
        });

        return (
            <header className="Header noPrint">
                <div className="Header__top header">
                    <div className="expanded row">
                        <div className="columns">
                            <ul className="menu">
                                <li className="Header__top-logo">
                                    <Link to={logo_link}>
                                        {/*
                                        <Icon name="logo" className="logo-for-mobile" />
                                        <Icon name="logotype" className="logo-for-large" />  */}

                                        <svg
                                            className="logo-new logo-new--mobile"
                                            viewBox="0 0 38 38"
                                            version="1.1"
                                        >
                                            <title>Steemit Logo</title>
                                            <g
                                                stroke="none"
                                                fill="none"
                                                fillRule="evenodd"
                                            >
                                                <g
                                                    className="icon-svg"
                                                    fillRule="nonzero"
                                                >
                                                    <path d="M87 299 c-9 -6 -15 -14 -12 -19 3 -5 0 -12 -6 -16 -8 -4 -9 -3 -5 4
4 7 3 12 -1 12 -5 0 -14 -10 -22 -22 -13 -20 -12 -22 1 -11 8 7 18 10 21 6 4
-3 16 2 27 12 24 21 125 23 149 1 9 -7 27 -16 41 -19 23 -6 22 -3 -12 28 -35
32 -43 35 -100 35 -35 0 -71 -5 -81 -11z" class="icon-svg__shape"/>
<path d="M970 225 c0 -8 7 -15 15 -15 8 0 15 7 15 15 0 8 -7 15 -15 15 -8 0
-15 -7 -15 -15z" class="icon-svg__shape"/>
<path d="M16 213 c-11 -27 -6 -44 19 -68 34 -35 88 -34 112 1 l17 26 19 -26
c22 -30 69 -35 104 -11 16 11 22 12 25 3 2 -6 4 7 4 29 -1 23 -5 45 -9 50 -5
4 -71 9 -147 9 -113 1 -140 -1 -144 -13z m158 -14 c-3 -5 -10 -7 -15 -3 -5 3
-7 10 -3 15 3 5 10 7 15 3 5 -3 7 -10 3 -15z m-30 -5 c11 -28 -12 -54 -47 -54
-37 0 -51 8 -60 33 -11 29 0 37 53 37 34 0 50 -4 54 -16z m86 -44 c6 0 4 10
-5 23 -8 13 -12 27 -8 30 10 11 83 8 83 -3 0 -5 -4 -10 -10 -10 -5 0 -7 -7 -3
-16 14 -36 -66 -48 -91 -13 -8 12 -12 28 -9 36 4 11 10 6 19 -16 7 -17 18 -31
24 -31z" class="icon-svg__shape"/>
<path d="M51 184 c0 -11 3 -14 6 -6 3 7 2 16 -1 19 -3 4 -6 -2 -5 -13z" class="icon-svg__shape"/>
<path d="M330 165 c0 -37 4 -65 10 -65 6 0 10 24 11 53 l0 52 27 -52 c17 -34
32 -53 44 -53 15 0 18 9 18 65 0 75 -17 89 -22 18 l-3 -48 -25 48 c-15 30 -31
47 -42 47 -15 0 -18 -9 -18 -65z" class="icon-svg__shape"/>
<path d="M756 214 c-21 -20 -21 -78 0 -98 19 -19 67 -21 82 -3 38 45 15 117
-38 117 -15 0 -36 -7 -44 -16z m62 -16 c30 -30 -2 -93 -36 -71 -21 13 -27 50
-12 69 15 17 32 18 48 2z" class="icon-svg__shape"/>
<path d="M482 188 c-7 -7 -12 -24 -12 -38 0 -31 17 -50 45 -50 29 0 45 19 45
52 0 40 -51 63 -78 36z m48 -38 c0 -20 -5 -30 -15 -30 -18 0 -30 24 -21 45 10
28 36 17 36 -15z" class="icon-svg__shape"/>
<path d="M575 183 c4 -10 11 -33 17 -50 13 -46 35 -42 46 10 l9 42 8 -42 c9
-51 39 -60 49 -15 3 15 8 37 12 50 5 16 2 22 -10 22 -9 0 -16 -8 -16 -19 0
-11 -3 -28 -7 -38 -6 -14 -9 -10 -13 17 -7 51 -37 53 -46 3 l-8 -38 -9 38 c-5
22 -15 37 -24 37 -10 0 -13 -5 -8 -17z" class="icon-svg__shape"/>
<path d="M892 188 c-18 -18 -15 -75 4 -82 27 -10 54 -7 54 7 0 8 -10 13 -22
13 -18 -1 -23 5 -23 24 0 19 5 25 23 24 12 0 22 5 22 13 0 16 -42 17 -58 1z" class="icon-svg__shape"/>
<path d="M970 150 c0 -38 4 -50 15 -50 11 0 15 12 15 50 0 38 -4 50 -15 50
-11 0 -15 -12 -15 -50z" class="icon-svg__shape"/>
<path d="M1036 185 c-42 -42 12 -108 62 -76 8 5 12 23 10 47 -3 34 -7 39 -29
42 -15 2 -34 -4 -43 -13z m49 -35 c0 -27 -22 -39 -31 -16 -8 22 3 49 19 43 6
-2 12 -14 12 -27z" class="icon-svg__shape"/>
<path d="M11 125 c0 -25 23 -57 34 -47 5 4 5 1 0 -7 -5 -9 2 -21 21 -37 24
-19 41 -23 95 -24 44 0 71 5 85 16 18 14 18 15 -6 4 -23 -10 -24 -10 -6 4 10
9 23 13 28 10 12 -8 39 28 33 44 -3 7 0 10 5 7 6 -3 10 1 10 9 0 24 -14 19
-39 -15 -12 -16 -28 -28 -34 -26 -6 2 -21 -8 -33 -22 -19 -22 -26 -24 -50 -16
-35 13 -47 41 -13 32 26 -7 69 1 69 13 0 4 -16 10 -36 12 -28 3 -41 -1 -55
-16 -11 -11 -19 -23 -19 -28 0 -4 -5 -8 -11 -8 -5 0 -7 5 -4 10 4 6 -5 23 -19
38 -14 15 -32 36 -40 47 -15 20 -15 20 -15 0z" class="icon-svg__shape"/>
                                                </g>
                                            </g>
                                        </svg>

                                        <svg
                                            className="logo-new logo-new--desktop"
                                            width="148px"
                                            height="38px"
                                            viewBox="0 0 148 38"
                                            version="1.1"
                                        >
                                            <title>Steemit Logo</title>
                                            <g
                                                stroke="none"
                                                strokeWidth="1"
                                                fill="none"
                                                fillRule="evenodd"
                                            >
                                                <g
                                                    className="icon-svg"
                                                    fillRule="nonzero"
                                                >
                                                    <path d="M87 299 c-9 -6 -15 -14 -12 -19 3 -5 0 -12 -6 -16 -8 -4 -9 -3 -5 4
4 7 3 12 -1 12 -5 0 -14 -10 -22 -22 -13 -20 -12 -22 1 -11 8 7 18 10 21 6 4
-3 16 2 27 12 24 21 125 23 149 1 9 -7 27 -16 41 -19 23 -6 22 -3 -12 28 -35
32 -43 35 -100 35 -35 0 -71 -5 -81 -11z" class="icon-svg__shape"/>
<path d="M970 225 c0 -8 7 -15 15 -15 8 0 15 7 15 15 0 8 -7 15 -15 15 -8 0
-15 -7 -15 -15z" class="icon-svg__shape"/>
<path d="M16 213 c-11 -27 -6 -44 19 -68 34 -35 88 -34 112 1 l17 26 19 -26
c22 -30 69 -35 104 -11 16 11 22 12 25 3 2 -6 4 7 4 29 -1 23 -5 45 -9 50 -5
4 -71 9 -147 9 -113 1 -140 -1 -144 -13z m158 -14 c-3 -5 -10 -7 -15 -3 -5 3
-7 10 -3 15 3 5 10 7 15 3 5 -3 7 -10 3 -15z m-30 -5 c11 -28 -12 -54 -47 -54
-37 0 -51 8 -60 33 -11 29 0 37 53 37 34 0 50 -4 54 -16z m86 -44 c6 0 4 10
-5 23 -8 13 -12 27 -8 30 10 11 83 8 83 -3 0 -5 -4 -10 -10 -10 -5 0 -7 -7 -3
-16 14 -36 -66 -48 -91 -13 -8 12 -12 28 -9 36 4 11 10 6 19 -16 7 -17 18 -31
24 -31z" class="icon-svg__shape"/>
<path d="M51 184 c0 -11 3 -14 6 -6 3 7 2 16 -1 19 -3 4 -6 -2 -5 -13z" class="icon-svg__shape"/>
<path d="M330 165 c0 -37 4 -65 10 -65 6 0 10 24 11 53 l0 52 27 -52 c17 -34
32 -53 44 -53 15 0 18 9 18 65 0 75 -17 89 -22 18 l-3 -48 -25 48 c-15 30 -31
47 -42 47 -15 0 -18 -9 -18 -65z" class="icon-svg__shape"/>
<path d="M756 214 c-21 -20 -21 -78 0 -98 19 -19 67 -21 82 -3 38 45 15 117
-38 117 -15 0 -36 -7 -44 -16z m62 -16 c30 -30 -2 -93 -36 -71 -21 13 -27 50
-12 69 15 17 32 18 48 2z" class="icon-svg__shape"/>
<path d="M482 188 c-7 -7 -12 -24 -12 -38 0 -31 17 -50 45 -50 29 0 45 19 45
52 0 40 -51 63 -78 36z m48 -38 c0 -20 -5 -30 -15 -30 -18 0 -30 24 -21 45 10
28 36 17 36 -15z" class="icon-svg__shape"/>
<path d="M575 183 c4 -10 11 -33 17 -50 13 -46 35 -42 46 10 l9 42 8 -42 c9
-51 39 -60 49 -15 3 15 8 37 12 50 5 16 2 22 -10 22 -9 0 -16 -8 -16 -19 0
-11 -3 -28 -7 -38 -6 -14 -9 -10 -13 17 -7 51 -37 53 -46 3 l-8 -38 -9 38 c-5
22 -15 37 -24 37 -10 0 -13 -5 -8 -17z" class="icon-svg__shape"/>
<path d="M892 188 c-18 -18 -15 -75 4 -82 27 -10 54 -7 54 7 0 8 -10 13 -22
13 -18 -1 -23 5 -23 24 0 19 5 25 23 24 12 0 22 5 22 13 0 16 -42 17 -58 1z" class="icon-svg__shape"/>
<path d="M970 150 c0 -38 4 -50 15 -50 11 0 15 12 15 50 0 38 -4 50 -15 50
-11 0 -15 -12 -15 -50z" class="icon-svg__shape"/>
<path d="M1036 185 c-42 -42 12 -108 62 -76 8 5 12 23 10 47 -3 34 -7 39 -29
42 -15 2 -34 -4 -43 -13z m49 -35 c0 -27 -22 -39 -31 -16 -8 22 3 49 19 43 6
-2 12 -14 12 -27z" class="icon-svg__shape"/>
<path d="M11 125 c0 -25 23 -57 34 -47 5 4 5 1 0 -7 -5 -9 2 -21 21 -37 24
-19 41 -23 95 -24 44 0 71 5 85 16 18 14 18 15 -6 4 -23 -10 -24 -10 -6 4 10
9 23 13 28 10 12 -8 39 28 33 44 -3 7 0 10 5 7 6 -3 10 1 10 9 0 24 -14 19
-39 -15 -12 -16 -28 -28 -34 -26 -6 2 -21 -8 -33 -22 -19 -22 -26 -24 -50 -16
-35 13 -47 41 -13 32 26 -7 69 1 69 13 0 4 -16 10 -36 12 -28 3 -41 -1 -55
-16 -11 -11 -19 -23 -19 -28 0 -4 -5 -8 -11 -8 -5 0 -7 5 -4 10 4 6 -5 23 -19
38 -14 15 -32 36 -40 47 -15 20 -15 20 -15 0z" class="icon-svg__shape"/>
                                                </g>
                                            </g>
                                        </svg>
                                    </Link>
                                </li>
                                <li className="Header__top-steemit show-for-medium noPrint">
                                    <Link to={logo_link}>
                                        <span className="beta fade-in--10">
                                            beta
                                        </span>
                                    </Link>
                                </li>
                                {selected_sort_order && (
                                    <DropdownMenu
                                        className="Header__sort-order-menu menu-hide-for-large"
                                        items={sort_order_menu}
                                        selected={selected_sort_order[1]}
                                        el="li"
                                    />
                                )}
                                <HorizontalMenu
                                    items={sort_order_menu_horizontal}
                                />
                            </ul>
                        </div>
                        <div className="columns shrink">
                            <TopRightMenu {...this.props} />
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}

export { Header as _Header_ };

export default connect(state => {
    const current_user = state.user.get('current');
    const account_user = state.global.get('accounts');
    const current_account_name = current_user
        ? current_user.get('username')
        : state.offchain.get('account');
    return {
        location: state.app.get('location'),
        current_account_name,
        account_meta: account_user,
    };
})(Header);
