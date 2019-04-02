import { Redirect, Router, Link } from '@reach/router'
import React from 'react'
import posed, { PoseGroup } from 'react-pose'
import AddApiKey from './components/AddApiKey'
import ApiKeys from './components/ApiKeys'
import Overview from './components/Overview'
import { Boost } from './connector/Boost'
import { Config } from './connector/Config'
import { Auth } from './connector/Model/Auth'
import { Token } from './connector/Model/Token'
import Account from './parts/account'
import AppBuilds from './parts/appBuilds'
import AppDetail from './parts/appDetail'
import { AuthRoute, AuthView } from './parts/Auth'
import { HeaderButtonView, Layout, LayoutChildProps } from './parts/Layout'
import Team from './parts/team'
import { ServerIcon } from './ServerIcon'
import AddTeam from './parts/AddTeam'
import SystemSettings from './parts/SystemSettings'

const FadeInOut = posed.div({
	enter: { opacity: 1 },
	exit: { opacity: 0 },
})

export const MeContext = React.createContext<any>(null)
export const ServerContext = React.createContext<any>(null)

function Header({ params }: { params: any }) {
	return (
		<Link to={`/apps${params.teamId ? `/${params.teamId}` : ''}`}>
			<ServerIcon />
		</Link>
	)
}

function AppRoute(props: LayoutChildProps) {
	return <AppBuilds appId={props.params.appId} />
}

function BuildRoute(props: LayoutChildProps) {
	return <AppDetail buildId={props.params.buildId} />
}

function OverviewRoute(props: LayoutChildProps) {
	return (
		<PoseGroup>
			<FadeInOut key={props.params.teamId || 'all'}>
				<Overview
					key={props.params.teamId || 'all'}
					teamId={props.params.teamId}
					layout={props.layout}
				/>
			</FadeInOut>
		</PoseGroup>
	)
}

function MeRoute() {
	return <Account />
}

function TeamRoute(props: LayoutChildProps) {
	return <Team initialTeam={props.params.teamId} />
}

function AddTeamRoute(props: LayoutChildProps) {
	return <AddTeam />
}

function SystemRoute() {
	return <SystemSettings />
}

function ApiKeysRoute() {
	return <ApiKeys />
}

function AddApiKeyRoute({ params }: LayoutChildProps) {
	return <AddApiKey teamId={params.teamId} />
}

interface AppState {
	server?: {
		icons: any
		config: {
			allowed_registration_domains: string[]
			allow_invitations: boolean
			allow_registrations: boolean
			domain_invitations_restricted: boolean
			single_team: boolean
		}
	}
	token: string | null
	authToken: string | null
	me: any
	settings?: any
}

export class BoostApp extends React.Component<{}, AppState> {
	mounted = false

	state: AppState = {
		server: undefined,
		token: localStorage.getItem('token'),
		authToken: localStorage.getItem('authToken'),
		me: null,
	}

	constructor(props: {}) {
		super(props)

		const config = new Config()

		const el = document.getElementById('shortcut-icon')
		if (el) {
			el.setAttribute('href', `${config.url}/server/favicon/`)
		}

		const boost = new Boost(config, this.state.token || undefined)
		window.Boost = boost

		if (window.location.hash === '#auth') {
			boost._token = localStorage.getItem('authToken') || undefined
		}

		config.onLoggedOut = this.handleLoggedOut
		window.rootApp = this
		window.logout = this.handleLoggedOut
	}

	componentDidMount() {
		this.mounted = true
		const name = localStorage.getItem('serverName')
		if (name) {
			document.title = name
		}
		if (window.Boost) {
			this.refreshServer()
			if (this.state.token && this.state.authToken) {
				this.refreshMe()
			} else {
				setTimeout(() => {
					this.mounted && this.setState({ me: false })
				})
			}
		}

		window.addEventListener('refreshServer', () => this.refreshServer())
		window.addEventListener('refreshMe', () => this.refreshServer())
	}

	componentWillUnmount() {
		this.mounted = false
	}

	refreshServer = () => {
		window.Boost.server().then((server: any) => {
			if (this.mounted) {
				this.setState({ server })
				document.title = server.name
				localStorage.setItem('serverName', server.name)
			}
		})
		window.Boost.serverSettingsPlain().then((settings: any) => {
			this.setState({ settings })
		})
	}

	refreshMe = () => {
		window.Boost.me()
			.then((me) => {
				if (this.mounted) {
					this.setState({ me })
				}
			})
			.catch(() => {
				if (this.mounted) {
					this.setState({ me: false })
				}
			})
	}

	handleLoggedOut = () => {
		localStorage.removeItem('authToken')
		localStorage.removeItem('token')

		window.location.reload()
	}

	handleLogin = (auth: Auth, token: Token) => {
		localStorage.setItem('authToken', auth.token as string)
		localStorage.setItem('token', token.jwt as string)
		this.setState({
			token: token.jwt as string,
			authToken: auth.token as string,
		})

		this.refreshMe()
		this.refreshServer()
	}

	getStyleVars() {
		if (this.state.settings) {
			let rows = []
			const keys = Object.keys(this.state.settings)
			for (let key of keys) {
				rows.push(`--${key.split('_').join('-')}: ${this.state.settings[key]};`)
			}
			return rows.join('\n')
		}
		return ''
	}

	render() {
		if (this.state.me === null) {
			return <div className="layout-login">loading</div>
		}
		const auth = !!this.state.me
		return (
			<MeContext.Provider value={this.state.me}>
				<ServerContext.Provider value={this.state.server}>
					<style
						id="config-vars"
						dangerouslySetInnerHTML={{
							__html: `
body {
	${this.getStyleVars()}
}
				`,
						}}
					/>
					<Router>
						<AuthRoute
							path="reset-password"
							view={AuthView.RESET_PASSWORD}
							onResetPassword={console.log}
						/>

						{this.state.server && this.state.server.config.allow_registrations && (
							<AuthRoute path="register" view={AuthView.REGISTRATION} onRegister={console.log} />
						)}

						{!auth && <AuthRoute default view={AuthView.LOGIN} onLogin={this.handleLogin} />}

						{auth && <Redirect from="/" to="apps" />}
						{auth && <Layout path="apps" body={OverviewRoute} header={Header} />}
						{auth && (
							<Layout
								path="app/:appId"
								body={AppRoute}
								header={Header}
								headerButtonView={HeaderButtonView.ADD_NEW_BUILD}
							/>
						)}
						{auth && (
							<Layout
								path="build/:buildId"
								body={BuildRoute}
								header={Header}
								headerButtonView={HeaderButtonView.ADD_NEW_BUILD}
							/>
						)}
						{auth && (
							<Layout
								path="apps/:teamId"
								body={OverviewRoute}
								header={Header}
								headerButtonView={HeaderButtonView.ADD_NEW_BUILD}
							/>
						)}
						{auth && <Layout path="me" body={MeRoute} header={Header} />}
						{auth && (
							<Layout
								path="api-keys"
								body={ApiKeysRoute}
								header={Header}
								headerButtonView={HeaderButtonView.ADD_API_KEY}
							/>
						)}
						{auth && (
							<Layout
								path="api-keys/:teamId"
								body={ApiKeysRoute}
								header={Header}
								headerButtonView={HeaderButtonView.ADD_API_KEY}
							/>
						)}
						{auth && <Layout path="add-api-key" body={AddApiKeyRoute} header={Header} />}
						{auth && <Layout path="add-api-key/:teamId" body={AddApiKeyRoute} header={Header} />}
						{auth && <Layout path="team/new" body={AddTeamRoute} header={Header} />}
						{auth && <Layout path="team/:teamId" body={TeamRoute} header={Header} />}
						{auth && <Layout path="system" body={SystemRoute} header={Header} />}
					</Router>
				</ServerContext.Provider>
			</MeContext.Provider>
		)
	}
}