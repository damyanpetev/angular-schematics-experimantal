import { Template, Component, ComponentGroup } from "../types";
import { BaseComponent } from "../lib/BaseComponent";
import { Util } from "../lib/Util";


export function formatOutput(items: Array<Template | Component | ComponentGroup>): Array<{ name: string, value: string, short: string }> {
    const choiceItems = [];
    const leftPadding = 2;
    const rightPadding = 1;

    const maxNameLength = Math.max(...items.map(x => x.name.length)) + 3;
    const targetNameLength = Math.max(18, maxNameLength);
    let description: string;
    for (const item of items) {
        const choiceItem = {
            name: "",
            short: item.name,
            value: item.name
        };
        choiceItem.name = item.name;
        if (item instanceof BaseComponent && item.templates.length <= 1) {
            description = item.templates[0].description || "";
        } else {
            description = item.description || "";
        }
        if (description !== "") {
            choiceItem.name = item.name + Util.addColor(".".repeat(targetNameLength - item.name.length), 0);
            const max = process.stdout && process.stdout.columns ? process.stdout.columns - targetNameLength - leftPadding - rightPadding : 0;
            description = Util.truncate(description, max, 3, ".");
            description = Util.addColor(description, 0);
            choiceItem.name += description;
        }
        choiceItems.push(choiceItem);
    }
    return choiceItems;
}