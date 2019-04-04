import { Component } from "./component";
import { Template } from "./template";

export interface ProjectLibrary {
	/** Holds the name of the library */
	name: string;
	/** Holds collection of themes supported by the framework */
	themes: string[];
	/** Collection of component which the framework supports e.g. igGrid, igTextEditor */
	components: Component[];
	/** List of project template instances */
	projects: Template[];
	/**Collection of custom templates provided by the framework */
	templates: Template[];
	/** JS, TS, Dart */
	projectType: string;
}

export class BaseProjectLibrary implements ProjectLibrary {
	public projectType: string;
	public name: string;
	public themes: string[];

	/** Implementation, not part of the interface */
	public groupDescriptions = new Map<string, string>();

	public templates: Template[];
	public projects: Template[] = [];
	public components: Component[] = [];
}