import React, { Component, ChangeEvent, FormEvent } from 'react'
import '../components/card.sass'
import { ApiKey } from '../connector/Model/ApiKey'
import '../parts/api.sass'
import IconPen from '../shapes/pen'
import IconTrash from '../shapes/trash'
import TeamName from './TeamName'
import usure from '../utils/usure'
import TextInput from './textInput'
import Button from './button'
import prettyDate from '../utils/prettyDate'

interface RowProps {
	name?: string
	id?: string
	team?: string
	created?: string
	token?: string
	onDeleteKey: (id: string) => void
	onChange?: (data: { name: string | null; id: string }) => void
}

export class Row extends React.Component<RowProps> {
	state = {
		editing: false,
		name: null,
	}

	handleDelete = () => {
		usure('Are you sure you want to delete this API key.').then(() => {
			if (this.props.id) {
				this.props.onDeleteKey(this.props.id)
			}
		})
	}

	handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
		this.setState({ name: e.target.value })
	}

	handleEditSubmit = (e: FormEvent) => {
		e.preventDefault()
		this.setState({ editing: false })

		if (this.props.onChange && this.props.id) {
			this.props.onChange({
				id: this.props.id,
				name: this.state.name,
			})
		}
	}

	inputRef = (ref?: HTMLInputElement) => ref && ref.select()

	render() {
		return (
			<tr>
				<td>{this.props.team && <TeamName teamId={this.props.team} iconSize={32} />}</td>
				<td>
					{this.state.editing ? (
						<form className="card-editApiNameForm" onSubmit={this.handleEditSubmit}>
							<TextInput
								value={this.state.name}
								onChange={this.handleNameChange}
								inputRef={this.inputRef}
							/>
							<Button>Save</Button>
						</form>
					) : (
						<span onClick={() => this.setState({ editing: true, name: this.props.name })}>
							{this.props.name}
						</span>
					)}
				</td>
				<td className="apiKey-date" title={this.props.created}>
					{this.props.created && prettyDate(this.props.created)}
				</td>
				<td>
					<span
						className="api-action api-action-blue"
						onClick={() => this.setState({ editing: true, name: this.props.name })}
					>
						<IconPen /> Edit
					</span>
					<span className="api-action api-action-red" onClick={this.handleDelete}>
						<IconTrash /> Delete
					</span>
				</td>
			</tr>
		)
	}
}

interface ApiKeysProps {}

interface ApiKeysState {
	keys: ApiKey[]
}

export default class ApiKeys extends Component<ApiKeysProps, ApiKeysState> {
	state = {
		keys: [],
	}

	componentDidMount() {
		this.refresh()
	}

	handleDeleteKey = (id: string) => {
		window.Boost.deleteApiKey(id).then(() => {
			this.refresh()
		})
	}

	handleChangeKey = (data: any) => {
		window.Boost.editApiKey(data.id, { name: data.name }).then(() => {
			this.refresh()
		})
	}

	refresh = () => {
		window.Boost.apiKeys()
			.then((result) => {
				this.setState({
					keys: result,
				})
			})
			.catch((e) => {
				console.error(e)
			})
	}

	render() {
		return (
			<div className="page">
				<div className="card">
					<div className="card-content">
						<table className="api">
							<thead>
								<tr>
									<td>Team</td>
									<td>Name/note</td>
									<td>Created</td>
									<td>Actions</td>
								</tr>
							</thead>
							<tbody>
								{this.state.keys.map((item: ApiKey) => {
									return (
										<Row
											onDeleteKey={this.handleDeleteKey}
											onChange={this.handleChangeKey}
											key={item.id}
											name={item.name}
											created={item.created}
											id={item.id}
											team={item.team_id}
										/>
									)
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		)
	}
}