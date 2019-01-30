import moment from 'moment';


export default function stringLocaleDayOfWeekToNumber(value: string): number {
	let dayName = value.toLowerCase().trim();
	let day;

	switch (dayName) {
	case 'monday':
		day = 1;

		break;
	case 'tuesday':
		day = 2;

		break;
	case 'wednesday':
		day = 3;

		break;
	case 'thursday':
		day = 4;

		break;
	case 'friday':
		day = 5;

		break;
	case 'saturday':
		day = 6;

		break;
	default:
		day = 0;

		break;
	}

	day -= moment.localeData().firstDayOfWeek();

	if (day < 0) {
		day = 6;
	}

	if (day > 6) {
		day = 0;
	}

	return day;
}
