import { Rule, SchematicContext, Tree, mergeWith, apply, url, applyTemplates, move, noop } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function component(options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    console.log(`Generating ${options.template.name} with name: ${options.name}`);
    // TODO: reuse component schematic?
    return mergeWith(apply(url(`./files/${options.template.id}`), [
      // applyTemplates (unlike template) removes the `.template` ext
      applyTemplates({
        INDEX: options.index,
        name: options.name,
        theme: options.theme,
        dasherize: strings.dasherize
      }),
      (host: Tree, _context: SchematicContext) => {
        console.log("./files", host.root.subfiles, host.root.path);
      },
      options.projectName ? move(`${options.projectName}`) : noop()
    ],
    ));
  };
}
