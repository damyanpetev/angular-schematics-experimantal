import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

class Util {
	public static getCurrentDirectoryBase() {
		return path.basename(process.cwd());
	}

	public static directoryExists(filePath: string) {
		try {
			return fs.statSync(filePath).isDirectory();
		} catch (err) {
			return false;
		}
	}

	public static fileExists(filePath: string) {
		try {
			return fs.statSync(filePath).isFile();
		} catch (err) {
			return false;
		}
	}

	public static isDirectory(dirPath: string): boolean {
		return fs.lstatSync(dirPath).isDirectory();
	}

	public static isFile(filePath: string): boolean {
		return fs.lstatSync(filePath).isFile();
	}

	public static getDirectoryNames(rootPath: string): string[] {
		// TODO: add https://github.com/davetemplin/async-file
		let folders: string[] = [];
		if (this.directoryExists(rootPath)) {
			folders = fs.readdirSync(rootPath).filter(file => fs.lstatSync(path.join(rootPath, file)).isDirectory());
		}
		return folders;
	}


	public static greenCheck() {
		if (process.platform.startsWith("win")) {
			return chalk.green("√");
		} else {
			return chalk.green("✔");
		}
	}

	public static version(): string {
		const configuration = require("../package.json");
		return configuration.version;
	}

	/**
	 * Truncating text to fit console viewPort and appending specified truncate characters at the end
	 * to indicate text is truncated.
	 * @param text Text to be used.
	 * @param limit max viewPort.
	 * @param truncateCount How many characters to be replaced at the text end with a specified truncateChar.
	 * @param truncateChar Char to use for truncated text.
	 */
	public static truncate(text: string, limit: number, count = 3, truncateChar = ".") {
		//adjust for console characters prior description
		if (text.length > limit) {
			text = text.slice(0, (limit - count)).trim() + truncateChar.repeat(count);
		}
		return text;
	}

	/**
	 * to indicate text is truncated.
	 * @param text Text to be used.
	 * @param startIndex Apply color from this index on.
	 */
	public static addColor(text: string, startIndex: number) {
		const name = text.slice(0, startIndex);
		const separatedDescription = text.slice(startIndex);
		return name + chalk.gray(`${separatedDescription}`);
	}
}

export { Util };
