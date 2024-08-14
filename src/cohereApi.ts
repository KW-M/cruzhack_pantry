// import co from './cohere/cohere'
import { CohereClient, Cohere } from 'cohere-ai'


let co = new CohereClient({
    token: 'BBf3aGEh58aFte5bwyLtu6PJa36ZKO0cFCbtmO3i'

})
console.log(co)
export function getRecipe(ingredients: string[]): Promise<Recipe_Data> {
    let prompt = "Food in my pantry:\n" + ingredients.join("\n") + "\n\nRecipe:";
    // co.finetuning.createFinetunedModel({
    //     name: 'pantry_pal_training_data_chat',
    //     settings: {
    //         baseModel: {
    //             baseType: Cohere.finetuning.BaseType.BaseTypeChat,
    //         },
    //         datasetId: 'training-data-chat-8b4cde',
    //     },
    // }).then(console.log)
    return co.chat({
        model: "672dcea9-d221-4d05-b6ad-a3b53acccdb4-ft",
        preamble: "You are a cooking & baking recipe writer which makes a tasteful recipe from pantry ingredients",
        message: prompt,
        maxTokens: 800,
        temperature: 0.8,
        k: 0,
        p: 0.75,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stopSequences: ["END\n", "--S--", "Recipe:\n"],
        // returnLikelihoods: 'NONE'
    }).then((response) => {
        console.log("co:here response: ", response);
        if (response.text) {
            return processResponse(response.text);
        } else if (response.meta?.warnings) {
            return { body: "<h3>" + JSON.stringify(response.meta?.warnings?.join(" | ")).slice(1, -1).trim().replace("\"", "").replace(":", ": ") + "</h3>", title: "Error" };
        } else {
            return { body: "<h3>Sorry, recipe couln't be created. Please try later.</h3>", title: "Error" };
        }
    })
}

enum Recipe_Sections {
    title,
    ingredients,
    directions,
    commentary,
}

// returns the text with html styling applied
export function processResponse(responseText: string): Recipe_Data {
    let lines = responseText.split("\n")
    let outStr = "";
    let currSection = Recipe_Sections.title;
    let receipeTitle = "";
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const testline = line.toLowerCase();

        // parse out the different sections:
        if (currSection === Recipe_Sections.title && testline.includes("ingredients")) {
            outStr += `<h3>${line}</h3>\n<ul>\n`;
            currSection = Recipe_Sections.ingredients;
            continue;
        } else if (currSection === Recipe_Sections.ingredients && testline.includes("directions")) {
            outStr += `</ul>\n<h3>${line}</h3>\n<ol>\n`;
            currSection = Recipe_Sections.directions;
            continue;

        } else if (currSection === Recipe_Sections.directions && testline.length === 0) {
            outStr += `</ol>\n<p>\n`;
            currSection = Recipe_Sections.commentary;
            continue;
        } else if (currSection === Recipe_Sections.title && testline.length !== 0) {
            receipeTitle = line;
            outStr += `<h2>${receipeTitle}</h2>\n`;
        } else if (testline.length !== 0 && (currSection === Recipe_Sections.ingredients || currSection === Recipe_Sections.directions)) {
            outStr += `<li>${line}</li>\n`;
        } else {
            outStr += `${line}\n`
        }
    }
    if (currSection === Recipe_Sections.commentary) outStr += `</p>\n`
    else if (currSection === Recipe_Sections.directions) outStr += `</ol>\n`
    else if (currSection === Recipe_Sections.ingredients) outStr += `</ul>\n`
    return { body: outStr, title: receipeTitle };
}
