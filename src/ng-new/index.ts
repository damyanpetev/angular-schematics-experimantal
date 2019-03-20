import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { OptionsSchema } from './schema';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function newProject(_options: OptionsSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    _context.logger.info(`Generating ${_options.name}`);
    return tree;
  };
}
