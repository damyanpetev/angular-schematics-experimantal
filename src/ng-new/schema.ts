// supported annotations https://github.com/evaneus/typescript-json-schema/blob/master/test/programs/annotation-tjs/main.ts
// typescript-json-schema src/ng-new/schema.ts OptionsSchema -o src/ng-new/schema2.json


/**
 * Ignite UI for Angular Ng New Options Schema
 */
export abstract class OptionsSchema {
    name: string;

    /**
     * The version of the Angular CLI to use.
     * @$default {"$source": "ng-cli-version"}
     */
    version: string;
}