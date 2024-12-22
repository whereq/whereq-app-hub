import { TopCategory } from "@models/EndpointCategory";
import { RestfulEndpoint } from "@models/RestfulEndpoint";

export const catFact: RestfulEndpoint[] = [
    {
        title: "Cat Breeds",
        url: "https://catfact.ninja/breeds",
        method: "GET",
        params: { limit: "10" },
        headers: { "Content-Type": "application/json" },
    },
    {
        title: "Cat Facts",
        url: "https://catfact.ninja/facts",
        method: "GET",
        params: { max_length: "", limit: "10" },
        headers: { "Content-Type": "application/json" },
    },
    {
        title: "Cat Fact",
        url: "https://catfact.ninja/fact",
        method: "GET",
        params: { max_length: "" },
        headers: { "Content-Type": "application/json" },
    },
];

export const dogBreeds: RestfulEndpoint[] = [
    {
        title: "Dog Breeds",
        url: "https://dog.ceo/api/breeds/list/all",
        method: "GET",
        params: { },
        headers: { "Content-Type": "application/json" },
    },
    {
        title: "Dog Random Image",
        url: "https://dog.ceo/api/breeds/image/random",
        method: "GET",
        params: { },
        headers: { "Content-Type": "application/json" },
    },
];

export const petFoodFacts: RestfulEndpoint[] = [
    {
        title: "Open Pet Food Facts",
        url: "https://world.openpetfoodfacts.org/api/v0/product/20106836.json",
        method: "GET",
        params: { },
        headers: { "Content-Type": "application/json" },
    },
];

export const ipify: RestfulEndpoint[] = [
    {
        title: "My IP Address",
        url: "https://api.ipify.org/?format=json",
        method: "GET",
        params: { },
        headers: { "Content-Type": "application/json" },
    },
];



// Export a merged array combining all endpoints
export const publicApiEndpoints: RestfulEndpoint[] = [
    ...catFact,
    ...dogBreeds,
    ...petFoodFacts,
    ...ipify,
];

export const publicApiCategories: TopCategory[] = [
    {
        name: "Animal",
        categories: [
            {
                name: "Cat Information",
                restfulEndpointGroups: [
                    {
                        name: "Cat Fact Ninja",
                        restfulEndpoints: catFact,
                    },
                ],
            },
            {
                name: "Dog Information",
                restfulEndpointGroups: [
                    {
                        name: "Dog Breeds",
                        restfulEndpoints: dogBreeds,
                    },
                ],
            },
            {
                name: "Open Pet Food Facts",
                restfulEndpointGroups: [
                    {
                        name: "Pet Food Facts",
                        restfulEndpoints: petFoodFacts,
                    },
                ],
            },
        ],
    },
    {
        name: "Others",
        categories: [
            {
                name: "Uncategorized",
                restfulEndpointGroups: [
                    {
                        name: "My IP Address",
                        restfulEndpoints: ipify,
                    },
                ],
            },
        ],
    },
];
