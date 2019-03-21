import { Rule, SchematicContext, Tree, chain, externalSchematic } from '@angular-devkit/schematics';
import { OptionsSchema } from './schema';
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
} from '@angular-devkit/schematics/tasks';
// import { } from '@schematics/angular'; // TODO add as dep?

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function newProject(options: OptionsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(`Generating ${options.name}`);

    

    return chain([
      // TODO reuse workspace + application and build?
      externalSchematic('@schematics/angular', 'workspace', { name: options.name }),
      (tree: Tree, context: SchematicContext) => {
        if (false) {
          const installTask = context.addTask(new NodePackageInstallTask(options.name));
          context.addTask(
            new RepositoryInitializerTask( options.name ),
            installTask ? [installTask] : [],
          );
        }
        return tree;
      }
    ])
    return tree;
  };
}
