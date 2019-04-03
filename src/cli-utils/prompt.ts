import * as inquirer from 'inquirer';

/**
 * Options for User Input
 */
export interface IUserInputOptions {
    type: string;
    name: string;
    message: string;
    choices?: any[];
    default?: string;
}


export class PromptSession {
    private WIZARD_BACK_OPTION = "Back";

	/**
	 * Gets the user input according to provided `options`.Returns directly if single choice is provided.
	 * @param options to use for the user input
	 * @param withBackChoice Add a "Back" option to choices list
	 */
    public async getUserInput(options: IUserInputOptions, withBackChoice: boolean = false): Promise<string> {

        if (options.choices) {
            if (options.choices.length < 2) {
                // single choice to return:
                let choice = options.choices[0];
                choice = choice.value || choice;
                this.logAutoSelected(options, choice);
                return choice;
            }
            if (withBackChoice) {
                options.choices.push(this.WIZARD_BACK_OPTION);
            }
            options.choices = this.addSeparators(options.choices);
        }

        const userInput: {[key: string]: any;} = await inquirer.prompt({
            choices: options.choices || [],
            default: options.default || "",
            message: options.message,
            name: options.name,
            type: options.type
        });

        const result = userInput[options.name] as string;

        // post to GA everything but 'Back' user choice
        if (!withBackChoice || result !== this.WIZARD_BACK_OPTION) {
            // GoogleAnalytics.post({
            //     t: "event",
            //     ec: "$ig wizard",
            //     el: options.message,
            //     ea: `${options.name}: ${result}`
            // });
        } else {
            // GoogleAnalytics.post({
            //     t: "event",
            //     ec: "$ig wizard",
            //     el: result,
            //     ea: `Back from ${options.name}`
            // });
        }

        return result;
    }

    logAutoSelected(_options: IUserInputOptions, _choice: any): any {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns a new array with inquirer.Separator() added between items
     * @param array The original array to add separator to
     */
    private addSeparators(array: any[]): any[] {
        const newArray = [];
        for (let i = 0; i < array.length; i++) {
            newArray.push(array[i]);
            if (i + 1 < array.length) {
                newArray.push(new inquirer.Separator());
            }
        }
        if (array.length > 4) {
            // additional separator after last item for lists that wrap around
            newArray.push(new inquirer.Separator(new Array(15).join("=")));
        }
        return newArray;
    }
}
