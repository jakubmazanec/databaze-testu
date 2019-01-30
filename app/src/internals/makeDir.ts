import path from 'path';
import fs from 'fs';


let _0777 = parseInt('0777', 8);

function mkdirP(dirPath: string, mode: number, f: (error: Error | null, value: any) => void, made = null) {
	let cb = f;

	let p = path.resolve(dirPath);

	fs.mkdir(p, mode, (er) => {
		if (!er) {
			let newMade = made || p;

			return cb(null, newMade);
		}

		switch (er.code) {
		case 'ENOENT':
			mkdirP(path.dirname(p), mode, (er2, made2) => {
				if (er2) {
					return cb(er2, made2);
				}

				mkdirP(p, mode, cb, made2);

				return null;
			});

			break;

			// In the case of any other error, just see if there's a dir
			// there already.  If so, then hooray!  If not, then something
			// is borked.
		default:
			fs.stat(p, (er2, stat) => {
				// if the stat fails, then that's super weird.
				// let the original error be the failure reason.
				if (er2 || !stat.isDirectory()) {
					return cb(er, made);
				}

				return cb(null, made);
			});

			break;
		}

		return null;
	});
}

export default function makeDir(dirPath: string) {
	return new Promise((resolve, reject) => {
		mkdirP(dirPath, _0777 & (~process.umask()), (error, result) => {
			if (error) {
				reject(error);
			}

			resolve(result);
		});
	});
}
