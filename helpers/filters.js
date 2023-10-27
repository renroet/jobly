
const { BadRequestError, NotFoundError } = require("../expressError");

function createFilteredSearch(filters, searchRough) {
    let res = {}
    let newParams = {}
    
    for(let el in searchRough) {
        let newKey = el.toLowerCase()
        newParams[newKey] = searchRough[el]
    }
    filters.forEach((filter) => {
        res[filter] = newParams[filter]
    })
    
    return res
};

function createCompanySearch(searchTerms) {
    const keys = Object.keys(searchTerms)
    const searchVals = {}
    if (keys.includes("minemployees") && keys.includes("maxemployees")) {
        const min = parseInt(searchTerms["minemployees"])
        const max = parseInt(searchTerms["maxemployees"])
        if (min > max) {
            console.log(min)
            console.log(max)
            throw new BadRequestError("bad request: minimum employee count cannot be greater than maximum employee count")
          }
          else {
            let num_employees = {string: ["BETWEEN", "AND"],
                                values: [searchTerms.minemployees, searchTerms.maxemployees]}
            searchVals["num_employees"] = num_employees
          }
    } else if (keys.includes("minemployees")) {
        let num_employees = {string: [">="],
                            values: [searchTerms.minemployees]}
        searchVals["num_employees"] = num_employees
    } else if (keys.includes("maxemployees")) {
        let num_employees = {string: ["<="],
                            values: [searchTerms.maxemployees]}
        searchVals["num_employees"] = num_employees
    }
    if (keys.includes("name")) {
        let name = {string: ["ILIKE"],
                    values: [`%${searchTerms.name}%`]}
        searchVals["name"] = name
    }
    return searchVals
}


function createJobSearch(searchTerms) {
    console.log(searchTerms)
    const keys = Object.keys(searchTerms)
    const searchVals = {}
    if (keys.includes("hasequity") && searchTerms["hasequity"] === "true" ) {
            
        let equity = {string: [">"],
                        values: [0]}
            searchVals["equity"] = equity
          }
    if (keys.includes("minsalary")) {
        let salary = {string: [">="],
                            values: [searchTerms.minsalary]}
        searchVals["salary"] = salary
    }
    if (keys.includes("title")) {
        let title = {string: ["ILIKE"],
                    values: [`%${searchTerms.title}%`]}
        searchVals["title"] = title
    }
    console.log(searchVals)
    return searchVals
}


module.exports = { createFilteredSearch, createCompanySearch, createJobSearch }