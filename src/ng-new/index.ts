import { Rule, SchematicContext, Tree, chain, externalSchematic, mergeWith, apply, empty, move, MergeStrategy, schematic } from '@angular-devkit/schematics';
import { OptionsSchema } from './schema';
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
} from '@angular-devkit/schematics/tasks';
import { Observable, defer } from 'rxjs';
import { PromptSession } from '../cli-utils/prompt';
import { BaseProjectLibrary } from '../types/project-library';
import { formatChoices } from '../cli-utils/formatting';
import { Template } from '../types';
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

    const projectLibrary = new BaseProjectLibrary();
    projectLibrary.projects.push(
      {
        name: "Empty",
        description: "Project structure with routing and a home page"
      } as Template,
      {
        name: "Side navigation",
        description: "Project structure with side navigation drawer"
      } as Template,
      {
        name: "Authentication with Side navigation",
        description: "Side navigation extended with user authentication module"
      } as Template
    )

    return chain([
      (tree: Tree, context: IgxSchematicContext): Observable<Tree> => {
        // https://medium.com/rocket-fuel/angular-schematics-asynchronous-schematics-dc998c0b6fba
        // https://medium.com/@benlesh/rxjs-observable-interop-with-promises-and-async-await-bebb05306875
        return defer<Tree>(async function() {
          const prompt = new PromptSession();
          const theme = await prompt.getUserInput({
            type: "list",
            name: "theme",
            message: "Choose the theme for the project:",
            choices: ['Custom', 'Default'], //projectLibrary.themes,
            default: 'Custom' //projectLibrary.themes[0]
          });
          const projectType = await prompt.getUserInput({
            type: "list",
            name: "projTemplate",
            message: "Choose project template:",
            choices: formatChoices(projectLibrary.projects)
          });
          context.logger.info(projectType);
          // projTemplate = projectLibrary.projects.find(x => x.name === projectType);
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
          const prompt = new PromptSession();
          const test = await prompt.getUserInput({
            name: 'test',
            type: 'confirm',
            message: 'Iz dis after install?'
          });
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
