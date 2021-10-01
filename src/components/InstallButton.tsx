import React from 'react'
import Button from './button'
import IconMobile from '../shapes/mobile'
// import IconDownload from '../shapes/download'
import { App } from '../connector/Model/App'
import cn from 'classnames'

export enum InstallButtonView {
	DEFAULT = 'default',
	MINI = 'mini',
}

const downloadBuild = (build: App) => (e: React.MouseEvent<HTMLDivElement>) => {
	e.preventDefault()
	if (build.id && build.platform) {
		window.Einstore.downloadCurrentPlatform(build.id, build.platform)
	}
}

export default function InstallButton({
	build,
	view,
	faded,
}: {
	build: App
	view?: InstallButtonView
	faded?: boolean
}) {
	const androidInstall = build.platform === 'android'
	const iosInstall = build.platform === 'ios'

	view = view || InstallButtonView.DEFAULT

	return (
		<>
			<Button
				inactive={view === InstallButtonView.MINI && faded}
				className={cn('card-column-download', faded && 'faded')}
				onClick={downloadBuild(build)}
			>
				<IconMobile /> {view === InstallButtonView.DEFAULT && <span>Install</span>}
			</Button>
		</>
	)
}
