import { Rule, SchematicContext, Tree, chain, externalSchematic, mergeWith, apply, empty, move, applyTemplates } from '@angular-devkit/schematics';
import { OptionsSchema } from './schema';
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
} from '@angular-devkit/schematics/tasks';
import * as inquirer from 'inquirer';
import { Observable, defer } from 'rxjs';
// import { } from '@schematics/angular'; // TODO add as DEV dep for workspace/application options schema?

interface IgxSchematicContext extends SchematicContext {
  theme: string;
}


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function newProject(options: OptionsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(`Generating ${options.name}`);

    

    return chain([
      (tree: Tree, context: IgxSchematicContext): Observable<Tree> => {
        // https://medium.com/rocket-fuel/angular-schematics-asynchronous-schematics-dc998c0b6fba
        // https://medium.com/@benlesh/rxjs-observable-interop-with-promises-and-async-await-bebb05306875
        return defer<Tree>(async function() {
          const theme = (await inquirer.prompt<{theme: string}>({
            choices: ['Custom', 'Default'],
            default: 'Custom',
            message: 'Choose the theme for the project:',
            name: 'theme',
            type: 'list'
          })).theme;
          context.theme = theme;
          context.logger.info('');
          return tree;
        });
      },
      // Task chain based on @schematics/angular ng-new schematic
      mergeWith(
        apply(empty(), [
          externalSchematic('@schematics/angular', 'workspace', { name: options.name }),
          externalSchematic('@schematics/angular','application', { projectRoot: '', name: options.name, skipInstall: true}),
          applyTemplates({}),
          (tree: Tree, context: IgxSchematicContext) => {
            // extend project entry point:
            tree.create("ignite-ui-cli.json", JSON.stringify({ theme: context.theme }));
          },
          move(options.name),
        ]),
      ),
      (tree: Tree, context: IgxSchematicContext) => {
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
