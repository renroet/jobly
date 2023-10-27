"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
          `SELECT title
           FROM jobs
           WHERE title = $1`,
        [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title}`);

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          company_handle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
          `SELECT id,
            title, 
            salary, 
            equity, 
            company_handle AS "companyHandle"
           FROM jobs
           ORDER BY title`);
    return jobsRes.rows;
  }


static async findFilteredSearch(sqlTerms) {
    let strings = []
    const vals = []
    let count = 0
    for(let key in sqlTerms) {
      let str = sqlTerms[key].string.map((s, idx) => `${s} $${idx + count + 1}`)
      count += str.length
      str = str.join(" ")
      strings.push(key + ' ' + str)
      sqlTerms[key].values.forEach((val) => vals.push(val))
    }
    strings = strings.join(" AND ")
    const querySql = `SELECT * FROM jobs  
                    WHERE ${strings}`;
    const result = await db.query(querySql, [...vals]);
    const jobs = result.rows;
  
    if(jobs.length === 0) {
      throw new NotFoundError(`No job matches search`);
    }
  
    return jobs;
};



  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *   where company_handle is [{ handle, name, description, num_employees, logo_url }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
            title, 
            salary, 
            equity, 
            company_handle AS "companyHandle",
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"
           FROM jobs
           JOIN companies 
           ON company_handle = handle
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return {"id": job.id,
            "title": job.title,
            "salary": job.salary,
            "equity": job.equity,
            "company": {
                "handle": job.companyHandle,
                "name": job.name,
                "description": job.description,
                "numEmployees": job.numEmployees,
                "logoUrl": job.logoUrl
            }};
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    console.log(data)
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          company_handle: "companyHandle"
        }
    );
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id, title`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;
