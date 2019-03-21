import { Rule, SchematicContext, Tree, chain, externalSchematic } from '@angular-devkit/schematics';
import { OptionsSchema } from './schema';
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
} from '@angular-devkit/schematics/tasks';
import * as inquirer from 'inquirer';
import { Observable, defer } from 'rxjs';
// import { } from '@schematics/angular'; // TODO add as dep?

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function newProject(options: OptionsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(`Generating ${options.name}`);

    

    return chain([
      (tree: Tree, context: SchematicContext): Observable<Tree> => {
        // https://medium.com/rocket-fuel/angular-schematics-asynchronous-schematics-dc998c0b6fba
        // https://medium.com/@benlesh/rxjs-observable-interop-with-promises-and-async-await-bebb05306875
        return defer<Tree>(async function() {
          const userInput = await inquirer.prompt({
            choices: ['Custom', 'Default'],
            default: 'Custom',
            message: 'Choose the theme for the project:',
            name: 'theme',
            type: 'list'
          });
          return tree;
        })
      },
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
