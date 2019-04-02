import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Button from '../components/button'
import '../components/card.sass'
import '../components/notice.sass'
import TeamMember from '../components/teamMember'
import TeamSelect from '../components/TeamSelect'
import EditTeam from '../parts/EditTeam'
import '../components/textInput.sass'
import IconInfo from '../shapes/info'
import usure from '../utils/usure'

export default class Team extends Component {
	state = {
		activeTeam: this.props.initialTeam,
		teams: null,
		searchMembers: [],
		users: [],
	}

	handleChangeTeam = (team) => {
		this.setState({ activeTeam: team }, () => {
			this.refreshUsers()
		})
	}

	firstNameRef = React.createRef()
	lastNameRef = React.createRef()
	emailRef = React.createRef()

	counter = 1

	componentDidMount() {
		window.Boost.teams().then((teams) => this.setState({ teams }))
		this.refreshUsers()
	}

	refreshUsers = () => {
		const c = ++this.counter
		window.Boost.teamUsers(this.state.activeTeam)
			.then((result) => {
				if (this.counter === c) {
					this.setState({
						users: result,
					})
				}
			})
			.catch((error) => {
				console.log(error)
			})
	}

	handleChange = (e) => {
		e.preventDefault()
		if (e.target.value === '') {
			this.setState({
				searchMembers: [],
			})
		} else {
			window.Boost.users(e.target.value)
				.then((result) => {
					this.setState({
						searchMembers: result.map((item) => item.username),
					})
				})
				.catch((error) => {
					console.error(error)
				})
		}
	}

	handleSubmit = (e) => {
		e.preventDefault()

		const teamId = this.state.activeTeam
		if (teamId) {
			const data = {
				firstname: this.firstNameRef.current.value,
				lastname: this.lastNameRef.current.value,
				email: this.emailRef.current.value,
			}

			window.Boost.invite(data)
				.then((user) => {
					return window.Boost.addUserToTeam(teamId, user.id)
				})
				.then(() => window.location.reload())
		}
	}

	handleActiveTeamDelete = (e) => {
		e.preventDefault()
		const teamId = this.state.activeTeam
		usure('Are you really sure you want to delete team ' + teamId).then(() => {
			window.Boost.deleteTeam(teamId).then(() => (window.location.href = '/'))
		})
	}

	render() {
		const { activeTeam, teams } = this.state
		return (
			<div className="page">
				<EditTeam teamId={this.state.activeTeam} key={this.state.activeTeam} />

				<div className="card">
					<div className="card-footer">
						<div className="card-footer-heading">Invite new members to the team:</div>
						<form className="card-footer-form" onSubmit={this.handleSubmit}>
							<div className="card-footer-form-group">
								<div className="card-footer-form-group-item view-small">
									<TeamSelect
										activeTeam={activeTeam}
										teams={teams || []}
										onChangeTeam={this.handleChangeTeam}
									/>
								</div>
							</div>
							<div className="card-footer-form-group">
								<span className="card-footer-form-group-item">
									<input
										type="text"
										name="firstName"
										placeholder="First name"
										className="textInput"
										required
										ref={this.firstNameRef}
									/>
								</span>
								<span className="card-footer-form-group-item">
									<input
										type="text"
										name="lastName"
										placeholder="Last name"
										className="textInput"
										required
										ref={this.lastNameRef}
									/>
								</span>
							</div>
							<div className="card-footer-form-group">
								<span className="card-footer-form-group-item">
									<input
										type="email"
										name="lastName"
										placeholder="E-mail or username…"
										className="textInput"
										required
										ref={this.emailRef}
									/>
								</span>
								<span className="card-footer-form-group-item">
									<Button>Send invite</Button>
								</span>
							</div>
						</form>
					</div>
					<div className="card-content">
						<div className="card-content-members">
							{this.state.users.map((item) => (
								<TeamMember
									key={item.id}
									id={item.id}
									firstname={item.firstname}
									lastname={item.lastname}
									username={item.username}
									email={item.email}
									teamId={this.state.activeTeam}
								/>
							))}
						</div>
					</div>
				</div>

				<div className="notice">
					<h2 className="notice-title">
						<IconInfo /> Want to delete team?
					</h2>
					<p className="notice-content">
						By deleting this team you will remove all files associated with the team. All users
						assigned to this team will lose access too.
					</p>
					<div>
						<Button danger onClick={this.handleActiveTeamDelete}>
							Delete team {this.state.activeTeam}
						</Button>
					</div>
				</div>
			</div>
		)
	}
}

Team.contextTypes = {
	connector: PropTypes.object,
	team: PropTypes.string,
}