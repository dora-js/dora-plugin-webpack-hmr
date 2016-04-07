
publish:
	npm run build
	npm publish

publish-sync: publish
	cnpm sync dora-plugin-webpack-hmr
	tnpm sync dora-plugin-webpack-hmr
