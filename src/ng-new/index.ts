import { Rule, SchematicContext, Tree, chain, externalSchematic, mergeWith, apply, empty, move, MergeStrategy, schematic } from '@angular-devkit/schematics';
import { OptionsSchema } from './schema';
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
} from '@angular-devkit/schematics/tasks';
import * as inquirer from 'inquirer';
import { Observable, defer } from 'rxjs';
// import { } from '@schematics/angular'; // TODO add as DEV dep for workspace/application options schema?
// import projectSchematic from '../app-projects'

interface IgxSchematicContext extends SchematicContext {
  projectTpe: string;
  theme: string;
}


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function newProject(options: OptionsSchema): Rule {
  return (_host: Tree, context: IgxSchematicContext) => {
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
          const projectType = (await inquirer.prompt<{projectType: string}>({
            choices: ['Empty', 'Side navigation', 'Authentication with Side navigation'],
            default: 'Side navigation',
            message: 'Choose the projectType for the project:',
            name: 'projectType',
            type: 'list'
          })).projectType;
          context.projectTpe = projectType;
          context.theme = theme;
          context.logger.info('');
          tree.create(`${options.name}/ignite-ui-cli.json`, JSON.stringify({ tree: 'override me' }));
          return tree;
        });
      },
      // Task chain based on @schematics/angular ng-new schematic
      mergeWith(
        apply(empty(), [
          externalSchematic('@schematics/angular', 'workspace', { name: options.name }),
          externalSchematic('@schematics/angular','application', { projectRoot: '', name: options.name, skipInstall: true, routing: true, style: 'scss'}),
          (_tree: Tree, context: IgxSchematicContext) => {
            // extend project entry point:
            return schematic('app-projects', { theme: context.theme});
          },
          // schematic('app-projects', { theme: context.theme}),
          (tree: Tree, context: IgxSchematicContext) => {
            // extend project entry point:
            tree.create("ignite-ui-cli.json", JSON.stringify({ theme: context.theme }));
          },
          move(options.name),
        ]), MergeStrategy.Overwrite
      ),
      (tree: Tree, context: IgxSchematicContext) => {
        context.engine.executePostTasks()
        return defer<Tree>(async function() {
          const test = (await inquirer.prompt<{test: string}>({
            message: 'Iz dis after install?',
            name: 'test',
            type: 'confirm'
          })).test;
          context.logger.info('' + test);
          return tree;
        });
      },
      (tree: Tree, context: IgxSchematicContext) => {
        if (false) {
          const installTask = context.addTask(new NodePackageInstallTask(options.name));
          context.addTask(
            new RepositoryInitializerTask( options.name ),
            installTask ? [installTask] : [],
          );
        }
        context.addTask(
          new RepositoryInitializerTask( options.name ));
        return tree;
      }
    ]);
  };
}
