const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    const profile = {
        firstName: 'Abigail',
        lastName: 'Fresher',
        age: 31,
        username: 'bestertester'
    };
  test("works: only data, no jsToSql", function () {
    const newData = sqlForPartialUpdate({
        firstName: 'Aliya', 
        age: 32
    }, profile);
    expect(newData).toEqual({
      setCols: '"Abigail"=$1, "31"=$2', 
      values: ['Aliya', 32]
    });
  });
  test("works: throws error if no data to update", async function () {
    try {
        sqlForPartialUpdate({},profile);
        fail();
    } catch(err) {
        console.log(err)
        expect(err instanceof BadRequestError).toBeTruthy();
    };
  });
});