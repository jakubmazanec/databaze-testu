import colors from './colors';
import typographicScale from './typographicScale';

let heading: any = {
	color: colors.text,
	fontFamily: `Brandon Grotesque, Frutiger, 'Frutiger Linotype', Univers, Calibri, 'Gill Sans', 'Gill Sans MT', 'Myriad Pro', Myriad, 'DejaVu Sans Condensed', 'Liberation Sans', 'Nimbus Sans L', Tahoma, Geneva, 'Helvetica Neue', Helvetica, Arial, sans-serif`,
	fontFeatures: `'kern', 'liga', 'clig', 'calt', 'dlig', 'lnum', 'pnum'`,
	storyTitle: {
		fontSize: typographicScale[15],
		fontWeight: 700
	},
	storyLevel1: {
		fontSize: typographicScale[13],
		fontWeight: 700
	},
	storyLevel2: {
		fontSize: typographicScale[10],
		fontWeight: 700
	},
	storyLevel3: {
		fontSize: typographicScale[6],
		fontWeight: 700
	},
	storyLevel4: {
		fontSize: typographicScale[5],
		fontWeight: 700
	},
	sectionTitle: {
		fontSize: typographicScale[14],
		fontWeight: 700
	},
	sectionLevel1: {
		fontSize: typographicScale[6],
		fontWeight: 600
	},
	sectionLevel2: {
		fontSize: typographicScale[5],
		fontWeight: 600
	},
	sectionLevel3: {
		fontSize: typographicScale[4],
		fontWeight: 600
	},
	sectionLevel4: {
		fontSize: typographicScale[3],
		fontWeight: 600
	}
};

export default heading;
