/**
 * Apache Doris SQL Built-in Functions Catalog (Doris 3.x / 4.x Parity)
 * Total Functions: 828
 * Extracted from official Apache Doris 3.x SQL Manual & Engine Catalog
 */

export const DORIS_FUNCTIONS_DATA = [
  {
    "name": "ABS",
    "usage": "ABS(x)",
    "description": "Returns the absolute value of x",
    "category": "Numeric",
    "example": "select abs(-2);"
  },
  {
    "name": "ACOS",
    "usage": "ACOS(x)",
    "description": "Returns the arc cosine of x, or NULL if x is not in the range -1 to 1.",
    "category": "Numeric",
    "example": "select acos(1);"
  },
  {
    "name": "ACOSH",
    "usage": "ACOSH(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT ACOSH();"
  },
  {
    "name": "ADDDATE",
    "usage": "ADDDATE(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT ADDDATE();"
  },
  {
    "name": "ADD_MONTHS",
    "usage": "ADD_MONTHS(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT ADD_MONTHS();"
  },
  {
    "name": "ADD_TIME",
    "usage": "ADD_TIME(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT ADD_TIME();"
  },
  {
    "name": "AES_DECRYPT",
    "usage": "AES_DECRYPT( str, key_str[, init_vector][, encryption_mode])",
    "description": "AES decryption function. This function behaves the same as the AES_DECRYPT function in MySQL. The default algorithm is AES_128_ECB,",
    "category": "Encryption & Hash",
    "example": "SELECT AES_DECRYPT();"
  },
  {
    "name": "AES_ENCRYPT",
    "usage": "AES_ENCRYPT( str, key_str[, init_vector][, encryption_mode])",
    "description": "AES encryption function. This function behaves the same as the AES_ENCRYPT function in MySQL. The default algorithm is AES_128_ECB,",
    "category": "Encryption & Hash",
    "example": "SELECT AES_ENCRYPT();"
  },
  {
    "name": "AI_AGG",
    "usage": "AI_AGG(resource_name, prompt, column_expr)",
    "description": "Aggregate function that uses an LLM to process and synthesize values across grouped rows.",
    "category": "AI",
    "example": "SELECT department, AI_AGG('ollama_gemma2', 'Summarize team accomplishments', feedback) FROM reviews GROUP BY department;"
  },
  {
    "name": "AI_CLASSIFY",
    "usage": "AI_CLASSIFY(resource_name, text, categories)",
    "description": "Classifies the input text into one of the user-provided candidate categories.",
    "category": "AI",
    "example": "SELECT AI_CLASSIFY('ollama_gemma2', query, 'billing, technical, sales') FROM user_queries;"
  },
  {
    "name": "AI_EXTRACT",
    "usage": "AI_EXTRACT(resource_name, text, schema_or_fields)",
    "description": "Extracts key attributes or structured entities from unstructured text according to the provided schema or field list.",
    "category": "AI",
    "example": "SELECT AI_EXTRACT('ollama_gemma2', email_body, 'sender_name, invoice_amount');"
  },
  {
    "name": "AI_FILTER",
    "usage": "AI_FILTER(resource_name, text, condition)",
    "description": "Evaluates a semantic natural-language condition against the text and returns a boolean result (true/false).",
    "category": "AI",
    "example": "SELECT * FROM tickets WHERE AI_FILTER('ollama_gemma2', description, 'mentions payment failure');"
  },
  {
    "name": "AI_FIXGRAMMAR",
    "usage": "AI_FIXGRAMMAR(resource_name, text)",
    "description": "Corrects grammatical errors, typos, and phrasing inconsistencies in the text.",
    "category": "AI",
    "example": "SELECT AI_FIXGRAMMAR('ollama_gemma2', user_input) FROM feedback;"
  },
  {
    "name": "AI_GENERATE",
    "usage": "AI_GENERATE(resource_name, prompt)",
    "description": "Generates text responses or completions based on the provided prompt using the specified AI resource.",
    "category": "AI",
    "example": "SELECT AI_GENERATE('ollama_gemma2', 'Explain columnar storage in 1 sentence');"
  },
  {
    "name": "AI_MASK",
    "usage": "AI_MASK(resource_name, text, pii_entities)",
    "description": "Detects and anonymizes personally identifiable information (PII) like names, emails, and phone numbers.",
    "category": "AI",
    "example": "SELECT AI_MASK('ollama_gemma2', email_body, 'names, emails, phone numbers') FROM messages;"
  },
  {
    "name": "AI_SENTIMENT",
    "usage": "AI_SENTIMENT(resource_name, text)",
    "description": "Analyzes and classifies the emotional sentiment of the text as positive, neutral, or negative.",
    "category": "AI",
    "example": "SELECT feedback, AI_SENTIMENT('ollama_gemma2', feedback) AS sentiment FROM surveys;"
  },
  {
    "name": "AI_SIMILARITY",
    "usage": "AI_SIMILARITY(resource_name, text1, text2)",
    "description": "Computes semantic text similarity score between two texts using an LLM embedding or cross-encoder model.",
    "category": "AI",
    "example": "SELECT AI_SIMILARITY('ollama_gemma2', title1, title2) FROM articles;"
  },
  {
    "name": "AI_SUMMARIZE",
    "usage": "AI_SUMMARIZE(resource_name, text)",
    "description": "Generates a concise natural language summary of the provided text input.",
    "category": "AI",
    "example": "SELECT AI_SUMMARIZE('ollama_gemma2', review_content) FROM product_reviews;"
  },
  {
    "name": "AI_TRANSLATE",
    "usage": "AI_TRANSLATE(resource_name, text, target_language)",
    "description": "Translates text into the specified target language using an external LLM resource configured via CREATE RESOURCE.",
    "category": "AI",
    "example": "SELECT AI_TRANSLATE('ollama_gemma2', 'Hello, how are you?', 'Hindi');"
  },
  {
    "name": "ANY",
    "usage": "ANY(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT ANY();"
  },
  {
    "name": "ANY_VALUE",
    "usage": "ANY_VALUE(expr)",
    "description": "Returns any value from the expression or column in the group. If there is a non-NULL value, it returns any non-NULL value; otherwise, it returns NULL.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table cost2(id int, name varchar(20)) distributed by hash(id) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into cost2 values (2,'jack'),(3,'jack');"
  },
  {
    "name": "APPEND_TRAILING_CHAR_IF_ABSENT",
    "usage": "APPEND_TRAILING_CHAR_IF_ABSENT(str, trailing_char)",
    "description": "The APPENDTRAILINGCHARIFABSENT function ensures that a string ends with a specified character.",
    "category": "String",
    "example": "SELECT APPEND_TRAILING_CHAR_IF_ABSENT();"
  },
  {
    "name": "APPROX_COUNT_DISTINCT",
    "usage": "APPROX_COUNT_DISTINCT(expr)",
    "description": "The APPROXCOUNTDISTINCT function is implemented based on the HyperLogLog algorithm, which uses a fixed size of memory to estimate the column base.",
    "category": "Aggregate",
    "example": "select approx_count_distinct(query_id) from log_statis group by datetime;"
  },
  {
    "name": "ARRAY",
    "usage": "ARRAY([ element [, ...] ])",
    "description": "construct an array with variadic elements and return it, T could be column or literal",
    "category": "Array",
    "example": "-- setup\ncreate table nested(qid int, creationDate datetime) distributed by hash(creationDate) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into nested values (null,'2009-06-16 07:40:56'),(null,'2009-06-16 07:50:05'),(null,'2009-06-16 08:09:18'),(null,'2009-06-16 08:15:45');"
  },
  {
    "name": "ARRAYS_OVERLAP",
    "usage": "ARRAYS_OVERLAP(left, right)",
    "description": "Determine whether the left and right arrays contain common elements",
    "category": "Array",
    "example": "SELECT ARRAYS_OVERLAP(['a', 'b', 'c'], [1, 2, 'b']);"
  },
  {
    "name": "ARRAY_AGG",
    "usage": "ARRAY_AGG(col)",
    "description": "Concatenates the values (including null values) in a column into an array, which can be used for pivoting rows into columns.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table test_doris_array_agg(c1 int, c2 varchar(20)) distributed by hash(c1) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into test_doris_array_agg values (1,'a'),(1,'b'),(2,'c'),(2,null),(3,null);"
  },
  {
    "name": "ARRAY_APPEND",
    "usage": "ARRAY_APPEND(...)",
    "description": "Built-in array function in Apache Doris.",
    "category": "Array",
    "example": "SELECT ARRAY_APPEND();"
  },
  {
    "name": "ARRAY_APPLY",
    "usage": "ARRAY_APPLY(arr, op, val)",
    "description": "Filter array to match specific binary condition",
    "category": "Array",
    "example": "select array_apply([1, 2, 3, 4, 5], \">=\", 2);"
  },
  {
    "name": "ARRAY_AVG",
    "usage": "ARRAY_AVG(arr)",
    "description": "Get the average of all elements in an array (NULL values are skipped). When the array is empty or all elements in the array are NULL values,",
    "category": "Array",
    "example": "create table array_type_table(\n    k1 INT, \n    k2 Array<int>\n) \nduplicate key (k1)"
  },
  {
    "name": "ARRAY_COMPACT",
    "usage": "ARRAY_COMPACT(arr)",
    "description": "Removes consecutive duplicate elements from an array. The order of result values is determined by the order in the source array.",
    "category": "Array",
    "example": "select array_compact([1, 2, 3, 3, null, null, 4, 4]);"
  },
  {
    "name": "ARRAY_CONCAT",
    "usage": "ARRAY_CONCAT(arr1 [,arr2 , ...])",
    "description": "Concat all arrays passed in the arguments",
    "category": "Array",
    "example": "select array_concat([1, 2], [7, 8], [5, 6]);"
  },
  {
    "name": "ARRAY_CONTAINS",
    "usage": "ARRAY_CONTAINS(ARRAY<T> arr, T value)",
    "description": "Check if a value presents in an array column. Return below values:",
    "category": "Array",
    "example": "mysql> SELECT id,c_array,array_contains(c_array, 5) FROM `array_test`;\n+------+-----------------+------------------------------+\n| id   | c_array         | array_contains(`c_array`, 5) |\n+------+-----------------+------------------------------+\n|    1 | [1, 2, 3, 4, 5] |                            1 |"
  },
  {
    "name": "ARRAY_CONTAINS_ALL",
    "usage": "ARRAY_CONTAINS_ALL(...)",
    "description": "Built-in array function in Apache Doris.",
    "category": "Array",
    "example": "SELECT ARRAY_CONTAINS_ALL();"
  },
  {
    "name": "ARRAY_COUNT",
    "usage": "ARRAY_COUNT(arr)",
    "description": "Use lambda expressions as input parameters to perform corresponding expression calculations on the internal data of other input ARRAY parameters.",
    "category": "Array",
    "example": "-- setup\ncreate table array_test(id int, c_array1 array<int>, c_array2 array<int>) distributed by hash(id) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into array_test values (1,[1,2,3,4,5],[10,20,-40,80,-100]),(2,[6,7,8],[10,12,13]),(3,[1],[-100]),(4,[1,null,2],[null,3,1]),(5,[],[]),(6,null,null);"
  },
  {
    "name": "ARRAY_CROSS_PRODUCT",
    "usage": "ARRAY_CROSS_PRODUCT(...)",
    "description": "Built-in array function in Apache Doris.",
    "category": "Array",
    "example": "SELECT ARRAY_CROSS_PRODUCT();"
  },
  {
    "name": "ARRAY_CUM_SUM",
    "usage": "ARRAY_CUM_SUM(arr)",
    "description": "Get the cumulative sum of an array (NULL values are skipped). If the array contains NULL values,",
    "category": "Array",
    "example": "create table array_type_table(\n    k1 INT, \n    k2 Array<int>\n) \nduplicate key (k1)"
  },
  {
    "name": "ARRAY_DIFFERENCE",
    "usage": "ARRAY_DIFFERENCE(arr)",
    "description": "Calculates the difference between adjacent array elements. Returns an array where the first element will be 0,",
    "category": "Array",
    "example": "CREATE TABLE array_type_table (\n   k1 INT,\n   k2 ARRAY<INT>\n)\nduplicate key (k1)"
  },
  {
    "name": "ARRAY_DISTINCT",
    "usage": "ARRAY_DISTINCT(arr )",
    "description": "Return the array which has been removed duplicate values. Return NULL for NULL input.",
    "category": "Array",
    "example": "CREATE TABLE array_test (\n    k1 INT,\n    k2 ARRAY<INT>\n)\nduplicate key (k1)"
  },
  {
    "name": "ARRAY_ENUMERATE",
    "usage": "ARRAY_ENUMERATE(arr)",
    "description": "Returns array sub item indexes e.g. [1, 2, 3, \u2026, length (arr) ]",
    "category": "Array",
    "example": "create table array_type_table(\n    k1 INT, \n    k2 Array<STRING>\n) \nduplicate key (k1)"
  },
  {
    "name": "ARRAY_ENUMERATE_UNIQ",
    "usage": "ARRAY_ENUMERATE_UNIQ(arr1 [,arr2 , ... ])",
    "description": "Returns an array the same size as the source array, indicating for each element what its position is among elements with the same value. For example,",
    "category": "Array",
    "example": "select array_enumerate_uniq([1, 2, 3, 1, 2, 3]);"
  },
  {
    "name": "ARRAY_EXCEPT",
    "usage": "ARRAY_EXCEPT(arr1 , arr2 )",
    "description": "Returns an array of the elements in array1 but not in array2, without duplicates. If the input parameter is null, null is returned.",
    "category": "Array",
    "example": "CREATE TABLE array_type_table (\n    k1 INT,\n    k2 ARRAY<INT>,\n    k3 ARRAY<INT>\n)"
  },
  {
    "name": "ARRAY_EXISTS",
    "usage": "ARRAY_EXISTS([ lambda, ] arr1 [, arr2 , ...] )",
    "description": "Use an optional lambda expression as an input parameter to perform corresponding expression calculations on the internal data of other input ARRAY",
    "category": "Array",
    "example": "CREATE TABLE array_test2 (\n    id INT,\n    c_array1 ARRAY<INT>,\n    c_array2 ARRAY<INT>\n)"
  },
  {
    "name": "ARRAY_FILTER",
    "usage": "ARRAY_FILTER(lambda, arr)",
    "description": "Use the lambda expression as the input parameter to calculate and filter the data of the ARRAY column of the other input parameter.",
    "category": "Array",
    "example": "-- setup\ncreate table array_test(id int, c_array array<int>) distributed by hash(id) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into array_test values (1,[1,2,3,4,5]),(2,[6,7,8]),(3,[]),(4,null);\ncreate table array_test2(id int, c_array1 array<int>, c_array2 array<int>) distributed by hash(id) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into array_test2 values (1,[1,2,3,4,5],[10,20,-40,80,-100]),(2,[6,7,8],[10,12,13]),(3,[1],[-100]),(4,null,null);"
  },
  {
    "name": "ARRAY_FIRST",
    "usage": "ARRAY_FIRST(lambda, arr)",
    "description": "Use a lambda bool expression and an array as the input parameters,",
    "category": "Array",
    "example": "select array_first(x->x>2, [1,2,3,0]);"
  },
  {
    "name": "ARRAY_FIRST_INDEX",
    "usage": "ARRAY_FIRST_INDEX(lambda, arr [, ...])",
    "description": "Use an lambda expression as an input parameter to perform corresponding expression calculations on the internal data of other input ARRAY parameters.",
    "category": "Array",
    "example": "-- setup\ncreate table array_test(id int, col2 array<int>, col3 array<int>) distributed by hash(id) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into array_test values (1,[1,2,3],[3,4,5]),(2,[1,null,2],[null,3,1]),(3,[1,2,3],[9,8,7]),(4,null,null);"
  },
  {
    "name": "ARRAY_FLATTEN",
    "usage": "ARRAY_FLATTEN(...)",
    "description": "Built-in array function in Apache Doris.",
    "category": "Array",
    "example": "SELECT ARRAY_FLATTEN();"
  },
  {
    "name": "ARRAY_INTERSECT",
    "usage": "ARRAY_INTERSECT(arr1 , arr2 )",
    "description": "Returns an array of the elements in the intersection of array1 and array2, without duplicates. If the input parameter is null, null is returned.",
    "category": "Array",
    "example": "CREATE TABLE array_type_table (\n    k1 INT,\n    k2 ARRAY<INT>,\n    k3 ARRAY<INT>\n)"
  },
  {
    "name": "ARRAY_JOIN",
    "usage": "ARRAY_JOIN(arr , sep [, null_replace])",
    "description": "Combine all elements in the array into a new string based on the separator (sep) and the string to replace NULL values (nullreplace).",
    "category": "Array",
    "example": "CREATE TABLE array_test (\n                            k1 INT,\n                            k2 ARRAY<INT>\n)\n    duplicate key (k1)"
  },
  {
    "name": "ARRAY_LAST",
    "usage": "ARRAY_LAST(lambda, arr)",
    "description": "Use a lambda bool expression and an array as the input parameters,",
    "category": "Array",
    "example": "select array_last(x->x>2, [1,2,3,0]) ;"
  },
  {
    "name": "ARRAY_LAST_INDEX",
    "usage": "ARRAY_LAST_INDEX(lambda, arr [, ...])",
    "description": "Use an lambda expression as an input parameter to perform corresponding expression calculations on the internal data of other input ARRAY parameters.",
    "category": "Array",
    "example": "-- setup\ncreate table array_test(id int, col2 array<int>, col3 array<int>) distributed by hash(id) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into array_test values (1,[1,2,3],[3,4,5]),(2,[1,null,2],[null,3,1]),(3,[1,2,3],[9,8,7]),(4,null,null);"
  },
  {
    "name": "ARRAY_MAP",
    "usage": "ARRAY_MAP(lambda, arr [ , arr ... ] )",
    "description": "Use a lambda expression as the input parameter to calculate the corresponding expression for the internal data of other input ARRAY parameters.",
    "category": "Array",
    "example": "CREATE TABLE array_test2 (\n                             id INT,\n                             c_array1 ARRAY<INT>,\n                             c_array2 ARRAY<INT>\n)"
  },
  {
    "name": "ARRAY_MATCH_ALL",
    "usage": "ARRAY_MATCH_ALL(lambda, arr [, arr ...])",
    "description": "Returns true if all elements in the array match the given condition, false otherwise.",
    "category": "Array",
    "example": "-- Check if all numbers in array are greater than 5\nmysql> SELECT array_match_all(x -> x > 5, [1, 2, 3, 4, 7]);\n+----------------------------------------------+\n| array_match_all(x -> x > 5, [1, 2, 3, 4, 7]) |\n+----------------------------------------------+"
  },
  {
    "name": "ARRAY_MATCH_ANY",
    "usage": "ARRAY_MATCH_ANY(lambda, arr [, arr ...])",
    "description": "Returns true if any element in the array matches the given condition, false otherwise.",
    "category": "Array",
    "example": "-- Check if any number in array is greater than 5\nmysql> SELECT array_match_any(x -> x > 5, [1, 2, 3, 4, 7]);\n+----------------------------------------------+\n| array_match_any(x -> x > 5, [1, 2, 3, 4, 7]) |\n+----------------------------------------------+"
  },
  {
    "name": "ARRAY_MAX",
    "usage": "ARRAY_MAX(arr)",
    "description": "Get the maximum element in an array (NULL values are skipped). When the array is empty or all elements in the array are NULL values,",
    "category": "Array",
    "example": "create table array_type_table(\n    k1 INT, \n    k2 Array<int>\n        ) \nduplicate key (k1)"
  },
  {
    "name": "ARRAY_MIN",
    "usage": "ARRAY_MIN(arr)",
    "description": "Get the minimum element in an array (NULL values are skipped). When the array is empty or all elements in the array are NULL values,",
    "category": "Array",
    "example": "create table array_type_table(\n    k1 INT, \n    k2 Array<int>\n    ) \nduplicate key (k1)"
  },
  {
    "name": "ARRAY_POPBACK",
    "usage": "ARRAY_POPBACK(arr)",
    "description": "Remove the last element from array.",
    "category": "Array",
    "example": "select array_popback(['test', NULL, 'value']);"
  },
  {
    "name": "ARRAY_POPFRONT",
    "usage": "ARRAY_POPFRONT(arr)",
    "description": "Remove the first element from array.",
    "category": "Array",
    "example": "select array_popfront(['test', NULL, 'value']);"
  },
  {
    "name": "ARRAY_POSITION",
    "usage": "ARRAY_POSITION(arr, value)",
    "description": "Returns a position/index of first occurrence of the value in the given array.",
    "category": "Array",
    "example": "CREATE TABLE array_test (\n                            id INT,\n                            c_array ARRAY<INT>,\n                            array_position INT\n)"
  },
  {
    "name": "ARRAY_PRODUCT",
    "usage": "ARRAY_PRODUCT(arr)",
    "description": "Calculates the product of all elements in an array",
    "category": "Array",
    "example": "SELECT ARRAY_PRODUCT([1, 2, 3]),ARRAY_PRODUCT([1, NULL, 3]),ARRAY_PRODUCT([NULL]);"
  },
  {
    "name": "ARRAY_PUSHBACK",
    "usage": "ARRAY_PUSHBACK(arr, value)",
    "description": "Add value to the end of the array",
    "category": "Array",
    "example": "SELECT ARRAY_PUSHBACK([1, 2], 3),ARRAY_PUSHBACK([3, 4], 6);"
  },
  {
    "name": "ARRAY_PUSHFRONT",
    "usage": "ARRAY_PUSHFRONT(arr, value)",
    "description": "Add value to the beginning of the array",
    "category": "Array",
    "example": "SELECT ARRAY_PUSHFRONT([1, 2], 3),ARRAY_PUSHFRONT([3, 4], 6);"
  },
  {
    "name": "ARRAY_RANGE",
    "usage": "ARRAY_RANGE(end)",
    "description": "1. Generate int array 2. Generate date and time array",
    "category": "Array",
    "example": "SELECT ARRAY_RANGE(0,20,2),ARRAY_RANGE(cast('2019-05-15 12:00:00' as datetimev2(0)), cast('2022-05-17 12:00:00' as datetimev2(0)), interval 2 year);"
  },
  {
    "name": "ARRAY_REMOVE",
    "usage": "ARRAY_REMOVE(arr, val)",
    "description": "Removes all specified elements from an array",
    "category": "Array",
    "example": "SELECT ARRAY_REMOVE(['test', NULL, 'value'], 'value');"
  },
  {
    "name": "ARRAY_REPEAT",
    "usage": "ARRAY_REPEAT(element, n)",
    "description": "Generates an array containing n repeated elements",
    "category": "Array",
    "example": "SELECT ARRAY_REPEAT(\"hello\", 2),ARRAY_REPEAT(12345, 3);"
  },
  {
    "name": "ARRAY_REVERSE_SORT",
    "usage": "ARRAY_REVERSE_SORT(arr)",
    "description": "Sort the elements in an array in descending order",
    "category": "Array",
    "example": "SELECT ARRAY_REVERSE_SORT([1, 2, 3, 6]),ARRAY_REVERSE_SORT([1, 4, 3, 5, NULL]),ARRAY_REVERSE_SORT([NULL]);"
  },
  {
    "name": "ARRAY_REVERSE_SPLIT",
    "usage": "ARRAY_REVERSE_SPLIT(arr, cond)",
    "description": "Returns an ARRAY type result, where the array is split according to the specified condition.",
    "category": "Array",
    "example": "select array_reverse_split([1,2,3,4,5], [1,0,1,0,0]);"
  },
  {
    "name": "ARRAY_SHUFFLE",
    "usage": "ARRAY_SHUFFLE(array, seed)",
    "description": "Randomly arrange the elements in an array",
    "category": "Array",
    "example": "SELECT ARRAY_SHUFFLE([1, 2, 3, 6]),ARRAY_SHUFFLE([1, 4, 3, 5, NULL],1);"
  },
  {
    "name": "ARRAY_SIZE",
    "usage": "ARRAY_SIZE(arr)",
    "description": "Count the number of elements in an array",
    "category": "Array",
    "example": "SELECT ARRAY_SIZE(['a', 'b', 'c']),ARRAY_SIZE(NULL),ARRAY_SIZE([]);"
  },
  {
    "name": "ARRAY_SLICE",
    "usage": "ARRAY_SLICE(arr, off, len)",
    "description": "Specify the starting position and length to extract a portion of elements from an array to form a new sub-array",
    "category": "Array",
    "example": "SELECT ARRAY_SLICE([1, 2, 3, 6],2,3),ARRAY_SLICE([1, 4, 3, 5, NULL],-2,1),ARRAY_SLICE([1, 3, 5],0);"
  },
  {
    "name": "ARRAY_SORT",
    "usage": "ARRAY_SORT(arr)",
    "description": "Sort the elements in an array in ascending order",
    "category": "Array",
    "example": "SELECT ARRAY_SORT([1, 2, 3, 6]),ARRAY_SORT([1, 4, 3, 5, NULL]),ARRAY_SORT([NULL]);"
  },
  {
    "name": "ARRAY_SORTBY",
    "usage": "ARRAY_SORTBY(src, key)",
    "description": "First, arrange the key column in ascending order, and then return the corresponding column of the src column sorted in this order as the result;",
    "category": "Array",
    "example": "-- setup\ncreate table test_array_sortby(id int, c_array1 array<int>, c_array2 array<int>) distributed by hash(id) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into test_array_sortby values (0,null,[2]),(1,[1,2,3,4,5],[10,20,-40,80,-100]),(2,[6,7,8],[10,12,13]),(3,[1],[-100]),(4,null,null),(5,[3],null),(6,[1,2],[2,1]),(7,[null],[null]),(8,[1,2,3],[3,2,1]);\ncreate table array_test2(id int, c_array1 array<int>, c_array2 array<int>) distributed by hash(id) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into array_test2 values (1,[1,2,3],[10,11,12]),(2,[4,3,5],[10,20,30]),(3,[-40,30,-100],[30,10,20]);"
  },
  {
    "name": "ARRAY_SPLIT",
    "usage": "ARRAY_SPLIT(arr, cond)",
    "description": "Returns an ARRAY type result, where the array is split according to the specified condition.",
    "category": "Array",
    "example": "select array_split([1,2,3,4,5], [1,0,1,0,0]);"
  },
  {
    "name": "ARRAY_SUM",
    "usage": "ARRAY_SUM(src)",
    "description": "Calculates the sum of all elements in an array",
    "category": "Array",
    "example": "SELECT ARRAY_SUM([1, 2, 3, 6]),ARRAY_SUM([1, 4, 3, 5, NULL]),ARRAY_SUM([NULL]);"
  },
  {
    "name": "ARRAY_UNION",
    "usage": "ARRAY_UNION(array, array [, ... ])",
    "description": "Merge multiple arrays without duplicate elements to generate a new array",
    "category": "Array",
    "example": "SELECT ARRAY_UNION([1, 2, 3, 6],[1, 2, 5]),ARRAY_UNION([1, 4, 3, 5, NULL],[1,6,10]);"
  },
  {
    "name": "ARRAY_WITH_CONSTANT",
    "usage": "ARRAY_WITH_CONSTANT(n, element)",
    "description": "Generates an array containing n repeated elements",
    "category": "Array",
    "example": "SELECT ARRAY_WITH_CONSTANT(2, \"hello\"),ARRAY_WITH_CONSTANT(3, 12345);"
  },
  {
    "name": "ARRAY_ZIP",
    "usage": "ARRAY_ZIP(array[, array ])",
    "description": "Merges all arrays into a single array. The resulting array contains corresponding elements from the source arrays,",
    "category": "Array",
    "example": "SELECT ARRAY_ZIP(['a', 'b', 'c'], [1, 2, 3]);"
  },
  {
    "name": "ASCII",
    "usage": "ASCII ( str )",
    "description": "Returns the ASCII code of the first character of a string",
    "category": "String",
    "example": "SELECT ASCII('1'),ASCII('234')"
  },
  {
    "name": "ASIN",
    "usage": "ASIN(x)",
    "description": "Returns the arc sine of x, or nan if x is not in the range -1 to 1.",
    "category": "Numeric",
    "example": "select asin(0.5);"
  },
  {
    "name": "ASINH",
    "usage": "ASINH(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT ASINH();"
  },
  {
    "name": "ASSERT_TRUE",
    "usage": "ASSERT_TRUE(...)",
    "description": "Built-in conditional function in Apache Doris.",
    "category": "Conditional",
    "example": "SELECT ASSERT_TRUE();"
  },
  {
    "name": "ATAN",
    "usage": "ATAN(x)",
    "description": "Returns the arctangent of x, where x is in radians.",
    "category": "Numeric",
    "example": "select atan(0);"
  },
  {
    "name": "ATAN2",
    "usage": "ATAN2(y, x)",
    "description": "Returns the arc tangent of 'y' / 'x'.",
    "category": "Numeric",
    "example": "select atan2(0.1, 0.2);"
  },
  {
    "name": "ATANH",
    "usage": "ATANH(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT ATANH();"
  },
  {
    "name": "AUTO_PARTITION_NAME",
    "usage": "AUTO_PARTITION_NAME('RANGE', 'VARCHAR unit', DATETIME datetime)",
    "description": "Generate datetime partition names by unit following RANGE's partition name rules",
    "category": "String",
    "example": "mysql> select auto_partition_name('range', 'years', '123');\nERROR 1105 (HY000): errCode = 2, detailMessage = range auto_partition_name must accept year|month|day|hour|minute|second for 2nd argument\nmysql> select auto_partition_name('range', 'year', '2022-12-12 19:20:30');\n+---------------------------------------------------------------+\n| auto_partition_name('range', 'year', '2022-12-12 19:20:30')   |"
  },
  {
    "name": "AVG",
    "usage": "AVG([DISTINCT] expr)",
    "description": "Calculates the average of all non-NULL values in a specified column or expression.",
    "category": "Aggregate",
    "example": "SELECT datetime, AVG(cost_time) FROM log_statis group by datetime;"
  },
  {
    "name": "AVG_WEIGHTED",
    "usage": "AVG_WEIGHTED(x, weight)",
    "description": "Calculates the weighted arithmetic mean, i.e., the result is the sum of the products of corresponding values and weights,",
    "category": "Aggregate",
    "example": "-- setup\ncreate table test_doris_avg_weighted(k1 int, k2 int) distributed by hash(k1) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into test_doris_avg_weighted values (10,100),(20,200),(30,300),(40,400);"
  },
  {
    "name": "BACKENDS",
    "usage": "BACKENDS()",
    "description": "The table function generates the backends temporary table, and you can view the BE node information in the current doris cluster.",
    "category": "Table-Valued",
    "example": "SELECT BACKENDS();"
  },
  {
    "name": "BIN",
    "usage": "BIN(a)",
    "description": "Converts decimal numbers to binary text.",
    "category": "String",
    "example": "select bin(0);"
  },
  {
    "name": "BITAND",
    "usage": "BITAND( lhs, rhs)",
    "description": "Used to perform a bitwise AND operation. The bitwise AND operation compares each bit of two integers.",
    "category": "Bitwise",
    "example": "select BITAND(3,5), BITAND(4,7);"
  },
  {
    "name": "BITMAP_AGG",
    "usage": "BITMAP_AGG(expr)",
    "description": "Aggregate the values of a column (excluding any NULL values) and return a single row bitmap value, i.e., convert multiple rows into one.",
    "category": "Aggregate",
    "example": "create table test_bitmap_agg(\n    id int,\n    k0 int,\n    k1 varchar(32),\n    k2 int,"
  },
  {
    "name": "BITMAP_AND",
    "usage": "BITMAP_AND(bitmap, bitmap,[, bitmap...])",
    "description": "Computes the intersection of two or more input BITMAPs and returns a new BITMAP.",
    "category": "Bitmap",
    "example": "select bitmap_to_string(bitmap_and(bitmap_from_string('1,2,3'), bitmap_from_string('1,2'), bitmap_from_string('1,2,3,4,5')));"
  },
  {
    "name": "BITMAP_ANDNOT",
    "usage": "BITMAP_ANDNOT(bitmap1, bitmap2)",
    "description": "Perform a NOT operation on two BITMAPs and return the result. The first input parameter is called base BITMAP and the second is called exclude BITMAP.",
    "category": "Bitmap",
    "example": "select bitmap_count(bitmap_and_not(bitmap_from_string('1,2,3'),bitmap_from_string('3,4,5'))) cnt;"
  },
  {
    "name": "BITMAP_ANDNOT_COUNT",
    "usage": "BITMAP_ANDNOT_COUNT(bitmap1, bitmap2)",
    "description": "Performs a NOT operation on two BITMAPs and returns the number of elements in the result set.",
    "category": "Bitmap",
    "example": "select bitmap_and_not_count(null, bitmap_from_string('1,2,3')) banc1, bitmap_and_not_count(bitmap_from_string('1,2,3') ,null) banc2;"
  },
  {
    "name": "BITMAP_AND_COUNT",
    "usage": "BITMAP_AND_COUNT(bitmap, bitmap,[, bitmap...])",
    "description": "Computes the intersection of two or more input BITMAPs and returns the number of intersections.",
    "category": "Bitmap",
    "example": "select bitmap_and_count(bitmap_from_string('1,2,3'),bitmap_from_string('3,4,5'));"
  },
  {
    "name": "BITMAP_AND_NOT",
    "usage": "BITMAP_AND_NOT(bitmap1, bitmap2)",
    "description": "Perform a NOT operation on two BITMAPs and return the result. The first input parameter is called base BITMAP and the second is called exclude BITMAP.",
    "category": "Bitmap",
    "example": "select bitmap_count(bitmap_and_not(bitmap_from_string('1,2,3'),bitmap_from_string('3,4,5'))) cnt;"
  },
  {
    "name": "BITMAP_AND_NOT_COUNT",
    "usage": "BITMAP_AND_NOT_COUNT(bitmap1, bitmap2)",
    "description": "Performs a NOT operation on two BITMAPs and returns the number of elements in the result set.",
    "category": "Bitmap",
    "example": "select bitmap_and_not_count(null, bitmap_from_string('1,2,3')) banc1, bitmap_and_not_count(bitmap_from_string('1,2,3') ,null) banc2;"
  },
  {
    "name": "BITMAP_CONTAINS",
    "usage": "BITMAP_CONTAINS(bitmap, bigint)",
    "description": "Calculates whether the input value is in the BITMAP and returns a boolean value.",
    "category": "Bitmap",
    "example": "select bitmap_contains(to_bitmap(1),2) cnt1, bitmap_contains(to_bitmap(1),1) cnt2;"
  },
  {
    "name": "BITMAP_COUNT",
    "usage": "BITMAP_COUNT(bitmap)",
    "description": "Count the number of elements in the input BITMAP",
    "category": "Bitmap",
    "example": "select bitmap_count(to_bitmap(1)) cnt;"
  },
  {
    "name": "BITMAP_EMPTY",
    "usage": "BITMAP_EMPTY()",
    "description": "Construct an empty BITMAP. Mainly used to fill default values during insert or stream load. For example:",
    "category": "Bitmap",
    "example": "select bitmap_to_string(bitmap_empty());"
  },
  {
    "name": "BITMAP_FROM_ARRAY",
    "usage": "BITMAP_FROM_ARRAY(arr)",
    "description": "Converts an array of TINYINT/SMALLINT/INT/BIGINT type to a BITMAP. When the input field is illegal, the result returns NULL.",
    "category": "Bitmap",
    "example": "SELECT bitmap_to_string(bitmap_from_array(array(1, 0, 1, 1, 0, 1, 0))) AS bs;"
  },
  {
    "name": "BITMAP_FROM_BASE64",
    "usage": "BITMAP_FROM_BASE64(base64_str)",
    "description": "Convert a base64 string (which can be converted by bitmaptobase64 function) to a BITMAP. Returns NULL when the input string is invalid.",
    "category": "Bitmap",
    "example": "select bitmap_to_string(bitmap_from_base64(\"AA==\")) bts;"
  },
  {
    "name": "BITMAP_FROM_STRING",
    "usage": "BITMAP_FROM_STRING(str)",
    "description": "Convert a string into a BITMAP. The string consists of a group of unsigned bigint numbers separated by commas.",
    "category": "Bitmap",
    "example": "select bitmap_to_string(bitmap_from_string(\"0, 1, 2\")) bts;"
  },
  {
    "name": "BITMAP_HASH",
    "usage": "BITMAP_HASH(expr)",
    "description": "Computes the 32-bit hash value of any input type and returns a Bitmap containing that hash value.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_HASH();"
  },
  {
    "name": "BITMAP_HASH64",
    "usage": "BITMAP_HASH64(expr)",
    "description": "Computes the 64-bit hash value of any input type and returns a Bitmap containing that hash value.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_HASH64();"
  },
  {
    "name": "BITMAP_HAS_ALL",
    "usage": "BITMAP_HAS_ALL(bitmap1, bitmap2)",
    "description": "Determines whether one Bitmap contains all the elements of another Bitmap.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_HAS_ALL();"
  },
  {
    "name": "BITMAP_HAS_ANY",
    "usage": "BITMAP_HAS_ANY(bitmap1, bitmap2)",
    "description": "Determines whether two Bitmaps share any common elements.",
    "category": "Bitmap",
    "example": "mysql> select bitmap_has_any(to_bitmap(1), to_bitmap(2));"
  },
  {
    "name": "BITMAP_INTERSECT",
    "usage": "BITMAP_INTERSECT(BITMAP value)",
    "description": "Aggregation function, used to calculate the bitmap intersection after grouping. Common usage scenarios such as: calculating user retention rate.",
    "category": "Aggregate",
    "example": "-- setup\nCREATE TABLE user_tags (\n\ttag VARCHAR(20),\n\tdate DATETIME,\n\tuser_id BITMAP bitmap_union"
  },
  {
    "name": "BITMAP_MAX",
    "usage": "BITMAP_MAX(bitmap)",
    "description": "Computes and returns the maximum value in a Bitmap.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_MAX();"
  },
  {
    "name": "BITMAP_MIN",
    "usage": "BITMAP_MIN(bitmap)",
    "description": "Computes and returns the minimum value in a Bitmap.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_MIN();"
  },
  {
    "name": "BITMAP_NOT",
    "usage": "BITMAP_NOT(bitmap1, bitmap2)",
    "description": "Computes the difference between the first Bitmap and the second Bitmap, and returns the result as a new Bitmap.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_NOT();"
  },
  {
    "name": "BITMAP_OR",
    "usage": "BITMAP_OR(bitmap1, bitmap2, ..., bitmapN)",
    "description": "Computes the union of two or more Bitmaps and returns a new Bitmap.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_OR();"
  },
  {
    "name": "BITMAP_OR_COUNT",
    "usage": "BITMAP_OR_COUNT(bitmap1, bitmap2, ..., bitmapN)",
    "description": "Computes the union of two or more input Bitmaps and returns the count of elements in the union.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_OR_COUNT();"
  },
  {
    "name": "BITMAP_REMOVE",
    "usage": "BITMAP_REMOVE(bitmap, value)",
    "description": "Removes a specified value from a Bitmap column.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_REMOVE();"
  },
  {
    "name": "BITMAP_SUBSET_IN_RANGE",
    "usage": "BITMAP_SUBSET_IN_RANGE(bitmap, range_start_include, range_end_exclude)",
    "description": "Returns a subset of the Bitmap within the specified range (excluding the range end).",
    "category": "Bitmap",
    "example": "SELECT BITMAP_SUBSET_IN_RANGE();"
  },
  {
    "name": "BITMAP_SUBSET_LIMIT",
    "usage": "BITMAP_SUBSET_LIMIT(bitmap, position, cardinality_limit)",
    "description": "Extracts a subset of Bitmap elements starting from a specified position, with a limit on the number of elements specified by the cardinality limit,",
    "category": "Bitmap",
    "example": "SELECT BITMAP_SUBSET_LIMIT();"
  },
  {
    "name": "BITMAP_TO_ARRAY",
    "usage": "BITMAP_TO_ARRAY(bitmap)",
    "description": "Converts a Bitmap into an Array.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_TO_ARRAY();"
  },
  {
    "name": "BITMAP_TO_BASE64",
    "usage": "BITMAP_TO_BASE64(bitmap)",
    "description": "Converts a Bitmap into a Base64 encoded string.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_TO_BASE64();"
  },
  {
    "name": "BITMAP_TO_STRING",
    "usage": "BITMAP_TO_STRING(bitmap)",
    "description": "Converts a Bitmap into a comma-separated string containing all the set bit positions.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_TO_STRING();"
  },
  {
    "name": "BITMAP_UNION",
    "usage": "BITMAP_UNION(expr)",
    "description": "Calculate the union of input Bitmaps and return a new bitmap",
    "category": "Aggregate",
    "example": "-- setup\nCREATE TABLE pv_bitmap (\n  dt INT,\n  page VARCHAR(10),\n  user_id BITMAP BITMAP_UNION"
  },
  {
    "name": "BITMAP_UNION_COUNT",
    "usage": "BITMAP_UNION_COUNT(expr)",
    "description": "Computes the union of input Bitmaps and returns their cardinality.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table pv_bitmap(dt int, page int, user_id bitmap bitmap_union) aggregate key(dt,page) distributed by hash(dt) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into pv_bitmap values (1,100,bitmap_from_string('100,200,300')),(2,200,bitmap_from_string('300'));"
  },
  {
    "name": "BITMAP_UNION_INT",
    "usage": "BITMAP_UNION_INT(expr)",
    "description": "Counts the number of distinct values in columns of type TINYINT, SMALLINT and INT. The return value is the same as COUNT(DISTINCT expr)",
    "category": "Aggregate",
    "example": "-- setup\ncreate table pv_bitmap(dt int, page int, user_id bitmap bitmap_union) aggregate key(dt,page) distributed by hash(dt) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into pv_bitmap values (1,100,bitmap_from_string('100,200,300')),(1,300,bitmap_from_string('300')),(2,200,bitmap_from_string('300'));"
  },
  {
    "name": "BITMAP_XOR",
    "usage": "BITMAP_XOR(bitmap1, bitmap2, ..., bitmapN)",
    "description": "Computes the symmetric difference (XOR operation) of two or more input Bitmaps and returns a new Bitmap.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_XOR();"
  },
  {
    "name": "BITMAP_XOR_COUNT",
    "usage": "BITMAP_XOR_COUNT(bitmap1, bitmap2, ..., bitmapN)",
    "description": "Computes the symmetric difference (XOR operation) of two or more Bitmap sets and returns the count of elements in the result set.",
    "category": "Bitmap",
    "example": "SELECT BITMAP_XOR_COUNT();"
  },
  {
    "name": "BITNOT",
    "usage": "BITNOT( x)",
    "description": "Used to perform a bitwise inversion operation on an integer.",
    "category": "Bitwise",
    "example": "select BITNOT(7), BITNOT(-127);"
  },
  {
    "name": "BITOR",
    "usage": "BITOR( lhs, rhs)",
    "description": "Used to perform a bitwise OR operation on two integers.",
    "category": "Bitwise",
    "example": "select BITOR(3,5), BITOR(4,7);"
  },
  {
    "name": "BIT_COUNT",
    "usage": "BIT_COUNT( x)",
    "description": "Used to return the number of 1 bits in the binary representation of an integer value.",
    "category": "Bitwise",
    "example": "select BIT_COUNT(8), BIT_COUNT(-1);"
  },
  {
    "name": "BIT_LENGTH",
    "usage": "BIT_LENGTH( str)",
    "description": "It is used to return the median of the binary representation of a string (that is, the total number of binary digits).",
    "category": "Bitwise",
    "example": "select BIT_LENGTH(\"abc\"), BIT_LENGTH(\"\u4e2d\u56fd\"), BIT_LENGTH(123);"
  },
  {
    "name": "BIT_SHIFT_LEFT",
    "usage": "BIT_SHIFT_LEFT( x, bits)",
    "description": "Functions for left shift operations are usually used to perform bit shift operations,",
    "category": "Bitwise",
    "example": "select BIT_SHIFT_LEFT(5, 2), BIT_SHIFT_LEFT(-5, 2), BIT_SHIFT_LEFT(9223372036854775807, 1);"
  },
  {
    "name": "BIT_SHIFT_RIGHT",
    "usage": "BIT_SHIFT_RIGHT( x, bits)",
    "description": "Used for right shift operations, usually used to shift all bits of a binary number to the right by a specified number of bits.",
    "category": "Bitwise",
    "example": "select BIT_SHIFT_RIGHT(1024,3), BIT_SHIFT_RIGHT(-1,1), BIT_SHIFT_RIGHT(100, -1);"
  },
  {
    "name": "BIT_TEST",
    "usage": "BIT_TEST(...)",
    "description": "Built-in bitwise function in Apache Doris.",
    "category": "Bitwise",
    "example": "SELECT BIT_TEST();"
  },
  {
    "name": "BIT_TEST_ALL",
    "usage": "BIT_TEST_ALL(...)",
    "description": "Built-in bitwise function in Apache Doris.",
    "category": "Bitwise",
    "example": "SELECT BIT_TEST_ALL();"
  },
  {
    "name": "BOOLAND_AGG",
    "usage": "BOOLAND_AGG(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT BOOLAND_AGG();"
  },
  {
    "name": "BOOLOR_AGG",
    "usage": "BOOLOR_AGG(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT BOOLOR_AGG();"
  },
  {
    "name": "BOOLXOR_AGG",
    "usage": "BOOLXOR_AGG(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT BOOLXOR_AGG();"
  },
  {
    "name": "BOOL_AND",
    "usage": "BOOL_AND(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT BOOL_AND();"
  },
  {
    "name": "BOOL_OR",
    "usage": "BOOL_OR(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT BOOL_OR();"
  },
  {
    "name": "BOOL_XOR",
    "usage": "BOOL_XOR(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT BOOL_XOR();"
  },
  {
    "name": "CARDINALITY",
    "usage": "CARDINALITY(...)",
    "description": "Built-in array function in Apache Doris.",
    "category": "Array",
    "example": "SELECT CARDINALITY();"
  },
  {
    "name": "CATALOGS",
    "usage": "CATALOGS()",
    "description": "The CATALOGS() function generates a temporary catalogs table,",
    "category": "Table-Valued",
    "example": "SELECT CATALOGS();"
  },
  {
    "name": "CBRT",
    "usage": "CBRT(a)",
    "description": "Calculate the cube root of the parameter",
    "category": "Numeric",
    "example": "select cbrt(0);"
  },
  {
    "name": "CDC_STREAM",
    "usage": "CDC_STREAM(...)",
    "description": "Built-in table-valued function in Apache Doris.",
    "category": "Table-Valued",
    "example": "SELECT CDC_STREAM();"
  },
  {
    "name": "CEIL",
    "usage": "CEIL(a[, d])",
    "description": "Round up floating-point and fixed-point decimals to a specific number of places and return the rounded floating-point or fixed-point number.",
    "category": "Numeric",
    "example": "select ceil(123.456);"
  },
  {
    "name": "CEILING",
    "usage": "CEILING(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT CEILING();"
  },
  {
    "name": "CENTURY",
    "usage": "CENTURY(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT CENTURY();"
  },
  {
    "name": "CHAR",
    "usage": "CHAR ( expr [ , expr ... ] [ USING charset_name ] )",
    "description": "Interpret each argument as an integer and return a string consisting of the characters given by the code values \u200b\u200bof those integers. Special cases:",
    "category": "String",
    "example": "SELECT CHAR(68, 111, 114, 105, 115),CHAR(15049882, 15179199, 14989469),CHAR(255)"
  },
  {
    "name": "CHARACTER_LENGTH",
    "usage": "CHARACTER_LENGTH(...)",
    "description": "Built-in string function in Apache Doris.",
    "category": "String",
    "example": "SELECT CHARACTER_LENGTH();"
  },
  {
    "name": "CHAR_LENGTH",
    "usage": "CHAR_LENGTH ( str )",
    "description": "Calculates the length of a string. For multi-byte characters, returns the number of characters.",
    "category": "String",
    "example": "select CHAR_LENGTH(\"abc\"),CHAR_LENGTH(\"\u4e2d\u56fd\")"
  },
  {
    "name": "COALESCE",
    "usage": "COALESCE(expr [, ...])",
    "description": "Returns the first non-null expression from left to right in the parameter list. If all arguments are NULL, returns NULL.",
    "category": "Conditional",
    "example": "SELECT COALESCE(NULL, '1111', '0000');"
  },
  {
    "name": "COLLECT_LIST",
    "usage": "COLLECT_LIST(expr [,max_size])",
    "description": "Aggregation function, used to aggregate all values of a column into an array.",
    "category": "Aggregate",
    "example": "select k1,k2,k3 from collect_list_test order by k1;"
  },
  {
    "name": "COLLECT_SET",
    "usage": "COLLECT_SET(expr [,max_size])",
    "description": "Aggregation function aggregates all unique values of the specified column, removes duplicate elements, and returns a set type result.",
    "category": "Aggregate",
    "example": "select k1,k2,k3 from collect_set_test order by k1;"
  },
  {
    "name": "COMPRESS",
    "usage": "COMPRESS(...)",
    "description": "Built-in encryption & hash function in Apache Doris.",
    "category": "Encryption & Hash",
    "example": "SELECT COMPRESS();"
  },
  {
    "name": "CONCAT",
    "usage": "CONCAT ( expr [ , expr ... ] )",
    "description": "Concatenates multiple strings. Special cases:",
    "category": "String",
    "example": "SELECT  CONCAT(\"a\", \"b\"),CONCAT(\"a\", \"b\", \"c\"),CONCAT(\"a\", null, \"c\")"
  },
  {
    "name": "CONCAT_WS",
    "usage": "CONCAT_WS ( sep , str [ , str ] )",
    "description": "Use the first parameter sep as the connector to concatenate the second parameter and all subsequent parameters (or all strings in one ARRAY or multi",
    "category": "String",
    "example": "SELECT CONCAT_WS();"
  },
  {
    "name": "CONNECTION_ID",
    "usage": "CONNECTION_ID()",
    "description": "Get the connection number of the current sql client.",
    "category": "System",
    "example": "select connection_id();"
  },
  {
    "name": "CONV",
    "usage": "CONV(input, from_base, to_base)",
    "description": "Do radix conversion for input parameter.",
    "category": "Numeric",
    "example": "SELECT CONV(15,10,2);"
  },
  {
    "name": "CONVERT_TO",
    "usage": "CONVERT_TO(column, character)",
    "description": "Converts the character encoding of a column to a specified target character set.",
    "category": "General",
    "example": "SELECT CONVERT_TO();"
  },
  {
    "name": "CONVERT_TZ",
    "usage": "CONVERT_TZ(dt, from_tz, to_tz)",
    "description": "Converts a datetime value from the time zone specified by fromtz to the time zone specified by totz, and returns the resulting value. Special cases:",
    "category": "Date & Time",
    "example": "select CONVERT_TZ('2019-08-01 13:21:03', 'Asia/Shanghai', 'America/Los_Angeles');"
  },
  {
    "name": "CORR",
    "usage": "CORR(expr1, expr2)",
    "description": "Calculate the Pearson coefficient of two random variables.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table test_corr(\n    id int,\n    k1 double,\n    k2 double"
  },
  {
    "name": "CORR_WELFORD",
    "usage": "CORR_WELFORD(expr1, expr2)",
    "description": "Calculate the Pearson coefficient of two random variables using the Welford algorithm, which can effectively reduce calculation errors.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table test_corr(\n    id int,\n    k1 double,\n    k2 double"
  },
  {
    "name": "COS",
    "usage": "COS(a)",
    "description": "Calculate the cosine of the parameter",
    "category": "Numeric",
    "example": "select cos(1);"
  },
  {
    "name": "COSH",
    "usage": "COSH(x)",
    "description": "Returns the hyperbolic cosine of x.",
    "category": "Numeric",
    "example": "select cosh(0);"
  },
  {
    "name": "COSINE_DISTANCE",
    "usage": "COSINE_DISTANCE(vector1, vector2)",
    "description": "Calculates the cosine distance (1 - cosine similarity) between two floating-point vectors for similarity search.",
    "category": "Distance",
    "example": "SELECT id, COSINE_DISTANCE(embedding, [0.1, 0.2, 0.3]) AS dist FROM vector_items ORDER BY dist ASC LIMIT 10;"
  },
  {
    "name": "COSINE_SIMILARITY",
    "usage": "COSINE_SIMILARITY(...)",
    "description": "Built-in distance function in Apache Doris.",
    "category": "Distance",
    "example": "SELECT COSINE_SIMILARITY();"
  },
  {
    "name": "COT",
    "usage": "COT(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT COT();"
  },
  {
    "name": "COUNT",
    "usage": "COUNT(DISTINCT expr [,expr,...])",
    "description": "Returns the number of non-NULL records in the specified column, or the total number of records.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table test_count(\n    id int,\n    name varchar(20),\n    sex int"
  },
  {
    "name": "COUNTEQUAL",
    "usage": "COUNTEQUAL(arr, value)",
    "description": "Determine the number of value elements in the array",
    "category": "Array",
    "example": "SELECT COUNTEQUAL(NULL,1),COUNTEQUAL([1, 2, 3, 'c'],2),COUNTEQUAL([],'b');"
  },
  {
    "name": "COUNT_BY_ENUM",
    "usage": "COUNT_BY_ENUM(expr1, expr2, ... , exprN)",
    "description": "Treat the data in the column as enumeration values and count the number of each enumeration value.",
    "category": "Aggregate",
    "example": "CREATE TABLE count_by_enum_test(\n                                   `id` varchar(1024) NULL,\n                                   `f1` text REPLACE_IF_NOT_NULL NULL,\n                                   `f2` text REPLACE_IF_NOT_NULL NULL,\n                                   `f3` text REPLACE_IF_NOT_NULL NULL"
  },
  {
    "name": "COUNT_SUBSTRINGS",
    "usage": "COUNT_SUBSTRINGS(str, pattern)",
    "description": "The COUNTSUBSTRINGS function counts the number of occurrences of a specified substring within a string.",
    "category": "String",
    "example": "SELECT COUNT_SUBSTRINGS();"
  },
  {
    "name": "COVAR",
    "usage": "COVAR(expr1, expr2)",
    "description": "Calculate the covariance between two numeric variables.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table baseall(\n    id int,\n    x double,\n    y double"
  },
  {
    "name": "COVAR_POP",
    "usage": "COVAR_POP(expr1, expr2)",
    "description": "Calculate the covariance between two numeric variables.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table baseall(\n    id int,\n    x double,\n    y double"
  },
  {
    "name": "COVAR_SAMP",
    "usage": "COVAR_SAMP(expr1, expr2)",
    "description": "Computes the sample covariance between two numeric variables.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table baseall(\n    id int,\n    x double,\n    y double"
  },
  {
    "name": "CRC32",
    "usage": "CRC32( str )",
    "description": "Use CRC32 to compute the result.",
    "category": "Encryption & Hash",
    "example": "select crc32(\"abc\"),crc32(\"\u4e2d\u56fd\");"
  },
  {
    "name": "CRC32_INTERNAL",
    "usage": "CRC32_INTERNAL(...)",
    "description": "Built-in encryption & hash function in Apache Doris.",
    "category": "Encryption & Hash",
    "example": "SELECT CRC32_INTERNAL();"
  },
  {
    "name": "CROSS_PRODUCT",
    "usage": "CROSS_PRODUCT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT CROSS_PRODUCT();"
  },
  {
    "name": "CSC",
    "usage": "CSC(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT CSC();"
  },
  {
    "name": "CUME_DIST",
    "usage": "CUME_DIST()",
    "description": "CUMEDIST (Cumulative Distribution) is a window function that calculates the relative ranking of the current row value in the sorted result set.",
    "category": "Window",
    "example": "SELECT CUME_DIST();"
  },
  {
    "name": "CURDATE",
    "usage": "CURDATE()",
    "description": "Retrieves the current date and returns it as a DATE type.",
    "category": "Date & Time",
    "example": "SELECT CURDATE();"
  },
  {
    "name": "CURRENT_CATALOG",
    "usage": "CURRENT_CATALOG()",
    "description": "Get the catalog of the current sql client connection.",
    "category": "System",
    "example": "select current_catalog();"
  },
  {
    "name": "CURRENT_DATABASE",
    "usage": "CURRENT_DATABASE(...)",
    "description": "Built-in system function in Apache Doris.",
    "category": "System",
    "example": "SELECT CURRENT_DATABASE();"
  },
  {
    "name": "CURRENT_DATE",
    "usage": "CURRENT_DATE()",
    "description": "Retrieves the current date and returns it as a DATE type.",
    "category": "Date & Time",
    "example": "SELECT CURDATE();"
  },
  {
    "name": "CURRENT_TIME",
    "usage": "CURRENT_TIME()",
    "description": "Retrieves the current time and returns it as a TIME type.",
    "category": "Date & Time",
    "example": "mysql> select current_time();"
  },
  {
    "name": "CURRENT_TIMESTAMP",
    "usage": "CURRENT_TIMESTAMP(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT CURRENT_TIMESTAMP();"
  },
  {
    "name": "CURRENT_USER",
    "usage": "CURRENT_USER()",
    "description": "Get the current username and its IP rule whitelist.",
    "category": "System",
    "example": "SELECT CURRENT_USER();"
  },
  {
    "name": "CURTIME",
    "usage": "CURTIME()",
    "description": "Retrieves the current time and returns it as a TIME type.",
    "category": "Date & Time",
    "example": "mysql> select current_time();"
  },
  {
    "name": "CUT_IPV6",
    "usage": "CUT_IPV6(ipv6, cut_ipv6_bytes, cut_ipv4_bytes)",
    "description": "Accept an IPv6 type address and return a string containing the address of the specified number of bytes removed in text format.",
    "category": "IP",
    "example": "select cut_ipv6(to_ipv6('2001:0DB8:AC10:FE01:FEED:BABE:CAFE:F00D'), 10, 0);"
  },
  {
    "name": "CUT_TO_FIRST_SIGNIFICANT_SUBDOMAIN",
    "usage": "CUT_TO_FIRST_SIGNIFICANT_SUBDOMAIN(url)",
    "description": "The CUTTOFIRSTSIGNIFICANTSUBDOMAIN function extracts the effective part of a domain from a URL,",
    "category": "String",
    "example": "SELECT CUT_TO_FIRST_SIGNIFICANT_SUBDOMAIN();"
  },
  {
    "name": "DATABASE",
    "usage": "DATABASE()",
    "description": "Get the database of the current sql client connection.",
    "category": "System",
    "example": "select database(),schema();"
  },
  {
    "name": "DATASKETCHES_HLL_ESTIMATE",
    "usage": "DATASKETCHES_HLL_ESTIMATE(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT DATASKETCHES_HLL_ESTIMATE();"
  },
  {
    "name": "DATASKETCHES_HLL_UNION_AGG",
    "usage": "DATASKETCHES_HLL_UNION_AGG(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT DATASKETCHES_HLL_UNION_AGG();"
  },
  {
    "name": "DATE",
    "usage": "DATE(datetime)",
    "description": "Extracts the date from the datetime.",
    "category": "Date & Time",
    "example": "select date('2010-12-02 19:28:30');"
  },
  {
    "name": "DATEDIFF",
    "usage": "DATEDIFF(expr1, expr2)",
    "description": "Calculates the difference between two given dates.",
    "category": "Date & Time",
    "example": "select datediff(CAST('2007-12-31 23:59:59' AS DATETIME), CAST('2007-12-30' AS DATETIME));"
  },
  {
    "name": "DATEV2",
    "usage": "DATEV2(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DATEV2();"
  },
  {
    "name": "DATE_ADD",
    "usage": "DATE_ADD(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DATE_ADD();"
  },
  {
    "name": "DATE_CEIL",
    "usage": "DATE_CEIL(datetime, INTERVAL period type)",
    "description": "dateceil rounds a given date to the next upper boundary of the specified time interval.",
    "category": "Date & Time",
    "example": "select date_ceil(\"2023-07-13 22:28:18\",interval 5 second);"
  },
  {
    "name": "DATE_FLOOR",
    "usage": "DATE_FLOOR(datetime, INTERVAL period type)",
    "description": "datefloor rounds a given date to the closest lower boundary of the specified time interval.",
    "category": "Date & Time",
    "example": "select date_floor(\"0001-01-01 00:00:16\",interval 5 second);"
  },
  {
    "name": "DATE_FORMAT",
    "usage": "DATE_FORMAT(date, format)",
    "description": "Convert the date type to a bit string according to the format type.",
    "category": "Date & Time",
    "example": "select date_format('2009-10-04 22:23:00', '%W %M %Y');"
  },
  {
    "name": "DATE_SUB",
    "usage": "DATE_SUB(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DATE_SUB();"
  },
  {
    "name": "DATE_TRUNC",
    "usage": "DATE_TRUNC(datetime, time_unit)",
    "description": "Truncates the datetime according to the specified time unit.",
    "category": "Date & Time",
    "example": "select date_trunc('2010-12-02 19:28:30', 'second');"
  },
  {
    "name": "DAY",
    "usage": "DAY(dt)",
    "description": "Obtain the day information from the date, with return values ranging from 1 to 31.",
    "category": "Date & Time",
    "example": "select day('1987-01-31');"
  },
  {
    "name": "DAYNAME",
    "usage": "DAYNAME(dt)",
    "description": "Calculates the name of the day corresponding to the given date expression.",
    "category": "Date & Time",
    "example": "select dayname('2007-02-03 00:00:00');"
  },
  {
    "name": "DAYOFMONTH",
    "usage": "DAYOFMONTH(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DAYOFMONTH();"
  },
  {
    "name": "DAYOFWEEK",
    "usage": "DAYOFWEEK(dt)",
    "description": "Returns the weekday index of the date, where Sunday is 1, Monday is 2, and Saturday is 7.",
    "category": "Date & Time",
    "example": "select dayofweek('2019-06-25');"
  },
  {
    "name": "DAYOFYEAR",
    "usage": "DAYOFYEAR(dt)",
    "description": "Obtains the corresponding day of the year for the given date.",
    "category": "Date & Time",
    "example": "select dayofyear('2007-02-03 00:00:00');"
  },
  {
    "name": "DAYS_ADD",
    "usage": "DAYS_ADD(date, expr time_unit)",
    "description": "Add a specified time interval to the date.",
    "category": "Date & Time",
    "example": "select date_add('2010-11-30 23:59:59', INTERVAL 2 DAY);"
  },
  {
    "name": "DAYS_DIFF",
    "usage": "DAYS_DIFF(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DAYS_DIFF();"
  },
  {
    "name": "DAYS_SUB",
    "usage": "DAYS_SUB(date, expr time_unit)",
    "description": "Subtracts a specified time interval to the date.",
    "category": "Date & Time",
    "example": "select date_sub('2010-11-30 23:59:59', INTERVAL 2 DAY);"
  },
  {
    "name": "DAY_CEIL",
    "usage": "DAY_CEIL(datetime)",
    "description": "Rounds the date up to the nearest specified time interval period.",
    "category": "Date & Time",
    "example": "select day_ceil(\"2023-07-13 22:28:18\", 5);"
  },
  {
    "name": "DAY_FLOOR",
    "usage": "DAY_FLOOR(datetime)",
    "description": "Rounds the date down to the nearest timestamp of the specified time interval period.",
    "category": "Date & Time",
    "example": "select day_floor(\"2023-07-13 22:28:18\", 5);"
  },
  {
    "name": "DAY_HOUR",
    "usage": "DAY_HOUR(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DAY_HOUR();"
  },
  {
    "name": "DAY_MICROSECOND",
    "usage": "DAY_MICROSECOND(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DAY_MICROSECOND();"
  },
  {
    "name": "DAY_MINUTE",
    "usage": "DAY_MINUTE(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DAY_MINUTE();"
  },
  {
    "name": "DAY_SECOND",
    "usage": "DAY_SECOND(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DAY_SECOND();"
  },
  {
    "name": "DCEIL",
    "usage": "DCEIL(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT DCEIL();"
  },
  {
    "name": "DECODE_AS_VARCHAR",
    "usage": "DECODE_AS_VARCHAR(...)",
    "description": "Built-in string function in Apache Doris.",
    "category": "String",
    "example": "SELECT DECODE_AS_VARCHAR();"
  },
  {
    "name": "DEDUPLICATE_MAP",
    "usage": "DEDUPLICATE_MAP(...)",
    "description": "Built-in map function in Apache Doris.",
    "category": "Map",
    "example": "SELECT DEDUPLICATE_MAP();"
  },
  {
    "name": "DEGREES",
    "usage": "DEGREES(a)",
    "description": "Input a double-precision floating-point number and convert it from radians to degrees.",
    "category": "Numeric",
    "example": "select degrees(3.14),degrees(1),degrees(-1),degrees(NULL)"
  },
  {
    "name": "DENSE_RANK",
    "usage": "DENSE_RANK()",
    "description": "DENSERANK() is a window function used to calculate rankings within a group. Unlike RANK(), DENSERANK() returns consecutive rankings without gaps.",
    "category": "Window",
    "example": "SELECT DENSE_RANK();"
  },
  {
    "name": "DESCRIPTION",
    "usage": "DESCRIPTION( str )",
    "description": "Use UTF-8 encoding to complete the URL encoding of the provided text. Typically used to encode parameter information passed as part of a URL",
    "category": "String",
    "example": "select  URL_ENCODE('Doris Q&A');"
  },
  {
    "name": "DEXP",
    "usage": "DEXP(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT DEXP();"
  },
  {
    "name": "DFLOOR",
    "usage": "DFLOOR(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT DFLOOR();"
  },
  {
    "name": "DICT_GET",
    "usage": "DICT_GET(...)",
    "description": "Built-in map function in Apache Doris.",
    "category": "Map",
    "example": "SELECT DICT_GET();"
  },
  {
    "name": "DICT_GET_MANY",
    "usage": "DICT_GET_MANY(...)",
    "description": "Built-in map function in Apache Doris.",
    "category": "Map",
    "example": "SELECT DICT_GET_MANY();"
  },
  {
    "name": "DIGITAL_MASKING",
    "usage": "DIGITAL_MASKING( digital_number )",
    "description": "The digitalmasking function is used for masking numbers. Based on the specified masking rule, certain characters in the number are replaced with .",
    "category": "String",
    "example": "select digital_masking(13812345678);"
  },
  {
    "name": "DLOG1",
    "usage": "DLOG1(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT DLOG1();"
  },
  {
    "name": "DLOG10",
    "usage": "DLOG10(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT DLOG10();"
  },
  {
    "name": "DOMAIN",
    "usage": "DOMAIN ( url )",
    "description": "Extract the domain name from the string URL",
    "category": "String",
    "example": "SELECT DOMAIN(\"https://doris.apache.org/docs/gettingStarted/what-is-apache-doris\")"
  },
  {
    "name": "DOMAIN_WITHOUT_WWW",
    "usage": "DOMAIN_WITHOUT_WWW ( url )",
    "description": "Extract the domain name without the prefix www in the string URL",
    "category": "String",
    "example": "SELECT DOMAIN_WITHOUT_WWW();"
  },
  {
    "name": "DOW",
    "usage": "DOW(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DOW();"
  },
  {
    "name": "DOY",
    "usage": "DOY(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT DOY();"
  },
  {
    "name": "DPOW",
    "usage": "DPOW(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT DPOW();"
  },
  {
    "name": "DROUND",
    "usage": "DROUND(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT DROUND();"
  },
  {
    "name": "DSQRT",
    "usage": "DSQRT(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT DSQRT();"
  },
  {
    "name": "DS_HLL_ESTIMATE",
    "usage": "DS_HLL_ESTIMATE(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT DS_HLL_ESTIMATE();"
  },
  {
    "name": "E",
    "usage": "E()",
    "description": "Returns the constant e value.",
    "category": "Numeric",
    "example": "mysql> select e();\n+--------------------+\n| e()                |\n+--------------------+\n| 2.718281828459045  |"
  },
  {
    "name": "ELEMENT_AT",
    "usage": "ELEMENT_AT(...)",
    "description": "Built-in array function in Apache Doris.",
    "category": "Array",
    "example": "SELECT ELEMENT_AT();"
  },
  {
    "name": "ELT",
    "usage": "ELT ( pos , str [ , str ] )",
    "description": "Returns a string at the specified index. Special cases:",
    "category": "String",
    "example": "SELECT ELT(1, 'aaa', 'bbb'),ELT(2, 'aaa', 'bbb'), ELT(0, 'aaa', 'bbb'),ELT(2, 'aaa', 'bbb')"
  },
  {
    "name": "EMBED",
    "usage": "EMBED(resource_name, text)",
    "description": "Generates a dense vector embedding array for the given input text using the configured AI embedding model.",
    "category": "AI",
    "example": "SELECT id, EMBED('ollama_bge', document_text) AS vector_emb FROM doc_store;"
  },
  {
    "name": "ENCODE_AS_BIGINT",
    "usage": "ENCODE_AS_BIGINT(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT ENCODE_AS_BIGINT();"
  },
  {
    "name": "ENCODE_AS_INT",
    "usage": "ENCODE_AS_INT(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT ENCODE_AS_INT();"
  },
  {
    "name": "ENCODE_AS_LARGEINT",
    "usage": "ENCODE_AS_LARGEINT(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT ENCODE_AS_LARGEINT();"
  },
  {
    "name": "ENCODE_AS_SMALLINT",
    "usage": "ENCODE_AS_SMALLINT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT ENCODE_AS_SMALLINT();"
  },
  {
    "name": "ENDS_WITH",
    "usage": "ENDS_WITH ( str , suffix )",
    "description": "Returns true if the string ends with the specified suffix, otherwise returns false. Special cases:",
    "category": "String",
    "example": "SELECT ENDS_WITH(\"Hello doris\", \"doris\"),ENDS_WITH(\"Hello doris\", \"Hello\")"
  },
  {
    "name": "ESQUERY",
    "usage": "ESQUERY(field, query_dsl)",
    "description": "Use the ESQUERY(field, querydsl) function to push down queries that cannot be expressed in SQL to Elasticsearch for filtering.",
    "category": "General",
    "example": "-- match_phrase SQL:\nSELECT * FROM es_table \nWHERE ESQUERY(k4, '{\n    \"match_phrase\": {\n       \"k4\": \"doris on es\""
  },
  {
    "name": "EVEN",
    "usage": "EVEN(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT EVEN();"
  },
  {
    "name": "EXP",
    "usage": "EXP(x)",
    "description": "Returns x raised to the base e.",
    "category": "Numeric",
    "example": "select exp(2);"
  },
  {
    "name": "EXPLODE",
    "usage": "EXPLODE(array)",
    "description": "The explode function takes an array as input and maps each element of the array to a separate row.",
    "category": "Table Generating",
    "example": "select e1 from (select 1 k1) as t lateral view explode([1,2,3]) tmp1 as e1;"
  },
  {
    "name": "EXPLODE_BITMAP",
    "usage": "EXPLODE_BITMAP(bitmap)",
    "description": "The explodebitmap table function accepts a bitmap type data and maps each bit (bit) of the bitmap to a separate row.",
    "category": "Table Generating",
    "example": "CREATE TABLE example1 (\n    k1 INT\n)DUPLICATE KEY(k1)\nDISTRIBUTED BY HASH(k1) BUCKETS AUTO\nPROPERTIES ("
  },
  {
    "name": "EXPLODE_BITMAP_OUTER",
    "usage": "EXPLODE_BITMAP_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_BITMAP_OUTER();"
  },
  {
    "name": "EXPLODE_JSON_ARRAY_DOUBLE",
    "usage": "EXPLODE_JSON_ARRAY_DOUBLE(json)",
    "description": "The explodejsonarraydouble table function accepts a JSON array, where each element is of double-precision floating-point type,",
    "category": "Table Generating",
    "example": "CREATE TABLE json_array_example (\n    id INT,\n    json_array STRING\n)DUPLICATE KEY(id)\nDISTRIBUTED BY HASH(id) BUCKETS AUTO"
  },
  {
    "name": "EXPLODE_JSON_ARRAY_DOUBLE_OUTER",
    "usage": "EXPLODE_JSON_ARRAY_DOUBLE_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_JSON_ARRAY_DOUBLE_OUTER();"
  },
  {
    "name": "EXPLODE_JSON_ARRAY_INT",
    "usage": "EXPLODE_JSON_ARRAY_INT(json)",
    "description": "The explodejsonarrayint table function accepts a JSON array, where each element is of integer type,",
    "category": "Table Generating",
    "example": "CREATE TABLE json_array_example (\n    id INT,\n    json_array STRING\n)DUPLICATE KEY(id)\nDISTRIBUTED BY HASH(id) BUCKETS AUTO"
  },
  {
    "name": "EXPLODE_JSON_ARRAY_INT_OUTER",
    "usage": "EXPLODE_JSON_ARRAY_INT_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_JSON_ARRAY_INT_OUTER();"
  },
  {
    "name": "EXPLODE_JSON_ARRAY_JSON",
    "usage": "EXPLODE_JSON_ARRAY_JSON(json)",
    "description": "The explodejsonarrayjson table function accepts a JSON array, where each element is of JSON object type,",
    "category": "Table Generating",
    "example": "CREATE TABLE json_array_example (\n    id INT,\n    json_array STRING\n)DUPLICATE KEY(id)\nDISTRIBUTED BY HASH(id) BUCKETS AUTO"
  },
  {
    "name": "EXPLODE_JSON_ARRAY_JSON_OUTER",
    "usage": "EXPLODE_JSON_ARRAY_JSON_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_JSON_ARRAY_JSON_OUTER();"
  },
  {
    "name": "EXPLODE_JSON_ARRAY_STRING",
    "usage": "EXPLODE_JSON_ARRAY_STRING(json)",
    "description": "The explodejsonarraystring table function accepts a JSON array, where each element is of string type,",
    "category": "Table Generating",
    "example": "CREATE TABLE json_array_example (\n    id INT,\n    json_array STRING\n)DUPLICATE KEY(id)\nDISTRIBUTED BY HASH(id) BUCKETS AUTO"
  },
  {
    "name": "EXPLODE_JSON_ARRAY_STRING_OUTER",
    "usage": "EXPLODE_JSON_ARRAY_STRING_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_JSON_ARRAY_STRING_OUTER();"
  },
  {
    "name": "EXPLODE_JSON_OBJECT",
    "usage": "EXPLODE_JSON_OBJECT(json)",
    "description": "explodejsonobject expands a JSON object into multiple rows, with each row containing a key-value pair.",
    "category": "Table Generating",
    "example": "CREATE TABLE example (\n    id INT,\n    value_json json\n) DUPLICATE KEY(id)\nDISTRIBUTED BY HASH(`id`) BUCKETS AUTO"
  },
  {
    "name": "EXPLODE_JSON_OBJECT_OUTER",
    "usage": "EXPLODE_JSON_OBJECT_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_JSON_OBJECT_OUTER();"
  },
  {
    "name": "EXPLODE_MAP",
    "usage": "EXPLODE_MAP(map<k,v>)",
    "description": "The explodemap function takes a map (mapping type) and expands it into multiple rows, with each row containing a key-value pair.",
    "category": "Table Generating",
    "example": "SET enable_nereids_planner=true"
  },
  {
    "name": "EXPLODE_MAP_OUTER",
    "usage": "EXPLODE_MAP_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_MAP_OUTER();"
  },
  {
    "name": "EXPLODE_NUMBERS",
    "usage": "EXPLODE_NUMBERS(n)",
    "description": "The explodenumbers table function takes an integer n and expands all numbers within the range into multiple rows, each containing a single number.",
    "category": "Table Generating",
    "example": "select e1 from (select 1 k1) as t lateral view explode_numbers(5) tmp1 as e1;"
  },
  {
    "name": "EXPLODE_NUMBERS_OUTER",
    "usage": "EXPLODE_NUMBERS_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_NUMBERS_OUTER();"
  },
  {
    "name": "EXPLODE_OUTER",
    "usage": "EXPLODE_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_OUTER();"
  },
  {
    "name": "EXPLODE_SPLIT",
    "usage": "EXPLODE_SPLIT(str, delimiter)",
    "description": "The explodesplit table function is used to split a string into multiple substrings based on a specified delimiter and expand each substring into a",
    "category": "Table Generating",
    "example": "-- setup\ncreate table example1(k1 int, k2 varchar(50)) distributed by hash(k1) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into example1 values (1,''),(2,null),(3,','),(4,'1'),(5,'1,2,3'),(6,'a, b, c');"
  },
  {
    "name": "EXPLODE_SPLIT_OUTER",
    "usage": "EXPLODE_SPLIT_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_SPLIT_OUTER();"
  },
  {
    "name": "EXPLODE_VARIANT_ARRAY",
    "usage": "EXPLODE_VARIANT_ARRAY(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_VARIANT_ARRAY();"
  },
  {
    "name": "EXPLODE_VARIANT_ARRAY_OUTER",
    "usage": "EXPLODE_VARIANT_ARRAY_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT EXPLODE_VARIANT_ARRAY_OUTER();"
  },
  {
    "name": "EXPONENTIAL_MOVING_AVERAGE",
    "usage": "EXPONENTIAL_MOVING_AVERAGE(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT EXPONENTIAL_MOVING_AVERAGE();"
  },
  {
    "name": "EXPORT_SET",
    "usage": "EXPORT_SET(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT EXPORT_SET();"
  },
  {
    "name": "EXTRACT",
    "usage": "EXTRACT(unit FROM datetime)",
    "description": "The extract function is used to extract a specified part of a date or time value, such as the year, month, day, hour, minute, second, etc.",
    "category": "Date & Time",
    "example": "select extract(year from '2022-09-22 17:01:30') as year,\nextract(month from '2022-09-22 17:01:30') as month,\nextract(day from '2022-09-22 17:01:30') as day,\nextract(hour from '2022-09-22 17:01:30') as hour,\nextract(minute from '2022-09-22 17:01:30') as minute,"
  },
  {
    "name": "EXTRACT_URL_PARAMETER",
    "usage": "EXTRACT_URL_PARAMETER ( url , name )",
    "description": "Returns the value of the name parameter in the URL, if it exists, or an empty string otherwise.",
    "category": "String",
    "example": "SELECT EXTRACT_URL_PARAMETER(\"http://doris.apache.org?k1=aa&k2=bb&test=cc#999\", \"k2\")"
  },
  {
    "name": "FACTORIAL",
    "usage": "FACTORIAL(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT FACTORIAL();"
  },
  {
    "name": "FIELD",
    "usage": "FIELD(expr, param [, ...])",
    "description": "Returns the position of the first occurrence of expr in the list of values param [, ...]. If expr is not found, the function returns 0.",
    "category": "String",
    "example": "-- setup\nCREATE TABLE baseall (k1 INT, k7 VARCHAR(64))\nDISTRIBUTED BY HASH(k1) BUCKETS 1\nPROPERTIES (\"replication_num\" = \"1\");\nINSERT INTO baseall VALUES"
  },
  {
    "name": "FILE",
    "usage": "FILE(...)",
    "description": "Built-in table-valued function in Apache Doris.",
    "category": "Table-Valued",
    "example": "SELECT FILE();"
  },
  {
    "name": "FIND_IN_SET",
    "usage": "FIND_IN_SET ( str , strlist )",
    "description": "Returns the position of the first occurrence of str in strlist (counting starts at 1).",
    "category": "String",
    "example": "SELECT FIND_IN_SET(\"b\", \"a,b,c\")"
  },
  {
    "name": "FIRST_SIGNIFICANT_SUBDOMAIN",
    "usage": "FIRST_SIGNIFICANT_SUBDOMAIN ( url )",
    "description": "Extract the \"first valid subdomain\" from the URL and return it. If it is illegal, an empty string will be returned.",
    "category": "String",
    "example": "SELECT FIRST_SIGNIFICANT_SUBDOMAIN(\"www.baidu.com\"),FIRST_SIGNIFICANT_SUBDOMAIN(\"www.google.com.cn\"),FIRST_SIGNIFICANT_SUBDOMAIN(\"wwwwwwww\")"
  },
  {
    "name": "FIRST_VALUE",
    "usage": "FIRST_VALUE(expr[, ignore_null])",
    "description": "FIRSTVALUE() is a window function that returns the first value in an ordered set of values within a window partition.",
    "category": "Window",
    "example": "WITH example_data AS (\n    SELECT 1 as column1, NULL as column2, 'A' as group_name\n    UNION ALL\n    SELECT 1, 10, 'A'\n    UNION ALL"
  },
  {
    "name": "FLOOR",
    "usage": "FLOOR(a[, d])",
    "description": "Round down floating-point and fixed-point decimals to a specific number of digits and return the rounded floating-point or fixed-point number.",
    "category": "Numeric",
    "example": "select floor(123.456);"
  },
  {
    "name": "FMOD",
    "usage": "FMOD(col_a , col_b)",
    "description": "Find the remainder of a / b for the floating-point type. For the integer type, please use the mod function.",
    "category": "Numeric",
    "example": "select fmod(10.1, 3.2);"
  },
  {
    "name": "FOREACH",
    "usage": "FOREACH(arg...)",
    "description": "Converts an aggregate function for tables into an aggregate function for arrays that aggregates the corresponding array items and returns an array of",
    "category": "Combinator",
    "example": "SELECT FOREACH();"
  },
  {
    "name": "FORMAT",
    "usage": "FORMAT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT FORMAT();"
  },
  {
    "name": "FORMAT_NUMBER",
    "usage": "FORMAT_NUMBER(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT FORMAT_NUMBER();"
  },
  {
    "name": "FORMAT_ROUND",
    "usage": "FORMAT_ROUND(number, D)",
    "description": "Formats a number in a format similar to \\",
    "category": "Numeric",
    "example": "mysql> select format_round(17014116, 2);\n+---------------------------+\n| format_round(17014116, 2) |\n+---------------------------+\n| 17,014,116.00             |"
  },
  {
    "name": "FPOW",
    "usage": "FPOW(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT FPOW();"
  },
  {
    "name": "FROM_BASE64",
    "usage": "FROM_BASE64 ( str )",
    "description": "Returns the result of Base64 decoding the input string. Special cases:",
    "category": "String",
    "example": "SELECT FROM_BASE64('MQ=='),FROM_BASE64('MjM0'),FROM_BASE64(NULL)"
  },
  {
    "name": "FROM_BASE64_BINARY",
    "usage": "FROM_BASE64_BINARY(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT FROM_BASE64_BINARY();"
  },
  {
    "name": "FROM_BINARY",
    "usage": "FROM_BINARY(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT FROM_BINARY();"
  },
  {
    "name": "FROM_DAYS",
    "usage": "FROM_DAYS(dt)",
    "description": "Given a number of days, returns a DATE.",
    "category": "Date & Time",
    "example": "select from_days(730669),from_days(5),from_days(59), from_days(60);"
  },
  {
    "name": "FROM_HEX",
    "usage": "FROM_HEX(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT FROM_HEX();"
  },
  {
    "name": "FROM_ISO8601_DATE",
    "usage": "FROM_ISO8601_DATE(dt)",
    "description": "Converts an ISO8601 formatted date expression to a DATE type date expression.",
    "category": "Date & Time",
    "example": "SELECT from_iso8601_date('0000-01'),from_iso8601_date('0000-W01'),from_iso8601_date('0000-059');"
  },
  {
    "name": "FROM_MICROSECOND",
    "usage": "FROM_MICROSECOND(unix_timestamp)",
    "description": "The function converts a Unix timestamp (in microseconds) into a DATETIME value.",
    "category": "Date & Time",
    "example": "SELECT FROM_MICROSECOND(1700000000000000);"
  },
  {
    "name": "FROM_MILLISECOND",
    "usage": "FROM_MILLISECOND(millisecond)",
    "description": "The function converts a Unix timestamp (in milliseconds) into a DATETIME value.",
    "category": "Date & Time",
    "example": "SELECT FROM_MILLISECOND(1700000000000);"
  },
  {
    "name": "FROM_SECOND",
    "usage": "FROM_SECOND(unix_timestamp)",
    "description": "The function converts a Unix timestamp (in seconds) into a DATETIME value.",
    "category": "Date & Time",
    "example": "SELECT FROM_SECOND(1700000000);"
  },
  {
    "name": "FROM_UNIXTIME",
    "usage": "FROM_UNIXTIME(unix_timestamp[, string_format])",
    "description": "Converts a Unix timestamp to the corresponding TIME format. Special cases:",
    "category": "Date & Time",
    "example": "mysql> select from_unixtime(1196440219);\n+---------------------------+\n| from_unixtime(1196440219) |\n+---------------------------+\n| 2007-12-01 00:30:19       |"
  },
  {
    "name": "FRONTENDS",
    "usage": "FRONTENDS()",
    "description": "The table function generates the frontends temporary table, which allows you to view the FE node information in the current doris cluster.",
    "category": "Table-Valued",
    "example": "SELECT FRONTENDS();"
  },
  {
    "name": "FRONTENDS_DISKS",
    "usage": "FRONTENDS_DISKS()",
    "description": "The frontendsdisks table function generates a temporary table that allows you to view the disk information of FE nodes in the current Doris cluster.",
    "category": "Table-Valued",
    "example": "select * from frontends_disks();"
  },
  {
    "name": "G",
    "usage": "G(...)",
    "description": "G function in Apache Doris.",
    "category": "General",
    "example": "SELECT G();"
  },
  {
    "name": "GCD",
    "usage": "GCD(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT GCD();"
  },
  {
    "name": "GET_FORMAT",
    "usage": "GET_FORMAT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT GET_FORMAT();"
  },
  {
    "name": "GET_JSON_BIGINT",
    "usage": "GET_JSON_BIGINT( json_str, json_path)",
    "description": "Parses and obtains the integer (BIGINT) content of the specified path within the json string.",
    "category": "JSON",
    "example": "SELECT GET_JSON_BIGINT();"
  },
  {
    "name": "GET_JSON_DOUBLE",
    "usage": "GET_JSON_DOUBLE( json_str, json_path)",
    "description": "Function is used to extract the value of a field from a JSON document and convert it to the DOUBLE type.",
    "category": "JSON",
    "example": "SELECT GET_JSON_DOUBLE();"
  },
  {
    "name": "GET_JSON_INT",
    "usage": "GET_JSON_INT( json_str, json_path)",
    "description": "Function is used to extract the value of a field from a JSON document and convert it to type INT.",
    "category": "JSON",
    "example": "SELECT GET_JSON_INT();"
  },
  {
    "name": "GET_JSON_STRING",
    "usage": "GET_JSON_STRING( json_str, json_path)",
    "description": "This function is used to extract a field's value from a JSON document and convert it to STRING type. It returns the field value at the specified path.",
    "category": "JSON",
    "example": "SELECT GET_JSON_STRING();"
  },
  {
    "name": "GREATEST",
    "usage": "GREATEST(expr [, ...])",
    "description": "Compares multiple expressions and returns the greatest value among them. If any argument is NULL, the function returns NULL.",
    "category": "Numeric",
    "example": "SELECT GREATEST(-1, 0, 5, 8);"
  },
  {
    "name": "GROUPING",
    "usage": "GROUPING( column_expression )",
    "description": "Indicates whether a specified column expression in a GROUP BY list is aggregated or not. GROUPING returns 1 if the column is aggregated (i.e.,",
    "category": "Aggregate",
    "example": "SELECT GROUPING();"
  },
  {
    "name": "GROUPING_ID",
    "usage": "GROUPING_ID(column_expression [, ...])",
    "description": "Computes the level of grouping for rows in a GROUP BY query.",
    "category": "Aggregate",
    "example": "SELECT GROUPING_ID();"
  },
  {
    "name": "GROUP_ARRAY",
    "usage": "GROUP_ARRAY(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT GROUP_ARRAY();"
  },
  {
    "name": "GROUP_ARRAY_INTERSECT",
    "usage": "GROUP_ARRAY_INTERSECT(expr)",
    "description": "Calculate the intersection elements of the input array across all rows and return a new array.",
    "category": "Aggregate",
    "example": "select c_array_string from group_array_intersect_test where id in (18, 20);"
  },
  {
    "name": "GROUP_ARRAY_UNION",
    "usage": "GROUP_ARRAY_UNION(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT GROUP_ARRAY_UNION();"
  },
  {
    "name": "GROUP_BITMAP_XOR",
    "usage": "GROUP_BITMAP_XOR(expr)",
    "description": "Mainly used to merge the values of multiple bitmaps and perform bitwise xor calculations on the results.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table pv_bitmap(id int, page varchar(10), user_id bitmap bitmap_union) aggregate key(id,page) distributed by hash(id) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into pv_bitmap values (1,'m',bitmap_from_string('4,7,8')),(2,'m',bitmap_from_string('1,3,6,15')),(3,'m',bitmap_from_string('4,7'));"
  },
  {
    "name": "GROUP_BIT_AND",
    "usage": "GROUP_BIT_AND(expr)",
    "description": "Performs a bitwise AND operation on all values in a single integer column or expression.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table group_bit(value int) distributed by hash(value) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into group_bit values (3),(1),(2),(4);"
  },
  {
    "name": "GROUP_BIT_OR",
    "usage": "GROUP_BIT_OR(expr)",
    "description": "Performs a bitwise OR operation on all values in a single integer column or expression.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table group_bit(value int) distributed by hash(value) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into group_bit values (3),(1),(2),(4);"
  },
  {
    "name": "GROUP_BIT_XOR",
    "usage": "GROUP_BIT_XOR(expr)",
    "description": "Performs a bitwise xor operation on all values in a single integer column or expression.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table group_bit(value int) distributed by hash(value) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into group_bit values (3),(1),(2),(4);"
  },
  {
    "name": "GROUP_COMMIT",
    "usage": "GROUP_COMMIT(...)",
    "description": "Built-in table-valued function in Apache Doris.",
    "category": "Table-Valued",
    "example": "SELECT GROUP_COMMIT();"
  },
  {
    "name": "GROUP_CONCAT",
    "usage": "GROUP_CONCAT([DISTINCT] str[, sep] [ORDER BY { col_name | expr} [ASC | DESC]])",
    "description": "The GROUPCONCAT function concatenates multiple rows of results in the result set into a string.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table test(\n    value varchar(10)\n) distributed by hash(value) buckets 1\nproperties (\"replication_num\"=\"1\");"
  },
  {
    "name": "GROUP_UNIQ_ARRAY",
    "usage": "GROUP_UNIQ_ARRAY(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT GROUP_UNIQ_ARRAY();"
  },
  {
    "name": "HASSUBSTR",
    "usage": "HASSUBSTR(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT HASSUBSTR();"
  },
  {
    "name": "HDFS",
    "usage": "HDFS(...)",
    "description": "Built-in table-valued function in Apache Doris.",
    "category": "Table-Valued",
    "example": "SELECT HDFS();"
  },
  {
    "name": "HEX",
    "usage": "HEX ( str )",
    "description": "If the input parameter is a number, return the string representation of the hexadecimal value.",
    "category": "String",
    "example": "SELECT HEX();"
  },
  {
    "name": "HIST",
    "usage": "HIST(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT HIST();"
  },
  {
    "name": "HISTOGRAM",
    "usage": "HISTOGRAM(expr[, num_buckets])",
    "description": "The histogram function is used to describe the distribution of the data. It uses an \\",
    "category": "Aggregate",
    "example": "SELECT histogram(c_float) FROM histogram_test;"
  },
  {
    "name": "HLL_CARDINALITY",
    "usage": "HLL_CARDINALITY(hll)",
    "description": "HLLCARDINALITY calculates the cardinality of a HyperLogLog (HLL) type value.",
    "category": "HyperLogLog",
    "example": "SELECT HLL_CARDINALITY();"
  },
  {
    "name": "HLL_EMPTY",
    "usage": "HLL_EMPTY()",
    "description": "HLLEMPTY returns an empty HLL (HyperLogLog) value, representing a data set with no elements.",
    "category": "HyperLogLog",
    "example": "select hll_cardinality(hll_empty());"
  },
  {
    "name": "HLL_FROM_BASE64",
    "usage": "HLL_FROM_BASE64(input)",
    "description": "Converts a base64-encoded string (usually the result of the HLLTOBASE64 function) into an HLL. If the input string is invalid or NULL,",
    "category": "HyperLogLog",
    "example": "SELECT HLL_FROM_BASE64();"
  },
  {
    "name": "HLL_HASH",
    "usage": "HLL_HASH(value)",
    "description": "Converts a given value to the HLL (HyperLogLog) type. This function is typically used during data loading to create an HLL from raw data.",
    "category": "HyperLogLog",
    "example": "SELECT HLL_CARDINALITY(HLL_HASH('abc'));"
  },
  {
    "name": "HLL_RAW_AGG",
    "usage": "HLL_RAW_AGG(hll)",
    "description": "The HLLRAWAGG function is an aggregate function, which is mainly used to merge multiple HyperLogLog data structures.",
    "category": "Aggregate",
    "example": "select HLL_CARDINALITY(HLL_RAW_AGG(uv_set)) from test_uv;"
  },
  {
    "name": "HLL_TO_BASE64",
    "usage": "HLL_TO_BASE64(hll_input)",
    "description": "Converts an input HLL to a base64-encoded string. If the input is null, the function returns null.",
    "category": "HyperLogLog",
    "example": "SELECT HLL_TO_BASE64();"
  },
  {
    "name": "HLL_UNION",
    "usage": "HLL_UNION(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT HLL_UNION();"
  },
  {
    "name": "HLL_UNION_AGG",
    "usage": "HLL_UNION_AGG(hll)",
    "description": "The HLLUNIONAGG function is an aggregate function, which is mainly used to merge multiple HyperLogLog data structures and estimate the approximate",
    "category": "Aggregate",
    "example": "select HLL_UNION_AGG(uv_set) from test_uv;"
  },
  {
    "name": "HOUR",
    "usage": "HOUR(dt)",
    "description": "Obtains the hour information from the given datetime.",
    "category": "Date & Time",
    "example": "select hour('2018-12-31 23:59:59');"
  },
  {
    "name": "HOURS_ADD",
    "usage": "HOURS_ADD(date, hours)",
    "description": "Returns a new datetime value that is the result of adding a specified number of hours to the input datetime.",
    "category": "Date & Time",
    "example": "SELECT HOURS_ADD('2020-02-02 02:02:02', 1);"
  },
  {
    "name": "HOURS_DIFF",
    "usage": "HOURS_DIFF(end_date, start_date)",
    "description": "Calculates the difference in hours between the start time and the end time.",
    "category": "Date & Time",
    "example": "SELECT HOURS_DIFF('2020-12-25 22:00:00', '2020-12-25 21:00:00');"
  },
  {
    "name": "HOURS_SUB",
    "usage": "HOURS_SUB(date, hours)",
    "description": "Returns a new datetime value that is the result of subtracting a specified number of hours from the input datetime.",
    "category": "Date & Time",
    "example": "SELECT HOURS_SUB('2020-02-02 02:02:02', 1);"
  },
  {
    "name": "HOUR_CEIL",
    "usage": "HOUR_CEIL(datetime)",
    "description": "Converts the date to the nearest rounded-up timestamp of the specified time interval period.",
    "category": "Date & Time",
    "example": "select hour_ceil(\"2023-07-13 22:28:18\", 5);"
  },
  {
    "name": "HOUR_FLOOR",
    "usage": "HOUR_FLOOR(datetime)",
    "description": "Converts the date to the nearest rounded-down timestamp of the specified time interval period.",
    "category": "Date & Time",
    "example": "select hour_floor(\"2023-07-13 22:28:18\", 5);"
  },
  {
    "name": "HOUR_FROM_UNIXTIME",
    "usage": "HOUR_FROM_UNIXTIME(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT HOUR_FROM_UNIXTIME();"
  },
  {
    "name": "HOUR_MICROSECOND",
    "usage": "HOUR_MICROSECOND(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT HOUR_MICROSECOND();"
  },
  {
    "name": "HOUR_MINUTE",
    "usage": "HOUR_MINUTE(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT HOUR_MINUTE();"
  },
  {
    "name": "HOUR_SECOND",
    "usage": "HOUR_SECOND(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT HOUR_SECOND();"
  },
  {
    "name": "HTTP",
    "usage": "HTTP(...)",
    "description": "Built-in table-valued function in Apache Doris.",
    "category": "Table-Valued",
    "example": "SELECT HTTP();"
  },
  {
    "name": "HTTP_STREAM",
    "usage": "HTTP_STREAM(...)",
    "description": "Built-in table-valued function in Apache Doris.",
    "category": "Table-Valued",
    "example": "SELECT HTTP_STREAM();"
  },
  {
    "name": "HUDI_META",
    "usage": "HUDI_META( table = table, query_type = query_type )",
    "description": "hudimeta table-valued-function(tvf), using for read hudi metadata, operation history, timeline of table, instant state etc.",
    "category": "Table-Valued",
    "example": "SELECT HUDI_META();"
  },
  {
    "name": "ICEBERG_META",
    "usage": "ICEBERG_META( table = table, query_type = query_type )",
    "description": "icebergmeta table-valued-function(tvf), Use for read iceberg metadata, operation history, snapshots of table, file metadata etc.",
    "category": "Table-Valued",
    "example": "SELECT ICEBERG_META();"
  },
  {
    "name": "IF",
    "usage": "IF(condition, value_true, value_false_or_null)",
    "description": "Returns valueTrue when the condition is true, and returns valueFalseOrNull otherwise.",
    "category": "Conditional",
    "example": "create table test(\n    user_id int\n) properties('replication_num' = '1');\ninsert into test values(1),(2);"
  },
  {
    "name": "IFNULL",
    "usage": "IFNULL(expr1, expr2)",
    "description": "Returns expr1 if it is not NULL; otherwise, returns expr2.",
    "category": "Conditional",
    "example": "SELECT IFNULL(1, 0);"
  },
  {
    "name": "IGNORE",
    "usage": "IGNORE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT IGNORE();"
  },
  {
    "name": "INET6_ATON",
    "usage": "INET6_ATON(...)",
    "description": "Built-in ip function in Apache Doris.",
    "category": "IP",
    "example": "SELECT INET6_ATON();"
  },
  {
    "name": "INET6_NTOA",
    "usage": "INET6_NTOA(...)",
    "description": "Built-in ip function in Apache Doris.",
    "category": "IP",
    "example": "SELECT INET6_NTOA();"
  },
  {
    "name": "INET_ATON",
    "usage": "INET_ATON(...)",
    "description": "Built-in ip function in Apache Doris.",
    "category": "IP",
    "example": "SELECT INET_ATON();"
  },
  {
    "name": "INET_NTOA",
    "usage": "INET_NTOA(...)",
    "description": "Built-in ip function in Apache Doris.",
    "category": "IP",
    "example": "SELECT INET_NTOA();"
  },
  {
    "name": "INITCAP",
    "usage": "INITCAP ( str )",
    "description": "Capitalizes the first letter of the word contained in the parameter and converts the rest of the letters to lowercase.",
    "category": "String",
    "example": "SELECT INITCAP('hello hello.,HELLO123HELlo')"
  },
  {
    "name": "INNER_PRODUCT",
    "usage": "INNER_PRODUCT(vector1, vector2)",
    "description": "Calculates the dot product (inner product) between two floating-point vectors.",
    "category": "Numeric",
    "example": "SELECT id, INNER_PRODUCT(vector_a, vector_b) AS score FROM items;"
  },
  {
    "name": "INNER_PRODUCT_APPROXIMATE",
    "usage": "INNER_PRODUCT_APPROXIMATE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT INNER_PRODUCT_APPROXIMATE();"
  },
  {
    "name": "INSERT",
    "usage": "INSERT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT INSERT();"
  },
  {
    "name": "INSTR",
    "usage": "INSTR ( str , substr )",
    "description": "Returns the first occurrence position of substr in str (counting starts from 1). Special cases:",
    "category": "String",
    "example": "SELECT INSTR(\"abc\", \"b\"),INSTR(\"abc\", \"d\")"
  },
  {
    "name": "INTERSECT_COUNT",
    "usage": "INTERSECT_COUNT(bitmap_column, column_to_filter, filter_values)",
    "description": "The INTERSECTCOUNT function is used to calculate the number of intersecting elements of the Bitmap data structure.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table pv_bitmap(dt int, user_id bitmap bitmap_union) aggregate key(dt) distributed by hash(dt) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into pv_bitmap values (4,bitmap_from_string('1,2,3')),(3,bitmap_from_string('1,2,3,4,5'));"
  },
  {
    "name": "INTERVAL",
    "usage": "INTERVAL(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT INTERVAL();"
  },
  {
    "name": "INT_TO_UUID",
    "usage": "INT_TO_UUID ( int128 )",
    "description": "For an encoded LARGEINT input, convert it to a raw uuid string.",
    "category": "String",
    "example": "SELECT INT_TO_UUID(95721955514869408091759290071393952876)"
  },
  {
    "name": "IPV4_CIDR_TO_RANGE",
    "usage": "IPV4_CIDR_TO_RANGE(ip_v4, cidr)",
    "description": "Receive an IPv4 and an Int16 value containing CIDR. Returns a struct that contains two IPv4 fields representing the lower range (min) and higher",
    "category": "IP",
    "example": "SELECT ipv4_cidr_to_range(to_ipv4('192.168.5.2'), 16) as re1, ipv4_cidr_to_range(NULL, NULL) as re3;"
  },
  {
    "name": "IPV4_NUM_TO_STRING",
    "usage": "IPV4_NUM_TO_STRING(ipv4_num)",
    "description": "Takes a Int16, Int32, Int64 number. Interprets it as an IPv4 address in big endian.",
    "category": "IP",
    "example": "select ipv4_num_to_string(3232235521);"
  },
  {
    "name": "IPV4_STRING_TO_NUM",
    "usage": "IPV4_STRING_TO_NUM(ipv4_string)",
    "description": "Takes a string containing an IPv4 address in the format A.B.C.D (dot-separated numbers in decimal form).",
    "category": "IP",
    "example": "select ipv4_string_to_num('192.168.0.1');"
  },
  {
    "name": "IPV4_STRING_TO_NUM_OR_DEFAULT",
    "usage": "IPV4_STRING_TO_NUM_OR_DEFAULT(ipv4_string)",
    "description": "Takes a string containing an IPv4 address in the format A.B.C.D (dot-separated numbers in decimal form).",
    "category": "IP",
    "example": "select ipv4_string_to_num_or_default('192.168.0.1');"
  },
  {
    "name": "IPV4_STRING_TO_NUM_OR_NULL",
    "usage": "IPV4_STRING_TO_NUM_OR_NULL(ipv4_string)",
    "description": "Takes a string containing an IPv4 address in the format A.B.C.D (dot-separated numbers in decimal form).",
    "category": "IP",
    "example": "select ipv4_string_to_num_or_null('192.168.0.1');"
  },
  {
    "name": "IPV4_TO_IPV6",
    "usage": "IPV4_TO_IPV6(ipv4)",
    "description": "Convert ipv4 type address to ipv6 type address.",
    "category": "IP",
    "example": "select ipv6_num_to_string(ipv4_to_ipv6(to_ipv4('192.168.0.1')));"
  },
  {
    "name": "IPV6_CIDR_TO_RANGE",
    "usage": "IPV6_CIDR_TO_RANGE(ip_v6, cidr)",
    "description": "Receive an IPv6 and an Int16 value containing CIDR. Returns a struct that contains two IPv6 fields representing the lower range (min) and higher",
    "category": "IP",
    "example": "SELECT ipv6_cidr_to_range(to_ipv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'), 32), ipv6_cidr_to_range(NULL, NULL);"
  },
  {
    "name": "IPV6_FROM_UINT128_STRING_OR_NULL",
    "usage": "IPV6_FROM_UINT128_STRING_OR_NULL(...)",
    "description": "Built-in ip function in Apache Doris.",
    "category": "IP",
    "example": "SELECT IPV6_FROM_UINT128_STRING_OR_NULL();"
  },
  {
    "name": "IPV6_NUM_TO_STRING",
    "usage": "IPV6_NUM_TO_STRING(ipv6_num)",
    "description": "Takes an IPv6 address in binary format of type String. Returns the string of this address in text format.",
    "category": "IP",
    "example": "select ipv6_num_to_string(unhex('2A0206B8000000000000000000000011')) as addr, ipv6_num_to_string(\"-23vno12i34nlfwlsj\");"
  },
  {
    "name": "IPV6_STRING_TO_NUM",
    "usage": "IPV6_STRING_TO_NUM(ipv6_string)",
    "description": "The reverse function of IPV6_NUM_TO_STRING, it takes an IP address String and returns an IPv6 address in binary format.",
    "category": "IP",
    "example": "select hex(ipv6_string_to_num('1111::ffff')), hex(ipv6_string_to_num('192.168.0.1'));"
  },
  {
    "name": "IPV6_STRING_TO_NUM_OR_DEFAULT",
    "usage": "IPV6_STRING_TO_NUM_OR_DEFAULT(ipv6_string)",
    "description": "The reverse function of IPV6_NUM_TO_STRING, it takes an IP address String and returns an IPv6 address in binary format.",
    "category": "IP",
    "example": "select hex(ipv6_string_to_num_or_default('1111::ffff')) as r1,hex(ipv6_string_to_num_or_default('192.168.0.1')) as r2, hex(ipv6_string_to_num_or_default('notaaddress')) as r3;"
  },
  {
    "name": "IPV6_STRING_TO_NUM_OR_NULL",
    "usage": "IPV6_STRING_TO_NUM_OR_NULL(ipv6_string)",
    "description": "The reverse function of IPV6_NUM_TO_STRING, it takes an IP address String and returns an IPv6 address in binary format.",
    "category": "IP",
    "example": "select hex(ipv6_string_to_num_or_null('1111::ffff')) as r1, hex(ipv6_string_to_num_or_null('192.168.0.1')) as r2, hex(ipv6_string_to_num_or_null('notaaddress')) as r3;"
  },
  {
    "name": "ISINF",
    "usage": "ISINF(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT ISINF();"
  },
  {
    "name": "ISNAN",
    "usage": "ISNAN(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT ISNAN();"
  },
  {
    "name": "ISVALIDUTF8",
    "usage": "ISVALIDUTF8(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT ISVALIDUTF8();"
  },
  {
    "name": "IS_IPV4",
    "usage": "IS_IPV4(...)",
    "description": "Built-in ip function in Apache Doris.",
    "category": "IP",
    "example": "SELECT IS_IPV4();"
  },
  {
    "name": "IS_IPV4_COMPAT",
    "usage": "IS_IPV4_COMPAT(INET6_ATON(ipv4_addr)",
    "description": "This function takes an IPv6 address represented in numeric form as a binary string, as returned by INET6ATON().",
    "category": "IP",
    "example": "SELECT IS_IPV4_COMPAT(INET6_ATON('::ffff:10.0.5.9')) AS re1, IS_IPV4_COMPAT(INET6_ATON('::10.0.5.9')) AS re2;"
  },
  {
    "name": "IS_IPV4_MAPPED",
    "usage": "IS_IPV4_MAPPED(INET6_ATON(ipv4_addr)",
    "description": "This function takes an IPv6 address represented in numeric form as a binary string, as returned by INET6ATON().",
    "category": "IP",
    "example": "SELECT IS_IPV4_MAPPED(INET6_ATON('::ffff:10.0.5.9')) AS re1, IS_IPV4_MAPPED(INET6_ATON('::10.0.5.9')) AS re2;"
  },
  {
    "name": "IS_IPV4_STRING",
    "usage": "IS_IPV4_STRING(ipv4_str)",
    "description": "Determine whether an IPv4-type address is a valid IPv4 address.",
    "category": "IP",
    "example": "CREATE TABLE `test_is_ipv4_string` (\n      `id` int,\n      `ip_v4` string\n    ) ENGINE=OLAP\n    DISTRIBUTED BY HASH(`id`) BUCKETS 4"
  },
  {
    "name": "IS_IPV6",
    "usage": "IS_IPV6(...)",
    "description": "Built-in ip function in Apache Doris.",
    "category": "IP",
    "example": "SELECT IS_IPV6();"
  },
  {
    "name": "IS_IPV6_STRING",
    "usage": "IS_IPV6_STRING(ipv6_str)",
    "description": "Determine whether an IPv6-type address is a valid IPv6 address.",
    "category": "IP",
    "example": "CREATE TABLE `test_is_ipv6_string` (\n      `id` int,\n      `ip_v6` string\n    ) ENGINE=OLAP\n    DISTRIBUTED BY HASH(`id`) BUCKETS 4"
  },
  {
    "name": "IS_IP_ADDRESS_IN_RANGE",
    "usage": "IS_IP_ADDRESS_IN_RANGE(ip_str, cidr_prefix)",
    "description": "Determine whether the IP (IPv4 or IPv6) address is included in the network represented by CIDR notation.",
    "category": "IP",
    "example": "SELECT is_ip_address_in_range('127.0.0.1', '127.0.0.0/8') as v4, is_ip_address_in_range('::ffff:192.168.0.1', '::ffff:192.168.0.4/128') as v6, is_ip_address_in_range('127.0.0.1', NULL) as nil;"
  },
  {
    "name": "IS_VALID_UTF8",
    "usage": "IS_VALID_UTF8(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT IS_VALID_UTF8();"
  },
  {
    "name": "JOBS",
    "usage": "JOBS( type=type )",
    "description": "Table function, generating a temporary task table, which can view job information in a certain task type.",
    "category": "Table-Valued",
    "example": "SELECT JOBS();"
  },
  {
    "name": "JSONB_ARRAY",
    "usage": "JSONB_ARRAY(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_ARRAY();"
  },
  {
    "name": "JSONB_ARRAY_IGNORE_NULL",
    "usage": "JSONB_ARRAY_IGNORE_NULL(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_ARRAY_IGNORE_NULL();"
  },
  {
    "name": "JSONB_EXISTS_PATH",
    "usage": "JSONB_EXISTS_PATH(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_EXISTS_PATH();"
  },
  {
    "name": "JSONB_EXTRACT",
    "usage": "JSONB_EXTRACT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_EXTRACT();"
  },
  {
    "name": "JSONB_EXTRACT_BIGINT",
    "usage": "JSONB_EXTRACT_BIGINT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_EXTRACT_BIGINT();"
  },
  {
    "name": "JSONB_EXTRACT_BOOL",
    "usage": "JSONB_EXTRACT_BOOL(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_EXTRACT_BOOL();"
  },
  {
    "name": "JSONB_EXTRACT_DOUBLE",
    "usage": "JSONB_EXTRACT_DOUBLE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_EXTRACT_DOUBLE();"
  },
  {
    "name": "JSONB_EXTRACT_INT",
    "usage": "JSONB_EXTRACT_INT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_EXTRACT_INT();"
  },
  {
    "name": "JSONB_EXTRACT_ISNULL",
    "usage": "JSONB_EXTRACT_ISNULL(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_EXTRACT_ISNULL();"
  },
  {
    "name": "JSONB_EXTRACT_LARGEINT",
    "usage": "JSONB_EXTRACT_LARGEINT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_EXTRACT_LARGEINT();"
  },
  {
    "name": "JSONB_EXTRACT_STRING",
    "usage": "JSONB_EXTRACT_STRING(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_EXTRACT_STRING();"
  },
  {
    "name": "JSONB_HASH",
    "usage": "JSONB_HASH(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_HASH();"
  },
  {
    "name": "JSONB_INSERT",
    "usage": "JSONB_INSERT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_INSERT();"
  },
  {
    "name": "JSONB_KEYS",
    "usage": "JSONB_KEYS(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_KEYS();"
  },
  {
    "name": "JSONB_OBJECT",
    "usage": "JSONB_OBJECT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_OBJECT();"
  },
  {
    "name": "JSONB_PARSE",
    "usage": "JSONB_PARSE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_PARSE();"
  },
  {
    "name": "JSONB_PARSE_ERROR_TO_NULL",
    "usage": "JSONB_PARSE_ERROR_TO_NULL(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_PARSE_ERROR_TO_NULL();"
  },
  {
    "name": "JSONB_PARSE_ERROR_TO_VALUE",
    "usage": "JSONB_PARSE_ERROR_TO_VALUE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_PARSE_ERROR_TO_VALUE();"
  },
  {
    "name": "JSONB_REPLACE",
    "usage": "JSONB_REPLACE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_REPLACE();"
  },
  {
    "name": "JSONB_SET",
    "usage": "JSONB_SET(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_SET();"
  },
  {
    "name": "JSONB_TYPE",
    "usage": "JSONB_TYPE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_TYPE();"
  },
  {
    "name": "JSONB_VALID",
    "usage": "JSONB_VALID(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT JSONB_VALID();"
  },
  {
    "name": "JSON_ARRAY",
    "usage": "JSON_ARRAY (a, ...)",
    "description": "Generate a json array containing the specified values, return empty if no values",
    "category": "JSON",
    "example": "select json_array();"
  },
  {
    "name": "JSON_ARRAY_IGNORE_NULL",
    "usage": "JSON_ARRAY_IGNORE_NULL(...)",
    "description": "Built-in json function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_ARRAY_IGNORE_NULL();"
  },
  {
    "name": "JSON_CONTAINS",
    "usage": "JSON_CONTAINS(json_str, candidate [, json_path])",
    "description": "This function is used to check whether a JSON document contains a specified JSON element. If the specified element exists in the JSON document,",
    "category": "JSON",
    "example": "SELECT JSON_CONTAINS('{\"a\": 1, \"b\": 2, \"c\": {\"d\": 4}}', '1', '$.a');"
  },
  {
    "name": "JSON_EACH",
    "usage": "JSON_EACH(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT JSON_EACH();"
  },
  {
    "name": "JSON_EACH_OUTER",
    "usage": "JSON_EACH_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT JSON_EACH_OUTER();"
  },
  {
    "name": "JSON_EACH_TEXT",
    "usage": "JSON_EACH_TEXT(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT JSON_EACH_TEXT();"
  },
  {
    "name": "JSON_EACH_TEXT_OUTER",
    "usage": "JSON_EACH_TEXT_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT JSON_EACH_TEXT_OUTER();"
  },
  {
    "name": "JSON_EXISTS_PATH",
    "usage": "JSON_EXISTS_PATH (json_str, path)",
    "description": "It is used to judge whether the field specified by jsonpath exists in the JSON data. If it exists, it returns TRUE, and if it does not exist,",
    "category": "JSON",
    "example": "SELECT JSON_EXISTS_PATH('{\"id\": 123, \"name\": \"doris\"}', '$.name');"
  },
  {
    "name": "JSON_EXTRACT",
    "usage": "JSON_EXTRACT (json_str, path[, path] ...)",
    "description": "JSONEXTRACT is a series of functions that extract the field specified by jsonpath from JSON data and provide different series of functions according",
    "category": "JSON",
    "example": "SELECT json_extract('{\"id\": 123, \"name\": \"doris\"}', '$.id');"
  },
  {
    "name": "JSON_EXTRACT_BIGINT",
    "usage": "JSON_EXTRACT_BIGINT(...)",
    "description": "JSON_EXTRACT_BIGINT function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_EXTRACT_BIGINT();"
  },
  {
    "name": "JSON_EXTRACT_BOOL",
    "usage": "JSON_EXTRACT_BOOL(...)",
    "description": "JSON_EXTRACT_BOOL function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_EXTRACT_BOOL();"
  },
  {
    "name": "JSON_EXTRACT_DOUBLE",
    "usage": "JSON_EXTRACT_DOUBLE(...)",
    "description": "JSON_EXTRACT_DOUBLE function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_EXTRACT_DOUBLE();"
  },
  {
    "name": "JSON_EXTRACT_INT",
    "usage": "JSON_EXTRACT_INT(...)",
    "description": "JSON_EXTRACT_INT function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_EXTRACT_INT();"
  },
  {
    "name": "JSON_EXTRACT_ISNULL",
    "usage": "JSON_EXTRACT_ISNULL(...)",
    "description": "JSON_EXTRACT_ISNULL function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_EXTRACT_ISNULL();"
  },
  {
    "name": "JSON_EXTRACT_LARGEINT",
    "usage": "JSON_EXTRACT_LARGEINT(...)",
    "description": "JSON_EXTRACT_LARGEINT function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_EXTRACT_LARGEINT();"
  },
  {
    "name": "JSON_EXTRACT_NO_QUOTES",
    "usage": "JSON_EXTRACT_NO_QUOTES(...)",
    "description": "Built-in json function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_EXTRACT_NO_QUOTES();"
  },
  {
    "name": "JSON_EXTRACT_STRING",
    "usage": "JSON_EXTRACT_STRING(...)",
    "description": "JSON_EXTRACT_STRING function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_EXTRACT_STRING();"
  },
  {
    "name": "JSON_HASH",
    "usage": "JSON_HASH(...)",
    "description": "Built-in json function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_HASH();"
  },
  {
    "name": "JSON_INSERT",
    "usage": "JSON_INSERT (json_str, path, val[, path, val, ...])",
    "description": "The JSONINSERT function is used to insert data into JSON and return the result.",
    "category": "JSON",
    "example": "select json_insert(null, null, null);"
  },
  {
    "name": "JSON_KEYS",
    "usage": "JSON_KEYS(str [, path])",
    "description": "Used to return the key from the top-level value of a JSON object. These keys are returned as an array or, if path parameters are given,",
    "category": "JSON",
    "example": "SELECT JSON_KEYS('{\"a\": 1, \"b\": {\"c\": 30}}');"
  },
  {
    "name": "JSON_LENGTH",
    "usage": "JSON_LENGTH(json_str [ , json_path ])",
    "description": "The JSONLENGTH function returns the length or number of elements of a given JSON document. If the JSON document is an array,",
    "category": "JSON",
    "example": "SELECT json_length('{\"k1\":\"v31\",\"k2\":300}');"
  },
  {
    "name": "JSON_OBJECT",
    "usage": "JSON_OBJECT (key, value[,key, value, ...])",
    "description": "Generate a json object containing the specified Key-Value, an exception error is returned when Key is NULL or the number of parameters are odd.",
    "category": "JSON",
    "example": "select json_object();"
  },
  {
    "name": "JSON_OBJECT_FLATTEN",
    "usage": "JSON_OBJECT_FLATTEN(...)",
    "description": "Built-in json function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_OBJECT_FLATTEN();"
  },
  {
    "name": "JSON_PARSE",
    "usage": "JSON_PARSE (json_str)",
    "description": "Parse the original JSON string into JSON binary format. To meet the needs of different abnormal data processing,",
    "category": "JSON",
    "example": "SELECT JSON_PARSE();"
  },
  {
    "name": "JSON_PARSE_ERROR_TO_INVALID",
    "usage": "JSON_PARSE_ERROR_TO_INVALID(...)",
    "description": "JSON_PARSE_ERROR_TO_INVALID function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_PARSE_ERROR_TO_INVALID();"
  },
  {
    "name": "JSON_PARSE_ERROR_TO_NULL",
    "usage": "JSON_PARSE_ERROR_TO_NULL(...)",
    "description": "JSON_PARSE_ERROR_TO_NULL function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_PARSE_ERROR_TO_NULL();"
  },
  {
    "name": "JSON_PARSE_ERROR_TO_VALUE",
    "usage": "JSON_PARSE_ERROR_TO_VALUE(...)",
    "description": "JSON_PARSE_ERROR_TO_VALUE function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_PARSE_ERROR_TO_VALUE();"
  },
  {
    "name": "JSON_PARSE_NOTNULL",
    "usage": "JSON_PARSE_NOTNULL(...)",
    "description": "JSON_PARSE_NOTNULL function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_PARSE_NOTNULL();"
  },
  {
    "name": "JSON_PARSE_NOTNULL_ERROR_TO_INVALID",
    "usage": "JSON_PARSE_NOTNULL_ERROR_TO_INVALID( str )",
    "description": "This function is used to parse a JSON string. If the JSON string is malformed or a parsing error occurs,",
    "category": "JSON",
    "example": "SELECT JSON_PARSE_NOTNULL_ERROR_TO_INVALID('{\"name\": \"Alice\", \"age\": 30}') AS parsed_json;"
  },
  {
    "name": "JSON_PARSE_NOTNULL_ERROR_TO_VALUE",
    "usage": "JSON_PARSE_NOTNULL_ERROR_TO_VALUE( str , default_value)",
    "description": "Function to parse JSON strings. If the JSON string format is invalid or a parsing error occurs,",
    "category": "JSON",
    "example": "SELECT JSON_PARSE_NOTNULL_ERROR_TO_VALUE('{\"name\": \"Alice\", \"age\": 30}', '{\"name\": \"Unknown\", \"age\":  0}') AS parsed_json;"
  },
  {
    "name": "JSON_PARSE_NULLABLE",
    "usage": "JSON_PARSE_NULLABLE( str )",
    "description": "The JSONPARSENULLABLE function is used to parse a JSON string into a valid JSON object. If the input string is invalid or NULL,",
    "category": "JSON",
    "example": "SELECT JSON_PARSE_NULLABLE();"
  },
  {
    "name": "JSON_PARSE_NULLABLE_ERROR_TO_INVALID",
    "usage": "JSON_PARSE_NULLABLE_ERROR_TO_INVALID( str )",
    "description": "The JSONPARSENULLABLEERRORTOINVALID function is used to parse a JSON string into a valid JSON object. If the input JSON string is invalid,",
    "category": "JSON",
    "example": "SELECT JSON_PARSE_NULLABLE_ERROR_TO_INVALID();"
  },
  {
    "name": "JSON_PARSE_NULLABLE_ERROR_TO_NULL",
    "usage": "JSON_PARSE_NULLABLE_ERROR_TO_NULL( str )",
    "description": "The JSONPARSENULLABLEERRORTONULL function is used to parse a JSON string into a valid JSON object. If the input JSON string is invalid,",
    "category": "JSON",
    "example": "SELECT JSON_PARSE_NULLABLE_ERROR_TO_NULL();"
  },
  {
    "name": "JSON_PARSE_NULLABLE_ERROR_TO_VALUE",
    "usage": "JSON_PARSE_NULLABLE_ERROR_TO_VALUE( str , default_value)",
    "description": "The JSONPARSENULLABLEERRORTOVALUE function is used to parse a JSON string into a valid JSON object. If the input JSON string is invalid,",
    "category": "JSON",
    "example": "SELECT JSON_PARSE_NULLABLE_ERROR_TO_VALUE();"
  },
  {
    "name": "JSON_QUOTE",
    "usage": "JSON_QUOTE (a)",
    "description": "Enclose jsonvalue in double quotes (\\",
    "category": "JSON",
    "example": "SELECT json_quote('null'), json_quote('\"null\"');"
  },
  {
    "name": "JSON_REMOVE",
    "usage": "JSON_REMOVE(...)",
    "description": "Built-in json function in Apache Doris.",
    "category": "JSON",
    "example": "SELECT JSON_REMOVE();"
  },
  {
    "name": "JSON_REPLACE",
    "usage": "JSON_REPLACE (json_str, path, val[, jsonPath, val, ...])",
    "description": "The JSONREPLACE function is used to update data in a JSON and return the result.",
    "category": "JSON",
    "example": "select json_replace(null, null, null);"
  },
  {
    "name": "JSON_SEARCH",
    "usage": "JSON_SEARCH(str, one_or_all, search_value [, start_path [, escape_char]])",
    "description": "The JSONSEARCH function is used to search for a specified value within a JSON document. If the value is found, it returns the path to the value.",
    "category": "JSON",
    "example": "SELECT JSON_SEARCH();"
  },
  {
    "name": "JSON_SET",
    "usage": "JSON_SET (json_str, path, val [, path, val, ...])",
    "description": "The jsonset function inserts or updates data in a JSON and returns the result.",
    "category": "JSON",
    "example": "select json_set(null, null, null);"
  },
  {
    "name": "JSON_TYPE",
    "usage": "JSON_TYPE( json, json_path )",
    "description": "Used to determine the type of the field specified by jsonpath in the JSONB data. If the field does not exist, it returns NULL. If the field exists,",
    "category": "JSON",
    "example": "SELECT JSON_TYPE();"
  },
  {
    "name": "JSON_UNQUOTE",
    "usage": "JSON_UNQUOTE (a)",
    "description": "This function unquotes a JSON value and returns the result as a utf8mb4 string. If the argument is NULL, it will return NULL.",
    "category": "JSON",
    "example": "SELECT json_unquote('\"doris\"');"
  },
  {
    "name": "JSON_VALID",
    "usage": "JSON_VALID( str )",
    "description": "The JSONVALID function returns 0 or 1 to indicate whether the input is a valid JSON. If the input is NULL, it returns NULL.",
    "category": "JSON",
    "example": "SELECT JSON_VALID();"
  },
  {
    "name": "KURT",
    "usage": "KURTOSIS(expr)",
    "description": "The KURTOSIS function returns the kurtosis of the expr expression. The forumula used for this function is 4-th centrol moment / ((variance)^2) - 3.",
    "category": "Aggregate",
    "example": "select * from statistic_test;"
  },
  {
    "name": "KURTOSIS",
    "usage": "KURTOSIS(expr)",
    "description": "The KURTOSIS function returns the kurtosis of the expr expression. The forumula used for this function is 4-th centrol moment / ((variance)^2) - 3.",
    "category": "Aggregate",
    "example": "select * from statistic_test;"
  },
  {
    "name": "KURT_POP",
    "usage": "KURT_POP(expr)",
    "description": "The KURTOSIS function returns the kurtosis of the expr expression. The forumula used for this function is 4-th centrol moment / ((variance)^2) - 3.",
    "category": "Aggregate",
    "example": "select * from statistic_test;"
  },
  {
    "name": "L1_DISTANCE",
    "usage": "L1_DISTANCE(array1, array2)",
    "description": "Calculate the distance between two points in L1 space (vector values are coordinates)",
    "category": "Distance",
    "example": "SELECT L1_DISTANCE([4, 5], [6, 8]),L1_DISTANCE([3, 6], [4, 5]);"
  },
  {
    "name": "L2_DISTANCE",
    "usage": "L2_DISTANCE(vector1, vector2)",
    "description": "Calculates the Euclidean (L2) distance between two floating-point vectors.",
    "category": "Distance",
    "example": "SELECT id, L2_DISTANCE(vector_a, vector_b) AS dist FROM items;"
  },
  {
    "name": "L2_DISTANCE_APPROXIMATE",
    "usage": "L2_DISTANCE_APPROXIMATE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT L2_DISTANCE_APPROXIMATE();"
  },
  {
    "name": "LAG",
    "usage": "LAG ( expr, offset, default )",
    "description": "LAG() is a window function that accesses data from previous rows without performing a self-join.",
    "category": "Window",
    "example": "SELECT LAG();"
  },
  {
    "name": "LAST_DAY",
    "usage": "LAST_DAY(date)",
    "description": "Returns the date of the last day of the month for the given input date. The returned day varies depending on the month:",
    "category": "Date & Time",
    "example": "SELECT LAST_DAY('2000-02-03');"
  },
  {
    "name": "LAST_QUERY_ID",
    "usage": "LAST_QUERY_ID()",
    "description": "Get the query id of the current user's last query.",
    "category": "System",
    "example": "select last_query_id();"
  },
  {
    "name": "LAST_VALUE",
    "usage": "LAST_VALUE(expr[, ignore_null])",
    "description": "LASTVALUE() is a window function that returns the last value within the window frame.",
    "category": "Window",
    "example": "WITH example_data AS (\n    SELECT 1 as id, 21 as myday, '04-21-11' as time_col, NULL as state\n    UNION ALL\n    SELECT 2, 21, '04-21-12', 2\n    UNION ALL"
  },
  {
    "name": "LCASE",
    "usage": "LCASE ( str )",
    "description": "Convert all strings in the parameter to lowercase.",
    "category": "String",
    "example": "SELECT LCASE(\"AbC123\"),LOWER(\"AbC123\")"
  },
  {
    "name": "LCM",
    "usage": "LCM(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT LCM();"
  },
  {
    "name": "LEAD",
    "usage": "LEAD ( expr [ , offset [ , default ] ] )",
    "description": "LEAD() is a window function used to access data from subsequent rows without performing a self-join.",
    "category": "Window",
    "example": "SELECT LEAD();"
  },
  {
    "name": "LEAST",
    "usage": "LEAST(expr [, ...])",
    "description": "Compares multiple expressions and returns the smallest value among them. If any parameter is NULL, the function returns NULL.",
    "category": "Numeric",
    "example": "SELECT LEAST(-1, 0, 5, 8);"
  },
  {
    "name": "LEFT",
    "usage": "LEFT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT LEFT();"
  },
  {
    "name": "LENGTH",
    "usage": "LENGTH ( str )",
    "description": "Returns the number of bytes in a string.",
    "category": "String",
    "example": "SELECT LENGTH(\"abc\"),length(\"\u4e2d\u56fd\")"
  },
  {
    "name": "LIKE",
    "usage": "LIKE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT LIKE();"
  },
  {
    "name": "LINEAR_HISTOGRAM",
    "usage": "LINEAR_HISTOGRAM(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT LINEAR_HISTOGRAM();"
  },
  {
    "name": "LN",
    "usage": "LN(x)",
    "description": "Returns the natural logarithm of x to base e.",
    "category": "Numeric",
    "example": "select ln(1);"
  },
  {
    "name": "LOCAL",
    "usage": "LOCAL(file_path = file_path, backend_id = backend_id, format = format [, ...)",
    "description": "Local table-valued-function(tvf), allows users to read and access local file contents on be node, just like accessing relational table.",
    "category": "Table-Valued",
    "example": "SELECT LOCAL();"
  },
  {
    "name": "LOCALTIME",
    "usage": "LOCALTIME(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT LOCALTIME();"
  },
  {
    "name": "LOCALTIMESTAMP",
    "usage": "LOCALTIMESTAMP(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT LOCALTIMESTAMP();"
  },
  {
    "name": "LOCATE",
    "usage": "LOCATE ( substr , str [, pos ] )",
    "description": "Returns the position of substr in str (counting from 1). If the third parameter pos is specified,",
    "category": "String",
    "example": "SELECT LOCATE('bar', 'foobarbar'),LOCATE('xbar', 'foobar'),LOCATE('bar', 'foobarbar', 5)"
  },
  {
    "name": "LOG",
    "usage": "LOG([b, ]x)",
    "description": "Returns the logarithm of x based on base b.",
    "category": "Numeric",
    "example": "select log(5,1);"
  },
  {
    "name": "LOG10",
    "usage": "LOG10(x)",
    "description": "Returns the logarithm of x to base 10.",
    "category": "Numeric",
    "example": "select log10(1);"
  },
  {
    "name": "LOG2",
    "usage": "LOG2(x)",
    "description": "Returns the logarithm of x to base 2.",
    "category": "Numeric",
    "example": "select log2(1);"
  },
  {
    "name": "LOWER",
    "usage": "LOWER ( str )",
    "description": "Convert all strings in the parameter to lowercase.",
    "category": "String",
    "example": "SELECT LCASE(\"AbC123\"),LOWER(\"AbC123\")"
  },
  {
    "name": "LPAD",
    "usage": "LPAD ( str , len , pad)",
    "description": "Returns a string of length len (starting from the first letter) in str.",
    "category": "String",
    "example": "SELECT LPAD(\"hi\", 5, \"xy\"),LPAD(\"hi\", 1, \"xy\"),LPAD(\"\", 0, \"\")"
  },
  {
    "name": "LTRIM",
    "usage": "LTRIM( str [, trim_chars ] )",
    "description": "The LTRIM function is used to remove consecutive spaces or specified characters from the left side (leading) of a string.",
    "category": "String",
    "example": "SELECT ltrim('   ab d') str;"
  },
  {
    "name": "LTRIM_IN",
    "usage": "LTRIM_IN(str [, rhs])",
    "description": "The LTRIMIN function removes specified characters from the left side of a string. When no character set is specified,",
    "category": "String",
    "example": "SELECT LTRIM_IN();"
  },
  {
    "name": "MAKEDATE",
    "usage": "MAKEDATE(year, day_of_year)",
    "description": "Returns a date based on the specified year and the day of the year (dayofyear).",
    "category": "Date & Time",
    "example": "SELECT MAKEDATE(2021, 1), MAKEDATE(2021, 100), MAKEDATE(2021, 400);"
  },
  {
    "name": "MAKETIME",
    "usage": "MAKETIME(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT MAKETIME();"
  },
  {
    "name": "MAKE_SET",
    "usage": "MAKE_SET(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT MAKE_SET();"
  },
  {
    "name": "MAP",
    "usage": "MAP( key1 , value1 [, key2,value2 ... ])",
    "description": "Constructs a Map of a specific type using some set of key-value pairs",
    "category": "Map",
    "example": "select map(1, \"100\", 0.1, 2),map(1, \"100\", 0.1, 2)[1];"
  },
  {
    "name": "MAP_AGG",
    "usage": "MAP_AGG(expr1, expr2)",
    "description": "The MAPAGG function is used to form a mapping structure based on key-value pairs from multiple rows of data.",
    "category": "Aggregate",
    "example": "create table nation(\n    n_nationkey int,\n    n_name varchar(32),\n    n_regionkey int\n) properties('replication_num' = '1');"
  },
  {
    "name": "MAP_AGG_V1",
    "usage": "MAP_AGG_V1(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT MAP_AGG_V1();"
  },
  {
    "name": "MAP_AGG_V2",
    "usage": "MAP_AGG_V2(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT MAP_AGG_V2();"
  },
  {
    "name": "MAP_CONTAINS_ENTRY",
    "usage": "MAP_CONTAINS_ENTRY(...)",
    "description": "Built-in map function in Apache Doris.",
    "category": "Map",
    "example": "SELECT MAP_CONTAINS_ENTRY();"
  },
  {
    "name": "MAP_CONTAINS_KEY",
    "usage": "MAP_CONTAINS_KEY(map, key)",
    "description": "Determines whether the given map contains a specific key key",
    "category": "Map",
    "example": "select map_contains_key(map(null, 1, 2, null), null),map_contains_key(map(1, \"100\", 0.1, 2), 0.11);"
  },
  {
    "name": "MAP_CONTAINS_VALUE",
    "usage": "MAP_CONTAINS_VALUE(map, value)",
    "description": "Determines whether the given map contains a specific value value",
    "category": "Map",
    "example": "select map_contains_value(map(null, 1, 2, null), null),map_contains_value(map(1, \"100\", 0.1, 2), 101);"
  },
  {
    "name": "MAP_ENTRIES",
    "usage": "MAP_ENTRIES(...)",
    "description": "Built-in map function in Apache Doris.",
    "category": "Map",
    "example": "SELECT MAP_ENTRIES();"
  },
  {
    "name": "MAP_KEYS",
    "usage": "MAP_KEYS(map)",
    "description": "Extract the keys of the given map into an ARRAY of the corresponding type",
    "category": "Map",
    "example": "select map_keys(map()),map_keys(map(1, \"100\", 0.1, 2));"
  },
  {
    "name": "MAP_SIZE",
    "usage": "MAP_SIZE(map)",
    "description": "Count the number of elements in a Map",
    "category": "Map",
    "example": "select map_size(map()),map_size(map(1, \"100\", 0.1, 2));"
  },
  {
    "name": "MAP_VALUES",
    "usage": "MAP_VALUES(map)",
    "description": "Extract the values of the given map into an ARRAY of the corresponding type",
    "category": "Map",
    "example": "select map_values(map()),map_values(map(1, \"100\", 0.1, 2));"
  },
  {
    "name": "MASK",
    "usage": "MASK(str [, upper [, lower [, number ]]])",
    "description": "The MASK function is to shield data to protect sensitive information, and it is commonly used in data anonymization scenarios.",
    "category": "String",
    "example": "select mask('abc123EFG');"
  },
  {
    "name": "MASK_FIRST_N",
    "usage": "MASK_FIRST_N( str [, n ])",
    "description": "The MASKFIRSTN function is mainly used to mask the first N bytes of data to protect sensitive information,",
    "category": "String",
    "example": "select mask_first_n(\"1234-5678-8765-4321\", 4);"
  },
  {
    "name": "MASK_LAST_N",
    "usage": "MASK_LAST_N( str [, n ])",
    "description": "The MASKLASTN function is mainly used to mask the last N bytes of data to protect sensitive information,",
    "category": "String",
    "example": "select mask_last_n(\"1234-5678-8765-4321\", 4);"
  },
  {
    "name": "MAX",
    "usage": "MAX(expr)",
    "description": "The MAX function returns the maximum value of the expression.",
    "category": "Aggregate",
    "example": "select max(scan_rows) from log_statis group by datetime;"
  },
  {
    "name": "MAX_BY",
    "usage": "MAX_BY(expr1, expr2)",
    "description": "The MAXBY function is used to return the corresponding associated value based on the maximum value of the specified column.",
    "category": "Aggregate",
    "example": "-- setup\ncreate table tbl(k1 int, k2 int, k3 int, k4 int) distributed by hash(k1) buckets 1 properties (\"replication_num\"=\"1\");\ninsert into tbl values (0,3,2,100),(1,2,3,4),(4,3,2,1),(3,4,2,1);"
  },
  {
    "name": "MD5",
    "usage": "MD5( str )",
    "description": "Calculates an MD5 128-bit checksum for the string",
    "category": "Encryption & Hash",
    "example": "select md5(\"abc\");"
  },
  {
    "name": "MD5SUM",
    "usage": "MD5SUM( str [ , str ... ] )",
    "description": "Calculates an MD5 128-bit checksum for the strings",
    "category": "Encryption & Hash",
    "example": "select md5(\"abcd\"),md5sum(\"ab\",\"cd\");"
  },
  {
    "name": "MEDIAN",
    "usage": "MEDIAN(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT MEDIAN();"
  },
  {
    "name": "MERGE",
    "usage": "MERGE(agg_state)",
    "description": "The aggregated intermediate results are aggregated and calculated to obtain the actual result.",
    "category": "Combinator",
    "example": "mysql [test]>select avg_merge(avg_state(1)) from d_table;\n+-------------------------+\n| avg_merge(avg_state(1)) |\n+-------------------------+\n|                       1 |"
  },
  {
    "name": "MICROSECOND",
    "usage": "MICROSECOND(date)",
    "description": "Extracts the microsecond part from a datetime value. The returned range is from 0 to 999999.",
    "category": "Date & Time",
    "example": "SELECT MICROSECOND(CAST('1999-01-02 10:11:12.000123' AS DATETIMEV2(6))) AS microsecond;"
  },
  {
    "name": "MICROSECONDS_ADD",
    "usage": "MICROSECONDS_ADD(basetime, delta)",
    "description": "Adds a specified number of microseconds to a datetime value and returns a new datetime value.",
    "category": "Date & Time",
    "example": "SELECT NOW(3) AS current_time, MICROSECONDS_ADD(NOW(3), 100000) AS after_add;"
  },
  {
    "name": "MICROSECONDS_DIFF",
    "usage": "MICROSECONDS_DIFF(enddate, startdate)",
    "description": "Calculates the microsecond difference between two datetime values.",
    "category": "Date & Time",
    "example": "SELECT MICROSECONDS_DIFF('2020-12-25 21:00:00.623000', '2020-12-25 21:00:00.123000');"
  },
  {
    "name": "MICROSECONDS_SUB",
    "usage": "MICROSECONDS_SUB(basetime, delta)",
    "description": "Subtracts a specified number of microseconds from a datetime value and returns a new datetime value.",
    "category": "Date & Time",
    "example": "SELECT NOW(3) AS current_time, MICROSECONDS_SUB(NOW(3), 100000) AS after_sub;"
  },
  {
    "name": "MICROSECOND_FROM_UNIXTIME",
    "usage": "MICROSECOND_FROM_UNIXTIME(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT MICROSECOND_FROM_UNIXTIME();"
  },
  {
    "name": "MICROSECOND_TIMESTAMP",
    "usage": "MICROSECOND_TIMESTAMP(datetime)",
    "description": "The function converts a DATETIME value into a Unix timestamp (in microseconds) starting from 1970-01-01 00:00:00 UTC.",
    "category": "Date & Time",
    "example": "SELECT MICROSECOND_TIMESTAMP('2025-01-23 12:34:56.123456');"
  },
  {
    "name": "MID",
    "usage": "MID(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT MID();"
  },
  {
    "name": "MILLISECONDS_ADD",
    "usage": "MILLISECONDS_ADD(basetime, delta)",
    "description": "Adds a specified number of milliseconds to a datetime value and returns a new datetime value.",
    "category": "Date & Time",
    "example": "SELECT MILLISECONDS_ADD('2023-09-08 16:02:08.435123', 1);"
  },
  {
    "name": "MILLISECONDS_DIFF",
    "usage": "MILLISECONDS_DIFF(enddate, startdate)",
    "description": "Calculates the millisecond difference between two datetime values.",
    "category": "Date & Time",
    "example": "SELECT MILLISECONDS_DIFF('2020-12-25 21:00:00.623000', '2020-12-25 21:00:00.123000');"
  },
  {
    "name": "MILLISECONDS_SUB",
    "usage": "MILLISECONDS_SUB(basetime, delta)",
    "description": "Subtracts a specified number of milliseconds from a datetime value and returns a new datetime value.",
    "category": "Date & Time",
    "example": "SELECT MILLISECONDS_SUB('2023-09-08 16:02:08.435123', 1);"
  },
  {
    "name": "MILLISECOND_TIMESTAMP",
    "usage": "MILLISECOND_TIMESTAMP(datetime)",
    "description": "The MILLISECONDTIMESTAMP function converts a DATETIME value into a Unix timestamp (in milliseconds) starting from 1970-01-01 00:00:00 UTC.",
    "category": "Date & Time",
    "example": "SELECT MILLISECOND_TIMESTAMP('2025-01-23 12:34:56');"
  },
  {
    "name": "MIN",
    "usage": "MIN(expr)",
    "description": "The MIN function returns the minimum value of the expression.",
    "category": "Aggregate",
    "example": "select MIN(scan_rows) from log_statis group by datetime;"
  },
  {
    "name": "MINUTE",
    "usage": "MINUTE(datetime)",
    "description": "Extracts the minute part from a datetime value. The returned value ranges from 0 to 59.",
    "category": "Date & Time",
    "example": "SELECT MINUTE('2018-12-31 23:59:59');"
  },
  {
    "name": "MINUTES_ADD",
    "usage": "MINUTES_ADD(datetime, minutes)",
    "description": "Adds a specified number of minutes to a datetime value and returns a new datetime value.",
    "category": "Date & Time",
    "example": "SELECT MINUTES_ADD(\"2020-02-02\", 1);"
  },
  {
    "name": "MINUTES_DIFF",
    "usage": "MINUTES_DIFF(enddate, startdate)",
    "description": "Calculates the minute difference between two datetime values. The result is the number of minutes from startdate subtracted from enddate.",
    "category": "Date & Time",
    "example": "SELECT MINUTES_DIFF('2020-12-25 22:00:00', '2020-12-25 21:00:00');"
  },
  {
    "name": "MINUTES_SUB",
    "usage": "MINUTES_SUB(date, minutes)",
    "description": "Subtracts a specified number of minutes from a datetime value and returns a new datetime value.",
    "category": "Date & Time",
    "example": "SELECT MINUTES_SUB(\"2020-02-02 02:02:02\", 1);"
  },
  {
    "name": "MINUTE_CEIL",
    "usage": "MINUTE_CEIL(datetime)",
    "description": "Rounds up a datetime value to the nearest specified minute interval. If a starting time (origin) is provided,",
    "category": "Date & Time",
    "example": "SELECT MINUTE_CEIL(\"2023-07-13 22:28:18\", 5);"
  },
  {
    "name": "MINUTE_FLOOR",
    "usage": "MINUTE_FLOOR(datetime)",
    "description": "Rounds down a datetime value to the nearest specified minute interval. If a starting time (origin) is provided,",
    "category": "Date & Time",
    "example": "SELECT MINUTE_FLOOR(\"2023-07-13 22:28:18\", 5);"
  },
  {
    "name": "MINUTE_FROM_UNIXTIME",
    "usage": "MINUTE_FROM_UNIXTIME(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT MINUTE_FROM_UNIXTIME();"
  },
  {
    "name": "MINUTE_MICROSECOND",
    "usage": "MINUTE_MICROSECOND(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT MINUTE_MICROSECOND();"
  },
  {
    "name": "MINUTE_SECOND",
    "usage": "MINUTE_SECOND(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT MINUTE_SECOND();"
  },
  {
    "name": "MIN_BY",
    "usage": "MIN_BY(expr1, expr2)",
    "description": "The MINBY function is used to return the corresponding associated value based on the minimum value of the specified column.",
    "category": "Aggregate",
    "example": "select * from tbl;"
  },
  {
    "name": "MOD",
    "usage": "MOD(col_a , col_b)",
    "description": "Find the remainder of a divided by b for the integer type. For the floating-point type, please use the fmod function.",
    "category": "Numeric",
    "example": "select mod(10, 3);"
  },
  {
    "name": "MONEY_FORMAT",
    "usage": "MONEY_FORMAT(number)",
    "description": "The number is output in currency format, the integer part is separated by commas every three bits, and the decimal part is reserved for two bits.",
    "category": "String",
    "example": "select money_format(17014116);"
  },
  {
    "name": "MONTH",
    "usage": "MONTH(date)",
    "description": "Extracts the month value from a datetime value. The returned value ranges from 1 to 12, representing the 12 months of the year.",
    "category": "Date & Time",
    "example": "SELECT MONTH('1987-01-01');"
  },
  {
    "name": "MONTHNAME",
    "usage": "MONTHNAME(date)",
    "description": "Returns the English name of the month corresponding to a given date.",
    "category": "Date & Time",
    "example": "SELECT MONTHNAME('2008-02-03 00:00:00');"
  },
  {
    "name": "MONTHS_ADD",
    "usage": "MONTHS_ADD(<datetime/date>, nums)",
    "description": "The MONTHSADD function is used to add or subtract a specified number of months to a given date and returns the resulting date.",
    "category": "Date & Time",
    "example": "sql\nselect months_add(\"2020-01-31 02:02:02\", 1),months_add(\"2020-01-31\", 1),months_add(\"2020-01-31\", -1);"
  },
  {
    "name": "MONTHS_BETWEEN",
    "usage": "MONTHS_BETWEEN(enddate, startdate [, round_type])",
    "description": "The MONTHSBETWEEN function calculates the floating-point number of months between two dates.",
    "category": "Date & Time",
    "example": "select months_between('2020-12-26','2020-10-25'),months_between('2020-10-25 10:00:00','2020-12-26 11:00:00',false);"
  },
  {
    "name": "MONTHS_DIFF",
    "usage": "MONTHS_DIFF(enddate, startdate)",
    "description": "The MONTHSDIFF function calculates the number of complete months between two dates.",
    "category": "Date & Time",
    "example": "select months_diff('2020-12-25','2020-10-25'),months_diff('2020-10-25 10:00:00','2020-12-25 11:00:00');"
  },
  {
    "name": "MONTHS_SUB",
    "usage": "MONTHS_SUB(<datetime/date>, nums)",
    "description": "The MONTHSSUB function is used to add or subtract a specified number of months to a given date and returns the resulting date.",
    "category": "Date & Time",
    "example": "sql\nselect months_sub(\"2020-01-31 02:02:02\", 1),months_sub(\"2020-01-31\", 1),months_sub(\"2020-01-31\", -1);"
  },
  {
    "name": "MONTH_CEIL",
    "usage": "MONTH_CEIL(datetime)",
    "description": "Rounds up a datetime value to the nearest specified month interval. If a starting time (origin) is provided,",
    "category": "Date & Time",
    "example": "SELECT MONTH_CEIL(\"2023-07-13 22:28:18\", 5);"
  },
  {
    "name": "MONTH_FLOOR",
    "usage": "MONTH_FLOOR(datetime)",
    "description": "Rounds down a datetime value to the nearest specified month interval. If a starting time (origin) is provided,",
    "category": "Date & Time",
    "example": "SELECT MONTH_FLOOR(\"2023-07-13 22:28:18\", 5);"
  },
  {
    "name": "MULTI_DISTINCT_COUNT",
    "usage": "MULTI_DISTINCT_COUNT(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT MULTI_DISTINCT_COUNT();"
  },
  {
    "name": "MULTI_DISTINCT_GROUP_CONCAT",
    "usage": "MULTI_DISTINCT_GROUP_CONCAT(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT MULTI_DISTINCT_GROUP_CONCAT();"
  },
  {
    "name": "MULTI_DISTINCT_SUM",
    "usage": "MULTI_DISTINCT_SUM(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT MULTI_DISTINCT_SUM();"
  },
  {
    "name": "MULTI_DISTINCT_SUM0",
    "usage": "MULTI_DISTINCT_SUM0(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT MULTI_DISTINCT_SUM0();"
  },
  {
    "name": "MULTI_MATCH",
    "usage": "MULTI_MATCH(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT MULTI_MATCH();"
  },
  {
    "name": "MULTI_MATCH_ANY",
    "usage": "MULTI_MATCH_ANY(VARCHAR haystack, ARRAY<VARCHAR> patterns)",
    "description": "Checks whether the string haystack matches the regular expressions patterns in re2 syntax.",
    "category": "String",
    "example": "mysql> select multi_match_any('Hello, World!', ['hello', '!', 'world']);\n+-----------------------------------------------------------+\n| multi_match_any('Hello, World!', ['hello', '!', 'world']) |\n+-----------------------------------------------------------+\n| 1                                                         |"
  },
  {
    "name": "MULTI_SEARCH_ALL_POSITIONS",
    "usage": "MULTI_SEARCH_ALL_POSITIONS(VARCHAR haystack, ARRAY<VARCHAR> needles)",
    "description": "Returns an ARRAY where the i-th element is the position of the i-th element in needles(i.e. needle)'s first occurrence in the string haystack.",
    "category": "String",
    "example": "SELECT MULTI_SEARCH_ALL_POSITIONS();"
  },
  {
    "name": "MURMUR_HASH3_128",
    "usage": "MURMUR_HASH3_128(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT MURMUR_HASH3_128();"
  },
  {
    "name": "MURMUR_HASH3_32",
    "usage": "MURMUR_HASH3_32( str [ , str ... ] )",
    "description": "Calculate 32-bit murmur3 hash value",
    "category": "Encryption & Hash",
    "example": "select murmur_hash3_32(null), murmur_hash3_32(\"hello\"), murmur_hash3_32(\"hello\", \"world\");"
  },
  {
    "name": "MURMUR_HASH3_64",
    "usage": "MURMUR_HASH3_64( str [ , str ... ] )",
    "description": "Calculate 64-bit murmur3 hash value",
    "category": "Encryption & Hash",
    "example": "select murmur_hash3_64(null), murmur_hash3_64(\"hello\"), murmur_hash3_64(\"hello\", \"world\");"
  },
  {
    "name": "MURMUR_HASH3_64_V2",
    "usage": "MURMUR_HASH3_64_V2(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT MURMUR_HASH3_64_V2();"
  },
  {
    "name": "MURMUR_HASH3_U128",
    "usage": "MURMUR_HASH3_U128(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT MURMUR_HASH3_U128();"
  },
  {
    "name": "MURMUR_HASH3_U64_V2",
    "usage": "MURMUR_HASH3_U64_V2(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT MURMUR_HASH3_U64_V2();"
  },
  {
    "name": "MV_INFOS",
    "usage": "MV_INFOS(database=database)",
    "description": "Table function, generating temporary tables for asynchronous materialized views,",
    "category": "Table-Valued",
    "example": "SELECT MV_INFOS();"
  },
  {
    "name": "NAMED_STRUCT",
    "usage": "NAMED_STRUCT( field_name , filed_value [ , field_name , filed_value ... ] )",
    "description": "Construct and return a struct based on the given strings and values. Notes:",
    "category": "Struct",
    "example": "select named_struct('f1', 1, 'f2', 'a', 'f3', \"abc\"),named_struct('a', null, 'b', \"v\");"
  },
  {
    "name": "NDV",
    "usage": "NDV(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT NDV();"
  },
  {
    "name": "NEGATIVE",
    "usage": "NEGATIVE(x)",
    "description": "Returns the negative value of the parameter x.",
    "category": "Numeric",
    "example": "SELECT negative(-10);"
  },
  {
    "name": "NEXT_DAY",
    "usage": "NEXT_DAY(<datetime/date>, day_of_week)",
    "description": "The NEXTDAY function is used to return the first date that is later than the given date and matches the specified day of the week.",
    "category": "Date & Time",
    "example": "sql\nselect next_day(\"2020-01-31 02:02:02\", \"MONDAY\"),next_day(\"2020-01-31\", \"MONDAY\");"
  },
  {
    "name": "NGRAM_SEARCH",
    "usage": "NGRAM_SEARCH(VARCHAR text,VARCHAR pattern,INT gram_num)",
    "description": "Calculate the N-gram similarity between text and pattern. The similarity ranges from 0 to 1,",
    "category": "String",
    "example": "mysql> select ngram_search('123456789' , '12345' , 3);\n+---------------------------------------+\n| ngram_search('123456789', '12345', 3) |\n+---------------------------------------+\n|                                   0.6 |"
  },
  {
    "name": "NON_NULLABLE",
    "usage": "NON_NULLABLE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT NON_NULLABLE();"
  },
  {
    "name": "NORMALIZE_JSONB_NUMBERS_TO_DOUBLE",
    "usage": "NORMALIZE_JSONB_NUMBERS_TO_DOUBLE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT NORMALIZE_JSONB_NUMBERS_TO_DOUBLE();"
  },
  {
    "name": "NORMALIZE_JSON_NUMBERS_TO_DOUBLE",
    "usage": "NORMALIZE_JSON_NUMBERS_TO_DOUBLE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT NORMALIZE_JSON_NUMBERS_TO_DOUBLE();"
  },
  {
    "name": "NORMAL_CDF",
    "usage": "NORMAL_CDF(mean, sd, x)",
    "description": "Computes the Cumulative distribution function (CDF) of the normal distribution at value x.",
    "category": "Numeric",
    "example": "select normal_cdf(10, 9, 10);"
  },
  {
    "name": "NOT_NULL_OR_EMPTY",
    "usage": "NOT_NULL_OR_EMPTY (str)",
    "description": "The notnullorempty function checks if the given value is neither NULL nor empty.",
    "category": "Conditional",
    "example": "select not_null_or_empty(null);"
  },
  {
    "name": "NOW",
    "usage": "NOW([precision])",
    "description": "The function retrieves the current system time and returns it as a datetime value (DATETIME).",
    "category": "Date & Time",
    "example": "select NOW(), NOW(3), NOW(6);"
  },
  {
    "name": "NTILE",
    "usage": "NTILE( constant_value )",
    "description": "NTILE() is a window function that divides an ordered dataset into a specified number of approximately equal buckets.",
    "category": "Window",
    "example": "SELECT NTILE();"
  },
  {
    "name": "NULLABLE",
    "usage": "NULLABLE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT NULLABLE();"
  },
  {
    "name": "NULLIF",
    "usage": "NULLIF(expr1, expr2)",
    "description": "Returns NULL if the two input values are equal; otherwise, returns the first input value.",
    "category": "Conditional",
    "example": "SELECT NULLIF(1, 1);"
  },
  {
    "name": "NULL_OR_EMPTY",
    "usage": "NULL_OR_EMPTY (str)",
    "description": "The nullorempty function checks if the given value is NULL or an empty string. It returns true if the input value is NULL or an empty string,",
    "category": "String",
    "example": "select null_or_empty(null);"
  },
  {
    "name": "NUMBERS",
    "usage": "NUMBERS( number = number [, const_value = const_value ] )",
    "description": "Table function that generates a temporary table containing only one column with the column name number and all element values are constvalue if",
    "category": "Table-Valued",
    "example": "select * from numbers(\"number\" = \"5\");"
  },
  {
    "name": "NVL",
    "usage": "NVL(...)",
    "description": "Built-in conditional function in Apache Doris.",
    "category": "Conditional",
    "example": "SELECT NVL();"
  },
  {
    "name": "OCTET_LENGTH",
    "usage": "OCTET_LENGTH(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT OCTET_LENGTH();"
  },
  {
    "name": "ORTHOGONAL_BITMAP_EXPR_CALCULATE",
    "usage": "ORTHOGONAL_BITMAP_EXPR_CALCULATE(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT ORTHOGONAL_BITMAP_EXPR_CALCULATE();"
  },
  {
    "name": "ORTHOGONAL_BITMAP_EXPR_CALCULATE_COUNT",
    "usage": "ORTHOGONAL_BITMAP_EXPR_CALCULATE_COUNT(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT ORTHOGONAL_BITMAP_EXPR_CALCULATE_COUNT();"
  },
  {
    "name": "ORTHOGONAL_BITMAP_INTERSECT",
    "usage": "ORTHOGONAL_BITMAP_INTERSECT(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT ORTHOGONAL_BITMAP_INTERSECT();"
  },
  {
    "name": "ORTHOGONAL_BITMAP_INTERSECT_COUNT",
    "usage": "ORTHOGONAL_BITMAP_INTERSECT_COUNT(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT ORTHOGONAL_BITMAP_INTERSECT_COUNT();"
  },
  {
    "name": "ORTHOGONAL_BITMAP_UNION_COUNT",
    "usage": "ORTHOGONAL_BITMAP_UNION_COUNT(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT ORTHOGONAL_BITMAP_UNION_COUNT();"
  },
  {
    "name": "OVERLAY",
    "usage": "OVERLAY(str, pos, len, newstr)",
    "description": "The OVERLAY function is used to replace a part of a string with another string.",
    "category": "String",
    "example": "select overlay('Quadratic', 3, 4, 'What');"
  },
  {
    "name": "PARQUET_BLOOM_PROBE",
    "usage": "PARQUET_BLOOM_PROBE(...)",
    "description": "Built-in table-valued function in Apache Doris.",
    "category": "Table-Valued",
    "example": "SELECT PARQUET_BLOOM_PROBE();"
  },
  {
    "name": "PARQUET_FILE_METADATA",
    "usage": "PARQUET_FILE_METADATA(...)",
    "description": "Built-in table-valued function in Apache Doris.",
    "category": "Table-Valued",
    "example": "SELECT PARQUET_FILE_METADATA();"
  },
  {
    "name": "PARQUET_KV_METADATA",
    "usage": "PARQUET_KV_METADATA(...)",
    "description": "Built-in table-valued function in Apache Doris.",
    "category": "Table-Valued",
    "example": "SELECT PARQUET_KV_METADATA();"
  },
  {
    "name": "PARQUET_META",
    "usage": "PARQUET_META(...)",
    "description": "Built-in table-valued function in Apache Doris.",
    "category": "Table-Valued",
    "example": "SELECT PARQUET_META();"
  },
  {
    "name": "PARSE_DATA_SIZE",
    "usage": "PARSE_DATA_SIZE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT PARSE_DATA_SIZE();"
  },
  {
    "name": "PARSE_URL",
    "usage": "PARSE_URL( url, name )",
    "description": "The PARSEURL function is mainly used to parse URL strings and extract various components from them, such as protocols, hosts, paths, query parameters,",
    "category": "String",
    "example": "SELECT parse_url ('https://doris.apache.org/', 'HOST');"
  },
  {
    "name": "PARTITIONS",
    "usage": "PARTITIONS( catalog=catalog, database=database, table=table )",
    "description": "The table function generates a temporary partition TABLE, which allows you to view the PARTITION list of a certain TABLE.",
    "category": "Table-Valued",
    "example": "SELECT PARTITIONS();"
  },
  {
    "name": "PARTITION_VALUES",
    "usage": "PARTITION_VALUES( catalog=catalog, database=database, table=table )",
    "description": "Table function that generates a temporary table of partition values, allowing you to view the list of partition values for a specific TABLE.",
    "category": "Table-Valued",
    "example": "SELECT PARTITION_VALUES();"
  },
  {
    "name": "PASSWORD",
    "usage": "PASSWORD(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT PASSWORD();"
  },
  {
    "name": "PERCENTILE",
    "usage": "PERCENTILE(col, p)",
    "description": "Calculates the exact percentile, suitable for small datasets. First sorts the specified column in descending order,",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE sales_data\n(\n    product_id INT,\n    sale_price DECIMAL(10, 2)"
  },
  {
    "name": "PERCENTILE_APPROX",
    "usage": "PERCENTILE_APPROX(col, p [, compression])",
    "description": "The PERCENTILEAPPROX function is used to calculate approximate percentiles, primarily for large datasets. Compared to the PERCENTILE function,",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE response_times (\n    request_id INT,\n    response_time DECIMAL(10, 2)\n) DUPLICATE KEY(`request_id`)"
  },
  {
    "name": "PERCENTILE_APPROX_WEIGHTED",
    "usage": "PERCENTILE_APPROX_WEIGHTED(col, weight, p [, compression])",
    "description": "The PERCENTILEAPPROXWEIGHTED function calculates weighted approximate percentiles,",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE weighted_scores (\n    student_id INT,\n    score DECIMAL(10, 2),\n    weight INT"
  },
  {
    "name": "PERCENTILE_ARRAY",
    "usage": "PERCENTILE_ARRAY(col, array_p)",
    "description": "The PERCENTILEARRAY function calculates exact percentile arrays, allowing multiple percentile values to be computed at once.",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE sales_data (\n    id INT,\n    amount DECIMAL(10, 2)\n) DUPLICATE KEY(`id`)"
  },
  {
    "name": "PERCENTILE_CONT",
    "usage": "PERCENTILE_CONT(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT PERCENTILE_CONT();"
  },
  {
    "name": "PERCENTILE_RESERVOIR",
    "usage": "PERCENTILE_RESERVOIR(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT PERCENTILE_RESERVOIR();"
  },
  {
    "name": "PERCENT_RANK",
    "usage": "PERCENT_RANK()",
    "description": "PERCENTRANK() is a window function that calculates the relative rank of a row within a partition or result set, returning values from 0.0 to 1.0.",
    "category": "Window",
    "example": "CREATE TABLE test_percent_rank (\n    productLine VARCHAR,\n    orderYear INT,\n    orderValue DOUBLE,\n    percentile_rank DOUBLE"
  },
  {
    "name": "PERIOD_ADD",
    "usage": "PERIOD_ADD(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT PERIOD_ADD();"
  },
  {
    "name": "PERIOD_DIFF",
    "usage": "PERIOD_DIFF(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT PERIOD_DIFF();"
  },
  {
    "name": "PI",
    "usage": "PI()",
    "description": "Returns the constant Pi value.",
    "category": "Numeric",
    "example": "select Pi();"
  },
  {
    "name": "PMOD",
    "usage": "PMOD(x , y)",
    "description": "Returns the smallest positive solution of the modulo operation x mod y within the modular system, which is obtained by calculating (x % y + y) % y.",
    "category": "Numeric",
    "example": "SELECT PMOD(13,5);"
  },
  {
    "name": "POSEXPLODE",
    "usage": "POSEXPLODE(arr)",
    "description": "The posexplode table function expands an array column into multiple rows and adds a column indicating the position of each element,",
    "category": "Table Generating",
    "example": "sql\nCREATE TABLE IF NOT EXISTS `table_test`(\n            `id` INT NULL,\n            `name` TEXT NULL,\n            `score` array<string> NULL"
  },
  {
    "name": "POSEXPLODE_OUTER",
    "usage": "POSEXPLODE_OUTER(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT POSEXPLODE_OUTER();"
  },
  {
    "name": "POSITION",
    "usage": "POSITION(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT POSITION();"
  },
  {
    "name": "POSITIVE",
    "usage": "POSITIVE(x)",
    "description": "Returns the value itself.",
    "category": "Numeric",
    "example": "SELECT positive(-10);"
  },
  {
    "name": "POW",
    "usage": "POW(a, b)",
    "description": "Returns the value of the first argument raised to the power of the second argument.",
    "category": "Numeric",
    "example": "select pow(2, 0);"
  },
  {
    "name": "POWER",
    "usage": "POWER(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT POWER();"
  },
  {
    "name": "PREVIOUS_DAY",
    "usage": "PREVIOUS_DAY(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT PREVIOUS_DAY();"
  },
  {
    "name": "PROTOCOL",
    "usage": "PROTOCOL( url )",
    "description": "The PROTOCOL function is mainly used to extract the protocol part from a URL string.",
    "category": "String",
    "example": "SELECT protocol('https://doris.apache.org/');"
  },
  {
    "name": "QUANTILE_PERCENT",
    "usage": "QUANTILE_PERCENT(quantile_state, percent)",
    "description": "The QUANTILEPERCENT function is used to calculate the quantile value for a given percentage.",
    "category": "Quantile",
    "example": "CREATE TABLE IF NOT EXISTS quantile_state_agg_test (\n         `dt` int(11) NULL COMMENT \"\",\n         `id` int(11) NULL COMMENT \"\",\n         `price` quantile_state QUANTILE_UNION NOT NULL COMMENT \"\"\n        ) ENGINE=OLAP"
  },
  {
    "name": "QUANTILE_STATE_EMPTY",
    "usage": "QUANTILE_STATE_EMPTY()",
    "description": "Return an empty quantilestate type column.",
    "category": "Quantile",
    "example": "select quantile_percent(quantile_union(quantile_state_empty()), 0)"
  },
  {
    "name": "QUANTILE_STATE_FROM_BASE64",
    "usage": "QUANTILE_STATE_FROM_BASE64(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT QUANTILE_STATE_FROM_BASE64();"
  },
  {
    "name": "QUANTILE_STATE_TO_BASE64",
    "usage": "QUANTILE_STATE_TO_BASE64(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT QUANTILE_STATE_TO_BASE64();"
  },
  {
    "name": "QUANTILE_UNION",
    "usage": "QUANTILE_UNION(query_state)",
    "description": "The QUANTILEUNION function is used to merge intermediate results from multiple quantile calculations.",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE response_times (\n    request_id INT,\n    response_time DOUBLE,\n    region STRING"
  },
  {
    "name": "QUARTER",
    "usage": "QUARTER(datetime)",
    "description": "The function returns the quarter (1 to 4) of the given date. Each quarter includes three months:",
    "category": "Date & Time",
    "example": "SELECT QUARTER('2025-01-16'),QUARTER('2025-01-16 01:11:10');"
  },
  {
    "name": "QUARTERS_ADD",
    "usage": "QUARTERS_ADD(<date/datetime>, quarters)",
    "description": "The function adds or subtracts a specified number of quarters to/from a given date or datetime value and returns the resulting date.",
    "category": "Date & Time",
    "example": "select quarters_add(\"2020-01-31 02:02:02\", 1);"
  },
  {
    "name": "QUARTERS_DIFF",
    "usage": "QUARTERS_DIFF(enddate, startdate)",
    "description": "- When either enddate or startdate is NULL, returns NULL.",
    "category": "Date & Time",
    "example": "select QUARTERS_DIFF('2021-03-25', '2020-10-25'), QUARTERS_DIFF('2020-10-25 10:00:00', '2022-12-25 11:00:00');"
  },
  {
    "name": "QUARTERS_SUB",
    "usage": "QUARTERS_SUB(<date/datetime>, quarters)",
    "description": "The function adds or subtracts a specified number of quarters to/from a given date or datetime value and returns the resulting date.",
    "category": "Date & Time",
    "example": "select quarters_sub(\"2020-01-31 02:02:02\", 1);"
  },
  {
    "name": "QUARTER_CEIL",
    "usage": "QUARTER_CEIL(datetime)",
    "description": "Using '2022-01-01 00:00:00' as the period start point, with periods of 2 / 4 quarters each, return the next period start point closest to the input date.",
    "category": "Date & Time",
    "example": "SELECT QUARTER_CEIL();"
  },
  {
    "name": "QUARTER_FLOOR",
    "usage": "QUARTER_FLOOR(datetime)",
    "description": "Using '2022-01-01 00:00:00' as the period start point, with periods of 2 / 4 quarters each, return the period start point closest to the input date.",
    "category": "Date & Time",
    "example": "SELECT QUARTER_FLOOR();"
  },
  {
    "name": "QUERY",
    "usage": "QUERY( catalog = catalog, query = query_sql )",
    "description": "Query table function (table-valued-function, tvf) can be used to transparently transmit query statements directly to a catalog for data query",
    "category": "Table-Valued",
    "example": "SELECT QUERY();"
  },
  {
    "name": "QUOTE",
    "usage": "QUOTE(VARCHAR str)",
    "description": "Output all the strings in the argument as is and wrap them with ''",
    "category": "String",
    "example": "mysql> select quote('hello world!\\\\t');\n+-------------------------+\n| quote('hello world!\\t') |\n+-------------------------+\n| 'hello world!\\t'        |"
  },
  {
    "name": "RADIANS",
    "usage": "RADIANS(x)",
    "description": "Returns the value of x in radians, converted from degrees to radians.",
    "category": "Numeric",
    "example": "select radians(0);"
  },
  {
    "name": "RAND",
    "usage": "RAND(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT RAND();"
  },
  {
    "name": "RANDOM",
    "usage": "RANDOM()",
    "description": "Returns a random number between 0 and 1, or returns the required random number according to the parameters.",
    "category": "Numeric",
    "example": "select random();"
  },
  {
    "name": "RANDOM_BYTES",
    "usage": "RANDOM_BYTES( len )",
    "description": "The RANDOMBYTES function is used to generate a random byte sequence of the specified length.",
    "category": "String",
    "example": "select random_bytes(7);"
  },
  {
    "name": "RANK",
    "usage": "RANK()",
    "description": "RANK() is a window function that returns the rank of values in an ordered dataset. Rankings start at 1 and increment sequentially.",
    "category": "Window",
    "example": "SELECT RANK();"
  },
  {
    "name": "REGEXP",
    "usage": "REGEXP(str, pattern)",
    "description": "Performs a regular expression match on the string str, returning true if the match succeeds, otherwise false.",
    "category": "String",
    "example": "CREATE TABLE test ( k1 VARCHAR(255) ) properties(\"replication_num\"=\"1\")\nINSERT INTO test (k1) VALUES ('billie eillish'), ('It\\'s ok'), ('billie jean'), ('hello world');"
  },
  {
    "name": "REGEXP_COUNT",
    "usage": "REGEXP_COUNT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT REGEXP_COUNT();"
  },
  {
    "name": "REGEXP_EXTRACT",
    "usage": "REGEXP_EXTRACT(str, pattern, pos)",
    "description": "This is a function used to perform a regular match on a given string STR and extract the POS-th matching part that conforms to the specified pattern.",
    "category": "String",
    "example": "SELECT REGEXP_EXTRACT();"
  },
  {
    "name": "REGEXP_EXTRACT_ALL",
    "usage": "REGEXP_EXTRACT_ALL(str, pattern)",
    "description": "The REGEXPEXTRACTALL function is used to perform a regular expression match on a given string str and extract all the parts that match the first sub",
    "category": "String",
    "example": "SELECT REGEXP_EXTRACT_ALL();"
  },
  {
    "name": "REGEXP_EXTRACT_OR_NULL",
    "usage": "REGEXP_EXTRACT_OR_NULL(str, pattern, pos)",
    "description": "Extract the first substring that matches the target regular expression pattern from the text string,",
    "category": "String",
    "example": "SELECT REGEXP_EXTRACT_OR_NULL();"
  },
  {
    "name": "REGEXP_REPLACE",
    "usage": "REGEXP_REPLACE(str, pattern, repl)",
    "description": "Regular matching of STR strings, replacing the part hitting pattern with a new string.",
    "category": "String",
    "example": "SELECT REGEXP_REPLACE();"
  },
  {
    "name": "REGEXP_REPLACE_ONE",
    "usage": "REGEXP_REPLACE_ONE(str, pattern, repl)",
    "description": "The REGEXPREPLACEONE function is a powerful tool designed to perform regular expression matching on a given string.",
    "category": "String",
    "example": "SELECT REGEXP_REPLACE_ONE();"
  },
  {
    "name": "REGEXP_SPLIT_TO_ARRAY",
    "usage": "REGEXP_SPLIT_TO_ARRAY(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT REGEXP_SPLIT_TO_ARRAY();"
  },
  {
    "name": "REGR_INTERCEPT",
    "usage": "REGR_INTERCEPT(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT REGR_INTERCEPT();"
  },
  {
    "name": "REGR_SLOPE",
    "usage": "REGR_SLOPE(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT REGR_SLOPE();"
  },
  {
    "name": "REPEAT",
    "usage": "REPEAT( str, count )",
    "description": "The REPEAT function is used to repeat a string a specified number of times.",
    "category": "String",
    "example": "SELECT repeat(\"a\", 3);"
  },
  {
    "name": "REPLACE",
    "usage": "REPLACE ( str, old, new )",
    "description": "The REPLACE function is used to replace a part of characters in a string with other characters.",
    "category": "String",
    "example": "SELECT replace('hello world', 'world', 'universe');"
  },
  {
    "name": "REPLACE_EMPTY",
    "usage": "REPLACE_EMPTY ( str, old, new )",
    "description": "The REPLACEEMPTY function is used to replace a part of the characters in a string with other characters. Unlike the REPLACE function,",
    "category": "String",
    "example": "SELECT replace('hello world', 'world', 'universe');"
  },
  {
    "name": "RETENTION",
    "usage": "RETENTION(event_1 [, event_2, ... , event_n])",
    "description": "The retention function takes as arguments a set of conditions from 1 to 32 arguments of type UInt8 that indicate whether a certain condition was met",
    "category": "Aggregate",
    "example": "SELECT RETENTION();"
  },
  {
    "name": "REVERSE",
    "usage": "REVERSE( seq )",
    "description": "The REVERSE function is used to reverse the order of characters in a string or the order of elements in an array.",
    "category": "String",
    "example": "SELECT reverse('hello');"
  },
  {
    "name": "RIGHT",
    "usage": "RIGHT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT RIGHT();"
  },
  {
    "name": "ROUND",
    "usage": "ROUND(x [ , d ])",
    "description": "Rounds the number x to the specified number of digits.",
    "category": "Numeric",
    "example": "select round(2.4);"
  },
  {
    "name": "ROUND_BANKERS",
    "usage": "ROUND_BANKERS(x [ , d])",
    "description": "Round x using the banker's rounding method and keep d decimal places. The default value of d is 0.",
    "category": "Numeric",
    "example": "SELECT ROUND_BANKERS();"
  },
  {
    "name": "ROW_NUMBER",
    "usage": "ROW_NUMBER()",
    "description": "ROWNUMBER() is a window function that assigns a unique sequential number to each row within a partition.",
    "category": "Window",
    "example": "SELECT ROW_NUMBER();"
  },
  {
    "name": "RPAD",
    "usage": "RPAD ( str , len , pad)",
    "description": "Used to pad the specified character on the right side of the original string until met the specified length.",
    "category": "String",
    "example": "SELECT rpad('hello', 1, '');"
  },
  {
    "name": "RTRIM",
    "usage": "RTRIM( str [, trim_chars ] )",
    "description": "The RTRIM function is used to remove consecutive spaces or specified characters from the right side (trailing) of a string.",
    "category": "String",
    "example": "SELECT rtrim('ab d   ') str;"
  },
  {
    "name": "RTRIM_IN",
    "usage": "RTRIM_IN(str[, rhs])",
    "description": "The RTRIMIN function removes specified characters from the right side of a string. When no character set is specified,",
    "category": "String",
    "example": "SELECT RTRIM_IN();"
  },
  {
    "name": "S3",
    "usage": "S3(uri = uri, s3.access_key = s3_access_key, s3.secret_key = s3_secret_key, ...)",
    "description": "The S3 table-valued function (TVF) allows users to read and access files stored on S3-compatible object storage as if accessing relational table-formatted data.",
    "category": "Table-Valued",
    "example": "SELECT S3();"
  },
  {
    "name": "SCHEMA",
    "usage": "SCHEMA(...)",
    "description": "Built-in system function in Apache Doris.",
    "category": "System",
    "example": "SELECT SCHEMA();"
  },
  {
    "name": "SCORE",
    "usage": "SCORE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SCORE();"
  },
  {
    "name": "SEARCH",
    "usage": "SEARCH(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SEARCH();"
  },
  {
    "name": "SEC",
    "usage": "SEC(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT SEC();"
  },
  {
    "name": "SECOND",
    "usage": "SECOND(datetime)",
    "description": "The function returns the second part of the specified datetime value. The range of seconds is 0 to 59.",
    "category": "Date & Time",
    "example": "select second('2018-12-31 23:59:59');"
  },
  {
    "name": "SECONDS_ADD",
    "usage": "SECONDS_ADD(datetime, seconds)",
    "description": "The function adds or subtracts a specified number of seconds to/from a given datetime value and returns the resulting datetime.",
    "category": "Date & Time",
    "example": "SELECT SECONDS_ADD('2025-01-23 12:34:56', 30),SECONDS_ADD('2025-01-23 12:34:56', -30);"
  },
  {
    "name": "SECONDS_DIFF",
    "usage": "SECONDS_DIFF(end_datetime, start_datetime)",
    "description": "The function calculates the time difference between two datetime values and returns the difference in seconds.",
    "category": "Date & Time",
    "example": "SELECT SECONDS_DIFF('2025-01-23 12:35:56', '2025-01-23 12:34:56');"
  },
  {
    "name": "SECONDS_SUB",
    "usage": "SECONDS_SUB(datetime, seconds)",
    "description": "The function subtracts or adds a specified number of seconds to/from a given datetime value and returns the resulting datetime.",
    "category": "Date & Time",
    "example": "SELECT SECONDS_SUB('2025-01-23 12:34:56', 30),SECONDS_SUB('2025-01-23 12:34:56', -30);"
  },
  {
    "name": "SECOND_CEIL",
    "usage": "SECOND_CEIL(datetime[, period][, origin_datetime])",
    "description": "The function aligns the input datetime value upwards to the nearest second boundary based on the specified period and returns the aligned datetime",
    "category": "Date & Time",
    "example": "SELECT SECOND_CEIL();"
  },
  {
    "name": "SECOND_FLOOR",
    "usage": "SECOND_FLOOR(datetime[, period][, origin_datetime])",
    "description": "The function aligns the input datetime value upwards to the nearest second boundary based on the specified period and returns the aligned datetime",
    "category": "Date & Time",
    "example": "SELECT SECOND_FLOOR();"
  },
  {
    "name": "SECOND_FROM_UNIXTIME",
    "usage": "SECOND_FROM_UNIXTIME(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SECOND_FROM_UNIXTIME();"
  },
  {
    "name": "SECOND_MICROSECOND",
    "usage": "SECOND_MICROSECOND(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT SECOND_MICROSECOND();"
  },
  {
    "name": "SECOND_TIMESTAMP",
    "usage": "SECOND_TIMESTAMP(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SECOND_TIMESTAMP();"
  },
  {
    "name": "SEC_TO_TIME",
    "usage": "SEC_TO_TIME(seconds)",
    "description": "The SECTOTIME function converts a value in seconds into a TIME type, returning the result in the format HH:MM:SS.",
    "category": "Date & Time",
    "example": "SELECT SEC_TO_TIME(59738);"
  },
  {
    "name": "SEM",
    "usage": "SEM(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT SEM();"
  },
  {
    "name": "SEQUENCE",
    "usage": "SEQUENCE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SEQUENCE();"
  },
  {
    "name": "SEQUENCE_COUNT",
    "usage": "SEQUENCE_COUNT(pattern, timestamp, cond_1 [, cond_2, ..., cond_n])",
    "description": "Counts the number of event chains that matched the pattern. The function searches event chains that do not overlap.",
    "category": "Aggregate",
    "example": "SELECT SEQUENCE_COUNT();"
  },
  {
    "name": "SEQUENCE_MATCH",
    "usage": "SEQUENCE_MATCH(pattern, timestamp, cond_1 [, cond_2, ..., cond_n])",
    "description": "Checks whether the sequence contains an event chain that matches the pattern.",
    "category": "Aggregate",
    "example": "SELECT SEQUENCE_MATCH();"
  },
  {
    "name": "SESSION_USER",
    "usage": "SESSION_USER()",
    "description": "Get the current username and IP of Doris connection, compatible with MySQL protocol.",
    "category": "System",
    "example": "select session_user();"
  },
  {
    "name": "SHA",
    "usage": "SHA(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SHA();"
  },
  {
    "name": "SHA1",
    "usage": "SHA1( str )",
    "description": "Use the SHA1 algorithm to digest the information.",
    "category": "Encryption & Hash",
    "example": "select sha(\"123\"), sha1(\"123\");"
  },
  {
    "name": "SHA2",
    "usage": "SHA2( str, digest_length)",
    "description": "The information is digested using SHA2.",
    "category": "Encryption & Hash",
    "example": "select sha2('abc', 224), sha2('abc', 384), sha2(NULL, 512);"
  },
  {
    "name": "SHUFFLE",
    "usage": "SHUFFLE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SHUFFLE();"
  },
  {
    "name": "SIGN",
    "usage": "SIGN(x)",
    "description": "Returns the sign of x. Negative, zero or positive numbers correspond to -1, 0 or 1 respectively.",
    "category": "Numeric",
    "example": "select sign(3);"
  },
  {
    "name": "SIGNBIT",
    "usage": "SIGNBIT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SIGNBIT();"
  },
  {
    "name": "SIN",
    "usage": "SIN(a)",
    "description": "Calculate the sine of the parameter",
    "category": "Numeric",
    "example": "select sin(1);"
  },
  {
    "name": "SINH",
    "usage": "SINH(...)",
    "description": "Built-in numeric function in Apache Doris.",
    "category": "Numeric",
    "example": "SELECT SINH();"
  },
  {
    "name": "SIZE",
    "usage": "SIZE(...)",
    "description": "Built-in array function in Apache Doris.",
    "category": "Array",
    "example": "SELECT SIZE();"
  },
  {
    "name": "SKEW",
    "usage": "SKEWNESS(col)",
    "description": "Returns the skewness of the expr expression. The forumula used for this function is 3-th centrol moment / ((variance)^{1.5}), when variance is zero,",
    "category": "Aggregate",
    "example": "CREATE TABLE statistic_test(\n    tag int, \n    val1 double not null, \n    val2 double null\n) DISTRIBUTED BY HASH(tag)"
  },
  {
    "name": "SKEWNESS",
    "usage": "SKEWNESS(col)",
    "description": "Returns the skewness of the expr expression. The forumula used for this function is 3-th centrol moment / ((variance)^{1.5}), when variance is zero,",
    "category": "Aggregate",
    "example": "CREATE TABLE statistic_test(\n    tag int, \n    val1 double not null, \n    val2 double null\n) DISTRIBUTED BY HASH(tag)"
  },
  {
    "name": "SKEW_POP",
    "usage": "SKEW_POP(col)",
    "description": "Returns the skewness of the expr expression. The forumula used for this function is 3-th centrol moment / ((variance)^{1.5}), when variance is zero,",
    "category": "Aggregate",
    "example": "CREATE TABLE statistic_test(\n    tag int, \n    val1 double not null, \n    val2 double null\n) DISTRIBUTED BY HASH(tag)"
  },
  {
    "name": "SLEEP",
    "usage": "SLEEP(...)",
    "description": "Built-in system function in Apache Doris.",
    "category": "System",
    "example": "SELECT SLEEP();"
  },
  {
    "name": "SM3",
    "usage": "SM3( str )",
    "description": "Calculation SM3 256-bit",
    "category": "Encryption & Hash",
    "example": "select sm3(\"abcd\");"
  },
  {
    "name": "SM3SUM",
    "usage": "SM3SUM( str [ , str ... ] )",
    "description": "Calculate multiple strings SM3 256-bit",
    "category": "Encryption & Hash",
    "example": "select sm3sum(\"ab\",\"cd\");"
  },
  {
    "name": "SM4_DECRYPT",
    "usage": "SM4_DECRYPT( str, key_str[, init_vector][, encryption_mode])",
    "description": "SM4 is a national standard symmetric key encryption algorithm, widely used in finance, communications, e-commerce and other fields.",
    "category": "Encryption & Hash",
    "example": "SELECT SM4_DECRYPT();"
  },
  {
    "name": "SM4_ENCRYPT",
    "usage": "SM4_ENCRYPT( str, key_str[, init_vector][, encryption_mode])",
    "description": "SM4 is a national standard symmetric key encryption algorithm, widely used in finance, communications, e-commerce and other fields.",
    "category": "Encryption & Hash",
    "example": "SELECT SM4_ENCRYPT();"
  },
  {
    "name": "SORT_JSONB_OBJECT_KEYS",
    "usage": "SORT_JSONB_OBJECT_KEYS(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SORT_JSONB_OBJECT_KEYS();"
  },
  {
    "name": "SORT_JSON_OBJECT_KEYS",
    "usage": "SORT_JSON_OBJECT_KEYS(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SORT_JSON_OBJECT_KEYS();"
  },
  {
    "name": "SOUNDEX",
    "usage": "SOUNDEX(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SOUNDEX();"
  },
  {
    "name": "SPACE",
    "usage": "SPACE ( len )",
    "description": "Generate a string consisting of a specified number of spaces.",
    "category": "String",
    "example": "SELECT space(10);"
  },
  {
    "name": "SPLIT",
    "usage": "SPLIT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SPLIT();"
  },
  {
    "name": "SPLIT_BY_REGEXP",
    "usage": "SPLIT_BY_REGEXP(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SPLIT_BY_REGEXP();"
  },
  {
    "name": "SPLIT_BY_STRING",
    "usage": "SPLIT_BY_STRING ( str, separator )",
    "description": "Split the input string into a string array according to the specified string.",
    "category": "String",
    "example": "SELECT split_by_string('', ',') AS result;"
  },
  {
    "name": "SPLIT_PART",
    "usage": "SPLIT_PART ( str, separator, part_index )",
    "description": "The SPLITPART function splits a string into multiple parts according to the specified separator and return one of the parts.",
    "category": "String",
    "example": "select split_part(\"hello world\", \" \", 1);"
  },
  {
    "name": "SQRT",
    "usage": "SQRT(a)",
    "description": "Returns the square root of a value, where the input value must be greater than or equal to 0.",
    "category": "Numeric",
    "example": "select sqrt(9),sqrt(2)"
  },
  {
    "name": "STARTS_WITH",
    "usage": "STARTS_WITH(str, prefix)",
    "description": "The STARTSWITH function checks if a string starts with a specified prefix. Returns true if the string starts with the specified prefix;",
    "category": "String",
    "example": "SELECT STARTS_WITH();"
  },
  {
    "name": "STATE",
    "usage": "STATE(arg...)",
    "description": "Returns the intermediate result of the aggregation function,",
    "category": "Combinator",
    "example": "mysql [test]>select avg_merge(t) from (select avg_union(avg_state(1)) as t from d_table group by k1)p;\n+----------------+\n| avg_merge(`t`) |\n+----------------+\n|              1 |"
  },
  {
    "name": "STD",
    "usage": "STD(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT STD();"
  },
  {
    "name": "STDDEV",
    "usage": "STDDEV(expr)",
    "description": "Returns the standard deviation of the expr expression",
    "category": "Aggregate",
    "example": "-- Create sample tables\nCREATE TABLE score_table (\n    student_id INT,\n    score DOUBLE\n) DISTRIBUTED BY HASH(student_id)"
  },
  {
    "name": "STDDEV_POP",
    "usage": "STDDEV_POP(expr)",
    "description": "Returns the standard deviation of the expr expression",
    "category": "Aggregate",
    "example": "-- Create sample tables\nCREATE TABLE score_table (\n    student_id INT,\n    score DOUBLE\n) DISTRIBUTED BY HASH(student_id)"
  },
  {
    "name": "STDDEV_SAMP",
    "usage": "STDDEV_SAMP(expr)",
    "description": "Returns the sample standard deviation of the expr expression",
    "category": "Aggregate",
    "example": "-- Create sample tables\nCREATE TABLE score_table (\n    student_id INT,\n    score DOUBLE\n) DISTRIBUTED BY HASH(student_id)"
  },
  {
    "name": "STRCMP",
    "usage": "STRCMP(str0, str1)",
    "description": "The STRCMP function compares two strings lexicographically. It returns an integer value indicating the result of the comparison.",
    "category": "String",
    "example": "SELECT STRCMP();"
  },
  {
    "name": "STRIP_NULL_VALUE",
    "usage": "STRIP_NULL_VALUE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT STRIP_NULL_VALUE();"
  },
  {
    "name": "STRLEFT",
    "usage": "STRLEFT(str, len)",
    "description": "The STRLEFT function returns a specified number of characters from the left side of a string. The length is measured in UTF8 characters.",
    "category": "String",
    "example": "SELECT STRLEFT();"
  },
  {
    "name": "STRRIGHT",
    "usage": "STRRIGHT(str, len)",
    "description": "The STRRIGHT function returns a specified number of characters from the right side of a string. The length is measured in UTF8 characters.",
    "category": "String",
    "example": "SELECT STRRIGHT();"
  },
  {
    "name": "STRUCT",
    "usage": "STRUCT( expr1 [ , expr2 ... ] )",
    "description": "construct an struct with variadic elements and return it, Tn could be column or literal",
    "category": "Struct",
    "example": "select struct(1, 'a', \"abc\"),struct(null, 1, null),struct(cast('2023-03-16' as datetime));"
  },
  {
    "name": "STRUCT_ELEMENT",
    "usage": "STRUCT_ELEMENT( struct, 'filed_location/filed_name')",
    "description": "Return a specific field within a data column of a struct.",
    "category": "Struct",
    "example": "select struct_element(named_struct('f1', 1, 'f2', 'a'), 'f2'),struct_element(named_struct('f1', 1, 'f2', 'a'), 1);"
  },
  {
    "name": "STR_TO_DATE",
    "usage": "STR_TO_DATE(datetime_str, format)",
    "description": "The function converts the input datetime string into a DATETIME value based on the specified format.",
    "category": "Date & Time",
    "example": "SELECT STR_TO_DATE();"
  },
  {
    "name": "STR_TO_MAP",
    "usage": "STR_TO_MAP(str [, pair_delimiter [, key_value_delimiter]])",
    "description": "Constructs a Map from a string.",
    "category": "Map",
    "example": "select str_to_map('a=1&b=2&c=3', '&', '=') as map1, str_to_map('x:10|y:20|z:30', '|', ':') as map2;"
  },
  {
    "name": "ST_ANGLE",
    "usage": "ST_ANGLE( point1, point2, point3)",
    "description": "Input three points. The first line is the straight line connecting point1 (first endpoint) and point2 (second endpoint).",
    "category": "Spatial",
    "example": "SELECT ST_Angle(ST_Point(1, 0),ST_Point(0, 0),ST_Point(0, 1));"
  },
  {
    "name": "ST_ANGLE_SPHERE",
    "usage": "ST_ANGLE_SPHERE( x_lng, x_lat, y_lng, y_lat)",
    "description": "Calculates the central angle (in degrees) between two points on the Earth's surface. The input parameters are, in order, the longitude of point X,",
    "category": "Spatial",
    "example": "SELECT ST_ANGLE_SPHERE();"
  },
  {
    "name": "ST_AREA_SQUARE_KM",
    "usage": "ST_AREA_SQUARE_KM( geo)",
    "description": "Calculates the area of a closed region on the Earth's surface in square kilometers. The input parameter is a geometric object (such as a Geopolygon,",
    "category": "Spatial",
    "example": "SELECT ST_AREA_SQUARE_KM();"
  },
  {
    "name": "ST_AREA_SQUARE_METERS",
    "usage": "ST_AREA_SQUARE_METERS( geo)",
    "description": "Calculates the area of a closed region on the Earth's surface in square meters.",
    "category": "Spatial",
    "example": "SELECT ST_AREA_SQUARE_METERS();"
  },
  {
    "name": "ST_ASBINARY",
    "usage": "ST_ASBINARY( geo)",
    "description": "Converts a geometric object into a standard WKB (Well-Known Binary) binary representation. WKB is a binary format for representing geospatial data,",
    "category": "Spatial",
    "example": "SELECT ST_ASBINARY();"
  },
  {
    "name": "ST_ASTEXT",
    "usage": "ST_ASTEXT( geo)",
    "description": "Converts a geometric object into its WKT (Well-Known Text) text representation. WKT is a text-based format for representing geospatial data,",
    "category": "Spatial",
    "example": "SELECT ST_ASTEXT();"
  },
  {
    "name": "ST_ASWKT",
    "usage": "ST_ASWKT(...)",
    "description": "Built-in spatial function in Apache Doris.",
    "category": "Spatial",
    "example": "SELECT ST_ASWKT();"
  },
  {
    "name": "ST_AZIMUTH",
    "usage": "ST_AZIMUTH( point1, point2)",
    "description": "Calculates the azimuth (in radians) between two points on the Earth's surface.",
    "category": "Spatial",
    "example": "SELECT ST_AZIMUTH();"
  },
  {
    "name": "ST_CIRCLE",
    "usage": "ST_CIRCLE( center_lng, center_lat, radius)",
    "description": "Converts a WKT (Well-Known Text) into a circle on the Earth's spherical surface.",
    "category": "Spatial",
    "example": "SELECT ST_CIRCLE();"
  },
  {
    "name": "ST_CONTAINS",
    "usage": "ST_CONTAINS( shape1, shape2)",
    "description": "Determines whether one geometric shape (shape1) completely contains another geometric shape (shape2).",
    "category": "Spatial",
    "example": "SELECT ST_CONTAINS();"
  },
  {
    "name": "ST_DISJOINT",
    "usage": "ST_DISJOINT( shape1, shape2 )",
    "description": "Determines whether two geometric shapes are completely disjoint (i.e., have no common points).",
    "category": "Spatial",
    "example": "SELECT ST_DISJOINT();"
  },
  {
    "name": "ST_DISTANCE",
    "usage": "ST_DISTANCE(...)",
    "description": "Built-in spatial function in Apache Doris.",
    "category": "Spatial",
    "example": "SELECT ST_DISTANCE();"
  },
  {
    "name": "ST_DISTANCE_SPHERE",
    "usage": "ST_DISTANCE_SPHERE( x_lng, x_lat, y_lng, y_lat)",
    "description": "Calculate the spherical distance between two points on the Earth, in meters. The input parameters are the longitude of point X, latitude of point X,",
    "category": "Spatial",
    "example": "SELECT ST_DISTANCE_SPHERE();"
  },
  {
    "name": "ST_GEOMETRYFROMTEXT",
    "usage": "ST_GEOMETRYFROMTEXT( wkt)",
    "description": "Convert a WKT (Well Known Text) to the corresponding memory geometry",
    "category": "Spatial",
    "example": "-- POINT example\nSELECT ST_AsText(ST_GeometryFromText(\"POINT (1 1)\"));"
  },
  {
    "name": "ST_GEOMETRYFROMWKB",
    "usage": "ST_GEOMETRYFROMWKB( wkb)",
    "description": "Converts a standard figure WKB (Well-known binary) to the corresponding memory geometry",
    "category": "Spatial",
    "example": "SELECT ST_GEOMETRYFROMWKB();"
  },
  {
    "name": "ST_GEOMETRYTYPE",
    "usage": "ST_GEOMETRYTYPE(...)",
    "description": "Built-in spatial function in Apache Doris.",
    "category": "Spatial",
    "example": "SELECT ST_GEOMETRYTYPE();"
  },
  {
    "name": "ST_GEOMFROMTEXT",
    "usage": "ST_GEOMFROMTEXT(...)",
    "description": "Built-in spatial function in Apache Doris.",
    "category": "Spatial",
    "example": "SELECT ST_GEOMFROMTEXT();"
  },
  {
    "name": "ST_GEOMFROMWKB",
    "usage": "ST_GEOMFROMWKB(...)",
    "description": "Built-in spatial function in Apache Doris.",
    "category": "Spatial",
    "example": "SELECT ST_GEOMFROMWKB();"
  },
  {
    "name": "ST_INTERSECTS",
    "usage": "ST_INTERSECTS( shape1, shape2)",
    "description": "Determine whether two geometric shapes intersect, i.e., there is at least one common point (including boundary contact or internal overlap).",
    "category": "Spatial",
    "example": "SELECT ST_INTERSECTS();"
  },
  {
    "name": "ST_LENGTH",
    "usage": "ST_LENGTH(...)",
    "description": "Built-in spatial function in Apache Doris.",
    "category": "Spatial",
    "example": "SELECT ST_LENGTH();"
  },
  {
    "name": "ST_LINEFROMTEXT",
    "usage": "ST_LINEFROMTEXT( wkt)",
    "description": "Converts a WKT (Well Known Text) string into an in-memory representation of a Line",
    "category": "Spatial",
    "example": "SELECT ST_LINEFROMTEXT();"
  },
  {
    "name": "ST_LINESTRINGFROMTEXT",
    "usage": "ST_LINESTRINGFROMTEXT(...)",
    "description": "Built-in spatial function in Apache Doris.",
    "category": "Spatial",
    "example": "SELECT ST_LINESTRINGFROMTEXT();"
  },
  {
    "name": "ST_POINT",
    "usage": "ST_POINT( x, y)",
    "description": "Creates a Point geometry object from the given X and Y coordinates. In geospatial contexts,",
    "category": "Spatial",
    "example": "SELECT ST_POINT();"
  },
  {
    "name": "ST_POLYFROMTEXT",
    "usage": "ST_POLYFROMTEXT(...)",
    "description": "Built-in spatial function in Apache Doris.",
    "category": "Spatial",
    "example": "SELECT ST_POLYFROMTEXT();"
  },
  {
    "name": "ST_POLYGON",
    "usage": "ST_POLYGON( wkt)",
    "description": "Converts a string in WKT (Well-Known Text) format into an in-memory Polygon geometric object.",
    "category": "Spatial",
    "example": "SELECT ST_POLYGON();"
  },
  {
    "name": "ST_POLYGONFROMTEXT",
    "usage": "ST_POLYGONFROMTEXT(...)",
    "description": "Built-in spatial function in Apache Doris.",
    "category": "Spatial",
    "example": "SELECT ST_POLYGONFROMTEXT();"
  },
  {
    "name": "ST_TOUCHES",
    "usage": "ST_TOUCHES( shape1, shape2)",
    "description": "Determine whether two geometric shapes have boundary contact only (i.e., there are common points on the boundaries, but no internal intersection).",
    "category": "Spatial",
    "example": "SELECT ST_TOUCHES();"
  },
  {
    "name": "ST_X",
    "usage": "ST_X( point)",
    "description": "When the point is a valid POINT type, returns the corresponding X coordinate value.",
    "category": "Spatial",
    "example": "SELECT ST_X();"
  },
  {
    "name": "ST_Y",
    "usage": "ST_Y( point)",
    "description": "Returns the Y coordinate of a valid POINT geometry. In geospatial contexts, the Y coordinate typically corresponds to Latitude, ranging from [-90.0,",
    "category": "Spatial",
    "example": "SELECT ST_Y();"
  },
  {
    "name": "SUBDATE",
    "usage": "SUBDATE(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT SUBDATE();"
  },
  {
    "name": "SUBSTR",
    "usage": "SUBSTR(...)",
    "description": "Built-in string function in Apache Doris.",
    "category": "String",
    "example": "SELECT SUBSTR();"
  },
  {
    "name": "SUBSTRING",
    "usage": "SUBSTRING(str, pos [, len])",
    "description": "The SUBSTRING function is used to extract a substring from a string. You can specify the starting position and length,",
    "category": "String",
    "example": "SELECT SUBSTRING();"
  },
  {
    "name": "SUBSTRING_INDEX",
    "usage": "SUBSTRING_INDEX(content, delimiter, field)",
    "description": "The SUBSTRINGINDEX function is used to extract a substring from a string based on a specified delimiter and occurrence count.",
    "category": "String",
    "example": "SELECT SUBSTRING_INDEX();"
  },
  {
    "name": "SUB_BINARY",
    "usage": "SUB_BINARY(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT SUB_BINARY();"
  },
  {
    "name": "SUB_BITMAP",
    "usage": "SUB_BITMAP(bitmap, position, cardinality_limit)",
    "description": "Extracts a subset of Bitmap elements starting from a specified position and limited by a specified cardinality limit,",
    "category": "Bitmap",
    "example": "SELECT SUB_BITMAP();"
  },
  {
    "name": "SUB_REPLACE",
    "usage": "SUB_REPLACE(str, new_str, [ ,start [ , len ] ])",
    "description": "The subreplace function is used to replace substrings within a string.",
    "category": "String",
    "example": "select sub_replace(\"this is origin str\",\"NEW-STR\",1);"
  },
  {
    "name": "SUB_TIME",
    "usage": "SUB_TIME(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT SUB_TIME();"
  },
  {
    "name": "SUM",
    "usage": "SUM(expr)",
    "description": "Used to return the sum of all values of the selected field",
    "category": "Aggregate",
    "example": "-- Create sample tables\nCREATE TABLE sales_table (\n    product_id INT,\n    price DECIMAL(10,2),\n    quantity INT"
  },
  {
    "name": "SUM0",
    "usage": "SUM0(expr)",
    "description": "Used to return the sum of all values of the selected field. Unlike the SUM function, when all input values are NULL, SUM0 returns 0 instead of NULL.",
    "category": "Aggregate",
    "example": "-- Create example table\nCREATE TABLE sales_table (\n    product_id INT,\n    price DECIMAL(10,2),\n    quantity INT,"
  },
  {
    "name": "TAN",
    "usage": "TAN(x)",
    "description": "Returns the tangent of x, where x is the value in radians.",
    "category": "Numeric",
    "example": "select tan(0),tan(1),tan(-1);"
  },
  {
    "name": "TANH",
    "usage": "TANH(x)",
    "description": "Returns the hyperbolic tangent of x.",
    "category": "Numeric",
    "example": "select tanh(0),tanh(1);"
  },
  {
    "name": "TASKS",
    "usage": "TASKS( type=type )",
    "description": "Table function, generates a temporary table of tasks,",
    "category": "Table-Valued",
    "example": "SELECT TASKS();"
  },
  {
    "name": "TIME",
    "usage": "TIME(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT TIME();"
  },
  {
    "name": "TIMEDIFF",
    "usage": "TIMEDIFF(end_datetime, start_datetime)",
    "description": "The TIMEDIFF function calculates the difference between two datetime values.",
    "category": "Date & Time",
    "example": "SELECT TIMEDIFF('2024-07-20 16:59:30','2024-07-11 16:35:21');"
  },
  {
    "name": "TIMESTAMP",
    "usage": "TIMESTAMP(string)",
    "description": "The TIMESTAMP function has two uses:",
    "category": "Date & Time",
    "example": "-- Convert a string to DATETIME\nSELECT TIMESTAMP('2019-01-01 12:00:00');"
  },
  {
    "name": "TIMESTAMPADD",
    "usage": "TIMESTAMPADD(unit, interval, datetime_expr)",
    "description": "The timestampadd function is used to add a specified time unit (such as year, month, day, hour, minute, second, etc.) to a date.",
    "category": "Date & Time",
    "example": "SELECT TIMESTAMPADD(MINUTE,1,'2019-01-02');"
  },
  {
    "name": "TIMESTAMPDIFF",
    "usage": "TIMESTAMPDIFF(unit, datetime_expr1, datetime_expr2)",
    "description": "The timestampdiff function is used to calculate the difference between two dates and returns the time interval between them.",
    "category": "Date & Time",
    "example": "SELECT TIMESTAMPDIFF(MONTH,'2003-02-01','2003-05-01');"
  },
  {
    "name": "TIME_FORMAT",
    "usage": "TIME_FORMAT(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT TIME_FORMAT();"
  },
  {
    "name": "TIME_TO_SEC",
    "usage": "TIME_TO_SEC(time)",
    "description": "The function converts an input TIME or DATETIME value into the total time in seconds. If the input is of DATETIME type,",
    "category": "Date & Time",
    "example": "SELECT TIME_TO_SEC('16:32:18'),TIME_TO_SEC('2025-01-01 16:32:18');"
  },
  {
    "name": "TOKENIZE",
    "usage": "TOKENIZE(VARCHAR str, VARCHAR properties)",
    "description": "The TOKENIZE function tokenizes a string using a specified parser/analyzer and returns the tokenization results.",
    "category": "String",
    "example": "SELECT TOKENIZE();"
  },
  {
    "name": "TOPN",
    "usage": "TOPN(expr, top_num [, space_expand_rate])",
    "description": "The TOPN function returns the N most frequent values in the specified column.",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE page_visits (\n    page_id INT,\n    user_id INT,\n    visit_date DATE"
  },
  {
    "name": "TOPN_ARRAY",
    "usage": "TOPN_ARRAY(expr, top_num [, space_expand_rate])",
    "description": "TOPNARRAY returns an array of the N most frequent values in the specified column.",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE page_visits (\n    page_id INT,\n    user_id INT,\n    visit_date DATE"
  },
  {
    "name": "TOPN_WEIGHTED",
    "usage": "TOPN_WEIGHTED(expr, weight, top_num [, space_expand_rate])",
    "description": "The TOPNWEIGHTED function returns the N most frequent values in the specified column with weighted counting. Unlike the regular TOPN function,",
    "category": "Aggregate",
    "example": "-- create example table\nCREATE TABLE product_sales (\n    product_id INT,\n    sale_amount DECIMAL(10,2),\n    sale_date DATE"
  },
  {
    "name": "TOP_LEVEL_DOMAIN",
    "usage": "TOP_LEVEL_DOMAIN(url)",
    "description": "The TOPLEVELDOMAIN function is used to extract the top-level domain from a URL. If the input URL is invalid, it returns an empty string.",
    "category": "String",
    "example": "SELECT TOP_LEVEL_DOMAIN();"
  },
  {
    "name": "TO_BASE64",
    "usage": "TO_BASE64(str)",
    "description": "The TOBASE64 function is used to convert an input string to Base64 encoded format.",
    "category": "String",
    "example": "SELECT TO_BASE64();"
  },
  {
    "name": "TO_BASE64_BINARY",
    "usage": "TO_BASE64_BINARY(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT TO_BASE64_BINARY();"
  },
  {
    "name": "TO_BINARY",
    "usage": "TO_BINARY(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT TO_BINARY();"
  },
  {
    "name": "TO_BITMAP",
    "usage": "TO_BITMAP(expr)",
    "description": "Converts an unsigned bigint to a Bitmap.",
    "category": "Bitmap",
    "example": "SELECT TO_BITMAP();"
  },
  {
    "name": "TO_BITMAP_WITH_CHECK",
    "usage": "TO_BITMAP_WITH_CHECK(...)",
    "description": "Built-in bitmap function in Apache Doris.",
    "category": "Bitmap",
    "example": "SELECT TO_BITMAP_WITH_CHECK();"
  },
  {
    "name": "TO_DATE",
    "usage": "TO_DATE(datetime_value)",
    "description": "Date conversion function, used to convert date time (DATETIME) to date type (DATE), that is, remove the time part and keep only the date (YYYY-MM-DD)",
    "category": "Date & Time",
    "example": "SELECT TO_DATE();"
  },
  {
    "name": "TO_DATEV2",
    "usage": "TO_DATEV2(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT TO_DATEV2();"
  },
  {
    "name": "TO_DAYS",
    "usage": "TO_DAYS(datetime_or_date_value)",
    "description": "Date calculation function, which is used to convert a date into a day value, that is, to calculate the total number of days from December 31,",
    "category": "Date & Time",
    "example": "SELECT TO_DAYS();"
  },
  {
    "name": "TO_HEX",
    "usage": "TO_HEX(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT TO_HEX();"
  },
  {
    "name": "TO_IPV4",
    "usage": "TO_IPV4(ipv4_str)",
    "description": "This function like ipv4stringtonum that takes a string form of IPv4 address and returns value of IPv4 type,",
    "category": "IP",
    "example": "SELECT to_ipv4('255.255.255.255');"
  },
  {
    "name": "TO_IPV4_OR_DEFAULT",
    "usage": "TO_IPV4_OR_DEFAULT(ipv4_str)",
    "description": "This function like ipv4stringtonum that takes a string form of IPv4 address and returns value of IPv4 type,",
    "category": "IP",
    "example": "SELECT to_ipv4_or_default('255.255.255.255'), to_ipv4_or_default('.'), to_ipv4_or_default(NULL);"
  },
  {
    "name": "TO_IPV4_OR_NULL",
    "usage": "TO_IPV4_OR_NULL(ipv4_str)",
    "description": "This function like ipv4stringtonum that takes a string form of IPv4 address and returns value of IPv4 type,",
    "category": "IP",
    "example": "SELECT to_ipv4_or_null('255.255.255.255'), to_ipv4_or_null('.'), to_ipv4_or_null(NULL);"
  },
  {
    "name": "TO_IPV6",
    "usage": "TO_IPV6(ipv6_str)",
    "description": "Convert a string form of IPv6 address to IPv6 type, which is binary equal to value returned by ipv6stringtonum.",
    "category": "IP",
    "example": "SELECT to_ipv6('::'),to_ipv6('2001:1b70:a1:610::b102:2');"
  },
  {
    "name": "TO_IPV6_OR_DEFAULT",
    "usage": "TO_IPV6_OR_DEFAULT(ipv6_str)",
    "description": "Convert a string form of IPv6 address to IPv6 type.",
    "category": "IP",
    "example": "SELECT to_ipv6_or_default('.'), to_ipv6_or_default('2001:1b70:a1:610::b102:2');"
  },
  {
    "name": "TO_IPV6_OR_NULL",
    "usage": "TO_IPV6_OR_NULL(ipv6_str)",
    "description": "Convert a string form of IPv6 address to IPv6 type.",
    "category": "IP",
    "example": "SELECT to_ipv6_or_null('.'), to_ipv6_or_null('2001:1b70:a1:610::b102:2');"
  },
  {
    "name": "TO_ISO8601",
    "usage": "TO_ISO8601(dt)",
    "description": "Converts a datetime value to an ISO8601 formatted string.",
    "category": "Date & Time",
    "example": "SELECT TO_ISO8601('2020-01-01 12:30:45');"
  },
  {
    "name": "TO_JSON",
    "usage": "TO_JSON(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT TO_JSON();"
  },
  {
    "name": "TO_MONDAY",
    "usage": "TO_MONDAY(DATETIME date)",
    "description": "Round a date or datetime down to the nearest Monday, return type is Date or DateV2. Specially, input 1970-01-01, 1970-01-02,",
    "category": "Date & Time",
    "example": "MySQL [(none)]> select to_monday('2022-09-10');\n+----------------------------------+\n| to_monday('2022-09-10 00:00:00') |\n+----------------------------------+\n| 2022-09-05                       |"
  },
  {
    "name": "TO_QUANTILE_STATE",
    "usage": "TO_QUANTILE_STATE(raw_data, compression)",
    "description": "This function converts numeric types to QUANTILESTATE type. The compression parameter is optional and can be set in the range [2048, 10000].",
    "category": "Quantile",
    "example": "CREATE TABLE IF NOT EXISTS quantile_state_agg_test (\n         `dt` int(11) NULL COMMENT \"\",\n         `id` int(11) NULL COMMENT \"\",\n         `price` quantile_state QUANTILE_UNION NOT NULL COMMENT \"\"\n        ) ENGINE=OLAP"
  },
  {
    "name": "TO_SECONDS",
    "usage": "TO_SECONDS(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT TO_SECONDS();"
  },
  {
    "name": "TRANSLATE",
    "usage": "TRANSLATE(source, from, to)",
    "description": "The TRANSLATE function is used for string replacement, converting characters in the source string according to mapping rules.",
    "category": "String",
    "example": "SELECT TRANSLATE();"
  },
  {
    "name": "TRIM",
    "usage": "TRIM( str [ , rhs])",
    "description": "This command is used to delete Spaces or specified characters at both ends of the string. If no rhs parameter is specified,",
    "category": "String",
    "example": "SELECT trim('   ab d   ') str;"
  },
  {
    "name": "TRIM_IN",
    "usage": "TRIM_IN( str [ , rhs])",
    "description": "When there is no rhs parameter, this function removes the leading and trailing spaces from the str string. When the rhs parameter is provided,",
    "category": "String",
    "example": "SELECT TRIM_IN();"
  },
  {
    "name": "TRUNCATE",
    "usage": "TRUNCATE(x, d)",
    "description": "Perform numerical truncation on x to the number of decimal places d",
    "category": "Numeric",
    "example": "SELECT TRUNCATE();"
  },
  {
    "name": "UCASE",
    "usage": "UCASE( str )",
    "description": "Used to convert a string to uppercase letters",
    "category": "String",
    "example": "SELECT UCASE(\"aBc123\"),UPPER(\"aBc123\");"
  },
  {
    "name": "UNCOMPRESS",
    "usage": "UNCOMPRESS(...)",
    "description": "Built-in encryption & hash function in Apache Doris.",
    "category": "Encryption & Hash",
    "example": "SELECT UNCOMPRESS();"
  },
  {
    "name": "UNHEX",
    "usage": "UNHEX(str)",
    "description": "The unhex function is used to convert a hexadecimal string back into the original string. It converts every two hexadecimal characters into one byte.",
    "category": "String",
    "example": "select unhex('@');"
  },
  {
    "name": "UNHEX_NULL",
    "usage": "UNHEX_NULL(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT UNHEX_NULL();"
  },
  {
    "name": "UNICODE_NORMALIZE",
    "usage": "UNICODE_NORMALIZE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT UNICODE_NORMALIZE();"
  },
  {
    "name": "UNIFORM",
    "usage": "UNIFORM(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT UNIFORM();"
  },
  {
    "name": "UNION",
    "usage": "UNION(agg_state)",
    "description": "Aggregate multiple aggregation intermediate results into one. The type of the result is aggstate,",
    "category": "Combinator",
    "example": "mysql [test]>select avg_merge(t) from (select avg_union(avg_state(1)) as t from d_table group by k1)p;\n+----------------+\n| avg_merge(`t`) |\n+----------------+\n|              1 |"
  },
  {
    "name": "UNIX_TIMESTAMP",
    "usage": "UNIX_TIMESTAMP([DATETIME date[, STRING fmt]])",
    "description": "Converts a Date or Datetime type to a UNIX timestamp.",
    "category": "Date & Time",
    "example": "-- All the following results are returned in the UTC time zone\nset time_zone= 'UTC';\n------Displays the timestamp of the current time\nmysql> select unix_timestamp();\n+------------------+"
  },
  {
    "name": "UNNEST",
    "usage": "UNNEST(...)",
    "description": "Built-in table generating function in Apache Doris.",
    "category": "Table Generating",
    "example": "SELECT UNNEST();"
  },
  {
    "name": "UPPER",
    "usage": "UPPER( str )",
    "description": "Used to convert a string to uppercase letters",
    "category": "String",
    "example": "SELECT UCASE(\"aBc123\"),UPPER(\"aBc123\");"
  },
  {
    "name": "URL_DECODE",
    "usage": "URL_DECODE( str )",
    "description": "Converts an url to a decode string.",
    "category": "String",
    "example": "select url_decode('https%3A%2F%2Fdoris.apache.org%2Fzh-CN%2Fdocs%2Fsql-manual%2Fsql-functions%2Fstring-functions');"
  },
  {
    "name": "URL_ENCODE",
    "usage": "URL_ENCODE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT URL_ENCODE();"
  },
  {
    "name": "USER",
    "usage": "USER()",
    "description": "Get the current username and IP that Doris is connected to.",
    "category": "System",
    "example": "select user();"
  },
  {
    "name": "UTC_DATE",
    "usage": "UTC_DATE(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT UTC_DATE();"
  },
  {
    "name": "UTC_TIME",
    "usage": "UTC_TIME(...)",
    "description": "Built-in date & time function in Apache Doris.",
    "category": "Date & Time",
    "example": "SELECT UTC_TIME();"
  },
  {
    "name": "UTC_TIMESTAMP",
    "usage": "UTC_TIMESTAMP()",
    "description": "Returns the current UTC date and time in \\",
    "category": "Date & Time",
    "example": "mysql> select utc_timestamp(),utc_timestamp() + 1;\n+---------------------+---------------------+\n| utc_timestamp()     | utc_timestamp() + 1 |\n+---------------------+---------------------+\n| 2019-07-10 12:31:18 |      20190710123119 |"
  },
  {
    "name": "UUID",
    "usage": "UUID()",
    "description": "Used to return a randomly generated UUID string.",
    "category": "Numeric",
    "example": "select UUID();"
  },
  {
    "name": "UUID_NUMERIC",
    "usage": "UUID_NUMERIC()",
    "description": "Return a LARGEINT type uuid",
    "category": "Numeric",
    "example": "select uuid_numeric()"
  },
  {
    "name": "UUID_TO_INT",
    "usage": "UUID_TO_INT(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT UUID_TO_INT();"
  },
  {
    "name": "VARIANCE",
    "usage": "VARIANCE(expr)",
    "description": "The VARIANCE function calculates the statistical variance of the specified expression.",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE student_scores (\n    student_id INT,\n    score DECIMAL(4,1)\n) DISTRIBUTED BY HASH(student_id)"
  },
  {
    "name": "VARIANCE_POP",
    "usage": "VARIANCE_POP(expr)",
    "description": "The VARIANCE function calculates the statistical variance of the specified expression.",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE student_scores (\n    student_id INT,\n    score DECIMAL(4,1)\n) DISTRIBUTED BY HASH(student_id)"
  },
  {
    "name": "VARIANCE_SAMP",
    "usage": "VARIANCE_SAMP(expr)",
    "description": "The VARSAMP function calculates the sample variance of a specified expression. Unlike VARIANCE (population variance), VARSAMP uses n-1 as the divisor,",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE student_scores (\n    student_id INT,\n    score DECIMAL(4,1)\n) DISTRIBUTED BY HASH(student_id)"
  },
  {
    "name": "VARIANT_TYPE",
    "usage": "VARIANT_TYPE(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT VARIANT_TYPE();"
  },
  {
    "name": "VAR_POP",
    "usage": "VAR_POP(expr)",
    "description": "The VARIANCE function calculates the statistical variance of the specified expression.",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE student_scores (\n    student_id INT,\n    score DECIMAL(4,1)\n) DISTRIBUTED BY HASH(student_id)"
  },
  {
    "name": "VAR_SAMP",
    "usage": "VAR_SAMP(expr)",
    "description": "The VARSAMP function calculates the sample variance of a specified expression. Unlike VARIANCE (population variance), VARSAMP uses n-1 as the divisor,",
    "category": "Aggregate",
    "example": "-- Create sample table\nCREATE TABLE student_scores (\n    student_id INT,\n    score DECIMAL(4,1)\n) DISTRIBUTED BY HASH(student_id)"
  },
  {
    "name": "VERSION",
    "usage": "VERSION()",
    "description": "No practical meaning, for compatibility with MySQL protocol.",
    "category": "System",
    "example": "select version();"
  },
  {
    "name": "WEEK",
    "usage": "WEEK(DATE date[, INT mode])",
    "description": "Returns the week number for date.The value of the mode argument defaults to 0. The following table describes how the mode argument works.",
    "category": "Date & Time",
    "example": "SELECT WEEK();"
  },
  {
    "name": "WEEKDAY",
    "usage": "WEEKDAY (DATETIME date)",
    "description": "The WEEKDAY function returns the index value of the working day of the date, that is, 0 on Monday, 1 on Tuesday, and 6 on Sunday.",
    "category": "Date & Time",
    "example": "mysql> select weekday('2019-06-25');\n+--------------------------------+\n| weekday('2019-06-25 00:00:00') |\n+--------------------------------+\n|                              1 |"
  },
  {
    "name": "WEEKOFYEAR",
    "usage": "WEEKOFYEAR (DATETIME DATE)",
    "description": "Get the Weeks of the Year",
    "category": "Date & Time",
    "example": "mysql> select weekofyear('2008-02-20 00:00:00');\n+-----------------------------------+\n| weekofyear('2008-02-20 00:00:00') |\n+-----------------------------------+\n|                                 8 |"
  },
  {
    "name": "WEEKS_ADD",
    "usage": "WEEKS_ADD(datetime_or_date_value, weeks_value)",
    "description": "This function is used to add (or subtract) a certain number of weeks from a specified date or time value.",
    "category": "Date & Time",
    "example": "SELECT WEEKS_ADD();"
  },
  {
    "name": "WEEKS_DIFF",
    "usage": "WEEKS_DIFF(end_date, start_date)",
    "description": "Calculates the number of complete weeks (in 7-day units) between two date or time values.",
    "category": "Date & Time",
    "example": "SELECT WEEKS_DIFF();"
  },
  {
    "name": "WEEKS_SUB",
    "usage": "WEEKS_SUB(date_value, week_period)",
    "description": "Subtracts a specified number of weeks from a specified date or time value (i.e., subtracts weeks 7 days).",
    "category": "Date & Time",
    "example": "SELECT WEEKS_SUB();"
  },
  {
    "name": "WEEK_CEIL",
    "usage": "WEEK_CEIL(datetime)",
    "description": "Rounds up a datetime value to the nearest specified week interval. If a starting time (origin) is provided,",
    "category": "Date & Time",
    "example": "SELECT WEEK_CEIL('2023-07-13 22:28:18', 2);"
  },
  {
    "name": "WEEK_FLOOR",
    "usage": "WEEK_FLOOR(datetime)",
    "description": "Rounds down a datetime value to the nearest specified week interval. If a starting time (origin) is provided,",
    "category": "Date & Time",
    "example": "SELECT WEEK_FLOOR('2023-07-13 22:28:18', 2);"
  },
  {
    "name": "WIDTH_BUCKET",
    "usage": "WIDTH_BUCKET(expr, min_value, max_value, num_buckets)",
    "description": "Construct an equal-width histogram, where the histogram range is divided into equal-sized intervals, and after calculation,",
    "category": "Numeric",
    "example": "DROP TABLE IF EXISTS width_bucket_test;\nCREATE TABLE IF NOT EXISTS width_bucket_test (\n`k1` int NULL COMMENT \"\",\n`v1` date NULL COMMENT \"\",\n`v2` double NULL COMMENT \"\","
  },
  {
    "name": "WINDOW_FUNNEL",
    "usage": "WINDOW_FUNNEL(window, mode, timestamp, event_1[, event_2, ... , event_n])",
    "description": "The WINDOWFUNNEL function analyzes user behavior sequences by searching for event chains within a specified time window and calculating the maximum",
    "category": "Aggregate",
    "example": "SELECT WINDOW_FUNNEL();"
  },
  {
    "name": "WINDOW_FUNNEL_V1",
    "usage": "WINDOW_FUNNEL_V1(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT WINDOW_FUNNEL_V1();"
  },
  {
    "name": "WINDOW_FUNNEL_V2",
    "usage": "WINDOW_FUNNEL_V2(...)",
    "description": "Built-in aggregate function in Apache Doris.",
    "category": "Aggregate",
    "example": "SELECT WINDOW_FUNNEL_V2();"
  },
  {
    "name": "XOR",
    "usage": "lhs XOR rhs",
    "description": "Performs a bitwise exclusive OR operation on two BOOLEAN values.",
    "category": "Bitwise",
    "example": "select true XOR false,true XOR true;"
  },
  {
    "name": "XPATH_STRING",
    "usage": "XPATH_STRING(xml_string, xpath_expression)",
    "description": "The XPATHSTRING function is used to parse the XML string and return the first XML node that matches the XPath expression.",
    "category": "String",
    "example": "SELECT XPATH_STRING();"
  },
  {
    "name": "XXHASH3_64",
    "usage": "XXHASH3_64(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT XXHASH3_64();"
  },
  {
    "name": "XXHASH_32",
    "usage": "XXHASH_32( str [ , str ... ] )",
    "description": "Calculate the 32-bit xxhash value of the input string",
    "category": "Encryption & Hash",
    "example": "select xxhash_32(NULL), xxhash_32(\"hello\"), xxhash_32(\"hello\", \"world\");"
  },
  {
    "name": "XXHASH_64",
    "usage": "XXHASH_64( str [ , str ... ] )",
    "description": "Calculates the 64-bit xxhash value of the input string",
    "category": "Encryption & Hash",
    "example": "select xxhash_64(NULL), xxhash_64(\"hello\"), xxhash_64(\"hello\", \"world\");"
  },
  {
    "name": "YEAR",
    "usage": "YEAR(DATETIME date)",
    "description": "Returns the year part of the date type, ranging from 1000 to 9999",
    "category": "Date & Time",
    "example": "mysql> select year('1987-01-01');\n+-----------------------------+\n| year('1987-01-01 00:00:00') |\n+-----------------------------+\n|                        1987 |"
  },
  {
    "name": "YEARS_ADD",
    "usage": "YEARS_ADD(date, years)",
    "description": "Returns a new datetime value that is the result of adding a specified number of years to the input datetime.",
    "category": "Date & Time",
    "example": "SELECT YEARS_ADD('2020-01-31 02:02:02', 1);"
  },
  {
    "name": "YEARS_DIFF",
    "usage": "YEARS_DIFF(enddate, startdate)",
    "description": "Calculates the difference in years between two datetime values.",
    "category": "Date & Time",
    "example": "SELECT YEARS_DIFF('2020-12-25', '2019-10-25');"
  },
  {
    "name": "YEARS_SUB",
    "usage": "YEARS_SUB(date, years)",
    "description": "Returns a new datetime value that is the result of subtracting a specified number of years from the input datetime.",
    "category": "Date & Time",
    "example": "SELECT YEARS_SUB('2020-02-02 02:02:02', 1);"
  },
  {
    "name": "YEARWEEK",
    "usage": "YEARWEEK(DATE date[, INT mode])",
    "description": "Returns year and week for a date.The value of the mode argument defaults to 0. When the week of the date belongs to the previous year,",
    "category": "Date & Time",
    "example": "mysql> select yearweek('2021-1-1');\n+----------------------+\n| yearweek('2021-1-1') |\n+----------------------+\n|               202052 |"
  },
  {
    "name": "YEAR_CEIL",
    "usage": "YEAR_CEIL(DATETIME datetime)",
    "description": "Convert the date to the nearest rounding up time of the specified time interval period.",
    "category": "Date & Time",
    "example": "mysql> select year_ceil(\"2023-07-13 22:28:18\", 5);\n+------------------------------------------------------------+\n| year_ceil(cast('2023-07-13 22:28:18' as DATETIMEV2(0)), 5) |\n+------------------------------------------------------------+\n| 2025-01-01 00:00:00                                        |"
  },
  {
    "name": "YEAR_FLOOR",
    "usage": "YEAR_FLOOR(date_value, [period | origin_date_value])",
    "description": "It is used to round the given date down to the specified year interval starting point. It supports multiple variants,",
    "category": "Date & Time",
    "example": "SELECT YEAR_FLOOR();"
  },
  {
    "name": "YEAR_MONTH",
    "usage": "YEAR_MONTH(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT YEAR_MONTH();"
  },
  {
    "name": "YEAR_OF_WEEK",
    "usage": "YEAR_OF_WEEK(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT YEAR_OF_WEEK();"
  },
  {
    "name": "YOW",
    "usage": "YOW(...)",
    "description": "Built-in scalar function in Apache Doris.",
    "category": "Scalar",
    "example": "SELECT YOW();"
  }
];
