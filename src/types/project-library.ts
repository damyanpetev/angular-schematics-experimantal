import { Component, ComponentGroup } from "./component";
import { Template } from "./template";

export interface ProjectLibrary {
	/** Holds the name of the library */
	name: string;
	/** Holds collection of themes supported by the framework */
	themes: string[];
	/** Collection of component which the framework supports e.g. igGrid, igTextEditor */
	components: Component[];
	/** Collection of component which the framework supports e.g. igGrid, igTextEditor */
	customTemplates: Template[];
	/** List of project template instances */
	projects: Template[];
	/**Collection of custom templates provided by the framework */
	templates: Template[];
	/** JS, TS, Dart */
	projectType: string;

	getComponentGroupNames(): string[];
	getComponentGroups(): ComponentGroup[];
}

export class BaseProjectLibrary implements ProjectLibrary {
	public projectType: string;
	public name: string;
	public themes: string[];

	/** Implementation, not part of the interface */
	public groupDescriptions = new Map<string, string>();

	public templates: Template[] = [];
	public projects: Template[] = [];
	public components: Component[] = [];
	public customTemplates: Template[] = [];

	public getComponentGroupNames(): string[] {
		let groups: string[];
		groups = this.components.reduce<string[]>((prev, current) => {
			if (!prev.includes(current.group)) {
				prev.push(current.group);
			}
			return prev;
		}, []);
		return groups;
	}

	/**
	 * Return Component Groups with descriptions
	 */
	public getComponentGroups(): ComponentGroup[] {
		const groups: ComponentGroup[] = [];

		for (const groupName of this.getComponentGroupNames()) {
			groups.push({
				name: groupName,
				description: this.groupDescriptions.get(groupName) || ""
			});
		}
		return groups;
	}
}