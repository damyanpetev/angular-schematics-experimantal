import { ControlExtraConfiguration } from "./template-configuration";

/** Base template interface */
declare interface BaseTemplate {
	/** ID of the template to be called in directly (matches the CLI full command parameter) */
	id: string;
	/** Friendly name of the template (for steps) */
	name: string;
	/** Description of what the template includes */
	description: string;
	/** List of dependencies needed to load components. */
	dependencies: (string | object)[];
	/** jquery, react, angular */
	framework: string;
	/** ts, js, dart, ts-cli, js-cli */
	projectType: string;
	/** This property controls if extra configuration is available to the template */
	hasExtraConfiguration: boolean;

	/** Generates template files. */
	generateFiles(outputPath: string, name: string, ...options: any[]): Promise<boolean>;
	/** this method is used to run extra configuration in context of prompt session */
	getExtraConfiguration(): ControlExtraConfiguration[];
	/** This method is used when the user selects extra configuration and it should be passed to the template */
	setExtraConfiguration(extraConfigKeys: {}): void;
}

export interface AddTemplateArgs {
	modulePath?: string;
	skipRoute?: boolean;
	extraConfig?: any;
	[key: string]: any;
}


export interface Template extends BaseTemplate {
	/** CustomTemplate */
	/** Component this template collection can belong to */
	components: string[];
	/** This property is controls on which control group to be shown the template */
	controlGroup: string;
	/** Step by step */
	listInComponentTemplates: boolean;
	listInCustomTemplates: boolean;
	/** Extra packages to install when adding to project */
	packages: string[];
	/** Generates template files. */
	generateFiles(projectPath: string, name: string, options?: {[key: string]: any}): Promise<boolean>;
	/** Called when the template is added to a project */
	registerInProject(projectPath: string, name: string, options?: AddTemplateArgs): void;
}