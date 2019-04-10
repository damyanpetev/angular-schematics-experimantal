import { Rule, SchematicContext, Tree, chain, externalSchematic, mergeWith, apply, empty, move, MergeStrategy, schematic } from '@angular-devkit/schematics';
import { OptionsSchema } from './schema';
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
} from '@angular-devkit/schematics/tasks';
import { Observable, defer } from 'rxjs';
import { PromptSession } from '../cli-utils/prompt';
import { BaseProjectLibrary, ProjectLibrary } from '../types/project-library';
import { formatChoices } from '../cli-utils/formatting';
import { Template, Component } from '../types';
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
    //#region test setup
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
    );
    const gridTemplate: Template = {
      id: "grid",
      name: "Grid",
      components: ["Grid"],
      controlGroup: "Grids & Lists",
      description: "basic IgxGrid"

    } as Template;
    const editGridTemplate: Template = {
      id: "grid-edit",
      name: "Edit Grid",
      components: ["Grid"],
      controlGroup: "Grids & Lists",
      description: "Editing IgxGrid"

    } as Template;
    const gridComponent: Component = {
      name: "Grid",
      group: "Grids & Lists",
      description: "pick from grids: basic or custom",
      groupPriority: 10,
      templates: []
    };

    const chartComponent: Component = {
      name: "Chart",
      group: "Charts & Lists",
      description: "pick from charts",
      groupPriority: 10,
      templates: []
    };

    gridComponent.templates.push(gridTemplate, editGridTemplate);
    projectLibrary.templates.push(gridTemplate, editGridTemplate);
    projectLibrary.components.push(gridComponent, chartComponent)
    //#endregion test setup

    const addedComponents: any[] = [];

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
      chooseActionLoop({ projectLibrary: projectLibrary, rulesChain: addedComponents, projectName: options.name }),
      (_tree: Tree, _context: IgxSchematicContext) => {
        if (addedComponents.length) {
          return chain(addedComponents);
        }
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

interface ActionsOptionsSchema {
  projectLibrary: ProjectLibrary;
  rulesChain: Rule[],
  projectName?: string
}

export function chooseActionLoop(options: ActionsOptionsSchema): Rule {
  return (tree: Tree, _context: IgxSchematicContext) => {
    return defer<Tree>(async function() {
      const prompt = new PromptSession();
      let actionIsOver = false;
      while (!actionIsOver) {
        const actionChoices: Array<{}> = prompt.generateActionChoices(options.projectLibrary);
        // Util.log(""); /* new line */
        const action: string = await prompt.getUserInput({
          type: "list",
          name: "action",
          message: "Choose an action:",
          choices: actionChoices,
          default: "Complete & Run"
        });
    
        switch (action) {
          case "Add component": {
            const addedTemplates: any[] = [];
            await prompt.addComponent(options.projectLibrary, addedTemplates);
            options.rulesChain.push(schematic("component", {
              name: addedTemplates[0].name,
              template: addedTemplates[0].template,
              projectName: options.projectName
            }));
            break;
          }
          case "Add scenario": {
            // actionIsOver = await prompt.addView(options.projectLibrary, options.theme);
            // options.rulesChain.push(schematic("component"), {/*options.projectLibrary, options.theme*/});
            break;
          }
          case "Complete & Run":
            actionIsOver = true;
            // const config = ProjectConfig.localConfig();
            // const defaultPort = config.project.defaultPort;
            // let port;
            // let userPort: boolean;
            // while (!userPort) {
            //   // tslint:disable-next-line:prefer-const
            //   port = await prompt.getUserInput({
            //     default: defaultPort,
            //     message: "Choose app host port:",
            //     name: "port",
            //     type: "input"
            //   });
    
            //   if (!Number(port)) {
            //     Util.log(`port should be a number. Input valid port or use the suggested default port`, "yellow");
            //   } else {
            //     userPort = true;
            //     config.project.defaultPort = port;
            //     ProjectConfig.setConfig(config);
            //   }
            // }
            break;
          default: {
            break;
          }
        }
      }
      return tree;
    });
  }
};

