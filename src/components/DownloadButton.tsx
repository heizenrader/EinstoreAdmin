import React from 'react'
import Button from './button'
import IconDownload from '../shapes/download'
import { App } from '../connector/Model/App'
import cn from 'classnames'

const downloadBuild = (build: App) => (e: React.MouseEvent<HTMLDivElement>) => {
	e.preventDefault()
	if (build.id && build.platform) {
		window.Einstore.downloadFile(build.id, build.platform)
	}
}

export default function DownloadButton({build,}: {
	build: App
}) {
	return (
		<>
			<Button
				className={cn('card-column-download')}
				onClick={downloadBuild(build)}
			>
				<IconDownload /> <span>Download</span>
			</Button>
		</>
	)
}
