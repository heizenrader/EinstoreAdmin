import React from 'react'
import Button from './button'
import IconMobile from '../shapes/mobile'
import IconDownload from '../shapes/download'
import { App } from '../connector/Model/App'
import cn from 'classnames'

export enum DownloadButtonView {
	DEFAULT = 'default',
	MINI = 'mini',
}

const downloadBuild = (build: App) => (e: React.MouseEvent<HTMLDivElement>) => {
	e.preventDefault()
	if (build.id && build.platform) {
		window.Einstore.downloadCurrentPlatform(build.id, build.platform)
	}
}

export default function DownloadButton({
																				 build,
																				 view,
																				 faded,
																			 }: {
	build: App
	view?: DownloadButtonView
	faded?: boolean
}) {
	return (
		<>
			<Button
				inactive={view === DownloadButtonView.MINI && faded}
				className={cn('card-column-download', faded && 'faded')}
				onClick={downloadBuild(build)}
			>
				<IconDownload /> {view === DownloadButtonView.DEFAULT && <span>Download</span>}
			</Button>
		</>
	)
}
