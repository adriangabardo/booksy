/**
 * A utility function to append multiple WHERE statements for string values in a SQL SELECT
 * @param {*} mapping - A mapping of filter keys to multiple SCHEMA properties it can be matched against
 * @param {*} filters - The optional filters that can be passed in to be used for creating a WHERE clause
 * @example
 * merge_where_str({searchValue: ['title', 'description']}, { searchValue: ['Androids'] })
 * @returns The base statement suffixed with any valid WHERE clauses
 */
const merge_where_str = (mapping, filters) => {
  let whereClause = "";
  const conditions = [];

  Object.entries(filters).forEach(([filterKey, filterValues]) => {
    filterValues
      .filter((e) => !!e)
      .forEach((filterValue) => {
        console.log("filterValue", filterValue);

        const properties = mapping[filterKey];
        console.log("SCHEMA properties", properties);

        properties.forEach((property) => {
          conditions.push(`LOWER(${property}) LIKE LOWER('%${filterValue}%')`);
        });
      });
  });

  if (conditions.length > 0) {
    whereClause = " WHERE " + conditions.join(" OR ");
  }

  return whereClause;
};

module.exports = { merge_where_str };
