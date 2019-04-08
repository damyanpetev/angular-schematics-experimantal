import * as inquirer from 'inquirer';
import { ProjectLibrary, Component, Template } from '../types';
import chalk from "chalk";
import { formatChoices } from './formatting';

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

    /**
     * Generates a list of options for chooseActionLoop
     * @param projectLibrary to generate options for
     */
    public generateActionChoices(projectLibrary: ProjectLibrary): Array<{}> {
        const actionChoices: Array<{}> = [{
            name: "Complete & Run" + chalk.gray("..........install packages and run in the default browser"),
            short: "Complete & Run",
            value: "Complete & Run"
        }];
        if (projectLibrary.components.length > 0) {
            actionChoices.push({
                name: "Add component" + chalk.gray("...........add a specific component view (e.g a grid)"),
                short: "Add component", // displayed result after selection
                value: "Add component" // actual selection value
            });
        }
        if (projectLibrary.customTemplates.length > 0) {
            actionChoices.push({
                name: "Add scenario " + chalk.gray("...........add a predefined scenario view (e.g grid or dashboard)"),
                short: "Add scenario",
                value: "Add scenario"
            });
        }

        return actionChoices;
    }

    /**
     * Add the component user has selected
     * @param projectLibrary to add component to
     * @param theme to use to style the project
     */
    public async addComponent(projectLibrary: ProjectLibrary, templates: any[]): Promise<boolean> {
        let addComponentIsOver = false;
        while (!addComponentIsOver) {
            const groups = projectLibrary.getComponentGroupNames();
            const groupRes: string = await this.getUserInput({
                type: "list",
                name: "componentGroup",
                message: "Choose a group:",
                choices: formatChoices(projectLibrary.getComponentGroups()),
                default: groups.find(x => x.includes("Grids")) || groups[0]
            }, true);

            if (groupRes === this.WIZARD_BACK_OPTION) {
                return false;
            }
            addComponentIsOver = await this.choseComponent(projectLibrary, templates, groupRes);
        }
        return true;
    }

    /**
     * Select the component in the selected components group
     * @param projectLibrary to add component to
     * @param theme to use to style the project
     * @param groupName to chose components from
     */
    private async choseComponent(projectLibrary: ProjectLibrary, templates: any[], groupName: string): Promise<boolean> {
        let choseComponentIsOver = false;
        while (!choseComponentIsOver) {
            const componentNameRes = await this.getUserInput({
                type: "list",
                name: "component",
                message: "Choose a component:",
                choices: formatChoices(projectLibrary.components.filter(x => x.group ===  groupName))
            }, true);

            if (componentNameRes === this.WIZARD_BACK_OPTION) {
                return false;
            }

            const component = projectLibrary.components.find(x => x.name === componentNameRes);
            if (component) {
                choseComponentIsOver = await this.getTemplate(projectLibrary, templates, groupName, component);
            }
        }
        return true;
    }

    /**
     * Select template for provided component and set template's extra configurations if any
     * @param projectLibrary to add component to
     * @param theme to use to style the project
     * @param groupName to chose components from
     * @param component to get template for
     */
    private async getTemplate(_projectLibrary: ProjectLibrary, templates: any[], _groupName: string, component: Component)
    : Promise<boolean> {
        let selectedTemplate: Template | undefined;
        // const config = ProjectConfig.getConfig();

        const templateRes = await this.getUserInput({
            type: "list",
            name: "template",
            message: "Choose one:",
            choices: formatChoices(component.templates)
        }, true);

        if (templateRes === this.WIZARD_BACK_OPTION) {
            return false;
        }

        selectedTemplate = component.templates.find(x => x.name === templateRes);

        if (selectedTemplate) {
            let done = false;
            // const availableDefaultName = Util.getAvailableName(selectedTemplate.name, false,
            //     config.project.framework, config.project.projectType);
            while (!done) {
                const templateName = await this.getUserInput({
                    type: "input",
                    name: "componentName",
                    message: "Name your component:",
                    default: selectedTemplate.name
                });

                // validate name, extra config
                // done = await add.addTemplate(templateName, selectedTemplate);
                done = true;
                templates.push({ template: selectedTemplate, name: templateName });
            }
        }
        return true;
    }


    logAutoSelected(_options: IUserInputOptions, _choice: any): any {
        // TODO: throw new Error("Method not implemented.");
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
