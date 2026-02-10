export const SPARK_FUNCTIONS_DATA = [
  {
    "name": "!",
    "usage": "! expr",
    "description": "! expr - Logical not.",
    "category": "Built-in"
  },
  {
    "name": "!=",
    "usage": "expr1 != expr2",
    "description": "expr1 != expr2 - Returns true if expr1 is not equal to expr2, or false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "%",
    "usage": "expr1 % expr2, or mod(expr1, expr2)",
    "description": "expr1 % expr2, or mod(expr1, expr2) - Returns the remainder after expr1/expr2.",
    "category": "Built-in"
  },
  {
    "name": "&",
    "usage": "expr1 & expr2",
    "description": "expr1 & expr2 - Returns the result of bitwise AND of expr1 and expr2.",
    "category": "Built-in"
  },
  {
    "name": "*",
    "usage": "expr1 * expr2",
    "description": "expr1 * expr2 - Returns expr1*expr2.",
    "category": "Built-in"
  },
  {
    "name": "+",
    "usage": "expr1 + expr2",
    "description": "expr1 + expr2 - Returns expr1+expr2.",
    "category": "Built-in"
  },
  {
    "name": "-",
    "usage": "expr1",
    "description": "expr1 - expr2 - Returns expr1-expr2.",
    "category": "Built-in"
  },
  {
    "name": "/",
    "usage": "expr1 / expr2",
    "description": "expr1 / expr2 - Returns expr1/expr2. It always performs floating point division.",
    "category": "Built-in"
  },
  {
    "name": "<",
    "usage": "expr1 < expr2",
    "description": "expr1 < expr2 - Returns true if expr1 is less than expr2.",
    "category": "Built-in"
  },
  {
    "name": "<<",
    "usage": "base << exp",
    "description": "base << exp - Bitwise left shift.",
    "category": "Built-in"
  },
  {
    "name": "<=",
    "usage": "expr1 <= expr2",
    "description": "expr1 <= expr2 - Returns true if expr1 is less than or equal to expr2.",
    "category": "Built-in"
  },
  {
    "name": "<=>",
    "usage": "expr1 <=> expr2",
    "description": "expr1 <=> expr2 - Returns same result as the EQUAL(=) operator for non-null operands, but returns true if both are null, false if one of the them is null.",
    "category": "Built-in"
  },
  {
    "name": "<>",
    "usage": "expr1 != expr2",
    "description": "expr1 != expr2 - Returns true if expr1 is not equal to expr2, or false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "=",
    "usage": "expr1 = expr2",
    "description": "expr1 = expr2 - Returns true if expr1 equals expr2, or false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "==",
    "usage": "expr1 == expr2",
    "description": "expr1 == expr2 - Returns true if expr1 equals expr2, or false otherwise.",
    "category": "Built-in"
  },
  {
    "name": ">",
    "usage": "expr1 > expr2",
    "description": "expr1 > expr2 - Returns true if expr1 is greater than expr2.",
    "category": "Built-in"
  },
  {
    "name": ">=",
    "usage": "expr1 >= expr2",
    "description": "expr1 >= expr2 - Returns true if expr1 is greater than or equal to expr2.",
    "category": "Built-in"
  },
  {
    "name": ">>",
    "usage": "base >> expr",
    "description": "base >> expr - Bitwise (signed) right shift.",
    "category": "Built-in"
  },
  {
    "name": ">>>",
    "usage": "base >>> expr",
    "description": "base >>> expr - Bitwise unsigned right shift.",
    "category": "Built-in"
  },
  {
    "name": "^",
    "usage": "expr1 ^ expr2",
    "description": "expr1 ^ expr2 - Returns the result of bitwise exclusive OR of expr1 and expr2.",
    "category": "Built-in"
  },
  {
    "name": "abs",
    "usage": "abs(expr)",
    "description": "abs(expr) - Returns the absolute value of the numeric or interval value.",
    "category": "Built-in"
  },
  {
    "name": "acos",
    "usage": "acos(expr)",
    "description": "acos(expr) - Returns the inverse cosine (a.k.a. arc cosine) of expr, as if computed by java.lang.Math.acos.",
    "category": "Built-in"
  },
  {
    "name": "acosh",
    "usage": "acosh(expr)",
    "description": "acosh(expr) - Returns inverse hyperbolic cosine of expr.",
    "category": "Built-in"
  },
  {
    "name": "add_months",
    "usage": "add_months(start_date, num_months)",
    "description": "add_months(start_date, num_months) - Returns the date that is num_months after start_date.",
    "category": "Built-in"
  },
  {
    "name": "aes_decrypt",
    "usage": "aes_decrypt(expr, key[, mode[, padding[, aad]]])",
    "description": "aes_decrypt(expr, key[, mode[, padding[, aad]]]) - Returns a decrypted value of expr using AES in mode with padding. Key lengths of 16, 24 and 32 bits are supported. Supported combinations of (mode, padding) are ('ECB', 'PKCS'), ('GCM', 'NONE') and ('CBC', 'PKCS'). Optional additional authenticated data (AAD) is only supported for GCM. If provided for encryption, the identical AAD value must be provided for decryption. The default mode is GCM.",
    "category": "Built-in"
  },
  {
    "name": "aes_encrypt",
    "usage": "aes_encrypt(expr, key[, mode[, padding[, iv[, aad]]]])",
    "description": "aes_encrypt(expr, key[, mode[, padding[, iv[, aad]]]]) - Returns an encrypted value of expr using AES in given mode with the specified padding. Key lengths of 16, 24 and 32 bits are supported. Supported combinations of (mode, padding) are ('ECB', 'PKCS'), ('GCM', 'NONE') and ('CBC', 'PKCS'). Optional initialization vectors (IVs) are only supported for CBC and GCM modes. These must be 16 bytes for CBC and 12 bytes for GCM. If not provided, a random vector will be generated and prepended to the output. Optional additional authenticated data (AAD) is only supported for GCM. If provided for encryption, the identical AAD value must be provided for decryption. The default mode is GCM.",
    "category": "Built-in"
  },
  {
    "name": "aggregate",
    "usage": "aggregate(expr, start, merge, finish)",
    "description": "aggregate(expr, start, merge, finish) - Applies a binary operator to an initial state and all elements in the array, and reduces this to a single state. The final state is converted into the final result by applying a finish function.",
    "category": "Built-in"
  },
  {
    "name": "and",
    "usage": "expr1 and expr2",
    "description": "expr1 and expr2 - Logical AND.",
    "category": "Built-in"
  },
  {
    "name": "any",
    "usage": "any(expr)",
    "description": "any(expr) - Returns true if at least one value of expr is true.",
    "category": "Built-in"
  },
  {
    "name": "any_value",
    "usage": "any_value(expr[, isIgnoreNull])",
    "description": "any_value(expr[, isIgnoreNull]) - Returns some value of expr for a group of rows. If isIgnoreNull is true, returns only non-null values.",
    "category": "Built-in"
  },
  {
    "name": "approx_count_distinct",
    "usage": "approx_count_distinct(expr[, relativeSD])",
    "description": "approx_count_distinct(expr[, relativeSD]) - Returns the estimated cardinality by HyperLogLog++. relativeSD defines the maximum relative standard deviation allowed.",
    "category": "Built-in"
  },
  {
    "name": "approx_percentile",
    "usage": "approx_percentile(col, percentage [, accuracy])",
    "description": "approx_percentile(col, percentage [, accuracy]) - Returns the approximate percentile of the numeric or ansi interval column col which is the smallest value in the ordered col values (sorted from least to greatest) such that no more than percentage of col values is less than the value or equal to that value. The value of percentage must be between 0.0 and 1.0. The accuracy parameter (default: 10000) is a positive numeric literal which controls approximation accuracy at the cost of memory. Higher value of accuracy yields better accuracy, 1.0/accuracy is the relative error of the approximation. When percentage is an array, each value of the percentage array must be between 0.0 and 1.0. In this case, returns the approximate percentile array of column col at the given percentage array.",
    "category": "Built-in"
  },
  {
    "name": "approx_top_k",
    "usage": "approx_top_k(expr, k, maxItemsTracked)",
    "description": "approx_top_k(expr, k, maxItemsTracked) - Returns top k items with their frequency. k An optional INTEGER literal greater than 0. If k is not specified, it defaults to 5. maxItemsTracked An optional INTEGER literal greater than or equal to k and has upper limit of 1000000. If maxItemsTracked is not specified, it defaults to 10000.",
    "category": "Built-in"
  },
  {
    "name": "approx_top_k_accumulate",
    "usage": "approx_top_k_accumulate(expr, maxItemsTracked)",
    "description": "approx_top_k_accumulate(expr, maxItemsTracked) - Accumulates items into a sketch. maxItemsTracked An optional positive INTEGER literal with upper limit of 1000000. If maxItemsTracked is not specified, it defaults to 10000.",
    "category": "Built-in"
  },
  {
    "name": "approx_top_k_combine",
    "usage": "approx_top_k_combine(state, maxItemsTracked)",
    "description": "approx_top_k_combine(state, maxItemsTracked) - Combines multiple sketches into a single sketch. maxItemsTracked An optional positive INTEGER literal with upper limit of 1000000. If maxItemsTracked is specified, it will be set for the combined sketch. If maxItemsTracked is not specified, the input sketches must have the same maxItemsTracked value, otherwise an error will be thrown. The output sketch will use the same value from the input sketches.",
    "category": "Built-in"
  },
  {
    "name": "approx_top_k_estimate",
    "usage": "approx_top_k_estimate(state, k)",
    "description": "approx_top_k_estimate(state, k) - Returns top k items with their frequency. k An optional INTEGER literal greater than 0. If k is not specified, it defaults to 5.",
    "category": "Built-in"
  },
  {
    "name": "array",
    "usage": "array(expr, ...)",
    "description": "array(expr, ...) - Returns an array with the given elements.",
    "category": "Built-in"
  },
  {
    "name": "array_agg",
    "usage": "array_agg(expr)",
    "description": "array_agg(expr) - Collects and returns a list of non-unique elements.",
    "category": "Built-in"
  },
  {
    "name": "array_append",
    "usage": "array_append(array, element)",
    "description": "array_append(array, element) - Add the element at the end of the array passed as first argument. Type of element should be similar to type of the elements of the array. Null element is also appended into the array. But if the array passed, is NULL output is NULL",
    "category": "Built-in"
  },
  {
    "name": "array_compact",
    "usage": "array_compact(array)",
    "description": "array_compact(array) - Removes null values from the array.",
    "category": "Built-in"
  },
  {
    "name": "array_contains",
    "usage": "array_contains(array, value)",
    "description": "array_contains(array, value) - Returns true if the array contains the value.",
    "category": "Built-in"
  },
  {
    "name": "array_distinct",
    "usage": "array_distinct(array)",
    "description": "array_distinct(array) - Removes duplicate values from the array.",
    "category": "Built-in"
  },
  {
    "name": "array_except",
    "usage": "array_except(array1, array2)",
    "description": "array_except(array1, array2) - Returns an array of the elements in array1 but not in array2, without duplicates.",
    "category": "Built-in"
  },
  {
    "name": "array_insert",
    "usage": "array_insert(x, pos, val)",
    "description": "array_insert(x, pos, val) - Places val into index pos of array x. Array indices start at 1. The maximum negative index is -1 for which the function inserts new element after the current last element. Index above array size appends the array, or prepends the array if index is negative, with 'null' elements.",
    "category": "Built-in"
  },
  {
    "name": "array_intersect",
    "usage": "array_intersect(array1, array2)",
    "description": "array_intersect(array1, array2) - Returns an array of the elements in the intersection of array1 and array2, without duplicates.",
    "category": "Built-in"
  },
  {
    "name": "array_join",
    "usage": "array_join(array, delimiter[, nullReplacement])",
    "description": "array_join(array, delimiter[, nullReplacement]) - Concatenates the elements of the given array using the delimiter and an optional string to replace nulls. If no value is set for nullReplacement, any null value is filtered.",
    "category": "Built-in"
  },
  {
    "name": "array_max",
    "usage": "array_max(array)",
    "description": "array_max(array) - Returns the maximum value in the array. NaN is greater than any non-NaN elements for double/float type. NULL elements are skipped.",
    "category": "Built-in"
  },
  {
    "name": "array_min",
    "usage": "array_min(array)",
    "description": "array_min(array) - Returns the minimum value in the array. NaN is greater than any non-NaN elements for double/float type. NULL elements are skipped.",
    "category": "Built-in"
  },
  {
    "name": "array_position",
    "usage": "array_position(array, element)",
    "description": "array_position(array, element) - Returns the (1-based) index of the first matching element of the array as long, or 0 if no match is found.",
    "category": "Built-in"
  },
  {
    "name": "array_prepend",
    "usage": "array_prepend(array, element)",
    "description": "array_prepend(array, element) - Add the element at the beginning of the array passed as first argument. Type of element should be the same as the type of the elements of the array. Null element is also prepended to the array. But if the array passed is NULL output is NULL",
    "category": "Built-in"
  },
  {
    "name": "array_remove",
    "usage": "array_remove(array, element)",
    "description": "array_remove(array, element) - Remove all elements that equal to element from array.",
    "category": "Built-in"
  },
  {
    "name": "array_repeat",
    "usage": "array_repeat(element, count)",
    "description": "array_repeat(element, count) - Returns the array containing element count times.",
    "category": "Built-in"
  },
  {
    "name": "array_size",
    "usage": "array_size(expr)",
    "description": "array_size(expr) - Returns the size of an array. The function returns null for null input.",
    "category": "Built-in"
  },
  {
    "name": "array_sort",
    "usage": "array_sort(expr, func)",
    "description": "array_sort(expr, func) - Sorts the input array. If func is omitted, sort in ascending order. The elements of the input array must be orderable. NaN is greater than any non-NaN elements for double/float type. Null elements will be placed at the end of the returned array. Since 3.0.0 this function also sorts and returns the array based on the given comparator function. The comparator will take two arguments representing two elements of the array. It returns a negative integer, 0, or a positive integer as the first element is less than, equal to, or greater than the second element. If the comparator function returns null, the function will fail and raise an error.",
    "category": "Built-in"
  },
  {
    "name": "array_union",
    "usage": "array_union(array1, array2)",
    "description": "array_union(array1, array2) - Returns an array of the elements in the union of array1 and array2, without duplicates.",
    "category": "Built-in"
  },
  {
    "name": "arrays_overlap",
    "usage": "arrays_overlap(a1, a2)",
    "description": "arrays_overlap(a1, a2) - Returns true if a1 contains at least a non-null element present also in a2. If the arrays have no common element and they are both non-empty and either of them contains a null element null is returned, false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "arrays_zip",
    "usage": "arrays_zip(a1, a2, ...)",
    "description": "arrays_zip(a1, a2, ...) - Returns a merged array of structs in which the N-th struct contains all N-th values of input arrays.",
    "category": "Built-in"
  },
  {
    "name": "ascii",
    "usage": "ascii(str)",
    "description": "ascii(str) - Returns the numeric value of the first character of str.",
    "category": "Built-in"
  },
  {
    "name": "asin",
    "usage": "asin(expr)",
    "description": "asin(expr) - Returns the inverse sine (a.k.a. arc sine) the arc sin of expr, as if computed by java.lang.Math.asin.",
    "category": "Built-in"
  },
  {
    "name": "asinh",
    "usage": "asinh(expr)",
    "description": "asinh(expr) - Returns inverse hyperbolic sine of expr.",
    "category": "Built-in"
  },
  {
    "name": "assert_true",
    "usage": "assert_true(expr [, message])",
    "description": "assert_true(expr [, message]) - Throws an exception if expr is not true.",
    "category": "Built-in"
  },
  {
    "name": "atan",
    "usage": "atan(expr)",
    "description": "atan(expr) - Returns the inverse tangent (a.k.a. arc tangent) of expr, as if computed by java.lang.Math.atan",
    "category": "Built-in"
  },
  {
    "name": "atan2",
    "usage": "atan2(exprY, exprX)",
    "description": "atan2(exprY, exprX) - Returns the angle in radians between the positive x-axis of a plane and the point given by the coordinates (exprX, exprY), as if computed by java.lang.Math.atan2.",
    "category": "Built-in"
  },
  {
    "name": "atanh",
    "usage": "atanh(expr)",
    "description": "atanh(expr) - Returns inverse hyperbolic tangent of expr.",
    "category": "Built-in"
  },
  {
    "name": "avg",
    "usage": "avg(expr)",
    "description": "avg(expr) - Returns the mean calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "base64",
    "usage": "base64(bin)",
    "description": "base64(bin) - Converts the argument from a binary bin to a base 64 string.",
    "category": "Built-in"
  },
  {
    "name": "between",
    "usage": "input [NOT] between lower AND upper",
    "description": "input [NOT] between lower AND upper - evaluate if input is [not] in between lower and upper",
    "category": "Built-in"
  },
  {
    "name": "bigint",
    "usage": "bigint(expr)",
    "description": "bigint(expr) - Casts the value expr to the target data type bigint.",
    "category": "Built-in"
  },
  {
    "name": "bin",
    "usage": "bin(expr)",
    "description": "bin(expr) - Returns the string representation of the long value expr represented in binary.",
    "category": "Built-in"
  },
  {
    "name": "binary",
    "usage": "binary(expr)",
    "description": "binary(expr) - Casts the value expr to the target data type binary.",
    "category": "Built-in"
  },
  {
    "name": "bit_and",
    "usage": "bit_and(expr)",
    "description": "bit_and(expr) - Returns the bitwise AND of all non-null input values, or null if none.",
    "category": "Built-in"
  },
  {
    "name": "bit_count",
    "usage": "bit_count(expr)",
    "description": "bit_count(expr) - Returns the number of bits that are set in the argument expr as an unsigned 64-bit integer, or NULL if the argument is NULL.",
    "category": "Built-in"
  },
  {
    "name": "bit_get",
    "usage": "bit_get(expr, pos)",
    "description": "bit_get(expr, pos) - Returns the value of the bit (0 or 1) at the specified position. The positions are numbered from right to left, starting at zero. The position argument cannot be negative.",
    "category": "Built-in"
  },
  {
    "name": "bit_length",
    "usage": "bit_length(expr)",
    "description": "bit_length(expr) - Returns the bit length of string data or number of bits of binary data.",
    "category": "Built-in"
  },
  {
    "name": "bit_or",
    "usage": "bit_or(expr)",
    "description": "bit_or(expr) - Returns the bitwise OR of all non-null input values, or null if none.",
    "category": "Built-in"
  },
  {
    "name": "bit_xor",
    "usage": "bit_xor(expr)",
    "description": "bit_xor(expr) - Returns the bitwise XOR of all non-null input values, or null if none.",
    "category": "Built-in"
  },
  {
    "name": "bitmap_and_agg",
    "usage": "bitmap_and_agg(child)",
    "description": "bitmap_and_agg(child) - Returns a bitmap that is the bitwise AND of all of the bitmaps from the child expression. The input should be bitmaps created from bitmap_construct_agg().",
    "category": "Built-in"
  },
  {
    "name": "bitmap_bit_position",
    "usage": "bitmap_bit_position(child)",
    "description": "bitmap_bit_position(child) - Returns the bit position for the given input child expression.",
    "category": "Built-in"
  },
  {
    "name": "bitmap_bucket_number",
    "usage": "bitmap_bucket_number(child)",
    "description": "bitmap_bucket_number(child) - Returns the bucket number for the given input child expression.",
    "category": "Built-in"
  },
  {
    "name": "bitmap_construct_agg",
    "usage": "bitmap_construct_agg(child)",
    "description": "bitmap_construct_agg(child) - Returns a bitmap with the positions of the bits set from all the values from the child expression. The child expression will most likely be bitmap_bit_position().",
    "category": "Built-in"
  },
  {
    "name": "bitmap_count",
    "usage": "bitmap_count(child)",
    "description": "bitmap_count(child) - Returns the number of set bits in the child bitmap.",
    "category": "Built-in"
  },
  {
    "name": "bitmap_or_agg",
    "usage": "bitmap_or_agg(child)",
    "description": "bitmap_or_agg(child) - Returns a bitmap that is the bitwise OR of all of the bitmaps from the child expression. The input should be bitmaps created from bitmap_construct_agg().",
    "category": "Built-in"
  },
  {
    "name": "bool_and",
    "usage": "bool_and(expr)",
    "description": "bool_and(expr) - Returns true if all values of expr are true.",
    "category": "Built-in"
  },
  {
    "name": "bool_or",
    "usage": "bool_or(expr)",
    "description": "bool_or(expr) - Returns true if at least one value of expr is true.",
    "category": "Built-in"
  },
  {
    "name": "boolean",
    "usage": "boolean(expr)",
    "description": "boolean(expr) - Casts the value expr to the target data type boolean.",
    "category": "Built-in"
  },
  {
    "name": "bround",
    "usage": "bround(expr, d)",
    "description": "bround(expr, d) - Returns expr rounded to d decimal places using HALF_EVEN rounding mode.",
    "category": "Built-in"
  },
  {
    "name": "btrim",
    "usage": "btrim(str)",
    "description": "btrim(str) - Removes the leading and trailing space characters from str.",
    "category": "Built-in"
  },
  {
    "name": "cardinality",
    "usage": "cardinality(expr)",
    "description": "cardinality(expr) - Returns the size of an array or a map. This function returns -1 for null input only if spark.sql.ansi.enabled is false and spark.sql.legacy.sizeOfNull is true. Otherwise, it returns null for null input. With the default settings, the function returns null for null input.",
    "category": "Built-in"
  },
  {
    "name": "case",
    "usage": "CASE expr1 WHEN expr2 THEN expr3 [WHEN expr4 THEN expr5]* [ELSE expr6] END",
    "description": "CASE expr1 WHEN expr2 THEN expr3 [WHEN expr4 THEN expr5]* [ELSE expr6] END - When expr1 = expr2, returns expr3; when expr1 = expr4, return expr5; else return expr6.",
    "category": "Built-in"
  },
  {
    "name": "cast",
    "usage": "cast(expr AS type)",
    "description": "cast(expr AS type) - Casts the value expr to the target data type type. expr :: type alternative casting syntax is also supported.",
    "category": "Built-in"
  },
  {
    "name": "cbrt",
    "usage": "cbrt(expr)",
    "description": "cbrt(expr) - Returns the cube root of expr.",
    "category": "Built-in"
  },
  {
    "name": "ceil",
    "usage": "ceil(expr[, scale])",
    "description": "ceil(expr[, scale]) - Returns the smallest number after rounding up that is not smaller than expr. An optional scale parameter can be specified to control the rounding behavior.",
    "category": "Built-in"
  },
  {
    "name": "ceiling",
    "usage": "ceiling(expr[, scale])",
    "description": "ceiling(expr[, scale]) - Returns the smallest number after rounding up that is not smaller than expr. An optional scale parameter can be specified to control the rounding behavior.",
    "category": "Built-in"
  },
  {
    "name": "char",
    "usage": "char(expr)",
    "description": "char(expr) - Returns the ASCII character having the binary equivalent to expr. If n is larger than 256 the result is equivalent to chr(n % 256)",
    "category": "Built-in"
  },
  {
    "name": "char_length",
    "usage": "char_length(expr)",
    "description": "char_length(expr) - Returns the character length of string data or number of bytes of binary data. The length of string data includes the trailing spaces. The length of binary data includes binary zeros.",
    "category": "Built-in"
  },
  {
    "name": "character_length",
    "usage": "character_length(expr)",
    "description": "character_length(expr) - Returns the character length of string data or number of bytes of binary data. The length of string data includes the trailing spaces. The length of binary data includes binary zeros.",
    "category": "Built-in"
  },
  {
    "name": "chr",
    "usage": "chr(expr)",
    "description": "chr(expr) - Returns the ASCII character having the binary equivalent to expr. If n is larger than 256 the result is equivalent to chr(n % 256)",
    "category": "Built-in"
  },
  {
    "name": "coalesce",
    "usage": "coalesce(expr1, expr2, ...)",
    "description": "coalesce(expr1, expr2, ...) - Returns the first non-null argument if exists. Otherwise, null.",
    "category": "Built-in"
  },
  {
    "name": "collate",
    "usage": "collate(expr, collationName)",
    "description": "collate(expr, collationName) - Marks a given expression with the specified collation.",
    "category": "Built-in"
  },
  {
    "name": "collation",
    "usage": "collation(expr)",
    "description": "collation(expr) - Returns the collation name of a given expression.",
    "category": "Built-in"
  },
  {
    "name": "collations",
    "usage": "collations()",
    "description": "collations() - Get all of the Spark SQL string collations",
    "category": "Built-in"
  },
  {
    "name": "collect_list",
    "usage": "collect_list(expr)",
    "description": "collect_list(expr) - Collects and returns a list of non-unique elements.",
    "category": "Built-in"
  },
  {
    "name": "collect_set",
    "usage": "collect_set(expr)",
    "description": "collect_set(expr) - Collects and returns a set of unique elements.",
    "category": "Built-in"
  },
  {
    "name": "concat",
    "usage": "concat(col1, col2, ..., colN)",
    "description": "concat(col1, col2, ..., colN) - Returns the concatenation of col1, col2, ..., colN.",
    "category": "Built-in"
  },
  {
    "name": "concat_ws",
    "usage": "concat_ws(sep[, str | array(str)]+)",
    "description": "concat_ws(sep[, str | array(str)]+) - Returns the concatenation of the strings separated by sep, skipping null values.",
    "category": "Built-in"
  },
  {
    "name": "contains",
    "usage": "contains(left, right)",
    "description": "contains(left, right) - Returns a boolean. The value is True if right is found inside left. Returns NULL if either input expression is NULL. Otherwise, returns False. Both left or right must be of STRING or BINARY type.",
    "category": "Built-in"
  },
  {
    "name": "conv",
    "usage": "conv(num, from_base, to_base)",
    "description": "conv(num, from_base, to_base) - Convert num from from_base to to_base.",
    "category": "Built-in"
  },
  {
    "name": "convert_timezone",
    "usage": "convert_timezone([sourceTz, ]targetTz, sourceTs)",
    "description": "convert_timezone([sourceTz, ]targetTz, sourceTs) - Converts the timestamp without time zone sourceTs from the sourceTz time zone to targetTz.",
    "category": "Built-in"
  },
  {
    "name": "corr",
    "usage": "corr(expr1, expr2)",
    "description": "corr(expr1, expr2) - Returns Pearson coefficient of correlation between a set of number pairs.",
    "category": "Built-in"
  },
  {
    "name": "cos",
    "usage": "cos(expr)",
    "description": "cos(expr) - Returns the cosine of expr, as if computed by java.lang.Math.cos.",
    "category": "Built-in"
  },
  {
    "name": "cosh",
    "usage": "cosh(expr)",
    "description": "cosh(expr) - Returns the hyperbolic cosine of expr, as if computed by java.lang.Math.cosh.",
    "category": "Built-in"
  },
  {
    "name": "cot",
    "usage": "cot(expr)",
    "description": "cot(expr) - Returns the cotangent of expr, as if computed by 1/java.lang.Math.tan.",
    "category": "Built-in"
  },
  {
    "name": "count",
    "usage": "count(*)",
    "description": "count(*) - Returns the total number of retrieved rows, including rows containing null.",
    "category": "Built-in"
  },
  {
    "name": "count_if",
    "usage": "count_if(expr)",
    "description": "count_if(expr) - Returns the number of TRUE values for the expression.",
    "category": "Built-in"
  },
  {
    "name": "count_min_sketch",
    "usage": "count_min_sketch(col, eps, confidence, seed)",
    "description": "count_min_sketch(col, eps, confidence, seed) - Returns a count-min sketch of a column with the given esp, confidence and seed. The result is an array of bytes, which can be deserialized to a CountMinSketch before usage. Count-min sketch is a probabilistic data structure used for cardinality estimation using sub-linear space.",
    "category": "Built-in"
  },
  {
    "name": "covar_pop",
    "usage": "covar_pop(expr1, expr2)",
    "description": "covar_pop(expr1, expr2) - Returns the population covariance of a set of number pairs.",
    "category": "Built-in"
  },
  {
    "name": "covar_samp",
    "usage": "covar_samp(expr1, expr2)",
    "description": "covar_samp(expr1, expr2) - Returns the sample covariance of a set of number pairs.",
    "category": "Built-in"
  },
  {
    "name": "crc32",
    "usage": "crc32(expr)",
    "description": "crc32(expr) - Returns a cyclic redundancy check value of the expr as a bigint.",
    "category": "Built-in"
  },
  {
    "name": "csc",
    "usage": "csc(expr)",
    "description": "csc(expr) - Returns the cosecant of expr, as if computed by 1/java.lang.Math.sin.",
    "category": "Built-in"
  },
  {
    "name": "cume_dist",
    "usage": "cume_dist()",
    "description": "cume_dist() - Computes the position of a value relative to all values in the partition.",
    "category": "Built-in"
  },
  {
    "name": "curdate",
    "usage": "curdate()",
    "description": "curdate() - Returns the current date at the start of query evaluation. All calls of curdate within the same query return the same value.",
    "category": "Built-in"
  },
  {
    "name": "current_catalog",
    "usage": "current_catalog()",
    "description": "current_catalog() - Returns the current catalog.",
    "category": "Built-in"
  },
  {
    "name": "current_database",
    "usage": "current_database()",
    "description": "current_database() - Returns the current database.",
    "category": "Built-in"
  },
  {
    "name": "current_date",
    "usage": "current_date()",
    "description": "current_date() - Returns the current date at the start of query evaluation. All calls of current_date within the same query return the same value.",
    "category": "Built-in"
  },
  {
    "name": "current_schema",
    "usage": "current_schema()",
    "description": "current_schema() - Returns the current database.",
    "category": "Built-in"
  },
  {
    "name": "current_time",
    "usage": "current_time([precision])",
    "description": "current_time([precision]) - Returns the current time at the start of query evaluation. All calls of current_time within the same query return the same value.",
    "category": "Built-in"
  },
  {
    "name": "current_timestamp",
    "usage": "current_timestamp()",
    "description": "current_timestamp() - Returns the current timestamp at the start of query evaluation. All calls of current_timestamp within the same query return the same value.",
    "category": "Built-in"
  },
  {
    "name": "current_timezone",
    "usage": "current_timezone()",
    "description": "current_timezone() - Returns the current session local timezone.",
    "category": "Built-in"
  },
  {
    "name": "current_user",
    "usage": "current_user()",
    "description": "current_user() - user name of current execution context.",
    "category": "Built-in"
  },
  {
    "name": "date",
    "usage": "date(expr)",
    "description": "date(expr) - Casts the value expr to the target data type date.",
    "category": "Built-in"
  },
  {
    "name": "date_add",
    "usage": "date_add(start_date, num_days)",
    "description": "date_add(start_date, num_days) - Returns the date that is num_days after start_date.",
    "category": "Built-in"
  },
  {
    "name": "date_diff",
    "usage": "date_diff(endDate, startDate)",
    "description": "date_diff(endDate, startDate) - Returns the number of days from startDate to endDate.",
    "category": "Built-in"
  },
  {
    "name": "date_format",
    "usage": "date_format(timestamp, fmt)",
    "description": "date_format(timestamp, fmt) - Converts timestamp to a value of string in the format specified by the date format fmt.",
    "category": "Built-in"
  },
  {
    "name": "date_from_unix_date",
    "usage": "date_from_unix_date(days)",
    "description": "date_from_unix_date(days) - Create date from the number of days since 1970-01-01.",
    "category": "Built-in"
  },
  {
    "name": "date_part",
    "usage": "date_part(field, source)",
    "description": "date_part(field, source) - Extracts a part of the date/timestamp or interval source.",
    "category": "Built-in"
  },
  {
    "name": "date_sub",
    "usage": "date_sub(start_date, num_days)",
    "description": "date_sub(start_date, num_days) - Returns the date that is num_days before start_date.",
    "category": "Built-in"
  },
  {
    "name": "date_trunc",
    "usage": "date_trunc(fmt, ts)",
    "description": "date_trunc(fmt, ts) - Returns timestamp ts truncated to the unit specified by the format model fmt.",
    "category": "Built-in"
  },
  {
    "name": "dateadd",
    "usage": "dateadd(start_date, num_days)",
    "description": "dateadd(start_date, num_days) - Returns the date that is num_days after start_date.",
    "category": "Built-in"
  },
  {
    "name": "datediff",
    "usage": "datediff(endDate, startDate)",
    "description": "datediff(endDate, startDate) - Returns the number of days from startDate to endDate.",
    "category": "Built-in"
  },
  {
    "name": "datepart",
    "usage": "datepart(field, source)",
    "description": "datepart(field, source) - Extracts a part of the date/timestamp or interval source.",
    "category": "Built-in"
  },
  {
    "name": "day",
    "usage": "day(date)",
    "description": "day(date) - Returns the day of month of the date/timestamp.",
    "category": "Built-in"
  },
  {
    "name": "dayname",
    "usage": "dayname(date)",
    "description": "dayname(date) - Returns the three-letter abbreviated day name from the given date.",
    "category": "Built-in"
  },
  {
    "name": "dayofmonth",
    "usage": "dayofmonth(date)",
    "description": "dayofmonth(date) - Returns the day of month of the date/timestamp.",
    "category": "Built-in"
  },
  {
    "name": "dayofweek",
    "usage": "dayofweek(date)",
    "description": "dayofweek(date) - Returns the day of the week for date/timestamp (1 = Sunday, 2 = Monday, ..., 7 = Saturday).",
    "category": "Built-in"
  },
  {
    "name": "dayofyear",
    "usage": "dayofyear(date)",
    "description": "dayofyear(date) - Returns the day of year of the date/timestamp.",
    "category": "Built-in"
  },
  {
    "name": "decimal",
    "usage": "decimal(expr)",
    "description": "decimal(expr) - Casts the value expr to the target data type decimal.",
    "category": "Built-in"
  },
  {
    "name": "decode",
    "usage": "decode(bin, charset)",
    "description": "decode(bin, charset) - Decodes the first argument using the second argument character set. If either argument is null, the result will also be null.",
    "category": "Built-in"
  },
  {
    "name": "degrees",
    "usage": "degrees(expr)",
    "description": "degrees(expr) - Converts radians to degrees.",
    "category": "Built-in"
  },
  {
    "name": "dense_rank",
    "usage": "dense_rank()",
    "description": "dense_rank() - Computes the rank of a value in a group of values. The result is one plus the previously assigned rank value. Unlike the function rank, dense_rank will not produce gaps in the ranking sequence.",
    "category": "Built-in"
  },
  {
    "name": "div",
    "usage": "expr1 div expr2",
    "description": "expr1 div expr2 - Divide expr1 by expr2. It returns NULL if an operand is NULL or expr2 is 0. The result is casted to long.",
    "category": "Built-in"
  },
  {
    "name": "double",
    "usage": "double(expr)",
    "description": "double(expr) - Casts the value expr to the target data type double.",
    "category": "Built-in"
  },
  {
    "name": "e",
    "usage": "e()",
    "description": "e() - Returns Euler's number, e.",
    "category": "Built-in"
  },
  {
    "name": "element_at",
    "usage": "element_at(array, index)",
    "description": "element_at(array, index) - Returns element of array at given (1-based) index. If Index is 0, Spark will throw an error. If index < 0, accesses elements from the last to the first. The function returns NULL if the index exceeds the length of the array and spark.sql.ansi.enabled is set to false. If spark.sql.ansi.enabled is set to true, it throws ArrayIndexOutOfBoundsException for invalid indices.",
    "category": "Built-in"
  },
  {
    "name": "elt",
    "usage": "elt(n, input1, input2, ...)",
    "description": "elt(n, input1, input2, ...) - Returns the n-th input, e.g., returns input2 when n is 2. The function returns NULL if the index exceeds the length of the array and spark.sql.ansi.enabled is set to false. If spark.sql.ansi.enabled is set to true, it throws ArrayIndexOutOfBoundsException for invalid indices.",
    "category": "Built-in"
  },
  {
    "name": "encode",
    "usage": "encode(str, charset)",
    "description": "encode(str, charset) - Encodes the first argument using the second argument character set. If either argument is null, the result will also be null.",
    "category": "Built-in"
  },
  {
    "name": "endswith",
    "usage": "endswith(left, right)",
    "description": "endswith(left, right) - Returns a boolean. The value is True if left ends with right. Returns NULL if either input expression is NULL. Otherwise, returns False. Both left or right must be of STRING or BINARY type.",
    "category": "Built-in"
  },
  {
    "name": "equal_null",
    "usage": "equal_null(expr1, expr2)",
    "description": "equal_null(expr1, expr2) - Returns same result as the EQUAL(=) operator for non-null operands, but returns true if both are null, false if one of the them is null.",
    "category": "Built-in"
  },
  {
    "name": "every",
    "usage": "every(expr)",
    "description": "every(expr) - Returns true if all values of expr are true.",
    "category": "Built-in"
  },
  {
    "name": "exists",
    "usage": "exists(expr, pred)",
    "description": "exists(expr, pred) - Tests whether a predicate holds for one or more elements in the array.",
    "category": "Built-in"
  },
  {
    "name": "exp",
    "usage": "exp(expr)",
    "description": "exp(expr) - Returns e to the power of expr.",
    "category": "Built-in"
  },
  {
    "name": "explode",
    "usage": "explode(expr)",
    "description": "explode(expr) - Separates the elements of array expr into multiple rows, or the elements of map expr into multiple rows and columns. Unless specified otherwise, uses the default column name col for elements of the array or key and value for the elements of the map.",
    "category": "Built-in"
  },
  {
    "name": "explode_outer",
    "usage": "explode_outer(expr)",
    "description": "explode_outer(expr) - Separates the elements of array expr into multiple rows, or the elements of map expr into multiple rows and columns. Unless specified otherwise, uses the default column name col for elements of the array or key and value for the elements of the map.",
    "category": "Built-in"
  },
  {
    "name": "expm1",
    "usage": "expm1(expr)",
    "description": "expm1(expr) - Returns exp(expr) - 1.",
    "category": "Built-in"
  },
  {
    "name": "extract",
    "usage": "extract(field FROM source)",
    "description": "extract(field FROM source) - Extracts a part of the date or timestamp or time or interval source.",
    "category": "Built-in"
  },
  {
    "name": "factorial",
    "usage": "factorial(expr)",
    "description": "factorial(expr) - Returns the factorial of expr. expr is [0..20]. Otherwise, null.",
    "category": "Built-in"
  },
  {
    "name": "filter",
    "usage": "filter(expr, func)",
    "description": "filter(expr, func) - Filters the input array using the given predicate.",
    "category": "Built-in"
  },
  {
    "name": "find_in_set",
    "usage": "find_in_set(str, str_array)",
    "description": "find_in_set(str, str_array) - Returns the index (1-based) of the given string (str) in the comma-delimited list (str_array). Returns 0, if the string was not found or if the given string (str) contains a comma.",
    "category": "Built-in"
  },
  {
    "name": "first",
    "usage": "first(expr[, isIgnoreNull])",
    "description": "first(expr[, isIgnoreNull]) - Returns the first value of expr for a group of rows. If isIgnoreNull is true, returns only non-null values.",
    "category": "Built-in"
  },
  {
    "name": "first_value",
    "usage": "first_value(expr[, isIgnoreNull])",
    "description": "first_value(expr[, isIgnoreNull]) - Returns the first value of expr for a group of rows. If isIgnoreNull is true, returns only non-null values.",
    "category": "Built-in"
  },
  {
    "name": "flatten",
    "usage": "flatten(arrayOfArrays)",
    "description": "flatten(arrayOfArrays) - Transforms an array of arrays into a single array.",
    "category": "Built-in"
  },
  {
    "name": "float",
    "usage": "float(expr)",
    "description": "float(expr) - Casts the value expr to the target data type float.",
    "category": "Built-in"
  },
  {
    "name": "floor",
    "usage": "floor(expr[, scale])",
    "description": "floor(expr[, scale]) - Returns the largest number after rounding down that is not greater than expr. An optional scale parameter can be specified to control the rounding behavior.",
    "category": "Built-in"
  },
  {
    "name": "forall",
    "usage": "forall(expr, pred)",
    "description": "forall(expr, pred) - Tests whether a predicate holds for all elements in the array.",
    "category": "Built-in"
  },
  {
    "name": "format_number",
    "usage": "format_number(expr1, expr2)",
    "description": "format_number(expr1, expr2) - Formats the number expr1 like '#,###,###.##', rounded to expr2 decimal places. If expr2 is 0, the result has no decimal point or fractional part. expr2 also accept a user specified format. This is supposed to function like MySQL's FORMAT.",
    "category": "Built-in"
  },
  {
    "name": "format_string",
    "usage": "format_string(strfmt, obj, ...)",
    "description": "format_string(strfmt, obj, ...) - Returns a formatted string from printf-style format strings.",
    "category": "Built-in"
  },
  {
    "name": "from_avro",
    "usage": "from_avro(child, jsonFormatSchema, options)",
    "description": "from_avro(child, jsonFormatSchema, options) - Converts a binary Avro value into a Catalyst value.",
    "category": "Built-in"
  },
  {
    "name": "from_csv",
    "usage": "from_csv(csvStr, schema[, options])",
    "description": "from_csv(csvStr, schema[, options]) - Returns a struct value with the given csvStr and schema.",
    "category": "Built-in"
  },
  {
    "name": "from_json",
    "usage": "from_json(jsonStr, schema[, options])",
    "description": "from_json(jsonStr, schema[, options]) - Returns a struct value with the given jsonStr and schema.",
    "category": "Built-in"
  },
  {
    "name": "from_protobuf",
    "usage": "from_protobuf(data, messageName, descFilePath, options)",
    "description": "from_protobuf(data, messageName, descFilePath, options) - Converts a binary Protobuf value into a Catalyst value.",
    "category": "Built-in"
  },
  {
    "name": "from_unixtime",
    "usage": "from_unixtime(unix_time[, fmt])",
    "description": "from_unixtime(unix_time[, fmt]) - Returns unix_time in the specified fmt.",
    "category": "Built-in"
  },
  {
    "name": "from_utc_timestamp",
    "usage": "from_utc_timestamp(timestamp, timezone)",
    "description": "from_utc_timestamp(timestamp, timezone) - Given a timestamp like '2017-07-14 02:40:00.0', interprets it as a time in UTC, and renders that time as a timestamp in the given time zone. For example, 'GMT+1' would yield '2017-07-14 03:40:00.0'.",
    "category": "Built-in"
  },
  {
    "name": "from_xml",
    "usage": "from_xml(xmlStr, schema[, options])",
    "description": "from_xml(xmlStr, schema[, options]) - Returns a struct value with the given xmlStr and schema.",
    "category": "Built-in"
  },
  {
    "name": "get",
    "usage": "get(array, index)",
    "description": "get(array, index) - Returns element of array at given (0-based) index. If the index points outside of the array boundaries, then this function returns NULL.",
    "category": "Built-in"
  },
  {
    "name": "get_json_object",
    "usage": "get_json_object(json_txt, path)",
    "description": "get_json_object(json_txt, path) - Extracts a json object from path.",
    "category": "Built-in"
  },
  {
    "name": "getbit",
    "usage": "getbit(expr, pos)",
    "description": "getbit(expr, pos) - Returns the value of the bit (0 or 1) at the specified position. The positions are numbered from right to left, starting at zero. The position argument cannot be negative.",
    "category": "Built-in"
  },
  {
    "name": "greatest",
    "usage": "greatest(expr, ...)",
    "description": "greatest(expr, ...) - Returns the greatest value of all parameters, skipping null values.",
    "category": "Built-in"
  },
  {
    "name": "grouping",
    "usage": "grouping(col)",
    "description": "grouping(col) - indicates whether a specified column in a GROUP BY is aggregated or not, returns 1 for aggregated or 0 for not aggregated in the result set.\",",
    "category": "Built-in"
  },
  {
    "name": "grouping_id",
    "usage": "grouping_id([col1[, col2 ..]])",
    "description": "grouping_id([col1[, col2 ..]]) - returns the level of grouping, equals to (grouping(c1) << (n-1)) + (grouping(c2) << (n-2)) + ... + grouping(cn)",
    "category": "Built-in"
  },
  {
    "name": "hash",
    "usage": "hash(expr1, expr2, ...)",
    "description": "hash(expr1, expr2, ...) - Returns a hash value of the arguments.",
    "category": "Built-in"
  },
  {
    "name": "hex",
    "usage": "hex(expr)",
    "description": "hex(expr) - Converts expr to hexadecimal.",
    "category": "Built-in"
  },
  {
    "name": "histogram_numeric",
    "usage": "histogram_numeric(expr, nb)",
    "description": "histogram_numeric(expr, nb) - Computes a histogram on numeric 'expr' using nb bins. The return value is an array of (x,y) pairs representing the centers of the histogram's bins. As the value of 'nb' is increased, the histogram approximation gets finer-grained, but may yield artifacts around outliers. In practice, 20-40 histogram bins appear to work well, with more bins being required for skewed or smaller datasets. Note that this function creates a histogram with non-uniform bin widths. It offers no guarantees in terms of the mean-squared-error of the histogram, but in practice is comparable to the histograms produced by the R/S-Plus statistical computing packages. Note: the output type of the 'x' field in the return value is propagated from the input value consumed in the aggregate function.",
    "category": "Built-in"
  },
  {
    "name": "hll_sketch_agg",
    "usage": "hll_sketch_agg(expr, lgConfigK)",
    "description": "hll_sketch_agg(expr, lgConfigK) - Returns the HllSketch's updatable binary representation. lgConfigK (optional) the log-base-2 of K, with K is the number of buckets or slots for the HllSketch.",
    "category": "Built-in"
  },
  {
    "name": "hll_sketch_estimate",
    "usage": "hll_sketch_estimate(expr)",
    "description": "hll_sketch_estimate(expr) - Returns the estimated number of unique values given the binary representation of a Datasketches HllSketch.",
    "category": "Built-in"
  },
  {
    "name": "hll_union",
    "usage": "hll_union(first, second, allowDifferentLgConfigK)",
    "description": "hll_union(first, second, allowDifferentLgConfigK) - Merges two binary representations of Datasketches HllSketch objects, using a Datasketches Union object. Set allowDifferentLgConfigK to true to allow unions of sketches with different lgConfigK values (defaults to false).",
    "category": "Built-in"
  },
  {
    "name": "hll_union_agg",
    "usage": "hll_union_agg(expr, allowDifferentLgConfigK)",
    "description": "hll_union_agg(expr, allowDifferentLgConfigK) - Returns the estimated number of unique values. allowDifferentLgConfigK (optional) Allow sketches with different lgConfigK values to be unioned (defaults to false).",
    "category": "Built-in"
  },
  {
    "name": "hour",
    "usage": "hour(expr)",
    "description": "hour(expr) - Returns the hour component of the given expression.",
    "category": "Built-in"
  },
  {
    "name": "hypot",
    "usage": "hypot(expr1, expr2)",
    "description": "hypot(expr1, expr2) - Returns sqrt(expr1Â² + expr2Â²).",
    "category": "Built-in"
  },
  {
    "name": "if",
    "usage": "if(expr1, expr2, expr3)",
    "description": "if(expr1, expr2, expr3) - If expr1 evaluates to true, then returns expr2; otherwise returns expr3.",
    "category": "Built-in"
  },
  {
    "name": "ifnull",
    "usage": "ifnull(expr1, expr2)",
    "description": "ifnull(expr1, expr2) - Returns expr2 if expr1 is null, or expr1 otherwise.",
    "category": "Built-in"
  },
  {
    "name": "ilike",
    "usage": "str ilike pattern[ ESCAPE escape]",
    "description": "str ilike pattern[ ESCAPE escape] - Returns true if str matches pattern with escape case-insensitively, null if any arguments are null, false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "in",
    "usage": "expr1 in(expr2, expr3, ...)",
    "description": "expr1 in(expr2, expr3, ...) - Returns true if expr equals to any valN.",
    "category": "Built-in"
  },
  {
    "name": "initcap",
    "usage": "initcap(str)",
    "description": "initcap(str) - Returns str with the first letter of each word in uppercase. All other letters are in lowercase. Words are delimited by white space.",
    "category": "Built-in"
  },
  {
    "name": "inline",
    "usage": "inline(expr)",
    "description": "inline(expr) - Explodes an array of structs into a table. Uses column names col1, col2, etc. by default unless specified otherwise.",
    "category": "Built-in"
  },
  {
    "name": "inline_outer",
    "usage": "inline_outer(expr)",
    "description": "inline_outer(expr) - Explodes an array of structs into a table. Uses column names col1, col2, etc. by default unless specified otherwise.",
    "category": "Built-in"
  },
  {
    "name": "input_file_block_length",
    "usage": "input_file_block_length()",
    "description": "input_file_block_length() - Returns the length of the block being read, or -1 if not available.",
    "category": "Built-in"
  },
  {
    "name": "input_file_block_start",
    "usage": "input_file_block_start()",
    "description": "input_file_block_start() - Returns the start offset of the block being read, or -1 if not available.",
    "category": "Built-in"
  },
  {
    "name": "input_file_name",
    "usage": "input_file_name()",
    "description": "input_file_name() - Returns the name of the file being read, or empty string if not available.",
    "category": "Built-in"
  },
  {
    "name": "instr",
    "usage": "instr(str, substr)",
    "description": "instr(str, substr) - Returns the (1-based) index of the first occurrence of substr in str.",
    "category": "Built-in"
  },
  {
    "name": "int",
    "usage": "int(expr)",
    "description": "int(expr) - Casts the value expr to the target data type int.",
    "category": "Built-in"
  },
  {
    "name": "is_valid_utf8",
    "usage": "is_valid_utf8(str)",
    "description": "is_valid_utf8(str) - Returns true if str is a valid UTF-8 string, otherwise returns false.",
    "category": "Built-in"
  },
  {
    "name": "is_variant_null",
    "usage": "is_variant_null(expr)",
    "description": "is_variant_null(expr) - Check if a variant value is a variant null. Returns true if and only if the input is a variant null and false otherwise (including in the case of SQL NULL).",
    "category": "Built-in"
  },
  {
    "name": "isnan",
    "usage": "isnan(expr)",
    "description": "isnan(expr) - Returns true if expr is NaN, or false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "isnotnull",
    "usage": "isnotnull(expr)",
    "description": "isnotnull(expr) - Returns true if expr is not null, or false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "isnull",
    "usage": "isnull(expr)",
    "description": "isnull(expr) - Returns true if expr is null, or false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "java_method",
    "usage": "java_method(class, method[, arg1[, arg2 ..]])",
    "description": "java_method(class, method[, arg1[, arg2 ..]]) - Calls a method with reflection.",
    "category": "Built-in"
  },
  {
    "name": "json_array_length",
    "usage": "json_array_length(jsonArray)",
    "description": "json_array_length(jsonArray) - Returns the number of elements in the outermost JSON array.",
    "category": "Built-in"
  },
  {
    "name": "json_object_keys",
    "usage": "json_object_keys(json_object)",
    "description": "json_object_keys(json_object) - Returns all the keys of the outermost JSON object as an array.",
    "category": "Built-in"
  },
  {
    "name": "json_tuple",
    "usage": "json_tuple(jsonStr, p1, p2, ..., pn)",
    "description": "json_tuple(jsonStr, p1, p2, ..., pn) - Returns a tuple like the function get_json_object, but it takes multiple names. All the input parameters and output column types are string.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_agg_bigint",
    "usage": "kll_sketch_agg_bigint(expr[, k])",
    "description": "kll_sketch_agg_bigint(expr[, k]) - Returns the KllLongsSketch compact binary representation. The optional k parameter controls the size and accuracy of the sketch (default 200, range 8-65535). Larger k values provide more accurate quantile estimates but result in larger, slower sketches.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_agg_double",
    "usage": "kll_sketch_agg_double(expr[, k])",
    "description": "kll_sketch_agg_double(expr[, k]) - Returns the KllDoublesSketch compact binary representation. The optional k parameter controls the size and accuracy of the sketch (default 200, range 8-65535). Larger k values provide more accurate quantile estimates but result in larger, slower sketches.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_agg_float",
    "usage": "kll_sketch_agg_float(expr[, k])",
    "description": "kll_sketch_agg_float(expr[, k]) - Returns the KllFloatsSketch compact binary representation. The optional k parameter controls the size and accuracy of the sketch (default 200, range 8-65535). Larger k values provide more accurate quantile estimates but result in larger, slower sketches.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_get_n_bigint",
    "usage": "kll_sketch_get_n_bigint(expr)",
    "description": "kll_sketch_get_n_bigint(expr) - Returns the number of items collected in the sketch.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_get_n_double",
    "usage": "kll_sketch_get_n_double(expr)",
    "description": "kll_sketch_get_n_double(expr) - Returns the number of items collected in the sketch.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_get_n_float",
    "usage": "kll_sketch_get_n_float(expr)",
    "description": "kll_sketch_get_n_float(expr) - Returns the number of items collected in the sketch.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_get_quantile_bigint",
    "usage": "kll_sketch_get_quantile_bigint(left, right)",
    "description": "kll_sketch_get_quantile_bigint(left, right) - Extracts a single value from the quantiles sketch representing the desired quantile given the input rank. The desired quantile can either be a single value or an array. In the latter case, the function will return an array of results of equal length to the input array.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_get_quantile_double",
    "usage": "kll_sketch_get_quantile_double(left, right)",
    "description": "kll_sketch_get_quantile_double(left, right) - Extracts a single value from the quantiles sketch representing the desired quantile given the input rank. The desired quantile can either be a single value or an array. In the latter case, the function will return an array of results of equal length to the input array.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_get_quantile_float",
    "usage": "kll_sketch_get_quantile_float(left, right)",
    "description": "kll_sketch_get_quantile_float(left, right) - Extracts a single value from the quantiles sketch representing the desired quantile given the input rank. The desired quantile can either be a single value or an array. In the latter case, the function will return an array of results of equal length to the input array.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_get_rank_bigint",
    "usage": "kll_sketch_get_rank_bigint(left, right)",
    "description": "kll_sketch_get_rank_bigint(left, right) - Extracts a single value from the quantiles sketch representing the desired rank given the input quantile. The desired rank can either be a single value or an array. In the latter case, the function will return an array of results of equal length to the input array.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_get_rank_double",
    "usage": "kll_sketch_get_rank_double(left, right)",
    "description": "kll_sketch_get_rank_double(left, right) - Extracts a single value from the quantiles sketch representing the desired rank given the input quantile. The desired rank can either be a single value or an array. In the latter case, the function will return an array of results of equal length to the input array.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_get_rank_float",
    "usage": "kll_sketch_get_rank_float(left, right)",
    "description": "kll_sketch_get_rank_float(left, right) - Extracts a single value from the quantiles sketch representing the desired rank given the input quantile. The desired rank can either be a single value or an array. In the latter case, the function will return an array of results of equal length to the input array.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_merge_bigint",
    "usage": "kll_sketch_merge_bigint(left, right)",
    "description": "kll_sketch_merge_bigint(left, right) - Merges two sketch buffers together into one.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_merge_double",
    "usage": "kll_sketch_merge_double(left, right)",
    "description": "kll_sketch_merge_double(left, right) - Merges two sketch buffers together into one.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_merge_float",
    "usage": "kll_sketch_merge_float(left, right)",
    "description": "kll_sketch_merge_float(left, right) - Merges two sketch buffers together into one.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_to_string_bigint",
    "usage": "kll_sketch_to_string_bigint(expr)",
    "description": "kll_sketch_to_string_bigint(expr) - Returns human readable summary information about this sketch.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_to_string_double",
    "usage": "kll_sketch_to_string_double(expr)",
    "description": "kll_sketch_to_string_double(expr) - Returns human readable summary information about this sketch.",
    "category": "Built-in"
  },
  {
    "name": "kll_sketch_to_string_float",
    "usage": "kll_sketch_to_string_float(expr)",
    "description": "kll_sketch_to_string_float(expr) - Returns human readable summary information about this sketch.",
    "category": "Built-in"
  },
  {
    "name": "kurtosis",
    "usage": "kurtosis(expr)",
    "description": "kurtosis(expr) - Returns the kurtosis value calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "lag",
    "usage": "lag(input[, offset[, default]])",
    "description": "lag(input[, offset[, default]]) - Returns the value of input at the offsetth row before the current row in the window. The default value of offset is 1 and the default value of default is null. If the value of input at the offsetth row is null, null is returned. If there is no such offset row (e.g., when the offset is 1, the first row of the window does not have any previous row), default is returned.",
    "category": "Built-in"
  },
  {
    "name": "last",
    "usage": "last(expr[, isIgnoreNull])",
    "description": "last(expr[, isIgnoreNull]) - Returns the last value of expr for a group of rows. If isIgnoreNull is true, returns only non-null values",
    "category": "Built-in"
  },
  {
    "name": "last_day",
    "usage": "last_day(date)",
    "description": "last_day(date) - Returns the last day of the month which the date belongs to.",
    "category": "Built-in"
  },
  {
    "name": "last_value",
    "usage": "last_value(expr[, isIgnoreNull])",
    "description": "last_value(expr[, isIgnoreNull]) - Returns the last value of expr for a group of rows. If isIgnoreNull is true, returns only non-null values",
    "category": "Built-in"
  },
  {
    "name": "lcase",
    "usage": "lcase(str)",
    "description": "lcase(str) - Returns str with all characters changed to lowercase.",
    "category": "Built-in"
  },
  {
    "name": "lead",
    "usage": "lead(input[, offset[, default]])",
    "description": "lead(input[, offset[, default]]) - Returns the value of input at the offsetth row after the current row in the window. The default value of offset is 1 and the default value of default is null. If the value of input at the offsetth row is null, null is returned. If there is no such an offset row (e.g., when the offset is 1, the last row of the window does not have any subsequent row), default is returned.",
    "category": "Built-in"
  },
  {
    "name": "least",
    "usage": "least(expr, ...)",
    "description": "least(expr, ...) - Returns the least value of all parameters, skipping null values.",
    "category": "Built-in"
  },
  {
    "name": "left",
    "usage": "left(str, len)",
    "description": "left(str, len) - Returns the leftmost len(len can be string type) characters from the string str,if len is less or equal than 0 the result is an empty string.",
    "category": "Built-in"
  },
  {
    "name": "len",
    "usage": "len(expr)",
    "description": "len(expr) - Returns the character length of string data or number of bytes of binary data. The length of string data includes the trailing spaces. The length of binary data includes binary zeros.",
    "category": "Built-in"
  },
  {
    "name": "length",
    "usage": "length(expr)",
    "description": "length(expr) - Returns the character length of string data or number of bytes of binary data. The length of string data includes the trailing spaces. The length of binary data includes binary zeros.",
    "category": "Built-in"
  },
  {
    "name": "levenshtein",
    "usage": "levenshtein(str1, str2[, threshold])",
    "description": "levenshtein(str1, str2[, threshold]) - Returns the Levenshtein distance between the two given strings. If threshold is set and distance more than it, return -1.",
    "category": "Built-in"
  },
  {
    "name": "like",
    "usage": "str like pattern[ ESCAPE escape]",
    "description": "str like pattern[ ESCAPE escape] - Returns true if str matches pattern with escape, null if any arguments are null, false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "listagg",
    "usage": "listagg(expr[, delimiter])[ WITHIN GROUP (ORDER BY key [ASC | DESC] [,...])]",
    "description": "listagg(expr[, delimiter])[ WITHIN GROUP (ORDER BY key [ASC | DESC] [,...])] - Returns the concatenation of non-NULL input values, separated by the delimiter ordered by key. If all values are NULL, NULL is returned.",
    "category": "Built-in"
  },
  {
    "name": "ln",
    "usage": "ln(expr)",
    "description": "ln(expr) - Returns the natural logarithm (base e) of expr.",
    "category": "Built-in"
  },
  {
    "name": "localtimestamp",
    "usage": "localtimestamp()",
    "description": "localtimestamp() - Returns the current timestamp without time zone at the start of query evaluation. All calls of localtimestamp within the same query return the same value.",
    "category": "Built-in"
  },
  {
    "name": "locate",
    "usage": "locate(substr, str[, pos])",
    "description": "locate(substr, str[, pos]) - Returns the position of the first occurrence of substr in str after position pos. The given pos and return value are 1-based.",
    "category": "Built-in"
  },
  {
    "name": "log",
    "usage": "log(base, expr)",
    "description": "log(base, expr) - Returns the logarithm of expr with base.",
    "category": "Built-in"
  },
  {
    "name": "log10",
    "usage": "log10(expr)",
    "description": "log10(expr) - Returns the logarithm of expr with base 10.",
    "category": "Built-in"
  },
  {
    "name": "log1p",
    "usage": "log1p(expr)",
    "description": "log1p(expr) - Returns log(1 + expr).",
    "category": "Built-in"
  },
  {
    "name": "log2",
    "usage": "log2(expr)",
    "description": "log2(expr) - Returns the logarithm of expr with base 2.",
    "category": "Built-in"
  },
  {
    "name": "lower",
    "usage": "lower(str)",
    "description": "lower(str) - Returns str with all characters changed to lowercase.",
    "category": "Built-in"
  },
  {
    "name": "lpad",
    "usage": "lpad(str, len[, pad])",
    "description": "lpad(str, len[, pad]) - Returns str, left-padded with pad to a length of len. If str is longer than len, the return value is shortened to len characters or bytes. If pad is not specified, str will be padded to the left with space characters if it is a character string, and with zeros if it is a byte sequence.",
    "category": "Built-in"
  },
  {
    "name": "ltrim",
    "usage": "ltrim(str)",
    "description": "ltrim(str) - Removes the leading space characters from str.",
    "category": "Built-in"
  },
  {
    "name": "luhn_check",
    "usage": "luhn_check(str )",
    "description": "luhn_check(str ) - Checks that a string of digits is valid according to the Luhn algorithm. This checksum function is widely applied on credit card numbers and government identification numbers to distinguish valid numbers from mistyped, incorrect numbers.",
    "category": "Built-in"
  },
  {
    "name": "make_date",
    "usage": "make_date(year, month, day)",
    "description": "make_date(year, month, day) - Create date from year, month and day fields. If the configuration spark.sql.ansi.enabled is false, the function returns NULL on invalid inputs. Otherwise, it will throw an error instead.",
    "category": "Built-in"
  },
  {
    "name": "make_dt_interval",
    "usage": "make_dt_interval([days[, hours[, mins[, secs]]]])",
    "description": "make_dt_interval([days[, hours[, mins[, secs]]]]) - Make DayTimeIntervalType duration from days, hours, mins and secs.",
    "category": "Built-in"
  },
  {
    "name": "make_interval",
    "usage": "make_interval([years[, months[, weeks[, days[, hours[, mins[, secs]]]]]]])",
    "description": "make_interval([years[, months[, weeks[, days[, hours[, mins[, secs]]]]]]]) - Make interval from years, months, weeks, days, hours, mins and secs.",
    "category": "Built-in"
  },
  {
    "name": "make_time",
    "usage": "make_time(hour, minute, second)",
    "description": "make_time(hour, minute, second) - Create time from hour, minute and second fields. For invalid inputs it will throw an error.",
    "category": "Built-in"
  },
  {
    "name": "make_timestamp",
    "usage": "make_timestamp(year, month, day, hour, min, sec[, timezone])",
    "description": "make_timestamp(year, month, day, hour, min, sec[, timezone]) - Create the current timestamp with local time zone from year, month, day, hour, min, sec and timezone fields. If the configuration spark.sql.ansi.enabled is false, the function returns NULL on invalid inputs. Otherwise, it will throw an error instead.",
    "category": "Built-in"
  },
  {
    "name": "make_timestamp_ltz",
    "usage": "make_timestamp_ltz(year, month, day, hour, min, sec[, timezone])",
    "description": "make_timestamp_ltz(year, month, day, hour, min, sec[, timezone]) - Create the current timestamp with local time zone from year, month, day, hour, min, sec and (optional) timezone fields. If the configuration spark.sql.ansi.enabled is false, the function returns NULL on invalid inputs. Otherwise, it will throw an error instead.",
    "category": "Built-in"
  },
  {
    "name": "make_timestamp_ntz",
    "usage": "make_timestamp_ntz(year, month, day, hour, min, sec)",
    "description": "make_timestamp_ntz(year, month, day, hour, min, sec) - Create local date-time from year, month, day, hour, min, sec fields. If the configuration spark.sql.ansi.enabled is false, the function returns NULL on invalid inputs. Otherwise, it will throw an error instead.",
    "category": "Built-in"
  },
  {
    "name": "make_valid_utf8",
    "usage": "make_valid_utf8(str)",
    "description": "make_valid_utf8(str) - Returns the original string if str is a valid UTF-8 string, otherwise returns a new string whose invalid UTF8 byte sequences are replaced using the UNICODE replacement character U+FFFD.",
    "category": "Built-in"
  },
  {
    "name": "make_ym_interval",
    "usage": "make_ym_interval([years[, months]])",
    "description": "make_ym_interval([years[, months]]) - Make year-month interval from years, months.",
    "category": "Built-in"
  },
  {
    "name": "map",
    "usage": "map(key0, value0, key1, value1, ...)",
    "description": "map(key0, value0, key1, value1, ...) - Creates a map with the given key/value pairs.",
    "category": "Built-in"
  },
  {
    "name": "map_concat",
    "usage": "map_concat(map, ...)",
    "description": "map_concat(map, ...) - Returns the union of all the given maps",
    "category": "Built-in"
  },
  {
    "name": "map_contains_key",
    "usage": "map_contains_key(map, key)",
    "description": "map_contains_key(map, key) - Returns true if the map contains the key.",
    "category": "Built-in"
  },
  {
    "name": "map_entries",
    "usage": "map_entries(map)",
    "description": "map_entries(map) - Returns an unordered array of all entries in the given map.",
    "category": "Built-in"
  },
  {
    "name": "map_filter",
    "usage": "map_filter(expr, func)",
    "description": "map_filter(expr, func) - Filters entries in a map using the function.",
    "category": "Built-in"
  },
  {
    "name": "map_from_arrays",
    "usage": "map_from_arrays(keys, values)",
    "description": "map_from_arrays(keys, values) - Creates a map with a pair of the given key/value arrays. All elements in keys should not be null",
    "category": "Built-in"
  },
  {
    "name": "map_from_entries",
    "usage": "map_from_entries(arrayOfEntries)",
    "description": "map_from_entries(arrayOfEntries) - Returns a map created from the given array of entries.",
    "category": "Built-in"
  },
  {
    "name": "map_keys",
    "usage": "map_keys(map)",
    "description": "map_keys(map) - Returns an unordered array containing the keys of the map.",
    "category": "Built-in"
  },
  {
    "name": "map_values",
    "usage": "map_values(map)",
    "description": "map_values(map) - Returns an unordered array containing the values of the map.",
    "category": "Built-in"
  },
  {
    "name": "map_zip_with",
    "usage": "map_zip_with(map1, map2, function)",
    "description": "map_zip_with(map1, map2, function) - Merges two given maps into a single map by applying function to the pair of values with the same key. For keys only presented in one map, NULL will be passed as the value for the missing key. If an input map contains duplicated keys, only the first entry of the duplicated key is passed into the lambda function.",
    "category": "Built-in"
  },
  {
    "name": "mask",
    "usage": "mask(input[, upperChar, lowerChar, digitChar, otherChar])",
    "description": "mask(input[, upperChar, lowerChar, digitChar, otherChar]) - masks the given string value. The function replaces characters with 'X' or 'x', and numbers with 'n'. This can be useful for creating copies of tables with sensitive information removed.",
    "category": "Built-in"
  },
  {
    "name": "max",
    "usage": "max(expr)",
    "description": "max(expr) - Returns the maximum value of expr.",
    "category": "Built-in"
  },
  {
    "name": "max_by",
    "usage": "max_by(x, y)",
    "description": "max_by(x, y) - Returns the value of x associated with the maximum value of y.",
    "category": "Built-in"
  },
  {
    "name": "md5",
    "usage": "md5(expr)",
    "description": "md5(expr) - Returns an MD5 128-bit checksum as a hex string of expr.",
    "category": "Built-in"
  },
  {
    "name": "mean",
    "usage": "mean(expr)",
    "description": "mean(expr) - Returns the mean calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "median",
    "usage": "median(col)",
    "description": "median(col) - Returns the median of numeric or ANSI interval column col.",
    "category": "Built-in"
  },
  {
    "name": "min",
    "usage": "min(expr)",
    "description": "min(expr) - Returns the minimum value of expr.",
    "category": "Built-in"
  },
  {
    "name": "min_by",
    "usage": "min_by(x, y)",
    "description": "min_by(x, y) - Returns the value of x associated with the minimum value of y.",
    "category": "Built-in"
  },
  {
    "name": "minute",
    "usage": "minute(expr)",
    "description": "minute(expr) - Returns the minute component of the given expression.",
    "category": "Built-in"
  },
  {
    "name": "mod",
    "usage": "expr1 % expr2, or mod(expr1, expr2)",
    "description": "expr1 % expr2, or mod(expr1, expr2) - Returns the remainder after expr1/expr2.",
    "category": "Built-in"
  },
  {
    "name": "mode",
    "usage": "mode(col[, deterministic])",
    "description": "mode(col[, deterministic]) - Returns the most frequent value for the values within col. NULL values are ignored. If all the values are NULL, or there are 0 rows, returns NULL. When multiple values have the same greatest frequency then either any of values is returned if deterministic is false or is not defined, or the lowest value is returned if deterministic is true. mode() WITHIN GROUP (ORDER BY col) - Returns the most frequent value for the values within col (specified in ORDER BY clause). NULL values are ignored. If all the values are NULL, or there are 0 rows, returns NULL. When multiple values have the same greatest frequency only one value will be returned. The value will be chosen based on sort direction. Return the smallest value if sort direction is asc or the largest value if sort direction is desc from multiple values with the same frequency.",
    "category": "Built-in"
  },
  {
    "name": "monotonically_increasing_id",
    "usage": "monotonically_increasing_id()",
    "description": "monotonically_increasing_id() - Returns monotonically increasing 64-bit integers. The generated ID is guaranteed to be monotonically increasing and unique, but not consecutive. The current implementation puts the partition ID in the upper 31 bits, and the lower 33 bits represent the record number within each partition. The assumption is that the data frame has less than 1 billion partitions, and each partition has less than 8 billion records. The function is non-deterministic because its result depends on partition IDs.",
    "category": "Built-in"
  },
  {
    "name": "month",
    "usage": "month(date)",
    "description": "month(date) - Returns the month component of the date/timestamp.",
    "category": "Built-in"
  },
  {
    "name": "monthname",
    "usage": "monthname(date)",
    "description": "monthname(date) - Returns the three-letter abbreviated month name from the given date.",
    "category": "Built-in"
  },
  {
    "name": "months_between",
    "usage": "months_between(timestamp1, timestamp2[, roundOff])",
    "description": "months_between(timestamp1, timestamp2[, roundOff]) - If timestamp1 is later than timestamp2, then the result is positive. If timestamp1 and timestamp2 are on the same day of month, or both are the last day of month, time of day will be ignored. Otherwise, the difference is calculated based on 31 days per month, and rounded to 8 digits unless roundOff=false.",
    "category": "Built-in"
  },
  {
    "name": "named_struct",
    "usage": "named_struct(name1, val1, name2, val2, ...)",
    "description": "named_struct(name1, val1, name2, val2, ...) - Creates a struct with the given field names and values.",
    "category": "Built-in"
  },
  {
    "name": "nanvl",
    "usage": "nanvl(expr1, expr2)",
    "description": "nanvl(expr1, expr2) - Returns expr1 if it's not NaN, or expr2 otherwise.",
    "category": "Built-in"
  },
  {
    "name": "negative",
    "usage": "negative(expr)",
    "description": "negative(expr) - Returns the negated value of expr.",
    "category": "Built-in"
  },
  {
    "name": "next_day",
    "usage": "next_day(start_date, day_of_week)",
    "description": "next_day(start_date, day_of_week) - Returns the first date which is later than start_date and named as indicated. The function returns NULL if at least one of the input parameters is NULL. When both of the input parameters are not NULL and day_of_week is an invalid input, the function throws SparkIllegalArgumentException if spark.sql.ansi.enabled is set to true, otherwise NULL.",
    "category": "Built-in"
  },
  {
    "name": "not",
    "usage": "not expr",
    "description": "not expr - Logical not.",
    "category": "Built-in"
  },
  {
    "name": "now",
    "usage": "now()",
    "description": "now() - Returns the current timestamp at the start of query evaluation.",
    "category": "Built-in"
  },
  {
    "name": "nth_value",
    "usage": "nth_value(input[, offset])",
    "description": "nth_value(input[, offset]) - Returns the value of input at the row that is the offsetth row from beginning of the window frame. Offset starts at 1. If ignoreNulls=true, we will skip nulls when finding the offsetth row. Otherwise, every row counts for the offset. If there is no such an offsetth row (e.g., when the offset is 10, size of the window frame is less than 10), null is returned.",
    "category": "Built-in"
  },
  {
    "name": "ntile",
    "usage": "ntile(n)",
    "description": "ntile(n) - Divides the rows for each window partition into n buckets ranging from 1 to at most n.",
    "category": "Built-in"
  },
  {
    "name": "nullif",
    "usage": "nullif(expr1, expr2)",
    "description": "nullif(expr1, expr2) - Returns null if expr1 equals to expr2, or expr1 otherwise.",
    "category": "Built-in"
  },
  {
    "name": "nullifzero",
    "usage": "nullifzero(expr)",
    "description": "nullifzero(expr) - Returns null if expr is equal to zero, or expr otherwise.",
    "category": "Built-in"
  },
  {
    "name": "nvl",
    "usage": "nvl(expr1, expr2)",
    "description": "nvl(expr1, expr2) - Returns expr2 if expr1 is null, or expr1 otherwise.",
    "category": "Built-in"
  },
  {
    "name": "nvl2",
    "usage": "nvl2(expr1, expr2, expr3)",
    "description": "nvl2(expr1, expr2, expr3) - Returns expr2 if expr1 is not null, or expr3 otherwise.",
    "category": "Built-in"
  },
  {
    "name": "octet_length",
    "usage": "octet_length(expr)",
    "description": "octet_length(expr) - Returns the byte length of string data or number of bytes of binary data.",
    "category": "Built-in"
  },
  {
    "name": "or",
    "usage": "expr1 or expr2",
    "description": "expr1 or expr2 - Logical OR.",
    "category": "Built-in"
  },
  {
    "name": "overlay",
    "usage": "overlay(input, replace, pos[, len])",
    "description": "overlay(input, replace, pos[, len]) - Replace input with replace that starts at pos and is of length len.",
    "category": "Built-in"
  },
  {
    "name": "parse_json",
    "usage": "parse_json(jsonStr)",
    "description": "parse_json(jsonStr) - Parse a JSON string as a Variant value. Throw an exception when the string is not valid JSON value.",
    "category": "Built-in"
  },
  {
    "name": "parse_url",
    "usage": "parse_url(url, partToExtract[, key])",
    "description": "parse_url(url, partToExtract[, key]) - Extracts a part from a URL.",
    "category": "Built-in"
  },
  {
    "name": "percent_rank",
    "usage": "percent_rank()",
    "description": "percent_rank() - Computes the percentage ranking of a value in a group of values.",
    "category": "Built-in"
  },
  {
    "name": "percentile",
    "usage": "percentile(col, percentage [, frequency])",
    "description": "percentile(col, percentage [, frequency]) - Returns the exact percentile value of numeric or ANSI interval column col at the given percentage. The value of percentage must be between 0.0 and 1.0. The value of frequency should be positive integral",
    "category": "Built-in"
  },
  {
    "name": "percentile_approx",
    "usage": "percentile_approx(col, percentage [, accuracy])",
    "description": "percentile_approx(col, percentage [, accuracy]) - Returns the approximate percentile of the numeric or ansi interval column col which is the smallest value in the ordered col values (sorted from least to greatest) such that no more than percentage of col values is less than the value or equal to that value. The value of percentage must be between 0.0 and 1.0. The accuracy parameter (default: 10000) is a positive numeric literal which controls approximation accuracy at the cost of memory. Higher value of accuracy yields better accuracy, 1.0/accuracy is the relative error of the approximation. When percentage is an array, each value of the percentage array must be between 0.0 and 1.0. In this case, returns the approximate percentile array of column col at the given percentage array.",
    "category": "Built-in"
  },
  {
    "name": "percentile_cont",
    "usage": "percentile_cont(percentage) WITHIN GROUP (ORDER BY col)",
    "description": "percentile_cont(percentage) WITHIN GROUP (ORDER BY col) - Return a percentile value based on a continuous distribution of numeric or ANSI interval column col at the given percentage (specified in ORDER BY clause).",
    "category": "Built-in"
  },
  {
    "name": "percentile_disc",
    "usage": "percentile_disc(percentage) WITHIN GROUP (ORDER BY col)",
    "description": "percentile_disc(percentage) WITHIN GROUP (ORDER BY col) - Return a percentile value based on a discrete distribution of numeric or ANSI interval column col at the given percentage (specified in ORDER BY clause).",
    "category": "Built-in"
  },
  {
    "name": "pi",
    "usage": "pi()",
    "description": "pi() - Returns pi.",
    "category": "Built-in"
  },
  {
    "name": "pmod",
    "usage": "pmod(expr1, expr2)",
    "description": "pmod(expr1, expr2) - Returns the positive value of expr1 mod expr2.",
    "category": "Built-in"
  },
  {
    "name": "posexplode",
    "usage": "posexplode(expr)",
    "description": "posexplode(expr) - Separates the elements of array expr into multiple rows with positions, or the elements of map expr into multiple rows and columns with positions. Unless specified otherwise, uses the column name pos for position, col for elements of the array or key and value for elements of the map.",
    "category": "Built-in"
  },
  {
    "name": "posexplode_outer",
    "usage": "posexplode_outer(expr)",
    "description": "posexplode_outer(expr) - Separates the elements of array expr into multiple rows with positions, or the elements of map expr into multiple rows and columns with positions. Unless specified otherwise, uses the column name pos for position, col for elements of the array or key and value for elements of the map.",
    "category": "Built-in"
  },
  {
    "name": "position",
    "usage": "position(substr, str[, pos])",
    "description": "position(substr, str[, pos]) - Returns the position of the first occurrence of substr in str after position pos. The given pos and return value are 1-based.",
    "category": "Built-in"
  },
  {
    "name": "positive",
    "usage": "positive(expr)",
    "description": "positive(expr) - Returns the value of expr.",
    "category": "Built-in"
  },
  {
    "name": "pow",
    "usage": "pow(expr1, expr2)",
    "description": "pow(expr1, expr2) - Raises expr1 to the power of expr2.",
    "category": "Built-in"
  },
  {
    "name": "power",
    "usage": "power(expr1, expr2)",
    "description": "power(expr1, expr2) - Raises expr1 to the power of expr2.",
    "category": "Built-in"
  },
  {
    "name": "printf",
    "usage": "printf(strfmt, obj, ...)",
    "description": "printf(strfmt, obj, ...) - Returns a formatted string from printf-style format strings.",
    "category": "Built-in"
  },
  {
    "name": "python_worker_logs",
    "usage": "python_worker_logs()",
    "description": "python_worker_logs() - Returns a table of logs collected from Python workers.",
    "category": "Built-in"
  },
  {
    "name": "quarter",
    "usage": "quarter(date)",
    "description": "quarter(date) - Returns the quarter of the year for date, in the range 1 to 4.",
    "category": "Built-in"
  },
  {
    "name": "quote",
    "usage": "quote(str)",
    "description": "quote(str) - Returns str enclosed by single quotes and each instance of single quote in it is preceded by a backslash.",
    "category": "Built-in"
  },
  {
    "name": "radians",
    "usage": "radians(expr)",
    "description": "radians(expr) - Converts degrees to radians.",
    "category": "Built-in"
  },
  {
    "name": "raise_error",
    "usage": "raise_error( expr )",
    "description": "raise_error( expr ) - Throws a USER_RAISED_EXCEPTION with expr as message.",
    "category": "Built-in"
  },
  {
    "name": "rand",
    "usage": "rand([seed])",
    "description": "rand([seed]) - Returns a random value with independent and identically distributed (i.i.d.) uniformly distributed values in [0, 1).",
    "category": "Built-in"
  },
  {
    "name": "randn",
    "usage": "randn([seed])",
    "description": "randn([seed]) - Returns a random value with independent and identically distributed (i.i.d.) values drawn from the standard normal distribution.",
    "category": "Built-in"
  },
  {
    "name": "random",
    "usage": "random([seed])",
    "description": "random([seed]) - Returns a random value with independent and identically distributed (i.i.d.) uniformly distributed values in [0, 1).",
    "category": "Built-in"
  },
  {
    "name": "randstr",
    "usage": "randstr(length[, seed])",
    "description": "randstr(length[, seed]) - Returns a string of the specified length whose characters are chosen uniformly at random from the following pool of characters: 0-9, a-z, A-Z. The random seed is optional. The string length must be a constant two-byte or four-byte integer (SMALLINT or INT, respectively).",
    "category": "Built-in"
  },
  {
    "name": "range",
    "usage": "range(start[, end[, step[, numSlices]]]) / range(end)",
    "description": "range(start[, end[, step[, numSlices]]]) / range(end) - Returns a table of values within a specified range.",
    "category": "Built-in"
  },
  {
    "name": "rank",
    "usage": "rank()",
    "description": "rank() - Computes the rank of a value in a group of values. The result is one plus the number of rows preceding or equal to the current row in the ordering of the partition. The values will produce gaps in the sequence.",
    "category": "Built-in"
  },
  {
    "name": "reduce",
    "usage": "reduce(expr, start, merge, finish)",
    "description": "reduce(expr, start, merge, finish) - Applies a binary operator to an initial state and all elements in the array, and reduces this to a single state. The final state is converted into the final result by applying a finish function.",
    "category": "Built-in"
  },
  {
    "name": "reflect",
    "usage": "reflect(class, method[, arg1[, arg2 ..]])",
    "description": "reflect(class, method[, arg1[, arg2 ..]]) - Calls a method with reflection.",
    "category": "Built-in"
  },
  {
    "name": "regexp",
    "usage": "regexp(str, regexp)",
    "description": "regexp(str, regexp) - Returns true if str matches regexp, or false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "regexp_count",
    "usage": "regexp_count(str, regexp)",
    "description": "regexp_count(str, regexp) - Returns a count of the number of times that the regular expression pattern regexp is matched in the string str.",
    "category": "Built-in"
  },
  {
    "name": "regexp_extract",
    "usage": "regexp_extract(str, regexp[, idx])",
    "description": "regexp_extract(str, regexp[, idx]) - Extract the first string in the str that match the regexp expression and corresponding to the regex group index.",
    "category": "Built-in"
  },
  {
    "name": "regexp_extract_all",
    "usage": "regexp_extract_all(str, regexp[, idx])",
    "description": "regexp_extract_all(str, regexp[, idx]) - Extract all strings in the str that match the regexp expression and corresponding to the regex group index.",
    "category": "Built-in"
  },
  {
    "name": "regexp_instr",
    "usage": "regexp_instr(str, regexp)",
    "description": "regexp_instr(str, regexp) - Searches a string for a regular expression and returns an integer that indicates the beginning position of the matched substring. Positions are 1-based, not 0-based. If no match is found, returns 0.",
    "category": "Built-in"
  },
  {
    "name": "regexp_like",
    "usage": "regexp_like(str, regexp)",
    "description": "regexp_like(str, regexp) - Returns true if str matches regexp, or false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "regexp_replace",
    "usage": "regexp_replace(str, regexp, rep[, position])",
    "description": "regexp_replace(str, regexp, rep[, position]) - Replaces all substrings of str that match regexp with rep.",
    "category": "Built-in"
  },
  {
    "name": "regexp_substr",
    "usage": "regexp_substr(str, regexp)",
    "description": "regexp_substr(str, regexp) - Returns the substring that matches the regular expression regexp within the string str. If the regular expression is not found, the result is null.",
    "category": "Built-in"
  },
  {
    "name": "regr_avgx",
    "usage": "regr_avgx(y, x)",
    "description": "regr_avgx(y, x) - Returns the average of the independent variable for non-null pairs in a group, where y is the dependent variable and x is the independent variable.",
    "category": "Built-in"
  },
  {
    "name": "regr_avgy",
    "usage": "regr_avgy(y, x)",
    "description": "regr_avgy(y, x) - Returns the average of the dependent variable for non-null pairs in a group, where y is the dependent variable and x is the independent variable.",
    "category": "Built-in"
  },
  {
    "name": "regr_count",
    "usage": "regr_count(y, x)",
    "description": "regr_count(y, x) - Returns the number of non-null number pairs in a group, where y is the dependent variable and x is the independent variable.",
    "category": "Built-in"
  },
  {
    "name": "regr_intercept",
    "usage": "regr_intercept(y, x)",
    "description": "regr_intercept(y, x) - Returns the intercept of the univariate linear regression line for non-null pairs in a group, where y is the dependent variable and x is the independent variable.",
    "category": "Built-in"
  },
  {
    "name": "regr_r2",
    "usage": "regr_r2(y, x)",
    "description": "regr_r2(y, x) - Returns the coefficient of determination for non-null pairs in a group, where y is the dependent variable and x is the independent variable.",
    "category": "Built-in"
  },
  {
    "name": "regr_slope",
    "usage": "regr_slope(y, x)",
    "description": "regr_slope(y, x) - Returns the slope of the linear regression line for non-null pairs in a group, where y is the dependent variable and x is the independent variable.",
    "category": "Built-in"
  },
  {
    "name": "regr_sxx",
    "usage": "regr_sxx(y, x)",
    "description": "regr_sxx(y, x) - Returns REGR_COUNT(y, x) * VAR_POP(x) for non-null pairs in a group, where y is the dependent variable and x is the independent variable.",
    "category": "Built-in"
  },
  {
    "name": "regr_sxy",
    "usage": "regr_sxy(y, x)",
    "description": "regr_sxy(y, x) - Returns REGR_COUNT(y, x) * COVAR_POP(y, x) for non-null pairs in a group, where y is the dependent variable and x is the independent variable.",
    "category": "Built-in"
  },
  {
    "name": "regr_syy",
    "usage": "regr_syy(y, x)",
    "description": "regr_syy(y, x) - Returns REGR_COUNT(y, x) * VAR_POP(y) for non-null pairs in a group, where y is the dependent variable and x is the independent variable.",
    "category": "Built-in"
  },
  {
    "name": "repeat",
    "usage": "repeat(str, n)",
    "description": "repeat(str, n) - Returns the string which repeats the given string value n times.",
    "category": "Built-in"
  },
  {
    "name": "replace",
    "usage": "replace(str, search[, replace])",
    "description": "replace(str, search[, replace]) - Replaces all occurrences of search with replace.",
    "category": "Built-in"
  },
  {
    "name": "reverse",
    "usage": "reverse(array)",
    "description": "reverse(array) - Returns a reversed string or an array with reverse order of elements.",
    "category": "Built-in"
  },
  {
    "name": "right",
    "usage": "right(str, len)",
    "description": "right(str, len) - Returns the rightmost len(len can be string type) characters from the string str,if len is less or equal than 0 the result is an empty string.",
    "category": "Built-in"
  },
  {
    "name": "rint",
    "usage": "rint(expr)",
    "description": "rint(expr) - Returns the double value that is closest in value to the argument and is equal to a mathematical integer.",
    "category": "Built-in"
  },
  {
    "name": "rlike",
    "usage": "rlike(str, regexp)",
    "description": "rlike(str, regexp) - Returns true if str matches regexp, or false otherwise.",
    "category": "Built-in"
  },
  {
    "name": "round",
    "usage": "round(expr, d)",
    "description": "round(expr, d) - Returns expr rounded to d decimal places using HALF_UP rounding mode.",
    "category": "Built-in"
  },
  {
    "name": "row_number",
    "usage": "row_number()",
    "description": "row_number() - Assigns a unique, sequential number to each row, starting with one, according to the ordering of rows within the window partition.",
    "category": "Built-in"
  },
  {
    "name": "rpad",
    "usage": "rpad(str, len[, pad])",
    "description": "rpad(str, len[, pad]) - Returns str, right-padded with pad to a length of len. If str is longer than len, the return value is shortened to len characters. If pad is not specified, str will be padded to the right with space characters if it is a character string, and with zeros if it is a binary string.",
    "category": "Built-in"
  },
  {
    "name": "rtrim",
    "usage": "rtrim(str)",
    "description": "rtrim(str) - Removes the trailing space characters from str.",
    "category": "Built-in"
  },
  {
    "name": "schema_of_avro",
    "usage": "schema_of_avro(jsonFormatSchema, options)",
    "description": "schema_of_avro(jsonFormatSchema, options) - Returns schema in the DDL format of the avro schema in JSON string format.",
    "category": "Built-in"
  },
  {
    "name": "schema_of_csv",
    "usage": "schema_of_csv(csv[, options])",
    "description": "schema_of_csv(csv[, options]) - Returns schema in the DDL format of CSV string.",
    "category": "Built-in"
  },
  {
    "name": "schema_of_json",
    "usage": "schema_of_json(json[, options])",
    "description": "schema_of_json(json[, options]) - Returns schema in the DDL format of JSON string.",
    "category": "Built-in"
  },
  {
    "name": "schema_of_variant",
    "usage": "schema_of_variant(v)",
    "description": "schema_of_variant(v) - Returns schema in the SQL format of a variant.",
    "category": "Built-in"
  },
  {
    "name": "schema_of_variant_agg",
    "usage": "schema_of_variant_agg(v)",
    "description": "schema_of_variant_agg(v) - Returns the merged schema in the SQL format of a variant column.",
    "category": "Built-in"
  },
  {
    "name": "schema_of_xml",
    "usage": "schema_of_xml(xml[, options])",
    "description": "schema_of_xml(xml[, options]) - Returns schema in the DDL format of XML string.",
    "category": "Built-in"
  },
  {
    "name": "sec",
    "usage": "sec(expr)",
    "description": "sec(expr) - Returns the secant of expr, as if computed by 1/java.lang.Math.cos.",
    "category": "Built-in"
  },
  {
    "name": "second",
    "usage": "second(expr)",
    "description": "second(expr) - Returns the second component of the given expression.",
    "category": "Built-in"
  },
  {
    "name": "sentences",
    "usage": "sentences(str[, lang[, country]])",
    "description": "sentences(str[, lang[, country]]) - Splits str into an array of array of words.",
    "category": "Built-in"
  },
  {
    "name": "sequence",
    "usage": "sequence(start, stop, step)",
    "description": "sequence(start, stop, step) - Generates an array of elements from start to stop (inclusive), incrementing by step. The type of the returned elements is the same as the type of argument expressions.",
    "category": "Built-in"
  },
  {
    "name": "session_user",
    "usage": "session_user()",
    "description": "session_user() - user name of current execution context.",
    "category": "Built-in"
  },
  {
    "name": "session_window",
    "usage": "session_window(time_column, gap_duration)",
    "description": "session_window(time_column, gap_duration) - Generates session window given a timestamp specifying column and gap duration. See 'Types of time windows' in Structured Streaming guide doc for detailed explanation and examples.",
    "category": "Built-in"
  },
  {
    "name": "sha",
    "usage": "sha(expr)",
    "description": "sha(expr) - Returns a sha1 hash value as a hex string of the expr.",
    "category": "Built-in"
  },
  {
    "name": "sha1",
    "usage": "sha1(expr)",
    "description": "sha1(expr) - Returns a sha1 hash value as a hex string of the expr.",
    "category": "Built-in"
  },
  {
    "name": "sha2",
    "usage": "sha2(expr, bitLength)",
    "description": "sha2(expr, bitLength) - Returns a checksum of SHA-2 family as a hex string of expr. SHA-224, SHA-256, SHA-384, and SHA-512 are supported. Bit length of 0 is equivalent to 256.",
    "category": "Built-in"
  },
  {
    "name": "shiftleft",
    "usage": "base shiftleft exp",
    "description": "base shiftleft exp - Bitwise left shift.",
    "category": "Built-in"
  },
  {
    "name": "shiftright",
    "usage": "base shiftright expr",
    "description": "base shiftright expr - Bitwise (signed) right shift.",
    "category": "Built-in"
  },
  {
    "name": "shiftrightunsigned",
    "usage": "base shiftrightunsigned expr",
    "description": "base shiftrightunsigned expr - Bitwise unsigned right shift.",
    "category": "Built-in"
  },
  {
    "name": "shuffle",
    "usage": "shuffle(array)",
    "description": "shuffle(array) - Returns a random permutation of the given array.",
    "category": "Built-in"
  },
  {
    "name": "sign",
    "usage": "sign(expr)",
    "description": "sign(expr) - Returns -1.0, 0.0 or 1.0 as expr is negative, 0 or positive.",
    "category": "Built-in"
  },
  {
    "name": "signum",
    "usage": "signum(expr)",
    "description": "signum(expr) - Returns -1.0, 0.0 or 1.0 as expr is negative, 0 or positive.",
    "category": "Built-in"
  },
  {
    "name": "sin",
    "usage": "sin(expr)",
    "description": "sin(expr) - Returns the sine of expr, as if computed by java.lang.Math.sin.",
    "category": "Built-in"
  },
  {
    "name": "sinh",
    "usage": "sinh(expr)",
    "description": "sinh(expr) - Returns hyperbolic sine of expr, as if computed by java.lang.Math.sinh.",
    "category": "Built-in"
  },
  {
    "name": "size",
    "usage": "size(expr)",
    "description": "size(expr) - Returns the size of an array or a map. This function returns -1 for null input only if spark.sql.ansi.enabled is false and spark.sql.legacy.sizeOfNull is true. Otherwise, it returns null for null input. With the default settings, the function returns null for null input.",
    "category": "Built-in"
  },
  {
    "name": "skewness",
    "usage": "skewness(expr)",
    "description": "skewness(expr) - Returns the skewness value calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "slice",
    "usage": "slice(x, start, length)",
    "description": "slice(x, start, length) - Subsets array x starting from index start (array indices start at 1, or starting from the end if start is negative) with the specified length.",
    "category": "Built-in"
  },
  {
    "name": "smallint",
    "usage": "smallint(expr)",
    "description": "smallint(expr) - Casts the value expr to the target data type smallint.",
    "category": "Built-in"
  },
  {
    "name": "some",
    "usage": "some(expr)",
    "description": "some(expr) - Returns true if at least one value of expr is true.",
    "category": "Built-in"
  },
  {
    "name": "sort_array",
    "usage": "sort_array(array[, ascendingOrder])",
    "description": "sort_array(array[, ascendingOrder]) - Sorts the input array in ascending or descending order according to the natural ordering of the array elements. NaN is greater than any non-NaN elements for double/float type. Null elements will be placed at the beginning of the returned array in ascending order or at the end of the returned array in descending order.",
    "category": "Built-in"
  },
  {
    "name": "soundex",
    "usage": "soundex(str)",
    "description": "soundex(str) - Returns Soundex code of the string.",
    "category": "Built-in"
  },
  {
    "name": "space",
    "usage": "space(n)",
    "description": "space(n) - Returns a string consisting of n spaces.",
    "category": "Built-in"
  },
  {
    "name": "spark_partition_id",
    "usage": "spark_partition_id()",
    "description": "spark_partition_id() - Returns the current partition id.",
    "category": "Built-in"
  },
  {
    "name": "split",
    "usage": "split(str, regex, limit)",
    "description": "split(str, regex, limit) - Splits str around occurrences that match regex and returns an array with a length of at most limit",
    "category": "Built-in"
  },
  {
    "name": "split_part",
    "usage": "split_part(str, delimiter, partNum)",
    "description": "split_part(str, delimiter, partNum) - Splits str by delimiter and return requested part of the split (1-based). If any input is null, returns null. if partNum is out of range of split parts, returns empty string. If partNum is 0, throws an error. If partNum is negative, the parts are counted backward from the end of the string. If the delimiter is an empty string, the str is not split.",
    "category": "Built-in"
  },
  {
    "name": "sql_keywords",
    "usage": "sql_keywords()",
    "description": "sql_keywords() - Get Spark SQL keywords",
    "category": "Built-in"
  },
  {
    "name": "sqrt",
    "usage": "sqrt(expr)",
    "description": "sqrt(expr) - Returns the square root of expr.",
    "category": "Built-in"
  },
  {
    "name": "st_asbinary",
    "usage": "st_asbinary(geo)",
    "description": "st_asbinary(geo) - Returns the geospatial value (value of type GEOGRAPHY or GEOMETRY) in WKB format.",
    "category": "Built-in"
  },
  {
    "name": "st_geogfromwkb",
    "usage": "st_geogfromwkb(wkb)",
    "description": "st_geogfromwkb(wkb) - Parses the WKB description of a geography and returns the corresponding GEOGRAPHY value.",
    "category": "Built-in"
  },
  {
    "name": "st_geomfromwkb",
    "usage": "st_geomfromwkb(wkb)",
    "description": "st_geomfromwkb(wkb) - Parses the WKB description of a geometry and returns the corresponding GEOMETRY value.",
    "category": "Built-in"
  },
  {
    "name": "st_setsrid",
    "usage": "st_setsrid(geo, srid)",
    "description": "st_setsrid(geo, srid) - Returns a new GEOGRAPHY or GEOMETRY value whose SRID is the specified SRID value.",
    "category": "Built-in"
  },
  {
    "name": "st_srid",
    "usage": "st_srid(geo)",
    "description": "st_srid(geo) - Returns the SRID of the input GEOGRAPHY or GEOMETRY value.",
    "category": "Built-in"
  },
  {
    "name": "stack",
    "usage": "stack(n, expr1, ..., exprk)",
    "description": "stack(n, expr1, ..., exprk) - Separates expr1, ..., exprk into n rows. Uses column names col0, col1, etc. by default unless specified otherwise.",
    "category": "Built-in"
  },
  {
    "name": "startswith",
    "usage": "startswith(left, right)",
    "description": "startswith(left, right) - Returns a boolean. The value is True if left starts with right. Returns NULL if either input expression is NULL. Otherwise, returns False. Both left or right must be of STRING or BINARY type.",
    "category": "Built-in"
  },
  {
    "name": "std",
    "usage": "std(expr)",
    "description": "std(expr) - Returns the sample standard deviation calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "stddev",
    "usage": "stddev(expr)",
    "description": "stddev(expr) - Returns the sample standard deviation calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "stddev_pop",
    "usage": "stddev_pop(expr)",
    "description": "stddev_pop(expr) - Returns the population standard deviation calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "stddev_samp",
    "usage": "stddev_samp(expr)",
    "description": "stddev_samp(expr) - Returns the sample standard deviation calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "str_to_map",
    "usage": "str_to_map(text[, pairDelim[, keyValueDelim]])",
    "description": "str_to_map(text[, pairDelim[, keyValueDelim]]) - Creates a map after splitting the text into key/value pairs using delimiters. Default delimiters are ',' for pairDelim and ':' for keyValueDelim. Both pairDelim and keyValueDelim are treated as regular expressions.",
    "category": "Built-in"
  },
  {
    "name": "string",
    "usage": "string(expr)",
    "description": "string(expr) - Casts the value expr to the target data type string.",
    "category": "Built-in"
  },
  {
    "name": "string_agg",
    "usage": "string_agg(expr[, delimiter])[ WITHIN GROUP (ORDER BY key [ASC | DESC] [,...])]",
    "description": "string_agg(expr[, delimiter])[ WITHIN GROUP (ORDER BY key [ASC | DESC] [,...])] - Returns the concatenation of non-NULL input values, separated by the delimiter ordered by key. If all values are NULL, NULL is returned.",
    "category": "Built-in"
  },
  {
    "name": "struct",
    "usage": "struct(col1, col2, col3, ...)",
    "description": "struct(col1, col2, col3, ...) - Creates a struct with the given field values.",
    "category": "Built-in"
  },
  {
    "name": "substr",
    "usage": "substr(str, pos[, len])",
    "description": "substr(str, pos[, len]) - Returns the substring of str that starts at pos and is of length len, or the slice of byte array that starts at pos and is of length len.",
    "category": "Built-in"
  },
  {
    "name": "substring",
    "usage": "substring(str, pos[, len])",
    "description": "substring(str, pos[, len]) - Returns the substring of str that starts at pos and is of length len, or the slice of byte array that starts at pos and is of length len.",
    "category": "Built-in"
  },
  {
    "name": "substring_index",
    "usage": "substring_index(str, delim, count)",
    "description": "substring_index(str, delim, count) - Returns the substring from str before count occurrences of the delimiter delim. If count is positive, everything to the left of the final delimiter (counting from the left) is returned. If count is negative, everything to the right of the final delimiter (counting from the right) is returned. The function substring_index performs a case-sensitive match when searching for delim.",
    "category": "Built-in"
  },
  {
    "name": "sum",
    "usage": "sum(expr)",
    "description": "sum(expr) - Returns the sum calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "tan",
    "usage": "tan(expr)",
    "description": "tan(expr) - Returns the tangent of expr, as if computed by java.lang.Math.tan.",
    "category": "Built-in"
  },
  {
    "name": "tanh",
    "usage": "tanh(expr)",
    "description": "tanh(expr) - Returns the hyperbolic tangent of expr, as if computed by java.lang.Math.tanh.",
    "category": "Built-in"
  },
  {
    "name": "theta_difference",
    "usage": "theta_difference(first, second)",
    "description": "theta_difference(first, second) - Subtracts two binary representations of Datasketches ThetaSketch objects from two input columns using a ThetaSketch AnotB object.",
    "category": "Built-in"
  },
  {
    "name": "theta_intersection",
    "usage": "theta_intersection(first, second)",
    "description": "theta_intersection(first, second) - Intersects two binary representations of Datasketches ThetaSketch objects from two input columns using a ThetaSketch Intersect object.",
    "category": "Built-in"
  },
  {
    "name": "theta_intersection_agg",
    "usage": "theta_intersection_agg(expr, lgNomEntries)",
    "description": "theta_intersection_agg(expr, lgNomEntries) - Returns the ThetaSketch's Compact binary representation by intersecting all the Theta sketches in the input column.",
    "category": "Built-in"
  },
  {
    "name": "theta_sketch_agg",
    "usage": "theta_sketch_agg(expr, lgNomEntries)",
    "description": "theta_sketch_agg(expr, lgNomEntries) - Returns the ThetaSketch compact binary representation. lgNomEntries (optional) is the log-base-2 of nominal entries, with nominal entries deciding the number buckets or slots for the ThetaSketch.",
    "category": "Built-in"
  },
  {
    "name": "theta_sketch_estimate",
    "usage": "theta_sketch_estimate(expr)",
    "description": "theta_sketch_estimate(expr) - Returns the estimated number of unique values given the binary representation of a Datasketches ThetaSketch.",
    "category": "Built-in"
  },
  {
    "name": "theta_union",
    "usage": "theta_union(first, second, lgNomEntries)",
    "description": "theta_union(first, second, lgNomEntries) - Merges two binary representations of Datasketches ThetaSketch objects using a ThetaSketch Union object. Users can set lgNomEntries to a value between 4 and 26 to find the union of sketches with different union buffer size values (defaults to 12).",
    "category": "Built-in"
  },
  {
    "name": "theta_union_agg",
    "usage": "theta_union_agg(expr, lgNomEntries)",
    "description": "theta_union_agg(expr, lgNomEntries) - Returns the ThetaSketch's Compact binary representation. lgNomEntries (optional) the log-base-2 of Nominal Entries, with Nominal Entries deciding the number buckets or slots for the ThetaSketch.",
    "category": "Built-in"
  },
  {
    "name": "time",
    "usage": "time(expr)",
    "description": "time(expr) - Casts the value expr to the target data type time.",
    "category": "Built-in"
  },
  {
    "name": "time_diff",
    "usage": "time_diff(unit, start, end)",
    "description": "time_diff(unit, start, end) - Gets the difference between the times in the specified units.",
    "category": "Built-in"
  },
  {
    "name": "time_trunc",
    "usage": "time_trunc(unit, time)",
    "description": "time_trunc(unit, time) - Returns time truncated to the unit.",
    "category": "Built-in"
  },
  {
    "name": "timestamp",
    "usage": "timestamp(expr)",
    "description": "timestamp(expr) - Casts the value expr to the target data type timestamp.",
    "category": "Built-in"
  },
  {
    "name": "timestamp_micros",
    "usage": "timestamp_micros(microseconds)",
    "description": "timestamp_micros(microseconds) - Creates timestamp from the number of microseconds since UTC epoch.",
    "category": "Built-in"
  },
  {
    "name": "timestamp_millis",
    "usage": "timestamp_millis(milliseconds)",
    "description": "timestamp_millis(milliseconds) - Creates timestamp from the number of milliseconds since UTC epoch.",
    "category": "Built-in"
  },
  {
    "name": "timestamp_seconds",
    "usage": "timestamp_seconds(seconds)",
    "description": "timestamp_seconds(seconds) - Creates timestamp from the number of seconds (can be fractional) since UTC epoch.",
    "category": "Built-in"
  },
  {
    "name": "tinyint",
    "usage": "tinyint(expr)",
    "description": "tinyint(expr) - Casts the value expr to the target data type tinyint.",
    "category": "Built-in"
  },
  {
    "name": "to_avro",
    "usage": "to_avro(child[, jsonFormatSchema])",
    "description": "to_avro(child[, jsonFormatSchema]) - Converts a Catalyst binary input value into its corresponding Avro format result.",
    "category": "Built-in"
  },
  {
    "name": "to_binary",
    "usage": "to_binary(str[, fmt])",
    "description": "to_binary(str[, fmt]) - Converts the input str to a binary value based on the supplied fmt. fmt can be a case-insensitive string literal of \"hex\", \"utf-8\", \"utf8\", or \"base64\". By default, the binary format for conversion is \"hex\" if fmt is omitted. The function returns NULL if at least one of the input parameters is NULL.",
    "category": "Built-in"
  },
  {
    "name": "to_char",
    "usage": "to_char(expr, format)",
    "description": "to_char(expr, format) - Convert expr to a string based on the format. Throws an exception if the conversion fails. The format can consist of the following characters, case insensitive: '0' or '9': Specifies an expected digit between 0 and 9. A sequence of 0 or 9 in the format string matches a sequence of digits in the input value, generating a result string of the same length as the corresponding sequence in the format string. The result string is left-padded with zeros if the 0/9 sequence comprises more digits than the matching part of the decimal value, starts with 0, and is before the decimal point. Otherwise, it is padded with spaces. '.' or 'D': Specifies the position of the decimal point (optional, only allowed once). ',' or 'G': Specifies the position of the grouping (thousands) separator (,). There must be a 0 or 9 to the left and right of each grouping separator. '$': Specifies the location of the $ currency sign. This character may only be specified once. 'S' or 'MI': Specifies the position of a '-' or '+' sign (optional, only allowed once at the beginning or end of the format string). Note that 'S' prints '+' for positive values but 'MI' prints a space. 'PR': Only allowed at the end of the format string; specifies that the result string will be wrapped by angle brackets if the input value is negative. ('<1>'). If expr is a datetime, format shall be a valid datetime pattern, see Datetime Patterns. If expr is a binary, it is converted to a string in one of the formats: 'base64': a base 64 string. 'hex': a string in the hexadecimal format. 'utf-8': the input binary is decoded to UTF-8 string.",
    "category": "Built-in"
  },
  {
    "name": "to_csv",
    "usage": "to_csv(expr[, options])",
    "description": "to_csv(expr[, options]) - Returns a CSV string with a given struct value",
    "category": "Built-in"
  },
  {
    "name": "to_date",
    "usage": "to_date(date_str[, fmt])",
    "description": "to_date(date_str[, fmt]) - Parses the date_str expression with the fmt expression to a date. Returns null with invalid input. By default, it follows casting rules to a date if the fmt is omitted.",
    "category": "Built-in"
  },
  {
    "name": "to_json",
    "usage": "to_json(expr[, options])",
    "description": "to_json(expr[, options]) - Returns a JSON string with a given struct value",
    "category": "Built-in"
  },
  {
    "name": "to_number",
    "usage": "to_number(expr, fmt)",
    "description": "to_number(expr, fmt) - Convert string 'expr' to a number based on the string format 'fmt'. Throws an exception if the conversion fails. The format can consist of the following characters, case insensitive: '0' or '9': Specifies an expected digit between 0 and 9. A sequence of 0 or 9 in the format string matches a sequence of digits in the input string. If the 0/9 sequence starts with 0 and is before the decimal point, it can only match a digit sequence of the same size. Otherwise, if the sequence starts with 9 or is after the decimal point, it can match a digit sequence that has the same or smaller size. '.' or 'D': Specifies the position of the decimal point (optional, only allowed once). ',' or 'G': Specifies the position of the grouping (thousands) separator (,). There must be a 0 or 9 to the left and right of each grouping separator. 'expr' must match the grouping separator relevant for the size of the number. '$': Specifies the location of the $ currency sign. This character may only be specified once. 'S' or 'MI': Specifies the position of a '-' or '+' sign (optional, only allowed once at the beginning or end of the format string). Note that 'S' allows '-' but 'MI' does not. 'PR': Only allowed at the end of the format string; specifies that 'expr' indicates a negative number with wrapping angled brackets. ('<1>').",
    "category": "Built-in"
  },
  {
    "name": "to_protobuf",
    "usage": "to_protobuf(child, messageName, descFilePath, options)",
    "description": "to_protobuf(child, messageName, descFilePath, options) - Converts a Catalyst binary input value into its corresponding Protobuf format result.",
    "category": "Built-in"
  },
  {
    "name": "to_time",
    "usage": "to_time(str[, format])",
    "description": "to_time(str[, format]) - Parses the str expression with the format expression to a time. If format is malformed or its application does not result in a well formed time, the function raises an error. By default, it follows casting rules to a time if the format is omitted.",
    "category": "Built-in"
  },
  {
    "name": "to_timestamp",
    "usage": "to_timestamp(timestamp_str[, fmt])",
    "description": "to_timestamp(timestamp_str[, fmt]) - Parses the timestamp_str expression with the fmt expression to a timestamp. Returns null with invalid input. By default, it follows casting rules to a timestamp if the fmt is omitted. The result data type is consistent with the value of configuration spark.sql.timestampType.",
    "category": "Built-in"
  },
  {
    "name": "to_timestamp_ltz",
    "usage": "to_timestamp_ltz(timestamp_str[, fmt])",
    "description": "to_timestamp_ltz(timestamp_str[, fmt]) - Parses the timestamp_str expression with the fmt expression to a timestamp with local time zone. Returns null with invalid input. By default, it follows casting rules to a timestamp if the fmt is omitted.",
    "category": "Built-in"
  },
  {
    "name": "to_timestamp_ntz",
    "usage": "to_timestamp_ntz(timestamp_str[, fmt])",
    "description": "to_timestamp_ntz(timestamp_str[, fmt]) - Parses the timestamp_str expression with the fmt expression to a timestamp without time zone. Returns null with invalid input. By default, it follows casting rules to a timestamp if the fmt is omitted.",
    "category": "Built-in"
  },
  {
    "name": "to_unix_timestamp",
    "usage": "to_unix_timestamp(timeExp[, fmt])",
    "description": "to_unix_timestamp(timeExp[, fmt]) - Returns the UNIX timestamp of the given time.",
    "category": "Built-in"
  },
  {
    "name": "to_utc_timestamp",
    "usage": "to_utc_timestamp(timestamp, timezone)",
    "description": "to_utc_timestamp(timestamp, timezone) - Given a timestamp like '2017-07-14 02:40:00.0', interprets it as a time in the given time zone, and renders that time as a timestamp in UTC. For example, 'GMT+1' would yield '2017-07-14 01:40:00.0'.",
    "category": "Built-in"
  },
  {
    "name": "to_varchar",
    "usage": "to_varchar(expr, format)",
    "description": "to_varchar(expr, format) - Convert expr to a string based on the format. Throws an exception if the conversion fails. The format can consist of the following characters, case insensitive: '0' or '9': Specifies an expected digit between 0 and 9. A sequence of 0 or 9 in the format string matches a sequence of digits in the input value, generating a result string of the same length as the corresponding sequence in the format string. The result string is left-padded with zeros if the 0/9 sequence comprises more digits than the matching part of the decimal value, starts with 0, and is before the decimal point. Otherwise, it is padded with spaces. '.' or 'D': Specifies the position of the decimal point (optional, only allowed once). ',' or 'G': Specifies the position of the grouping (thousands) separator (,). There must be a 0 or 9 to the left and right of each grouping separator. '$': Specifies the location of the $ currency sign. This character may only be specified once. 'S' or 'MI': Specifies the position of a '-' or '+' sign (optional, only allowed once at the beginning or end of the format string). Note that 'S' prints '+' for positive values but 'MI' prints a space. 'PR': Only allowed at the end of the format string; specifies that the result string will be wrapped by angle brackets if the input value is negative. ('<1>'). If expr is a datetime, format shall be a valid datetime pattern, see Datetime Patterns. If expr is a binary, it is converted to a string in one of the formats: 'base64': a base 64 string. 'hex': a string in the hexadecimal format. 'utf-8': the input binary is decoded to UTF-8 string.",
    "category": "Built-in"
  },
  {
    "name": "to_variant_object",
    "usage": "to_variant_object(expr)",
    "description": "to_variant_object(expr) - Convert a nested input (array/map/struct) into a variant where maps and structs are converted to variant objects which are unordered unlike SQL structs. Input maps can only have string keys.",
    "category": "Built-in"
  },
  {
    "name": "to_xml",
    "usage": "to_xml(expr[, options])",
    "description": "to_xml(expr[, options]) - Returns a XML string with a given struct value",
    "category": "Built-in"
  },
  {
    "name": "transform",
    "usage": "transform(expr, func)",
    "description": "transform(expr, func) - Transforms elements in an array using the function.",
    "category": "Built-in"
  },
  {
    "name": "transform_keys",
    "usage": "transform_keys(expr, func)",
    "description": "transform_keys(expr, func) - Transforms elements in a map using the function.",
    "category": "Built-in"
  },
  {
    "name": "transform_values",
    "usage": "transform_values(expr, func)",
    "description": "transform_values(expr, func) - Transforms values in the map using the function.",
    "category": "Built-in"
  },
  {
    "name": "translate",
    "usage": "translate(input, from, to)",
    "description": "translate(input, from, to) - Translates the input string by replacing the characters present in the from string with the corresponding characters in the to string.",
    "category": "Built-in"
  },
  {
    "name": "trim",
    "usage": "trim(str)",
    "description": "trim(str) - Removes the leading and trailing space characters from str.",
    "category": "Built-in"
  },
  {
    "name": "trunc",
    "usage": "trunc(date, fmt)",
    "description": "trunc(date, fmt) - Returns date with the time portion of the day truncated to the unit specified by the format model fmt.",
    "category": "Built-in"
  },
  {
    "name": "try_add",
    "usage": "try_add(expr1, expr2)",
    "description": "try_add(expr1, expr2) - Returns the sum of expr1and expr2 and the result is null on overflow. The acceptable input types are the same with the + operator.",
    "category": "Built-in"
  },
  {
    "name": "try_aes_decrypt",
    "usage": "try_aes_decrypt(expr, key[, mode[, padding[, aad]]])",
    "description": "try_aes_decrypt(expr, key[, mode[, padding[, aad]]]) - This is a special version of aes_decrypt that performs the same operation, but returns a NULL value instead of raising an error if the decryption cannot be performed.",
    "category": "Built-in"
  },
  {
    "name": "try_avg",
    "usage": "try_avg(expr)",
    "description": "try_avg(expr) - Returns the mean calculated from values of a group and the result is null on overflow.",
    "category": "Built-in"
  },
  {
    "name": "try_divide",
    "usage": "try_divide(dividend, divisor)",
    "description": "try_divide(dividend, divisor) - Returns dividend/divisor. It always performs floating point division. Its result is always null if expr2 is 0. dividend must be a numeric or an interval. divisor must be a numeric.",
    "category": "Built-in"
  },
  {
    "name": "try_element_at",
    "usage": "try_element_at(array, index)",
    "description": "try_element_at(array, index) - Returns element of array at given (1-based) index. If Index is 0, Spark will throw an error. If index < 0, accesses elements from the last to the first. The function always returns NULL if the index exceeds the length of the array.",
    "category": "Built-in"
  },
  {
    "name": "try_make_interval",
    "usage": "try_make_interval([years[, months[, weeks[, days[, hours[, mins[, secs]]]]]]])",
    "description": "try_make_interval([years[, months[, weeks[, days[, hours[, mins[, secs]]]]]]]) - This is a special version of make_interval that performs the same operation, but returns NULL when an overflow occurs.",
    "category": "Built-in"
  },
  {
    "name": "try_make_timestamp",
    "usage": "try_make_timestamp(year, month, day, hour, min, sec[, timezone])",
    "description": "try_make_timestamp(year, month, day, hour, min, sec[, timezone]) - Try to create a timestamp from year, month, day, hour, min, sec and timezone fields. The result data type is consistent with the value of configuration spark.sql.timestampType. The function returns NULL on invalid inputs.",
    "category": "Built-in"
  },
  {
    "name": "try_make_timestamp_ltz",
    "usage": "try_make_timestamp_ltz(year, month, day, hour, min, sec[, timezone])",
    "description": "try_make_timestamp_ltz(year, month, day, hour, min, sec[, timezone]) - Try to create the current timestamp with local time zone from year, month, day, hour, min, sec and (optional) timezone fields. The function returns NULL on invalid inputs.",
    "category": "Built-in"
  },
  {
    "name": "try_make_timestamp_ntz",
    "usage": "try_make_timestamp_ntz(year, month, day, hour, min, sec)",
    "description": "try_make_timestamp_ntz(year, month, day, hour, min, sec) - Try to create local date-time from year, month, day, hour, min, sec fields. The function returns NULL on invalid inputs.",
    "category": "Built-in"
  },
  {
    "name": "try_mod",
    "usage": "try_mod(dividend, divisor)",
    "description": "try_mod(dividend, divisor) - Returns the remainder after expr1/expr2. dividend must be a numeric. divisor must be a numeric.",
    "category": "Built-in"
  },
  {
    "name": "try_multiply",
    "usage": "try_multiply(expr1, expr2)",
    "description": "try_multiply(expr1, expr2) - Returns expr1*expr2 and the result is null on overflow. The acceptable input types are the same with the * operator.",
    "category": "Built-in"
  },
  {
    "name": "try_parse_json",
    "usage": "try_parse_json(jsonStr)",
    "description": "try_parse_json(jsonStr) - Parse a JSON string as a Variant value. Return NULL when the string is not valid JSON value.",
    "category": "Built-in"
  },
  {
    "name": "try_parse_url",
    "usage": "try_parse_url(url, partToExtract[, key])",
    "description": "try_parse_url(url, partToExtract[, key]) - This is a special version of parse_url that performs the same operation, but returns a NULL value instead of raising an error if the parsing cannot be performed.",
    "category": "Built-in"
  },
  {
    "name": "try_reflect",
    "usage": "try_reflect(class, method[, arg1[, arg2 ..]])",
    "description": "try_reflect(class, method[, arg1[, arg2 ..]]) - This is a special version of reflect that performs the same operation, but returns a NULL value instead of raising an error if the invoke method thrown exception.",
    "category": "Built-in"
  },
  {
    "name": "try_subtract",
    "usage": "try_subtract(expr1, expr2)",
    "description": "try_subtract(expr1, expr2) - Returns expr1-expr2 and the result is null on overflow. The acceptable input types are the same with the - operator.",
    "category": "Built-in"
  },
  {
    "name": "try_sum",
    "usage": "try_sum(expr)",
    "description": "try_sum(expr) - Returns the sum calculated from values of a group and the result is null on overflow.",
    "category": "Built-in"
  },
  {
    "name": "try_to_binary",
    "usage": "try_to_binary(str[, fmt])",
    "description": "try_to_binary(str[, fmt]) - This is a special version of to_binary that performs the same operation, but returns a NULL value instead of raising an error if the conversion cannot be performed.",
    "category": "Built-in"
  },
  {
    "name": "try_to_date",
    "usage": "try_to_date(date_str[, fmt])",
    "description": "try_to_date(date_str[, fmt]) - Parses the date_str expression with the fmt expression to a date. The function always returns null on an invalid input with/without ANSI SQL mode enabled. By default, it follows casting rules to a date if the fmt is omitted.",
    "category": "Built-in"
  },
  {
    "name": "try_to_number",
    "usage": "try_to_number(expr, fmt)",
    "description": "try_to_number(expr, fmt) - Convert string 'expr' to a number based on the string format fmt. Returns NULL if the string 'expr' does not match the expected format. The format follows the same semantics as the to_number function.",
    "category": "Built-in"
  },
  {
    "name": "try_to_time",
    "usage": "try_to_time(str[, format])",
    "description": "try_to_time(str[, format]) - Parses the str expression with the format expression to a time. If format is malformed or its application does not result in a well formed time, the function returns NULL. By default, it follows casting rules to a time if the format is omitted.",
    "category": "Built-in"
  },
  {
    "name": "try_to_timestamp",
    "usage": "try_to_timestamp(timestamp_str[, fmt])",
    "description": "try_to_timestamp(timestamp_str[, fmt]) - Parses the timestamp_str expression with the fmt expression to a timestamp. The function always returns null on an invalid input with/without ANSI SQL mode enabled. By default, it follows casting rules to a timestamp if the fmt is omitted. The result data type is consistent with the value of configuration spark.sql.timestampType.",
    "category": "Built-in"
  },
  {
    "name": "try_url_decode",
    "usage": "try_url_decode(str)",
    "description": "try_url_decode(str) - This is a special version of url_decode that performs the same operation, but returns a NULL value instead of raising an error if the decoding cannot be performed.",
    "category": "Built-in"
  },
  {
    "name": "try_validate_utf8",
    "usage": "try_validate_utf8(str)",
    "description": "try_validate_utf8(str) - Returns the original string if str is a valid UTF-8 string, otherwise returns NULL.",
    "category": "Built-in"
  },
  {
    "name": "try_variant_get",
    "usage": "try_variant_get(v, path[, type])",
    "description": "try_variant_get(v, path[, type]) - Extracts a sub-variant from v according to path, and then cast the sub-variant to type. When type is omitted, it is default to variant. Returns null if the path does not exist or the cast fails.",
    "category": "Built-in"
  },
  {
    "name": "typeof",
    "usage": "typeof(expr)",
    "description": "typeof(expr) - Return DDL-formatted type string for the data type of the input.",
    "category": "Built-in"
  },
  {
    "name": "ucase",
    "usage": "ucase(str)",
    "description": "ucase(str) - Returns str with all characters changed to uppercase.",
    "category": "Built-in"
  },
  {
    "name": "unbase64",
    "usage": "unbase64(str)",
    "description": "unbase64(str) - Converts the argument from a base 64 string str to a binary.",
    "category": "Built-in"
  },
  {
    "name": "unhex",
    "usage": "unhex(expr)",
    "description": "unhex(expr) - Converts hexadecimal expr to binary.",
    "category": "Built-in"
  },
  {
    "name": "uniform",
    "usage": "uniform(min, max[, seed])",
    "description": "uniform(min, max[, seed]) - Returns a random value with independent and identically distributed (i.i.d.) values with the specified range of numbers. The random seed is optional. The provided numbers specifying the minimum and maximum values of the range must be constant. If both of these numbers are integers, then the result will also be an integer. Otherwise if one or both of these are floating-point numbers, then the result will also be a floating-point number.",
    "category": "Built-in"
  },
  {
    "name": "unix_date",
    "usage": "unix_date(date)",
    "description": "unix_date(date) - Returns the number of days since 1970-01-01.",
    "category": "Built-in"
  },
  {
    "name": "unix_micros",
    "usage": "unix_micros(timestamp)",
    "description": "unix_micros(timestamp) - Returns the number of microseconds since 1970-01-01 00:00:00 UTC.",
    "category": "Built-in"
  },
  {
    "name": "unix_millis",
    "usage": "unix_millis(timestamp)",
    "description": "unix_millis(timestamp) - Returns the number of milliseconds since 1970-01-01 00:00:00 UTC. Truncates higher levels of precision.",
    "category": "Built-in"
  },
  {
    "name": "unix_seconds",
    "usage": "unix_seconds(timestamp)",
    "description": "unix_seconds(timestamp) - Returns the number of seconds since 1970-01-01 00:00:00 UTC. Truncates higher levels of precision.",
    "category": "Built-in"
  },
  {
    "name": "unix_timestamp",
    "usage": "unix_timestamp([timeExp[, fmt]])",
    "description": "unix_timestamp([timeExp[, fmt]]) - Returns the UNIX timestamp of current or specified time.",
    "category": "Built-in"
  },
  {
    "name": "upper",
    "usage": "upper(str)",
    "description": "upper(str) - Returns str with all characters changed to uppercase.",
    "category": "Built-in"
  },
  {
    "name": "url_decode",
    "usage": "url_decode(str)",
    "description": "url_decode(str) - Decodes a str in 'application/x-www-form-urlencoded' format using a specific encoding scheme.",
    "category": "Built-in"
  },
  {
    "name": "url_encode",
    "usage": "url_encode(str)",
    "description": "url_encode(str) - Translates a string into 'application/x-www-form-urlencoded' format using a specific encoding scheme.",
    "category": "Built-in"
  },
  {
    "name": "user",
    "usage": "user()",
    "description": "user() - user name of current execution context.",
    "category": "Built-in"
  },
  {
    "name": "uuid",
    "usage": "uuid()",
    "description": "uuid() - Returns an universally unique identifier (UUID) string. The value is returned as a canonical UUID 36-character string.",
    "category": "Built-in"
  },
  {
    "name": "validate_utf8",
    "usage": "validate_utf8(str)",
    "description": "validate_utf8(str) - Returns the original string if str is a valid UTF-8 string, otherwise throws an exception.",
    "category": "Built-in"
  },
  {
    "name": "var_pop",
    "usage": "var_pop(expr)",
    "description": "var_pop(expr) - Returns the population variance calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "var_samp",
    "usage": "var_samp(expr)",
    "description": "var_samp(expr) - Returns the sample variance calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "variance",
    "usage": "variance(expr)",
    "description": "variance(expr) - Returns the sample variance calculated from values of a group.",
    "category": "Built-in"
  },
  {
    "name": "variant_explode",
    "usage": "variant_explode(expr)",
    "description": "variant_explode(expr) - It separates a variant object/array into multiple rows containing its fields/elements. Its result schema is struct<pos int, key string, value variant>. pos is the position of the field/element in its parent object/array, and value is the field/element value. key is the field name when exploding a variant object, or is NULL when exploding a variant array. It ignores any input that is not a variant array/object, including SQL NULL, variant null, and any other variant values.",
    "category": "Built-in"
  },
  {
    "name": "variant_explode_outer",
    "usage": "variant_explode_outer(expr)",
    "description": "variant_explode_outer(expr) - It separates a variant object/array into multiple rows containing its fields/elements. Its result schema is struct<pos int, key string, value variant>. pos is the position of the field/element in its parent object/array, and value is the field/element value. key is the field name when exploding a variant object, or is NULL when exploding a variant array. It ignores any input that is not a variant array/object, including SQL NULL, variant null, and any other variant values.",
    "category": "Built-in"
  },
  {
    "name": "variant_get",
    "usage": "variant_get(v, path[, type])",
    "description": "variant_get(v, path[, type]) - Extracts a sub-variant from v according to path, and then cast the sub-variant to type. When type is omitted, it is default to variant. Returns null if the path does not exist. Throws an exception if the cast fails.",
    "category": "Built-in"
  },
  {
    "name": "version",
    "usage": "version()",
    "description": "version() - Returns the Spark version. The string contains 2 fields, the first being a release version and the second being a git revision.",
    "category": "Built-in"
  },
  {
    "name": "weekday",
    "usage": "weekday(date)",
    "description": "weekday(date) - Returns the day of the week for date/timestamp (0 = Monday, 1 = Tuesday, ..., 6 = Sunday).",
    "category": "Built-in"
  },
  {
    "name": "weekofyear",
    "usage": "weekofyear(date)",
    "description": "weekofyear(date) - Returns the week of the year of the given date. A week is considered to start on a Monday and week 1 is the first week with >3 days.",
    "category": "Built-in"
  },
  {
    "name": "when",
    "usage": "CASE WHEN expr1 THEN expr2 [WHEN expr3 THEN expr4]* [ELSE expr5] END",
    "description": "CASE WHEN expr1 THEN expr2 [WHEN expr3 THEN expr4]* [ELSE expr5] END - When expr1 = true, returns expr2; else when expr3 = true, returns expr4; else returns expr5.",
    "category": "Built-in"
  },
  {
    "name": "width_bucket",
    "usage": "width_bucket(value, min_value, max_value, num_bucket)",
    "description": "width_bucket(value, min_value, max_value, num_bucket) - Returns the bucket number to which value would be assigned in an equiwidth histogram with num_bucket buckets, in the range min_value to max_value.\"",
    "category": "Built-in"
  },
  {
    "name": "window",
    "usage": "window(time_column, window_duration[, slide_duration[, start_time]])",
    "description": "window(time_column, window_duration[, slide_duration[, start_time]]) - Bucketize rows into one or more time windows given a timestamp specifying column. Window starts are inclusive but the window ends are exclusive, e.g. 12:05 will be in the window [12:05,12:10) but not in [12:00,12:05). Windows can support microsecond precision. Windows in the order of months are not supported. See 'Window Operations on Event Time' in Structured Streaming guide doc for detailed explanation and examples.",
    "category": "Built-in"
  },
  {
    "name": "window_time",
    "usage": "window_time(window_column)",
    "description": "window_time(window_column) - Extract the time value from time/session window column which can be used for event time value of window. The extracted time is (window.end - 1) which reflects the fact that the aggregating windows have exclusive upper bound - [start, end) See 'Window Operations on Event Time' in Structured Streaming guide doc for detailed explanation and examples.",
    "category": "Built-in"
  },
  {
    "name": "xpath",
    "usage": "xpath(xml, xpath)",
    "description": "xpath(xml, xpath) - Returns a string array of values within the nodes of xml that match the XPath expression.",
    "category": "Built-in"
  },
  {
    "name": "xpath_boolean",
    "usage": "xpath_boolean(xml, xpath)",
    "description": "xpath_boolean(xml, xpath) - Returns true if the XPath expression evaluates to true, or if a matching node is found.",
    "category": "Built-in"
  },
  {
    "name": "xpath_double",
    "usage": "xpath_double(xml, xpath)",
    "description": "xpath_double(xml, xpath) - Returns a double value, the value zero if no match is found, or NaN if a match is found but the value is non-numeric.",
    "category": "Built-in"
  },
  {
    "name": "xpath_float",
    "usage": "xpath_float(xml, xpath)",
    "description": "xpath_float(xml, xpath) - Returns a float value, the value zero if no match is found, or NaN if a match is found but the value is non-numeric.",
    "category": "Built-in"
  },
  {
    "name": "xpath_int",
    "usage": "xpath_int(xml, xpath)",
    "description": "xpath_int(xml, xpath) - Returns an integer value, or the value zero if no match is found, or a match is found but the value is non-numeric.",
    "category": "Built-in"
  },
  {
    "name": "xpath_long",
    "usage": "xpath_long(xml, xpath)",
    "description": "xpath_long(xml, xpath) - Returns a long integer value, or the value zero if no match is found, or a match is found but the value is non-numeric.",
    "category": "Built-in"
  },
  {
    "name": "xpath_number",
    "usage": "xpath_number(xml, xpath)",
    "description": "xpath_number(xml, xpath) - Returns a double value, the value zero if no match is found, or NaN if a match is found but the value is non-numeric.",
    "category": "Built-in"
  },
  {
    "name": "xpath_short",
    "usage": "xpath_short(xml, xpath)",
    "description": "xpath_short(xml, xpath) - Returns a short integer value, or the value zero if no match is found, or a match is found but the value is non-numeric.",
    "category": "Built-in"
  },
  {
    "name": "xpath_string",
    "usage": "xpath_string(xml, xpath)",
    "description": "xpath_string(xml, xpath) - Returns the text contents of the first xml node that matches the XPath expression.",
    "category": "Built-in"
  },
  {
    "name": "xxhash64",
    "usage": "xxhash64(expr1, expr2, ...)",
    "description": "xxhash64(expr1, expr2, ...) - Returns a 64-bit hash value of the arguments. Hash seed is 42.",
    "category": "Built-in"
  },
  {
    "name": "year",
    "usage": "year(date)",
    "description": "year(date) - Returns the year component of the date/timestamp.",
    "category": "Built-in"
  },
  {
    "name": "zeroifnull",
    "usage": "zeroifnull(expr)",
    "description": "zeroifnull(expr) - Returns zero if expr is equal to null, or expr otherwise.",
    "category": "Built-in"
  },
  {
    "name": "zip_with",
    "usage": "zip_with(left, right, func)",
    "description": "zip_with(left, right, func) - Merges the two given arrays, element-wise, into a single array using function. If one array is shorter, nulls are appended at the end to match the length of the longer array, before applying function.",
    "category": "Built-in"
  },
  {
    "name": "|",
    "usage": "expr1 | expr2",
    "description": "expr1 | expr2 - Returns the result of bitwise OR of expr1 and expr2.",
    "category": "Built-in"
  },
  {
    "name": "||",
    "usage": "expr1 || expr2",
    "description": "expr1 || expr2 - Returns the concatenation of expr1 and expr2.",
    "category": "Built-in"
  },
  {
    "name": "~",
    "usage": "~ expr",
    "description": "~ expr - Returns the result of bitwise NOT of expr.",
    "category": "Built-in"
  }
];
