/* exported DASHBOARDS */
var DASHBOARDS = [{
	id: '1',
	name: 'Home',
	widgets: [{
		name: 'Widget 1',
		src: 'demo/dashboard/images/chart1.png',
		desktop: {
			// gridster should resolve this
		},
		tablet: {
			col: 0,
			row: 0,
			sizeX: 6,
			sizeY: 4
		},
		mobile: {
			row: 0
		}
	}, {
		name: 'Widget 2',
		src: 'demo/dashboard/images/chart2.png',
		desktop: {
			col: 9,
			row: 0,
			sizeX: 0,
			sizeY: 0
		},
		tablet: {
			hidden: true
		},
		mobile: {
			hidden: true
		}
	}, {
		name: 'Widget 3',
		src: 'demo/dashboard/images/chart3.png',
		desktop: {
			sizeX: 4,
			sizeY: 4
		},
		tablet: {
			col: 2,
			row: 0,
			sizeX: 6,
			sizeY: 4
		},
		mobile: {
			row: 2
		}
	}, {
		name: 'Widget 5',
		src: 'http://www.wikipedia.org',
		type: 'iframe',
		tablet: {
			col: 0,
			row: 4,
			sizeX: 4,
			sizeY: 4
		}
	}, {
		name: 'Widget 4',
		src: 'http://www.dairygoodness.ca',
		type: 'iframe'
	}]
}, {
	id: '2',
	name: 'Other',
	mode: 'desktop',
	widgets: [{
		desktop: {
			col: 1,
			row: 1,
			sizeX: 3,
			sizeY: 4
		},
		tablet: {
			col: 1,
			row: 1,
			sizeX: 6,
			sizeY: 4
		},
		src: 'demo/dashboard/images/chart3.png',
		name: 'Other Widget 1'
	}, {
		desktop: {
			col: 1,
			row: 2,
			sizeX: 6,
			sizeY: 3
		},
		tablet: {
			col: 1,
			row: 3,
			sizeX: 4,
			sizeY: 3
		},
		src: 'demo/dashboard/images/chart1.png',
		name: 'Other Widget 2'
	}]
}];
