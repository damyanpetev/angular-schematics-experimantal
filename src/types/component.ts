import { Template } from "./template";

/**
 * A set of Templates for a common component
 */
export interface Component {
	/** Component name, e.g. Pie Chart or Grid  */
	name: string;
	/** Component description, e.g. Choose from available Grids or Choose from available HierarchicalGrids */
	description: string;
	/** Name of the parent group, e.g. Data Visualization */
	group: string;
	/**
	 * Controls the position of the component within the group.
	 * Step by step mode lists components with higher values first.
	 */
	groupPriority: number;

	templates: Template[];
}

/**
 * A set of Templates for a common component
 */
export interface ComponentGroup {
	/** Group name, e.g. Charts or Grids  */
	name: string;
	/** Description the group to show in Step by step mode */
	description: string;
}