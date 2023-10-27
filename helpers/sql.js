const { BadRequestError } = require("../expressError");

// this function finds the keys of the object that need to be exchanged for the new data.
// using this data, it creates a partial sql query that would switch the data at the reference point. 
// the command and table are still needed, but the actual meat of the swap is found in this function
// if no data is provided to update, an error is raised

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
