import co from './cohere/cohere'
console.log(co)
co.init('BBf3aGEh58aFte5bwyLtu6PJa36ZKO0cFCbtmO3i')

export function getRecipe(ingredients: string[]): Promise<Recipe_Data> {
    let prompt = "Food in my pantry:\n" + ingredients.join("\n") + "\n\nRecipe:";
    return co.generate({
        model: "4fece9cc-5e74-479e-bef5-f3c42611150c-ft",
        prompt: prompt,
        max_tokens: 800,
        temperature: 0.8,
        k: 0,
        p: 0.75,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop_sequences: ["END\n", "--S--", "Recipe:\n"],
        return_likelihoods: 'NONE'
    }).then((response) => {
        console.log("co:here response: ", response);
        if (response.statusCode === 200) {
            return processResponse(response.body.generations[0].text);
        } else {
            return { body: "<h3>" + JSON.stringify(response.body).slice(1, -1).trim().replace("\"", "").replace(":", ": ") + "</h3>", title: "Error" };
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
    let recepeTitle = "";
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
            recepeTitle = line;
            outStr += `<h2>${recepeTitle}</h2>\n`;
        } else if (testline.length !== 0 && (currSection === Recipe_Sections.ingredients || currSection === Recipe_Sections.directions)) {
            outStr += `<li>${line}</li>\n`;
        } else {
            outStr += `${line}\n`
        }
    }
    if (currSection === Recipe_Sections.commentary) outStr += `</p>\n`
    else if (currSection === Recipe_Sections.directions) outStr += `</ol>\n`
    else if (currSection === Recipe_Sections.ingredients) outStr += `</ul>\n`
    return { body: outStr, title: recepeTitle };
}
