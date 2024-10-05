const axios = require('axios');
const fs = require('fs');
axios.defaults.transformResponse = [];

const config = JSON.parse(fs.readFileSync("config.json").toString());

const llamaServerUrl = config["llama_server_url"];
const datasetUrl = config["dataset_url"];

axios.defaults.baseURL = llamaServerUrl;

const result = "benchmark_result_" + Math.floor(Math.random() * 1000000) + ".json";

let tempRes = [];

const saveTempRes = () => {
    fs.writeFileSync(result, JSON.stringify(tempRes));
}

const toPrompt = (data) => {
    const question = data["question"];
    const optionA = data["option_a"];
    const optionB = data["option_b"];
    const optionC = data["option_c"];
    const optionD = data["option_d"];

    return `${question}\n\n[A] ${optionA}\n[B] ${optionB}\n[C] ${optionC}\n[D] ${optionD}\n\n\nJawaban dari pertanyaan yang diberikan diatas adalah:\n`;
}

(async () => {
    const datasetResp = await axios.get(datasetUrl);
    const dataset = JSON.parse(datasetResp.data);

    for (let i = 0; i < dataset.length; i++) {
        const data = dataset[i];
        try {
            console.log(`Question ${i + 1} started...`);
            const resp = await axios.post(llamaServerUrl, toPrompt(data));
            tempRes.push({
                question: data,
                response: resp.data["content"]
            });
            saveTempRes();
            console.log(`Question ${i + 1} done!`);
        }catch (e){
            console.log(e);
            console.log("Retrying in 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
})();
