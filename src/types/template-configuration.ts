
/**
 * This interface holds extra configuration step for a component. It's used as a source for extra steps in prompt sessions for templates and custom templates.
 */
export interface ControlExtraConfiguration {
	/** Prompt session works with choices except value - where the user should enter value */
	choices: string[];
	/** default value used when the user is prompted to choose or enter */
	default: any;
	/** The key is used from the template to map the extra configuration to the specific control property. For example filtering extra configuration
	 * will add feature filtering, but not simple filtering property.
	 */
	key: string;
	/** */
	message: string;
	/** The type of the extra configuration - choice, multi-choice value */
	type: ControlExtraConfigType;
}

export const enum ControlExtraConfigType {
    /** Available list of values. Just one should be selected. */
    Choice,
    /** Available list of values. Multiple values can be selected. */
    MultiChoice,
    /** Accepts a single manually typed value. */
    Value
}